import { IDependencies } from "../src/contract/IDependencies";
import * as td from "testdouble"
import { ILogger } from "../src/contract/ILogger";
import { IDate } from "../src/contract/IDate";

function makeFakeLogger(): ILogger {
  return td.object(["log", "warn", "error"])
}

function makeFakeDate(): IDate {
  return td.object(["todayAsYMDString"])
}

export const makeFakeDeps = (): IDependencies => {
  return {
    logger: makeFakeLogger(),
    date: makeFakeDate()
  }
}