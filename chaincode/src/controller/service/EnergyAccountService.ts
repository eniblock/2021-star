import { DocType } from "../../enums/DocType";
import { ParametersType } from "../../enums/ParametersType";

import { EnergyAccount } from "../../model/energyAccount";
import { STARParameters } from "../../model/starParameters";

import { HLFServices } from "./HLFservice";
import { QueryStateService } from "./QueryStateService";
import { StarPrivateDataService } from "./StarPrivateDataService";

export class EnergyAccountService {


    public static async write(
        params: STARParameters,
        energyObj: EnergyAccount,
        target: string = ''): Promise<void> {

        energyObj.docType = DocType.ENERGY_ACCOUNT;
        await StarPrivateDataService.write(params, { id: energyObj.energyAccountMarketDocumentMrid, dataObj: energyObj, collection: target});
    }


    public static async getQueryArrayResult(
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
                let results = await QueryStateService.getPrivateQueryArrayResult(params, {query:query, collection: collections[i]});
                allResults = allResults.concat(results);
                i++;
            }
        }

        console.debug('============= END : getQueryArrayResult EnergyAccountService ===========');
        return allResults;
    }

}
