package com.star.service.helpers;

import com.cloudant.client.api.query.EmptyExpression;
import com.cloudant.client.api.query.Operation;
import com.cloudant.client.api.query.QueryBuilder;
import com.cloudant.client.api.query.Selector;

import java.util.List;

public class QueryBuilderHelper {

    public static QueryBuilder toQueryBuilder(List<Selector> selectors) {
        switch (selectors.size()) {
            case 0:
                return new QueryBuilder(EmptyExpression.empty());
            case 1:
                return new QueryBuilder(selectors.get(0));
            default:
                return new QueryBuilder(Operation.and(selectors.toArray(new Selector[]{})));
        }
    }

}
