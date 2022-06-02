import { Context } from "fabric-contract-api";
import { Iterators } from "fabric-shim";
import { ParametersType } from "../../enums/ParametersType";
import { Site } from "../../model/site";
import { ParametersController } from "../ParametersController";
import { QueryStateService } from "./QueryStateService";

export class SiteService {
    public static async getRaw(
        ctx: Context,
        id: string): Promise<Uint8Array> {
        console.debug('============= START : getRaw %s SiteService ===========', id);

        const collection: string = await ParametersController.getParameter(ctx, ParametersType.SITE);

        const siteAsBytes = await ctx.stub.getPrivateData(collection, id);

        if (!siteAsBytes || siteAsBytes.length === 0) {
            throw new Error(`Site : ${id} does not exist`);
        }
        console.debug('============= END : getRaw %s SiteService ===========', id);
        return siteAsBytes;
    }

    public static async write(
        ctx: Context,
        siteInput: Site): Promise<void> {
        console.debug('============= START : Write %s SiteService ===========', siteInput.meteringPointMrid);

        const collection: string = await ParametersController.getParameter(ctx, ParametersType.SITE);

        siteInput.docType = 'site';
        await ctx.stub.putPrivateData(collection, siteInput.meteringPointMrid, Buffer.from(JSON.stringify(siteInput)));

        console.debug('============= END : Write %s SiteService ===========', siteInput.meteringPointMrid);
    }

    public static async getQueryResult(
        ctx: Context,
        query: string): Promise<Iterators.StateQueryIterator>  {
        console.debug('============= START : getQueryResult %s SiteService ===========', query);

        const collection: string = await ParametersController.getParameter(ctx, ParametersType.SITE);
        const iterator = await ctx.stub.getPrivateDataQueryResult(collection, query);

        console.debug('============= END : getQueryResult %s SiteService ===========', query);
        return iterator;
    }


    public static async getQueryStringResult(
        ctx: Context,
        query: string): Promise<string>  {
        console.debug('============= START : getQueryStringResult SiteService ===========');

        const collection: string = await ParametersController.getParameter(ctx, ParametersType.SITE);
        const formated = QueryStateService.getPrivateQueryStringResult(ctx, query, collection);

        console.debug('============= END : getQueryStringResult SiteService ===========');
        return formated;
    }

    public static async getPrivateQueryArrayResult(
        ctx: Context,
        query: string): Promise<any[]>  {
        console.debug('============= START : getPrivateQueryArrayResult SiteService ===========');

        const collection: string = await ParametersController.getParameter(ctx, ParametersType.SITE);
        const allResults = QueryStateService.getPrivateQueryArrayResult(ctx, query, collection);

        console.debug('============= END : getPrivateQueryArrayResult SiteService ===========');
        return allResults;
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
