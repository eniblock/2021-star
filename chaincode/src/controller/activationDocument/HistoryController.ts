import { DocType } from '../../enums/DocType';
import { ParametersType } from '../../enums/ParametersType';
import { RoleType } from '../../enums/RoleType';

import { ActivationDocument } from '../../model/activationDocument/activationDocument';
import { HistoryCriteria } from '../../model/activationDocument/historyCriteria';
import { HistoryInformation } from '../../model/activationDocument/historyInformation';
import { EnergyAmount } from '../../model/energyAmount';
import { Producer } from '../../model/producer';
import { Site } from '../../model/site';
import { STARParameters } from '../../model/starParameters';

import { EnergyAmountController } from '../EnergyAmountController';
import { ProducerController } from '../ProducerController';
import { ActivationDocumentController } from './ActivationDocumentController';

import { EligibilityStatusType } from '../../enums/EligibilityStatusType';
import { OrganizationTypeMsp } from '../../enums/OrganizationMspType';
import { DataReference } from '../../model/dataReference';
import { ReserveBidMarketDocument } from '../../model/reserveBidMarketDocument';
import { ReserveBidMarketDocumentController } from '../ReserveBidMarketDocumentController';
import { ActivationDocumentEligibilityService } from '../service/ActivationDocumentEligibilityService';
import { ActivationDocumentService } from '../service/ActivationDocumentService';
import { HLFServices } from '../service/HLFservice';
import { QueryStateService } from '../service/QueryStateService';
import { SiteService } from '../service/SiteService';
import { StarDataService } from '../service/StarDataService';
import { StarPrivateDataService } from '../service/StarPrivateDataService';
import { SystemOperatorController } from '../SystemOperatorController';

import { HistoryInformationInBuilding } from '../../model/activationDocument/historyInformationInBuilding';
import { TypeCriteria } from '../../model/activationDocument/typeCriteria';
import { BalancingDocument } from '../../model/balancingDocument';
import { BalancingDocumentController } from '../BalancingDocumentController';
import { FeedbackProducer } from '../../model/feedbackProducer';
import { FeedbackProducerController } from '../FeedbackProducerController';
import { IndeminityStatus } from '../../enums/IndemnityStatus';
import { SiteController } from '../SiteController';
import { ReserveBidStatus } from '../../enums/ReserveBidStatus';

export class HistoryController {

    public static async getHistoryByQuery(
        params: STARParameters,
        inputStr: string): Promise<HistoryInformation[]> {

        params.logger.info('============= START : getHistoryByQuery ===========');

        let criteriaObj: HistoryCriteria;
        let result: HistoryInformation[];

        if (inputStr && inputStr !== '') {
            try {
                criteriaObj = JSON.parse(inputStr);
            } catch (error) {
                throw new Error(`ERROR HistoriqueActivationDocumentCriteria-> Input string NON-JSON value`);
            }

            HistoryCriteria.schema.validateSync(
                criteriaObj,
                {strict: true, abortEarly: false},
            );

            const role: string = params.values.get(ParametersType.ROLE);
            criteriaObj = await HistoryController.consolidateRegisteredResourceListCriteria(params, criteriaObj, role);

            if (criteriaObj) {
                const query = await HistoryController.buildActivationDocumentQuery(params, criteriaObj);
                params.logger.debug('**********************************************');
                params.logger.debug('criteriaObj :', JSON.stringify(criteriaObj));
                params.logger.debug('History query: ', query);

                const collections: string[] = await HLFServices.getCollectionsFromParameters(
                    params, ParametersType.DATA_TARGET, ParametersType.ALL);

                const allActivationDocument: ActivationDocument[] =
                    await ActivationDocumentService.getQueryArrayResult(params, query, collections);

                const allValidActivationDocument: ActivationDocument[] = [];
                // Filter to keep only valid documents (and store in memory pool)
                if (allActivationDocument && allActivationDocument.length > 0) {
                    for (const document of allActivationDocument) {
                        if (document && document.activationDocumentMrid) {
                            params.addInMemoryPool(document.activationDocumentMrid,
                                {collection: '',
                                data: document,
                                docType: DocType.ACTIVATION_DOCUMENT});

                            if (document.subOrderList && document.subOrderList.length > 1) {
                                const subOrderList = document.subOrderList;
                                for (const subOrder of subOrderList) {
                                    const singleChildDocument: ActivationDocument= JSON.parse(JSON.stringify(document));
                                    singleChildDocument.subOrderList = [subOrder];
                                    allValidActivationDocument.push(singleChildDocument);
                                }
                            } else {
                                allValidActivationDocument.push(document);
                            }
                        }
                    }
                }
                params.logger.debug('allValidActivationDocument: ', JSON.stringify(allValidActivationDocument));
                params.logger.debug('**********************************************');

                if (allValidActivationDocument && allValidActivationDocument.length > 0) {
                    // const informationInBuilding: HistoryInformationInBuilding =
                    //     await HistoryController.consolidate(params, allValidActivationDocument, criteriaObj);
                    const informationInBuilding: HistoryInformationInBuilding =
                        await HistoryController.consolidateMassive(params, allValidActivationDocument, criteriaObj);
                    result = await HistoryController.generateOutput(params, informationInBuilding);

                }
            }
        }

        params.logger.debug('###############################################');
        params.logger.debug(JSON.stringify(result));
        params.logger.debug('###############################################');

        params.logger.info('============= END  : getHistoryByQuery ===========');

        return result;
    }






