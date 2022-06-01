import { Context } from 'fabric-contract-api';
import { OrganizationTypeMsp } from '../enums/OrganizationMspType';
// import { Parameters } from '../model/parameters';
import { ParametersType } from '../enums/ParametersType';
import { HLFServices } from './service/HLFservice';

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

    public static async getParameter(ctx: Context, paramName: string): Promise<string> {
        console.debug('============= START : Get Parameter ===========');

    //     const paramValues: Map<string,string> = await this.getAllParameters(ctx);

    //     console.debug(paramValues);

        let value: string = "";
    //     if(paramValues[paramName]!==null && typeof(paramValues[paramName]) !== "undefined") {
    //         value=paramValues[paramName];
    //     }

        value = await this.getParameterStatic(ctx, paramName);

        console.debug('============= END : Get Parameter ===========');
        return value;
    }

    private static async getParameterStatic(ctx: Context, paramName: string): Promise<string> {
        console.debug('============= START : Get Parameter Static ===========');

        const identity: string = await HLFServices.getMspID(ctx);

        let value: string = "";
        if (identity === OrganizationTypeMsp.ENEDIS) {
            if (paramName === ParametersType.SITE) {
                value = "enedis-producer"
            }
        } else if (identity === OrganizationTypeMsp.PRODUCER) {
        } else if (identity === OrganizationTypeMsp.RTE) {
            if (paramName === ParametersType.SITE) {
                value = "producer-rte"
            }
        }

        console.debug('============= END : Get Parameter Static ===========');
        return value;
    }

}