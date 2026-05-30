import React, { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "./DeskClockCalendar.css";

const MOTIVATIONAL_QUOTES = [
  "Focus on progress, not perfection.",
  "Every expert was once a beginner.",
  "Your digital habits shape your future.",
  "One hour of deep focus is worth ten hours of distraction.",
  "Consistency beats intensity every single time.",
  "Do something today that your future self will thank you for.",
  "Deep focus is the superpower of the 21st century.",
  "Mistakes are proof that you are trying.",
  "Small daily improvements over time lead to stunning results.",
  "Success is the sum of small efforts repeated day in and day out.",
  "Your focus determines your reality.",
  "The secret of getting ahead is getting started."
];

const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
const DAYS = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];

export default function DeskClockCalendar() {
  // --- DIGITAL CLOCK STATE ---
  const [currentTime, setCurrentTime] = useState(new Date());
  const [is24h, setIs24h] = useState(() => {
    return localStorage.getItem("sc_clock_format_24h") === "true";
  });

  // --- DESK CALENDAR STATE ---
  const [dayOffset, setDayOffset] = useState(0);
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [wiggleRings, setWiggleRings] = useState(false);
  
  // Track falling pages to render multiple peeling actions smoothly
  const [fallingPages, setFallingPages] = useState([]);

  // Sync clock format preference
  useEffect(() => {
    localStorage.setItem("sc_clock_format_24h", is24h.toString());
  }, [is24h]);

  // Safely ticking intervals
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // --- RESOLVE TIME DIGITS ---
  const { hourDigits, minuteDigits, secondDigits, ampm } = useMemo(() => {
    let hours = currentTime.getHours();
    const minutes = currentTime.getMinutes();
    const seconds = currentTime.getSeconds();
    
    let ampmTag = "";
    if (!is24h) {
      ampmTag = hours >= 12 ? "pm" : "am";
      hours = hours % 12;
      hours = hours ? hours : 12; // 0 hour should be 12 in 12h clock
    }

    const pad = (num) => num.toString().padStart(2, "0");
    
    return {
      hourDigits: pad(hours).split(""),
      minuteDigits: pad(minutes).split(""),
      secondDigits: pad(seconds).split(""),
      ampm: ampmTag
    };
  }, [currentTime, is24h]);

  // --- RESOLVE ACTIVE CALENDAR SHEET DATE ---
  const resolvedDateDetails = useMemo(() => {
    const dateObj = new Date();
    // Offset date based on user tearing calendar sheets off
    if (dayOffset > 0) {
      dateObj.setDate(dateObj.getDate() + dayOffset);
    }
    
    return {
      monthStr: MONTHS[dateObj.getMonth()],
      dateStr: dateObj.getDate().toString(),
      dayStr: DAYS[dateObj.getDay()]
    };
  }, [dayOffset]);

  // --- TEAR OFF PAGE ACTION HANDLER ---
  const handleTearPage = () => {
    if (wiggleRings) return; // Prevent spam wiggles during active teardowns

    // 1. Trigger ring wiggles
    setWiggleRings(true);
    setTimeout(() => setWiggleRings(false), 450);

    // 2. Capture current page details for the falling sheet visual
    const newFallingPage = {
      id: Date.now(),
      monthStr: resolvedDateDetails.monthStr,
      dateStr: resolvedDateDetails.dateStr,
      dayStr: resolvedDateDetails.dayStr,
      quote: MOTIVATIONAL_QUOTES[quoteIndex]
    };

    // Append to falling stack array
    setFallingPages((prev) => [...prev, newFallingPage]);

    // 3. Update active states underneath instantly (so it appears revealed)
    setDayOffset((prev) => prev + 1);
    setQuoteIndex((prev) => (prev + 1) % MOTIVATIONAL_QUOTES.length);
  };

  // Clear older falling sheets after their exit gravity animation completes
  const handleFallingPageComplete = (id) => {
    setFallingPages((prev) => prev.filter((p) => p.id !== id));
  };

  // Sync calendar back to today
  const handleResetToToday = (e) => {
    e.stopPropagation(); // Avoid triggering another tear page click
    setDayOffset(0);
    setQuoteIndex(0);
    
    // Wiggle rings on reset sync
    setWiggleRings(true);
    setTimeout(() => setWiggleRings(false), 450);
  };

  return (
    <div className="desk-widget-container">
      
      {/* ==========================================================================
         PART A: PREMIUM DIGITAL SLIDE-CLOCK
         ========================================================================== */}
      <section className="panel desk-clock-card">
        <div className="desk-clock-header">
          <div className="desk-clock-title">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            Study Focus Clock
          </div>
          <button
            className="clock-format-btn"
            onClick={() => setIs24h((prev) => !prev)}
            title="Toggle between 12-Hour and 24-Hour display format"
          >
            {is24h ? "24H Mode" : "12H Mode"}
          </button>
        </div>

        {/* Tactile Split-Flap Clock Digit Capsules */}
        <div className="clock-digits-row">
          
          {/* HOUR TENS */}
          <div className="digit-capsule">
            <div className="clock-digit-wrapper">
              <AnimatePresence mode="popLayout">
                <motion.span
                  key={hourDigits[0]}
                  initial={{ y: "100%", opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: "-100%", opacity: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  className="clock-digit"
                >
                  {hourDigits[0]}
                </motion.span>
              </AnimatePresence>
            </div>
          </div>

          {/* HOUR ONES */}
          <div className="digit-capsule">
            <div className="clock-digit-wrapper">
              <AnimatePresence mode="popLayout">
                <motion.span
                  key={hourDigits[1]}
                  initial={{ y: "100%", opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: "-100%", opacity: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  className="clock-digit"
                >
                  {hourDigits[1]}
                </motion.span>
              </AnimatePresence>
            </div>
          </div>

          {/* COLON */}
          <span className="digit-colon">:</span>

          {/* MINUTE TENS */}
          <div className="digit-capsule">
            <div className="clock-digit-wrapper">
              <AnimatePresence mode="popLayout">
                <motion.span
                  key={minuteDigits[0]}
                  initial={{ y: "100%", opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: "-100%", opacity: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  className="clock-digit"
                >
                  {minuteDigits[0]}
                </motion.span>
              </AnimatePresence>
            </div>
          </div>

          {/* MINUTE ONES */}
          <div className="digit-capsule">
            <div className="clock-digit-wrapper">
              <AnimatePresence mode="popLayout">
                <motion.span
                  key={minuteDigits[1]}
                  initial={{ y: "100%", opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: "-100%", opacity: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  className="clock-digit"
                >
                  {minuteDigits[1]}
                </motion.span>
              </AnimatePresence>
            </div>
          </div>

          {/* COLON */}
          <span className="digit-colon">:</span>

          {/* SECOND TENS */}
          <div className="digit-capsule">
            <div className="clock-digit-wrapper">
              <AnimatePresence mode="popLayout">
                <motion.span
                  key={secondDigits[0]}
                  initial={{ y: "100%", opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: "-100%", opacity: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  className="clock-digit"
                >
                  {secondDigits[0]}
                </motion.span>
              </AnimatePresence>
            </div>
          </div>

          {/* SECOND ONES */}
          <div className="digit-capsule">
            <div className="clock-digit-wrapper">
              <AnimatePresence mode="popLayout">
                <motion.span
                  key={secondDigits[1]}
                  initial={{ y: "100%", opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: "-100%", opacity: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  className="clock-digit"
                >
                  {secondDigits[1]}
                </motion.span>
              </AnimatePresence>
            </div>
          </div>

          {/* Optional AM/PM Tag block */}
          {ampm && <span className="ampm-capsule">{ampm}</span>}
        </div>
      </section>

      {/* ==========================================================================
         PART B: PHYSICAL TEAR-OFF PAGE CALENDAR
         ========================================================================== */}
      <section className="desk-calendar-card">
        
        {/* Metal ring binder header holds pages stack */}
        <div className="calendar-binder-header">
          <motion.div
            className="binder-ring binder-ring-1"
            animate={wiggleRings ? { rotate: [0, 8, -8, 6, -4, 0], scaleY: [1, 0.94, 1.05, 1] } : {}}
            transition={{ duration: 0.42 }}
          />
          <motion.div
            className="binder-ring binder-ring-2"
            animate={wiggleRings ? { rotate: [0, -6, 8, -6, 4, 0], scaleY: [1, 0.94, 1.05, 1] } : {}}
            transition={{ duration: 0.42 }}
          />
          <motion.div
            className="binder-ring binder-ring-3"
            animate={wiggleRings ? { rotate: [0, 8, -8, 6, -4, 0], scaleY: [1, 0.94, 1.05, 1] } : {}}
            transition={{ duration: 0.42 }}
          />
        </div>

        <div className="calendar-stack-container">
          
          {/* Depth sheets stack visible underneath to simulate paper layers thickness */}
          <div className="calendar-stack-layer calendar-layer-2" />
          <div className="calendar-stack-layer calendar-layer-3" />

          {/* Falling / peeling physical paper effect overlay */}
          <AnimatePresence>
            {fallingPages.map((page) => (
              <motion.div
                key={page.id}
                className="peeling-falling-page"
                initial={{ rotate: 0, y: 0, x: 0, opacity: 1, scale: 1 }}
                animate={{
                  rotate: [0, 12, -8, -25],
                  y: [0, 15, 120, 350],
                  x: [0, -15, -45, -90],
                  opacity: [1, 1, 0.5, 0],
                  scale: [1, 0.98, 0.94, 0.9]
                }}
                transition={{ duration: 0.75, ease: "easeIn" }}
                onAnimationComplete={() => handleFallingPageComplete(page.id)}
              >
                <div className="calendar-month-band">{page.monthStr}</div>
                <div className="calendar-body-content">
                  <span className="calendar-date-number">{page.dateStr}</span>
                  <span className="calendar-day-label">{page.dayStr}</span>
                  <div className="calendar-motivation-quote">"{page.quote}"</div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Clickable Active Calendar Page Sheet */}
          <motion.div
            className="calendar-page-sheet"
            onClick={handleTearPage}
            whileTap={{ scale: 0.98, rotate: -1.2 }}
            title="Click to tear off this day page!"
          >
            <div className="perforated-tear-line" />
            
            {/* Red header Month ribbon band */}
            <div className="calendar-month-band">
              {resolvedDateDetails.monthStr}
            </div>

            {/* Inner page content */}
            <div className="calendar-body-content">
              
              <h2 className="calendar-date-number">
                {resolvedDateDetails.dateStr}
              </h2>
              
              <span className="calendar-day-label">
                {resolvedDateDetails.dayStr}
              </span>

              {/* Study motivators quote */}
              <p className="calendar-motivation-quote">
                "{MOTIVATIONAL_QUOTES[quoteIndex]}"
              </p>

              {/* Reset to Today option (only shows if ripped ahead) */}
              {dayOffset > 0 ? (
                <button
                  className="clock-format-btn"
                  onClick={handleResetToToday}
                  style={{
                    marginTop: "8px",
                    background: "rgba(244, 63, 94, 0.08)",
                    borderColor: "rgba(244, 63, 94, 0.2)",
                    color: "var(--accent)",
                    zIndex: 15
                  }}
                  title="Wiggle calendar pages back to today"
                >
                  🔄 Reset Today
                </button>
              ) : (
                <div className="calendar-tear-hint">
                  <svg
                    width="10"
                    height="10"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 5v14" />
                    <path d="m19 12-7 7-7-7" />
                  </svg>
                  Tear off Page
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </section>

    </div>
  );
}
