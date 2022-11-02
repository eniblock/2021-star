import { DocType } from '../../enums/DocType';
import { ParametersType } from '../../enums/ParametersType';
import { IdArgument } from '../../model/arguments/idArgument';
import { BalancingDocument } from '../../model/balancingDocument';

import { STARParameters } from '../../model/starParameters';
import { HLFServices } from './HLFservice';
import { QueryStateService } from './QueryStateService';

import { StarPrivateDataService } from './StarPrivateDataService';

export class BalancingDocumentService {

    public static async write(
        params: STARParameters,
        balancingObj: BalancingDocument,
        target: string = ''): Promise<void> {
        params.logger.debug('============= START : write BalancingDocumentService ===========');

        balancingObj.docType = DocType.BALANCING_DOCUMENT;

        await StarPrivateDataService.write(
            params, {id: balancingObj.balancingDocumentMrid, dataObj: balancingObj, collection: target});

        params.logger.debug('=============  END  : write BalancingDocumentService ===========');
    }

    public static async delete(
        params: STARParameters,
        arg: IdArgument): Promise<void> {
        params.logger.debug('============= START : Delete %s BalancingDocumentService ===========', arg.id);

        const collection = await HLFServices.getCollectionOrDefault(params, ParametersType.DATA_TARGET, arg.collection);

        await params.ctx.stub.deletePrivateData(collection, arg.id);

        params.logger.debug('=============  END  : Delete %s BalancingDocumentService ===========', arg.id);
    }

    public static async getQueryArrayResult(
        params: STARParameters,
        query: string,
        target: string = ''): Promise<BalancingDocument[]>  {
        params.logger.debug('============= START : getQueryArrayResult EnergyAccountService ===========');

        let collections: string[];
        if (target && target.length > 0) {
            collections = await HLFServices.getCollectionsOrDefault(params, ParametersType.DATA_TARGET, [target]);
        } else {
            collections = await HLFServices.getCollectionsFromParameters(
                params, ParametersType.DATA_TARGET, ParametersType.ALL);
        }

        const allResults: BalancingDocument[] = [];
        const allResultsId: string[] = [];

        if (collections) {
            for (const collection of collections) {
                const results: BalancingDocument[] =
                    await QueryStateService.getPrivateQueryArrayResult(params, {query, collection});

                for (const result of results) {
                    if (result
                        && result.balancingDocumentMrid
                        && result.balancingDocumentMrid !== ''
                        && !allResultsId.includes(result.balancingDocumentMrid)) {
                            allResultsId.push(result.balancingDocumentMrid);
                            allResults.push(result);
                        }
                }
            }
        }

        params.logger.debug('=============  END  : getQueryArrayResult EnergyAccountService ===========');
        return allResults;
    }

}
