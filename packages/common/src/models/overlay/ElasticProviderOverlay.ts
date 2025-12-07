/**
 * Elastic Provider Overlay type
 */

export type ElasticProviderOverlay = {
  classification: {
    clearence_level: string;
    publish_procedure: string;
    triangle: string;
  };
  date: Date;
  exclusive_id: {
    data_store_name: string;
    entity_id: string;
    layer_id: string;
  };
  geo: {
    wkt: string;
  };
  Link: string;
  properties_List: {
    Azimuth?: number;
    AlternateUrls?: Array<string>;
    DiggerStatus?: string;
    RegistrationQuality?: string;
    ImagingTechnique: string;
    ERIS_LEG_ID: number;
    GlobalId: string;
    Url: string;
    PUBLISHPROCEDURE: number;
    TRIANGLEID: number;
    TRIANGLE_CL: number;
    Resolution: number;
    Sensor: string;
    Source: string;
    SensorLocation: {
      wkt: string;
    };
    Leg: string;
    Sortie: string;
    approximateTransform?: string;
    ImageHeight?: number;
    ImageWidth?: number;
    HasAlgorithmicRegistration?: boolean;
  };
};
