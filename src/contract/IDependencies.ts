import { ILogger } from "./ILogger";
import { IDate } from "./IDate";
import { IPath } from "./IPath";
import { IFs } from "./IFs";

export interface IDependencies {
  logger: ILogger,
  date: IDate,
  path: IPath,
  fs: IFs
}