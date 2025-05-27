#!/bin/bash

echo "Installing test dependencies..."
pip install -r requirements.txt

echo "Running API tests..."
robot --outputdir results/api api/

echo "Running UI tests..."
robot --outputdir results/ui ui/

echo "Tests completed. Check results in the results directory." 