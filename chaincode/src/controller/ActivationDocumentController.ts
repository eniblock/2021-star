import { Context } from 'fabric-contract-api';
import { isEmpty } from 'lodash';

import { OrganizationTypeMsp } from '../enums/OrganizationMspType';
import { ParametersType } from '../enums/ParametersType';

import { ActivationDocument } from '../model/activationDocument';
import { YellowPages } from '../model/yellowPages';
import { STARParameters } from '../model/starParameters';
import { SystemOperator } from '../model/systemOperator';

import { SiteService } from './service/SiteService';
import { HLFServices } from './service/HLFservice';
import { SystemOperatorService } from './service/SystemOperatorService';
import { ProducerService } from './service/ProducerService';
import { ActivationDocumentService } from './service/ActivationDocumentService';

import { YellowPagesController } from './YellowPagesController';
import { SystemOperatorController } from './SystemOperatorController';
import { Producer } from '../model/producer';
import { RoleType } from '../enums/RoleType';
import { DocType } from '../enums/DocType';
import { ConciliationState } from '../model/conciliationState';
import { DataReference } from '../model/dataReference';
import { QueryStateService } from './service/QueryStateService';

export class ActivationDocumentController {

    public static async getActivationDocumentByProducer(
        ctx: Context,
        params: STARParameters,
        producerMrid: string): Promise<string> {

        const query = `{"selector": {"docType": "activationDocument", "receiverMarketParticipantMrid": "${producerMrid}"}}`;

        const collections: string[] = await HLFServices.getCollectionsFromParameters(params, ParametersType.ACTIVATION_DOCUMENT, ParametersType.ALL);

        const allResults: ActivationDocument[] = await ActivationDocumentService.getQueryArrayResult(ctx, params, query, collections);
        const formated = JSON.stringify(allResults);

        return formated;
    }



    public static async getActivationDocumentBySystemOperator(
        ctx: Context,
        params: STARParameters,
        systemOperatorMrid: string): Promise<string> {

        const query = `{"selector": {"docType": "activationDocument", "senderMarketParticipantMrid": "${systemOperatorMrid}"}}`;

        const collections: string[] = await HLFServices.getCollectionsFromParameters(params, ParametersType.ACTIVATION_DOCUMENT, ParametersType.ALL);

        const allResults: ActivationDocument[] = await ActivationDocumentService.getQueryArrayResult(ctx, params, query, collections);
        const formated = JSON.stringify(allResults);

        return formated;
    }


    public static async getActivationDocumentById(
        ctx: Context,
        params: STARParameters,
        activationDocumentMrid: string): Promise<ActivationDocument> {

        const collections: string[] = await HLFServices.getCollectionsFromParameters(params, ParametersType.ACTIVATION_DOCUMENT, ParametersType.ALL);
        const result:ActivationDocument = await ActivationDocumentService.getObjbyId(ctx, params, activationDocumentMrid, collections);

        return result;
    }


