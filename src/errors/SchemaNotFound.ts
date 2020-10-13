export class SchemaNotFound extends Error {
  name = 'SchemaNotFound'

  constructor(name: any) {
    super()
    this.message = `Schema '${name}' not found.`
  }
}
