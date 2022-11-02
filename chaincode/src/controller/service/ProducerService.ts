import { DocType } from '../../enums/DocType';

import { Producer } from '../../model/producer';
import { STARParameters } from '../../model/starParameters';

import { StarDataService } from './StarDataService';

export class ProducerService {

    // const prodObj = await StarDataService.getObj(ctx, params, prodId, DocType.PRODUCER);

    public static async write(
        params: STARParameters,
        producerObj: Producer): Promise<void> {

        producerObj.docType = DocType.PRODUCER;
        await StarDataService.write(params, {id: producerObj.producerMarketParticipantMrid, dataObj: producerObj});
    }

}
