import { Context } from 'fabric-contract-api';
import { DocType } from '../enums/DocType';

import { OrganizationTypeMsp } from '../enums/OrganizationMspType';
import { ParametersType } from '../enums/ParametersType';
import { DataReference } from '../model/dataReference';

import { STARParameters } from '../model/starParameters';
import { YellowPages } from '../model/yellowPages';

import { QueryStateService } from './service/QueryStateService';
import { StarDataService } from './service/StarDataService';
import { YellowPagesService } from './service/YellowPagesService';

export class YellowPagesController {

    public static async createYellowPages(
        params: STARParameters,
        inputStr: string) {
        console.debug('============= START : Create YellowPages ===========');

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
            await StarDataService.getObj(params, {id: yellowPageObj.systemOperatorMarketParticipantMrid, docType: DocType.SYSTEM_OPERATOR});
        } catch(error) {
            throw new Error(error.message.concat(` in Yellow Pages ${yellowPageObj.originAutomationRegisteredResourceMrid}.`));
        }

        await YellowPagesService.write(params, yellowPageObj);
        console.debug('============= END   : Create %s YellowPages ===========',
            yellowPageObj.yellowPageMrid,
        );
    }




    public static async getAllYellowPages(params: STARParameters): Promise<string> {
        return await QueryStateService.getAllStates(params, DocType.YELLOW_PAGES);
    }




    public static async getYellowPagesByOriginAutomationRegisteredResource(
        params: STARParameters,
        originAutomationRegisteredResourceMrid: string): Promise<YellowPages[]> {

        const query = `{"selector": {"docType": "${DocType.YELLOW_PAGES}", "originAutomationRegisteredResourceMrid": "${originAutomationRegisteredResourceMrid}"}}`;

        const allResults  = await QueryStateService.getQueryArrayResult(params, {query: query});

        return allResults;
    }




    public static async getYellowPagesByRegisteredResourceMrid(
        params: STARParameters,
        registeredResourceMrid: string): Promise<YellowPages[]> {

        const query = `{"selector": {"docType": "${DocType.YELLOW_PAGES}", "registeredResourceMrid": "${registeredResourceMrid}"}}`;

        var allResults : YellowPages[];

        var poolValue = params.getFromMemoryPool(query);
        if (!poolValue
            || !poolValue.values().next().value
            || !poolValue.values().next().value.data
            || poolValue.values().next().value.docType !== DocType.YELLOW_PAGES) {

            allResults  = await QueryStateService.getQueryArrayResult(params, {query: query});
            const poolRef : DataReference = {collection: "", docType: DocType.YELLOW_PAGES, data: allResults};
            params.addInMemoryPool(query, poolRef);
        } else {
            allResults = poolValue.values().next().value.data;
        }

        return allResults;
    }

}