    public static async getActivationDocumentByQuery(
        ctx: Context,
        params: STARParameters,
        query: string): Promise<string> {

        const collections: string[] = await HLFServices.getCollectionsFromParameters(params, ParametersType.ACTIVATION_DOCUMENT, ParametersType.ALL);

        const allResults: any[] = await ActivationDocumentService.getQueryArrayResult(ctx, params, query, collections);
        const formated = JSON.stringify(allResults);

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

        let activationDocumentObj: ActivationDocument;
        try {
            activationDocumentObj = JSON.parse(inputStr);
        } catch (error) {
            // console.error('error=', error);
            throw new Error(`ERROR createActivationDocument-> Input string NON-JSON value`);
        }

        try {
            ActivationDocument.schema.validateSync(
                activationDocumentObj,
                {strict: true, abortEarly: false},
            );
        } catch (error) {
            console.error('error=', error);
            throw error;
        }

        await ActivationDocumentController.createActivationDocumentObj(ctx, params, activationDocumentObj);

        console.info('============= END : Create ActivationDocumentController ===========');
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

        let activationDocumentList: ActivationDocument[] = [];
        try {
            activationDocumentList = JSON.parse(inputStr);
        } catch (error) {
            throw new Error(`ERROR createActivationDocument by list-> Input string NON-JSON value`);
        }

        if (activationDocumentList && activationDocumentList.length > 0) {
            for (var activationDocumentObj of activationDocumentList) {
                try {
                    ActivationDocument.schema.validateSync(
                        activationDocumentObj,
                        {strict: true, abortEarly: false},
                    );
                } catch (error) {
                    console.error('error=', error);
                    throw error;
                }
            }
        }

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
        activationDocumentObj: ActivationDocument) {
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

        if (systemOperatorObj.systemOperatorMarketParticipantName.toLowerCase !== identity.toLowerCase ) {
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

        /* Test Site existence if order does not come from TSO and goes to DSO */
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

        const activationDocumentRules: string[] = params.values.get(ParametersType.ACTIVATION_DOCUMENT_RULES);
        const pattern = activationDocumentObj.messageType + "-" + activationDocumentObj.businessType + "-" + activationDocumentObj.reasonCode;
        if (activationDocumentRules && !activationDocumentRules.includes(pattern)) {
            throw new Error(`Incoherency between messageType, businessType and reason code for Activation Document ${activationDocumentObj.activationDocumentMrid} creation.`);
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

        var targetDocument: string;
        if (producerSystemOperatorObj && roleTable.has(producerSystemOperatorObj.systemOperatorMarketParticipantName)) {
            const collectionMap: Map<string, string[]> = params.values.get(ParametersType.ACTIVATION_DOCUMENT);

            const target = producerSystemOperatorObj.systemOperatorMarketParticipantName;
            targetDocument = collectionMap.get(target)[0];
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

        await ActivationDocumentService.write(ctx, params, activationDocumentObj, targetDocument);

        console.info('============= END   : Create %s createActivationDocumentObj ===========',
            activationDocumentObj.activationDocumentMrid,
        );
    }

    public static async updateActivationDocumentByOrders(
        ctx: Context,
        params: STARParameters,
        inputStr: string) {
        console.info('============= START : updateActivationDocumentByOrders ActivationDocumentController ===========');

        const identity = params.values.get(ParametersType.IDENTITY);
        if (identity !== OrganizationTypeMsp.RTE && identity !== OrganizationTypeMsp.ENEDIS) {
            throw new Error(`Organisation, ${identity} does not have write access for Activation Document`);
        }

        let updateOrders: DataReference[];
        try {
            updateOrders = JSON.parse(inputStr);
        } catch (error) {
        // console.error('error=', error);
            throw new Error(`ERROR updateActivationDocumentByOrders -> Input string NON-JSON value`);
        }

        if (updateOrders && updateOrders.length > 0 ) {
            for (const updateOrder of updateOrders) {
                DataReference.schema.validateSync(
                    updateOrder,
                    {strict: true, abortEarly: false},
                );
                if (updateOrder.data) {
                    ActivationDocument.schema.validateSync(
                        updateOrder.data,
                        {strict: true, abortEarly: false},
                    );
                    const activationDocument:ActivationDocument = updateOrder.data;

                    const original:ActivationDocument = await ActivationDocumentService.getObj(ctx, params, activationDocument.activationDocumentMrid, updateOrder.collection);

                    const original_order:ActivationDocument = JSON.parse(JSON.stringify(original));
                    original_order.orderEnd = activationDocument.orderEnd;
                    original_order.potentialChild = activationDocument.potentialChild;
                    original_order.potentialParent = activationDocument.potentialParent;
                    original_order.subOrderList = activationDocument.subOrderList;

                    if (JSON.stringify(original_order) !== JSON.stringify(activationDocument)) {
                        throw new Error(`Error on document ${activationDocument.activationDocumentMrid} only orderEnd, potentialChild, potentialParent and subOrderList can be updated by orders.`);
                    }

                    if (original.subOrderList) {
                        for (const listElt of original.subOrderList) {
                            if (!activationDocument.subOrderList.includes(listElt)) {
                                throw new Error(`Error on document ${activationDocument.activationDocumentMrid} ids can only be added to subOrderList.`);
                            }
                        }
                    }
                    activationDocument.docType = DocType.ACTIVATION_DOCUMENT;
                    await ActivationDocumentService.write(ctx, params, activationDocument, updateOrder.collection);
                }
            }
        }
        console.info('============= END   : updateActivationDocumentByOrders ActivationDocumentController ===========');


    }


    public static async getReconciliationState(
        ctx: Context,
        params: STARParameters): Promise<string> {
        console.info('============= START : getReconciliationState ActivationDocumentController ===========');

        var conciliationState: ConciliationState = new ConciliationState();
        conciliationState.remaining = [];
        conciliationState.updateOrders = [];

        const identity = params.values.get(ParametersType.IDENTITY);
        if (identity === OrganizationTypeMsp.RTE || identity === OrganizationTypeMsp.ENEDIS) {
            const query = `{"selector": {"docType": "${DocType.ACTIVATION_DOCUMENT}","$or":[{"potentialParent": true},{"potentialChild": true}]}}`;

            for (var role of [ RoleType.Role_DSO, RoleType.Role_TSO, OrganizationTypeMsp.PRODUCER ]) {
                const collections: string[] = await HLFServices.getCollectionsFromParameters(params, ParametersType.ACTIVATION_DOCUMENT, role);

                if (collections) {
                    for (var collection of collections) {
                        var allResults: ActivationDocument[] = await ActivationDocumentService.getQueryArrayResult(ctx, params, query, [collection]);

                        if (allResults.length > 0) {
                            for (var result of allResults) {
                                conciliationState.remaining.push({docType:DocType.ACTIVATION_DOCUMENT, collection:collection, data:result});
                            }
                        }
                    }
                }
            }

            if (conciliationState && conciliationState.remaining && conciliationState.remaining.length >0 ) {
                conciliationState = await ActivationDocumentController.garbageCleanage(params, conciliationState);
            }
            if (conciliationState && conciliationState.remaining && conciliationState.remaining.length >0 ) {
                conciliationState = await ActivationDocumentController.searchReconciliation(ctx, params, conciliationState);
            }
        }
        var sate_str = JSON.stringify(conciliationState.updateOrders);

        console.info('============= END : getReconciliationState ActivationDocumentController ===========');

        return sate_str;
    }




    private static async garbageCleanage(
        params: STARParameters,
        conciliationState: ConciliationState): Promise<ConciliationState> {

        const remainingDocuments: DataReference[] = [];

        const ppcott:number = params.values.get(ParametersType.PPCO_TIME_THRESHOLD);
        const ppcott_date = new Date((new Date()).getTime() - ppcott);

        if (conciliationState && conciliationState.remaining) {
            for (var document of conciliationState.remaining) {
                if (document.data) {
                    var garbage: boolean = false;

                    if (document.data.startCreatedDateTime) {
                        const sto_str: string = document.data.startCreatedDateTime;
                        const sto_date: Date = new Date(sto_str);
                        if (ppcott_date.getTime() >= sto_date.getTime()) {
                            garbage = true;
                        }
                    }

                    if (!garbage && document.data.endCreatedDateTime) {
                        const eto_str: string = document.data.endCreatedDateTime;
                        const eto_date: Date = new Date(eto_str);
                        if (ppcott_date.getTime() >= eto_date.getTime()) {
                            garbage = true;
                        }
                    }

                    if (garbage) {
                        document.data.potentialParent =  false;
                        document.data.potentialChild = false;
                        document.data.orderEnd = true;
                        conciliationState.updateOrders.push(document);
                    } else {
                        remainingDocuments.push(document);
                    }
                }
            }
        }
        conciliationState.remaining = remainingDocuments;

        return conciliationState;
    }

    private static async searchReconciliation(
        ctx: Context,
        params: STARParameters,
        conciliationState: ConciliationState): Promise<ConciliationState> {

        console.debug('============= START : searchReconciliation ActivationDocumentController ===========');

        if (conciliationState && conciliationState.remaining) {
            for (const remainingDocument of conciliationState.remaining) {
                if (remainingDocument.data) {
                    let matchResult :DataReference[];

                    if (remainingDocument.data.potentialChild === true
                        && remainingDocument.data.startCreatedDateTime
                        && remainingDocument.data.endCreatedDateTime
                    ) {

                        matchResult = await ActivationDocumentController.searchMatchParentWithChild(ctx, params, remainingDocument);

                    } else if (!remainingDocument.data.startCreatedDateTime
                            && remainingDocument.data.endCreatedDateTime) {

                                const senderMarketParticipant: SystemOperator = JSON.parse(await SystemOperatorController.querySystemOperator(ctx, remainingDocument.data.senderMarketParticipantMrid));
                        if (senderMarketParticipant.systemOperatorMarketParticipantName === OrganizationTypeMsp.RTE) {
                            matchResult = await ActivationDocumentController.searchUpdateEndState(ctx, params, remainingDocument);
                        }

                    }
                    if (matchResult && matchResult.length > 0) {
                        for (const result of matchResult) {
                            conciliationState.updateOrders.push(result);
                        }
                    }
                }
            }
            conciliationState.remaining = [];
        }

        console.debug('============= END : searchReconciliation ActivationDocumentController ===========');

        return conciliationState;
    }

    private static async searchMatchParentWithChild(
        ctx: Context,
        params: STARParameters,
        childReference: DataReference): Promise<DataReference[]> {
        console.debug('============= START : searchMatchParentWithChild ActivationDocumentController ===========');

        const yellowPageList: YellowPages[] =
            await YellowPagesController.getYellowPagesByOriginAutomationRegisteredResource(
                ctx,
                childReference.data.originAutomationRegisteredResourceMrid
            );
        // console.log('yellowPageList for BB reconciliation=', yellowPageList.toString());

        var registeredResourceMridList = [];
        for (const yellowPage of yellowPageList){
            registeredResourceMridList.push(yellowPage.registeredResourceMrid);
        }

        const registeredResourceMridList_str = JSON.stringify(registeredResourceMridList);
        // const orderType = childReference.data.businessType;

        const pctmt:number = params.values.get(ParametersType.PC_TIME_MATCH_THRESHOLD);

        const queryDate: string = childReference.data.startCreatedDateTime;
        const datetmp = new Date(queryDate);

        datetmp.setUTCMilliseconds(0);
        datetmp.setUTCSeconds(0);
        const dateMinusPCTMT = new Date(datetmp.getTime() - pctmt);
        const datePlusPCTMT = new Date(datetmp.getTime() - pctmt);

        var args: string[] = [];
        args.push(`"potentialParent":true`);
        args.push(`"registeredResourceMrid":{"$in":${registeredResourceMridList_str}}`);
        // args.push(`"businessType":"${orderType}"`);
        const date_criteria: string = `"$or":[`
        .concat(`{"startCreatedDateTime":{"$gte":${JSON.stringify(queryDate)},"$lte":${JSON.stringify(datePlusPCTMT)}}},`)
        .concat(`{"startCreatedDateTime":{"$gte":${JSON.stringify(dateMinusPCTMT)},"$lte":${JSON.stringify(queryDate)}}}`)
        .concat(`]`);
        args.push(date_criteria);

        const query = await QueryStateService.buildQuery(DocType.ACTIVATION_DOCUMENT, args);

        const roleTargetQuery = RoleType.Role_TSO;
        const searchResult = await ActivationDocumentController.searchMatching(ctx, params, childReference, query, roleTargetQuery);

        console.debug('============= END : searchMatchParentWithChild ActivationDocumentController ===========');
        return searchResult;
    }

    private static async searchUpdateEndState(
        ctx: Context,
        params: STARParameters,
        childReference: DataReference): Promise<DataReference[]> {
        console.debug('============= START : searchUpdateEndState ActivationDocumentController ===========');

        const senderMarketParticipantMrid: string = childReference.data.senderMarketParticipantMrid;
        const registeredResourceMrid: string = childReference.data.registeredResourceMrid;

        const queryDate: string = childReference.data.endCreatedDateTime;

        const pcuetmt:number = params.values.get(ParametersType.PC_TIME_UPDATEEND_MATCH_THRESHOLD);

        const datetmp = new Date(queryDate);
        datetmp.setUTCHours(0,0,0,0);
        const dateYesterday = new Date(datetmp.getTime() - pcuetmt);
        // console.log ('dateYesterday=', dateYesterday);
        // console.log ('dateYesterday=', dateYesterday.toUTCString());

        var args: string[] = [];
        args.push(`"orderEnd":false`);
        args.push(`"senderMarketParticipantMrid":"${senderMarketParticipantMrid}"`);
        args.push(`"registeredResourceMrid":"${registeredResourceMrid}"`);
        args.push(`"messageType":{"$in":["A54","A98"]}`);
        args.push(`"startCreatedDateTime":{"$gte":${JSON.stringify(dateYesterday)},"$lte":${JSON.stringify(queryDate)}}`);

        const query = await QueryStateService.buildQuery(DocType.ACTIVATION_DOCUMENT, args);

        // const query = `{
        //     "selector": {
        //         "docType": "${DocType.ACTIVATION_DOCUMENT}",
        //         "orderEnd": false,
        //         "senderMarketParticipantMrid": "${senderMarketParticipantMrid}",
        //         "registeredResourceMrid": "${registeredResourceMrid}",
        //         "messageType": { "$in" : ["A54","A98"] },
        //         "startCreatedDateTime": {
        //             "$gte": ${JSON.stringify(dateYesterday)},
        //             "$lte": ${JSON.stringify(queryDate)}
        //         }
        //     }
        // }`;
        // console.info("query :", query);

        const roleTargetQuery = RoleType.Role_Producer;
        const searchResult = await ActivationDocumentController.searchMatching(ctx, params, childReference, query, roleTargetQuery);

        console.debug('============= END : searchUpdateEndState ActivationDocumentController ===========');
        return searchResult;
    }



    private static async searchMatching(
        ctx: Context,
        params: STARParameters,
        childReference: DataReference,
        query:string,
        roleTargetParent:string): Promise<DataReference[]> {

        const matchResult: DataReference[] = [];

        const collections: string[] = await HLFServices.getCollectionsFromParameters(params, ParametersType.ACTIVATION_DOCUMENT, roleTargetParent);

        if (collections) {
            for (var collection of collections) {
                const allParents: any[] = await ActivationDocumentService.getQueryArrayResult(ctx, params, query, [collection]);
                const index = await ActivationDocumentController.findIndexofClosestEndDate(childReference.data, allParents);

                // If a parent document is found
                if ( index !== -1 ) {
                    try {
                        ActivationDocument.schema.validateSync(
                            allParents[index],
                            {strict: true, abortEarly: false},
                        );
                    } catch (err) {
                        return [];
                    }

                    const parentStartDocument: ActivationDocument = allParents[index];
                    if (parentStartDocument) {
                        if (!parentStartDocument.endCreatedDateTime) {
                            parentStartDocument.orderEnd = true;
                        }
                        parentStartDocument.subOrderList = await ActivationDocumentController.fillList(parentStartDocument.subOrderList, childReference.data.activationDocumentMrid);
                        matchResult.push({docType:DocType.ACTIVATION_DOCUMENT,collection:collection,data:parentStartDocument});

                        childReference.data.subOrderList = await ActivationDocumentController.fillList(childReference.data.subOrderList, parentStartDocument.activationDocumentMrid);
                        childReference.data.potentialChild = false;
                        childReference.docType = DocType.ACTIVATION_DOCUMENT;
                        matchResult.push(childReference);
                    }
                }
            }
        }

        return matchResult;
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
            var dateChild: Date;
            if (referenceDocument.startCreatedDateTime) {
                dateChild = new Date(referenceDocument.startCreatedDateTime);
            } else {
                dateChild = new Date(referenceDocument.endCreatedDateTime);
            }
            const delta_loc = Math.abs(dateParent.getTime() - dateChild.getTime());
            if (delta_loc < delta) {
                delta = delta_loc;
                index = i;
            }
        }

        return index;
    }

}
