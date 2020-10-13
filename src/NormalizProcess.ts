import { Dictionary } from './interfaces/Dictionary'
import { EntitySchema } from './schemas/EntitySchema'

import { SchemaNotFound } from './errors/SchemaNotFound'
import { UnexpectedModel } from './errors/UnexpectedModel'
import { UnexpectedInput } from './errors/UnexpectedInput'
import { isObject, isPlainObject } from './utils'

export class NormalizProcess {
  private visitedEntities: Dictionary<any>[] = []
  private entities: Dictionary<any> = {}

  constructor(
    private readonly denormalizedData: Dictionary<any>,
    private readonly schemaName: string,
    private readonly schemas: Map<string, EntitySchema>
  ) {}

  public process() {
    return Array.isArray(this.denormalizedData)
      ? this.normalizeFromArray()
      : this.normalizeFromObject()
  }

  get schema(): EntitySchema {
    const sch = this.schemas.get(this.schemaName)
    if (!sch) {
      throw new SchemaNotFound(this.schemaName)
    }
    return sch
  }

  private normalizeFromArray = () => {
    if (!Array.isArray(this.denormalizedData)) {
      throw new TypeError('Expect both input and model to be array types')
    }

    const results: Dictionary<any>[] = []
    this.denormalizedData.forEach((input) => {
      const normalizedData = this.normalizeFromObject(input, this.schema)
      const { result } = normalizedData
      results.push(result)
    })

    return { result: results, entities: this.entities }
  }

  private normalizeFromObject(input?: Dictionary<any>, schema?: EntitySchema) {
    this.validate(input || this.denormalizedData, schema || this.schema)
    const result = this.normalizeFromModel(
      input || this.denormalizedData,
      schema || this.schema
    )
    return {
      result,
      entities: this.entities,
    }
  }

  private normalizeFromModel(input: Dictionary<any>, schema: EntitySchema) {
    if (!input) {
      return
    }

    if (!isObject(input)) {
      return input
    }

    if (this.visitedEntities.some((entity) => entity === input)) {
      return schema.getIdentifierValue(input)
    } else {
      this.visitedEntities.push(input)
    }

    const processedEntity: Dictionary<any> = { ...input }

    Object.keys(schema.propertiesDefinitions).forEach(
      (propertyName: string) => {
        const schemaFromProDef = schema.propertiesDefinitions[propertyName](
          input
        )?.name

        if (schemaFromProDef) {
          const schemaFromDef = this.schemas.get(schemaFromProDef)

          if (schemaFromDef) {
            processedEntity[propertyName] = this.normalizeFromAnyType(
              input[propertyName],
              schemaFromDef
            )
          } else {
            console.warn(`Schema is not found for ${propertyName}`)
            processedEntity[propertyName] = input[propertyName]
          }
        }
      }
    )

    Object.keys(schema.relations).forEach((propertyName: string) => {
      delete processedEntity[propertyName]
      processedEntity[propertyName] = this.normalizeFromAnyType(
        input[propertyName],
        schema.relations[propertyName]
      )
    })

    this.addEntity(processedEntity, schema, input)
    return schema.getIdentifierValue(input)
  }

  private normalizeFromAnyType(
    input: Dictionary<any> | Dictionary<any>[],
    schema: EntitySchema | EntitySchema[]
  ) {
    if (Array.isArray(schema)) {
      const inputArray: Dictionary<any>[] = Array.isArray(input)
        ? input
        : [input]
      return this.normalizeFromArrayType(inputArray, schema[0])
    } else {
      return this.normalizeFromModel(input, schema)
    }
  }

  private normalizeFromArrayType(
    input: Dictionary<any>[],
    schema: EntitySchema
  ) {
    if (!input) {
      input = []
    }

    const processedEntity: Dictionary<any>[] = []
    input.forEach((item, index) => {
      processedEntity[index] = this.normalizeFromAnyType(item, schema)
    })

    return processedEntity
  }

  private addEntity(
    input: Dictionary<any>,
    schema: EntitySchema,
    rawInput: Dictionary<any>
  ): void {
    let result = schema.getIdentifierValue(input)

    if (!result) {
      result = schema.getIdentifierValue(rawInput)
      if (!result) {
        return
      }
    }

    const entityName = schema.name
    this.entities[entityName] = this.entities[entityName] || {}

    this.entities[entityName][result] = schema.options.entityClass
      ? new schema.options.entityClass()
      : {}

    Object.assign(this.entities[entityName][result], {
      ...this.entities[entityName][result],
      ...input,
    })

    return
  }

  private validate(input: any, model: any) {
    if (!(model instanceof EntitySchema)) {
      throw new UnexpectedModel(typeof model)
    }

    if (!isObject(input) && !isPlainObject(input)) {
      throw new UnexpectedInput(typeof input)
    }
  }
}
