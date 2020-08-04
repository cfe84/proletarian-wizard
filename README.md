# proletarian-wizard README

Proletarian Wizard helps you organize your notes within a GTD-like organized set of folders.

## Features

- [x] Save files in the correct place in few keystrokes
- [ ] Support several layers of folders
- [x] Open files with a few keystrokes
- [x] Create files from templates
- [x] Create projects
- [x] Archive projects
- [x] Define custom paths for directories
- [ ] List files from tags
- [x] Create recurrences
- [x] Create reference folders
- [x] Prompt variables in templates
- [x] Use "this folder"
- [ ] Include recurrence name in new note by default

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

## Known Issues

_Nothing yet_

## Release Notes

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