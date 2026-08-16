export type MacroZone = 'SECTOR_NORTE' | 'SECTOR_CENTRO' | 'SECTOR_SUR' | 'CORDILLERA_REGIONAL';

export type ZoneCategory = 
  | 'COSTA_URBANA'
  | 'COSTA_URBANO'
  | 'COSTA_RURAL'
  | 'CORDILLERA_COSTA'
  | 'INTERMEDIA_ANDINA';

export type RiskLevel = 'VERDE' | 'AMARILLO' | 'NARANJO' | 'ROJO' | 'GRIS';

export interface SectorInfo {
  id: string;
  name: string;
  macroZone: MacroZone; // SECTOR_NORTE, SECTOR_CENTRO, SECTOR_SUR, CORDILLERA_REGIONAL
  unidadOficial: string; // e.g. "La Portada", "Centro", "Gran Vía", "Coloso"
  subsector: string; // e.g. "Costa Laguna", "La Chimba Alto", "Coviefi"
  tipoTerritorio: string; // e.g. "Residencial costero", "Ladera / borde cerro"
  callesHitos: string; // e.g. "La Portada, franja costera norte"
  prioridadAlerta: 'Alta' | 'Media' | 'Baja';
  estadoFuente: 'Oficial' | 'Operativo' | 'Mixto' | 'Referencial';
  category: ZoneCategory;
  lat: number;
  lng: number;
  altitudeMeters: number;
  description: string;
  isKeyFocusArea?: boolean; // Costa Laguna
  currentRisk: RiskLevel;
  snowRisk: boolean;
  eventRisk: boolean;
  riskReason: string;
  tempCelsius: number;
  windSpeedKmH: number;
  precipMmH: number;
  isotermaZeroMeters: number;
}
