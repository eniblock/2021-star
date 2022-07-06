import { Context } from 'fabric-contract-api';

import { OrganizationTypeMsp } from '../enums/OrganizationMspType';

import { ActivationDocument } from '../model/activationDocument';
import { EnergyAmount } from '../model/energyAmount';
import { SystemOperator } from '../model/systemOperator';
import { STARParameters } from '../model/starParameters';

import { QueryStateService } from './service/QueryStateService';
import { SiteService } from './service/SiteService';
import { DocType } from '../enums/DocType';
import { EnergyAmountService } from './service/EnergyAmountService';
import { ActivationDocumentController } from './ActivationDocumentController';
import { ParametersType } from '../enums/ParametersType';
import { EnergyType } from '../enums/EnergyType';
import { SystemOperatorService } from './service/SystemOperatorService';

export class EnergyAmountController {

    private static async checkEnergyAmout(
        ctx: Context,
        params: STARParameters,
        inputStr: string,
        energyType: EnergyType,
        checkSite: boolean = false) : Promise<EnergyAmount> {

        let energyObj: EnergyAmount;
        try {
            energyObj = JSON.parse(inputStr);
        } catch (error) {
            throw new Error(`ERROR manage EnergyAmount-> Input string NON-JSON value`);
        }

        EnergyAmount.schema.validateSync(
            energyObj,
            {strict: true, abortEarly: false},
        );

        let orderObj: ActivationDocument;
        try {
            orderObj = await ActivationDocumentController.getActivationDocumentById(ctx, params, energyObj.activationDocumentMrid);
        } catch(error) {
            throw new Error(error.message.concat(` for Energy Amount ${energyObj.energyAmountMarketDocumentMrid} creation.`));
        }

        if (checkSite && energyObj.registeredResourceMrid && energyObj.registeredResourceMrid !== "") {
            try {
                await SiteService.getObj(ctx, params, energyObj.registeredResourceMrid);
            } catch(error) {
                throw new Error(error.message.concat(` for Energy Amount ${energyObj.energyAmountMarketDocumentMrid} creation.`));
            }

            if (orderObj.registeredResourceMrid !== energyObj.registeredResourceMrid) {
                throw new Error(`ERROR manage EnergyAmount mismatch beetween registeredResourceMrid in Activation Document : ${orderObj.registeredResourceMrid} and Energy Amount : ${energyObj.registeredResourceMrid}.`);
            }
        }

        // console.log('energyAmountInput.timeInterval=', energyAmountInput.timeInterval);
        const strSplitted = energyObj.timeInterval.split('/', 2);
        const begin = strSplitted[0];
        const end = strSplitted[1];
        // console.log('strSplitted=', strSplitted);

        const dateBegin = new Date(begin.trim());
        // console.log('dateBegin=', dateBegin);
        dateBegin.setUTCHours(0,0,0,0);

        // console.log('dateBegin=', dateBegin);

        // const dateEnd = new Date(end.trim());
        // // console.log('dateEnd=', dateEnd);
        // dateEnd.setUTCHours(0,0,0,0);

        // console.log('dateEnd=', dateEnd);

        const orderDateStart = new Date(orderObj.startCreatedDateTime);
        orderDateStart.setUTCHours(0,0,0,0);
        // console.log('orderDateStart=', orderDateStart);

        // console.log(JSON.stringify(dateBegin));
        // console.log(JSON.stringify(dateEnd));
        if (JSON.stringify(dateBegin) !== JSON.stringify(orderDateStart)) {
            throw new Error(`ERROR manage EnergyAmount mismatch between ${energyType} : ${JSON.stringify(dateBegin)} and Activation Document : ${JSON.stringify(orderDateStart)} dates.`);
        }

        return energyObj;
    }
//      ================STAR-425 : Partie du code en commentaire car on utilise pas les clés composites===========================

//         const keySplitted = energyObj.activationDocumentMrid.split('/', 4);
//         console.log(keySplitted);
//
//         const query = `{
//             "selector":
//             {
//                 "docType": "${DocType.ACTIVATION_DOCUMENT}",
//                 "originAutomationRegisteredResourceMrid": "${keySplitted[0]}",
//                 "registeredResourceMrid": "${keySplitted[1]}",
//                 "startCreatedDateTime": "${keySplitted[2]}",
//                 "endCreatedDateTime": "${keySplitted[3]}"
//             }
//         }`;
//         console.log(query);
//         const allResults = await QueryStateService.getQueryArrayResult(ctx, query);
//         let orderObj: ActivationDocument;
//         orderObj = allResults[0];

//      =========================================================================================================================
/*
        // const orderAsBytes = await ctx.stub.getState(energyAmountInput.activationDocumentMrid);
        // if (!orderAsBytes || orderAsBytes.length === 0) {
        //     throw new Error(`
        // ActivationDocument :
        ${energyAmountInput.activationDocumentMrid} does not exist for Energy Amount
        ${energyAmountInput.energyAmountMarketDocumentMrid} creation.`);
        // }

        // let orderObj: ActivationDocument;
        // try {
        //     orderObj = JSON.parse(orderAsBytes.toString());
        // } catch (error) {
        //     throw new Error(`ERROR createDSOEnergyAmount getActivationDocument-> Input string NON-JSON value`);
        // }

        // const siteAsBytes = await ctx.stub.getState(orderObj.registeredResourceMrid);
        // if (!siteAsBytes || siteAsBytes.length === 0) {
        //     throw new Error(`
        // Site : ${orderObj.registeredResourceMrid}
        does not exist in Activation Document :
        ${energyAmountInput.activationDocumentMrid}
        for Energy Amount : ${energyAmountInput.energyAmountMarketDocumentMrid} creation.`);
        // }

        // let siteObj: Site;
        // try {
        //     siteObj = JSON.parse(siteAsBytes.toString());
        // } catch (error) {
        //     throw new Error(`ERROR createDSOEnergyAmount getSite-> Input string NON-JSON value`);
        // }

        // if (orderObj.registeredResourceMrid !== energyAmountInput.registeredResourceMrid) {
        //     throw new Error(
            // `ERROR createDSOEnergyAmount mismatch beetween
            registeredResourceMrid in Activation Document :
            ${orderObj.registeredResourceMrid} and Energy Amount :
            ${energyAmountInput.registeredResourceMrid}.`);
        // }
  */









