import { DataObjArgument } from "../../model/arguments/dataObjArgument";
import { IdArgument } from "../../model/arguments/idArgument";
import { DataReference } from "../../model/dataReference";
import { STARParameters } from "../../model/starParameters";

export class StarDataService {
    private static async getRaw(
        params: STARParameters,
        arg: IdArgument): Promise<Uint8Array> {
        params.logger.debug('============= START : getRaw %s %s ===========', arg.id, arg.docType);

        const dataAsBytes = await params.ctx.stub.getState(arg.id);
        if (!dataAsBytes || dataAsBytes.length === 0) {
            throw new Error(`${arg.docType} : ${arg.id} does not exist`);
        }

        params.logger.debug('=============  END  : getRaw %s %s ===========', arg.id, arg.docType);
        return dataAsBytes;
    }


    public static async getObj(
        params: STARParameters,
        arg: IdArgument): Promise<any> {
        params.logger.debug('============= START : getObj %s %s ===========', arg.id, arg.docType);

        var dataObj:any = null;

        const poolKey = arg.id;

        const dataRef = params.getFromMemoryPool(poolKey);
        if (dataRef
            && dataRef.values().next().value
            && dataRef.values().next().value.data
            && (dataRef.values().next().value.docType === arg.docType || !arg.docType || arg.docType.length == 0)
            ) {
            dataObj = dataRef.values().next().value.data;
        }

        if (!dataObj) {
            const dataAsBytes: Uint8Array = await StarDataService.getRaw(params, arg);
            if (dataAsBytes) {
                try {
                    dataObj = JSON.parse(dataAsBytes.toString());

                    const poolRef : DataReference = {collection: "", docType: arg.docType, data: dataObj};
                    params.addInMemoryPool(poolKey, poolRef);
                } catch (error) {
                    throw new Error(`ERROR ${arg.docType} -> Input string NON-JSON value`);
                }
            }

        }

        params.logger.debug('=============  END  : getObj %s %s ===========', arg.id, arg.docType);
        return dataObj;
    }


    public static async write(
        params: STARParameters,
        arg: DataObjArgument): Promise<void> {

        params.logger.debug('============= START : Write %s %s ===========', arg.id, arg.dataObj.docType);

        await params.ctx.stub.putState(arg.id,Buffer.from(JSON.stringify(arg.dataObj)));

        const poolRef : DataReference = {collection: "", docType: arg.dataObj.docType, data: arg.dataObj};
        params.addInMemoryPool(arg.id, poolRef);


        params.logger.debug('=============  END  : Write %s %s ===========', arg.id, arg.dataObj.docType);
    }

}
