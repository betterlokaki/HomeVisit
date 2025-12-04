import type {
  EnrichedSite,
  Site,
  EnrichmentRequestBody,
  EnrichmentResponseBody,
  EnrichmentSiteStatusItem,
  Group,
} from "@homevisit/common";
import type { IPostgRESTClient } from "../interfaces/IPostgRESTClient.ts";
import { logger } from "../middleware/logger.ts";
import {
  getEnrichmentConfig,
  type RequestKeys,
} from "../config/enrichmentConfig.ts";
import axios from "axios";

export class EnrichmentService {
  private url: string;
  private headers: Record<string, string>;
  private requestKeys: RequestKeys;

  constructor(private postgrest: IPostgRESTClient) {
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
    const { dataKey, dateKey } = this.requestKeys;
    return {
      [dataKey]: { text: geometries, text_id: siteNames },
      [dateKey]: { StartTime: { From: dateFrom, To: dateTo } },
    };
  }

  private extractResponseData(
    responseBody: EnrichmentResponseBody
  ): EnrichmentSiteStatusItem[] {
    const keys = Object.keys(responseBody);
    return keys.length === 0 ? [] : responseBody[keys[0]];
  }

  private mapToEnrichedSite(
    site: Site,
    statusItem?: EnrichmentSiteStatusItem
  ): EnrichedSite {
    return {
      ...site,
      updatedStatus: statusItem?.status ?? "No",
      siteLink: statusItem?.projectLink ?? "",
    };
  }

  async enrichSites(sites: Site[], group: Group): Promise<EnrichedSite[]> {
    if (sites.length === 0) return [];

    const geometries = sites.map((s) => s.geometry);
    const siteNames = sites.map((s) => s.site_name);
    const dateTo = new Date().toISOString();
    const dateFrom = new Date(
      Date.now() - group.data_refreshments
    ).toISOString();

    try {
      const response = await axios.post<EnrichmentResponseBody>(
        this.url,
        this.buildRequest(siteNames, geometries, dateFrom, dateTo),
        {
          headers: this.headers,
          proxy: false,
        }
      );
      const statusItems = this.extractResponseData(response.data);
      const statusMap = new Map(
        statusItems.map((item) => [item.siteName, item])
      );
      return sites.map((site) =>
        this.mapToEnrichedSite(site, statusMap.get(site.site_name))
      );
    } catch (error) {
      logger.error("Failed to enrich sites from external service", error);
      return sites.map((site) => this.mapToEnrichedSite(site, undefined));
    }
  }
}
