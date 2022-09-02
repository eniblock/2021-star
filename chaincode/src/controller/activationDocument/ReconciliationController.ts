
import { OrganizationTypeMsp } from '../../enums/OrganizationMspType';
import { ParametersType } from '../../enums/ParametersType';
import { RoleType } from '../../enums/RoleType';
import { DocType } from '../../enums/DocType';

import { ActivationDocument } from '../../model/activationDocument/activationDocument';
import { YellowPages } from '../../model/yellowPages';
import { STARParameters } from '../../model/starParameters';
import { SystemOperator } from '../../model/systemOperator';
import { ReconciliationState } from '../../model/activationDocument/reconciliationState';
import { DataReference } from '../../model/dataReference';

import { HLFServices } from '../service/HLFservice';
import { ActivationDocumentService } from '../service/ActivationDocumentService';
import { QueryStateService } from '../service/QueryStateService';

import { YellowPagesController } from '../YellowPagesController';
import { SystemOperatorController } from '../SystemOperatorController';

export class ReconciliationController {
    public static async getReconciliationState(
        params: STARParameters): Promise<DataReference[]> {
        console.debug('============= START : getReconciliationState ReconciliationController ===========');

        var reconciliationState: ReconciliationState = new ReconciliationState();
        reconciliationState.remaining = [];
        reconciliationState.updateOrders = [];

        const identity = params.values.get(ParametersType.IDENTITY);
        if (identity === OrganizationTypeMsp.RTE || identity === OrganizationTypeMsp.ENEDIS) {
            const query = `{"selector": {"docType": "${DocType.ACTIVATION_DOCUMENT}","$or":[{"potentialParent": true},{"potentialChild": true}]}}`;

            for (var role of [ RoleType.Role_DSO, RoleType.Role_TSO, OrganizationTypeMsp.PRODUCER ]) {
                const collections: string[] = await HLFServices.getCollectionsFromParameters(params, ParametersType.DATA_TARGET, role);

                if (collections) {
                    for (var collection of collections) {
                        var allResults: ActivationDocument[] = await ActivationDocumentService.getQueryArrayResult(params, query, [collection]);

                        if (allResults.length > 0) {
                            for (var result of allResults) {
                                reconciliationState.remaining.push({docType:DocType.ACTIVATION_DOCUMENT, collection:collection, data:result});
                            }
                        }
                    }
                }
            }

            if (reconciliationState && reconciliationState.remaining && reconciliationState.remaining.length >0 ) {
                reconciliationState = await ReconciliationController.garbageCleanage(params, reconciliationState);
            }
            if (reconciliationState && reconciliationState.remaining && reconciliationState.remaining.length >0 ) {
                reconciliationState = await ReconciliationController.searchReconciliation(params, reconciliationState);
            }

        }

        console.debug('============= END : getReconciliationState ReconciliationController ===========');

        return reconciliationState.updateOrders;
    }




    private static async garbageCleanage(
        params: STARParameters,
        conciliationState: ReconciliationState): Promise<ReconciliationState> {

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
        params: STARParameters,
        conciliationState: ReconciliationState): Promise<ReconciliationState> {

        console.debug('============= START : searchReconciliation ReconciliationController ===========');

        // console.info("0.0.0.0.0.0.0.0.0.0.0.0.0")
        // console.info(JSON.stringify(conciliationState))
        // console.info("0.0.0.0.0.0.0.0.0.0.0.0.0")

        if (conciliationState && conciliationState.remaining) {
            for (const remainingDocument of conciliationState.remaining) {
                if (remainingDocument.data) {
                    let matchResult :DataReference[];

                    if (remainingDocument.data.potentialChild === true
                        && remainingDocument.data.startCreatedDateTime
                        && remainingDocument.data.endCreatedDateTime
                    ) {

                        matchResult = await ReconciliationController.searchMatchParentWithChild(params, remainingDocument);

                    } else if (!remainingDocument.data.startCreatedDateTime
                            && remainingDocument.data.endCreatedDateTime) {

                        const senderMarketParticipant: SystemOperator =
                            await SystemOperatorController.getSystemOperatorObjById(params, remainingDocument.data.senderMarketParticipantMrid);
                        if (senderMarketParticipant.systemOperatorMarketParticipantName.toLocaleLowerCase() === OrganizationTypeMsp.RTE.toLocaleLowerCase()) {
                            matchResult = await ReconciliationController.searchUpdateEndState(params, remainingDocument);
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

        console.debug('============= END : searchReconciliation ReconciliationController ===========');

        return conciliationState;
    }

    private static async searchMatchParentWithChild(
        params: STARParameters,
        childReference: DataReference): Promise<DataReference[]> {
        console.debug('============= START : searchMatchParentWithChild ReconciliationController ===========');

        const yellowPageList: YellowPages[] =
            await YellowPagesController.getYellowPagesByOriginAutomationRegisteredResource(
                params,
                childReference.data.originAutomationRegisteredResourceMrid
            );
        // console.info("0000000000000000000000000")
        // console.log('yellowPageList for BB reconciliation=', JSON.stringify(yellowPageList));
        // console.info("0000000000000000000000000")

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
        // console.info("0000000000000000000000000")
        // console.info(query)
        // console.info("0000000000000000000000000")

        const roleTargetQuery = RoleType.Role_TSO;
        const searchResult = await ReconciliationController.searchMatching(params, childReference, query, roleTargetQuery);

        console.debug('============= END : searchMatchParentWithChild ReconciliationController ===========');
        return searchResult;
    }



    private static async searchUpdateEndState(
        params: STARParameters,
        childReference: DataReference): Promise<DataReference[]> {
        console.debug('============= START : searchUpdateEndState ReconciliationController ===========');

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
        // console.info("0000000000000000000000000")
        // console.info(query)
        // console.info("0000000000000000000000000")

        const roleTargetQuery = RoleType.Role_Producer;
        const searchResult = await ReconciliationController.searchMatching(params, childReference, query, roleTargetQuery);

        console.debug('============= END : searchUpdateEndState ReconciliationController ===========');
        return searchResult;
    }



    private static async searchMatching(
        params: STARParameters,
        childReference: DataReference,
        query:string,
        roleTargetParent:string): Promise<DataReference[]> {

        const matchResult: DataReference[] = [];

        const collections: string[] = await HLFServices.getCollectionsFromParameters(params, ParametersType.DATA_TARGET, roleTargetParent);

        if (collections) {
            for (var collection of collections) {
                const allParents: any[] = await ActivationDocumentService.getQueryArrayResult(params, query, [collection]);
                const index = await ReconciliationController.findIndexofClosestEndDate(childReference.data, allParents);

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
                        parentStartDocument.subOrderList = await ReconciliationController.fillList(parentStartDocument.subOrderList, childReference.data.activationDocumentMrid);
                        matchResult.push({docType:DocType.ACTIVATION_DOCUMENT,collection:collection,data:parentStartDocument});

                        childReference.data.subOrderList = await ReconciliationController.fillList(childReference.data.subOrderList, parentStartDocument.activationDocumentMrid);
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
