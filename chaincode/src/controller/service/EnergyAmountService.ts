import { Context } from "fabric-contract-api";
import { DocType } from "../../enums/DocType";
import { ParametersType } from "../../enums/ParametersType";
import { DataReference } from "../../model/dataReference";
import { EnergyAmount } from '../../model/energyAmount';
import { STARParameters } from "../../model/starParameters";
import { HLFServices } from "./HLFservice";
import { QueryStateService } from "./QueryStateService";

export class EnergyAmountService {
    public static async getRaw(
        ctx: Context,
        collection: string,
        id: string): Promise<Uint8Array> {
        console.debug('============= START : getRaw %s ProducerService ===========', id);

        let energyAmountAsBytes: Uint8Array;
        try {
            energyAmountAsBytes = await ctx.stub.getPrivateData(collection, id);
        } catch (error) {
            throw new Error(`Energy Amount : ${id} does not exist`);
        }
        if (!energyAmountAsBytes || energyAmountAsBytes.length === 0) {
            throw new Error(`Energy Amount : ${id} does not exist`);
        }

        console.debug('============= END : getRaw %s ProducerService ===========', id);
        return energyAmountAsBytes;
    }




    private static async getObj(
        ctx: Context,
        params: STARParameters,
        id: string,
        target: string = ''): Promise<EnergyAmount> {

        const collection = await HLFServices.getCollectionOrDefault(params, ParametersType.DATA_TARGET, target);

        const energyAmountAsBytes: Uint8Array = await EnergyAmountService.getRaw(ctx, collection, id);
        const energyAmountObj:EnergyAmount = EnergyAmount.formatString(energyAmountAsBytes.toString());

        return energyAmountObj;
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
                    let collectionResult:EnergyAmount;
                    // console.info("collection:",collection)
                    try {
                        collectionResult = await EnergyAmountService.getObj(ctx, params, id, collection);
                    } catch (error) {
                        if (error && error.message && error.message.includes("NON-JSON")) {
                            throw error;
                        }
                    }

                    // console.info("collectionResult:",JSON.stringify(collectionResult))

                    if (collectionResult && collectionResult.energyAmountMarketDocumentMrid == id) {
                        const elt  = {
                            collection: collection,
                            docType: DocType.ENERGY_AMOUNT,
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
        energyObj: EnergyAmount,
        target: string = ''): Promise<void> {

        console.debug('============= START : Write %s EnergyAmountService ===========', energyObj.energyAmountMarketDocumentMrid);

        const collection = await HLFServices.getCollectionOrDefault(params, ParametersType.DATA_TARGET, target);
        energyObj.docType = DocType.ENERGY_AMOUNT;

        await ctx.stub.putPrivateData(collection, energyObj.energyAmountMarketDocumentMrid, Buffer.from(JSON.stringify(energyObj)));

        console.debug('============= END : Write %s EnergyAmountService ===========', energyObj.energyAmountMarketDocumentMrid);
    }



    public static async delete(
        ctx: Context,
        params: STARParameters,
        id: string,
        target: string = ''): Promise<void> {
        console.debug('============= START : Delete %s EnergyAmountService ===========', id);

        const collection = await HLFServices.getCollectionOrDefault(params, ParametersType.DATA_TARGET, target);

        await ctx.stub.deletePrivateData(collection, id);

        console.debug('============= END : Delete %s EnergyAmountService ===========', id);
    }



    public static async getQueryArrayResult(
        ctx: Context,
        params: STARParameters,
        query: string,
        target: string = ''): Promise<any[]>  {

        console.debug('============= START : getQueryArrayResult EnergyAmountService ===========');

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

        console.debug('============= END : getQueryArrayResult EnergyAmountService ===========');

        return allResults;
    }

}
