import { DataActionType } from '../../enums/DataActionType';
import { DocType } from '../../enums/DocType';

import { ActivationDocument } from '../../model/activationDocument/activationDocument';
import { DataReference } from '../../model/dataReference';
import { STARParameters } from '../../model/starParameters';

import { ActivationDocumentService } from '../service/ActivationDocumentService';
import { StarPrivateDataService } from '../service/StarPrivateDataService';

import { ActivationDocumentController } from './ActivationDocumentController';

export class OrderManagerController {
    public static async executeOrder(
        params: STARParameters,
        updateOrder: DataReference) {
        params.logger.debug('============= START : executeOrder OrderManagerController ===========');

        if (updateOrder.data) {
            ActivationDocument.schema.validateSync(
                updateOrder.data,
                {strict: true, abortEarly: false},
            );
            const activationDocument: ActivationDocument = updateOrder.data;

            if (updateOrder.dataAction === DataActionType.COLLECTION_CHANGE) {
                await ActivationDocumentController.deleteActivationDocumentObj(
                    params, activationDocument, updateOrder.previousCollection);
                await ActivationDocumentController.createActivationDocumentByReference(params, updateOrder);
            } else {
                await this.updateByOrders(params, activationDocument, updateOrder.collection);
            }
        }

        params.logger.debug('============= END   : executeOrder OrderManagerController ===========');
    }

    public static async updateByOrders(
        params: STARParameters,
        activationDocument: ActivationDocument,
        collection: string) {

        params.logger.debug('============= START : updateByOrders OrderManagerController ===========');
        let original: ActivationDocument;
        try {
            original = await StarPrivateDataService.getObj(
                params, {
                    collection,
                    docType: DocType.ACTIVATION_DOCUMENT,
                    id: activationDocument.activationDocumentMrid});
        } catch (err) {
            throw new Error(`Error : Activation Document - updateByOrders - Unknown document cannot be Updated ${activationDocument.activationDocumentMrid}`);
        }

        const originalOrder: ActivationDocument = JSON.parse(JSON.stringify(original));
        originalOrder.orderEnd = activationDocument.orderEnd;
        originalOrder.potentialChild = activationDocument.potentialChild;
        originalOrder.potentialParent = activationDocument.potentialParent;
        originalOrder.subOrderList = activationDocument.subOrderList;
        originalOrder.eligibilityStatus = activationDocument.eligibilityStatus;
        originalOrder.eligibilityStatusEditable = activationDocument.eligibilityStatusEditable;

        if (JSON.stringify(originalOrder) !== JSON.stringify(activationDocument)) {
            throw new Error(`Error on document ${activationDocument.activationDocumentMrid} all modified data cannot be updated by orders.`);
        }

        // TODO check subOrderList
        // if (original.subOrderList) {
        //     for (const listElt of original.subOrderList) {
        //         if (!activationDocument.subOrderList.includes(listElt)) {
        //             throw new Error(`Error on document ${activationDocument.activationDocumentMrid}
        //                  ids can only be added to subOrderList.`);
        //         }
        //     }
        // }
        activationDocument.docType = DocType.ACTIVATION_DOCUMENT;
        await ActivationDocumentService.write(params, activationDocument, collection);
        params.logger.debug('=============  END  : updateByOrders OrderManagerController ===========');
    }
}
