import { DocType } from '../../enums/DocType';

import { AttachmentFile } from '../../model/attachmentFile';
import { STARParameters } from '../../model/starParameters';

import { StarPrivateDataService } from './StarPrivateDataService';

export class AttachmentFileService {

    public static async write(
        params: STARParameters,
        fileObj: AttachmentFile,
        target: string = ''): Promise<void> {
        params.logger.debug('============= START : write AttachmentFileService ===========');

        fileObj.docType = DocType.ATTACHMENT_FILE;
        await StarPrivateDataService.write(params, {id: fileObj.fileId, dataObj: fileObj, collection: target});

        params.logger.debug('=============  END  : write AttachmentFileService ===========');
    }

}
