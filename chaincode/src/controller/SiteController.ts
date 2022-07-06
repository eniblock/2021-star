import { Context } from 'fabric-contract-api';

import { OrganizationTypeMsp } from '../enums/OrganizationMspType';
import { ParametersType } from '../enums/ParametersType';

import { STARParameters } from '../model/starParameters';
import { Site } from '../model/site';

import { SiteService } from './service/SiteService';
import { SystemOperatorService } from './service/SystemOperatorService';
import { ProducerService } from './service/ProducerService';
import { Producer } from '../model/producer';

export class SiteController {
    public static async createSite(
        ctx: Context,
        params: STARParameters,
        inputStr: string): Promise<void> {
        // let site: Site;
        // try {
        //     site = JSON.parse(inputStr);
        //   } catch (error) {
        //     // console.error('error=', error);
        //     throw new Error(`ERROR createSite-> Input string NON-JSON value`);
        //   }
        console.info('============= START : Create Site ===========');

        let siteObj: Site;
        try {
            siteObj = JSON.parse(inputStr);
        } catch (error) {
            throw new Error(`ERROR createSite-> Input string NON-JSON value`);
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

        await SiteService.write(ctx, params, siteObj);
        console.info('============= END   : Create %s Site ===========',
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
        const siteAsBytes = await SiteService.getRaw(ctx, params, siteObj.meteringPointMrid);
        if (!siteAsBytes || siteAsBytes.length === 0) {
            throw new Error(`${siteObj} does not exist. Can not be updated.`);
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

        await SiteService.write(ctx, params, siteObj);
        console.info('============= END : Update %s Site ===========',
            siteObj.meteringPointMrid,
        );
    }




    public static async querySite(
        ctx: Context,
        params: STARParameters,
        siteId: string): Promise<string> {

        console.info('============= START : Query %s Site ===========', siteId);
        const siteAsBytes = await SiteService.getRaw(ctx, params, siteId);
        console.debug(siteId, siteAsBytes.toString());
        console.info('============= END   : Query %s Site ===========', siteId);
        return siteAsBytes.toString();
    }




    public static async siteExists(
        ctx: Context,
        params: STARParameters,
        siteId: string): Promise<boolean> {

        console.info('============= START : Query %s Site ===========', siteId);
        const siteAsBytes = await SiteService.getRaw(ctx, params, siteId);
        return siteAsBytes && siteAsBytes.length !== 0;
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
