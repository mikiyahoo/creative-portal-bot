"use client";

import { useEffect, useState } from "react";

interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
}

interface TelegramWebApp {
  ready: () => void;
  expand: () => void;
  close: () => void;
  MainButton: {
    show: () => void;
    hide: () => void;
    setText: (text: string) => void;
    onClick: (callback: () => void) => void;
    offClick: (callback: () => void) => void;
    enable: () => void;
    disable: () => void;
  };
  BackButton: {
    show: () => void;
    hide: () => void;
    onClick: (callback: () => void) => void;
    offClick: (callback: () => void) => void;
  };
  HapticFeedback: {
    impactOccurred: (style: "light" | "medium" | "heavy") => void;
    notificationOccurred: (type: "success" | "error" | "warning") => void;
  };
  themeParams: Record<string, string>;
  initDataUnsafe: {
    user?: TelegramUser;
    hash?: string;
    [key: string]: unknown;
  };
}

declare global {
  interface Window {
    Telegram?: {
      WebApp: TelegramWebApp;
    };
  }
}

interface UseTelegramReturn {
  tg: TelegramWebApp | null;
  user: TelegramUser | null;
  onClose: () => void;
  onToggleButton: (show: boolean, text?: string, onClick?: () => void) => void;
  isReady: boolean;
}

export function useTelegram(): UseTelegramReturn {
  const [tg, setTg] = useState<TelegramWebApp | null>(null);
  const [user, setUser] = useState<TelegramUser | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && window.Telegram?.WebApp) {
      const webApp = window.Telegram.WebApp;
      
      webApp.ready();
      webApp.expand();
      
      setTg(webApp);
      setUser(webApp.initDataUnsafe.user || null);
      setIsReady(true);
    }
  }, []);

  const onClose = () => {
    if (tg) {
      tg.close();
    }
  };

  const onToggleButton = (show: boolean, text?: string, onClick?: () => void) => {
    if (!tg) return;

    if (show) {
      if (text) {
        tg.MainButton.setText(text);
      }
      tg.MainButton.show();
      if (onClick) {
        tg.MainButton.onClick(onClick);
      }
    } else {
      tg.MainButton.hide();
    }
  };

  return { tg, user, onClose, onToggleButton, isReady };
}