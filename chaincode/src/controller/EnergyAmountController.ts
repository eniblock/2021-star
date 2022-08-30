import { OrganizationTypeMsp } from '../enums/OrganizationMspType';
import { DocType } from '../enums/DocType';
import { ParametersType } from '../enums/ParametersType';
import { EnergyType } from '../enums/EnergyType';
import { DataActionType } from '../enums/DataActionType';

import { ActivationDocument } from '../model/activationDocument/activationDocument';
import { EnergyAmount } from '../model/energyAmount';
import { SystemOperator } from '../model/systemOperator';
import { STARParameters } from '../model/starParameters';
import { DataReference } from '../model/dataReference';

import { QueryStateService } from './service/QueryStateService';
import { EnergyAmountService } from './service/EnergyAmountService';
import { StarPrivateDataService } from './service/StarPrivateDataService';
import { StarDataService } from './service/StarDataService';

import { ActivationDocumentController } from './activationDocument/ActivationDocumentController';

export class EnergyAmountController {
    public static async executeOrder(
        params: STARParameters,
        updateOrder: DataReference) {
        console.debug('============= START : executeOrder EnergyAmountController ===========');

        if (updateOrder.data) {
            EnergyAmount.schema.validateSync(
                updateOrder.data,
                {strict: true, abortEarly: false},
            );
            const energyAmount:EnergyAmount = updateOrder.data;

            if (updateOrder.dataAction === DataActionType.COLLECTION_CHANGE) {
                const identity = params.values.get(ParametersType.IDENTITY);

                if (identity === OrganizationTypeMsp.ENEDIS) {
                    await EnergyAmountController.createDSOEnergyAmountByReference(params, updateOrder);
                } else if (identity === OrganizationTypeMsp.RTE) {
                    await EnergyAmountController.createTSOEnergyAmountByReference(params, updateOrder);
                }

                await EnergyAmountService.delete(params, {id:energyAmount.energyAmountMarketDocumentMrid, collection: updateOrder.previousCollection});
            }


        }

        console.debug('============= END   : executeOrder EnergyAmountController ===========');
    }


