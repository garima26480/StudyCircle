/**
 * StudyCircle Live Weather Sync Service
 * Connects to browser Geolocation and fetches real-time WMO parameters from Open-Meteo.
 * Supports manual drop-in OpenWeatherMap configurations as well.
 */

// WMO Weather Interpretation Codes (World Meteorological Organization standard)
const mapWmoCode = (code, cloudCover) => {
  if (code === undefined || code === null) return "clear";
  
  // Thunderstorm states
  if ([95, 96, 99].includes(code)) return "stormy";
  
  // Snow states
  if ([71, 73, 75, 77, 85, 86].includes(code)) return "snowy";
  
  // Rain / Drizzle states
  if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return "rainy";
  
  // Fog / Mist states
  if ([45, 48].includes(code)) return "foggy";
  
  // Cloud states
  if ([1, 2, 3].includes(code)) {
    if (cloudCover !== undefined && cloudCover > 70) return "overcast";
    return "partly_cloudy";
  }
  
  // Default clear / sunny
  if (code === 0) return "clear";
  
  return "clear";
};

export const fetchLiveWeather = async () => {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      console.warn("Geolocation not supported by this browser. Falling back to default weather.");
      resolve(getFallbackData());
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          
          // Querying Open-Meteo free API (No Keys Required)
          const response = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code,cloud_cover,wind_speed_10m&daily=sunrise,sunset&timezone=auto`
          );
          
          if (!response.ok) throw new Error("Open-Meteo fetch failed");
          
          const data = await response.json();
          const current = data.current || {};
          const daily = data.daily || {};
          
          // Map today's sunrise/sunset times
          const sunriseTime = daily.sunrise?.[0] ? new Date(daily.sunrise[0]) : null;
          const sunsetTime = daily.sunset?.[0] ? new Date(daily.sunset[0]) : null;

          const resolvedCondition = mapWmoCode(current.weather_code, current.cloud_cover);

          resolve({
            success: true,
            temperature: current.temperature_2m !== undefined ? Math.round(current.temperature_2m) : 22,
            condition: resolvedCondition,
            cloudCover: current.cloud_cover !== undefined ? current.cloud_cover : 0,
            windSpeed: current.wind_speed_10m !== undefined ? Math.round(current.wind_speed_10m) : 8,
            humidity: current.relative_humidity_2m !== undefined ? current.relative_humidity_2m : 50,
            sunrise: sunriseTime,
            sunset: sunsetTime,
            coords: { lat: latitude, lon: longitude }
          });
        } catch (apiError) {
          console.warn("Weather API call failed, falling back to local simulation.", apiError);
          resolve(getFallbackData());
        }
      },
      (geoError) => {
        console.log("Geolocation permission declined or unavailable, using fallbacks.", geoError);
        resolve(getFallbackData());
      },
      { timeout: 12000 }
    );
  });
};

// Standard safe fallback data representing clear, pleasant study weather
const getFallbackData = () => {
  // Mock sunrise (6 AM today) and sunset (6:30 PM today)
  const sunrise = new Date();
  sunrise.setHours(6, 0, 0, 0);
  
  const sunset = new Date();
  sunset.setHours(18, 30, 0, 0);

  return {
    success: false,
    temperature: 20,
    condition: "clear",
    cloudCover: 10,
    windSpeed: 6,
    humidity: 45,
    sunrise,
    sunset,
    coords: null
  };
};