    private static async consolidateRegisteredResourceListCriteria(
        params: STARParameters,
        criteriaObj: HistoryCriteria,
        role: string): Promise<HistoryCriteria> {

        params.logger.debug('============= START : consolidateRegisteredResourceListCriteria ===========');

        if (criteriaObj.producerMarketParticipantName) {
            criteriaObj.producerMarketParticipantName = criteriaObj.producerMarketParticipantName.trim();
        }

        const producerMarketParticipantList: string[] = [];
        if (criteriaObj.producerMarketParticipantMrid) {
            producerMarketParticipantList.push(criteriaObj.producerMarketParticipantMrid);
        }
        if (criteriaObj.producerMarketParticipantName) {
            producerMarketParticipantList.push(criteriaObj.producerMarketParticipantName);
            const allProdId = await ProducerController.getProducerByName(
                params, criteriaObj.producerMarketParticipantName);
            if (allProdId) {
                for (const prodId of allProdId) {
                    if (prodId && prodId.producerMarketParticipantMrid) {
                        producerMarketParticipantList.push(prodId.producerMarketParticipantMrid);

                        params.addInMemoryPool(prodId.producerMarketParticipantMrid, {
                            collection: '', data: prodId, docType: DocType.PRODUCER});
                    }
                }
            }
        }

        // build meteringPointMrid List by substration
        // to check if originAutomationRegisteredResourceMrid defines a substration value
        const substrationMeteringPointMridList: string[] = [];
        if (criteriaObj.originAutomationRegisteredResourceMrid) {
            const substationArgs: string[] = [];
            substationArgs.push(`"substationMrid":"${criteriaObj.originAutomationRegisteredResourceMrid}"`);
            const substationQuerySite = await QueryStateService.buildQuery(
                {documentType: DocType.SITE, queryArgs: substationArgs});
            const substationSiteList: Site[] = await SiteService.getQueryArrayResult(params, substationQuerySite);
            for (const substationSite of substationSiteList) {
                substrationMeteringPointMridList.push(substationSite.meteringPointMrid);
            }
        }

        const args: string[] = [];

        if (criteriaObj.meteringPointMrid) {
            args.push(`"meteringPointMrid":"${criteriaObj.meteringPointMrid}"`);
        }
        if (producerMarketParticipantList && producerMarketParticipantList.length > 0) {
            const producerMarketParticipantListStr = JSON.stringify(producerMarketParticipantList);
            args.push(`"producerMarketParticipantMrid": { "$in" : ${producerMarketParticipantListStr} }`);
        }
        if (criteriaObj.siteName
            && (role === RoleType.Role_Producer) ) {
            args.push(`"siteName":"${criteriaObj.siteName}"`);
        }

        criteriaObj.registeredResourceList = [];
        if (args.length > 0) {
            const querySite = await QueryStateService.buildQuery({documentType: DocType.SITE, queryArgs: args});
            const siteList: Site[] = await SiteService.getQueryArrayResult(params, querySite);

            for (const site of siteList) {
                if (substrationMeteringPointMridList.length === 0
                    || substrationMeteringPointMridList.includes(site.meteringPointMrid)) {

                    criteriaObj.registeredResourceList.push(site.substationMrid);
                    criteriaObj.registeredResourceList.push(site.meteringPointMrid);
                }
                params.addInMemoryPool(site.meteringPointMrid, {docType: DocType.SITE, data: site, collection: ''});
            }
        } else if (substrationMeteringPointMridList.length > 0) {
            for (const id of substrationMeteringPointMridList) {
                criteriaObj.registeredResourceList.push(id);
                criteriaObj.registeredResourceList.push(id);
            }
        }

        params.logger.debug('=============  END  : consolidateRegisteredResourceListCriteria ===========');

        return criteriaObj;
    }

    private static async buildActivationDocumentQuery(
        params: STARParameters,
        criteriaObj: HistoryCriteria): Promise<string> {

        params.logger.debug('============= START : buildActivationDocumentQuery ===========');

        const args: string[] = [];

        if (criteriaObj) {

            const criteriaPlaceList: string[] = [];

            if (criteriaObj.originAutomationRegisteredResourceMrid) {
                criteriaPlaceList.push(`"originAutomationRegisteredResourceMrid":"${criteriaObj.originAutomationRegisteredResourceMrid}"`);

                if (criteriaObj.registeredResourceList && criteriaObj.registeredResourceList.length > 0) {

                    const listId: string[] = JSON.parse(JSON.stringify(criteriaObj.registeredResourceList));
                    listId.push(criteriaObj.originAutomationRegisteredResourceMrid);
                    const registeredResourceListStr = JSON.stringify(criteriaObj.registeredResourceList);
                    criteriaPlaceList.push(`"registeredResourceMrid": { "$in" : ${registeredResourceListStr} }`);

                } else {
                    criteriaPlaceList.push(`"registeredResourceMrid":"${criteriaObj.originAutomationRegisteredResourceMrid}"`);
                }
            } else if (criteriaObj.producerMarketParticipantName
                || criteriaObj.producerMarketParticipantMrid
                || criteriaObj.meteringPointMrid
                || criteriaObj.siteName) {

                const registeredResourceListStr = JSON.stringify(criteriaObj.registeredResourceList);
                criteriaPlaceList.push(`"registeredResourceMrid": { "$in" : ${registeredResourceListStr} }`);
            }

            const criteriaPlace = await QueryStateService.buildORCriteria(criteriaPlaceList);
            args.push(criteriaPlace);

            if (criteriaObj.endCreatedDateTime) {
                args.push(`"$or":[{"startCreatedDateTime":{"$lte": ${JSON.stringify(criteriaObj.endCreatedDateTime)}}},{"startCreatedDateTime":""},{"startCreatedDateTime":{"$exists": false}}]`);
            }
            if (criteriaObj.startCreatedDateTime) {
                args.push(`"$or":[{"endCreatedDateTime":{"$gte": ${JSON.stringify(criteriaObj.startCreatedDateTime)}}},{"endCreatedDateTime":""},{"endCreatedDateTime":{"$exists": false}}]`);
            }

            const criteriaActivationType = await HistoryController.prepareTypeCriteriaArg(criteriaObj.activationType);
            if (criteriaActivationType && criteriaActivationType.length > 0) {
                args.push(criteriaActivationType);
            }

            if (criteriaObj.activationReasonList
                && criteriaObj.activationReasonList.length > 0) {

                const activationReasonCriteriaList: string[] = [];
                for (const activationReason of criteriaObj.activationReasonList) {
                    const criteriaReason = await HistoryController.prepareTypeCriteriaArg(activationReason);
                    if (criteriaReason && criteriaReason.length > 0) {
                        activationReasonCriteriaList.push(criteriaReason);
                    }
                }
                if (activationReasonCriteriaList && activationReasonCriteriaList.length > 0) {
                    const activationReasonCriteria =
                        await QueryStateService.buildORCriteria(activationReasonCriteriaList);
                    args.push(activationReasonCriteria);
                }
            }
        }

        params.logger.debug('=============  END  : buildActivationDocumentQuery ===========');

        return await QueryStateService.buildQuery({documentType: DocType.ACTIVATION_DOCUMENT, queryArgs: args});
    }

    private static async prepareTypeCriteriaArg(typeCriteria: TypeCriteria): Promise<string> {
        if (typeCriteria
            && typeCriteria.businessType && typeCriteria.businessType.length > 0
            && typeCriteria.messageType && typeCriteria.messageType.length > 0
            && typeCriteria.reasonCode && typeCriteria.reasonCode.length > 0) {

            const activationTypeList: string[] = [];
            activationTypeList.push(`"businessType":"${typeCriteria.businessType}"`);
            activationTypeList.push(`"messageType":"${typeCriteria.messageType}"`);
            activationTypeList.push(`"reasonCode":"${typeCriteria.reasonCode}"`);

            return await QueryStateService.buildANDCriteria(activationTypeList);
        }
        return '';
    }

