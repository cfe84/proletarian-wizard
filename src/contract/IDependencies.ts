import { ILogger } from "./ILogger";
import { IDate } from "./IDate";

export interface IDependencies {
  logger: ILogger,
  date: IDate
}