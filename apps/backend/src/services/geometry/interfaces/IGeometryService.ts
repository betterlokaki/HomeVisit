/**
 * Service for geometry conversions between formats
 */
export interface IGeometryService {
  toWKT(geojson: any): string;
  fromWKT(wkt: string): any;
}
