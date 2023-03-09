import { isEmpty } from 'lodash';

import { DocType } from '../../enums/DocType';
import { EligibilityStatusType } from '../../enums/EligibilityStatusType';
import { OrganizationTypeMsp } from '../../enums/OrganizationMspType';
import { ParametersType } from '../../enums/ParametersType';
import { RoleType } from '../../enums/RoleType';

import { ActivationDocument } from '../../model/activationDocument/activationDocument';
import { DataReference } from '../../model/dataReference';
import { Producer } from '../../model/producer';
import { STARParameters } from '../../model/starParameters';
import { SystemOperator } from '../../model/systemOperator';

import { ActivationDocumentCompositeKey } from '../../model/activationDocument/activationDocumentCompositeKey';
import { ActivationDocumentCompositeKeyAbstract } from '../../model/dataIndex/activationDocumentCompositeKeyAbstract';
import { IndexedData } from '../../model/dataIndex/dataIndexers';
import { ActivationCompositeKeyIndexersController } from '../dataIndex/ActivationCompositeKeyIndexersController';
import { ActivationEnergyAmountIndexersController } from '../dataIndex/ActivationEnergyAmountIndexersController';
import { SiteActivationIndexersController } from '../dataIndex/SiteActivationIndexersController';
import { ActivationDocumentEligibilityService } from '../service/ActivationDocumentEligibilityService';
import { ActivationDocumentService } from '../service/ActivationDocumentService';
import { HLFServices } from '../service/HLFservice';
import { QueryStateService } from '../service/QueryStateService';
import { StarDataService } from '../service/StarDataService';
import { StarPrivateDataService } from '../service/StarPrivateDataService';
import { FeedbackProducerController } from '../FeedbackProducerController';

export class ActivationDocumentController {
    public static async getActivationDocumentByProducer(
        params: STARParameters,
        producerMrid: string): Promise<string> {
        params.logger.info('============= START : get ActivationDocument By Producer ===========');

        const query = `{"selector": {"docType": "${DocType.ACTIVATION_DOCUMENT}", "receiverMarketParticipantMrid": "${producerMrid}"}}`;
        params.logger.debug('query: ', query);

        const collections: string[] = await HLFServices.getCollectionsFromParameters(
            params, ParametersType.DATA_TARGET, ParametersType.ALL);

        const allResults: ActivationDocument[] = await ActivationDocumentService.getQueryArrayResult(
            params, query, collections);
        const formatedResults: ActivationDocument[] =
            await ActivationDocumentEligibilityService.formatActivationDocuments(params, allResults);
        const formated = JSON.stringify(formatedResults);

        params.logger.info('=============  END  : get ActivationDocument By Producer ===========');
        return formated;
    }

    public static async getActivationDocumentBySystemOperator(
        params: STARParameters,
        systemOperatorMrid: string): Promise<string> {
        params.logger.info('============= START : get ActivationDocument By SystemOperator ===========');

        const query = `{"selector": {"docType": "${DocType.ACTIVATION_DOCUMENT}", "senderMarketParticipantMrid": "${systemOperatorMrid}"}}`;
        params.logger.debug('query: ', query);

        const collections: string[] = await HLFServices.getCollectionsFromParameters(
            params, ParametersType.DATA_TARGET, ParametersType.ALL);

        const allResults: ActivationDocument[] = await ActivationDocumentService.getQueryArrayResult(
            params, query, collections);
        const formatedResults: ActivationDocument[] =
            await ActivationDocumentEligibilityService.formatActivationDocuments(params, allResults);
        const formated = JSON.stringify(formatedResults);

        params.logger.info('=============  END  : get ActivationDocument By SystemOperator ===========');
        return formated;
    }

    public static async getActivationDocumentByCompositeKey(
        params: STARParameters,
        inputStr: string): Promise<string> {
        params.logger.info('============= START : get ActivationDocument By Composite Key ===========');

        const activationDocumentCompositeKeyObj: ActivationDocumentCompositeKey =
            ActivationDocumentCompositeKey.formatString(inputStr);

        const activationDocumentCompositeKeyId =
            ActivationCompositeKeyIndexersController.getActivationDocumentCompositeKeyId(
                activationDocumentCompositeKeyObj);
        const objResult = await this.getActivationDocumentObjByCompositeKey(params, activationDocumentCompositeKeyId);
        const formated = JSON.stringify(objResult);

        params.logger.info('=============  END  : get ActivationDocument By Composite Key ===========');
        return formated;
    }

