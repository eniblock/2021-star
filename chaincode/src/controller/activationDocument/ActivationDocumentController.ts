import { isEmpty } from 'lodash';

import { OrganizationTypeMsp } from '../../enums/OrganizationMspType';
import { ParametersType } from '../../enums/ParametersType';
import { RoleType } from '../../enums/RoleType';
import { EligibilityStatusType } from '../../enums/EligibilityStatusType';
import { DocType } from '../../enums/DocType';

import { ActivationDocument } from '../../model/activationDocument/activationDocument';
import { STARParameters } from '../../model/starParameters';
import { SystemOperator } from '../../model/systemOperator';
import { Producer } from '../../model/producer';
import { DataReference } from '../../model/dataReference';

import { HLFServices } from '../service/HLFservice';
import { ActivationDocumentService } from '../service/ActivationDocumentService';
import { ActivationDocumentEligibilityService } from '../service/ActivationDocumentEligibilityService';
import { StarPrivateDataService } from '../service/StarPrivateDataService';
import { StarDataService } from '../service/StarDataService';

export class ActivationDocumentController {
    public static async getActivationDocumentByProducer(
        params: STARParameters,
        producerMrid: string): Promise<string> {
        params.logger.info('============= START : get ActivationDocument By Producer ===========');

        const query = `{"selector": {"docType": "activationDocument", "receiverMarketParticipantMrid": "${producerMrid}"}}`;
        params.logger.debug("query: ", query);

        const collections: string[] = await HLFServices.getCollectionsFromParameters(params, ParametersType.DATA_TARGET, ParametersType.ALL);

        const allResults: ActivationDocument[] = await ActivationDocumentService.getQueryArrayResult(params, query, collections);
        const formatedResults: ActivationDocument[] = await ActivationDocumentEligibilityService.formatActivationDocuments(params, allResults);
        const formated = JSON.stringify(formatedResults);

        params.logger.info('=============  END  : get ActivationDocument By Producer ===========');
        return formated;
    }



    public static async getActivationDocumentBySystemOperator(
        params: STARParameters,
        systemOperatorMrid: string): Promise<string> {
        params.logger.info('============= START : get ActivationDocument By SystemOperator ===========');

        const query = `{"selector": {"docType": "activationDocument", "senderMarketParticipantMrid": "${systemOperatorMrid}"}}`;
        params.logger.debug("query: ", query);

        const collections: string[] = await HLFServices.getCollectionsFromParameters(params, ParametersType.DATA_TARGET, ParametersType.ALL);

        const allResults: ActivationDocument[] = await ActivationDocumentService.getQueryArrayResult(params, query, collections);
        const formatedResults: ActivationDocument[] = await ActivationDocumentEligibilityService.formatActivationDocuments(params, allResults);
        const formated = JSON.stringify(formatedResults);

        params.logger.info('=============  END  : get ActivationDocument By SystemOperator ===========');
        return formated;
    }


    public static async getActivationDocumentById(
        params: STARParameters,
        activationDocumentMrid: string,
        target: string = ''): Promise<ActivationDocument> {
        params.logger.debug('============= START : get ActivationDocument By Id ===========');

        let orderObj: ActivationDocument;
        if (target && target.length > 0) {
            orderObj = await StarPrivateDataService.getObj(params, {id: activationDocumentMrid, docType: DocType.ACTIVATION_DOCUMENT, collection: target});
        } else {
            const result:Map<string, DataReference> = await StarPrivateDataService.getObjRefbyId(params, {docType: DocType.ACTIVATION_DOCUMENT, id: activationDocumentMrid});
            const dataReference = result.values().next().value;
            if (dataReference && dataReference.data) {
                orderObj = dataReference.data;
            }
        }

        var formatedResult: ActivationDocument = null;
        if (orderObj) {
            formatedResult = await ActivationDocumentEligibilityService.outputFormatFRActivationDocument(params, orderObj);
        }

        params.logger.debug('=============  END  : get ActivationDocument By Id ===========');
        return formatedResult;
    }



    public static async getActivationDocumentByQuery(
        params: STARParameters,
        query: string): Promise<string> {
        params.logger.info('============= START : get ActivationDocument By Query ===========');

        const collections: string[] = await HLFServices.getCollectionsFromParameters(params, ParametersType.DATA_TARGET, ParametersType.ALL);

        params.logger.debug("query: ", query);
        const allResults: any[] = await ActivationDocumentService.getQueryArrayResult(params, query, collections);
        const formatedResults: ActivationDocument[] = await ActivationDocumentEligibilityService.formatActivationDocuments(params, allResults);

        const formated = JSON.stringify(formatedResults);

        params.logger.info('=============  END  : get ActivationDocument By Query ===========');
        return formated;
    }



