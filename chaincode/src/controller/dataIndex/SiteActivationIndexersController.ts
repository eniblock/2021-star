import { DocType } from '../../enums/DocType';
import { ParametersType } from '../../enums/ParametersType';
import { ActivationDocument } from '../../model/activationDocument/activationDocument';
import { ActivationDocumentAbstract } from '../../model/dataIndex/activationDocumentAbstract';
import { ActivationDocumentDateMax } from '../../model/dataIndex/activationDocumentDateMax';
import { IndexedData } from '../../model/dataIndex/dataIndexers';
import { IndexedDataJson } from '../../model/dataIndexersJson';
import { DataReference } from '../../model/dataReference';
import { STARParameters } from '../../model/starParameters';
import { ActivationDocumentController } from '../activationDocument/ActivationDocumentController';
import { StarPrivateDataService } from '../service/StarPrivateDataService';
import { DataIndexersController } from './DataIndexersController';

export class SiteActivationIndexersController {
    public static getMaxKey(meteringPointMrid: string): string {
        return ParametersType.SITE_ACTIVATION_INDEXER_PREFIX.concat(meteringPointMrid);
    }

    public static getKey(meteringPointMrid: string, dateRef: Date): string {
        let dateKeyStr: string = 'X';

        try {
            dateKeyStr = JSON.stringify(dateRef.getFullYear()).concat('-').concat(JSON.stringify(dateRef.getMonth()));
        } catch (err) {
            // Do Nothing
        }

        return ParametersType.SITE_ACTIVATION_INDEXER_PREFIX.concat(meteringPointMrid).concat('-').concat(dateKeyStr);
    }

    public static async get(
        params: STARParameters,
        meteringPointMrid: string,
        referenceDate: string,
        target: string = ''): Promise<IndexedData> {
        params.logger.debug('============= START : get SiteActivationIndexersController ===========');

        const indexId = this.getKeyStr(meteringPointMrid, referenceDate);
        const obj: IndexedData = await DataIndexersController.getIndexer(params, indexId, target);

        params.logger.debug('=============  END  : get SiteActivationIndexersController ===========');
        return obj;
    }

    public static async getMaxDate(
        params: STARParameters,
        meteringPointMrid: string,
        target: string = ''): Promise<string> {

        const indexId = this.getMaxKey(meteringPointMrid);
        const obj: ActivationDocumentDateMax = await StarPrivateDataService.getObj(
            params, {id: indexId, collection: target, docType: DocType.DATA_INDEXER});
        return obj.dateTime;
    }

    public static async getAndNext(
        params: STARParameters,
        meteringPointMrid: string,
        referenceDate: string,
        target: string = ''): Promise<IndexedData[]> {
        params.logger.debug('============= START : getAndNext SiteActivationIndexersController ===========');

        const objList: IndexedData[] = [];

        try {
            const maxDateStr = await this.getMaxDate(params, meteringPointMrid, target);
            const maxDate = new Date(maxDateStr);
            const refDate = new Date(referenceDate);

            while (refDate <= maxDate) {
                const indexId = this.getKey(meteringPointMrid, refDate);
                try {
                    const obj: IndexedData = await DataIndexersController.getIndexer(params, indexId, target);
                    objList.push(obj);
                } catch (err) {
                    // Do Nothing
                }
                refDate.setMonth(refDate.getMonth() + 1);
            }
        } catch (err) {
            // Do Nothing
        }

        params.logger.debug('=============  END  : getAndNext SiteActivationIndexersController ===========');
        return objList;
    }

    public static async addActivationReference(
        params: STARParameters,
        activationDocumentObj: ActivationDocument,
        target: string = '') {
        params.logger.debug('============= START : addActivationReference SiteActivationIndexersController ===========');

        if (activationDocumentObj.startCreatedDateTime && activationDocumentObj.startCreatedDateTime.length > 0) {
            const activationAbstract: ActivationDocumentAbstract = {
                activationDocumentMrid: activationDocumentObj.activationDocumentMrid,
                registeredResourceMrid: activationDocumentObj.registeredResourceMrid,
                startCreatedDateTime: activationDocumentObj.startCreatedDateTime};

            const indexId = this.getKeyStr(
                activationDocumentObj.registeredResourceMrid, activationDocumentObj.startCreatedDateTime);

            await this.addActivationReferenceWithIdAndAbstract(params, indexId, activationAbstract, target);
        }

        params.logger.debug('=============  END  : addActivationReference SiteActivationIndexersController ===========');
    }

    public static async deleteActivationReference(
        params: STARParameters,
        activationDocumentId: string,
        meteringPointMrid: string,
        referenceDate: string,
        target: string) {
        params.logger.debug('============= START : deleteActivationReference SiteActivationIndexersController ===========');

        const indexId = this.getKeyStr(meteringPointMrid, referenceDate);
        await DataIndexersController.deleteReference(params, indexId, activationDocumentId, target);

        params.logger.debug('=============  END  : deleteActivationReference SiteActivationIndexersController ===========');
    }

