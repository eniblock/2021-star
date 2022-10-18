import { Context } from "fabric-contract-api";

import { STARParameters } from '../../model/starParameters';
import { ParametersType } from "../../enums/ParametersType";

export class HLFServices {
    public static async getCollectionOrDefault(
        params: STARParameters,
        docType: string,
        target: string = ''): Promise<string> {

        var collection: string = '';
        if (!target || target.length === 0) {
            const collectionMap: Map<string, string[]> = params.values.get(docType);

            if (collectionMap) {
                collection = collectionMap.get(ParametersType.DEFAULT)[0];
            }
        } else {
            collection = target;
        }

        return collection;
    }

    public static async getCollectionFromParameters(
        params: STARParameters,
        docType: string,
        target: string): Promise<string> {

        const collectionMap: Map<string, string[]> = params.values.get(docType);
        var collection: string = '';
        if (collectionMap) {
            if (!target || target.length === 0) {
                collection = collectionMap.get(ParametersType.DEFAULT)[0];
            } else if (collectionMap.has(target)) {
                collection = collectionMap.get(target)[0];
            } else {
                collection = collectionMap.get(ParametersType.DEFAULT)[0];
            }
        }

        return collection;
    }


    public static async getCollectionsOrDefault(
        params: STARParameters,
        docType: string,
        target: string[] = []): Promise<string[]> {

        var collections: string[];
        if (!target || target.length === 0) {
            const collectionMap: Map<string, string[]> = params.values.get(docType);
            if (collectionMap) {
                collections = collectionMap.get(ParametersType.DEFAULT);
                if (!collections) {
                    collections = collectionMap.values().next().value;
                }
            }
        } else {
            collections = target;
        }

        return collections;
    }

    public static async getCollectionsFromParameters(
        params: STARParameters,
        docType: string,
        target: string): Promise<string[]> {

        const collectionMap: Map<string, string[]> = params.values.get(docType);
        var collections: string[];
        if (collectionMap) {
            if (!target || target.length === 0) {
                collections = collectionMap.get(ParametersType.DEFAULT);
            } else {
                collections = collectionMap.get(target);
            }
        }

        return collections;
    }

    public static async getMspID(
        ctx: Context): Promise<string> {
        return await ctx.clientIdentity.getMSPID();
    }



    public static getUserRole(params: STARParameters): string {
        const identity = params.values.get(ParametersType.IDENTITY);
        const roleTable: Map<string, string> = params.values.get(ParametersType.ROLE_TABLE);
        var roleUser: string;
        if (roleTable.has(identity)) {
            roleUser = roleTable.get(identity);
        }
        return roleUser;
    }


    public static async setLogLevel(params: STARParameters, loglevel: string): Promise<void> {
        if (!["WARNING", "INFO", "DEBUG"].includes(loglevel)) {
            throw new Error("defined log level can only be : WARNING or INFO or DEBUG");
        }

        params.loggerMgt.setLevel(loglevel);

        params.logger.warn("!!! new log level define: ", loglevel);
    }

}
