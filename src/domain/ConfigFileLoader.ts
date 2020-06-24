import { IDependencies } from "../contract/IDependencies";
import { IConfig } from "../contract/IConfig";
import { path } from "../contract/IPath";
import * as yaml from "yaml"

interface IConfigFile {
  config: IConfig
}

export class ConfigFileLoader {
  constructor(private deps: IDependencies) {

  }
  loadConfig(filePath: path): IConfig | null {
    if (!this.deps.fs.existsSync(filePath)) {
      return null
    }
    const fileContent = `${this.deps.fs.readFileSync(filePath)}`
    const configurationFile: IConfigFile = yaml.parse(fileContent)
    return configurationFile.config
  }
}