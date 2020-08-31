import { IDependencies } from "../contract/IDependencies";
import { TodoItem, TodoStatus } from "./TodoItem";

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

  toggleTodo(line: string): string {
    const parsedLine = this.parseLine(line)
    if (parsedLine.checkbox) {
      parsedLine.checkbox = ""
    } else {
      parsedLine.checkbox = "[ ]"
    }
    return this.lineToString(parsedLine)
  }

  setCheckmark(line: string, checkMark: string): string {
    const parsedLine = this.parseLine(line)
    parsedLine.checkbox = `[${checkMark}]`
    return this.lineToString(parsedLine)
  }

  private markToStatus = (mark: string) =>
    mark === "]" ? TodoStatus.Cancelled
      : mark === "-" ? TodoStatus.InProgress
        : mark === "!" ? TodoStatus.AttentionRequired
          : mark === "x" ? TodoStatus.Complete
            : mark === " " ? TodoStatus.Todo
              : mark === "d" ? TodoStatus.Delegated
                : TodoStatus.Todo

  toTodo(line: string): TodoItem | null {
    const parsedLine = this.parseLine(line)
    if (!parsedLine.checkbox)
      return null
    return {
      status: this.markToStatus(parsedLine.checkbox[1]),
      text: parsedLine.line
    }
  }
}