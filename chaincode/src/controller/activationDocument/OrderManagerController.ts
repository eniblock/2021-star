import { Context } from "fabric-contract-api";
import { DataVersionType } from "../../enums/DataVersionType";
import { DocType } from "../../enums/DocType";
import { ActivationDocument } from "../../model/activationDocument/activationDocument";
import { DataReference } from "../../model/dataReference";
import { STARParameters } from "../../model/starParameters";
import { ActivationDocumentService } from "../service/ActivationDocumentService";
import { ActivationDocumentController } from "./ActivationDocumentController";

export class OrderManagerController {
    public static async executeOrder(
        ctx: Context,
        params: STARParameters,
        updateOrder: DataReference) {
        console.info('============= START : executeOrder ReconciliationController ===========');

        if (updateOrder.data) {
            ActivationDocument.schema.validateSync(
                updateOrder.data,
                {strict: true, abortEarly: false},
            );
            const activationDocument:ActivationDocument = updateOrder.data;

            if (activationDocument.dataVersion === DataVersionType.DELETION) {
                await ActivationDocumentService.delete(ctx, params, activationDocument.activationDocumentMrid, updateOrder.collection);
            } else if (activationDocument.dataVersion === DataVersionType.CREATION) {
                await ActivationDocumentController.createActivationDocumentByReference(ctx, params, updateOrder);
            } else {
                await this.updateByOrders(ctx, params, activationDocument, updateOrder.collection);
            }
        }

        console.info('============= END   : executeOrder ReconciliationController ===========');
    }


    public static async updateByOrders(
        ctx: Context,
        params: STARParameters,
        activationDocument:ActivationDocument,
        collection: string) {

        console.info('============= START : updateByOrders ReconciliationController ===========');
        const original:ActivationDocument = await ActivationDocumentService.getObj(ctx, params, activationDocument.activationDocumentMrid, collection);

        const original_order:ActivationDocument = JSON.parse(JSON.stringify(original));
        original_order.orderEnd = activationDocument.orderEnd;
        original_order.potentialChild = activationDocument.potentialChild;
        original_order.potentialParent = activationDocument.potentialParent;
        original_order.subOrderList = activationDocument.subOrderList;
        original_order.eligibilityStatus = activationDocument.eligibilityStatus;
        original_order.eligibilityStatusEditable = activationDocument.eligibilityStatusEditable;
        original_order.dataVersion = activationDocument.dataVersion;

        if (JSON.stringify(original_order) !== JSON.stringify(activationDocument)) {
            console.info("Error - ActivationDocument updateByOrders");
            console.info("expected:",original_order);
            console.info("actual:",activationDocument);
            throw new Error(`Error on document ${activationDocument.activationDocumentMrid} all modified data cannot be updated by orders.`);
        }

        if (original.subOrderList) {
            for (const listElt of original.subOrderList) {
                if (!activationDocument.subOrderList.includes(listElt)) {
                    throw new Error(`Error on document ${activationDocument.activationDocumentMrid} ids can only be added to subOrderList.`);
                }
            }
        }
        activationDocument.docType = DocType.ACTIVATION_DOCUMENT;
        await ActivationDocumentService.write(ctx, params, activationDocument, collection);
        console.info('============= END : updateByOrders ReconciliationController ===========');
    }
}
