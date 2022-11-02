import { DocType } from "../enums/DocType";
import { ParametersType } from "../enums/ParametersType";
import { ReserveBidMarketDocument } from "../model/reserveBidMarketDocument";
import { ActivationDocumentAbstract, ActivationDocumentDateMax, EnergyAmountAbstract, IndexedData, ReserveBidMarketDocumentAbstract } from "../model/dataIndexers";
import { STARParameters } from "../model/starParameters";
import { DataIndexersService } from "./service/dataIndexersService";
import { StarPrivateDataService } from "./service/StarPrivateDataService";
import { ActivationDocument } from "../model/activationDocument/activationDocument";
import { EnergyAmount } from "../model/energyAmount";
import { DataReference } from "../model/dataReference";

export class DataIndexersController {
    public static async getIndexer(
        params: STARParameters,
        indexId: string,
        target: string): Promise<IndexedData> {
        params.logger.debug('============= START : getIndexer DataIndexersController ===========');

        const obj: IndexedData = await DataIndexersService.get(params, indexId, target);

        params.logger.debug('=============  END  : getIndexer DataIndexersController ===========');
        return obj;
    }


    public static async addReference(
        params: STARParameters,
        indexId: string,
        obj: any,
        objId: string,
        target: string) {
        params.logger.debug('============= START : addReference DataIndexersController ===========');

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

        params.logger.debug('=============  END  : addReference DataIndexersController ===========');
    }



