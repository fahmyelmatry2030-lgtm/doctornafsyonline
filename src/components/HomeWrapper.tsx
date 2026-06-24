"use client";

import { useEffect, useState } from "react";
import { useIsApp } from "@/hooks/useIsApp";

export function HomeWrapper({ 
  websiteHome, 
  appHome 
}: { 
  websiteHome: React.ReactNode, 
  appHome: React.ReactNode 
}) {
  const [mounted, setMounted] = useState(false);
  const isApp = useIsApp();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <>{websiteHome}</>;

  return isApp ? <>{appHome}</> : <>{websiteHome}</>;
}
