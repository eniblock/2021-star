/**
 * Copyright (C) 2020, RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
*/

import {  Iterators } from 'fabric-shim';
import {  Context   } from 'fabric-contract-api';
import {  AssetType } from '../enums/AssetType';
import {  Log       } from '../logger/Log';

export class State {
  public constructor(private ctx: Context) {}

  public async put<Type>(id: string, object: Type): Promise<void> {
    try {
      await this.ctx.stub.putState(id, Buffer.from(JSON.stringify(object)));
    } catch (error) {
      // Log.chaincode.error(error);

      // throw new Error(error);
    }
  }

  public async update<Type>(id: string, object: Type): Promise<void> {
    if (!(await new State(this.ctx).isAssetRegistered(id))) {
      throw new Error(`${typeof object} with ${id} doesn't exist.`);
    }
    try {
      await this.ctx.stub.putState(id, Buffer.from(JSON.stringify(object)));
    } catch (error) {
      // Log.chaincode.error(error);
      // throw new Error(error);
    }
  }

  public async bulkPut<Type>(
    idList: string[],
    objectList: Type[]
  ): Promise<void> {
    try {
      // tslint:disable-next-line:prefer-for-of
      for (let i = 0; i < idList.length; i++) {
        await this.ctx.stub.putState(
          idList[i],
          Buffer.from(JSON.stringify(objectList[i]))
        );
      }
    } catch (error) {
      // Log.chaincode.error(error);
      // throw new Error(error);
    }
  }

  public async bulkUpdate<Type>(
    idList: string[],
    objectList: Type[]
  ): Promise<void> {
    try {
      // tslint:disable-next-line:prefer-for-of
      for (let i = 0; i < idList.length; i++) {
        await this.ctx.stub.putState(
          idList[i],
          Buffer.from(JSON.stringify(objectList[i]))
        );
      }
    } catch (error) {
      // Log.chaincode.error(error);
      // throw new Error(error);
    }
  }

  public async get<Type>(id: string): Promise<Type> {
    const resultAsBytes = await this.ctx.stub.getState(id);

    if (!resultAsBytes || !resultAsBytes.toString()) {
      throw new Error(`${id} does not exist.`);
    }

    return JSON.parse(resultAsBytes.toString());
  }

  public async getAll<Type>(assetType: AssetType): Promise<Type[]> {
    const iterator: Iterators.StateQueryIterator = await this.ctx.stub.getQueryResult(
      JSON.stringify({
        selector: {
          assetType: assetType
        }
      })
    );

    let result: Iterators.NextResult<any>;
    const results: Type[] = [];

    do {
      result = await iterator.next();

      if (result.value) {
        results.push(JSON.parse(result.value.value.toString('utf8')));
      }
    } while (result.value && !result.done);

    return results;
  }

  public async getByQuery<Type>(
    assetType: AssetType,
    query: any
  ): Promise<Type[]> {
    query.assetType = assetType;

    const iterator: Iterators.StateQueryIterator = await this.ctx.stub.getQueryResult(
      JSON.stringify({
        selector: query
      })
    );

    let result: Iterators.NextResult<any>;
    const results: Type[] = [];

    do {
      result = await iterator.next();

      if (result.value) {
        results.push(JSON.parse(result.value.value.toString('utf8')));
      }
    } while (result.value && !result.done);

    return results;
  }

  public async isAssetRegistered(assetId: string): Promise<boolean> {
    const objectAsBytes = await this.ctx.stub.getState(assetId);

    return objectAsBytes && objectAsBytes.length > 0;
  }
}
