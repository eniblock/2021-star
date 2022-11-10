import { OrganizationTypeMsp } from '../enums/OrganizationMspType';
import { ParametersType } from '../enums/ParametersType';

import { DataReference } from '../model/dataReference';
import { Producer } from '../model/producer';
import { Site } from '../model/site';
import { STARParameters } from '../model/starParameters';

import { DocType } from '../enums/DocType';
import { IdArgument } from '../model/arguments/idArgument';
import { SiteService } from './service/SiteService';
import { StarDataService } from './service/StarDataService';
import { StarPrivateDataService } from './service/StarPrivateDataService';
import { SystemOperator } from '../model/systemOperator';

export class SiteController {
    public static async createSite(
        params: STARParameters,
        inputStr: string): Promise<void> {
        params.logger.info('============= START : createSite SiteController ===========');

        const siteObj: Site = Site.formatString(inputStr);
        await this.createSiteObj(params, siteObj);

        params.logger.info('=============  END  : createSite SiteController ===========');
    }

    public static async createSiteByReference(
        params: STARParameters,
        dataReference: DataReference): Promise<void> {
        params.logger.debug('============= START : createSite By Reference SiteController ===========');

        await this.createSiteObj(params, dataReference.data, dataReference.collection);

        params.logger.debug('=============  END  : createSite By Reference SiteController ===========');
    }

    public static async createSiteObj(
        params: STARParameters,
        siteObj: Site,
        target: string = ''): Promise<void> {
        params.logger.debug('============= START : createSiteObj SiteController ===========');

        Site.schema.validateSync(
            siteObj,
            {strict: true, abortEarly: false},
        );

        const identity = params.values.get(ParametersType.IDENTITY);
        if (siteObj.marketEvaluationPointMrid && siteObj.schedulingEntityRegisteredResourceMrid) {
            if (identity !== OrganizationTypeMsp.RTE) {
                throw new Error(`Organisation, ${identity} does not have rights for HTB(HV) sites`);
            }
        } else if (!siteObj.marketEvaluationPointMrid && !siteObj.schedulingEntityRegisteredResourceMrid) {
            if (identity !== OrganizationTypeMsp.ENEDIS) {
                throw new Error(`Organisation, ${identity} does not have rights for HTA(MV) sites`);
            }
        } else {
            throw new Error(`marketEvaluationPointMrid and schedulingEntityRegisteredResourceMrid must be both present for HTB site or absent for HTA site.`);
        }

        let systemOperator: SystemOperator;
        try {
            systemOperator = await StarDataService.getObj(
                params, {id: siteObj.systemOperatorMarketParticipantMrid, docType: DocType.SYSTEM_OPERATOR});
        } catch (error) {
            throw new Error(error.message.concat(' for site creation'));
        }

        let producerObj: Producer;
        try {
            producerObj = await StarDataService.getObj(
                params, {id: siteObj.producerMarketParticipantMrid, docType: DocType.PRODUCER});
        } catch (error) {
            throw new Error(error.message.concat(' for site creation'));
        }

        if (systemOperator && systemOperator.systemOperatorMarketParticipantName) {
            siteObj.systemOperatorMarketParticipantName = systemOperator.systemOperatorMarketParticipantName;
        }
        if (producerObj && producerObj.producerMarketParticipantName) {
            siteObj.producerMarketParticipantName = producerObj.producerMarketParticipantName;
        }

        await SiteService.write(params, siteObj, target);

        params.logger.debug('============= END   : createSiteObj %s SiteController ===========',
            siteObj.meteringPointMrid,
        );
    }

    public static async updateSite(
        params: STARParameters,
        inputStr: string): Promise<void> {
        params.logger.info('============= START : updateSite SiteController ===========');

        let siteObj: Site;
        try {
            siteObj = JSON.parse(inputStr);
        } catch (error) {
            throw new Error(`ERROR updateSite-> Input string NON-JSON value`);
        }
        Site.schema.validateSync(
            siteObj,
            {strict: true, abortEarly: false},
        );
        const identity = params.values.get(ParametersType.IDENTITY);
        if (siteObj.marketEvaluationPointMrid && siteObj.schedulingEntityRegisteredResourceMrid) {
            if (identity !== OrganizationTypeMsp.RTE) {
                throw new Error(`Organisation, ${identity} does not have rights for HTB(HV) sites`);
            }
        } else if (!siteObj.marketEvaluationPointMrid && !siteObj.schedulingEntityRegisteredResourceMrid) {
            if (identity !== OrganizationTypeMsp.ENEDIS) {
                throw new Error(`Organisation, ${identity} does not have rights for HTA(MV) sites`);
            }
        } else {
            throw new Error(`marketEvaluationPointMrid and schedulingEntityRegisteredResourceMrid must be both present for HTB site or absent for HTA site.`);
        }

        let existingSitesRef: Map<string, DataReference>;
        try {
            existingSitesRef = await StarPrivateDataService.getObjRefbyId(
                params, {docType: DocType.SITE, id: siteObj.meteringPointMrid});
        } catch (error) {
            throw new Error(error.message.concat(' for site update'));
        }

        let systemOperator: SystemOperator;
        try {
            systemOperator = await StarDataService.getObj(
                params, {id: siteObj.systemOperatorMarketParticipantMrid, docType: DocType.SYSTEM_OPERATOR});
        } catch (error) {
            throw new Error(error.message.concat(' for site update'));
        }

        let producerObj: Producer;
        try {
            producerObj = await StarDataService.getObj(
                params, {id: siteObj.producerMarketParticipantMrid, docType: DocType.PRODUCER});
        } catch (error) {
            throw new Error(error.message.concat(' for site update'));
        }

        if (systemOperator && systemOperator.systemOperatorMarketParticipantName) {
            siteObj.systemOperatorMarketParticipantName = systemOperator.systemOperatorMarketParticipantName;
        }
        if (producerObj && producerObj.producerMarketParticipantName) {
            siteObj.producerMarketParticipantName = producerObj.producerMarketParticipantName;
        }



        for (const [key ] of existingSitesRef) {
            await SiteService.write(params, siteObj, key);
        }

        params.logger.info('=============  END  : Update %s SiteController ===========',
            siteObj.meteringPointMrid,
        );
    }

