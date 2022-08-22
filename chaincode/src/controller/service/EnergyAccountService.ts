import { Context } from "fabric-contract-api";
import { DocType } from "../../enums/DocType";
import { ParametersType } from "../../enums/ParametersType";
import { DataReference } from "../../model/dataReference";
import { EnergyAccount } from "../../model/energyAccount";
import { STARParameters } from "../../model/starParameters";
import { HLFServices } from "./HLFservice";
import { QueryStateService } from "./QueryStateService";

export class EnergyAccountService {
    // public static async getRaw(
    //     ctx: Context,
    //     params: STARParameters,
    //     energyAccountMarketDocumentMrid: string): Promise<Uint8Array> {
    //     console.debug('============= START : getRaw %s EnergyAccountService ===========', energyAccountMarketDocumentMrid);

    //     const collections: string[] = params.values.get(ParametersType.ENERGY_ACCOUNT);

    //     var energyAccountAsBytes: Uint8Array = new Uint8Array();
    //     var i=0;

    //     if (collections) {
    //         while (i<collections.length && (!energyAccountAsBytes || energyAccountAsBytes.length === 0)) {
    //             energyAccountAsBytes = await ctx.stub.getPrivateData(collections[i], energyAccountMarketDocumentMrid);
    //             i++;
    //         }
    //     }

    //     if (!energyAccountAsBytes || energyAccountAsBytes.length === 0) {
    //         throw new Error(`Energy Account : ${energyAccountMarketDocumentMrid} does not exist.`);
    //     }

    //     console.debug('============= END : getRaw %s EnergyAccountService ===========', energyAccountMarketDocumentMrid);
    //     return energyAccountAsBytes;
    // }


    public static async getRaw(
        ctx: Context,
        collection: string,
        id: string): Promise<Uint8Array> {
        console.debug('============= START : getRaw %s EnergyAccountService ===========', id);

        let energyAccountAsBytes: Uint8Array;
        try {
            energyAccountAsBytes = await ctx.stub.getPrivateData(collection, id);
        } catch (error) {
            throw new Error(`Energy Account : ${id} does not exist`);
        }
        if (!energyAccountAsBytes || energyAccountAsBytes.length === 0) {
            throw new Error(`Energy Account : ${id} does not exist`);
        }

        console.debug('============= END : getRaw %s EnergyAccountService ===========', id);
        return energyAccountAsBytes;
    }

    private static async getObj(
        ctx: Context,
        params: STARParameters,
        id: string,
        target: string = ''): Promise<EnergyAccount> {

        const collection = await HLFServices.getCollectionOrDefault(params, ParametersType.DATA_TARGET, target);

        var energyAccountAsBytes: Uint8Array = await EnergyAccountService.getRaw(ctx, collection, id);
        var energyAccountObj:EnergyAccount = EnergyAccount.formatString(energyAccountAsBytes.toString());

        return energyAccountObj;
    }


    public static async getObjRefbyId(
        ctx: Context,
        params: STARParameters,
        id: string): Promise<Map<string, DataReference>> {

        // console.info("----------------------------------")
        // console.info("id:",id)
        var result:Map<string, DataReference> = params.getFromMemoryPool(id);

        if (!result) {
            result = new Map();
            const target: string[] = await HLFServices.getCollectionsFromParameters(params, ParametersType.DATA_TARGET, ParametersType.ALL);
            const collections = await HLFServices.getCollectionsOrDefault(params, ParametersType.DATA_TARGET, target);

            // console.info("target:",JSON.stringify(target))
            // console.info("collections:",JSON.stringify(collections))
            // console.info("- - - - - - - - - - - - - - - - -")

            if (collections) {
                for (const collection of collections) {
                    let collectionResult:EnergyAccount;
                    // console.info("collection:",collection)
                    try {
                        collectionResult = await EnergyAccountService.getObj(ctx, params, id, collection);
                    } catch (error) {
                        if (error && error.message && error.message.includes("NON-JSON")) {
                            throw error;
                        }
                    }

                    // console.info("collectionResult:",JSON.stringify(collectionResult))

                    if (collectionResult && collectionResult.energyAccountMarketDocumentMrid == id) {
                        const elt  = {
                            collection: collection,
                            docType: DocType.ENERGY_ACCOUNT,
                            data: collectionResult
                        }
                        result.set(collection, elt);
                    }

                    // console.info("result:",JSON.stringify([...result]))
                    // console.info("- - - - - - - - - - - - - - - - -")
                }
            }
        }

        // console.info("result:",JSON.stringify([...result]))
        // console.info("- - - - - - - - - - - - - - - - -")

        if (!result || ! result.keys().next().value) {
            throw new Error(`Site : ${id} does not exist`);
        }

        // console.info("----------------------------------")
        return result;
    }




    public static async write(
        ctx: Context,
        params: STARParameters,
        energyObj: EnergyAccount,
        target: string = ''): Promise<void> {

        console.debug('============= START : Write %s EnergyAccountService ===========', energyObj.energyAccountMarketDocumentMrid);

        const collection = await HLFServices.getCollectionOrDefault(params, ParametersType.DATA_TARGET, target);

        energyObj.docType = DocType.ENERGY_ACCOUNT;
        await ctx.stub.putPrivateData(collection, energyObj.energyAccountMarketDocumentMrid, Buffer.from(JSON.stringify(energyObj)));

        console.debug('============= END : Write %s EnergyAccountService ===========', energyObj.energyAccountMarketDocumentMrid);
    }


    public static async getQueryArrayResult(
        ctx: Context,
        params: STARParameters,
        query: string,
        target: string = ''): Promise<any[]>  {

        console.debug('============= START : getQueryArrayResult EnergyAccountService ===========');

        let collections: string[];
        if (target && target.length > 0) {
            collections = await HLFServices.getCollectionsOrDefault(params, ParametersType.DATA_TARGET, [target]);
        } else {
            collections = await HLFServices.getCollectionsFromParameters(params, ParametersType.DATA_TARGET, ParametersType.ALL);
        }

        var allResults = [];

        var i=0;
        if (collections) {
            while (i<collections.length) {
                let results = await QueryStateService.getPrivateQueryArrayResult(ctx, query, collections[i]);
                allResults = allResults.concat(results);
                i++;
            }
        }

        console.debug('============= END : getQueryArrayResult EnergyAccountService ===========');
        return allResults;
    }

    // public static async getQueryStringResult(
    //     ctx: Context,
    //     params: STARParameters,
    //     query: string): Promise<string>  {

    //     console.debug('============= START : getQueryStringResult EnergyAccountService ===========');

    //     const allResults = await EnergyAccountService.getQueryArrayResult(ctx, params, query);
    //     const formated = JSON.stringify(allResults);

    //     console.debug('============= END : getQueryStringResult EnergyAccountService ===========');
    //     return formated;
    // }



}
