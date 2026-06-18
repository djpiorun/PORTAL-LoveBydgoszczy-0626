const BYDGOSZCZ_COORDS = {
  lat: 53.1235,
  lon: 18.0076,
};

export type WeatherPayload = {
  weather: {
    current: {
      temperature_2m: number;
      relative_humidity_2m: number;
      apparent_temperature: number;
      is_day: number;
      weather_code: number;
      wind_speed_10m: number;
      surface_pressure: number;
    };
    daily: {
      time: string[];
      weather_code: number[];
      temperature_2m_max: number[];
      temperature_2m_min: number[];
    };
  };
  aqi?: {
    current?: {
      european_aqi?: number;
    };
  };
};

export type WeatherSummary = {
  city: string;
  temp: number;
  condition: string;
  icon: string;
  isDay: boolean;
  aqi: number;
};

export type WeatherDetails = WeatherSummary & {
  feelsLike: number;
  humidity: number;
  wind: number;
  pressure: number;
  forecast: Array<{
    day: string;
    date: string;
    icon: string;
    high: number;
    low: number;
  }>;
};

export async function fetchBydgoszczWeather(): Promise<WeatherPayload | null> {
  const { lat, lon } = BYDGOSZCZ_COORDS;
  const [weatherRes, aqiRes] = await Promise.all([
    fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m,surface_pressure&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=Europe%2FWarsaw`,
    ),
    fetch(
      `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=european_aqi,pm10,pm2_5&timezone=Europe%2FWarsaw`,
    ),
  ]);

  if (!weatherRes.ok || !aqiRes.ok) {
    throw new Error("Weather service unavailable");
  }

  const weather = await weatherRes.json();
  const aqi = await aqiRes.json();
  return { weather, aqi };
}

function mapWeatherCode(code: number, isDay: boolean) {
  if (code <= 1) {
    return {
      icon: "sunny",
      condition: isDay ? "Slonecznie" : "Bezchmurnie",
    };
  }

  if (code <= 3) {
    return {
      icon: "partly-cloudy",
      condition: "Czesciowe zachmurzenie",
    };
  }

  if (code >= 51 && code <= 67) {
    return {
      icon: "rainy",
      condition: "Deszczowo",
    };
  }

  if (code >= 71) {
    return {
      icon: "rainy",
      condition: "Snieg",
    };
  }

  return {
    icon: "cloudy",
    condition: "Pochmurno",
  };
}

function mapForecastIcon(code: number) {
  if (code <= 1) return "sunny";
  if (code >= 51) return "rainy";
  return "cloudy";
}

export function toWeatherSummary(data: WeatherPayload): WeatherSummary | null {
  const current = data.weather?.current;
  if (!current) return null;

  const isDay = current.is_day === 1;
  const mapped = mapWeatherCode(current.weather_code, isDay);

  return {
    city: "Bydgoszcz",
    temp: Math.round(current.temperature_2m),
    condition: mapped.condition,
    icon: mapped.icon,
    isDay,
    aqi: data.aqi?.current?.european_aqi || 0,
  };
}

export function toWeatherDetails(data: WeatherPayload): WeatherDetails | null {
  const summary = toWeatherSummary(data);
  const current = data.weather?.current;
  const daily = data.weather?.daily;
  if (!summary || !current || !daily) return null;

  const days = ["Ndz", "Pon", "Wt", "Sr", "Cz", "Pt", "Sob"];
  const forecast = daily.time.slice(1, 7).map((time, i) => {
    const date = new Date(time);
    return {
      day: days[date.getDay()],
      date: date.toLocaleDateString("pl-PL", { day: "numeric", month: "short" }),
      icon: mapForecastIcon(daily.weather_code[i + 1]),
      high: Math.round(daily.temperature_2m_max[i + 1]),
      low: Math.round(daily.temperature_2m_min[i + 1]),
    };
  });

  return {
    ...summary,
    feelsLike: Math.round(current.apparent_temperature),
    humidity: current.relative_humidity_2m,
    wind: Math.round(current.wind_speed_10m),
    pressure: current.surface_pressure,
    forecast,
  };
}
