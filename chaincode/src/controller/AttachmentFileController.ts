import { DocType } from "../enums/DocType";

import { AttachmentFile } from "../model/attachmentFile";
import { STARParameters } from "../model/starParameters";

import { AttachmentFileService } from "./service/AttachmentFileService";
import { StarDataService } from "./service/StarDataService";


export class AttachmentFileController {

    /*
    inputStr : file[]
    */
    public static async CreateFiles(params: STARParameters, inputStr: string) {
        params.logger.info('============= START : CreateFiles AttachmentFileService ===========');

        const fileList = AttachmentFile.formatListString(inputStr);

        if (fileList) {
            for (var fileObj of fileList) {
                await AttachmentFileService.write(params, fileObj);
            }
        }

        params.logger.info('=============  END  : CreateFiles AttachmentFileService ===========');
    }

    /*
    inputStr : file
    */
    public static async WriteFile(params: STARParameters, inputStr: string) {
        params.logger.info('============= START : Write AttachmentFileService ===========');

        const fileObj = AttachmentFile.formatString(inputStr);

        if (fileObj) {
            await AttachmentFileService.write(params, fileObj);
        }

        params.logger.info('=============  END  : Write AttachmentFileService ===========');
    }

    /*
        inputStr : file id - string
        output : File
    */
    public static async GetFileById(params: STARParameters, fileId: string) {
        params.logger.info('============= START : get File By Id %s ===========', fileId);

        const fileObj = await StarDataService.getObj(params, {id: fileId, docType: DocType.FILE});

        params.logger.info('============= END   : get File By Id %s ===========', fileId);

        return JSON.stringify(fileObj);
    }
}
