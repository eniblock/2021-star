import { Context } from "fabric-contract-api";
import { YellowPages } from "../../model/yellowPages";

export class YellowPagesService {

    public static async write(
        ctx: Context,
        yellowPageObj: YellowPages): Promise<void> {
        console.debug('============= START : Write %s YellowPagesService ===========', yellowPageObj.yellowPageMrid);

        yellowPageObj.docType = 'yellowPages';

        await ctx.stub.putState(
            yellowPageObj.yellowPageMrid,
            Buffer.from(JSON.stringify(yellowPageObj)),
        );

        console.debug('============= END : Write %s YellowPagesService ===========', yellowPageObj.yellowPageMrid);
    }

}