    public static async getActivationDocumentByCompositeKeyList(
        params: STARParameters,
        inputStr: string): Promise<string> {
        params.logger.info('============= START : get ActivationDocument By Composite Key List ===========');

        const activationDocumentCompositeKeyList: ActivationDocumentCompositeKey[] =
            ActivationDocumentCompositeKey.formatListString(inputStr);

        const resultList: ActivationDocument[] = [];
        if (activationDocumentCompositeKeyList) {
            for (const activationDocumentCompositeKeyObj of activationDocumentCompositeKeyList) {
                const activationDocumentCompositeKeyId =
                    ActivationCompositeKeyIndexersController.getActivationDocumentCompositeKeyId(
                        activationDocumentCompositeKeyObj);

                const objResult =
                    await this.getActivationDocumentObjByCompositeKey(params, activationDocumentCompositeKeyId);
                if (objResult && objResult.activationDocumentMrid && objResult.activationDocumentMrid.length > 0) {
                    resultList.push(objResult);
                }
            }
        }

        const formated = JSON.stringify(resultList);

        params.logger.info('=============  END  : get ActivationDocument By Composite Key List ===========');
        return formated;
    }

    public static async getActivationDocumentObjByCompositeKey(
        params: STARParameters,
        activationDocumentCompositeKeyId: string): Promise<ActivationDocument> {
        params.logger.debug('============= START : get ActivationDocument obj By Composite Key ===========');

        let activationDocument: ActivationDocument = null;
        let activationDocumentCompositeKeyIndex: ActivationDocumentCompositeKeyAbstract = null;

        try {
            const indexedData: IndexedData =
                await ActivationCompositeKeyIndexersController.getByCompositeKey(
                    params, activationDocumentCompositeKeyId);
            activationDocumentCompositeKeyIndex = indexedData.indexedDataAbstractMap.values().next().value;
        } catch (err) {
            // Do Nothing, just cannot be found
        }

        if (activationDocumentCompositeKeyIndex
            && activationDocumentCompositeKeyIndex.activationDocumentCompositeKey === activationDocumentCompositeKeyId
            && activationDocumentCompositeKeyIndex.activationDocumentMrid
            && activationDocumentCompositeKeyIndex.activationDocumentMrid.length > 0) {

            activationDocument = await this.getActivationDocumentById(
                params, activationDocumentCompositeKeyIndex.activationDocumentMrid);
        }

        params.logger.debug('=============  END  : get ActivationDocument obj By Composite Key ===========');
        return activationDocument;
    }


    public static async getActivationDocumentRefById(
        params: STARParameters,
        activationDocumentMrid: string,
        target: string = ''): Promise<DataReference> {
        params.logger.debug('============= START : get ActivationDocument Ref By Id ===========');

        let orderObj: ActivationDocument;
        if (target && target.length > 0) {
            orderObj = await StarPrivateDataService.getObj(
                params, {id: activationDocumentMrid, docType: DocType.ACTIVATION_DOCUMENT, collection: target});
        } else {
            const result: Map<string, DataReference> = await StarPrivateDataService.getObjRefbyId(
                params, {docType: DocType.ACTIVATION_DOCUMENT, id: activationDocumentMrid});
            const dataReference = result.values().next().value;
            if (dataReference && dataReference.data) {
                orderObj = dataReference.data;
            }
            target = result.keys().next().value;

        }

        let dataFormatedResult: ActivationDocument = null;
        if (orderObj) {
            dataFormatedResult =
                await ActivationDocumentEligibilityService.outputFormatFRActivationDocument(params, orderObj);
        }

        params.logger.debug('=============  END  : get ActivationDocument Ref By Id ===========');
        return {collection: target,
                docType: DocType.ACTIVATION_DOCUMENT,
                data: dataFormatedResult};
    }



