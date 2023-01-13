import { DocType } from '../enums/DocType';
import { OrganizationTypeMsp } from '../enums/OrganizationMspType';
import { ParametersType } from '../enums/ParametersType';

import { Producer } from '../model/producer';
import { STARParameters } from '../model/starParameters';

import { ProducerService } from './service/ProducerService';
import { QueryStateService } from './service/QueryStateService';
import { StarDataService } from './service/StarDataService';

export class ProducerController {

    public static async createProducer(
        params: STARParameters,
        inputStr: string) {
        params.logger.info('============= START : createProducer ProducerController ===========');

        const producerObj = Producer.formatString(inputStr);

        await ProducerService.write(params, producerObj);

        params.logger.info('=============  END  : createProducer ProducerController ===========');
    }

    public static async createProducerList(
        params: STARParameters,
        inputStr: string) {
        params.logger.info('============= START : createProducerList ProducerController ===========');

        const producerList: Producer[] = Producer.formatListString(inputStr);

        if (producerList) {
            for (const producerObj of producerList) {
                await ProducerService.write(params, producerObj);
            }
        }

        params.logger.info('=============  END  : createProducerList ProducerController ===========');
    }

    public static async updateProducer(
        params: STARParameters,
        inputStr: string) {
        params.logger.info('============= START : updateProducer ProducerController ===========');

        const identity = params.values.get(ParametersType.IDENTITY);
        if (identity !== OrganizationTypeMsp.RTE && identity !== OrganizationTypeMsp.ENEDIS) {
            throw new Error(`Organisation, ${identity} does not have rights to update a producer`);
        }

        const producerObj = Producer.formatString(inputStr);

        await StarDataService.getObj(
            params, {id: producerObj.producerMarketParticipantMrid, docType: DocType.PRODUCER});

        await ProducerService.write(params, producerObj);

        params.logger.info('=============  END  : updateProducer ProducerController ===========');
    }

    public static async updateProducerList(
        params: STARParameters,
        inputStr: string) {
        params.logger.info('============= START : updateProducerList ProducerController ===========');

        const identity = params.values.get(ParametersType.IDENTITY);
        if (identity !== OrganizationTypeMsp.RTE && identity !== OrganizationTypeMsp.ENEDIS) {
            throw new Error(`Organisation, ${identity} does not have rights to update a producer`);
        }

        const producerList: Producer[] = Producer.formatListString(inputStr);

        if (producerList) {
            for (const producerObj of producerList) {
                await StarDataService.getObj(
                    params, {id: producerObj.producerMarketParticipantMrid, docType: DocType.PRODUCER});
                await ProducerService.write(params, producerObj);
            }
        }

        params.logger.info('=============  END  : updateProducerList ProducerController ===========');
    }

    public static async getProducerById(
        params: STARParameters,
        prodId: string): Promise<string> {
        params.logger.info('============= START : get Producer By Id %s ===========', prodId);

        const prodObj = await StarDataService.getObj(params, {id: prodId, docType: DocType.PRODUCER});

        params.logger.info('============= END   : get Producer By Id %s ===========', prodId);

        return JSON.stringify(prodObj);
    }

    public static async getAllProducer( params: STARParameters): Promise<string> {
        params.logger.info('============= START : getAllProducer ProducerController ===========');

        const arrayResult = await QueryStateService.getAllStates(params, DocType.PRODUCER);

        params.logger.info('=============  END  : getAllProducer ProducerController ===========');

        return JSON.stringify(arrayResult);
    }

    public static async getProducerByName(
        params: STARParameters,
        producerMarketParticipantName: string): Promise<Producer[]> {
        params.logger.debug('============= START : getProducerByName %s ===========', producerMarketParticipantName);

        const args: string[] = [];
        args.push(`"producerMarketParticipantName":"${producerMarketParticipantName}"`);

        const query = await QueryStateService.buildQuery({documentType: DocType.PRODUCER, queryArgs: args});

        const allResults = await QueryStateService.getQueryArrayResult(params, {query});

        params.logger.debug('============= END : getProducerByName %s ===========', producerMarketParticipantName);

        return allResults;
    }

}
