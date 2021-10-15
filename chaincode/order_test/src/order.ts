/**
 * Copyright (C) 2020, RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
*/

// import {ChaincodeResponse} from 'fabric-shim';
import { Shim} from 'fabric-shim';
// import {ChaincodeStub} from 'fabric-shim-api';
import * as util from 'util';
import {MethodComponent} from '../enums/MethodComponent';
import {Log} from '../logger/Log';
import {IController} from '../interfaces/IController';
import {Controller} from '../enums/Controller';
import {OrderActivationDocumentController} from './orderActivationDocument/OrderActivationDocumentController';
import {IOrganization} from '../interfaces/IOrganization';
import {Context, Contract, Info, Returns, Transaction} from 'fabric-contract-api';

// @Info({title: 'AssetTransfer', description: 'Smart contract for trading assets'})
export class OrderContract extends Contract {
    public async Init(ctx: Context): Promise<void> {
    Log.chaincode.debug('========= Chaincode Init =========');
    Log.chaincode.debug('========= END : Initialize Ledger =========');
  }

  // @Transaction()
  public async Invoke(ctx: Context): Promise<any> {
    Log.chaincode.debug(`Transaction ID: ${ctx.stub.getTxID()}`);
    Log.chaincode.debug(util.format('Args: %j', ctx.stub.getArgs()));

    const functionAndParameters = ctx.stub.getFunctionAndParameters();
    const controllerName: string = functionAndParameters.fcn.split('.')
    [
      MethodComponent.Controller
    ];
    const functionName: string = functionAndParameters.fcn.split('.')[
      MethodComponent.Function
    ];
    const params = JSON.parse(functionAndParameters.params[0]);
    const organization: IOrganization = JSON.parse(
      functionAndParameters.params[1]
    );

    let payload: any;

    try {
      const controller: IController = this.getController(ctx, controllerName);

      if (typeof controller[functionName] !== 'function') {
        throw new Error(`No function named: ${functionAndParameters.fcn}`);
      }

      payload = await controller[functionName].apply(controller, [
        ...params,
        organization
      ]);

      if (!payload) {
        return Shim.success();
      }

      return Shim.success(Buffer.from(JSON.stringify(payload)));
    } catch (error) {
      console.error(error);

      // return Shim.error( new Uint8Array("error") );
    }
  }

  // @Transaction()
  // @Returns('map')
  private getController(ctx: Context, controller: string): any {
    const controllers: Map<Controller, IController> = new Map<
      Controller,
      IController
    >([[Controller.Order, new OrderActivationDocumentController(ctx)]]);

    if (controllers.has(Controller[controller])) {
      return controllers.get(Controller[controller]) as IController;
    } else {
      throw new Error(`No known controller for transaction ${ctx.stub.getTxID()}`);
    }
  }
}
