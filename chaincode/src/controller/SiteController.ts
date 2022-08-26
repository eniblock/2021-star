import { Context } from 'fabric-contract-api';

import { OrganizationTypeMsp } from '../enums/OrganizationMspType';
import { ParametersType } from '../enums/ParametersType';

import { STARParameters } from '../model/starParameters';
import { Site } from '../model/site';

import { SiteService } from './service/SiteService';
import { SystemOperatorService } from './service/SystemOperatorService';
import { ProducerService } from './service/ProducerService';
import { Producer } from '../model/producer';
import { DataReference } from '../model/dataReference';
import { ActivationDocumentService } from './service/ActivationDocumentService';
import { HLFServices } from './service/HLFservice';

export class SiteController {
    public static async createSite(
        ctx: Context,
        params: STARParameters,
        inputStr: string): Promise<void> {

        const siteObj: Site = Site.formatString(inputStr);
        await this.createSiteObj(ctx, params, siteObj);
    }

    public static async createSiteByReference(
        ctx: Context,
        params: STARParameters,
        dataReference: DataReference): Promise<void> {

        await this.createSiteObj(ctx, params, dataReference.data, dataReference.collection);
    }



    public static async createSiteObj(
        ctx: Context,
        params: STARParameters,
        siteObj: any,
        target: string = ''): Promise<void> {
        console.info('============= START : createSiteObj Site ===========');

        Site.schema.validateSync(
            siteObj,
            {strict: true, abortEarly: false},
        );

        const identity = params.values.get(ParametersType.IDENTITY);
        if (siteObj.marketEvaluationPointMrid && siteObj.schedulingEntityRegisteredResourceMrid) {
            if (identity !== OrganizationTypeMsp.RTE) {
                throw new Error(`Organisation, ${identity} does not have write access for HTB(HV) sites`);
            }
        } else if (!siteObj.marketEvaluationPointMrid && !siteObj.schedulingEntityRegisteredResourceMrid) {
            if (identity !== OrganizationTypeMsp.ENEDIS) {
                throw new Error(`Organisation, ${identity} does not have write access for HTA(MV) sites`);
            }
        } else {
            throw new Error(`marketEvaluationPointMrid and schedulingEntityRegisteredResourceMrid must be both present for HTB site or absent for HTA site.`);
        }
        try {
            await SystemOperatorService.getRaw(ctx, siteObj.systemOperatorMarketParticipantMrid);
        } catch(error) {
            throw new Error(error.message.concat(' for site creation'));
        }

        let producerObj : Producer;
        try {
            producerObj = await ProducerService.getObj(ctx, siteObj.producerMarketParticipantMrid);
        } catch(error) {
            throw new Error(error.message.concat(' for site creation'));
        }

        siteObj.producerMarketParticipantName = producerObj.producerMarketParticipantName;

        await SiteService.write(ctx, params, siteObj, target);
        console.info('============= END   : createSiteObj %s Site ===========',
            siteObj.meteringPointMrid,
        );
    }





    public static async updateSite(
        ctx: Context,
        params: STARParameters,
        inputStr: string): Promise<void> {

        let siteObj: Site;
        try {
            siteObj = JSON.parse(inputStr);
        } catch (error) {
            throw new Error(`ERROR updateSite-> Input string NON-JSON value`);
        }
        Site.schema.validateSync(
            siteObj,
            {strict: true, abortEarly: false},
        );
        const identity = params.values.get(ParametersType.IDENTITY);
        if (siteObj.marketEvaluationPointMrid && siteObj.schedulingEntityRegisteredResourceMrid) {
            if (identity !== OrganizationTypeMsp.RTE) {
                throw new Error(`Organisation, ${identity} does not have write access for HTB(HV) sites`);
            }
        } else if (!siteObj.marketEvaluationPointMrid && !siteObj.schedulingEntityRegisteredResourceMrid) {
            if (identity !== OrganizationTypeMsp.ENEDIS) {
                throw new Error(`Organisation, ${identity} does not have write access for HTA(MV) sites`);
            }
        } else {
            throw new Error(`marketEvaluationPointMrid and schedulingEntityRegisteredResourceMrid must be both present for HTB site or absent for HTA site.`);
        }

        var existingSitesRef:Map<string, DataReference>;
        try {
            existingSitesRef = await SiteService.getObjRefbyId(ctx, params, siteObj.meteringPointMrid);
        } catch(error) {
            throw new Error(error.message.concat(' for site update'));
        }

        try {
            await SystemOperatorService.getRaw(ctx, siteObj.systemOperatorMarketParticipantMrid);
        } catch(error) {
            throw new Error(error.message.concat(' for site update'));
        }

        try {
            await ProducerService.getRaw(ctx, siteObj.producerMarketParticipantMrid);
        } catch(error) {
            throw new Error(error.message.concat(' for site update'));
        }

        for (var [key, ] of existingSitesRef) {
            await SiteService.write(ctx, params, siteObj, key);
        }

        console.info('============= END : Update %s Site ===========',
            siteObj.meteringPointMrid,
        );
    }




