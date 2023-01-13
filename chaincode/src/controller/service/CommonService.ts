export class CommonService {
    public static reduceDateTimeStr(dateref: string, reducing: number): string {
        let reducedDate = new Date(Date.parse(dateref));

        reducedDate = new Date(reducedDate.getTime() - reducing);

        return JSON.parse(JSON.stringify(reducedDate));
    }

    public static reduceDateDaysStr(dateref: string, reducing: number): string {
        let reducedDate = new Date(Date.parse(dateref));

        reducedDate = this.reduceDateDays(reducedDate, reducing);

        return JSON.parse(JSON.stringify(reducedDate));
    }

    public static reduceDateDays(dateref: Date, reducing: number): Date {
        const reducedDate = new Date(dateref);

        reducedDate.setDate(reducedDate.getDate() - reducing);

        return reducedDate;
    }

    public static increaseDateDaysStr(dateref: string, increasing: number): string {
        let increasedDate = new Date(Date.parse(dateref));

        increasedDate = this.increaseDateDays(increasedDate, increasing);

        return JSON.parse(JSON.stringify(increasedDate));
    }

    public static increaseDateDays(dateref: Date, increasing: number): Date {
        const increasedDate = new Date(dateref);

        increasedDate.setDate(increasedDate.getDate() + increasing);

        return increasedDate;
    }

    public static setHoursStartDayStr(dateref: string): string {
        let newDate = new Date(Date.parse(dateref));

        newDate = this.setHoursStartDay(newDate);

        return JSON.parse(JSON.stringify(newDate));
    }

    public static setHoursStartDay(dateref: Date): Date {
        const newDate = new Date(dateref);

        newDate.setUTCHours(0, 0, 0, 0);

        return newDate;
    }

    public static setHoursEndDayStr(dateref: string): string {
        let newDate = new Date(Date.parse(dateref));

        newDate = this.setHoursEndDay(newDate);

        return JSON.parse(JSON.stringify(newDate));
    }

    public static setHoursEndDay(dateref: Date): Date {
        const newDate = new Date(dateref);

        newDate.setUTCHours(23, 59, 59, 999);

        return newDate;
    }

    public static formatDate(dateValue: Date): string {
        let stringValue: string = '';

        // Remember : NaN is never equal to itself.
        const dateValueTime = dateValue.getTime();
        if (dateValue && dateValue.getTime() === dateValueTime) {
            let tmp: string = '';
            tmp = dateValue.getFullYear().toString();
            stringValue = stringValue.concat(tmp);

            stringValue = stringValue.concat('-');

            tmp = (dateValue.getMonth() + 1).toString();
            stringValue = stringValue.concat(tmp);

            stringValue = stringValue.concat('-');

            tmp = dateValue.getDate().toString();
            stringValue = stringValue.concat(tmp);
        }

        return stringValue;
    }

    public static formatDateStr(dateValueStr: string): string {
        const dateValue = new Date(Date.parse(dateValueStr));

        return this.formatDate(dateValue);
    }

}
