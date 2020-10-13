import { Dictionary } from './interfaces/Dictionary'
import { EntitySchema } from './schemas/EntitySchema'

import { UnexpectedInput } from './errors/UnexpectedInput'
import { SchemaNotFound } from './errors/SchemaNotFound'
import { NormalizProcess } from './NormalizProcess'

export class Normalizer {
  private readonly schemas: Map<string, EntitySchema>

  constructor(schemas: EntitySchema[]) {
    this.schemas = new Map(
      schemas.reduce((acc: [string, EntitySchema][], sch: EntitySchema) => {
        acc.push([sch.name, sch])
        return acc
      }, [])
    )
  }

  public normalize(
    denormalizedData: Dictionary<any> | Dictionary<any>[],
    schemaName: string
  ): any {
    if (!denormalizedData || typeof denormalizedData !== 'object') {
      throw new UnexpectedInput(
        denormalizedData === null ? 'null' : typeof denormalizedData
      )
    }

    if (!schemaName || !this.schemas.get(schemaName)) {
      throw new SchemaNotFound(schemaName)
    }

    return new NormalizProcess(
      denormalizedData,
      schemaName,
      this.schemas
    ).process()
  }
}
