import { IDependencies } from "../contract/IDependencies";
import { IConfig } from "../contract/IConfig";
import { path } from "../contract/IPath";
import * as yaml from "yaml"

interface IConfigFile {
  config: IConfig
}

const defaultInboxFolder: string = "10 - Inbox"
const defaultProjectsFolder: string = "20 - Current Projects"
const defaultRecurrenceFolder: string = "21 - Recurrence"
const defaultReferenceFolder: string = "30 - Reference"
const defaultArchiveFolder: string = "40 - Archived Projects"

export class ConfigFileLoader {
  constructor(private deps: IDependencies) {

  }

  private addDefaultValues(config: IConfig) {
    if (!config.folders.inbox)
      config.folders.inbox = defaultInboxFolder
    if (!config.folders.projects)
      config.folders.projects = defaultProjectsFolder
    if (!config.folders.recurrences)
      config.folders.recurrences = defaultRecurrenceFolder
    if (!config.folders.reference)
      config.folders.reference = defaultReferenceFolder
    if (!config.folders.archive)
      config.folders.archive = defaultArchiveFolder
  }

  loadConfig(filePath: path): IConfig {
    let config: IConfig = { folders: {} }
    if (this.deps.fs.existsSync(filePath)) {
      const fileContent = `${this.deps.fs.readFileSync(filePath)}`
      const configurationFile: IConfigFile = yaml.parse(fileContent)
      config = configurationFile.config
    }
    this.addDefaultValues(config)
    return config;
  }
}