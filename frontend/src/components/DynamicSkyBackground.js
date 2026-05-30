import React, { useEffect, useState, useMemo } from "react";
import "./DynamicSkyBackground.css";

// WMO Weather Code Mapping to StudyCircle Sky Modes
const mapWmoCodeToWeather = (code) => {
  if (code === undefined || code === null) return "clear";
  if (code === 0) return "clear";
  if ([1, 2, 3, 45, 48].includes(code)) return "cloudy";
  if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return "rainy";
  if ([71, 73, 75, 77, 85, 86].includes(code)) return "snowy";
  if ([95, 96, 99].includes(code)) return "stormy";
  return "clear"; // default fallback
};

export default function DynamicSkyBackground() {
  // Persistence Keys: store custom vibe preferences
  const [timeMode, setTimeMode] = useState(() => localStorage.getItem("sc_sky_time_mode") || "auto");
  const [weatherMode, setWeatherMode] = useState(() => localStorage.getItem("sc_sky_weather_mode") || "auto");

  // Dynamic States
  const [currentHour, setCurrentHour] = useState(() => new Date().getHours());
  const [autoWeather, setAutoWeather] = useState("clear");
  const [isWidgetOpen, setIsWidgetOpen] = useState(false);
  const [lightningActive, setLightningActive] = useState(false);

  // Sync state changes with localStorage
  useEffect(() => {
    localStorage.setItem("sc_sky_time_mode", timeMode);
  }, [timeMode]);

  useEffect(() => {
    localStorage.setItem("sc_sky_weather_mode", weatherMode);
  }, [weatherMode]);

  // Keep hour updated automatically
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentHour(new Date().getHours());
    }, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  // Fetch real-time local weather automatically
  useEffect(() => {
    if (weatherMode !== "auto") return;

    let active = true;
    const fetchWeather = async (lat, lon) => {
      try {
        const response = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=weather_code`
        );
        if (!response.ok) throw new Error("Weather API failed");
        const data = await response.json();
        const code = data.current?.weather_code;
        if (active) {
          setAutoWeather(mapWmoCodeToWeather(code));
        }
      } catch (err) {
        console.warn("Unable to fetch live weather, falling back to clear skies.", err);
      }
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          fetchWeather(position.coords.latitude, position.coords.longitude);
        },
        (error) => {
          console.log("Geolocation declined or unavailable, using clear weather fallback.");
        },
        { timeout: 10000 }
      );
    }

    return () => {
      active = false;
    };
  }, [weatherMode]);

  // Resolve active time of day
  const resolvedTime = useMemo(() => {
    if (timeMode !== "auto") return timeMode;
    const h = currentHour;
    if (h >= 5 && h < 7) return "dawn";
    if (h >= 7 && h < 17) return "day";
    if (h >= 17 && h < 19) return "dusk";
    return "night";
  }, [timeMode, currentHour]);

  // Resolve active weather mode
  const resolvedWeather = useMemo(() => {
    if (weatherMode !== "auto") return weatherMode;
    return autoWeather;
  }, [weatherMode, autoWeather]);

  // Calculate Sun and Moon Coordinates (Orbital Trajectory Math)
  const celestialCoordinates = useMemo(() => {
    // We map a coordinate based on the current active hour (0 - 23)
    let hourVal = currentHour;
    
    // If the timeMode is overridden manually, map it to a representative hour
    if (timeMode === "dawn") hourVal = 6;
    else if (timeMode === "day") hourVal = 12;
    else if (timeMode === "dusk") hourVal = 18;
    else if (timeMode === "night") hourVal = 0;

    // SUN: Visible between 6am (6) and 6pm (18)
    const isSunVisible = hourVal >= 6 && hourVal < 18;
    let sunX = 0, sunY = 0;
    if (isSunVisible) {
      const pct = (hourVal - 6) / 12; // 0 to 1
      sunX = 10 + 80 * pct; // 10% to 90% across screen
      // Parabolic Arc: high in the sky (15% from top) at noon, low at horizon (80%)
      sunY = 15 + 65 * Math.pow((sunX - 50) / 40, 2);
    }

    // MOON: Visible between 6pm (18) and 6am (6)
    const isMoonVisible = hourVal >= 18 || hourVal < 6;
    let moonX = 0, moonY = 0;
    if (isMoonVisible) {
      const adjustedHour = hourVal >= 18 ? hourVal - 18 : hourVal + 6;
      const pct = adjustedHour / 12; // 0 to 1
      moonX = 10 + 80 * pct;
      moonY = 15 + 65 * Math.pow((moonX - 50) / 40, 2);
    }

    return {
      sun: { x: sunX, y: sunY, visible: isSunVisible },
      moon: { x: moonX, y: moonY, visible: isMoonVisible },
    };
  }, [timeMode, currentHour]);

  // Twinkle Starfield Generator (memoized on mount to prevent dynamic jumping)
  const starsList = useMemo(() => {
    const list = [];
    for (let i = 0; i < 40; i++) {
      list.push({
        id: i,
        top: `${Math.random() * 65}%`, // Top part of the sky
        left: `${Math.random() * 100}%`,
        size: `${1 + Math.random() * 2}px`,
        duration: `${2 + Math.random() * 4}s`,
        delay: `${Math.random() * 4}s`,
      });
    }
    return list;
  }, []);

  // Rain Drops List
  const rainList = useMemo(() => {
    const list = [];
    for (let i = 0; i < 60; i++) {
      list.push({
        id: i,
        left: `${Math.random() * 100}%`,
        duration: `${0.6 + Math.random() * 0.4}s`,
        delay: `${Math.random() * 1.5}s`,
      });
    }
    return list;
  }, []);

  // Snow Flakes List
  const snowList = useMemo(() => {
    const list = [];
    for (let i = 0; i < 35; i++) {
      list.push({
        id: i,
        left: `${Math.random() * 100}%`,
        duration: `${4 + Math.random() * 4}s`,
        delay: `${Math.random() * 4}s`,
        size: `${3 + Math.random() * 4}px`,
        drift: `${-30 + Math.random() * 60}px`,
      });
    }
    return list;
  }, []);

  // Cloud Layers (Parallax)
  const cloudList = useMemo(() => {
    const list = [];
    for (let i = 0; i < 6; i++) {
      list.push({
        id: i,
        top: `${10 + Math.random() * 40}%`,
        duration: `${45 + Math.random() * 65}s`,
        delay: `${-Math.random() * 60}s`, // Stagger cloud placements initially
        scale: 0.6 + Math.random() * 0.8,
        width: `${150 + Math.random() * 200}px`,
        height: `${60 + Math.random() * 50}px`,
      });
    }
    return list;
  }, []);

  // Lightning Flash Generator for storm weather
  useEffect(() => {
    if (resolvedWeather !== "stormy") return;

    let active = true;
    const triggerLightning = () => {
      if (!active) return;
      setLightningActive(true);
      setTimeout(() => {
        if (active) setLightningActive(false);
      }, 500);

      // Schedule next strike between 6 to 18 seconds
      const nextTime = 6000 + Math.random() * 12000;
      setTimeout(triggerLightning, nextTime);
    };

    const firstStrike = setTimeout(triggerLightning, 4000);

    return () => {
      active = false;
      clearTimeout(firstStrike);
    };
  }, [resolvedWeather]);

  return (
    <>
      {/* GLOBAL BACKGROUND LAYER */}
      <div className={`sky-background-root sky-${resolvedTime} weather-${resolvedWeather}`}>
        {/* Night Twilight Starfield */}
        <div className="sky-starfield">
          {starsList.map((star) => (
            <div
              key={star.id}
              className="sky-star"
              style={{
                top: star.top,
                left: star.left,
                width: star.size,
                height: star.size,
                "--star-duration": star.duration,
                "--star-delay": star.delay,
              }}
            />
          ))}
        </div>

        {/* Sun Celestial Body */}
        {celestialCoordinates.sun.visible && (
          <div
            className="celestial-body celestial-sun"
            style={{
              left: `${celestialCoordinates.sun.x}%`,
              top: `${celestialCoordinates.sun.y}%`,
            }}
          />
        )}

        {/* Moon Celestial Body */}
        {celestialCoordinates.moon.visible && (
          <div
            className="celestial-body celestial-moon"
            style={{
              left: `${celestialCoordinates.moon.x}%`,
              top: `${celestialCoordinates.moon.y}%`,
            }}
          />
        )}

        {/* Cloud Overlay Layers */}
        <div className="sky-clouds-container">
          {cloudList.map((cloud) => (
            <div
              key={cloud.id}
              className="sky-cloud"
              style={{
                top: cloud.top,
                width: cloud.width,
                height: cloud.height,
                transform: `scale(${cloud.scale})`,
                "--drift-duration": cloud.duration,
                animationDelay: cloud.delay,
              }}
            />
          ))}
        </div>

        {/* Rain Layer */}
        {resolvedWeather === "rainy" && (
          <div className="sky-rain-container">
            {rainList.map((drop) => (
              <div
                key={drop.id}
                className="rain-drop"
                style={{
                  left: drop.left,
                  "--rain-duration": drop.duration,
                  "--rain-delay": drop.delay,
                }}
              />
            ))}
          </div>
        )}

        {/* Snow Layer */}
        {resolvedWeather === "snowy" && (
          <div className="sky-snow-container">
            {snowList.map((flake) => (
              <div
                key={flake.id}
                className="snow-flake"
                style={{
                  left: flake.left,
                  width: flake.size,
                  height: flake.size,
                  "--snow-duration": flake.duration,
                  "--snow-delay": flake.delay,
                  "--drift-offset": flake.drift,
                }}
              />
            ))}
          </div>
        )}

        {/* Lightning strike overlay */}
        <div className={`sky-lightning-flash ${lightningActive ? "lightning-strike" : ""}`} />
      </div>

      {/* --- FLOATING STUDY VIBE CONTROLLER TRIGGER --- */}
      <button
        className="vibe-controller-trigger"
        onClick={() => setIsWidgetOpen((prev) => !prev)}
        title="Customize Study Vibe Background"
        aria-label="Customize background"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 2v2" />
          <path d="M12 20v2" />
          <path d="m4.93 4.93 1.41 1.41" />
          <path d="m17.66 17.66 1.41 1.41" />
          <path d="M2 12h2" />
          <path d="M20 12h2" />
          <path d="m6.34 17.66-1.41 1.41" />
          <path d="m19.07 4.93-1.41 1.41" />
          <circle cx="12" cy="12" r="4" />
        </svg>
      </button>

      {/* --- STUDY VIBE SELECTOR WIDGET PANEL --- */}
      {isWidgetOpen && (
        <div className="panel vibe-card" role="dialog">
          <h3>
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
              <path d="M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" />
            </svg>
            Study Vibe Ambient
          </h3>

          {/* Time of Day selection */}
          <div className="vibe-group">
            <span className="vibe-label">Celestial Time</span>
            <div className="vibe-buttons">
              <button
                className={`vibe-btn ${timeMode === "auto" ? "active" : ""}`}
                onClick={() => setTimeMode("auto")}
              >
                Sync Real
              </button>
              <button
                className={`vibe-btn ${timeMode === "dawn" ? "active" : ""}`}
                onClick={() => setTimeMode("dawn")}
              >
                🌅 Dawn
              </button>
              <button
                className={`vibe-btn ${timeMode === "day" ? "active" : ""}`}
                onClick={() => setTimeMode("day")}
              >
                ☀️ Day
              </button>
              <button
                className={`vibe-btn ${timeMode === "dusk" ? "active" : ""}`}
                onClick={() => setTimeMode("dusk")}
              >
                🌇 Dusk
              </button>
              <button
                className={`vibe-btn ${timeMode === "night" ? "active" : ""}`}
                onClick={() => setTimeMode("night")}
                style={{ gridColumn: "span 2" }}
              >
                🌙 Midnight Stars
              </button>
            </div>
          </div>

          {/* Weather Ambiance selection */}
          <div className="vibe-group">
            <span className="vibe-label">Weather Vibe</span>
            <div className="vibe-buttons vibe-buttons-three">
              <button
                className={`vibe-btn ${weatherMode === "auto" ? "active" : ""}`}
                onClick={() => setWeatherMode("auto")}
                style={{ gridColumn: "span 3" }}
              >
                🛰️ Sync Local Weather
              </button>
              <button
                className={`vibe-btn ${weatherMode === "clear" ? "active" : ""}`}
                onClick={() => setWeatherMode("clear")}
              >
                ☀️ Clear
              </button>
              <button
                className={`vibe-btn ${weatherMode === "cloudy" ? "active" : ""}`}
                onClick={() => setWeatherMode("cloudy")}
              >
                ☁️ Mist
              </button>
              <button
                className={`vibe-btn ${weatherMode === "rainy" ? "active" : ""}`}
                onClick={() => setWeatherMode("rainy")}
              >
                🌧️ Rain
              </button>
              <button
                className={`vibe-btn ${weatherMode === "snowy" ? "active" : ""}`}
                onClick={() => setWeatherMode("snowy")}
              >
                ❄️ Snow
              </button>
              <button
                className={`vibe-btn ${weatherMode === "stormy" ? "active" : ""}`}
                onClick={() => setWeatherMode("stormy")}
                style={{ gridColumn: "span 2" }}
              >
                ⛈️ Storm
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
