import React, { useEffect, useState, useMemo, useRef } from "react";
import { motion, useMotionValue, useSpring, useScroll, useTransform } from "framer-motion";
import { gsap } from "gsap";
import { fetchLiveWeather } from "../services/weather";
import "./DynamicSkyBackground.css";

export default function DynamicSkyBackground() {
  // Persistence Keys: store custom vibe preferences
  const [timeMode, setTimeMode] = useState(() => localStorage.getItem("sc_sky_time_mode") || "auto");
  const [weatherMode, setWeatherMode] = useState(() => localStorage.getItem("sc_sky_weather_mode") || "auto");
  const [backdropMode, setBackdropMode] = useState(() => localStorage.getItem("sc_sky_backdrop_mode") || "meadow");

  // Dynamic Meteorological States
  const [currentHour, setCurrentHour] = useState(() => new Date().getHours());
  const [liveWeather, setLiveWeather] = useState({
    condition: "clear",
    temperature: 22,
    windSpeed: 8,
    humidity: 50,
    sunrise: null,
    sunset: null
  });
  
  const [isWidgetOpen, setIsWidgetOpen] = useState(false);
  const [lightningActive, setLightningActive] = useState(false);

  // GSAP Interpolated Color Grading State
  const [grading, setGrading] = useState({ bright: 1, sat: 1.05, contrast: 1 });
  const gradingRef = useRef({ bright: 1, sat: 1.05, contrast: 1 });

  // Sync state changes with localStorage
  useEffect(() => {
    localStorage.setItem("sc_sky_time_mode", timeMode);
  }, [timeMode]);

  useEffect(() => {
    localStorage.setItem("sc_sky_weather_mode", weatherMode);
  }, [weatherMode]);

  useEffect(() => {
    localStorage.setItem("sc_sky_backdrop_mode", backdropMode);
  }, [backdropMode]);

  // Keep hour updated automatically
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentHour(new Date().getHours());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // Fetch real-time local weather automatically
  useEffect(() => {
    if (weatherMode !== "auto") return;

    let active = true;
    const syncWeather = async () => {
      const weatherData = await fetchLiveWeather();
      if (active) {
        setLiveWeather(weatherData);
      }
    };

    syncWeather();
    
    // Poll weather every 10 minutes to stay responsive to atmospheric changes
    const polling = setInterval(syncWeather, 600000);
    return () => {
      active = false;
      clearInterval(polling);
    };
  }, [weatherMode]);

  // Resolve active time of day (dawn, day, dusk, night)
  const resolvedTime = useMemo(() => {
    if (timeMode !== "auto") return timeMode;
    
    // If live API weather has mapped sunrise/sunset, use them!
    const now = new Date();
    if (liveWeather.sunrise && liveWeather.sunset) {
      const sunrise = liveWeather.sunrise;
      const sunset = liveWeather.sunset;
      
      const dawnStart = new Date(sunrise.getTime() - 45 * 60000); // 45m before sunrise
      const dayStart = new Date(sunrise.getTime() + 45 * 60000);  // 45m after sunrise
      const duskStart = new Date(sunset.getTime() - 45 * 60000);  // 45m before sunset
      const nightStart = new Date(sunset.getTime() + 45 * 60000); // 45m after sunset

      if (now >= dawnStart && now < dayStart) return "dawn";
      if (now >= dayStart && now < duskStart) return "day";
      if (now >= duskStart && now < nightStart) return "dusk";
      return "night";
    }

    // Standard hourly backup
    const h = currentHour;
    if (h >= 5 && h < 7) return "dawn";
    if (h >= 7 && h < 17) return "day";
    if (h >= 17 && h < 19) return "dusk";
    return "night";
  }, [timeMode, currentHour, liveWeather.sunrise, liveWeather.sunset]);

  // Resolve active weather mode
  const resolvedWeather = useMemo(() => {
    if (weatherMode !== "auto") return weatherMode;
    return liveWeather.condition;
  }, [weatherMode, liveWeather.condition]);

  // GSAP Weather Transition Morph (smoothly interpolates photographic color-grading)
  useEffect(() => {
    const target = { bright: 1.0, sat: 1.05, contrast: 1.0 };
    
    if (resolvedWeather === "partly_cloudy") {
      target.bright = 0.92; target.sat = 0.95; target.contrast = 0.98;
    } else if (resolvedWeather === "overcast") {
      target.bright = 0.82; target.sat = 0.8; target.contrast = 0.95;
    } else if (resolvedWeather === "rainy" || resolvedWeather === "stormy") {
      target.bright = 0.6; target.sat = 0.62; target.contrast = 0.88;
    } else if (resolvedWeather === "foggy") {
      target.bright = 0.72; target.sat = 0.68; target.contrast = 0.82;
    } else if (resolvedWeather === "snowy") {
      target.bright = 0.88; target.sat = 0.72; target.contrast = 0.95;
    }

    // Night scales down brightness naturally
    if (resolvedTime === "night") {
      target.bright *= 0.45;
      target.sat *= 0.8;
    } else if (resolvedTime === "dawn" || resolvedTime === "dusk") {
      target.bright *= 0.82;
    }

    gsap.killTweensOf(gradingRef.current);
    gsap.to(gradingRef.current, {
      bright: target.bright,
      sat: target.sat,
      contrast: target.contrast,
      duration: 2.8,
      ease: "power2.out",
      onUpdate: () => {
        setGrading({
          bright: gradingRef.current.bright,
          sat: gradingRef.current.sat,
          contrast: gradingRef.current.contrast
        });
      }
    });
  }, [resolvedWeather, resolvedTime]);

  // ==========================================================================
  // FRAMER MOTION PARALLAX SYSTEM SETUP
  // ==========================================================================
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Spring physics parameters for fluid, haptic 2.5D tilting
  const springOptions = { stiffness: 60, damping: 24, mass: 0.7 };
  const smoothX = useSpring(mouseX, springOptions);
  const smoothY = useSpring(mouseY, springOptions);

  // Layer Translations based on mouse coordinates
  const skyTranslateX = useTransform(smoothX, [-0.5, 0.5], ["-6px", "6px"]);
  const skyTranslateY = useTransform(smoothY, [-0.5, 0.5], ["-4px", "4px"]);

  const mountainTranslateX = useTransform(smoothX, [-0.5, 0.5], ["-16px", "16px"]);
  const mountainTranslateY = useTransform(smoothY, [-0.5, 0.5], ["-10px", "10px"]);

  const forestTranslateX = useTransform(smoothX, [-0.5, 0.5], ["-30px", "30px"]);
  const forestTranslateY = useTransform(smoothY, [-0.5, 0.5], ["-20px", "20px"]);

  const meadowTranslateX = useTransform(smoothX, [-0.5, 0.5], ["-45px", "45px"]);
  const meadowTranslateY = useTransform(smoothY, [-0.5, 0.5], ["-28px", "28px"]);

  // Scroll depth focus scaling (simulates camera zoom on page scrolls)
  const { scrollY } = useScroll();
  const skyScale = useTransform(scrollY, [0, 900], [1.02, 1.06]);
  const mountainScale = useTransform(scrollY, [0, 900], [1.02, 1.10]);
  const forestScale = useTransform(scrollY, [0, 900], [1.02, 1.18]);
  const meadowScale = useTransform(scrollY, [0, 900], [1.02, 1.25]);

  const mountainBlur = useTransform(scrollY, [0, 500], ["blur(0px)", "blur(2.5px)"]);
  const forestBlur = useTransform(scrollY, [0, 500], ["blur(0px)", "blur(1.2px)"]);

  // Track Desktop mouse coordinates
  useEffect(() => {
    const handleMouseMove = (e) => {
      const xNorm = (e.clientX / window.innerWidth) - 0.5;
      const yNorm = (e.clientY / window.innerHeight) - 0.5;
      mouseX.set(xNorm);
      mouseY.set(yNorm);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  // Track Mobile Gyroscope tilt perspective
  useEffect(() => {
    const handleOrientation = (e) => {
      const { beta, gamma } = e; // beta: -180 to 180 (front/back), gamma: -90 to 90 (left/right)
      if (beta !== null && gamma !== null) {
        const xNorm = Math.min(Math.max(gamma / 26, -0.5), 0.5);
        const yNorm = Math.min(Math.max((beta - 42) / 26, -0.5), 0.5); // Offset by 42deg phone hold
        mouseX.set(xNorm);
        mouseY.set(yNorm);
      }
    };

    window.addEventListener("deviceorientation", handleOrientation);
    return () => window.removeEventListener("deviceorientation", handleOrientation);
  }, [mouseX, mouseY]);

  // ==========================================================================
  // METEOROLOGICAL PARTICLES GENERATION (Stars, Pollen, Fireflies, Mist, Clouds)
  // ==========================================================================

  // Twinkle Starfield
  const starsList = useMemo(() => {
    const list = [];
    for (let i = 0; i < 40; i++) {
      list.push({
        id: i,
        top: `${Math.random() * 60}%`,
        left: `${Math.random() * 100}%`,
        size: `${1 + Math.random() * 2.5}px`,
        duration: `${2 + Math.random() * 4}s`,
        delay: `${Math.random() * 4}s`
      });
    }
    return list;
  }, []);

  // Floating Pollen Particles (Day Clear feature)
  const pollenList = useMemo(() => {
    const list = [];
    for (let i = 0; i < 22; i++) {
      list.push({
        id: i,
        left: `${Math.random() * 100}%`,
        duration: `${6 + Math.random() * 6}s`,
        delay: `${Math.random() * 6}s`,
        size: `${2 + Math.random() * 4}px`,
        driftX: `${40 + Math.random() * 80}px`,
        maxOpacity: 0.4 + Math.random() * 0.4
      });
    }
    return list;
  }, []);

  // Twinkling Fireflies (Night feature)
  const fireflyList = useMemo(() => {
    const list = [];
    for (let i = 0; i < 15; i++) {
      list.push({
        id: i,
        left: `${15 + Math.random() * 70}%`,
        duration: `${9 + Math.random() * 6}s`,
        delay: `${Math.random() * 8}s`,
        size: `${3 + Math.random() * 4}px`,
        driftX: `${100 + Math.random() * 120}px`,
        driftY: `${20 + Math.random() * 40}vh`,
        driftX2: `${180 + Math.random() * 100}px`,
        driftY2: `${5 + Math.random() * 25}vh`
      });
    }
    return list;
  }, []);

  // Drifting Clouds
  const cloudList = useMemo(() => {
    const list = [];
    for (let i = 0; i < 6; i++) {
      list.push({
        id: i,
        top: `${8 + Math.random() * 32}%`,
        duration: `${45 + Math.random() * 70}s`,
        delay: `${-Math.random() * 60}s`,
        scale: 0.65 + Math.random() * 0.85,
        width: `${160 + Math.random() * 220}px`,
        height: `${65 + Math.random() * 55}px`
      });
    }
    return list;
  }, []);

  // Drifting Foggy Valley Mist
  const mistList = useMemo(() => {
    const list = [];
    for (let i = 0; i < 4; i++) {
      list.push({
        id: i,
        top: `${42 + Math.random() * 25}%`, // Renders in tree forest valleys
        left: `${-10 + Math.random() * 30}%`,
        duration: `${30 + Math.random() * 25}s`,
        delay: `${-Math.random() * 30}s`,
        width: `${300 + Math.random() * 350}px`,
        height: `${80 + Math.random() * 60}px`,
        driftY: `${15 + Math.random() * 35}px`
      });
    }
    return list;
  }, []);

  // Rain Drops List
  const rainList = useMemo(() => {
    const list = [];
    for (let i = 0; i < 65; i++) {
      list.push({
        id: i,
        left: `${Math.random() * 100}%`,
        duration: `${0.6 + Math.random() * 0.4}s`,
        delay: `${Math.random() * 1.5}s`
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
        drift: `${-30 + Math.random() * 60}px`
      });
    }
    return list;
  }, []);

  // Lightning Storm Flashes
  useEffect(() => {
    if (resolvedWeather !== "stormy") return;

    let active = true;
    const triggerLightning = () => {
      if (!active) return;
      setLightningActive(true);
      setTimeout(() => {
        if (active) setLightningActive(false);
      }, 500);

      const nextTime = 6000 + Math.random() * 12000;
      setTimeout(triggerLightning, nextTime);
    };

    const firstStrike = setTimeout(triggerLightning, 4000);
    return () => {
      active = false;
      clearTimeout(firstStrike);
    };
  }, [resolvedWeather]);

  // Compile full layer filters dynamically based on GSAP grading updates
  const activeFilters = useMemo(() => {
    return `brightness(${grading.bright}) saturate(${grading.sat}) contrast(${grading.contrast})`;
  }, [grading]);

  return (
    <>
      <div className={`sky-background-root sky-${resolvedTime} weather-${resolvedWeather} mode-${backdropMode}`}>
        
        {/* ==========================================================================
           2.5D PARALLAX ENVIRONMENT LAYERS
           ========================================================================== */}

        {/* LAYER 1: SKY & STARFIELD BACKDROP */}
        <motion.div 
          className="parallax-layer layer-sky"
          style={{
            x: skyTranslateX,
            y: skyTranslateY,
            scale: skyScale
          }}
        >
          {/* Night Twilight Twinkling Starfield */}
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
                  "--star-delay": star.delay
                }}
              />
            ))}
          </div>

          {/* Meteorological Parallax Clouds */}
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
                  animationDelay: cloud.delay
                }}
              />
            ))}
          </div>
        </motion.div>

        {/* LAYER 2: MAJESTIC MOUNTAINS */}
        <motion.div 
          className="parallax-layer layer-mountains"
          style={{
            x: mountainTranslateX,
            y: mountainTranslateY,
            scale: mountainScale,
            filter: mountainBlur,
            backgroundImage: `url(${process.env.PUBLIC_URL + "/scenic_backdrop.png"})`
          }}
        >
          {/* Double-mount filter overlay for daylight adjustments */}
          <div className="sky-scenic-layer" style={{ filter: activeFilters }} />
          <div className="sky-scenic-blend" />
        </motion.div>

        {/* LAYER 3: VALLEYS, FOREST HILLS & MIST */}
        <motion.div 
          className="parallax-layer layer-forests"
          style={{
            x: forestTranslateX,
            y: forestTranslateY,
            scale: forestScale,
            filter: forestBlur
          }}
        >
          {/* Drifting Low Valley Mist (rendered in intermediate depths) */}
          <div className="sky-mist-container">
            {mistList.map((mist) => (
              <div
                key={mist.id}
                className="mist-cloud"
                style={{
                  top: mist.top,
                  left: mist.left,
                  width: mist.width,
                  height: mist.height,
                  "--mist-duration": mist.duration,
                  "--mist-delay": mist.delay,
                  "--mist-drift-y": mist.driftY
                }}
              />
            ))}
          </div>
        </motion.div>

        {/* LAYER 4: MEADOW FOREGROUND, WIND SWAYS & WEATHER PARTICLES */}
        <motion.div 
          className="parallax-layer layer-meadow"
          style={{
            x: meadowTranslateX,
            y: meadowTranslateY,
            scale: meadowScale
          }}
        >
          {/* Floating Pollen Particles (Daylight clear features) */}
          <div className="sky-pollen-container">
            {pollenList.map((pollen) => (
              <div
                key={pollen.id}
                className="pollen-particle"
                style={{
                  left: pollen.left,
                  width: pollen.size,
                  height: pollen.size,
                  "--pollen-duration": pollen.duration,
                  "--pollen-delay": pollen.delay,
                  "--pollen-drift-x": pollen.driftX,
                  "--pollen-max-opacity": pollen.maxOpacity
                }}
              />
            ))}
          </div>

          {/* Twinkling Fireflies (Midnight feature) */}
          <div className="sky-firefly-container">
            {fireflyList.map((fly) => (
              <div
                key={fly.id}
                className="firefly-particle"
                style={{
                  left: fly.left,
                  width: fly.size,
                  height: fly.size,
                  "--firefly-duration": fly.duration,
                  "--firefly-delay": fly.delay,
                  "--firefly-drift-x": fly.driftX,
                  "--firefly-drift-y": fly.driftY,
                  "--firefly-drift-x2": fly.driftX2,
                  "--firefly-drift-y2": fly.driftY2
                }}
              />
            ))}
          </div>

          {/* Falling Rain drops */}
          {resolvedWeather === "rainy" && (
            <div className="sky-rain-container">
              {rainList.map((drop) => (
                <div
                  key={drop.id}
                  className="rain-drop"
                  style={{
                    left: drop.left,
                    "--rain-duration": drop.duration,
                    "--rain-delay": drop.delay
                  }}
                />
              ))}
            </div>
          )}

          {/* Falling Snow flakes */}
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
                    "--drift-offset": flake.drift
                  }}
                />
              ))}
            </div>
          )}

          {/* Swaying Foreground Meadow Daisies */}
          <div className="scenic-flower-container">
            {/* Daisy 1 */}
            <svg className="scenic-flower" viewBox="0 0 24 40" style={{ "--sway-duration": "4.5s", "--sway-delay": "-1.2s" }}>
              <path d="M12,40 C10,29 13,19 12,12" fill="none" stroke="#4d7c0f" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M12,28 C6,27 7,22 12,24" fill="#4d7c0f" />
              <path d="M12,18 C18,17 17,13 12,15" fill="#4d7c0f" />
              <g transform="translate(12,12)">
                <circle cx="0" cy="-6" r="3" fill="#ffffff" />
                <circle cx="0" cy="6" r="3" fill="#ffffff" />
                <circle cx="-6" cy="0" r="3" fill="#ffffff" />
                <circle cx="6" cy="0" r="3" fill="#ffffff" />
                <circle cx="-4" cy="-4" r="3" fill="#ffffff" />
                <circle cx="4" cy="4" r="3" fill="#ffffff" />
                <circle cx="4" cy="-4" r="3" fill="#ffffff" />
                <circle cx="-4" cy="4" r="3" fill="#ffffff" />
                <circle cx="0" cy="0" r="3.5" fill="#eab308" />
              </g>
            </svg>
            {/* Daisy 2 */}
            <svg className="scenic-flower" viewBox="0 0 24 40" style={{ "--sway-duration": "5.5s", "--sway-delay": "0s" }}>
              <path d="M12,40 C14,30 11,20 12,12" fill="none" stroke="#4d7c0f" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M12,30 C17,29 16,24 12,26" fill="#4d7c0f" />
              <path d="M12,20 C6,19 7,14 12,16" fill="#4d7c0f" />
              <g transform="translate(12,12)">
                <circle cx="0" cy="-6" r="3" fill="#ffffff" />
                <circle cx="0" cy="6" r="3" fill="#ffffff" />
                <circle cx="-6" cy="0" r="3" fill="#ffffff" />
                <circle cx="6" cy="0" r="3" fill="#ffffff" />
                <circle cx="-4" cy="-4" r="3" fill="#ffffff" />
                <circle cx="4" cy="4" r="3" fill="#ffffff" />
                <circle cx="4" cy="-4" r="3" fill="#ffffff" />
                <circle cx="-4" cy="4" r="3" fill="#ffffff" />
                <circle cx="0" cy="0" r="3.5" fill="#eab308" />
              </g>
            </svg>
            {/* Daisy 3 */}
            <svg className="scenic-flower" viewBox="0 0 24 40" style={{ "--sway-duration": "5s", "--sway-delay": "-2.5s" }}>
              <path d="M12,40 C11,29 13,19 12,12" fill="none" stroke="#4d7c0f" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M12,26 C6,25 7,20 12,22" fill="#4d7c0f" />
              <path d="M12,16 C18,15 17,11 12,13" fill="#4d7c0f" />
              <g transform="translate(12,12)">
                <circle cx="0" cy="-6" r="3" fill="#ffffff" />
                <circle cx="0" cy="6" r="3" fill="#ffffff" />
                <circle cx="-6" cy="0" r="3" fill="#ffffff" />
                <circle cx="6" cy="0" r="3" fill="#ffffff" />
                <circle cx="-4" cy="-4" r="3" fill="#ffffff" />
                <circle cx="4" cy="4" r="3" fill="#ffffff" />
                <circle cx="4" cy="-4" r="3" fill="#ffffff" />
                <circle cx="-4" cy="4" r="3" fill="#ffffff" />
                <circle cx="0" cy="0" r="3.5" fill="#eab308" />
              </g>
            </svg>
            {/* Daisy 4 */}
            <svg className="scenic-flower" viewBox="0 0 24 40" style={{ "--sway-duration": "4.2s", "--sway-delay": "-0.7s" }}>
              <path d="M12,40 C13,28 11,18 12,12" fill="none" stroke="#4d7c0f" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M12,28 C17,27 16,22 12,24" fill="#4d7c0f" />
              <path d="M12,18 C6,17 7,12 12,14" fill="#4d7c0f" />
              <g transform="translate(12,12)">
                <circle cx="0" cy="-6" r="3" fill="#ffffff" />
                <circle cx="0" cy="6" r="3" fill="#ffffff" />
                <circle cx="-6" cy="0" r="3" fill="#ffffff" />
                <circle cx="6" cy="0" r="3" fill="#ffffff" />
                <circle cx="-4" cy="-4" r="3" fill="#ffffff" />
                <circle cx="4" cy="4" r="3" fill="#ffffff" />
                <circle cx="4" cy="-4" r="3" fill="#ffffff" />
                <circle cx="-4" cy="4" r="3" fill="#ffffff" />
                <circle cx="0" cy="0" r="3.5" fill="#eab308" />
              </g>
            </svg>
          </div>
        </motion.div>

        {/* Storm Lightning strike flashes */}
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

          {/* Aesthetic Depth selection */}
          <div className="vibe-group">
            <span className="vibe-label">Aesthetic Depth</span>
            <div className="vibe-buttons vibe-buttons-three">
              <button
                className={`vibe-btn ${backdropMode === "meadow" ? "active" : ""}`}
                onClick={() => setBackdropMode("meadow")}
                title="Full living scenic alpine landscape with swaying wildflowers"
              >
                🌲 Meadow
              </button>
              <button
                className={`vibe-btn ${backdropMode === "sky" ? "active" : ""}`}
                onClick={() => setBackdropMode("sky")}
                title="Atmospheric dynamic celestial sky gradients and particles"
              >
                🌌 Ambient
              </button>
              <button
                className={`vibe-btn ${backdropMode === "solid" ? "active" : ""}`}
                onClick={() => setBackdropMode("solid")}
                title="Clean solid minimalist background matching theme"
              >
                🖤 Minimal
              </button>
            </div>
          </div>

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
                className={`vibe-btn ${weatherMode === "partly_cloudy" ? "active" : ""}`}
                onClick={() => setWeatherMode("partly_cloudy")}
              >
                ⛅ Clouds
              </button>
              <button
                className={`vibe-btn ${weatherMode === "overcast" ? "active" : ""}`}
                onClick={() => setWeatherMode("overcast")}
              >
                ☁️ Overcast
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
              >
                ⛈️ Storm
              </button>
              <button
                className={`vibe-btn ${weatherMode === "foggy" ? "active" : ""}`}
                onClick={() => setWeatherMode("foggy")}
                style={{ gridColumn: "span 2" }}
              >
                🌫️ Fog
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
