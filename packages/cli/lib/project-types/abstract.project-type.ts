import type { AbstractRunner } from '../runners/abstract.runner'
import type { ProjectTypeCommands } from './project-type-commands'

export abstract class AbstractProjectType {
  constructor(protected runner: AbstractRunner) {}

  public abstract get name(): string

  public abstract get cli(): ProjectTypeCommands
}
