import { Context } from 'fabric-contract-api';
import { OrganizationTypeMsp } from '../enums/OrganizationMspType';
import { STARParameters } from '../model/starParameters';
import { ParametersType } from '../enums/ParametersType';
import { RoleType } from '../enums/RoleType';
import { HLFServices } from './service/HLFservice';
import { CommonService } from './service/CommonService';
import { ReserveBidMarketDocument } from '../model/reserveBidMarketDocument';
import { BalancingDocument } from '../model/balancingDocument';
import { DocType } from '../enums/DocType';


const enedis_producer = "enedis-producer";
const enedis_rte = "enedis-rte";
const producer_rte = "producer-rte";
const enedis_producer_rte = "enedis-producer-rte";

const ppco_time_threshold: number = 75*24*60*60*1000; // 75 days
const pc_time_match_threshold: number = 5*60*1000; //5 minutes
const pc_time_updateend_match_threshold: number = 24*60*60*1000; // 24 hours

const energyAccount_TimeInterval_LAPsec = 24 * 60 * 60;
const energyAccount_TimeInterval_LAPsec_Less1H = 23 * 60 * 60;
const energyAccount_TimeInterval_LAPsec_Plus1H = 25 * 60 * 60;
const energyAccount_TimeInterval_Start = "PT";
const energyAccount_TimeInterval_Minutes = "M";
const energyAccount_TimeInterval_Seconds = "S";

const role_enedis = RoleType.Role_DSO;
const role_producer = RoleType.Role_Producer;
const role_rte = RoleType.Role_TSO;

export class ParametersController {
    public static targetJoinSeparator = "-";


    public static async getParameterValues(ctx: Context): Promise<STARParameters> {
        var parameters: STARParameters;

        parameters = await this.getParameterStatic(ctx);

        return parameters;
    }

