import { Context } from 'fabric-contract-api';
import { isEmpty } from 'lodash';

import { OrganizationTypeMsp } from '../enums/OrganizationMspType';
import { ParametersType } from '../enums/ParametersType';

import { ActivationDocument } from '../model/activationDocument';
import { YellowPages } from '../model/yellowPages';
import { Parameters } from '../model/parameters';
import { SystemOperator } from '../model/systemOperator';

import { SiteService } from './service/SiteService';
import { HLFServices } from './service/HLFservice';
import { SystemOperatorService } from './service/SystemOperatorService';
import { ProducerService } from './service/ProducerService';
import { QueryStateService } from './service/QueryStateService';
import { ActivationDocumentService } from './service/ActivationDocumentService';

import { YellowPagesController } from './YellowPagesController';
import { SystemOperatorController } from './SystemOperatorController';
import { Producer } from '../model/producer';
import { RoleType } from '../enums/RoleType';

export class ActivationDocumentController {

    public static async getActivationDocumentByProducer(
        ctx: Context,
        params: Parameters,
        producerMrid: string): Promise<string> {

        await ActivationDocumentController.conciliationCrank(ctx, params)
        const query = `{"selector": {"docType": "activationDocument", "receiverMarketParticipantMrid": "${producerMrid}"}}`;

        const allResults: ActivationDocument[] = await ActivationDocumentService.getQueryArrayResult(ctx, params, query, RoleType.Role_Producer);
        const formated = JSON.stringify(allResults);

        return formated;
    }



    public static async getActivationDocumentBySystemOperator(
        ctx: Context,
        params: Parameters,
        systemOperatorMrid: string): Promise<string> {

        await ActivationDocumentController.conciliationCrank(ctx, params)
        const query = `{"selector": {"docType": "activationDocument", "senderMarketParticipantMrid": "${systemOperatorMrid}"}}`;

        const allResults: ActivationDocument[] = await ActivationDocumentService.getQueryArrayResult(ctx, params, query, ParametersType.ALL);
        const formated = JSON.stringify(allResults);

        return formated;
    }



    public static async getActivationDocumentByQuery(
        ctx: Context,
        params: Parameters,
        query: string): Promise<string> {

        await ActivationDocumentController.conciliationCrank(ctx, params)
        const allResults: any[] = await ActivationDocumentService.getQueryArrayResult(ctx, params, query, ParametersType.ALL);
        const formated = JSON.stringify(allResults);

        return formated;
    }



