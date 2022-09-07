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
            criteriaObj = await HistoryController.consolidateCriteria(params, criteriaObj, role);

            if (criteriaObj) {
                const query = await HistoryController.buildActivationDocumentQuery(params, criteriaObj);

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

                if (allValidActivationDocument && allValidActivationDocument.length > 0) {
                    const informationInBuilding: HistoryInformationInBuilding = await HistoryController.consolidate(params, allValidActivationDocument);
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







    private static async consolidateCriteria(
        params: STARParameters,
        criteriaObj: HistoryCriteria,
        role: string): Promise<HistoryCriteria> {

        params.logger.debug('============= START : consolidateCriteria ===========');

        if (criteriaObj.producerMarketParticipantName) {
            criteriaObj.producerMarketParticipantName = criteriaObj.producerMarketParticipantName.trim();
        }

        const prodIdList: string[] = [];
        if (criteriaObj.producerMarketParticipantMrid) {
            prodIdList.push(criteriaObj.producerMarketParticipantMrid);
        }
        if (criteriaObj.producerMarketParticipantName) {
            prodIdList.push(criteriaObj.producerMarketParticipantName);
            const allProdId = await ProducerController.getProducerByName(params, criteriaObj.producerMarketParticipantName);
            if (allProdId) {
                for (var prodId of allProdId) {
                    if (prodId && prodId.producerMarketParticipantMrid) {
                        prodIdList.push(prodId.producerMarketParticipantMrid);

                        params.addInMemoryPool(prodId.producerMarketParticipantMrid, {docType: DocType.PRODUCER, data: prodId, collection:''});
                    }
                }
            }
        }
        criteriaObj.producerMarketParticipantList = prodIdList;

        var args: string[] = [];

        if (criteriaObj) {
            if (criteriaObj.meteringPointMrid) {
                args.push(`"meteringPointMrid":"${criteriaObj.meteringPointMrid}"`);
            }
            if (criteriaObj.registeredResourceMrid) {
                args.push(`"meteringPointMrid":"${criteriaObj.registeredResourceMrid}"`);
            }
            if (criteriaObj.originAutomationRegisteredResourceMrid) {
                args.push(`"substationMrid":"${criteriaObj.originAutomationRegisteredResourceMrid}"`);
            }
            if (criteriaObj.producerMarketParticipantList && criteriaObj.producerMarketParticipantList.length > 0) {
                const producerMarketParticipantList_str = JSON.stringify(criteriaObj.producerMarketParticipantList);
                args.push(`"producerMarketParticipantMrid": { "$in" : ${producerMarketParticipantList_str} }`);
            }
            if (criteriaObj.siteName
                && (role === RoleType.Role_Producer) ) {
                args.push(`"siteName":"${criteriaObj.siteName}"`);
            }
        }


        criteriaObj.originAutomationRegisteredResourceList = [];
        criteriaObj.registeredResourceList = [];
        if (args.length > 0) {
            const querySite = await QueryStateService.buildQuery({documentType: DocType.SITE, queryArgs: args});
            const siteList: any[] = await SiteService.getQueryArrayResult(params, querySite);

            if (siteList.length == 0) {
                return null;
            }
            for (var site of siteList) {
                if (site.meteringPointMrid === criteriaObj.meteringPointMrid
                    || site.meteringPointMrid === criteriaObj.originAutomationRegisteredResourceMrid
                    || criteriaObj.producerMarketParticipantList.includes(site.producerMarketParticipantMrid)
                    || site.siteName == criteriaObj.siteName) {

                    criteriaObj.originAutomationRegisteredResourceList.push(site.substationMrid);
                    criteriaObj.registeredResourceList.push(site.meteringPointMrid);

                    params.addInMemoryPool(site.meteringPointMrid, {docType: DocType.SITE, data: site, collection:''});
                }
            }
        }

        if (criteriaObj.originAutomationRegisteredResourceMrid) {
            const yellowPages: YellowPages[] = await YellowPagesController.getYellowPagesByOriginAutomationRegisteredResource(params, criteriaObj.originAutomationRegisteredResourceMrid);
            if (yellowPages) {
                for (var yellowPage of yellowPages) {
                    criteriaObj.registeredResourceList.push(yellowPage.registeredResourceMrid);

                    params.addInMemoryPool(yellowPage.yellowPageMrid, {docType: DocType.YELLOW_PAGES, data: yellowPage, collection:''});
                }
            }
            criteriaObj.originAutomationRegisteredResourceList.push(criteriaObj.originAutomationRegisteredResourceMrid);
        }
        if (criteriaObj.registeredResourceMrid) {
            const yellowPages: YellowPages[] = await YellowPagesController.getYellowPagesByRegisteredResourceMrid(params, criteriaObj.registeredResourceMrid);
            if (yellowPages) {
                for (var yellowPage of yellowPages) {
                    criteriaObj.originAutomationRegisteredResourceList.push(yellowPage.originAutomationRegisteredResourceMrid);

                    params.addInMemoryPool(yellowPage.yellowPageMrid, {docType: DocType.YELLOW_PAGES, data: yellowPage, collection:''});
                }
            }
            criteriaObj.registeredResourceList.push(criteriaObj.registeredResourceMrid);
            criteriaObj.registeredResourceList.push(criteriaObj.originAutomationRegisteredResourceMrid);
        }

        params.logger.debug('=============  END  : consolidateCriteria ===========');

        return criteriaObj;
    }




    private static async buildActivationDocumentQuery(params: STARParameters, criteriaObj: HistoryCriteria) : Promise<string> {

        params.logger.debug('============= START : buildActivationDocumentQuery ===========');

        var args: string[] = [];

        if (criteriaObj) {
            const criteriaPlace: string[] = [];
            if (criteriaObj.originAutomationRegisteredResourceList
                && criteriaObj.originAutomationRegisteredResourceList.length > 0) {

                const originAutomationRegisteredResourceList_str = JSON.stringify(criteriaObj.originAutomationRegisteredResourceList);
                criteriaPlace.push(`"originAutomationRegisteredResourceMrid": { "$in" : ${originAutomationRegisteredResourceList_str} }`);
                criteriaPlace.push(`"registeredResourceMrid": { "$in" : ${originAutomationRegisteredResourceList_str} }`);
                // args.push(`"originAutomationRegisteredResourceMrid": { "$in" : ${originAutomationRegisteredResourceList_str} }`);
            }
            if (criteriaObj.registeredResourceList
                && criteriaObj.registeredResourceList.length > 0) {
                const registeredResourceList_str = JSON.stringify(criteriaObj.registeredResourceList);
                criteriaPlace.push(`"registeredResourceMrid": { "$in" : ${registeredResourceList_str} }`);
                // args.push(`"registeredResourceMrid": { "$in" : ${registeredResourceList_str} }`);
            }
            if (criteriaPlace.length == 1) {
                args.push(criteriaPlace[0]);
            } else if (criteriaPlace.length > 1) {
                var criteriaPlace_str: string = `"$or":[`;
                for (var i=0; i<criteriaPlace.length; i++) {
                    if (i>0) {
                        criteriaPlace_str = criteriaPlace_str.concat(`,`);
                    }
                    criteriaPlace_str = criteriaPlace_str.concat(`{`).concat(criteriaPlace[i]).concat(`}`);
                }
                criteriaPlace_str = criteriaPlace_str.concat(`]`);
                args.push(criteriaPlace_str);
            }
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
        allActivationDocument: ActivationDocument[]): Promise<HistoryInformationInBuilding> {

        params.logger.debug('============= START : consolidate ===========');

        const historyInformationInBuilding: HistoryInformationInBuilding = new HistoryInformationInBuilding();

        // if (allActivationDocument && allActivationDocument.length > 0) {
        //     params.logger.debug("----------------")
        //     params.logger.debug("history ActivationDocument[0]")
        //     params.logger.debug(JSON.stringify(allActivationDocument[0]))
        //     params.logger.debug("----------------")
        // }
        const yellowPages: YellowPages[] = await YellowPagesController.getAllYellowPagesObject(params);
        const ypRegistered: string[] = [];
        const ypAutomation: string[] = [];
        for (var yp of yellowPages) {
            ypRegistered.push(yp.registeredResourceMrid);
            ypAutomation.push(yp.originAutomationRegisteredResourceMrid);
        }

        for (const activationDocumentQueryValue of allActivationDocument) {
            const activationDocument = await ActivationDocumentEligibilityService.outputFormatFRActivationDocument(params, activationDocumentQueryValue);

            var activationDocumentForInformation: ActivationDocument = JSON.parse(JSON.stringify(activationDocument));
            var displayedSourceName = activationDocumentForInformation.originAutomationRegisteredResourceMrid;

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
                const existingSitesRef = await StarPrivateDataService.getObjRefbyId(params, {docType: DocType.SITE, id: activationDocumentForInformation.registeredResourceMrid});
                const siteObjRef:DataReference = existingSitesRef.values().next().value;
                if (siteObjRef && siteObjRef.docType === DocType.SITE) {
                    siteRegistered = siteObjRef.data;
                    if (!ypAutomation.includes(activationDocumentForInformation.originAutomationRegisteredResourceMrid)) {
                        displayedSourceName = siteRegistered.substationMrid;
                    }
                }
            } catch (error) {
                //DO nothing except "Not accessible information"
            }
            if (!siteRegistered && subOrderList && subOrderList.length > 0) {
                //If no site found, search information by SubOrder Id
                activationDocumentForInformation = JSON.parse(JSON.stringify(subOrderList[0]));
                try {
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

            if(activationDocument.receiverRole === RoleType.Role_DSO) {
                displayedSourceName = activationDocument.registeredResourceMrid;
            }

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

            const information: HistoryInformation = {
                activationDocument: JSON.parse(JSON.stringify(activationDocument)),
                subOrderList: JSON.parse(JSON.stringify(subOrderList)),
                site: siteRegistered ? JSON.parse(JSON.stringify(siteRegistered)) : null,
                producer: producer ? JSON.parse(JSON.stringify(producer)) : null,
                energyAmount: energyAmount ? JSON.parse(JSON.stringify(energyAmount)) : null,
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
        }
        params.logger.debug('=============  END  : consolidate ===========');

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
