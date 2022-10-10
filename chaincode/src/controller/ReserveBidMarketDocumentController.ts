import { AttachmentFileStatus } from "../enums/AttachmentFileStatus";
import { DocType } from "../enums/DocType";
import { OrganizationTypeMsp } from "../enums/OrganizationMspType";
import { ParametersType } from "../enums/ParametersType";

import { ActivationDocument } from "../model/activationDocument/activationDocument";
import { IdArgument } from "../model/arguments/idArgument";
import { AttachmentFile, AttachmentFileWithStatus } from "../model/attachmentFile";
import { DataReference } from "../model/dataReference";
import { ReserveBidMarketDocument } from "../model/reserveBidMarketDocument";
import { ReserveBidMarketDocumentCreation } from "../model/reserveBidMarketDocumentCreation";
import { ReserveBidMarketDocumentCreationList } from "../model/reserveBidMarketDocumentCreationList";
import { ReserveBidMarketDocumentFileIdList } from "../model/reserveBidMarketDocumentFileIdList";
import { ReserveBidMarketDocumentFileList } from "../model/reserveBidMarketDocumentFileList";
import { ReserveBidMarketDocumentSiteDate } from "../model/reserveBidMarketDocumentSiteDate";
import { Site } from "../model/site";
import { ReserveBidMarketDocumentAbstract, IndexedData as IndexedData, ActivationDocumentAbstract } from "../model/dataIndexers";
import { STARParameters } from "../model/starParameters";

import { AttachmentFileController } from "./AttachmentFileController";
import { SiteActivationIndexersController, SiteReserveBidIndexersController } from "./dataIndexersController";

import { QueryStateService } from "./service/QueryStateService";
import { ReserveBidMarketDocumentService } from "./service/ReserveBidMarketDocumentService";
import { StarDataService } from "./service/StarDataService";
import { StarPrivateDataService } from "./service/StarPrivateDataService";
import { BalancingDocumentController } from "./BalancingDocumentController";


export class ReserveBidMarketDocumentController {

    /*
        inputStr : reserveBidMarketDocument
    */
        public static async create(params: STARParameters, inputStr: string) {
            params.logger.info('============= START : Create ReserveBidMarketDocumentController ===========');

            const reserveBidCreationObj = ReserveBidMarketDocumentCreation.formatString(inputStr);
            if (reserveBidCreationObj && reserveBidCreationObj.reserveBid) {
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
            for (var reserveBidObj of reserveBidCreationObj.reserveBidList) {
                await this.createObj(params, {reserveBid:reserveBidObj, attachmentFileList:reserveBidCreationObj.attachmentFileList});
            }
        }

        params.logger.info('=============  END  : Create by List ReserveBidMarketDocumentController ===========');
    }

    public static async createByReference   (params: STARParameters, dataReference: DataReference) {
        params.logger.debug('============= START : Create by Reference ReserveBidMarketDocumentController ===========');

        await this.createObj(params, {reserveBid:dataReference.data}, dataReference.collection);

        params.logger.debug('=============  END  : Create by Reference ReserveBidMarketDocumentController ===========');
    }




    private static async fillObj(
        params: STARParameters,
        reserveBidObj: ReserveBidMarketDocument,
        site: Site): Promise<ReserveBidMarketDocument> {
        params.logger.debug('============= START : fillObj ReserveBidMarketDocumentController ===========');

        const reserveBidObjBase: ReserveBidMarketDocument = params.values.get(ParametersType.RESERVE_BID_MARKET_DOCUMENT_BASE);

        reserveBidObj.messageType=reserveBidObjBase.messageType;
        reserveBidObj.processType=reserveBidObjBase.processType;
        reserveBidObj.businessType=reserveBidObjBase.businessType;
        reserveBidObj.quantityMeasureUnitName=reserveBidObjBase.quantityMeasureUnitName;
        reserveBidObj.priceMeasureUnitName=reserveBidObjBase.priceMeasureUnitName;
        reserveBidObj.currencyUnitName=reserveBidObjBase.currencyUnitName;
        reserveBidObj.senderMarketParticipantMrid=site.systemOperatorMarketParticipantMrid;
        reserveBidObj.receiverMarketParticipantMrid=site.producerMarketParticipantMrid;
        if (!reserveBidObj.validityPeriodStartDateTime
            || reserveBidObj.validityPeriodStartDateTime.length === 0) {
            var date: Date = new Date();
            date.setUTCHours(0,0,0,0);
            reserveBidObj.validityPeriodStartDateTime = JSON.parse(JSON.stringify(date));
        }

        params.logger.debug('=============  END  : fillObj ReserveBidMarketDocumentController ===========');
        return reserveBidObj;
    }


