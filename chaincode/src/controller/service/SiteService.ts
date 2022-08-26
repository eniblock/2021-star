import { Context } from "fabric-contract-api";
import { STARParameters } from '../../model/starParameters';
import { ParametersType } from "../../enums/ParametersType";
import { Site } from "../../model/site";
import { QueryStateService } from "./QueryStateService";
import { DocType } from "../../enums/DocType";
import { HLFServices } from "./HLFservice";
import { DataReference } from "../../model/dataReference";

export class SiteService {
    public static async getRaw(
        ctx: Context,
        collection: string,
        id: string): Promise<Uint8Array> {
        console.debug('============= START : getRaw %s SiteService ===========', id);

        let siteAsBytes: Uint8Array;
        try {
            siteAsBytes = await ctx.stub.getPrivateData(collection, id);
        } catch (error) {
            throw new Error(`Site : ${id} does not exist`);
        }
        if (!siteAsBytes || siteAsBytes.length === 0) {
            throw new Error(`Site : ${id} does not exist`);
        }

        console.debug('============= END : getRaw %s SiteService ===========', id);
        return siteAsBytes;
    }

    public static async getObj(
        ctx: Context,
        params: STARParameters,
        id: string,
        target: string = ''): Promise<Site> {

        const collection = await HLFServices.getCollectionOrDefault(params, ParametersType.DATA_TARGET, target);

        var siteAsBytes: Uint8Array = await SiteService.getRaw(ctx, collection, id);
        var siteObj:Site = Site.formatString(siteAsBytes.toString());

        return siteObj;
    }


    public static async getObjRefbyId(
        ctx: Context,
        params: STARParameters,
        id: string): Promise<Map<string, DataReference>> {

        console.info("----------------------------------")
        console.info("id:",id)
        var result:Map<string, DataReference> = params.getFromMemoryPool(id);

        if (!result) {
            result = new Map();
            const target: string[] = await HLFServices.getCollectionsFromParameters(params, ParametersType.DATA_TARGET, ParametersType.ALL);
            const collections = await HLFServices.getCollectionsOrDefault(params, ParametersType.DATA_TARGET, target);

            console.info("target:",JSON.stringify(target))
            console.info("collections:",JSON.stringify(collections))
            console.info("- - - - - - - - - - - - - - - - -")

            if (collections) {
                for (const collection of collections) {
                    let collectionResult:Site;
                    console.info("collection:",collection)
                    try {
                        collectionResult = await SiteService.getObj(ctx, params, id, collection);
                    } catch (error) {
                        if (error && error.message && error.message.includes("NON-JSON")) {
                            throw error;
                        }
                    }

                    console.info("collectionResult:",JSON.stringify(collectionResult))

                    if (collectionResult && collectionResult.meteringPointMrid == id) {
                        const elt  = {
                            collection: collection,
                            docType: DocType.SITE,
                            data: collectionResult
                        }
                        result.set(collection, elt);
                    }

                    console.info("result:",JSON.stringify([...result]))
                    console.info("- - - - - - - - - - - - - - - - -")
                }
            }
        }

        console.info("result:",JSON.stringify([...result]))
        console.info("- - - - - - - - - - - - - - - - -")

        if (!result || ! result.keys().next().value) {
            throw new Error(`Site : ${id} does not exist`);
        }

        console.info("----------------------------------")
        return result;
    }



    public static async write(
        ctx: Context,
        params: STARParameters,
        siteInput: Site,
        target: string = ''): Promise<void> {
        console.debug('============= START : Write %s SiteService ===========', siteInput.meteringPointMrid);

        const collection = await HLFServices.getCollectionOrDefault(params, ParametersType.DATA_TARGET, target);

        siteInput.docType = DocType.SITE;
        await ctx.stub.putPrivateData(collection, siteInput.meteringPointMrid, Buffer.from(JSON.stringify(siteInput)));

        console.debug('============= END : Write %s (%s) SiteService ===========', siteInput.meteringPointMrid, collection);
    }

    // public static async getQueryResult(
    //     ctx: Context,
    //     query: string): Promise<Iterators.StateQueryIterator>  {
    //     console.debug('============= START : getQueryResult %s SiteService ===========', query);

    //     const collection: string = await ParametersController.getParameterValues(ctx, ParametersType.DATA_TARGET);
    //     const iterator = await ctx.stub.getPrivateDataQueryResult(collection, query);

    //     console.debug('============= END : getQueryResult %s SiteService ===========', query);
    //     return iterator;
    // }


    public static async getQueryStringResult(
        ctx: Context,
        params: STARParameters,
        query: string): Promise<string>  {
        console.debug('============= START : getQueryStringResult SiteService ===========');

        const allResults = await SiteService.getQueryArrayResult(ctx, params, query);
        const formated = JSON.stringify(allResults);

        console.debug('============= END : getQueryStringResult SiteService ===========');
        return formated;
    }

    public static async getQueryArrayResult(
        ctx: Context,
        params: STARParameters,
        query: string): Promise<any>  {
        console.debug('============= START : getPrivateQueryArrayResult SiteService ===========');

        const collections: string[] = await HLFServices.getCollectionsFromParameters(params, ParametersType.DATA_TARGET, ParametersType.ALL);
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

    //     const collection: string = await ParametersController.getParameterValues(ctx, ParametersType.DATA_TARGET);

    //     const siteAsBytes = await ctx.stub.getPrivateDataQueryResult(collection, query);

    //     console.debug('============= END : getQueryResult %s Site ===========', query);
    //     return siteAsBytes;
    // }

}
