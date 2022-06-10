import { Context } from 'fabric-contract-api';
import { OrganizationTypeMsp } from '../enums/OrganizationMspType';
import { YellowPages } from '../model/yellowPages';
import { HLFServices } from './service/HLFservice';
import { QueryStateService } from './service/QueryStateService';
import { SystemOperatorService } from './service/SystemOperatorService';
import { YellowPagesService } from './service/YellowPagesService';

export class YellowPagesController {

    public static async createYellowPages(
        ctx: Context,
        inputStr: string) {
        console.info('============= START : Create YellowPages ===========');

        const identity = await HLFServices.getMspID(ctx);
        if (identity !== OrganizationTypeMsp.RTE && identity !== OrganizationTypeMsp.ENEDIS) {
            throw new Error(`Organisation, ${identity} does not have write access for Yellow Pages.`);
        }

        let yellowPageObj: YellowPages;
        try {
            yellowPageObj = JSON.parse(inputStr);
        } catch (error) {
            // console.error('error=', error);
            throw new Error(`ERROR createYellowPages-> Input string NON-JSON value`);
        }

        YellowPages.schema.validateSync(
            yellowPageObj,
            {strict: true, abortEarly: false},
        );

        try {
            await SystemOperatorService.getRaw(ctx, yellowPageObj.systemOperatorMarketParticipantMrid);
        } catch(error) {
            throw new Error(error.message.concat(` in Yellow Pages ${yellowPageObj.originAutomationRegisteredResourceMrid}.`));
        }

        await YellowPagesService.write(ctx, yellowPageObj);
        console.info(
            '============= END   : Create %s YellowPages ===========',
            yellowPageObj.yellowPageMrid,
        );
    }

    public static async getAllYellowPages(ctx: Context): Promise<string> {
        return await QueryStateService.getAllStates(ctx, "yellowPages");
    }

    public static async getYellowPagesByOriginAutomationRegisteredResource(
        ctx: Context,
        originAutomationRegisteredResourceMrid: string): Promise<YellowPages[]> {

        const query = `{"selector": {"docType": "yellowPages", "originAutomationRegisteredResourceMrid": "${originAutomationRegisteredResourceMrid}"}}`;
        const allResults : YellowPages[] = await QueryStateService.getQueryArrayResult(ctx, query);
        return allResults;
    }

}