    public static async createObj(
        params: STARParameters,
        reserveBidCreationObj: ReserveBidMarketDocumentCreation,
        target: string = '') {

        params.logger.debug('============= START : CreateObj ReserveBidMarketDocumentController ===========');

        var reserveBidObj = reserveBidCreationObj.reserveBid;

        ReserveBidMarketDocument.schema.validateSync(
            reserveBidObj,
            {strict: true, abortEarly: false},
        );

        const identity = params.values.get(ParametersType.IDENTITY);

        var isRecopy = false;
        var existingReserveBidRef:Map<string, DataReference> = null;
        try {
            existingReserveBidRef = await StarPrivateDataService.getObjRefbyId(params, {docType: DocType.RESERVE_BID_MARKET_DOCUMENT, id: reserveBidObj.reserveBidMrid});
        } catch (err) {
            isRecopy = false;
        }

        if (existingReserveBidRef
            && existingReserveBidRef.values().next().value
            && target
            && target.length > 0
            && existingReserveBidRef.values().next().value.collection !== target) {

            const reserveBidRef: ReserveBidMarketDocument = JSON.parse(JSON.stringify(existingReserveBidRef.values().next().value.data));
            const currentReserveBidObj: ReserveBidMarketDocument = JSON.parse(JSON.stringify(reserveBidObj));

            isRecopy = (JSON.stringify(reserveBidRef) === JSON.stringify(currentReserveBidObj));
        }

        if (!isRecopy && identity !== OrganizationTypeMsp.PRODUCER) {
            throw new Error(`Organisation, ${identity} does not have write access to create a reserve bid market document`);
        }

        //Get existing sites
        var existingSitesRef:Map<string, DataReference>;
        try {
            if (target && target.length > 0) {
                existingSitesRef = await StarPrivateDataService.getObjRefbyId(params, {docType: DocType.SITE, id: reserveBidObj.meteringPointMrid, collection: target});
            } else {
                existingSitesRef = await StarPrivateDataService.getObjRefbyId(params, {docType: DocType.SITE, id: reserveBidObj.meteringPointMrid});
            }
        } catch(error) {
            throw new Error(error.message.concat(' for reserve bid creation'));
        }


        if (!isRecopy) {
            const siteRef: DataReference = existingSitesRef.values().next().value;
            reserveBidObj = await this.fillObj(params, reserveBidObj, siteRef.data);

        }

        if (reserveBidObj.attachments && reserveBidObj.attachments.length > 0) {
            reserveBidObj.attachmentsWithStatus = [];
            for (var attachmentFileId of reserveBidObj.attachments) {
                const fileIdList: string[] = [];
                if (reserveBidCreationObj.attachmentFileList && reserveBidCreationObj.attachmentFileList.length > 0) {
                    for (var attachmentFile of reserveBidCreationObj.attachmentFileList) {
                        fileIdList.push(attachmentFile.fileId);
                    }
                }

                try {
                    const attachmentFile = await this.prepareNewFile(params, attachmentFileId, fileIdList);
                    reserveBidObj.attachmentsWithStatus.push(attachmentFile);
                } catch(error) {
                    throw new Error(error.message.concat(' for reserve bid creation'));
                }
            }
        }

        for (var [targetExistingSite, ] of existingSitesRef) {
            await ReserveBidMarketDocumentService.write(params, reserveBidObj, targetExistingSite);
            await AttachmentFileController.createObjByList(params, reserveBidCreationObj.attachmentFileList, targetExistingSite);
            await SiteReserveBidIndexersController.addReserveBidReference(params, reserveBidObj, targetExistingSite);


            const activationDocumentIdList: string[] = await this.findEveryConcernedActivationDocumentIdList(params, reserveBidObj, targetExistingSite);
            if (activationDocumentIdList && activationDocumentIdList.length > 0) {
                for (var activationDocumentId of activationDocumentIdList) {

                    await BalancingDocumentController.createOrUpdateById(params, activationDocumentId, reserveBidObj, null, targetExistingSite);
                }
            }
        }


        params.logger.debug('=============  END  : CreateObj ReserveBidMarketDocumentController ===========');
    }




