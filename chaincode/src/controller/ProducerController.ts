import { Context } from 'fabric-contract-api';
import { OrganizationTypeMsp } from '../enums/OrganizationMspType';
import { Producer } from '../model/producer';
import { HLFServices } from './service/HLFservice';
import { ProducerService } from './service/ProducerService';
import { QueryStateService } from './service/QueryStateService';

export class ProducerController {

    public static async createProducer(
        ctx: Context,
        inputStr: string) {
        console.info('============= START : Create Producer Market Participant ===========');

        // const identity = await HLFServices.getMspID(ctx);
        // if (identity !== OrganizationTypeMsp.RTE && identity !== OrganizationTypeMsp.ENEDIS) {
        //     throw new Error(`Organisation, ${identity} does not have write access to create a producer`);
        // }

        let producerObj: Producer;
        try {
            producerObj = JSON.parse(inputStr);
        } catch (error) {
            throw new Error(`ERROR createProducer-> Input string NON-JSON value`);
        }

        const producerInput = Producer.schema.validateSync(
            producerObj,
            {strict: true, abortEarly: false},
        );

        await ProducerService.write(ctx, producerInput);

        console.info(
            '============= END   : Create %s Producer Market Participant ===========',
            producerInput.producerMarketParticipantMrid,
        );
    }






    public static async queryProducer(ctx: Context, prodId: string): Promise<string> {
        console.info('============= START : Query %s Producer Market Participant ===========', prodId);
        const prodAsBytes = await ProducerService.getRaw(ctx, prodId);
        console.info('============= END   : Query %s Producer Market Participant ===========', prodId);
        // console.info(prodId, prodAsBytes.toString());
        return prodAsBytes.toString();
    }





    public static async updateProducer(
        ctx: Context,
        inputStr: string) {

        console.info(
            '============= START : Update Producer Market Participant ===========');

            const identity = await HLFServices.getMspID(ctx);
        if (identity !== OrganizationTypeMsp.RTE && identity !== OrganizationTypeMsp.ENEDIS) {
            throw new Error(`Organisation, ${identity} does not have write access to update a producer`);
        }

        let producerObj: Producer;
        try {
            producerObj = JSON.parse(inputStr);
        } catch (error) {
            throw new Error(`ERROR updateProducer-> Input string NON-JSON value`);
        }

        const producerInput = Producer.schema.validateSync(
            producerObj,
            {strict: true, abortEarly: false},
        );

        const prodAsBytes = await ProducerService.getRaw(ctx, producerInput.producerMarketParticipantMrid);

        await ProducerService.write(ctx, producerInput);

        console.info(
            '============= END : Update %s Producer Market Participant ===========',
            producerInput.producerMarketParticipantMrid,
        );
    }





    public static async getAllProducer(ctx: Context): Promise<string> {
        return await QueryStateService.getAllStates(ctx, "producer");
    }
}
