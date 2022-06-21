import { Context } from "fabric-contract-api";
import { DocType } from "../../enums/DocType";
import { ParametersType } from "../../enums/ParametersType";
import { EnergyAccount } from "../../model/energyAccount";
import { STARParameters } from "../../model/starParameters";
import { QueryStateService } from "./QueryStateService";

export class ReferenceEnergyAccountService {
    public static async write(
        ctx: Context,
        params: STARParameters,
        energyObj: EnergyAccount): Promise<void> {
        console.debug('============= START : Write %s ReferenceEnergyAccountService ===========', energyObj.energyAccountMarketDocumentMrid);

        const collections: string[] = params.values.get(ParametersType.REFERENCE_ENERGY_ACCOUNT);
        energyObj.docType = DocType.REFERENCE_ENERGY_ACCOUNT;

        await ctx.stub.putPrivateData(collections[0], energyObj.energyAccountMarketDocumentMrid, Buffer.from(JSON.stringify(energyObj)));

        console.debug('============= END : Write %s (%s) ReferenceEnergyAccountService ===========', energyObj.energyAccountMarketDocumentMrid);
    }

    public static async getQueryArrayResult(
        ctx: Context,
        params: STARParameters,
        query: string): Promise<any[]>  {

        console.debug('============= START : getQueryArrayResult ReferenceEnergyAccountService ===========');

        const collections: string[] = params.values.get(ParametersType.REFERENCE_ENERGY_ACCOUNT);
        var allResults = [];

        var i=0;
        if (collections) {
            while (i<collections.length) {
                let results = await QueryStateService.getPrivateQueryArrayResult(ctx, query, collections[i]);
                allResults = allResults.concat(results);
                i++;
            }
        }

        console.debug('============= END : getQueryArrayResult ReferenceEnergyAccountService ===========');
        return allResults;
    }

    public static async getQueryStringResult(
        ctx: Context,
        params: STARParameters,
        query: string): Promise<string>  {

        console.debug('============= START : getQueryStringResult ReferenceEnergyAccountService ===========');

        const allResults = await ReferenceEnergyAccountService.getQueryArrayResult(ctx, params, query);
        const formated = JSON.stringify(allResults);

        console.debug('============= END : getQueryStringResult ReferenceEnergyAccountService ===========');
        return formated;
    }


}