    private static async consolidate(
        params: STARParameters,
        allActivationDocument: ActivationDocument[],
        criteriaObj: HistoryCriteria): Promise<HistoryInformationInBuilding> {

        params.logger.debug('============= START : consolidate ===========');

        let historyInformationInBuilding: HistoryInformationInBuilding = new HistoryInformationInBuilding();

        for (const activationDocumentQueryValue of allActivationDocument) {
            params.logger.debug('ooo activationDocumentQueryValue.activationDocumentMrid : ',
                activationDocumentQueryValue.activationDocumentMrid);

            const activationDocument =
                await ActivationDocumentEligibilityService.outputFormatFRActivationDocument(
                    params, activationDocumentQueryValue);

            let activationDocumentForInformation: ActivationDocument = JSON.parse(JSON.stringify(activationDocument));

            const subOrderList: ActivationDocument[] = [];
            if (activationDocument && activationDocument.subOrderList) {
                for (const activationDocumentMrid of activationDocument.subOrderList) {

                    let subOrder: ActivationDocument = null;
                    try {
                        subOrder = await ActivationDocumentController.getActivationDocumentById(
                            params, activationDocumentMrid);
                    } catch (error) {
                        // do nothing, but empty document : suborder information is not in accessible collection
                    }
                    if (subOrder && subOrder.activationDocumentMrid) {
                        subOrderList.push(subOrder);
                    }
                }
            }
            // Manage Yello Page to get Site Information
            let siteRegistered: Site = null;
            try {
                params.logger.debug('ooo search site activationDocumentForInformation.registeredResourceMrid : ',
                    activationDocumentForInformation.registeredResourceMrid);

                const existingSitesRef = await StarPrivateDataService.getObjRefbyId(
                    params, {docType: DocType.SITE, id: activationDocumentForInformation.registeredResourceMrid});
                const siteObjRef: DataReference = existingSitesRef.values().next().value;
                if (siteObjRef && siteObjRef.docType === DocType.SITE) {
                    siteRegistered = siteObjRef.data;
                }
            } catch (error) {
                // DO nothing except "Not accessible information"
            }
            if (!siteRegistered && subOrderList && subOrderList.length > 0) {
                // If no site found, search information by SubOrder Id
                activationDocumentForInformation = JSON.parse(JSON.stringify(subOrderList[0]));
                try {
                    params.logger.debug('ooo search site by subOrderList[0]');
                    params.logger.debug('ooo search site activationDocumentForInformation.registeredResourceMrid : ',
                        activationDocumentForInformation.registeredResourceMrid);

                    const existingSitesRef = await StarPrivateDataService.getObjRefbyId(
                        params, {docType: DocType.SITE, id: activationDocumentForInformation.registeredResourceMrid});
                    const siteObjRef = existingSitesRef.values().next().value;
                    if (siteObjRef && siteObjRef.docType === DocType.SITE) {
                        siteRegistered = siteObjRef.data;
                    }
                } catch (error) {
                    // DO nothing except "Not accessible information"
                }
            }
            if (!siteRegistered) {
                // If still no site found, back to initial value
                activationDocumentForInformation = JSON.parse(JSON.stringify(activationDocument));
            }

            //
            // FILTER
            //
            // Build a filtrer to check if it needs to go further in consolidation
            let keepInformation = true;

            if (criteriaObj.originAutomationRegisteredResourceMrid) {
                const keepInformationOrigin1 =
                    (activationDocument.originAutomationRegisteredResourceMrid ===
                        criteriaObj.originAutomationRegisteredResourceMrid);
                const keepInformationOrigin2 =
                    (subOrderList
                    && subOrderList.length > 0
                    && subOrderList[0].originAutomationRegisteredResourceMrid ===
                        criteriaObj.originAutomationRegisteredResourceMrid);

                const keepInformationRegistered1 =
                    (activationDocument.registeredResourceMrid === criteriaObj.originAutomationRegisteredResourceMrid);
                const keepInformationRegistered2 =
                    (subOrderList
                    && subOrderList.length > 0
                    && subOrderList[0].registeredResourceMrid === criteriaObj.originAutomationRegisteredResourceMrid);

                const keepInformationSubstration =
                    (siteRegistered && siteRegistered.substationMrid ===
                        criteriaObj.originAutomationRegisteredResourceMrid);

                keepInformation = keepInformationOrigin1
                                || keepInformationOrigin2
                                || keepInformationRegistered1
                                || keepInformationRegistered2
                                || keepInformationSubstration;

            }

            if (criteriaObj.producerMarketParticipantName
                || criteriaObj.producerMarketParticipantMrid
                || criteriaObj.meteringPointMrid
                || criteriaObj.siteName) {

                keepInformation =
                    keepInformation
                    && siteRegistered
                    && criteriaObj.registeredResourceList.includes(siteRegistered.meteringPointMrid);
            }

            if (subOrderList && subOrderList.length > 0) {
                // Keep only if it's a perfect match
                keepInformation = keepInformation
                                    && activationDocument.subOrderList
                                    && activationDocument.subOrderList.length > 0
                                    && activationDocument.subOrderList.includes(subOrderList[0].activationDocumentMrid)
                                    && subOrderList[0].subOrderList
                                    && subOrderList[0].subOrderList.length > 0
                                    && subOrderList[0].subOrderList.includes(activationDocument.activationDocumentMrid);
            }

            // END OF FILTER
            // If information doesn't to be kept
            // the process doesn't care about this document
            if (keepInformation) {
                const identity: string = params.values.get(ParametersType.IDENTITY);
                const status:string = await FeedbackProducerController.getIndemnityStatus(params, activationDocument.activationDocumentMrid);

                if (status !== IndeminityStatus.ABANDONED || identity !== OrganizationTypeMsp.PRODUCER) {
                    historyInformationInBuilding =
                        await this.consolidateFiltered(
                            params,
                            historyInformationInBuilding,
                            activationDocument,
                            activationDocumentForInformation,
                            subOrderList,
                            siteRegistered);
                }
            }

        }
        params.logger.debug('=============  END  : consolidate ===========');

        return historyInformationInBuilding;
    }

