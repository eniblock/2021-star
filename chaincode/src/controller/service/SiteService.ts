import { Context } from "fabric-contract-api";
import { STARParameters } from '../../model/starParameters';
import { ParametersType } from "../../enums/ParametersType";
import { Site } from "../../model/site";
import { QueryStateService } from "./QueryStateService";
import { DocType } from "../../enums/DocType";

export class SiteService {
    public static async getRaw(
        ctx: Context,
        params: STARParameters,
        id: string): Promise<Uint8Array> {
        console.debug('============= START : getRaw %s SiteService ===========', id);

        const collections: string[] = params.values.get(ParametersType.SITE);

        var siteAsBytes: Uint8Array = new Uint8Array();
        var i=0;

        if (collections) {
            while (i<collections.length && (!siteAsBytes || siteAsBytes.length === 0)) {
                siteAsBytes = await ctx.stub.getPrivateData(collections[i], id);
                i++;
            }
        }

        if (!siteAsBytes || siteAsBytes.length === 0) {
            throw new Error(`Site : ${id} does not exist`);
        }
        console.debug('============= END : getRaw %s SiteService ===========', id);
        return siteAsBytes;
    }

    public static async write(
        ctx: Context,
        params: STARParameters,
        siteInput: Site): Promise<void> {
        console.debug('============= START : Write %s SiteService ===========', siteInput.meteringPointMrid);

        const collections: string[] = params.values.get(ParametersType.SITE);

        siteInput.docType = DocType.SITE;
        await ctx.stub.putPrivateData(collections[0], siteInput.meteringPointMrid, Buffer.from(JSON.stringify(siteInput)));

        console.debug('============= END : Write %s SiteService ===========', siteInput.meteringPointMrid);
    }

    // public static async getQueryResult(
    //     ctx: Context,
    //     query: string): Promise<Iterators.StateQueryIterator>  {
    //     console.debug('============= START : getQueryResult %s SiteService ===========', query);

    //     const collection: string = await ParametersController.getParameterValues(ctx, ParametersType.SITE);
    //     const iterator = await ctx.stub.getPrivateDataQueryResult(collection, query);

    //     console.debug('============= END : getQueryResult %s SiteService ===========', query);
    //     return iterator;
    // }


    public static async getQueryStringResult(
        ctx: Context,
        params: STARParameters,
        query: string): Promise<string>  {
        console.debug('============= START : getQueryStringResult SiteService ===========');

        const allResults = await SiteService.getPrivateQueryArrayResult(ctx, params, query);
        const formated = JSON.stringify(allResults);

        console.debug('============= END : getQueryStringResult SiteService ===========');
        return formated;
    }

    public static async getPrivateQueryArrayResult(
        ctx: Context,
        params: STARParameters,
        query: string): Promise<any>  {
        console.debug('============= START : getPrivateQueryArrayResult SiteService ===========');

        const collections: string[] = params.values.get(ParametersType.SITE);
        var allResults = [];

        var i=0;
        if (collections) {
            while (i<collections.length) {
                let results = await QueryStateService.getPrivateQueryArrayResult(ctx, query, collections[i]);
                allResults = allResults.concat(results);
                i++;
            }
        }

        console.debug('============= END : getPrivateQueryArrayResult SiteService ===========');
        return allResults;
    }

    //getPrivateDataQueryResultWithPagination doesn't exist in 2022 May the 19th
    // public static async getQueryResultWithPagination(
    //     ctx: Context,
    //     query: string): Promise<Iterators.StateQueryIterator>  {
    //     console.debug('============= START : getQueryResult %s Site ===========', query);

    //     const collection: string = await ParametersController.getParameterValues(ctx, ParametersType.SITE);

    //     const siteAsBytes = await ctx.stub.getPrivateDataQueryResult(collection, query);

    //     console.debug('============= END : getQueryResult %s Site ===========', query);
    //     return siteAsBytes;
    // }

}
