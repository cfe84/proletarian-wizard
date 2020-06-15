export interface IUISelector {
  selectSingleOptionAsync(options: string[]): Promise<string | undefined>
  inputStringAsync(prompt: string, initialValue?: string): Promise<string | undefined>
}