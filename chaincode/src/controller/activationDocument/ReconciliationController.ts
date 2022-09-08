
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
                                reconciliationState = await this.filterDocument(params, {docType:DocType.ACTIVATION_DOCUMENT, collection:collection, data:result}, reconciliationState);
                            }
                        }
                    }
                }
            }

            if (reconciliationState && reconciliationState.remainingChilds && reconciliationState.remainingChilds.length > 0) {
                reconciliationState = await ReconciliationController.searchMatchParentWithChild(params, reconciliationState);
            }
            if (reconciliationState && reconciliationState.startState && reconciliationState.startState.length > 0) {
                reconciliationState = await ReconciliationController.searchUpdateEndState(params, reconciliationState);
            }

        }

        params.logger.debug('=============  END  : getReconciliationState ReconciliationController ===========');

        return reconciliationState.updateOrders;
    }


    //Garbage and Map Creation for matching
    private static async filterDocument(
        params: STARParameters,
        dataReference: DataReference,
        conciliationState: ReconciliationState): Promise<ReconciliationState> {
        params.logger.debug('============= START : filterDocument ReconciliationController ===========');

        if (dataReference.data) {
            const garbage = await this.testGarbage(params, dataReference);

            if (garbage) {
                dataReference.data.potentialParent =  false;
                dataReference.data.potentialChild = false;
                dataReference.data.orderEnd = true;
                conciliationState.updateOrders.push(dataReference);
            }
            if (dataReference.data.potentialChild) {
                conciliationState = await this.filterChild(params, dataReference, conciliationState);
            }
            if (dataReference.data.potentialParent) {
                conciliationState = await this.filterParent(params, dataReference, conciliationState);
            }
        }

        params.logger.debug('=============  END  : filterDocument ReconciliationController ===========');
        return conciliationState;
    }





    private static async testGarbage(
        params: STARParameters,
        dataReference: DataReference): Promise<boolean> {
        params.logger.debug('============= START : testGarbage ReconciliationController ===========');

        var garbage: boolean = false;

        const ppcott:number = params.values.get(ParametersType.PPCO_TIME_THRESHOLD);
        const ppcott_date = new Date((new Date()).getTime() - ppcott);


        if (dataReference.data.startCreatedDateTime) {
            const sto_str: string = dataReference.data.startCreatedDateTime;
            const sto_date: Date = new Date(sto_str);
            if (ppcott_date.getTime() >= sto_date.getTime()) {
                garbage = true;
            }
        }

        if (!garbage && dataReference.data.endCreatedDateTime) {
            const eto_str: string = dataReference.data.endCreatedDateTime;
            const eto_date: Date = new Date(eto_str);
            if (ppcott_date.getTime() >= eto_date.getTime()) {
                garbage = true;
            }
        }

        params.logger.debug(`=============  END  : testGarbage (${JSON.stringify(garbage)}) ReconciliationController =========== `);
        return garbage;
    }



    private static async filterChild(
        params: STARParameters,
        dataReference: DataReference,
        conciliationState: ReconciliationState): Promise<ReconciliationState> {
        params.logger.debug('============= START : filterChild ReconciliationController ===========');

        if (dataReference.data.startCreatedDateTime
            && dataReference.data.endCreatedDateTime
        ) {
            conciliationState.remainingChilds.push(dataReference);

        } else if (!dataReference.data.startCreatedDateTime
                && dataReference.data.endCreatedDateTime) {

            const senderMarketParticipant: SystemOperator =
                await SystemOperatorController.getSystemOperatorObjById(params, dataReference.data.senderMarketParticipantMrid);

            if (senderMarketParticipant.systemOperatorMarketParticipantName.toLocaleLowerCase() === OrganizationTypeMsp.RTE.toLocaleLowerCase()) {
                conciliationState.startState.push(dataReference);
            }
        }


        params.logger.debug('=============  END  : filterChild ReconciliationController ===========');
        return conciliationState;
    }



    private static async filterParent(
        params: STARParameters,
        dataReference: DataReference,
        conciliationState: ReconciliationState): Promise<ReconciliationState> {
        params.logger.debug('============= START : filterParent ReconciliationController ===========');

        if (RoleType.Role_DSO === dataReference.data.receiverRole) {
            var refs:DataReference[] = conciliationState.remainingParentsMap.get(dataReference.data.registeredResourceMrid);
            if (!refs) {
                refs = [];
            }
            refs.push(dataReference);

            conciliationState.remainingParentsMap.set(dataReference.data.registeredResourceMrid, refs);
        } else {
            const senderMarketParticipantMrid: string = dataReference.data.senderMarketParticipantMrid;
            const registeredResourceMrid: string = dataReference.data.registeredResourceMrid;
            const key:string = senderMarketParticipantMrid.concat("XZYZX").concat(registeredResourceMrid);

            var refs:DataReference[] = conciliationState.endStateRefsMap.get(key);
            if (!refs) {
                refs = [];
            }
            refs.push(dataReference);

            conciliationState.endStateRefsMap.set(key, refs);
        }

        params.logger.debug('=============  END  : filterParent ReconciliationController ===========');
        return conciliationState;
    }






    private static async searchMatchParentWithChild(
        params: STARParameters,
        reconciliationState: ReconciliationState): Promise<ReconciliationState> {
        params.logger.debug('============= START : searchMatchParentWithChild ReconciliationController ===========');

        const pctmt:number = params.values.get(ParametersType.PC_TIME_MATCH_THRESHOLD);

        for (var childReference of reconciliationState.remainingChilds) {
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
            params.logger.debug('childReference=', JSON.stringify(childReference));
            params.logger.debug('remainingParentsMap=', JSON.stringify([...reconciliationState.remainingParentsMap]));
            params.logger.debug('yellowPageList for BB reconciliation=', JSON.stringify(yellowPageList));
            params.logger.debug("0000000000000000000000000")

            params.logger.debug("1111111111111111111111111")

            var possibleParents: DataReference[] = [];
            for (const yellowPage of yellowPageList){

                params.logger.debug("yellowPage.registeredResourceMrid: ", yellowPage.registeredResourceMrid)

                var linkedParents: DataReference[] = reconciliationState.remainingParentsMap.get(yellowPage.registeredResourceMrid);

                params.logger.debug("linkedParents: ", JSON.stringify(linkedParents))

                if (linkedParents) {
                    for (var linkedParent of linkedParents) {
                        const activationDocument: ActivationDocument = linkedParent.data;
                        const dateActivationDocument = new Date(activationDocument.startCreatedDateTime);

                        params.logger.debug("dateMinusPCTMT: ", dateMinusPCTMT)
                        params.logger.debug("dateActivationDocument: ", dateActivationDocument)
                        params.logger.debug("datePlusPCTMT: ", datePlusPCTMT)

                        if (dateMinusPCTMT <= dateActivationDocument
                            && dateActivationDocument <= datePlusPCTMT) {
                                possibleParents.push(linkedParent);
                        }
                    }
                }
            }

            params.logger.debug("possibleParents: ", JSON.stringify(possibleParents))
            params.logger.debug("1111111111111111111111111")

            const index = await ReconciliationController.findIndexofClosestEndDateRef(childReference.data, possibleParents);


            // If a parent document is found
            if ( index !== -1 ) {
                const parentStartDocument: ActivationDocument = possibleParents[index].data;
                if (parentStartDocument) {
                    if (!parentStartDocument.endCreatedDateTime) {
                        parentStartDocument.orderEnd = true;
                    }
                    parentStartDocument.subOrderList = await ReconciliationController.fillList(parentStartDocument.subOrderList, childReference.data.activationDocumentMrid);
                    reconciliationState.updateOrders.push({docType:DocType.ACTIVATION_DOCUMENT, collection:possibleParents[index].collection, data:parentStartDocument});

                    childReference.data.subOrderList = await ReconciliationController.fillList(childReference.data.subOrderList, parentStartDocument.activationDocumentMrid);
                    childReference.data.potentialChild = false;
                    childReference.docType = DocType.ACTIVATION_DOCUMENT;
                    reconciliationState.updateOrders.push(childReference);
                }
            }

        }

        params.logger.debug('=============  END  : searchMatchParentWithChild ReconciliationController ===========');
        return reconciliationState;
    }



    private static async searchUpdateEndState(
        params: STARParameters,
        reconciliationState: ReconciliationState): Promise<ReconciliationState> {
        params.logger.debug('============= START : searchUpdateEndState ReconciliationController ===========');

        const pcuetmt:number = params.values.get(ParametersType.PC_TIME_UPDATEEND_MATCH_THRESHOLD);

        for (var childReference of reconciliationState.startState) {
            const senderMarketParticipantMrid: string = childReference.data.senderMarketParticipantMrid;
            const registeredResourceMrid: string = childReference.data.registeredResourceMrid;
            const key:string = senderMarketParticipantMrid.concat("XZYZX").concat(registeredResourceMrid);

            const queryDateStr: string = childReference.data.endCreatedDateTime;
            const queryDate: Date = new Date(queryDateStr);
            const datetmp = new Date(queryDateStr);
            datetmp.setUTCHours(0,0,0,0);
            const dateYesterday = new Date(datetmp.getTime() - pcuetmt);

            var possibleParents: DataReference[] = [];
            var linkedParents: DataReference[] = reconciliationState.endStateRefsMap.get(key);
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
                    reconciliationState.updateOrders.push({docType:DocType.ACTIVATION_DOCUMENT, collection:possibleParents[index].collection, data:parentStartDocument});

                    childReference.data.subOrderList = await ReconciliationController.fillList(childReference.data.subOrderList, parentStartDocument.activationDocumentMrid);
                    childReference.data.potentialChild = false;
                    childReference.docType = DocType.ACTIVATION_DOCUMENT;
                    reconciliationState.updateOrders.push(childReference);
                }
            }
        }

        params.logger.debug('=============  END  : searchUpdateEndState ReconciliationController ===========');
        return reconciliationState;
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
