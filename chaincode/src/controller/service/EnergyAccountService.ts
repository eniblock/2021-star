import { Context } from "fabric-contract-api";
import { DocType } from "../../enums/DocType";
import { ParametersType } from "../../enums/ParametersType";
import { EnergyAccount } from "../../model/energyAccount";
import { STARParameters } from "../../model/starParameters";
import { QueryStateService } from "./QueryStateService";

export class EnergyAccountService {
    public static async getRaw(
        ctx: Context,
        params: STARParameters,
        energyAccountMarketDocumentMrid: string): Promise<Uint8Array> {
        console.debug('============= START : getRaw %s EnergyAccountService ===========', energyAccountMarketDocumentMrid);

        const collections: string[] = params.values.get(ParametersType.ENERGY_ACCOUNT);

        var energyAccountAsBytes: Uint8Array = new Uint8Array();
        var i=0;

        if (collections) {
            while (i<collections.length && (!energyAccountAsBytes || energyAccountAsBytes.length === 0)) {
                energyAccountAsBytes = await ctx.stub.getPrivateData(collections[i], energyAccountMarketDocumentMrid);
                i++;
            }
        }

        if (!energyAccountAsBytes || energyAccountAsBytes.length === 0) {
            throw new Error(`Energy Account : ${energyAccountMarketDocumentMrid} does not exist.`);
        }

        console.debug('============= END : getRaw %s EnergyAccountService ===========', energyAccountMarketDocumentMrid);
        return energyAccountAsBytes;
    }


    public static async write(
        ctx: Context,
        params: STARParameters,
        energyObj: EnergyAccount): Promise<void> {

        console.debug('============= START : Write %s EnergyAccountService ===========', energyObj.energyAccountMarketDocumentMrid);

        const collections: string[] = params.values.get(ParametersType.ENERGY_ACCOUNT);
        energyObj.docType = DocType.ENERGY_ACCOUNT;

        await ctx.stub.putPrivateData(collections[0], energyObj.energyAccountMarketDocumentMrid, Buffer.from(JSON.stringify(energyObj)));

        console.debug('============= END : Write %s EnergyAccountService ===========', energyObj.energyAccountMarketDocumentMrid);
    }


    public static async getQueryArrayResult(
        ctx: Context,
        params: STARParameters,
        query: string): Promise<any[]>  {

        console.debug('============= START : getQueryArrayResult EnergyAccountService ===========');

        const collections: string[] = params.values.get(ParametersType.ENERGY_ACCOUNT);
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

    public static async getQueryStringResult(
        ctx: Context,
        params: STARParameters,
        query: string): Promise<string>  {

        console.debug('============= START : getQueryStringResult EnergyAccountService ===========');

        const allResults = await EnergyAccountService.getQueryArrayResult(ctx, params, query);
        const formated = JSON.stringify(allResults);

        console.debug('============= END : getQueryStringResult EnergyAccountService ===========');
        return formated;
    }



}
