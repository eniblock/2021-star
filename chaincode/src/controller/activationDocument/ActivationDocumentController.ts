import { Context } from 'fabric-contract-api';
import { isEmpty } from 'lodash';

import { OrganizationTypeMsp } from '../../enums/OrganizationMspType';
import { ParametersType } from '../../enums/ParametersType';

import { ActivationDocument } from '../../model/activationDocument/activationDocument';
import { STARParameters } from '../../model/starParameters';
import { SystemOperator } from '../../model/systemOperator';

import { SiteService } from '../service/SiteService';
import { HLFServices } from '../service/HLFservice';
import { SystemOperatorService } from '../service/SystemOperatorService';
import { ProducerService } from '../service/ProducerService';
import { ActivationDocumentService } from '../service/ActivationDocumentService';

import { Producer } from '../../model/producer';
import { RoleType } from '../../enums/RoleType';
import { DataReference } from '../../model/dataReference';
import { EligibilityStatusType } from '../../enums/EligibilityStatusType';
import { ActivationDocumentEligibilityService } from '../service/ActivationDocumentEligibilityService';

export class ActivationDocumentController {
    public static async getActivationDocumentByProducer(
        ctx: Context,
        params: STARParameters,
        producerMrid: string): Promise<string> {

        const query = `{"selector": {"docType": "activationDocument", "receiverMarketParticipantMrid": "${producerMrid}"}}`;

        const collections: string[] = await HLFServices.getCollectionsFromParameters(params, ParametersType.DATA_TARGET, ParametersType.ALL);

        const allResults: ActivationDocument[] = await ActivationDocumentService.getQueryArrayResult(ctx, params, query, collections);
        const formatedResults: ActivationDocument[] = await ActivationDocumentEligibilityService.formatActivationDocuments(ctx, params, allResults);
        const formated = JSON.stringify(formatedResults);

        return formated;
    }



    public static async getActivationDocumentBySystemOperator(
        ctx: Context,
        params: STARParameters,
        systemOperatorMrid: string): Promise<string> {

        const query = `{"selector": {"docType": "activationDocument", "senderMarketParticipantMrid": "${systemOperatorMrid}"}}`;

        const collections: string[] = await HLFServices.getCollectionsFromParameters(params, ParametersType.DATA_TARGET, ParametersType.ALL);

        const allResults: ActivationDocument[] = await ActivationDocumentService.getQueryArrayResult(ctx, params, query, collections);
        const formatedResults: ActivationDocument[] = await ActivationDocumentEligibilityService.formatActivationDocuments(ctx, params, allResults);
        const formated = JSON.stringify(formatedResults);

        return formated;
    }


    public static async getActivationDocumentById(
        ctx: Context,
        params: STARParameters,
        activationDocumentMrid: string,
        target: string = ''): Promise<ActivationDocument> {

        let orderObj: ActivationDocument;
        if (target && target.length > 0) {
            orderObj = await ActivationDocumentService.getObj(ctx, params, activationDocumentMrid, target);
        } else {
            const result:Map<string, DataReference> = await ActivationDocumentService.getObjRefbyId(ctx, params, activationDocumentMrid);
            const dataReference = result.values().next().value;
            if (dataReference && dataReference.data) {
                orderObj = dataReference.data;
            }
        }

        var formatedResult: ActivationDocument = null;
        if (orderObj) {
            formatedResult = await ActivationDocumentEligibilityService.outputFormatFRActivationDocument(ctx, params, orderObj);
        }

        return formatedResult;
    }



    public static async getActivationDocumentByQuery(
        ctx: Context,
        params: STARParameters,
        query: string): Promise<string> {

        const collections: string[] = await HLFServices.getCollectionsFromParameters(params, ParametersType.DATA_TARGET, ParametersType.ALL);

        const allResults: any[] = await ActivationDocumentService.getQueryArrayResult(ctx, params, query, collections);
        const formatedResults: ActivationDocument[] = await ActivationDocumentEligibilityService.formatActivationDocuments(ctx, params, allResults);
        const formated = JSON.stringify(formatedResults);

        return formated;
    }



    public static async createActivationDocument(
        ctx: Context,
        params: STARParameters,
        inputStr: string) {
        console.info('============= START : Create ActivationDocumentController ===========');

        const identity = params.values.get(ParametersType.IDENTITY);
        if (identity !== OrganizationTypeMsp.RTE && identity !== OrganizationTypeMsp.ENEDIS) {
            throw new Error(`Organisation, ${identity} does not have write access for Activation Document`);
        }

        const activationDocumentObj: ActivationDocument =ActivationDocument.formatString(inputStr);
        await ActivationDocumentController.createActivationDocumentObj(ctx, params, activationDocumentObj);

        console.info('============= END : Create ActivationDocumentController ===========');
    }



