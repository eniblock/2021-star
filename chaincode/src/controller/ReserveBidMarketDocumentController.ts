import { AttachmentFileStatus } from '../enums/AttachmentFileStatus';
import { DocType } from '../enums/DocType';
import { OrganizationTypeMsp } from '../enums/OrganizationMspType';
import { ParametersType } from '../enums/ParametersType';

import { ActivationDocument } from '../model/activationDocument/activationDocument';
import { IdArgument } from '../model/arguments/idArgument';
import { IndexedData as IndexedData } from '../model/dataIndex/dataIndexers';
import { DataReference } from '../model/dataReference';
import { ReserveBidMarketDocument } from '../model/reserveBidMarketDocument';
import { ReserveBidMarketDocumentCreation } from '../model/reserveBidMarketDocumentCreation';
import { ReserveBidMarketDocumentCreationList } from '../model/reserveBidMarketDocumentCreationList';
import { ReserveBidMarketDocumentFileIdList } from '../model/reserveBidMarketDocumentFileIdList';
import { ReserveBidMarketDocumentFileList } from '../model/reserveBidMarketDocumentFileList';
import { ReserveBidMarketDocumentSiteDate } from '../model/reserveBidMarketDocumentSiteDate';
import { Site } from '../model/site';
import { STARParameters } from '../model/starParameters';

import { AttachmentFileController } from './AttachmentFileController';

import { DataActionType } from '../enums/DataActionType';
import { ReserveBidStatus } from '../enums/ReserveBidStatus';
import { RoleType } from '../enums/RoleType';
import { AttachmentFileWithStatus } from '../model/attachmentFileWithStatus';
import { ReserveBidMarketDocumentAbstract } from '../model/dataIndex/reserveBidMarketDocumentAbstract';
import { SiteReserveBidIndexersController } from './dataIndex/SiteReserveBidIndexersController';
import { CommonService } from './service/CommonService';
import { HLFServices } from './service/HLFservice';
import { QueryStateService } from './service/QueryStateService';
import { ReserveBidMarketDocumentService } from './service/ReserveBidMarketDocumentService';
import { StarPrivateDataService } from './service/StarPrivateDataService';
import { SystemOperatorController } from './SystemOperatorController';
import { ReserveBidMarketType } from '../enums/ReserveBidMarketType';

export class ReserveBidMarketDocumentController {

    /*
        inputStr : reserveBidMarketDocument
    */
    public static async create(params: STARParameters, inputStr: string) {
        params.logger.info('============= START : Create ReserveBidMarketDocumentController ===========');

        const reserveBidCreationObj = ReserveBidMarketDocumentCreation.formatString(inputStr);
        if (reserveBidCreationObj && reserveBidCreationObj.reserveBid) {
            reserveBidCreationObj.reserveBid.reserveBidStatus = '';
            await this.createObj(params, reserveBidCreationObj);
        }

        params.logger.info('=============  END  : Create ReserveBidMarketDocumentController ===========');
    }

    /*
        inputStr : reserveBidMarketDocument
    */
    public static async createList(params: STARParameters, inputStr: string) {
        params.logger.info('============= START : Create by List ReserveBidMarketDocumentController ===========');

        const reserveBidCreationObj = ReserveBidMarketDocumentCreationList.formatString(inputStr);
        if (reserveBidCreationObj && reserveBidCreationObj.reserveBidList) {
            for (const reserveBidObj of reserveBidCreationObj.reserveBidList) {
                reserveBidObj.reserveBidStatus = '';
                await this.createObj(
                    params, {reserveBid: reserveBidObj, attachmentFileList: reserveBidCreationObj.attachmentFileList});
            }
        }

        params.logger.info('=============  END  : Create by List ReserveBidMarketDocumentController ===========');
    }

    public static async createByReference(params: STARParameters, dataReference: DataReference) {
        params.logger.debug('============= START : Create by Reference ReserveBidMarketDocumentController ===========');

        let existingReserveBidRef: Map<string, DataReference> = null;
        try {
            existingReserveBidRef = await StarPrivateDataService.getObjRefbyId(
                params, {docType: DocType.RESERVE_BID_MARKET_DOCUMENT, id: dataReference.data.reserveBidMrid, collection: dataReference.previousCollection});
        } catch (err) {
            //Do Nothing
        }

        if (existingReserveBidRef.values().next().value
            && existingReserveBidRef.values().next().value.data
            && existingReserveBidRef.values().next().value.data.reserveBidMrid
            && existingReserveBidRef.values().next().value.data.reserveBidMrid
                    === dataReference.data.reserveBidMrid) {

            await this.createObj(params, {reserveBid: dataReference.data}, dataReference.collection, dataReference.previousCollection);
        }


        params.logger.debug('=============  END  : Create by Reference ReserveBidMarketDocumentController ===========');
    }

