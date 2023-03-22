
import { DocType } from '../../enums/DocType';
import { OrganizationTypeMsp } from '../../enums/OrganizationMspType';
import { ParametersType } from '../../enums/ParametersType';
import { RoleType } from '../../enums/RoleType';

import { ActivationDocument } from '../../model/activationDocument/activationDocument';
import { ReconciliationState } from '../../model/activationDocument/reconciliationState';
import { DataReference } from '../../model/dataReference';
import { STARParameters } from '../../model/starParameters';
import { SystemOperator } from '../../model/systemOperator';
import { YellowPages } from '../../model/yellowPages';

import { ActivationDocumentService } from '../service/ActivationDocumentService';
import { HLFServices } from '../service/HLFservice';

import { CommonService } from '../service/CommonService';
import { SystemOperatorController } from '../SystemOperatorController';
import { YellowPagesController } from '../YellowPagesController';
import { ReconciliationStatus } from '../../enums/ReconciliationStatus';

export class ReconciliationController {
    public static async getReconciliationState(
        params: STARParameters): Promise<DataReference[]> {
        params.logger.debug('============= START : getReconciliationState ReconciliationController ===========');

        let reconciliationState: ReconciliationState = new ReconciliationState();
        const activationDocumentIdList: string[] = [];

        const identity = params.values.get(ParametersType.IDENTITY);
        if (identity === OrganizationTypeMsp.RTE || identity === OrganizationTypeMsp.ENEDIS) {
            const query = `{"selector": {"docType": "${DocType.ACTIVATION_DOCUMENT}","$or":[{"potentialParent": true},{"potentialChild": true},{"potentialChild": false}]}}`;

            for (const role of [ RoleType.Role_DSO, RoleType.Role_TSO, OrganizationTypeMsp.PRODUCER ]) {
                const collections: string[] = await HLFServices.getCollectionsFromParameters(
                    params, ParametersType.DATA_TARGET, role);

                if (collections) {
                    for (const collection of collections) {
                        const allResults: ActivationDocument[] = await ActivationDocumentService.getQueryArrayResult(
                            params, query, [collection]);

                        // params.logger.debug("iiiiiiiiiiiiiiiiiiiiiii")
                        // params.logger.debug(JSON.stringify(allResults))
                        // params.logger.debug("iiiiiiiiiiiiiiiiiiiiiii")

                        if (allResults.length > 0) {
                            for (const result of allResults) {
                                const idKey = result.activationDocumentMrid.concat('##').concat(collection);
                                if (!activationDocumentIdList.includes(idKey)) {
                                    activationDocumentIdList.push(idKey);

                                    reconciliationState = await this.filterDocument(
                                        params,
                                        {collection, data: result, docType: DocType.ACTIVATION_DOCUMENT},
                                        reconciliationState);
                                }
                            }
                        }
                    }
                }
            }

            // params.logger.info("-----------------------")
            // params.logger.info("-----------------------")
            // params.logger.info("- - - - - - - - - - - -")
            // params.logger.info("-----------------------")
            // params.logger.info("-----------------------")

            // params.logger.info(JSON.stringify(reconciliationState))
            // params.logger.info("---")
            // params.logger.info(JSON.stringify([...reconciliationState.endStateRefsMap]))
            // params.logger.info("---")
            // params.logger.info(JSON.stringify([...reconciliationState.remainingParentsMap]))
            // params.logger.info("---")
            // params.logger.info(JSON.stringify([...reconciliationState.remainingChilds]))
            // params.logger.info("-----------------------")

            if (reconciliationState
                && reconciliationState.remainingChilds
                && reconciliationState.remainingChilds.length > 0) {
                reconciliationState =
                    await ReconciliationController.searchMatchParentWithChild(params, reconciliationState);
            }

            // params.logger.debug("- - - - - - - - - - - -")
            // params.logger.debug(JSON.stringify(reconciliationState))
            // params.logger.debug("- - -")
            // params.logger.debug(JSON.stringify([...reconciliationState.endStateRefsMap]))
            // params.logger.debug("- - -")
            // params.logger.debug(JSON.stringify([...reconciliationState.remainingParentsMap]))
            // params.logger.debug("- - -")
            // params.logger.debug(JSON.stringify([...reconciliationState.remainingChilds]))
            // params.logger.debug("- - - - - - - - - - - -")

            if (reconciliationState && reconciliationState.startState && reconciliationState.startState.length > 0) {
                reconciliationState = await ReconciliationController.searchUpdateEndState(params, reconciliationState);
            }

            // params.logger.debug("-----------------------")
            // params.logger.debug(JSON.stringify(reconciliationState))
            // params.logger.debug("-----")
            // params.logger.debug(JSON.stringify([...reconciliationState.endStateRefsMap]))
            // params.logger.debug("-----")
            // params.logger.debug(JSON.stringify([...reconciliationState.remainingParentsMap]))
            // params.logger.debug("-----")
            // params.logger.debug(JSON.stringify([...reconciliationState.remainingChilds]))

            // params.logger.info("-----------------------")
            // params.logger.info("-----------------------")
            // params.logger.info("- - - - - - - - - - - -")
            // params.logger.info("-----------------------")
            // params.logger.info("-----------------------")

        }

        params.logger.debug('=============  END  : getReconciliationState ReconciliationController ===========');

        return reconciliationState.updateOrders;
    }

