
import { ParametersType } from "../../enums/ParametersType";
import { DocType } from "../../enums/DocType";

import { Site } from "../../model/site";
import { STARParameters } from '../../model/starParameters';

import { QueryStateService } from "./QueryStateService";
import { HLFServices } from "./HLFservice";
import { StarPrivateDataService } from "./StarPrivateDataService";

export class SiteService {


    public static async write(
        params: STARParameters,
        siteObj: Site,
        target: string = ''): Promise<void> {

        siteObj.docType = DocType.SITE;
        await StarPrivateDataService.write(params, {id: siteObj.meteringPointMrid, dataObj: siteObj, collection: target});
    }



    public static async getQueryStringResult(
        params: STARParameters,
        query: string): Promise<string>  {
        console.debug('============= START : getQueryStringResult SiteService ===========');

        const allResults = await SiteService.getQueryArrayResult(params, query);
        const formated = JSON.stringify(allResults);

        console.debug('============= END : getQueryStringResult SiteService ===========');
        return formated;
    }

    public static async getQueryArrayResult(
        params: STARParameters,
        query: string): Promise<any>  {
        console.debug('============= START : getPrivateQueryArrayResult SiteService ===========');

        const collections: string[] = await HLFServices.getCollectionsFromParameters(params, ParametersType.DATA_TARGET, ParametersType.ALL);
        var allResults = [];

        var i=0;
        if (collections) {
            while (i<collections.length) {
                let results = await QueryStateService.getPrivateQueryArrayResult(params, {query: query, collection: collections[i]});
                allResults = allResults.concat(results);
                i++;
            }
        }

        console.debug('============= END : getPrivateQueryArrayResult SiteService ===========');
        return allResults;
    }


}
