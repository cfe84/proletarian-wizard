Proletarian Wizard helps you organize your notes within a GTD-like organized set of folders. It provides two main sets of features:
- File management, organizing files into an opinionated set of folders and files
- Todo management, collecting todos from project notes.

![Example of todos](/doc/img/todos.png)

## Opinionated workflow

### Projects

Proletarian Wizard instruments an opinionated workflow, which central aspect is that of a project. Most of your (professional) life revolves around poorly defined projects that you need to lead to completion. A project is therefore the sum of its contents (notes, documents) and actions (todos). The workflow usually begins with creating a project and adding notes to it. This could be the notes for the first meeting about a topic, or ideas around a new initiative. They can also start with an uncategorized not in the inbox, to be categorized into a project later. Once a project is completed, OR abandoned, it is archived.

PW also instruments the notion of recurrences: those meetings and cadences that happen regularly and don't really categorize as project, and which are more convenient to keep together (say, 1:1 meetings, planning sessions, monthly business reviews, etc.)

### Todos

Notes shall be taken in markdown. It is very frequent that you define todos while taking notes. When you finally admit that the distinction between notes and todos is pretty fuzzy, merging both together seems to make sense. Proletarian Wizard offers a robust way to organize these, using projects as the background organization layer, adding to that statuses, a process of selection for creating a todo-list for the day, and flexible attributes.

Todos are noted with the `[ ]` symbol at the beginning of the line (or after a list marker). A completed todo is marked `[x]`. If you decide to delegate a todo, mark it `[d]`. When you are in progress, mark a `[-]`, in progress todos should be completed first. A todo is rarely done in one day, and often requires information found in various places: emails, IM, websites. When receiving new information about a todo, rather than scattering in different tools, add sub-items to keep track of what's happening. PW offers a command to add the date to the beginning of the line by pressing `alt+.`. This helps remembering what is happening. For example:

```markdown
- [d] Write monthly report @assignee(Geraldine) @due(2020-09-10)
  - 2020-08-01: Lorraine asked to fill the new features section by Sept 10
  - 2020-08-04: Asked Geraldine to do it
  - 2020-08-10: Checked with Geraldine, she needs more time
```

To select todos you want to address today, add a `@selected` attribute on their lines. This conveniently places those todos in a folder on top of the "Todos" window.

## Extension Settings

App requires the folder structure to be the following:

- 10 - Inbox - All files you create in a hurry and didn't sort yet
- 20 - Current Projects - Groups of files related to a given project
- 21 - Recurrence - Notes from recurring meetings
- 30 - Reference - Reference files
- 40 - Archived Projects - Projects that are no longer active

**Config file**: Add a file `.pw/config.yml` with the following structure to configure the folders:

```yaml
config:
  folders:
    inbox: INBOX_FOLDER_NAME # relative to the root folder
    projects: CURRENT_PROJECTS_FOLDER_NAME
    recurrences: RECURRENCES_FOLDER_NAME
    reference: REFERENCE_FOLDER_NAME
    archive: ARCHIVED_PROJECTS_FOLDER_NAME
```

**Templates**: To use templates, create a folder `.pw/templates` in your root folder, and put templates there. They can embed variables using the format `${Variable name}` which will be prompted upon creation of a note from the template. To use templates, use the command `Proletarian Wizard: Create Note from Template`

## Todo

Proletarian Wizard also includes a todo management system. These are displayed in an explorer window called "todo hierarchy". Any markdown file with a line following this format:

```markdown
[ ] This is a todo
```

Boxes can be toggled using `alt+enter`

will be considered as a todo. In the box, the following values are use:
- `x` when completed. PW provides a shortcut: `Alt+x`
- `d` when delegated: `alt+d`
- `-` when in progress: `alt+-`
- `!` when attention is required `alt+shift+!`
- `space` when todo `alt+t`
- remove the space, when cancelled: `alt+c`

