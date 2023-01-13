
import { DocType } from '../../enums/DocType';
import { ParametersType } from '../../enums/ParametersType';

import { FeedbackProducer } from '../../model/feedbackProducer';
import { STARParameters } from '../../model/starParameters';

import { HLFServices } from './HLFservice';
import { QueryStateService } from './QueryStateService';
import { StarPrivateDataService } from './StarPrivateDataService';


export class FeedbackProducerService {
    public static async write(
        params: STARParameters,
        feedbackProducerObj: FeedbackProducer,
        target: string = ''): Promise<void> {
        params.logger.debug('============= START : write FeedbackProducerService ===========');

        feedbackProducerObj.docType = DocType.FEEDBACK_PRODUCER;
        await StarPrivateDataService.write(
            params, {id: feedbackProducerObj.feedbackProducerMrid, dataObj: feedbackProducerObj, collection: target});

        params.logger.debug('=============  END  : write FeedbackProducerService ===========');
    }



    public static async delete(
        params: STARParameters,
        feedbackProducerMrid: string,
        target: string): Promise<void> {
        params.logger.debug('============= START : Delete %s FeedbackProducerService ===========',
                feedbackProducerMrid);

        const collection = await HLFServices.getCollectionOrDefault(params, ParametersType.DATA_TARGET, target);

        await params.ctx.stub.deletePrivateData(collection, feedbackProducerMrid);

        params.logger.debug('=============  END  : Delete %s FeedbackProducerService ===========',
                feedbackProducerMrid);
    }


    public static async getQueryArrayResult(
        params: STARParameters,
        query: string,
        target: string = ''): Promise<FeedbackProducer[]>  {
        params.logger.debug('============= START : getQueryArrayResult FeedbackProducerService ===========');

        let collections: string[];
        if (target && target.length > 0) {
            collections = await HLFServices.getCollectionsOrDefault(params, ParametersType.DATA_TARGET, [target]);
        } else {
            collections = await HLFServices.getCollectionsFromParameters(
                params, ParametersType.DATA_TARGET, ParametersType.ALL);
        }

        const allResults: FeedbackProducer[] = [];
        const allResultsId: string[] = [];

        if (collections) {
            for (const collection of collections) {
                const results:FeedbackProducer[] = await QueryStateService.getPrivateQueryArrayResult(
                    params, {query, collection});

                for (const result of results) {
                    if (result
                        && result.feedbackProducerMrid
                        && result.feedbackProducerMrid !== ''
                        && !allResultsId.includes(result.feedbackProducerMrid)) {
                            allResultsId.push(result.feedbackProducerMrid);
                            allResults.push(result);
                        }
                }
            }
        }

        params.logger.debug('=============  END  : getQueryArrayResult FeedbackProducerService ===========');
        return allResults;
    }
}
