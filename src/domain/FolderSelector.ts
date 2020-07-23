import { IDependencies } from '../contract/IDependencies';
import { IDictionary } from './IDictionary';
import { IContext } from '../contract/IContext';

const defaultInboxFolder: string = "10 - Inbox"
const defaultProjectsFolder: string = "20 - Current Projects"
const defaultRecurrenceFolder: string = "21 - Recurrence"
const defaultReferenceFolder: string = "30 - Reference"
const defaultArchiveFolder: string = "40 - Archived Projects"

export type SpecialFolder = "Inbox" | "Project" | "Recurrence" | "Reference" | "Archive";

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
    }
  }

  private selectSubfolderAsync = async (folder: string, folderName: string): Promise<string | null> => {
    const thisFolder = {
      fullpath: folder,
      name: `<Select ${folderName}>`
    }
    let folders = this.props.allowThisFolder ? [thisFolder] : []
    folders = folders.concat(
      this.deps.fs
        .readdirSync(folder)
        .map(f => ({
          fullpath: this.deps.path.join(folder, f),
          name: f
        }))
        .filter(f => this.deps.fs.lstatSync(f.fullpath).isDirectory()))
    const pick = await this.deps.uiSelector.selectSingleOptionAsync(folders.map(f => f.name));
    if (!pick) {
      return null
    }
    const pickFolder = folders.find(f => f.name === pick)
    return pickFolder?.fullpath || null
  }

  getSpecialFolder = (specialFolder: SpecialFolder) => this.deps.path.join(this.context.rootFolder, this.folders[specialFolder])

  selectFolderAsync = async (baseFolder?: SpecialFolder): Promise<string | null> => {
    if (!baseFolder) {
      baseFolder = await this.deps.uiSelector.selectSingleOptionAsync(["Project", "Recurrence", "Inbox", "Reference"]) as SpecialFolder
    }
    if (baseFolder) {
      const folder = this.getSpecialFolder(baseFolder)
      switch (baseFolder) {
        case "Project":
        case "Recurrence":
        case "Reference":
          return await this.selectSubfolderAsync(folder, baseFolder) || null;
        case "Inbox":
        default:
          return folder
      }
    } else {
      return null
    }
  }
}