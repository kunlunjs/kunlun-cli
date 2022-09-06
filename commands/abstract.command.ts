import type { Command } from 'commander'
import type { AbstractAction } from '../actions/abstract.action'

export abstract class AbstractCommand<T extends Record<string, any>> {
  constructor(protected action: AbstractAction<T>) {}

  public abstract load(program: Command): void
}
