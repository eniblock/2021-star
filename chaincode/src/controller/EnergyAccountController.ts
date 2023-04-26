
import { DocType } from '../enums/DocType';
import { OrganizationTypeMsp } from '../enums/OrganizationMspType';
import { ParametersType } from '../enums/ParametersType';

import { DataReference } from '../model/dataReference';
import { EnergyAccount } from '../model/energyAccount';
import { Site } from '../model/site';
import { STARParameters } from '../model/starParameters';
import { SystemOperator } from '../model/systemOperator';

import { CommonService } from './service/CommonService';
import { EnergyAccountService } from './service/EnergyAccountService';
import { QueryStateService } from './service/QueryStateService';
import { StarDataService } from './service/StarDataService';
import { StarPrivateDataService } from './service/StarPrivateDataService';

export class EnergyAccountController {

    public static async createEnergyAccount(
        params: STARParameters,
        inputStr: string) {
        params.logger.info('============= START : Create EnergyAccount ===========');

        const energyObj: EnergyAccount = EnergyAccount.formatString(inputStr);
        await EnergyAccountController.checkEnergyAccountObj(params, energyObj);

        // Get existing sites
        let existingSitesRef: Map<string, DataReference>;
        try {
            existingSitesRef = await StarPrivateDataService.getObjRefbyId(
                params, {docType: DocType.SITE, id: energyObj.meteringPointMrid});
        } catch (error) {
            throw new Error('ERROR createEnergyAccount : '.concat(error.message).concat(` Can not be created.`));
        }

        for (const [key ] of existingSitesRef) {
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
            for (const energyObj of energyList) {
                await EnergyAccountController.checkEnergyAccountObj(params, energyObj);

                // Get existing sites
                let existingSitesRef: Map<string, DataReference>;
                try {
                    existingSitesRef = await StarPrivateDataService.getObjRefbyId(
                        params, {docType: DocType.SITE, id: energyObj.meteringPointMrid});
                } catch (error) {
                    throw new Error('ERROR createEnergyAccount : '
                        .concat(error.message).concat(` Can not be created.`));
                }

                for (const [key ] of existingSitesRef) {
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

        const energyObj: EnergyAccount = EnergyAccount.formatString(inputStr);
        await EnergyAccountController.checkEnergyAccountObj(params, energyObj);

        // Get existing data
        let existingEnergyAccountRef: Map<string, DataReference>;
        try {
            existingEnergyAccountRef = await StarPrivateDataService.getObjRefbyId(
                params, {docType: DocType.ENERGY_ACCOUNT, id: energyObj.energyAccountMarketDocumentMrid});
        } catch (error) {
            throw new Error(error.message.concat(` Can not be updated.`));
        }

        for (const [key ] of existingEnergyAccountRef) {
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
            for (const energyObj of energyList) {
                await EnergyAccountController.checkEnergyAccountObj(params, energyObj);

                // Get existing data
                let existingEnergyAccountRef: Map<string, DataReference>;
                try {
                    existingEnergyAccountRef = await StarPrivateDataService.getObjRefbyId(
                        params, {docType: DocType.ENERGY_ACCOUNT, id: energyObj.energyAccountMarketDocumentMrid});
                } catch (error) {
                    throw new Error(error.message.concat(` Can not be updated.`));
                }

                for (const [key ] of existingEnergyAccountRef) {
                    await EnergyAccountService.write(params, energyObj, key);
                }
            }
        }

        params.logger.info('============= END   : Update %s EnergyAccount List ===========');
    }

    public static async dataExists(
        params: STARParameters,
        id: string,
        target: string = ''): Promise<boolean> {
        params.logger.debug('============= START : dataExists EnergyAccount Controller ===========');

        let existing: boolean = false;

        try {
            const result: Map<string, DataReference> = await StarPrivateDataService.getObjRefbyId(
                params, {docType: DocType.ENERGY_ACCOUNT, id});

            if (target && target.length > 0) {
                const dataReference: DataReference = result.get(target);
                existing = dataReference
                    && dataReference.data
                    && dataReference.data.energyAccountMarketDocumentMrid === id;
            } else {
                existing = result
                    && result.values().next().value
                    && result.values().next().value.data
                    && result.values().next().value.data.energyAccountMarketDocumentMrid === id;
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
            systemOperatorEicCode: string): Promise<string> {
        params.logger.info('============= START : get EnergyAccount For SystemOperator ===========');

        const allResults = await EnergyAccountController.getEnergyAccountForSystemOperatorObj(
            params, meteringPointMrid, systemOperatorEicCode);
        const formated = JSON.stringify(allResults);

        params.logger.info('=============  END  : get EnergyAccount For SystemOperator ===========');
        return formated;
    }

    public static async getEnergyAccountForSystemOperatorObj(
        params: STARParameters,
        meteringPointMrid: string,
        systemOperatorEicCode: string,
        target: string = ''): Promise<any[]> {
        params.logger.debug('============= START : get EnergyAccount Obj For SystemOperator ===========');

        const identity = params.values.get(ParametersType.IDENTITY);
        if (identity !== OrganizationTypeMsp.RTE && identity !== OrganizationTypeMsp.ENEDIS) {
            throw new Error(`Organisation, ${identity} does not have read access for Energy Account.`);
        }



        const args: string[] = [];
        args.push(`"meteringPointMrid": "${meteringPointMrid}"`);

        if (identity !== OrganizationTypeMsp.RTE) {
            args.push(`"senderMarketParticipantMrid": "${systemOperatorEicCode}"`);
        }

        const query = await QueryStateService.buildQuery({documentType: DocType.ENERGY_ACCOUNT, queryArgs: args});

        params.logger.debug('=============  END  : get EnergyAccount Obj For SystemOperator ===========');
        return await EnergyAccountService.getQueryArrayResult(params, query, target);
    }

    public static async getEnergyAccountByQuery(
        params: STARParameters,
        query: string): Promise<any> {
        params.logger.info('============= START : get EnergyAccount Obj By Query ===========');

        params.logger.debug('getEnergyAccountByQuery - query: ', query);

        const results = await EnergyAccountService.getQueryArrayResult(params, query);

        // Filter duplicates data
        const finalResults = await this.filterEnergyAccountElements(params, results);

        params.logger.info('=============  END  : get EnergyAccount Obj By Query ===========');
        return finalResults;
    }

    private static async filterEnergyAccountElements(
        params: STARParameters,
        energyAccountList: EnergyAccount[]): Promise<EnergyAccount[]> {
        params.logger.debug('============= START : filterEnergyAccountElements ===========');

        const energyAccountResultList: EnergyAccount[] = [];
        const mapEnergyAccount: Map<string, EnergyAccount> = new Map();

        if (energyAccountList && energyAccountList.length > 0) {
            for (const energyAccount of energyAccountList) {
                let key = energyAccount.meteringPointMrid;
                key = key.concat(energyAccount.receiverMarketParticipantMrid);
                key = key.concat(energyAccount.startCreatedDateTime);
                key = key.concat(energyAccount.endCreatedDateTime);
                key = key.concat(energyAccount.processType);

                if (mapEnergyAccount.has(key)) {
                    const mapValue = mapEnergyAccount.get(key);
                    if (energyAccount.createdDateTime >= mapValue.createdDateTime) {
                        mapEnergyAccount.set(key, JSON.parse(JSON.stringify(energyAccount)));
                    }
                } else {
                    mapEnergyAccount.set(key, JSON.parse(JSON.stringify(energyAccount)));
                }
            }
        }

        for (const energyAccount of mapEnergyAccount.values()) {
            energyAccountResultList.push(energyAccount);
        }

        params.logger.debug('=============  END  : filterEnergyAccountElements ===========');
        return energyAccountResultList;
    }

    public static async getEnergyAccountByProducer(
        params: STARParameters,
        meteringPointMrid: string,
        producerEicCode: string,
        startCreatedDateTime: string): Promise<string> {
        params.logger.info('============= START : get EnergyAccount By Producer ===========');

        const identity = params.values.get(ParametersType.IDENTITY);
        if (identity !== OrganizationTypeMsp.PRODUCER) {
            throw new Error(`Organisation, ${identity} does not have read access for producer's Energy Account.`);
        }

        const args: string[] = [];
        args.push(`"meteringPointMrid":"${meteringPointMrid}"`);
        args.push(`"receiverMarketParticipantMrid":"${producerEicCode}"`);
        args.push(`"startCreatedDateTime":{"$lte":${JSON.stringify(startCreatedDateTime)}}`);

        const argOrEnd: string[] = [];
        argOrEnd.push(`"endCreatedDateTime":{"$gte": ${JSON.stringify(startCreatedDateTime)}}`);
        argOrEnd.push(`"endCreatedDateTime":""`);
        argOrEnd.push(`"endCreatedDateTime":{"$exists": false}`);
        args.push(await QueryStateService.buildORCriteria(argOrEnd));

        const query = await QueryStateService.buildQuery({documentType: DocType.ENERGY_ACCOUNT, queryArgs: args});
        params.logger.debug('getEnergyAccountByProducer - query: ', query);

        const allResults: EnergyAccount[] = await EnergyAccountService.getQueryArrayResult(params, query);

        const formated = JSON.stringify(allResults);

        params.logger.info('=============  END  : get EnergyAccount By Producer ===========');
        return formated;
    }

    private static async checkEnergyAccountObj(
        params: STARParameters,
        energyObj: EnergyAccount,
        target: string = ''): Promise<void> {
        params.logger.debug('============= START : Check EnergyAccount Obj ===========');

        const identity = params.values.get(ParametersType.IDENTITY);
        if (identity !== OrganizationTypeMsp.RTE && identity !== OrganizationTypeMsp.ENEDIS) {
            throw new Error(`Organisation, ${identity} does not have rights for Energy Account.`);
        }

        const processTypeComptage: string[] = params.values.get(ParametersType.PROCESS_TYPE_COMPTAGE);
        // If processType is "Comptage" then check the number of points
        // The number points is not checked when the processType is "Reference"
        if (processTypeComptage.includes(energyObj.processType)) {
            try {
                const nbExpectedPoints = await this.getExpectedNumberPoints(params, energyObj);
                if (nbExpectedPoints !== energyObj.timeSeries.length) {
                    throw new Error(`timeSeries[${energyObj.timeSeries.length}] does not respect the expected number of points ${nbExpectedPoints}`);
                }
            } catch (error) {
                throw new Error('ERROR createEnergyAccount : '.concat(error.message).concat(` for Energy Account ${energyObj.energyAccountMarketDocumentMrid} creation.`));
            }
        }

        let siteObj: Site;
        let siteRef: DataReference;
        try {
            const siteRefMap: Map<string, DataReference> = await StarPrivateDataService.getObjRefbyId(
                params, {docType: DocType.SITE, id: energyObj.meteringPointMrid});
            if (target && target.length > 0) {
                siteRef = siteRefMap.get(target);
            } else {
                siteRef = siteRefMap.values().next().value;
            }
        } catch (error) {
            throw new Error('ERROR createEnergyAccount : '.concat(error.message).concat(` for Energy Account ${energyObj.energyAccountMarketDocumentMrid} creation.`));
        }

        if (!siteRef
            || (siteRef.collection !== target && !target && target.length > 0)
            || !siteRef.data.meteringPointMrid
            || siteRef.data.meteringPointMrid !== energyObj.meteringPointMrid) {
                throw new Error(`ERROR createEnergyAccount : Site : ${energyObj.meteringPointMrid} does not exist for Energy Account ${energyObj.energyAccountMarketDocumentMrid} creation.`);
        }
        siteObj = siteRef.data;

        let systemOperatorObj: SystemOperator;
        try {
            systemOperatorObj = await StarDataService.getObj(
                params, {id: energyObj.senderMarketParticipantMrid, docType: DocType.SYSTEM_OPERATOR});
        } catch (error) {
            throw new Error('ERROR createEnergyAccount : '.concat(error.message).concat(` for Energy Account ${energyObj.energyAccountMarketDocumentMrid} creation.`));
        }

        if (!systemOperatorObj
            || !systemOperatorObj.systemOperatorMarketParticipantName) {

            throw new Error('ERROR createEnergyAccount : unknown senderMarketParticipantMrid '.concat(energyObj.senderMarketParticipantMrid).concat(` for Energy Account ${energyObj.energyAccountMarketDocumentMrid} creation.`));
        }

        if (!identity.toLowerCase().includes(systemOperatorObj.systemOperatorMarketParticipantName.toLowerCase())) {
            throw new Error(
                `Energy Account, sender: ${identity} does not have rights for ${energyObj.energyAccountMarketDocumentMrid}. (Wrong SystemOperator)`,
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

    private static async getExpectedNumberPoints(params: STARParameters, energyObj: EnergyAccount): Promise<number> {
        const startIndicator: string = params.values.get(ParametersType.ENERGY_ACCOUNT_TIME_INTERVAL_START);

        const valueArray = energyObj.resolution.split(startIndicator);

        if (valueArray.length !== 2 ) {
            throw new Error(`invalid resolution`);
        }

        let nbExpectedPoints: number = 0;

        // Hour Changement Management
        const startDate = CommonService.formatDateStr(energyObj.startCreatedDateTime);
        const endDate = CommonService.formatDateStr(energyObj.endCreatedDateTime);
        const hoursBeforeEndDay = CommonService.getHoursBeforeEndDayStr(energyObj.startCreatedDateTime);
        const hoursFromStartDay = CommonService.getHoursFromStartDayStr(energyObj.endCreatedDateTime);

        const lapTimeLess1HDays: string[] =
            params.values.get(ParametersType.ENERGY_ACCOUNT_TIME_INTERVAL_LAPsec_LESS1H_DAYS);
        const lapTimePlus1HDays: string[] =
            params.values.get(ParametersType.ENERGY_ACCOUNT_TIME_INTERVAL_LAPsec_PLUS1H_DAYS);



        if ((lapTimeLess1HDays.includes(startDate) && hoursBeforeEndDay > 12)
            || (endDate && lapTimeLess1HDays.includes(endDate) && hoursFromStartDay > 12)) {
            const lapTimeStr: string = params.values.get(ParametersType.ENERGY_ACCOUNT_TIME_INTERVAL_LAPsec_LESS1H);
            nbExpectedPoints = parseInt(lapTimeStr, 10);
        } else if (lapTimePlus1HDays.includes(startDate) || (endDate && lapTimePlus1HDays.includes(endDate))) {
            const lapTimeStr: string = params.values.get(ParametersType.ENERGY_ACCOUNT_TIME_INTERVAL_LAPsec_PLUS1H);
            nbExpectedPoints = parseInt(lapTimeStr, 10);
        } else {
            const lapTimeStr: string = params.values.get(ParametersType.ENERGY_ACCOUNT_TIME_INTERVAL_LAPsec);
            nbExpectedPoints = parseInt(lapTimeStr, 10);
        }

        const minutesIndicator: string = params.values.get(ParametersType.ENERGY_ACCOUNT_TIME_INTERVAL_MINUTES);
        const valueMinutesArray = valueArray[1].split(minutesIndicator);
        try {
            if (valueMinutesArray.length === 2) {
                nbExpectedPoints = nbExpectedPoints / 60;

                let nbMinutes: number = 0;
                nbMinutes = parseInt(valueMinutesArray[0], 10);

                nbExpectedPoints = nbExpectedPoints / nbMinutes;
            } else {
                const secondsIndicator: string = params.values.get(ParametersType.ENERGY_ACCOUNT_TIME_INTERVAL_SECONDS);
                let nbSeconds: number = 0;
                const valueSecondsArray = valueArray[1].split(secondsIndicator);
                if (valueSecondsArray.length === 2) {
                    nbSeconds = parseInt(valueSecondsArray[0], 10);
                }

                nbExpectedPoints = nbExpectedPoints / nbSeconds;
            }
        } catch (error) {
            throw new Error(`invalid resolution`);
        }

        params.logger.debug('*********************************');
        params.logger.debug('energyObj.energyAccountMarketDocumentMrid');
        params.logger.debug(energyObj.energyAccountMarketDocumentMrid);
        params.logger.debug('energyObj.startCreatedDateTime');
        params.logger.debug(energyObj.startCreatedDateTime);
        params.logger.debug('startDate');
        params.logger.debug(startDate);
        params.logger.debug('hoursBeforeEndDay');
        params.logger.debug(hoursBeforeEndDay);
        params.logger.debug('energyObj.endCreatedDateTime');
        params.logger.debug(energyObj.endCreatedDateTime);
        params.logger.debug('endDate');
        params.logger.debug(endDate);
        params.logger.debug('hoursFromStartDay');
        params.logger.debug(hoursFromStartDay);
        params.logger.debug('lapTimeLess1HDays');
        params.logger.debug(lapTimeLess1HDays);
        params.logger.debug('lapTimePlus1HDays');
        params.logger.debug(lapTimePlus1HDays);
        params.logger.debug('nbExpectedPoints');
        params.logger.debug(nbExpectedPoints);
        params.logger.debug('*********************************');

        return nbExpectedPoints;
    }
}
