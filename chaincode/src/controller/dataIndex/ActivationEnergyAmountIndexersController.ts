import { DocType } from '../../enums/DocType';
import { ParametersType } from '../../enums/ParametersType';
import { IndexedData } from '../../model/dataIndex/dataIndexers';
import { EnergyAmountAbstract } from '../../model/dataIndex/energyAmountAbstract';
import { IndexedDataJson } from '../../model/dataIndexersJson';
import { DataReference } from '../../model/dataReference';
import { EnergyAmount } from '../../model/energyAmount';
import { STARParameters } from '../../model/starParameters';
import { EnergyAmountController } from '../EnergyAmountController';
import { DataIndexersController } from './DataIndexersController';

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

        const valueAbstract: EnergyAmountAbstract = {
            energyAmountMarketDocumentMrid: energyAmountObj.energyAmountMarketDocumentMrid};
        const indexId = this.getKey(energyAmountObj.activationDocumentMrid);
        await DataIndexersController.addModifyReference(
            params, indexId, valueAbstract, energyAmountObj.activationDocumentMrid, target);

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

    // To list needed indexes from stored Data
    public static async getNeededIndexesFromData(params: STARParameters): Promise<DataReference[]> {
        params.logger.debug('============= START : getNeededIndexFromData ActivationNRJAmountIndexersController ===========');

        const energyAmountRefList = await EnergyAmountController.getAll(params);
        const indexList: DataReference[] = [];

        if (energyAmountRefList && energyAmountRefList.length > 0) {
            for (const energyAmountRef of energyAmountRefList) {
                const energyAmountObj: EnergyAmount = energyAmountRef.data;
                const indexId = this.getKey(energyAmountObj.activationDocumentMrid);
                const valueAbstract: EnergyAmountAbstract = {
                    energyAmountMarketDocumentMrid: energyAmountObj.energyAmountMarketDocumentMrid};

                const ref = {
                    docType: DocType.DATA_INDEXER,
                    indexId,
                    indexedDataAbstractMap: new Map()};

                ref.indexedDataAbstractMap.set(indexId, valueAbstract);

                indexList.push(
                    {collection: energyAmountRef.collection,
                    data: IndexedDataJson.toJson(ref),
                    docType: DocType.INDEX_ACTIVATION_ENERGYAMOUNT});
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

        params.logger.debug('============= END   : executeOrder ActivationNRJAmountIndexersController ===========');
    }

}
