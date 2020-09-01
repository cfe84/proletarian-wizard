import { path } from "./IPath";
import { IConfig } from "./IConfig";
import { TodoItem } from "../domain/TodoItem";

export interface IContext {
  rootFolder: path
  config: IConfig
  todos: TodoItem[]
}