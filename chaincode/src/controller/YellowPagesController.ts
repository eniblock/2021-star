import { Context } from 'fabric-contract-api';
import { OrganizationTypeMsp } from '../enums/OrganizationMspType';
import { YellowPages } from '../model/yellowPages';
import { HLFServices } from './service/HLFservice';
import { QueryStateService } from './service/QueryStateService';

export class YellowPagesController {

    public static async createYellowPages(
        ctx: Context,
        inputStr: string) {
        console.info('============= START : Create YellowPages ===========');

        const identity = await HLFServices.getMspID(ctx);
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

        yellowPagesInput.docType = 'yellowPages';

        await ctx.stub.putState(
            yellowPagesInput.yellowPageMrid,
            Buffer.from(JSON.stringify(yellowPagesInput)),
        );
        console.info(
            '============= END   : Create %s YellowPages ===========',
            yellowPagesInput.yellowPageMrid,
        );
    }

    public static async getAllYellowPages(ctx: Context): Promise<string> {
        return await QueryStateService.getAllStates(ctx, "yellowPages");
    }
}
