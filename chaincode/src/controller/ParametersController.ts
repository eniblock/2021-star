import { Context } from 'fabric-contract-api';
import { OrganizationTypeMsp } from '../enums/OrganizationMspType';
import { STARParameters } from '../model/starParameters';
import { ParametersType } from '../enums/ParametersType';
import { RoleType } from '../enums/RoleType';
import { HLFServices } from './service/HLFservice';
import { DataReference } from '../model/dataReference';


const enedis_producer = "enedis-producer";
const enedis_rte = "enedis-rte";
const producer_rte = "producer-rte";
const enedis_producer_rte = "enedis-producer-rte";

const ppco_time_threshold: number = 75*24*60*60*1000; // 75 days
const pc_time_match_threshold: number = 5*60*1000; //5 minutes
const pc_time_updateend_match_threshold: number = 24*60*60*1000; // 24 hours

const role_enedis = RoleType.Role_DSO;
const role_producer = RoleType.Role_Producer;
const role_rte = RoleType.Role_TSO;

export class ParametersController {
    public static targetJoinSeparator = "-";
    // public static async changeAllParameters(
    //     ctx: Context,
    //     inputStr: string) {
    //     console.debug('============= START : Change All Parameters ===========');

    //     const identity = params.values.get(ParametersType.IDENTITY);

    //     let paramValues: Map<string,string>;
    //     try {
    //         paramValues = JSON.parse(inputStr);
    //     } catch (error) {
    //         throw new Error(`ERROR paramValues-> Input string NON-JSON value`);
    //     }

    //     const parameters = new Parameters();
    //     parameters.values = paramValues;

    //     const parametersInput = Parameters.schema.validateSync(
    //         parameters,
    //         {strict: true, abortEarly: false},
    //     );

    //     parameters.docType = 'parameters';

    //     await ctx.stub.putState(
    //         identity,
    //         Buffer.from(JSON.stringify(parameters)),
    //     );
    //     console.debug('============= END   : START : Change All Parameters for %s ===========',
    //         identity,
    //     );
    // }

    // public static async getAllParameters(ctx: Context): Promise<Map<string,string>> {
    //     console.debug('============= START : Get All Parameters ===========');

    //     const identity = params.values.get(ParametersType.IDENTITY);

    //     const parametersAsBytes = await ctx.stub.getState(identity);

    //     if (!parametersAsBytes || parametersAsBytes.length === 0) {
    //         return new Map<string, string>();
    //     }
    //     const parameters: Parameters = JSON.parse(parametersAsBytes.toString());

    //     let returnedValues: Map<string,string>;
    //     if(parameters!==null && parameters.values!==null && typeof(parameters.values) !== "undefined") {
    //         returnedValues=parameters.values;
    //     } else {
    //         returnedValues= new Map();
    //     }


    //     console.debug('============= END : Get All Parameters ===========');
    //     return returnedValues;
    // }

    public static async getParameterValues(ctx: Context): Promise<STARParameters> {
        console.debug('============= START : Get Parameter ===========');

    //     const paramValues: Map<string,string> = await this.getAllParameters(ctx);

    //     console.debug(paramValues);

        var parameters: STARParameters;
    //     if(paramValues[paramName]!==null && typeof(paramValues[paramName]) !== "undefined") {
    //         value=paramValues[paramName];
    //     }

        parameters = await this.getParameterStatic(ctx);

        console.debug('============= END : Get Parameter ===========');
        return parameters;
    }

    private static async getParameterStatic(ctx: Context): Promise<STARParameters> {
        console.debug('============= START : Get Parameter Static ===========');

        const parameters: STARParameters = new STARParameters();
        parameters.ctx = ctx;
        parameters.values = new Map();

        const identity: string = await HLFServices.getMspID(ctx);

        // console.debug("Parameters Identity : %s", identity);

        parameters.values.set(ParametersType.IDENTITY, identity);

        parameters.values.set(ParametersType.PPCO_TIME_THRESHOLD, ppco_time_threshold);
        parameters.values.set(ParametersType.PC_TIME_MATCH_THRESHOLD, pc_time_match_threshold);
        parameters.values.set(ParametersType.PC_TIME_UPDATEEND_MATCH_THRESHOLD, pc_time_updateend_match_threshold);

        const valueRoleTable = new Map<string, string>();
        valueRoleTable.set(OrganizationTypeMsp.ENEDIS, role_enedis);
        valueRoleTable.set(OrganizationTypeMsp.PRODUCER, role_producer);
        valueRoleTable.set(OrganizationTypeMsp.RTE, role_rte);
        parameters.values.set(ParametersType.ROLE_TABLE, valueRoleTable);

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



            const valueDataTarget = new Map<string, string[]>();

            valueDataTarget.set(ParametersType.ALL, [enedis_producer, producer_rte, enedis_producer_rte]);

            valueDataTarget.set(OrganizationTypeMsp.ENEDIS, [enedis_producer]);
            valueDataTarget.set(enedis_producer, [enedis_producer]);

            valueDataTarget.set(OrganizationTypeMsp.PRODUCER, [enedis_producer, producer_rte]);
            valueDataTarget.set(RoleType.Role_Producer, [enedis_producer, producer_rte]);

            valueDataTarget.set(OrganizationTypeMsp.RTE, [producer_rte]);
            valueDataTarget.set(producer_rte, [producer_rte]);

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

        console.debug('============= END : Get Parameter Static ===========');
        return parameters;
    }

}
