import { Iterators } from 'fabric-shim';

import { DocType } from '../../enums/DocType';
import { BuildQueryArgument } from '../../model/arguments/buildQueryArgument';

import { QueryArgument } from '../../model/arguments/queryArgument';
import { DataReference } from '../../model/dataReference';
import { STARParameters } from '../../model/starParameters';

export class QueryStateService {
    /*******************************
     *                             *
     *           COMMON            *
     *                             *
     *******************************/

    public static async buildQuery(args: BuildQueryArgument): Promise<string> {
        let query = `{"selector": { "$and": [ {"docType":"${args.documentType}"}`;
        for (const arg of args.queryArgs) {
            if (arg) {
                query = query.concat(`,{${arg}}`);
            }
        }
        query = query.concat(`]}`);

        // If Limit given
        if (args.limit && args.limit > 0) {
            query = query.concat(`,"limit":`);
            query = query.concat(args.limit.toString());
        }

        // If Sort given
        if (args.sort && args.sort.length > 0) {
            query = query.concat(`,"sort":[`);
            for (let i = 0; i < args.sort.length; i++) {
                if (args.sort[i] && args.sort[i].length > 0) {
                    if (i > 0) {
                        query = query.concat(`,`);
                    }
                    query = query.concat(`{${args.sort[i]}}`);
                }
            }
            query = query.concat(`]`);
        }

        // If index given
        if (args.index && args.index.length > 0) {
            query = query.concat(`,"use_index":[`);
            for (let i = 0; i < args.index.length; i++) {
                if (args.index[i] && args.index[i].length > 0) {
                    if (i > 0) {
                        query = query.concat(`,`);
                    }
                    query = query.concat(`${args.index[i]}`);
                }
            }
            query = query.concat(`]`);
        }

        query = query.concat(`}`);

        // params.logger.info("built query :", query)
        return query;
    }

    public static async buildORCriteria(criteriaList: string[]): Promise<string> {
        let ORCriteria: string = ``;

        if (criteriaList.length === 1) {
            ORCriteria = criteriaList[0];
        } else if (criteriaList.length > 1) {
            ORCriteria = `"$or":[`;
            for (let i = 0; i < criteriaList.length; i++) {
                if (i > 0) {
                    ORCriteria = ORCriteria.concat(`,`);
                }
                ORCriteria = ORCriteria.concat(`{`).concat(criteriaList[i]).concat(`}`);
            }
            ORCriteria = ORCriteria.concat(`]`);
        }
        return ORCriteria;
    }

    public static async buildANDCriteria(criteriaList: string[]): Promise<string> {
        let ORCriteria: string = ``;

        if (criteriaList.length === 1) {
            ORCriteria = criteriaList[0];
        } else if (criteriaList.length > 1) {
            ORCriteria = `"$and":[`;
            for (let i = 0; i < criteriaList.length; i++) {
                if (i > 0) {
                    ORCriteria = ORCriteria.concat(`,`);
                }
                ORCriteria = ORCriteria.concat(`{`).concat(criteriaList[i]).concat(`}`);
            }
            ORCriteria = ORCriteria.concat(`]`);
        }
        return ORCriteria;
    }

    /*******************************
     *                             *
     *         PUBLIC DATA         *
     *                             *
     *******************************/

    public static async getQueryArrayResult(
        params: STARParameters,
        arg: QueryArgument): Promise<any[]>  {
        params.logger.debug('============= START : getQueryStringResult QueryStateService ===========');

        let allResults: any[] = [];

        const poolKey = arg.query;

        let poolValue = null;
        try {
            poolValue = params.getFromMemoryPool(poolKey);
        } catch (err) {
            // Do Nothing
        }
        if (!poolValue
            || !poolValue.values().next().value
            || !poolValue.values().next().value.data
            || poolValue.values().next().value.docType !== DocType.QUERY_RESULT) {

            const iterator = await this.getQueryResult(params, arg);
            allResults = await this.formatResultToArray(iterator);

            const poolRef: DataReference = {collection: '', docType: DocType.QUERY_RESULT, data: allResults};
            params.addInMemoryPool(poolKey, poolRef);
        } else {
            allResults = poolValue.values().next().value.data;
        }

        params.logger.debug('=============  END  : getQueryStringResult QueryStateService ===========');
        return allResults;
    }

