/**
 * SPDX-License-Identifier: Apache-2.0
 */

 export enum ParametersType {
    DEFAULT = "default",
    ALL = "all",

    IDENTITY = 'identity',

    ROLE = 'role',
    ROLE_TABLE = 'roleTable',

    DATA_TARGET = 'dataTarget',

    ACTIVATION_DOCUMENT_RULES = 'activationDocumentRules',
    ACTIVATION_DOCUMENT_ELIGIBILITY = 'activationDocumentEligibility',
    PPCO_TIME_THRESHOLD = 'pPCOTimeThershold',
    PC_TIME_MATCH_THRESHOLD = 'pCTimeMatchThreshold',
    PC_TIME_UPDATEEND_MATCH_THRESHOLD = 'pCTimeUpdateEndMatchThreshold',

    ENERGY_ACCOUNT_TIME_INTERVAL_LAPsec = 'energyAccount_TimeInterval_LAPsec',
    ENERGY_ACCOUNT_TIME_INTERVAL_LAPsec_LESS1H = 'energyAccount_TimeInterval_LAPsec_Less1H',
    ENERGY_ACCOUNT_TIME_INTERVAL_LAPsec_LESS1H_DAYS = 'energyAccount_TimeInterval_LAPsec_Less1H_Days',
    ENERGY_ACCOUNT_TIME_INTERVAL_LAPsec_PLUS1H = 'energyAccount_TimeInterval_LAPsec_Plus1H',
    ENERGY_ACCOUNT_TIME_INTERVAL_LAPsec_PLUS1H_DAYS = 'energyAccount_TimeInterval_LAPsec_Plus1H_Days',
    ENERGY_ACCOUNT_TIME_INTERVAL_START = 'energyAccount_TimeInterval_Start',
    ENERGY_ACCOUNT_TIME_INTERVAL_MINUTES = 'energyAccount_TimeInterval_Minutes',
    ENERGY_ACCOUNT_TIME_INTERVAL_SECONDS = 'energyAccount_TimeInterval_Seconds',

    REFERENCE_ENERGY_ACCOUNT = 'referenceEnergyAccount',
    PROCESS_TYPE_COMPTAGE = "comptage",
    PROCESS_TYPE_REFERENCE = "reference",

    RESERVE_BID_MARKET_DOCUMENT_BASE = "reserveBidMarketDocumentBase"
  }
