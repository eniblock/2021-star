import { AttachmentFileStatus } from "../enums/AttachmentFileStatus";
import { DocType } from "../enums/DocType";
import { OrganizationTypeMsp } from "../enums/OrganizationMspType";
import { ParametersType } from "../enums/ParametersType";
import { IdArgument } from "../model/arguments/idArgument";
import { AttachmentFileWithStatus } from "../model/attachmentFile";
import { DataReference } from "../model/dataReference";
import { ReserveBidMarketDocument } from "../model/reserveBidMarketDocument";
import { ReserveBidMarketDocumentFileList } from "../model/reserveBidMarketDocumentFileList";
import { reserveBidMarketDocumentSiteDate } from "../model/reserveBidMarketDocumentSiteDate";
import { STARParameters } from "../model/starParameters";
import { AttachmentFileController } from "./AttachmentFileController";
import { QueryStateService } from "./service/QueryStateService";
import { ReserveBidMarketDocumentService } from "./service/ReserveBidMarketDocumentService";
import { StarDataService } from "./service/StarDataService";
import { StarPrivateDataService } from "./service/StarPrivateDataService";


export class ReserveBidMarketDocumentController {

    /*
        inputStr : reserveBidMarketDocument
    */
    public static async create(params: STARParameters, inputStr: string) {
        params.logger.info('============= START : Create ReserveBidMarketDocumentController ===========');

        const reserveBidObj = ReserveBidMarketDocument.formatString(inputStr);
        await this.createObj(params, reserveBidObj);

        params.logger.info('=============  END  : Create ReserveBidMarketDocumentController ===========');
    }

    public static async createByReference   (params: STARParameters, dataReference: DataReference) {
        params.logger.debug('============= START : Create by Reference ReserveBidMarketDocumentController ===========');

        await this.createObj(params, dataReference.data, dataReference.collection);

        params.logger.debug('=============  END  : Create by Reference ReserveBidMarketDocumentController ===========');
    }

    /*
        inputStr : reserveBidMarketDocument[]
    */
    public static async createList(params: STARParameters, inputStr: string) {
        params.logger.info('============= START : CreateList ReserveBidMarketDocumentController ===========');

        const reserveBidList = ReserveBidMarketDocument.formatListString(inputStr);

        if (reserveBidList) {
            for (var reserveBidObj of reserveBidList) {
                await this.createObj(params, reserveBidObj);
            }
        }

        params.logger.info('=============  END  : CreateList ReserveBidMarketDocumentController ===========');
    }




