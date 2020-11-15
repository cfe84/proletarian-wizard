import { path } from "./IPath";
import { IConfig } from "./IConfig";
import { IStorage } from "./IStorage";
import { ParsedFolder } from "../domain/FolderTodoParser";

export interface IContext {
  rootFolder: path
  config: IConfig
  parsedFolder: ParsedFolder
  storage?: IStorage
  templatesFolder: path
}