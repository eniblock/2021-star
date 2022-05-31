import { Context } from "fabric-contract-api";
import { Producer } from "../../model/producer";

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


    public static async write(
        ctx: Context,
        producerObj: Producer): Promise<void> {
        console.debug('============= START : Write %s ProducerService ===========', producerObj.producerMarketParticipantMrid);

        producerObj.docType = 'producer';

        await ctx.stub.putState(
            producerObj.producerMarketParticipantMrid,
            Buffer.from(JSON.stringify(producerObj)),
        );

        console.debug('============= END : Write %s ProducerService ===========', producerObj.producerMarketParticipantMrid);
    }

}