    public static async createActivationDocumentByReference(
        ctx: Context,
        params: STARParameters,
        dataReference: DataReference) {
        console.info('============= START : create ByReference ActivationDocumentController ===========');

        const identity = params.values.get(ParametersType.IDENTITY);
        if (identity !== OrganizationTypeMsp.RTE && identity !== OrganizationTypeMsp.ENEDIS) {
            throw new Error(`Organisation, ${identity} does not have write access for Activation Document`);
        }

        ActivationDocument.schema.validateSync(
            dataReference.data,
            {strict: true, abortEarly: false},
        );

        await ActivationDocumentController.createActivationDocumentObj(ctx, params, dataReference.data, dataReference.collection);

        console.info('============= END : create ByReference ActivationDocumentController ===========');
    }



    public static async createActivationDocumentList(
        ctx: Context,
        params: STARParameters,
        inputStr: string) {
        console.info('============= START : Create List ActivationDocumentController ===========');

        const identity = params.values.get(ParametersType.IDENTITY);
        if (identity !== OrganizationTypeMsp.RTE && identity !== OrganizationTypeMsp.ENEDIS) {
            throw new Error(`Organisation, ${identity} does not have write access for Activation Document`);
        }

        const activationDocumentList: ActivationDocument[] = ActivationDocument.formatListString(inputStr);

        if (activationDocumentList) {
            for (var activationDocumentObj of activationDocumentList) {
                await ActivationDocumentController.createActivationDocumentObj(ctx, params, activationDocumentObj);
            }
        }

        console.info('============= END : Create List ActivationDocumentController ===========');
    }



    private static async createActivationDocumentObj(
        ctx: Context,
        params: STARParameters,
        activationDocumentObj: ActivationDocument,
        definedTarget: string = '') {
        console.info('============= START : Create createActivationDocumentObj ===========');

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
            systemOperatorObj = await SystemOperatorService.getObj(ctx, activationDocumentObj.senderMarketParticipantMrid);
        } catch (error) {
            throw new Error('ERROR createActivationDocument : '.concat(error.message).concat(` for Activation Document ${activationDocumentObj.activationDocumentMrid} creation.`));
        }

        if (systemOperatorObj.systemOperatorMarketParticipantName.toLowerCase() !== identity.toLowerCase() ) {
            throw new Error(`Organisation, ${identity} cannot send Activation Document for sender ${systemOperatorObj.systemOperatorMarketParticipantName}`);
        }

        var producerAsBytes: Uint8Array;
        if (activationDocumentObj.receiverMarketParticipantMrid) {
            try {
                producerAsBytes = await ProducerService.getRaw(ctx, activationDocumentObj.receiverMarketParticipantMrid);
            } catch(error) {
                throw new Error(`Producer : ${activationDocumentObj.receiverMarketParticipantMrid} does not exist for Activation Document ${activationDocumentObj.activationDocumentMrid} creation.`);
            }
        }
        var producerObj:Producer;
        var producerSystemOperatorObj:SystemOperator;
        if (producerAsBytes) {
            producerObj = JSON.parse(producerAsBytes.toString());
            producerSystemOperatorObj = JSON.parse(producerAsBytes.toString());
        }

        /* Mix Collection is true if order doesn't directly go to producer */
        const roleTable: Map<string, string> = params.values.get(ParametersType.ROLE_TABLE);
        var role_producer: string = '';
        var role_systemOperator: string = '';
        if (producerObj && roleTable.has(producerObj.producerMarketParticipantName)) {
            role_producer = roleTable.get(producerObj.producerMarketParticipantName);
        } else if (producerObj && roleTable.has(producerSystemOperatorObj.systemOperatorMarketParticipantName)) {
            role_producer = roleTable.get(producerSystemOperatorObj.systemOperatorMarketParticipantName);
        }

        if (systemOperatorObj && roleTable.has(systemOperatorObj.systemOperatorMarketParticipantName)) {
            role_systemOperator = roleTable.get(systemOperatorObj.systemOperatorMarketParticipantName);
        }

        //Define target collection
        var targetDocument: string = await HLFServices.getCollectionOrDefault(params, ParametersType.DATA_TARGET, definedTarget);
        if (producerSystemOperatorObj && roleTable.has(producerSystemOperatorObj.systemOperatorMarketParticipantName)) {
            const collectionMap: Map<string, string[]> = params.values.get(ParametersType.DATA_TARGET);

            const target = producerSystemOperatorObj.systemOperatorMarketParticipantName;
            targetDocument = collectionMap.get(target)[0];
        }

