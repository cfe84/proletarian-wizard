import { IDate } from "../contract/IDate";

export class StdDate implements IDate {
  thisYearAsYString(): string {
    const date = new Date()
    return date.getFullYear().toString();
  }
  todayAsYMDString(): string {
    const date = new Date()
    return date.toISOString().substr(0, 10)
  }
}