import { Context } from 'fabric-contract-api';
import { OrganizationTypeMsp } from '../enums/OrganizationMspType';
import { Site } from '../model/site';

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
        // console.info(
        //     '============= START : Create %s Site ===========',
        //     siteInput.meteringPointMrid,
        // );
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

        const identity = await ctx.stub.getMspID();
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
        const systemOperatorAsBytes = await ctx.stub.getState(siteInput.systemOperatorMarketParticipantMrid);
        if (!systemOperatorAsBytes || systemOperatorAsBytes.length === 0) {
            throw new Error(`System Operator : ${siteInput.systemOperatorMarketParticipantMrid} does not exist for site creation`);
        }

        const producerAsBytes = await ctx.stub.getState(siteInput.producerMarketParticipantMrid);

        if (!producerAsBytes || producerAsBytes.length === 0) {
            throw new Error(`Producer : ${siteInput.producerMarketParticipantMrid} does not exist for site creation`);
        }
        siteInput.docType = 'site';
        await ctx.stub.putState(siteInput.meteringPointMrid, Buffer.from(JSON.stringify(siteInput)));
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
        const identity = await ctx.stub.getMspID();
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
        const siteAsBytes = await ctx.stub.getState(siteInput.meteringPointMrid);
        if (!siteAsBytes || siteAsBytes.length === 0) {
            throw new Error(`${siteInput} does not exist. Can not be updated.`);
        }
        const systemOperatorAsBytes = await ctx.stub.getState(siteInput.systemOperatorMarketParticipantMrid);
        if (!systemOperatorAsBytes || systemOperatorAsBytes.length === 0) {
            throw new Error(`System Operator : ${siteInput.systemOperatorMarketParticipantMrid} does not exist for site creation`);
        }
        const producerAsBytes = await ctx.stub.getState(siteInput.producerMarketParticipantMrid);
        if (!producerAsBytes || producerAsBytes.length === 0) {
            throw new Error(`Producer : ${siteInput.producerMarketParticipantMrid} does not exist for site update`);
        }

        siteInput.docType = 'site';
        await ctx.stub.putState(siteInput.meteringPointMrid, Buffer.from(JSON.stringify(siteInput)));
        console.info(
            '============= END : Update %s Site ===========',
            siteInput.meteringPointMrid,
        );
    }

    public static async querySite(ctx: Context, site: string): Promise<string> {
        console.info('============= START : Query %s Site ===========', site);
        const siteAsBytes = await ctx.stub.getState(site);
        if (!siteAsBytes || siteAsBytes.length === 0) {
            throw new Error(`${site} does not exist`);
        }
        console.info('============= END   : Query %s Site ===========');
        console.info(site, siteAsBytes.toString());
        return siteAsBytes.toString();
    }

    public static async siteExists(ctx: Context, site: string): Promise<boolean> {
        console.info('============= START : Query %s Site ===========', site);
        const siteAsBytes = await ctx.stub.getState(site);
        return siteAsBytes && siteAsBytes.length !== 0;
    }

    public static async getSitesBySystemOperator(
        ctx: Context,
        systemOperatorMarketParticipantMrid: string): Promise<string> {

        const allResults = [];
        const query = `{"selector": {"docType": "site", "systemOperatorMarketParticipantMrid": "${systemOperatorMarketParticipantMrid}"}}`;
        const iterator = await ctx.stub.getQueryResult(query);
        let result = await iterator.next();
        while (!result.done) {
            const strValue = Buffer.from(result.value.value.toString()).toString('utf8');
            let record;
            try {
                record = JSON.parse(strValue);
            } catch (err) {
                record = strValue;
            }
            allResults.push(record);
            result = await iterator.next();
        }
        return JSON.stringify(allResults);
    }

    public static async getSitesByProducer(ctx: Context, producerMarketParticipantMrid: string): Promise<string> {
        const allResults = [];
        const query = `{"selector": {"docType": "site", "producerMarketParticipantMrid": "${producerMarketParticipantMrid}"}}`;
        const iterator = await ctx.stub.getQueryResult(query);
        let result = await iterator.next();
        while (!result.done) {
            const strValue = Buffer.from(result.value.value.toString()).toString('utf8');
            let record;
            try {
                record = JSON.parse(strValue);
            } catch (err) {
                record = strValue;
            }
            allResults.push(record);
            result = await iterator.next();
        }
        return JSON.stringify(allResults);
    }

    public static async getSitesByQuery(
        ctx: Context,
        query: string, pageSize: number, bookmark: string): Promise<any> {
        let response = await ctx.stub.getQueryResultWithPagination(query, pageSize, bookmark);
        const {iterator, metadata} = response;
        let results = await this.getAllResults(iterator);
        const res = {
            records:             results,
            fetchedRecordsCount: metadata.fetchedRecordsCount,
            bookmark:            metadata.bookmark
        }
        return res;
    }

    static async getAllResults(iterator) {
        const allResults = [];
        let result = await iterator.next();
        while (!result.done) {
            const strValue = Buffer.from(result.value.value.toString()).toString('utf8');
            let record;
            try {
                record = JSON.parse(strValue);
            } catch (err) {
                record = strValue;
            }
            allResults.push(record);
            result = await iterator.next();
        }
        return allResults;
    }
}
