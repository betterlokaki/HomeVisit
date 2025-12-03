import type {
  EnrichedSite,
  Site,
  EnrichmentRequestBody,
  EnrichmentResponseBody,
  EnrichmentSiteStatusItem,
  Group,
} from "@homevisit/common/src";
import { PostgRESTClient } from "./postgrestClient.js";
import { logger } from "../middleware/logger.js";
import {
  getEnrichmentConfig,
  type RequestKeys,
} from "../config/enrichmentConfig.js";
import { HttpProxyAgent } from "http-proxy-agent";
import axios from "axios";

export class EnrichmentService {
  private url: string;
  private headers: Record<string, string>;
  private requestKeys: RequestKeys;

  constructor(private postgrest: PostgRESTClient) {
    this.postgrest = postgrest;
    const config = getEnrichmentConfig();
    this.url = config.enrichmentService.url;
    this.headers = config.enrichmentService.headers;
    this.requestKeys = config.enrichmentService.requestKeys;
  }

  private buildRequest(
    siteNames: string[],
    geometries: string[],
    dateFrom: string,
    dateTo: string
  ): EnrichmentRequestBody {
    const { outerKey, dataKey, dateKey } = this.requestKeys;

    return {
      [dataKey]: { text: geometries, text_id: siteNames },
      [dateKey]: { StartTime: { From: dateFrom, To: dateTo } },
    };
  }

  private extractResponseData(
    responseBody: EnrichmentResponseBody
  ): EnrichmentSiteStatusItem[] {
    const keys = Object.keys(responseBody);
    if (keys.length === 0) {
      logger.warn("Enrichment response has no data keys");
      return [];
    }
    return responseBody[keys[0]];
  }

  private mapToEnrichedSite(
    site: Site,
    statusItem: EnrichmentSiteStatusItem | undefined
  ): EnrichedSite {
    return {
      ...site,
      updatedStatus: statusItem?.status ?? "No",
      siteLink: statusItem?.projectLink ?? "",
    };
  }

  async enrichSites(sites: Site[], group: Group): Promise<EnrichedSite[]> {
    if (sites.length === 0) return [];

    const geometries: string[] = sites.map((s) => s.geometry);
    const siteNames: string[] = sites.map((s) => s.site_name);

    // Date range based on group's data_refreshments setting
    const dateTo = new Date().toISOString();
    const dateFrom = new Date(
      Date.now() - group.data_refreshments
    ).toISOString();
    console.log("Enrichment date range:", dateFrom, "to", dateTo);
    const request = this.buildRequest(siteNames, geometries, dateFrom, dateTo);

    try {
      const response = await axios.post<EnrichmentResponseBody>(
        this.url,
        request,
        {
          headers: this.headers,
          proxy: false,
          // httpAgent: new HttpProxyAgent("http://127.0.0.1:8888"),
        }
      );
      console.log("Enrichment response data:", response.data);
      const statusItems = this.extractResponseData(response.data);

      // Map response items to sites by siteName
      const statusMap = new Map(
        statusItems.map((item) => [item.siteName, item])
      );

      return sites.map((site) =>
        this.mapToEnrichedSite(site, statusMap.get(site.site_name))
      );
    } catch (error) {
      logger.error("Failed to enrich sites from external service", error);
      // Return sites with default "No" status on error
      return sites.map((site) => this.mapToEnrichedSite(site, undefined));
    }
  }
}
