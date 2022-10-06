
import { OrganizationTypeMsp } from '../enums/OrganizationMspType';
import { DocType } from '../enums/DocType';
import { ParametersType } from '../enums/ParametersType';

import { EnergyAccount } from '../model/energyAccount';
import { Site } from '../model/site';
import { SystemOperator } from '../model/systemOperator';
import { STARParameters } from '../model/starParameters';
import { DataReference } from '../model/dataReference';

import { QueryStateService } from './service/QueryStateService';
import { EnergyAccountService } from './service/EnergyAccountService';
import { StarPrivateDataService } from './service/StarPrivateDataService';
import { StarDataService } from './service/StarDataService';
import { CommonService } from './service/CommonService';

export class EnergyAccountController {

    public static async createEnergyAccount(
        params: STARParameters,
        inputStr: string) {
        params.logger.info('============= START : Create EnergyAccount ===========');

        const energyObj:EnergyAccount = EnergyAccount.formatString(inputStr);
        await EnergyAccountController.checkEnergyAccountObj(params, energyObj);

        //Get existing sites
        var existingSitesRef:Map<string, DataReference>;
        try {
            existingSitesRef = await StarPrivateDataService.getObjRefbyId(params, {docType: DocType.SITE, id: energyObj.meteringPointMrid});
        } catch(error) {
            throw new Error('ERROR createEnergyAccount : '.concat(error.message).concat(` Can not be created.`));
        }

        for (var [key, ] of existingSitesRef) {
            await EnergyAccountService.write(params, energyObj, key);
        }

        params.logger.info('============= END   : Create %s EnergyAccount ===========',
            energyObj.energyAccountMarketDocumentMrid,
        );
    }




    public static async createEnergyAccountList(
        params: STARParameters,
        inputStr: string) {
        params.logger.info('============= START : Create createEnergyAccountList ===========');

        const energyList: EnergyAccount[] = EnergyAccount.formatListString(inputStr);

        if (energyList) {
            for (var energyObj of energyList) {
                await EnergyAccountController.checkEnergyAccountObj(params, energyObj);

                //Get existing sites
                var existingSitesRef:Map<string, DataReference>;
                try {
                    existingSitesRef = await StarPrivateDataService.getObjRefbyId(params, {docType: DocType.SITE, id: energyObj.meteringPointMrid});
                } catch(error) {
                    throw new Error('ERROR createEnergyAccount : '.concat(error.message).concat(` Can not be created.`));
                }

                for (var [key, ] of existingSitesRef) {
                    await EnergyAccountService.write(params, energyObj, key);
                }
            }
        }

        params.logger.info('============= END   : Create createEnergyAccountList ===========');
    }




    public static async createEnergyAccountByReference(
        params: STARParameters,
        dataReference: DataReference) {
        params.logger.debug('============= START : Create EnergyAccount by Reference ===========');

        await EnergyAccountController.checkEnergyAccountObj(params, dataReference.data, dataReference.collection);
        await EnergyAccountService.write(params, dataReference.data, dataReference.collection);

        params.logger.debug('============= END   : Create %s EnergyAccount by Reference ===========',
            dataReference.data.energyAccountMarketDocumentMrid,
        );
    }




    public static async updateEnergyAccount(
        params: STARParameters,
        inputStr: string) {
        params.logger.info('============= START : Update EnergyAccount ===========');

        const energyObj:EnergyAccount = EnergyAccount.formatString(inputStr);
        await EnergyAccountController.checkEnergyAccountObj(params, energyObj);

        //Get existing data
        var existingEnergyAccountRef:Map<string, DataReference>;
        try {
            existingEnergyAccountRef = await StarPrivateDataService.getObjRefbyId(params, {docType: DocType.ENERGY_ACCOUNT, id: energyObj.energyAccountMarketDocumentMrid});
        } catch(error) {
            throw new Error(error.message.concat(` Can not be updated.`));
        }

        for (var [key, ] of existingEnergyAccountRef) {
            await EnergyAccountService.write(params, energyObj, key);
        }

        params.logger.info('============= END   : Update %s EnergyAccount ===========',
        energyObj.energyAccountMarketDocumentMrid,
        );
    }




