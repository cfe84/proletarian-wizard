import { filename } from "./IPath";

export interface IConfig {
  folders: {
    projects?: filename,
    inbox?: filename,
    recurrences?: filename,
    reference?: filename,
    archive?: filename
  }
}