    public static async createTSOEnergyAmount(
        ctx: Context,
        params: STARParameters,
        inputStr: string) {
        console.info('============= START : createTSOEnergyAmount EnergyAmountController ===========');

        const identity = params.values.get(ParametersType.IDENTITY);
        if (identity !== OrganizationTypeMsp.RTE) {
            throw new Error(`Organisation, ${identity} does not have write access for Energy Amount.`);
        }

        const energyObj: EnergyAmount = await EnergyAmountController.checkEnergyAmout(ctx, params, inputStr, EnergyType.ENE);

        await EnergyAmountService.write(ctx, params, energyObj);

        console.info('============= END   : createTSOEnergyAmount %s EnergyAmountController ===========',
            energyObj.energyAmountMarketDocumentMrid,
        );
    }



    public static async updateTSOEnergyAmount(
        ctx: Context,
        params: STARParameters,
        inputStr: string) {
        console.info('============= START : updateTSOEnergyAmount EnergyAmountController ===========');

        const identity = params.values.get(ParametersType.IDENTITY);
        if (identity !== OrganizationTypeMsp.RTE) {
            throw new Error(`Organisation, ${identity} does not have write access for Energy Amount.`);
        }

        const energyObj: EnergyAmount = await EnergyAmountController.checkEnergyAmout(ctx, params, inputStr, EnergyType.ENE);

        //Check existence
        try {
            await EnergyAmountService.getRaw(ctx, params, energyObj.energyAmountMarketDocumentMrid);
        } catch(error) {
            throw new Error(error.message.concat(` Can not be updated.`));
        }

        await EnergyAmountService.write(ctx, params, energyObj);

        console.info('============= END   : updateTSOEnergyAmount %s EnergyAmountController ===========',
            energyObj.energyAmountMarketDocumentMrid,
        );
    }





    public static async createDSOEnergyAmount(
        ctx: Context,
        params: STARParameters,
        inputStr: string) {
        console.info('============= START : createDSOEnergyAmount EnergyAmountController ===========');

        const identity = params.values.get(ParametersType.IDENTITY);
        if (identity !== OrganizationTypeMsp.ENEDIS) {
            throw new Error(`Organisation, ${identity} does not have write access for Energy Amount.`);
        }

        const energyObj: EnergyAmount = await EnergyAmountController.checkEnergyAmout(ctx, params, inputStr, EnergyType.ENI, true);

        await EnergyAmountService.write(ctx, params, energyObj);

        console.info('============= END   : createDSOEnergyAmount %s EnergyAmountController ===========',
            energyObj.energyAmountMarketDocumentMrid,
        );
    }





    public static async updateDSOEnergyAmount(
        ctx: Context,
        params: STARParameters,
        inputStr: string) {
        console.info('============= START : updateDSOEnergyAmount EnergyAmountController ===========');

        const identity = params.values.get(ParametersType.IDENTITY);
        if (identity !== OrganizationTypeMsp.ENEDIS) {
            throw new Error(`Organisation, ${identity} does not have write access for Energy Amount.`);
        }

        const energyObj: EnergyAmount = await EnergyAmountController.checkEnergyAmout(ctx, params, inputStr, EnergyType.ENI, true);

        //Check existence
        try {
            await EnergyAmountService.getRaw(ctx, params, energyObj.energyAmountMarketDocumentMrid);
        } catch(error) {
            throw new Error(error.message.concat(` Can not be updated.`));
        }

        await EnergyAmountService.write(ctx, params, energyObj);

        console.info('============= END   : updateDSOEnergyAmount %s EnergyAmountController ===========',
            energyObj.energyAmountMarketDocumentMrid,
        );
    }