    private static async consolidateFiltered(
        params: STARParameters,
        historyInformationInBuilding: HistoryInformationInBuilding,
        activationDocument: ActivationDocument,
        activationDocumentForInformation: ActivationDocument,
        subOrderList: ActivationDocument[],
        siteRegistered: Site): Promise<HistoryInformationInBuilding> {

        params.logger.debug('============= START : consolidateFiltered ===========');

        const roleTable: Map<string, string> = params.values.get(ParametersType.ROLE_TABLE);
        const identity: string = params.values.get(ParametersType.IDENTITY);
        let roleUser: string = roleTable.get(identity.toLowerCase());

        try {
            if (identity === OrganizationTypeMsp.PRODUCER
                && siteRegistered
                && siteRegistered.producerMarketParticipantMrid) {

                const systemOperator = await SystemOperatorController.getSystemOperatorObjById(
                    params, siteRegistered.systemOperatorMarketParticipantMrid);

                if (systemOperator && systemOperator.systemOperatorMarketParticipantName) {
                    const roleSystemOperator = roleTable.get(
                        systemOperator.systemOperatorMarketParticipantName.toLowerCase());
                    if (roleSystemOperator === RoleType.Role_DSO) {
                        roleUser = RoleType.Role_DSOProducer;
                    } else if (roleSystemOperator === RoleType.Role_TSO) {
                        roleUser = RoleType.Role_TSOProducer;
                    }
                }
            }
        } catch (error) {
            // DO nothing keep roleUser value as it is
        }

        params.logger.debug('roleUser: ', roleUser);

        let producer: Producer = null;
        try {
            if (siteRegistered && siteRegistered.producerMarketParticipantMrid) {
                producer = await StarDataService.getObj(
                    params, {id: siteRegistered.producerMarketParticipantMrid, docType: DocType.PRODUCER});
            }
        } catch (error) {
            // DO nothing except "Not accessible information"
        }
        if (!producer) {
            try {
                if (activationDocumentForInformation.receiverMarketParticipantMrid) {
                    const prod = await StarDataService.getObj(
                        params, {id: activationDocumentForInformation.receiverMarketParticipantMrid});
                    if (prod) {
                        const untypedValue = JSON.parse(JSON.stringify(prod));
                        if (untypedValue && untypedValue.producerMarketParticipantMrid) {
                            producer = {
                                producerMarketParticipantMrid: prod.producerMarketParticipantMrid,
                                producerMarketParticipantName: prod.producerMarketParticipantName,
                                producerMarketParticipantRoleType: prod.producerMarketParticipantRoleType,
                            };
                        }
                    }

                }
            } catch (error) {
                // DO nothing except "Not accessible information"
            }
        }

        params.logger.debug('producer: ', JSON.stringify(producer));

        let displayedSourceName = activationDocumentForInformation.originAutomationRegisteredResourceMrid;

        params.logger.debug('displayedSourceName: ', displayedSourceName);

        if (roleUser === RoleType.Role_TSO || roleUser === RoleType.Role_TSOProducer) {
            if (!producer) {
                displayedSourceName = activationDocument.registeredResourceMrid;

            } else if (subOrderList
                && subOrderList.length > 0) {

                    if (activationDocument.instance === "tso") {
                        displayedSourceName = activationDocument.registeredResourceMrid;
                    } else {
                        displayedSourceName = subOrderList[0].registeredResourceMrid;
                    }

            } else if (siteRegistered) {
                displayedSourceName = siteRegistered.substationMrid;
            }
        } else if ((roleUser === RoleType.Role_DSO || roleUser === RoleType.Role_DSOProducer)
            && !producer
            && !siteRegistered) {

            displayedSourceName = activationDocument.registeredResourceMrid;
        }

        params.logger.debug('displayedSourceName: ', displayedSourceName);

        let energyAmount: EnergyAmount = null;

        let calculateEnergyAmount: boolean = true;
        if (identity === OrganizationTypeMsp.PRODUCER) {
            calculateEnergyAmount =
                (activationDocument.eligibilityStatus === EligibilityStatusType.EligibilityAccepted
                || activationDocument.eligibilityStatus === EligibilityStatusType.FREligibilityAccepted);
        }

        try {
            if (calculateEnergyAmount
                && activationDocumentForInformation
                && activationDocumentForInformation.activationDocumentMrid) {
                energyAmount = await EnergyAmountController.getByActivationDocument(
                    params, activationDocumentForInformation.activationDocumentMrid);
            }

        } catch (error) {
            // DO nothing except "Not accessible information"
        }

        params.logger.debug('energyAmount: ', JSON.stringify(energyAmount));

        params.logger.debug('search reserveBid for : ', JSON.stringify(activationDocument));
        let reserveBid: ReserveBidMarketDocument = null;
        try {
                reserveBid = await ReserveBidMarketDocumentController.getByActivationDocument(
                    params, activationDocument);
        } catch (err) {
            params.logger.debug('ERROR : ', err);
            // DO nothing except "Not accessible information"
        }

        params.logger.debug('reserveBid: ', JSON.stringify(reserveBid));

        let balancingDocument: BalancingDocument = null;
        if (identity !== OrganizationTypeMsp.PRODUCER
            || activationDocument.eligibilityStatus === EligibilityStatusType.EligibilityAccepted
            || activationDocument.eligibilityStatus === EligibilityStatusType.FREligibilityAccepted) {

            try {
                if (siteRegistered
                    && siteRegistered.meteringPointMrid
                    && siteRegistered.meteringPointMrid.length > 0) {

                    let activationDocumentForBalancing: ActivationDocument= null;
                    if (activationDocument.registeredResourceMrid === siteRegistered.meteringPointMrid) {
                        activationDocumentForBalancing = activationDocument;
                    } else if (subOrderList && subOrderList.length > 0) {
                        activationDocumentForBalancing = subOrderList[0];
                    }

                    try {
                        balancingDocument =
                            await BalancingDocumentController.getObjByActivationDocumentMrid(params, activationDocumentForBalancing.activationDocumentMrid);
                    } catch (err) {
                        // Do Nothing
                    }

                    if (!balancingDocument
                        || !balancingDocument.balancingDocumentMrid
                        || balancingDocument.balancingDocumentMrid.length === 0) {

                        balancingDocument = await BalancingDocumentController.generateObj(
                            params,
                            activationDocumentForBalancing,
                            reserveBid,
                            energyAmount);
                    }

                }
            } catch (err) {
                    // DO nothing except "Not accessible information"
            }
        }

        params.logger.debug('balancingDocument: ', JSON.stringify(balancingDocument));


        let feedbackProducer: FeedbackProducer = null;
        try {
            feedbackProducer = await FeedbackProducerController.getByActivationDocumentMrId(
                params, activationDocument.activationDocumentMrid);
        } catch (err) {
                // DO nothing except "Not accessible information"
        }
        const status:string = await FeedbackProducerController.getIndemnityStatusFromObj(params, activationDocument.activationDocumentMrid, feedbackProducer);
        feedbackProducer.indeminityStatus = status;

        params.logger.debug('feedbackProducer: ', JSON.stringify(feedbackProducer));

        const information: HistoryInformation = {
            activationDocument: JSON.parse(JSON.stringify(activationDocument)),
            balancingDocument: balancingDocument ? JSON.parse(JSON.stringify(balancingDocument)) : null,
            displayedSourceName,
            energyAmount: energyAmount ? JSON.parse(JSON.stringify(energyAmount)) : null,
            feedbackProducer: feedbackProducer ? JSON.parse(JSON.stringify(feedbackProducer)) : null,
            producer: producer ? JSON.parse(JSON.stringify(producer)) : null,
            reserveBidMarketDocument: reserveBid ? JSON.parse(JSON.stringify(reserveBid)) : null,
            site: siteRegistered ? JSON.parse(JSON.stringify(siteRegistered)) : null,
            subOrderList: JSON.parse(JSON.stringify(subOrderList)),
        };

        historyInformationInBuilding.historyInformation.set(
            information.activationDocument.activationDocumentMrid, information);

        siteRegistered = null;
        producer = null;
        energyAmount = null;

        const key = this.buildKey(information.activationDocument);

        if (information.site
            && information.producer
            && information.activationDocument
            && information.activationDocument.eligibilityStatusEditable) {

            historyInformationInBuilding.eligibilityToDefine.push(key);
        } else if (information.activationDocument.eligibilityStatus
            && information.activationDocument.eligibilityStatus !== '') {

            historyInformationInBuilding.eligibilityDefined.push(key);
        } else if (information.subOrderList
            && information.subOrderList.length > 0) {

            historyInformationInBuilding.reconciliated.push(key);
        } else {
            historyInformationInBuilding.others.push(key);
        }

        params.logger.debug('=============  END  : consolidateFiltered ===========');

        return historyInformationInBuilding;
    }

