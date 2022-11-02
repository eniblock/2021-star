import { DocType } from '../../enums/DocType';
import { ActivationDocument } from '../../model/activationDocument/activationDocument';
import { ActivationDocumentCompositeKey } from '../../model/activationDocument/activationDocumentCompositeKey';
import { ActivationDocumentCompositeKeyAbstract } from '../../model/dataIndex/activationDocumentCompositeKeyAbstract';
import { IndexedData } from '../../model/dataIndex/dataIndexers';
import { IndexedDataJson } from '../../model/dataIndexersJson';
import { DataReference } from '../../model/dataReference';
import { STARParameters } from '../../model/starParameters';
import { ActivationDocumentController } from '../activationDocument/ActivationDocumentController';
import { DataIndexersController } from './DataIndexersController';

export class ActivationCompositeKeyIndexersController {

    public static getActivationDocumentCompositeKeyId(
        activationDocumentCompositeKeyObj: ActivationDocumentCompositeKey): string {
        let id = '';
        id = id.concat(activationDocumentCompositeKeyObj.originAutomationRegisteredResourceMrid);

        id = id.concat('_');

        id = id.concat(activationDocumentCompositeKeyObj.registeredResourceMrid);

        id = id.concat('_');

        if (activationDocumentCompositeKeyObj.startCreatedDateTime
            && activationDocumentCompositeKeyObj.startCreatedDateTime.length > 0) {
            id = id.concat(activationDocumentCompositeKeyObj.startCreatedDateTime);
        } else {
            id = id.concat('startCreatedDateTime');
        }

        id = id.concat('_');

        if (activationDocumentCompositeKeyObj.endCreatedDateTime
            && activationDocumentCompositeKeyObj.endCreatedDateTime.length > 0) {
                id = id.concat(activationDocumentCompositeKeyObj.endCreatedDateTime);
        } else {
            id = id.concat('endCreatedDateTime');
        }

        id = id.concat('_');

        id = id.concat(activationDocumentCompositeKeyObj.revisionNumber);

        return id;
    }

    public static getKey(activationDocumentObj: ActivationDocument): string {
        const compositeKey = ActivationDocumentCompositeKey.formatActivationDocument(activationDocumentObj);
        const compositeKeyId = this.getActivationDocumentCompositeKeyId(compositeKey);
        return compositeKeyId;
    }

    public static async get(
        params: STARParameters,
        activationDocumentObj: ActivationDocument,
        target: string = ''): Promise<IndexedData> {
        params.logger.debug('============= START : get ActivationCompositeKeyIndexersController ===========');

        const compositeKey = ActivationDocumentCompositeKey.formatActivationDocument(activationDocumentObj);
        const compositeKeyId = this.getActivationDocumentCompositeKeyId(compositeKey);

        const obj: IndexedData = await DataIndexersController.getIndexer(params, compositeKeyId, target);

        params.logger.debug('=============  END  : get ActivationCompositeKeyIndexersController ===========');
        return obj;
    }

    public static async getByCompositeKey(
        params: STARParameters,
        compositeKeyId: string,
        target: string = ''): Promise<IndexedData> {
        params.logger.debug('============= START : get by compositeKey ActivationCompositeKeyIndexersController ===========');

        const obj: IndexedData = await DataIndexersController.getIndexer(params, compositeKeyId, target);

        params.logger.debug('=============  END  : get by compositeKey ActivationCompositeKeyIndexersController ===========');
        return obj;
    }

    public static async addCompositeKeyReference(
        params: STARParameters,
        activationDocumentObj: ActivationDocument,
        target: string = '') {
        params.logger.debug('============= START : addCompositeKeyReference ActivationCompositeKeyIndexersController ===========');

        const compositeKey = ActivationDocumentCompositeKey.formatActivationDocument(activationDocumentObj);
        const compositeKeyId = this.getActivationDocumentCompositeKeyId(compositeKey);

        const valueAbstract: ActivationDocumentCompositeKeyAbstract = {
            activationDocumentCompositeKey: compositeKeyId,
            activationDocumentMrid: activationDocumentObj.activationDocumentMrid,
        };

        await DataIndexersController.addModifyReference(params, compositeKeyId, valueAbstract, compositeKeyId, target);

        params.logger.debug('=============  END  : addCompositeKeyReference ActivationCompositeKeyIndexersController ===========');
    }

    public static async deleteCompositeKeyReference(
        params: STARParameters,
        activationDocumentObj: ActivationDocument,
        target: string) {
        params.logger.debug('============= START : deleteCompositeKeyReference ActivationCompositeKeyIndexersController ===========');

        const compositeKey = ActivationDocumentCompositeKey.formatActivationDocument(activationDocumentObj);
        const compositeKeyId = this.getActivationDocumentCompositeKeyId(compositeKey);

        await DataIndexersController.deleteReference(params, compositeKeyId, compositeKeyId, target);

        params.logger.debug('=============  END  : deleteCompositeKeyReference ActivationCompositeKeyIndexersController ===========');
    }

    // To list needed indexes from stored Data
    public static async getNeededIndexesFromData(params: STARParameters): Promise<DataReference[]> {
        params.logger.debug('============= START : getNeededIndexFromData ActivationCompositeKeyIndexersController ===========');

        const activationDocumentRefList = await ActivationDocumentController.getAll(params);
        const indexList: DataReference[] = [];

        if (activationDocumentRefList && activationDocumentRefList.length > 0) {
            for (const activationDocumentRef of activationDocumentRefList) {
                const activationDocumentObj: ActivationDocument = activationDocumentRef.data;

                const compositeKey = ActivationDocumentCompositeKey.formatActivationDocument(activationDocumentObj);
                const compositeKeyId = this.getActivationDocumentCompositeKeyId(compositeKey);

                const valueAbstract: ActivationDocumentCompositeKeyAbstract = {
                    activationDocumentCompositeKey: compositeKeyId,
                    activationDocumentMrid: activationDocumentObj.activationDocumentMrid,
                };

                const ref = {
                    docType: DocType.DATA_INDEXER,
                    indexId: compositeKeyId,
                    indexedDataAbstractMap: new Map()};

                ref.indexedDataAbstractMap.set(compositeKeyId, valueAbstract);

                indexList.push(
                    {collection: activationDocumentRef.collection,
                    data: IndexedDataJson.toJson(ref),
                    docType: DocType.INDEX_ACTIVATION_COMPOSITE_KEY});
            }
        }

        params.logger.debug('=============  END  : getNeededIndexFromData ActivationCompositeKeyIndexersController ===========');
        return indexList;
    }

    public static async executeOrder(
        params: STARParameters,
        updateOrder: DataReference) {
        params.logger.debug('============= START : executeOrder ActivationCompositeKeyIndexersController ===========');

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

        params.logger.debug('============= END   : executeOrder ActivationCompositeKeyIndexersController ===========');
    }

}
