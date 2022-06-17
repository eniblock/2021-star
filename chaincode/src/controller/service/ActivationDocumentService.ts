import { Context } from "fabric-contract-api";
import { STARParameters } from '../../model/starParameters';
import { ParametersType } from "../../enums/ParametersType";
import { ActivationDocument } from "../../model/activationDocument";
import { QueryStateService } from "./QueryStateService";
import { HLFServices } from "./HLFservice";

export class ActivationDocumentService {
    private static async getRaw(
        ctx: Context,
        collection: string,
        id: string): Promise<Uint8Array> {
        console.debug('============= START : getRaw %s / %s ActivationDocumentService ===========', collection, id);

        const prodAsBytes = await ctx.stub.getPrivateData(collection, id);
        if (!prodAsBytes || prodAsBytes.length === 0) {
            throw new Error(`ActivationDocument : ${id} does not exist`);
        }

        console.debug('============= END : getRaw %s ActivationDocumentService ===========');
        return prodAsBytes;
    }


    public static async getObj(
        ctx: Context,
        params: STARParameters,
        id: string,
        target: string = ''): Promise<ActivationDocument> {

        const collection = await HLFServices.getCollectionOrDefault(params, ParametersType.ACTIVATION_DOCUMENT, target);

        const activationDocumentAsBytes: Uint8Array = await ActivationDocumentService.getRaw(ctx, collection, id);
        var activationDocumentObj:ActivationDocument = null;
        if (activationDocumentAsBytes) {
            activationDocumentObj = JSON.parse(activationDocumentAsBytes.toString());
        }
        return activationDocumentObj;
    }

    public static async write(
        ctx: Context,
        params: STARParameters,
        activationDocumentInput: ActivationDocument,
        target: string = ''): Promise<void> {
        console.debug('============= START : Write %s ActivationDocumentService ===========', activationDocumentInput.activationDocumentMrid);

        const collection = await HLFServices.getCollectionOrDefault(params, ParametersType.ACTIVATION_DOCUMENT, target);

        activationDocumentInput.docType = 'activationDocument';

        await ctx.stub.putPrivateData(collection,
            activationDocumentInput.activationDocumentMrid,
            Buffer.from(JSON.stringify(activationDocumentInput)));

        console.debug('============= END : Write %s ActivationDocumentService ===========', activationDocumentInput.activationDocumentMrid);
    }

    public static async getQueryArrayResult(
        ctx: Context,
        params: STARParameters,
        query: string,
        target: string[] = []): Promise<any[]>  {
        console.debug('============= START : getQueryResult ActivationDocumentService ===========');

        const collections = await HLFServices.getCollectionsOrDefault(params, ParametersType.ACTIVATION_DOCUMENT, target);
        var allResults: any[] = [];

        if (collections) {
            for (const collection of collections) {
                const collectionResults = await QueryStateService.getPrivateQueryArrayResult(ctx, query, collection);
                allResults = [].concat(allResults, collectionResults);
            }
        }

        console.debug('============= END : getQueryResult ActivationDocumentService ===========');
        return allResults;
    }



}
