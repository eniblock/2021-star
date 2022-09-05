import { STARParameters } from '../../model/starParameters';
import { ParametersType } from "../../enums/ParametersType";
import { ActivationDocument } from "../../model/activationDocument/activationDocument";
import { QueryStateService } from "./QueryStateService";
import { HLFServices } from "./HLFservice";
import { DataReference } from "../../model/dataReference";
import { DocType } from "../../enums/DocType";
import { StarPrivateDataService } from "./StarPrivateDataService";

export class ActivationDocumentService {
    public static async write(
        params: STARParameters,
        activationDocumentObj: ActivationDocument,
        target: string = ''): Promise<void> {

        activationDocumentObj.docType = DocType.ACTIVATION_DOCUMENT;
        await StarPrivateDataService.write(params, {id:activationDocumentObj.activationDocumentMrid, dataObj:activationDocumentObj, collection:target});
    }

    public static async delete(
        params: STARParameters,
        activationDocumentMrid: string,
        target: string): Promise<void> {
        params.logger.debug('============= START : Delete %s ActivationDocumentService ===========', activationDocumentMrid);

        const collection = await HLFServices.getCollectionOrDefault(params, ParametersType.DATA_TARGET, target);

        await params.ctx.stub.deletePrivateData(collection, activationDocumentMrid);

        params.logger.debug('=============  END  : Delete %s ActivationDocumentService ===========', activationDocumentMrid);
    }



    public static async getQueryArrayResult(
        params: STARParameters,
        query: string,
        target: string[] = []): Promise<any[]>  {
        params.logger.debug('============= START : getQueryResult ActivationDocumentService ===========');

        const collections = await HLFServices.getCollectionsOrDefault(params, ParametersType.DATA_TARGET, target);
        var allResults: any[] = [];

        if (collections) {
            for (const collection of collections) {
                const collectionResults = await QueryStateService.getPrivateQueryArrayResult(params, { query:query, collection:collection});
                allResults = [].concat(allResults, collectionResults);
            }
        }

        params.logger.debug('=============  END  : getQueryResult ActivationDocumentService ===========');
        return allResults;
    }



    public static dataReferenceArrayToMap(dataReferenceArray:DataReference[]): Map<string, DataReference> {
        const returnedMap: Map<string, DataReference> = new Map();

        for (var dataReference of dataReferenceArray) {
            var data: ActivationDocument = dataReference.data;
            returnedMap.set(data.activationDocumentMrid, dataReference);
        }

        return returnedMap;
    }
}
