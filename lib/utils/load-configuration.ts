import { paths } from '../../configs/defaults'
import type { Configuration, ConfigurationLoader } from '../configuration'
import { KunlunConfigurationLoader } from '../configuration/kunlun-configuration.loader'
import { FileSystemReader } from '../readers'

export async function loadConfiguration(): Promise<Required<Configuration>> {
  const loader: ConfigurationLoader = new KunlunConfigurationLoader(
    new FileSystemReader(paths.root)
  )
  return loader.load()
}
