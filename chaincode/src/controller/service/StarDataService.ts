import { DataObjArgument } from '../../model/arguments/dataObjArgument';
import { IdArgument } from '../../model/arguments/idArgument';
import { DataReference } from '../../model/dataReference';
import { STARParameters } from '../../model/starParameters';

export class StarDataService {

    public static async getObj(
        params: STARParameters,
        arg: IdArgument): Promise<any> {
        params.logger.debug('============= START : getObj %s %s ===========', arg.id, arg.docType);

        let dataObj: any = null;

        const poolKey = arg.id;

        const dataRef = params.getFromMemoryPool(poolKey);
        if (dataRef
            && dataRef.values().next().value
            && dataRef.values().next().value.data
            && (dataRef.values().next().value.docType === arg.docType || !arg.docType || arg.docType.length === 0)
            ) {
            dataObj = dataRef.values().next().value.data;
        }

        if (!dataObj) {
            const dataAsBytes: Uint8Array = await StarDataService.getRaw(params, arg);
            if (dataAsBytes) {
                try {
                    dataObj = JSON.parse(dataAsBytes.toString());

                    const poolRef: DataReference = {collection: 'XoX', docType: arg.docType, data: dataObj};
                    params.addInMemoryPool(poolKey, poolRef);
                } catch (error) {
                    params.logger.debug('=============  END  : getObj with Error ===========');
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

        //Control if write tries to erase an existing data with another docType
        let storedObj: any = null;
        try {
            storedObj = await this.getObj(params, {id:arg.id});
        } catch (err) {
            //Do nothing, no obj stored with same id
        }
        if (storedObj
            && storedObj.docType
            && storedObj.docType.length !== 0) {

            if (storedObj.docType !== arg.dataObj.docType) {
                throw new Error(`${arg.id} cannot be used to store ${arg.dataObj.docType} because already used to store ${storedObj.docType}.`);
            }
        }

        await params.ctx.stub.putState(arg.id, Buffer.from(JSON.stringify(arg.dataObj)));

        const poolRef: DataReference = {collection: 'XoX', docType: arg.dataObj.docType, data: arg.dataObj};
        params.addInMemoryPool(arg.id, poolRef);

        params.logger.debug('=============  END  : Write %s %s ===========', arg.id, arg.dataObj.docType);
    }
    private static async getRaw(
        params: STARParameters,
        arg: IdArgument): Promise<Uint8Array> {
        params.logger.debug('============= START : getRaw %s %s ===========', arg.id, arg.docType);

        const dataAsBytes = await params.ctx.stub.getState(arg.id);
        if (!dataAsBytes || dataAsBytes.length === 0) {
            params.logger.debug('=============  END  : getRaw with Error ===========');
            throw new Error(`${arg.docType} : ${arg.id} does not exist`);
        }

        params.logger.debug('=============  END  : getRaw %s %s ===========', arg.id, arg.docType);
        return dataAsBytes;
    }

}