    public static async querySite(
        ctx: Context,
        params: STARParameters,
        siteId: string): Promise<string> {

        console.info('============= START : Query %s Site ===========', siteId);
        const result:Map<string, DataReference> = await SiteService.getObjRefbyId(ctx, params, siteId);
        const dataReference = result.values().next().value;

        console.debug(siteId, JSON.stringify(dataReference.data));
        console.info('============= END   : Query %s Site ===========', siteId);
        return JSON.stringify(dataReference.data);
    }




    public static async siteExists(
        ctx: Context,
        params: STARParameters,
        siteId: string): Promise<boolean> {

        console.info('============= START : Query %s Site ===========', siteId);
        const result:Map<string, DataReference> = await SiteService.getObjRefbyId(ctx, params, siteId);
        return result && result.values().next().value && result.values().next().value.data && result.values().next().value.collection.length !== 0;
    }



    public static async getSiteById(
        ctx: Context,
        params: STARParameters,
        id: string,
        target: string = ''): Promise<Site> {

        let siteObj: Site;
        if (target && target.length > 0) {
            siteObj = await SiteService.getObj(ctx, params, id, target);
        } else {
            const result:Map<string, DataReference> = await SiteService.getObjRefbyId(ctx, params, id);
            const dataReference = result.values().next().value;
            if (dataReference && dataReference.data) {
                siteObj = dataReference.data;
            }
        }

        return siteObj;
    }




    public static async getSitesBySystemOperator(
        ctx: Context,
        params: STARParameters,
        systemOperatorMarketParticipantMrid: string): Promise<string> {

        const query = `{"selector": {"docType": "site", "systemOperatorMarketParticipantMrid": "${systemOperatorMarketParticipantMrid}"}}`;
        const allResults = await SiteService.getQueryStringResult(ctx, params, query);

        return allResults;
    }




    public static async getSitesByProducer(
        ctx: Context,
        params: STARParameters,
        producerMarketParticipantMrid: string): Promise<string> {

        const query = `{"selector": {"docType": "site", "producerMarketParticipantMrid": "${producerMarketParticipantMrid}"}}`;
        const allResults = await SiteService.getQueryStringResult(ctx, params, query);

        return allResults;
    }




    public static async getSitesByQuery(
        ctx: Context,
        params: STARParameters,
        query: string): Promise<any> {

        //Implementaition calling QueryResult (without Pagination)
        // const iterator = await SiteService.getQueryResult(ctx, query);
        // let results = await this.getAllResults(iterator);

        let results = await SiteService.getQueryArrayResult(ctx, params, query);

        return results;
    }


    // static async getAllResults(iterator: Iterators.StateQueryIterator): Promise<any[]> {
    //     const allResults = [];
    //     let result = await iterator.next();
    //     while (!result.done) {
    //         const strValue = Buffer.from(result.value.value.toString()).toString('utf8');
    //         let record;
    //         try {
    //             record = JSON.parse(strValue);
    //         } catch (err) {
    //             record = strValue;
    //         }
    //         allResults.push(record);
    //         result = await iterator.next();
    //     }
    //     return allResults;
    // }
}
