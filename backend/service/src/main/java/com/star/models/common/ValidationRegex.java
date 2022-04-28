package com.star.models.common;

public class ValidationRegex {
    public static final String DATETIME_REGEX = "("
            + "((2000|2400|2800|(19|2[0-9](0[48]|[2468][048]|[13579][26])))-02-29)"
            + "|(((19|2[0-9])[0-9]{2})-02-(0[1-9]|1[0-9]|2[0-8]))"
            + "|(((19|2[0-9])[0-9]{2})-(0[13578]|10|12)-(0[1-9]|[12][0-9]|3[01]))"
            + "|(((19|2[0-9])[0-9]{2})-(0[469]|11)-(0[1-9]|[12][0-9]|30))"
            + ")"
            + "T"
            + "(([0-1][0-9])|(2[0-3])):[0-5][0-9]:[0-5][0-9]"
            + "Z";
    public static final String DATETIME_OR_EMPTY_REGEX = "("+DATETIME_REGEX+")|(^$)";
    public static final String DATETIME_REGEX_STR = "YYYY-MM-DDThh:mm:ssZ";
    public static final String RESOLUTION_REGEX = "P([0-9]+Y)*([0-9]+M)*([0-9]+D)*T([0-9]+H)*([0-9]+M)*([0-9]+S)*";
    public static final String RESOLUTION_REGEX_STR = "PnYnMnDTnHnMnS";
    public static final String DATETIME_INTERVAL_REGEX = DATETIME_REGEX + "/" + DATETIME_REGEX;
    public static final String DATETIME_INTERVAL_REGEX_STR = "YYYY-MM-DDThh:mm:ssZ/YYYY-MM-DDThh:mm:ssZ";


}
