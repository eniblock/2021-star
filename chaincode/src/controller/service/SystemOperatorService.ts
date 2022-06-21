import { Context } from "fabric-contract-api";
import { Iterators } from "fabric-shim";
import { SystemOperator } from "../../model/systemOperator";


export class SystemOperatorService {
    public static async getRaw(
        ctx: Context,
        id: string): Promise<Uint8Array> {
        console.debug('============= START : getRaw %s SystemOperatorService ===========', id);

        const sompAsBytes = await ctx.stub.getState(id);
        if (!sompAsBytes || sompAsBytes.length === 0) {
            throw new Error(`System Operator : ${id} does not exist`);
        }

        console.debug('============= END : getRaw %s SystemOperatorService ===========', id);
        return sompAsBytes;
    }


    public static async getObj(
        ctx: Context,
        id: string): Promise<SystemOperator> {

        const dataAsBytes: Uint8Array = await SystemOperatorService.getRaw(ctx, id);
        var dataObj:SystemOperator = null;
        if (dataAsBytes) {
            try {
                dataObj = JSON.parse(dataAsBytes.toString());
            } catch (error) {
                throw new Error(`ERROR SystemOperator -> Input string NON-JSON value`);
            }
        }
        return dataObj;
    }


    public static async write(
        ctx: Context,
        systemOperatorObj: SystemOperator): Promise<void> {
        console.debug('============= START : Write %s SystemOperatorService ===========', systemOperatorObj.systemOperatorMarketParticipantMrid);

        systemOperatorObj.docType = 'systemOperator';

        await ctx.stub.putState(
            systemOperatorObj.systemOperatorMarketParticipantMrid,
            Buffer.from(JSON.stringify(systemOperatorObj)),
        );

        console.debug('============= END : Write %s SystemOperatorService ===========', systemOperatorObj.systemOperatorMarketParticipantMrid);
    }

    public static async getQueryResult(
        ctx: Context,
        query: string): Promise<Iterators.StateQueryIterator>  {
        console.debug('============= START : getQueryResult SystemOperatorService ===========', );

        // console.debug(query);

        const iterator = await ctx.stub.getQueryResult(query);

        console.debug('============= END : getQueryResult SystemOperatorService ===========');
        return iterator;
    }


}