    public static async getEnergyAmountForSystemOperator(
            ctx: Context,
            params: STARParameters,
            registeredResourceMrid: string,
            systemOperatorEicCode: string,
            startCreatedDateTime: string): Promise<string> {

        const identity = params.values.get(ParametersType.IDENTITY);
        if (identity !== OrganizationTypeMsp.RTE && identity !== OrganizationTypeMsp.ENEDIS) {
            throw new Error(`Organisation, ${identity} does not have read access for Energy Amount.`);
        }

        const dateUp = new Date(startCreatedDateTime);

        dateUp.setUTCHours(0,0,0,0);
        const dateDown = new Date(dateUp.getTime() + 86399999);

        let systemOperatorObj: SystemOperator;
        try {
            systemOperatorObj = await SystemOperatorService.getObj(ctx, systemOperatorEicCode);
        } catch (error) {
            throw new Error('ERROR getEnergyAmountForSystemOperator : '.concat(error.message).concat(` for Energy Amount read.`));
        }

        if (!identity.toLowerCase().includes(systemOperatorObj.systemOperatorMarketParticipantName.toLowerCase())) {
            throw new Error(
                `Energy Amount, sender: ${identity} does not provide his own systemOperatorEicCode therefore he does not have read access.`,
            );
        }

        var args: string[] = [];
        args.push(`"registeredResourceMrid":"${registeredResourceMrid}"`);
        args.push(`"senderMarketParticipantMrid":"${systemOperatorEicCode}"`);
        args.push(`"createdDateTime":{"$gte":${JSON.stringify(dateUp)},"$lte":${JSON.stringify(dateDown)}}`);
        const query = await QueryStateService.buildQuery(DocType.ENERGY_AMOUNT, args, [`"createdDateTime":"desc"`]);

        // const query = `{
        //     "selector":
        //     {
        //         "docType": "energyAmount",
        //         "registeredResourceMrid": "${registeredResourceMrid}",
        //         "senderMarketParticipantMrid": "${systemOperatorEicCode}",
        //         "createdDateTime": {
        //             "$gte": ${JSON.stringify(dateUp)},
        //             "$lte": ${JSON.stringify(dateDown)}
        //         },
        //         "sort": [{
        //             "createdDateTime" : "desc"
        //         }]
        //     }
        // }`;

        const ret = await QueryStateService.getQueryStringResult(ctx, query)
        return ret
    }




    public static async getEnergyAmountByProducer(
        ctx: Context,
        params: STARParameters,
        registeredResourceMrid: string,
        producerEicCode: string,
        startCreatedDateTime: string): Promise<string> {

        const identity = params.values.get(ParametersType.IDENTITY);
        if (identity !== OrganizationTypeMsp.PRODUCER) {
            throw new Error(`Organisation, ${identity} does not have read access for producer's Energy Amount.`);
        }
        const dateUp = new Date(startCreatedDateTime);
        dateUp.setUTCHours(0,0,0,0);

        const dateDown = new Date(dateUp.getTime() + 86399999);

        var args: string[] = [];
        args.push(`"registeredResourceMrid":"${registeredResourceMrid}"`);
        args.push(`"receiverMarketParticipantMrid":"${producerEicCode}"`);
        args.push(`"createdDateTime":{"$gte":${JSON.stringify(dateUp)},"$lte":${JSON.stringify(dateDown)}}`);
        const query = await QueryStateService.buildQuery(DocType.ENERGY_AMOUNT, args, [`"createdDateTime":"desc"`]);

        // const query = `{
        //         "selector":
        //         {
        //             "docType": "energyAmount",
        //             "registeredResourceMrid": "${registeredResourceMrid}",
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

        const ret = await QueryStateService.getQueryStringResult(ctx, query)
        return ret
    }



    public static async getEnergyAmountByQuery(
        ctx: Context,
        params: STARParameters,
        query: string): Promise<any> {
        const identity = params.values.get(ParametersType.IDENTITY);
        if (identity !== OrganizationTypeMsp.RTE && identity !== OrganizationTypeMsp.ENEDIS) {
            throw new Error(`Organisation, ${identity} does not have read access for Energy Amount.`);
        }

        let results = await EnergyAmountService.getQueryArrayResult(ctx, params, query);

        return results;
    }


    public static async getEnergyAmountByActivationDocument(
        ctx: Context,
        params: STARParameters,
        activationDocumentMrid: string): Promise<EnergyAmount> {

        const query = `{"selector": {"docType": "${DocType.ENERGY_AMOUNT}", "activationDocumentMrid": "${activationDocumentMrid}"}}`;
        const allResults = await EnergyAmountService.getQueryArrayResult(ctx, params, query);

        var energyAmout:EnergyAmount;
        if (allResults && allResults.length >0) {
            energyAmout = allResults[0];
        }
        return energyAmout;
    }

}