    public static async getActivationDocumentById(
        params: STARParameters,
        activationDocumentMrid: string,
        target: string = ''): Promise<ActivationDocument> {
        params.logger.debug('============= START : get ActivationDocument By Id ===========');

        let orderObj: ActivationDocument;
        if (target && target.length > 0) {
            orderObj = await StarPrivateDataService.getObj(
                params, {id: activationDocumentMrid, docType: DocType.ACTIVATION_DOCUMENT, collection: target});
        } else {
            const result: Map<string, DataReference> = await StarPrivateDataService.getObjRefbyId(
                params, {docType: DocType.ACTIVATION_DOCUMENT, id: activationDocumentMrid});
            const dataReference = result.values().next().value;
            if (dataReference && dataReference.data) {
                orderObj = dataReference.data;
            }
        }

        let formatedResult: ActivationDocument = null;
        if (orderObj) {
            formatedResult =
                await ActivationDocumentEligibilityService.outputFormatFRActivationDocument(params, orderObj);
        }

        params.logger.debug('=============  END  : get ActivationDocument By Id ===========');
        return formatedResult;
    }

    public static async getActivationDocumentByQuery(
        params: STARParameters,
        query: string,
        targets: string[] = []): Promise<string> {
        params.logger.info('============= START : get ActivationDocument By Query ===========');

        let collections: string[];
        if (targets && targets.length > 0) {
            collections = targets;
        } else {
            collections =
                await HLFServices.getCollectionsFromParameters(params, ParametersType.DATA_TARGET, ParametersType.ALL);
        }

        const formatedResults: ActivationDocument[] =
            await this.getActivationDocumentObjByQuery(params, query, collections);

        const formated = JSON.stringify(formatedResults);

        params.logger.info('=============  END  : get ActivationDocument By Query ===========');
        return formated;
    }

    public static async getActivationDocumentObjByQuery(
        params: STARParameters,
        query: string,
        targets: string[] = []): Promise<ActivationDocument[]> {
        params.logger.info('============= START : get ActivationDocument Obj By Query ===========');

        let collections: string[];
        if (targets && targets.length > 0) {
            collections = targets;
        } else {
            collections =
                await HLFServices.getCollectionsFromParameters(params, ParametersType.DATA_TARGET, ParametersType.ALL);
        }

        params.logger.debug('query: ', query);
        const allResults: any[] =
            await ActivationDocumentService.getQueryArrayResult(params, query, collections);
        const formatedResults: ActivationDocument[] =
            await ActivationDocumentEligibilityService.formatActivationDocuments(params, allResults);

        params.logger.info('=============  END  : get ActivationDocument Obj By Query ===========');
        return formatedResults;
    }


    public static async getActivationDocumentRefByQuery(
        params: STARParameters,
        query: string,
        targets: string[] = []): Promise<DataReference[]> {
        params.logger.info('============= START : get ActivationDocument Reference By Query ===========');

        let collections: string[];
        if (targets && targets.length > 0) {
            collections = targets;
        } else {
            collections =
                await HLFServices.getCollectionsFromParameters(params, ParametersType.DATA_TARGET, ParametersType.ALL);
        }

        params.logger.debug('query: ', query);
        const allResults: DataReference[] =
            await ActivationDocumentService.getQueryRefArrayResult(params, query, collections);
        const formatedResults: DataReference[] =
            await ActivationDocumentEligibilityService.formatActivationDocumentRefs(params, allResults);

        params.logger.info('=============  END  : get ActivationDocument Reference By Query ===========');
        return formatedResults;
    }


    public static async getAll(params: STARParameters): Promise<DataReference[]> {
        params.logger.info('============= START : get all ActivationDocumentController ===========');

        const collections =
            await HLFServices.getCollectionsFromParameters(params, ParametersType.DATA_TARGET, ParametersType.ALL);

        const dataList: DataReference[] = [];
        for (const collection of collections) {
            const allResults =
                await QueryStateService.getAllPrivateData(params, DocType.ACTIVATION_DOCUMENT, collection);
            if (allResults && allResults.length > 0) {
                for (const result of allResults) {
                    dataList.push({collection, data: result, docType: DocType.ACTIVATION_DOCUMENT});
                }
            }
        }

        params.logger.info('=============  END  : get all ActivationDocumentController ===========');

        return dataList;
    }

    public static async createActivationDocument(
        params: STARParameters,
        inputStr: string) {
        params.logger.info('============= START : Create ActivationDocumentController ===========');

        const identity = params.values.get(ParametersType.IDENTITY);
        if (identity !== OrganizationTypeMsp.RTE && identity !== OrganizationTypeMsp.ENEDIS) {
            throw new Error(`Organisation, ${identity} does not have rights for Activation Document`);
        }

        const activationDocumentObj: ActivationDocument = ActivationDocument.formatString(inputStr);
        await ActivationDocumentController.createActivationDocumentObj(params, activationDocumentObj);

        params.logger.info('=============  END  : Create ActivationDocumentController ===========');
    }

