import { DocType } from "../enums/DocType";
import { IndexedData } from "./dataIndexers";

export class IndexedDataJson {

    public static toJson(indexedData : IndexedData): IndexedDataJson {
        // const jsonIndexedDataAbstractMap = JSON.stringify([...indexedData.indexedDataAbstractMap]);
        const jsonIndexedDataAbstractMap = JSON.stringify(Array.from(indexedData.indexedDataAbstractMap.entries()));

        return {
            docType: DocType.DATA_INDEXER,
            indexId: indexedData.indexId,
            jsonIndexedDataAbstractMap: jsonIndexedDataAbstractMap};
    }

    public docType: string;
    public indexId: string;
    public jsonIndexedDataAbstractMap: string;
}