    public static async modifyReference(
        params: STARParameters,
        indexId: string,
        obj: any,
        objId: string,
        target: string) {
        params.logger.debug('============= START : modifyReference DataIndexersController ===========');

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

        params.logger.debug('=============  END  : modifyReference DataIndexersController ===========');
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


    public static async executeOrder(
        params: STARParameters,
        updateOrder: DataReference) {
        params.logger.debug('============= START : executeOrder DataIndexersController ===========');

        if (updateOrder.data) {
            const indexData:IndexedData = updateOrder.data;

            if (indexData.indexId
                && indexData.indexId.length > 0
                && indexData.indexedDataAbstractMap
                && indexData.indexedDataAbstractMap.values) {

                for (const abstract of indexData.indexedDataAbstractMap.values()) {
                    if (abstract.reserveBidMrid &&  abstract.reserveBidMrid.length > 0) {
                        this.addReference(params, indexData.indexId, abstract, abstract.reserveBidMrid, updateOrder.collection);
                    } else if (abstract.activationDocumentMrid &&  abstract.activationDocumentMrid.length > 0) {
                        this.addReference(params, indexData.indexId, abstract, abstract.activationDocumentMrid, updateOrder.collection);
                    } else if (abstract.energyAmountMarketDocumentMrid &&  abstract.energyAmountMarketDocumentMrid.length > 0) {
                        this.addReference(params, indexData.indexId, abstract, abstract.energyAmountMarketDocumentMrid, updateOrder.collection);
                    }
                }
            }
        }

        params.logger.debug('============= END   : executeOrder DataIndexersController ===========');
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

        params.logger.debug('indexId: ', indexId);
        params.logger.debug('target: ', target);

        const obj: IndexedData = await DataIndexersController.getIndexer(params, indexId, target);

        params.logger.debug('obj: ', JSON.stringify(obj));

        params.logger.debug('=============  END  : get SiteReserveBidIndexersController ===========');
        return obj;
    }


    public static async addReserveBidReference(
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
        await DataIndexersController.addReference(params, indexId, reserveBidMarketDocumentAbstract, reserveBidObj.reserveBidMrid, target);

        params.logger.debug('=============  END  : addReserveBidReference SiteReserveBidIndexersController ===========');
    }



    public static async modifyReserveBidReference(
        params: STARParameters,
        reserveBidObj: ReserveBidMarketDocument,
        target: string = '') {
        params.logger.debug('============= START : modifyReserveBidReference SiteReserveBidIndexersController ===========');

        const reserveBidMarketDocumentAbstract : ReserveBidMarketDocumentAbstract =
            {reserveBidMrid:reserveBidObj.reserveBidMrid,
            reserveBidStatus: reserveBidObj.reserveBidStatus,
            validityPeriodStartDateTime:reserveBidObj.validityPeriodStartDateTime,
            createdDateTime:reserveBidObj.createdDateTime};
        const indexId = this.getKey(reserveBidObj.meteringPointMrid);
        await DataIndexersController.modifyReference(params, indexId, reserveBidMarketDocumentAbstract, reserveBidObj.reserveBidMrid, target);

        params.logger.debug('=============  END  : modifyReserveBidReference SiteReserveBidIndexersController ===========');
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
    // public static async getState(params: STARParameters): Promise<DataReference[]> {
    //     params.logger.debug('============= START : getState SiteReserveBidIndexersController ===========');
    //     const states: DataReference[] = [];

    //     var allSiteRef: DataReference[];
    //     try {
    //         allSiteRef = await SiteController.getAllObjRef(params);
    //     } catch (err) {
    //         //Just return empty list
    //         return states;
    //     }

    //     if (allSiteRef && allSiteRef.length > 0) {
    //         for (const siteRef of allSiteRef) {
    //             try {
    //                 const site: Site = siteRef.data;
    //                 const meteringPointMrid: string = site.meteringPointMrid;
    //                 const reserveBidList: ReserveBidMarketDocument[] = await ReserveBidMarketDocumentController.getObjByMeteringPointMrid(params, meteringPointMrid, siteRef.collection);
    //                 if (reserveBidList && reserveBidList.length > 0) {
    //                     for (const reserveBidObj of reserveBidList) {
    //                         const reserveBidMarketDocumentAbstract : ReserveBidMarketDocumentAbstract =
    //                             {reserveBidMrid:reserveBidObj.reserveBidMrid,
    //                             reserveBidStatus: reserveBidObj.reserveBidStatus,
    //                             validityPeriodStartDateTime:reserveBidObj.validityPeriodStartDateTime};
    //                         const indexId = this.getKey(reserveBidObj.meteringPointMrid);

    //                         const indexData: IndexedData = {
    //                             docType: DocType.DATA_INDEXER,
    //                             indexId: indexId,
    //                             indexedDataAbstractList: [reserveBidMarketDocumentAbstract]
    //                         };

    //                         states.push({data: indexData, collection: siteRef.collection, docType: DocType.DATA_INDEXER});
    //                     }
    //                 }
    //             } catch (err) {
    //                 //Do Nothing ... just cannot manage reserveBid
    //             }
    //         }
    //     }

    //     params.logger.debug('=============  END  : getState SiteReserveBidIndexersController ===========');
    //     return states;
    // }
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
                {activationDocumentMrid: activationDocumentObj.activationDocumentMrid, startCreatedDateTime: activationDocumentObj.startCreatedDateTime};
            const indexId = this.getKeyStr(activationDocumentObj.registeredResourceMrid, activationDocumentObj.startCreatedDateTime);

            await DataIndexersController.addReference(params, indexId, activationAbstract, activationDocumentObj.activationDocumentMrid, target);

            var maxDateStr: string = "";
            try {
                maxDateStr = await this.getMaxDate(params, activationDocumentObj.registeredResourceMrid, target);

                const maxDate = new Date(maxDateStr);
                const docDate = new Date(activationDocumentObj.startCreatedDateTime);

                if (docDate > maxDate) {
                    const dataObj: ActivationDocumentDateMax= {dateTime: activationDocumentObj.startCreatedDateTime, docType: DocType.INDEXER_MAX_DATE};
                    const maxDateId = this.getMaxKey(activationDocumentObj.registeredResourceMrid);

                    await StarPrivateDataService.write(params, {id: maxDateId, dataObj:dataObj, collection: target})
                }
            } catch (err) {
                //write activation document strat date as first Max Date
                const dataObj: ActivationDocumentDateMax= {dateTime: activationDocumentObj.startCreatedDateTime, docType: DocType.INDEXER_MAX_DATE};
                const maxDateId = this.getMaxKey(activationDocumentObj.registeredResourceMrid);

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
        await DataIndexersController.addReference(params, indexId, valueAbstract, energyAmountObj.activationDocumentMrid, target);

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

}
