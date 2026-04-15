"use client";

import { useEffect } from "react";
import { useTelegram } from "@/hooks/useTelegram";

interface MainButtonProps {
  text?: string;
  onClick?: () => void;
  enabled?: boolean;
  loading?: boolean;
}

export function MainButton({
  text = "Continue",
  onClick,
  enabled = true,
  loading = false,
}: MainButtonProps) {
  const { tg } = useTelegram();

  useEffect(() => {
    if (!tg) return;

    if (enabled && onClick) {
      tg.MainButton.setText(loading ? "Loading..." : text);
      tg.MainButton.show();
      tg.MainButton.enable();
      
      const handleClick = () => {
        if (!loading && onClick) {
          tg.HapticFeedback?.impactOccurred("medium");
          onClick();
        }
      };

      tg.MainButton.onClick(handleClick);
      
      return () => {
        tg.MainButton.offClick(handleClick);
        tg.MainButton.hide();
      };
    } else {
      tg.MainButton.hide();
    }
  }, [tg, text, onClick, enabled, loading]);

  return null;
}