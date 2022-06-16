export class SortHelper {

  public static caseInsensitive(a: string, b: string): number {
    return a.toLowerCase().localeCompare(b.toLowerCase());
  }

}
