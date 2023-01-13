import { DocType } from '../../enums/DocType';
import { ParametersType } from '../../enums/ParametersType';
import { IndexedData } from '../../model/dataIndex/dataIndexers';
import { EnergyAmountAbstract } from '../../model/dataIndex/energyAmountAbstract';
import { IndexedDataJson } from '../../model/dataIndexersJson';
import { DataReference } from '../../model/dataReference';
import { EnergyAmount } from '../../model/energyAmount';
import { STARParameters } from '../../model/starParameters';
import { EnergyAmountController } from '../EnergyAmountController';
import { DataIndexersService } from '../service/DataIndexersService';
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

        const indexData = {
            docType: DocType.DATA_INDEXER,
            indexId,
            indexedDataAbstractMap: new Map()};

        indexData.indexedDataAbstractMap.set(energyAmountObj.activationDocumentMrid, valueAbstract);

        await DataIndexersService.write(params, indexData, target);

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

        const states: DataReference[] = [];

        let allEnergyAmountRef: DataReference[];
        try {
            allEnergyAmountRef = await EnergyAmountController.getAll(params);
        } catch (err) {
            // Just return empty list
            return states;
        }

        const energyAmountRefMap: Map<string, DataReference> = new Map();
        if (allEnergyAmountRef && allEnergyAmountRef.length > 0) {
            for (const energyAmountRef of allEnergyAmountRef) {
                const energyAmountObj: EnergyAmount = energyAmountRef.data;

                if (energyAmountObj.createdDateTime
                    && energyAmountObj.createdDateTime.length > 0) {

                    const activationDocumentMrid = energyAmountObj.activationDocumentMrid;

                    if (!energyAmountRefMap.has(activationDocumentMrid)) {
                        energyAmountRefMap.set(activationDocumentMrid, energyAmountRef);
                    } else {
                        const storedEnergyAmountRef: DataReference = energyAmountRefMap.get(activationDocumentMrid);
                        const storedEnergyAmountObj: EnergyAmount = storedEnergyAmountRef.data;

                        if (energyAmountObj.createdDateTime > storedEnergyAmountObj.createdDateTime) {
                            energyAmountRefMap.set(activationDocumentMrid, energyAmountRef);
                        }
                    }

                }
            }
        }

        for (const energyAmountRef of energyAmountRefMap.values()) {
            const energyAmountObj: EnergyAmount = energyAmountRef.data;

            const indexId = this.getKey(energyAmountObj.activationDocumentMrid);

            const ref = {
                docType: DocType.DATA_INDEXER,
                indexId,
                indexedDataAbstractMap: new Map()};

            const valueAbstract: EnergyAmountAbstract = {
                energyAmountMarketDocumentMrid: energyAmountObj.energyAmountMarketDocumentMrid};

            ref.indexedDataAbstractMap.set(energyAmountObj.activationDocumentMrid, valueAbstract);

            states.push(
                {collection: energyAmountRef.collection,
                data: IndexedDataJson.toJson(ref),
                docType: DocType.INDEX_ACTIVATION_ENERGYAMOUNT});

        }


        params.logger.debug('=============  END  : getNeededIndexFromData ActivationNRJAmountIndexersController ===========');
        return states;
    }

    public static async executeOrder(
        params: STARParameters,
        updateOrder: DataReference) {
        params.logger.debug('============= START : executeOrder ActivationNRJAmountIndexersController ===========');

        if (updateOrder.data) {
            const indexData: IndexedData = updateOrder.data;

            if (indexData.indexId
                && indexData.indexId.length > 0
                && indexData.indexedDataAbstractMap) {

                await DataIndexersService.write(params, indexData, updateOrder.collection);
            }
        }

        params.logger.debug('============= END   : executeOrder ActivationNRJAmountIndexersController ===========');
    }

}
