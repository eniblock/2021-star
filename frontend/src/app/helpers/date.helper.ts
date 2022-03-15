import StringHelper from './string.helpers';

export class DateHelper {
  public static makeDate(day: number, month: number, year: number): Date {
    return new Date(year, month, day);
  }

  public static stringToDate(dateStr: string): Date {
    const str = dateStr.split(/\.|\/|-/); // 10.05.1970 ou 10/05/1970 ou 10-05-1970

    const day = Number(str[0]);
    const month = Number(str[1]) - 1;
    const year = Number(str[2]);

    return DateHelper.makeDate(day, month, year);
  }

  public static stringToTime(dateStr: string): number[] {
    const timeParts = dateStr.split(':');
    return [
      parseInt(timeParts[0], 10),
      parseInt(timeParts[1], 10),
      parseInt(timeParts[2], 10),
    ];
  }

  public static toDatetime(date: Date, time: string): Date {
    const t = DateHelper.stringToTime(time);
    let d = new Date(date.getTime());
    d.setHours(t[0]);
    d.setMinutes(t[1]);
    d.setSeconds(t[2]);
    return d;
  }
}