    public static async updateEnergyAccountList(
        params: STARParameters,
        inputStr: string) {
        params.logger.info('============= START : Update EnergyAccount List ===========');

        const energyList: EnergyAccount[] = EnergyAccount.formatListString(inputStr);

        if (energyList) {
            for (var energyObj of energyList) {
                await EnergyAccountController.checkEnergyAccountObj(params, energyObj);

                //Get existing data
                var existingEnergyAccountRef:Map<string, DataReference>;
                try {
                    existingEnergyAccountRef = await StarPrivateDataService.getObjRefbyId(params, {docType: DocType.ENERGY_ACCOUNT, id: energyObj.energyAccountMarketDocumentMrid});
                } catch(error) {
                    throw new Error(error.message.concat(` Can not be updated.`));
                }

                for (var [key, ] of existingEnergyAccountRef) {
                    await EnergyAccountService.write(params, energyObj, key);
                }
            }
        }

        params.logger.info('============= END   : Update %s EnergyAccount List ===========');
    }


    private static async checkEnergyAccountObj(
        params: STARParameters,
        energyObj:EnergyAccount,
        target: string = ''): Promise<void>{
        params.logger.debug('============= START : Check EnergyAccount Obj ===========');

        const identity = params.values.get(ParametersType.IDENTITY);
        if (identity !== OrganizationTypeMsp.RTE && identity !== OrganizationTypeMsp.ENEDIS) {
            throw new Error(`Organisation, ${identity} does not have write access for Energy Account.`);
        }

        const processTypeComptage: string[] = params.values.get(ParametersType.PROCESS_TYPE_COMPTAGE);
        //If processType is "Comptage" then check the number of points
        //The number points is not checked when the processType is "Reference"
        if (processTypeComptage.includes(energyObj.processType)) {
            try {
                const nbExpectedPoints = await this.getExpectedNumberPoints(params, energyObj);
                if (nbExpectedPoints != energyObj.timeSeries.length) {
                    throw new Error(`timeSeries[${energyObj.timeSeries.length}] does not respect the expected number of points ${nbExpectedPoints}`);
                }
            }
            catch (error) {
                throw new Error('ERROR createEnergyAccount : '.concat(error.message).concat(` for Energy Account ${energyObj.energyAccountMarketDocumentMrid} creation.`));
            }
        }

        let siteObj: Site;
        // try {
        //     siteObj = await SiteController.getSiteById(params, energyObj.meteringPointMrid, target);
        // } catch(error) {
        //     throw new Error('ERROR createEnergyAccount : '.concat(error.message).concat(` for Energy Account ${energyObj.energyAccountMarketDocumentMrid} creation.`));
        // }
        var siteRef: DataReference;
        try {
            const siteRefMap: Map<string, DataReference> = await StarPrivateDataService.getObjRefbyId(params, {docType: DocType.SITE, id: energyObj.meteringPointMrid});
            if (target && target.length > 0) {
                siteRef = siteRefMap.get(target);
            } else {
                siteRef = siteRefMap.values().next().value;
            }
        } catch(error) {
            throw new Error('ERROR createEnergyAccount : '.concat(error.message).concat(` for Energy Account ${energyObj.energyAccountMarketDocumentMrid} creation.`));
        }

        if (!siteRef
            || (siteRef.collection !== target && !target && target.length > 0)
            || !siteRef.data.meteringPointMrid
            || siteRef.data.meteringPointMrid != energyObj.meteringPointMrid) {
                throw new Error(`ERROR createEnergyAccount : Site : ${energyObj.meteringPointMrid} does not exist for Energy Account ${energyObj.energyAccountMarketDocumentMrid} creation.`);
        }
        siteObj = siteRef.data;


        let systemOperatorObj: SystemOperator;
        try {
            systemOperatorObj = await StarDataService.getObj(params, {id: energyObj.senderMarketParticipantMrid, docType: DocType.SYSTEM_OPERATOR});
        } catch (error) {
            throw new Error('ERROR createEnergyAccount : '.concat(error.message).concat(` for Energy Account ${energyObj.energyAccountMarketDocumentMrid} creation.`));
        }

        if (!identity.toLowerCase().includes(systemOperatorObj.systemOperatorMarketParticipantName.toLowerCase())) {
            throw new Error(
                `Energy Account, sender: ${identity} does not have write access for ${energyObj.energyAccountMarketDocumentMrid}. (Wrong SystemOperator)`,
            );
        }

        if (siteObj.systemOperatorMarketParticipantMrid !== energyObj.senderMarketParticipantMrid) {
            throw new Error(`Energy Account, sender: ${energyObj.senderMarketParticipantMrid} is not the same as site.systemOperator: ${siteObj.systemOperatorMarketParticipantMrid} in EnergyAccount.`);
        }

        if (identity === OrganizationTypeMsp.RTE && !energyObj.marketEvaluationPointMrid) {
            throw new Error(`Energy Account, missing marketEvaluationPointMrid optionnal for HTA but required for HTB in EnergyAccount.`);
        } else if (identity === OrganizationTypeMsp.ENEDIS && energyObj.marketEvaluationPointMrid) {
            throw new Error(`Energy Account, presence of marketEvaluationPointMrid optionnal for HTA but required for HTB in EnergyAccount.`);
        }

        params.logger.debug('=============  END  : Check EnergyAccount Obj ===========');
    }






