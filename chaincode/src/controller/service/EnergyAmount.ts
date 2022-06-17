import { Context } from "fabric-contract-api";
import { DocType } from "../../enums/DocType";
import { EnergyAmount } from '../../model/energyAmount';

export class EnergyAmountService {
    public static async getRaw(
        ctx: Context,
        energyAmountMarketDocumentMrid: string): Promise<Uint8Array> {
        console.debug('============= START : getRaw %s ProducerService ===========', energyAmountMarketDocumentMrid);

        const energyAmountAsBytes = await ctx.stub.getState(energyAmountMarketDocumentMrid);
        if (!energyAmountAsBytes || energyAmountAsBytes.length === 0) {
            throw new Error(`Energy Amount : ${energyAmountMarketDocumentMrid} does not exist.`);
        }

        console.debug('============= END : getRaw %s ProducerService ===========', energyAmountMarketDocumentMrid);
        return energyAmountAsBytes;
    }


    public static async write(
        ctx: Context,
        energyObj: EnergyAmount): Promise<void> {

        console.debug('============= START : Write %s EnergyAmountService ===========', energyObj.energyAmountMarketDocumentMrid);

        energyObj.docType = DocType.ENERGY_AMOUNT;

        await ctx.stub.putState(energyObj.energyAmountMarketDocumentMrid, Buffer.from(JSON.stringify(energyObj)));

        console.debug('============= END : Write %s EnergyAmountService ===========', energyObj.energyAmountMarketDocumentMrid);
    }



}
