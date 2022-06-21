import { Context } from 'fabric-contract-api';

import { OrganizationTypeMsp } from '../enums/OrganizationMspType';

import { EnergyAccount } from '../model/energyAccount';
import { Site } from '../model/site';
import { SystemOperator } from '../model/systemOperator';
import { STARParameters } from '../model/starParameters';

import { QueryStateService } from './service/QueryStateService';
import { SiteService } from './service/SiteService';
import { DocType } from '../enums/DocType';
import { ParametersType } from '../enums/ParametersType';
import { EnergyAccountService } from './service/EnergyAccountService';
import { SystemOperatorService } from './service/SystemOperatorService';

export class EnergyAccountController {

    public static async createEnergyAccount(
        ctx: Context,
        params: STARParameters,
        inputStr: string) {
        console.info('============= START : Create EnergyAccount ===========');

        const energyAccount:EnergyAccount = await EnergyAccountController.checkEnergyAccount(ctx, params, inputStr);

        await EnergyAccountService.write(ctx, params, energyAccount);

        console.info(
            '============= END   : Create %s EnergyAccount ===========',
            energyAccount.energyAccountMarketDocumentMrid,
        );
    }


    public static async updateEnergyAccount(
        ctx: Context,
        params: STARParameters,
        inputStr: string) {
        console.info('============= START : Update EnergyAccount ===========');

        const energyAccount:EnergyAccount = await EnergyAccountController.checkEnergyAccount(ctx, params, inputStr);

        //Check existence
        try {
            await EnergyAccountService.getRaw(ctx, params, energyAccount.energyAccountMarketDocumentMrid);
        } catch(error) {
            throw new Error(error.message.concat(` Can not be updated.`));
        }

        await EnergyAccountService.write(ctx, params, energyAccount);

        console.info(
            '============= END   : Update %s EnergyAccount ===========',
            energyAccount.energyAccountMarketDocumentMrid,
        );
    }




    private static async checkEnergyAccount(
        ctx: Context,
        params: STARParameters,
        inputStr: string): Promise<EnergyAccount>{

        const identity = params.values.get(ParametersType.IDENTITY);
        if (identity !== OrganizationTypeMsp.RTE && identity !== OrganizationTypeMsp.ENEDIS) {
            throw new Error(`Organisation, ${identity} does not have write access for Energy Account.`);
        }

        let energyObj: EnergyAccount;
        try {
            energyObj = JSON.parse(inputStr);
        } catch (error) {
            throw new Error(`ERROR createEnergyAccount-> Input string NON-JSON value`);
        }

        EnergyAccount.schema.validateSync(
            energyObj,
            {strict: true, abortEarly: false},
        );

        let siteObj: Site;
        try {
            siteObj = await SiteService.getObj(ctx, params, energyObj.meteringPointMrid);
        } catch (error) {
            throw new Error('ERROR createEnergyAccount : '.concat(error.message).concat(` for Energy Account ${energyObj.energyAccountMarketDocumentMrid} creation.`));
        }

        let systemOperatorObj: SystemOperator;
        try {
            systemOperatorObj = await SystemOperatorService.getObj(ctx, energyObj.senderMarketParticipantMrid);
        } catch (error) {
            throw new Error('ERROR createEnergyAccount : '.concat(error.message).concat(` for Energy Account ${energyObj.energyAccountMarketDocumentMrid} creation.`));
        }

        if (!identity.toLowerCase().includes(systemOperatorObj.systemOperatorMarketParticipantName.toLowerCase())) {
            throw new Error(
                `Energy Account, sender: ${identity} does not have write access for ${energyObj.energyAccountMarketDocumentMrid}. (Wrong SystemOperator)`,
            );
        }

        if (siteObj.systemOperatorMarketParticipantMrid !== energyObj.senderMarketParticipantMrid) {
            throw new Error(`Energy Account, sender: ${energyObj.senderMarketParticipantMrid} does is not the same as site.systemOperator: ${siteObj.systemOperatorMarketParticipantMrid} in EnergyAccount.`);
        }

        if (identity === OrganizationTypeMsp.RTE && !energyObj.marketEvaluationPointMrid) {
            throw new Error(`Energy Account, missing marketEvaluationPointMrid optionnal for HTA but required for HTB in EnergyAccount.`);
        } else if (identity === OrganizationTypeMsp.ENEDIS && energyObj.marketEvaluationPointMrid) {
            throw new Error(`Energy Account, presence of marketEvaluationPointMrid optionnal for HTA but required for HTB in EnergyAccount.`);
        }

        energyObj.docType = DocType.ENERGY_ACCOUNT;
        return energyObj;
    }





