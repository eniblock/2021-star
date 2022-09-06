
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

import { YellowPagesController } from '../YellowPagesController';
import { SystemOperatorController } from '../SystemOperatorController';

export class ReconciliationController {
    public static async getReconciliationState(
        params: STARParameters): Promise<DataReference[]> {
        params.logger.debug('============= START : getReconciliationState ReconciliationController ===========');

        var reconciliationState: ReconciliationState = new ReconciliationState();
        reconciliationState.remainingChilds = [];
        reconciliationState.remainingParents = [];
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
                                if (result.potentialChild) {
                                    reconciliationState.remainingChilds.push({docType:DocType.ACTIVATION_DOCUMENT, collection:collection, data:result});
                                }
                                if (result.potentialParent) {
                                    reconciliationState.remainingParents.push({docType:DocType.ACTIVATION_DOCUMENT, collection:collection, data:result});
                                }
                            }
                        }
                    }
                }
            }

            console.debug("reconciliationState - initial: ", JSON.stringify(reconciliationState))

            if (reconciliationState &&
                ((reconciliationState.remainingChilds && reconciliationState.remainingChilds.length >0 )
                || (reconciliationState.remainingParents && reconciliationState.remainingParents.length >0 ))) {
                reconciliationState = await ReconciliationController.filterDocuments(params, reconciliationState);
            }

            console.debug("reconciliationState - filtered Parents: ", JSON.stringify([...reconciliationState.remainingParentsMap]))
            console.debug("reconciliationState - filtered EndStates: ", JSON.stringify([...reconciliationState.endStateRefsMap]))

            if (reconciliationState &&
                ((reconciliationState.remainingChilds && reconciliationState.remainingChilds.length >0 )
                || (reconciliationState.remainingParents && reconciliationState.remainingParents.length >0 ))) {
                reconciliationState = await ReconciliationController.searchReconciliation(params, reconciliationState);
            }

        }

        params.logger.debug('=============  END  : getReconciliationState ReconciliationController ===========');

        return reconciliationState.updateOrders;
    }




    //Garbage and Map Creation for matching
    private static async filterDocuments(
        params: STARParameters,
        conciliationState: ReconciliationState): Promise<ReconciliationState> {
        params.logger.debug('============= START : filterDocuments ReconciliationController ===========');


        const ppcott:number = params.values.get(ParametersType.PPCO_TIME_THRESHOLD);
        const ppcott_date = new Date((new Date()).getTime() - ppcott);

        const remainingChildDocuments: DataReference[] = [];
        if (conciliationState && conciliationState.remainingChilds) {
            for (var document of conciliationState.remainingChilds) {
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
                        remainingChildDocuments.push(document);
                    }
                }
            }
        }
        conciliationState.remainingChilds = remainingChildDocuments;


        const remainingParentDocumentsMap: Map<string, DataReference[]> = new Map();
        const endStateRefsMap: Map<string,DataReference[]> = new Map();
        if (conciliationState && conciliationState.remainingParents) {
            for (var document of conciliationState.remainingParents) {
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
                        if (RoleType.Role_DSO === document.data.receiverRole) {
                            var refs:DataReference[] = remainingParentDocumentsMap.get(document.data.registeredResourceMrid);
                            if (!refs) {
                                refs = [];
                            }
                            refs.push(document);

                            remainingParentDocumentsMap.set(document.data.registeredResourceMrid, refs);
                        } else {
                            const senderMarketParticipantMrid: string = document.data.senderMarketParticipantMrid;
                            const registeredResourceMrid: string = document.data.registeredResourceMrid;
                            const key:string = senderMarketParticipantMrid.concat("XZYZX").concat(registeredResourceMrid);

                            var refs:DataReference[] = endStateRefsMap.get(key);
                            if (!refs) {
                                refs = [];
                            }
                            refs.push(document);

                            endStateRefsMap.set(key, refs);
                        }
                    }
                }
            }
        }
        conciliationState.remainingParentsMap = remainingParentDocumentsMap;
        conciliationState.endStateRefsMap = endStateRefsMap;
        conciliationState.remainingParents = [];

        params.logger.debug('=============  END  : filterDocuments ReconciliationController ===========');
        return conciliationState;
    }









    private static async searchReconciliation(
        params: STARParameters,
        conciliationState: ReconciliationState): Promise<ReconciliationState> {

        params.logger.debug('============= START : searchReconciliation ReconciliationController ===========');

        // params.logger.debug("0.0.0.0.0.0.0.0.0.0.0.0.0")
        // params.logger.debug(JSON.stringify(conciliationState))
        // params.logger.debug("0.0.0.0.0.0.0.0.0.0.0.0.0")

        if (conciliationState && conciliationState.remainingChilds) {
            const searchMatchParentWithChildList: DataReference[] = [];
            const searchUpdateEndStateList: DataReference[] = [];

            for (const remainingDocument of conciliationState.remainingChilds) {
                if (remainingDocument.data) {

                    if (remainingDocument.data.startCreatedDateTime
                        && remainingDocument.data.endCreatedDateTime
                    ) {
                        searchMatchParentWithChildList.push(remainingDocument);

                    } else if (!remainingDocument.data.startCreatedDateTime
                            && remainingDocument.data.endCreatedDateTime) {

                        const senderMarketParticipant: SystemOperator =
                            await SystemOperatorController.getSystemOperatorObjById(params, remainingDocument.data.senderMarketParticipantMrid);

                        if (senderMarketParticipant.systemOperatorMarketParticipantName.toLocaleLowerCase() === OrganizationTypeMsp.RTE.toLocaleLowerCase()) {
                            searchUpdateEndStateList.push(remainingDocument);
                        }

                    }
                }
            }
            const matchResultParentWithChild: DataReference[] =
                await ReconciliationController.searchMatchParentWithChild(params, searchMatchParentWithChildList, conciliationState.remainingParentsMap);

            if (matchResultParentWithChild && matchResultParentWithChild.length > 0) {
                for (const result of matchResultParentWithChild) {
                    conciliationState.updateOrders.push(result);
                }
            }
            const matchResultEndState: DataReference[] = await ReconciliationController.searchUpdateEndState(params, searchUpdateEndStateList, conciliationState.endStateRefsMap);
            if (matchResultEndState && matchResultEndState.length > 0) {
                for (const result of matchResultEndState) {
                    conciliationState.updateOrders.push(result);
                }
            }
            conciliationState.remainingChilds = [];
            conciliationState.remainingParentsMap = null;
            conciliationState.endStateRefsMap = null;
        }

        params.logger.debug('=============  END  : searchReconciliation ReconciliationController ===========');

        return conciliationState;
    }



    private static async searchMatchParentWithChild(
        params: STARParameters,
        childReferenceList: DataReference[],
        remainingParentsMap: Map<string,DataReference[]>): Promise<DataReference[]> {
        params.logger.debug('============= START : searchMatchParentWithChild ReconciliationController ===========');

        const matchResult: DataReference[] = [];
        const pctmt:number = params.values.get(ParametersType.PC_TIME_MATCH_THRESHOLD);

        for (var childReference of childReferenceList) {
            const queryDate: string = childReference.data.startCreatedDateTime;
            const datetmp = new Date(queryDate);

            datetmp.setUTCMilliseconds(0);
            datetmp.setUTCSeconds(0);
            const dateMinusPCTMT = new Date(datetmp.getTime() - pctmt);
            const datePlusPCTMT = new Date(datetmp.getTime() + pctmt);


            const yellowPageList: YellowPages[] =
            await YellowPagesController.getYellowPagesByOriginAutomationRegisteredResource(
                params,
                childReference.data.originAutomationRegisteredResourceMrid
            );

            params.logger.debug("0000000000000000000000000")
            params.logger.debug('yellowPageList for BB reconciliation=', JSON.stringify(yellowPageList));
            params.logger.debug("0000000000000000000000000")

            var possibleParents: DataReference[] = [];
            for (const yellowPage of yellowPageList){
                var linkedParents: DataReference[] = remainingParentsMap.get(yellowPage.registeredResourceMrid);
                if (linkedParents) {
                    for (var linkedParent of linkedParents) {
                        const activationDocument: ActivationDocument = linkedParent.data;
                        const dateActivationDocument = new Date(activationDocument.startCreatedDateTime);
                        if (dateMinusPCTMT <= dateActivationDocument
                            && dateActivationDocument <= datePlusPCTMT) {
                                possibleParents.push(linkedParent);
                        }
                    }
                }
            }

            const index = await ReconciliationController.findIndexofClosestEndDateRef(childReference.data, possibleParents);

            // If a parent document is found
            if ( index !== -1 ) {
                const parentStartDocument: ActivationDocument = possibleParents[index].data;
                if (parentStartDocument) {
                    if (!parentStartDocument.endCreatedDateTime) {
                        parentStartDocument.orderEnd = true;
                    }
                    parentStartDocument.subOrderList = await ReconciliationController.fillList(parentStartDocument.subOrderList, childReference.data.activationDocumentMrid);
                    matchResult.push({docType:DocType.ACTIVATION_DOCUMENT, collection:possibleParents[index].collection, data:parentStartDocument});

                    childReference.data.subOrderList = await ReconciliationController.fillList(childReference.data.subOrderList, parentStartDocument.activationDocumentMrid);
                    childReference.data.potentialChild = false;
                    childReference.docType = DocType.ACTIVATION_DOCUMENT;
                    matchResult.push(childReference);
                }
            }

        }

        params.logger.debug('=============  END  : searchMatchParentWithChild ReconciliationController ===========');
        return matchResult;
    }



    private static async searchUpdateEndState(
        params: STARParameters,
        childReferenceList: DataReference[],
        remainingParentsMap: Map<string,DataReference[]>): Promise<DataReference[]> {
        params.logger.debug('============= START : searchUpdateEndState ReconciliationController ===========');

        const matchResult: DataReference[] = [];
        const pcuetmt:number = params.values.get(ParametersType.PC_TIME_UPDATEEND_MATCH_THRESHOLD);

        for (var childReference of childReferenceList) {
            const senderMarketParticipantMrid: string = childReference.data.senderMarketParticipantMrid;
            const registeredResourceMrid: string = childReference.data.registeredResourceMrid;
            const key:string = senderMarketParticipantMrid.concat("XZYZX").concat(registeredResourceMrid);

            const queryDateStr: string = childReference.data.endCreatedDateTime;
            const queryDate: Date = new Date(queryDateStr);
            const datetmp = new Date(queryDateStr);
            datetmp.setUTCHours(0,0,0,0);
            const dateYesterday = new Date(datetmp.getTime() - pcuetmt);

            var possibleParents: DataReference[] = [];
            var linkedParents: DataReference[] = remainingParentsMap.get(key);
            if (linkedParents) {
                for (var linkedParent of linkedParents) {
                    const activationDocument: ActivationDocument = linkedParent.data;
                    const dateActivationDocument = new Date(activationDocument.startCreatedDateTime);
                    if (dateYesterday <= dateActivationDocument
                        && dateActivationDocument <= queryDate) {
                            possibleParents.push(linkedParent);
                    }
                }
            }

            const index = await ReconciliationController.findIndexofClosestEndDateRef(childReference.data, possibleParents);

            // If a parent document is found
            if ( index !== -1 ) {
                const parentStartDocument: ActivationDocument = possibleParents[index].data;
                if (parentStartDocument) {
                    if (!parentStartDocument.endCreatedDateTime) {
                        parentStartDocument.orderEnd = true;
                    }
                    parentStartDocument.subOrderList = await ReconciliationController.fillList(parentStartDocument.subOrderList, childReference.data.activationDocumentMrid);
                    matchResult.push({docType:DocType.ACTIVATION_DOCUMENT, collection:possibleParents[index].collection, data:parentStartDocument});

                    childReference.data.subOrderList = await ReconciliationController.fillList(childReference.data.subOrderList, parentStartDocument.activationDocumentMrid);
                    childReference.data.potentialChild = false;
                    childReference.docType = DocType.ACTIVATION_DOCUMENT;
                    matchResult.push(childReference);
                }
            }
        }

        params.logger.debug('=============  END  : searchUpdateEndState ReconciliationController ===========');
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



    private static async findIndexofClosestEndDateRef(referenceDocument: ActivationDocument, comparedDocument: DataReference[]): Promise<number> {
        var delta:number = Number.MAX_VALUE;
        var index:number = -1;

        for (var i = 0; i < comparedDocument.length; i++) {
            const dateParent = new Date(comparedDocument[i].data.startCreatedDateTime);
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
