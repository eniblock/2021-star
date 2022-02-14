import { Context } from 'fabric-contract-api';
import { OrganizationTypeMsp } from '../enums/OrganizationMspType';
import { Producer } from '../model/producer';

export class ProducerController {

    public static async createProducer(
        ctx: Context,
        inputStr: string) {
        console.info('============= START : Create Producer Market Participant ===========');

        // const identity = await ctx.stub.getMspID();
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

        producerInput.docType = 'producer';
        await ctx.stub.putState(
            producerInput.producerMarketParticipantMrid,
            Buffer.from(JSON.stringify(producerInput)),
        );
        console.info(
            '============= END   : Create %s Producer Market Participant ===========',
            producerInput.producerMarketParticipantMrid,
        );
    }

    public static async queryProducer(ctx: Context, prodId: string): Promise<string> {
        console.info('============= START : Query %s Producer Market Participant ===========', prodId);
        const prodAsBytes = await ctx.stub.getState(prodId);
        if (!prodAsBytes || prodAsBytes.length === 0) {
            throw new Error(`${prodId} does not exist`);
        }
        console.info('============= END   : Query %s Producer Market Participant ===========');
        console.info(prodId, prodAsBytes.toString());
        return prodAsBytes.toString();
    }

    public static async updateProducer(
        ctx: Context,
        inputStr: string) {

        console.info(
            '============= START : Update Producer Market Participant ===========');

        const identity = await ctx.stub.getMspID();
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

        producerInput.docType = 'producer';
        const prodAsBytes = await ctx.stub.getState(producerInput.producerMarketParticipantMrid);
        if (!prodAsBytes || prodAsBytes.length === 0) {
            throw new Error(`${producerInput.producerMarketParticipantMrid} does not exist`);
        }

        await ctx.stub.putState(
            producerInput.producerMarketParticipantMrid,
            Buffer.from(JSON.stringify(producerInput)),
        );
        console.info(
            '============= END : Update %s Producer Market Participant ===========',
            producerInput.producerMarketParticipantMrid,
        );
    }

    public static async getAllProducer(ctx: Context): Promise<string> {
        const allResults = [];
        const query = `{"selector": {"docType": "producer"}}`;
        const iterator = await ctx.stub.getQueryResult(query);
        let result = await iterator.next();
        while (!result.done) {
            const strValue = Buffer.from(result.value.value.toString()).toString('utf8');
            let record;
            try {
                record = JSON.parse(strValue);
            } catch (err) {
                record = strValue;
            }
            allResults.push(record);
            result = await iterator.next();
        }
        return JSON.stringify(allResults);
    }
}
