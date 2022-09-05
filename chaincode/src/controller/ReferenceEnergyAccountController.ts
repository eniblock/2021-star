import { OrganizationTypeMsp } from '../enums/OrganizationMspType';
import { ParametersType } from '../enums/ParametersType';
import { DocType } from '../enums/DocType';

import { EnergyAccount } from '../model/energyAccount';
import { Site } from '../model/site';
import { SystemOperator } from '../model/systemOperator';
import { STARParameters } from '../model/starParameters';
import { DataReference } from '../model/dataReference';

import { QueryStateService } from './service/QueryStateService';
import { ReferenceEnergyAccountService } from './service/ReferenceEnergyAccountService';
import { StarPrivateDataService } from './service/StarPrivateDataService';
import { StarDataService } from './service/StarDataService';

export class ReferenceEnergyAccountController {



    public static async createReferenceEnergyAccount(
        params: STARParameters,
        inputStr: string) {
        params.logger.info('============= START : Create ReferenceEnergyAccount ===========');

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

        await ReferenceEnergyAccountController.createReferenceEnergyAccountObj(params, energyObj);

        params.logger.info('============= END   : Create %s ReferenceEnergyAccount ===========',
            energyObj.energyAccountMarketDocumentMrid,
        );
    }



    public static async createReferenceEnergyAccountByReference(
        params: STARParameters,
        dataReference: DataReference) {
        params.logger.debug('============= START : Create ReferenceEnergyAccount by Reference ===========');

        await ReferenceEnergyAccountController.createReferenceEnergyAccountObj(params, dataReference.data, dataReference.collection);

        params.logger.debug('============= END   : Create %s ReferenceEnergyAccount by Reference ===========',
            dataReference.data.energyAccountMarketDocumentMrid,
        );
    }



