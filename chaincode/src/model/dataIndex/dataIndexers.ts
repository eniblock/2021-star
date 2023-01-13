import { DocType } from '../../enums/DocType';
import { IndexedDataJson } from '../dataIndexersJson';

export class IndexedData {

    public static fromJson(jsonIndexedData: IndexedDataJson): IndexedData {
        let indexedDataAbstractMap: Map<string, any> = new Map();

        try {
            indexedDataAbstractMap = new Map(JSON.parse(jsonIndexedData.jsonIndexedDataAbstractMap));
        } catch (err) {
            //Do nothing, just empty map
        }

        return {
            docType: DocType.DATA_INDEXER,
            indexId: jsonIndexedData.indexId,
            indexedDataAbstractMap};
    }

    public docType: string;
    public indexId: string;
    public indexedDataAbstractMap: Map<string, any> = new Map();
}
