# Example CRUD server/client
Example client/server calling APIs defined in an OpenAPI spec crud.yaml (located in the client project).

## Setup
This repo includes three projects:

* backend - Simple REST API server
* client - hand written REST API client
* oas-client - REST API client using OAS generated typescript binding

## Requirements
* yarn
* Typescript v5.4.2+
* OpenAPI generator installed in ~/github/openapi-generator
* openapi-generator-cli.jar in ~/github

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

## Run the hand-written API client
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