    public static async createObj(
        params: STARParameters,
        reserveBidCreationObj: ReserveBidMarketDocumentCreation,
        target: string = '',
        previousTarget: string = '') {

        params.logger.debug('============= START : CreateObj ReserveBidMarketDocumentController ===========');

        let reserveBidObj = reserveBidCreationObj.reserveBid;

        ReserveBidMarketDocument.schema.validateSync(
            reserveBidObj,
            {strict: true, abortEarly: false},
        );

        if (reserveBidObj.marketType) {
            if (reserveBidObj.marketType !== ReserveBidMarketType.OA
                && reserveBidObj.marketType !== ReserveBidMarketType.CR
                && reserveBidObj.marketType !== ReserveBidMarketType.DAILY_MARKET) {

                throw new Error(`MarketType can ony be ${ReserveBidMarketType.OA}, ${ReserveBidMarketType.CR} or ${ReserveBidMarketType.DAILY_MARKET}`);
            }
        }

        const identity = params.values.get(ParametersType.IDENTITY);

        let isRecopy = false;
        let existingReserveBidRef: Map<string, DataReference> = null;
        try {
            existingReserveBidRef = await StarPrivateDataService.getObjRefbyId(
                params, {docType: DocType.RESERVE_BID_MARKET_DOCUMENT, id: reserveBidObj.reserveBidMrid, collection:previousTarget});
        } catch (err) {
            //Do Nothing
        }

        if (existingReserveBidRef
            && existingReserveBidRef.values().next().value
            && target
            && target.length > 0) {

            if (existingReserveBidRef.values().next().value.collection !== target) {
                const reserveBidRef: ReserveBidMarketDocument =
                    JSON.parse(JSON.stringify(existingReserveBidRef.values().next().value.data));
                const currentReserveBidObj: ReserveBidMarketDocument = JSON.parse(JSON.stringify(reserveBidObj));

                isRecopy = (JSON.stringify(reserveBidRef) === JSON.stringify(currentReserveBidObj));
            } else {
                isRecopy = true;
            }
        }

        if (previousTarget
            && previousTarget.length > 0
            && (!existingReserveBidRef.values().next().value
                || !existingReserveBidRef.values().next().value.data
                || !existingReserveBidRef.values().next().value.data.reserveBidMrid
                || existingReserveBidRef.values().next().value.data.reserveBidMrid
                    !== reserveBidObj.reserveBidMrid)) {

            return;

        }


        if (!isRecopy && identity !== OrganizationTypeMsp.PRODUCER) {
            throw new Error(`Organisation, ${identity} does not have rights to create a reserve bid market document ${reserveBidObj.reserveBidMrid}`);
        }

        // Get existing sites
        let existingSitesRef: Map<string, DataReference>;
        try {
            if (target && target.length > 0) {
                existingSitesRef = await StarPrivateDataService.getObjRefbyId(
                    params, {docType: DocType.SITE, id: reserveBidObj.meteringPointMrid, collection: target});
            } else {
                existingSitesRef = await StarPrivateDataService.getObjRefbyId(
                    params, {docType: DocType.SITE, id: reserveBidObj.meteringPointMrid});
            }
        } catch (error) {
            throw new Error(error.message.concat(' for reserve bid creation'));
        }

        if (!isRecopy) {
            const siteRef: DataReference = existingSitesRef.values().next().value;
            reserveBidObj = await this.fillObj(params, reserveBidObj, siteRef.data);

        }

        if (reserveBidObj.attachments && reserveBidObj.attachments.length > 0) {
            reserveBidObj.attachmentsWithStatus = [];

            for (const attachmentFileId of reserveBidObj.attachments) {
                const fileIdList: string[] = [];
                if (reserveBidCreationObj.attachmentFileList && reserveBidCreationObj.attachmentFileList.length > 0) {
                    for (const attachmentFile of reserveBidCreationObj.attachmentFileList) {
                        fileIdList.push(attachmentFile.fileId);
                    }
                }

                try {
                    const attachmentFile = await this.prepareNewFile(params, attachmentFileId, fileIdList);
                    if (attachmentFile) {
                        reserveBidObj.attachmentsWithStatus.push(attachmentFile);
                    }
                } catch (error) {
                    throw new Error(error.message.concat(' for reserve bid creation'));
                }
            }
        }

        if (existingSitesRef) {
            for (const [targetExistingSite ] of existingSitesRef) {
                await ReserveBidMarketDocumentService.write(params, reserveBidObj, targetExistingSite);
                await AttachmentFileController.createObjByList(
                    params, reserveBidCreationObj.attachmentFileList, targetExistingSite);
                if (reserveBidObj.reserveBidStatus === ReserveBidStatus.VALIDATED) {
                    await SiteReserveBidIndexersController.addModifyReserveBidReference(
                        params, reserveBidObj, targetExistingSite);
                }

            }
        }

        params.logger.debug('=============  END  : CreateObj ReserveBidMarketDocumentController ===========');
    }

