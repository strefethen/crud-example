import * as API from '../client/generated';
import dotenv from 'dotenv';

dotenv.config();

const configuration: API.Configuration = {
  basePath: 'http://localhost:3000',
  isJsonMime: (mime) => {
    return mime === 'application/json' || mime === 'application/vnd.api+json';
  },
  accessToken: ""  // First call must be to createSession to fetch the token.
}

const authAPI = new API.AuthenticationApi(configuration);

(async () => {
  var session = null;
  if (process.env.USE_AUTH == 'true') {
    session = await authAPI.createSession({ username: 'stevet' })
    configuration.accessToken = session?.data.token;
    console.log(authAPI);
  }

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

  const getItems = await itemsAPI.getItems();
  
  await itemsAPI.deleteItemById(getItems.data[0].id).catch((error) => {
    console.error(error);
  });

})().catch((err) => {
  console.log('Error: ' + err);
});
