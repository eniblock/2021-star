import { DocType } from '../../enums/DocType';
import { ParametersType } from '../../enums/ParametersType';
import { IndexedData } from '../../model/dataIndex/dataIndexers';
import { ReserveBidMarketDocumentAbstract } from '../../model/dataIndex/reserveBidMarketDocumentAbstract';
import { IndexedDataJson } from '../../model/dataIndexersJson';
import { DataReference } from '../../model/dataReference';
import { ReserveBidMarketDocument } from '../../model/reserveBidMarketDocument';
import { Site } from '../../model/site';
import { STARParameters } from '../../model/starParameters';
import { ReserveBidMarketDocumentController } from '../ReserveBidMarketDocumentController';
import { SiteController } from '../SiteController';
import { DataIndexersController } from './DataIndexersController';

export class SiteReserveBidIndexersController {

    public static getKey(meteringPointMrid: string): string {
        return ParametersType.SITE_RESERVE_BID_INDEXER_PREFIX.concat(meteringPointMrid);
    }

    public static async get(
        params: STARParameters,
        meteringPointMrid: string,
        target: string = ''): Promise<IndexedData> {
        params.logger.debug('============= START : get SiteReserveBidIndexersController ===========');

        const indexId = this.getKey(meteringPointMrid);

        const obj: IndexedData = await DataIndexersController.getIndexer(params, indexId, target);

        params.logger.debug('=============  END  : get SiteReserveBidIndexersController ===========');
        return obj;
    }

    public static async addModifyReserveBidReference(
        params: STARParameters,
        reserveBidObj: ReserveBidMarketDocument,
        target: string = '') {
        params.logger.debug
            ('============= START : addReserveBidReference SiteReserveBidIndexersController ===========');

        const reserveBidMarketDocumentAbstract: ReserveBidMarketDocumentAbstract = {
            createdDateTime: reserveBidObj.createdDateTime,
            reserveBidMrid: reserveBidObj.reserveBidMrid,
            reserveBidStatus: reserveBidObj.reserveBidStatus,
            validityPeriodStartDateTime: reserveBidObj.validityPeriodStartDateTime};
        const indexId = this.getKey(reserveBidObj.meteringPointMrid);
        await DataIndexersController.addModifyReference(
            params, indexId, reserveBidMarketDocumentAbstract, reserveBidObj.reserveBidMrid, target);

        params.logger.debug
            ('=============  END  : addReserveBidReference SiteReserveBidIndexersController ===========');
    }

    public static async deleteReserveBidReference(
        params: STARParameters,
        reserveBidObj: ReserveBidMarketDocument,
        target: string = '') {
        params.logger.debug('============= START : deleteReserveBidReference SiteReserveBidIndexersController ===========');

        const indexId = this.getKey(reserveBidObj.meteringPointMrid);
        await DataIndexersController.deleteReference(params, indexId, reserveBidObj.reserveBidMrid, target);

        params.logger.debug('=============  END  : deleteReserveBidReference SiteReserveBidIndexersController ===========');
    }

    // To Rebuild indexes from stored Data
    public static async getNeededIndexesFromData(params: STARParameters): Promise<DataReference[]> {
        params.logger.debug('============= START : getNeededIndexesFromData SiteReserveBidIndexersController ===========');
        const states: DataReference[] = [];

        let allSiteRef: DataReference[];
        try {
            allSiteRef = await SiteController.getAllObjRef(params);
        } catch (err) {
            // Just return empty list
            return states;
        }

        if (allSiteRef && allSiteRef.length > 0) {
            for (const siteRef of allSiteRef) {
                try {
                    const site: Site = siteRef.data;
                    const meteringPointMrid: string = site.meteringPointMrid;
                    const reserveBidList: ReserveBidMarketDocument[] =
                        await ReserveBidMarketDocumentController.getObjByMeteringPointMrid(
                            params, meteringPointMrid, siteRef.collection);
                    if (reserveBidList && reserveBidList.length > 0) {
                        for (const reserveBidObj of reserveBidList) {
                            const reserveBidMarketDocumentAbstract: ReserveBidMarketDocumentAbstract = {
                                    createdDateTime: reserveBidObj.createdDateTime,
                                    reserveBidMrid: reserveBidObj.reserveBidMrid,
                                    reserveBidStatus: reserveBidObj.reserveBidStatus,
                                    validityPeriodStartDateTime: reserveBidObj.validityPeriodStartDateTime,
                                };
                            const indexId = this.getKey(reserveBidObj.meteringPointMrid);

                            const indexData: IndexedData = {
                                docType: DocType.DATA_INDEXER,
                                indexId,
                                indexedDataAbstractMap: new Map(),
                            };

                            indexData.indexedDataAbstractMap.set(indexId, reserveBidMarketDocumentAbstract);

                            states.push(
                                {collection: siteRef.collection,
                                data: IndexedDataJson.toJson(indexData),
                                docType: DocType.INDEX_SITE_RESERVE_BID});
                        }
                    }
                } catch (err) {
                    // Do Nothing ... just cannot manage reserveBid
                }
            }
        }

        params.logger.debug('=============  END  : getNeededIndexesFromData SiteReserveBidIndexersController ===========');
        return states;
    }

    public static async executeOrder(
        params: STARParameters,
        updateOrder: DataReference) {
        params.logger.debug('============= START : executeOrder SiteReserveBidIndexersController ===========');

        if (updateOrder.data) {
            const indexDataJson: IndexedDataJson = updateOrder.data;
            const indexData: IndexedData = IndexedData.fromJson(indexDataJson);

            if (indexData.indexId
                && indexData.indexId.length > 0
                && indexData.indexedDataAbstractMap
                && indexData.indexedDataAbstractMap.values) {

                const [valueAbstract, dataId] = indexData.indexedDataAbstractMap.entries().next().value;
                await DataIndexersController.addModifyReference(
                    params, indexData.indexId, valueAbstract, dataId, updateOrder.collection);
            }
        }

        params.logger.debug('============= END   : executeOrder SiteReserveBidIndexersController ===========');
    }

}
