import { Stats } from "fs";

export interface IFs {
  readdirSync(folder: string): string[]
  existsSync(file: string): boolean
  lstatSync(file: string): Stats
  writeFileSync(file: string, data: string): void
}