import { DocType } from '../../enums/DocType';
import { ParametersType } from '../../enums/ParametersType';
import { IndexedData } from '../../model/dataIndex/dataIndexers';
import { DataReference } from '../../model/dataReference';
import { STARParameters } from '../../model/starParameters';
import { DataIndexersService } from '../service/DataIndexersService';
import { HLFServices } from '../service/HLFservice';
import { QueryStateService } from '../service/QueryStateService';

export class DataIndexersController {
    public static async getAll(params: STARParameters): Promise<DataReference[]> {
        params.logger.info('============= START : get all DataIndexersController ===========');

        const collections = await HLFServices.getCollectionsFromParameters(
            params, ParametersType.DATA_TARGET, ParametersType.ALL);

        const dataList: DataReference[] = [];
        for (const collection of collections) {
            const allResults = await QueryStateService.getAllPrivateData(params, DocType.DATA_INDEXER, collection);
            if (allResults && allResults.length > 0) {
                for (const result of allResults) {
                    dataList.push({collection, data: result, docType: DocType.DATA_INDEXER});
                }
            }
        }

        params.logger.info('=============  END  : get all DataIndexersController ===========');

        return dataList;
    }

    public static async getIndexer(
        params: STARParameters,
        indexId: string,
        target: string): Promise<IndexedData> {
        params.logger.debug('============= START : getIndexer DataIndexersController ===========');

        const obj: IndexedData = await DataIndexersService.get(params, indexId, target);

        params.logger.debug('=============  END  : getIndexer DataIndexersController ===========');
        return obj;
    }

    public static async addModifyReference(
        params: STARParameters,
        indexId: string,
        obj: any,
        objId: string,
        target: string) {
        params.logger.debug('============= START : addModifyReference DataIndexersController ===========');

        let ref: IndexedData = null;
        try {
            ref = await this.getIndexer(params, indexId, target);
        } catch (err) {
            // ref doesn't exist and needs to be created
            err = null;
        }

        if (!ref
            || !ref.indexId
            || ref.indexId.length === 0) {

            ref = {
                docType: DocType.DATA_INDEXER,
                indexId,
                indexedDataAbstractMap: new Map()};
        }

        ref.indexedDataAbstractMap.set(objId, obj);

        await DataIndexersService.write(params, ref, target);

        params.logger.debug('=============  END  : addModifyReference DataIndexersController ===========');
    }

    public static async deleteReference(
        params: STARParameters,
        indexId: string,
        objId: string,
        target: string) {
        params.logger.debug('============= START : deleteReference DataIndexersController ===========');

        if (indexId.includes(objId)) {
            await DataIndexersService.delete(params, indexId, target);
            return;
        }

        let ref: IndexedData = null;
        try {
            ref = await this.getIndexer(params, indexId, target);
        } catch (err) {
            // ref doesn't exist and doesn't need to be deleted
            err = null;
            return;
        }

        if (ref
            && ref.indexedDataAbstractMap
            && ref.indexedDataAbstractMap.keys()) {

            if (objId && objId.length > 0) {
                ref.indexedDataAbstractMap.delete(objId);
                const keys = [...ref.indexedDataAbstractMap.keys()];

                if (keys.length > 0) {
                    await DataIndexersService.write(params, ref, target);
                } else {
                    await DataIndexersService.delete(params, indexId, target);
                }
            }
        }

        params.logger.debug('=============  END  : deleteReference DataIndexersController ===========');
    }
}
