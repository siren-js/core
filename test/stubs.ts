import { Entity } from '../src/Entity';

export const entity = Entity.of({
  class: ['order'],
  title: 'Order 66',
  properties: {
    description: 'Kill all Jedi'
  },
  links: [{ rel: ['self'], href: 'https://api.example.com/orders/66' }]
});

export const siren = JSON.stringify(
  JSON.parse(`{
    "class": ["order"],
    "title": "Order 66",
    "properties": {
      "description": "Kill all Jedi"
    },
    "links": [{ "rel": ["self"], "href": "https://api.example.com/orders/66" }]
  }`)
);
