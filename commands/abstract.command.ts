import type { CommanderStatic } from 'commander'
import type { AbstractAction } from '../actions/abstract.action'

export abstract class AbstractCommand {
  constructor(protected action: AbstractAction) {}

  public abstract load(program: CommanderStatic): void
}
