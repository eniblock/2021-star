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

        // const identity = params.values.get(ParametersType.IDENTITY);
        // if (identity !== OrganizationTypeMsp.RTE && identity !== OrganizationTypeMsp.ENEDIS) {
        //     throw new Error(`Organisation, ${identity} does not have write access to create a producer`);
        // }

        const producerObj = Producer.formatString(inputStr);

        await ProducerService.write(params, producerObj);

    }


    public static async createProducerList(
        params: STARParameters,
        inputStr: string) {

        // const identity = params.values.get(ParametersType.IDENTITY);
        // if (identity !== OrganizationTypeMsp.RTE && identity !== OrganizationTypeMsp.ENEDIS) {
        //     throw new Error(`Organisation, ${identity} does not have write access to create a producer`);
        // }

        const producerList: Producer[] = Producer.formatListString(inputStr);

        if (producerList) {
            for (var producerObj of producerList) {
                await ProducerService.write(params, producerObj);
            }
        }

    }


    public static async updateProducer(
        params: STARParameters,
        inputStr: string) {

        const identity = params.values.get(ParametersType.IDENTITY);
        if (identity !== OrganizationTypeMsp.RTE && identity !== OrganizationTypeMsp.ENEDIS) {
            throw new Error(`Organisation, ${identity} does not have write access to update a producer`);
        }

        const producerObj = Producer.formatString(inputStr);

        await StarDataService.getObj(params, {id: producerObj.producerMarketParticipantMrid, docType: DocType.PRODUCER});

        await ProducerService.write(params, producerObj);

    }


    public static async updateProducerList(
        params: STARParameters,
        inputStr: string) {

        const identity = params.values.get(ParametersType.IDENTITY);
        if (identity !== OrganizationTypeMsp.RTE && identity !== OrganizationTypeMsp.ENEDIS) {
            throw new Error(`Organisation, ${identity} does not have write access to update a producer`);
        }

        const producerList: Producer[] = Producer.formatListString(inputStr);

        if (producerList) {
            for (var producerObj of producerList) {
                await StarDataService.getObj(params, {id: producerObj.producerMarketParticipantMrid, docType: DocType.PRODUCER});
                await ProducerService.write(params, producerObj);
            }
        }

    }





    public static async getProducerById(
        params: STARParameters,
        prodId: string): Promise<string> {

        console.debug('============= START : Query %s Producer Market Participant ===========', prodId);
        const prodObj = await StarDataService.getObj(params, {id: prodId, docType: DocType.PRODUCER});
        console.debug('============= END   : Query %s Producer Market Participant ===========', prodId);
        return JSON.stringify(prodObj);
    }


    public static async getAllProducer( params: STARParameters): Promise<string> {
        return await QueryStateService.getAllStates(params, DocType.PRODUCER);
    }


    public static async getProducerByName(
        params: STARParameters,
        producerMarketParticipantName: string): Promise<Producer[]> {

        console.debug('============= START : getProducerByName %s ===========', producerMarketParticipantName);
        var args: string[] = [];
        args.push(`"producerMarketParticipantName":"${producerMarketParticipantName}"`);

        const query = await QueryStateService.buildQuery(DocType.PRODUCER, args);

        const allResults = await QueryStateService.getQueryArrayResult(params, {query: query});

        console.debug('============= END : getProducerByName %s ===========', producerMarketParticipantName);

        return allResults;
    }

}