    private static async getExpectedNumberPoints(params: STARParameters, energyObj:EnergyAccount): Promise<number> {
        const startIndicator: string = params.values.get(ParametersType.ENERGY_ACCOUNT_TIME_INTERVAL_START);

        const value_Array = energyObj.resolution.split(startIndicator);

        if (value_Array.length != 2 ) {
            throw new Error(`invalid resolution`);
        }

        var nbExpectedPoints:number = 0;

        //Hour Changement Management
        const startDate = CommonService.formatDateStr(energyObj.startCreatedDateTime);

        const lapTimeLess1HDays: string[] = params.values.get(ParametersType.ENERGY_ACCOUNT_TIME_INTERVAL_LAPsec_LESS1H_DAYS);
        const lapTimePlus1HDays: string[] = params.values.get(ParametersType.ENERGY_ACCOUNT_TIME_INTERVAL_LAPsec_PLUS1H_DAYS);

        if (lapTimeLess1HDays.includes(startDate)) {
            const lapTimeStr: string = params.values.get(ParametersType.ENERGY_ACCOUNT_TIME_INTERVAL_LAPsec_LESS1H);
            nbExpectedPoints = parseInt(lapTimeStr);
        } else if (lapTimePlus1HDays.includes(startDate)) {
            const lapTimeStr: string = params.values.get(ParametersType.ENERGY_ACCOUNT_TIME_INTERVAL_LAPsec_PLUS1H);
            nbExpectedPoints = parseInt(lapTimeStr);
        } else {
            const lapTimeStr: string = params.values.get(ParametersType.ENERGY_ACCOUNT_TIME_INTERVAL_LAPsec);
            nbExpectedPoints = parseInt(lapTimeStr);
        }

        const minutesIndicator: string = params.values.get(ParametersType.ENERGY_ACCOUNT_TIME_INTERVAL_MINUTES);
        const valueMinutes_Array = value_Array[1].split(minutesIndicator);
        try {
            if (valueMinutes_Array.length == 2) {
                nbExpectedPoints = nbExpectedPoints / 60;

                var nbMinutes: number = 0;
                nbMinutes = parseInt(valueMinutes_Array[0]);

                nbExpectedPoints = nbExpectedPoints / nbMinutes;
            } else {
                const secondsIndicator: string = params.values.get(ParametersType.ENERGY_ACCOUNT_TIME_INTERVAL_SECONDS);
                var nbSeconds: number = 0;
                const valueSeconds_Array = value_Array[1].split(secondsIndicator);
                if (valueSeconds_Array.length == 2) {
                    nbSeconds = parseInt(valueSeconds_Array[0]);
                }

                nbExpectedPoints = nbExpectedPoints / nbSeconds;
            }
        } catch(error) {
            throw new Error(`invalid resolution`);
        }

        return nbExpectedPoints;
    }



    public static async dataExists(
        params: STARParameters,
        id: string,
        target: string = ''): Promise<boolean> {
        params.logger.debug('============= START : dataExists EnergyAccount Controller ===========');

        let existing: boolean = false;

        try {
            const result:Map<string, DataReference> = await StarPrivateDataService.getObjRefbyId(params, {docType: DocType.ENERGY_ACCOUNT, id: id});

            if (target && target.length > 0) {
                const dataReference: DataReference = result.get(target);
                existing = dataReference
                    && dataReference.data
                    && dataReference.data.energyAccountMarketDocumentMrid == id;
            } else {
                existing = result
                    && result.values().next().value
                    && result.values().next().value.data
                    && result.values().next().value.data.energyAccountMarketDocumentMrid == id;
            }
        } catch (err) {
            existing = false;
        }

        params.logger.debug('=============  END  : dataExists EnergyAccount Controller ===========');
        return existing;
    }






