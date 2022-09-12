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
    public static async CreateFiles(params: STARParameters, inputStr: string) {
        params.logger.info('============= START : CreateFiles AttachmentFileController ===========');

        const fileList = AttachmentFile.formatListString(inputStr);

        if (fileList) {
            for (var fileObj of fileList) {
                await AttachmentFileService.write(params, fileObj);
            }
        }

        params.logger.info('=============  END  : CreateFiles AttachmentFileController ===========');
    }

    /*
    inputStr : file
    */
    public static async WriteFile(params: STARParameters, inputStr: string) {
        params.logger.info('============= START : Write AttachmentFileController ===========');

        const fileObj = AttachmentFile.formatString(inputStr);

        if (fileObj) {
            await AttachmentFileService.write(params, fileObj);
        }

        params.logger.info('=============  END  : Write AttachmentFileController ===========');
    }



    public static async GetFileObjById(params: STARParameters, arg: IdArgument): Promise<AttachmentFile> {
        params.logger.debug('============= START : get File By Id (%s) ===========', JSON.stringify(arg));

        let fileObj: AttachmentFile;
        arg.docType = DocType.ATTACHMENT_FILE;
        if (arg.collection && arg.collection.length > 0) {
            fileObj = await StarPrivateDataService.getObj(params, arg);
        } else {
            const result:Map<string, DataReference> = await StarPrivateDataService.getObjRefbyId(params, arg);
            const dataReference = result.values().next().value;
            if (dataReference && dataReference.data) {
                fileObj = dataReference.data;
            }
        }


        params.logger.debug('============= END   : get File By Id (%s) ===========', JSON.stringify(arg));

        return fileObj;
    }


    /*
        inputStr : file id - string
        output : File
    */
        public static async GetFileById(params: STARParameters, fileId: string): Promise<string> {
        params.logger.info('============= START : get File By Id (%s) ===========', JSON.stringify(fileId));

        const fileObj = await this.GetFileObjById(params, {docType: DocType.ATTACHMENT_FILE, id: fileId});

        params.logger.info('============= END   : get File By Id (%s) ===========', JSON.stringify(fileId));

        return JSON.stringify(fileObj);
    }

}
