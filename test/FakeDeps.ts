import { IDependencies } from "../src/contract/IDependencies";
import * as td from "testdouble"
import { ILogger } from "../src/contract/ILogger";
import { IDate } from "../src/contract/IDate";
import { IFs } from "../src/contract/IFs";
import { IPath } from "../src/contract/IPath";
import { IUISelector } from "../src/contract/IUISelector";

function makeFakeLogger(): ILogger {
  return td.object(["log", "warn", "error"])
}

function makeFakeDate(): IDate {
  return td.object(["todayAsYMDString", "thisYearAsYString"])
}

function makeFakeFs(): IFs {
  return td.object(["readdirSync", "existsSync", "lstatSync", "mkdirSync", "readFileSync", "renameSync", "writeFileSync"])
}

function makeFakePath(): IPath {
  return {
    basename: (name: string) => `BASENAME(${name})`,
    join: (...segments: string[]) => segments.join("|"),
    resolve: (name: string): string => name,
    dirname: (name: string) => {
      const folder = name.split("|")
      folder.pop()
      return folder.join("|")
    },
    sep: "|"
  }
}

function makeFakeUiSelector(): IUISelector {
  return td.object(["selectSingleOptionAsync", "inputStringAsync"])
}

export const makeFakeDeps = (): IDependencies => {
  return {
    logger: makeFakeLogger(),
    date: makeFakeDate(),
    fs: makeFakeFs(),
    path: makeFakePath(),
    uiSelector: makeFakeUiSelector()
  }
}