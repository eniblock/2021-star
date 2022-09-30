
import { DocType } from "../../enums/DocType";
import { DataReference } from "../../model/dataReference";

import { STARParameters } from '../../model/starParameters';

import { StarPrivateDataService } from "./StarPrivateDataService";

export class DataIndexersService {


    public static async write(
        params: STARParameters,
        ref: any,
        target: string = ''): Promise<void> {
        params.logger.debug('============= START : write DataIndexersService ===========');

        ref.docType = DocType.DATA_INDEXER;
        await StarPrivateDataService.write(params, {id: ref.indexId, dataObj: ref, collection: target});

        const dataReference: DataReference = {collection: target, docType: ref.docType, data: ref};
        const poolKey = ref.indexId;
        params.addInMemoryPool(poolKey, dataReference);

        params.logger.debug('=============  END  : write DataIndexersService ===========');
    }
}
