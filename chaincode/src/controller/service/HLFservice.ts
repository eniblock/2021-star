import { Context } from "fabric-contract-api";

export class HLFServices {
    public static async getMspID(
        ctx: Context): Promise<string> {
        return await ctx.clientIdentity.getMSPID();
    }

}
