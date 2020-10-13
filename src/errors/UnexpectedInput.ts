export class UnexpectedInput extends Error {
  name = 'UnexpectedInput'

  constructor(typeofInput: any) {
    super()
    this.message = `Unexpected input given to normalize. Expected type to be "object", found "${typeofInput}".`
  }
}
