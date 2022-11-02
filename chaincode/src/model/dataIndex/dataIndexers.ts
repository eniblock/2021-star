import { DocType } from '../../enums/DocType';
import { IndexedDataJson } from '../dataIndexersJson';

export class IndexedData {

    public static fromJson(jsonIndexedData: IndexedDataJson): IndexedData {
        // const indexedDataAbstractMap: Map<string, any> = JSON.parse(jsonIndexedData.jsonIndexedDataAbstractMap);
        const indexedDataAbstractMap: Map<string, any> =
            new Map(JSON.parse(jsonIndexedData.jsonIndexedDataAbstractMap));

        return {
            docType: DocType.DATA_INDEXER,
            indexId: jsonIndexedData.indexId,
            indexedDataAbstractMap};
    }

    public docType: string;
    public indexId: string;
    public indexedDataAbstractMap: Map<string, any> = new Map();
}
