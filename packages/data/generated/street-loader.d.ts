export interface BuiltStreet {
  code: number;
  nameHe: string;
  aliases: string[];
}

export declare function loadStreetsForCity(cityCode: number): Promise<BuiltStreet[]>;
export declare function getAvailableCityCodes(): number[];
