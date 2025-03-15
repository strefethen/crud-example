import * as API from '../generated';

const configuration = new API.Configuration({
  basePath: 'http://localhost:3000',
});

const itemsAPI = new API.ItemsApi(configuration);

async function main() {
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

  const count = await itemsAPI.getItemCount();
  console.log(count);

//  await itemsAPI.deleteItemById(count - 1).catch((error) => {
//    console.error(error);
//  });
}

main().catch(err => {
  console.log(err);
})