import { Context } from 'fabric-contract-api';
import { OrganizationTypeMsp } from '../enums/OrganizationMspType';
import { Parameters } from '../model/parameters';
import { ParametersType } from '../enums/ParametersType';
import { RoleType } from '../enums/RoleType';
import { HLFServices } from './service/HLFservice';

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
    // public static async changeAllParameters(
    //     ctx: Context,
    //     inputStr: string) {
    //     console.debug('============= START : Change All Parameters ===========');

    //     const identity = await HLFServices.getMspID(ctx);

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
    //     console.debug(
    //         '============= END   : START : Change All Parameters for %s ===========',
    //         identity,
    //     );
    // }

    // public static async getAllParameters(ctx: Context): Promise<Map<string,string>> {
    //     console.debug('============= START : Get All Parameters ===========');

    //     const identity = await HLFServices.getMspID(ctx);

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

    public static async getParameterValues(ctx: Context): Promise<Parameters> {
        console.debug('============= START : Get Parameter ===========');

    //     const paramValues: Map<string,string> = await this.getAllParameters(ctx);

    //     console.debug(paramValues);

        var parameters: Parameters;
    //     if(paramValues[paramName]!==null && typeof(paramValues[paramName]) !== "undefined") {
    //         value=paramValues[paramName];
    //     }

        parameters = await this.getParameterStatic(ctx);

        console.debug('============= END : Get Parameter ===========');
        return parameters;
    }

    private static async getParameterStatic(ctx: Context): Promise<Parameters> {
        console.debug('============= START : Get Parameter Static ===========');

        const parameters: Parameters = new Parameters();
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

            const valueSite: string[] = [];
            valueSite.push(enedis_producer);
            parameters.values.set(ParametersType.SITE, valueSite);

            const valueActivationDocument = new Map<string, string[]>();
            valueActivationDocument.set(OrganizationTypeMsp.RTE, [enedis_rte]);
            valueActivationDocument.set(RoleType.Role_TSO, [enedis_rte]);
            valueActivationDocument.set(OrganizationTypeMsp.PRODUCER, [enedis_producer]);
            valueActivationDocument.set(RoleType.Role_Producer, [enedis_producer]);
            valueActivationDocument.set(ParametersType.DEFAULT, [enedis_producer]);
            valueActivationDocument.set(ParametersType.ALL, [enedis_producer, enedis_rte]);
            parameters.values.set(ParametersType.ACTIVATION_DOCUMENT, valueActivationDocument);

            /*
            *
            */
        } else if (identity === OrganizationTypeMsp.PRODUCER) {
            /*
            * PRODUCER
            */

            parameters.values.set(ParametersType.ROLE, role_producer);

            const valueSite: string[] = [];
            valueSite.push(enedis_producer);
            valueSite.push(producer_rte);
            parameters.values.set(ParametersType.SITE, valueSite);

            const valueActivationDocument = new Map<string, string[]>();
            valueActivationDocument.set(OrganizationTypeMsp.ENEDIS, [enedis_producer]);
            valueActivationDocument.set(OrganizationTypeMsp.PRODUCER, [enedis_producer, producer_rte]);
            valueActivationDocument.set(RoleType.Role_Producer, [enedis_producer, producer_rte]);
            valueActivationDocument.set(OrganizationTypeMsp.RTE, [producer_rte]);
            valueActivationDocument.set(ParametersType.ALL, [enedis_producer, producer_rte]);
            parameters.values.set(ParametersType.ACTIVATION_DOCUMENT, valueActivationDocument);

            /*
            *
            */
        } else if (identity === OrganizationTypeMsp.RTE) {
            /*
            * RTE
            */

            parameters.values.set(ParametersType.ROLE, role_rte);

            const valueSite: string[] = [];
            valueSite.push(producer_rte);
            parameters.values.set(ParametersType.SITE, valueSite);

            const valueActivationDocument = new Map<string, string[]>();
            valueActivationDocument.set(OrganizationTypeMsp.ENEDIS, [enedis_rte]);
            valueActivationDocument.set(RoleType.Role_DSO, [enedis_rte]);
            valueActivationDocument.set(OrganizationTypeMsp.PRODUCER, [producer_rte]);
            valueActivationDocument.set(RoleType.Role_Producer, [producer_rte]);
            valueActivationDocument.set(ParametersType.DEFAULT, [producer_rte]);
            valueActivationDocument.set(ParametersType.ALL, [enedis_rte, producer_rte]);
            parameters.values.set(ParametersType.ACTIVATION_DOCUMENT, valueActivationDocument);

            /*
            *
            */
        }

        console.debug('============= END : Get Parameter Static ===========');
        return parameters;
    }

}