    private static async findEveryConcernedActivationDocumentIdList(
        params: STARParameters,
        reserveBidObj: ReserveBidMarketDocument,
        target: string = ''): Promise<string[]> {

        params.logger.debug('=============  END  : CreateObj ReserveBidMarketDocumentController ===========');
        const activationDocumentMridList: string[] = [];

        const indexDocRefList: IndexedData[] =
            await SiteActivationIndexersController.getAndNext(
            params,
            reserveBidObj.meteringPointMrid,
            reserveBidObj.validityPeriodStartDateTime,
            target);


        if (indexDocRefList && indexDocRefList.length > 0) {
            for (var indexDocRef of indexDocRefList) {
                if (indexDocRef.indexedDataAbstractList && indexDocRef.indexedDataAbstractList.length > 0) {
                    for (var indexedDataElt of indexDocRef.indexedDataAbstractList) {
                        var indexedDataAbstract: ActivationDocumentAbstract = indexedDataElt;
                        const reserveBidDate = new Date(reserveBidObj.validityPeriodStartDateTime);
                        const indexedDataDate = new Date(indexedDataAbstract.startCreatedDateTime);
                        if (indexedDataDate > reserveBidDate) {
                            activationDocumentMridList.push(indexedDataAbstract.activationDocumentMrid);
                        }
                    }
                }
            }
        }

        params.logger.debug('=============  END  : CreateObj ReserveBidMarketDocumentController ===========');
        return activationDocumentMridList;
    }










    /*
    inputStr : ???
    */
    public static async addFile(params: STARParameters, inputStr: string): Promise<string> {
        params.logger.info('============= START : AddFile ReserveBidMarketDocumentController ===========');

        const reserveBidFileObj = ReserveBidMarketDocumentFileList.formatString(inputStr);
        var reserveBidObj:ReserveBidMarketDocument = null;

        //Do something only if there are file ids in the list
        if (reserveBidFileObj.attachmentFileList && reserveBidFileObj.attachmentFileList.length > 0) {

            //Get every reference to Bid Market Document in every Collection
            var existingReserveBidRef:Map<string, DataReference>;
            try {
                existingReserveBidRef = await StarPrivateDataService.getObjRefbyId(params, {docType: DocType.RESERVE_BID_MARKET_DOCUMENT, id: reserveBidFileObj.reserveBidMrid});
            } catch(error) {
                throw new Error(error.message.concat(' to add file'));
            }
            //Take the first reference
            reserveBidObj = existingReserveBidRef.values().next().value;

            //Only do somehting if the found reference is the asekd one
            if (reserveBidObj && reserveBidObj.reserveBidMrid === reserveBidFileObj.reserveBidMrid) {
                const fileIdList: string[] = [];
                for (var attachmentFile of reserveBidFileObj.attachmentFileList) {
                    fileIdList.push(attachmentFile.fileId);
                }

                var idAdded = false;
                for (var attachmentFileId of fileIdList) {
                    //Only add if not already added
                    if (!reserveBidObj.attachments.includes(attachmentFileId)) {
                        try {
                            const attachmentFile = await this.prepareNewFile(params, attachmentFileId, fileIdList);
                            reserveBidObj.attachmentsWithStatus.push(attachmentFile);
                            reserveBidObj.attachments.push(attachmentFileId);
                            idAdded = true;
                        } catch(error) {
                            throw new Error(error.message.concat(' to add file'));
                        }
                    }
                }

                //Update document if only a file id was added before
                if (idAdded) {
                    for (var [key, ] of existingReserveBidRef) {
                        await ReserveBidMarketDocumentService.write(params, reserveBidObj, key);
                        await AttachmentFileController.createObjByList(params, reserveBidFileObj.attachmentFileList, key);
                    }
                }

            }
        }
        const cleanedReserveBidObj = this.cleanReserveBidMarketDocumentFileList(reserveBidObj);

        params.logger.info('=============  END  : AddFile ReserveBidMarketDocumentController ===========');
        return JSON.stringify(cleanedReserveBidObj);
    }






