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
        let originalMapRef : Map<string, DataReference>;
        try {
            originalMapRef = await StarPrivateDataService.getObjRefbyId(
                params, {
                    docType: DocType.ACTIVATION_DOCUMENT,
                    id: activationDocument.activationDocumentMrid});
        } catch (err) {
            throw new Error(`Error : Activation Document - updateByOrders - Unknown document cannot be Updated ${activationDocument.activationDocumentMrid}`);
        }

        let originalRef : DataReference;
        if (originalMapRef.has(collection)) {
            originalRef = originalMapRef.get(collection);
        } else {
            originalRef = originalMapRef.values().next().value;
        }
        if (originalRef
            && originalRef.data
            && originalRef.data.activationDocumentMrid
            && originalRef.data.activationDocumentMrid === activationDocument.activationDocumentMrid) {

            original = originalRef.data;
        } else {
            throw new Error(`Error : Activation Document - updateByOrders - Unknown document cannot be Updated ${activationDocument.activationDocumentMrid}`);
        }

        const originalOrder: ActivationDocument = JSON.parse(JSON.stringify(original));

        let verify = true;
        verify = verify && (originalOrder.docType === activationDocument.docType);
        verify = verify && (originalOrder.activationDocumentMrid === activationDocument.activationDocumentMrid);
        verify = verify && (originalOrder.originAutomationRegisteredResourceMrid === activationDocument.originAutomationRegisteredResourceMrid);
        verify = verify && (originalOrder.registeredResourceMrid === activationDocument.registeredResourceMrid);
        verify = verify && (originalOrder.measurementUnitName === activationDocument.measurementUnitName);
        verify = verify && (originalOrder.messageType === activationDocument.messageType);
        verify = verify && (originalOrder.businessType === activationDocument.businessType);
        verify = verify && (originalOrder.orderValue === activationDocument.orderValue);
        verify = verify && (originalOrder.startCreatedDateTime === activationDocument.startCreatedDateTime);
        verify = verify && (originalOrder.endCreatedDateTime === activationDocument.endCreatedDateTime);
        verify = verify && (originalOrder.revisionNumber === activationDocument.revisionNumber);
        verify = verify && (originalOrder.reasonCode === activationDocument.reasonCode);
        verify = verify && (originalOrder.senderMarketParticipantMrid === activationDocument.senderMarketParticipantMrid);
        verify = verify && (originalOrder.senderRole === activationDocument.senderRole);
        verify = verify && (originalOrder.receiverMarketParticipantMrid === activationDocument.receiverMarketParticipantMrid);
        verify = verify && (originalOrder.receiverRole === activationDocument.receiverRole);
        verify = verify && (originalOrder.instance === activationDocument.instance);

        if (!verify) {
            params.logger.info("original: ", originalOrder)
            params.logger.info("updated one: ", activationDocument)
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