    private static async getParameterStatic(ctx: Context): Promise<STARParameters> {
        const parameters: STARParameters = new STARParameters();
        parameters.ctx = ctx;

        //Sometimes problem in HLF object definition
        const ctx2:any = ctx;
        if (ctx2.logging) {
            parameters.loggerMgt =  ctx2.logging;
        } else if (ctx2.logger) {
            parameters.loggerMgt =  ctx2.logger;
        }
        if (parameters.loggerMgt) {
            parameters.logger =  parameters.loggerMgt.getLogger("STAR-LOGGER");
        }

        parameters.values = new Map();

        const identity: string = await HLFServices.getMspID(ctx);

        // params.logger.debug("Parameters Identity : %s", identity);

        parameters.values.set(ParametersType.IDENTITY, identity);

        parameters.values.set(ParametersType.PPCO_TIME_THRESHOLD, ppco_time_threshold);
        parameters.values.set(ParametersType.PC_TIME_MATCH_THRESHOLD, pc_time_match_threshold);
        parameters.values.set(ParametersType.PC_TIME_UPDATEEND_MATCH_THRESHOLD, pc_time_updateend_match_threshold);



        parameters.values.set(ParametersType.ENERGY_ACCOUNT_TIME_INTERVAL_LAPsec, energyAccount_TimeInterval_LAPsec);
        parameters.values.set(ParametersType.ENERGY_ACCOUNT_TIME_INTERVAL_LAPsec_LESS1H, energyAccount_TimeInterval_LAPsec_Less1H);
        const Less1H_Days: string[] = [CommonService.formatDateStr("2022-03-27")];
        parameters.values.set(ParametersType.ENERGY_ACCOUNT_TIME_INTERVAL_LAPsec_LESS1H_DAYS, Less1H_Days);

        parameters.values.set(ParametersType.ENERGY_ACCOUNT_TIME_INTERVAL_LAPsec_PLUS1H, energyAccount_TimeInterval_LAPsec_Plus1H);
        const Plus1H_Days: string[] = [CommonService.formatDateStr("2022-10-30")];
        parameters.values.set(ParametersType.ENERGY_ACCOUNT_TIME_INTERVAL_LAPsec_PLUS1H_DAYS, Plus1H_Days);

        parameters.values.set(ParametersType.ENERGY_ACCOUNT_TIME_INTERVAL_START, energyAccount_TimeInterval_Start);
        parameters.values.set(ParametersType.ENERGY_ACCOUNT_TIME_INTERVAL_MINUTES, energyAccount_TimeInterval_Minutes);
        parameters.values.set(ParametersType.ENERGY_ACCOUNT_TIME_INTERVAL_SECONDS, energyAccount_TimeInterval_Seconds);



        const valueRoleTable = new Map<string, string>();
        valueRoleTable.set(OrganizationTypeMsp.ENEDIS, role_enedis);
        valueRoleTable.set(OrganizationTypeMsp.PRODUCER, role_producer);
        valueRoleTable.set(OrganizationTypeMsp.RTE, role_rte);
        parameters.values.set(ParametersType.ROLE_TABLE, valueRoleTable);



        const processTypeComptage: string[] = ["A05"];
        parameters.values.set(ParametersType.PROCESS_TYPE_COMPTAGE, processTypeComptage);
        const processTypeRefrence: string[] = ["A14", "Z99"];
        parameters.values.set(ParametersType.PROCESS_TYPE_REFERENCE, processTypeRefrence);

        const balancingDocument: BalancingDocument = {
            docType: DocType.BALANCING_DOCUMENT,
            revisionNumber: '1',
            messageType: 'B44',
            processsType: 'Z42',
            businessType: 'B77',
            direction: 'A02',
        };
        parameters.values.set(ParametersType.BALANCING_DOCUMENT, balancingDocument);

        parameters.values.set(ParametersType.BALANCING_DOCUMENT_PREFIX, "BaDoc-");

        if (identity === OrganizationTypeMsp.ENEDIS) {
            /*
            * ENEDIS
            */

            parameters.values.set(ParametersType.ROLE, role_enedis);



            const valueDataTarget = new Map<string, string[]>();
            valueDataTarget.set(ParametersType.DEFAULT, [enedis_producer]);
            valueDataTarget.set(ParametersType.ALL, [enedis_producer, enedis_rte, enedis_producer_rte]);

            valueDataTarget.set(OrganizationTypeMsp.RTE, [enedis_rte]);
            valueDataTarget.set(enedis_rte, [enedis_rte]);
            valueDataTarget.set(RoleType.Role_TSO, [enedis_rte]);

            valueDataTarget.set(OrganizationTypeMsp.PRODUCER, [enedis_producer]);
            valueDataTarget.set(enedis_producer, [enedis_producer]);
            valueDataTarget.set(RoleType.Role_Producer, [enedis_producer]);

            valueDataTarget.set(enedis_producer_rte, [enedis_producer_rte]);

            parameters.values.set(ParametersType.DATA_TARGET, valueDataTarget);


            const activationDocumentRules: string[] = [];
            //messageType + "-" + businessType + "-" + reasonCode
            activationDocumentRules.push("D01-Z01-A70");

            activationDocumentRules.push("D01-Z02-A70");
            activationDocumentRules.push("D01-Z03-Y98");
            activationDocumentRules.push("D01-Z04-Y99");
            parameters.values.set(ParametersType.ACTIVATION_DOCUMENT_RULES, activationDocumentRules);

            const activationDocumentEligibility: string[] = [];
            //messageType + "-" + businessType + "-" + reasonCode
            activationDocumentEligibility.push("D01-Z01-A70");
            activationDocumentEligibility.push("D01-Z02-A70");
            parameters.values.set(ParametersType.ACTIVATION_DOCUMENT_ELIGIBILITY, activationDocumentEligibility);

            const automaticEligibility: string[] = [];
            //messageType + "-" + businessType + "-" + reasonCode
            automaticEligibility.push("D01-Z03-Y98");
            automaticEligibility.push("D01-Z02-A70");
            parameters.values.set(ParametersType.AUTOMATIC_ELIGIBILITY, automaticEligibility);

            const valueEnergy: string[] = [];
            valueEnergy.push(enedis_producer);
            parameters.values.set(ParametersType.REFERENCE_ENERGY_ACCOUNT, valueEnergy);

            /*
            *
            */
        } else if (identity === OrganizationTypeMsp.PRODUCER) {
            /*
            * PRODUCER
            */

            parameters.values.set(ParametersType.ROLE, role_producer);

            const reserveBidObj: ReserveBidMarketDocument = {
                reserveBidMrid: '',
                meteringPointMrid: '',
                messageType: 'A44',
                processType: 'A27',
                senderMarketParticipantMrid: '',
                receiverMarketParticipantMrid: '',
                createdDateTime: '',
                businessType: 'A87',
                quantityMeasureUnitName: 'MWh',
                priceMeasureUnitName: '€/MWh',
                currencyUnitName: '€',
                flowDirection: '',
                energyPriceAmount: 0
            };
            parameters.values.set(ParametersType.RESERVE_BID_MARKET_DOCUMENT_BASE, reserveBidObj);


            const valueDataTarget = new Map<string, string[]>();

            valueDataTarget.set(ParametersType.ALL, [enedis_producer, producer_rte, enedis_producer_rte]);

            valueDataTarget.set(OrganizationTypeMsp.ENEDIS, [enedis_producer]);
            valueDataTarget.set(enedis_producer, [enedis_producer]);

            valueDataTarget.set(OrganizationTypeMsp.PRODUCER, [enedis_producer, producer_rte]);
            valueDataTarget.set(RoleType.Role_Producer, [enedis_producer, producer_rte]);

            valueDataTarget.set(OrganizationTypeMsp.RTE, [producer_rte]);
            valueDataTarget.set(producer_rte, [producer_rte]);
            valueDataTarget.set(RoleType.Role_TSO, [producer_rte]);

            valueDataTarget.set(enedis_producer_rte, [enedis_producer_rte]);

            parameters.values.set(ParametersType.DATA_TARGET, valueDataTarget);


            const valueEnergy: string[] = [];
            valueEnergy.push(enedis_producer);
            valueEnergy.push(producer_rte);
            parameters.values.set(ParametersType.REFERENCE_ENERGY_ACCOUNT, valueEnergy);

            /*
            *
            */
        } else if (identity === OrganizationTypeMsp.RTE) {
            /*
            * RTE
            */

            parameters.values.set(ParametersType.ROLE, role_rte);


            const valueDataTarget = new Map<string, string[]>();

            valueDataTarget.set(ParametersType.DEFAULT, [producer_rte]);
            valueDataTarget.set(ParametersType.ALL, [enedis_rte, producer_rte, enedis_producer_rte]);

            valueDataTarget.set(OrganizationTypeMsp.ENEDIS, [enedis_rte]);
            valueDataTarget.set(RoleType.Role_DSO, [enedis_rte]);
            valueDataTarget.set(enedis_rte, [enedis_rte]);

            valueDataTarget.set(OrganizationTypeMsp.PRODUCER, [producer_rte]);
            valueDataTarget.set(RoleType.Role_Producer, [producer_rte]);
            valueDataTarget.set(RoleType.Role_TSO, [producer_rte]);
            valueDataTarget.set(producer_rte, [producer_rte]);

            valueDataTarget.set(enedis_producer_rte, [enedis_producer_rte]);

            parameters.values.set(ParametersType.DATA_TARGET, valueDataTarget);


            const activationDocumentRules: string[] = [];
            //messageType + "-" + businessType + "-" + reasonCode
            activationDocumentRules.push("A98-C55-A70");
            activationDocumentRules.push("A98-C55-A98");
            activationDocumentRules.push("A54-C55-A70");
            activationDocumentRules.push("A54-C55-A98");

            activationDocumentRules.push("A98-C55-Z71");
            activationDocumentRules.push("A98-C55-Z72");
            activationDocumentRules.push("A98-C55-Z73");
            activationDocumentRules.push("A98-C55-Z74");

            activationDocumentRules.push("A98-A53-ZB1");
            activationDocumentRules.push("A98-A53-ZB2");
            activationDocumentRules.push("A98-A53-ZB3");
            activationDocumentRules.push("A98-A53-ZB4");
            activationDocumentRules.push("A98-A53-ZB5");
            activationDocumentRules.push("A98-A53-ZB6");

            activationDocumentRules.push("A98-C55-Z91");
            activationDocumentRules.push("A98-C55-Z92");

            activationDocumentRules.push("A54-C55-Z71");
            activationDocumentRules.push("A54-C55-Z72");
            activationDocumentRules.push("A54-C55-Z73");
            activationDocumentRules.push("A54-C55-Z74");

            activationDocumentRules.push("A98-A53-ZB1");
            activationDocumentRules.push("A98-A53-ZB2");
            activationDocumentRules.push("A98-A53-ZB3");
            activationDocumentRules.push("A98-A53-ZB4");
            activationDocumentRules.push("A98-A53-ZB5");
            activationDocumentRules.push("A98-A53-ZB6");

            activationDocumentRules.push("A54-C55-Z91");
            activationDocumentRules.push("A54-C55-Z92");
            parameters.values.set(ParametersType.ACTIVATION_DOCUMENT_RULES, activationDocumentRules);

            const activationDocumentEligibility: string[] = [];
            //messageType + "-" + businessType + "-" + reasonCode
            parameters.values.set(ParametersType.ACTIVATION_DOCUMENT_ELIGIBILITY, activationDocumentEligibility);


            const valueEnergy: string[] = [];
            valueEnergy.push(producer_rte);
            parameters.values.set(ParametersType.REFERENCE_ENERGY_ACCOUNT, valueEnergy);

            /*
            *
            */
        }

        return parameters;
    }

}