    public static async createActivationDocument(
        ctx: Context,
        params: Parameters,
        inputStr: string) {
        console.info('============= START : Create ActivationDocumentController ===========');

        await ActivationDocumentController.conciliationCrank(ctx, params)

        const identity = await HLFServices.getMspID(ctx);
        if (identity !== OrganizationTypeMsp.RTE && identity !== OrganizationTypeMsp.ENEDIS) {
            throw new Error(`Organisation, ${identity} does not have write access for Activation Document`);
        }

        let activationDocumentObj: ActivationDocument;
        try {
            activationDocumentObj = JSON.parse(inputStr);
        } catch (error) {
        // console.error('error=', error);
        throw new Error(`ERROR createActivationDocument-> Input string NON-JSON value`);
        }

        ActivationDocument.schema.validateSync(
            activationDocumentObj,
            {strict: true, abortEarly: false},
        );

        // if (identity === OrganizationTypeMsp.RTE &&
        //     activationDocumentObj.measurementUnitName !== MeasurementUnitType.MW) {
        //     throw new Error(`Organisation, ${identity} does not have write access for KW orders`);
        // }
        // if (identity === OrganizationTypeMsp.ENEDIS &&
        //     activationDocumentObj.measurementUnitName !== MeasurementUnitType.KW) {
        //     throw new Error(`Organisation, ${identity} does not have write access for MW orders`);
        // }


        var sytemOperatorAsBytes: Uint8Array;
        if (activationDocumentObj.senderMarketParticipantMrid) {
            try {
                sytemOperatorAsBytes = await SystemOperatorService.getRaw(ctx, activationDocumentObj.senderMarketParticipantMrid);
            } catch(error) {
                throw new Error(`System Operator : ${activationDocumentObj.senderMarketParticipantMrid} does not exist for Activation Document ${activationDocumentObj.activationDocumentMrid} creation.`);
            }
        }
        var systemOperatorObj:SystemOperator;
        if (sytemOperatorAsBytes) {
            systemOperatorObj = JSON.parse(sytemOperatorAsBytes.toString());
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

        /* Test Site existence if order comes from TSO and goes to DSO */
        if (!producerSystemOperatorObj
            || !producerSystemOperatorObj.systemOperatorMarketParticipantName
            || producerSystemOperatorObj.systemOperatorMarketParticipantName === "") {
            try {
                await SiteService.getRaw(ctx, params, activationDocumentObj.registeredResourceMrid);
            } catch(error) {
                throw new Error(error.message.concat(` for Activation Document ${activationDocumentObj.activationDocumentMrid} creation.`));
            }
        }

        if (isEmpty(activationDocumentObj.endCreatedDateTime) && isEmpty(activationDocumentObj.orderValue)) {
            throw new Error(`Order must have a limitation value`);
        }

        /* Mix Collection is true if order doesn't directly to producer */
        const roleTable: Map<string, string> = params.values.get(ParametersType.ROLE_TABLE);
        var role_producer: string = '';
        var role_systemOperator: string = '';
        if (producerObj && roleTable.has(producerObj.producerMarketParticipantName)) {
            role_producer = roleTable.get(producerObj.producerMarketParticipantName);
        }

        if (systemOperatorObj && roleTable.has(systemOperatorObj.systemOperatorMarketParticipantName)) {
            role_systemOperator = roleTable.get(systemOperatorObj.systemOperatorMarketParticipantName);
        }

        var targetDocument: string;
        if (producerSystemOperatorObj && roleTable.has(producerSystemOperatorObj.systemOperatorMarketParticipantName)) {
            targetDocument = producerSystemOperatorObj.systemOperatorMarketParticipantName;
        }

        activationDocumentObj.potentialParent =  (RoleType.Role_TSO === role_systemOperator && RoleType.Role_DSO == role_producer && activationDocumentObj.startCreatedDateTime !== "");
        activationDocumentObj.potentialChild = (RoleType.Role_DSO === role_systemOperator && activationDocumentObj.startCreatedDateTime !== "");

        await ActivationDocumentController.processActiveDocument(ctx, params, activationDocumentObj, targetDocument);

        console.info(
            '============= END   : Create %s ActivationDocumentController ===========',
            activationDocumentObj.activationDocumentMrid,
        );
    }



    public static async conciliationCrank(
        ctx: Context,
        params: Parameters): Promise<void> {

        const identity = params.values.get(ParametersType.IDENTITY);
        if (identity === OrganizationTypeMsp.RTE || identity === OrganizationTypeMsp.ENEDIS) {
            const query = `{"selector": {"docType": "activationDocument", "potentialParent": true, "potentialChild": true}}`;

            var targetDocument: string = RoleType.Role_TSO;
            const allResultsMix: ActivationDocument[] = await ActivationDocumentService.getQueryArrayResult(ctx, params, query, targetDocument);
            const remainingResultsMix: ActivationDocument[] = await ActivationDocumentController.garbageCleanage(ctx, params, allResultsMix, targetDocument);
            for (const activationDocument of remainingResultsMix) {
                await ActivationDocumentController.processActiveDocument(ctx, params, activationDocument, targetDocument, true);
            }

            targetDocument = OrganizationTypeMsp.PRODUCER;
            const allResultsPrivate: ActivationDocument[] = await ActivationDocumentService.getQueryArrayResult(ctx, params, query, targetDocument);
            const remainingResultsPrivate: ActivationDocument[] = await ActivationDocumentController.garbageCleanage(ctx, params, allResultsPrivate, targetDocument);
            for (const activationDocument of remainingResultsPrivate) {
                await ActivationDocumentController.processActiveDocument(ctx, params, activationDocument, targetDocument, true);
            }
        }
    }



    private static async garbageCleanage(
        ctx: Context,
        params: Parameters,
        allResults: ActivationDocument[],
        targetDocument:string): Promise<ActivationDocument[]> {

        const remainingDocuments: ActivationDocument[] = [];

        const ppcott:number = params.values.get(ParametersType.PPCO_TIME_THRESHOLD);
        const ppcott_date = new Date((new Date()).getTime() - ppcott);

        for (const activationDocument of allResults) {
            var garbage: boolean = false;

            if (activationDocument.startCreatedDateTime) {
                const sto_str: string = activationDocument.startCreatedDateTime;
                const sto_date: Date = new Date(sto_str);
                if (ppcott_date.getTime() >= sto_date.getTime()) {
                    garbage = true;
                }
            }

            if (!garbage && activationDocument.endCreatedDateTime) {
                const eto_str: string = activationDocument.endCreatedDateTime;
                const eto_date: Date = new Date(eto_str);
                if (ppcott_date.getTime() >= eto_date.getTime()) {
                    garbage = true;
                }
            }

            if (garbage) {
                activationDocument.potentialParent =  false;
                activationDocument.potentialChild = false;
                activationDocument.orderEnd = true;
                await ActivationDocumentService.write(ctx, params, activationDocument, targetDocument);
            } else {
                remainingDocuments.push(activationDocument);
            }
        }

        return remainingDocuments;
    }



    private static async processActiveDocument(
        ctx: Context,
        params: Parameters,
        activationDocument: ActivationDocument,
        targetDocument: string,
        isupdate: boolean = false): Promise<ActivationDocument> {

        const activationDocumentReference: string = JSON.stringify(activationDocument);
        if (activationDocument.endCreatedDateTime) {
            activationDocument.orderEnd = true;
        } else {
            activationDocument.orderEnd = false;
        }

        if (activationDocument.potentialChild === true
            && activationDocument.startCreatedDateTime
            && activationDocument.endCreatedDateTime
        ) {
            activationDocument = await ActivationDocumentController.reconciliationMatchParentWithChild(ctx, params, activationDocument);
        } else if (!activationDocument.startCreatedDateTime
                   && activationDocument.endCreatedDateTime) {
            const senderMarketParticipant: SystemOperator = JSON.parse(await SystemOperatorController.querySystemOperator(ctx, activationDocument.senderMarketParticipantMrid));
            if (senderMarketParticipant.systemOperatorMarketParticipantName === OrganizationTypeMsp.RTE) {
                activationDocument = await ActivationDocumentController.reconciliationUpdateEndState(ctx, params, activationDocument);
               }
        }

        if (!isupdate || activationDocumentReference !== JSON.stringify(activationDocument)) {
            await ActivationDocumentService.write(ctx, params, activationDocument, targetDocument);
        }

        return activationDocument;
    }




    private static async reconciliationMatchParentWithChild(
        ctx: Context,
        params: Parameters,
        childActivationDocument: ActivationDocument): Promise<ActivationDocument> {
        console.debug('============= START : reconciliationMatchParentWithChild ActivationDocumentController ===========');

        const yellowPageList: YellowPages[] =
            await YellowPagesController.getYellowPagesByOriginAutomationRegisteredResource(
                ctx,
                childActivationDocument.originAutomationRegisteredResourceMrid
            );
        // console.log('yellowPageList for BB reconciliation=', yellowPageList.toString());

        var registeredResourceMridList = [];
        for (const yellowPage of yellowPageList){
            registeredResourceMridList.push(yellowPage.registeredResourceMrid);
        }

        const registeredResourceMridList_str = JSON.stringify(registeredResourceMridList);
        const orderType = childActivationDocument.businessType;

        const pctmt:number = params.values.get(ParametersType.PC_TIME_MATCH_THRESHOLD);

        const queryDate: string = childActivationDocument.endCreatedDateTime;
        const datetmp = new Date(queryDate);

        datetmp.setUTCMilliseconds(0);
        datetmp.setUTCSeconds(0);
        const dateMinusPCTMT = new Date(datetmp.getTime() - pctmt);
        const datePlusPCTMT = new Date(datetmp.getTime() - pctmt);

        const query = `{
            "selector": {
                "docType": "activationDocument",
                "potentialParent": true,
                "registeredResourceMrid": { "$in" : ${registeredResourceMridList_str} },
                "businessType": "${orderType}",
                "$or" : [
                    {
                        "endCreatedDateTime": {
                            "$gte": ${JSON.stringify(queryDate)},
                            "$lte": ${JSON.stringify(datePlusPCTMT)}
                        }
                    },{
                        "endCreatedDateTime": {
                            "$gte": ${JSON.stringify(dateMinusPCTMT)},
                            "$lte": ${JSON.stringify(queryDate)}
                        }
                    }
                ],
                "sort": [{
                    "startCreatedDateTime" : "desc"
                }]
            }
        }`;

        const targetQuery = RoleType.Role_TSO;
        const memoryMatch = await ActivationDocumentController.processMatching(ctx, params, childActivationDocument, query, targetQuery);

        console.debug('============= END : reconciliationMatchParentWithChild ActivationDocumentController ===========');
        return memoryMatch;
    }



    private static async reconciliationUpdateEndState(
        ctx: Context,
        params: Parameters,
        endActivationDocument: ActivationDocument): Promise<ActivationDocument> {
        console.debug('============= START : reconciliationUpdateEndState ActivationDocumentController ===========');

        const senderMarketParticipantMrid: string = endActivationDocument.senderMarketParticipantMrid;
        const registeredResourceMrid: string = endActivationDocument.registeredResourceMrid;

        const queryDate: string = endActivationDocument.endCreatedDateTime;

        const pcuetmt:number = params.values.get(ParametersType.PC_TIME_UPDATEEND_MATCH_THRESHOLD);

        const datetmp = new Date(queryDate);
        datetmp.setUTCMilliseconds(0);
        datetmp.setUTCSeconds(0);
        datetmp.setUTCMinutes(0);
        datetmp.setUTCHours(0);
        const dateYesterday = new Date(datetmp.getTime() - pcuetmt);
        // console.log ('dateYesterday=', dateYesterday);
        // console.log ('dateYesterday=', dateYesterday.toUTCString());

        const query = `{
            "selector": {
                "docType": "activationDocument",
                "orderEnd": false,
                "senderMarketParticipantMrid": "${senderMarketParticipantMrid}",
                "registeredResourceMrid": "${registeredResourceMrid}",
                "messageType": { "$in" : ["A54","A98"] },
                "startCreatedDateTime": {
                    "$gte": ${JSON.stringify(dateYesterday)},
                    "$lte": ${JSON.stringify(queryDate)}
                },
                "sort": [{
                    "startCreatedDateTime": "desc"
                }]
            }
        }`;

        const targetQuery = RoleType.Role_Producer;
        const memoryEnd = await ActivationDocumentController.processMatching(ctx, params, endActivationDocument, query, targetQuery);

        console.debug('============= END : reconciliationUpdateEndState ActivationDocumentController ===========');
        return memoryEnd;
    }



    private static async processMatching(
        ctx: Context,
        params: Parameters,
        childEndDocument: ActivationDocument,
        query:string,
        targetParent:string): Promise<ActivationDocument> {

        const allParents: any[] = await ActivationDocumentService.getQueryArrayResult(ctx, params, query, targetParent);
        const index = await ActivationDocumentController.findIndexofClosestEndDate(childEndDocument, allParents);

        // If a parent document is found
        if ( index !== -1 ) {
            try {
                ActivationDocument.schema.validateSync(
                    allParents[index],
                    {strict: true, abortEarly: false},
                );
            } catch (err) {
                return childEndDocument;
            }

            const parentStartDocument: ActivationDocument = allParents[index];
            if (parentStartDocument) {
                if (!parentStartDocument.endCreatedDateTime) {
                    parentStartDocument.orderEnd = true;
                }
                parentStartDocument.subOrderList = await ActivationDocumentController.fillList(parentStartDocument.subOrderList, childEndDocument.activationDocumentMrid);
                await ActivationDocumentService.write(ctx, params, parentStartDocument, targetParent);

                childEndDocument.subOrderList = await ActivationDocumentController.fillList(childEndDocument.subOrderList, parentStartDocument.activationDocumentMrid);
                childEndDocument.potentialChild = false;
            }
        }

        return childEndDocument;
    }


    private static async fillList(inputList: string[], content: string): Promise<string[]> {
        if (!inputList) {
            inputList = [];
            inputList.push(content);
        } else {
            inputList.push(content);
        }
        return inputList;
    }


    private static async findIndexofClosestEndDate(referenceDocument: ActivationDocument, comparedDocument: ActivationDocument[]): Promise<number> {
        var delta:number = Number.MAX_VALUE;
        var index:number = -1;


        for (var i = 0; i < comparedDocument.length; i++) {
            const dateParent = new Date(comparedDocument[i].startCreatedDateTime);
            const dateChild = new Date(referenceDocument.endCreatedDateTime);
            const delta_loc = Math.abs(dateParent.getTime() - dateChild.getTime());
            if (delta_loc < delta) {
                delta = delta_loc;
                index = i;
            }
        }

        return index;
    }

}
