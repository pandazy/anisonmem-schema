import argparse

from extract_schema import write_schemas, create_connection


def get_args():
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "-d", "--db", type=str, required=True, help="Path to the SQLite database"
    )
    parser.add_argument(
        "-s", "--schema", type=str, required=True, help="Path to the schema folder"
    )
    parser.add_argument(
        "-e",
        "--ext",
        type=str,
        required=True,
        help="File extension to convert to",
        choices=["ts", "rs"],
    )
    return parser.parse_args()


if __name__ == "__main__":
    args = get_args()
    conn = create_connection(args.db)
    write_schemas(conn.cursor(), args.schema, args.ext)
    conn.close()