        /* Test Site existence if order does not come from TSO and goes to DSO */
        if (!producerSystemOperatorObj
            || !producerSystemOperatorObj.systemOperatorMarketParticipantName
            || producerSystemOperatorObj.systemOperatorMarketParticipantName === "") {

            var siteRef: DataReference;
            try {
                const siteRefMap: Map<string, DataReference> = await SiteService.getObjRefbyId(ctx, params, activationDocumentObj.registeredResourceMrid);
                siteRef = siteRefMap.get(targetDocument);
                // await SiteService.getRaw(ctx, targetDocument, activationDocumentObj.registeredResourceMrid);
            } catch(error) {
                throw new Error(error.message.concat(` for Activation Document ${activationDocumentObj.activationDocumentMrid} creation.`));
            }
            if (!siteRef
                || siteRef.collection !== targetDocument
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

        activationDocumentObj.potentialParent =  (RoleType.Role_TSO === role_systemOperator && RoleType.Role_DSO == role_producer && activationDocumentObj.startCreatedDateTime !== "");
        const dsoChild : boolean = (RoleType.Role_DSO === role_systemOperator && activationDocumentObj.startCreatedDateTime !== "");
        const tsoChild : boolean = (RoleType.Role_TSO === role_systemOperator && activationDocumentObj.orderEnd === true && !activationDocumentObj.startCreatedDateTime);
        activationDocumentObj.potentialChild = dsoChild || tsoChild;

        activationDocumentObj.eligibilityStatus = ActivationDocumentEligibilityService.checkEligibilityStatus(params, activationDocumentObj);
        activationDocumentObj.eligibilityStatusEditable = !(activationDocumentObj.eligibilityStatus === EligibilityStatusType.EligibilityAccepted);
        activationDocumentObj.eligibilityStatus = ActivationDocumentEligibilityService.statusInternationalValue(activationDocumentObj.eligibilityStatus);

        console.debug("*********************")
        console.debug("*********************")
        console.debug("*********************")

        console.debug(JSON.stringify(activationDocumentObj))

        console.debug("")

        console.debug(activationDocumentObj.potentialParent)
        console.debug("potentialParent final value :")

        console.debug("")
        console.debug("---")
        console.debug(roleTable.get(systemOperatorObj.systemOperatorMarketParticipantName))
        console.debug("---")
        console.debug("value")
        console.debug(systemOperatorObj.systemOperatorMarketParticipantName)
        console.debug("systemOperatorObj.systemOperatorMarketParticipantName")

        console.debug("")

        console.debug(JSON.stringify(RoleType.Role_TSO === role_systemOperator))
        console.debug("Value Test :")
        console.debug(role_systemOperator)
        console.debug("role_systemOperator :")
        console.debug(RoleType.Role_TSO)
        console.debug("RoleType.Role_TSO :")

        console.debug("")
        console.debug("---")
        console.debug(roleTable.get(producerSystemOperatorObj.systemOperatorMarketParticipantName))
        console.debug("---")
        console.debug("value")
        console.debug(producerSystemOperatorObj.systemOperatorMarketParticipantName)
        console.debug("producerSystemOperatorObj.systemOperatorMarketParticipantName")

        console.debug("")

        console.debug(JSON.stringify(RoleType.Role_DSO == role_producer))
        console.debug("Value Test :")
        console.debug(role_producer)
        console.debug("role_producer :")
        console.debug(RoleType.Role_DSO)
        console.debug("RoleType.Role_DSO :")

        console.debug("")

        console.debug(JSON.stringify([...roleTable]))
        console.debug("roleTable")

        console.debug("")

        console.debug(JSON.stringify(activationDocumentObj.startCreatedDateTime !== ""))
        console.debug("Value Test :")
        console.debug(JSON.stringify(activationDocumentObj.startCreatedDateTime))
        console.debug("startCreatedDateTime :")

        console.debug("*********************")
        console.debug("*********************")
        console.debug("*********************")

        await ActivationDocumentService.delete(ctx, params, "a8b437c0-b087-4d5a-afa5-c72738822ee1");
        await ActivationDocumentService.delete(ctx, params, "e54fc1be-47e0-440b-96eb-9af4b9869c76");
        // await ActivationDocumentService.write(ctx, params, activationDocumentObj, targetDocument);

        console.info('============= END   : Create %s createActivationDocumentObj ===========',
            activationDocumentObj.activationDocumentMrid,
        );
    }

}
