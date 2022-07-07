import { Context } from 'fabric-contract-api';
import { DocType } from '../enums/DocType';

import { OrganizationTypeMsp } from '../enums/OrganizationMspType';
import { ParametersType } from '../enums/ParametersType';

import { Producer } from '../model/producer';
import { STARParameters } from '../model/starParameters';

import { ProducerService } from './service/ProducerService';
import { QueryStateService } from './service/QueryStateService';

export class ProducerController {

    public static async createProducer(
        ctx: Context,
        inputStr: string) {
        console.info('============= START : Create Producer Market Participant ===========');

        // const identity = params.values.get(ParametersType.IDENTITY);
        // if (identity !== OrganizationTypeMsp.RTE && identity !== OrganizationTypeMsp.ENEDIS) {
        //     throw new Error(`Organisation, ${identity} does not have write access to create a producer`);
        // }

        const producerObj = await ProducerController.getProducerFromString(inputStr);

        await ProducerService.write(ctx, producerObj);

        console.info('============= END   : Create %s Producer Market Participant ===========',
            producerObj.producerMarketParticipantMrid,
        );
    }


    public static async createProducerList(
        ctx: Context,
        inputStr: string) {
        console.info('============= START : Create List Producer Market Participant ===========');

        // const identity = params.values.get(ParametersType.IDENTITY);
        // if (identity !== OrganizationTypeMsp.RTE && identity !== OrganizationTypeMsp.ENEDIS) {
        //     throw new Error(`Organisation, ${identity} does not have write access to create a producer`);
        // }

        const producerList: Producer[] = await ProducerController.getProducerListFromString(inputStr);

        if (producerList) {
            for (var producerObj of producerList) {
                await ProducerService.write(ctx, producerObj);
            }
        }

        console.info('============= END   : Create List Producer Market Participant ==========='
        );
    }


    public static async updateProducer(
        ctx: Context,
        params: STARParameters,
        inputStr: string) {

        console.info('============= START : Update Producer Market Participant ===========');

        const identity = params.values.get(ParametersType.IDENTITY);
        if (identity !== OrganizationTypeMsp.RTE && identity !== OrganizationTypeMsp.ENEDIS) {
            throw new Error(`Organisation, ${identity} does not have write access to update a producer`);
        }

        const producerObj = await ProducerController.getProducerFromString(inputStr);

        await ProducerService.getRaw(ctx, producerObj.producerMarketParticipantMrid);

        await ProducerService.write(ctx, producerObj);

        console.info('============= END : Update %s Producer Market Participant ===========',
            producerObj.producerMarketParticipantMrid,
        );
    }


    public static async updateProducerList(
        ctx: Context,
        params: STARParameters,
        inputStr: string) {

        console.info('============= START : Update List Producer Market Participant ===========');

        const identity = params.values.get(ParametersType.IDENTITY);
        if (identity !== OrganizationTypeMsp.RTE && identity !== OrganizationTypeMsp.ENEDIS) {
            throw new Error(`Organisation, ${identity} does not have write access to update a producer`);
        }

        const producerList: Producer[] = await ProducerController.getProducerListFromString(inputStr);

        if (producerList) {
            for (var producerObj of producerList) {
                await ProducerService.getRaw(ctx, producerObj.producerMarketParticipantMrid);
                await ProducerService.write(ctx, producerObj);
            }
        }

        console.info('============= END : Update List Producer Market Participant ===========');
    }


    private static async getProducerFromString(inputStr: string): Promise<Producer> {
        let producerObj: Producer;
        try {
            producerObj = JSON.parse(inputStr);
        } catch (error) {
            throw new Error(`ERROR producer-> Input string NON-JSON value`);
        }

        Producer.schema.validateSync(
            producerObj,
            {strict: true, abortEarly: false},
        );

        return producerObj;
    }


    private static async getProducerListFromString(inputStr: string): Promise<Producer[]> {
        let producerList: Producer[] = [];
        try {
            producerList = JSON.parse(inputStr);
        } catch (error) {
            throw new Error(`ERROR producer by list-> Input string NON-JSON value`);
        }

        if (producerList && producerList.length > 0) {
            for (var producerObj of producerList) {
                Producer.schema.validateSync(
                    producerObj,
                    {strict: true, abortEarly: false},
                );
            }
        }

        return producerList;
    }





    public static async queryProducer(ctx: Context, prodId: string): Promise<string> {
        console.info('============= START : Query %s Producer Market Participant ===========', prodId);
        const prodAsBytes = await ProducerService.getRaw(ctx, prodId);
        console.info('============= END   : Query %s Producer Market Participant ===========', prodId);
        // console.info(prodId, prodAsBytes.toString());
        return prodAsBytes.toString();
    }


    public static async getAllProducer(ctx: Context): Promise<string> {
        return await QueryStateService.getAllStates(ctx, DocType.PRODUCER);
    }


    public static async getProducerByName(
        ctx: Context,
        producerMarketParticipantName: string): Promise<Producer[]> {

        console.info('============= START : getProducerByName %s ===========', producerMarketParticipantName);
        var args: string[] = [];
        args.push(`"producerMarketParticipantName":"${producerMarketParticipantName}"`);

        const query = await QueryStateService.buildQuery(DocType.PRODUCER, args);

        const allResults = await QueryStateService.getQueryArrayResult(ctx, query);

        console.info('============= END : getProducerByName %s ===========', producerMarketParticipantName);

        return allResults;
    }

}
