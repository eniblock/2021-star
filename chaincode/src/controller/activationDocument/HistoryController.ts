import { DocType } from "../../enums/DocType";
import { ParametersType } from "../../enums/ParametersType";
import { RoleType } from "../../enums/RoleType";

import { ActivationDocument } from "../../model/activationDocument/activationDocument";
import { EnergyAmount } from "../../model/energyAmount";
import { HistoryCriteria } from "../../model/activationDocument/historyCriteria";
import { HistoryInformation } from "../../model/activationDocument/historyInformation";
import { Producer } from "../../model/producer";
import { Site } from "../../model/site";
import { STARParameters } from "../../model/starParameters";
import { YellowPages } from "../../model/yellowPages";

import { ActivationDocumentController } from "./ActivationDocumentController";
import { EnergyAmountController } from "../EnergyAmountController";
import { ProducerController } from "../ProducerController";
import { YellowPagesController } from "../YellowPagesController";

import { ActivationDocumentEligibilityService } from "../service/ActivationDocumentEligibilityService";
import { ActivationDocumentService } from "../service/ActivationDocumentService";
import { HLFServices } from "../service/HLFservice";
import { QueryStateService } from "../service/QueryStateService";
import { SiteService } from "../service/SiteService";
import { StarPrivateDataService } from "../service/StarPrivateDataService";
import { StarDataService } from "../service/StarDataService";
import { DataReference } from "../../model/dataReference";
import { ReserveBidMarketDocument } from "../../model/reserveBidMarketDocument";
import { ReserveBidMarketDocumentController } from "../ReserveBidMarketDocumentController";
import { reserveBidMarketDocumentSiteDate } from "../../model/reserveBidMarketDocumentSiteDate";

export class HistoryInformationInBuilding {
    public historyInformation: Map<string, HistoryInformation> = new Map();
    public eligibilityToDefine: string[] = [];
    public eligibilityDefined: string[] = [];
    public reconciliated: string[] = [];
    public others: string[] = [];
}

export class HistoryController {

    public static async getHistoryByQuery(
        params: STARParameters,
        inputStr: string): Promise<HistoryInformation[]> {

        params.logger.info('============= START : getHistoryByQuery ===========');


        let criteriaObj: HistoryCriteria;
        var result : HistoryInformation[];

        if (inputStr && inputStr !=="") {
            try {
                criteriaObj = JSON.parse(inputStr);
            } catch (error) {
            // params.logger.error('error=', error);
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
                params.logger.debug("History query: ", query);

                const collections: string[] = await HLFServices.getCollectionsFromParameters(params, ParametersType.DATA_TARGET, ParametersType.ALL);

                const allActivationDocument: ActivationDocument[] = await ActivationDocumentService.getQueryArrayResult(params, query, collections);

                const allValidActivationDocument: ActivationDocument[] = [];
                //Filter to keep only valid documents (and store in memory pool)
                if (allActivationDocument && allActivationDocument.length > 0) {
                    for (var document of allActivationDocument) {
                        if (document && document.activationDocumentMrid) {
                            allValidActivationDocument.push(document);
                            params.addInMemoryPool(document.activationDocumentMrid, {collection: '', docType: DocType.ACTIVATION_DOCUMENT, data: document});
                        }
                    }
                }
                params.logger.debug("allValidActivationDocument: ", JSON.stringify(allValidActivationDocument));
                params.logger.debug('**********************************************');

                if (allValidActivationDocument && allValidActivationDocument.length > 0) {
                    const informationInBuilding: HistoryInformationInBuilding = await HistoryController.consolidate(params, allValidActivationDocument, criteriaObj);
                    result = await HistoryController.generateOutput(params, informationInBuilding);

                }
            }
        }

        params.logger.debug("###############################################")
        params.logger.debug(JSON.stringify(result))
        params.logger.debug("###############################################")

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
            const allProdId = await ProducerController.getProducerByName(params, criteriaObj.producerMarketParticipantName);
            if (allProdId) {
                for (var prodId of allProdId) {
                    if (prodId && prodId.producerMarketParticipantMrid) {
                        producerMarketParticipantList.push(prodId.producerMarketParticipantMrid);

                        params.addInMemoryPool(prodId.producerMarketParticipantMrid, {docType: DocType.PRODUCER, data: prodId, collection:''});
                    }
                }
            }
        }


