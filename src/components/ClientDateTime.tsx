"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { arSA } from "date-fns/locale";

export default function ClientDateTime({ date, formatStr = "EEEE، d MMMM - hh:mm a" }: { date: string | Date, formatStr?: string }) {
  const [formatted, setFormatted] = useState("");

  useEffect(() => {
    setFormatted(format(new Date(date), formatStr, { locale: arSA }));
  }, [date, formatStr]);

  if (!formatted) {
    return <span className="opacity-0">Loading...</span>; // Prevent layout shift as much as possible
  }

  return <>{formatted}</>;
}
