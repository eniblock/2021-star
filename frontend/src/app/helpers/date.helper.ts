import {parse} from 'tinyduration';
import StringHelper from "./string.helpers";

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

  public static toDatetime(date: Date, time: string): Date {
    const t = DateHelper.stringToTime(time);
    let d = new Date(date.getTime());
    d.setHours(t[0]);
    d.setMinutes(t[1]);
    d.setSeconds(t[2]);
    return d;
  }

  private static stringToTime(dateStr: string): number[] {
    const timeParts = dateStr.split(':');
    return [
      parseInt(timeParts[0], 10),
      parseInt(timeParts[1], 10),
      parseInt(timeParts[2], 10),
    ];
  }

  public static utcDatetimeStrToLocalTimeStr(datetimeStr: string): string {
    const datetime = new Date(datetimeStr);
    const hours = StringHelper.ajouterZerosAGauche(datetime.getHours(), 2);
    const minutes = StringHelper.ajouterZerosAGauche(datetime.getMinutes(), 2);
    const seconds = StringHelper.ajouterZerosAGauche(datetime.getSeconds(), 2);
    return hours + ':' + minutes + ':' + seconds;
  }

  public static utcDatetimeStrToLocalDateStr(datetimeStr: string): string {
    const datetime = new Date(datetimeStr);
    const day = StringHelper.ajouterZerosAGauche(datetime.getDate(), 2);
    const month = StringHelper.ajouterZerosAGauche(datetime.getMonth() + 1, 2);
    const year = StringHelper.ajouterZerosAGauche(datetime.getFullYear(), 4);
    return day + '/' + month + '/' + year;
  }

  public static stringToTimestamp(dateStr: string): number {
    return dateStr ? new Date(dateStr).getTime() : 0;
  }

  public static durationToMilliseconds(resolution: string): number {
    const obj = parse(resolution);
    const seconds =
      (obj.seconds ? obj.seconds : 0) +
      (obj.minutes ? obj.minutes : 0) * 60 +
      (obj.hours ? obj.hours : 0) * 3600 +
      (obj.days ? obj.days : 0) * 86400 +
      (obj.months ? obj.months : 0) * 2592000 +
      (obj.years ? obj.years : 0) * 31536000;
    return seconds * 1000;
  }

  public static addOneDayMinusOnemillisecond(jsonDate: string): string {
    if (jsonDate == undefined || jsonDate == null || jsonDate == '') {
      return jsonDate
    }
    let t = new Date((new Date(jsonDate)).getTime() + 24 * 3600000 - 1).toJSON();
    return t.substring(0, t.indexOf('.')) + 'Z';
  }

}
