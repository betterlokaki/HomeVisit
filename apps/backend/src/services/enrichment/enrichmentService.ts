import type {
  EnrichedSite,
  Site,
  EnrichmentResponseBody,
  EnrichmentSiteStatusItem,
  Group,
} from "@homevisit/common";
import type { IEnrichmentService } from "./interfaces/IEnrichmentService.ts";
import {
  buildEnrichmentRequest,
  createStatusMap,
  getEnrichmentServiceConfig,
} from "./enrichmentRequestBuilder.ts";
import axios from "axios";

export class EnrichmentService implements IEnrichmentService {
  private url: string;
  private headers: Record<string, string>;
  private requestKeys: { dataKey: string; dateKey: string };

  constructor() {
    const config = getEnrichmentServiceConfig();
    this.url = config.url;
    this.headers = config.headers;
    this.requestKeys = config.requestKeys;
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

    const requestBody = buildEnrichmentRequest(
      siteNames,
      geometries,
      dateFrom,
      dateTo,
      this.requestKeys
    );
    const response = await axios.post<EnrichmentResponseBody>(
      this.url,
      requestBody,
      { headers: this.headers, proxy: false }
    );
    const statusItems = this.extractResponseData(response.data);
    const statusMap = createStatusMap(statusItems);
    return sites.map((site) =>
      this.mapToEnrichedSite(site, statusMap.get(site.site_name))
    );
  }
}
