/**
 * SPDX-License-Identifier: Apache-2.0
 */

 export enum ParametersType {
    DEFAULT = "default",
    ALL = "all",

    IDENTITY = 'identity',

    ROLE = 'role',
    ROLE_TABLE = 'roleTable',

    SITE = 'site',

    ACTIVATION_DOCUMENT = 'activationDocument',
    ACTIVATION_DOCUMENT_RULES = 'activationDocumentRules',
    ACTIVATION_DOCUMENT_ELIGIBILITY = 'activationDocumentEligibility',
    PPCO_TIME_THRESHOLD = 'pPCOTimeThershold',
    PC_TIME_MATCH_THRESHOLD = 'pCTimeMatchThreshold',
    PC_TIME_UPDATEEND_MATCH_THRESHOLD = 'pCTimeUpdateEndMatchThreshold',

    ENERGY_AMOUNT = 'energyAmount',
    ENERGY_ACCOUNT = 'energyAccount',
    REFERENCE_ENERGY_ACCOUNT = 'referenceEnergyAccount',
  }