        //build meteringPointMrid List by substration
        // to check if originAutomationRegisteredResourceMrid defines a substration value
        const substrationMeteringPointMridList: string[] = [];
        if (criteriaObj.originAutomationRegisteredResourceMrid) {
            var substation_args: string[] = [];
            substation_args.push(`"substationMrid":"${criteriaObj.originAutomationRegisteredResourceMrid}"`);
            const substation_querySite = await QueryStateService.buildQuery({documentType: DocType.SITE, queryArgs: substation_args});
            const substation_siteList: Site[] = await SiteService.getQueryArrayResult(params, substation_querySite);
            for (var substation_site of substation_siteList) {
                substrationMeteringPointMridList.push(substation_site.meteringPointMrid);
            }
        }


        var args: string[] = [];

        if (criteriaObj.meteringPointMrid) {
            args.push(`"meteringPointMrid":"${criteriaObj.meteringPointMrid}"`);
        }
        if (producerMarketParticipantList && producerMarketParticipantList.length > 0) {
            const producerMarketParticipantList_str = JSON.stringify(producerMarketParticipantList);
            args.push(`"producerMarketParticipantMrid": { "$in" : ${producerMarketParticipantList_str} }`);
        }
        if (criteriaObj.siteName
            && (role === RoleType.Role_Producer) ) {
            args.push(`"siteName":"${criteriaObj.siteName}"`);
        }


        criteriaObj.registeredResourceList = [];
        if (args.length > 0) {
            const querySite = await QueryStateService.buildQuery({documentType: DocType.SITE, queryArgs: args});
            const siteList: Site[] = await SiteService.getQueryArrayResult(params, querySite);

            for (var site of siteList) {
                if (substrationMeteringPointMridList.length == 0
                    || substrationMeteringPointMridList.includes(site.meteringPointMrid)) {

                    criteriaObj.registeredResourceList.push(site.substationMrid);
                    criteriaObj.registeredResourceList.push(site.meteringPointMrid);
                }
                params.addInMemoryPool(site.meteringPointMrid, {docType: DocType.SITE, data: site, collection:''});
            }
        } else if (substrationMeteringPointMridList.length > 0) {
            for (var id of substrationMeteringPointMridList) {
                criteriaObj.registeredResourceList.push(id);
                criteriaObj.registeredResourceList.push(id);
            }
        }

        params.logger.debug('=============  END  : consolidateRegisteredResourceListCriteria ===========');