    private static buildKey(activationDocument: ActivationDocument): string {
        const key = ''.concat(activationDocument.startCreatedDateTime)
        .concat('ZYXYZ')
        .concat(activationDocument.endCreatedDateTime)
        .concat('ZYXYZ')
        .concat(activationDocument.activationDocumentMrid);

        return key;
    }

    private static getActivationDocumentMridFromKey(key: string): string {
        let activationDocumentMrid: string = '';

        const keyArray = key.split('ZYXYZ');
        activationDocumentMrid = keyArray[2];

        return activationDocumentMrid;
    }

    private static async generateOutput(
        params: STARParameters,
        informationInBuilding: HistoryInformationInBuilding): Promise<HistoryInformation[]> {

        params.logger.debug('============= START : generateOutput ===========');

        const finalinformation: HistoryInformation[] = [];
        const embeddedInformation: string[] = [];

        // Build sorted index
        informationInBuilding.eligibilityToDefine.sort();
        informationInBuilding.eligibilityDefined.sort();
        informationInBuilding.reconciliated.sort();
        informationInBuilding.others.sort();

        for (const key of informationInBuilding.eligibilityToDefine) {
            const activationDocumentMrid = this.getActivationDocumentMridFromKey(key);

            if (!embeddedInformation.includes(activationDocumentMrid)) {
                const information = informationInBuilding.historyInformation.get(activationDocumentMrid);

                if (information) {
                    embeddedInformation.push(information.activationDocument.activationDocumentMrid);
                    if (information.subOrderList) {
                        for (const subOrder of information.subOrderList) {
                            if (subOrder && subOrder.activationDocumentMrid) {
                                embeddedInformation.push(subOrder.activationDocumentMrid);
                            }
                        }
                    }

                    finalinformation.push(information);
                }
            }

        }
        for (const key of informationInBuilding.eligibilityDefined) {
            const activationDocumentMrid = this.getActivationDocumentMridFromKey(key);

            if (!embeddedInformation.includes(activationDocumentMrid)) {
                const information = informationInBuilding.historyInformation.get(activationDocumentMrid);

                if (information) {
                    embeddedInformation.push(information.activationDocument.activationDocumentMrid);
                    if (information.subOrderList) {
                        for (const subOrder of information.subOrderList) {
                            if (subOrder && subOrder.activationDocumentMrid) {
                                embeddedInformation.push(subOrder.activationDocumentMrid);
                            }
                        }
                    }

                    finalinformation.push(information);
                }
            }

        }
        for (const key of informationInBuilding.reconciliated) {
            const activationDocumentMrid = this.getActivationDocumentMridFromKey(key);

            if (!embeddedInformation.includes(activationDocumentMrid)) {
                const information = informationInBuilding.historyInformation.get(activationDocumentMrid);

                if (information) {
                    embeddedInformation.push(information.activationDocument.activationDocumentMrid);
                    if (information.subOrderList) {
                        for (const subOrder of information.subOrderList) {
                            if (subOrder && subOrder.activationDocumentMrid) {
                                embeddedInformation.push(subOrder.activationDocumentMrid);
                            }
                        }
                    }

                    finalinformation.push(information);
                }
            }

        }
        for (const key of informationInBuilding.others) {
            const activationDocumentMrid = this.getActivationDocumentMridFromKey(key);

            if (!embeddedInformation.includes(activationDocumentMrid)) {
                const information = informationInBuilding.historyInformation.get(activationDocumentMrid);

                if (information) {
                    embeddedInformation.push(information.activationDocument.activationDocumentMrid);
                    if (information.subOrderList) {
                        for (const subOrder of information.subOrderList) {
                            if (subOrder && subOrder.activationDocumentMrid) {
                                embeddedInformation.push(subOrder.activationDocumentMrid);
                            }
                        }
                    }

                    finalinformation.push(information);
                }
            }

        }

        params.logger.debug('=============  END  : generateOutput ===========');

        return finalinformation;
    }





