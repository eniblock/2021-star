import { DocType } from '../../enums/DocType';
import { ParametersType } from '../../enums/ParametersType';
import { ReserveBidStatus } from '../../enums/ReserveBidStatus';
import { IndexedData } from '../../model/dataIndex/dataIndexers';
import { ReserveBidMarketDocumentAbstract } from '../../model/dataIndex/reserveBidMarketDocumentAbstract';
import { IndexedDataJson } from '../../model/dataIndexersJson';
import { DataReference } from '../../model/dataReference';
import { ReserveBidMarketDocument } from '../../model/reserveBidMarketDocument';
import { Site } from '../../model/site';
import { STARParameters } from '../../model/starParameters';
import { ReserveBidMarketDocumentController } from '../ReserveBidMarketDocumentController';
import { HLFServices } from '../service/HLFservice';
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

        let collections: string[];
        if (target && target.length > 0) {
            collections = await HLFServices.getCollectionsOrDefault(params, ParametersType.DATA_TARGET, [target]);
        } else {
            collections =
                await HLFServices.getCollectionsFromParameters(params, ParametersType.DATA_TARGET, ParametersType.ALL);
        }
        collections = collections.concat('');

        var returnedObj: IndexedData = {
            docType: DocType.DATA_INDEXER,
            indexId: indexId,
            indexedDataAbstractMap: new Map()
        };

        for (const target of collections) {
            params.logger.info('get 1, target: ', target);
            const obj: IndexedData = await DataIndexersController.getIndexer(params, indexId, target);

            params.logger.info('get 2, obj: ', JSON.stringify(obj));
            params.logger.info('get 3, obj.indexedDataAbstractMap: ', JSON.stringify([...obj.indexedDataAbstractMap]));

            for (const [key] of obj.indexedDataAbstractMap) {
                params.logger.info('get 4, key: ', JSON.stringify(key));
                if (!returnedObj.indexedDataAbstractMap.has(key)) {
                    const value = obj.indexedDataAbstractMap.get(key);
                    params.logger.info('get 5, do it: ', JSON.stringify(value));
                    returnedObj.indexedDataAbstractMap.set(key, value);
                }
            }

            params.logger.info('get 6, returnedObj.indexedDataAbstractMap: ', JSON.stringify([...returnedObj.indexedDataAbstractMap]));
        }

        params.logger.debug('=============  END  : get SiteReserveBidIndexersController ===========');
        return returnedObj;
    }

    public static async addModifyReserveBidReference(
        params: STARParameters,
        reserveBidObj: ReserveBidMarketDocument,
        target) {
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
        target) {
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
                            if (reserveBidObj.reserveBidStatus === ReserveBidStatus.VALIDATED) {
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
