import { DocType } from '../../enums/DocType';
import { ParametersType } from '../../enums/ParametersType';
import { DataReference } from '../../model/dataReference';

import { ReserveBidMarketDocument } from '../../model/reserveBidMarketDocument';
import { STARParameters } from '../../model/starParameters';

import { HLFServices } from './HLFservice';
import { QueryStateService } from './QueryStateService';
import { StarPrivateDataService } from './StarPrivateDataService';

export class ReserveBidMarketDocumentService {

    public static async write(
        params: STARParameters,
        reserveBidObj: ReserveBidMarketDocument,
        target: string = ''): Promise<void> {
        params.logger.debug('============= START : write ReserveBidMarketDocumentService ===========');

        reserveBidObj.docType = DocType.RESERVE_BID_MARKET_DOCUMENT;
        await StarPrivateDataService.write(
            params, {id: reserveBidObj.reserveBidMrid, dataObj: reserveBidObj, collection: target});

        params.logger.debug('=============  END  : write ReserveBidMarketDocumentService ===========');
    }

    public static async getQueryStringResult(
        params: STARParameters,
        query: string,
        target: string = ''): Promise<string>  {

        params.logger.debug('============= START : getQueryStringResult ReserveBidMarketDocumentService ===========');

        const allResults = await this.getQueryArrayResult(params, query, target);
        const formated = JSON.stringify(allResults);

        params.logger.debug('=============  END  : getQueryStringResult ReserveBidMarketDocumentService ===========');
        return formated;
    }

    public static async getQueryArrayResult(
        params: STARParameters,
        query: string,
        target: string = ''): Promise<ReserveBidMarketDocument[]>  {

        params.logger.debug('============= START : getPrivateQueryArrayResult ReserveBidMarketDocumentService ===========');

        let collections: string[];
        if (target && target.length > 0) {
            collections = await HLFServices.getCollectionsOrDefault(params, ParametersType.DATA_TARGET, [target]);
        } else {
            collections =
                await HLFServices.getCollectionsFromParameters(params, ParametersType.DATA_TARGET, ParametersType.ALL);
        }

        const allResults: ReserveBidMarketDocument[] = [];
        const allResultsId: string[] = [];

        if (collections) {
            for (const collection of collections) {
                // params.logger.debug("collection : ", collections[i])
                const results: ReserveBidMarketDocument[] =
                    await QueryStateService.getPrivateQueryArrayResult(params, {query, collection});
                // params.logger.debug("results :", JSON.stringify(results))
                for (const result of results) {
                    if (result
                        && result.reserveBidMrid
                        && result.reserveBidMrid !== ''
                        && !allResultsId.includes(result.reserveBidMrid)) {

                            allResultsId.push(result.reserveBidMrid);
                            allResults.push(result);
                        }
                }
                // params.logger.debug("allResults :", JSON.stringify(allResults))
                // params.logger.debug("allResultsId :", JSON.stringify(allResultsId))
            }
        }

        params.logger.debug('=============  END  : getPrivateQueryArrayResult ReserveBidMarketDocumentService ===========');
        return allResults;
    }

    public static async getQueryArrayDataReferenceResult(
        params: STARParameters,
        query: string,
        target: string = ''): Promise<DataReference[]>  {

        params.logger.debug('============= START : getQueryArrayDataReferenceResult ReserveBidMarketDocumentService ===========');

        let collections: string[];
        if (target && target.length > 0) {
            collections = await HLFServices.getCollectionsOrDefault(params, ParametersType.DATA_TARGET, [target]);
        } else {
            collections =
                await HLFServices.getCollectionsFromParameters(params, ParametersType.DATA_TARGET, ParametersType.ALL);
        }

        const allDataReferenceResults: DataReference[] = [];
        const allResultsId: string[] = [];

        if (collections) {
            for (const collection of  collections) {
                // params.logger.debug("collection : ", collections[i])
                const results: ReserveBidMarketDocument[] =
                    await QueryStateService.getPrivateQueryArrayResult(params, {query, collection});
                // params.logger.debug("results :", JSON.stringify(results))
                for (const result of results) {
                    if (result
                        && result.reserveBidMrid
                        && result.reserveBidMrid !== ''
                        && !allResultsId.includes(result.reserveBidMrid)) {

                            allResultsId.push(result.reserveBidMrid);
                            const dataReference: DataReference = {
                                collection,
                                data: result,
                                docType: DocType.RESERVE_BID_MARKET_DOCUMENT,
                            };
                            allDataReferenceResults.push(dataReference);
                        }
                }
                // params.logger.debug("allResults :", JSON.stringify(allResults))
                // params.logger.debug("allResultsId :", JSON.stringify(allResultsId))
            }
        }

        params.logger.debug('=============  END  : getQueryArrayDataReferenceResult ReserveBidMarketDocumentService ===========');
        return allDataReferenceResults;
    }

}
