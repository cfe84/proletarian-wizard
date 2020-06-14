import { IDependencies } from "../src/contract/IDependencies";
import * as td from "testdouble"
import { ILogger } from "../src/contract/ILogger";
import { IDate } from "../src/contract/IDate";
import { IFs } from "../src/contract/IFs";
import { IPath } from "../src/contract/IPath";

function makeFakeLogger(): ILogger {
  return td.object(["log", "warn", "error"])
}

function makeFakeDate(): IDate {
  return td.object(["todayAsYMDString"])
}

function makeFakeFs(): IFs {
  return td.object([])
}

function makeFakePath(): IPath {
  return {
    join: (...segments: string[]) => segments.join("|")
  }
}

export const makeFakeDeps = (): IDependencies => {
  return {
    logger: makeFakeLogger(),
    date: makeFakeDate(),
    fs: makeFakeFs(),
    path: makeFakePath()
  }
}