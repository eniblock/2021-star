import { Context } from 'fabric-contract-api';
import { DocType } from '../enums/DocType';

import { OrganizationTypeMsp } from '../enums/OrganizationMspType';
import { ParametersType } from '../enums/ParametersType';

import { STARParameters } from '../model/starParameters';
import { YellowPages } from '../model/yellowPages';

import { QueryStateService } from './service/QueryStateService';
import { SystemOperatorService } from './service/SystemOperatorService';
import { YellowPagesService } from './service/YellowPagesService';

export class YellowPagesController {

    public static async createYellowPages(
        ctx: Context,
        params: STARParameters,
        inputStr: string) {
        console.info('============= START : Create YellowPages ===========');

        const identity = params.values.get(ParametersType.IDENTITY);
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
        console.info('============= END   : Create %s YellowPages ===========',
            yellowPageObj.yellowPageMrid,
        );
    }

    public static async getAllYellowPages(ctx: Context): Promise<string> {
        return await QueryStateService.getAllStates(ctx, DocType.YELLOW_PAGES);
    }

    public static async getYellowPagesByOriginAutomationRegisteredResource(
        ctx: Context,
        originAutomationRegisteredResourceMrid: string): Promise<YellowPages[]> {

        const query = `{"selector": {"docType": "${DocType.YELLOW_PAGES}", "originAutomationRegisteredResourceMrid": "${originAutomationRegisteredResourceMrid}"}}`;

        console.info("-*-*-*-*-*-*-*-*-*-*-*-*-")
        console.info(query)
        console.info("-*-*-*-*-*-*-*-*-*-*-*-*-")

        const allResults : YellowPages[] = await QueryStateService.getQueryArrayResult(ctx, query);
        return allResults;
    }

    public static async getYellowPagesByRegisteredResourceMrid(
        ctx: Context,
        registeredResourceMrid: string): Promise<YellowPages[]> {

        const query = `{"selector": {"docType": "${DocType.YELLOW_PAGES}", "registeredResourceMrid": "${registeredResourceMrid}"}}`;
        const allResults : YellowPages[] = await QueryStateService.getQueryArrayResult(ctx, query);
        return allResults;
    }

}
