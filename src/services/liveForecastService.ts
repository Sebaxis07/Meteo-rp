export interface HourlyForecastPoint {
  time: string; // ISO string e.g. "2026-08-16T14:00"
  hourLabel: string; // e.g. "14:00"
  dateLabel: string; // e.g. "Dom 16 Ago"
  tempCelsius: number;
  precipProbability: number; // % (0 - 100)
  precipMm: number; // mm
  rainMm: number;
  snowfallCm: number;
  windSpeedKmH: number;
  isotermaZeroMeters: number;
  hasRainRisk: boolean;
  hasSnowRisk: boolean;
  conditionLabel: string;
}

export interface SectorHourlyForecast {
  sectorId: string;
  sectorName: string;
  hourlyPoints: HourlyForecastPoint[];
  dailySummary: {
    dateIso: string;
    dayLabel: string;
    maxTemp: number;
    minTemp: number;
    maxPrecipProb: number;
    totalPrecipMm: number;
    willRain: boolean;
    willSnow: boolean;
    rainHoursCount: number;
  }[];
}

export async function fetchSectorHourlyForecast(
  sectorId: string,
  lat: number,
  lng: number,
  sectorAltitudeMeters: number,
  sectorName: string
): Promise<SectorHourlyForecast> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&hourly=temperature_2m,precipitation_probability,precipitation,rain,snowfall,wind_speed_10m,freezing_level_height&timezone=America%2FSantiago`;

  try {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Open-Meteo forecast HTTP error ${res.status}`);
    }
    const data = await res.json();
    const hourly = data.hourly;

    if (!hourly || !hourly.time) {
      throw new Error('Invalid hourly forecast format');
    }

    const points: HourlyForecastPoint[] = hourly.time.map((timeStr: string, idx: number) => {
      const dateObj = new Date(timeStr);
      const hourLabel = dateObj.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });
      const dateLabel = dateObj.toLocaleDateString('es-CL', { weekday: 'short', day: 'numeric', month: 'short' });

      const tempCelsius = Math.round((hourly.temperature_2m[idx] || 0) * 10) / 10;
      const precipProbability = hourly.precipitation_probability ? hourly.precipitation_probability[idx] || 0 : 0;
      const precipMm = Math.round((hourly.precipitation[idx] || 0) * 10) / 10;
      const rainMm = Math.round((hourly.rain ? hourly.rain[idx] || 0 : 0) * 10) / 10;
      const snowfallCm = Math.round((hourly.snowfall ? hourly.snowfall[idx] || 0 : 0) * 10) / 10;
      const windSpeedKmH = Math.round(hourly.wind_speed_10m[idx] || 0);
      const isotermaZeroMeters = Math.round(hourly.freezing_level_height ? hourly.freezing_level_height[idx] || 2800 : 2800);

      const hasSnowRisk = (sectorAltitudeMeters >= isotermaZeroMeters || snowfallCm > 0) && (precipMm > 0 || precipProbability >= 30);
      const hasRainRisk = precipMm > 0 || precipProbability >= 30;

      let conditionLabel = '☀️ Despejado';
      if (snowfallCm > 0 || (hasSnowRisk && precipMm > 0)) {
        conditionLabel = '❄️ Nevada';
      } else if (precipMm > 2) {
        conditionLabel = '🌧️ Lluvia Moderada';
      } else if (precipMm > 0 || precipProbability >= 40) {
        conditionLabel = '🌦️ Llovizna / Chubasco';
      } else if (windSpeedKmH >= 40) {
        conditionLabel = '💨 Viento Fuerte';
      } else if (tempCelsius <= 10) {
        conditionLabel = '☁️ Frío / Camanchaca';
      }

      return {
        time: timeStr,
        hourLabel,
        dateLabel,
        tempCelsius,
        precipProbability,
        precipMm,
        rainMm,
        snowfallCm,
        windSpeedKmH,
        isotermaZeroMeters,
        hasRainRisk,
        hasSnowRisk,
        conditionLabel
      };
    });

    // Group into 7-day daily summaries
    const groupedDays: { [key: string]: HourlyForecastPoint[] } = {};
    points.forEach(pt => {
      const dayKey = pt.time.split('T')[0];
      if (!groupedDays[dayKey]) groupedDays[dayKey] = [];
      groupedDays[dayKey].push(pt);
    });

    const dailySummary = Object.keys(groupedDays).map(dateIso => {
      const dayPts = groupedDays[dateIso];
      const temps = dayPts.map(p => p.tempCelsius);
      const maxTemp = Math.max(...temps);
      const minTemp = Math.min(...temps);
      const maxPrecipProb = Math.max(...dayPts.map(p => p.precipProbability));
      const totalPrecipMm = Math.round(dayPts.reduce((acc, p) => acc + p.precipMm, 0) * 10) / 10;
      const willRain = totalPrecipMm > 0 || maxPrecipProb >= 35;
      const willSnow = dayPts.some(p => p.hasSnowRisk);
      const rainHoursCount = dayPts.filter(p => p.hasRainRisk).length;

      const dateObj = new Date(dateIso + 'T12:00:00');
      const dayLabel = dateObj.toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'short' });

      return {
        dateIso,
        dayLabel: dayLabel.charAt(0).toUpperCase() + dayLabel.slice(1),
        maxTemp,
        minTemp,
        maxPrecipProb,
        totalPrecipMm,
        willRain,
        willSnow,
        rainHoursCount
      };
    });

    return {
      sectorId,
      sectorName,
      hourlyPoints: points,
      dailySummary
    };

  } catch (err) {
    console.error(`Error fetching hourly forecast for ${sectorName}:`, err);
    return {
      sectorId,
      sectorName,
      hourlyPoints: [],
      dailySummary: []
    };
  }
}
