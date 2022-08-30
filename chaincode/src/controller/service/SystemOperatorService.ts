import { Context } from "fabric-contract-api";
import { Iterators } from "fabric-shim";
import { DocType } from "../../enums/DocType";
import { STARParameters } from "../../model/starParameters";
import { SystemOperator } from "../../model/systemOperator";
import { StarDataService } from "./StarDataService";


export class SystemOperatorService {

    // public static async getObj(
    //     ctx: Context,
    //     params: STARParameters,
    //     id: string): Promise<SystemOperator> {

    //     var dataObj:SystemOperator = await StarDataService.getObj(ctx, params, id, DocType.SYSTEM_OPERATOR);

    //     return dataObj;
    // }


    public static async write(
        params: STARParameters,
        systemOperatorObj: SystemOperator): Promise<void> {

        systemOperatorObj.docType = DocType.SYSTEM_OPERATOR;
        await StarDataService.write(params, {id: systemOperatorObj.systemOperatorMarketParticipantMrid, dataObj: systemOperatorObj});
    }



    public static async getQueryResult(
        params: STARParameters,
        query: string): Promise<Iterators.StateQueryIterator>  {
        console.debug('============= START : getQueryResult SystemOperatorService ===========', );

        const iterator = await params.ctx.stub.getQueryResult(query);

        console.debug('============= END : getQueryResult SystemOperatorService ===========');
        return iterator;
    }


}
