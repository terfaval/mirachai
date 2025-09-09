"use client";
import "../styles/globals.css";
import { useEffect } from "react";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const updateBackground = () => {
      const hour = new Date().getHours();
      let suffix = "";
      if (hour >= 5 && hour < 8) {
        suffix = "dawn";
      } else if (hour >= 8 && hour < 11) {
        suffix = "morning";
      } else if (hour >= 11 && hour < 14) {
        suffix = "noon";
      } else if (hour >= 14 && hour < 17) {
        suffix = "afternoon";
      } else if (hour >= 17 && hour < 20) {
        suffix = "evening";
      } else {
        suffix = "night";
      }
      const url = `url('/background_${suffix}.png')`;
      const targets = [document.documentElement, document.body];
      targets.forEach((el) => {
        el.style.backgroundImage = url;
      });
    };
    updateBackground();
    const interval = setInterval(updateBackground, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}