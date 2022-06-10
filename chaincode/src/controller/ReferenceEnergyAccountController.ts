import { Context } from 'fabric-contract-api';

import { OrganizationTypeMsp } from '../enums/OrganizationMspType';
import { EnergyAccount } from '../model/energyAccount';
import { Site } from '../model/site';
import { SystemOperator } from '../model/systemOperator';
import { Parameters } from '../model/parameters';

import { HLFServices } from './service/HLFservice';
import { QueryStateService } from './service/QueryStateService';
import { SiteService } from './service/SiteService';

export class ReferenceEnergyAccountController {

    public static async createReferenceEnergyAccount(
        ctx: Context,
        params: Parameters,
        inputStr: string) {
        console.info('============= START : Create ReferenceEnergyAccount ===========');

        const identity = await HLFServices.getMspID(ctx);
        if (identity !== OrganizationTypeMsp.RTE) {
            throw new Error(`Organisation, ${identity} does not have write access for Reference Energy Account.`);
        }

        let energyObj: EnergyAccount;
        try {
            energyObj = JSON.parse(inputStr);
        } catch (error) {
            throw new Error(`ERROR createReferenceEnergyAccount-> Input string NON-JSON value`);
        }

        const energyAccountInput = EnergyAccount.schema.validateSync(
            energyObj,
            {strict: true, abortEarly: false},
        );

        if (!energyAccountInput.marketEvaluationPointMrid) {
            throw new Error(`ERROR createReferenceEnergyAccount, missing marketEvaluationPointMrid.`);
        } else if (!energyAccountInput.processType) {
            throw new Error(`ERROR createReferenceEnergyAccount, missing processType.`);
        }

        let siteAsBytes : Uint8Array
        try {
            siteAsBytes = await SiteService.getRaw(ctx, params, energyAccountInput.meteringPointMrid);
        } catch(error) {
            throw new Error(`Site : ${energyAccountInput.meteringPointMrid} does not exist for Reference Energy Account ${energyAccountInput.energyAccountMarketDocumentMrid} creation.`);
        }

        let siteObj: Site;
        try {
            siteObj = JSON.parse(siteAsBytes.toString());
        } catch (error) {
            throw new Error(`ERROR createReferenceEnergyAccount getSite-> Input string NON-JSON value`);
        }

        const systemOperatorAsBytes = await ctx.stub.getState(energyAccountInput.senderMarketParticipantMrid);
        if (!systemOperatorAsBytes || systemOperatorAsBytes.length === 0) {
            throw new Error(
                `System Operator : ${energyAccountInput.senderMarketParticipantMrid} does not exist for Reference Energy Account ${energyAccountInput.energyAccountMarketDocumentMrid} creation.`,
            );
        }

        let systemOperatorObj: SystemOperator;
        try {
            systemOperatorObj = JSON.parse(systemOperatorAsBytes.toString());
        } catch (error) {
            throw new Error(`ERROR createReferenceEnergyAccount getSystemOperator-> Input string NON-JSON value`);
        }
        if (!identity.toLowerCase().includes(systemOperatorObj.systemOperatorMarketParticipantName.toLowerCase())) {
            throw new Error(
                `Reference Energy Account, mismatch sender: ${identity} does not have write access for ${energyAccountInput.energyAccountMarketDocumentMrid} creation.`,
            );
        }

        if (siteObj.systemOperatorMarketParticipantMrid !== energyAccountInput.senderMarketParticipantMrid) {
            throw new Error(`Reference Energy Account, sender: ${energyAccountInput.senderMarketParticipantMrid} is not the same as site.systemOperator: ${siteObj.systemOperatorMarketParticipantMrid} in EnergyAccount creation.`);
        }

        energyAccountInput.docType = 'referenceEnergyAccount';

        await ctx.stub.putState(
            energyAccountInput.energyAccountMarketDocumentMrid,
            Buffer.from(JSON.stringify(energyAccountInput)),
        );
        console.info(
            '============= END   : Create %s ReferenceEnergyAccount ===========',
            energyAccountInput.energyAccountMarketDocumentMrid,
        );
    }

