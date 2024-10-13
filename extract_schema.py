import sqlite3


TABLE_LIST_SQL = """
   SELECT name FROM sqlite_master
   WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name;
"""


def get_tables(cursor: sqlite3.Cursor):
    cursor.execute(TABLE_LIST_SQL)
    return cursor.fetchall()


def get_columns(cursor: sqlite3.Cursor, table: str) -> list[sqlite3.Row]:
    cursor.execute(f"PRAGMA table_info({table})")
    return cursor.fetchall()


TYPE_MAP = {
    "TEXT": {
        "typescript": "string",
        "rust": "String",
    },
    "INTEGER": {
        "typescript": "number",
        "rust": "isize",
    },
    "REAL": {
        "typescript": "number",
        "rust": "f64",
    },
}

from typing import List, Tuple

TS_TEMPLATE = """
export interface %(table)s {
%(fields)s
}

export type FieldNameType = %(typed_field_names)s;

export const FIELD_NAMES: readonly FieldNameType[] = Object.freeze([%(field_names)s]);
export const RESOURCE_NAME = '%(table_raw)s';

export const FieldNameSet: ReadonlySet<FieldNameType> = Object.freeze(new Set(FIELD_NAMES));

"""


def snake_to_camel(snake_str, upper_first=False):
    # Split the string into words at underscores
    components = snake_str.split("_")
    # Capitalize the first letter of each component except the first one
    # and join them together
    first = components[0].capitalize() if upper_first else components[0]
    return first + "".join(x.capitalize() for x in components[1:])


def create_typescript_code(table: str, fields: List[Tuple[str, str, bool]]) -> str:
    fields_str = ""
    field_names = []
    for name, type, notnull in fields:
        ts_type = TYPE_MAP[type]["typescript"]
        required_str = "?" if not notnull else ""
        fields_str += f"\t{name}{required_str}: {ts_type};\n"
        field_names.append(f"'{name}'")
    return TS_TEMPLATE % {
        "table": snake_to_camel(table, True),
        "fields": fields_str,
        "table_raw": table,
        "typed_field_names": "|".join(field_names),
        "field_names": ", ".join(field_names),
    }


RS_TEMPLATE = """

#[derive(Debug, serde::Serialize, serde::Deserialize)]
pub struct %(table)s {
%(fields)s
}

pub const RESOURCE_NAME: &str = "%(table_raw)s";
pub const FIELD_NAMES: [&str; %(field_count)s] = [%(field_names)s];

pub fn field_name_set() -> std::collections::HashSet<String> {
    FIELD_NAMES.iter().map(|s| s.to_string()).collect()
}
"""


def create_rust_code(table: str, fields: List[Tuple[str, str, bool]]) -> str:
    fields_str = ""
    field_names = []
    for name, type, notnull in fields:
        rust_type = TYPE_MAP[type]["rust"]
        fields_str += (
            f"\t{name}: {f"Option<{rust_type}>" if not notnull else rust_type},\n"
        )
        field_names.append(f'"{name}"')
    return RS_TEMPLATE % {
        "table": snake_to_camel(table, True),
        "fields": fields_str,
        "table_raw": table,
        "field_count": len(field_names),
        "field_names": ", ".join(field_names),
    }


def fetch_schemas(cursor: sqlite3.Cursor) -> dict[str, list[sqlite3.Row]]:
    tables = get_tables(cursor)
    schemas = {}
    for table in tables:
        columns = get_columns(cursor, table[0])
        fields = [
            (name, type, bool(notnull) or bool(pk))
            for _, name, type, notnull, _, pk in columns
        ]
        schemas[table[0]] = fields
    return schemas


def write_schemas(cursor: sqlite3.Cursor, schema_folder: str, file_ext: str):
    schemas = fetch_schemas(cursor)
    for table, fields in schemas.items():
        with open(f"{schema_folder}/{table}.{file_ext}", "w") as f:
            if file_ext == "ts":
                f.write(create_typescript_code(table, fields))
            elif file_ext == "rs":
                f.write(create_rust_code(table, fields))
