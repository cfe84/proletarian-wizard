import { IDependencies } from "../contract/IDependencies";

interface ILineStructure {
  indentation: string
  listMarker: string
  checkbox: string
  date: string
  line: string
}

export class LineOperations {
  constructor(private deps: IDependencies) { }

  private parseLine(line: string): ILineStructure {
    const regexp = /^(\s*)?(?:([*-])\s*)?(?:(\[.?\])\s*)?(?:((?:\d\d\d\d-)?\d\d-\d\d):\s*)?(.+)/
    const parsed = regexp.exec(line)
    if (!parsed) {
      return {
        indentation: "",
        listMarker: "",
        checkbox: "",
        date: "",
        line: line
      }
    }
    return {
      indentation: parsed[1] || "",
      listMarker: parsed[2] || "",
      checkbox: parsed[3] || "",
      date: parsed[4] || "",
      line: parsed[5] || ""
    }
  }

  private lineToString(line: ILineStructure): string {
    const space = (item: string, char: string = " ") => item ? `${item}${char}` : ""
    return `${line.indentation}${space(line.listMarker)}${space(line.checkbox)}${space(line.date, ": ")}${line.line}`
  }

  addDate(line: string): string {
    const todaysDate = this.deps.date.todayAsYMDString()
    const parsedLine = this.parseLine(line)
    parsedLine.date = todaysDate
    return this.lineToString(parsedLine)
  }
}