    public static async querySite(
        params: STARParameters,
        siteId: string): Promise<string> {
        params.logger.info('============= START : Query %s Site ===========', siteId);

        const result: Map<string, DataReference> = await StarPrivateDataService.getObjRefbyId(
            params, {docType: DocType.SITE, id: siteId});
        const dataReference = result.values().next().value;

        // params.logger.debug(siteId, JSON.stringify(dataReference.data));
        params.logger.info('============= END   : Query %s Site ===========', siteId);

        return JSON.stringify(dataReference.data);
    }

    public static async siteExists(
        params: STARParameters,
        siteId: string): Promise<boolean> {
        params.logger.info('============= START : siteExists %s Site ===========', siteId);

        let booleanResult = false;
        try {
            const result: Map<string, DataReference> = await StarPrivateDataService.getObjRefbyId(
                params, {docType: DocType.SITE, id: siteId});
            if (result
                && result.values().next().value
                && result.values().next().value.data
                && result.values().next().value.data.meteringPointMrid === siteId
                && result.values().next().value.collection.length !== 0) {

                booleanResult = true;
            }
        } catch (err) {
            booleanResult = false;
        }

        params.logger.info('=============  END  : siteExists %s Site ===========', siteId);

        return booleanResult;
    }

    public static async getSiteById(
        params: STARParameters,
        arg: IdArgument): Promise<Site> {
        params.logger.info('============= START : getSite By Id (%s) ===========', JSON.stringify(arg));

        let siteObj: Site;
        arg.docType = DocType.SITE;
        if (arg.collection && arg.collection.length > 0) {
            siteObj = await StarPrivateDataService.getObj(params, arg);
        } else {
            const result: Map<string, DataReference> = await StarPrivateDataService.getObjRefbyId(params, arg);
            const dataReference = result.values().next().value;
            if (dataReference && dataReference.data) {
                siteObj = dataReference.data;
            }
        }

        params.logger.info('=============  END  : getSite By Id (%s) ===========', JSON.stringify(arg));

        return siteObj;
    }

    public static async getAllObjRef( params: STARParameters): Promise<DataReference[]> {
        params.logger.info('============= START : getAllProducer ProducerController ===========');

        const arrayResult = await SiteService.getAll(params);

        params.logger.info('=============  END  : getAllProducer ProducerController ===========');

        return arrayResult;
    }

    public static async getSitesBySystemOperator(
        params: STARParameters,
        systemOperatorMarketParticipantMrid: string): Promise<string> {
        params.logger.info('============= START : getSite By SystemOperator ===========');

        const query = `{"selector": {"docType": "site", "systemOperatorMarketParticipantMrid": "${systemOperatorMarketParticipantMrid}"}}`;
        const allResults = await SiteService.getQueryStringResult(params, query);

        params.logger.info('=============  END  : getSite By SystemOperator ===========');
        return allResults;
    }

    public static async getSitesByProducer(
        params: STARParameters,
        producerMarketParticipantMrid: string): Promise<string> {
        params.logger.info('============= START : getSite By Producer ===========');

        const query = `{"selector": {"docType": "site", "producerMarketParticipantMrid": "${producerMarketParticipantMrid}"}}`;
        const allResults = await SiteService.getQueryStringResult(params, query);

        params.logger.info('============= START : getSite By Producer ===========');

        return allResults;
    }

    public static async getSitesByQuery(
        params: STARParameters,
        query: string): Promise<any> {
        params.logger.info('============= START : getSite By Query ===========');

        const results = await SiteService.getQueryArrayResult(params, query);

        params.logger.info('=============  END  : getSite By Query ===========');
        return results;
    }

}
