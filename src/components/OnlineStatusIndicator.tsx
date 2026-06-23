"use client";

import { useState, useEffect } from "react";

export function OnlineStatusIndicator({
  isOnline,
  size = 12,
  showLabel = true,
}: {
  isOnline: boolean;
  size?: number;
  showLabel?: boolean;
}) {
  const [isAnimating, setIsAnimating] = useState(isOnline);

  useEffect(() => {
    setIsAnimating(isOnline);
  }, [isOnline]);

  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <div
          className={`w-${size} h-${size} rounded-full ${
            isOnline ? "bg-green-500" : "bg-gray-400"
          } ${isOnline && isAnimating ? "animate-pulse" : ""}`}
          style={{
            width: `${size}px`,
            height: `${size}px`,
          }}
        />
        {isOnline && (
          <div
            className="absolute inset-0 rounded-full bg-green-500 animate-ping"
            style={{
              width: `${size}px`,
              height: `${size}px`,
              opacity: 0.75,
            }}
          />
        )}
      </div>
      {showLabel && (
        <span className={`text-sm font-semibold ${
          isOnline ? "text-green-600" : "text-gray-600"
        }`}>
          {isOnline ? "🟢 متاح الآن" : "🔴 غير متاح"}
        </span>
      )}
    </div>
  );
}

export function OnlineToggleButton({
  isOnline,
  onChange,
  disabled = false,
}: {
  isOnline: boolean;
  onChange: (status: boolean) => void;
  disabled?: boolean;
}) {
  const [isLoading, setIsLoading] = useState(false);

  const handleToggle = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/specialist/online-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isOnline: !isOnline }),
      });

      if (response.ok) {
        onChange(!isOnline);
      }
    } catch (error) {
      console.error("Error toggling online status:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={disabled || isLoading}
      className={`px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 ${
        isOnline
          ? "bg-green-100 text-green-700 hover:bg-green-200"
          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
      } ${disabled || isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      {isLoading ? "جاري التحديث..." : isOnline ? "🟢 أنت متاح" : "🔴 أنت غير متاح"}
    </button>
  );
}
