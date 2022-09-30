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
import { CommonService } from './service/CommonService';
import { BalancingDocumentController } from './BalancingDocumentController';
import { ActivationEnergyAmountIndexersController, DataIndexersController } from './dataIndexersController';
import { EnergyAmountAbstract, IndexedData } from '../model/dataIndexers';
import { IdArgument } from '../model/arguments/idArgument';

export class EnergyAmountController {
    public static async executeOrder(
        params: STARParameters,
        updateOrder: DataReference) {
        params.logger.debug('============= START : executeOrder EnergyAmountController ===========');

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
                await BalancingDocumentController.deleteByActivationDocumentMrId(params, energyAmount.activationDocumentMrid, updateOrder.previousCollection);
            }


        }

        params.logger.debug('============= END   : executeOrder EnergyAmountController ===========');
    }






    private static async checkEnergyAmout(
        params: STARParameters,
        energyObj: EnergyAmount,
        energyType: EnergyType,
        checkSite: boolean = false,
        target: string = '') : Promise<void> {
        params.logger.debug('============= START : checkEnergyAmout EnergyAmountController ===========');

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

        // params.logger.log('energyAmountInput.timeInterval=', energyAmountInput.timeInterval);
        const strSplitted = energyObj.timeInterval.split('/', 2);
        const begin = strSplitted[0];
        const end = strSplitted[1];
        // params.logger.log('strSplitted=', strSplitted);

        const dateBegin = new Date(begin.trim());
        // params.logger.log('dateBegin=', dateBegin);
        dateBegin.setUTCHours(0,0,0,0);

        // params.logger.log('dateBegin=', dateBegin);


        // params.logger.log('dateEnd=', dateEnd);

        const orderDateStart = new Date(orderObj.startCreatedDateTime);
        orderDateStart.setUTCHours(0,0,0,0);
        // params.logger.log('orderDateStart=', orderDateStart);

        if (JSON.stringify(dateBegin) !== JSON.stringify(orderDateStart)) {
            throw new Error(`ERROR manage EnergyAmount mismatch between ${energyType} : ${CommonService.formatDate(dateBegin)} and Activation Document : ${CommonService.formatDate(orderDateStart)} dates.`);
        }

        params.logger.debug('=============  END  : checkEnergyAmout EnergyAmountController ===========');
    }
//      ================STAR-425 : Partie du code en commentaire car on utilise pas les clés composites===========================

