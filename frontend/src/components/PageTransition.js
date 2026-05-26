import React from "react";
import { useLocation } from "react-router-dom";

function PageTransition({ children, fallback = "fade" }) {
  const location = useLocation();
  const direction = location.state?.transition || fallback;

  return (
    <div className={`page-transition page-transition--${direction}`} key={location.key}>
      {children}
    </div>
  );
}

export default PageTransition;