    private static async consolidateMassive(
        params: STARParameters,
        allActivationDocument: ActivationDocument[],
        criteriaObj: HistoryCriteria): Promise<HistoryInformationInBuilding> {

        params.logger.debug('============= START : consolidate ===========');

        let historyInformationInBuilding: HistoryInformationInBuilding = new HistoryInformationInBuilding();

        historyInformationInBuilding.roleTable = params.values.get(ParametersType.ROLE_TABLE);
        historyInformationInBuilding.identity = params.values.get(ParametersType.IDENTITY);
        historyInformationInBuilding.roleUser = historyInformationInBuilding.roleTable.get(historyInformationInBuilding.identity.toLowerCase());


        for (const activationDocumentQueryValue of allActivationDocument) {
            params.logger.debug('ooo activationDocumentQueryValue.activationDocumentMrid : ',
                activationDocumentQueryValue.activationDocumentMrid);

            const activationDocument =
                await ActivationDocumentEligibilityService.outputFormatFRActivationDocument(
                    params, activationDocumentQueryValue);

            let activationDocumentForInformation: ActivationDocument = JSON.parse(JSON.stringify(activationDocument));

            if (activationDocument.subOrderList && activationDocument.subOrderList.length > 0) {
                activationDocument.subOrderList = [...new Set(activationDocument.subOrderList)];
            }

            historyInformationInBuilding.allInformation.set(activationDocument.activationDocumentMrid, activationDocumentForInformation);

            if (activationDocument.receiverRole === RoleType.Role_Producer
                || !activationDocument.subOrderList
                || activationDocument.subOrderList.length == 0) {

                if (!historyInformationInBuilding.activationDocumentMridList.includes(activationDocument.activationDocumentMrid)) {
                    historyInformationInBuilding.activationDocumentMridList.push(activationDocument.activationDocumentMrid);
                }
            } else if (activationDocument.subOrderList) {

                for (const activationDocumentMrid of activationDocument.subOrderList) {
                    if (!historyInformationInBuilding.activationDocumentMridList.includes(activationDocumentMrid)) {
                        historyInformationInBuilding.activationDocumentMridList.push(activationDocumentMrid);
                    }
                }
            }

            historyInformationInBuilding.registeredResourceMridList.push(activationDocument.registeredResourceMrid);
            historyInformationInBuilding.producerMarketParticipantMridList.push(activationDocument.receiverMarketParticipantMrid);

            if (activationDocument && activationDocument.subOrderList) {
                for (const activationDocumentMrid of activationDocument.subOrderList) {
                    historyInformationInBuilding.suborderActivationDocumentMridList.push(activationDocumentMrid);
                }
            }
        }

        let suborders: ActivationDocument[] = [];
        if (historyInformationInBuilding.suborderActivationDocumentMridList.length > 0) {
            const querySuborder = `{"selector": {"docType": "${DocType.ACTIVATION_DOCUMENT}","activationDocumentMrid":{ "$in" :  ${JSON.stringify(historyInformationInBuilding.suborderActivationDocumentMridList)} }}}`;
            // params.logger.info(querySuborder);

            suborders = await ActivationDocumentController.getActivationDocumentObjByQuery(params, querySuborder);
            for (const subOrder of suborders) {
                if (subOrder.subOrderList && subOrder.subOrderList.length > 0) {
                    subOrder.subOrderList = [...new Set(subOrder.subOrderList)];
                }

                historyInformationInBuilding.allInformation.set(subOrder.activationDocumentMrid, subOrder);
                historyInformationInBuilding.registeredResourceMridList.push(subOrder.registeredResourceMrid);
                historyInformationInBuilding.producerMarketParticipantMridList.push(subOrder.receiverMarketParticipantMrid);
            }
        }

        const querySite = `{"selector": {"docType": "${DocType.SITE}","meteringPointMrid":{ "$in" : ${JSON.stringify(historyInformationInBuilding.registeredResourceMridList)} }}}`;
        // params.logger.info(querySite);
        const sites: Site[] = await SiteController.getSitesByQuery(params, querySite);

        for (const site of sites) {
            historyInformationInBuilding.allInformation.set(site.meteringPointMrid, site);
            historyInformationInBuilding.producerMarketParticipantMridList.push(site.producerMarketParticipantMrid);
        }

        try {
            if (historyInformationInBuilding.identity === OrganizationTypeMsp.PRODUCER) {
                const systemOperator = await SystemOperatorController.getSystemOperatorObjById(
                    params, sites[0].systemOperatorMarketParticipantMrid);

                if (systemOperator && systemOperator.systemOperatorMarketParticipantName) {
                    const roleSystemOperator = historyInformationInBuilding.roleTable.get(
                        systemOperator.systemOperatorMarketParticipantName.toLowerCase());
                    if (roleSystemOperator === RoleType.Role_DSO) {
                        historyInformationInBuilding.roleUser = RoleType.Role_DSOProducer;
                    } else if (roleSystemOperator === RoleType.Role_TSO) {
                        historyInformationInBuilding.roleUser = RoleType.Role_TSOProducer;
                    }
                }

            }
        } catch (error) {
            // DO nothing keep roleUser value as it is
        }

        params.logger.debug('roleUser: ', historyInformationInBuilding.roleUser);

        const queryProducer = `{"selector": {"docType": "${DocType.PRODUCER}","producerMarketParticipantMrid":{ "$in" : ${JSON.stringify(historyInformationInBuilding.producerMarketParticipantMridList)} }}}`;
        // params.logger.info(queryProducer);
        const producers: Producer[] = await ProducerController.getProducerByQuery(params, queryProducer);

        for (const producer of producers) {
            historyInformationInBuilding.allInformation.set(producer.producerMarketParticipantMrid, producer);
        }

        const queryEnergyAmount = `{"selector": {"docType": "${DocType.ENERGY_AMOUNT}","activationDocumentMrid":{ "$in" : ${JSON.stringify(historyInformationInBuilding.activationDocumentMridList)} }}}`;
        // params.logger.info(queryEnergyAmount);
        const energyAmounts: EnergyAmount[] = await EnergyAmountController.getEnergyAmountByQuery(params, queryEnergyAmount, true);

        for (const energyAmount of energyAmounts) {
            historyInformationInBuilding.allInformation.set(energyAmount.activationDocumentMrid + "_NRJ", energyAmount);
        }

        const queryFeedbackProducer = `{"selector": {"docType": "${DocType.FEEDBACK_PRODUCER}","activationDocumentMrid":{ "$in" : ${JSON.stringify(historyInformationInBuilding.activationDocumentMridList)} }}}`;
        // params.logger.info(queryFeedbackProducer);
        const feedbackProducers: FeedbackProducer[] = await FeedbackProducerController.getByQuery(params, queryFeedbackProducer);

        for (const feedbackProducer of feedbackProducers) {
            historyInformationInBuilding.allInformation.set(feedbackProducer.activationDocumentMrid + "_FdBkP", feedbackProducer);
        }

        const queryReserveBidMarketDocument = `{"selector": {"docType": "${DocType.RESERVE_BID_MARKET_DOCUMENT}","reserveBidStatus": "${ReserveBidStatus.VALIDATED}","meteringPointMrid":{ "$in" : ${JSON.stringify(historyInformationInBuilding.registeredResourceMridList)} }}}`;
        // params.logger.info(queryReserveBidMarketDocument);
        const reserveBids: ReserveBidMarketDocument[] = await ReserveBidMarketDocumentController.getByQuery(params, queryReserveBidMarketDocument);

        for (const reserveBid of reserveBids) {
            let reserveBidsBySite: ReserveBidMarketDocument[] = historyInformationInBuilding.allInformation.get(reserveBid.meteringPointMrid + "_RsBidDocs")
            if (!reserveBidsBySite) {
                reserveBidsBySite = [];
            }
            reserveBidsBySite.push(reserveBid);
            historyInformationInBuilding.allInformation.set(reserveBid.meteringPointMrid + "_RsBidDocs", reserveBidsBySite);

        }

        params.logger.debug('=============  END  : consolidate ===========');

        return await this.FinalizeMassive(params, historyInformationInBuilding, criteriaObj);
    }







