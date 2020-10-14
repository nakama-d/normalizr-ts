import { Dictionary } from '../interfaces/Dictionary'
import * as ImmutableUtils from '../ImmutableUtils'

const getDefaultGetId = (attr: string): IdentifierFunction => (
  record: Dictionary<any>
) => (ImmutableUtils.isImmutable(record) ? record.get(attr) : record[attr])


export type EntityClass = { new (...args: any[]): any } | { new (): any }

export interface PropertiesDefinitions {
  [propertyName: string]: (parent: Dictionary<any>) => EntitySchema | undefined
}

export type IdentifierFunction = (
  record: Dictionary<any>,
  parent: Dictionary<any> | null,
  key: string | null
) => string

export interface EntitySchemaOptions {
  entityFactory?: (entityData: Dictionary<any>) => any
  relations?: {
    [propertyName: string]: EntitySchema | EntitySchema[]
  }
  identifier?: string | IdentifierFunction
}

export class EntitySchema {
  public readonly name: string
  public readonly relations: {
    [propertyName: string]: EntitySchema | EntitySchema[]
  }
  public readonly options: EntitySchemaOptions
  public propertiesDefinitions: PropertiesDefinitions

  private readonly getIdentifier: IdentifierFunction

  constructor(
    name: string,
    options: EntitySchemaOptions = { identifier: 'id' }
  ) {
    this.name = name
    this.options = options
    this.propertiesDefinitions = {}

    const identifier = options.identifier ? options.identifier : 'id'

    this.getIdentifier =
      typeof identifier === 'string' ? getDefaultGetId(identifier) : identifier

    this.relations = Object.keys(options.relations || {}).reduce(
      (entitySchema, key) => {
        const relation = (options.relations || {})[key]
        return { ...entitySchema, [key]: relation }
      },
      {}
    )
  }

  public getIdentifierValue(data: Dictionary<any>): any {
    return this.getIdentifier(data, null, null)
  }

  public setRelation(
    propertyName: string,
    schemas: EntitySchema | EntitySchema[]
  ) {
    this.relations[propertyName] = schemas
  }

  public define(propertiesDefinitions: PropertiesDefinitions): void {
    this.propertiesDefinitions = {
      ...this.propertiesDefinitions,
      ...propertiesDefinitions,
    }
  }
}
