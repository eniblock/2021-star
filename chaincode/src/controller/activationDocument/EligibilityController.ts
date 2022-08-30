import { DataActionType } from '../../enums/DataActionType';
import { DocType } from '../../enums/DocType';
import { EligibilityStatusType } from '../../enums/EligibilityStatusType';
import { OrganizationTypeMsp } from '../../enums/OrganizationMspType';
import { ParametersType } from '../../enums/ParametersType';

import { ActivationDocument } from '../../model/activationDocument/activationDocument';
import { EligibilityStatus } from '../../model/activationDocument/eligibilityStatus';
import { DataReference } from '../../model/dataReference';
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
import { StarDataService } from '../service/StarDataService';
import { StarPrivateDataService } from '../service/StarPrivateDataService';

export class EligibilityController {



    public static async updateEligibilityStatus(
        params: STARParameters,
        inputStr: string): Promise<ActivationDocument> {

        console.debug('============= START : updateEligibilityStatus EligibilityController ===========');

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
            activationDocumentReferenceMap = await StarPrivateDataService.getObjRefbyId(params, {docType: DocType.ACTIVATION_DOCUMENT, id: statusToUpdate.activationDocumentMrid});
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
            systemOperatorObj = await StarDataService.getObj(params, {id: activationDocument.senderMarketParticipantMrid, docType: DocType.SYSTEM_OPERATOR});
        } catch (error) {
            throw new Error(error.message.concat(` for Activation Document ${activationDocument.activationDocumentMrid} status Update.`));
        }

        if (!systemOperatorObj || systemOperatorObj.systemOperatorMarketParticipantName.toLowerCase() !== identity.toLowerCase() ) {
            throw new Error(`ERROR updateEligibilityStatus : ${identity.toLowerCase()} has no right to modify the Eligibility Status of ${systemOperatorObj.systemOperatorMarketParticipantName.toLowerCase()} document.`);
        }

        activationDocument.eligibilityStatus = newStatus;
        activationDocument.eligibilityStatusEditable = false;

        await ActivationDocumentService.write(params, activationDocument, activationDocumentReference.collection);

