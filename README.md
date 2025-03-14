# Example CRUD server/client
Example client/server calling APIs defined in an OpenAPI spec crud.yaml (located in the client project).

## Start the backend
```bash
$ yarn dev:backend
```

Upon graceful shutdown the server persists the data using lowdb to db.json.

## Run the client
```bash
$ yarn dev:client
```