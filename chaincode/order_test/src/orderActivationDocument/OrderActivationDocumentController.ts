/**
 * Copyright (C) 2020, RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
*/

// import {ChaincodeStub} from 'fabric-shim';
import {OrderActivationDocument} from './OrderActivationDocument';
import {State} from '../State';
import {IController} from '../../interfaces/IController';
import {AssetType} from '../../enums/AssetType';
import {OrganizationTypeMsp} from '../../enums/OrganizationTypeMsp';
import {AssetError} from '../common/AssetError';
import {IOrganization} from '../../interfaces/IOrganization';
import { Context } from 'fabric-contract-api';

export class OrderActivationDocumentController implements IController {
  private state: State;

  public constructor(private ctx: Context) {
    this.state = new State(this.ctx);
  }

  public async createOrderActivationDocument(
    orderActivationDocument: OrderActivationDocument
  ): Promise<OrderActivationDocument> {
    if (!this.isOrganizationTypeAllowedToCreateOrderActivationDocument()) {
      throw new AssetError(
        orderActivationDocument.orderId,
        this.constructor.name,
        'OrganizationType is not allowed to create an OrderActivationDocument.'
      );
    }

    if (
      await new State(this.ctx).isAssetRegistered(
        orderActivationDocument.orderId
      )
    ) {
      throw new Error(`${orderActivationDocument.orderId} already exists.`);
    }

    await new State(this.ctx).put<OrderActivationDocument>(
      orderActivationDocument.orderId,
      this.createOrderActivationDocumentAssetForBlockChain(
        orderActivationDocument
      )
    );

    return orderActivationDocument;
  }

  public async updateOrderActivationDocument(
    orderActivationDocument: OrderActivationDocument
  ): Promise<OrderActivationDocument> {
    if (!this.isOrganizationTypeAllowedToUpdateOrderActivationDocument()) {
      throw new AssetError(
        orderActivationDocument.orderId,
        this.constructor.name,
        'OrganizationType is not allowed to update an OrderActivationDocument.'
      );
    }

    await new State(this.ctx).update<OrderActivationDocument>(
      orderActivationDocument.orderId,
      this.createOrderActivationDocumentAssetForBlockChain(
        orderActivationDocument
      )
    );

    return orderActivationDocument;
  }

  public async getAllOrderActivationDocuments(
    organization: IOrganization
  ): Promise<OrderActivationDocument[]> {
    const OrderActivationDocuments: OrderActivationDocument[] = await new State(
      this.ctx
    ).getAll<OrderActivationDocument>(AssetType.OrderActivationDocument);

    if (this.ctx.stub.getCreator().mspid === OrganizationTypeMsp.DSO) {
      return await this.returnAllOrderActivationDocumentsWithReferenceToOrganization(
        OrderActivationDocuments,
        organization
      );
    }

    return OrderActivationDocuments;
  }

  public async getOrderActivationDocumentById(
    id: string,
    organization: IOrganization
  ): Promise<OrderActivationDocument> {
    const orderActivationDocument: OrderActivationDocument = await new State(
      this.ctx
    ).get<OrderActivationDocument>(id);

    if (this.ctx.stub.getCreator().mspid === OrganizationTypeMsp.DSO) {
      if (
        !(await this.hasOrganizationPermission(
          orderActivationDocument,
          organization
        ))
      ) {
        throw new AssetError(
          orderActivationDocument.orderId,
          this.constructor.name,
          'Organization does not have permission to get this OrderActivationDocument.'
        );
      }
    }

    return orderActivationDocument;
  }

  public async queryOrderActivationDocument(
    mapQueryOrderActivationDocument: string,
    organization: IOrganization
  ): Promise<OrderActivationDocument[]> {
    const query = this.buildQuery(mapQueryOrderActivationDocument);

    const orderActivationDocuments: OrderActivationDocument[] = await new State(
      this.ctx
    ).getByQuery<OrderActivationDocument>(
      AssetType.OrderActivationDocument,
      query
    );

    if (this.ctx.stub.getCreator().mspid === OrganizationTypeMsp.DSO) {
      return await this.returnAllOrderActivationDocumentsWithReferenceToOrganization(
        orderActivationDocuments,
        organization
      );
    }

    return orderActivationDocuments;
  }

  private async hasOrganizationPermission(
    orderActivationDocument: OrderActivationDocument,
    organization: IOrganization
  ): Promise<boolean> {
    return !!orderActivationDocument.a04RegisteredResourceMrid.find(
      (id) => id === organization.organizationId
    );
  }

  private async returnAllOrderActivationDocumentsWithReferenceToOrganization(
    orderActivationDocuments: OrderActivationDocument[],
    organization: IOrganization
  ): Promise<OrderActivationDocument[]> {
    const ordersWithReferenceToOrganization: OrderActivationDocument[] = [];

    for (const orderActivationDocument of orderActivationDocuments) {
      if (
        !(await this.hasOrganizationPermission(
          orderActivationDocument,
          organization
        ))
      ) {
        continue;
      }

      ordersWithReferenceToOrganization.push(orderActivationDocument);
    }

    return ordersWithReferenceToOrganization;
  }

  private isOrganizationTypeAllowedToCreateOrderActivationDocument(): boolean {
    return this.ctx.stub.getCreator().mspid === OrganizationTypeMsp.TSO;
  }

  private isOrganizationTypeAllowedToUpdateOrderActivationDocument(): boolean {
    return this.ctx.stub.getCreator().mspid === OrganizationTypeMsp.TSO;
  }

  private buildQuery(mapQueryOrder: string): any {
    const orderActivationDocument: OrderActivationDocument = JSON.parse(
      mapQueryOrder
    );

    return {
      orderId: orderActivationDocument.orderId
        ? {$eq: orderActivationDocument.orderId}
        : {$ne: null},
      nazaRegisteredResourceMrid: orderActivationDocument.nazaRegisteredResourceMrid
        ? {$eq: orderActivationDocument.nazaRegisteredResourceMrid}
        : {$ne: null},
      orderAllValue: orderActivationDocument.orderAllValue
        ? {$eq: orderActivationDocument.orderAllValue}
        : {$ne: null},
      createdDateTime: orderActivationDocument.createdDateTime
        ? {$eq: orderActivationDocument.createdDateTime}
        : {$ne: null}
    };
  }

  private createOrderActivationDocumentAssetForBlockChain(
    orderActivationDocument: OrderActivationDocument
  ): OrderActivationDocument {
    return new OrderActivationDocument(
      orderActivationDocument.orderId,
      orderActivationDocument.nazaRegisteredResourceMrid,
      orderActivationDocument.orderAllValue,
      orderActivationDocument.createdDateTime,
      orderActivationDocument.objectAggregationMeteringPoint,
      orderActivationDocument.a04RegisteredResourceMrid,
      orderActivationDocument.measurementUnitName,
      orderActivationDocument.revisionNumber,
      orderActivationDocument.type,
      orderActivationDocument.senderMarketParticipantMrid,
      orderActivationDocument.receiverMarketParticipantMrid,
      orderActivationDocument.receiverMarketParticipantMarketRoleType
    );
  }
}
