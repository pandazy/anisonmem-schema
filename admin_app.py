import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from admin_curd import (
    connect,
    connect_by_path,
    get_one,
    init_db,
    get_all,
    add,
    remove,
)
from extract_schema import write_schemas

app = Flask(__name__)
CORS(app, origins=["http://localhost:5001"])


with app.app_context():
    init_db()


def verify_conversion_paths_of(conversion: dict):
    if not os.path.exists(conversion["db_path"]):
        return "SQLite data source not found!"
    if not os.path.exists(conversion["schema_path"]):
        return "Destination schema folder not found!"
    return None


@app.route("/conversion_list", methods=["GET"])
def get_conversion():
    results = None
    with connect() as conn:
        results = get_all(conn.cursor())
    return jsonify(results)


@app.route("/conversion", methods=["POST"])
def create_conversion():
    new_data = request.json
    if not new_data:
        return jsonify({"message": "No data provided!"}), 400

    if (
        not new_data["db_path"]
        or not new_data["schema_path"]
        or not new_data["code_type"]
    ):
        return jsonify({"message": "Missing required inputs!"}), 400
    err = verify_conversion_paths_of(new_data)
    if err:
        return jsonify({"message": err}), 400
    with connect() as conn:
        add(new_data, conn)
    return jsonify({"message": "Schema created successfully!"})


@app.route("/conversion/<int:id>", methods=["DELETE"])
def delete_conversion(id: int):
    if not id:
        return jsonify({"message": "No conversion id provided!"}), 400
    with connect() as conn:
        remove(id, conn)
    return jsonify({"message": "Schema deleted successfully!"})


@app.route("/run_conversion/<int:id>", methods=["POST"])
def run_conversion(id: int):
    with connect() as conn:
        conversion = get_one(id, conn.cursor())
        err = verify_conversion_paths_of(conversion)
        if err:
            return jsonify({"message": err}), 400
        with connect_by_path(conversion["db_path"]) as dest_conn:
            write_schemas(
                dest_conn.cursor(), conversion["schema_path"], conversion["code_type"]
            )
    return jsonify({"message": "Conversion completed!"})


@app.errorhandler(Exception)
def handle_error(e):
    app.logger.error(e)
    return jsonify({"message": str(e)}), 500


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000)
