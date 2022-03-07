import type { AbstractRunner } from '../runners'
import { AbstractCollection } from './abstract.collection'
import type { SchematicOption } from './schematic.option'

export interface Schematic {
  name: string
  alias: string
  description: string
}

export class KunlunCollection extends AbstractCollection {
  private static schematics: Schematic[] = [
    {
      name: 'application',
      alias: 'application',
      description: 'Generate a new application workspace'
    },
    {
      name: 'resource',
      alias: 'res',
      description: 'Generate a new CRUD resource'
    }
  ]

  constructor(runner: AbstractRunner) {
    super('@kunlunjs/schematics', runner)
  }

  public async execute(name: string, options: SchematicOption[]) {
    const schematic: string = this.validate(name)
    await super.execute(schematic, options)
  }

  public static getSchematics(): Schematic[] {
    return KunlunCollection.schematics.filter(
      item => item.name !== 'angular-app'
    )
  }

  private validate(name: string) {
    const schematic = KunlunCollection.schematics.find(
      s => s.name === name || s.alias === name
    )

    if (schematic === undefined || schematic === null) {
      throw new Error(
        `Invalid schematic "${name}". Please, ensure that "${name}" exists in this collection.`
      )
    }
    return schematic.name
  }
}