    /*
    inputStr : ???
    */
    public static async addFile(params: STARParameters, inputStr: string): Promise<string> {
        params.logger.info('============= START : AddFile ReserveBidMarketDocumentController ===========');

        const reserveBidFileObj = ReserveBidMarketDocumentFileList.formatString(inputStr);
        let reserveBidObj: ReserveBidMarketDocument = null;

        // Do something only if there are file ids in the list
        if (reserveBidFileObj.attachmentFileList && reserveBidFileObj.attachmentFileList.length > 0) {

            // Get every reference to Bid Market Document in every Collection
            let existingReserveBidRef: Map<string, DataReference>;
            try {
                existingReserveBidRef = await StarPrivateDataService.getObjRefbyId(
                    params, {docType: DocType.RESERVE_BID_MARKET_DOCUMENT, id: reserveBidFileObj.reserveBidMrid});
            } catch (error) {
                throw new Error(error.message.concat(' to add file'));
            }
            // Take the first reference
            const reserveBidObjRef: DataReference = existingReserveBidRef.values().next().value;
            reserveBidObj = reserveBidObjRef.data;

            // Only do something if the found reference is the asekd one
            if (reserveBidObj && reserveBidObj.reserveBidMrid === reserveBidFileObj.reserveBidMrid) {
                const fileIdList: string[] = [];
                for (const attachmentFile of reserveBidFileObj.attachmentFileList) {
                    fileIdList.push(attachmentFile.fileId);
                }

                let idAdded = false;
                for (const attachmentFileId of fileIdList) {
                    // Only add if not already added
                    if (!reserveBidObj.attachments.includes(attachmentFileId)) {
                        try {
                            const attachmentFile = await this.prepareNewFile(params, attachmentFileId, fileIdList);
                            reserveBidObj.attachmentsWithStatus.push(attachmentFile);
                            reserveBidObj.attachments.push(attachmentFileId);
                            idAdded = true;
                        } catch (error) {
                            throw new Error(error.message.concat(' to add file'));
                        }
                    }
                }

                // Update document if only a file id was added before
                if (idAdded) {
                    for (const [key ] of existingReserveBidRef) {
                        await ReserveBidMarketDocumentService.write(params, reserveBidObj, key);
                        await AttachmentFileController.createObjByList(
                            params, reserveBidFileObj.attachmentFileList, key);
                    }
                }

            }
        }
        const cleanedReserveBidObj = this.cleanReserveBidMarketDocumentFileList(reserveBidObj);

        params.logger.info('=============  END  : AddFile ReserveBidMarketDocumentController ===========');
        return JSON.stringify(cleanedReserveBidObj);
    }

    /*
        inputStr : ???
    */
    public static async removeFile(params: STARParameters, inputStr: string) {
        params.logger.info('============= START : RemoveFile ReserveBidMarketDocumentController ===========');

        const reserveBidFileObj = ReserveBidMarketDocumentFileIdList.formatString(inputStr);
        let reserveBidObj: ReserveBidMarketDocument = null;

        // params.logger.log('reserveBidFileObj=', reserveBidFileObj)

        // Do something only if there are file ids in the list
        if (reserveBidFileObj.attachmentFileIdList && reserveBidFileObj.attachmentFileIdList.length > 0) {
            // Get every reference to Bid Market Document in every Collection
            let existingReserveBidRef: Map<string, DataReference>;
            try {
                existingReserveBidRef = await StarPrivateDataService.getObjRefbyId(
                    params, {docType: DocType.RESERVE_BID_MARKET_DOCUMENT, id: reserveBidFileObj.reserveBidMrid});
            } catch (error) {
                throw new Error(error.message.concat(' to remove file'));
            }
            // Take the first reference
            const reserveBidObjRef: DataReference = existingReserveBidRef.values().next().value;
            reserveBidObj = reserveBidObjRef.data;

            // params.logger.log('reserveBidObj=', reserveBidObj)

            // Only do somehting if the found reference is the asekd one
            if (reserveBidObj && reserveBidObj.reserveBidMrid === reserveBidFileObj.reserveBidMrid) {
                let idRemoved = false;
                // Check every file already present in document
                const newFileList: AttachmentFileWithStatus[] = [];
                if (reserveBidObj.attachmentsWithStatus) {
                    for (const attachmentFile of reserveBidObj.attachmentsWithStatus) {
                        if (attachmentFile.status !== AttachmentFileStatus.REMOVED
                            && reserveBidFileObj.attachmentFileIdList.includes(attachmentFile.fileId)) {

                            attachmentFile.status = AttachmentFileStatus.REMOVED;
                            idRemoved = true;
                        }
                        newFileList.push(attachmentFile);
                    }
                }

                // Update document if only a file id was removed before
                if (idRemoved) {
                    reserveBidObj.attachmentsWithStatus = newFileList;
                    for (const [key ] of existingReserveBidRef) {
                        await ReserveBidMarketDocumentService.write(params, reserveBidObj, key);
                    }
                }

            }
        }
        const cleanedReserveBidObj = this.cleanReserveBidMarketDocumentFileList(reserveBidObj);

        params.logger.info('=============  END  : RemoveFile ReserveBidMarketDocumentController ===========');
        return JSON.stringify(cleanedReserveBidObj);
    }

