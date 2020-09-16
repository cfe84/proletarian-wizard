import * as vscode from 'vscode';
import { IContext } from '../../contract/IContext';
import { IDependencies } from '../../contract/IDependencies';
import { TodoItem, TodoStatus } from '../../domain/TodoItem';
import { IDictionary } from '../../domain/IDictionary';
import { FileInspector } from '../../domain/FileInspector';

enum ItemType {
  Group,
  Todo
}

abstract class GroupOrTodo extends vscode.TreeItem {
  abstract type: ItemType;

  public asGroup(): Group {
    if (this.type === ItemType.Group)
      return this as unknown as Group
    throw (Error("Invalid cast (to group)"))
  }

  public asTodoItem(): TodoTreeItem {
    if (this.type === ItemType.Todo)
      return this as unknown as TodoTreeItem
    throw (Error("Invalid cast (to todo item)"))
  }
}

const statusToIcon = (status: TodoStatus): string => {
  switch (status) {
    case TodoStatus.Complete: return "✔"
    case TodoStatus.AttentionRequired: return "❗"
    case TodoStatus.Canceled: return "❌"
    case TodoStatus.Delegated: return "👬"
    case TodoStatus.InProgress: return "‍⏩"
    case TodoStatus.Todo: return vscode.window.activeColorTheme.kind === vscode.ColorThemeKind.Dark ? "⬜" : "⬛"
    default: return ""
  }
}

class Group extends GroupOrTodo {
  type: ItemType = ItemType.Group
  constructor(public name: string, public todos: TodoItem[]) {
    super(name)
    this.collapsibleState = vscode.TreeItemCollapsibleState.Expanded
  }
  todosAsTreeItems = () => this.todos.map(todo => new TodoTreeItem(todo))
}

class TodoTreeItem extends GroupOrTodo {
  type: ItemType = ItemType.Todo
  constructor(private todo: TodoItem) {
    super(statusToIcon(todo.status) + " " + todo.text)
    const mapAttributeName = (attributeName: string): string =>
      attributeName === "selected" ? "📌"
        : attributeName === "assignee" || attributeName.toLowerCase() === "assignedto" || attributeName === "assigned" || attributeName === "who" ? "🧍‍♂️"
          : attributeName === "due" || attributeName.toLowerCase() === "duedate" || attributeName === "when" ? "📆"
            : "#️⃣ " + attributeName
    const mapAttributeValue = (attributeName: string, attributeValue: string): string =>
      (attributeName === "priority" || attributeName === "importance") ?
        attributeValue === "critical" ? "❗❗"
          : attributeValue === "high" ? "❗"
            : attributeValue === "medium" ? "➖"
              : attributeValue === "low" ? "⬇"
                : attributeValue
        : attributeValue
    const flattenAttributes = (attributes: IDictionary<string | boolean> | undefined): string =>
      attributes ?
        Object.keys(attributes)
          .map(attributeName => mapAttributeName(attributeName) + (attributes[attributeName] === true ? "" : `: ${mapAttributeValue(attributeName, attributes[attributeName] as string)}`))
          .join(", ")
        : ""
    this.command = {
      title: "Open",
      command: "pw.openAtLine",
      arguments: [vscode.Uri.file(todo.file), todo.line]
    }
    this.description = (todo.project || todo.file) + " " + flattenAttributes(todo.attributes)
    this.collapsibleState = vscode.TreeItemCollapsibleState.None
  }
}

export enum GroupByOption {
  project,
  status,
  nogroups,
  attribute
}

export interface GroupByConfig {
  groupByOption: GroupByOption
  attributeName?: string
}

export enum SortByOption {
  project,
  status,
  attribute
}

export enum SortByDirection {
  up,
  down
}

export interface SortByConfig {
  sortByOption: SortByOption
  sortDirection: SortByDirection
  attributeName?: string
}

const STORAGEKEY_SHOWSELECTEDONTOP = "todoView.showSelectedOnTop"
const STORAGEKEY_SHOWPROJECTSONTOP = "todoView.showProjectsOnTop"
const STORAGEKEY_SHOWOVERDUEONTOP = "todoView.showOverdueOnTop"
const STORAGEKEY_SHOWCOMPLETED = "todoView.showCompleted"
const STORAGEKEY_SHOWCANCELED = "todoView.showCanceled"
const STORAGEKEY_SHOWEMPTY = "todoView.showEmpty"
const STORAGEKEY_GROUPBY = "todoView.groupBy"
const STORAGEKEY_SORTBY = "todoView.sortBy"

export class TodoHierarchicView implements vscode.TreeDataProvider<GroupOrTodo> {

