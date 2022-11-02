import { DocType } from "../enums/DocType";
import { IndexedDataJson } from "./dataIndexersJson";

export class ReserveBidMarketDocumentAbstract {
    public reserveBidMrid: string;
    public reserveBidStatus: string;
    public validityPeriodStartDateTime?: string;
    public createdDateTime: string;
}

export class ActivationDocumentAbstract {
    public activationDocumentMrid: string;
    public startCreatedDateTime: string;
}

export class ActivationDocumentDateMax{
    public docType: string
    public dateTime: string;
}

export class EnergyAmountAbstract {
    public energyAmountMarketDocumentMrid: string;
}

export class IndexedData {

    public static fromJson(jsonIndexedData : IndexedDataJson): IndexedData {
        // const indexedDataAbstractMap: Map<string, any> = JSON.parse(jsonIndexedData.jsonIndexedDataAbstractMap);
        const indexedDataAbstractMap: Map<string, any> = new Map(JSON.parse(jsonIndexedData.jsonIndexedDataAbstractMap));

        return {
            docType: DocType.DATA_INDEXER,
            indexId: jsonIndexedData.indexId,
            indexedDataAbstractMap: indexedDataAbstractMap};
    }

    public docType: string;
    public indexId: string;
    public indexedDataAbstractMap: Map<string, any> = new Map();
}
