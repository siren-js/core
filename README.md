# Siren.js Core

[![Node Package](https://img.shields.io/npm/v/@siren-js/core)](https://npmjs.org/@siren-js/core)
[![Build Status](https://img.shields.io/github/workflow/status/siren-js/core/Build%20Package)](https://github.com/siren-js/core/actions/workflows/build.yaml)
[![Code Coverage](https://img.shields.io/codecov/c/github/siren-js/core)](https://codecov.io/gh/siren-js/core)
[![License](https://img.shields.io/github/license/siren-js/core)](LICENSE)

This is the core library for Siren.js that provides classes for creating objects
representing components (entities, actions, etc.) of the [Siren][siren]
hypermedia format. The primary intent of this library is for generating or
parsing Siren representations.

[siren]: https://github.com/kevinswiber/siren

- [Installation](#installation)
- [Development Release](#development-release)
- [Usage](#usage)
  - [Generating Siren](#generating-siren)
  - [Parsing Siren](#parsing-siren)
  - [Extensions](#extensions)

## Installation

```text
npm install @siren-js/core
```

## Development Release

`@siren-js/core` is currently in the development phase (v0.x) while we work to
realize the best API for working with Siren in JavaScript. This means minor
version increments may not be backward compatible, but patch version increments
will.

In order to get to a production-ready release (v1+), we need users to try out
the library, find bugs, and give honest, constructive feedback on how we can
improve! If you'd like to report a bug or provide feedback, feel free to
[create an issue](https://github.com/siren-js/core/issues/new).

## Usage

The following example demonstrates one way of building the
[example entity][siren-example] from the Siren spec. It uses the `Entity` class
which takes an object representing a [Siren entity][siren-entity].

[siren-example]: https://github.com/kevinswiber/siren#example
[siren-entity]: https://github.com/kevinswiber/siren#entity

```js
import * as Siren from '@siren-js/core';

const order = getOrderFromDB(orderNumber);

const entity = new Siren.Entity({
  class: ['order'],
  properties: {
    orderNumber: order.orderNumber,
    itemCount: order.items.length,
    status: order.orderStatus
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
        name: order.customer.fullName
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

If you don't want to build your entity in one fell swoop (I wouldn't blame you),
you can use the other component classes: `Action`, `Field`, `Link`,
`EmbeddedEntity`, and `EmbeddedLink`. Each of these accept required
members as positional constructor arguments and optional members in a final
options object.

Here's how you might break up the above code:

```js
const orderUrl = `http://api.x.io/orders/${order.orderNumber}`;
const selfLink = new Siren.Link(['self'], orderUrl);

const itemsRel = 'http://x.io/rels/order-items';
const itemsUrl = `http://api.x.io/orders/${order.orderNumber}/items`;
const itemsLink = new Siren.EmbeddedLink([itemsRel], itemsUrl, {
  class: ['items', 'collection']
});

const customerRel = 'http://x.io/rels/customer';
const customerEntity = new Siren.EmbeddedEntity([customerRel], {
  class: ['info', 'customer'],
  properties: {
    customerId: order.customer.userId,
    name: order.customer.fullName
  },
  links: [
    {
      rel: ['self'],
      href: `http://api.x.io/customers/${order.customer.userId}`
    }
  ]
});

const quantityField = new Siren.Field('quantity', {
  type: 'number'
});

const addItemAction = new Siren.Action('add-item', itemsUrl, {
  title: 'Add Item',
  method: 'POST',
  type: 'application/x-www-form-urlencoded',
  fields: [
    { name: 'orderNumber', type: 'hidden', value: `${order.orderNumber}` },
    { name: 'productCode', type: 'text' },
    { name: 'quantity', type: 'number' }
  ]
});
```

Now constructing the full entity is a little easier.

```js
new Siren.Entity({
  class: ['order'],
  properties: {
    orderNumber: order.orderNumber,
    itemCount: order.items.length,
    status: order.orderStatus
  },
  entities: [itemsLink, customerEntity],
  actions: [addItemAction],
  links: [
    selfLink,
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
//=> same as entity
```

### Generating Siren

To generate a Siren representation, use `JSON.stringify()`.

```js
const siren = JSON.stringify(entity);
```

### Parsing Siren

To parse a string as a Siren representation, use `JSON.parse()` and pass the
result to the `Entity` constructor.

```js
new Siren.Entity(JSON.parse(siren));
//=> same as entity
```

### Extensions

The options objects of each component class allow you to extend the core Siren
spec. Need an [`hreflang`][rfc8288-3.4.1] property on your link? No problem!
Need [validation constraints][hc] on your fields? You got it!

[hc]: https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#constraints
[rfc8288-3.4.1]: https://tools.ietf.org/html/rfc8288#section-3.4.1

```js
new Siren.Link(['profile'], 'http://api.example.com/profile', {
  hreflang: 'en-US'
});

new Siren.Field('quantity', { min: 1, max: 10 });
```
