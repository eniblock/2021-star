import { Context } from 'fabric-contract-api';
import { DocType } from '../enums/DocType';
import { IndeminityStatus } from '../enums/IndemnityStatus';
import { OrganizationTypeMsp } from '../enums/OrganizationMspType';
import { ParametersType } from '../enums/ParametersType';
import { ReserveBidStatus } from '../enums/ReserveBidStatus';
import { RoleType } from '../enums/RoleType';
import { BalancingDocument } from '../model/balancingDocument';
import { ReserveBidMarketDocument } from '../model/reserveBidMarketDocument';
import { STARParameters } from '../model/starParameters';
import { CommonService } from './service/CommonService';
import { HLFServices } from './service/HLFservice';

const enedisProducer = 'enedis-producer';
const enedisRte = 'enedis-rte';
const producerRte = 'producer-rte';
const enedisProducerRte = 'enedis-producer-rte';

const ppcoTimeThreshold: number = 750; // 750 days
const pcTimeMatchThreshold: number = 5 * 60 * 1000; // 5 minutes
const pcEndTimeMatchThreshold: number = 30; // 30 minutes
const pcTimeUpdateendMatchThreshold: number = 24 * 60 * 60 * 1000; // 24 hours

const reserveBidValidationTimeMax: number = 30; // 30 days
const reserveBidOutOfTimeStatus = ReserveBidStatus.VALIDATED;

const energyAccountTimeIntervalLAPsec = 24 * 60 * 60;
const energyAccountTimeIntervalLAPsecLess1H = 23 * 60 * 60;
const energyAccountTimeIntervalLAPsecPlus1H = 25 * 60 * 60;
const energyAccountTimeIntervalStart = 'PT';
const energyAccountTimeIntervalMinutes = 'M';
const energyAccountTimeIntervalSeconds = 'S';

const feedbackProducerValidityPeriod: number = 7 * 5; // nb of days for 5 full weeks

const roleEnedis = RoleType.Role_DSO;
const roleProducer = RoleType.Role_Producer;
const roleRte = RoleType.Role_TSO;

export class ParametersController {
    public static targetJoinSeparator = '-';

    public static async getParameterValues(ctx: Context): Promise<STARParameters> {
        let parameters: STARParameters;

        parameters = await this.getParameterStatic(ctx);

        return parameters;
    }

