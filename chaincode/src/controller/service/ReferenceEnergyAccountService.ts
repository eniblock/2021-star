import { DocType } from '../../enums/DocType';
import { ParametersType } from '../../enums/ParametersType';

import { EnergyAccount } from '../../model/energyAccount';
import { STARParameters } from '../../model/starParameters';

import { HLFServices } from './HLFservice';
import { QueryStateService } from './QueryStateService';

export class ReferenceEnergyAccountService {

    public static async write(
        params: STARParameters,
        energyObj: EnergyAccount,
        target: string = ''): Promise<void> {
        params.logger.debug('============= START : Write %s ReferenceEnergyAccountService ===========',
            energyObj.energyAccountMarketDocumentMrid);

        const collection = await HLFServices.getCollectionOrDefault(params, ParametersType.DATA_TARGET, target);

        energyObj.docType = DocType.REFERENCE_ENERGY_ACCOUNT;
        await params.ctx.stub.putPrivateData(
            collection, energyObj.energyAccountMarketDocumentMrid, Buffer.from(JSON.stringify(energyObj)));

        params.logger.debug('=============  END  : Write %s (%s) ReferenceEnergyAccountService ===========',
            energyObj.energyAccountMarketDocumentMrid);
    }

    public static async getQueryArrayResult(
        params: STARParameters,
        query: string,
        target: string = ''): Promise<any[]>  {

        params.logger.debug('============= START : getQueryArrayResult ReferenceEnergyAccountService ===========');

        let collections: string[];
        if (target && target.length > 0) {
            collections = await HLFServices.getCollectionsOrDefault(params, ParametersType.DATA_TARGET, [target]);
        } else {
            collections =
                await HLFServices.getCollectionsFromParameters(params, ParametersType.DATA_TARGET, ParametersType.ALL);
        }

        let allResults = [];

        if (collections) {
            for (const collection of collections) {
                const results =
                    await QueryStateService.getPrivateQueryArrayResult(params, { query, collection});
                allResults = allResults.concat(results);
            }
        }

        params.logger.debug('=============  END  : getQueryArrayResult ReferenceEnergyAccountService ===========');
        return allResults;
    }

    public static async getQueryStringResult(
        params: STARParameters,
        query: string): Promise<string>  {

        params.logger.debug('============= START : getQueryStringResult ReferenceEnergyAccountService ===========');

        const allResults = await ReferenceEnergyAccountService.getQueryArrayResult(params, query);
        const formated = JSON.stringify(allResults);

        params.logger.debug('=============  END  : getQueryStringResult ReferenceEnergyAccountService ===========');
        return formated;
    }

}