    public static async createReferenceEnergyAccountObj(
        params: STARParameters,
        energyObj: EnergyAccount,
        target: string = '') {
        params.logger.debug('============= START : Create ReferenceEnergyAccount Obj ===========');

        const identity = params.values.get(ParametersType.IDENTITY);
        if (identity !== OrganizationTypeMsp.RTE) {
            throw new Error(`Organisation, ${identity} does not have write access for Reference Energy Account.`);
        }


        if (!energyObj.marketEvaluationPointMrid) {
            throw new Error(`ERROR createReferenceEnergyAccount, missing marketEvaluationPointMrid.`);
        } else if (!energyObj.processType) {
            throw new Error(`ERROR createReferenceEnergyAccount, missing processType.`);
        }

        let siteObj: Site;
        var existingSitesRef:Map<string, DataReference>;
        try {
            existingSitesRef = await StarPrivateDataService.getObjRefbyId(params, {docType: DocType.SITE, id: energyObj.meteringPointMrid});
            var siteObjRef:DataReference;
            if (target && target.length > 0) {
                siteObjRef = existingSitesRef.get(target);
            } else {
                siteObjRef = existingSitesRef.values().next().value;
            }
            siteObj = siteObjRef.data;
        } catch (error) {
            throw new Error('ERROR createReferenceEnergyAccount : '.concat(error.message).concat(` for Reference Energy Account ${energyObj.energyAccountMarketDocumentMrid} creation.`));
        }

        let systemOperatorObj: SystemOperator;
        try {
            systemOperatorObj = await StarDataService.getObj(params, {id: energyObj.senderMarketParticipantMrid, docType: DocType.SYSTEM_OPERATOR});
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

        if (target && target.length > 0) {
            await ReferenceEnergyAccountService.write(params, energyObj, target);
        }else {
            for (var [key, ] of existingSitesRef) {
                await ReferenceEnergyAccountService.write(params, energyObj, key);
            }
        }

        params.logger.debug('============= END   : Create %s ReferenceEnergyAccount Obj ===========',
            energyObj.energyAccountMarketDocumentMrid,
        );
    }




    public static async getReferenceEnergyAccountForSystemOperator(
        params: STARParameters,
        meteringPointMrid: string,
        systemOperatorEicCode: string,
        startCreatedDateTime: string): Promise<string> {
        params.logger.info('============= START : get ReferenceEnergyAccount For SystemOperator ===========');

        const allResults = await ReferenceEnergyAccountController.getReferenceEnergyAccountForSystemOperatorObj(
            params, meteringPointMrid, systemOperatorEicCode, startCreatedDateTime);
        const formated = JSON.stringify(allResults);

        params.logger.info('=============  END  : get ReferenceEnergyAccount For SystemOperator ===========');
        return formated;

    }


    public static async getReferenceEnergyAccountForSystemOperatorObj(
        params: STARParameters,
        meteringPointMrid: string,
        systemOperatorEicCode: string,
        startCreatedDateTime: string,
        target: string = ''): Promise<any[]> {
        params.logger.debug('============= START : get ReferenceEnergyAccount Obj For SystemOperator ===========');

        const identity = params.values.get(ParametersType.IDENTITY);
        if (identity !== OrganizationTypeMsp.RTE) {
            throw new Error(`Organisation, ${identity} does not have read access for Reference Energy Account.`);
        }

        const dateUp = new Date(startCreatedDateTime);

        dateUp.setUTCHours(0,0,0,0);
        // params.logger.log('dateUp=', JSON.stringify(dateUp));
        const dateDown = new Date(dateUp.getTime() + 86399999);
        // params.logger.log('dateDown=', JSON.stringify(dateDown));

        try {
            await StarDataService.getObj(params, {id: systemOperatorEicCode, docType: DocType.SYSTEM_OPERATOR});
        } catch (error) {
            throw new Error('ERROR createReferenceEnergyAccount : '.concat(error.message));
        }

        var args: string[] = [];
        args.push(`"meteringPointMrid": "${meteringPointMrid}"`);
        args.push(`"createdDateTime":{"$gte":${JSON.stringify(dateUp)},"$lte":${JSON.stringify(dateDown)}}`);
        const query = await QueryStateService.buildQuery(DocType.REFERENCE_ENERGY_ACCOUNT, args, [`"createdDateTime":"desc"`]);

        const allResults = await ReferenceEnergyAccountService.getQueryArrayResult(params, query, target);

        params.logger.debug('=============  END  : get ReferenceEnergyAccount Obj For SystemOperator ===========');

        return allResults;
    }




    public static async getReferenceEnergyAccountByProducer(
        params: STARParameters,
        meteringPointMrid: string,
        producerEicCode: string,
        startCreatedDateTime: string): Promise<string> {
        params.logger.info('============= START : get ReferenceEnergyAccount By Producer ===========');

        const identity = params.values.get(ParametersType.IDENTITY);
        if (identity !== OrganizationTypeMsp.PRODUCER) {
            throw new Error(`Organisation, ${identity} does not have read access for producer's Reference Energy Account.`);
        }
        const dateUp = new Date(startCreatedDateTime);

        dateUp.setUTCHours(0,0,0,0);
        // params.logger.log('dateUp=', JSON.stringify(dateUp));
        const dateDown = new Date(dateUp.getTime() + 86399999);
        // params.logger.log('dateDown=', JSON.stringify(dateDown));

        var args: string[] = [];
        args.push(`"meteringPointMrid": "${meteringPointMrid}"`);
        args.push(`"receiverMarketParticipantMrid": "${producerEicCode}"`);
        args.push(`"createdDateTime":{"$gte":${JSON.stringify(dateUp)},"$lte":${JSON.stringify(dateDown)}}`);
        const query = await QueryStateService.buildQuery(DocType.REFERENCE_ENERGY_ACCOUNT, args, [`"createdDateTime":"desc"`]);

        const allResults = await ReferenceEnergyAccountService.getQueryStringResult(params, query);

        params.logger.info('============= START : get ReferenceEnergyAccount By Producer ===========');

        return allResults;
    }
}
