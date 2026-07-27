export interface CkanResourceShowResult {
  id: string;
  last_modified: string;
  metadata_modified: string;
  size: number;
  state: string;
  Frequency?: string;
}

export interface CkanDatastoreSearchResult<T> {
  total: number;
  records: T[];
  _links?: {
    next?: string;
  };
}

export interface RawCityRecord {
  _id: number;
  city_code: number;
  city_name_he: string;
  city_name_en: string;
  region_code: number;
  region_name: string;
  PIBA_bureau_code: number;
  PIBA_bureau_name: string;
  Regional_Council_code: number;
  Regional_Council_name: string | null;
}

export interface RawStreetRecord {
  _id: number;
  region_code: number;
  region_name: string;
  city_code: number;
  city_name: string;
  street_code: string;
  street_name: string;
  street_name_status: string;
  official_code: number;
}

export interface BuiltCity {
  code: number;
  nameHe: string;
  nameEn: string | null;
  regionCode: number;
  regionName: string;
}

export interface BuiltStreet {
  code: number;
  nameHe: string;
  aliases: string[];
}

export interface DataManifest {
  sources: {
    cities: SourceMeta;
    streets: SourceMeta;
  };
  built: {
    cityCount: number;
    uniqueStreetCount: number;
    rawStreetRecordCount: number;
    streetCountByCity: Record<string, number>;
    generatedAt: string;
  };
}

export interface SourceMeta {
  resourceId: string;
  lastModified: string;
  recordCount: number;
}
