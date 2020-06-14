import { IDependencies } from "../contract/IDependencies";

const defaultName = "notes"

export interface FileNameProps {
  fileName: string,
  fixExtension?: boolean,
  fixDate?: boolean,
  fixFilename?: boolean,
  defaultName?: string,
  path: string
}

export class FileNameAssembler {
  constructor(private deps: IDependencies) {
  }

  private fixExtension = (filename: string): string => {
    const finishesByMdRegex = /\.md$/i
    if (!finishesByMdRegex.test(filename)) {
      filename += ".md"
    }
    return filename
  }

  private fixDate = (filename: string): string => {
    const dateRegex = /^\d\d\d\d-\d\d-\d\d/
    if (!dateRegex.test(filename)) {
      const date = this.deps.date.todayAsYMDString()
      filename = `${date} - ${filename}`
    }
    return filename
  }

  private fixName = (filename: string, defaultName: string): string => {
    const nameRegex = /^\d\d\d\d-\d\d-\d\d - $/
    if (!filename || nameRegex.test(filename)) {
      filename += defaultName
    }
    return filename
  }

  assembleFileName = (props: FileNameProps) => {
    let filename = props.fileName
    if (props.fixFilename === undefined || props.fixFilename) {
      filename = this.fixName(filename, props.defaultName || defaultName)
    }
    if (props.fixDate === undefined || props.fixDate) {
      filename = this.fixDate(filename)
    }
    if (props.fixExtension === undefined || props.fixExtension) {
      filename = this.fixExtension(filename)
    }
    const filepath = this.deps.path.join(props.path, filename)
    return filepath
  }
}