    public static async getReferenceEnergyAccountForSystemOperator(
            ctx: Context,
            meteringPointMrid: string,
            systemOperatorEicCode: string,
            startCreatedDateTime: string): Promise<string> {
        const identity = await HLFServices.getMspID(ctx);
        if (identity !== OrganizationTypeMsp.RTE) {
            throw new Error(`Organisation, ${identity} does not have read access for Reference Energy Account.`);
        }

        const dateUp = new Date(startCreatedDateTime);
        // console.log(meteringPointMrid);
        // console.log(startCreatedDateTime);
        // console.log('new date=', new Date('2021-10-21T23:59:50.999Z'));
        // console.log ('datesetmili=', dateUp.setUTCMilliseconds(0));
        // console.log ('datesetsec=', dateUp.setUTCSeconds(0));
        // console.log ('datesetmin=', dateUp.setUTCMinutes(0));
        // console.log ('datesethour=', dateUp.setUTCHours(0));
        // console.log ('datetmptime=', dateUp.getTime());

        dateUp.setUTCMilliseconds(0);
        dateUp.setUTCSeconds(0);
        dateUp.setUTCMinutes(0);
        dateUp.setUTCHours(0);
        // console.log('dateUp=', dateUp);
        // console.log('dateUp=', JSON.stringify(dateUp));
        const dateDown = new Date(dateUp.getTime() + 86399999);
        // console.log('dateDown=', dateDown);
        // console.log('dateDown=', JSON.stringify(dateDown));

        const systemOperatorAsBytes = await ctx.stub.getState(systemOperatorEicCode);
        if (!systemOperatorAsBytes || systemOperatorAsBytes.length === 0) {
            throw new Error(
                `System Operator : ${systemOperatorEicCode} does not exist for Reference Energy Account read.`,
            );
        }

        let systemOperatorObj: SystemOperator;
        try {
            systemOperatorObj = JSON.parse(systemOperatorAsBytes.toString());
        } catch (error) {
            throw new Error(`ERROR createReferenceEnergyAccount getSystemOperator-> Input string NON-JSON value`);
        }
        const query = `{
            "selector":
            {
                "docType": "referenceEnergyAccount",
                "meteringPointMrid": "${meteringPointMrid}",
                "createdDateTime": {
                    "$gte": ${JSON.stringify(dateUp)},
                    "$lte": ${JSON.stringify(dateDown)}
                },
                "sort": [{
                    "createdDateTime" : "desc"
                }]
            }
        }`;

        const allResults = QueryStateService.getQueryStringResult(ctx, query);
        return allResults;
    }

    public static async getReferenceEnergyAccountByProducer(
        ctx: Context,
        meteringPointMrid: string,
        producerEicCode: string,
        startCreatedDateTime: string): Promise<string> {

        const identity = await HLFServices.getMspID(ctx);
        if (identity !== OrganizationTypeMsp.PRODUCER) {
            throw new Error(`Organisation, ${identity} does not have read access for producer's Reference Energy Account.`);
        }
        const dateUp = new Date(startCreatedDateTime);
        // console.log(meteringPointMrid);
        // console.log(startCreatedDateTime);
        // console.log('new date=', new Date('2021-10-21T23:59:50.999Z'));
        // console.log ('datesetmili=', dateUp.setUTCMilliseconds(0));
        // console.log ('datesetsec=', dateUp.setUTCSeconds(0));
        // console.log ('datesetmin=', dateUp.setUTCMinutes(0));
        // console.log ('datesethour=', dateUp.setUTCHours(0));
        // console.log ('datetmptime=', dateUp.getTime());

        dateUp.setUTCMilliseconds(0);
        dateUp.setUTCSeconds(0);
        dateUp.setUTCMinutes(0);
        dateUp.setUTCHours(0);
        // console.log('dateUp=', dateUp);
        // console.log('dateUp=', JSON.stringify(dateUp));
        const dateDown = new Date(dateUp.getTime() + 86399999);
        // console.log('dateDown=', dateDown);
        // console.log('dateDown=', JSON.stringify(dateDown));

        const query = `{
                "selector":
                {
                    "docType": "referenceEnergyAccount",
                    "meteringPointMrid": "${meteringPointMrid}",
                    "receiverMarketParticipantMrid": "${producerEicCode}",
                    "createdDateTime": {
                        "$gte": ${JSON.stringify(dateUp)},
                        "$lte": ${JSON.stringify(dateDown)}
                    },
                    "sort": [{
                        "createdDateTime" : "desc"
                    }]
                }
            }`;

        const allResults = QueryStateService.getQueryStringResult(ctx, query);
        return allResults;
    }
}
