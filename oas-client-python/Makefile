# Variables
SPEC_FILE=../crud.yaml
OUTPUT_DIR=client
PACKAGE_NAME=api_client
VENV=.venv
PYTHON=$(VENV)/bin/python
OPENAPI_GENERATOR=openapi-generator

.PHONY: all generate install clean venv

# Default target
all: install generate

# Generate OpenAPI Python client binding
generate:
	$(OPENAPI_GENERATOR) generate \
		-i $(SPEC_FILE) \
		-g python \
		-o $(OUTPUT_DIR)/generated
	pip install $(OUTPUT_DIR)/generated

#	--package-name $(PACKAGE_NAME)

# Install the generated binding into virtual environment
install: venv
	$(PYTHON) -m pip install --upgrade pip

# Set up Python virtual environment
venv:
	python3 -m venv $(VENV)

# Clean up generated client completely
clean:
	$(PYTHON) -m pip uninstall openapi-client -y
	rm -rf $(OUTPUT_DIR)
	rm -rf $(OUTPUT_DIR).egg-info
	rm -rf build dist *.egg-info
	rm -rf $(VENV)