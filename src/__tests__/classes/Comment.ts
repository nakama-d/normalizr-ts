import { User } from './User'

export class Comment {
  public id: string
  public comment: string
  public user: User

  constructor(id: string, comment: string, user: User) {
    this.id = id
    this.comment = comment
    this.user = user
  }
}
