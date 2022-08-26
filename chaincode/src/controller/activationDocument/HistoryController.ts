import {Context} from "fabric-contract-api";

import { DocType } from "../../enums/DocType";
import { ParametersType } from "../../enums/ParametersType";
import { RoleType } from "../../enums/RoleType";

import { ActivationDocument } from "../../model/activationDocument/activationDocument";
import { EnergyAmount } from "../../model/energyAmount";
import { HistoryCriteria } from "../../model/historyCriteria";
import { HistoryInformation } from "../../model/historyInformation";
import { Producer } from "../../model/producer";
import { Site } from "../../model/site";
import { STARParameters } from "../../model/starParameters";
import { YellowPages } from "../../model/yellowPages";

import { ActivationDocumentController } from "./ActivationDocumentController";
import { EnergyAmountController } from "../EnergyAmountController";
import { ProducerController } from "../ProducerController";
import { ActivationDocumentEligibilityService } from "../service/ActivationDocumentEligibilityService";

import { ActivationDocumentService } from "../service/ActivationDocumentService";
import { HLFServices } from "../service/HLFservice";
import { ProducerService } from "../service/ProducerService";
import { QueryStateService } from "../service/QueryStateService";
import { SiteService } from "../service/SiteService";
import { YellowPagesController } from "../YellowPagesController";
import { EligibilityStatusType } from "../../enums/EligibilityStatusType";

export class HistoryController {

    public static async getHistoryByQuery(
        ctx: Context,
        params: STARParameters,
        inputStr: string): Promise<HistoryInformation[]> {

        let criteriaObj: HistoryCriteria;
        var result : HistoryInformation[];

        if (inputStr && inputStr !=="") {
            try {
                criteriaObj = JSON.parse(inputStr);
            } catch (error) {
            // console.error('error=', error);
                throw new Error(`ERROR HistoriqueActivationDocumentCriteria-> Input string NON-JSON value`);
            }

            HistoryCriteria.schema.validateSync(
                criteriaObj,
                {strict: true, abortEarly: false},
            );

            const role: string = params.values.get(ParametersType.ROLE);
            criteriaObj = await HistoryController.consolidateCriteria(ctx, params, criteriaObj, role);

            if (criteriaObj) {
                const query = await HistoryController.buildActivationDocumentQuery(criteriaObj);

                const collections: string[] = await HLFServices.getCollectionsFromParameters(params, ParametersType.DATA_TARGET, ParametersType.ALL);

                const allActivationDocument: ActivationDocument[] = await ActivationDocumentService.getQueryArrayResult(ctx, params, query, collections);

                if (allActivationDocument && allActivationDocument.length > 0) {
                    const informationList = await HistoryController.consolidate(ctx, params, allActivationDocument);
                    result = await HistoryController.generateOutput(ctx, informationList);

                }
            }
        }

        return result;
    }