    public static async getEnergyAccountForSystemOperator(
            ctx: Context,
            params: STARParameters,
            meteringPointMrid: string,
            systemOperatorEicCode: string,
            startCreatedDateTime: string): Promise<string> {

        const identity = params.values.get(ParametersType.IDENTITY);
        if (identity !== OrganizationTypeMsp.RTE && identity !== OrganizationTypeMsp.ENEDIS) {
            throw new Error(`Organisation, ${identity} does not have read access for Energy Account.`);
        }

        const dateUp = new Date(startCreatedDateTime);

        dateUp.setUTCHours(0,0,0,0);
        // console.log('dateUp=', JSON.stringify(dateUp));
        const dateDown = new Date(dateUp.getTime() + 86399999);
        // console.log('dateDown=', JSON.stringify(dateDown));

        let systemOperatorObj: SystemOperator;
        try {
            systemOperatorObj = await SystemOperatorService.getObj(ctx, systemOperatorEicCode);
        } catch (error) {
            throw new Error('ERROR getEnergyAccountForSystemOperator : '.concat(error.message).concat(` for Energy Account read.`));
        }

        if (!identity.toLowerCase().includes(systemOperatorObj.systemOperatorMarketParticipantName.toLowerCase())) {
            throw new Error(
                `Energy Account, sender: ${identity} does not provide his own systemOperatorEicCode therefore he does not have read access.`,
            );
        }
        // let query;

        var args: string[] = [];
        args.push(`"meteringPointMrid": "${meteringPointMrid}"`);
        args.push(`"createdDateTime":{"$gte":${JSON.stringify(dateUp)},"$lte": ${JSON.stringify(dateDown)}}`);

        if (identity !== OrganizationTypeMsp.RTE) {
            args.push(`"senderMarketParticipantMrid": "${systemOperatorEicCode}"`);
        }

        // if (identity === OrganizationTypeMsp.RTE) {
        //     query = `{
        //         "selector":
        //         {
        //             "docType": "energyAccount",
        //             "meteringPointMrid": "${meteringPointMrid}",
        //             "createdDateTime": {
        //                 "$gte": ${JSON.stringify(dateUp)},
        //                 "$lte": ${JSON.stringify(dateDown)}
        //             },
        //             "sort": [{
        //                 "createdDateTime" : "desc"
        //             }]
        //         }
        //     }`;
        // } else {
        //     query = `{
        //         "selector":
        //         {
        //             "docType": "energyAccount",
        //             "meteringPointMrid": "${meteringPointMrid}",
        //             "senderMarketParticipantMrid": "${systemOperatorEicCode}",
        //             "createdDateTime": {
        //                 "$gte": ${JSON.stringify(dateUp)},
        //                 "$lte": ${JSON.stringify(dateDown)}
        //             },
        //             "sort": [{
        //                 "createdDateTime" : "desc"
        //             }]
        //         }
        //     }`;
        // }

        const query = await QueryStateService.buildQuery(DocType.ENERGY_ACCOUNT, args, [`"createdDateTime":"desc"`]);


        return await EnergyAccountService.getQueryStringResult(ctx, params, query);
    }





    public static async getEnergyAccountByQuery(
        ctx: Context,
        params: STARParameters,
        query: string): Promise<any> {

            const identity = params.values.get(ParametersType.IDENTITY);
        if (identity !== OrganizationTypeMsp.RTE && identity !== OrganizationTypeMsp.ENEDIS) {
            throw new Error(`Organisation, ${identity} does not have read access for Energy Account.`);
        }

        let results = await EnergyAccountService.getQueryArrayResult(ctx, params, query);
        return results;
    }





    public static async getEnergyAccountByProducer(
        ctx: Context,
        params: STARParameters,
        meteringPointMrid: string,
        producerEicCode: string,
        startCreatedDateTime: string): Promise<string> {

        const identity = params.values.get(ParametersType.IDENTITY);
        if (identity !== OrganizationTypeMsp.PRODUCER) {
            throw new Error(`Organisation, ${identity} does not have read access for producer's Energy Account.`);
        }
        const dateUp = new Date(startCreatedDateTime);

        dateUp.setUTCHours(0,0,0,0);
        // console.log('dateUp=', JSON.stringify(dateUp));
        const dateDown = new Date(dateUp.getTime() + 86399999);
        // console.log('dateDown=', JSON.stringify(dateDown));

        var args: string[] = [];
        args.push(`"meteringPointMrid":"${meteringPointMrid}"`);
        args.push(`"receiverMarketParticipantMrid":"${producerEicCode}"`);
        args.push(`"createdDateTime":{"$gte":${JSON.stringify(dateUp)},"$lte":${JSON.stringify(dateDown)}}`);
        const query = await QueryStateService.buildQuery(DocType.ENERGY_ACCOUNT, args, [`"createdDateTime":"desc"`]);

        // const query = `{
        //         "selector":
        //         {
        //             "docType": "energyAccount",
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

        return await EnergyAccountService.getQueryStringResult(ctx, params, query);
    }
}
