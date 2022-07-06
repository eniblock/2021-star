import { Context } from 'fabric-contract-api';
import { DocType } from '../enums/DocType';

import { OrganizationTypeMsp } from '../enums/OrganizationMspType';
import { ParametersType } from '../enums/ParametersType';

import { STARParameters } from '../model/starParameters';
import { SystemOperator } from '../model/systemOperator';

import { QueryStateService } from './service/QueryStateService';
import { SystemOperatorService } from './service/SystemOperatorService';

export class SystemOperatorController {

    public static async createSystemOperator(
        ctx: Context,
        params: STARParameters,
        inputStr: string) {
        console.info('============= START : Create System Operator Market Participant ===========');

        const identity = params.values.get(ParametersType.IDENTITY);
        if (identity !== OrganizationTypeMsp.RTE && identity !== OrganizationTypeMsp.ENEDIS) {
            throw new Error(`Organisation, ${identity} does not have write access to create a system operator`);
        }

        let systemOperatorObj: SystemOperator;
        try {
            systemOperatorObj = JSON.parse(inputStr);
        } catch (error) {
            throw new Error(`ERROR createSystemOperator-> Input string NON-JSON value`);
        }

        SystemOperator.schema.validateSync(
            systemOperatorObj,
            {strict: true, abortEarly: false},
        );

        if (!identity.toLowerCase().includes(systemOperatorObj.systemOperatorMarketParticipantName.toLowerCase())) {
            throw new Error(`Organisation, ${identity} does not have write access for ${systemOperatorObj.systemOperatorMarketParticipantName}`);
        }

        await SystemOperatorService.write(ctx, systemOperatorObj);

        console.info('============= END   : Create %s System Operator Market Participant ===========',
            systemOperatorObj.systemOperatorMarketParticipantMrid,
        );
    }





    public static async querySystemOperator(ctx: Context, sompId: string): Promise<string> {
        console.info('============= START : Query %s System Operator Market Participant ===========', sompId);

        const sompAsBytes = await SystemOperatorService.getRaw(ctx, sompId);
        // console.info(sompId, sompAsBytes.toString());

        console.info('============= END   : Query %s System Operator Market Participant ===========', sompId);
        return sompAsBytes.toString();
    }





    public static async updateSystemOperator(
        ctx: Context,
        params: STARParameters,
        inputStr: string) {

        console.info('============= START : Update System Operator Market Participant ===========');

            const identity = params.values.get(ParametersType.IDENTITY);
        if (identity !== OrganizationTypeMsp.RTE && identity !== OrganizationTypeMsp.ENEDIS) {
            throw new Error(`Organisation, ${identity} does not have write access to update a system operator`);
        }

        let systemOperatorObj: SystemOperator;
        try {
            systemOperatorObj = JSON.parse(inputStr);
        } catch (error) {
            throw new Error(`ERROR createSystemOperator-> Input string NON-JSON value`);
        }

        SystemOperator.schema.validateSync(
            systemOperatorObj,
            {strict: true, abortEarly: false},
        );

        if (!identity.toLowerCase().includes(systemOperatorObj.systemOperatorMarketParticipantName.toLowerCase())) {
            throw new Error(`Organisation, ${identity} does not have write access for ${systemOperatorObj.systemOperatorMarketParticipantName}`);
        }

        const sompAsBytes = await this.querySystemOperator(ctx, systemOperatorObj.systemOperatorMarketParticipantMrid);
        if (!sompAsBytes || sompAsBytes.length === 0) {
            throw new Error(`${systemOperatorObj.systemOperatorMarketParticipantMrid} does not exist`);
        }

        await SystemOperatorService.write(ctx, systemOperatorObj);

        console.info('============= END : Update %s System Operator Market Participant ===========',
            systemOperatorObj.systemOperatorMarketParticipantMrid,
        );
    }





    public static async getAllSystemOperator(ctx: Context): Promise<string> {
        return await QueryStateService.getAllStates(ctx, DocType.SYSTEM_OPERATOR);
    }


    public static async getSystemOperatorByQuery(ctx: Context, query: string): Promise<string> {
        return await QueryStateService.getQueryStringResult(ctx, query);
    }
}
