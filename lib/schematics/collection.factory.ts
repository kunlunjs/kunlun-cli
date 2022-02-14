import { Runner, RunnerFactory } from '../runners'
import type { SchematicRunner } from '../runners/schematic.runner'
import type { AbstractCollection } from './abstract.collection'
import { Collection } from './collection'
import { CustomCollection } from './custom.collection'
import { KunlunCollection } from './kunlun.collection'

export class CollectionFactory {
  public static create(collection: Collection | string): AbstractCollection {
    switch (collection) {
      case Collection.KUNLUNJS:
        return new KunlunCollection(
          RunnerFactory.create(Runner.SCHEMATIC) as SchematicRunner
        )

      default:
        return new CustomCollection(
          collection,
          RunnerFactory.create(Runner.SCHEMATIC) as SchematicRunner
        )
    }
  }
}