    private static async TestInformation(
        params: STARParameters,
        criteriaObj: HistoryCriteria,
        identity: string,
        activationDocument: ActivationDocument,
        subOrderList: ActivationDocument[],
        site: Site,
        feedbackProducerObj: FeedbackProducer):Promise<boolean> {

        // Build a filtrer to check if it needs to go further in consolidation
        let keepInformation = activationDocument
                                && activationDocument.activationDocumentMrid
                                && activationDocument.activationDocumentMrid.length > 0;

        if (criteriaObj.originAutomationRegisteredResourceMrid) {
            const keepInformationOrigin1 =
            (activationDocument.originAutomationRegisteredResourceMrid ===
                criteriaObj.originAutomationRegisteredResourceMrid);

            const keepInformationOrigin2 =
                (subOrderList
                && subOrderList.length > 0
                && subOrderList[0].originAutomationRegisteredResourceMrid ===
                    criteriaObj.originAutomationRegisteredResourceMrid);

            const keepInformationRegistered1 =
                (activationDocument.registeredResourceMrid === criteriaObj.originAutomationRegisteredResourceMrid);
            const keepInformationRegistered2 =
                (subOrderList
                && subOrderList.length > 0
                && subOrderList[0].registeredResourceMrid === criteriaObj.originAutomationRegisteredResourceMrid);

            const keepInformationSubstration =
                (site && site.substationMrid ===
                    criteriaObj.originAutomationRegisteredResourceMrid);

            keepInformation = keepInformationOrigin1
                            || keepInformationOrigin2
                            || keepInformationRegistered1
                            || keepInformationRegistered2
                            || keepInformationSubstration;

        }

        if (criteriaObj.producerMarketParticipantName
            || criteriaObj.producerMarketParticipantMrid
            || criteriaObj.meteringPointMrid
            || criteriaObj.siteName) {

            keepInformation =
                keepInformation
                && site
                && criteriaObj.registeredResourceList.includes(site.meteringPointMrid);
        }

        if (subOrderList
            && subOrderList.length > 0
            && subOrderList[0]
            && subOrderList[0].activationDocumentMrid
            && subOrderList[0].activationDocumentMrid.length > 0
            && activationDocument
            && activationDocument.activationDocumentMrid
            && activationDocument.activationDocumentMrid.length > 0) {
            // Keep only if it's a perfect match
            keepInformation = keepInformation
                                && activationDocument.subOrderList
                                && activationDocument.subOrderList.length > 0
                                && activationDocument.subOrderList.includes(subOrderList[0].activationDocumentMrid)
                                && subOrderList[0].subOrderList
                                && subOrderList[0].subOrderList.length > 0
                                && subOrderList[0].subOrderList.includes(activationDocument.activationDocumentMrid);
        }

        // END OF FILTER
        // If information doesn't to be kept
        // the process doesn't care about this document
        keepInformation = keepInformation
            && (feedbackProducerObj.indeminityStatus !== IndeminityStatus.ABANDONED || identity !== OrganizationTypeMsp.PRODUCER);

        return keepInformation;
    }







