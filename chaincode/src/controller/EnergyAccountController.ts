
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

export class EnergyAccountController {

    public static async createEnergyAccount(
        params: STARParameters,
        inputStr: string) {
        console.debug('============= START : Create EnergyAccount ===========');

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

        console.debug('============= END   : Create %s EnergyAccount ===========',
            energyObj.energyAccountMarketDocumentMrid,
        );
    }




    public static async createEnergyAccountList(
        params: STARParameters,
        inputStr: string) {
        console.debug('============= START : Create createEnergyAccountList ===========');

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

        console.debug('============= END   : Create createEnergyAccountList ===========');
    }




    public static async createEnergyAccountByReference(
        params: STARParameters,
        dataReference: DataReference) {
        console.debug('============= START : Create EnergyAccount by Reference ===========');

        await EnergyAccountController.checkEnergyAccountObj(params, dataReference.data, dataReference.collection);
        await EnergyAccountService.write(params, dataReference.data, dataReference.collection);

        console.debug('============= END   : Create %s EnergyAccount by Reference ===========',
            dataReference.data.energyAccountMarketDocumentMrid,
        );
    }




    public static async updateEnergyAccount(
        params: STARParameters,
        inputStr: string) {
        console.debug('============= START : Update EnergyAccount ===========');

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

        console.debug('============= END   : Update %s EnergyAccount ===========',
        energyObj.energyAccountMarketDocumentMrid,
        );
    }


    public static async updateEnergyAccountList(
        params: STARParameters,
        inputStr: string) {
        console.debug('============= START : Update EnergyAccount List ===========');

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

        console.debug('============= END   : Update %s EnergyAccount List ===========');
    }


    private static async checkEnergyAccountObj(
        params: STARParameters,
        energyObj:EnergyAccount,
        target: string = ''): Promise<void>{

        const identity = params.values.get(ParametersType.IDENTITY);
        if (identity !== OrganizationTypeMsp.RTE && identity !== OrganizationTypeMsp.ENEDIS) {
            throw new Error(`Organisation, ${identity} does not have write access for Energy Account.`);
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
            throw new Error(`Energy Account, sender: ${energyObj.senderMarketParticipantMrid} does is not the same as site.systemOperator: ${siteObj.systemOperatorMarketParticipantMrid} in EnergyAccount.`);
        }

        if (identity === OrganizationTypeMsp.RTE && !energyObj.marketEvaluationPointMrid) {
            throw new Error(`Energy Account, missing marketEvaluationPointMrid optionnal for HTA but required for HTB in EnergyAccount.`);
        } else if (identity === OrganizationTypeMsp.ENEDIS && energyObj.marketEvaluationPointMrid) {
            throw new Error(`Energy Account, presence of marketEvaluationPointMrid optionnal for HTA but required for HTB in EnergyAccount.`);
        }
    }


    public static async dataExists(
        params: STARParameters,
        id: string,
        target: string = ''): Promise<boolean> {

        let existing: boolean = false;
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

        return existing;
    }






    public static async getEnergyAccountForSystemOperator(
            params: STARParameters,
            meteringPointMrid: string,
            systemOperatorEicCode: string,
            startCreatedDateTime: string): Promise<string> {

        const allResults = await EnergyAccountController.getEnergyAccountForSystemOperatorObj(
            params, meteringPointMrid, systemOperatorEicCode, startCreatedDateTime);
        const formated = JSON.stringify(allResults);

        return formated;
    }




    public static async getEnergyAccountForSystemOperatorObj(
        params: STARParameters,
        meteringPointMrid: string,
        systemOperatorEicCode: string,
        startCreatedDateTime: string,
        target: string = ''): Promise<any[]> {

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
        const query = await QueryStateService.buildQuery(DocType.ENERGY_ACCOUNT, args);

        return await EnergyAccountService.getQueryArrayResult(params, query, target);
    }





    public static async getEnergyAccountByQuery(
        params: STARParameters,
        query: string): Promise<any> {

            const identity = params.values.get(ParametersType.IDENTITY);
        if (identity !== OrganizationTypeMsp.RTE && identity !== OrganizationTypeMsp.ENEDIS) {
            throw new Error(`Organisation, ${identity} does not have read access for Energy Account.`);
        }

        let results = await EnergyAccountService.getQueryArrayResult(params, query);
        return results;
    }





    public static async getEnergyAccountByProducer(
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

        // const query = await QueryStateService.buildQuery(DocType.ENERGY_ACCOUNT, args, [`"createdDateTime":"desc"`]);
        const query = await QueryStateService.buildQuery(DocType.ENERGY_ACCOUNT, args);

        const allResults = await EnergyAccountService.getQueryArrayResult(params, query);
        const formated = JSON.stringify(allResults);
        return formated;
    }
}
