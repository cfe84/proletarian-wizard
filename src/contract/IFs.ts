import { Stats } from "fs";
import { path, filename } from "./IPath";


export interface IFs {
  readdirSync(folder: path): filename[]
  existsSync(file: path): boolean
  lstatSync(file: path): Stats
  mkdirSync(folder: path): void
  readFileSync(file: path): Buffer
  renameSync(from: path, to: path): void
  writeFileSync(file: path, data: string): void
}