    public static async createActivationDocumentByReference(
        params: STARParameters,
        dataReference: DataReference) {
        params.logger.debug('============= START : create ByReference ActivationDocumentController ===========');

        const identity = params.values.get(ParametersType.IDENTITY);
        if (identity !== OrganizationTypeMsp.RTE && identity !== OrganizationTypeMsp.ENEDIS) {
            throw new Error(`Organisation, ${identity} does not have rights for Activation Document`);
        }

        ActivationDocument.schema.validateSync(
            dataReference.data,
            {strict: true, abortEarly: false},
        );

        await ActivationDocumentController.createActivationDocumentObj(
            params, dataReference.data, dataReference.collection);

        params.logger.debug('=============  END  : create ByReference ActivationDocumentController ===========');
    }

    public static async createActivationDocumentList(
        params: STARParameters,
        inputStr: string) {
        params.logger.info('============= START : Create List ActivationDocumentController ===========');

        const identity = params.values.get(ParametersType.IDENTITY);
        if (identity !== OrganizationTypeMsp.RTE && identity !== OrganizationTypeMsp.ENEDIS) {
            throw new Error(`Organisation, ${identity} does not have rights for Activation Document`);
        }

        const activationDocumentList: ActivationDocument[] = ActivationDocument.formatListString(inputStr);

        if (activationDocumentList) {
            for (const activationDocumentObj of activationDocumentList) {
                await ActivationDocumentController.createActivationDocumentObj(params, activationDocumentObj);
            }
        }

        params.logger.info('=============  END  : Create List ActivationDocumentController ===========');
    }

    public static async deleteActivationDocumentObj(
        params: STARParameters,
        activationDocumentObj: ActivationDocument,
        target: string = '') {
        params.logger.debug('============= START : Delete createActivationDocumentObj ===========');

        await ActivationDocumentService.delete(params, activationDocumentObj, target);

        await FeedbackProducerController.delete(params, activationDocumentObj.activationDocumentMrid, target);

        await SiteActivationIndexersController.deleteActivationReference(
            params,
            activationDocumentObj.activationDocumentMrid,
            activationDocumentObj.registeredResourceMrid,
            activationDocumentObj.startCreatedDateTime,
            target);

        await ActivationEnergyAmountIndexersController.deleteEnergyAmountReference(
            params,
            activationDocumentObj.activationDocumentMrid,
            target);

        params.logger.debug('=============  END  : Delete createActivationDocumentObj ===========');
    }

