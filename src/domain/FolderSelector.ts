import { IDependencies } from '../contract/IDependencies';
import { IDictionary } from './IDictionary';
import { IContext } from '../contract/IContext';
import { SpecialFolder, IFolder } from '../contract/IFolder';
import { create } from 'domain';
import { CreateProjectCommand } from '../infrastructure/commands/CreateProjectCommand';

const defaultInboxFolder: string = "10 - Inbox";
const defaultProjectsFolder: string = "20 - Current Projects";
const defaultRecurrenceFolder: string = "21 - Recurrence";
const defaultReferenceFolder: string = "30 - Reference";
const defaultArchiveFolder: string = "40 - Archived Projects";


export interface SelectFolderProps {
  allowCreateFolder?: boolean
  allowThisFolder?: boolean
}

export class FolderSelector {

  private folders: IDictionary<string>;

  constructor(private props: SelectFolderProps, private deps: IDependencies, private context: IContext) {
    this.folders = {
      "Project": context.config?.folders.projects || defaultProjectsFolder,
      "Inbox": context.config?.folders.inbox || defaultInboxFolder,
      "Recurrence": context.config?.folders.recurrences || defaultRecurrenceFolder,
      "Reference": context.config?.folders.reference || defaultReferenceFolder,
      "Archive": context.config?.folders.archive || defaultArchiveFolder
    };
  }

  private selectSubfolderAsync = async (parentFolder: IFolder): Promise<IFolder | null> => {
    const thisFolder = {
      fullpath: parentFolder.path,
      name: `<Select ${parentFolder.name}>`
    };
    const createNew = {
      fullpath: "",
      name: `<Create new>`
    };
    let folders = this.props.allowThisFolder ? [thisFolder] : [];
    folders = folders.concat(
      this.deps.fs
        .readdirSync(parentFolder.path)
        .map(f => ({
          fullpath: this.deps.path.join(parentFolder.path, f),
          name: f
        }))
        .filter(f => this.deps.fs.lstatSync(f.fullpath).isDirectory()));
    if (this.props.allowCreateFolder) {
      folders.push(createNew);
    }
    const pickFolderOption = await this.deps.uiSelector.selectSingleOptionAsync(folders.map(f => ({ label: f.name, folder: f })), "Folder");
    if (!pickFolderOption) {
      return null;
    }
    const pickFolder = pickFolderOption.folder;
    if (pickFolder === createNew) {
      const createProjectCommand = new CreateProjectCommand(this.deps, this.context);
      const newFolderPath = await createProjectCommand.executeAsync();
      if (!newFolderPath) {
        return null;
      }
      return {
        path: newFolderPath,
        name: this.deps.path.basename(newFolderPath),
        underSpecialFolder: parentFolder.underSpecialFolder,
        isSpecialFolder: false
      };
    }
    return {
      path: pickFolder.fullpath,
      name: pickFolder.name,
      underSpecialFolder: parentFolder.underSpecialFolder,
      isSpecialFolder: pickFolder === thisFolder && parentFolder.isSpecialFolder
    };
  };

  getSpecialFolder = (specialFolder: SpecialFolder) => this.deps.path.join(this.context.rootFolder, this.folders[specialFolder]);

  selectFolderAsync = async (baseFolder?: SpecialFolder): Promise<IFolder | null> => {
    if (!baseFolder) {
      const baseFolderOption = await this.deps.uiSelector.selectSingleOptionAsync(["Project", "Recurrence", "Inbox", "Reference"].map(f => ({ label: f })), "Folder type");
      baseFolder = (baseFolderOption?.label) as SpecialFolder;
    }
    if (baseFolder) {
      const folder = this.getSpecialFolder(baseFolder);
      switch (baseFolder) {
        case "Project":
        case "Recurrence":
        case "Reference":
          return await this.selectSubfolderAsync({ path: folder, name: baseFolder, underSpecialFolder: baseFolder, isSpecialFolder: true }) || null;
        case "Inbox":
        default:
          return { path: folder, name: baseFolder, underSpecialFolder: baseFolder, isSpecialFolder: true };
      }
    } else {
      return null;
    }
  };
}