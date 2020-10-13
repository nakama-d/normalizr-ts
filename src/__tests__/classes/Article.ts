import { User } from './User'
import { Comment } from './Comment'

export class Article {
  public id: string
  public title: string
  public body: string
  public author: User
  public comments: Comment[]

  constructor(id: string, title: string,body: string, author: User, comments: Comment[]) {
    this.id = id
    this.title = title
    this.body = body
    this.author = author
    this.comments = comments
  }
}