    // Garbage and Map Creation for matching
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

        let garbage: boolean = false;

        const ppcott: number = params.values.get(ParametersType.PPCO_TIME_THRESHOLD);
        const ppcottDate = CommonService.reduceDateDays(new Date(), ppcott);

        if (dataReference.data.startCreatedDateTime) {
            const stoStr: string = dataReference.data.startCreatedDateTime;
            const stoDate: Date = new Date(stoStr);
            if (ppcottDate.getTime() >= stoDate.getTime()) {
                garbage = true;
            }
        }

        if (!garbage && dataReference.data.endCreatedDateTime) {
            const etoStr: string = dataReference.data.endCreatedDateTime;
            const etoDate: Date = new Date(etoStr);
            if (ppcottDate.getTime() >= etoDate.getTime()) {
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
                await SystemOperatorController.getSystemOperatorObjById(
                    params, dataReference.data.senderMarketParticipantMrid);

            if (senderMarketParticipant.systemOperatorMarketParticipantName.toLocaleLowerCase() ===
                OrganizationTypeMsp.RTE.toLocaleLowerCase()) {
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
            let refs: DataReference[] =
                conciliationState.remainingParentsMap.get(dataReference.data.registeredResourceMrid);
            if (!refs) {
                refs = [];
            }
            refs.push(dataReference);

            conciliationState.remainingParentsMap.set(dataReference.data.registeredResourceMrid, refs);
        } else {
            const senderMarketParticipantMrid: string = dataReference.data.senderMarketParticipantMrid;
            const registeredResourceMrid: string = dataReference.data.registeredResourceMrid;
            const key: string = senderMarketParticipantMrid.concat('XZYZX').concat(registeredResourceMrid);

            let refs: DataReference[] = conciliationState.endStateRefsMap.get(key);
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

        for (const childReference of reconciliationState.remainingChilds) {
            const childStartDate = new Date(childReference.data.startCreatedDateTime);

            const yellowPageList: YellowPages[] =
            await YellowPagesController.getYellowPagesByOriginAutomationRegisteredResource(
                params,
                childReference.data.originAutomationRegisteredResourceMrid,
            );

            params.logger.info('0000000000000000000000000');
            params.logger.info('childReference=', JSON.stringify(childReference));
            params.logger.info('remainingParentsMap=', JSON.stringify([...reconciliationState.remainingParentsMap]));
            params.logger.info('yellowPageList for BB reconciliation=', JSON.stringify(yellowPageList));
            params.logger.info('0000000000000000000000000');

            params.logger.info('1111111111111111111111111');

            const possibleParents: DataReference[] = [];
            for (const yellowPage of yellowPageList) {

                params.logger.info('yellowPage.registeredResourceMrid: ', yellowPage.registeredResourceMrid);

                const linkedParents: DataReference[] =
                    reconciliationState.remainingParentsMap.get(yellowPage.registeredResourceMrid);

                params.logger.info('linkedParents: ', linkedParents);

                if (linkedParents) {
                    for (const linkedParent of linkedParents) {
                        const activationDocument: ActivationDocument = linkedParent.data;
                        if (activationDocument.startCreatedDateTime
                            && activationDocument.startCreatedDateTime !== "") {

                            const parentDateStart = new Date(activationDocument.startCreatedDateTime);

                            if (parentDateStart <= childStartDate) {
                                if (activationDocument.endCreatedDateTime
                                    && activationDocument.endCreatedDateTime !== "") {

                                        const parentDateEnd = new Date(activationDocument.endCreatedDateTime);
                                        if (childStartDate <= parentDateEnd) {
                                            possibleParents.push(linkedParent);
                                        }
                                    } else {
                                        possibleParents.push(linkedParent);
                                    }
                            }
                        }
                    }
                }
            }

            params.logger.info('possibleParents: ', possibleParents);
            params.logger.info('1111111111111111111111111');

            const index = await ReconciliationController.findIndexofClosestEndDateRef(
                childReference.data, possibleParents);

            params.logger.info('chosen Parent: ', index);
            params.logger.info('1111111111111111111111111');


            // If a parent document is found
            if ( index !== -1 ) {
                const parentStartDocument: ActivationDocument = possibleParents[index].data;
                if (parentStartDocument) {
                    if (!parentStartDocument.endCreatedDateTime) {
                        parentStartDocument.orderEnd = true;
                    }
                    parentStartDocument.subOrderList = await ReconciliationController.fillList(
                        parentStartDocument.subOrderList, childReference.data.activationDocumentMrid);
                    reconciliationState.updateOrders.push(
                        {collection: possibleParents[index].collection,
                        data: parentStartDocument,
                        docType: DocType.ACTIVATION_DOCUMENT});


                    childReference.data.subOrderList = await ReconciliationController.fillList(
                        childReference.data.subOrderList, parentStartDocument.activationDocumentMrid);
                    childReference.data.potentialChild = false;
                    childReference.docType = DocType.ACTIVATION_DOCUMENT;

                    //Reconciliation Status Calculation
                    if (parentStartDocument.endCreatedDateTime
                        && parentStartDocument.endCreatedDateTime !== "") {

                        const parentDateEnd = new Date(parentStartDocument.endCreatedDateTime);
                        const partialLimit: number = params.values.get(ParametersType.PC_END_TIME_MATCH_THRESHOLD);
                        const partialLimitDate = CommonService.increaseDateMinutes(parentDateEnd, partialLimit);
                        const childEndDate = new Date(childReference.data.endCreatedDateTime);

                        if (childEndDate <= partialLimitDate) {
                            childReference.data.reconciliationStatus = ReconciliationStatus.TOTAL;
                        } else {
                            childReference.data.reconciliationStatus = ReconciliationStatus.PARTIAL;
                        }
                    } else {
                        childReference.data.reconciliationStatus = ReconciliationStatus.TOTAL;
                    }

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

        const pcuetmt: number = params.values.get(ParametersType.PC_TIME_UPDATEEND_MATCH_THRESHOLD);

        for (const childReference of reconciliationState.startState) {
            const senderMarketParticipantMrid: string = childReference.data.senderMarketParticipantMrid;
            const registeredResourceMrid: string = childReference.data.registeredResourceMrid;
            const key: string = senderMarketParticipantMrid.concat('XZYZX').concat(registeredResourceMrid);

            const queryDateStr: string = childReference.data.endCreatedDateTime;
            const queryDate: Date = new Date(queryDateStr);
            const datetmp = new Date(queryDateStr);
            datetmp.setUTCHours(0, 0, 0, 0);
            const dateYesterday = new Date(datetmp.getTime() - pcuetmt);

            const possibleParents: DataReference[] = [];
            const linkedParents: DataReference[] = reconciliationState.endStateRefsMap.get(key);
            if (linkedParents) {
                for (const linkedParent of linkedParents) {
                    const activationDocument: ActivationDocument = linkedParent.data;
                    const dateActivationDocument = new Date(activationDocument.startCreatedDateTime);
                    if (dateYesterday <= dateActivationDocument
                        && dateActivationDocument <= queryDate) {
                            possibleParents.push(linkedParent);
                    }
                }
            }

            const index = await ReconciliationController.findIndexofClosestEndDateRef(
                childReference.data, possibleParents);

            // If a parent document is found
            if ( index !== -1 ) {
                const parentStartDocument: ActivationDocument = possibleParents[index].data;
                if (parentStartDocument) {
                    if (!parentStartDocument.endCreatedDateTime) {
                        parentStartDocument.orderEnd = true;
                    }
                    parentStartDocument.subOrderList = await ReconciliationController.fillList(
                        parentStartDocument.subOrderList, childReference.data.activationDocumentMrid);
                    reconciliationState.updateOrders.push(
                        {collection: possibleParents[index].collection,
                        data: parentStartDocument,
                        docType: DocType.ACTIVATION_DOCUMENT});

                    childReference.data.subOrderList = await ReconciliationController.fillList(
                        childReference.data.subOrderList, parentStartDocument.activationDocumentMrid);
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

    private static async findIndexofClosestEndDateRef(
        referenceDocument: ActivationDocument,
        comparedDocument: DataReference[]): Promise<number> {

        let delta: number = Number.MAX_VALUE;
        let index: number = -1;

        for (let i = 0; i < comparedDocument.length; i++) {
            const dateParent = new Date(comparedDocument[i].data.startCreatedDateTime);
            let dateChild: Date;
            if (referenceDocument.startCreatedDateTime) {
                dateChild = new Date(referenceDocument.startCreatedDateTime);
            } else {
                dateChild = new Date(referenceDocument.endCreatedDateTime);
            }
            const deltaLoc = Math.abs(dateParent.getTime() - dateChild.getTime());
            if (deltaLoc < delta) {
                delta = deltaLoc;
                index = i;
            }
        }

        return index;
    }

}
