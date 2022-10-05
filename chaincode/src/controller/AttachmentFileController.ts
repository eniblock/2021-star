import { DocType } from "../enums/DocType";
import { IdArgument } from "../model/arguments/idArgument";

import { AttachmentFile } from "../model/attachmentFile";
import { DataReference } from "../model/dataReference";
import { STARParameters } from "../model/starParameters";

import { AttachmentFileService } from "./service/AttachmentFileService";
import { StarPrivateDataService } from "./service/StarPrivateDataService";


export class AttachmentFileController {

    /*
    inputStr : file[]
    */
    public static async createByList(params: STARParameters, inputStr: string, target: string = '') {
        params.logger.debug('============= START : AttachmentFileController - Create By List ===========');

        const fileList = AttachmentFile.formatListString(inputStr);

        if (fileList) {
            for (var fileObj of fileList) {
                await AttachmentFileService.write(params, fileObj, target);
            }
        }

        params.logger.debug('=============  END  : AttachmentFileController - Create By List ===========');
    }



    public static async createObjByList(params: STARParameters, fileList: AttachmentFile[], target: string = '') {
        params.logger.debug('============= START : AttachmentFileController - Create By List ===========');

        if (fileList) {
            for (var fileObj of fileList) {
                await AttachmentFileService.write(params, fileObj, target);
            }
        }

        params.logger.debug('=============  END  : AttachmentFileController - Create By List ===========');
    }



    public static async createByReference(params: STARParameters, dataReference: DataReference) {
        params.logger.debug('============= START : AttachmentFileController- Create By Reference ===========');

        await AttachmentFileService.write(params, dataReference.data, dataReference.collection);

        params.logger.debug('=============  END  : AttachmentFileController- Create By Reference ===========');
    }




    /*
    inputStr : file
    */
    public static async create(params: STARParameters, inputStr: string) {
        params.logger.debug('============= START : AttachmentFileController - create ===========');

        const fileObj = AttachmentFile.formatString(inputStr);

        if (fileObj) {
            await AttachmentFileService.write(params, fileObj);
        }

        params.logger.debug('=============  END  : AttachmentFileController - create ===========');
    }





    public static async getObjById(
        params: STARParameters,
        id: string,
        target: string = ''): Promise<AttachmentFile> {

        params.logger.debug('============= START : AttachmentFileController- get Obj By Id (%s,%s) ===========', id, target);

        let fileObj: AttachmentFile;

        var arg: IdArgument = {docType: DocType.ATTACHMENT_FILE, id: id};
        if (target && target.length > 0) {
            arg.collection = target;
        }

        if (arg.collection && arg.collection.length > 0) {
            fileObj = await StarPrivateDataService.getObj(params, arg);
        } else {
            const result:Map<string, DataReference> = await StarPrivateDataService.getObjRefbyId(params, arg);
            const dataReference = result.values().next().value;
            if (dataReference && dataReference.data) {
                fileObj = dataReference.data;
            }
        }


        params.logger.debug('============= END   : AttachmentFileController - get Obj By Id (%s,%s) ===========', id, target);

        return fileObj;
    }




    /*
        inputStr : file id - string
        output : File
    */
    public static async getById(params: STARParameters, fileId: string): Promise<string> {
        params.logger.debug('============= START : AttachmentFileController - get By Id (%s) ===========', fileId);

        const fileObj = await this.getObjById(params, fileId);

        params.logger.debug('============= END   : AttachmentFileController - get By Id (%s) ===========', fileId);

        return JSON.stringify(fileObj);
    }


    /*
        inputStr : file id - string
        output : File
    */
        public static async getObjsByIdList(
            params: STARParameters,
            fileIdList: string[],
            target: string = ''): Promise<AttachmentFile[]> {

            params.logger.debug('============= START : AttachmentFileController - get Objs By Id List ===========');

            const attachmentFileList: AttachmentFile[] = [];
            if (fileIdList && fileIdList.length > 0) {
                for (var attachmentFileId of fileIdList) {
                    const attachmentFileObj: AttachmentFile = await this.getObjById(params, attachmentFileId, target);

                    attachmentFileList.push(attachmentFileObj);
                }
            }

            params.logger.debug('============= END   : AttachmentFileController - get Objs By Id ===========');

            return attachmentFileList;
        }






    public static async dataExists(
        params: STARParameters,
        id: string,
        target: string = ''): Promise<boolean> {
        params.logger.debug('============= START : AttachmentFileController - dataExists ===========');

        let existing: boolean = false;
        try {
            const result:Map<string, DataReference> = await StarPrivateDataService.getObjRefbyId(params, {docType: DocType.ATTACHMENT_FILE, id: id});

            if (target && target.length > 0) {
                const dataReference: DataReference = result.get(target);
                existing = dataReference
                    && dataReference.data
                    && dataReference.data.fileId == id;
            } else {
                existing = result
                    && result.values().next().value
                    && result.values().next().value.data
                    && result.values().next().value.data.fileId == id;
            }
        } catch (err) {
            existing = false;
        }


        params.logger.debug('=============  END  : AttachmentFileController - dataExists ===========');
        return existing;
    }


}
