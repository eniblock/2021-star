import { DocType } from '../../enums/DocType';
import { ParametersType } from '../../enums/ParametersType';

import { EnergyAccount } from '../../model/energyAccount';
import { STARParameters } from '../../model/starParameters';

import { HLFServices } from './HLFservice';
import { QueryStateService } from './QueryStateService';
import { StarPrivateDataService } from './StarPrivateDataService';

export class EnergyAccountService {

    public static async write(
        params: STARParameters,
        energyObj: EnergyAccount,
        target: string = ''): Promise<void> {
        params.logger.debug('============= START : write EnergyAccountService ===========');

        energyObj.docType = DocType.ENERGY_ACCOUNT;
        await StarPrivateDataService.write(
            params, { id: energyObj.energyAccountMarketDocumentMrid, dataObj: energyObj, collection: target});

        params.logger.debug('=============  END  : write EnergyAccountService ===========');
    }

    public static async getQueryArrayResult(
        params: STARParameters,
        query: string,
        target: string = ''): Promise<EnergyAccount[]>  {
        params.logger.debug('============= START : getQueryArrayResult EnergyAccountService ===========');

        let collections: string[];
        if (target && target.length > 0) {
            collections = await HLFServices.getCollectionsOrDefault(params, ParametersType.DATA_TARGET, [target]);
        } else {
            collections = await HLFServices.getCollectionsFromParameters(
                params, ParametersType.DATA_TARGET, ParametersType.ALL);
        }

        const allResults: EnergyAccount[] = [];
        const allResultsId: string[] = [];

        if (collections) {
            for (const collection of collections) {
                const results = await QueryStateService.getPrivateQueryArrayResult(
                    params, {query, collection});

                for (const result of results) {
                    if (result
                        && result.energyAccountMarketDocumentMrid
                        && result.energyAccountMarketDocumentMrid !== ''
                        && !allResultsId.includes(result.energyAccountMarketDocumentMrid)) {
                            allResultsId.push(result.energyAccountMarketDocumentMrid);
                            allResults.push(result);
                        }
                }
            }
        }

        params.logger.debug('=============  END  : getQueryArrayResult EnergyAccountService ===========');
        return allResults;
    }

}
