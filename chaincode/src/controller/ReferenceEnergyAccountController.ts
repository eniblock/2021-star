import { Context } from 'fabric-contract-api';

import { OrganizationTypeMsp } from '../enums/OrganizationMspType';
import { EnergyAccount } from '../model/energyAccount';
import { Site } from '../model/site';
import { SystemOperator } from '../model/systemOperator';
import { STARParameters } from '../model/starParameters';

import { QueryStateService } from './service/QueryStateService';
import { SiteService } from './service/SiteService';
import { SystemOperatorService } from './service/SystemOperatorService';
import { ReferenceEnergyAccountService } from './service/ReferenceEnergyAccountService';
import { ParametersType } from '../enums/ParametersType';
import { DocType } from '../enums/DocType';

export class ReferenceEnergyAccountController {

    public static async createReferenceEnergyAccount(
        ctx: Context,
        params: STARParameters,
        inputStr: string) {
        console.info('============= START : Create ReferenceEnergyAccount ===========');

        const identity = params.values.get(ParametersType.IDENTITY);
        if (identity !== OrganizationTypeMsp.RTE) {
            throw new Error(`Organisation, ${identity} does not have write access for Reference Energy Account.`);
        }

        let energyObj: EnergyAccount;
        try {
            energyObj = JSON.parse(inputStr);
        } catch (error) {
            throw new Error(`ERROR createReferenceEnergyAccount-> Input string NON-JSON value`);
        }

        EnergyAccount.schema.validateSync(
            energyObj,
            {strict: true, abortEarly: false},
        );

        if (!energyObj.marketEvaluationPointMrid) {
            throw new Error(`ERROR createReferenceEnergyAccount, missing marketEvaluationPointMrid.`);
        } else if (!energyObj.processType) {
            throw new Error(`ERROR createReferenceEnergyAccount, missing processType.`);
        }

        let siteObj: Site;
        try {
            siteObj = await SiteService.getObj(ctx, params, energyObj.meteringPointMrid);
        } catch (error) {
            throw new Error('ERROR createReferenceEnergyAccount : '.concat(error.message).concat(` for Reference Energy Account ${energyObj.energyAccountMarketDocumentMrid} creation.`));
        }

        let systemOperatorObj: SystemOperator;
        try {
            systemOperatorObj = await SystemOperatorService.getObj(ctx, energyObj.senderMarketParticipantMrid);
        } catch (error) {
            throw new Error('ERROR createReferenceEnergyAccount : '.concat(error.message).concat(` for Reference Energy Account ${energyObj.energyAccountMarketDocumentMrid} creation.`));
        }

        if (!identity.toLowerCase().includes(systemOperatorObj.systemOperatorMarketParticipantName.toLowerCase())) {
            throw new Error(
                `Reference Energy Account, mismatch sender: ${identity} does not have write access for Reference Energy Account ${energyObj.energyAccountMarketDocumentMrid} creation.`,
            );
        }

        if (siteObj.systemOperatorMarketParticipantMrid !== energyObj.senderMarketParticipantMrid) {
            throw new Error(`Reference Energy Account, sender: ${energyObj.senderMarketParticipantMrid} is not the same as site.systemOperator: ${siteObj.systemOperatorMarketParticipantMrid} in EnergyAccount creation.`);
        }

        await ReferenceEnergyAccountService.write(ctx, params, energyObj);

        console.info(
            '============= END   : Create %s ReferenceEnergyAccount ===========',
            energyObj.energyAccountMarketDocumentMrid,
        );
    }

    public static async getReferenceEnergyAccountForSystemOperator(
            ctx: Context,
            params: STARParameters,
            meteringPointMrid: string,
            systemOperatorEicCode: string,
            startCreatedDateTime: string): Promise<string> {
        const identity = params.values.get(ParametersType.IDENTITY);
        if (identity !== OrganizationTypeMsp.RTE) {
            throw new Error(`Organisation, ${identity} does not have read access for Reference Energy Account.`);
        }

        const dateUp = new Date(startCreatedDateTime);

        dateUp.setUTCHours(0,0,0,0);
        // console.log('dateUp=', JSON.stringify(dateUp));
        const dateDown = new Date(dateUp.getTime() + 86399999);
        // console.log('dateDown=', JSON.stringify(dateDown));

        try {
            await SystemOperatorService.getObj(ctx, systemOperatorEicCode);
        } catch (error) {
            throw new Error('ERROR createReferenceEnergyAccount : '.concat(error.message));
        }

        var args: string[] = [];
        args.push(`"meteringPointMrid": "${meteringPointMrid}"`);
        args.push(`"createdDateTime":{"$gte":${JSON.stringify(dateUp)},"$lte":${JSON.stringify(dateDown)}}`);
        const query = await QueryStateService.buildQuery(DocType.REFERENCE_ENERGY_ACCOUNT, args, [`"createdDateTime":"desc"`]);

        // const query = `{
        //     "selector":
        //     {
        //         "docType": "referenceEnergyAccount",
        //         "meteringPointMrid": "${meteringPointMrid}",
        //         "createdDateTime": {
        //             "$gte": ${JSON.stringify(dateUp)},
        //             "$lte": ${JSON.stringify(dateDown)}
        //         },
        //         "sort": [{
        //             "createdDateTime" : "desc"
        //         }]
        //     }
        // }`;

        const allResults = await ReferenceEnergyAccountService.getQueryStringResult(ctx, params, query);
        return allResults;
    }

    public static async getReferenceEnergyAccountByProducer(
        ctx: Context,
        params: STARParameters,
        meteringPointMrid: string,
        producerEicCode: string,
        startCreatedDateTime: string): Promise<string> {

        const identity = params.values.get(ParametersType.IDENTITY);
        if (identity !== OrganizationTypeMsp.PRODUCER) {
            throw new Error(`Organisation, ${identity} does not have read access for producer's Reference Energy Account.`);
        }
        const dateUp = new Date(startCreatedDateTime);

        dateUp.setUTCHours(0,0,0,0);
        // console.log('dateUp=', JSON.stringify(dateUp));
        const dateDown = new Date(dateUp.getTime() + 86399999);
        // console.log('dateDown=', JSON.stringify(dateDown));

        var args: string[] = [];
        args.push(`"meteringPointMrid": "${meteringPointMrid}"`);
        args.push(`"receiverMarketParticipantMrid": "${producerEicCode}"`);
        args.push(`"createdDateTime":{"$gte":${JSON.stringify(dateUp)},"$lte":${JSON.stringify(dateDown)}}`);
        const query = await QueryStateService.buildQuery(DocType.REFERENCE_ENERGY_ACCOUNT, args, [`"createdDateTime":"desc"`]);

        // const query = `{
        //         "selector":
        //         {
        //             "docType": "referenceEnergyAccount",
        //             "meteringPointMrid": "${meteringPointMrid}",
        //             "receiverMarketParticipantMrid": "${producerEicCode}",
        //             "createdDateTime": {
        //                 "$gte": ${JSON.stringify(dateUp)},
        //                 "$lte": ${JSON.stringify(dateDown)}
        //             },
        //             "sort": [{
        //                 "createdDateTime" : "desc"
        //             }]
        //         }
        //     }`;

        const allResults = await ReferenceEnergyAccountService.getQueryStringResult(ctx, params, query);
        return allResults;
    }
}