    private static async FinalizeMassive(
        params: STARParameters,
        historyInformationInBuilding: HistoryInformationInBuilding,
        criteriaObj: HistoryCriteria): Promise<HistoryInformationInBuilding> {

        params.logger.debug('============= START : consolidateFiltered ===========');

        for (const activationDocumentMrid of historyInformationInBuilding.activationDocumentMridList){

            const activationDocument : ActivationDocument = historyInformationInBuilding.allInformation.get(activationDocumentMrid);
            if (!activationDocument
                || activationDocument.activationDocumentMrid !== activationDocumentMrid) {

                continue;
            }
            if (activationDocument.senderMarketParticipantMrid !== '10XFR-RTE------Q'
                && activationDocument.senderMarketParticipantMrid !== '17X100A100A0001A') {

                continue;
            }

            const subOrderList: ActivationDocument[] = [];
            if (activationDocument.subOrderList
                && activationDocument.subOrderList.length > 0) {

                for (const subOrderId of activationDocument.subOrderList) {
                    const subOrderDocument : ActivationDocument = historyInformationInBuilding.allInformation.get(subOrderId);
                    subOrderList.push(subOrderDocument);
                }
            }

            let site: Site = historyInformationInBuilding.allInformation.get(activationDocument.registeredResourceMrid);
            if ((!site || site.meteringPointMrid !== activationDocument.registeredResourceMrid)
                && subOrderList.length > 0) {

                site = historyInformationInBuilding.allInformation.get(subOrderList[0].registeredResourceMrid);
            }
            // empty site should be kept, it could document from TSO to DSO (and then no site)
            // if (!site || site.meteringPointMrid.length === 0 ) {
            //     continue;
            // }

            let feedbackProducer: FeedbackProducer = historyInformationInBuilding.allInformation.get(activationDocument.activationDocumentMrid + "_FdBkP");
            if ((!feedbackProducer || feedbackProducer.activationDocumentMrid !== activationDocument.activationDocumentMrid)
                && subOrderList.length > 0
                && subOrderList[0]
                && subOrderList[0].activationDocumentMrid) {

                    feedbackProducer = historyInformationInBuilding.allInformation.get(subOrderList[0].activationDocumentMrid + "_FdBkP");
            }

            if (!feedbackProducer) {
                let activationDocumentObj : ActivationDocument;
                if (activationDocument.receiverRole === RoleType.Role_Producer
                    || subOrderList.length == 0) {

                    activationDocumentObj = activationDocument;
                } else {
                    activationDocumentObj = subOrderList[0];
                }

                feedbackProducer = {
                    docType: DocType.FEEDBACK_PRODUCER,

                    feedbackProducerMrid: FeedbackProducerController.getFeedbackProducerMrid(params, activationDocumentObj.activationDocumentMrid),
                    activationDocumentMrid: activationDocumentObj.activationDocumentMrid,

                    messageType: 'B30',
                    processType: 'A42',
                    revisionNumber: '0',

                    indeminityStatus: IndeminityStatus.IN_PROGRESS,

                    receiverMarketParticipantMrid: activationDocumentObj.receiverMarketParticipantMrid,
                    senderMarketParticipantMrid: activationDocumentObj.senderMarketParticipantMrid,

                    createdDateTime: activationDocumentObj.startCreatedDateTime,
                }
            }
            const status:string = await FeedbackProducerController.getIndemnityStatusFromObj(params, activationDocument.activationDocumentMrid, feedbackProducer);
            feedbackProducer.indeminityStatus = status;

            const keepInformation: boolean = await this.TestInformation(
                                                            params,
                                                            criteriaObj,
                                                            historyInformationInBuilding.identity,
                                                            activationDocument,
                                                            subOrderList,
                                                            site,
                                                            feedbackProducer);
            if (!keepInformation) {
                continue;
            }

            let producer: Producer = null;
            if (site && site.producerMarketParticipantMrid != "") {
                producer = historyInformationInBuilding.allInformation.get(site.producerMarketParticipantMrid);
            } else {
                producer = historyInformationInBuilding.allInformation.get(activationDocument.receiverMarketParticipantMrid);

                if ( (!producer
                        || producer.producerMarketParticipantMrid !== activationDocument.receiverMarketParticipantMrid)
                    && subOrderList
                    && subOrderList.length > 0) {
                        producer = historyInformationInBuilding.allInformation.get(subOrderList[0].receiverMarketParticipantMrid);
                    }
            }


            let calculateEnergyAmount: boolean = true;
            if (historyInformationInBuilding.identity === OrganizationTypeMsp.PRODUCER) {
                calculateEnergyAmount =
                    (activationDocument.eligibilityStatus === EligibilityStatusType.EligibilityAccepted
                    || activationDocument.eligibilityStatus === EligibilityStatusType.FREligibilityAccepted);
            }

            let energyAmount: EnergyAmount = null;
            if (calculateEnergyAmount) {
                energyAmount = historyInformationInBuilding.allInformation.get(activationDocument.activationDocumentMrid + "_NRJ");
                if ((!energyAmount || energyAmount.activationDocumentMrid !== activationDocument.activationDocumentMrid)
                    && subOrderList.length > 0
                    && subOrderList[0]
                    && subOrderList[0].activationDocumentMrid) {

                        energyAmount = historyInformationInBuilding.allInformation.get(subOrderList[0].activationDocumentMrid + "_NRJ");
                }
            }

            let displayedSourceName = activationDocument.originAutomationRegisteredResourceMrid;
            if (activationDocument.instance === "tso" && subOrderList && subOrderList.length > 0) {
                displayedSourceName = subOrderList[0].originAutomationRegisteredResourceMrid;
            }

            if (historyInformationInBuilding.roleUser === RoleType.Role_TSO
                || historyInformationInBuilding.roleUser === RoleType.Role_TSOProducer) {

                if (!producer) {
                    displayedSourceName = activationDocument.registeredResourceMrid;

                } else if (subOrderList
                    && subOrderList.length > 0) {

                        if (activationDocument.instance === "tso") {
                            displayedSourceName = activationDocument.registeredResourceMrid;
                        } else {
                            displayedSourceName = subOrderList[0].registeredResourceMrid;
                        }

                } else if (site) {
                    displayedSourceName = site.substationMrid;
                }
            } else if ((historyInformationInBuilding.roleUser === RoleType.Role_DSO || historyInformationInBuilding.roleUser === RoleType.Role_DSOProducer)
                && !producer
                && !site) {

                displayedSourceName = activationDocument.registeredResourceMrid;
            }


            let reserveBidsBySite: ReserveBidMarketDocument[] = [];
            if (site && site.meteringPointMrid !== "") {
                historyInformationInBuilding.allInformation.get(site.meteringPointMrid + "_RsBidDocs");
            }

            let reserveBid: ReserveBidMarketDocument = ReserveBidMarketDocumentController.selectForActivationDocument(params, activationDocument, reserveBidsBySite);

            let balancingDocument: BalancingDocument = null;
            if (historyInformationInBuilding.identity !== OrganizationTypeMsp.PRODUCER
                || activationDocument.eligibilityStatus === EligibilityStatusType.EligibilityAccepted
                || activationDocument.eligibilityStatus === EligibilityStatusType.FREligibilityAccepted) {

                let activationDocumentForBalancing: ActivationDocument= null;
                if (site && activationDocument.registeredResourceMrid === site.meteringPointMrid) {
                    activationDocumentForBalancing = activationDocument;
                } else if (subOrderList && subOrderList.length > 0) {
                    activationDocumentForBalancing = subOrderList[0];
                }

                balancingDocument = await BalancingDocumentController.generateObj(
                    params,
                    activationDocumentForBalancing,
                    reserveBid,
                    energyAmount);
            }

            const information: HistoryInformation = {
                activationDocument: JSON.parse(JSON.stringify(activationDocument)),
                subOrderList: JSON.parse(JSON.stringify(subOrderList)),
                site: site ? JSON.parse(JSON.stringify(site)) : null,
                producer: producer ? JSON.parse(JSON.stringify(producer)) : null,
                energyAmount: energyAmount ? JSON.parse(JSON.stringify(energyAmount)) : null,
                feedbackProducer: feedbackProducer ? JSON.parse(JSON.stringify(feedbackProducer)) : null,
                displayedSourceName,
                reserveBidMarketDocument: reserveBid ? JSON.parse(JSON.stringify(reserveBid)) : null,
                balancingDocument: balancingDocument ? JSON.parse(JSON.stringify(balancingDocument)) : null,
            };


            historyInformationInBuilding.historyInformation.set(
                information.activationDocument.activationDocumentMrid, information);

            const key = this.buildKey(information.activationDocument);

            if (information.site
                && information.producer
                && information.activationDocument
                && information.activationDocument.eligibilityStatusEditable) {

                historyInformationInBuilding.eligibilityToDefine.push(key);
            } else if (information.activationDocument.eligibilityStatus
                && information.activationDocument.eligibilityStatus !== '') {

                historyInformationInBuilding.eligibilityDefined.push(key);
            } else if (information.subOrderList
                && information.subOrderList.length > 0) {

                historyInformationInBuilding.reconciliated.push(key);
            } else {
                historyInformationInBuilding.others.push(key);
            }
        }


        params.logger.debug('=============  END  : consolidateFiltered ===========');

        return historyInformationInBuilding;
    }

}
