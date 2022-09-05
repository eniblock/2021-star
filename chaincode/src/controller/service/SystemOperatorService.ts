import { Context } from "fabric-contract-api";
import { Iterators } from "fabric-shim";
import { DocType } from "../../enums/DocType";
import { STARParameters } from "../../model/starParameters";
import { SystemOperator } from "../../model/systemOperator";
import { StarDataService } from "./StarDataService";


export class SystemOperatorService {

    public static async write(
        params: STARParameters,
        systemOperatorObj: SystemOperator): Promise<void> {
        params.logger.debug('============= START : write SystemOperatorService ===========', );

        systemOperatorObj.docType = DocType.SYSTEM_OPERATOR;
        await StarDataService.write(params, {id: systemOperatorObj.systemOperatorMarketParticipantMrid, dataObj: systemOperatorObj});

        params.logger.debug('=============  END  : write SystemOperatorService ===========', );
    }



    public static async getQueryResult(
        params: STARParameters,
        query: string): Promise<Iterators.StateQueryIterator>  {
        params.logger.debug('============= START : getQueryResult SystemOperatorService ===========', );

        const iterator = await params.ctx.stub.getQueryResult(query);

        params.logger.debug('=============  END  : getQueryResult SystemOperatorService ===========');
        return iterator;
    }


}
