/**
 * Cover Update Service configuration
 */

export interface CoverUpdateRequestKeys {
  geometryOuterKey: string;
  geometryInnerKey: string;
  secondsOuterKey: string;
  secondsInnerKey: string;
}

export interface CoverUpdateServiceConfig {
  url: string;
  headers: Record<string, string>;
  responseKey: string;
  requestKeys: CoverUpdateRequestKeys;
}
