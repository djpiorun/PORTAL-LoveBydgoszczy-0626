"use node";
import { action } from "./_generated/server";
import { v } from "convex/values";

export const get = action({
  args: { lat: v.optional(v.number()), lon: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const lat = args.lat ?? 53.1235; // Bydgoszcz
    const lon = args.lon ?? 18.0076;
    
    try {
      const [weatherRes, aqiRes] = await Promise.all([
        fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=Europe%2FWarsaw`),
        fetch(`https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=european_aqi,pm10,pm2_5&timezone=Europe%2FWarsaw`)
      ]);
      
      const weatherData = await weatherRes.json();
      const aqiData = await aqiRes.json();
      
      return { weather: weatherData, aqi: aqiData };
    } catch (e) {
      console.error(e);
      return null;
    }
  }
});