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

        for (var collection of collections) {
            await ActivationDocumentService.delete(ctx, params, "0754217c-f0e5-4c23-823d-0533e391245b", collection);
            await ActivationDocumentService.delete(ctx, params, "0d818433-6095-4acf-b032-e4b6b8550c93", collection);
            await ActivationDocumentService.delete(ctx, params, "16e6fb68-3c50-4ccc-8d97-2344eebcefe4", collection);
            await ActivationDocumentService.delete(ctx, params, "1d454690-4a51-4086-8314-d05a15aa544a", collection);
            await ActivationDocumentService.delete(ctx, params, "3b29a075-01e4-4786-88ab-5fd1c9830149", collection);
            await ActivationDocumentService.delete(ctx, params, "4c845adb-4ce7-4803-92e5-32d54535f5a8", collection);
            await ActivationDocumentService.delete(ctx, params, "5939d00e-9573-4323-80c9-880890c5212f", collection);
            await ActivationDocumentService.delete(ctx, params, "6162e519-4984-48fc-941e-00c3b617b84e", collection);
            await ActivationDocumentService.delete(ctx, params, "6835717f-87bd-41c9-9401-d259b61149a4", collection);
            await ActivationDocumentService.delete(ctx, params, "77478df5-13df-43be-bc12-53077b7c92da", collection);
            await ActivationDocumentService.delete(ctx, params, "9042c66c-b748-4e77-bf18-3a53fdf5a484", collection);
            await ActivationDocumentService.delete(ctx, params, "9175a598-2dfe-4079-b37c-84572bf27709", collection);
            await ActivationDocumentService.delete(ctx, params, "9ed75fb2-4430-488c-a772-ef036833cab0", collection);
            await ActivationDocumentService.delete(ctx, params, "a66eacd0-91fa-4b97-b5c3-d59fe1268a24", collection);
            await ActivationDocumentService.delete(ctx, params, "b50056fa-3ca3-4a36-8a3d-2380f4084316", collection);
            await ActivationDocumentService.delete(ctx, params, "c19b0bdf-39ce-4284-8965-c995aec00857", collection);
            await ActivationDocumentService.delete(ctx, params, "c7613779-70b5-43c7-ba6c-66c3f5b4a1a8", collection);
            await ActivationDocumentService.delete(ctx, params, "cdd32d1a-3ce4-4ce1-83f1-355eb674cca2", collection);
            await ActivationDocumentService.delete(ctx, params, "d0c4d05c-3e2c-4f7c-acc0-fa740f156822", collection);
            await ActivationDocumentService.delete(ctx, params, "d5af2077-5b75-423c-95bd-bd0795918aa6", collection);
            await ActivationDocumentService.delete(ctx, params, "d635223f-0a16-4645-a6a0-2b3da7863ff2", collection);
            await ActivationDocumentService.delete(ctx, params, "ea7edef5-cf12-4234-9972-45b1a18e4668", collection);
            await ActivationDocumentService.delete(ctx, params, "f11ec379-dc02-49b1-9c77-394b6eca1dc3", collection);
            await ActivationDocumentService.delete(ctx, params, "f1253bf4-bca8-43bc-9147-51bcc3c458a9", collection);
            await ActivationDocumentService.delete(ctx, params, "f1a14684-23e5-4529-93a5-35909a3e84fd", collection);
            await ActivationDocumentService.delete(ctx, params, "fdbfc324-1756-4165-a03d-2a9c421ee1c2", collection);
            await ActivationDocumentService.delete(ctx, params, "205033fe-0004-46e9-838e-d71fb54439fc", collection);
            await ActivationDocumentService.delete(ctx, params, "4958b8c2-857f-4ba2-949c-8e79f8533adc", collection);
            await ActivationDocumentService.delete(ctx, params, "c4dd6569-5e3b-4e3d-b47a-f6880d6d72d9", collection);
        }

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
                if (targetDocument && targetDocument.length > 0) {
                    siteRef = siteRefMap.get(targetDocument);
                } else {
                    siteRef = siteRefMap.values().next().value;
                }
                // await SiteService.getRaw(ctx, targetDocument, activationDocumentObj.registeredResourceMrid);
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

        activationDocumentObj.potentialParent =  (RoleType.Role_TSO === role_systemOperator && RoleType.Role_DSO == role_producer && activationDocumentObj.startCreatedDateTime !== "");
        const dsoChild : boolean = (RoleType.Role_DSO === role_systemOperator && activationDocumentObj.startCreatedDateTime !== "");
        const tsoChild : boolean = (RoleType.Role_TSO === role_systemOperator && activationDocumentObj.orderEnd === true && !activationDocumentObj.startCreatedDateTime);
        activationDocumentObj.potentialChild = dsoChild || tsoChild;

        activationDocumentObj.eligibilityStatus = ActivationDocumentEligibilityService.checkEligibilityStatus(params, activationDocumentObj);
        activationDocumentObj.eligibilityStatusEditable = !(activationDocumentObj.eligibilityStatus === EligibilityStatusType.EligibilityAccepted);
        activationDocumentObj.eligibilityStatus = ActivationDocumentEligibilityService.statusInternationalValue(activationDocumentObj.eligibilityStatus);

        await ActivationDocumentService.write(ctx, params, activationDocumentObj, targetDocument);

        console.info('============= END   : Create %s createActivationDocumentObj ===========',
            activationDocumentObj.activationDocumentMrid,
        );
    }

}
