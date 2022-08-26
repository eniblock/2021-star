import { Context } from 'fabric-contract-api';
import { DataActionType } from '../../enums/DataActionType';
import { DocType } from '../../enums/DocType';
import { EligibilityStatusType } from '../../enums/EligibilityStatusType';
import { OrganizationTypeMsp } from '../../enums/OrganizationMspType';
import { ParametersType } from '../../enums/ParametersType';
import { ActivationDocument } from '../../model/activationDocument/activationDocument';
import { EligibilityStatus } from '../../model/activationDocument/eligibilityStatus';
import { DataReference } from '../../model/dataReference';
import { EnergyAccount } from '../../model/energyAccount';
import { EnergyAmount } from '../../model/energyAmount';
import { STARParameters } from '../../model/starParameters';
import { SystemOperator } from '../../model/systemOperator';
import { EnergyAccountController } from '../EnergyAccountController';
import { EnergyAmountController } from '../EnergyAmountController';
import { ParametersController } from '../ParametersController';
import { ReferenceEnergyAccountController } from '../ReferenceEnergyAccountController';
import { ActivationDocumentEligibilityService } from '../service/ActivationDocumentEligibilityService';
import { ActivationDocumentService } from '../service/ActivationDocumentService';
import { HLFServices } from '../service/HLFservice';
import { SiteService } from '../service/SiteService';
import { SystemOperatorService } from '../service/SystemOperatorService';

export class EligibilityController {



    public static async updateEligibilityStatus(
        ctx: Context,
        params: STARParameters,
        inputStr: string): Promise<ActivationDocument> {

        console.info('============= START : updateEligibilityStatus EligibilityController ===========');

        const identity = params.values.get(ParametersType.IDENTITY);
        if (identity !== OrganizationTypeMsp.RTE && identity !== OrganizationTypeMsp.ENEDIS) {
            throw new Error(`Organisation, ${identity} does not have write access for Activation Document`);
        }

        let statusToUpdate: EligibilityStatus;
        try {
            statusToUpdate = JSON.parse(inputStr);
        } catch (error) {
            throw new Error(`ERROR updateEligibilityStatus -> Input string NON-JSON value`);
        }

        EligibilityStatus.schema.validateSync(
            statusToUpdate,
            {strict: true, abortEarly: false},
        );

        var newStatus = ActivationDocumentEligibilityService.statusInternationalValue(statusToUpdate.eligibilityStatus);

        let activationDocumentReferenceMap:Map<string, DataReference>;
        try {
            activationDocumentReferenceMap = await ActivationDocumentService.getObjRefbyId(ctx, params, statusToUpdate.activationDocumentMrid);
        } catch (error) {
            throw new Error(`ERROR cannot find reference to Activation Document ${statusToUpdate.activationDocumentMrid} for status Update.`);
        }
        const activationDocumentReference = activationDocumentReferenceMap.values().next().value;

        let activationDocument: ActivationDocument;
        activationDocument = activationDocumentReference.data;

        if (!activationDocument) {
            throw new Error(`ERROR cannot find reference to Activation Document ${statusToUpdate.activationDocumentMrid} for status Update.`);
        }

        if (!activationDocument.eligibilityStatusEditable) {
            throw new Error(`ERROR Activation Document ${statusToUpdate.activationDocumentMrid} status is not Editable.`);
        }

        let systemOperatorObj: SystemOperator;
        try {
            systemOperatorObj = await SystemOperatorService.getObj(ctx, activationDocument.senderMarketParticipantMrid);
        } catch (error) {
            throw new Error(error.message.concat(` for Activation Document ${activationDocument.activationDocumentMrid} status Update.`));
        }

        if (!systemOperatorObj || systemOperatorObj.systemOperatorMarketParticipantName.toLowerCase() !== identity.toLowerCase() ) {
            throw new Error(`ERROR updateEligibilityStatus : ${identity.toLowerCase()} has no right to modify the Eligibility Status of ${systemOperatorObj.systemOperatorMarketParticipantName.toLowerCase()} document.`);
        }

        activationDocument.eligibilityStatus = newStatus;
        activationDocument.eligibilityStatusEditable = false;

        await ActivationDocumentService.write(ctx, params, activationDocument, activationDocumentReference.collection);

        console.info('============= END   : updateEligibilityStatus EligibilityController ===========');
        return await ActivationDocumentEligibilityService.outputFormatFRActivationDocument(ctx, params, activationDocument);
    }


