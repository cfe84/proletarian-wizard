import { IDependencies } from "../contract/IDependencies";
import { TodoItem } from "./TodoItem";
import { ITodoParsingResult, LineOperations } from "./LineOperations";
import { IContext } from "../contract/IContext";
import { FileInspector } from "./FileInspector";
import { IDictionary } from "./IDictionary";

export interface ParsedFolder {
  todos: TodoItem[]
  attributes: string[]
  attributeValues: IDictionary<string[]>
}

export class FolderTodoParser {
  private lineOperations: LineOperations
  private fileInspector: FileInspector
  constructor(private deps: IDependencies, private context: IContext) {
    this.lineOperations = new LineOperations(deps)
    this.fileInspector = new FileInspector(deps, context)
  }

  private createTodoTreeStructure(lines: string[], parsingResults: ITodoParsingResult[]) {
    let parentStack: ITodoParsingResult[] = []
    const getParent = () => parentStack[parentStack.length - 1]
    let lastVisitedTodo: ITodoParsingResult | undefined
    parsingResults.forEach((current, i) => {
      if (!lastVisitedTodo) {
        if (current.isTodo) {
          lastVisitedTodo = current
        }
        return
      }

      if (lines[i].match(/^\s*$/)) {
        return
      }

      const isDeeperThanLastTodo = ((current.indentLevel as number) > (lastVisitedTodo.indentLevel as number))
      if (isDeeperThanLastTodo) {
        if (current.isTodo) {
          parentStack.push(lastVisitedTodo);
          (lastVisitedTodo.todo as TodoItem).subtasks = [current.todo as TodoItem]
        }
      } else {
        const isDeeperThanParent = () => ((current.indentLevel as number) > (getParent().indentLevel as number))
        while (getParent() && !isDeeperThanParent()) {
          parentStack.pop()
        }
        if (getParent() && current.isTodo) {
          (getParent().todo as TodoItem).subtasks?.push(current.todo as TodoItem)
        }
      }
      if (current.isTodo) {
        lastVisitedTodo = current
      }
    })
  }

  private propagateProjectsToSubtasks(todo: TodoItem, project: string) {
    if (todo.attributes && todo.attributes.project) {
      project = todo.attributes.project as string
    } else {
      todo.project = project
    }
    if (todo.subtasks) {
      todo.subtasks.forEach(subtask => this.propagateProjectsToSubtasks(subtask, project))
    }
  }

  private removeSubtasksFromTree(todos: TodoItem[]) {
    const toRemove = []
    for (let i = 0; i < todos.length; i++) {
      const todo = todos[i]
      if (todo.subtasks) {
        toRemove.push(...todo.subtasks)
      }
    }
    toRemove.forEach(subtask => {
      const idx = todos.findIndex(t => t === subtask)
      todos.splice(idx, 1)
    })
  }

  private parseFile(file: string): TodoItem[] {
    if (!file.endsWith(".md") && !file.endsWith(".txt")) {
      return []
    }
    const content = `${this.deps.fs.readFileSync(file)}`
    const lines = content.split("\n")
    const parsingResults = lines.map((line, number) => this.lineOperations.toTodo(line, number))
    this.createTodoTreeStructure(lines, parsingResults)
    const todos = parsingResults
      .filter(todoParsingResult => todoParsingResult.isTodo)
      .map(result => result.todo) as TodoItem[]
    const inspectionResults = this.fileInspector.inspect(file)
    todos.forEach((todo) => {
      todo.file = file
      todo.project = (todo.attributes && todo.attributes.project) ? todo.attributes.project as string : inspectionResults.project
      todo.folderType = inspectionResults.containingFolderType
    })
    this.removeSubtasksFromTree(todos)
    todos.forEach(todo => {
      if (todo.subtasks) {
        this.propagateProjectsToSubtasks(todo, todo.project as string)
      }
    })
    return todos
  }

  private findFolderTodos(folder: string): TodoItem[] {
    if (folder === this.context.templatesFolder) {
      return []
    }
    const files = this.deps.fs.readdirSync(folder)
    const todos = files
      .map(file => this.deps.path.join(folder, file))
      .map((file) =>
        this.deps.fs.lstatSync(file).isDirectory() ?
          this.findFolderTodos(file) :
          this.parseFile(file)
      )
      .reduce((prev, curr) => {
        prev = prev.concat(curr)
        return prev
      }, [])
    return todos
  }

  public parseFolder(folder: string): ParsedFolder {
    const todos = this.findFolderTodos(folder)
    const attributes: IDictionary<string[]> = {}
    todos.forEach(todo => {
      if (!todo.attributes) {
        return
      }
      const todoAttributes = todo.attributes
      Object.keys(todoAttributes).forEach(attribute => {
        if (!attributes[attribute]) {
          attributes[attribute] = []
        }
        if (todoAttributes[attribute] !== true && attributes[attribute].indexOf(todoAttributes[attribute] as string) < 0) {
          attributes[attribute].push(todoAttributes[attribute] as string)
        }
      })
    })

    const parsedFolder: ParsedFolder = {
      todos,
      attributes: Object.keys(attributes).sort((a, b) => a.localeCompare(b)),
      attributeValues: attributes
    }
    if (!attributes["project"]) {
      attributes["project"] = []
    }
    if (!attributes["selected"]) {
      attributes["selected"] = []
    }
    todos.forEach(todo => {
      if (todo.project !== undefined && !attributes["project"].find(value => value === todo.project)) {
        attributes["project"].push(todo.project)
      }
    })
    return parsedFolder
  }
}