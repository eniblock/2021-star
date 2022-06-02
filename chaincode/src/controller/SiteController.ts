import { Context } from 'fabric-contract-api';
import { OrganizationTypeMsp } from '../enums/OrganizationMspType';
import { Site } from '../model/site';
import { Iterators } from 'fabric-shim';
import { SiteService } from './service/SiteService';
import { HLFServices } from './service/HLFservice';
import { SystemOperatorService } from './service/SystemOperatorService';
import { ProducerService } from './service/ProducerService';

export class SiteController {
    public static async createSite(
        ctx: Context,
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

        const siteInput = Site.schema.validateSync(
            siteObj,
            {strict: true, abortEarly: false},
        );

        const identity = await HLFServices.getMspID(ctx);
        if (siteInput.marketEvaluationPointMrid && siteInput.schedulingEntityRegisteredResourceMrid) {
            if (identity !== OrganizationTypeMsp.RTE) {
                throw new Error(`Organisation, ${identity} does not have write access for HTB(HV) sites`);
            }
        } else if (!siteInput.marketEvaluationPointMrid && !siteInput.schedulingEntityRegisteredResourceMrid) {
            if (identity !== OrganizationTypeMsp.ENEDIS) {
                throw new Error(`Organisation, ${identity} does not have write access for HTA(MV) sites`);
            }
        } else {
            throw new Error(`marketEvaluationPointMrid and schedulingEntityRegisteredResourceMrid must be both present for HTB site or absent for HTA site.`);
        }
        var systemOperatorAsBytes: Uint8Array;
        try {
            systemOperatorAsBytes = await SystemOperatorService.getRaw(ctx, siteInput.systemOperatorMarketParticipantMrid);
        } catch(error) {
            throw new Error(error.message.concat(' for site creation'));
        }

        var producerAsBytes: Uint8Array;
        try {
            producerAsBytes = await ProducerService.getRaw(ctx, siteInput.producerMarketParticipantMrid);
        } catch(error) {
            throw new Error(error.message.concat(' for site creation'));
        }

        await SiteService.write(ctx, siteInput);
        console.info(
            '============= END   : Create %s Site ===========',
            siteInput.meteringPointMrid,
        );
    }





    public static async updateSite(ctx: Context, inputStr: string): Promise<void> {
        let siteObj: Site;
        try {
            siteObj = JSON.parse(inputStr);
        } catch (error) {
            throw new Error(`ERROR updateSite-> Input string NON-JSON value`);
        }
        const siteInput = Site.schema.validateSync(
            siteObj,
            {strict: true, abortEarly: false},
        );
        const identity = await HLFServices.getMspID(ctx);
        if (siteInput.marketEvaluationPointMrid && siteInput.schedulingEntityRegisteredResourceMrid) {
            if (identity !== OrganizationTypeMsp.RTE) {
                throw new Error(`Organisation, ${identity} does not have write access for HTB(HV) sites`);
            }
        } else if (!siteInput.marketEvaluationPointMrid && !siteInput.schedulingEntityRegisteredResourceMrid) {
            if (identity !== OrganizationTypeMsp.ENEDIS) {
                throw new Error(`Organisation, ${identity} does not have write access for HTA(MV) sites`);
            }
        } else {
            throw new Error(`marketEvaluationPointMrid and schedulingEntityRegisteredResourceMrid must be both present for HTB site or absent for HTA site.`);
        }
        const siteAsBytes = await SiteService.getRaw(ctx,siteInput.meteringPointMrid);
        // const siteAsBytes = await ctx.stub.getState(siteInput.meteringPointMrid);
        if (!siteAsBytes || siteAsBytes.length === 0) {
            throw new Error(`${siteInput} does not exist. Can not be updated.`);
        }

        try {
            await SystemOperatorService.getRaw(ctx, siteInput.systemOperatorMarketParticipantMrid);
        } catch(error) {
            throw new Error(error.message.concat(' for site update'));
        }

        try {
            await ProducerService.getRaw(ctx, siteInput.producerMarketParticipantMrid);
        } catch(error) {
            throw new Error(error.message.concat(' for site update'));
        }

        siteInput.docType = 'site';
        await ctx.stub.putState(siteInput.meteringPointMrid, Buffer.from(JSON.stringify(siteInput)));
        console.info(
            '============= END : Update %s Site ===========',
            siteInput.meteringPointMrid,
        );
    }




    public static async querySite(ctx: Context, siteId: string): Promise<string> {
        console.info('============= START : Query %s Site ===========', siteId);
        const siteAsBytes = await SiteService.getRaw(ctx, siteId)
        console.debug(siteId, siteAsBytes.toString());
        console.info('============= END   : Query %s Site ===========', siteId);
        return siteAsBytes.toString();
    }




    public static async siteExists(ctx: Context, siteId: string): Promise<boolean> {
        console.info('============= START : Query %s Site ===========', siteId);
        const siteAsBytes = await SiteService.getRaw(ctx, siteId)
        return siteAsBytes && siteAsBytes.length !== 0;
    }




    public static async getSitesBySystemOperator(
        ctx: Context,
        systemOperatorMarketParticipantMrid: string): Promise<string> {

        const query = `{"selector": {"docType": "site", "systemOperatorMarketParticipantMrid": "${systemOperatorMarketParticipantMrid}"}}`;
        const allResults = await SiteService.getQueryStringResult(ctx, query);

        return allResults;
    }




    public static async getSitesByProducer(ctx: Context, producerMarketParticipantMrid: string): Promise<string> {
        const query = `{"selector": {"docType": "site", "producerMarketParticipantMrid": "${producerMarketParticipantMrid}"}}`;
        const allResults = await SiteService.getQueryStringResult(ctx, query);

        return allResults;
    }




    public static async getSitesByQuery(
        ctx: Context,
        query: string, pageSize: number, bookmark: string): Promise<any> {
        //getPrivateDataQueryResultWithPagination doesn't exist in 2022 May the 19th
        // let response = await ctx.stub.getQueryResultWithPagination(query, pageSize, bookmark);
        // const {iterator, metadata} = response;
        // let results = await this.getAllResults(iterator);
        // const res = {
        //     records:             results,
        //     fetchedRecordsCount: metadata.fetchedRecordsCount,
        //     bookmark:            metadata.bookmark
        // }

        //Implementaition calling QueryResult (without Pagination)
        // const iterator = await SiteService.getQueryResult(ctx, query);
        // let results = await this.getAllResults(iterator);

        let results = await SiteService.getPrivateQueryArrayResult(ctx, query);

        const res = {
            records:             results,
            fetchedRecordsCount: results.length,
            bookmark:            bookmark
        }

        return res;
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