        return criteriaObj;
    }




    private static async buildActivationDocumentQuery(params: STARParameters, criteriaObj: HistoryCriteria) : Promise<string> {

        params.logger.debug('============= START : buildActivationDocumentQuery ===========');

        var args: string[] = [];

        if (criteriaObj) {

            const criteriaPlaceList: string[] = [];

            if (criteriaObj.originAutomationRegisteredResourceMrid) {
                criteriaPlaceList.push(`"originAutomationRegisteredResourceMrid":"${criteriaObj.originAutomationRegisteredResourceMrid}"`);

                if (criteriaObj.registeredResourceList && criteriaObj.registeredResourceList.length > 0) {

                    const listId: string[] = JSON.parse(JSON.stringify(criteriaObj.registeredResourceList));
                    listId.push(criteriaObj.originAutomationRegisteredResourceMrid);
                    const registeredResourceList_str = JSON.stringify(criteriaObj.registeredResourceList);
                    criteriaPlaceList.push(`"registeredResourceMrid": { "$in" : ${registeredResourceList_str} }`);

                } else {
                    criteriaPlaceList.push(`"registeredResourceMrid":"${criteriaObj.originAutomationRegisteredResourceMrid}"`);
                }
            } else if (criteriaObj.producerMarketParticipantName
                || criteriaObj.producerMarketParticipantMrid
                || criteriaObj.meteringPointMrid
                || criteriaObj.siteName) {

                const registeredResourceList_str = JSON.stringify(criteriaObj.registeredResourceList);
                criteriaPlaceList.push(`"registeredResourceMrid": { "$in" : ${registeredResourceList_str} }`);
            }

            const criteriaPlace = await QueryStateService.buildORCriteria(criteriaPlaceList);
            args.push(criteriaPlace);

            if (criteriaObj.endCreatedDateTime) {
                args.push(`"$or":[{"startCreatedDateTime":{"$lte": ${JSON.stringify(criteriaObj.endCreatedDateTime)}}},{"startCreatedDateTime":""},{"startCreatedDateTime":{"$exists": false}}]`);
            }
            if (criteriaObj.startCreatedDateTime) {
                args.push(`"$or":[{"endCreatedDateTime":{"$gte": ${JSON.stringify(criteriaObj.startCreatedDateTime)}}},{"endCreatedDateTime":""},{"endCreatedDateTime":{"$exists": false}}]`);
            }
        }

        params.logger.debug('=============  END  : buildActivationDocumentQuery ===========');

        return await QueryStateService.buildQuery({documentType: DocType.ACTIVATION_DOCUMENT, queryArgs: args});
    }







    private static async consolidate(
        params: STARParameters,
        allActivationDocument: ActivationDocument[],
        criteriaObj: HistoryCriteria): Promise<HistoryInformationInBuilding> {

        params.logger.debug('============= START : consolidate ===========');

        var historyInformationInBuilding: HistoryInformationInBuilding = new HistoryInformationInBuilding();

        // if (allActivationDocument && allActivationDocument.length > 0) {
        //     params.logger.debug("----------------")
        //     params.logger.debug("history ActivationDocument[0]")
        //     params.logger.debug(JSON.stringify(allActivationDocument[0]))
        //     params.logger.debug("----------------")
        // }
        const roleTable: Map<string, string> = params.values.get(ParametersType.ROLE_TABLE);
        const identity: string = params.values.get(ParametersType.IDENTITY);
        const roleUser: string = roleTable.get(identity.toLowerCase());

        // const yellowPages: YellowPages[] = await YellowPagesController.getAllYellowPagesObject(params);
        // const ypRegistered: string[] = [];
        // const ypAutomation: string[] = [];
        // for (var yp of yellowPages) {
        //     ypRegistered.push(yp.registeredResourceMrid);
        //     ypAutomation.push(yp.originAutomationRegisteredResourceMrid);
        // }

        for (const activationDocumentQueryValue of allActivationDocument) {
            params.logger.debug("ooo activationDocumentQueryValue.activationDocumentMrid : ", activationDocumentQueryValue.activationDocumentMrid);

            const activationDocument = await ActivationDocumentEligibilityService.outputFormatFRActivationDocument(params, activationDocumentQueryValue);

            var activationDocumentForInformation: ActivationDocument = JSON.parse(JSON.stringify(activationDocument));

            var subOrderList: ActivationDocument[] = [];
            if (activationDocument && activationDocument.subOrderList) {
                for(var activationDocumentMrid of activationDocument.subOrderList) {

                    var subOrder: ActivationDocument = null;
                    try {
                        subOrder = await ActivationDocumentController.getActivationDocumentById(params, activationDocumentMrid);
                    } catch(error) {
                        //do nothing, but empty document : suborder information is not in accessible collection
                    }
                    if (subOrder && subOrder.activationDocumentMrid) {
                        subOrderList.push(subOrder);
                    }
                }
            }
            //Manage Yello Page to get Site Information
            var siteRegistered: Site = null;
            try {
                params.logger.debug("ooo search site activationDocumentForInformation.registeredResourceMrid : ", activationDocumentForInformation.registeredResourceMrid);

                const existingSitesRef = await StarPrivateDataService.getObjRefbyId(params, {docType: DocType.SITE, id: activationDocumentForInformation.registeredResourceMrid});
                const siteObjRef:DataReference = existingSitesRef.values().next().value;
                if (siteObjRef && siteObjRef.docType === DocType.SITE) {
                    siteRegistered = siteObjRef.data;
                }
            } catch (error) {
                //DO nothing except "Not accessible information"
            }
            if (!siteRegistered && subOrderList && subOrderList.length > 0) {
                //If no site found, search information by SubOrder Id
                activationDocumentForInformation = JSON.parse(JSON.stringify(subOrderList[0]));
                try {
                    params.logger.debug("ooo search site by subOrderList[0]");
                    params.logger.debug("ooo search site activationDocumentForInformation.registeredResourceMrid : ", activationDocumentForInformation.registeredResourceMrid);

                    const existingSitesRef =await StarPrivateDataService.getObjRefbyId(params, {docType: DocType.SITE, id: activationDocumentForInformation.registeredResourceMrid});
                    const siteObjRef = existingSitesRef.values().next().value;
                    if (siteObjRef && siteObjRef.docType === DocType.SITE) {
                        siteRegistered = siteObjRef.data;
                    }
                } catch (error) {
                    //DO nothing except "Not accessible information"
                }
            }
            if (!siteRegistered) {
                //If still no site found, back to initial value
                activationDocumentForInformation = JSON.parse(JSON.stringify(activationDocument));
            }

            //
            // FILTER
            //
            //Build a filtrer to check if it needs to go further in consolidation
            var keepInformation = true;

            if (criteriaObj.originAutomationRegisteredResourceMrid) {
                const keepInformationOrigin1 = (activationDocument.originAutomationRegisteredResourceMrid === criteriaObj.originAutomationRegisteredResourceMrid);
                const keepInformationOrigin2 = (subOrderList
                                                && subOrderList.length > 0
                                                && subOrderList[0].originAutomationRegisteredResourceMrid === criteriaObj.originAutomationRegisteredResourceMrid);

                const keepInformationRegistered1 = (activationDocument.registeredResourceMrid === criteriaObj.originAutomationRegisteredResourceMrid);
                const keepInformationRegistered2 = (subOrderList
                                                    && subOrderList.length > 0
                                                    && subOrderList[0].registeredResourceMrid === criteriaObj.originAutomationRegisteredResourceMrid);

                const keepInformationSubstration = (siteRegistered && siteRegistered.substationMrid === criteriaObj.originAutomationRegisteredResourceMrid);

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

                keepInformation = keepInformation && siteRegistered && criteriaObj.registeredResourceList.includes(siteRegistered.meteringPointMrid);
            }

            if (subOrderList && subOrderList.length > 0) {
                //Keep only if it's a perfect match
                keepInformation = keepInformation
                                    && activationDocument.subOrderList
                                    && activationDocument.subOrderList.length > 0
                                    && activationDocument.subOrderList.includes(subOrderList[0].activationDocumentMrid)
                                    && subOrderList[0].subOrderList
                                    && subOrderList[0].subOrderList.length > 0
                                    && subOrderList[0].subOrderList.includes(activationDocument.activationDocumentMrid);
            }



            //END OF FILTER
            //If information doesn't to be kept
            //the process doesn't care about this document
            if (keepInformation) {
                historyInformationInBuilding =
                    await this.consolidateFiltered(
                        params,
                        roleUser,
                        historyInformationInBuilding,
                        activationDocument,
                        activationDocumentForInformation,
                        subOrderList,
                        siteRegistered);
            }

        }
        params.logger.debug('=============  END  : consolidate ===========');

        return historyInformationInBuilding;
    }






    private static async consolidateFiltered(
        params: STARParameters,
        roleUser: string,
        historyInformationInBuilding: HistoryInformationInBuilding,
        activationDocument: ActivationDocument,
        activationDocumentForInformation: ActivationDocument,
        subOrderList: ActivationDocument[],
        siteRegistered: Site,): Promise<HistoryInformationInBuilding> {

        var producer: Producer = null;
        try {
            if (siteRegistered && siteRegistered.producerMarketParticipantMrid) {
                producer = await StarDataService.getObj(params, {id: siteRegistered.producerMarketParticipantMrid, docType: DocType.PRODUCER});
            }
        } catch (error) {
            //DO nothing except "Not accessible information"
        }
        if (!producer) {
            try {
                if (activationDocumentForInformation.receiverMarketParticipantMrid) {
                    const prod = await StarDataService.getObj(params, {id: activationDocumentForInformation.receiverMarketParticipantMrid});
                    if (prod) {
                        const untypedValue = JSON.parse(JSON.stringify(prod))
                        if (untypedValue && untypedValue.producerMarketParticipantMrid) {
                            producer = {
                                producerMarketParticipantMrid: prod.producerMarketParticipantMrid,
                                producerMarketParticipantName: prod.producerMarketParticipantName,
                                producerMarketParticipantRoleType: prod.producerMarketParticipantRoleType
                            }
                        // } else if (untypedValue && untypedValue.systemOperatorMarketParticipantMrid) {

                        //     producer = {
                        //         producerMarketParticipantMrid: untypedValue.systemOperatorMarketParticipantMrid,
                        //         producerMarketParticipantName: untypedValue.systemOperatorMarketParticipantName,
                        //         producerMarketParticipantRoleType: untypedValue.systemOperatorMarketParticipantRoleType
                        //     }
                        }
                    }

                }
            } catch (error) {
                //DO nothing except "Not accessible information"
            }
        }

        var displayedSourceName = activationDocumentForInformation.originAutomationRegisteredResourceMrid;

        if (roleUser === RoleType.Role_TSO) {
            if(!producer) {
                displayedSourceName = activationDocument.registeredResourceMrid;

            } else if (subOrderList
                && subOrderList.length > 0) {

                    if (activationDocument.receiverMarketParticipantMrid === producer.producerMarketParticipantMrid) {
                        displayedSourceName = subOrderList[0].registeredResourceMrid;
                    } else {
                        displayedSourceName = activationDocument.registeredResourceMrid;
                    }

            } else if (siteRegistered) {
                displayedSourceName = siteRegistered.substationMrid;
            }
        } else if (roleUser === RoleType.Role_DSO
            && !producer
            && !siteRegistered) {

            displayedSourceName = activationDocument.registeredResourceMrid;
        }

        // if (!producer) {
        //     try {
        //         if (activationDocument.receiverMarketParticipantMrid) {
        //             var so = await SystemOperatorService.getObj(activationDocument.receiverMarketParticipantMrid);
        //             if (so) {
        //                 producer = {
        //                     producerMarketParticipantMrid: so.systemOperatorMarketParticipantMrid,
        //                     producerMarketParticipantName: so.systemOperatorMarketParticipantName,
        //                     producerMarketParticipantRoleType: so.systemOperatorMarketParticipantRoleType
        //                 }
        //             }
        //         }
        //     } catch (error) {
        //         //DO nothing except "Not accessible information"
        //     }
        // }


        var energyAmount: EnergyAmount = null;
        try {
            if (activationDocumentForInformation && activationDocumentForInformation.activationDocumentMrid) {
                energyAmount = await EnergyAmountController.getEnergyAmountByActivationDocument(params, activationDocumentForInformation.activationDocumentMrid);
            }

        } catch (error) {
            //DO nothing except "Not accessible information"
        }

        var reserveBid: ReserveBidMarketDocument = null;
        if (siteRegistered && siteRegistered.meteringPointMrid) {
            try {
                var referenceDateTime: string = activationDocument.startCreatedDateTime;
                if (!referenceDateTime || referenceDateTime.length === 0) {
                    if (subOrderList && subOrderList.length > 0) {
                        referenceDateTime = subOrderList[0].startCreatedDateTime;
                    }
                }
                const criteriaObj: reserveBidMarketDocumentSiteDate = {
                    meteringPointMrid: siteRegistered.meteringPointMrid,
                    referenceDateTime: referenceDateTime,
                    includeNext: false}

                if (referenceDateTime && referenceDateTime.length > 0) {
                    const reserveBidList = await ReserveBidMarketDocumentController.getBySiteAndDate(params, criteriaObj);
                    if (reserveBidList && reserveBidList.length > 0) {
                        reserveBid = reserveBidList[0];
                    }
                }
            } catch (err) {
                //DO nothing except "Not accessible information"
            }
        }



        const information: HistoryInformation = {
            activationDocument: JSON.parse(JSON.stringify(activationDocument)),
            subOrderList: JSON.parse(JSON.stringify(subOrderList)),
            site: siteRegistered ? JSON.parse(JSON.stringify(siteRegistered)) : null,
            producer: producer ? JSON.parse(JSON.stringify(producer)) : null,
            energyAmount: energyAmount ? JSON.parse(JSON.stringify(energyAmount)) : null,
            reserveBidMarketDocument: reserveBid ? JSON.parse(JSON.stringify(reserveBid)) : null,
            displayedSourceName: displayedSourceName
        };

        historyInformationInBuilding.historyInformation.set(information.activationDocument.activationDocumentMrid, information);

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
            && information.activationDocument.eligibilityStatus !== "") {

            historyInformationInBuilding.eligibilityDefined.push(key);
        } else if (information.subOrderList
            && information.subOrderList.length > 0) {

            historyInformationInBuilding.reconciliated.push(key);
        } else {
            historyInformationInBuilding.others.push(key);
        }

        return historyInformationInBuilding;
    }







    private static buildKey(activationDocument: ActivationDocument) : string {
        const key = "".concat(activationDocument.startCreatedDateTime)
        .concat("ZYXYZ")
        .concat(activationDocument.endCreatedDateTime)
        .concat("ZYXYZ")
        .concat(activationDocument.activationDocumentMrid);

        return key;
    }




    private static getActivationDocumentMridFromKey(key: string) : string {
        var activationDocumentMrid: string = "";

        const keyArray = key.split("ZYXYZ");
        activationDocumentMrid = keyArray[2];

        return activationDocumentMrid;
    }





    private static async generateOutput(
        params: STARParameters,
        informationInBuilding : HistoryInformationInBuilding): Promise<HistoryInformation[]> {

        params.logger.debug('============= START : generateOutput ===========');

        var finalinformation: HistoryInformation[] = [];
        const embeddedInformation: string[] = [];

        //Build sorted index
        informationInBuilding.eligibilityToDefine.sort();
        informationInBuilding.eligibilityDefined.sort();
        informationInBuilding.reconciliated.sort();
        informationInBuilding.others.sort();

        for (var key of informationInBuilding.eligibilityToDefine) {
            const activationDocumentMrid = this.getActivationDocumentMridFromKey(key);

            if (!embeddedInformation.includes(activationDocumentMrid)) {
                const information = informationInBuilding.historyInformation.get(activationDocumentMrid);

                if (information) {
                    embeddedInformation.push(information.activationDocument.activationDocumentMrid);
                    if (information.subOrderList) {
                        for (var subOrder of information.subOrderList) {
                            embeddedInformation.push(subOrder.activationDocumentMrid);
                        }
                    }

                    finalinformation.push(information);
                }
            }

        }
        for (var key of informationInBuilding.eligibilityDefined) {
            const activationDocumentMrid = this.getActivationDocumentMridFromKey(key);

            if (!embeddedInformation.includes(activationDocumentMrid)) {
                const information = informationInBuilding.historyInformation.get(activationDocumentMrid);

                if (information) {
                    embeddedInformation.push(information.activationDocument.activationDocumentMrid);
                    if (information.subOrderList) {
                        for (var subOrder of information.subOrderList) {
                            embeddedInformation.push(subOrder.activationDocumentMrid);
                        }
                    }

                    finalinformation.push(information);
                }
            }

        }
        for (var key of informationInBuilding.reconciliated) {
            const activationDocumentMrid = this.getActivationDocumentMridFromKey(key);

            if (!embeddedInformation.includes(activationDocumentMrid)) {
                const information = informationInBuilding.historyInformation.get(activationDocumentMrid);

                if (information) {
                    embeddedInformation.push(information.activationDocument.activationDocumentMrid);
                    if (information.subOrderList) {
                        for (var subOrder of information.subOrderList) {
                            embeddedInformation.push(subOrder.activationDocumentMrid);
                        }
                    }

                    finalinformation.push(information);
                }
            }

        }
        for (var key of informationInBuilding.others) {
            const activationDocumentMrid = this.getActivationDocumentMridFromKey(key);

            if (!embeddedInformation.includes(activationDocumentMrid)) {
                const information = informationInBuilding.historyInformation.get(activationDocumentMrid);

                if (information) {
                    embeddedInformation.push(information.activationDocument.activationDocumentMrid);
                    if (information.subOrderList) {
                        for (var subOrder of information.subOrderList) {
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