    // To list needed indexes from stored Data
    public static async getNeededIndexesFromData(params: STARParameters): Promise<DataReference[]> {
        params.logger.debug('============= START : getNeededIndexFromData SiteActivationIndexersController ===========');

        const activationDocumentRefList = await ActivationDocumentController.getAll(params);
        const indexList: DataReference[] = [];

        if (activationDocumentRefList && activationDocumentRefList.length > 0) {
            for (const activationDocumentRef of activationDocumentRefList) {
                const activationDocumentObj: ActivationDocument = activationDocumentRef.data;

                const indexId = this.getKeyStr(
                    activationDocumentObj.registeredResourceMrid, activationDocumentObj.startCreatedDateTime);
                const activationAbstract: ActivationDocumentAbstract = {
                    activationDocumentMrid: activationDocumentObj.activationDocumentMrid,
                    registeredResourceMrid: activationDocumentObj.registeredResourceMrid,
                    startCreatedDateTime: activationDocumentObj.startCreatedDateTime};

                const ref = {
                    docType: DocType.DATA_INDEXER,
                    indexId,
                    indexedDataAbstractMap: new Map()};

                ref.indexedDataAbstractMap.set(indexId, activationAbstract);

                indexList.push(
                    {collection: activationDocumentRef.collection,
                        data: IndexedDataJson.toJson(ref),
                    docType: DocType.INDEX_SITE_ACTIVATION});
            }
        }

        params.logger.debug('=============  END  : getNeededIndexFromData SiteActivationIndexersController ===========');
        return indexList;
    }

    public static async executeOrder(
        params: STARParameters,
        updateOrder: DataReference) {
        params.logger.debug('============= START : executeOrder SiteActivationIndexersController ===========');

        if (updateOrder.data) {
            const indexDataJson: IndexedDataJson = updateOrder.data;
            const indexData: IndexedData = IndexedData.fromJson(indexDataJson);

            if (indexData.indexId
                && indexData.indexId.length > 0
                && indexData.indexedDataAbstractMap
                && indexData.indexedDataAbstractMap.values) {

                const valueAbstract = indexData.indexedDataAbstractMap.values().next().value;
                await this.addActivationReferenceWithIdAndAbstract(
                    params, indexData.indexId, valueAbstract, updateOrder.collection);
            }
        }

        params.logger.debug('============= END   : executeOrder SiteActivationIndexersController ===========');
    }

    private static getKeyStr(meteringPointMrid: string, startCreatedDateTime: string): string {
        const dateKeyStr: string = 'X';
        if (startCreatedDateTime
            && startCreatedDateTime.length > 0) {

            try {
                const dateRef = new Date(startCreatedDateTime);
                return this.getKey(meteringPointMrid, dateRef);
            } catch (err) {
                // Do Nothing
            }
        }
        return ParametersType.SITE_ACTIVATION_INDEXER_PREFIX.concat(meteringPointMrid).concat('-').concat(dateKeyStr);
    }

    private static async addActivationReferenceWithIdAndAbstract(
        params: STARParameters,
        indexId: string,
        activationAbstract: ActivationDocumentAbstract,
        target: string = '') {
        params.logger.debug('============= START : addActivationReference SiteActivationIndexersController ===========');

        params.logger.debug('indexId: ', indexId);
        params.logger.debug('activationAbstract: ', activationAbstract);
        params.logger.debug('target: ', target);

        if (activationAbstract.startCreatedDateTime && activationAbstract.startCreatedDateTime.length > 0) {
            await DataIndexersController.addModifyReference(
                params, indexId, activationAbstract, activationAbstract.activationDocumentMrid, target);

            let maxDateStr: string = '';
            try {
                maxDateStr = await this.getMaxDate(params, activationAbstract.registeredResourceMrid, target);

                const maxDate = new Date(maxDateStr);
                const docDate = new Date(activationAbstract.startCreatedDateTime);

                if (docDate > maxDate) {
                    const dataObj: ActivationDocumentDateMax = {
                        dateTime: activationAbstract.startCreatedDateTime, docType: DocType.INDEXER_MAX_DATE};
                    const maxDateId = this.getMaxKey(activationAbstract.registeredResourceMrid);

                    await StarPrivateDataService.write(params, {id: maxDateId, dataObj, collection: target});
                }
            } catch (err) {
                // write activation document strat date as first Max Date
                const dataObj: ActivationDocumentDateMax = {
                    dateTime: activationAbstract.startCreatedDateTime, docType: DocType.INDEXER_MAX_DATE};
                const maxDateId = this.getMaxKey(activationAbstract.registeredResourceMrid);

                await StarPrivateDataService.write(params, {id: maxDateId, dataObj, collection: target});
            }
        }

        params.logger.debug('=============  END  : addActivationReference SiteActivationIndexersController ===========');
    }

}
