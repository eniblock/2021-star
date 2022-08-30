import { DataObjArgument } from "../../model/arguments/dataObjArgument";
import { IdArgument } from "../../model/arguments/idArgument";
import { DataReference } from "../../model/dataReference";
import { STARParameters } from "../../model/starParameters";

export class StarDataService {
    private static async getRaw(
        params: STARParameters,
        arg: IdArgument): Promise<Uint8Array> {

        console.debug('============= START : getRaw %s %s ===========', arg.id, arg.docType);

        const dataAsBytes = await params.ctx.stub.getState(arg.id);
        if (!dataAsBytes || dataAsBytes.length === 0) {
            throw new Error(`${arg.docType} : ${arg.id} does not exist`);
        }

        console.debug('============= END : getRaw %s %s ===========', arg.id, arg.docType);
        return dataAsBytes;
    }


    public static async getObj(
        params: STARParameters,
        arg: IdArgument): Promise<any> {

        var dataObj:any = null;

        const dataRef = params.getFromMemoryPool(arg.id);
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
                } catch (error) {
                    throw new Error(`ERROR ${arg.docType} -> Input string NON-JSON value`);
                }
            }

        }

        return dataObj;
    }


    public static async write(
        params: STARParameters,
        arg: DataObjArgument): Promise<void> {

        console.debug('============= START : Write %s %s ===========', arg.id, arg.dataObj.docType);

        await params.ctx.stub.putState(arg.id,Buffer.from(JSON.stringify(arg.dataObj)));

        const poolRef : DataReference = {collection: "", docType: arg.dataObj.docType, data: arg.dataObj};
        params.addInMemoryPool(arg.id, poolRef);


        console.debug('============= END : Write %s %s ===========', arg.id, arg.dataObj.docType);
    }

}