PW also supports inline attributes, using the following format: `@attributename(attribute value)`. These are used for display in the explorer window.

There are a few special attributes:
- `selected` which allows you to pick some tasks you want to keep in front (say, for example, those you want to process today, or this week).
- `project` allows you to specify another project a given Todo should be assigned to

## Todo's view

PW comes with a handy view that lists all todos in the current hierarchy. This view can be customized to:
- Display "selected" todos on top of the list
- Group by any attribute

## Features

- [x] Save files in the correct place in few keystrokes
- [ ] Support several layers of folders
- [x] Open files with a few keystrokes
- [x] Create files from templates
- [x] Create projects
- [x] Archive projects
- [x] Create files directly in projects
- [x] Create projects when selecting project
- [x] Define custom paths for directories
- [ ] List files from tags
- [x] Create recurrences
- [x] Create reference folders
- [x] Prompt variables in templates
- [x] Use "this folder"
- [x] Include recurrence name in new note by default
- [x] Add date in line
- [x] Support todo status
- [x] List all todos across workspace
- [x] Grouping todos by project
- [x] Save display preferences
- [x] Support line attributes (assignee, priority, due date, selected)
- [x] Group by attributes
- [x] Display "@selected" on top
- [x] Group by no group
- [x] Sort todos
- [x] Show/Hide completed and canceled
- [ ] Optimize reload of todos
- [x] When clicking on todo, open file at the right line
- [x] Support `@project` attribute for todos in the wrong folder
- [x] Show projects on top of list of todos
- [x] Show overdue on top of list of todos
- [] Support tags for todos, group by tags (Cancelled - use the `hashtags` extension instead)
- [ ] Support project briefs, use as project name (Alternatively - use the `@project` attribute)
- [x] Autocomplete attribute names 
- [x] Autocomplete attribute values
- [x] Open files out of vscode with default application (useful for stuff like word documents)
- [x] Show/Hide groups with no active todo in todo list
- [x] Right click archive
- [ ] Reminders for tasks
- [ ] Periodic tasks
- [ ] Support tasks in numbered lists

## Known Issues

1. [x] Status doesn't work with upper case
2. [x] "Open in default app" doesn't work on mac
3. [x] Sort by attributes doesn't work well
4. [x] `@project` autocompletion don't work
5. [ ] Templates are copied twice
6. [x] Same variable in a template is asked several times

## Release Notes

### 1.5.0

- Fix bug 4
- Add right-click > archive project in explorer

### 1.4.1

- Fix bug 3.

### 1.4

- Show / hide empty groups in todo list

### 1.3

- Open file at right line
- Fix bugs 1. and 2.

### 1.2.2

- Fix bug with autocomplete.

### 1.2.0

- Autocomplete attribute values
- Open files with default application direct from vscode
- Tweaks to how projects are displayed
- Fix bug displaying complete or cancelled as overdue

### 1.1.0

- Autocomplete attribute names
- Support @project attribute to re-classify todos to the right project

### 1.0.0

- Sort todos by attribute, project or status
- Show/hide complete or cancelled tasks
- Disable grouping
- Create project on select
- Save file directly on creation

### 0.10.0

- Group by attributes

### 0.9.0

- Group view by state or project
- Display task status as icon
- Support in-line attributes (use @attributeName(attributeValue))
- Show selected todos on top (add an @selected attribute to the todo)

### 0.8.0

- Add view listing todo items by state

### 0.7.0

- Add keyboard shortcuts for todo management

### 0.5.0

- Add date to current line
- Manage todo status (todo, in progress, delegated, attention required, cancelled, completed)

### 0.3.0

- For recurrence, default file name includes the name of the recurrence.

### 0.2.0

- Support `<this folder>` as a choice for save, archive, ... Also support archiving files.

### 0.1.0

- Create recurrence folder
- Create reference folder
- Define custom path for folders in config file
- Prompt for variables when loading a template.

### 0.0.1

- Save files in right folder.