    /*
        inputStr : reserveBidMrid, newStatus
        output : ReserveBidMarketDocument
    */
    public static async updateStatus(
        params: STARParameters,
        reserveBidMrid: string,
        newStatus: string): Promise<string> {

        params.logger.info('============= START : updateStatus ReserveBidMarketDocumentController ===========');

        const userRole = HLFServices.getUserRole(params);

        if (userRole !== RoleType.Role_DSO && userRole !== RoleType.Role_TSO) {
            throw new Error(`Organisation, ${userRole} does not have rights to create a reserve bid market document ${reserveBidMrid}`);
        }

        if (newStatus !== ReserveBidStatus.VALIDATED
            && newStatus !== ReserveBidStatus.REFUSED) {

            throw new Error(`UpdateStatus : unkown bew Status ${newStatus}`);
        }

        const existingReserveBidRef = await StarPrivateDataService.getObjRefbyId(
            params, {id: reserveBidMrid, docType: DocType.RESERVE_BID_MARKET_DOCUMENT});

        let reserveBidObj: ReserveBidMarketDocument = null;

        if (existingReserveBidRef) {
            const dataReference = existingReserveBidRef.values().next().value;
            if (dataReference && dataReference.data) {
                reserveBidObj = dataReference.data;
            }

            ReserveBidMarketDocument.schema.validateSync(
                reserveBidObj,
                {strict: true, abortEarly: false},
            );

            if (!reserveBidObj
                || reserveBidObj.reserveBidMrid !== reserveBidMrid) {
                // nothing to do, reserveBidwas not found
                return;
            }
            if (reserveBidObj.reserveBidStatus === newStatus) {
                // nothing to do newStatus is already active Status
                return JSON.stringify(reserveBidObj);
            }


            const systemOperator = await SystemOperatorController.getSystemOperatorObjById(
                params, reserveBidObj.senderMarketParticipantMrid);
            const systemOperatorRole = HLFServices.getUserRoleById(
                params, systemOperator.systemOperatorMarketParticipantName);
            if (systemOperatorRole !== userRole) {
                throw new Error(`Error : ReserveBid Status Update - Organisation, ${userRole} does not have right to change ${systemOperatorRole} information`);
            }

            if (reserveBidObj
                && reserveBidObj.reserveBidStatus === ReserveBidStatus.REFUSED) {

                    throw new Error(`Error ReserveBid : Status ${ReserveBidStatus.REFUSED} can not be updated.`);
            }

            if (reserveBidObj
                && reserveBidObj.reserveBidMrid === reserveBidMrid) {

                reserveBidObj.reserveBidStatus = newStatus;

                for (const [key ] of existingReserveBidRef) {
                    await ReserveBidMarketDocumentService.write(params, reserveBidObj, key);

                    if (newStatus === ReserveBidStatus.VALIDATED) {
                        await SiteReserveBidIndexersController.addModifyReserveBidReference(params, reserveBidObj, key);
                    } else if (newStatus === ReserveBidStatus.REFUSED) {
                        await SiteReserveBidIndexersController.deleteReserveBidReference(params, reserveBidObj, key);
                    }
                }
            }
        }

        params.logger.info('=============  END  : updateStatus ReserveBidMarketDocumentController ===========');

        return JSON.stringify(reserveBidObj);
    }

    /*
        inputStr : ReserveBidMrid
        output : ReserveBidMarketDocument
    */
    public static async getById(params: STARParameters, reserveBidMrid: string, target: string = ''): Promise<string> {
        params.logger.info('============= START : getById ReserveBidMarketDocumentController ===========');

        const reserveBidObj: ReserveBidMarketDocument = await this.getObjById(params, reserveBidMrid, target);
        const cleanedReserveBidObj = this.cleanReserveBidMarketDocumentFileList(reserveBidObj);

        params.logger.info('=============  END  : getById ReserveBidMarketDocumentController ===========');

        return JSON.stringify(cleanedReserveBidObj);
    }

    public static async getObjById(
        params: STARParameters,
        reserveBidMrid: string,
        target: string = ''): Promise<ReserveBidMarketDocument> {

        params.logger.debug('============= START : get Obj ById ReserveBidMarketDocumentController ===========');

        const reserveBidObj = await this.getObjByIdArgument(
            params, {docType: DocType.RESERVE_BID_MARKET_DOCUMENT, id: reserveBidMrid, collection: target});

        params.logger.debug('=============  END  : get Obj ById ReserveBidMarketDocumentController ===========');
        return reserveBidObj;
    }

    /*
        inputStr : ReserveBidMrid[]
        output : ReserveBidMarketDocument[]
    */
    public static async getListById(params: STARParameters, inputStr: string): Promise<string> {
        params.logger.info('============= START : getListById ReserveBidMarketDocumentController ===========');

        let reserveBidIdList: string[] = [];
        try {
            reserveBidIdList = JSON.parse(inputStr);
        } catch (error) {
            throw new Error(`ERROR ${DocType.RESERVE_BID_MARKET_DOCUMENT} by list -> Input string NON-JSON value`);
        }

        const reserveBidObjList: ReserveBidMarketDocument[] = await this.getListObjById(params, reserveBidIdList);

        params.logger.info('=============  END  : getListById ReserveBidMarketDocumentController ===========');
        return JSON.stringify(reserveBidObjList);
    }

    /*
        string[] : ReserveBidMrid[]
        output : ReserveBidMarketDocument[]
    */
    public static async getListObjById(
        params: STARParameters,
        reserveBidIdList: string[]): Promise<ReserveBidMarketDocument[]> {

        params.logger.info('============= START : getListObjById ReserveBidMarketDocumentController ===========');

        const reserveBidObjList: ReserveBidMarketDocument[] = [];
        if (reserveBidIdList) {
            for (const reserveBidId of reserveBidIdList) {
                const reserveBidObj: ReserveBidMarketDocument = await this.getObjById(params, reserveBidId);
                const cleanedReserveBidObj = this.cleanReserveBidMarketDocumentFileList(reserveBidObj);

                reserveBidObjList.push(cleanedReserveBidObj);
            }
        }

        params.logger.info('=============  END  : getListById ReserveBidMarketDocumentController ===========');
        return reserveBidObjList;
    }

