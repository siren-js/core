# Siren.js Core

[![Node Package](https://img.shields.io/npm/v/@siren-js/core)](https://npmjs.org/@siren-js/core)
[![Build Status](https://img.shields.io/github/workflow/status/siren-js/core/Build%20Package)](https://github.com/siren-js/core/actions/workflows/build.yaml)
[![standard-readme compliant](https://img.shields.io/badge/readme%20style-standard-brightgreen.svg)](https://github.com/RichardLitt/standard-readme)
[![License](https://img.shields.io/github/license/siren-js/core)](LICENSE)
[![Contributing](https://img.shields.io/badge/contributions-welcome-brightgreen.svg)](CONTRIBUTING.md)

Cross-platform library of classes for generating and parsing [Siren](https://github.com/kevinswiber/siren) entities.

## Table of Contents

- [Table of Contents](#table-of-contents)
- [Install](#install)
- [Usage](#usage)
  - [Creating an Entity](#creating-an-entity)
  - [Generating an Entity](#generating-an-entity)
  - [Parsing Siren](#parsing-siren)
  - [Querying an Entity](#querying-an-entity)
  - [Querying an Action](#querying-an-action)
  - [Extensions](#extensions)
- [Contributing](#contributing)
- [License](#license)

## Install

```text
npm install @siren-js/core
```

## Usage

### Creating an Entity

Here's a simple example of generating an entity:

```js
import * as Siren from '@siren-js/core';

const person = Siren.Entity.of({
  class: ['Person'],
  properties: {
    givenName: 'Neville',
    familyName: 'Longbottom',
    birthDate: '1980-07-30'
  },
  links: [
    {
      rel: ['self'],
      href: 'https://api.example.com/people/69'
    }
  ]
});
```

Here is a more complete example building out [the order entity example from the Siren spec](https://github.com/kevinswiber/siren#example):

```js
const order = {
  orderNumber: 42,
  itemCount: 3,
  status: 'pending',
  customer: {
    userId: 'pj123',
    name: 'Peter Joseph'
  }
};

const orderEntity = Siren.Entity.of({
  class: ['order'],
  properties: {
    orderNumber: order.orderNumber,
    itemCount: order.itemCount,
    status: order.status
  },
  entities: [
    {
      class: ['items', 'collection'],
      rel: ['http://x.io/rels/order-items'],
      href: `http://api.x.io/orders/${order.orderNumber}/items`
    },
    {
      class: ['info', 'customer'],
      rel: ['http://x.io/rels/customer'],
      properties: {
        customerId: order.customer.userId,
        name: order.customer.name
      },
      links: [
        {
          rel: ['self'],
          href: `http://api.x.io/customers/${order.customer.userId}`
        }
      ]
    }
  ],
  actions: [
    {
      name: 'add-item',
      title: 'Add Item',
      method: 'POST',
      href: `http://api.x.io/orders/${order.orderNumber}/items`,
      type: 'application/x-www-form-urlencoded',
      fields: [
        { name: 'orderNumber', type: 'hidden', value: `${order.orderNumber}` },
        { name: 'productCode', type: 'text' },
        { name: 'quantity', type: 'number' }
      ]
    }
  ],
  links: [
    {
      rel: ['self'],
      href: `http://api.x.io/orders/${order.orderNumber}`
    },
    {
      rel: ['previous'],
      href: `http://api.x.io/orders/${order.orderNumber - 1}`
    },
    {
      rel: ['next'],
      href: `http://api.x.io/orders/${order.orderNumber + 1}`
    }
  ]
});
```

### Generating an Entity

Use the `stringify` function to convert an `Entity` into Siren JSON (`application/vnd.siren+json`).

```js
const siren = Siren.stringify(person);
// => "{ "class": ["Person"], ... }"
```

### Parsing Siren

Use the `parse` function to convert a Siren JSON string to an `Entity`.

```js
const entity = Siren.parse(siren);
// `entity` is equivalent to `person`
```

### Querying an Entity

The `Entity` class provides several convenience methods for finding actions or links within the entity:

```js
const addItemAction = orderEntity.findActionByName('add-item');
const customerSubEntities = orderEntity.findEntitiesByRel('customer');
const nextOrderLinks = orderEntity.findLinksByRel('next');
```

### Querying an Action

The `Action` class also provides convenience methods for finding fields:

```js
const productCodeField = addItemAction.findFieldByName('productCode');
```

### Extensions

Extensions are supported for every type of object. Here's an example using `min` and `max` constraints for a `Field` and [`hreflang`](https://tools.ietf.org/html/rfc8288#section-3.4.1) for a `Link`:

```js
Siren.Entity.of({
  actions: [
    {
      name: 'guess-number',
      href: 'https://api.example.com/guess',
      fields: [
        {
          name: 'guess',
          type: 'number',
          min: 0,
          max: 100
        }
      ]
    }
  ]
  links: [
    {
      rel: ['about'],
      href: 'https://api.example.com/about',
      hreflang: 'en-US'
    }
  ]
});
```

## Contributing

PRs and bug reports welcome! Be sure to read our [contribution guidelines](CONTRIBUTING.md).

## License

[MIT &copy; Siren.js](LICENSE)
