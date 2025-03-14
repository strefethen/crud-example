import * as ItemsAPI from './ItemResource.js';

const API: ItemsAPI.ItemsResource = new ItemsAPI.ItemsResource("http://localhost:3000");

API.createItem({ name: "New Item", description: "Description", price: 100 }).then((item) => {
  console.log(item);
});

API.getItems().then((items) => {
  console.log(items);
});
