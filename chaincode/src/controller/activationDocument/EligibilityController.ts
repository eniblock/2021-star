import { DataActionType } from '../../enums/DataActionType';
import { DocType } from '../../enums/DocType';
import { EligibilityStatusType } from '../../enums/EligibilityStatusType';
import { OrganizationTypeMsp } from '../../enums/OrganizationMspType';
import { ParametersType } from '../../enums/ParametersType';
import { RoleType } from '../../enums/RoleType';

import { ActivationDocument } from '../../model/activationDocument/activationDocument';
import { EligibilityStatus } from '../../model/activationDocument/eligibilityStatus';
import { AttachmentFile } from '../../model/attachmentFile';
import { DataReference } from '../../model/dataReference';
import { EnergyAmount } from '../../model/energyAmount';
import { ReserveBidMarketDocument } from '../../model/reserveBidMarketDocument';
import { STARParameters } from '../../model/starParameters';
import { SystemOperator } from '../../model/systemOperator';
import { AttachmentFileController } from '../AttachmentFileController';

import { EnergyAccountController } from '../EnergyAccountController';
import { EnergyAmountController } from '../EnergyAmountController';
import { ParametersController } from '../ParametersController';
import { ReferenceEnergyAccountController } from '../ReferenceEnergyAccountController';
import { ReserveBidMarketDocumentController } from '../ReserveBidMarketDocumentController';

import { ActivationDocumentEligibilityService } from '../service/ActivationDocumentEligibilityService';
import { ActivationDocumentService } from '../service/ActivationDocumentService';
import { HLFServices } from '../service/HLFservice';
import { QueryStateService } from '../service/QueryStateService';
import { StarDataService } from '../service/StarDataService';
import { StarPrivateDataService } from '../service/StarPrivateDataService';

export class EligibilityController {



    public static async updateEligibilityStatus(
        params: STARParameters,
        inputStr: string): Promise<ActivationDocument> {

        params.logger.debug('============= START : updateEligibilityStatus EligibilityController ===========');

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

        params.logger.debug('=============  END  : updateEligibilityStatus EligibilityController ===========');
        return await ActivationDocumentEligibilityService.outputFormatFRActivationDocument(params, activationDocument);
    }


    private static generateTarget(
        params: STARParameters,
        targetArrayValue: string[]): string {

        var targetKey: string = '';
        var targetValue: string = '';

        // params.logger.debug("------------------")
        // params.logger.debug(JSON.stringify(targetArrayValue))
        // params.logger.debug("------------------")

        targetArrayValue = [...new Set(targetArrayValue)];
        if (targetArrayValue && targetArrayValue.length >0 ) {
            var finalTargetArrayValues:string[] = [];
            for (var value of targetArrayValue) {
                if (!finalTargetArrayValues.includes(value.toLowerCase())) {
                    finalTargetArrayValues.push(value.toLowerCase());
                }
            }
            finalTargetArrayValues.sort();
            targetKey = finalTargetArrayValues.join(ParametersController.targetJoinSeparator);
        }

        targetKey = targetKey.toLowerCase();

        // params.logger.debug("------------------")
        // params.logger.debug(targetKey)
        // params.logger.debug("------------------")

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

        params.logger.debug('============= START : findDataDestination - EligibilityController ===========');

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

        params.logger.debug('=============  END  : findDataDestination - EligibilityController ===========');
        return finalTarget;
    }




    private static async getCreationRequierments(
        params: STARParameters,
        referencedDocument: DataReference,
        initialTarget: string): Promise<DataReference[]>  {

        params.logger.debug('============= START : getCreationRequierments - EligibilityController ===========');
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

        params.logger.debug('=============  END  : getCreationRequierments - EligibilityController ===========');
        return requiredReferences;
    }




    private static async getCreationLinkedData(
        params: STARParameters,
        referencedDocument: DataReference,
        initialTarget: string): Promise<DataReference[]>  {

        params.logger.debug('============= START : getCreationLinkedData - EligibilityController ===========');
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


        /*****************
         * RESERVE BID MARKET DOCUMENT
         ****************/
        const reserveBidList: ReserveBidMarketDocument[] = await ReserveBidMarketDocumentController.getObjByMeteringPointMrid(
            params,
            activationDocument.registeredResourceMrid,
            initialTarget);

        var fileIdList: string[] = [];

        if (reserveBidList && reserveBidList.length > 0) {
            for (var reserveBidObj of reserveBidList) {
                if (reserveBidObj.attachments && reserveBidObj.attachments.length > 0) {
                    fileIdList = fileIdList.concat(reserveBidObj.attachments);
                }

                const existing = await ReserveBidMarketDocumentController.dataExists(
                    params, reserveBidObj.reserveBidMrid, referencedDocument.collection);

                if (!existing) {
                    requiredReferences.push({docType:DocType.RESERVE_BID_MARKET_DOCUMENT, collection:referencedDocument.collection, data: reserveBidObj})
                }
            }
        }


        /*****************
         * FILES
         ****************/
        const FileList: AttachmentFile[] = await AttachmentFileController.getObjsByIdList(params, fileIdList, initialTarget);

        if (FileList && FileList.length > 0) {

            for (var attachmentFile of FileList) {

                const existing = await AttachmentFileController.dataExists(params, attachmentFile.fileId, referencedDocument.collection);
                if (!existing) {
                    requiredReferences.push({docType:DocType.ATTACHMENT_FILE, collection:referencedDocument.collection, data: attachmentFile})
                }
            }

        }



         params.logger.debug('============= END  : getCreationLinkedData - EligibilityController ===========');
        return requiredReferences;
    }


