import { DocType } from "../enums/DocType";
import { EligibilityStatusType } from "../enums/EligibilityStatusType";

import { ActivationDocument } from "../model/activationDocument/activationDocument";
import { AttachmentFile } from "../model/attachmentFile";
import { DataReference } from "../model/dataReference";
import { Site } from "../model/site";
import { STARParameters } from "../model/starParameters";

import { EligibilityController } from "./activationDocument/EligibilityController";
import { OrderManagerController } from "./activationDocument/OrderManagerController";
import { ReconciliationController } from "./activationDocument/ReconciliationController";
import { AttachmentFileController } from "./AttachmentFileController";
import { DataIndexersController, SiteReserveBidIndexersController } from "./dataIndexersController";
import { EnergyAccountController } from "./EnergyAccountController";
import { EnergyAmountController } from "./EnergyAmountController";
import { ReferenceEnergyAccountController } from "./ReferenceEnergyAccountController";
import { ReserveBidMarketDocumentController } from "./ReserveBidMarketDocumentController";
import { ActivationDocumentEligibilityService } from "./service/ActivationDocumentEligibilityService";
import { ActivationDocumentService } from "./service/ActivationDocumentService";
import { SiteController } from "./SiteController";

export class StarDataStateController {
    public static async getStarDataState(
        params: STARParameters): Promise<string> {
        params.logger.info('============= START : getStarDataState StarDataStateController ===========');

        const orderReferencesReconciliation: DataReference[] = await ReconciliationController.getReconciliationState(params);

        const orderReferencesMap: Map<string, DataReference> = ActivationDocumentService.dataReferenceArrayToMap(orderReferencesReconciliation);

        params.logger.debug("# # # # # # # # # # # #")
        params.logger.debug("from Reconciliation")
        params.logger.debug([...orderReferencesMap])
        params.logger.debug("# # # # # # # # # # # #")

        const automaticEligibles = await EligibilityController.getAutomaticEligibles(params);

        params.logger.debug("# # # # # # # # # # # #")
        params.logger.debug("from Automatic Eligility")
        params.logger.debug([...automaticEligibles])
        params.logger.debug("# # # # # # # # # # # #")


        if (automaticEligibles && automaticEligibles.length > 0) {
            for (const automaticEligible of automaticEligibles) {
                if (automaticEligible.data
                    && automaticEligible.data.activationDocumentMrid
                    && automaticEligible.data.activationDocumentMrid.length > 0) {

                    if (orderReferencesMap.has(automaticEligible.data.activationDocumentMrid)){
                        const newOrderReferenceValue = orderReferencesMap.get(automaticEligible.data.activationDocumentMrid);
                        newOrderReferenceValue.data.eligibilityStatus = EligibilityStatusType.EligibilityAccepted;
                        newOrderReferenceValue.data = await ActivationDocumentEligibilityService.outputFormatFRActivationDocument(params, newOrderReferenceValue.data);

                        orderReferencesMap.set(automaticEligible.data.activationDocumentMrid, newOrderReferenceValue);
                    } else {
                        orderReferencesMap.set(automaticEligible.data.activationDocumentMrid, automaticEligible);
                    }
                }
            }
        }

        params.logger.debug("# # # # # # # # # # # #")
        params.logger.debug("after merge automatic elibigility")
        params.logger.debug([...orderReferencesMap])
        params.logger.debug("# # # # # # # # # # # #")

        const orderReferences = await EligibilityController.getEligibilityStatusState(params, orderReferencesMap);


        // //Add Indexed Data References (to fill lack in data if needed)

        // const dataIndexerReferences = await SiteReserveBidIndexersController.getState(params);

        // if (dataIndexerReferences && dataIndexerReferences.length > 0) {
        //     for (const dataIndexerRef of dataIndexerReferences) {
        //         orderReferences.push(dataIndexerRef);
        //     }
        // }


        // const orderReferencesFinal: DataReference[] = [];
        // if (orderReferences && orderReferences.length > 0) {
        //     for (const orderReference of orderReferences) {
        //         if (orderReference.docType != DocType.ACTIVATION_DOCUMENT) {
        //             orderReferencesFinal.push(orderReference);
        //         }
        //     }
        // }
        // var state_str = JSON.stringify(orderReferencesFinal);

        var state_str = JSON.stringify(orderReferences);

        params.logger.debug("#######################")
        params.logger.debug(state_str)
        params.logger.debug("#######################")

        params.logger.info('=============  END  : getStarDataState StarDataStateController ===========');

        return state_str;

    }




