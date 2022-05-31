import { Context } from "fabric-contract-api";
import { Iterators } from "fabric-shim";

export class QueryStateService {
    public static async getQueryResult(
        ctx: Context,
        query: string): Promise<Iterators.StateQueryIterator>  {
        console.debug('============= START : getQueryResult %s QueryStateService ===========', query);

        const iterator = await ctx.stub.getQueryResult(query);

        console.debug('============= END : getQueryResult QueryStateService ===========');
        return iterator;
    }





    public static async getAllStates(ctx: Context, dataType: string): Promise<string> {
        console.debug('============= START : getAllStates %s QueryStateService ===========', dataType);

        const query = `{"selector": {"docType": "${dataType}"}}`;
        const iterator = await this.getQueryResult(ctx, query);

        const allResults = await this.formatResultToArray(iterator);
        const formated = JSON.stringify(allResults);

        console.debug('============= END : getAllStates %s QueryStateService ===========', dataType);
        return formated;
    }



    public static async getQueryStringResult(
        ctx: Context,
        query: string): Promise<string>  {
        console.debug('============= START : getQueryStringResult QueryStateService ===========');

        const iterator = await this.getQueryResult(ctx, query);
        const allResults = await this.formatResultToArray(iterator);
        const formated = JSON.stringify(allResults);

        console.debug('============= END : getQueryStringResult QueryStateService ===========');
        return formated;
    }




    public static async getQueryArrayResult(
        ctx: Context,
        query: string): Promise<any[]>  {
        console.debug('============= START : getQueryStringResult QueryStateService ===========');

        const iterator = await this.getQueryResult(ctx, query);
        const allResults = await this.formatResultToArray(iterator);

        console.debug('============= END : getQueryStringResult QueryStateService ===========');
        return allResults;
    }



    private static async formatResultToArray(iterator: Iterators.StateQueryIterator): Promise<any[]> {
        const allResults:any[] = [];
        try {
            let result = await iterator.next();
            while (!result.done) {
                const strValue = Buffer.from(result.value.value.toString()).toString('utf8');

                let record;
                try {
                    record = JSON.parse(strValue);
                } catch (err) {
                    record = strValue;
                }
                allResults.push(record);
                result = await iterator.next();
            }
        } catch(error) {
            //do nothing just empty list returned
        }
        return allResults;
    }

}
