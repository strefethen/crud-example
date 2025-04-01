import openapi_client
from openapi_client.rest import ApiException
from pprint import pprint

# Defining the host is optional and defaults to http://localhost:3000
# See configuration.py for a list of all supported configuration parameters.
configuration = openapi_client.Configuration(
    host = "http://localhost:3000"
)


with openapi_client.ApiClient(configuration) as api_client:
    # Create an instance of the API class
    api_instance = openapi_client.AuthenticationApi(api_client)
    username = 'admin' # str | The username of the user
    try:
        # Login to the API
        api_response = api_instance.create_session(session_request={"username": username})
        print("The response of AuthenticationApi->create_session:\n")
        pprint(api_response)
    except ApiException as e:
        print("Exception when calling AuthenticationApi->create_session: %s\n" % e)

# Configure Bearer authorization (JWT): BearerAuth
configuration = openapi_client.Configuration(
    access_token = api_response.token,
)

# Enter a context with an instance of the API client
with openapi_client.ApiClient(configuration) as api_client:
    # Create an instance of the API class
    api_instance = openapi_client.ItemsApi(api_client)
    item = {"name":"New Item","description":"Description of the new item","price":15.0} # Item | The details of the new item to create.

    try:
        # Create a new item
        api_response = api_instance.create_item(item)
        print("The response of ItemsApi->create_item:\n")
        pprint(api_response)
        api_response = api_instance.get_item_count()
        pprint(api_response)
    except ApiException as e:
        print("Exception when calling ItemsApi->create_item: %s\n" % e)