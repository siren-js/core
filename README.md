# Siren.js Core

This is the core library for Siren.js, providing functions for creating
immutable objects representing components (entities, actions, links, etc.) of
the [Siren][siren] hypermedia format. The primary intent of this library is for
generating or parsing Siren representations.

[siren]: https://github.com/kevinswiber/siren

* [Installation](#installation)
* [Usage](#usage)
  * [Generating Siren](#generating-siren)
  * [Parsing Siren](#parsing-siren)
  * [Helper Methods](#helper-methods)
  * [Extensions](#extensions)
  * [TypeScript](#typescript)

## Installation

```text
npm install @siren-js/core
```

## Usage

The primary function for creating [Siren entities][siren-entity] is `entity()`.
This function accepts an object ([loosely](#robustness)) representing a Siren
entity and returns an immutable object satisfying the `ParsedEntity` interface,
a sub-interface of `Entity`, which describes a Siren entity. `ParsedEntity`
extends `Entity` with several [helper methods](#helper-methods).

[siren-entity]: https://github.com/kevinswiber/siren#entity

The following example demonstrates one way of building the
[example entity][siren-example] from the Siren spec:

[siren-example]: https://github.com/kevinswiber/siren#example

```js
import * as Siren from '@siren-js/core';
// alternatively, import only what you need:
// import { entity } from `@siren-js/core`;

const order = getOrderFromDB(orderNumber);

const entity = Siren.entity({
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
you can use the other component factory functions: `action()`, `field()`,
`link()`, `embeddedRepresentation()`, and `embeddedLink()`. Each of these accept
required members as positional arguments and optional members in a final options
object. They return an immutable object representing the corresponding
component, some with [helper methods](#helper-methods).

Here's how you might break up the call to `entity()` above:

```js
const orderUrl = `http://api.x.io/orders/${order.orderNumber}`;
const selfLink = Siren.link(['self'], orderUrl);

const itemsRel = 'http://x.io/rels/order-items';
const itemsUrl = `http://api.x.io/orders/${order.orderNumber}/items`;
const itemsLink = Siren.embeddedLink([itemsRel], itemsUrl, {
  class: ['items', 'collection']
});

const customerRel = 'http://x.io/rels/customer';
const customerEntity = Siren.embeddedRepresentation([customerRel], {
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

const quantityField = Siren.field('quantity', {
  type: 'number'
});

const addItemAction = Siren.action('add-item', itemsUrl, {
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
Siren.entity({
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

Use the `toString()` method to generate a Siren representation from an `Entity`
object.

```js
const siren = entity.toString();
```

You can also use `JSON.stringify()` if you prefer.

```js
JSON.stringify(entity);
//=> same as siren
```

### Parsing Siren

To parse a string as a Siren representation, use the `parse()` function.

```js
Siren.parse(siren);
//=> same as entity
```

Alternatively, use `JSON.parse()` and pass the result to `entity()`.

```js
Siren.entity(JSON.parse(siren));
//=> same as entity
```

### Helper Methods

Most of the component functions return objects satisfying the `Parsed*`
interfaces, which include helper methods for querying and updating a component.

```js
entity.findActionByName('add-item');
//=> same as addItemAction

entity.findLinkByRel('self');
//=> same as selfLink

entity.findSubEntityByRel(customerRel);
//=> same as customerEntity

addItemAction.findFieldByName('quantity');
//=> same as quantityField

quantityField.update(3);
//=> returns a new ParsedField<number>
```

### Extensions

The options objects of each component factory function allow you to extend the
core Siren spec. Need an [`hreflang`][rfc8288-3.4.1] property on your link? Need
[validation constraints][hc] on your fields? No problem!

[hc]: https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#constraints
[rfc8288-3.4.1]: https://tools.ietf.org/html/rfc8288#section-3.4.1

```js
Siren.link(['profile'], 'http://api.example.com/profile', {
  hreflang: 'en-US'
});

Siren.field('quantity', { min: 1, max: 10 });
```

### TypeScript

There are interfaces for each component (`Entity`, `Action`, etc.), as well as
sub-interfaces that define the [helper methods](#helper-methods).

```ts
function validateNumeric(field: Siren.Field<number | string>) {
  // ...
}

function submit(action: Siren.Action) {
  // ...
}

interface OrderProperties {
  orderNumber: number;
  itemCount: number;
  status: string;
}

function createOrderEntity(): Siren.ParsedEntity<OrderProperties> {
  // ...
}
```

Additionally, there are [type guards][ts-tg] for each component type.

[ts-tg]: https://www.typescriptlang.org/docs/handbook/advanced-types.html#user-defined-type-guards

```ts
if (Siren.isEmbeddedLink(subEntity)) {
  // treat as EmbeddedLink...
} else if (Siren.isEmbeddedRepresentation(subEntity)) {
  // treat as EmbeddedRepresentation...
}
```

