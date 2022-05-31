import { Context } from "fabric-contract-api";
import { Iterators } from "fabric-shim";
import { ParametersType } from "../../enums/ParametersType";
import { Site } from "../../model/site";
import { ParametersController } from "../ParametersController";

export class SiteService {
    public static async getRaw(
        ctx: Context,
        id: string): Promise<Uint8Array> {
        console.debug('============= START : getRaw %s Site ===========', id);

        const collection: string = await ParametersController.getParameter(ctx, ParametersType.SITE);

        const siteAsBytes = await ctx.stub.getPrivateData(collection, id);

        if (!siteAsBytes || siteAsBytes.length === 0) {
            throw new Error(`Site : ${id} does not exist`);
        }
        console.debug('============= END : getRaw %s Site ===========', id);
        return siteAsBytes;
    }

    public static async write(
        ctx: Context,
        siteInput: Site): Promise<void> {
        console.debug('============= START : Write %s Site ===========', siteInput.meteringPointMrid);

        const collection: string = await ParametersController.getParameter(ctx, ParametersType.SITE);

        siteInput.docType = 'site';
        await ctx.stub.putPrivateData(collection, siteInput.meteringPointMrid, Buffer.from(JSON.stringify(siteInput)));

        console.debug('============= END : Write %s Site ===========', siteInput.meteringPointMrid);
    }

    public static async getQueryResult(
        ctx: Context,
        query: string): Promise<Iterators.StateQueryIterator>  {
        console.debug('============= START : getQueryResult %s Site ===========', query);

        const collection: string = await ParametersController.getParameter(ctx, ParametersType.SITE);
        const iterator = await ctx.stub.getPrivateDataQueryResult(collection, query);

        console.debug('============= END : getQueryResult %s Site ===========', query);
        return iterator;
    }

    //getPrivateDataQueryResultWithPagination doesn't exist in 2022 May the 19th
    // public static async getQueryResultWithPagination(
    //     ctx: Context,
    //     query: string): Promise<Iterators.StateQueryIterator>  {
    //     console.debug('============= START : getQueryResult %s Site ===========', query);

    //     const collection: string = await ParametersController.getParameter(ctx, ParametersType.SITE);

    //     const siteAsBytes = await ctx.stub.getPrivateDataQueryResult(collection, query);

    //     console.debug('============= END : getQueryResult %s Site ===========', query);
    //     return siteAsBytes;
    // }

}
