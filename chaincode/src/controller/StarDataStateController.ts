import { DocType } from "../enums/DocType";

import { ActivationDocument } from "../model/activationDocument/activationDocument";
import { DataReference } from "../model/dataReference";
import { Site } from "../model/site";
import { STARParameters } from "../model/starParameters";

import { EligibilityController } from "./activationDocument/EligibilityController";
import { OrderManagerController } from "./activationDocument/OrderManagerController";
import { ReconciliationController } from "./activationDocument/ReconciliationController";
import { EnergyAccountController } from "./EnergyAccountController";
import { EnergyAmountController } from "./EnergyAmountController";
import { ReferenceEnergyAccountController } from "./ReferenceEnergyAccountController";
import { SiteController } from "./SiteController";

export class StarDataStateController {
    public static async getStarDataState(
        params: STARParameters): Promise<string> {
        params.logger.info('============= START : getStarDataState StarDataStateController ===========');

        var orderReferences : DataReference[];

        orderReferences = await ReconciliationController.getReconciliationState(params);

        if (orderReferences && orderReferences.length > 0) {
            orderReferences = await EligibilityController.getEligibilityStatusState(params, orderReferences);
        }

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
                }

            }
        }

        params.logger.info('=============  END  : executeStarDataOrders StarDataStateController ===========');
        }
}
