import { path } from "./IPath";
import { IConfig } from "./IConfig";
import { TodoItem } from "../domain/TodoItem";
import { IStorage } from "./IStorage";

export interface IContext {
  rootFolder: path
  config: IConfig
  todos: TodoItem[]
  storage?: IStorage
}