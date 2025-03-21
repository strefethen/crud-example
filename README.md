# Example CRUD server/client
Example client/server calling APIs defined in an OpenAPI spec crud.yaml (located in the client project).

## Setup
This repo includes three projects:

* backend - Simple REST API server
* client - hand written REST API client
* oas-client - REST API client using OAS generated typescript binding

```bash
brew install openapi-generator
```

## Requirements
* yarn
* Typescript v5.4.2+
* OpenAPI generator installed in ~/github/openapi-generator OR via homebrew
* openapi-generator-cli.jar in ~/githubcd 

## Python Requirements
* Python 3+

## Install packages and build apps
```bash
$ git clone https://github.com/strefethen/crud-example.git
$ cd crud-example
$ yarn install
$ yarn build
```

## Start the backend
```bash
$ yarn dev:backend
```

Upon graceful shutdown the server persists the data using lowdb to db.json.

## Run the hand-written TypeScript API client
```bash
$ yarn dev:client
[
  {
    id: 1,
    name: 'New Item',
    description: 'Description',
    price: 100,
    createdAt: '2025-03-14T18:17:40.351Z'
  }
]
```

## Run the OAS typescript-axios client
```bash
$ yarn dev:oas-client-ts
```

# Python

## Setup
```bash
$ cd oas-client-python
# Create python virtual environment for this project
$ python -m venv .venv
# Activate virtual environment
$ source env/bin/activate
$ pip install setuptools
# Generate OAS binding
$ openapi-generator generate -i ../crud.yaml -g python -o client/generated --additional-properties=pydanticV2=true -o binding --skip-operation-example --skip-validate-spec
# Change directory to keep client binding isolated
$ cd client
$ python generated/setup.py install --user
# Install 'openapi-client' binding package
$ pip install clients/generated/.
```

## Run the Python client
```bash
$ python src/main.py  
```

## Resolving the @field_validator Error with the 'created_at' field
When running main.py on an unmodified binding causes an error with the Pydantic field_validator decorator. This needs to be commented out in ``client/generated/openapi-client/models/item.py.

```bash
(.venv) ➜  oas-client-python git:(main) ✗ python src/main.py
  File "/Users/strefethen/github/crud-example/oas-client-python/.venv/lib/python3.13/site-packages/openapi_client/models/item.py", line 38, in Item
    @field_validator('created_at')
     ^^^^^^^^^^^^^^^
```