export class StarErrorMessageController {

    public static async createMessage(
        className: string,
        functionName: string,
        valueType: string,
        valueId: string,
        messageDetail: string
    ): Promise<string> {
        let message = "";
        if (className.length > 0 && functionName.length > 0) {
            message += className + "/" + functionName + "-";
        }
        if (valueType.length > 0 && valueId.length > 0) {
            message += valueType + "#" + valueId + ":";
        }
        message += messageDetail;

        return message;
    }

}
