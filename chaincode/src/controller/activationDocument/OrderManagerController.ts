import { DataActionType } from "../../enums/DataActionType";
import { DocType } from "../../enums/DocType";

import { ActivationDocument } from "../../model/activationDocument/activationDocument";
import { DataReference } from "../../model/dataReference";
import { STARParameters } from "../../model/starParameters";
import { ActivationEnergyAmountIndexersController, SiteActivationIndexersController } from "../dataIndexersController";

import { ActivationDocumentService } from "../service/ActivationDocumentService";
import { StarPrivateDataService } from "../service/StarPrivateDataService";

import { ActivationDocumentController } from "./ActivationDocumentController";

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
            const activationDocument:ActivationDocument = updateOrder.data;

            if (updateOrder.dataAction === DataActionType.COLLECTION_CHANGE) {
                await ActivationDocumentController.createActivationDocumentByReference(params, updateOrder);
                await ActivationDocumentService.delete(params, activationDocument.activationDocumentMrid, updateOrder.previousCollection);
                await SiteActivationIndexersController.deleteActivationReference(
                    params,
                    activationDocument.activationDocumentMrid,
                    activationDocument.registeredResourceMrid,
                    activationDocument.startCreatedDateTime,
                    updateOrder.previousCollection);
                await ActivationEnergyAmountIndexersController.deleteEnergyAmountReference(
                    params,
                    activationDocument.activationDocumentMrid,
                    updateOrder.previousCollection);
            } else {
                await this.updateByOrders(params, activationDocument, updateOrder.collection);
            }
        }

        params.logger.debug('============= END   : executeOrder OrderManagerController ===========');
    }


    public static async updateByOrders(
        params: STARParameters,
        activationDocument:ActivationDocument,
        collection: string) {

        params.logger.debug('============= START : updateByOrders OrderManagerController ===========');
        const original:ActivationDocument = await StarPrivateDataService.getObj(params, {id: activationDocument.activationDocumentMrid, docType: DocType.ACTIVATION_DOCUMENT, collection: collection});

        const original_order:ActivationDocument = JSON.parse(JSON.stringify(original));
        original_order.orderEnd = activationDocument.orderEnd;
        original_order.potentialChild = activationDocument.potentialChild;
        original_order.potentialParent = activationDocument.potentialParent;
        original_order.subOrderList = activationDocument.subOrderList;
        original_order.eligibilityStatus = activationDocument.eligibilityStatus;
        original_order.eligibilityStatusEditable = activationDocument.eligibilityStatusEditable;

        if (JSON.stringify(original_order) !== JSON.stringify(activationDocument)) {
            throw new Error(`Error on document ${activationDocument.activationDocumentMrid} all modified data cannot be updated by orders.`);
        }

        //TODO check subOrderList
        // if (original.subOrderList) {
        //     for (const listElt of original.subOrderList) {
        //         if (!activationDocument.subOrderList.includes(listElt)) {
        //             throw new Error(`Error on document ${activationDocument.activationDocumentMrid} ids can only be added to subOrderList.`);
        //         }
        //     }
        // }
        activationDocument.docType = DocType.ACTIVATION_DOCUMENT;
        await ActivationDocumentService.write(params, activationDocument, collection);
        params.logger.debug('=============  END  : updateByOrders OrderManagerController ===========');
    }
}