    private static async checkEnergyAmout(
        params: STARParameters,
        energyObj: EnergyAmount,
        energyType: EnergyType,
        checkSite: boolean = false,
        target: string = '') : Promise<void> {

        let orderObj: ActivationDocument;
        try {
            orderObj = await ActivationDocumentController.getActivationDocumentById(params, energyObj.activationDocumentMrid, target);
        } catch(error) {
            throw new Error(error.message.concat(` for Energy Amount ${energyObj.energyAmountMarketDocumentMrid} creation.`));
        }

        if (checkSite && energyObj.registeredResourceMrid && energyObj.registeredResourceMrid !== "") {
            // try {
            //         await SiteController.getSiteById(params, energyObj.registeredResourceMrid, target);
            // } catch(error) {
            //     throw new Error(error.message.concat(` for Energy Amount ${energyObj.energyAmountMarketDocumentMrid} creation.`));
            // }

            var siteRef: DataReference;
            try {
                const siteRefMap: Map<string, DataReference> = await StarPrivateDataService.getObjRefbyId(params, {docType: DocType.SITE, id: energyObj.registeredResourceMrid});
                if (target && target.length > 0) {
                    siteRef = siteRefMap.get(target);
                } else {
                    siteRef = siteRefMap.values().next().value;
                }
            } catch(error) {
                throw new Error(error.message.concat(` for Energy Amount ${energyObj.energyAmountMarketDocumentMrid} creation.`));
            }
            if (!siteRef
                || (siteRef.collection !== target && !target && target.length > 0)
                || !siteRef.data.meteringPointMrid
                || siteRef.data.meteringPointMrid != energyObj.registeredResourceMrid) {
                    throw new Error(`Site : ${energyObj.registeredResourceMrid} does not exist for Energy Amount ${energyObj.energyAmountMarketDocumentMrid} creation.`);
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
//         const allResults = await QueryStateService.getQueryArrayResult(query);
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
        params: STARParameters,
        inputStr: string) {
        console.debug('============= START : createTSOEnergyAmount EnergyAmountController ===========');

        const identity = params.values.get(ParametersType.IDENTITY);
        if (identity !== OrganizationTypeMsp.RTE) {
            throw new Error(`Organisation, ${identity} does not have write access for Energy Amount.`);
        }

        const energyObj: EnergyAmount = EnergyAmount.formatString(inputStr);
        await EnergyAmountController.checkEnergyAmout(params, energyObj, EnergyType.ENE);

        //Get existing Activation Documents
        var existingActivationDocumentRef:Map<string, DataReference>;
        try {
            existingActivationDocumentRef = await StarPrivateDataService.getObjRefbyId(params, {docType: DocType.ACTIVATION_DOCUMENT, id: energyObj.activationDocumentMrid});
        } catch(error) {
            throw new Error('ERROR createEnergyAmount : '.concat(error.message).concat(` Can not be created.`));
        }

        for (var [key, ] of existingActivationDocumentRef) {
            await EnergyAmountService.write(params, energyObj, key);
        }

        console.debug('============= END   : createTSOEnergyAmount %s EnergyAmountController ===========',
            energyObj.energyAmountMarketDocumentMrid,
        );
    }



    public static async createTSOEnergyAmountByReference(
        params: STARParameters,
        dataReference: DataReference) {
        console.debug('============= START : createTSOEnergyAmount EnergyAmountController ===========');

        const identity = params.values.get(ParametersType.IDENTITY);
        if (identity !== OrganizationTypeMsp.RTE) {
            throw new Error(`Organisation, ${identity} does not have write access for Energy Amount.`);
        }

        await EnergyAmountController.checkEnergyAmout(params, dataReference.data, EnergyType.ENE, false, dataReference.collection);
        await EnergyAmountService.write(params, dataReference.data, dataReference.collection);

        console.debug('============= END   : createTSOEnergyAmount %s EnergyAmountController ===========',
            dataReference.data.energyAmountMarketDocumentMrid,
        );
    }



    public static async updateTSOEnergyAmount(
        params: STARParameters,
        inputStr: string) {
        console.debug('============= START : updateTSOEnergyAmount EnergyAmountController ===========');

        const identity = params.values.get(ParametersType.IDENTITY);
        if (identity !== OrganizationTypeMsp.RTE) {
            throw new Error(`Organisation, ${identity} does not have write access for Energy Amount.`);
        }

        const energyObj: EnergyAmount = EnergyAmount.formatString(inputStr);
        await EnergyAmountController.checkEnergyAmout(params, energyObj, EnergyType.ENE);

        //Get existing data
        var existingEnergyAmountRef:Map<string, DataReference>;
        try {
            existingEnergyAmountRef = await StarPrivateDataService.getObjRefbyId(params, {docType: DocType.ENERGY_AMOUNT, id: energyObj.energyAmountMarketDocumentMrid});
        } catch(error) {
            throw new Error(error.message.concat(` Can not be updated.`));
        }

        for (var [key, ] of existingEnergyAmountRef) {
            await EnergyAmountService.write(params, energyObj, key);
        }

        console.debug('============= END   : updateTSOEnergyAmount %s EnergyAmountController ===========',
            energyObj.energyAmountMarketDocumentMrid,
        );
    }





    public static async createDSOEnergyAmount(
        params: STARParameters,
        inputStr: string) {
        console.debug('============= START : createDSOEnergyAmount EnergyAmountController ===========');

        const identity = params.values.get(ParametersType.IDENTITY);
        if (identity !== OrganizationTypeMsp.ENEDIS) {
            throw new Error(`Organisation, ${identity} does not have write access for Energy Amount.`);
        }

        const energyObj: EnergyAmount = EnergyAmount.formatString(inputStr);
        await EnergyAmountController.checkEnergyAmout(params, energyObj, EnergyType.ENI, true);

        //Get existing Activation Documents
        var existingActivationDocumentRef:Map<string, DataReference>;
        try {
            existingActivationDocumentRef = await StarPrivateDataService.getObjRefbyId(params, {docType: DocType.ACTIVATION_DOCUMENT, id: energyObj.activationDocumentMrid});
        } catch(error) {
            throw new Error('ERROR createEnergyAmount : '.concat(error.message).concat(` Can not be created.`));
        }

        for (var [key, ] of existingActivationDocumentRef) {
            await EnergyAmountService.write(params, energyObj, key);
        }

        console.debug('============= END   : createDSOEnergyAmount %s EnergyAmountController ===========',
            energyObj.energyAmountMarketDocumentMrid,
        );
    }



    public static async createDSOEnergyAmountByReference(
        params: STARParameters,
        dataReference: DataReference) {
        console.debug('============= START : createDSOEnergyAmount EnergyAmountController ===========');

        const identity = params.values.get(ParametersType.IDENTITY);
        if (identity !== OrganizationTypeMsp.ENEDIS) {
            throw new Error(`Organisation, ${identity} does not have write access for Energy Amount.`);
        }

        await EnergyAmountController.checkEnergyAmout(params, dataReference.data, EnergyType.ENI, true, dataReference.collection);
        await EnergyAmountService.write(params, dataReference.data, dataReference.collection);

        console.debug('============= END   : createDSOEnergyAmount %s EnergyAmountController ===========',
        dataReference.data.energyAmountMarketDocumentMrid,
        );
    }





    public static async updateDSOEnergyAmount(
        params: STARParameters,
        inputStr: string) {
        console.debug('============= START : updateDSOEnergyAmount EnergyAmountController ===========');

        const identity = params.values.get(ParametersType.IDENTITY);
        if (identity !== OrganizationTypeMsp.ENEDIS) {
            throw new Error(`Organisation, ${identity} does not have write access for Energy Amount.`);
        }

        const energyObj: EnergyAmount = EnergyAmount.formatString(inputStr);
        await EnergyAmountController.checkEnergyAmout(params, energyObj, EnergyType.ENI, true);

        //Get existing data
        var existingEnergyAmountRef:Map<string, DataReference>;
        try {
            existingEnergyAmountRef = await StarPrivateDataService.getObjRefbyId(params, {docType: DocType.ENERGY_AMOUNT, id: energyObj.energyAmountMarketDocumentMrid});
        } catch(error) {
            throw new Error(error.message.concat(` Can not be updated.`));
        }

        for (var [key, ] of existingEnergyAmountRef) {
            await EnergyAmountService.write(params, energyObj, key);
        }


        console.debug('============= END   : updateDSOEnergyAmount %s EnergyAmountController ===========',
            energyObj.energyAmountMarketDocumentMrid,
        );
    }




    public static async dataExists(
        params: STARParameters,
        id: string,
        target: string = ''): Promise<boolean> {

        let existing: boolean = false;
        const result:Map<string, DataReference> = await StarPrivateDataService.getObjRefbyId(params, {docType: DocType.ENERGY_AMOUNT, id: id});
        if (target && target.length > 0) {
            const dataReference: DataReference = result.get(target);
            existing = dataReference
                && dataReference.data
                && dataReference.data.energyAmountMarketDocumentMrid == id;
        } else {
            existing = result
                && result.values().next().value
                && result.values().next().value.data
                && result.values().next().value.data.energyAmountMarketDocumentMrid == id;
        }

        return existing;
    }




    public static async getEnergyAmountForSystemOperator(
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
            systemOperatorObj = await StarDataService.getObj(params, {id: systemOperatorEicCode, docType: DocType.SYSTEM_OPERATOR});
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

        const ret = await QueryStateService.getQueryStringResult(params, {query: query})
        return ret
    }




    public static async getEnergyAmountByProducer(
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

        const ret = await QueryStateService.getQueryStringResult(params, {query: query})
        return ret
    }



    public static async getEnergyAmountByQuery(
        params: STARParameters,
        query: string): Promise<any> {
        const identity = params.values.get(ParametersType.IDENTITY);
        if (identity !== OrganizationTypeMsp.RTE && identity !== OrganizationTypeMsp.ENEDIS) {
            throw new Error(`Organisation, ${identity} does not have read access for Energy Amount.`);
        }

        let results = await EnergyAmountService.getQueryArrayResult(params, {query:query});

        return results;
    }


    public static async getEnergyAmountByActivationDocument(
        params: STARParameters,
        activationDocumentMrid: string,
        target: string = ''): Promise<EnergyAmount> {

        const query = `{"selector": {"docType": "${DocType.ENERGY_AMOUNT}", "activationDocumentMrid": "${activationDocumentMrid}"}}`;
        const allResults = await EnergyAmountService.getQueryArrayResult(params, {query: query, collection: target});

        var energyAmout:EnergyAmount;
        if (allResults && allResults.length >0) {
            energyAmout = allResults[0];
        }
        return energyAmout;
    }

}