    public static async getQueryStringResult(
        params: STARParameters,
        arg: QueryArgument): Promise<string>  {
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

        params.logger.debug('query: ', query);

        const arrayResult = await QueryStateService.getQueryArrayResult(params, {query});

        params.logger.debug('=============  END  : getAllStates %s QueryStateService ===========', dataType);
        return arrayResult;
    }

    /*******************************
     *                             *
     *        PRIVATE DATA         *
     *                             *
     *******************************/

    public static async getPrivateQueryArrayResult(
        params: STARParameters,
        arg: QueryArgument): Promise<any[]>  {
        params.logger.debug('============= START : getPrivateQueryArrayResult QueryStateService ===========');

        let allResults: any[] = [];
        const poolKey = arg.collection.concat(arg.query);

        const poolValue = params.getFromMemoryPool(poolKey);
        if (!poolValue
            || !poolValue.values().next().value
            || !poolValue.values().next().value.data
            || poolValue.values().next().value.docType !== DocType.QUERY_RESULT) {

            const iterator = await this.getPrivateQueryResult(params, arg);
            allResults = await this.formatResultToArray(iterator);

            const poolRef: DataReference = {
                collection: arg.collection,
                data: allResults,
                docType: DocType.QUERY_RESULT};
            params.addInMemoryPool(poolKey, poolRef);
        } else {
            allResults = poolValue.values().next().value.data;
        }

        params.logger.debug('=============  END  : getPrivateQueryArrayResult QueryStateService ===========');
        return allResults;
    }

    public static async getAllPrivateData(
        params: STARParameters,
        dataType: string,
        target: string): Promise<any[]> {
        params.logger.debug('============= START : getAllPrivateData %s QueryStateService ===========', dataType);

        const query = `{"selector": {"docType": "${dataType}"}}`;

        const iterator = await this.getPrivateQueryResult(params, {query, collection: target});
        const allResults = await this.formatResultToArray(iterator);

        params.logger.debug('=============  END  : getAllPrivateData %s QueryStateService ===========', dataType);
        return allResults;
    }

    private static async formatResultToArray(iterator: Iterators.StateQueryIterator): Promise<any[]> {
        const allResults: any[] = [];
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
        } catch (error) {
            // do nothing just empty list returned
        }
        return allResults;
    }

    // PRIVATE METHODS

    /*******************************
     *                             *
     *         PUBLIC DATA         *
     *                             *
     *******************************/

    private static async getQueryResult(
        params: STARParameters,
        arg: QueryArgument): Promise<Iterators.StateQueryIterator>  {

        params.logger.debug('arg.query: ', arg.query);

        const iterator = await params.ctx.stub.getQueryResult(arg.query);

        return iterator;
    }

    /*******************************
     *                             *
     *        PRIVATE DATA         *
     *                             *
     *******************************/

     private static async getPrivateQueryResult(
        params: STARParameters,
        arg: QueryArgument): Promise<Iterators.StateQueryIterator>  {

        // params.logger.debug(query);
        // params.logger.debug(collection);

        let returnedIterator: any;

        const iterator: any = await params.ctx.stub.getPrivateDataQueryResult(arg.collection, arg.query);

        // Sometimes iterator is StateQueryResponse object instead of StateQueryIterator object
        // params.logger.debug("iterator :", iterator)

        if (iterator) {
            if (iterator.iterator) {
                returnedIterator = iterator.iterator;
            } else {
                returnedIterator = iterator;
            }
        }
        // params.logger.debug("iterator :", returned_iterator)

        return returnedIterator;
    }

}
