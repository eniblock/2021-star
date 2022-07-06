import {Context} from "fabric-contract-api";

import { DocType } from "../enums/DocType";
import { ParametersType } from "../enums/ParametersType";
import { RoleType } from "../enums/RoleType";

import { ActivationDocument } from "../model/activationDocument";
import { HistoryCriteria } from "../model/historyCriteria";
import { HistoryInformation } from "../model/historyInformation";
import { Site } from "../model/site";
import { STARParameters } from "../model/starParameters";

import { ActivationDocumentController } from "./ActivationDocumentController";
import { EnergyAmountController } from "./EnergyAmountController";

import { ActivationDocumentService } from "./service/ActivationDocumentService";
import { HLFServices } from "./service/HLFservice";
import { ProducerService } from "./service/ProducerService";
import { QueryStateService } from "./service/QueryStateService";
import { SiteService } from "./service/SiteService";

export class HistoryActivationController {

    public static async getHistoryByQuery(
        ctx: Context,
        params: STARParameters,
        inputStr: string): Promise<HistoryInformation[]> {

        let criteriaObj: HistoryCriteria;
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
        criteriaObj = await HistoryActivationController.consolidateCriteria(ctx, params, criteriaObj, role);


        var result : HistoryInformation[];
        if (criteriaObj) {
            const query = await HistoryActivationController.buildActivationDocumentQuery(criteriaObj);

            const collections: string[] = await HLFServices.getCollectionsFromParameters(params, ParametersType.ACTIVATION_DOCUMENT, ParametersType.ALL);

            const allActivationDocument: ActivationDocument[] = await ActivationDocumentService.getQueryArrayResult(ctx, params, query, collections);
            result = await HistoryActivationController.consolidate(ctx, params, allActivationDocument);
        }

        return result;
    }

    private static async consolidateCriteria(
        ctx: Context,
        params: STARParameters,
        criteriaObj: HistoryCriteria,
        role: string): Promise<HistoryCriteria> {

        var args: string[] = [];

        if (criteriaObj) {
            if (criteriaObj.registeredResourceMrid) {
                args.push(`"meteringPointMrid":"${criteriaObj.registeredResourceMrid}"`);
            }
            if (criteriaObj.originAutomationRegisteredResourceMrid) {
                args.push(`"substationMrid":"${criteriaObj.originAutomationRegisteredResourceMrid}"`);
            }
            if (criteriaObj.producerMarketParticipantMrid
                && (role === RoleType.Role_DSO || role === RoleType.Role_TSO) ) {
                args.push(`"producerMarketParticipantMrid":"${criteriaObj.producerMarketParticipantMrid}"`);
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
                if (site.meteringPointMrid === criteriaObj.originAutomationRegisteredResourceMrid
                    || site.producerMarketParticipantMrid === criteriaObj.producerMarketParticipantMrid
                    || site.siteName == criteriaObj.siteName) {
                        criteriaObj.originAutomationRegisteredResourceList.push(site.meteringPointMrid);
                        criteriaObj.registeredResourceList.push(site.meteringPointMrid);
                }
            }
        }

        if (criteriaObj.originAutomationRegisteredResourceMrid) {
            criteriaObj.originAutomationRegisteredResourceList.push(criteriaObj.originAutomationRegisteredResourceMrid);
        }
        if (criteriaObj.registeredResourceMrid) {
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
            }
            if (criteriaObj.registeredResourceList
                && criteriaObj.registeredResourceList.length > 0) {
                const registeredResourceList_str = JSON.stringify(criteriaObj.registeredResourceList);
                criteriaPlace.push(`"registeredResourceMrid": { "$in" : ${registeredResourceList_str} }`);
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
            if (criteriaObj.startCreatedDateTime) {
                args.push(`"$or":[{"startCreatedDateTime":{"$lte": ${JSON.stringify(criteriaObj.endCreatedDateTime)}}},{"startCreatedDateTime":""},{"startCreatedDateTime":{"$exists": false}}]`);
            }
            if (criteriaObj.endCreatedDateTime) {
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

        for (const activationDocument of allActivationDocument) {
            const information: HistoryInformation = new HistoryInformation();
            information.activationDocument = JSON.parse(JSON.stringify(activationDocument));

            information.subOrderList = [];
            if (activationDocument.subOrderList) {
                for(const activationDocumentMrid of activationDocument.subOrderList) {
                    var subOrder: ActivationDocument;
                    try {
                        subOrder = await ActivationDocumentController.getActivationDocumentById(ctx, params, activationDocumentMrid);
                    } catch(error) {
                        //do nothing, but empty document : suborder information is not in accessible collection
                        subOrder = {
                            activationDocumentMrid: activationDocumentMrid,
                            originAutomationRegisteredResourceMrid: 'Not accessible information',
                            registeredResourceMrid: 'Not accessible information',
                            measurementUnitName: 'Not accessible information',
                            messageType: 'Not accessible information',
                            businessType: 'Not accessible information',
                            orderEnd: false,
                            senderMarketParticipantMrid: 'Not accessible information',
                            receiverMarketParticipantMrid: 'Not accessible information'
                        }
                    }
                    information.subOrderList.push(subOrder);
                }
            }
            //Manage Yello Page to get Site Information
            var siteRegistered: Site;
            try {
                siteRegistered = await SiteService.getObj(ctx, params, activationDocument.registeredResourceMrid);
            } catch (error) {
                //DO nothing
            }
            // var siteAutomation: Site;
            // try {
            //     siteAutomation = await SiteService.getObj(ctx, params, activationDocument.originAutomationRegisteredResourceMrid);
            // } catch (error) {
            //     //DO nothing
            // }
            // if (siteRegistered && siteRegistered.meteringPointMrid) {
                information.site = JSON.parse(JSON.stringify(siteRegistered));
            // } else if (siteAutomation && siteAutomation.meteringPointMrid) {
            //     information.site = JSON.parse(JSON.stringify(siteAutomation));
            // }

            try {
                information.producer = await ProducerService.getObj(ctx, information.site.producerMarketParticipantMrid);
            } catch (error) {
                //DO nothing
            }
            try {
                information.energyAmount = await EnergyAmountController.getEnergyAmountByActivationDocument(ctx, params, information.activationDocument.activationDocumentMrid);
            } catch (error) {
                //DO nothing
            }
            informationList.push(information);
        }

        return informationList;
    }

}