    private static async prepareNewFile(params: STARParameters, fileId: string, fileIdListToCreate: string[]): Promise<AttachmentFileWithStatus> {
        params.logger.debug('============= START : PrepareNewFile ReserveBidMarketDocumentController ===========');

        var attachmentFile : AttachmentFileWithStatus = null;

        if (fileId && fileId.length > 0) {
            var fileToFind = !fileIdListToCreate.includes(fileId);
            if (fileToFind) {
                await AttachmentFileController.getById(params, fileId);
            }
            attachmentFile = {fileId: fileId, status: AttachmentFileStatus.ACTIVE};
        }

        params.logger.debug('=============  END  : PrepareNewFile ReserveBidMarketDocumentController ===========');

        return attachmentFile;
    }






    /*
        inputStr : ???
    */
    public static async removeFile(params: STARParameters, inputStr: string) {
        params.logger.info('============= START : RemoveFile ReserveBidMarketDocumentController ===========');

        const reserveBidFileObj = ReserveBidMarketDocumentFileIdList.formatString(inputStr);
        var reserveBidObj:ReserveBidMarketDocument = null;

        //Do something only if there are file ids in the list
        if (reserveBidFileObj.attachmentFileIdList && reserveBidFileObj.attachmentFileIdList.length > 0) {

            //Get every reference to Bid Market Document in every Collection
            var existingReserveBidRef:Map<string, DataReference>;
            try {
                existingReserveBidRef = await StarPrivateDataService.getObjRefbyId(params, {docType: DocType.RESERVE_BID_MARKET_DOCUMENT, id: reserveBidFileObj.reserveBidMrid});
            } catch(error) {
                throw new Error(error.message.concat(' to remove file'));
            }
            //Take the first reference
            reserveBidObj = existingReserveBidRef.values().next().value;

            //Only do somehting if the found reference is the asekd one
            if (reserveBidObj && reserveBidObj.reserveBidMrid === reserveBidFileObj.reserveBidMrid) {
                var idRemoved = false;
                //Check every file already present in document
                const newFileList: AttachmentFileWithStatus[] = [];
                for (var attachmentFile of reserveBidObj.attachmentsWithStatus) {
                    if (attachmentFile.status !== AttachmentFileStatus.REMOVED
                        && reserveBidFileObj.attachmentFileIdList.includes(attachmentFile.fileId)) {

                        attachmentFile.status = AttachmentFileStatus.REMOVED;
                        idRemoved = true;
                    }
                    newFileList.push(attachmentFile);
                }

                //Update document if only a file id was removed before
                if (idRemoved) {
                    reserveBidObj.attachmentsWithStatus = newFileList;
                    for (var [key, ] of existingReserveBidRef) {
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
        inputStr : ReserveBidMrid
        output : ReserveBidMarketDocument
    */
    public static async getById(params: STARParameters, ReserveBidMrid: string, target: string = ''): Promise<string> {
        params.logger.info('============= START : getById ReserveBidMarketDocumentController ===========');

        const reserveBidObj: ReserveBidMarketDocument = await this.getObjById(params, ReserveBidMrid, target);
        const cleanedReserveBidObj = this.cleanReserveBidMarketDocumentFileList(reserveBidObj);

        params.logger.info('=============  END  : getById ReserveBidMarketDocumentController ===========');

        return JSON.stringify(cleanedReserveBidObj);
    }




    private static cleanReserveBidMarketDocumentFileList(reserveBidObj: ReserveBidMarketDocument): ReserveBidMarketDocument {
        const fileList: string[] = [];
        for (var attachmentFile of reserveBidObj.attachmentsWithStatus) {
            if (attachmentFile.status !== AttachmentFileStatus.REMOVED) {
                fileList.push(attachmentFile.fileId);
            }
        }
        reserveBidObj.attachments = fileList;
        reserveBidObj.attachmentsWithStatus = null;

        return reserveBidObj;
    }



    public static async getObjById(params: STARParameters, ReserveBidMrid: string, target: string = ''): Promise<ReserveBidMarketDocument> {
        params.logger.debug('============= START : get Obj ById ReserveBidMarketDocumentController ===========');

        const reserveBidObj = await this.getObjByIdArgument(params, {docType: DocType.RESERVE_BID_MARKET_DOCUMENT, id: ReserveBidMrid, collection: target});

        params.logger.debug('=============  END  : get Obj ById ReserveBidMarketDocumentController ===========');
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
            const result:Map<string, DataReference> = await StarPrivateDataService.getObjRefbyId(params, arg);
            const dataReference = result.values().next().value;
            if (dataReference && dataReference.data) {
                reserveBidObj = dataReference.data;
            }
        }

        params.logger.debug('=============  END  : get ReserveBidMarketDocument By Id Argument (%s) ===========', JSON.stringify(arg));

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
    public static async getListObjById(params: STARParameters, reserveBidIdList: string[]): Promise<ReserveBidMarketDocument[]> {
        params.logger.info('============= START : getListObjById ReserveBidMarketDocumentController ===========');

        const reserveBidObjList: ReserveBidMarketDocument[] = [];
        if (reserveBidIdList) {
            for (var reserveBidId of reserveBidIdList) {
                const reserveBidObj: ReserveBidMarketDocument = await this.getObjById(params, reserveBidId);
                const cleanedReserveBidObj = this.cleanReserveBidMarketDocumentFileList(reserveBidObj);

                reserveBidObjList.push(cleanedReserveBidObj);
            }
        }

        params.logger.info('=============  END  : getListById ReserveBidMarketDocumentController ===========');
        return reserveBidObjList;
    }


    private static async checkActivationDocument(
        activationDocument: ActivationDocument,
        reserveBidObj: ReserveBidMarketDocumentAbstract) : Promise<boolean> {

        var checkValue = false;

        if (!activationDocument
            || !activationDocument.activationDocumentMrid
            || activationDocument.activationDocumentMrid.length === 0) {

            return false;
        }

        var dateActivationDocument: Date = null;
        if (activationDocument.startCreatedDateTime && activationDocument.startCreatedDateTime.length > 0) {
            dateActivationDocument = new Date(activationDocument.startCreatedDateTime);
        } else {
            //If no start date in Activation Document no Process to do
            return false;
        }

        const dateReserveBid: Date = new Date(reserveBidObj.validityPeriodStartDateTime);
        if (dateActivationDocument >= dateReserveBid) {
            checkValue = true;
        }

        return checkValue;
    }




    public static async getByActivationDocument(
        params: STARParameters,
        activationDocumentObj: ActivationDocument,
        target: string = ''): Promise<ReserveBidMarketDocument>{
        params.logger.debug('============= START : getByActivationDocument BalancingDocumentController ===========');

        var reserveBidValue: ReserveBidMarketDocument = null;

        if (activationDocumentObj && activationDocumentObj.registeredResourceMrid) {
            var indexedSiteReserveBidList: IndexedData;
            try {
                indexedSiteReserveBidList = await SiteReserveBidIndexersController.get(params, activationDocumentObj.registeredResourceMrid, target);
            } catch (err) {
                //DO nothing except "Not accessible information"
            }

            if (indexedSiteReserveBidList
                && indexedSiteReserveBidList.indexedDataAbstractList
                && indexedSiteReserveBidList.indexedDataAbstractList.length > 0) {

                const dateDoc = new Date(activationDocumentObj.startCreatedDateTime);

                if (dateDoc.getTime() !== dateDoc.getTime()) {
                    return;
                }

                var reserveBidAbstractRef: ReserveBidMarketDocumentAbstract = null;
                for (var reserveBidAbstract of indexedSiteReserveBidList.indexedDataAbstractList) {
                    params.logger.debug('reserveBidAbstract: ', JSON.stringify(reserveBidAbstract));

                    const check = this.checkActivationDocument(activationDocumentObj, reserveBidAbstract);
                    params.logger.debug('check: ', JSON.stringify(check));

                    if (check) {
                        if (!reserveBidAbstractRef
                            || !reserveBidAbstractRef.reserveBidMrid
                            || reserveBidAbstractRef.reserveBidMrid.length === 0) {

                                reserveBidAbstractRef = reserveBidAbstract;
                        } else {
                            const dateBid = new Date(reserveBidAbstract.validityPeriodStartDateTime);
                            const dateBidValue = new Date(reserveBidAbstractRef.validityPeriodStartDateTime);

                            if (dateBid.getTime() === dateBid.getTime()
                                && dateBid <= dateDoc) {

                                if (dateBidValue.getTime() !== dateBidValue.getTime()
                                    || dateBidValue < dateBid) {
                                    reserveBidAbstractRef = reserveBidAbstract;
                                }
                            }

                        }
                    }
                }

                if (reserveBidAbstractRef
                    && reserveBidAbstractRef.reserveBidMrid
                    && reserveBidAbstractRef.reserveBidMrid.length > 0) {

                    reserveBidValue = await this.getObjById(params, reserveBidAbstractRef.reserveBidMrid, target);
                }
            }

        }

        params.logger.debug('=============  END  : getByActivationDocument BalancingDocumentController ===========');
        return reserveBidValue;
    }

    /*
        inputStr : meteringPointMrid
        output : ReserveBidMarketDocument[]
    */
    public static async getByMeteringPointMrid(params: STARParameters, meteringPointMrid: string): Promise<string> {
        params.logger.info('============= START : getByMeteringPointMrid ReserveBidMarketDocumentController ===========');

        const allResults = this.getObjByMeteringPointMrid(params, meteringPointMrid);

        params.logger.info('=============  END  : getByMeteringPointMridSite ReserveBidMarketDocumentController ===========');
        return JSON.stringify(allResults);
    }


    public static async getObjByMeteringPointMrid(
        params: STARParameters,
        meteringPointMrid: string,
        target: string = ''): Promise<ReserveBidMarketDocument[]> {

        params.logger.debug('============= START : get Obj ByMeteringPointMrid ReserveBidMarketDocumentController ===========');

        const query = `{"selector": {"docType": "${DocType.RESERVE_BID_MARKET_DOCUMENT}", "meteringPointMrid": "${meteringPointMrid}"}}`;

        params.logger.debug("query: ", query);

        const allResults = await ReserveBidMarketDocumentService.getQueryArrayResult(params, query, target);

        params.logger.debug('=============  END  : get Obj ByMeteringPointMridSite ReserveBidMarketDocumentController ===========');
        return allResults;
    }


    /*
        inputStr : meteringPointMrid
        output : ReserveBidMarketDocument[]
        //Only current and next reserve bid market document
    */
    public static async getValidByMeteringPointMrid(params: STARParameters, meteringPointMrid: string): Promise<string> {
        params.logger.info('============= START : getValidByMeteringPointMrid ReserveBidMarketDocumentController ===========');

        const criteriaDate = (new Date()).toISOString();
        const criteriaObj: ReserveBidMarketDocumentSiteDate = {meteringPointMrid: meteringPointMrid, referenceDateTime: criteriaDate, includeNext: true};

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




    public static async getBySiteAndDate(params: STARParameters, criteriaObj: ReserveBidMarketDocumentSiteDate): Promise<ReserveBidMarketDocument[]> {
        params.logger.debug('============= START : getBySiteAndDate ReserveBidMarketDocumentController ===========');

        if (!criteriaObj.referenceDateTime || criteriaObj.referenceDateTime.length == 0) {
            var date: Date = new Date();
            date.setUTCHours(0,0,0,0);
            criteriaObj.referenceDateTime =  JSON.parse(JSON.stringify(date));
        }

        var args: string[] = [];
        args.push(`"meteringPointMrid":"${criteriaObj.meteringPointMrid}"`);

        // var argOrStart: string[] = [];
        // argOrStart.push(`"validityPeriodStartDateTime":{"$lte": ${JSON.stringify(criteriaObj.referenceDateTime)}}`);
        // argOrStart.push(`"validityPeriodStartDateTime":""`);
        // argOrStart.push(`"validityPeriodStartDateTime":{"$exists": false}`);
        // args.push(await QueryStateService.buildORCriteria(argOrStart));
        args.push(`"validityPeriodStartDateTime":{"$lte": ${JSON.stringify(criteriaObj.referenceDateTime)}}`);

        var argOrEnd: string[] = [];
        argOrEnd.push(`"validityPeriodEndDateTime":{"$gte": ${JSON.stringify(criteriaObj.referenceDateTime)}}`);
        argOrEnd.push(`"validityPeriodEndDateTime":""`);
        argOrEnd.push(`"validityPeriodEndDateTime":{"$exists": false}`);
        args.push(await QueryStateService.buildORCriteria(argOrEnd));


        const query = await QueryStateService.buildQuery(
            {documentType: DocType.RESERVE_BID_MARKET_DOCUMENT,
            queryArgs: args,
            sort: [`"validityPeriodStartDateTime":"desc"`],
            limit:1});
        const allResultsWithoutAnyLimit = await ReserveBidMarketDocumentService.getQueryArrayResult(params, query);
        var allResults:ReserveBidMarketDocument[] = [];

        //Private Data Collection Management doesn't take limit
        //First has to be manually extracted after request
        if (allResultsWithoutAnyLimit && allResultsWithoutAnyLimit.length > 0) {
            allResults.push(allResultsWithoutAnyLimit[0]);
        }

        // Next Period data Management

        if (criteriaObj.includeNext) {
            var argsNext: string[] = [];
            argsNext.push(`"meteringPointMrid":"${criteriaObj.meteringPointMrid}"`);

            argsNext.push(`"validityPeriodStartDateTime":{"$gte": ${JSON.stringify(criteriaObj.referenceDateTime)}}`);

            var argOrEnd: string[] = [];
            argOrEnd.push(`"validityPeriodEndDateTime":{"$gte": ${JSON.stringify(criteriaObj.referenceDateTime)}}`);
            argOrEnd.push(`"validityPeriodEndDateTime":""`);
            argOrEnd.push(`"validityPeriodEndDateTime":{"$exists": false}`);
            argsNext.push(await QueryStateService.buildORCriteria(argOrEnd));

            const queryNext = await QueryStateService.buildQuery(
                {documentType: DocType.RESERVE_BID_MARKET_DOCUMENT,
                queryArgs: argsNext,
                sort: [`"validityPeriodStartDateTime":"asc"`]});
            const allResultsNext = await ReserveBidMarketDocumentService.getQueryArrayResult(params, queryNext);
            if (allResultsNext) {
                allResults = allResults.concat(allResultsNext);
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
        try{
            const result:Map<string, DataReference> = await StarPrivateDataService.getObjRefbyId(params, {docType: DocType.RESERVE_BID_MARKET_DOCUMENT, id: id, collection: target});

            if (target && target.length > 0) {
                const dataReference: DataReference = result.get(target);
                existing = dataReference
                    && dataReference.data
                    && dataReference.data.reserveBidMrid == id;
            } else {
                existing = result
                    && result.values().next().value
                    && result.values().next().value.data
                    && result.values().next().value.data.reserveBidMrid == id;
            }
        } catch (err) {
            existing = false;
        }


        params.logger.debug('=============  END  : dataExists ReserveBidMarketDocumentController ===========');
        return existing;
    }




}
