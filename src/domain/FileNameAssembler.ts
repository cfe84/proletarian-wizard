import { IDependencies } from "../contract/IDependencies";

export interface FileNameProps {
  fileName: string,
  fixFileName?: boolean,
  path: string
}

export class FileNameAssembler {
  constructor(private deps: IDependencies) {
  }

  private fixFileName = (filename: string): string => {
    const finishesByMdRegex = /\.md$/i
    if (!finishesByMdRegex.test(filename)) {
      filename += ".md"
    }
    const dateRegex = /^\d\d\d\d-\d\d-\d\d/
    if (!dateRegex.test(filename)) {
      const date = this.deps.date.todayAsYMDString()
      filename = `${date} - ${filename}`
    }
    return filename
  }

  assembleFileName = (props: FileNameProps) => {
    let filename = props.fileName
    if (props.fixFileName === undefined || props.fixFileName) {
      filename = this.fixFileName(filename)
    }
    const filepath = this.deps.path.join(props.path, filename)
    return filepath
  }
}