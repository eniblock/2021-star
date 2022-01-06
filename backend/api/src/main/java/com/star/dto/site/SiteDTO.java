package com.star.dto.site;

import com.star.enums.TechnologyTypeEnum;

/**
 * Copyright (c) 2022, Enedis (https://www.enedis.fr), RTE (http://www.rte-france.com)
 * SPDX-License-Identifier: Apache-2.0
 */
public class SiteDTO {

    private String typeSite;
    private String systemOperatorMarketParticipantMrid;
    private TechnologyTypeEnum technologyType;
    private String siteType;
    private String meteringPointMrid;
    private String siteName;
    private String siteAdminMrid;
    private String siteLocation;
    private String siteIecCode;
    private String producerMarketParticipantMrid;
    private String producerMarketParticipantName;;
    private String substationMrid;
    private String substationName;
    private String systemOperatorEntityFlexibilityDomainMrid;
    private String systemOperatorEntityFlexibilityDomainName;
    private String systemOperatorCustomerServiceName;
    private String systemOperatorMarketParticipantName;


    public String getTypeSite() {
        return typeSite;
    }

    public void setTypeSite(String typeSite) {
        this.typeSite = typeSite;
    }

    public String getSystemOperatorMarketParticipantMrid() {
        return systemOperatorMarketParticipantMrid;
    }

    public void setSystemOperatorMarketParticipantMrid(String systemOperatorMarketParticipantMrid) {
        this.systemOperatorMarketParticipantMrid = systemOperatorMarketParticipantMrid;
    }

    public TechnologyTypeEnum getTechnologyType() {
        return technologyType;
    }

    public void setTechnologyType(TechnologyTypeEnum technologyType) {
        this.technologyType = technologyType;
    }

    public String getSiteType() {
        return siteType;
    }

    public void setSiteType(String siteType) {
        this.siteType = siteType;
    }

    public String getMeteringPointMrid() {
        return meteringPointMrid;
    }

    public void setMeteringPointMrid(String meteringPointMrid) {
        this.meteringPointMrid = meteringPointMrid;
    }

    public String getSiteName() {
        return siteName;
    }

    public void setSiteName(String siteName) {
        this.siteName = siteName;
    }

    public String getSiteAdminMrid() {
        return siteAdminMrid;
    }

    public void setSiteAdminMrid(String siteAdminMrid) {
        this.siteAdminMrid = siteAdminMrid;
    }

    public String getSiteLocation() {
        return siteLocation;
    }

    public void setSiteLocation(String siteLocation) {
        this.siteLocation = siteLocation;
    }

    public String getSiteIecCode() {
        return siteIecCode;
    }

    public void setSiteIecCode(String siteIecCode) {
        this.siteIecCode = siteIecCode;
    }

    public String getProducerMarketParticipantMrid() {
        return producerMarketParticipantMrid;
    }

    public void setProducerMarketParticipantMrid(String producerMarketParticipantMrid) {
        this.producerMarketParticipantMrid = producerMarketParticipantMrid;
    }

    public String getSubstationMrid() {
        return substationMrid;
    }

    public void setSubstationMrid(String substationMrid) {
        this.substationMrid = substationMrid;
    }

    public String getSubstationName() {
        return substationName;
    }

    public void setSubstationName(String substationName) {
        this.substationName = substationName;
    }

    public String getSystemOperatorEntityFlexibilityDomainMrid() {
        return systemOperatorEntityFlexibilityDomainMrid;
    }

    public void setSystemOperatorEntityFlexibilityDomainMrid(String systemOperatorEntityFlexibilityDomainMrid) {
        this.systemOperatorEntityFlexibilityDomainMrid = systemOperatorEntityFlexibilityDomainMrid;
    }

    public String getSystemOperatorEntityFlexibilityDomainName() {
        return systemOperatorEntityFlexibilityDomainName;
    }

    public void setSystemOperatorEntityFlexibilityDomainName(String systemOperatorEntityFlexibilityDomainName) {
        this.systemOperatorEntityFlexibilityDomainName = systemOperatorEntityFlexibilityDomainName;
    }

    public String getSystemOperatorCustomerServiceName() {
        return systemOperatorCustomerServiceName;
    }

    public void setSystemOperatorCustomerServiceName(String systemOperatorCustomerServiceName) {
        this.systemOperatorCustomerServiceName = systemOperatorCustomerServiceName;
    }

    public String getSystemOperatorMarketParticipantName() {
        return systemOperatorMarketParticipantName;
    }

    public void setSystemOperatorMarketParticipantName(String systemOperatorMarketParticipantName) {
        this.systemOperatorMarketParticipantName = systemOperatorMarketParticipantName;
    }

    public String getProducerMarketParticipantName() {
        return producerMarketParticipantName;
    }

    public void setProducerMarketParticipantName(String producerMarketParticipantName) {
        this.producerMarketParticipantName = producerMarketParticipantName;
    }
}
