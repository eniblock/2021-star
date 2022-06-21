import { Context } from "fabric-contract-api";
import { DocType } from "../../enums/DocType";
import { Producer } from "../../model/producer";
import { STARParameters } from "../../model/starParameters";

export class ProducerService {
    public static async getRaw(
        ctx: Context,
        prodId: string): Promise<Uint8Array> {
        console.debug('============= START : getRaw %s ProducerService ===========', prodId);

        const prodAsBytes = await ctx.stub.getState(prodId);
        if (!prodAsBytes || prodAsBytes.length === 0) {
            throw new Error(`Producer : ${prodId} does not exist`);
        }

        console.debug('============= END : getRaw %s ProducerService ===========', prodId);
        return prodAsBytes;
    }

    public static async getObj(
        ctx: Context,
        id: string): Promise<Producer> {

        const producerAsBytes: Uint8Array = await ProducerService.getRaw(ctx, id);
        var producerObj:Producer = null;
        if (producerAsBytes) {
            try {
                producerObj = JSON.parse(producerAsBytes.toString());
            } catch (error) {
                throw new Error(`ERROR Producer -> Input string NON-JSON value`);
            }
        }
        return producerObj;
    }



    public static async write(
        ctx: Context,
        producerObj: Producer): Promise<void> {
        console.debug('============= START : Write %s ProducerService ===========', producerObj.producerMarketParticipantMrid);

        producerObj.docType = DocType.PRODUCER;

        await ctx.stub.putState(
            producerObj.producerMarketParticipantMrid,
            Buffer.from(JSON.stringify(producerObj)),
        );

        console.debug('============= END : Write %s ProducerService ===========', producerObj.producerMarketParticipantMrid);
    }

}
