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
                    const informationInBuilding: HistoryInformationInBuilding =
                        await HistoryController.consolidate(params, allValidActivationDocument, criteriaObj);
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
                            embeddedInformation.push(subOrder.activationDocumentMrid);
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
                            embeddedInformation.push(subOrder.activationDocumentMrid);
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
                            embeddedInformation.push(subOrder.activationDocumentMrid);
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
                            embeddedInformation.push(subOrder.activationDocumentMrid);
                        }
                    }

                    finalinformation.push(information);
                }
            }

        }

        params.logger.debug('=============  END  : generateOutput ===========');

        return finalinformation;
    }

}
