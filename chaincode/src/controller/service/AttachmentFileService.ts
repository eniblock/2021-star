import { DocType } from "../../enums/DocType";

import { AttachmentFile } from "../../model/attachmentFile";
import { STARParameters } from "../../model/starParameters";

import { StarDataService } from "./StarDataService";

export class AttachmentFileService {


    public static async write(
        params: STARParameters,
        fileObj: AttachmentFile): Promise<void> {

        fileObj.docType = DocType.FILE;
        await StarDataService.write(params, {id: fileObj.fileId, dataObj: fileObj});
    }


}
