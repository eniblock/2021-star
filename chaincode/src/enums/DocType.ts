export enum DocType {
    ACTIVATION_DOCUMENT = 'activationDocument',
    ACTIVATION_DOCUMENT_COMPOSITE_KEY = 'activationDocumentCompositeKey',
    ATTACHMENT_FILE = 'attachmentFile',
    BALANCING_DOCUMENT = 'balancingDocument',
    ENERGY_ACCOUNT = 'energyAccount',
    ENERGY_AMOUNT = 'energyAmount',
    FEEDBACK_PRODUCER = 'feedbackProducer',
    PRODUCER = 'producer',
    REFERENCE_ENERGY_ACCOUNT = 'referenceEnergyAccount',
    RESERVE_BID_MARKET_DOCUMENT = 'reserveBidMarketDocument',
    SITE = 'site',
    SYSTEM_OPERATOR = 'systemOperator',
    YELLOW_PAGES = 'yellowPages',

    /* TECHNICAL TYPE      */
    /* Used by Pool Memory */
    QUERY_RESULT = 'queryResult',
    /* index to get data without query */
    DATA_INDEXER = 'dataIndexer',
    INDEX_SITE_RESERVE_BID = 'indexSiteReserveBid',
    INDEX_SITE_ACTIVATION = 'indexSiteActivation',
    INDEX_ACTIVATION_COMPOSITE_KEY = 'indexActivationCompositeKey',
    INDEX_ACTIVATION_ENERGYAMOUNT = 'indexActivationEnergyAmount',
    INDEXER_MAX_DATE = 'indexerMaxDate',

}
