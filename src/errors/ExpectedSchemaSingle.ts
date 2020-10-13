export class ExpectedSchemaSingle extends Error {
  name = 'ExpectedSchemaSingle'

  constructor(count: number) {
    super()
    this.message = `Expected schema definition to be a single schema, but found ${count}.`
  }
}