    public static async getEnergyAccountForSystemOperator(
            params: STARParameters,
            meteringPointMrid: string,
            systemOperatorEicCode: string,
            startCreatedDateTime: string): Promise<string> {
        params.logger.info('============= START : get EnergyAccount For SystemOperator ===========');

        const allResults = await EnergyAccountController.getEnergyAccountForSystemOperatorObj(
            params, meteringPointMrid, systemOperatorEicCode, startCreatedDateTime);
        const formated = JSON.stringify(allResults);

        params.logger.info('=============  END  : get EnergyAccount For SystemOperator ===========');
        return formated;
    }




    public static async getEnergyAccountForSystemOperatorObj(
        params: STARParameters,
        meteringPointMrid: string,
        systemOperatorEicCode: string,
        startCreatedDateTime: string,
        target: string = ''): Promise<any[]> {
        params.logger.debug('============= START : get EnergyAccount Obj For SystemOperator ===========');

        const identity = params.values.get(ParametersType.IDENTITY);
        if (identity !== OrganizationTypeMsp.RTE && identity !== OrganizationTypeMsp.ENEDIS) {
            throw new Error(`Organisation, ${identity} does not have read access for Energy Account.`);
        }

        const dateUp = new Date(startCreatedDateTime);

        dateUp.setUTCHours(0,0,0,0);
        // params.logger.log('dateUp=', JSON.stringify(dateUp));
        const dateDown = new Date(dateUp.getTime() + 86399999);
        // params.logger.log('dateDown=', JSON.stringify(dateDown));

        let systemOperatorObj: SystemOperator;
        try {
            systemOperatorObj = await StarDataService.getObj(params, {id: systemOperatorEicCode, docType: DocType.SYSTEM_OPERATOR});
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

        // const query = await QueryStateService.buildQuery(DocType.ENERGY_ACCOUNT, args, [`"createdDateTime":"desc"`]);
        const query = await QueryStateService.buildQuery({documentType: DocType.ENERGY_ACCOUNT, queryArgs: args});

        params.logger.debug('=============  END  : get EnergyAccount Obj For SystemOperator ===========');
        return await EnergyAccountService.getQueryArrayResult(params, query, target);
    }





    public static async getEnergyAccountByQuery(
        params: STARParameters,
        query: string): Promise<any> {
        params.logger.debug('============= START : get EnergyAccount Obj By Query ===========');

        const identity = params.values.get(ParametersType.IDENTITY);
        if (identity !== OrganizationTypeMsp.RTE && identity !== OrganizationTypeMsp.ENEDIS) {
            throw new Error(`Organisation, ${identity} does not have read access for Energy Account.`);
        }

        let results = await EnergyAccountService.getQueryArrayResult(params, query);

        params.logger.debug('=============  END  : get EnergyAccount Obj By Query ===========');
        return results;
    }





    public static async getEnergyAccountByProducer(
        params: STARParameters,
        meteringPointMrid: string,
        producerEicCode: string,
        startCreatedDateTime: string): Promise<string> {
        params.logger.info('============= START : get EnergyAccount By Producer ===========');

        params.logger.info('meteringPointMrid: ', meteringPointMrid);
        params.logger.info('producerEicCode: ', producerEicCode);
        params.logger.info('startCreatedDateTime: ', startCreatedDateTime);

        const identity = params.values.get(ParametersType.IDENTITY);
        if (identity !== OrganizationTypeMsp.PRODUCER) {
            throw new Error(`Organisation, ${identity} does not have read access for producer's Energy Account.`);
        }
        const dateUp = new Date(startCreatedDateTime);

        dateUp.setUTCHours(0,0,0,0);
        // params.logger.log('dateUp=', JSON.stringify(dateUp));
        const dateDown = new Date(dateUp.getTime() + 86399999);
        // params.logger.log('dateDown=', JSON.stringify(dateDown));

        var args: string[] = [];
        args.push(`"meteringPointMrid":"${meteringPointMrid}"`);
        args.push(`"receiverMarketParticipantMrid":"${producerEicCode}"`);
        args.push(`"createdDateTime":{"$gte":${JSON.stringify(dateUp)},"$lte":${JSON.stringify(dateDown)}}`);

        // const query = await QueryStateService.buildQuery(DocType.ENERGY_ACCOUNT, args, [`"createdDateTime":"desc"`]);
        const query = await QueryStateService.buildQuery({documentType: DocType.ENERGY_ACCOUNT, queryArgs: args});

        params.logger.info('query: ', query);

        const allResults = await EnergyAccountService.getQueryArrayResult(params, query);
        params.logger.info('allResults: ', JSON.stringify(allResults));

        const formated = JSON.stringify(allResults);

        params.logger.info('=============  END  : get EnergyAccount By Producer ===========');
        return formated;
    }
}
