import { IDependencies } from "../contract/IDependencies";
import { IContext } from "../contract/IContext";
import { IDictionary } from "./IDictionary";

export interface InspectionResults {
  containingFolderType: string
  project: string
  name: string
}

export class FileInspector {
  private foldersRef: IDictionary<string> = {};
  constructor(private deps: IDependencies, private context: IContext) {
    Object.keys(context.config.folders).forEach(key => this.foldersRef[(context.config.folders as any)[key]] = key || "")
  }

  inspect(file: string): InspectionResults {
    file = file.replace(this.context.rootFolder, "")
    const splat = file.split(this.deps.path.sep).filter(comp => !!comp)
    if (splat.length === 0) {
      throw Error("This is not a file")
    }
    const containingFolderType = this.foldersRef[splat[0]] || ""
    let project = ""
    if (containingFolderType) {
      splat.shift()
    }
    if (splat.length > 1 && (containingFolderType === "projects" || containingFolderType === "recurrences")) {
      project = splat.shift() || ""
    }
    let name = ""
    if (splat.length > 0) {
      name = this.deps.path.join(...splat)
    }
    if ((containingFolderType === "projects" || containingFolderType === "recurrences") && !project && name) {
      project = this.deps.path.basename(name)
    }
    return {
      containingFolderType,
      project,
      name
    }
  }
}