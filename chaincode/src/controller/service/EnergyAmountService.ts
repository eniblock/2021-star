import { Context } from "fabric-contract-api";
import { DocType } from "../../enums/DocType";
import { ParametersType } from "../../enums/ParametersType";
import { EnergyAmount } from '../../model/energyAmount';
import { STARParameters } from "../../model/starParameters";
import { QueryStateService } from "./QueryStateService";

export class EnergyAmountService {
    public static async getRaw(
        ctx: Context,
        params: STARParameters,
        energyAmountMarketDocumentMrid: string): Promise<Uint8Array> {
        console.debug('============= START : getRaw %s ProducerService ===========', energyAmountMarketDocumentMrid);

        const collections: string[] = params.values.get(ParametersType.ENERGY_AMOUNT);

        var energyAmountAsBytes: Uint8Array = new Uint8Array();
        var i=0;

        if (collections) {
            while (i<collections.length && (!energyAmountAsBytes || energyAmountAsBytes.length === 0)) {
                energyAmountAsBytes = await ctx.stub.getPrivateData(collections[i], energyAmountMarketDocumentMrid);
                i++;
            }
        }

        if (!energyAmountAsBytes || energyAmountAsBytes.length === 0) {
            throw new Error(`Energy Amount : ${energyAmountMarketDocumentMrid} does not exist.`);
        }

        console.debug('============= END : getRaw %s ProducerService ===========', energyAmountMarketDocumentMrid);
        return energyAmountAsBytes;
    }



    public static async getObj(
        ctx: Context,
        params: STARParameters,
        id: string): Promise<EnergyAmount> {

        const energyAmountAsBytes: Uint8Array = await EnergyAmountService.getRaw(ctx, params, id);
        var energyAmountObj:EnergyAmount = null;
        if (energyAmountAsBytes) {
            try {
                energyAmountObj = JSON.parse(energyAmountAsBytes.toString());
            } catch (error) {
                throw new Error(`ERROR Energy Amount -> Input string NON-JSON value`);
            }
        }
        return energyAmountObj;
    }


    public static async write(
        ctx: Context,
        params: STARParameters,
        energyObj: EnergyAmount): Promise<void> {

        console.debug('============= START : Write %s EnergyAmountService ===========', energyObj.energyAmountMarketDocumentMrid);

        const collections: string[] = params.values.get(ParametersType.ENERGY_AMOUNT);
        energyObj.docType = DocType.ENERGY_AMOUNT;

        await ctx.stub.putPrivateData(collections[0], energyObj.energyAmountMarketDocumentMrid, Buffer.from(JSON.stringify(energyObj)));

        console.debug('============= END : Write %s EnergyAmountService ===========', energyObj.energyAmountMarketDocumentMrid);
    }


    public static async getQueryArrayResult(
        ctx: Context,
        params: STARParameters,
        query: string): Promise<any[]>  {

        console.debug('============= START : getQueryArrayResult EnergyAmountService ===========');

        const collections: string[] = params.values.get(ParametersType.ENERGY_AMOUNT);
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