    public static async createActivationDocument(
        params: STARParameters,
        inputStr: string) {
        params.logger.info('============= START : Create ActivationDocumentController ===========');

        const identity = params.values.get(ParametersType.IDENTITY);
        if (identity !== OrganizationTypeMsp.RTE && identity !== OrganizationTypeMsp.ENEDIS) {
            throw new Error(`Organisation, ${identity} does not have write access for Activation Document`);
        }

        const activationDocumentObj: ActivationDocument =ActivationDocument.formatString(inputStr);
        await ActivationDocumentController.createActivationDocumentObj(params, activationDocumentObj);

        params.logger.info('=============  END  : Create ActivationDocumentController ===========');
    }



    public static async createActivationDocumentByReference(
        params: STARParameters,
        dataReference: DataReference) {
        params.logger.debug('============= START : create ByReference ActivationDocumentController ===========');

        const identity = params.values.get(ParametersType.IDENTITY);
        if (identity !== OrganizationTypeMsp.RTE && identity !== OrganizationTypeMsp.ENEDIS) {
            throw new Error(`Organisation, ${identity} does not have write access for Activation Document`);
        }

        ActivationDocument.schema.validateSync(
            dataReference.data,
            {strict: true, abortEarly: false},
        );

        await ActivationDocumentController.createActivationDocumentObj(params, dataReference.data, dataReference.collection);

        params.logger.debug('=============  END  : create ByReference ActivationDocumentController ===========');
    }



    public static async createActivationDocumentList(
        params: STARParameters,
        inputStr: string) {
        params.logger.info('============= START : Create List ActivationDocumentController ===========');

        const identity = params.values.get(ParametersType.IDENTITY);
        if (identity !== OrganizationTypeMsp.RTE && identity !== OrganizationTypeMsp.ENEDIS) {
            throw new Error(`Organisation, ${identity} does not have write access for Activation Document`);
        }

        const activationDocumentList: ActivationDocument[] = ActivationDocument.formatListString(inputStr);

        if (activationDocumentList) {
            for (var activationDocumentObj of activationDocumentList) {
                await ActivationDocumentController.createActivationDocumentObj(params, activationDocumentObj);
            }
        }

        params.logger.info('=============  END  : Create List ActivationDocumentController ===========');
    }



    private static async createActivationDocumentObj(
        params: STARParameters,
        activationDocumentObj: ActivationDocument,
        definedTarget: string = '') {
        params.logger.debug('============= START : Create createActivationDocumentObj ===========');

        const identity = params.values.get(ParametersType.IDENTITY);

        // if (identity === OrganizationTypeMsp.RTE &&
        //     activationDocumentObj.measurementUnitName !== MeasurementUnitType.MW) {
        //     throw new Error(`Organisation, ${identity} does not have write access for KW orders`);
        // }
        // if (identity === OrganizationTypeMsp.ENEDIS &&
        //     activationDocumentObj.measurementUnitName !== MeasurementUnitType.KW) {
        //     throw new Error(`Organisation, ${identity} does not have write access for MW orders`);
        // }

        let systemOperatorObj: SystemOperator;
        try {
            systemOperatorObj = await StarDataService.getObj(params, {id: activationDocumentObj.senderMarketParticipantMrid, docType: DocType.SYSTEM_OPERATOR});
        } catch (error) {
            throw new Error('ERROR createActivationDocument : '.concat(error.message).concat(` for Activation Document ${activationDocumentObj.activationDocumentMrid} creation.`));
        }

        if (systemOperatorObj.systemOperatorMarketParticipantName.toLowerCase() !== identity.toLowerCase() ) {
            throw new Error(`Organisation, ${identity} cannot send Activation Document for sender ${systemOperatorObj.systemOperatorMarketParticipantName}`);
        }

        var producerObj:Producer;
        if (activationDocumentObj.receiverMarketParticipantMrid) {
            try {
                producerObj = await StarDataService.getObj(params, {id: activationDocumentObj.receiverMarketParticipantMrid});
            } catch(error) {
                throw new Error(`Producer : ${activationDocumentObj.receiverMarketParticipantMrid} does not exist for Activation Document ${activationDocumentObj.activationDocumentMrid} creation.`);
            }
        }

        var producerSystemOperatorObj:SystemOperator;
        if (producerObj) {
            producerSystemOperatorObj = JSON.parse(JSON.stringify(producerObj));
        }

        /* Mix Collection is true if order doesn't directly go to producer */
        const roleTable: Map<string, string> = params.values.get(ParametersType.ROLE_TABLE);
        var role_producer: string = '';
        var role_systemOperator: string = '';

        var producerName: string;
        if (producerObj) {
            producerName = producerObj.producerMarketParticipantName;
            if (producerName && producerName.length > 0) {
                producerName = producerName.toLowerCase();
            }
        }
        var producerSystemOperatorName: string;
        if (producerSystemOperatorObj) {
            producerSystemOperatorName = producerSystemOperatorObj.systemOperatorMarketParticipantName;
            if (producerSystemOperatorName && producerSystemOperatorName.length > 0) {
                producerSystemOperatorName = producerSystemOperatorName.toLowerCase();
            }
        }


        if (roleTable.has(producerName)) {
            role_producer = roleTable.get(producerName);
        } else if (roleTable.has(producerSystemOperatorName)) {
            role_producer = roleTable.get(producerSystemOperatorName);
        }


        var systemOperatorName: string;
        if (systemOperatorObj) {
            systemOperatorName = systemOperatorObj.systemOperatorMarketParticipantName;
            if (systemOperatorName && systemOperatorName.length > 0) {
                systemOperatorName = systemOperatorName.toLowerCase();
            }
        }

        if (roleTable.has(systemOperatorName)) {
            role_systemOperator = roleTable.get(systemOperatorName);
        }

        //Define target collection
        var targetDocument: string = await HLFServices.getCollectionOrDefault(params, ParametersType.DATA_TARGET, definedTarget);
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
            || producerSystemOperatorObj.systemOperatorMarketParticipantName === "") {

            var siteRef: DataReference;
            try {
                const siteRefMap: Map<string, DataReference> = await StarPrivateDataService.getObjRefbyId(params, {docType: DocType.SITE, id: activationDocumentObj.registeredResourceMrid});
                if (targetDocument && targetDocument.length > 0) {
                    siteRef = siteRefMap.get(targetDocument);
                } else {
                    siteRef = siteRefMap.values().next().value;
                }
                // await SiteService.getRaw(targetDocument, activationDocumentObj.registeredResourceMrid);
            } catch(error) {
                throw new Error(error.message.concat(` for Activation Document ${activationDocumentObj.activationDocumentMrid} creation.`));
            }
            if (!siteRef
                || (siteRef.collection !== targetDocument && !targetDocument && targetDocument.length > 0)
                || !siteRef.data.meteringPointMrid
                || siteRef.data.meteringPointMrid != activationDocumentObj.registeredResourceMrid) {
                    throw new Error(`Site : ${activationDocumentObj.registeredResourceMrid} does not exist for Activation Document ${activationDocumentObj.activationDocumentMrid} creation.`);
                }
        }

