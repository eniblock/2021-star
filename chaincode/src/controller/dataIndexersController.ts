import { DocType } from "../enums/DocType";
import { ParametersType } from "../enums/ParametersType";
import { ReserveBidMarketDocument } from "../model/reserveBidMarketDocument";
import { ActivationDocumentAbstract, ActivationDocumentCompositeKeyAbstract, ActivationDocumentDateMax, EnergyAmountAbstract, IndexedData, ReserveBidMarketDocumentAbstract } from "../model/dataIndexers";
import { STARParameters } from "../model/starParameters";
import { DataIndexersService } from "./service/dataIndexersService";
import { StarPrivateDataService } from "./service/StarPrivateDataService";
import { ActivationDocument } from "../model/activationDocument/activationDocument";
import { EnergyAmount } from "../model/energyAmount";
import { DataReference } from "../model/dataReference";
import { HLFServices } from "./service/HLFservice";
import { QueryStateService } from "./service/QueryStateService";
import { EnergyAmountController } from "./EnergyAmountController";
import { SiteController } from "./SiteController";
import { Site } from "../model/site";
import { ReserveBidMarketDocumentController } from "./ReserveBidMarketDocumentController";
import { ActivationDocumentController } from "./activationDocument/ActivationDocumentController";
import { ActivationDocumentCompositeKey } from "../model/activationDocument/activationDocumentCompositeKey";
import { IndexedDataJson } from "../model/dataIndexersJson";