    private static async createActivationDocumentObj(
        params: STARParameters,
        activationDocumentObj: ActivationDocument,
        definedTarget: string = '') {
        params.logger.debug('============= START : Create createActivationDocumentObj ===========');

        const identity = params.values.get(ParametersType.IDENTITY);

        if (!activationDocumentObj.revisionNumber
            || activationDocumentObj.revisionNumber.length === 0) {

            activationDocumentObj.revisionNumber = '1';
        }

        if (!definedTarget || definedTarget === '') {
            activationDocumentObj.reconciliationStatus = '';
        }

        let systemOperatorObj: SystemOperator;
        try {
            systemOperatorObj =
                await StarDataService.getObj(
                    params, {id: activationDocumentObj.senderMarketParticipantMrid, docType: DocType.SYSTEM_OPERATOR});
        } catch (error) {
            throw new Error('ERROR createActivationDocument : '.concat(error.message).concat(` for Activation Document ${activationDocumentObj.activationDocumentMrid} creation.`));
        }

        if (systemOperatorObj.systemOperatorMarketParticipantName.toLowerCase() !== identity.toLowerCase() ) {
            throw new Error(`Organisation, ${identity} cannot send Activation Document for sender ${systemOperatorObj.systemOperatorMarketParticipantName}`);
        }

        let producerObj: Producer;
        if (activationDocumentObj.receiverMarketParticipantMrid) {
            try {
                producerObj =
                    await StarDataService.getObj(params, {id: activationDocumentObj.receiverMarketParticipantMrid});
            } catch (error) {
                throw new Error(`Producer : ${activationDocumentObj.receiverMarketParticipantMrid} does not exist for Activation Document ${activationDocumentObj.activationDocumentMrid} creation.`);
            }
        }

        let producerSystemOperatorObj: SystemOperator;
        if (producerObj) {
            producerSystemOperatorObj = JSON.parse(JSON.stringify(producerObj));
        }

        /* Mix Collection is true if order doesn't directly go to producer */
        const roleTable: Map<string, string> = params.values.get(ParametersType.ROLE_TABLE);
        let roleProducer: string = '';
        let roleSystemOperator: string = '';

        let producerName: string;
        if (producerObj) {
            producerName = producerObj.producerMarketParticipantName;
            if (producerName && producerName.length > 0) {
                producerName = producerName.toLowerCase();
            }
        }

        let producerSystemOperatorName: string;
        if (producerSystemOperatorObj) {
            producerSystemOperatorName = producerSystemOperatorObj.systemOperatorMarketParticipantName;
            if (producerSystemOperatorName && producerSystemOperatorName.length > 0) {
                producerSystemOperatorName = producerSystemOperatorName.toLowerCase();
            }
        }

        if (roleTable.has(producerName)) {
            roleProducer = roleTable.get(producerName);
        } else if (roleTable.has(producerSystemOperatorName)) {
            roleProducer = roleTable.get(producerSystemOperatorName);
        }

        let systemOperatorName: string;
        if (systemOperatorObj) {
            systemOperatorName = systemOperatorObj.systemOperatorMarketParticipantName;
            if (systemOperatorName && systemOperatorName.length > 0) {
                systemOperatorName = systemOperatorName.toLowerCase();
            }
        }

        if (roleTable.has(systemOperatorName)) {
            roleSystemOperator = roleTable.get(systemOperatorName);
        }

        // Define target collection
        let targetDocument: string =
            await HLFServices.getCollectionOrDefault(params, ParametersType.DATA_TARGET, definedTarget);
        if (producerSystemOperatorObj
            && producerSystemOperatorObj.systemOperatorMarketParticipantName
            && roleTable.has(producerSystemOperatorObj.systemOperatorMarketParticipantName.toLowerCase())) {
            const collectionMap: Map<string, string[]> = params.values.get(ParametersType.DATA_TARGET);

            const target = producerSystemOperatorObj.systemOperatorMarketParticipantName.toLowerCase();
            targetDocument = collectionMap.get(target)[0];
        }

        /* Test Site existence if order does not come from TSO and goes to DSO */
        if (!producerSystemOperatorObj
            || !producerSystemOperatorObj.systemOperatorMarketParticipantName
            || producerSystemOperatorObj.systemOperatorMarketParticipantName === '') {

            let siteRef: DataReference;
            try {
                const siteRefMap: Map<string, DataReference> =
                    await StarPrivateDataService.getObjRefbyId(
                        params, {docType: DocType.SITE, id: activationDocumentObj.registeredResourceMrid});
                if (targetDocument && targetDocument.length > 0) {
                    siteRef = siteRefMap.get(targetDocument);
                } else {
                    siteRef = siteRefMap.values().next().value;
                }
            } catch (error) {
                throw new Error(error.message.concat(` for Activation Document ${activationDocumentObj.activationDocumentMrid} creation.`));
            }
            if (!siteRef
                || (siteRef.collection !== targetDocument && !targetDocument && targetDocument.length > 0)
                || !siteRef.data.meteringPointMrid
                || siteRef.data.meteringPointMrid !== activationDocumentObj.registeredResourceMrid) {

                throw new Error(`Site : ${activationDocumentObj.registeredResourceMrid} does not exist for Activation Document ${activationDocumentObj.activationDocumentMrid} creation.`);
            }
        }

        if (isEmpty(activationDocumentObj.endCreatedDateTime) && isEmpty(activationDocumentObj.orderValue)) {
            throw new Error(`Order must have a limitation value`);
        }

        const activationDocumentRules: string[] = params.values.get(ParametersType.ACTIVATION_DOCUMENT_RULES);
        const pattern =
            activationDocumentObj.messageType
            + '-' + activationDocumentObj.businessType
            + '-' + activationDocumentObj.reasonCode;
        if (activationDocumentRules && !activationDocumentRules.includes(pattern)) {
            throw new Error(`Incoherency between messageType, businessType and reason code for Activation Document ${activationDocumentObj.activationDocumentMrid} creation.`);
        }

        if (activationDocumentObj.endCreatedDateTime) {
            activationDocumentObj.orderEnd = true;
        } else {
            activationDocumentObj.orderEnd = false;
        }

        if (RoleType.Role_DSO === roleProducer) {
            activationDocumentObj.receiverRole = RoleType.Role_DSO;
        } else {
            activationDocumentObj.receiverRole = RoleType.Role_Producer;
        }

        const tsoToDsoParent: boolean = (
            RoleType.Role_TSO === roleSystemOperator
            && RoleType.Role_DSO === roleProducer
            && activationDocumentObj.startCreatedDateTime !== '');

        const tsoEndState: boolean = (
            RoleType.Role_TSO === roleSystemOperator
            && RoleType.Role_DSO !== roleProducer
            && activationDocumentObj.startCreatedDateTime !== ''
            && activationDocumentObj.orderEnd === false
            && ['A54', 'A98'].includes(activationDocumentObj.messageType));

        activationDocumentObj.potentialParent = tsoToDsoParent || tsoEndState;

        const dsoChild: boolean =
            (RoleType.Role_DSO === roleSystemOperator
            && activationDocumentObj.startCreatedDateTime !== '');
        params.logger.debug("roleSystemOperator:", roleSystemOperator);
        params.logger.debug("dsoChild:", dsoChild);

        const tsoChild: boolean =
            (RoleType.Role_TSO === roleSystemOperator
            && activationDocumentObj.orderEnd === true
            && !activationDocumentObj.startCreatedDateTime);
        params.logger.debug("tsoChild:", tsoChild);


        activationDocumentObj.potentialChild = dsoChild || tsoChild;
        params.logger.debug("activationDocumentObj.potentialChild:", activationDocumentObj.potentialChild);

        activationDocumentObj.eligibilityStatus =
            ActivationDocumentEligibilityService.statusInternationalValue(activationDocumentObj.eligibilityStatus);
        activationDocumentObj.eligibilityStatus =
            ActivationDocumentEligibilityService.checkEligibilityStatus(params, activationDocumentObj);
        if (activationDocumentObj.eligibilityStatus === EligibilityStatusType.EligibilityAccepted
            || (RoleType.Role_TSO === roleSystemOperator && RoleType.Role_DSO === roleProducer)) {

            activationDocumentObj.eligibilityStatusEditable = false;
        } else {
            activationDocumentObj.eligibilityStatusEditable = true;
        }

        const compositeKey = ActivationDocumentCompositeKey.formatActivationDocument(activationDocumentObj);
        const activationDocumentCompositeKeyId =
            ActivationCompositeKeyIndexersController.getActivationDocumentCompositeKeyId(compositeKey);

        if (!definedTarget || definedTarget.length === 0) {
            // Only control when it's an original creation (by list)
            // Don't do control when it's a creation by reference (and then by order after reconciliation)
            let existingActivationDocumentCompositeKey: ActivationDocument = null;
            try {
                existingActivationDocumentCompositeKey =
                await this.getActivationDocumentObjByCompositeKey(params, activationDocumentCompositeKeyId);
            } catch (error) {
                // Do Nothing, it's a good thing if document doesn't exist
            }
            if (existingActivationDocumentCompositeKey
                && existingActivationDocumentCompositeKey.activationDocumentMrid
                && existingActivationDocumentCompositeKey.activationDocumentMrid.length > 0) {

                throw new Error(`Error: An Activation Document with same Composite Key already exists: ${JSON.stringify(compositeKey)}`);
            }
        }

        await ActivationDocumentService.write(params, activationDocumentObj, targetDocument);
        await SiteActivationIndexersController.addActivationReference(params, activationDocumentObj, targetDocument);

        if (!definedTarget || definedTarget.length === 0) {
            // Only control when it's an original creation (by list)
            // Don't create Feedback when it's a creation by reference (and then by order after reconciliation)
            // Feedback follows its own duplication process

            await FeedbackProducerController.createFeedbackProducerObj(params, activationDocumentObj, targetDocument);
        }

        params.logger.debug('=============  END  : Create %s createActivationDocumentObj ===========',
            activationDocumentObj.activationDocumentMrid,
        );
    }

}