    public static async createObj(
        params: STARParameters,
        reserveBidObj: ReserveBidMarketDocument,
        target: string = '') {

        params.logger.debug('============= START : CreateObj ReserveBidMarketDocumentController ===========');

        ReserveBidMarketDocument.schema.validateSync(
            reserveBidObj,
            {strict: true, abortEarly: false},
        );

        const identity = params.values.get(ParametersType.IDENTITY);
        if (identity !== OrganizationTypeMsp.PRODUCER) {
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


        try {
            await StarDataService.getObj(params, {id:reserveBidObj.senderMarketParticipantMrid, docType: DocType.SYSTEM_OPERATOR});
        } catch(error) {
            throw new Error(error.message.concat(' for reserve bid creation'));
        }

        try {
            await StarDataService.getObj(params, {id: reserveBidObj.receiverMarketParticipantMrid, docType: DocType.PRODUCER});
        } catch(error) {
            throw new Error(error.message.concat(' for reserve bid creation'));
        }

        if (reserveBidObj.attachments && reserveBidObj.attachments.length > 0) {
            for (var attachmentFileId of reserveBidObj.attachments) {
                try {
                    const attachmentFile = await this.prepareNewFile(params, attachmentFileId);
                    reserveBidObj.attachmentsWithStatus.push(attachmentFile);
                } catch(error) {
                    throw new Error(error.message.concat(' for reserve bid creation'));
                }
            }
        }

        for (var [key, ] of existingSitesRef) {
            await ReserveBidMarketDocumentService.write(params, reserveBidObj, key);
        }


        params.logger.debug('=============  END  : CreateObj ReserveBidMarketDocumentController ===========');
    }




    /*
    inputStr : ???
    */
    public static async addFile(params: STARParameters, inputStr: string): Promise<string> {
        params.logger.info('============= START : AddFile ReserveBidMarketDocumentController ===========');

        const reserveBidFileObj = ReserveBidMarketDocumentFileList.formatString(inputStr);
        var reserveBidObj:ReserveBidMarketDocument = null;

        //Do something only if there are file ids in the list
        if (reserveBidFileObj.attachments && reserveBidFileObj.attachments.length > 0) {

            //Get every reference to Bid Market Document in every Collection
            var existingReserveBidRef:Map<string, DataReference>;
            try {
                existingReserveBidRef = await StarPrivateDataService.getObjRefbyId(params, {docType: DocType.RESERVE_BID_MARKET_DOCUMENT, id: reserveBidFileObj.ReserveBidMrid});
            } catch(error) {
                throw new Error(error.message.concat(' to add file'));
            }
            //Take the first reference
            reserveBidObj = existingReserveBidRef.values().next().value;

            //Only do somehting if the found reference is the asekd one
            if (reserveBidObj && reserveBidObj.reserveBidMrid === reserveBidFileObj.ReserveBidMrid) {
                var idAdded = false;
                for (var attachmentFileId of reserveBidFileObj.attachments) {
                    //Only add if not already added
                    if (!reserveBidObj.attachments.includes(attachmentFileId)) {
                        try {
                            const attachmentFile = await this.prepareNewFile(params, attachmentFileId);
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
                    }
                }

            }
        }
        const cleanedReserveBidObj = this.cleanReserveBidMarketDocumentFileList(reserveBidObj);

        params.logger.info('=============  END  : AddFile ReserveBidMarketDocumentController ===========');
        return JSON.stringify(cleanedReserveBidObj);
    }



    private static async prepareNewFile(params: STARParameters, fileId: string): Promise<AttachmentFileWithStatus> {
        params.logger.debug('============= START : PrepareNewFile ReserveBidMarketDocumentController ===========');

        var attachmentFile : AttachmentFileWithStatus = null;

        if (fileId && fileId.length > 0) {
            await AttachmentFileController.getById(params, fileId);
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

        const reserveBidFileObj = ReserveBidMarketDocumentFileList.formatString(inputStr);
        var reserveBidObj:ReserveBidMarketDocument = null;

        //Do something only if there are file ids in the list
        if (reserveBidFileObj.attachments && reserveBidFileObj.attachments.length > 0) {

            //Get every reference to Bid Market Document in every Collection
            var existingReserveBidRef:Map<string, DataReference>;
            try {
                existingReserveBidRef = await StarPrivateDataService.getObjRefbyId(params, {docType: DocType.RESERVE_BID_MARKET_DOCUMENT, id: reserveBidFileObj.ReserveBidMrid});
            } catch(error) {
                throw new Error(error.message.concat(' to remove file'));
            }
            //Take the first reference
            reserveBidObj = existingReserveBidRef.values().next().value;

            //Only do somehting if the found reference is the asekd one
            if (reserveBidObj && reserveBidObj.reserveBidMrid === reserveBidFileObj.ReserveBidMrid) {
                var idRemoved = false;
                //Check every file already present in document
                const newFileList: AttachmentFileWithStatus[] = [];
                for (var attachmentFile of reserveBidObj.attachmentsWithStatus) {
                    if (attachmentFile.status !== AttachmentFileStatus.REMOVED
                        && reserveBidFileObj.attachments.includes(attachmentFile.fileId)) {

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
    public static async getById(params: STARParameters, ReserveBidMrid: string): Promise<string> {
        params.logger.info('============= START : getById ReserveBidMarketDocumentController ===========');

        const reserveBidObj: ReserveBidMarketDocument = await this.getObjById(params, ReserveBidMrid);
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



    public static async getObjById(params: STARParameters, ReserveBidMrid: string): Promise<ReserveBidMarketDocument> {
        params.logger.debug('============= START : get Obj ById ReserveBidMarketDocumentController ===========');

        const reserveBidObj = await this.getObjByIdArgument(params, {docType: DocType.RESERVE_BID_MARKET_DOCUMENT, id: ReserveBidMrid});

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

        const reserveBidObjList: ReserveBidMarketDocument[] = [];
        if (reserveBidIdList) {
            for (var reserveBidId of reserveBidIdList) {
                const reserveBidObj: ReserveBidMarketDocument = await this.getObjById(params, reserveBidId);
                const cleanedReserveBidObj = this.cleanReserveBidMarketDocumentFileList(reserveBidObj);

                reserveBidObjList.push(cleanedReserveBidObj);
            }
        }

        params.logger.info('=============  END  : getListById ReserveBidMarketDocumentController ===========');
        return JSON.stringify(reserveBidObjList);
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
        const criteriaObj: reserveBidMarketDocumentSiteDate = {meteringPointMrid: meteringPointMrid, referenceDateTime: criteriaDate};

        const allResults = await this.getBySiteAndDate(params, criteriaObj);

        params.logger.info('=============  END  : getValidByMeteringPointMrid ReserveBidMarketDocumentController ===========');

        return allResults;
    }



    /*
        inputStr : meteringPointMrid
        output : ReserveBidMarketDocument[]
        //Only current and next reserve bid market document
    */
    public static async getAtDateByMeteringPointMrid(params: STARParameters, inputStr: string): Promise<string> {
        params.logger.info('============= START : getAtDateByMeteringPointMrid ReserveBidMarketDocumentController ===========');

        const criteriaObj = reserveBidMarketDocumentSiteDate.formatString(inputStr);
        const allResults = await this.getBySiteAndDate(params, criteriaObj);

        params.logger.info('=============  END  : getAtDateByMeteringPointMrid ReserveBidMarketDocumentController ===========');
        return allResults;
    }




    private static async getBySiteAndDate(params: STARParameters, criteriaObj: reserveBidMarketDocumentSiteDate): Promise<string> {
        params.logger.debug('============= START : getBySiteAndDate ReserveBidMarketDocumentController ===========');

        var args: string[] = [];
        args.push(`"meteringPointMrid":"${criteriaObj.meteringPointMrid}"`);

        var argOrStart: string[] = [];
        argOrStart.push(`"validityPeriodStartDateTime":{"$lte": ${JSON.stringify(criteriaObj.referenceDateTime)}}`);
        argOrStart.push(`"validityPeriodStartDateTime":""}`);
        argOrStart.push(`"validityPeriodStartDateTime":{"$exists": false}`);
        args.push(await QueryStateService.buildORCriteria(argOrStart));


        if (criteriaObj.includeNext) {
            var argOrEnd: string[] = [];
            argOrEnd.push(`"validityPeriodEndDateTime":{"$gte": ${JSON.stringify(criteriaObj.referenceDateTime)}}`);
            argOrEnd.push(`"validityPeriodEndDateTime":""}`);
            argOrEnd.push(`"validityPeriodEndDateTime":{"$exists": false}`);
            args.push(await QueryStateService.buildORCriteria(argOrEnd));
        }

        const query = await QueryStateService.buildQuery({documentType: DocType.RESERVE_BID_MARKET_DOCUMENT, queryArgs: args, sort: [`"validityPeriodStartDateTime":"asc"`]});
        const allResults = await ReserveBidMarketDocumentService.getQueryStringResult(params, query);

        params.logger.debug('=============  END  : getBySiteAndDate ReserveBidMarketDocumentController ===========');
        return allResults;
    }


    public static async dataExists(
        params: STARParameters,
        id: string,
        target: string = ''): Promise<boolean> {
        params.logger.debug('============= START : dataExists ReserveBidMarketDocumentController ===========');

        let existing: boolean = false;
        const result:Map<string, DataReference> = await StarPrivateDataService.getObjRefbyId(params, {docType: DocType.RESERVE_BID_MARKET_DOCUMENT, id: id});

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

        params.logger.debug('=============  END  : dataExists ReserveBidMarketDocumentController ===========');
        return existing;
    }




}
