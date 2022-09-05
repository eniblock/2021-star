import { DocType } from "../../enums/DocType";
import { ParametersType } from "../../enums/ParametersType";
import { IdArgument } from "../../model/arguments/idArgument";
import { queryArgument } from "../../model/arguments/queryArgument";

import { EnergyAmount } from '../../model/energyAmount';
import { STARParameters } from "../../model/starParameters";

import { HLFServices } from "./HLFservice";
import { QueryStateService } from "./QueryStateService";
import { StarPrivateDataService } from "./StarPrivateDataService";

export class EnergyAmountService {
    public static async write(
        params: STARParameters,
        energyObj: EnergyAmount,
        target: string = ''): Promise<void> {
        params.logger.debug('============= START : write EnergyAmountService ===========');

        energyObj.docType = DocType.ENERGY_AMOUNT;
        await StarPrivateDataService.write(params, {id: energyObj.energyAmountMarketDocumentMrid, dataObj: energyObj, collection: target});

        params.logger.debug('=============  END  : write EnergyAmountService ===========');
    }



    public static async delete(
        params: STARParameters,
        arg: IdArgument): Promise<void> {
        params.logger.debug('============= START : Delete %s EnergyAmountService ===========', arg.id);

        const collection = await HLFServices.getCollectionOrDefault(params, ParametersType.DATA_TARGET, arg.collection);

        await params.ctx.stub.deletePrivateData(collection, arg.id);

        params.logger.debug('=============  END  : Delete %s EnergyAmountService ===========', arg.id);
    }



    public static async getQueryArrayResult(
        params: STARParameters,
        arg: queryArgument): Promise<any[]>  {

        params.logger.debug('============= START : getQueryArrayResult EnergyAmountService ===========');

        let collections: string[];
        if (arg.collection && arg.collection.length > 0) {
            collections = await HLFServices.getCollectionsOrDefault(params, ParametersType.DATA_TARGET, [arg.collection]);
        } else {
            collections = await HLFServices.getCollectionsFromParameters(params, ParametersType.DATA_TARGET, ParametersType.ALL);
        }
        var allResults = [];

        var i=0;
        if (collections) {
            while (i<collections.length) {
                let results = await QueryStateService.getPrivateQueryArrayResult(params, { query: arg.query, collection: collections[i]});
                allResults = allResults.concat(results);
                i++;
            }
        }

        params.logger.debug('=============  END  : getQueryArrayResult EnergyAmountService ===========');

        return allResults;
    }

}
