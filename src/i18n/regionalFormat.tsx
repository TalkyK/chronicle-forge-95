import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useLocale } from "@/i18n/locale";

export type DateFormatId = "br" | "us" | "iso";
export type TimeZoneId = "sp" | "manaus" | "noronha" | "utc";

export type RegionalFormatSettings = {
  dateFormat: DateFormatId;
  timeZone: TimeZoneId;
  currency: "BRL";
};

export const DEFAULT_REGIONAL_FORMAT: RegionalFormatSettings = {
  dateFormat: "br",
  timeZone: "sp",
  currency: "BRL",
};

const STORAGE_KEY = "chronicleForge.regionalFormat.v1";

const timeZoneById: Record<TimeZoneId, string> = {
  sp: "America/Sao_Paulo",
  manaus: "America/Manaus",
  noronha: "America/Noronha",
  utc: "UTC",
};

type RegionalFormatContextValue = {
  settings: RegionalFormatSettings;
  setSettings: (next: RegionalFormatSettings) => void;
  reset: () => void;
  getIanaTimeZone: () => string;
  formatDate: (value: Date | string | number) => string;
  formatTime: (value: Date | string | number) => string;
  formatCurrency: (value: number) => string;
};

const RegionalFormatContext = createContext<RegionalFormatContextValue | null>(null);

const parseStoredSettings = (raw: string | null): Partial<RegionalFormatSettings> => {
  if (!raw) return {};
  try {
    const obj = JSON.parse(raw) as Partial<RegionalFormatSettings> | null;
    if (!obj || typeof obj !== "object") return {};

    const next: Partial<RegionalFormatSettings> = {};

    if (obj.dateFormat === "br" || obj.dateFormat === "us" || obj.dateFormat === "iso") {
      next.dateFormat = obj.dateFormat;
    }

    if (obj.timeZone === "sp" || obj.timeZone === "manaus" || obj.timeZone === "noronha" || obj.timeZone === "utc") {
      next.timeZone = obj.timeZone;
    }

    // Mantém fixo por enquanto (não existe UI para isso)
    next.currency = "BRL";

    return next;
  } catch {
    return {};
  }
};

const toParts = (value: Date | string | number, timeZone: string) => {
  const date = value instanceof Date ? value : new Date(value);

  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const parts = formatter.formatToParts(date);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";

  return {
    year: get("year"),
    month: get("month"),
    day: get("day"),
    hour: get("hour"),
    minute: get("minute"),
  };
};

export const RegionalFormatProvider = ({ children }: { children: React.ReactNode }) => {
  const { locale } = useLocale();

  const [settings, setSettings] = useState<RegionalFormatSettings>(() => {
    const stored = parseStoredSettings(window.localStorage.getItem(STORAGE_KEY));
    return {
      ...DEFAULT_REGIONAL_FORMAT,
      ...stored,
      currency: "BRL",
    };
  });

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  const getIanaTimeZone = () => timeZoneById[settings.timeZone];

  const value = useMemo<RegionalFormatContextValue>(() => {
    const formatDate = (input: Date | string | number) => {
      const { year, month, day } = toParts(input, timeZoneById[settings.timeZone]);
      if (settings.dateFormat === "iso") return `${year}-${month}-${day}`;
      if (settings.dateFormat === "us") return `${month}/${day}/${year}`;
      return `${day}/${month}/${year}`;
    };

    const formatTime = (input: Date | string | number) => {
      const { hour, minute } = toParts(input, timeZoneById[settings.timeZone]);
      return `${hour}:${minute}`;
    };

    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat(locale, {
        style: "currency",
        currency: settings.currency,
      }).format(amount);
    };

    return {
      settings,
      setSettings,
      reset: () => setSettings(DEFAULT_REGIONAL_FORMAT),
      getIanaTimeZone,
      formatDate,
      formatTime,
      formatCurrency,
    };
  }, [locale, settings]);

  return <RegionalFormatContext.Provider value={value}>{children}</RegionalFormatContext.Provider>;
};

export const useRegionalFormat = () => {
  const ctx = useContext(RegionalFormatContext);
  if (!ctx) throw new Error("useRegionalFormat must be used within RegionalFormatProvider");
  return ctx;
};