        console.debug('============= END   : updateEligibilityStatus EligibilityController ===========');
        return await ActivationDocumentEligibilityService.outputFormatFRActivationDocument(params, activationDocument);
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
        params: STARParameters,
        activationDocument: ActivationDocument,
        currentTarget:string,
        activationDocumentRefMap:Map<string, DataReference>=null): Promise<string> {

        console.debug('============= START : findDataDestination - EligibilityController ===========');

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
            const parentDocumentMapRef:Map<string, DataReference> =
                await StarPrivateDataService.getObjRefbyId(params, {docType: DocType.ACTIVATION_DOCUMENT, id: activationDocument.subOrderList[0]});
            parentDocumentRef = parentDocumentMapRef.values().next().value;
            if (parentDocumentRef && parentDocumentRef.data) {
                parentDocument = parentDocumentRef.data;
            }
        }

        var sender: SystemOperator;
        if (parentDocument && parentDocument.senderMarketParticipantMrid) {
            sender = await StarDataService.getObj(params, {id: parentDocument.senderMarketParticipantMrid, docType: DocType.SYSTEM_OPERATOR});
        }

        if (sender && sender.systemOperatorMarketParticipantName) {
            targetArrayValue.push(sender.systemOperatorMarketParticipantName.toLowerCase());
        }

        finalTarget = EligibilityController.generateTarget(params, targetArrayValue);

        console.debug('============= END : findDataDestination - EligibilityController ===========');
        return finalTarget;
    }




    private static async getCreationRequierments(
        params: STARParameters,
        referencedDocument: DataReference,
        initialTarget: string): Promise<DataReference[]>  {

        console.debug('============= START : getCreationRequierments - EligibilityController ===========');
        var requiredReferences: DataReference[] = [];

        const activationDocument: ActivationDocument = referencedDocument.data;

        /*****************
         * SITE
         ****************/

         const siteRefMap = await StarPrivateDataService.getObjRefbyId(params, {docType: DocType.SITE, id: activationDocument.registeredResourceMrid});
        if (!siteRefMap.has(referencedDocument.collection)) {
            //Only include Site data in orders if it is not already know in destination collection
            if (siteRefMap.has(initialTarget)) {
                const siteRef = siteRefMap.get(initialTarget);
                requiredReferences.push({docType:DocType.SITE, collection:referencedDocument.collection, data: siteRef.data})
            }
        }

        console.debug('============= END : getCreationRequierments - EligibilityController ===========');
        return requiredReferences;
    }




    private static async getCreationLinkedData(
        params: STARParameters,
        referencedDocument: DataReference,
        initialTarget: string): Promise<DataReference[]>  {

        console.debug('============= START : getCreationLinkedData - EligibilityController ===========');
        var requiredReferences: DataReference[] = [];

        const activationDocument: ActivationDocument = referencedDocument.data;
        const identity = params.values.get(ParametersType.IDENTITY);

        /*****************
         * ENERGY ACCOUNT
         ****************/
        const energyAccountList: any[] = await EnergyAccountController.getEnergyAccountForSystemOperatorObj(
            params,
            activationDocument.registeredResourceMrid,
            activationDocument.senderMarketParticipantMrid,
            activationDocument.startCreatedDateTime,
            initialTarget);

        if (energyAccountList && energyAccountList.length > 0) {

            for (var energyAccount of energyAccountList) {

                const existing = await EnergyAccountController.dataExists(params, energyAccount.energyAccountMarketDocumentMrid, referencedDocument.collection);
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
                params,
                activationDocument.registeredResourceMrid,
                activationDocument.senderMarketParticipantMrid,
                activationDocument.startCreatedDateTime,
                initialTarget);

            if (referenceEnergyAccountList && referenceEnergyAccountList.length > 0) {

                for (var referenceEnergyAccount of referenceEnergyAccountList) {

                    const existing = await EnergyAccountController.dataExists(params, referenceEnergyAccount.energyAccountMarketDocumentMrid, referencedDocument.collection);
                    if (!existing) {
                        requiredReferences.push({docType:DocType.REFERENCE_ENERGY_ACCOUNT, collection:referencedDocument.collection, data: referenceEnergyAccount})
                    }
                }

            }
        }


        /*****************
         * ENERGY AMOUNT
         ****************/
        const energyAmount: EnergyAmount = await EnergyAmountController.getEnergyAmountByActivationDocument(params, activationDocument.activationDocumentMrid, initialTarget);

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

         console.debug('============= END : getCreationLinkedData - EligibilityController ===========');
        return requiredReferences;
    }





    public static async getEligibilityStatusState(
        params: STARParameters,
        referencedDocuments: DataReference[]): Promise<DataReference[]> {
        console.debug('============= START : getEligibilityState - EligibilityController ===========');
        var eligibilityReferences: DataReference[] = [];

        const activationDocumentRefMap:Map<string, DataReference>= ActivationDocumentService.dataReferenceArrayToMap(referencedDocuments);

        for (var referencedDocument of referencedDocuments) {
            const activationDocument: ActivationDocument = referencedDocument.data;
            const initialTarget = referencedDocument.collection;

            var targetDocument: string;

            if (activationDocument && activationDocument.eligibilityStatus === EligibilityStatusType.EligibilityAccepted) {
                targetDocument = await EligibilityController.findDataTarget(params, activationDocument, initialTarget, activationDocumentRefMap);
            } else {
                targetDocument = initialTarget;
            }
            referencedDocument.collection = targetDocument;

            if (initialTarget && targetDocument === initialTarget) {
                //Just update Order
                eligibilityReferences.push(referencedDocument);
            } else {
                //Before creation in new collection, it is needed to create requirements
                const requirements = await EligibilityController.getCreationRequierments(params, referencedDocument, initialTarget);
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
                const linkedData = await EligibilityController.getCreationLinkedData(params, referencedDocument, initialTarget);
                for (var data of linkedData) {
                    eligibilityReferences.push(data);
                }

            }
        }

        console.debug('============= END : getEligibilityState - EligibilityController ===========');
        return eligibilityReferences;
    }

}
