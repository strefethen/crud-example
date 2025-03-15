import * as ItemsAPI from './ItemResource.js';

const API: ItemsAPI.ItemsResource = new ItemsAPI.ItemsResource("http://localhost:3000");

API.createItem({ name: "New Item", description: "Description", price: 100 }).then((item) => {
  console.log(item);
}).catch(err => {
  console.log(err.message);
});

API.getItemsCount().then((count) => {
  console.log(count);
}).catch(err => {
  console.log(err.message);
});

API.getItems().then((items) => {
  console.log(items);
}).catch(err => {
  console.log(err.message);
});

API.deleteItemById(1).then((response) => {
  console.log(response);
}).catch(err => {
  console.log(err.message);
});