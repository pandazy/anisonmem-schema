import sqlite3
import os


def connect():
    return sqlite3.connect(f"{os.getcwd()}/conversion_config.db")


def connect_by_path(path: str):
    return sqlite3.connect(path)


def db_read(sql: str, cursor: sqlite3.Cursor, args: tuple[any] = (), only_one=False):
    cursor.execute(sql, args)
    if only_one:
        return cursor.fetchone()
    return cursor.fetchall()


def db_write(sql: str, conn: sqlite3.Connection, args: tuple[any] = ()):
    cursor = conn.cursor()
    cursor.execute(sql, args)
    conn.commit()


INIT_SQL = """
CREATE TABLE IF NOT EXISTS conversion (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    db_path TEXT NOT NULL,
    schema_path TEXT NOT NULL,
    code_type TEXT NOT NULL,
    memo TEXT
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_conversion_identifier ON conversion (db_path, schema_path, code_type);
"""


def init_db():
    with connect() as conn:
        cursor = conn.cursor()
        cursor.executescript(INIT_SQL)
        print("Database initialized!")
        conn.commit()


GET_SQL = "SELECT * FROM conversion WHERE id = ?"


def get_one(id: int, cursor: sqlite3.Cursor) -> dict:
    db_data = db_read(
        sql=GET_SQL,
        args=(id,),
        only_one=True,
        cursor=cursor,
    )
    return dict(
        id=db_data[0],
        db_path=db_data[1],
        schema_path=db_data[2],
        code_type=db_data[3],
        memo=db_data[4],
    )


GET_ALL_SQL = "SELECT id, db_path, schema_path, code_type, memo  FROM conversion"


def get_all(cursor: sqlite3.Cursor) -> list[dict]:
    return [
        dict(
            id=row[0], db_path=row[1], schema_path=row[2], code_type=row[3], memo=row[4]
        )
        for row in db_read(sql=GET_ALL_SQL, cursor=cursor)
    ]


INSERT_SQL = "INSERT OR IGNORE INTO conversion (db_path, schema_path, code_type, memo) VALUES (?, ?, ?, ?)"


def add(conversion: dict, conn: sqlite3.Connection):
    db_write(
        sql=INSERT_SQL,
        args=(
            conversion["db_path"],
            conversion["schema_path"],
            conversion["code_type"],
            conversion["memo"],
        ),
        conn=conn,
    )


RM_SCHEMA_SQL = "DELETE FROM conversion WHERE id = ?"


def remove(id: int, conn: sqlite3.Connection):
    db_write(sql=RM_SCHEMA_SQL, args=(id,), conn=conn)