//         const keySplitted = energyObj.activationDocumentMrid.split('/', 4);
//         params.logger.log(keySplitted);
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
//         params.logger.log(query);
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
        params.logger.info('============= START : createTSOEnergyAmount EnergyAmountController ===========');

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

            const dataReference = existingActivationDocumentRef.get(key);
            await BalancingDocumentController.createOrUpdate(params, dataReference.data, null, energyObj, key);

            await ActivationEnergyAmountIndexersController.addEnergyAmountReference(params, energyObj, key);
        }

        params.logger.info('============= END   : createTSOEnergyAmount %s EnergyAmountController ===========',
            energyObj.energyAmountMarketDocumentMrid,
        );
    }





    public static async createTSOEnergyAmountList(
        params: STARParameters,
        inputStr: string) {

        params.logger.info('============= START : createTSOEnergyAmountList EnergyAmountController ===========');

        const identity = params.values.get(ParametersType.IDENTITY);
        if (identity !== OrganizationTypeMsp.RTE) {
            throw new Error(`Organisation, ${identity} does not have write access for Energy Amount.`);
        }

        const energyList: EnergyAmount[] = EnergyAmount.formatListString(inputStr);

        if (energyList) {
            for(var energyObj of energyList) {
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

                    const dataReference = existingActivationDocumentRef.get(key);
                    await BalancingDocumentController.createOrUpdate(params, dataReference.data, null, energyObj, key);

                    await ActivationEnergyAmountIndexersController.addEnergyAmountReference(params, energyObj, key);
                }
            }
        }

        params.logger.info('============= END   : createTSOEnergyAmountList EnergyAmountController ===========');
    }





    public static async createTSOEnergyAmountByReference(
        params: STARParameters,
        dataReference: DataReference) {
        params.logger.debug('============= START : createTSOEnergyAmount EnergyAmountController ===========');

        const identity = params.values.get(ParametersType.IDENTITY);
        if (identity !== OrganizationTypeMsp.RTE) {
            throw new Error(`Organisation, ${identity} does not have write access for Energy Amount.`);
        }

        await EnergyAmountController.checkEnergyAmout(params, dataReference.data, EnergyType.ENE, false, dataReference.collection);
        await EnergyAmountService.write(params, dataReference.data, dataReference.collection);
        await BalancingDocumentController.createOrUpdate(params, null, null, dataReference.data, dataReference.collection);

        await ActivationEnergyAmountIndexersController.addEnergyAmountReference(params, dataReference.data, dataReference.collection);

        params.logger.debug('============= END   : createTSOEnergyAmount %s EnergyAmountController ===========',
            dataReference.data.energyAmountMarketDocumentMrid,
        );
    }





    public static async updateTSOEnergyAmount(
        params: STARParameters,
        inputStr: string) {
        params.logger.info('============= START : updateTSOEnergyAmount EnergyAmountController ===========');

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

            await BalancingDocumentController.createOrUpdate(params, null, null, energyObj, key);
        }

        params.logger.info('============= END   : updateTSOEnergyAmount %s EnergyAmountController ===========',
            energyObj.energyAmountMarketDocumentMrid,
        );
    }






    public static async updateTSOEnergyAmountList(
        params: STARParameters,
        inputStr: string) {
        params.logger.info('============= START : updateTSOEnergyAmountList EnergyAmountController ===========');

        const identity = params.values.get(ParametersType.IDENTITY);
        if (identity !== OrganizationTypeMsp.RTE) {
            throw new Error(`Organisation, ${identity} does not have write access for Energy Amount.`);
        }

        const energyList: EnergyAmount[] = EnergyAmount.formatListString(inputStr);

        if (energyList) {
            for(var energyObj of energyList) {
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

                    await BalancingDocumentController.createOrUpdate(params, null, null, energyObj, key);
                }
            }
        }

        params.logger.info('============= END   : updateTSOEnergyAmountList %s EnergyAmountController ===========');
    }





    public static async createDSOEnergyAmount(
        params: STARParameters,
        inputStr: string) {
        params.logger.debug('============= START : createDSOEnergyAmount EnergyAmountController ===========');

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

            const dataReference = existingActivationDocumentRef.get(key);
            await BalancingDocumentController.createOrUpdate(params, dataReference.data, null, energyObj, key);

            await ActivationEnergyAmountIndexersController.addEnergyAmountReference(params, energyObj, key);
        }

        params.logger.debug('============= END   : createDSOEnergyAmount %s EnergyAmountController ===========',
            energyObj.energyAmountMarketDocumentMrid,
        );
    }





    public static async createDSOEnergyAmountList(
        params: STARParameters,
        inputStr: string) {
        params.logger.info('============= START : createDSOEnergyAmountList EnergyAmountController ===========');

        const identity = params.values.get(ParametersType.IDENTITY);
        if (identity !== OrganizationTypeMsp.ENEDIS) {
            throw new Error(`Organisation, ${identity} does not have write access for Energy Amount.`);
        }

        const energyList: EnergyAmount[] = EnergyAmount.formatListString(inputStr);

        if (energyList) {
            for(var energyObj of energyList) {
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

                    const dataReference = existingActivationDocumentRef.get(key);
                    await BalancingDocumentController.createOrUpdate(params, dataReference.data, null, energyObj, key);

                    await ActivationEnergyAmountIndexersController.addEnergyAmountReference(params, energyObj, key);
                }
            }
        }

        params.logger.info('============= END   : createDSOEnergyAmountList EnergyAmountController ===========');
    }






    public static async createDSOEnergyAmountByReference(
        params: STARParameters,
        dataReference: DataReference) {
        params.logger.debug('============= START : createDSOEnergyAmount EnergyAmountController ===========');

        const identity = params.values.get(ParametersType.IDENTITY);
        if (identity !== OrganizationTypeMsp.ENEDIS) {
            throw new Error(`Organisation, ${identity} does not have write access for Energy Amount.`);
        }

        await EnergyAmountController.checkEnergyAmout(params, dataReference.data, EnergyType.ENI, true, dataReference.collection);
        await EnergyAmountService.write(params, dataReference.data, dataReference.collection);
        await BalancingDocumentController.createOrUpdate(params, null, null, dataReference.data, dataReference.collection);

        await ActivationEnergyAmountIndexersController.addEnergyAmountReference(params, dataReference.data, dataReference.collection);

        params.logger.debug('============= END   : createDSOEnergyAmount %s EnergyAmountController ===========',
        dataReference.data.energyAmountMarketDocumentMrid,
        );
    }







    public static async updateDSOEnergyAmountList(
        params: STARParameters,
        inputStr: string) {
        params.logger.info('============= START : updateDSOEnergyAmountList EnergyAmountController ===========');

        const identity = params.values.get(ParametersType.IDENTITY);
        if (identity !== OrganizationTypeMsp.ENEDIS) {
            throw new Error(`Organisation, ${identity} does not have write access for Energy Amount.`);
        }

        const energyList: EnergyAmount[] = EnergyAmount.formatListString(inputStr);

        if (energyList) {
            for(var energyObj of energyList) {
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

                    await BalancingDocumentController.createOrUpdate(params, null, null, energyObj, key);
                }
            }
        }

        params.logger.info('============= END   : updateDSOEnergyAmountList %s EnergyAmountController ===========');
    }




    public static async updateDSOEnergyAmount(
        params: STARParameters,
        inputStr: string) {
        params.logger.info('============= START : updateDSOEnergyAmount EnergyAmountController ===========');

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

            await BalancingDocumentController.createOrUpdate(params, null, null, energyObj, key);
        }


        params.logger.info('============= END   : updateDSOEnergyAmount %s EnergyAmountController ===========',
            energyObj.energyAmountMarketDocumentMrid,
        );
    }





    public static async getObjById(params: STARParameters, energyAmountMarketDocumentMrid: string, target: string = ''): Promise<EnergyAmount> {
        params.logger.debug('============= START : get Obj ById EnergyAmountController ===========');

        const reserveBidObj = await this.getObjByIdArgument(params, {docType: DocType.ENERGY_AMOUNT, id: energyAmountMarketDocumentMrid, collection: target});

        params.logger.debug('=============  END  : get Obj ById EnergyAmountController ===========');
        return reserveBidObj;
    }



    private static async getObjByIdArgument(
        params: STARParameters,
        arg: IdArgument): Promise<EnergyAmount> {
        params.logger.debug('============= START : get EnergyAmountController By Id Argument (%s) ===========', JSON.stringify(arg));

        let energyObj: EnergyAmount;
        arg.docType = DocType.ENERGY_AMOUNT;
        if (arg.collection && arg.collection.length > 0) {
            energyObj = await StarPrivateDataService.getObj(params, arg);
        } else {
            const result:Map<string, DataReference> = await StarPrivateDataService.getObjRefbyId(params, arg);
            const dataReference = result.values().next().value;
            if (dataReference && dataReference.data) {
                energyObj = dataReference.data;
            }
        }

        params.logger.debug('=============  END  : get EnergyAmountController By Id Argument (%s) ===========', JSON.stringify(arg));

        return energyObj;
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
        params.logger.info('============= START : get EnergyAmount For SystemOperator ===========');

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
        const query = await QueryStateService.buildQuery({documentType: DocType.ENERGY_AMOUNT, queryArgs: args, sort: [`"createdDateTime":"desc"`]});

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

        params.logger.info('=============  END  : get EnergyAmount For SystemOperator ===========');
        return ret
    }




    public static async getEnergyAmountByProducer(
        params: STARParameters,
        registeredResourceMrid: string,
        producerEicCode: string,
        startCreatedDateTime: string): Promise<string> {
        params.logger.info('============= START : get EnergyAmount For Producer ===========');

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
        const query = await QueryStateService.buildQuery({documentType: DocType.ENERGY_AMOUNT, queryArgs: args, sort: [`"createdDateTime":"desc"`]});

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

        params.logger.info('=============  END  : get EnergyAmount For Producer ===========');

        return ret
    }



    public static async getEnergyAmountByQuery(
        params: STARParameters,
        query: string): Promise<any> {
        params.logger.info('============= START : get EnergyAmount By Query ===========');

        const identity = params.values.get(ParametersType.IDENTITY);
        if (identity !== OrganizationTypeMsp.RTE && identity !== OrganizationTypeMsp.ENEDIS) {
            throw new Error(`Organisation, ${identity} does not have read access for Energy Amount.`);
        }

        let results = await EnergyAmountService.getQueryArrayResult(params, {query:query});

        params.logger.info('=============  END  : get EnergyAmount By Query ===========');
        return results;
    }


    // public static async getEnergyAmountByActivationDocument(
    //     params: STARParameters,
    //     activationDocumentMrid: string,
    //     target: string = ''): Promise<EnergyAmount> {
    //     params.logger.debug('============= START : get EnergyAmount By ActivationDocument ===========');

    //     const query = `{"selector": {"docType": "${DocType.ENERGY_AMOUNT}", "activationDocumentMrid": "${activationDocumentMrid}"}}`;
    //     const allResults = await EnergyAmountService.getQueryArrayResult(params, {query: query, collection: target});

    //     var energyAmout:EnergyAmount;
    //     if (allResults && allResults.length >0) {
    //         energyAmout = allResults[0];
    //     }

    //     params.logger.debug('=============  END  : get EnergyAmount By ActivationDocument ===========');

    //     return energyAmout;
    // }

    public static async getByActivationDocument(
        params: STARParameters,
        activationDocumentMrid: string,
        target: string = ''): Promise<EnergyAmount>{
        params.logger.debug('============= START : get EnergyAmount By ActivationDocument ===========');

        var energyAmout:EnergyAmount = null;

        if (activationDocumentMrid) {
            var activNRJAmountIndx: IndexedData;
            try {
                activNRJAmountIndx = await ActivationEnergyAmountIndexersController.get(params, activationDocumentMrid, target);
            } catch (err) {
                //DO nothing except "Not accessible information"
            }

            if (activNRJAmountIndx
                && activNRJAmountIndx.indexedDataAbstractList
                && activNRJAmountIndx.indexedDataAbstractList.length > 0) {

                const energyAmountMarketDocumentMrid = activNRJAmountIndx.indexedDataAbstractList[0];

                if (energyAmountMarketDocumentMrid
                    && energyAmountMarketDocumentMrid.length > 0) {

                        energyAmout = await this.getObjById(params, energyAmountMarketDocumentMrid, target);
                }
            }

        }

        params.logger.debug('=============  END  : get EnergyAmount By ActivationDocument ===========');
        return energyAmout;
    }

}
