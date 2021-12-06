/*
 * SPDX-License-Identifier: Apache-2.0
 */

import { ChaincodeStub, Shim } from 'fabric-shim';

// import { Util } from 'util';

export class ABstore {
    public async Init(stub: ChaincodeStub) {
        console.info('========= ABstore Init =========');
        const ret = stub.getFunctionAndParameters();
        console.info(ret);
        const args = ret.params;
        // initialise only if 4 parameters passed.
        if (args.length !== 4) {
            console.error('Incorrect number of arguments. Expecting 4');
            return Shim.error(Buffer.from(JSON.stringify('Incorrect number of arguments. Expecting 4')));
        }

        const A = args[0];
        const B = args[2];
        const Aval = args[1];
        const Bval = args[3];

        if (isNaN(Number(Aval)) || isNaN(Number(Bval))) {
            console.error('Expecting integer value for asset holding');
            return Shim.error(Buffer.from(JSON.stringify('Expecting integer value for asset holding')));
        }

        try {
            await stub.putState(A, Buffer.from(Aval));
            try {
                await stub.putState(B, Buffer.from(Bval));
                return Shim.success();
            } catch (err) {
                return Shim.error(err);
            }
        } catch (err) {
            return Shim.error(err);
        }
    }

    public async Invoke(stub: ChaincodeStub) {
        const ret = stub.getFunctionAndParameters();
        console.info(ret);
        const method = this[ret.fcn];
        if (!method) {
            console.log('no method of name:' + ret.fcn + ' found');
            return Shim.success();
        }
        try {
            const payload = await method(stub, ret.params);
            return Shim.success(payload);
        } catch (err) {
            console.log(err);
            return Shim.error(err);
        }
    }

    public async invoke(stub: ChaincodeStub, args: string[]) {
        if (args.length !== 3) {
          throw new Error('Incorrect number of arguments. Expecting 3');
        }

        const A = args[0];
        const B = args[1];
        if (!A || !B) {
            throw new Error('asset holding must not be empty');
        }

        // Get the state from the ledger
        const Avalbytes = await stub.getState(A);
        if (!Avalbytes) {
            throw new Error('Failed to get state of asset holder A');
        }
        let Aval = Number(Avalbytes.toString());

        const Bvalbytes = await stub.getState(B);
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
        await stub.putState(A, Buffer.from(Aval.toString()));
        await stub.putState(B, Buffer.from(Bval.toString()));

    }

    // Deletes an entity from state
    public async delete(stub: ChaincodeStub, args: string[]) {
        if (args.length !== 1) {
            throw new Error('Incorrect number of arguments. Expecting 1');
        }

        const A = args[0];

        // Delete the key from the state in ledger
        await stub.deleteState(A);
    }

    // query callback representing the query of a chaincode
    public async query(stub: ChaincodeStub, args: string[]) {
        if (args.length !== 1) {
            throw new Error('Incorrect number of arguments. Expecting name of the person to query');
        }

        let jsonResp = {};
        const A = args[0];

        // Get the state from the ledger
        const Avalbytes = await stub.getState(A);
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

module.exports = ABstore;

// Shim.start(new ABstore());
