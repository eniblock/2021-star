
import { DocType } from "../../enums/DocType";
import { IndexedData } from "../../model/dataIndexers";
import { IndexedDataJson } from "../../model/dataIndexersJson";
import { DataReference } from "../../model/dataReference";

import { STARParameters } from '../../model/starParameters';

import { StarPrivateDataService } from "./StarPrivateDataService";

export class DataIndexersService {


    public static async get(
        params: STARParameters,
        indexId: string,
        target: string): Promise<IndexedData> {
        params.logger.debug('============= START : get DataIndexersService ===========');


        var objJSON: IndexedDataJson;
        if (target && target.length > 0) {
            // params.logger.debug('getObj');
            objJSON = await StarPrivateDataService.getObj(params, {id: indexId, collection: target, docType: DocType.DATA_INDEXER});
        } else {
            // params.logger.debug('getObjRefbyId');

            const objRef = await StarPrivateDataService.getObjRefbyId(params, {id: indexId, docType: DocType.DATA_INDEXER});
            // params.logger.debug('objRef: ', JSON.stringify(objRef));

            if (objRef) {
                objJSON = objRef.values().next().value.data;
            }
        }
        const obj: IndexedData = IndexedData.fromJson(objJSON);

        params.logger.debug('=============  END  : get DataIndexersService ===========');
        return obj;
    }


    public static async write(
        params: STARParameters,
        obj: IndexedData,
        target: string = ''): Promise<void> {
        params.logger.debug('============= START : write DataIndexersService ===========');

        const objJSON = IndexedDataJson.toJson(obj);
        objJSON.docType = DocType.DATA_INDEXER;

        await StarPrivateDataService.write(params, {id: objJSON.indexId, dataObj: objJSON, collection: target});

        const dataReference: DataReference = {collection: target, docType: objJSON.docType, data: objJSON};
        const poolKey = objJSON.indexId;
        params.addInMemoryPool(poolKey, dataReference);

        params.logger.debug('=============  END  : write DataIndexersService ===========');
    }



    public static async delete(
        params: STARParameters,
        id: string,
        target: string): Promise<void> {
        params.logger.debug('============= START : Delete %s ( %s ) DataIndexersService ===========', id, target);

        await params.ctx.stub.deletePrivateData(target, id);

        params.logger.debug('=============  END  : Delete %s ( %s ) DataIndexersService ===========', id, target);
    }

}
