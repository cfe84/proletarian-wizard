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
- [ ] Create recurrences
- [ ] Create reference folders
- [ ] Prompt variables in templates

## Extension Settings

App requires the folder structure to be the following:

- 10 - Inbox - All files you create in a hurry and didn't sort yet
- 20 - Current Projects - Groups of files related to a given project
- 21 - Recurrence - Groups of files for recurring meetings
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

**Templates**: To use templates, create a folder `.pw/templates` in your root folder, and put templates there.

## Known Issues

_Nothing yet_

## Release Notes

Users appreciate release notes as you update your extension.

### 0.0.1

- Save files in right folder.