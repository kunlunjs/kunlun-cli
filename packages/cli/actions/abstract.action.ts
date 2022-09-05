export abstract class AbstractAction<T extends Record<string, any>> {
  public abstract handle(options?: T, extraFlags?: string[]): Promise<void>
  // inputs?: Input[],
  // options?: Input[],
}