    private static async getParameterStatic(ctx: Context): Promise<STARParameters> {
        const parameters: STARParameters = new STARParameters();
        parameters.ctx = ctx;

        // Sometimes problem in HLF object definition
        const ctx2: any = ctx;
        if (ctx2.logging) {
            parameters.loggerMgt =  ctx2.logging;
        } else if (ctx2.logger) {
            parameters.loggerMgt =  ctx2.logger;
        }
        if (parameters.loggerMgt) {
            parameters.logger =  parameters.loggerMgt.getLogger('STAR-LOGGER');
        }

        parameters.values = new Map();

        const identity: string = await HLFServices.getMspID(ctx);

        parameters.values.set(ParametersType.IDENTITY, identity);

        parameters.values.set(ParametersType.PPCO_TIME_THRESHOLD, ppcoTimeThreshold);
        parameters.values.set(ParametersType.PC_TIME_MATCH_THRESHOLD, pcTimeMatchThreshold);
        parameters.values.set(ParametersType.PC_END_TIME_MATCH_THRESHOLD, pcEndTimeMatchThreshold);
        parameters.values.set(ParametersType.PC_TIME_UPDATEEND_MATCH_THRESHOLD, pcTimeUpdateendMatchThreshold);

        parameters.values.set(ParametersType.RESERVE_BID_VALIDATION_TIME_MAX, reserveBidValidationTimeMax);
        parameters.values.set(ParametersType.RESERVE_BID_OUT_OF_TIME_STATUS, reserveBidOutOfTimeStatus);

        parameters.values.set(ParametersType.ENERGY_ACCOUNT_TIME_INTERVAL_LAPsec, energyAccountTimeIntervalLAPsec);
        parameters.values.set(
            ParametersType.ENERGY_ACCOUNT_TIME_INTERVAL_LAPsec_LESS1H, energyAccountTimeIntervalLAPsecLess1H);
        const Less1HDays: string[] = [CommonService.formatDateStr('2022-03-27'), CommonService.formatDateStr('2023-03-26')];
        parameters.values.set(ParametersType.ENERGY_ACCOUNT_TIME_INTERVAL_LAPsec_LESS1H_DAYS, Less1HDays);

        parameters.values.set(
            ParametersType.ENERGY_ACCOUNT_TIME_INTERVAL_LAPsec_PLUS1H, energyAccountTimeIntervalLAPsecPlus1H);
        const Plus1HDays: string[] = [CommonService.formatDateStr('2022-10-30')];
        parameters.values.set(ParametersType.ENERGY_ACCOUNT_TIME_INTERVAL_LAPsec_PLUS1H_DAYS, Plus1HDays);

        parameters.values.set(ParametersType.ENERGY_ACCOUNT_TIME_INTERVAL_START, energyAccountTimeIntervalStart);
        parameters.values.set(ParametersType.ENERGY_ACCOUNT_TIME_INTERVAL_MINUTES, energyAccountTimeIntervalMinutes);
        parameters.values.set(ParametersType.ENERGY_ACCOUNT_TIME_INTERVAL_SECONDS, energyAccountTimeIntervalSeconds);

        const valueRoleTable = new Map<string, string>();
        valueRoleTable.set(OrganizationTypeMsp.ENEDIS, roleEnedis);
        valueRoleTable.set(OrganizationTypeMsp.PRODUCER, roleProducer);
        valueRoleTable.set(OrganizationTypeMsp.RTE, roleRte);
        parameters.values.set(ParametersType.ROLE_TABLE, valueRoleTable);

        const processTypeComptage: string[] = ['A05'];
        parameters.values.set(ParametersType.PROCESS_TYPE_COMPTAGE, processTypeComptage);
        const processTypeRefrence: string[] = ['A14', 'Z99'];
        parameters.values.set(ParametersType.PROCESS_TYPE_REFERENCE, processTypeRefrence);

        const balancingDocument: BalancingDocument = {
            businessType: 'B77',
            direction: 'A02',
            docType: DocType.BALANCING_DOCUMENT,
            messageType: 'B44',
            processsType: 'Z42',
            revisionNumber: '1',
        };
        parameters.values.set(ParametersType.BALANCING_DOCUMENT, balancingDocument);

        parameters.values.set(ParametersType.BALANCING_DOCUMENT_PREFIX, 'BaDoc_');


        parameters.values.set(ParametersType.FEEDBACK_PRODUCER_PREFIX, 'FeedBack_');

        parameters.values.set(ParametersType.FEEDBACK_PRODUCER_VALIDITY_PERIOD, feedbackProducerValidityPeriod);


        parameters.values.set(ParametersType.AUTHORIZED_STATUS_ENERGY_AMOUNT, [IndeminityStatus.IN_PROGRESS]);
        parameters.values.set(ParametersType.AUTHORIZED_STATUS_RESERVEBID, [IndeminityStatus.IN_PROGRESS]);

        if (identity === OrganizationTypeMsp.ENEDIS) {
            /*
            * ENEDIS
            */

            parameters.values.set(ParametersType.ROLE, roleEnedis);

            const valueDataTarget = new Map<string, string[]>();
            valueDataTarget.set(ParametersType.DEFAULT, [enedisProducer]);
            valueDataTarget.set(ParametersType.ALL, [enedisProducer, enedisRte, enedisProducerRte]);

            valueDataTarget.set(OrganizationTypeMsp.RTE, [enedisRte]);
            valueDataTarget.set(enedisRte, [enedisRte]);
            valueDataTarget.set(RoleType.Role_TSO, [enedisRte]);

            valueDataTarget.set(OrganizationTypeMsp.PRODUCER, [enedisProducer]);
            valueDataTarget.set(enedisProducer, [enedisProducer]);
            valueDataTarget.set(RoleType.Role_Producer, [enedisProducer]);

            valueDataTarget.set(enedisProducerRte, [enedisProducerRte]);
            valueDataTarget.set(ParametersType.ALL_ROLE, [enedisProducerRte]);

            parameters.values.set(ParametersType.DATA_TARGET, valueDataTarget);

            const activationDocumentRules: string[] = [];
            // messageType + "-" + businessType + "-" + reasonCode
            activationDocumentRules.push('D01-Z01-A70');

            activationDocumentRules.push('D01-Z02-A70');
            activationDocumentRules.push('D01-Z03-Y98');
            activationDocumentRules.push('D01-Z04-Y99');
            parameters.values.set(ParametersType.ACTIVATION_DOCUMENT_RULES, activationDocumentRules);

            const activationDocumentEligibility: string[] = [];
            // messageType + "-" + businessType + "-" + reasonCode
            activationDocumentEligibility.push('D01-Z01-A70');
            activationDocumentEligibility.push('D01-Z02-A70');
            parameters.values.set(ParametersType.ACTIVATION_DOCUMENT_ELIGIBILITY, activationDocumentEligibility);

            const activationDocumentVisibility: string[] = [];
            // messageType + "-" + businessType + "-" + reasonCode
            activationDocumentVisibility.push('D01-Z01-A70');
            parameters.values.set(ParametersType.ACTIVATION_DOCUMENT_VISIBILITY, activationDocumentVisibility);

            const activationDocumentMiss: string[] = [];
            // messageType + "-" + businessType + "-" + reasonCode
            activationDocumentMiss.push('D01-Z01-A70');
            parameters.values.set(ParametersType.ACTIVATION_DOCUMENT_MISS, activationDocumentMiss);

            const automaticEligibility: string[] = [];
            // messageType + "-" + businessType + "-" + reasonCode
            automaticEligibility.push('D01-Z03-Y98');
            automaticEligibility.push('D01-Z02-A70');
            parameters.values.set(ParametersType.AUTOMATIC_ELIGIBILITY, automaticEligibility);

            const valueEnergy: string[] = [];
            valueEnergy.push(enedisProducer);
            parameters.values.set(ParametersType.REFERENCE_ENERGY_ACCOUNT, valueEnergy);

            /*
            *
            */
        } else if (identity === OrganizationTypeMsp.PRODUCER) {
            /*
            * PRODUCER
            */

            parameters.values.set(ParametersType.ROLE, roleProducer);

            const reserveBidObj: ReserveBidMarketDocument = {
                businessType: 'A87',
                createdDateTime: '',
                currencyUnitName: '€',
                energyPriceAmount: 0,
                flowDirection: '',
                messageType: 'A44',
                meteringPointMrid: '',
                priceMeasureUnitName: '€/MWh',
                processType: 'A27',
                quantityMeasureUnitName: 'MWh',
                receiverMarketParticipantMrid: '',
                reserveBidMrid: '',
                senderMarketParticipantMrid: '',
            };
            parameters.values.set(ParametersType.RESERVE_BID_MARKET_DOCUMENT_BASE, reserveBidObj);

            const valueDataTarget = new Map<string, string[]>();

            valueDataTarget.set(ParametersType.ALL, [enedisProducer, producerRte, enedisProducerRte]);

            valueDataTarget.set(OrganizationTypeMsp.ENEDIS, [enedisProducer]);
            valueDataTarget.set(enedisProducer, [enedisProducer]);

            valueDataTarget.set(OrganizationTypeMsp.PRODUCER, [enedisProducer, producerRte]);
            valueDataTarget.set(RoleType.Role_Producer, [enedisProducer, producerRte]);

            valueDataTarget.set(OrganizationTypeMsp.RTE, [producerRte]);
            valueDataTarget.set(producerRte, [producerRte]);
            valueDataTarget.set(RoleType.Role_TSO, [producerRte]);

            valueDataTarget.set(enedisProducerRte, [enedisProducerRte]);

            parameters.values.set(ParametersType.DATA_TARGET, valueDataTarget);

            const valueEnergy: string[] = [];
            valueEnergy.push(enedisProducer);
            valueEnergy.push(producerRte);
            parameters.values.set(ParametersType.REFERENCE_ENERGY_ACCOUNT, valueEnergy);

            /*
            *
            */
        } else if (identity === OrganizationTypeMsp.RTE) {
            /*
            * RTE
            */

            parameters.values.set(ParametersType.ROLE, roleRte);

            const valueDataTarget = new Map<string, string[]>();

            valueDataTarget.set(ParametersType.DEFAULT, [producerRte]);
            valueDataTarget.set(ParametersType.ALL, [enedisRte, producerRte, enedisProducerRte]);

            valueDataTarget.set(OrganizationTypeMsp.ENEDIS, [enedisRte]);
            valueDataTarget.set(RoleType.Role_DSO, [enedisRte]);
            valueDataTarget.set(enedisRte, [enedisRte]);

            valueDataTarget.set(OrganizationTypeMsp.PRODUCER, [producerRte]);
            valueDataTarget.set(RoleType.Role_Producer, [producerRte]);
            valueDataTarget.set(RoleType.Role_TSO, [producerRte]);
            valueDataTarget.set(producerRte, [producerRte]);

            valueDataTarget.set(enedisProducerRte, [enedisProducerRte]);

            parameters.values.set(ParametersType.DATA_TARGET, valueDataTarget);

            const activationDocumentRules: string[] = [];
            // messageType + "-" + businessType + "-" + reasonCode
            activationDocumentRules.push('A98-C55-A70');
            activationDocumentRules.push('A98-C55-A98');
            activationDocumentRules.push('A54-C55-A70');
            activationDocumentRules.push('A54-C55-A98');

            activationDocumentRules.push('A98-C55-Z71');
            activationDocumentRules.push('A98-C55-Z72');
            activationDocumentRules.push('A98-C55-Z73');
            activationDocumentRules.push('A98-C55-Z74');

            activationDocumentRules.push('A98-A53-ZB1');
            activationDocumentRules.push('A98-A53-ZB2');
            activationDocumentRules.push('A98-A53-ZB3');
            activationDocumentRules.push('A98-A53-ZB4');
            activationDocumentRules.push('A98-A53-ZB5');
            activationDocumentRules.push('A98-A53-ZB6');

            activationDocumentRules.push('A98-C55-Z91');
            activationDocumentRules.push('A98-C55-Z92');

            activationDocumentRules.push('A54-C55-Z71');
            activationDocumentRules.push('A54-C55-Z72');
            activationDocumentRules.push('A54-C55-Z73');
            activationDocumentRules.push('A54-C55-Z74');

            activationDocumentRules.push('A98-A53-ZB1');
            activationDocumentRules.push('A98-A53-ZB2');
            activationDocumentRules.push('A98-A53-ZB3');
            activationDocumentRules.push('A98-A53-ZB4');
            activationDocumentRules.push('A98-A53-ZB5');
            activationDocumentRules.push('A98-A53-ZB6');

            activationDocumentRules.push('A54-C55-Z91');
            activationDocumentRules.push('A54-C55-Z92');
            parameters.values.set(ParametersType.ACTIVATION_DOCUMENT_RULES, activationDocumentRules);

            const activationDocumentEligibility: string[] = [];
            // messageType + "-" + businessType + "-" + reasonCode
            parameters.values.set(ParametersType.ACTIVATION_DOCUMENT_ELIGIBILITY, activationDocumentEligibility);

            const automaticEligibility: string[] = [];
            // messageType + "-" + businessType + "-" + reasonCode
            parameters.values.set(ParametersType.AUTOMATIC_ELIGIBILITY, automaticEligibility);

            const valueEnergy: string[] = [];
            valueEnergy.push(producerRte);
            parameters.values.set(ParametersType.REFERENCE_ENERGY_ACCOUNT, valueEnergy);

            /*
            *
            */
        }

        return parameters;
    }

}
