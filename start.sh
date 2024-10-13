#!/bin/bash

# Path to the activate script
ACTIVATE_PATH="venv/bin/activate"

# Check if venv/bin/activate exists
if [ -f "$ACTIVATE_PATH" ]; then
    echo "Virtual environment already exists."
else
    echo "Creating virtual environment..."
    # Create the virtual environment
    # even if venv exists, then it has no activate script,
    # so it's broken, we need to create a new one
    rm -rf venv
    python -m venv venv
    if [ $? -eq 0 ]; then
        echo "Virtual environment created successfully."
    else
        echo "Failed to create virtual environment."
        exit 1
    fi
fi

# Activate the virtual environment
source $ACTIVATE_PATH
echo "Virtual environment activated."
echo "Installing backend dependencies..."
pip install -r requirements.txt
if [ $? -eq 0 ]; then
    echo "Dependencies installed successfully."
else
    echo "Failed to install dependencies."
    exit 1
fi

echo "Installing frontend dependencies..."
cd admin-ui
rm -rf node_modules
bun install
if [ $? -eq 0 ]; then
    echo "Dependencies installed successfully."
else
    echo "Failed to install dependencies."
    exit 1
fi
cd ..

echo "Starting the backend server..."
nohup python admin_app.py > admin_app.log 2>&1 &
cd admin-ui
echo "Starting the frontend server..."
nohup bun run dev > admin_ui.log 2>&1 &


