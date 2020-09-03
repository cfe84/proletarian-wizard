export interface IUISelectorOption {
  label: string
}

export interface IUISelector {
  selectSingleOptionAsync<T extends IUISelectorOption>(options: T[], title: string): Promise<T | undefined>
  inputStringAsync(prompt: string, initialValue?: string): Promise<string | undefined>
}