/*
 * SPDX-License-Identifier: Apache-2.0
 */

import { Context, Contract } from 'fabric-contract-api';
// import { Shim, ChaincodeStub } from 'fabric-shim';
// import { Util } from 'util';

export class ABstore extends Contract {
    public async Init(ctx: Context) {
        console.info('========= ABstore Init =========');
        // console.info('getFunctionAndParameters=', ctx.stub.getFunctionAndParameters);
        // console.info('getArgs=', ctx.stub.getArgs);
        // const ret = ctx.stub.getFunctionAndParameters();
        // console.info(ret);
        // const args = ret.params;
        // initialise only if 4 parameters passed.
        // if (args.length !== 4) {
        //     console.error('Incorrect number of arguments. Expecting 4');
        //     console.log('Incorrect number of arguments. Expecting 4');
        //     // return Shim.error(Buffer.from(JSON.stringify('Incorrect number of arguments. Expecting 4')));
        //     return;
        // }

        // const A = args[0];
        // const B = args[2];
        // const Aval = args[1];
        // const Bval = args[3];
        const A = 'A';
        const B = 'B';
        const Aval = '100';
        const Bval = '100';

        if (isNaN(Number(Aval)) || isNaN(Number(Bval))) {
            console.error('Expecting integer value for asset holding');
            throw new Error('Expecting integer value for asset holding');
            // return Shim.error(Buffer.from(JSON.stringify('Expecting integer value for asset holding')));
        }

        try {
            await ctx.stub.putState(A, Buffer.from(Aval));
            try {
                await ctx.stub.putState(B, Buffer.from(Bval));
                console.info('Init Success');
                // return Shim.success();
                return;
            } catch (err) {
                console.info('Init error1');
                console.error(err);
                throw new Error(err);
                // return Shim.error(err);
            }
        } catch (err) {
            console.info('Init error2');
            console.error(err);
            throw new Error(err);
            // return Shim.error(err);
        }
    }

    public async Invoke(ctx: Context) {
        console.info('========= ABstore Invoke =========');
        const ret = ctx.stub.getFunctionAndParameters();
        console.info(ret);
        console.info('========= ABstore ret =========');
        const method = this[ret.fcn];
        console.info(method);
        if (!method) {
            console.error('no method of name:' + ret.fcn + ' found');
            throw new Error('no method of name:' + ret.fcn + ' found');
            // return Shim.success();
        }
        try {
            const payload = await method(ctx.stub, ret.params);
            console.info(payload);
            throw new Error(payload);
            // return Shim.success(payload);
        } catch (err) {
            console.error(err);
            throw new Error(err);
            // return Shim.error(err);
        }
    }

    public async invoke(ctx: Context, args: string[]) {
        console.info('========= ABstore invoke ctx + args =========');
        if (args.length !== 3) {
          throw new Error('Incorrect number of arguments. Expecting 3');
        }

        const A = args[0];
        const B = args[1];
        if (!A || !B) {
            throw new Error('asset holding must not be empty');
        }

        // Get the state from the ledger
        const Avalbytes = await ctx.stub.getState(A);
        console.log('Avalbytes=', Avalbytes);
        if (!Avalbytes) {
            throw new Error('Failed to get state of asset holder A');
        }
        let Aval = Number(Avalbytes.toString());

        const Bvalbytes = await ctx.stub.getState(B);
        if (!Bvalbytes) {
            throw new Error('Failed to get state of asset holder B');
        }
        let Bval = Number(Bvalbytes.toString());

        // Perform the execution
        const amount = Number(args[2]);
        if (typeof amount !== 'number') {
            throw new Error('Expecting integer value for amount to be transaferred');
        }

        Aval = Aval - amount;
        Bval = Bval + amount;
        console.info('Aval = %d, Bval = %d\n', Aval, Bval);

        // Write the states back to the ledger
        await ctx.stub.putState(A, Buffer.from(Aval.toString()));
        await ctx.stub.putState(B, Buffer.from(Bval.toString()));

        console.info('========= ABstore invoke END =========');
    }

    // Deletes an entity from state
    public async delete(ctx: Context, args: string[]) {
        if (args.length !== 1) {
            throw new Error('Incorrect number of arguments. Expecting 1');
        }

        const A = args[0];

        // Delete the key from the state in ledger
        await ctx.stub.deleteState(A);
    }

    // query callback representing the query of a chaincode
    public async query(ctx: Context, args: string[]) {
        if (args.length !== 1) {
            throw new Error('Incorrect number of arguments. Expecting name of the person to query');
        }

        let jsonResp = {};
        const A = args[0];

        // Get the state from the ledger
        const Avalbytes = await ctx.stub.getState(A);
        if (!Avalbytes) {
            jsonResp = JSON.stringify('Failed to get state for ' + A);
            throw new Error(JSON.stringify(jsonResp));
        }

        jsonResp = JSON.stringify('name' + A);
        jsonResp += JSON.stringify(Avalbytes.toString());
        console.info('Query Response: ', jsonResp);
        return Avalbytes;
    }
}