  constructor(private deps: IDependencies, private context: IContext) {
    this._showSelectedOnTop = context.storage ? context.storage.get(STORAGEKEY_SHOWSELECTEDONTOP, true) : true
    this._showProjectsOnTop = context.storage ? context.storage.get(STORAGEKEY_SHOWPROJECTSONTOP, true) : true
    this._showOverdueOnTop = context.storage ? context.storage.get(STORAGEKEY_SHOWOVERDUEONTOP, true) : true
    this._showCompleted = context.storage ? context.storage.get(STORAGEKEY_SHOWCOMPLETED, true) : true
    this._showCanceled = context.storage ? context.storage.get(STORAGEKEY_SHOWCANCELED, true) : true
    this._showEmpty = context.storage ? context.storage.get(STORAGEKEY_SHOWEMPTY, true) : true
    this._groupBy = context.storage ? context.storage.get(STORAGEKEY_GROUPBY, { groupByOption: GroupByOption.status }) : { groupByOption: GroupByOption.status }
    this._sortBy = context.storage ? context.storage.get(STORAGEKEY_SORTBY, { sortByOption: SortByOption.status, sortDirection: SortByDirection.up }) : { sortByOption: SortByOption.status, sortDirection: SortByDirection.up }
  }

  private _groupBy: GroupByConfig
  private _sortBy: SortByConfig
  private _showSelectedOnTop: boolean
  private _showProjectsOnTop: boolean
  private _showOverdueOnTop: boolean
  private _showCompleted: boolean
  private _showCanceled: boolean
  private _showEmpty: boolean

  public set groupBy(value: GroupByConfig) {
    this._groupBy = value
    this.context.storage?.update(STORAGEKEY_GROUPBY, value)
    this.refresh()
  }

  public set sortBy(value: SortByConfig) {
    this._sortBy = value
    this.context.storage?.update(STORAGEKEY_SORTBY, value)
    this.refresh()
  }

  public get sortBy(): SortByConfig {
    return this._sortBy
  }

  public set showSelectedOnTop(value: boolean) {
    this._showSelectedOnTop = value
    this.context.storage?.update(STORAGEKEY_SHOWSELECTEDONTOP, value)
    this.refresh()
  }
  public get showSelectedOnTop(): boolean {
    return this._showSelectedOnTop
  }
  public set showProjectsOnTop(value: boolean) {
    this._showProjectsOnTop = value
    this.context.storage?.update(STORAGEKEY_SHOWPROJECTSONTOP, value)
    this.refresh()
  }
  public get showProjectsOnTop(): boolean {
    return this._showProjectsOnTop
  }
  public set showOverdueOnTop(value: boolean) {
    this._showOverdueOnTop = value
    this.context.storage?.update(STORAGEKEY_SHOWOVERDUEONTOP, value)
    this.refresh()
  }
  public get showOverdueOnTop(): boolean {
    return this._showOverdueOnTop
  }

  public set showCompleted(value: boolean) {
    this._showCompleted = value
    this.context.storage?.update(STORAGEKEY_SHOWCOMPLETED, value)
    this.refresh()
  }
  public get showCompleted(): boolean {
    return this._showCompleted
  }
  public set showCanceled(value: boolean) {
    this._showCanceled = value
    this.context.storage?.update(STORAGEKEY_SHOWCANCELED, value)
    this.refresh()
  }
  public get showCanceled(): boolean {
    return this._showCanceled
  }
  public set showEmpty(value: boolean) {
    this._showEmpty = value
    this.context.storage?.update(STORAGEKEY_SHOWEMPTY, value)
    this.refresh()
  }
  public get showEmpty(): boolean {
    return this._showEmpty
  }


  private onDidChangeTreeDataEventEmitter: vscode.EventEmitter<GroupOrTodo | undefined> = new vscode.EventEmitter<GroupOrTodo | undefined>();

  readonly onDidChangeTreeData: vscode.Event<GroupOrTodo | undefined> = this.onDidChangeTreeDataEventEmitter.event;

  refresh(): void {
    this.onDidChangeTreeDataEventEmitter.fire(undefined);
  }

  getTreeItem(element: GroupOrTodo): GroupOrTodo {
    return element.type === ItemType.Group ? element.asGroup() : element.asTodoItem()
  }

  private groomTodos(todos: TodoItem[]): TodoItem[] {
    if (!this.showCompleted) {
      todos = todos.filter(todo => todo.status !== TodoStatus.Complete)
    }
    if (!this.showCanceled) {
      todos = todos.filter(todo => todo.status !== TodoStatus.Canceled)
    }
    const directionMultiplier = this._sortBy.sortDirection === SortByDirection.up ? 1 : -1
    switch (this._sortBy.sortByOption) {
      case SortByOption.status:
        todos = todos.sort((a, b) => (a.status - b.status) * directionMultiplier)
        break
      case SortByOption.project:
        todos = todos.sort((a, b) => (a.project && b.project) ? (a.project.localeCompare(b.project) * directionMultiplier) : directionMultiplier)
        break
      case SortByOption.attribute:
      default:
        if (!this._sortBy.attributeName)
          break
        const attributeName = this._sortBy.attributeName
        todos = todos.sort((a, b) => (a.attributes && b.attributes
          && a.attributes[attributeName] && b.attributes[attributeName]
          && a.attributes[attributeName] !== true && b.attributes[attributeName] !== true) ?
          ((a.attributes[attributeName] as string).localeCompare(b.attributes[attributeName] as string) * directionMultiplier)
          : directionMultiplier)

    }
    return todos
  }

