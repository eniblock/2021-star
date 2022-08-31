
import { ParametersType } from "../../enums/ParametersType";
import { DocType } from "../../enums/DocType";

import { Site } from "../../model/site";
import { STARParameters } from '../../model/starParameters';

import { QueryStateService } from "./QueryStateService";
import { HLFServices } from "./HLFservice";
import { StarPrivateDataService } from "./StarPrivateDataService";
import { RoleType } from "../../enums/RoleType";

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
        var allResultsId: string[] = [];

        if (collections) {
            for (var i=0; i<collections.length; i++) {
                // console.debug("collection : ", collections[i])
                let results: Site[] = await QueryStateService.getPrivateQueryArrayResult(params, {query: query, collection: collections[i]});
                // console.debug("results :", JSON.stringify(results))
                for (var result of results) {
                    if (result
                        && result.meteringPointMrid
                        && result.meteringPointMrid !== ""
                        && !allResultsId.includes(result.meteringPointMrid)) {
                            allResultsId.push(result.meteringPointMrid);
                            allResults.push(result);
                        }
                }
                // console.debug("allResults :", JSON.stringify(allResults))
                // console.debug("allResultsId :", JSON.stringify(allResultsId))
            }
        }

        console.debug('============= END : getPrivateQueryArrayResult SiteService ===========');
        return allResults;
    }


}