    private static async consolidateCriteria(
        ctx: Context,
        params: STARParameters,
        criteriaObj: HistoryCriteria,
        role: string): Promise<HistoryCriteria> {

        if (criteriaObj.producerMarketParticipantName) {
            criteriaObj.producerMarketParticipantName = criteriaObj.producerMarketParticipantName.trim();
        }

        const prodIdList: string[] = [];
        if (criteriaObj.producerMarketParticipantMrid) {
            prodIdList.push(criteriaObj.producerMarketParticipantMrid);
        }
        if (criteriaObj.producerMarketParticipantName) {
            prodIdList.push(criteriaObj.producerMarketParticipantName);
            const allProdId = await ProducerController.getProducerByName(ctx, criteriaObj.producerMarketParticipantName);
            if (allProdId) {
                for (var prodId of allProdId) {
                    if (prodId && prodId.producerMarketParticipantMrid) {
                        prodIdList.push(prodId.producerMarketParticipantMrid);
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
            const querySite = await QueryStateService.buildQuery(DocType.SITE, args);
            const siteList: any[] = await SiteService.getQueryArrayResult(ctx, params, querySite);

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
                }
            }
        }

        if (criteriaObj.originAutomationRegisteredResourceMrid) {
            const yellowPages: YellowPages[] = await YellowPagesController.getYellowPagesByOriginAutomationRegisteredResource(ctx, criteriaObj.originAutomationRegisteredResourceMrid);
            if (yellowPages) {
                for (var yellowPage of yellowPages) {
                    criteriaObj.registeredResourceList.push(yellowPage.registeredResourceMrid);
                }
            }
            criteriaObj.originAutomationRegisteredResourceList.push(criteriaObj.originAutomationRegisteredResourceMrid);
        }
        if (criteriaObj.registeredResourceMrid) {
            const yellowPages: YellowPages[] = await YellowPagesController.getYellowPagesByRegisteredResourceMrid(ctx, criteriaObj.registeredResourceMrid);
            if (yellowPages) {
                for (var yellowPage of yellowPages) {
                    criteriaObj.originAutomationRegisteredResourceList.push(yellowPage.originAutomationRegisteredResourceMrid);
                }
            }
            criteriaObj.registeredResourceList.push(criteriaObj.registeredResourceMrid);
            criteriaObj.registeredResourceList.push(criteriaObj.originAutomationRegisteredResourceMrid);
        }

        return criteriaObj;
    }

    public static async buildActivationDocumentQuery(criteriaObj: HistoryCriteria) : Promise<string> {
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

        return await QueryStateService.buildQuery(DocType.ACTIVATION_DOCUMENT, args);
    }





    private static async consolidate(
        ctx: Context,
        params: STARParameters,
        allActivationDocument: ActivationDocument[]): Promise<HistoryInformation[]> {

        const informationList: HistoryInformation[] = [];

        if (allActivationDocument && allActivationDocument.length > 0) {
            console.debug("----------------")
            console.debug("history ActivationDocument[0]")
            console.debug(JSON.stringify(allActivationDocument[0]))
            console.debug("----------------")
        }

        for (const activationDocumentQueryValue of allActivationDocument) {
            const activationDocument = await ActivationDocumentEligibilityService.outputFormatFRActivationDocument(ctx, params, activationDocumentQueryValue);

            if (activationDocument && activationDocument.activationDocumentMrid) {
                var activationDocumentForInformation: ActivationDocument = JSON.parse(JSON.stringify(activationDocument));

                var subOrderList: ActivationDocument[] = [];
                if (activationDocument && activationDocument.subOrderList) {
                    for(const activationDocumentMrid of activationDocument.subOrderList) {
                        var subOrder: ActivationDocument;
                        try {
                            subOrder = await ActivationDocumentController.getActivationDocumentById(ctx, params, activationDocumentMrid);
                        } catch(error) {
                            //do nothing, but empty document : suborder information is not in accessible collection
                        }
                        if (subOrder) {
                            subOrderList.push(subOrder);
                        }
                    }
                }
                //Manage Yello Page to get Site Information
                var siteRegistered: Site = null;
                try {
                    const existingSitesRef = await SiteService.getObjRefbyId(ctx, params, activationDocumentForInformation.registeredResourceMrid);
                    const siteObjRef = existingSitesRef.values().next().value;
                    if (siteObjRef) {
                        siteRegistered = siteObjRef.data;
                    }
                } catch (error) {
                    //DO nothing except "Not accessible information"
                }
                if (!siteRegistered && subOrderList && subOrderList.length > 0) {
                    //If no site found, search information by SubOrder Id
                    activationDocumentForInformation = JSON.parse(JSON.stringify(subOrderList[0]));
                }
                try {
                    const existingSitesRef = await SiteService.getObjRefbyId(ctx, params, activationDocumentForInformation.registeredResourceMrid);
                    const siteObjRef = existingSitesRef.values().next().value;
                    if (siteObjRef) {
                        siteRegistered = siteObjRef.data;
                    }
                } catch (error) {
                    //DO nothing except "Not accessible information"
                }
                if (!siteRegistered) {
                    //If still no site found, back to initial value
                    activationDocumentForInformation = JSON.parse(JSON.stringify(activationDocument));
                }


                var producer: Producer = null;
                try {
                    if (siteRegistered && siteRegistered.producerMarketParticipantMrid) {
                        producer = await ProducerService.getObj(ctx, siteRegistered.producerMarketParticipantMrid);
                    }
                } catch (error) {
                    //DO nothing except "Not accessible information"
                }
                if (!producer) {
                    try {
                        if (activationDocumentForInformation.receiverMarketParticipantMrid) {
                            const prod = await ProducerService.getObj(ctx, activationDocumentForInformation.receiverMarketParticipantMrid);
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
                //             var so = await SystemOperatorService.getObj(ctx, activationDocument.receiverMarketParticipantMrid);
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
                        energyAmount = await EnergyAmountController.getEnergyAmountByActivationDocument(ctx, params, activationDocumentForInformation.activationDocumentMrid);
                    }

                } catch (error) {
                    //DO nothing except "Not accessible information"
                }

                const information: HistoryInformation = {
                    activationDocument: JSON.parse(JSON.stringify(activationDocument)),
                    subOrderList: JSON.parse(JSON.stringify(subOrderList)),
                    site: siteRegistered ? JSON.parse(JSON.stringify(siteRegistered)) : null,
                    producer: producer ? JSON.parse(JSON.stringify(producer)) : null,
                    energyAmount: energyAmount ? JSON.parse(JSON.stringify(energyAmount)) : null
                };

                siteRegistered = null;
                producer = null;
                energyAmount = null;

                informationList.push(information);
            }

        }
        return informationList;
    }







    private static async generateOutput(
        ctx: Context,
        initialInformation : HistoryInformation[]): Promise<HistoryInformation[]> {

        var finalinformation: HistoryInformation[] = JSON.parse(JSON.stringify(initialInformation));

        finalinformation = await HistoryController.sortInformation(finalinformation);
        finalinformation = await HistoryController.cleanFilled(ctx, finalinformation);

        return finalinformation;
    }


    private static async sortInformation(
        initialInformation : HistoryInformation[]): Promise<HistoryInformation[]> {

        var finalinformation: HistoryInformation[] = [];

        const dateMap: Map<string, HistoryInformation[]> = new Map();
        const keyArray: string[] = [];

        //Create date Map and key (date) List
        for (var information of initialInformation) {
            if (information.activationDocument) {
                const key = "".concat(information.activationDocument.startCreatedDateTime)
                    .concat("ZZZ")
                    .concat(information.activationDocument.endCreatedDateTime);
                var values: HistoryInformation[];
                if (!keyArray.includes(key)) {
                    values = [];
                    keyArray.push(key);
                } else {
                    values = dateMap.get(key);
                }
                values.push(information);
                dateMap.set(key, values);
            }
        }

        //Sort the Array by key (date)
        keyArray.sort();

        //Fill final information following the sorted list
        for (var key of keyArray) {
            const sortedInformationArray = dateMap.get(key);
            if (sortedInformationArray) {
                for (var information of sortedInformationArray) {
                    finalinformation.push(information);
                }
            }
        }

        return finalinformation;
    }

    private static async cleanFilled(
        ctx: Context,
        initialInformation : HistoryInformation[]): Promise<HistoryInformation[]> {

        const finalinformation: HistoryInformation[] = [];
        const embeddedInformation: string[] = [];

        //First the editable
        var remainingInformationStep1: HistoryInformation[] = [];
        for (var information of initialInformation) {
            if (information.site
                && information.producer
                && information.activationDocument
                && information.activationDocument.eligibilityStatusEditable) {

                finalinformation.push(information);

                embeddedInformation.push(information.activationDocument.activationDocumentMrid);
                if (information.subOrderList) {
                    for (var subOrder of information.subOrderList) {
                        embeddedInformation.push(subOrder.activationDocumentMrid);
                    }
                }
            } else {
                remainingInformationStep1.push(information);
            }
        }

        //Second the eligibility defined
        var remainingInformationStep2: HistoryInformation[] = [];
        for (var information of remainingInformationStep1) {
            //Not include ones already included
            if (information.activationDocument
                && !embeddedInformation.includes(information.activationDocument.activationDocumentMrid)) {

                if (information.activationDocument.eligibilityStatus
                    && information.activationDocument.eligibilityStatus !== "") {

                    finalinformation.push(information);

                    embeddedInformation.push(information.activationDocument.activationDocumentMrid);
                    if (information.subOrderList) {
                        for (var subOrder of information.subOrderList) {
                            embeddedInformation.push(subOrder.activationDocumentMrid);
                        }
                    }
                } else {
                    remainingInformationStep2.push(information);
                }
            }
        }

        //Third the information with reconciliation (even if no eligibility editable or filled)
        var remainingInformationStep3: HistoryInformation[] = [];
        for (var information of remainingInformationStep2) {
            //Not include ones already included
            if (information.activationDocument
                && !embeddedInformation.includes(information.activationDocument.activationDocumentMrid)) {

                if (information.subOrderList
                    && information.subOrderList.length > 0) {

                    finalinformation.push(information);

                    embeddedInformation.push(information.activationDocument.activationDocumentMrid);
                    if (information.subOrderList) {
                        for (var subOrder of information.subOrderList) {
                            embeddedInformation.push(subOrder.activationDocumentMrid);
                        }
                    }
                } else {
                    remainingInformationStep3.push(information);
                }
            }
        }

        //Fourth the last ones
        for (var information of remainingInformationStep3) {
            //Not include ones already included
            if (information.activationDocument
                && !embeddedInformation.includes(information.activationDocument.activationDocumentMrid)) {

                finalinformation.push(information);
            }
        }

        console.debug("_____________________")
        console.debug("_____________________")
        console.debug("_____________________")
        console.debug(JSON.stringify(finalinformation))
        console.debug("_____________________")
        console.debug("_____________________")
        console.debug("_____________________")


        return finalinformation;
    }




}
