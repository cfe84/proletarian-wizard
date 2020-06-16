import { Stats } from "fs";

export interface IFs {
  readdirSync(folder: string): string[]
  existsSync(file: string): boolean
  lstatSync(file: string): Stats
  mkdirSync(folder: string): void
  readFileSync(file: string): Buffer
  renameSync(from: string, to: string): void
  writeFileSync(file: string, data: string): void
}