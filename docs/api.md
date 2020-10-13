# API

- [Normalizer](#Normalizer)
- [EntitySchema](#EntitySchema)

## `Normalizer([schema])`

Build a normalizer instance with the array of schemas

### Instance Methods
normalize(data, schemaName): Normalizes input data per the schema definition provided.

- `data`: **required** Input JSON (or plain JS object) data that needs normalization.
- `schemaName`: **required** A schema name definition

### Usage

```js
import { EntitySchema, Normalizer } from 'normalizr-ts'

const myData = { users: [{ id: 1 }, { id: 2 }] }
const user = new EntitySchema('users')
const mySchema = { users: [user] }

const normalizer = new Normalizer([user])
const normalizedData = normalizer.normalize(inputs, 'users')
```

### Output

```js
{
  result: { users: [ 1, 2 ] },
  entities: {
    users: {
      '1': { id: 1 },
      '2': { id: 2 }
    }
  }
}

## `EntitySchema(name, options = { identifier: 'id' })`

- `name`: **required** The name under which all entities of this type will be listed in the normalized response. Must be a string name.
- `options`:
  - `idAttribute`: The attribute where unique IDs for each of this entity type can be found.  
    Accepts either a string `key` or a function that returns the IDs `value`. Defaults to `'id'`.  
    As a function, accepts the following arguments, in order:
    - `value`: The input value of the entity.
    - `parent`: The parent object of the input array.
    - `key`: The key at which the input array appears on the parent object.
  - `relations`: A definition of the nested entities found within this entity. Defaults to empty object. 

#### Instance Methods

- `setRelation(propertyName, schema)`: Add a new nested entities
- `define(definition)`: When used, the `definition` passed in will be merged with the original definition passed to the `Entity` constructor. This method tends to be useful for creating circular references in schema.

#### Instance Attributes

- `name`: Returns the name provided to the constructor.
- `options`: Returns the options provided to the constructor.