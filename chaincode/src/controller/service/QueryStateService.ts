import { Iterators } from "fabric-shim";

import { DocType } from "../../enums/DocType";

import { queryArgument } from "../../model/arguments/queryArgument";
import { DataReference } from "../../model/dataReference";
import { STARParameters } from "../../model/starParameters";

export class QueryStateService {
    /*******************************
     *                             *
     *           COMMON            *
     *                             *
     *******************************/

    public static async buildQuery(documentType: string, args: string[], sort: string[] = []): Promise<string> {
        var query = `{"selector": { "$and": [ {"docType":"${documentType}"}`;
        for (var arg of args) {
            if (arg) {
                query = query.concat(`,{${arg}}`);
            }
        }
        query = query.concat(`]`);
        if (sort && sort.length > 0) {
            query = query.concat(`,"sort":[`);
            for (var i =0; i < sort.length; i++) {
                if (i>0) {
                    query = query.concat(`,`);
                }
                query = query.concat(`{${sort[i]}}`);
            }
            query = query.concat(`]`);
        }

        query = query.concat(`}}`);

        // params.logger.info("built query :", query)
        return query;
    }


    private static async formatResultToArray(iterator: Iterators.StateQueryIterator): Promise<any[]> {
        const allResults:any[] = [];
        try {
            let result = await iterator.next();

            while (!result.done) {
                const strValue = Buffer.from(result.value.value.toString()).toString('utf8');

                let record;
                try {
                    record = JSON.parse(strValue);
                } catch (err) {
                    record = strValue;
                }
                allResults.push(record);
                result = await iterator.next();
            }
        } catch(error) {
            //do nothing just empty list returned
        }
        return allResults;
    }


    /*******************************
     *                             *
     *         PUBLIC DATA         *
     *                             *
     *******************************/


    private static async getQueryResult(
        params: STARParameters,
        arg: queryArgument): Promise<Iterators.StateQueryIterator>  {

        params.logger.debug("arg.query: ", arg.query);

        const iterator = await params.ctx.stub.getQueryResult(arg.query);

        return iterator;
    }



    public static async getQueryArrayResult(
        params: STARParameters,
        arg: queryArgument): Promise<any[]>  {
        params.logger.debug('============= START : getQueryStringResult QueryStateService ===========');

        var allResults: any[] = [];

        const poolKey = arg.query;

        var poolValue = null;
        try {
            poolValue = params.getFromMemoryPool(poolKey);
        } catch (err) {
            //Do Nothing
        }
        if (!poolValue
            || !poolValue.values().next().value
            || !poolValue.values().next().value.data
            || poolValue.values().next().value.docType !== DocType.QUERY_RESULT) {

            const iterator = await this.getQueryResult(params, arg);
            allResults = await this.formatResultToArray(iterator);

            const poolRef : DataReference = {collection: "", docType: DocType.QUERY_RESULT, data: allResults};
            params.addInMemoryPool(poolKey, poolRef);
        } else {
            allResults = poolValue.values().next().value.data;
        }


        params.logger.debug('=============  END  : getQueryStringResult QueryStateService ===========');
        return allResults;
    }

    public static async getQueryStringResult(
        params: STARParameters,
        arg: queryArgument): Promise<string>  {
        params.logger.debug('============= START : getQueryStringResult QueryStateService ===========');

        const allResults = await QueryStateService.getQueryArrayResult(params, arg);
        const formated = JSON.stringify(allResults);

        params.logger.debug('=============  END  : getQueryStringResult QueryStateService ===========');
        return formated;
    }

    public static async getAllStates(
        params: STARParameters,
        dataType: string): Promise<any[]> {
        params.logger.debug('============= START : getAllStates %s QueryStateService ===========', dataType);

        const query = `{"selector": {"docType": "${dataType}"}}`;

        params.logger.debug("query: ", query);

        const arrayResult = await QueryStateService.getQueryArrayResult(params, {query:query});

        params.logger.debug('=============  END  : getAllStates %s QueryStateService ===========', dataType);
        return arrayResult;
    }

    /*******************************
     *                             *
     *        PRIVATE DATA         *
     *                             *
     *******************************/


     private static async getPrivateQueryResult(
        params: STARParameters,
        arg: queryArgument): Promise<Iterators.StateQueryIterator>  {

        // params.logger.debug(query);
        // params.logger.debug(collection);

        var returned_iterator : any;

        const iterator: any = await params.ctx.stub.getPrivateDataQueryResult(arg.collection, arg.query);

        //Sometimes iterator is StateQueryResponse object instead of StateQueryIterator object
        // params.logger.debug("iterator :", iterator)

        if (iterator) {
            if (iterator.iterator) {
                returned_iterator = iterator.iterator;
            } else {
                returned_iterator = iterator;
            }
        }
        // params.logger.debug("iterator :", returned_iterator)


        return returned_iterator;
    }


    public static async getPrivateQueryArrayResult(
        params: STARParameters,
        arg: queryArgument): Promise<any[]>  {
        params.logger.debug('============= START : getPrivateQueryArrayResult QueryStateService ===========');

        var allResults: any[] = [];
        const poolKey = arg.collection.concat(arg.query);

        var poolValue = params.getFromMemoryPool(poolKey);
        if (!poolValue
            || !poolValue.values().next().value
            || !poolValue.values().next().value.data
            || poolValue.values().next().value.docType !== DocType.QUERY_RESULT) {

            const iterator = await this.getPrivateQueryResult(params, arg);
            allResults = await this.formatResultToArray(iterator);

            const poolRef : DataReference = {collection: arg.collection, docType: DocType.QUERY_RESULT, data: allResults};
            params.addInMemoryPool(poolKey, poolRef);
        } else {
            allResults = poolValue.values().next().value.data;
        }

        params.logger.debug('=============  END  : getPrivateQueryArrayResult QueryStateService ===========');
        return allResults;
    }


}
