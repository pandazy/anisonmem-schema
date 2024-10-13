# anisonmem-schema

`Anisonmem`: I'll use this another app to help me memorize anime songs.

This is a schema helper for the `anisonmem` app.

## Pre-requisites

- Install [Python 3](https://www.python.org/)
- Install [Bun](https://bun.sh/)

## Usage

1. clone this repository to the local machine
2. enter the repository
3. run start.sh
4. open the browser and go to http://localhost:5001, it will run both backend and frontend servers on the local machine.
5. Create a conversion via the UI with inputs of local db (SQLite) path, destination schema folder (where the schema will be generated) path, and target schema code type (currently supporting rs or ts), then click the "Save" button.
6. On the list of conversions, click the "CONVERT: GO" button to generate the schema to the destination folder.

## Why

This is a just simple example of showcasing using database as the source of truth to generate the consistent data types for the frontend and backend to avoid redundant work.
Visualization of the working flow improves productivity.
Also Web UI is quicker to build than OS app UI.

## Warning

Don't use this in production or remote server, it's not secure. It's supposed to be used in the local machine only.
