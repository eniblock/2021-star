import { Context } from 'fabric-contract-api';
import { date } from 'yup/lib/locale';
import { OrganizationTypeMsp } from '../enums/OrganizationMspType';
import { EnergyAccount } from '../model/energyAccount';

export class EnergyAccountController {

    public static async createEnergyAccount(
        ctx: Context,
        inputStr: string) {
        console.info('============= START : Create EnergyAccount ===========');

        const identity = await ctx.stub.getMspID();
        if (identity !== OrganizationTypeMsp.RTE && identity !== OrganizationTypeMsp.ENEDIS) {
            throw new Error(`Organisation, ${identity} does not have write access for Energy Account.`);
        }

        let energyObj: EnergyAccount;
        try {
            energyObj = JSON.parse(inputStr);
        } catch (error) {
            throw new Error(`ERROR createEnergyAccount-> Input string NON-JSON value`);
        }

        const energyAccountInput = EnergyAccount.schema.validateSync(
            energyObj,
            {strict: true, abortEarly: false},
        );

        const siteAsBytes = await ctx.stub.getState(energyAccountInput.meteringPointMrid);
        if (!siteAsBytes || siteAsBytes.length === 0) {
            throw new Error(`Site : ${energyAccountInput.meteringPointMrid} does not exist for Energy Account ${energyAccountInput.energyAccountMarketDocumentMrid} creation.`);
        }

        energyAccountInput.docType = 'energyAccount';

        await ctx.stub.putState(
            energyAccountInput.energyAccountMarketDocumentMrid,
            Buffer.from(JSON.stringify(energyAccountInput)),
        );
        console.info(
            '============= END   : Create %s EnergyAccount ===========',
            energyAccountInput.energyAccountMarketDocumentMrid,
        );
    }

    public static async getEnergyAccount(
            ctx: Context,
            meteringPointMrid: string,
            startCreatedDateTime: string): Promise<string> {
        const allResults = [];
        const dateUp = new Date(startCreatedDateTime);
        console.log(meteringPointMrid);
        console.log(startCreatedDateTime);
        // console.log('new date=', new Date('2021-10-21T23:59:50.999Z'));
        // console.log ('datesetmili=', dateUp.setUTCMilliseconds(0));
        // console.log ('datesetsec=', dateUp.setUTCSeconds(0));
        // console.log ('datesetmin=', dateUp.setUTCMinutes(0));
        // console.log ('datesethour=', dateUp.setUTCHours(0));
        // console.log ('datetmptime=', dateUp.getTime());

        dateUp.setUTCMilliseconds(0);
        dateUp.setUTCSeconds(0);
        dateUp.setUTCMinutes(0);
        dateUp.setUTCHours(0);
        // console.log('dateUp=', dateUp);
        // console.log('dateUp=', JSON.stringify(dateUp));
        const dateDown = new Date(dateUp.getTime() + 86399999);
        // console.log('dateDown=', dateDown);
        // console.log('dateDown=', JSON.stringify(dateDown));

        const query = `{
            "selector":
            {
                "docType": "energyAccount",
                "meteringPointMrid": "${meteringPointMrid}",
                "deleteMeTime": "${startCreatedDateTime}",
                "createdDateTime": {
                    "$gte": ${JSON.stringify(dateUp)},
                    "$lte": ${JSON.stringify(dateDown)}
                },
                "sort": [{
                    "createdDateTime" : "desc"
                }]
            }
        }`;
        const iterator = await ctx.stub.getQueryResult(query);
        let result = await iterator.next();
        while (!result.done) {
            const strValue = Buffer.from(result.value.value.toString()).toString('utf8');
            let record;
            try {
                record = JSON.parse(strValue);
            } catch (err) {
                record = strValue;
            }
            allResults.push(record);
            result = await iterator.next();
        }
        return JSON.stringify(allResults);
    }

    // public static async getAllEnergyAccount(ctx: Context): Promise<string> {
    //     const allResults = [];
    //     const query = `{"selector": {"docType": "energyAccount"}}`;
    //     const identity = await ctx.stub.getMspID();
    //     if (identity !== OrganizationTypeMsp.RTE && identity !== OrganizationTypeMsp.ENEDIS) {
    //         throw new Error(`Organisation, ${identity} does not have read access for Energy Account.`);
    //     }

    //     const iterator = await ctx.stub.getQueryResult(query);
    //     let result = await iterator.next();
    //     while (!result.done) {
    //         const strValue = Buffer.from(result.value.value.toString()).toString('utf8');
    //         let record;
    //         try {
    //             record = JSON.parse(strValue);
    //         } catch (err) {
    //             record = strValue;
    //         }
    //         allResults.push(record);
    //         result = await iterator.next();
    //     }
    //     return JSON.stringify(allResults);
    // }
}
