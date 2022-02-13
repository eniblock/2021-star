import { Context } from 'fabric-contract-api';
import { OrganizationTypeMsp } from '../enums/OrganizationMspType';
import { SystemOperator } from '../model/systemOperator';

export class SystemOperatorController {

    public static async createSystemOperator(
        ctx: Context,
        inputStr: string) {
        console.info('============= START : Create System Operator Market Participant ===========');

        const identity = await ctx.stub.getMspID();
        if (identity !== OrganizationTypeMsp.RTE && identity !== OrganizationTypeMsp.ENEDIS) {
            throw new Error(`Organisation, ${identity} does not have write access to create a system operator`);
        }

        let systemOperatorObj: SystemOperator;
        try {
            systemOperatorObj = JSON.parse(inputStr);
        } catch (error) {
            throw new Error(`ERROR createSystemOperator-> Input string NON-JSON value`);
        }

        const systemOperatorInput = SystemOperator.schema.validateSync(
            systemOperatorObj,
            {strict: true, abortEarly: false},
        );

        if (!identity.toLowerCase().includes(systemOperatorInput.systemOperatorMarketParticipantName.toLowerCase())) {
            throw new Error(`Organisation, ${identity} does not have write access for ${systemOperatorObj.systemOperatorMarketParticipantName}`);
        }

        systemOperatorObj.docType = 'systemOperator';

        await ctx.stub.putState(
            systemOperatorObj.systemOperatorMarketParticipantMrid,
            Buffer.from(JSON.stringify(systemOperatorObj)),
        );
        console.info(
            '============= END   : Create %s System Operator Market Participant ===========',
            systemOperatorObj.systemOperatorMarketParticipantMrid,
        );
    }

    public static async querySystemOperator(ctx: Context, sompId: string): Promise<string> {
        console.info('============= START : Query %s System Operator Market Participant ===========', sompId);
        const sompAsBytes = await ctx.stub.getState(sompId);
        if (!sompAsBytes || sompAsBytes.length === 0) {
            throw new Error(`${sompId} does not exist`);
        }
        console.info('============= END   : Query %s System Operator Market Participant ===========');
        console.info(sompId, sompAsBytes.toString());
        return sompAsBytes.toString();
    }

    public static async deleteSystemOperator(ctx: Context, id: string) {
        await ctx.stub.deleteState(id);
        console.info(
            '============= END : Delete %s SystemOperator ===========',
            id,
        );
    }

    public static async updateSystemOperator(
        ctx: Context,
        inputStr: string) {

        console.info(
            '============= START : Update System Operator Market Participant ===========');

        const identity = await ctx.stub.getMspID();
        if (identity !== OrganizationTypeMsp.RTE && identity !== OrganizationTypeMsp.ENEDIS) {
            throw new Error(`Organisation, ${identity} does not have write access to update a system operator`);
        }

        let systemOperatorObj: SystemOperator;
        try {
            systemOperatorObj = JSON.parse(inputStr);
        } catch (error) {
            throw new Error(`ERROR createSystemOperator-> Input string NON-JSON value`);
        }

        const systemOperatorInput = SystemOperator.schema.validateSync(
            systemOperatorObj,
            {strict: true, abortEarly: false},
        );

        if (!identity.toLowerCase().includes(systemOperatorObj.systemOperatorMarketParticipantName.toLowerCase())) {
            throw new Error(`Organisation, ${identity} does not have write access for ${systemOperatorInput.systemOperatorMarketParticipantName}`);
        }

        const sompAsBytes = await ctx.stub.getState(systemOperatorInput.systemOperatorMarketParticipantMrId);
        if (!sompAsBytes || sompAsBytes.length === 0) {
            throw new Error(`${systemOperatorInput.systemOperatorMarketParticipantMrId} does not exist`);
        }
        systemOperatorInput.docType = 'systemOperator';

        await ctx.stub.putState(
            systemOperatorInput.systemOperatorMarketParticipantMrId,
            Buffer.from(JSON.stringify(systemOperatorInput)),
        );
        console.info(
            '============= END : Update %s System Operator Market Participant ===========',
            systemOperatorInput.systemOperatorMarketParticipantMrId,
        );
    }

    public static async getAllSystemOperator(ctx: Context): Promise<string> {
        const allResults = [];
        const query = `{"selector": {"docType": "systemOperator"}}`;
        const iterator = await ctx.stub.getQueryResult(query);
        let result = await iterator.next();
        while (!result.done) {
            const strValue = Buffer.from(result.value.value.toString()).toString('utf8');
            let record;
            try {
                record = JSON.parse(strValue);
            } catch (err) {
                record = strValue;
            }
            allResults.push(record);
            result = await iterator.next();
        }
        return JSON.stringify(allResults);
    }

    public static async getSystemOperatorByQuery(ctx: Context, query: string): Promise<string> {
        const allResults = [];
        const iterator = await ctx.stub.getQueryResult(query);
        let result = await iterator.next();
        while (!result.done) {
            const strValue = Buffer.from(result.value.value.toString()).toString('utf8');
            let record;
            try {
                record = JSON.parse(strValue);
            } catch (err) {
                record = strValue;
            }
            allResults.push(record);
            result = await iterator.next();
        }
        return JSON.stringify(allResults);
    }
}