export class DataIndexersController {
    public static async getAll(params: STARParameters): Promise<DataReference[]> {
        params.logger.info('============= START : get all DataIndexersController ===========');

        const collections = await HLFServices.getCollectionsFromParameters(params, ParametersType.DATA_TARGET, ParametersType.ALL);

        const dataList: DataReference[] = [];
        for (const collection of collections) {
            const allResults = await QueryStateService.getAllPrivateData(params, DocType.DATA_INDEXER, collection);
            if (allResults && allResults.length > 0) {
                for (const result of allResults) {
                    dataList.push({collection: collection, data: result, docType: DocType.DATA_INDEXER})
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

        var ref: IndexedData = null;
        try {
            ref = await this.getIndexer(params, indexId, target);
        } catch (err) {
            //ref doesn't exist and needs to be created
            err = null;
        }

        if (!ref
            || !ref.indexId
            || ref.indexId.length === 0) {

            ref = {
                docType: DocType.DATA_INDEXER,
                indexedDataAbstractMap: new Map(),
                indexId:indexId};
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

        var ref: IndexedData = null;
        try {
            ref = await this.getIndexer(params, indexId, target);
        } catch (err) {
            //ref doesn't exist and doesn't need to be deleted
            err = null;
            return;
        }

        if (ref
            && ref.indexedDataAbstractMap
            && ref.indexedDataAbstractMap.keys()) {

            if (objId && objId.length > 0) {
                ref.indexedDataAbstractMap.delete(objId);
                let keys = [...ref.indexedDataAbstractMap.keys()];

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
        params.logger.debug('============= START : addReserveBidReference SiteReserveBidIndexersController ===========');

        const reserveBidMarketDocumentAbstract : ReserveBidMarketDocumentAbstract =
            {reserveBidMrid:reserveBidObj.reserveBidMrid,
            reserveBidStatus: reserveBidObj.reserveBidStatus,
            validityPeriodStartDateTime:reserveBidObj.validityPeriodStartDateTime,
            createdDateTime:reserveBidObj.createdDateTime};
        const indexId = this.getKey(reserveBidObj.meteringPointMrid);
        await DataIndexersController.addModifyReference(params, indexId, reserveBidMarketDocumentAbstract, reserveBidObj.reserveBidMrid, target);

        params.logger.debug('=============  END  : addReserveBidReference SiteReserveBidIndexersController ===========');
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

    //To Rebuild indexes from stored Data
    public static async getNeededIndexesFromData(params: STARParameters): Promise<DataReference[]> {
        params.logger.debug('============= START : getNeededIndexesFromData SiteReserveBidIndexersController ===========');
        const states: DataReference[] = [];

        var allSiteRef: DataReference[];
        try {
            allSiteRef = await SiteController.getAllObjRef(params);
        } catch (err) {
            //Just return empty list
            return states;
        }

        if (allSiteRef && allSiteRef.length > 0) {
            for (const siteRef of allSiteRef) {
                try {
                    const site: Site = siteRef.data;
                    const meteringPointMrid: string = site.meteringPointMrid;
                    const reserveBidList: ReserveBidMarketDocument[] = await ReserveBidMarketDocumentController.getObjByMeteringPointMrid(params, meteringPointMrid, siteRef.collection);
                    if (reserveBidList && reserveBidList.length > 0) {
                        for (const reserveBidObj of reserveBidList) {
                            const reserveBidMarketDocumentAbstract : ReserveBidMarketDocumentAbstract =
                                {
                                    reserveBidMrid: reserveBidObj.reserveBidMrid,
                                    reserveBidStatus: reserveBidObj.reserveBidStatus,
                                    validityPeriodStartDateTime: reserveBidObj.validityPeriodStartDateTime,
                                    createdDateTime: reserveBidObj.createdDateTime
                                };
                            const indexId = this.getKey(reserveBidObj.meteringPointMrid);

                            const indexData: IndexedData = {
                                docType: DocType.DATA_INDEXER,
                                indexId: indexId,
                                indexedDataAbstractMap: new Map()
                            };

                            indexData.indexedDataAbstractMap.set(indexId, reserveBidMarketDocumentAbstract);

                            states.push({data: IndexedDataJson.toJson(indexData), collection: siteRef.collection, docType: DocType.INDEX_SITE_RESERVE_BID});
                        }
                    }
                } catch (err) {
                    //Do Nothing ... just cannot manage reserveBid
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
            const indexDataJson:IndexedDataJson = updateOrder.data;
            const indexData:IndexedData = IndexedData.fromJson(indexDataJson);

            if (indexData.indexId
                && indexData.indexId.length > 0
                && indexData.indexedDataAbstractMap
                && indexData.indexedDataAbstractMap.values) {

                const [valueAbstract, dataId] = indexData.indexedDataAbstractMap.entries().next().value;
                await DataIndexersController.addModifyReference(params, indexData.indexId, valueAbstract, dataId, updateOrder.collection);
            }
        }

        params.logger.debug('============= END   : executeOrder SiteReserveBidIndexersController ===========');
    }

}







export class SiteActivationIndexersController {
    public static getMaxKey(meteringPointMrid: string): string {
        return ParametersType.SITE_ACTIVATION_INDEXER_PREFIX.concat(meteringPointMrid);
    }

    public static getKey(meteringPointMrid: string, dateRef: Date): string {
        var dateKeyStr: string = "X";

        try {
            dateKeyStr = JSON.stringify(dateRef.getFullYear()).concat("-").concat(JSON.stringify(dateRef.getMonth()));
        } catch (err) {
            //Do Nothing
        }

        return ParametersType.SITE_ACTIVATION_INDEXER_PREFIX.concat(meteringPointMrid).concat("-").concat(dateKeyStr);
    }

    private static getKeyStr(meteringPointMrid: string, startCreatedDateTime: string): string {
        var dateKeyStr: string = "X";
        if (startCreatedDateTime
            && startCreatedDateTime.length > 0) {

            try {
                const dateRef = new Date(startCreatedDateTime);
                return this.getKey(meteringPointMrid, dateRef);
            } catch (err) {
                //Do Nothing
            }
        }
        return ParametersType.SITE_ACTIVATION_INDEXER_PREFIX.concat(meteringPointMrid).concat("-").concat(dateKeyStr);
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
        const obj: ActivationDocumentDateMax = await StarPrivateDataService.getObj(params, {id: indexId, collection: target, docType: DocType.DATA_INDEXER})
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
            const maxDate_Str = await this.getMaxDate(params, meteringPointMrid, target);
            const maxDate = new Date(maxDate_Str);
            var refDate = new Date(referenceDate);


            while (refDate <= maxDate) {
                const indexId = this.getKey(meteringPointMrid, refDate);
                try {
                    const obj: IndexedData = await DataIndexersController.getIndexer(params, indexId, target);
                    objList.push(obj);
                } catch (err) {
                    //Do Nothing
                }
                refDate.setMonth(refDate.getMonth()+1);
            }
        } catch (err) {
            //Do Nothing
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
            const activationAbstract: ActivationDocumentAbstract =
                {activationDocumentMrid: activationDocumentObj.activationDocumentMrid,
                startCreatedDateTime: activationDocumentObj.startCreatedDateTime,
                registeredResourceMrid: activationDocumentObj.registeredResourceMrid};

            const indexId = this.getKeyStr(activationDocumentObj.registeredResourceMrid, activationDocumentObj.startCreatedDateTime);

            await this.addActivationReferenceWithIdAndAbstract(params, indexId, activationAbstract, target);
        }

        params.logger.debug('=============  END  : addActivationReference SiteActivationIndexersController ===========');
    }


    private static async addActivationReferenceWithIdAndAbstract(
        params: STARParameters,
        indexId: string,
        activationAbstract: ActivationDocumentAbstract,
        target: string = '') {
        params.logger.debug('============= START : addActivationReference SiteActivationIndexersController ===========');

        params.logger.debug("indexId: ", indexId)
        params.logger.debug("activationAbstract: ", activationAbstract)
        params.logger.debug("target: ", target)

        if (activationAbstract.startCreatedDateTime && activationAbstract.startCreatedDateTime.length > 0) {
            await DataIndexersController.addModifyReference(params, indexId, activationAbstract, activationAbstract.activationDocumentMrid, target);

            var maxDateStr: string = "";
            try {
                maxDateStr = await this.getMaxDate(params, activationAbstract.registeredResourceMrid, target);

                const maxDate = new Date(maxDateStr);
                const docDate = new Date(activationAbstract.startCreatedDateTime);

                if (docDate > maxDate) {
                    const dataObj: ActivationDocumentDateMax= {dateTime: activationAbstract.startCreatedDateTime, docType: DocType.INDEXER_MAX_DATE};
                    const maxDateId = this.getMaxKey(activationAbstract.registeredResourceMrid);

                    await StarPrivateDataService.write(params, {id: maxDateId, dataObj:dataObj, collection: target})
                }
            } catch (err) {
                //write activation document strat date as first Max Date
                const dataObj: ActivationDocumentDateMax= {dateTime: activationAbstract.startCreatedDateTime, docType: DocType.INDEXER_MAX_DATE};
                const maxDateId = this.getMaxKey(activationAbstract.registeredResourceMrid);

                await StarPrivateDataService.write(params, {id: maxDateId, dataObj:dataObj, collection: target})
            }
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


    //To list needed indexes from stored Data
    public static async getNeededIndexesFromData(params: STARParameters): Promise<DataReference[]> {
        params.logger.debug('============= START : getNeededIndexFromData SiteActivationIndexersController ===========');


        const activationDocumentRefList = await ActivationDocumentController.getAll(params);
        const indexList: DataReference[] = [];

        if (activationDocumentRefList && activationDocumentRefList.length > 0) {
            for (const activationDocumentRef of activationDocumentRefList) {
                const activationDocumentObj: ActivationDocument = activationDocumentRef.data;

                const indexId = this.getKeyStr(activationDocumentObj.registeredResourceMrid, activationDocumentObj.startCreatedDateTime);
                const activationAbstract: ActivationDocumentAbstract =
                    {activationDocumentMrid: activationDocumentObj.activationDocumentMrid,
                    startCreatedDateTime: activationDocumentObj.startCreatedDateTime,
                    registeredResourceMrid: activationDocumentObj.registeredResourceMrid};

                const ref = {
                    docType: DocType.DATA_INDEXER,
                    indexedDataAbstractMap: new Map(),
                    indexId:indexId};

                ref.indexedDataAbstractMap.set(indexId, activationAbstract);

                indexList.push({collection: activationDocumentRef.collection, docType: DocType.INDEX_SITE_ACTIVATION, data:IndexedDataJson.toJson(ref)});
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
            const indexDataJson:IndexedDataJson = updateOrder.data;
            const indexData:IndexedData = IndexedData.fromJson(indexDataJson);

            if (indexData.indexId
                && indexData.indexId.length > 0
                && indexData.indexedDataAbstractMap
                && indexData.indexedDataAbstractMap.values) {

                const valueAbstract = indexData.indexedDataAbstractMap.values().next().value;
                await this.addActivationReferenceWithIdAndAbstract(params, indexData.indexId, valueAbstract, updateOrder.collection);
            }
        }

        params.logger.debug('============= END   : executeOrder SiteActivationIndexersController ===========');
    }


}



export class ActivationCompositeKeyIndexersController {

    public static getActivationDocumentCompositeKeyId(
        activationDocumentCompositeKeyObj: ActivationDocumentCompositeKey): string {
        var id = "";
        id = id.concat(activationDocumentCompositeKeyObj.originAutomationRegisteredResourceMrid);

        id = id.concat("_");

        id = id.concat(activationDocumentCompositeKeyObj.registeredResourceMrid);

        id = id.concat("_");

        if (activationDocumentCompositeKeyObj.startCreatedDateTime
            && activationDocumentCompositeKeyObj.startCreatedDateTime.length > 0) {
            id = id.concat(activationDocumentCompositeKeyObj.startCreatedDateTime);
        } else {
            id = id.concat("startCreatedDateTime");
        }

        id = id.concat("_");

        if (activationDocumentCompositeKeyObj.endCreatedDateTime
            && activationDocumentCompositeKeyObj.endCreatedDateTime.length > 0) {
                id = id.concat(activationDocumentCompositeKeyObj.endCreatedDateTime);
        } else {
            id = id.concat("endCreatedDateTime");
        }

        id = id.concat("_");

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
            activationDocumentMrid: activationDocumentObj.activationDocumentMrid
        }

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


    //To list needed indexes from stored Data
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
                    activationDocumentMrid: activationDocumentObj.activationDocumentMrid
                }

                const ref = {
                    docType: DocType.DATA_INDEXER,
                    indexedDataAbstractMap: new Map(),
                    indexId:compositeKeyId};

                ref.indexedDataAbstractMap.set(compositeKeyId, valueAbstract);

                indexList.push({collection: activationDocumentRef.collection, docType: DocType.INDEX_ACTIVATION_COMPOSITE_KEY, data:IndexedDataJson.toJson(ref)});
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
            const indexDataJson:IndexedDataJson = updateOrder.data;
            const indexData:IndexedData = IndexedData.fromJson(indexDataJson);

            if (indexData.indexId
                && indexData.indexId.length > 0
                && indexData.indexedDataAbstractMap
                && indexData.indexedDataAbstractMap.values) {

                const [valueAbstract, dataId] = indexData.indexedDataAbstractMap.entries().next().value;
                await DataIndexersController.addModifyReference(params, indexData.indexId, valueAbstract, dataId, updateOrder.collection);
            }
        }

        params.logger.debug('============= END   : executeOrder ActivationCompositeKeyIndexersController ===========');
    }


}





export class ActivationEnergyAmountIndexersController {

    public static getKey(activationDocumentId: string): string {
        return ParametersType.ACTIVATION_ENERGY_AMOUNT_INDEXER_PREFIX.concat(activationDocumentId);
    }

    public static async get(
        params: STARParameters,
        activationDocumentId: string,
        target: string = ''): Promise<IndexedData> {
        params.logger.debug('============= START : get ActivationNRJAmountIndexersController ===========');

        const indexId = this.getKey(activationDocumentId);
        const obj: IndexedData = await DataIndexersController.getIndexer(params, indexId, target);

        params.logger.debug('=============  END  : get ActivationNRJAmountIndexersController ===========');
        return obj;
    }


    public static async addEnergyAmountReference(
        params: STARParameters,
        energyAmountObj: EnergyAmount,
        target: string = '') {
        params.logger.debug('============= START : addEnergyAmountReference ActivationNRJAmountIndexersController ===========');

        const valueAbstract : EnergyAmountAbstract =
            {energyAmountMarketDocumentMrid:energyAmountObj.energyAmountMarketDocumentMrid};
        const indexId = this.getKey(energyAmountObj.activationDocumentMrid);
        await DataIndexersController.addModifyReference(params, indexId, valueAbstract, energyAmountObj.activationDocumentMrid, target);

        params.logger.debug('=============  END  : addEnergyAmountReference ActivationNRJAmountIndexersController ===========');
    }


    public static async deleteEnergyAmountReference(
        params: STARParameters,
        activationDocumentId: string,
        target: string) {
        params.logger.debug('============= START : deleteEnergyAmountReference ActivationNRJAmountIndexersController ===========');

        const indexId = this.getKey(activationDocumentId);
        await DataIndexersController.deleteReference(params, indexId, activationDocumentId, target);

        params.logger.debug('=============  END  : deleteEnergyAmountReference ActivationNRJAmountIndexersController ===========');
    }


    //To list needed indexes from stored Data
    public static async getNeededIndexesFromData(params: STARParameters): Promise<DataReference[]> {
        params.logger.debug('============= START : getNeededIndexFromData ActivationNRJAmountIndexersController ===========');


        const energyAmountRefList = await EnergyAmountController.getAll(params);
        const indexList: DataReference[] = [];

        if (energyAmountRefList && energyAmountRefList.length > 0) {
            for (const energyAmountRef of energyAmountRefList) {
                const energyAmountObj: EnergyAmount = energyAmountRef.data;
                const indexId = this.getKey(energyAmountObj.activationDocumentMrid);
                const valueAbstract : EnergyAmountAbstract = {energyAmountMarketDocumentMrid:energyAmountObj.energyAmountMarketDocumentMrid};

                const ref = {
                    docType: DocType.DATA_INDEXER,
                    indexedDataAbstractMap: new Map(),
                    indexId:indexId};

                ref.indexedDataAbstractMap.set(indexId, valueAbstract);

                indexList.push({collection: energyAmountRef.collection, docType: DocType.INDEX_ACTIVATION_ENERGYAMOUNT, data:IndexedDataJson.toJson(ref)});
            }
        }

        params.logger.debug('=============  END  : getNeededIndexFromData ActivationNRJAmountIndexersController ===========');
        return indexList;
    }



    public static async executeOrder(
        params: STARParameters,
        updateOrder: DataReference) {
        params.logger.debug('============= START : executeOrder ActivationNRJAmountIndexersController ===========');

        if (updateOrder.data) {
            const indexDataJson:IndexedDataJson = updateOrder.data;
            const indexData:IndexedData = IndexedData.fromJson(indexDataJson);

            if (indexData.indexId
                && indexData.indexId.length > 0
                && indexData.indexedDataAbstractMap
                && indexData.indexedDataAbstractMap.values) {

                const [valueAbstract, dataId] = indexData.indexedDataAbstractMap.entries().next().value;
                await DataIndexersController.addModifyReference(params, indexData.indexId, valueAbstract, dataId, updateOrder.collection);
            }
        }

        params.logger.debug('============= END   : executeOrder ActivationNRJAmountIndexersController ===========');
    }


}
