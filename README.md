# normalizr-ts

Normalizr-ts is a complet & simple typescript rewrite of [normalizr](https://github.com/paularmstrong/normalizr) (normalization only for now).
The library support the Typescript Class normalization.
All tests normalization test specs from [normalizr](https://github.com/paularmstrong/normalizr) was ported.

## Install

Install from the NPM repository using yarn or npm:

```shell
yarn add @nakama.d/normalizr-ts
```

```shell
npm install @nakama.d/normalizr-ts
```

## Documentation

* [API](/docs/api.md)
  * [Normalizer](/docs/api.md#Normalizer)
  * [EntitySchema](/docs/api.md#EntitySchema)

## Examples

* [Normalizing GitHub Issues](/examples/github)
* [Relational Data](/examples/relationships)
* [Interactive Redux](/examples/redux)


## Quick Start

Consider a typical blog post. The API response for a single post might look something like this:

```json
{
  "id": "123",
  "author": {
    "id": "1",
    "name": "Paul"
  },
  "title": "My awesome blog post",
  "comments": [
    {
      "id": "324",
      "commenter": {
        "id": "2",
        "name": "Nicole"
      }
    }
  ]
}
```

We have two nested entity types within our `article`: `users` and `comments`. Using various `schema`, we can normalize all three entity types down:

```ts
import { EntitySchema, Normalizer } from '@nakama.d/normalizr-ts'

// Define a users schema
const user = new EntitySchema('users')

// Define your comments schema
const comment = new EntitySchema('comments', {
  relations: { commenter: user }
})

// Define your article
const article = new EntitySchema('articles', {
  relations: { 
    author: user,
    comments: [comment]
  }
})

const normalizer = new Normalizer([user, comment, article])
const normalizedData = normalizer.normalize(inputs, 'articles')
```

Now, `normalizedData` will be:

```ts
{
  result: "123",
  entities: {
    "articles": {
      "123": {
        id: "123",
        author: "1",
        title: "My awesome blog post",
        comments: [ "324" ]
      }
    },
    "users": {
      "1": { "id": "1", "name": "Paul" },
      "2": { "id": "2", "name": "Nicole" }
    },
    "comments": {
      "324": { id: "324", "commenter": "2" }
    }
  }
}
```

## With Class


```ts
import { EntitySchema, Normalizer } from '@nakama.d/normalizr-ts'

class User {...}
class Comment {...}
class Article {...}

// Define a users schema
const user = new EntitySchema('users', { entityClass: User })

// Define your comments schema
const comment = new EntitySchema('comments', {
  entityClass: Comment,
  relations: { commenter: user }
})

// Define your article
const article = new EntitySchema('articles', {
  entityClass: Article,
  relations: { 
    author: user,
    comments: [comment]
  }
})

const normalizer = new Normalizer([user, comment, article])
const normalizedData = normalizer.normalize(inputs, 'articles')
```

Now, `normalizedData` will have all entities to be instance of entity Class.


## TODO

- [ ] Mode docs
- [ ] De nomalized method?

## Credits

Normalizr-ts was inspired by Normalizr maintained by [Paul Armstrong](https://twitter.com/paularmstrong)
