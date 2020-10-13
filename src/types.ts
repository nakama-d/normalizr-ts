import { Dictionary } from './interfaces/Dictionary'
import { EntitySchema } from './schemas/EntitySchema'

export type SchemaTypes =
  | {
      [k: string]: EntitySchema | EntitySchema[]
    }
  | EntitySchema
  | ((key: Dictionary<any>) => EntitySchema)

export type EntityAdderFunction = (
  key: string | null,
  schema: EntitySchema,
  processedEntity: Dictionary<any>,
  value: Dictionary<any>,
  parent: Dictionary<any>
) => void

export type normalizerProcessorFunction = (
  key: string | null,
  schema: SchemaTypes,
  value: Dictionary<any>,
  parent: Dictionary<any>,
  visitedEntities: Dictionary<any>,
  entityAdder: EntityAdderFunction
) => Dictionary<any>
