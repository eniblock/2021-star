import { Context } from 'fabric-contract-api';
import { OrganizationTypeMsp } from '../enums/OrganizationMspType';
import { YellowPages } from '../model/yellowPages';

export class YellowPagesController {

    public static async createYellowPages(
        ctx: Context,
        inputStr: string) {
        console.info('============= START : Create YellowPages ===========');

        const identity = await ctx.stub.getMspID();
        if (identity !== OrganizationTypeMsp.RTE && identity !== OrganizationTypeMsp.ENEDIS) {
            throw new Error(`Organisation, ${identity} does not have write access for Yellow Pages.`);
        }

        let yellowObj: YellowPages;
        try {
            yellowObj = JSON.parse(inputStr);
        } catch (error) {
            // console.error('error=', error);
            throw new Error(`ERROR createYellowPages-> Input string NON-JSON value`);
        }

        const yellowPagesInput = YellowPages.schema.validateSync(
            yellowObj,
            {strict: true, abortEarly: false},
        );

        const systemOperatorAsBytes = await ctx.stub.getState(yellowPagesInput.systemOperatorMarketParticipantMrid);
        if (!systemOperatorAsBytes || systemOperatorAsBytes.length === 0) {
            throw new Error(`System Operator : ${yellowPagesInput.systemOperatorMarketParticipantMrid} does not exist in Yellow Pages ${yellowPagesInput.originAutomationRegisteredResourceMrid}.`);
        }

        const siteAsBytes = await ctx.stub.getState(yellowPagesInput.registeredResourceMrid);
        if (!siteAsBytes || siteAsBytes.length === 0) {
            throw new Error(`Site : ${yellowPagesInput.registeredResourceMrid} does not exist in Yellow Pages ${yellowPagesInput.originAutomationRegisteredResourceMrid}.`);
        }

        yellowPagesInput.docType = 'yellowPages';

        await ctx.stub.putState(
            yellowPagesInput.originAutomationRegisteredResourceMrid,
            Buffer.from(JSON.stringify(yellowPagesInput)),
        );
        console.info(
            '============= END   : Create %s YellowPages ===========',
            yellowPagesInput.originAutomationRegisteredResourceMrid,
        );
    }

    public static async getAllYellowPages(ctx: Context): Promise<string> {
        const allResults = [];
        const query = `{"selector": {"docType": "yellowPages"}}`;
        const identity = await ctx.stub.getMspID();
        if (identity !== OrganizationTypeMsp.RTE && identity !== OrganizationTypeMsp.ENEDIS) {
            throw new Error(`Organisation, ${identity} does not have read access for Yellow Pages.`);
        }

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
}