    private static generateTarget(
        params: STARParameters,
        targetArrayValue: string[]): string {

        var targetKey: string = '';
        var targetValue: string = '';

        console.info("------------------")
        console.info(JSON.stringify(targetArrayValue))
        console.info("------------------")

        targetArrayValue = [...new Set(targetArrayValue)];
        if (targetArrayValue && targetArrayValue.length >0 ) {
            var finalTargetArrayValues:string[] = [];
            for (var value of targetArrayValue) {
                finalTargetArrayValues.push(value.toLowerCase());
            }
            finalTargetArrayValues.sort();
            targetKey = finalTargetArrayValues.join(ParametersController.targetJoinSeparator);
        }

        targetKey = targetKey.toLowerCase();

        console.info("------------------")
        console.info(targetKey)
        console.info("------------------")

        const collectionMap: Map<string, string[]> = params.values.get(ParametersType.DATA_TARGET);
        if (collectionMap) {
            const collection = collectionMap.get(targetKey);
            if (collection && collection.length>0) {
                targetValue = collection[0];
            }
        }

        return targetValue;
    }


    private static async findDataTarget(
        ctx: Context,
        params: STARParameters,
        activationDocument: ActivationDocument,
        currentTarget:string,
        activationDocumentRefMap:Map<string, DataReference>=null): Promise<string> {

        console.info('============= START : findDataDestination - EligibilityController ===========');

        currentTarget = await HLFServices.getCollectionOrDefault(params, ParametersType.DATA_TARGET, currentTarget);

        var finalTarget: string = '';
        var targetArrayValue: string[];

        if (currentTarget) {
            targetArrayValue = currentTarget.split(ParametersController.targetJoinSeparator);
        }

        var parentDocument: ActivationDocument;
        var parentDocumentRef: DataReference;
        if (activationDocumentRefMap && activationDocument && activationDocument.subOrderList && activationDocument.subOrderList.length > 0) {
            parentDocumentRef = activationDocumentRefMap.get(activationDocument.subOrderList[0]);
            if (parentDocumentRef && parentDocumentRef.data) {
                parentDocument = parentDocumentRef.data;
            }
        }

        if (!parentDocument && activationDocument && activationDocument.subOrderList && activationDocument.subOrderList.length > 0) {
            const parentDocumentMapRef:Map<string, DataReference> = await ActivationDocumentService.getObjRefbyId(ctx, params, activationDocument.subOrderList[0]);
            parentDocumentRef = parentDocumentMapRef.values().next().value;
            if (parentDocumentRef && parentDocumentRef.data) {
                parentDocument = parentDocumentRef.data;
            }
        }

        var sender: SystemOperator;
        if (parentDocument && parentDocument.senderMarketParticipantMrid) {
            sender = await SystemOperatorService.getObj(ctx, parentDocument.senderMarketParticipantMrid);
        }

        if (sender && sender.systemOperatorMarketParticipantName) {
            targetArrayValue.push(sender.systemOperatorMarketParticipantName);
        }

        finalTarget = EligibilityController.generateTarget(params, targetArrayValue);

        console.info('============= END : findDataDestination - EligibilityController ===========');
        return finalTarget;
    }




    private static async getCreationRequierments(
        ctx: Context,
        params: STARParameters,
        referencedDocument: DataReference,
        initialTarget: string): Promise<DataReference[]>  {

        console.info('============= START : getCreationRequierments - EligibilityController ===========');
        var requiredReferences: DataReference[] = [];

        const activationDocument: ActivationDocument = referencedDocument.data;

        /*****************
         * SITE
         ****************/

         const siteRefMap = await SiteService.getObjRefbyId(ctx, params, activationDocument.registeredResourceMrid);
        if (!siteRefMap.has(referencedDocument.collection)) {
            //Only include Site data in orders if it is not already know in destination collection
            if (siteRefMap.has(initialTarget)) {
                const siteRef = siteRefMap.get(initialTarget);
                requiredReferences.push({docType:DocType.SITE, collection:referencedDocument.collection, data: siteRef.data})
            }
        }

        console.info('============= END : getCreationRequierments - EligibilityController ===========');
        return requiredReferences;
    }




