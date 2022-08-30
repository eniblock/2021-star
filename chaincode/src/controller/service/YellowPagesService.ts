import { DocType } from "../../enums/DocType";

import { STARParameters } from "../../model/starParameters";
import { YellowPages } from "../../model/yellowPages";

import { StarDataService } from "./StarDataService";

export class YellowPagesService {

    public static async write(
        params: STARParameters,
        yellowPageObj: YellowPages): Promise<void> {

        yellowPageObj.docType = DocType.YELLOW_PAGES;
        await StarDataService.write(params, {id: yellowPageObj.yellowPageMrid, dataObj: yellowPageObj});
    }

}
