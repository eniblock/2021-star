export class CommonService {

    public static formatDate(dateValue: Date): string {
        var stringValue: string = "";

        // Remember : NaN is never equal to itself.
        if (dateValue && dateValue.getTime() === dateValue.getTime()) {
            var tmp: string = "";
            tmp = dateValue.getFullYear().toString();
            stringValue = stringValue.concat(tmp);

            stringValue = stringValue.concat("-");

            tmp = (dateValue.getMonth()+1).toString();
            stringValue = stringValue.concat(tmp);

            stringValue = stringValue.concat("-");

            tmp = dateValue.getDate().toString();
            stringValue = stringValue.concat(tmp);
        }

        return stringValue;
    }

    public static formatDateStr(dateValueStr: string): string {
        var dateValue = new Date(Date.parse(dateValueStr));

        return this.formatDate(dateValue);
    }



}