    public static async executeStarDataOrders(
        params: STARParameters,
        inputStr: string) {

        params.logger.info('============= START : executeStarDataOrders StarDataStateController ===========');

        let updateOrders: DataReference[];
        try {
            updateOrders = JSON.parse(inputStr);
        } catch (error) {
        // params.logger.error('error=', error);
            throw new Error(`ERROR executeStarDataOrders -> Input string NON-JSON value`);
        }

        if (updateOrders && updateOrders.length > 0 ) {
            //VALIDATION AND INITIALIZATION STEP
            for (const updateOrder of updateOrders) {
                DataReference.schema.validateSync(
                    updateOrder,
                    {strict: true, abortEarly: false},
                );
                if (updateOrder.docType === DocType.ACTIVATION_DOCUMENT) {
                    const data: ActivationDocument = updateOrder.data;

                    const poolKey = updateOrder.collection.concat(data.activationDocumentMrid);

                    params.addInMemoryPool(poolKey, updateOrder);

                } else if (updateOrder.docType === DocType.SITE) {
                    const data: Site = updateOrder.data;

                    const poolKey = updateOrder.collection.concat(data.meteringPointMrid);

                    params.addInMemoryPool(poolKey, updateOrder);

                } else if (updateOrder.docType === DocType.ATTACHMENT_FILE) {
                    const data: AttachmentFile = updateOrder.data;

                    const poolKey = updateOrder.collection.concat(data.fileId);

                    params.addInMemoryPool(poolKey, updateOrder);

                }
                //  else if (updateOrder.docType === DocType.ENERGY_ACCOUNT) {
                //     const data: EnergyAccount = updateOrder.data;
                //     params.addInMemoryPool(data.energyAccountMarketDocumentMrid, updateOrder);
                // }
            }
            // PROCESS Step
            for (const updateOrder of updateOrders) {
                if (updateOrder.docType === DocType.ACTIVATION_DOCUMENT) {
                    await OrderManagerController.executeOrder(params, updateOrder);
                } else if (updateOrder.docType === DocType.SITE) {
                    await SiteController.createSiteByReference(params, updateOrder);
                } else if (updateOrder.docType === DocType.ENERGY_ACCOUNT) {
                    await EnergyAccountController.createEnergyAccountByReference(params, updateOrder);
                } else if (updateOrder.docType === DocType.REFERENCE_ENERGY_ACCOUNT) {
                    await ReferenceEnergyAccountController.createReferenceEnergyAccountByReference(params, updateOrder);
                } else if (updateOrder.docType === DocType.ENERGY_AMOUNT) {
                    await EnergyAmountController.executeOrder(params, updateOrder);
                } else if (updateOrder.docType === DocType.RESERVE_BID_MARKET_DOCUMENT) {
                    await ReserveBidMarketDocumentController.createByReference(params, updateOrder);
                } else if (updateOrder.docType === DocType.ATTACHMENT_FILE) {
                    await AttachmentFileController.createByReference(params, updateOrder);
                } else if (updateOrder.docType === DocType.DATA_INDEXER) {
                    await DataIndexersController.executeOrder(params, updateOrder);
                }

            }
        }

        params.logger.info('=============  END  : executeStarDataOrders StarDataStateController ===========');
        }
}
