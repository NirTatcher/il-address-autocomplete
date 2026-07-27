export interface City {
  code: number;
  nameHe: string;
  nameEn: string | null;
  regionCode: number;
  regionName: string;
}

export interface Street {
  code: number;
  nameHe: string;
  aliases: string[];
}

export interface SearchOptions {
  limit?: number;
  minQueryLength?: number;
}

export interface DataManifest {
  sources: {
    cities: {
      resourceId: string;
      lastModified: string;
      recordCount: number;
    };
    streets: {
      resourceId: string;
      lastModified: string;
      recordCount: number;
    };
  };
  built: {
    cityCount: number;
    uniqueStreetCount: number;
    rawStreetRecordCount: number;
    streetCountByCity: Record<string, number>;
    generatedAt: string;
  };
}

export interface AddressSelection {
  city: City;
  street: Street;
}
