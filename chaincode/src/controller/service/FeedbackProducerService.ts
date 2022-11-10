
import { DocType } from '../../enums/DocType';
import { ParametersType } from '../../enums/ParametersType';

import { DataReference } from '../../model/dataReference';
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
        params.logger.debug
            ('============= START : Delete %s FeedbackProducerService ===========',
                feedbackProducerMrid);

        const collection = await HLFServices.getCollectionOrDefault(params, ParametersType.DATA_TARGET, target);

        await params.ctx.stub.deletePrivateData(collection, feedbackProducerMrid);

        params.logger.debug
            ('=============  END  : Delete %s FeedbackProducerService ===========',
                feedbackProducerMrid);
    }
}
