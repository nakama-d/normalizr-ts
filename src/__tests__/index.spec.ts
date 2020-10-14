import { EntitySchema, Normalizer } from '../index'

import { User } from './classes/User'
import { Comment } from './classes/Comment'
import { Article } from './classes/Article'

describe('normalize', () => {
  ;[42, null, undefined, '42', () => {}].forEach((input) => {
    test(`cannot normalize input that == ${input}`, () => {
      const normalizer = new Normalizer([new EntitySchema('test')])
      expect(() => normalizer.normalize(input as any, 'test')).toThrow()
    })
  })

  test('cannot normalize without a schema', () => {
    const normalizer = new Normalizer([new EntitySchema('test')])
    expect(() => normalizer.normalize({} as any, '')).toThrow()
  })

  test('cannot normalize with null input', () => {
    const normalizer = new Normalizer([new EntitySchema('test')])
    expect(() => normalizer.normalize(null as any, '')).toThrow()
  })

  test('normalizes entities', () => {
    const normalizer = new Normalizer([new EntitySchema('test')])
    expect(
      normalizer.normalize(
        [
          { id: 1, type: 'foo' },
          { id: 2, type: 'bar' },
        ],
        'test'
      )
    ).toEqual({
      result: [1, 2],
      entities: {
        test: { '1': { id: 1, type: 'foo' }, '2': { id: 2, type: 'bar' } },
      },
    })
  })

  test('normalizes entities with circular references', () => {
    const user = new EntitySchema('users')
    user.setRelation('friends', [user])

    const input: any = { id: 123, friends: [] }
    input.friends.push(input)

    const normalizer = new Normalizer([user])
    const normalizedData = normalizer.normalize(input, 'users')

    expect(normalizedData).toEqual({
      result: 123,
      entities: {
        users: {
          '123': {
            id: 123,
            friends: [123],
          },
        },
      },
    })
  })

  test('normalizes array entities at top level', () => {
    const u = new EntitySchema('users')
    u.setRelation('friends', [u])

    const input: any = { id: 123, friends: [] }
    input.friends.push(input)

    const inputs = [input, { id: 897, friends: [] }]

    const normalizer = new Normalizer([u])
    const normalizedData = normalizer.normalize(inputs, 'users')

    expect(normalizedData).toEqual({
      result: [123, 897],
      entities: {
        users: {
          '123': {
            id: 123,
            friends: [123],
          },
          '897': {
            id: 897,
            friends: [],
          },
        },
      },
    })
  })

  test('normalizes nested entities', () => {
    const user = new EntitySchema('users')
    const comment = new EntitySchema('comments', {
      relations: { user: user },
    })
    const article = new EntitySchema('articles', {
      relations: {
        author: user,
        comments: [comment],
      },
    })

    const input = {
      id: '123',
      title: 'A Great Article',
      author: {
        id: '8472',
        name: 'Paul',
      },
      body: 'This article is great.',
      comments: [
        {
          id: 'comment-123-4738',
          comment: 'I like it!',
          user: {
            id: '10293',
            name: 'Jane',
          },
        },
      ],
    }

    const normalizer = new Normalizer([user, comment, article])
    const normalizedData = normalizer.normalize(input, 'articles')

    expect(normalizedData).toEqual({
      result: '123',
      entities: {
        users: {
          '8472': {
            id: '8472',
            name: 'Paul',
          },
          '10293': {
            id: '10293',
            name: 'Jane',
          },
        },
        comments: {
          'comment-123-4738': {
            id: 'comment-123-4738',
            comment: 'I like it!',
            user: '10293',
          },
        },
        articles: {
          '123': {
            id: '123',
            title: 'A Great Article',
            body: 'This article is great.',
            author: '8472',
            comments: ['comment-123-4738'],
          },
        },
      },
    })
  })

  test('does not modify the original input', () => {
    const user = new EntitySchema('users')
    const article = new EntitySchema('articles', {
      relations: { author: user },
    })
    const input = Object.freeze({
      id: '123',
      title: 'A Great Article',
      author: Object.freeze({
        id: '8472',
        name: 'Paul',
      }),
    })

    const normalizer = new Normalizer([user, article])
    expect(() => normalizer.normalize(input, 'articles')).not.toThrow()
  })

  test('throw on null values', () => {
    const myEntity = new EntitySchema('myentities')
    const normalizer = new Normalizer([myEntity])

    expect(() => normalizer.normalize([null], 'myentities')).toThrow()
    expect(() => normalizer.normalize([undefined], 'myentities')).toThrow()
    expect(() => normalizer.normalize([false], 'myentities')).toThrow()
  })

  test('can use fully custom entity classes', () => {
    class MyEntity extends EntitySchema {
      constructor(name: string) {
        super(name, {
          identifier: 'uuid',
          relations: {
            children: [new EntitySchema('children')],
          },
        })
      }
    }

    const mySchema = new MyEntity('mySchema')
    const normalizer = new Normalizer([mySchema])
    const normalizedData = normalizer.normalize(
      {
        uuid: '1234',
        name: 'tacos',
        children: [{ id: 4, name: 'lettuce' }],
      },
      'mySchema'
    )

    expect(normalizedData).toEqual({
      result: '1234',
      entities: {
        children: {
          '4': {
            id: 4,
            name: 'lettuce',
          },
        },
        mySchema: {
          '1234': {
            uuid: '1234',
            name: 'tacos',
            children: [4],
          },
        },
      },
    })
  })

  test('uses the non-normalized input when getting the ID for an entity', () => {
    const userEntity = new EntitySchema('users')
    const idAttributeFn = jest.fn((nonNormalized) => nonNormalized.user.id)
    const recommendation = new EntitySchema('recommendations', {
      relations: { user: userEntity },
      identifier: idAttributeFn,
    })

    const normalizer = new Normalizer([userEntity, recommendation])
    const normalizedData = normalizer.normalize(
      { user: { id: '456' } },
      'recommendations'
    )

    expect(normalizedData).toEqual({
      result: '456',
      entities: {
        recommendations: {
          '456': {
            user: '456',
          },
        },
        users: {
          '456': {
            id: '456',
          },
        },
      },
    })
    expect(idAttributeFn.mock.calls).toMatchSnapshot()
  })

  test('passes over pre-normalized values', () => {
    const userEntity = new EntitySchema('users')
    const articles = new EntitySchema('articles', {
      relations: { author: userEntity },
    })

    const normalizer = new Normalizer([userEntity, articles])
    const normalizedData = normalizer.normalize(
      { id: '123', title: 'normalizr is great!', author: 1 },
      'articles'
    )

    expect(normalizedData).toEqual({
      result: '123',
      entities: {
        articles: {
          '123': {
            id: '123',
            title: 'normalizr is great!',
            author: 1,
          },
        },
      },
    })
  })

  test('can normalize object without proper object prototype inheritance', () => {
    const test: any = { id: 1, elements: [] }
    test.elements.push(
      Object.assign(Object.create(null), {
        id: 18,
        name: 'test',
      })
    )

    const testEntity = new EntitySchema('test', {
      relations: { elements: [new EntitySchema('elements')] },
    })
    const normalizer = new Normalizer([testEntity])

    expect(() => normalizer.normalize(test, 'test')).not.toThrow()
  })

  test('can normalize entity nested inside entity using property from parent', () => {
    const linkablesSchema = new EntitySchema('linkables')
    const mediaSchema = new EntitySchema('media')
    const listsSchema = new EntitySchema('lists')

    const schemaMap: any = {
      media: mediaSchema,
      lists: listsSchema,
    }

    linkablesSchema.define({
      data: (parent) => schemaMap[parent.schema_type],
    })

    const input = {
      id: 1,
      module_type: 'article',
      schema_type: 'media',
      data: {
        id: 2,
        url: 'catimage.jpg',
      },
    }

    const normalizer = new Normalizer([
      linkablesSchema,
      mediaSchema,
      listsSchema,
    ])
    const normalizedData = normalizer.normalize(input, 'linkables')

    expect(normalizedData).toEqual({
      entities: {
        linkables: {
          '1': {
            data: 2,
            id: 1,
            module_type: 'article',
            schema_type: 'media',
          },
        },
        media: {
          '2': {
            id: 2,
            url: 'catimage.jpg',
          },
        },
      },
      result: 1,
    })
  })

  test('can normalize input with classes', () => {
    const userSchema = new EntitySchema('users')
    const commentSchema = new EntitySchema('comments', {
      relations: { user: userSchema },
    })
    const articleSchema = new EntitySchema('articles', {
      relations: {
        author: userSchema,
        comments: [commentSchema],
      },
    })

    const author = new User('8472', 'Paul')
    const comment = new Comment(
      'comment-123-4738',
      'I like it!',
      new User('10293', 'Jane')
    )
    const article = new Article(
      '123',
      'A Great Article',
      'This article is great.',
      author,
      [comment]
    )

    const normalizer = new Normalizer([
      userSchema,
      commentSchema,
      articleSchema,
    ])
    const normalizedData = normalizer.normalize(article, 'articles')

    expect(normalizedData).toEqual({
      result: '123',
      entities: {
        users: {
          '8472': {
            id: '8472',
            name: 'Paul',
          },
          '10293': {
            id: '10293',
            name: 'Jane',
          },
        },
        comments: {
          'comment-123-4738': {
            id: 'comment-123-4738',
            comment: 'I like it!',
            user: '10293',
          },
        },
        articles: {
          '123': {
            id: '123',
            title: 'A Great Article',
            body: 'This article is great.',
            author: '8472',
            comments: ['comment-123-4738'],
          },
        },
      },
    })
  })

  test('can normalize input and return Class instance', () => {
    const userSchema = new EntitySchema('users', {
      entityFactory: (e: any) => new User(e.id, e.name),
    })
    const commentSchema = new EntitySchema('comments', {
      entityFactory: (e: any) => new Comment(e.id, e.comment, e.user),
      relations: { user: userSchema },
    })
    const articleSchema = new EntitySchema('articles', {
      entityFactory: (e: any) =>
        new Article(e.id, e.title, e.body, e.author, e.comments),
      relations: {
        author: userSchema,
        comments: [commentSchema],
      },
    })

    const author = new User('8472', 'Paul')
    const comment = new Comment(
      'comment-123-4738',
      'I like it!',
      new User('10293', 'Jane')
    )
    const article = new Article(
      '123',
      'A Great Article',
      'This article is great.',
      author,
      [comment]
    )

    const normalizer = new Normalizer([
      userSchema,
      commentSchema,
      articleSchema,
    ])
    const normalizedData = normalizer.normalize(article, 'articles')

    Object.values(normalizedData.entities.users).forEach((item: any) => {
      expect(item).toBeInstanceOf(User)
    })

    Object.values(normalizedData.entities.comments).forEach((item: any) => {
      expect(item).toBeInstanceOf(Comment)
      expect(item.user).toEqual('10293')
    })

    Object.values(normalizedData.entities.articles).forEach((item: any) => {
      expect(item).toBeInstanceOf(Article)
      expect(item.comments).toEqual(['comment-123-4738'])
      expect(item.author).toEqual('8472')
    })

    expect(normalizedData).toEqual({
      result: '123',
      entities: {
        users: {
          '8472': {
            id: '8472',
            name: 'Paul',
          },
          '10293': {
            id: '10293',
            name: 'Jane',
          },
        },
        comments: {
          'comment-123-4738': {
            id: 'comment-123-4738',
            comment: 'I like it!',
            user: '10293',
          },
        },
        articles: {
          '123': {
            id: '123',
            title: 'A Great Article',
            body: 'This article is great.',
            author: '8472',
            comments: ['comment-123-4738'],
          },
        },
      },
    })
  })
})
