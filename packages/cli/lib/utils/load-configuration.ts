import type { Configuration, ConfigurationLoader } from '../configuration'
import { KunlunConfigurationLoader } from '../configuration/kunlun-configuration.loader'
import { FileSystemReader } from '../readers'

export async function loadConfiguration(): Promise<Required<Configuration>> {
  const loader: ConfigurationLoader = new KunlunConfigurationLoader(
    new FileSystemReader(process.cwd())
  )
  return loader.load()
}

export async function BackendloadConfiguration(): Promise<
  Required<Configuration>
> {
  const loader: ConfigurationLoader = new KunlunConfigurationLoader(
    new FileSystemReader(process.cwd())
  )
  return loader.load('nest-cli.json')
}