    public static async getByActivationDocument(
        params: STARParameters,
        activationDocumentObj: ActivationDocument,
        target: string = ''): Promise<ReserveBidMarketDocument> {
        params.logger.debug('============= START : getByActivationDocument ReserveBidMarketDocumentController ===========');

        let reserveBidValue: ReserveBidMarketDocument = null;
        let reserveBidValueRef: ReserveBidMarketDocument = null;

        if (activationDocumentObj && activationDocumentObj.registeredResourceMrid) {
            let indexedSiteReserveBidList: IndexedData;
            try {
                indexedSiteReserveBidList = await SiteReserveBidIndexersController.get(
                    params, activationDocumentObj.registeredResourceMrid, target);
            } catch (err) {
                // DO nothing except "Not accessible information"
            }

            if (indexedSiteReserveBidList
                && indexedSiteReserveBidList.indexedDataAbstractMap
                && indexedSiteReserveBidList.indexedDataAbstractMap.values) {

                const dateDoc = new Date(activationDocumentObj.startCreatedDateTime);

                const dateDocTime = dateDoc.getTime();
                if (dateDoc.getTime() !== dateDocTime) {
                    return;
                }

                let reserveBidAbstractRef: ReserveBidMarketDocumentAbstract = null;
                for (const reserveBidAbstract of indexedSiteReserveBidList.indexedDataAbstractMap.values()) {
                    params.logger.debug("reserveBidAbstract.reserveBidStatus: ", reserveBidAbstract.reserveBidStatus, " - ", reserveBidAbstract.reserveBidMrid);
                    if (reserveBidAbstract.reserveBidStatus === ReserveBidStatus.VALIDATED) {
                        const check = await this.checkDataConsistance(activationDocumentObj, reserveBidAbstract);

                        if (check) {
                            const dateBid = new Date(reserveBidAbstract.validityPeriodStartDateTime);
                            const dateCreationBid = new Date(reserveBidAbstract.createdDateTime);

                            const dateBidTime = dateBid.getTime();
                            if (dateBid.getTime() === dateBidTime
                                && dateBid.getTime() <= dateDoc.getTime()) {

                                if (reserveBidAbstract
                                    && reserveBidAbstract.reserveBidMrid
                                    && reserveBidAbstract.reserveBidMrid.length > 0) {

                                    reserveBidValueRef = await this.getObjById(params, reserveBidAbstract.reserveBidMrid, target);
                                }

                                if (reserveBidValueRef.reserveBidStatus === ReserveBidStatus.VALIDATED) {
                                    params.logger.debug("reserveBidValueRef.reserveBidStatus: ", reserveBidValueRef.reserveBidStatus, " - ", reserveBidValueRef.reserveBidMrid);

                                    if (!reserveBidAbstractRef
                                        || !reserveBidAbstractRef.reserveBidMrid
                                        || reserveBidAbstractRef.reserveBidMrid.length === 0) {

                                        reserveBidAbstractRef = reserveBidAbstract;
                                        reserveBidValue = reserveBidValueRef;

                                    } else {
                                        const dateBidRef = new Date(reserveBidAbstractRef.validityPeriodStartDateTime);
                                        const dateCreationBidRef = new Date(reserveBidAbstractRef.createdDateTime);

                                        const dateCreationBidTime = dateCreationBid.getTime();
                                        const dateCreationBidOk = (dateCreationBid.getTime() === dateCreationBidTime);
                                        const dateCreationBidRefTime = dateCreationBidRef.getTime();
                                        const dateCreationBidRefOk =
                                            (dateCreationBidRef.getTime() === dateCreationBidRefTime);

                                        const dateBidRefTime = dateBidRef.getTime();
                                        if (dateBidRef.getTime() !== dateBidRefTime
                                            || !dateCreationBidRefOk
                                            || dateBidRef.getTime() < dateBid.getTime()) {

                                            reserveBidAbstractRef = reserveBidAbstract;
                                            reserveBidValue = reserveBidValueRef;

                                        } else if (dateBidRef.getTime() === dateBid.getTime()) {

                                            if (dateCreationBidOk
                                                && dateCreationBidRefOk
                                                && dateCreationBid > dateCreationBidRef) {

                                                reserveBidAbstractRef = reserveBidAbstract;
                                                reserveBidValue = reserveBidValueRef;
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }

            }

        }

        params.logger.debug('=============  END  : getByActivationDocument ReserveBidMarketDocumentController ===========');
        return reserveBidValue;
    }

    /*
        inputStr : meteringPointMrid
        output : ReserveBidMarketDocument[]
    */
    public static async getByMeteringPointMrid(params: STARParameters, meteringPointMrid: string): Promise<string> {
        params.logger.info('============= START : getByMeteringPointMrid ReserveBidMarketDocumentController ===========');

        const allResults = await this.getObjByMeteringPointMrid(params, meteringPointMrid);

        params.logger.info('=============  END  : getByMeteringPointMridSite ReserveBidMarketDocumentController ===========');
        return JSON.stringify(allResults);
    }

    public static async getObjByMeteringPointMrid(
        params: STARParameters,
        meteringPointMrid: string,
        target: string = ''): Promise<ReserveBidMarketDocument[]> {

        params.logger.debug('============= START : get Obj ByMeteringPointMrid ReserveBidMarketDocumentController ===========');

        const args: string[] = [];
        args.push(`"meteringPointMrid":"${meteringPointMrid}"`);

        const query = await QueryStateService.buildQuery(
            {documentType: DocType.RESERVE_BID_MARKET_DOCUMENT,
            queryArgs: args,
            sort: [`"validityPeriodStartDateTime":"desc"`, `"createdDateTime":"desc"`]});

        params.logger.debug('query: ', query);

        const allResults = await ReserveBidMarketDocumentService.getQueryArrayResult(params, query, target);

        params.logger.debug('=============  END  : get Obj ByMeteringPointMridSite ReserveBidMarketDocumentController ===========');
        return allResults;
    }

    /*
        inputStr : meteringPointMrid
        output : ReserveBidMarketDocument[]
        //Only current and next reserve bid market document
    */
    public static async getValidByMeteringPointMrid(
        params: STARParameters,
        meteringPointMrid: string): Promise<string> {

        params.logger.info('============= START : getValidByMeteringPointMrid ReserveBidMarketDocumentController ===========');

        const date = new Date();
        date.setUTCHours(0, 0, 0, 0);
        const criteriaDate = date.toISOString();

        const criteriaObj: ReserveBidMarketDocumentSiteDate = {
            includeNext: true,
            meteringPointMrid,
            referenceDateTime: JSON.stringify(criteriaDate)};

        const allResults = await this.getBySiteAndDate(params, criteriaObj);

        params.logger.info('=============  END  : getValidByMeteringPointMrid ReserveBidMarketDocumentController ===========');

        return JSON.stringify(allResults);
    }

    /*
        inputStr : meteringPointMrid
        output : ReserveBidMarketDocument[]
        //Only current and next reserve bid market document
    */
    public static async getAtDateByMeteringPointMrid(params: STARParameters, inputStr: string): Promise<string> {
        params.logger.info('============= START : getAtDateByMeteringPointMrid ReserveBidMarketDocumentController ===========');

        const criteriaObj = ReserveBidMarketDocumentSiteDate.formatString(inputStr);
        const allResults = await this.getBySiteAndDate(params, criteriaObj);

        params.logger.info('=============  END  : getAtDateByMeteringPointMrid ReserveBidMarketDocumentController ===========');
        return JSON.stringify(allResults);
    }

    public static async getBySiteAndDate(
        params: STARParameters,
        criteriaObj: ReserveBidMarketDocumentSiteDate): Promise<ReserveBidMarketDocument[]> {

        params.logger.debug('============= START : getBySiteAndDate ReserveBidMarketDocumentController ===========');

        if (!criteriaObj.referenceDateTime || criteriaObj.referenceDateTime.length === 0) {
            const date: Date = new Date();
            date.setUTCHours(0, 0, 0, 0);
            criteriaObj.referenceDateTime =  JSON.parse(JSON.stringify(date));
        }

        const args: string[] = [];
        args.push(`"meteringPointMrid":"${criteriaObj.meteringPointMrid}"`);

        // on Site information, it can seen ReservBid whatever is the status
        // args.push(`"reserveBidStatus":"${ReserveBidStatus.VALIDATED}"`);

        args.push(`"validityPeriodStartDateTime":{"$lte": ${criteriaObj.referenceDateTime}}`);

        const argOrEnd: string[] = [];
        argOrEnd.push(`"validityPeriodEndDateTime":{"$gte": ${criteriaObj.referenceDateTime}}`);
        argOrEnd.push(`"validityPeriodEndDateTime":""`);
        argOrEnd.push(`"validityPeriodEndDateTime":{"$exists": false}`);
        args.push(await QueryStateService.buildORCriteria(argOrEnd));

        const query = await QueryStateService.buildQuery(
            {documentType: DocType.RESERVE_BID_MARKET_DOCUMENT,
            limit: 1,
            queryArgs: args,
            sort: [`"validityPeriodStartDateTime":"desc"`, `"createdDateTime":"asc"`]});
        params.logger.debug('query=', query);

        const allResultsWithoutAnyLimit = await ReserveBidMarketDocumentService.getQueryArrayResult(params, query);
        let allResults: ReserveBidMarketDocument[] = [];

        if (allResultsWithoutAnyLimit && allResultsWithoutAnyLimit.length > 0) {
            // Take the first with same validityPeriodStartDateTime
            const date0Ref = allResultsWithoutAnyLimit[0].validityPeriodStartDateTime;
            let stopLoop = false;
            let i = 0;
            while (i < allResultsWithoutAnyLimit.length && !stopLoop) {
                if (allResultsWithoutAnyLimit[i].validityPeriodStartDateTime === date0Ref) {
                    allResults.push(allResultsWithoutAnyLimit[i]);
                } else {
                    stopLoop = true;
                }
                i++;
            }

        }

        // Next Period data Management

        if (criteriaObj.includeNext) {
            const argsNext: string[] = [];
            argsNext.push(`"meteringPointMrid":"${criteriaObj.meteringPointMrid}"`);

            // on Site information, it can seen ReservBid whatever is the status
            // args.push(`"reserveBidStatus":"${ReserveBidStatus.VALIDATED}"`);

            argsNext.push(`"validityPeriodStartDateTime":{"$gte": ${criteriaObj.referenceDateTime}}`);

            const argOrEndNext: string[] = [];
            argOrEndNext.push(`"validityPeriodEndDateTime":{"$gte": ${criteriaObj.referenceDateTime}}`);
            argOrEndNext.push(`"validityPeriodEndDateTime":""`);
            argOrEndNext.push(`"validityPeriodEndDateTime":{"$exists": false}`);
            argsNext.push(await QueryStateService.buildORCriteria(argOrEndNext));

            const queryNext = await QueryStateService.buildQuery(
                {documentType: DocType.RESERVE_BID_MARKET_DOCUMENT,
                queryArgs: argsNext,
                sort: [`"validityPeriodStartDateTime":"asc"`, `"createdDateTime":"asc"`]});
            params.logger.debug('queryNext=', queryNext);

            const allResultsNext = await ReserveBidMarketDocumentService.getQueryArrayResult(params, queryNext);
            if (allResultsNext && allResultsNext.length > 0) {
                allResults = allResults.concat(allResultsNext);
                // in Site information, all ReservBid next information can be seen
                // var dateRef: string = "";
                // for (const result of allResultsNext) {
                //     if (result.validityPeriodStartDateTime !== dateRef) {
                //         //TODO : Manage creation date
                //         dateRef = result.validityPeriodStartDateTime;
                //         allResults.push(result);
                //     }
                // }
            }
        }

        params.logger.debug('=============  END  : getBySiteAndDate ReserveBidMarketDocumentController ===========');
        return allResults;
    }

    public static async dataExists(
        params: STARParameters,
        id: string,
        target: string = ''): Promise<boolean> {
        params.logger.debug('============= START : dataExists ReserveBidMarketDocumentController ===========');

        let existing: boolean = false;
        try {
            const result: Map<string, DataReference> = await StarPrivateDataService.getObjRefbyId(
                params, {docType: DocType.RESERVE_BID_MARKET_DOCUMENT, id, collection: target});

            if (target && target.length > 0) {
                const dataReference: DataReference = result.get(target);
                existing = dataReference
                    && dataReference.data
                    && dataReference.data.reserveBidMrid === id;
            } else {
                existing = result
                    && result.values().next().value
                    && result.values().next().value.data
                    && result.values().next().value.data.reserveBidMrid === id;
            }
        } catch (err) {
            existing = false;
        }

        params.logger.debug('=============  END  : dataExists ReserveBidMarketDocumentController ===========');
        return existing;
    }

    public static async getWithoutStatusOutOfTime(
        params: STARParameters): Promise<DataReference[]> {

        params.logger.debug('============= START : getWithoutStatusOutOfTime ReserveBidMarketDocumentController ===========');

        let withoutStatusList: DataReference[] = [];

        const reserveBidValidationTimeMax: number =
            params.values.get(ParametersType.RESERVE_BID_VALIDATION_TIME_MAX);
        let dateRef = CommonService.reduceDateDays(new Date(), reserveBidValidationTimeMax);
        dateRef = CommonService.setHoursEndDay(dateRef);
        const referenceDateTime =  JSON.stringify(dateRef);

        const args: string[] = [];

        args.push(`"createdDateTime":{"$lte": ${referenceDateTime}}`);

        const argOr: string[] = [];
        argOr.push(`"reserveBidStatus":""`);
        argOr.push(`"reserveBidStatus":{"$exists": false}`);
        args.push(await QueryStateService.buildORCriteria(argOr));

        const query = await QueryStateService.buildQuery(
            {documentType: DocType.RESERVE_BID_MARKET_DOCUMENT,
            queryArgs: args},
        );
        params.logger.debug('query :', query);

        const allResults = await ReserveBidMarketDocumentService.getQueryArrayDataReferenceResult(params, query);
        if (allResults && allResults.length > 0) {
            withoutStatusList = allResults;
        }

        params.logger.debug('=============  END  : getWithoutStatusOutOfTime ReserveBidMarketDocumentController ===========');
        return withoutStatusList;
    }

    public static async executeOrder(
        params: STARParameters,
        updateOrder: DataReference,
        dateRef: Date,
        reserveBidOutOfTimeStatus: string) {
        params.logger.debug('============= START : executeOrder ReserveBidMarketDocumentController ===========');

        if (updateOrder.data) {
            ReserveBidMarketDocument.schema.validateSync(
                updateOrder.data,
                {strict: true, abortEarly: false},
            );

            if (updateOrder.dataAction === DataActionType.UPDATE) {
                const reserveBidObj: ReserveBidMarketDocument = updateOrder.data;
                await ReserveBidMarketDocumentController.executeUpdateOrder(
                    params, reserveBidObj, dateRef, reserveBidOutOfTimeStatus);
            } else {
                await ReserveBidMarketDocumentController.createByReference(params, updateOrder);
            }

        }

        params.logger.debug('============= END   : executeOrder ReserveBidMarketDocumentController ===========');
    }

    private static async fillObj(
        params: STARParameters,
        reserveBidObj: ReserveBidMarketDocument,
        site: Site): Promise<ReserveBidMarketDocument> {
        params.logger.debug('============= START : fillObj ReserveBidMarketDocumentController ===========');

        const reserveBidObjBase: ReserveBidMarketDocument =
            params.values.get(ParametersType.RESERVE_BID_MARKET_DOCUMENT_BASE);

        reserveBidObj.messageType = reserveBidObjBase.messageType;
        reserveBidObj.processType = reserveBidObjBase.processType;
        reserveBidObj.businessType = reserveBidObjBase.businessType;
        reserveBidObj.quantityMeasureUnitName = reserveBidObjBase.quantityMeasureUnitName;
        reserveBidObj.priceMeasureUnitName = reserveBidObjBase.priceMeasureUnitName;
        reserveBidObj.currencyUnitName = reserveBidObjBase.currencyUnitName;
        reserveBidObj.senderMarketParticipantMrid = site.systemOperatorMarketParticipantMrid;
        reserveBidObj.receiverMarketParticipantMrid = site.producerMarketParticipantMrid;
        if (!reserveBidObj.validityPeriodStartDateTime
            || reserveBidObj.validityPeriodStartDateTime.length === 0) {
            const date: Date = new Date();
            date.setUTCHours(0, 0, 0, 0);
            reserveBidObj.validityPeriodStartDateTime = JSON.parse(JSON.stringify(date));
        }

        params.logger.debug('=============  END  : fillObj ReserveBidMarketDocumentController ===========');
        return reserveBidObj;
    }


    private static async prepareNewFile(
        params: STARParameters,
        fileId: string,
        fileIdListToCreate: string[]): Promise<AttachmentFileWithStatus> {

        params.logger.debug('============= START : PrepareNewFile ReserveBidMarketDocumentController ===========');

        let attachmentFile: AttachmentFileWithStatus = null;

        if (fileId && fileId.length > 0) {
            const fileToFind = !fileIdListToCreate.includes(fileId);
            if (fileToFind) {
                await AttachmentFileController.getById(params, fileId);
            }
            attachmentFile = {fileId, status: AttachmentFileStatus.ACTIVE};
        }

        params.logger.debug('=============  END  : PrepareNewFile ReserveBidMarketDocumentController ===========');

        return attachmentFile;
    }

    private static cleanReserveBidMarketDocumentFileList(
        reserveBidObj: ReserveBidMarketDocument): ReserveBidMarketDocument {

        const fileList: string[] = [];
        if (reserveBidObj && reserveBidObj.attachmentsWithStatus) {
            for (const attachmentFile of reserveBidObj.attachmentsWithStatus) {
                if (attachmentFile.status !== AttachmentFileStatus.REMOVED) {
                    fileList.push(attachmentFile.fileId);
                }
            }
            reserveBidObj.attachments = fileList;
            reserveBidObj.attachmentsWithStatus = [];
        }

        return reserveBidObj;
    }

    private static async getObjByIdArgument(
        params: STARParameters,
        arg: IdArgument): Promise<ReserveBidMarketDocument> {
        params.logger.debug('============= START : get ReserveBidMarketDocument By Id Argument (%s) ===========', JSON.stringify(arg));

        let reserveBidObj: ReserveBidMarketDocument;
        arg.docType = DocType.RESERVE_BID_MARKET_DOCUMENT;
        if (arg.collection && arg.collection.length > 0) {
            reserveBidObj = await StarPrivateDataService.getObj(params, arg);
        } else {
            const result: Map<string, DataReference> = await StarPrivateDataService.getObjRefbyId(params, arg);
            const dataReference = result.values().next().value;
            if (dataReference && dataReference.data) {
                reserveBidObj = dataReference.data;
            }
        }

        params.logger.debug('=============  END  : get ReserveBidMarketDocument By Id Argument (%s) ===========', JSON.stringify(arg));

        return reserveBidObj;
    }

    private static async checkDataConsistance(
        activationDocument: ActivationDocument,
        reserveBidObj: ReserveBidMarketDocumentAbstract): Promise<boolean> {

        let checkValue = false;

        if (!activationDocument
            || !activationDocument.activationDocumentMrid
            || activationDocument.activationDocumentMrid.length === 0) {

            return false;
        }

        if (!reserveBidObj
            || !reserveBidObj.reserveBidMrid
            || reserveBidObj.reserveBidMrid.length === 0) {

            return false;
        }

        return true;
    }

    private static async executeUpdateOrder(
        params: STARParameters,
        reserveBidObj: ReserveBidMarketDocument,
        dateRef: Date,
        reserveBidOutOfTimeStatus: string) {
        params.logger.debug('============= START : executeUpdateOrder ReserveBidMarketDocumentController ===========');

        if (reserveBidObj.reserveBidMrid
            && reserveBidObj.reserveBidMrid.length > 0
            && reserveBidObj.createdDateTime
            && reserveBidObj.createdDateTime.length > 0) {

            const reserveBidDateCreation = new Date(reserveBidObj.createdDateTime);

            if (reserveBidDateCreation <= dateRef
                && (!reserveBidObj.reserveBidStatus
                    || reserveBidObj.reserveBidStatus.length === 0)) {

                await this.updateStatus(params, reserveBidObj.reserveBidMrid, reserveBidOutOfTimeStatus);
            }
        }

        params.logger.debug('============= END   : executeUpdateOrder ReserveBidMarketDocumentController ===========');
    }

}