    private static async getCreationLinkedData(
        ctx: Context,
        params: STARParameters,
        referencedDocument: DataReference,
        initialTarget: string): Promise<DataReference[]>  {

        console.info('============= START : getCreationLinkedData - EligibilityController ===========');
        var requiredReferences: DataReference[] = [];

        const activationDocument: ActivationDocument = referencedDocument.data;
        const identity = params.values.get(ParametersType.IDENTITY);

        /*****************
         * ENERGY ACCOUNT
         ****************/
        const energyAccountList: any[] = await EnergyAccountController.getEnergyAccountForSystemOperatorObj(
            ctx,
            params,
            activationDocument.registeredResourceMrid,
            activationDocument.senderMarketParticipantMrid,
            activationDocument.startCreatedDateTime,
            initialTarget);

        if (energyAccountList && energyAccountList.length > 0) {

            for (var energyAccount of energyAccountList) {

                const existing = await EnergyAccountController.dataExists(ctx, params, energyAccount.energyAccountMarketDocumentMrid, referencedDocument.collection);
                if (!existing) {
                    requiredReferences.push({docType:DocType.ENERGY_ACCOUNT, collection:referencedDocument.collection, data: energyAccount})
                }
            }

        }

        /*****************
         * REFERENCE ENERGY ACCOUNT
         ****************/
         if (identity === OrganizationTypeMsp.RTE) {
            const referenceEnergyAccountList: any[] = await ReferenceEnergyAccountController.getReferenceEnergyAccountForSystemOperatorObj(
                ctx,
                params,
                activationDocument.registeredResourceMrid,
                activationDocument.senderMarketParticipantMrid,
                activationDocument.startCreatedDateTime,
                initialTarget);

            if (referenceEnergyAccountList && referenceEnergyAccountList.length > 0) {

                for (var referenceEnergyAccount of referenceEnergyAccountList) {

                    const existing = await EnergyAccountController.dataExists(ctx, params, referenceEnergyAccount.energyAccountMarketDocumentMrid, referencedDocument.collection);
                    if (!existing) {
                        requiredReferences.push({docType:DocType.REFERENCE_ENERGY_ACCOUNT, collection:referencedDocument.collection, data: referenceEnergyAccount})
                    }
                }

            }
        }


        /*****************
         * ENERGY AMOUNT
         ****************/
        const energyAmount: EnergyAmount = await EnergyAmountController.getEnergyAmountByActivationDocument(ctx, params, activationDocument.activationDocumentMrid, initialTarget);

        if (energyAmount
            && energyAmount.energyAmountMarketDocumentMrid
            && energyAmount.energyAmountMarketDocumentMrid.length > 0) {

            const dataReference: DataReference = {
                docType: DocType.ENERGY_AMOUNT,
                previousCollection: initialTarget,
                collection: referencedDocument.collection,
                dataAction: DataActionType.COLLECTION_CHANGE,
                data: energyAmount
            }

            requiredReferences.push(dataReference);
        }

         console.info('============= END : getCreationLinkedData - EligibilityController ===========');
        return requiredReferences;
    }





    public static async getEligibilityStatusState(
        ctx: Context,
        params: STARParameters,
        referencedDocuments: DataReference[]): Promise<DataReference[]> {
        console.info('============= START : getEligibilityState - EligibilityController ===========');
        var eligibilityReferences: DataReference[] = [];

        const activationDocumentRefMap:Map<string, DataReference>= ActivationDocumentService.dataReferenceArrayToMap(referencedDocuments);

        for (var referencedDocument of referencedDocuments) {
            const activationDocument: ActivationDocument = referencedDocument.data;
            const initialTarget = referencedDocument.collection;

            var targetDocument: string;

            if (activationDocument && activationDocument.eligibilityStatus === EligibilityStatusType.EligibilityAccepted) {
                targetDocument = await EligibilityController.findDataTarget(ctx, params, activationDocument, initialTarget, activationDocumentRefMap);
            } else {
                targetDocument = initialTarget;
            }
            referencedDocument.collection = targetDocument;

            if (initialTarget && targetDocument === initialTarget) {
                //Just update Order
                eligibilityReferences.push(referencedDocument);
            } else {
                //Before creation in new collection, it is needed to create requirements
                const requirements = await EligibilityController.getCreationRequierments(ctx, params, referencedDocument, initialTarget);
                for (var requirement of requirements) {
                    eligibilityReferences.push(requirement);
                }

                //Creation of the data in the new collection
                const dataReference: DataReference = {
                    docType: DocType.ACTIVATION_DOCUMENT,
                    previousCollection: initialTarget,
                    collection: targetDocument,
                    dataAction: DataActionType.COLLECTION_CHANGE,
                    data: referencedDocument.data
                }
                eligibilityReferences.push(dataReference);

                //After creation in new collection, it is needed to create linked data
                const linkedData = await EligibilityController.getCreationLinkedData(ctx, params, referencedDocument, initialTarget);
                for (var data of linkedData) {
                    eligibilityReferences.push(data);
                }

            }
        }

        console.info('============= END : getEligibilityState - EligibilityController ===========');
        return eligibilityReferences;
    }

}