  private getSelectedGroup(): Group {
    const getSelectedTasks = (): TodoItem[] =>
      this.context.parsedFolder.todos.filter(todo => todo.attributes && todo.attributes.selected)
    return new Group("Selected tasks", this.groomTodos(getSelectedTasks()))
  }

  private getProjectsGroup(): Group {
    const projectsFolder = this.deps.path.join(this.context.rootFolder, this.context.config.folders.projects || "")
    let projects: string[] = []
    const fileInspector = new FileInspector(this.deps, this.context)
    if (this.deps.fs.existsSync(projectsFolder))
      projects = this.deps.fs.readdirSync(projectsFolder)
    return new Group("Projects", projects.map(project => {
      const prj = fileInspector.inspectProject(project)
      return {
        file: this.deps.path.join(projectsFolder, project),
        status: TodoStatus.Todo,
        text: prj.projectName,
        attributes: {
          when: prj.date || ""
        }
      }
    }))
  }

  private getOverdueGroup(): Group {
    const dueDateAttributes = ["due", "duedate", "when", "expire", "expires"]
    const now = Date.now()
    const todosWithOverdueDate = this.context.parsedFolder.todos
      .filter(todo => todo.attributes && dueDateAttributes.find(attribute => {
        if (todo.status === TodoStatus.Complete || todo.status === TodoStatus.Canceled
          || !todo.attributes || !todo.attributes[attribute])
          return false
        const date = Date.parse(`${todo.attributes[attribute]}`)
        return date !== NaN && date < now
      }))
    return new Group("Overdue", todosWithOverdueDate)
  }

  private getGroupsByStatus(): Group[] {
    const getTodosByStatus = (status: TodoStatus): TodoItem[] =>
      this.context.parsedFolder.todos.filter(todo => todo.status === status)
    return [
      { label: "Attention required", status: TodoStatus.AttentionRequired },
      { label: "Todo", status: TodoStatus.Todo },
      { label: "In progress", status: TodoStatus.InProgress },
      { label: "Delegated", status: TodoStatus.Delegated },
      { label: "Complete", status: TodoStatus.Complete },
      { label: "Cancelled", status: TodoStatus.Canceled },
    ]
      .map(({ label, status }) => new Group(label, this.groomTodos(getTodosByStatus(status))))
      .filter((group) => group.todos.length > 0)
  }

  private getGroupsByProject(): Group[] {
    const getProjects = () =>
      this.context.parsedFolder.todos.reduce((projects: IDictionary<TodoItem[]>, todo: TodoItem) => {
        const project = todo.project || "Empty"
        if (!projects[project]) {
          projects[project] = []
        }
        projects[project].push(todo)
        return projects
      }, {})
    const projects = getProjects()
    Object.keys(projects).forEach(key => {
      projects[key] = this.groomTodos(projects[key])
    })
    return Object.keys(projects)
      .map(project => new Group(project, projects[project]))
      .sort((a, b) => a.name === "Empty" ? 1 : a.name.localeCompare(b.name))
  }

  private getGroupsByAttribute(attributeName: string): Group[] {
    const todoWithoutThisAttribute = this.context.parsedFolder.todos.filter(todo => !todo.attributes || todo.attributes[attributeName] === undefined)
    let groupedByAttributes = this.context.parsedFolder.attributeValues[attributeName].map(
      attributeValue => {
        const todos = this.context.parsedFolder.todos.filter(todo => todo.attributes && todo.attributes[attributeName] === attributeValue)
        return new Group(attributeValue, this.groomTodos(todos))
      })
    if (todoWithoutThisAttribute.length > 0) {
      groupedByAttributes = groupedByAttributes.concat(new Group("Empty", this.groomTodos(todoWithoutThisAttribute)))
    }
    return groupedByAttributes
  }

  private getNoGroups(): Group[] {
    return [new Group("All todos", this.groomTodos(this.context.parsedFolder.todos))]
  }

  private getGroupByGroups() {
    switch (this._groupBy.groupByOption) {
      case GroupByOption.project:
        return this.getGroupsByProject()
      case GroupByOption.attribute:
        return this.getGroupsByAttribute(this._groupBy.attributeName as string)
      case GroupByOption.status:
        return this.getGroupsByStatus()
      case GroupByOption.nogroups:
      default:
        return this.getNoGroups()
    }
  }

  private filterEmptyGroups(groups: Group[]): Group[] {
    return groups.filter(group => group.todos.length > 0)
  }

  async getChildren(element?: GroupOrTodo | undefined): Promise<GroupOrTodo[]> {
    if (element) {
      if (element.type === ItemType.Group) {
        return element.asGroup().todosAsTreeItems()
      }
      return []
    }
    let groups = this.getGroupByGroups()
    if (!this.showEmpty)
      groups = this.filterEmptyGroups(groups)
    if (this.showProjectsOnTop)
      groups = [this.getProjectsGroup()].concat(groups)
    if (this._showOverdueOnTop)
      groups = [this.getOverdueGroup()].concat(groups)
    if (this._showSelectedOnTop)
      groups = [this.getSelectedGroup()].concat(groups)
    return groups
  }

}