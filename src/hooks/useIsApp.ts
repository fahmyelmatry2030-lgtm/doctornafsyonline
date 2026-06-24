"use client";

import { useState, useEffect } from "react";

export function useIsApp() {
  const [isApp, setIsApp] = useState(false);

  useEffect(() => {
    // Check if running as a standalone PWA or inside a Webview (like Capacitor)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isIOSStandalone = ('standalone' in window.navigator) && (window.navigator as any).standalone;
    const isCapacitor = (window as any).Capacitor !== undefined;
    
    // Also check URL parameters just in case (e.g., ?source=pwa)
    const urlParams = new URLSearchParams(window.location.search);
    const isAppMode = urlParams.get('mode') === 'app';

    if (isStandalone || isIOSStandalone || isCapacitor || isAppMode) {
      setIsApp(true);
    }
  }, []);

  return isApp;
}
