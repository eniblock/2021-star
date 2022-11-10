import { DocType } from '../enums/DocType';

import { OrganizationTypeMsp } from '../enums/OrganizationMspType';
import { ParametersType } from '../enums/ParametersType';

import { STARParameters } from '../model/starParameters';
import { SystemOperator } from '../model/systemOperator';

import { QueryStateService } from './service/QueryStateService';
import { StarDataService } from './service/StarDataService';
import { SystemOperatorService } from './service/SystemOperatorService';

export class SystemOperatorController {

    public static async createSystemOperator(
        params: STARParameters,
        inputStr: string) {
        params.logger.info('============= START : Create System Operator Market Participant ===========');

        const identity = params.values.get(ParametersType.IDENTITY);
        if (identity !== OrganizationTypeMsp.RTE && identity !== OrganizationTypeMsp.ENEDIS) {
            throw new Error(`Organisation, ${identity} does not have rights to create a system operator`);
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
            throw new Error(`Organisation, ${identity} does not have rights for ${systemOperatorObj.systemOperatorMarketParticipantName}`);
        }

        await SystemOperatorService.write(params, systemOperatorObj);

        params.logger.info('============= END   : Create %s System Operator Market Participant ===========',
            systemOperatorObj.systemOperatorMarketParticipantMrid,
        );
    }

    public static async getSystemOperatorObjById(params: STARParameters, sompId: string): Promise<SystemOperator> {
        params.logger.info('============= START : get System Operator Market Participant by id %s ===========', sompId);

        const dataObj = await StarDataService.getObj(params, {id: sompId, docType: DocType.SYSTEM_OPERATOR});
        // params.logger.info(sompId, sompAsBytes.toString());

        params.logger.info('============= END   : get System Operator Market Participant by id %s ===========', sompId);
        return dataObj;
    }

    public static async updateSystemOperator(
        params: STARParameters,
        inputStr: string) {

        params.logger.info('============= START : Update System Operator Market Participant ===========');

        const identity = params.values.get(ParametersType.IDENTITY);
        if (identity !== OrganizationTypeMsp.RTE && identity !== OrganizationTypeMsp.ENEDIS) {
            throw new Error(`Organisation, ${identity} does not have rights to update a system operator`);
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
            throw new Error(`Organisation, ${identity} does not have rights for ${systemOperatorObj.systemOperatorMarketParticipantName}`);
        }

        await this.getSystemOperatorObjById(params, systemOperatorObj.systemOperatorMarketParticipantMrid);

        await SystemOperatorService.write(params, systemOperatorObj);

        params.logger.info('============= END : Update %s System Operator Market Participant ===========',
            systemOperatorObj.systemOperatorMarketParticipantMrid,
        );
    }

    public static async getAllSystemOperator(params: STARParameters): Promise<string> {
        params.logger.info('============= START : get all System Operator Market Participant ===========');

        const arrayResult = await QueryStateService.getAllStates(params, DocType.SYSTEM_OPERATOR);

        params.logger.info('=============  END  : get all System Operator Market Participant ===========');

        return JSON.stringify(arrayResult);
    }

    public static async getSystemOperatorByQuery(params: STARParameters, query: string): Promise<string> {
        params.logger.info('============= START : get System Operator Market Participant by query %s ===========');
        params.logger.info('=============  END  : get System Operator Market Participant by query %s ===========');

        return await QueryStateService.getQueryStringResult(params, {query});
    }
}
