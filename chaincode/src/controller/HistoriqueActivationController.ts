import {Context} from "fabric-contract-api";

/*
  TODO :
  THIS CONTROLLER IS A MOCK !
 */

export class HistoriqueActivationController {

    public static async getHistoriqueByQuery(
        ctx: Context,
        query: string, pageSize: number, bookmark: string): Promise<any> {
        let response = await ctx.stub.getQueryResultWithPagination(query, pageSize, bookmark);
        const {iterator, metadata} = response;
        let results = await this.getAllResults(iterator);
        const res = {
            records: results,
            fetchedRecordsCount: metadata.fetchedRecordsCount,
            bookmark: metadata.bookmark
        }
        return res;
    }

    static async getAllResults(iterator) {
        const allResults = [];
        let result = await iterator.next();
        while (!result.done) {
            const strValue = Buffer.from(result.value.value.toString()).toString('utf8');
            let record;
            try {
                record = JSON.parse(strValue);
            } catch (err) {
                record = strValue;
            }
            allResults.push({
                meteringPointMrid: "meteringPointMrid-mock",
                technologyType: "Eolien",
                producerMarketParticipantMrid: "producerMarketParticipantMrid-mock",
                producerMarketParticipantName: "producerMarketParticipantName-mock",
                siteName: "siteName-mock",
                ordreLimitation: record,
            });
            result = await iterator.next();
        }
        return allResults;
    }

}
