import { Context } from 'fabric-contract-api';
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
        console.debug('============= START : Create System Operator Market Participant ===========');

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

        await SystemOperatorService.write(params, systemOperatorObj);

        console.debug('============= END   : Create %s System Operator Market Participant ===========',
            systemOperatorObj.systemOperatorMarketParticipantMrid,
        );
    }





    public static async getSystemOperatorObjById(params: STARParameters, sompId: string): Promise<SystemOperator> {
        console.debug('============= START : Query %s System Operator Market Participant ===========', sompId);

        const dataObj = await StarDataService.getObj(params, {id:sompId, docType: DocType.SYSTEM_OPERATOR});
        // console.info(sompId, sompAsBytes.toString());

        console.debug('============= END   : Query %s System Operator Market Participant ===========', sompId);
        return dataObj;
    }





    public static async updateSystemOperator(
        params: STARParameters,
        inputStr: string) {

        console.debug('============= START : Update System Operator Market Participant ===========');

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

        await this.getSystemOperatorObjById(params, systemOperatorObj.systemOperatorMarketParticipantMrid);

        await SystemOperatorService.write(params, systemOperatorObj);

        console.debug('============= END : Update %s System Operator Market Participant ===========',
            systemOperatorObj.systemOperatorMarketParticipantMrid,
        );
    }





    public static async getAllSystemOperator(params: STARParameters): Promise<string> {
        return await QueryStateService.getAllStates(params, DocType.SYSTEM_OPERATOR);
    }



    public static async getSystemOperatorByQuery(params: STARParameters, query: string): Promise<string> {
        return await QueryStateService.getQueryStringResult(params, {query: query});
    }
}