        if (isEmpty(activationDocumentObj.endCreatedDateTime) && isEmpty(activationDocumentObj.orderValue)) {
            throw new Error(`Order must have a limitation value`);
        }

        const activationDocumentRules: string[] = params.values.get(ParametersType.ACTIVATION_DOCUMENT_RULES);
        const pattern = activationDocumentObj.messageType + "-" + activationDocumentObj.businessType + "-" + activationDocumentObj.reasonCode;
        if (activationDocumentRules && !activationDocumentRules.includes(pattern)) {
            throw new Error(`Incoherency between messageType, businessType and reason code for Activation Document ${activationDocumentObj.activationDocumentMrid} creation.`);
        }



        if (activationDocumentObj.endCreatedDateTime) {
            activationDocumentObj.orderEnd = true;
        } else {
            activationDocumentObj.orderEnd = false;
        }

        if (RoleType.Role_DSO === role_producer) {
            activationDocumentObj.receiverRole = RoleType.Role_DSO;
        } else {
            activationDocumentObj.receiverRole = RoleType.Role_Producer;
        }

        const tsoToDsoParent: boolean = (
            RoleType.Role_TSO === role_systemOperator
            && RoleType.Role_DSO === role_producer
            && activationDocumentObj.startCreatedDateTime !== "");

        const tsoEndState: boolean = (
            RoleType.Role_TSO === role_systemOperator
            && RoleType.Role_DSO !== role_producer
            && activationDocumentObj.startCreatedDateTime !== ""
            && activationDocumentObj.orderEnd === false
            && ["A54","A98"].includes(activationDocumentObj.messageType));

        activationDocumentObj.potentialParent = tsoToDsoParent || tsoEndState;

        const dsoChild : boolean = (RoleType.Role_DSO === role_systemOperator && activationDocumentObj.startCreatedDateTime !== "");
        const tsoChild : boolean = (RoleType.Role_TSO === role_systemOperator && activationDocumentObj.orderEnd === true && !activationDocumentObj.startCreatedDateTime);
        activationDocumentObj.potentialChild = dsoChild || tsoChild;



        activationDocumentObj.eligibilityStatus = ActivationDocumentEligibilityService.checkEligibilityStatus(params, activationDocumentObj);

        if (activationDocumentObj.eligibilityStatus === EligibilityStatusType.EligibilityAccepted
            || (RoleType.Role_TSO === role_systemOperator && RoleType.Role_DSO === role_producer)) {

            activationDocumentObj.eligibilityStatusEditable = false;
        } else {
            activationDocumentObj.eligibilityStatusEditable = true;
        }

        activationDocumentObj.eligibilityStatus = ActivationDocumentEligibilityService.statusInternationalValue(activationDocumentObj.eligibilityStatus);

        await ActivationDocumentService.write(params, activationDocumentObj, targetDocument);

        params.logger.debug('=============  END  : Create %s createActivationDocumentObj ===========',
            activationDocumentObj.activationDocumentMrid,
        );
    }

}
