import * as API from '../client/generated';

const configuration: API.Configuration = {
  basePath: 'http://localhost:3000',
  isJsonMime: (mime) => {
    return mime === 'application/json' || mime === 'application/vnd.api+json';
  },
  accessToken: ""  // First call must be to createSession to fetch the token.
}

const authAPI = new API.AuthenticationApi(configuration);

(async () => {
  const session = await authAPI.createSession({ username: 'stevet' })
  console.log(authAPI);
  configuration.accessToken = session.data.token;
  const itemsApi = new API.ItemsApi(
    configuration
  );
  
  const itemsAPI = new API.ItemsApi(configuration);
  
  await itemsAPI.getItems().then((items) => {
    console.log(items.data);
  }).catch((error) => {
    console.error(error);
  });
    
  await itemsAPI.createItem({
    description: "test",
    name: "Item Name",
    price: 1.00
  }).catch((error) => {
    console.error(error);
  });  

  const getCount = await itemsAPI.getItemCount();
  console.log(getCount.data.count);
  
  await itemsAPI.deleteItemById(getCount.data.count - 1).catch((error) => {
    console.error(error);
  });
})().catch((err) => {
  console.log('Error: ' + err);
});
