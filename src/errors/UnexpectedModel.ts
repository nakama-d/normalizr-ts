export class UnexpectedModel extends Error {
  name = 'UnexpectedModel'

  constructor(typeofInput: any) {
    super()
    this.message = `Unexpected model given to normalize. Expected type to be "EntitySchema", found "${typeofInput}".`
  }
}