    private static async getAutomaticEligibles(params: STARParameters, activationDocumentMridList: string[]): Promise<DataReference[]> {
        params.logger.debug('============= START : getAutomaticEligibles - EligibilityController ===========');
        var eligibilityReferences: DataReference[] = [];

        const collection: string = await HLFServices.getCollectionFromParameters(params, ParametersType.DATA_TARGET, RoleType.Role_Producer);

        var finalTarget: string = '';
        var targetArrayValue: string[];

        if (collection) {
            targetArrayValue = collection.split(ParametersController.targetJoinSeparator);
        }

        const collectionTSO = await HLFServices.getCollectionFromParameters(params, ParametersType.DATA_TARGET, RoleType.Role_TSO);
        if (collectionTSO) {
            targetArrayValue = targetArrayValue.concat(collectionTSO.split(ParametersController.targetJoinSeparator));
        }
        finalTarget = EligibilityController.generateTarget(params, targetArrayValue);

        params.logger.debug("collection: ", collection);
        params.logger.debug("finalTarget: ", finalTarget);

        const automaticEligibilityList = params.values.get(ParametersType.AUTOMATIC_ELIGIBILITY);

        if (automaticEligibilityList && automaticEligibilityList.length > 0) {
            for (var automaticEligibility of automaticEligibilityList) {
                if (automaticEligibility && automaticEligibility.length > 0) {
                    const values: string[] = automaticEligibility.split("-");
                    if (values && values.length == 3) {
                        const args: string[] = [];
                        args.push(`"messageType":"${values[0]}"`);
                        args.push(`"businessType":"${values[1]}"`);
                        args.push(`"reasonCode":"${values[2]}"`);

                        args.push(`"eligibilityStatus": ${EligibilityStatusType.EligibilityAccepted}`);
                        args.push(`"eligibilityStatusEditable":false`);

                        const query = await QueryStateService.buildQuery({documentType: DocType.ACTIVATION_DOCUMENT, queryArgs: args});

                        const activationDocumentList: ActivationDocument[] = await QueryStateService.getPrivateQueryArrayResult(params, {query: query, docType: DocType.ACTIVATION_DOCUMENT, collection: collection});
                        if (activationDocumentList && activationDocumentList.length > 0) {
                            for (var activationDocument of activationDocumentList) {
                                if (activationDocument
                                    && activationDocument.activationDocumentMrid
                                    && activationDocument.activationDocumentMrid.length > 0
                                    && !activationDocumentMridList.includes(activationDocument.activationDocumentMrid)) {

                                    // Depend if eligibility needs to be true
                                    // activationDocument.eligibilityStatus = EligibilityStatusType.EligibilityAccepted;
                                    activationDocument.eligibilityStatusEditable = false;
                                    activationDocument = await ActivationDocumentEligibilityService.outputFormatFRActivationDocument(params, activationDocument);

                                    const dataReference: DataReference = {
                                        docType: DocType.ACTIVATION_DOCUMENT,
                                        previousCollection: collection,
                                        collection: finalTarget,
                                        dataAction: DataActionType.COLLECTION_CHANGE,
                                        data: activationDocument
                                    }

                                    eligibilityReferences.push(dataReference);
                                }
                            }
                        }
                    }

                }
            }
        }

        params.logger.debug('=============  END  : getAutomaticEligibles - EligibilityController ===========');
        return eligibilityReferences;
    }




    public static async getEligibilityStatusState(
        params: STARParameters,
        referencedDocuments: DataReference[]): Promise<DataReference[]> {
        params.logger.debug('============= START : getEligibilityState - EligibilityController ===========');
        var eligibilityReferences: DataReference[] = [];

        const activationDocumentRefMap:Map<string, DataReference>= ActivationDocumentService.dataReferenceArrayToMap(referencedDocuments);
        const activationDocumentMridList: string[] = [];

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
            activationDocumentMridList.push(referencedDocument.data.activationDocumentMrid);
        }
        var automaticEligibilityReferences: DataReference[] = await this.getAutomaticEligibles(params, activationDocumentMridList);
        if (automaticEligibilityReferences && automaticEligibilityReferences.length > 0) {
            for (var automaticEligibilityReference of automaticEligibilityReferences) {
                if (automaticEligibilityReference && automaticEligibilityReference.data) {
                    const initialTarget: string = automaticEligibilityReference.previousCollection;

                    //Before creation in new collection, it is needed to create requirements
                    const requirements = await EligibilityController.getCreationRequierments(params, automaticEligibilityReference, initialTarget);
                    for (var requirement of requirements) {
                        eligibilityReferences.push(requirement);
                    }

                    //Create the reference in the new collection
                    eligibilityReferences.push(automaticEligibilityReference);


                    //After creation in new collection, it is needed to create linked data
                    const linkedData = await EligibilityController.getCreationLinkedData(params, automaticEligibilityReference, initialTarget);
                    for (var data of linkedData) {
                        eligibilityReferences.push(data);
                    }
                }
            }
        }

        params.logger.debug('=============  END  : getEligibilityState - EligibilityController ===========');
        return eligibilityReferences;
    }

}
