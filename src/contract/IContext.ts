import { path } from "./IPath";
import { IConfig } from "./IConfig";

export interface IContext {
  rootFolder: path
  config?: IConfig
}