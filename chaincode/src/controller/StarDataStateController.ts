import { Context } from "fabric-contract-api";
import { DocType } from "../enums/DocType";
import { OrganizationTypeMsp } from "../enums/OrganizationMspType";
import { ParametersType } from "../enums/ParametersType";
import { ActivationDocument } from "../model/activationDocument/activationDocument";
import { DataReference } from "../model/dataReference";
import { EnergyAccount } from "../model/energyAccount";
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
        ctx: Context,
        params: STARParameters): Promise<string> {

        console.info('============= START : getStarDataState StarDataStateController ===========');
        var orderReferences : DataReference[];

        orderReferences = await ReconciliationController.getReconciliationState(ctx, params);

        if (orderReferences && orderReferences.length > 0) {
            orderReferences = await EligibilityController.getEligibilityStatusState(ctx, params, orderReferences);
        }

        var state_str = JSON.stringify(orderReferences);

        console.debug("*******************************")
        console.debug("*******************************")
        console.debug(state_str)
        console.debug("*******************************")
        console.debug("*******************************")

        console.info('============= END : getStarDataState StarDataStateController ===========');

        return state_str;

    }

    public static async executeStarDataOrders(
        ctx: Context,
        params: STARParameters,
        inputStr: string) {

        console.info('============= START : executeStarDataOrders StarDataStateController ===========');

        let updateOrders: DataReference[];
        try {
            updateOrders = JSON.parse(inputStr);
        } catch (error) {
        // console.error('error=', error);
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
                    params.addInMemoryPool(data.activationDocumentMrid, updateOrder);

                } else if (updateOrder.docType === DocType.SITE) {
                    const data: Site = updateOrder.data;
                    params.addInMemoryPool(data.meteringPointMrid, updateOrder);

                }
                //  else if (updateOrder.docType === DocType.ENERGY_ACCOUNT) {
                //     const data: EnergyAccount = updateOrder.data;
                //     params.addInMemoryPool(data.energyAccountMarketDocumentMrid, updateOrder);
                // }
            }
            //PROCESS Step
            for (const updateOrder of updateOrders) {
                if (updateOrder.docType === DocType.ACTIVATION_DOCUMENT) {
                    await OrderManagerController.executeOrder(ctx, params, updateOrder);
                } else if (updateOrder.docType === DocType.SITE) {
                    await SiteController.createSiteByReference(ctx, params, updateOrder);
                } else if (updateOrder.docType === DocType.ENERGY_ACCOUNT) {
                    await EnergyAccountController.createEnergyAccountByReference(ctx, params, updateOrder);
                } else if (updateOrder.docType === DocType.REFERENCE_ENERGY_ACCOUNT) {
                    await ReferenceEnergyAccountController.createReferenceEnergyAccountByReference(ctx, params, updateOrder);
                } else if (updateOrder.docType === DocType.ENERGY_AMOUNT) {
                    await EnergyAmountController.executeOrder(ctx, params, updateOrder);
                }

            }
        }

        console.info('============= END : executeStarDataOrders StarDataStateController ===========');
        }
}
