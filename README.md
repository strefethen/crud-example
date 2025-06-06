# Example CRUD server/client
Example client/server calling APIs defined in an OpenAPI spec crud.yaml (located in the client project).

## Project Setup
This repo includes four projects:

* **backend** - Simple REST API server
* **client** - Raw REST API calls
* **[oas-client-ts](#run-the-oas-typescript-axios-client)** - REST API client using OAS generated typescript Axios binding
* **[oas-client-python](#python)** - REST API client using OAS generated typescript binding

## General Requirements
* yarn
* Typescript v5.4.2+
* [OpenAPI generator](https://openapi-generator.tech/docs/installation/)
* Python 3+

FYI, on macOS you can install the OpenAPI generator using homebrew:
```bash
brew install openapi-generator
```

## Optional: VSCode REST Client Plugin
Included with the repo is an ``/api.http`` file, which is useful with the VSCode [REST Client](https://marketplace.visualstudio.com/items?itemName=humao.rest-client) plugin allowing for execution of API calls directly from the editor.

## Install packages and build apps

```bash
$ git clone https://github.com/strefethen/crud-example.git
$ cd crud-example
$ yarn install
$ yarn build
```

## backend Project
The backend is a minimal ExpressJS server that provides the REST API. The server uses LowDB, a basic (read non-production) JSON datastore, to persist data. The backend project isn't intended to be an best practice example of building a API backend rather it's sufficient to demo various aspects of OAS bindings and OpenAPI ecosystem.

```bash
$ yarn dev:backend
```

Upon graceful shutdown the server persists the data using lowdb to db.json.

### Authentication
You can optionally enable Bearer Token authorization using the USE_AUTH environment variable. Refer to launch.json for setting this variable when launching in the debugger.

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
Setting up the Python client requires several steps which are described here and outlined below.

1. Create a Python virtual environment
2. Activate the new environment and install setuptools
3. Generate the Python OAS binding 
4. Install the binding

Once these steps are complete you can run ``src/main.py``. The source for ``main.py`` comes directly from the README.md that's generated with the binding and is an example of calling APIs using the OAS client.

```bash
$ cd oas-client-python
# Create python virtual environment for this project
$ python -m venv .venv
# Activate virtual environment
$ source env/bin/activate
$ pip install setuptools
# Generate OAS binding
$ openapi-generator generate -i ../crud.yaml -g python -o client/generated --additional-properties=pydanticV2=true -o binding --skip-operation-example --skip-validate-spec
# Install 'openapi-client' binding package
$ pip install clients/generated/.
```

## Run the Python client
From the root folder of the crud-example project run ``main.py`` and you should see the following output as long as the backend server is running.

```bash
(.venv) ➜  crud-example git:(main) ✗ python oas-client-python/src/main.py
The response of ItemsApi->create_item:

Item(id=36, name='New Item', description='Description of the new item', price=15, created_at=datetime.datetime(2025, 3, 21, 21, 17, 10, 123000, tzinfo=TzInfo(UTC)))
ItemCount(count=36)
```

## Resolving the @field_validator error with the 'created_at' field
When running main.py on an unmodified binding causes an error with the Pydantic field_validator decorator. This needs to be commented out in ``client/generated/openapi-client/models/item.py.

```bash
(.venv) ➜  oas-client-python git:(main) ✗ python src/main.py
  File "/Users/strefethen/github/crud-example/oas-client-python/.venv/lib/python3.13/site-packages/openapi_client/models/item.py", line 38, in Item
    @field_validator('created_at')
     ^^^^^^^^^^^^^^^
```