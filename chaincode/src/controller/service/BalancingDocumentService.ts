import { DocType } from "../../enums/DocType";
import { ParametersType } from "../../enums/ParametersType";
import { IdArgument } from "../../model/arguments/idArgument";
import { BalancingDocument } from "../../model/balancingDocument";

import { STARParameters } from "../../model/starParameters";
import { HLFServices } from "./HLFservice";

import { StarPrivateDataService } from "./StarPrivateDataService";

export class BalancingDocumentService {

    public static async write(
        params: STARParameters,
        balancingObj: BalancingDocument,
        target: string = ''): Promise<void> {
        params.logger.debug('============= START : write BalancingDocumentService ===========');

        balancingObj.docType = DocType.BALANCING_DOCUMENT;

        await StarPrivateDataService.write(params, {id: balancingObj.balancingDocumentMrid, dataObj: balancingObj, collection: target});

        params.logger.debug('============= START : write BalancingDocumentService ===========');
    }

    public static async delete(
        params: STARParameters,
        arg: IdArgument): Promise<void> {
        params.logger.debug('============= START : Delete %s BalancingDocumentService ===========', arg.id);

        const collection = await HLFServices.getCollectionOrDefault(params, ParametersType.DATA_TARGET, arg.collection);

        await params.ctx.stub.deletePrivateData(collection, arg.id);

        params.logger.debug('=============  END  : Delete %s BalancingDocumentService ===========', arg.id);
    }


}
