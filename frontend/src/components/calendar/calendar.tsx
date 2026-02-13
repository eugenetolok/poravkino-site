"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Calendar as HeroCalendar } from "@heroui/calendar";
import { Popover, PopoverTrigger, PopoverContent } from "@heroui/popover";
import { format, addDays, startOfDay, isEqual } from "date-fns";
import { ru } from "date-fns/locale";
import { today, getLocalTimeZone, parseDate } from "@internationalized/date";
import { I18nProvider } from "@react-aria/i18n";

import CalendarIcon from "./calendar_icon";

interface CalendarProps {
  onDateChange: (date: string) => void;
  initialDate?: string | null;
  className?: string;
}

export const Calendar = ({
  onDateChange,
  initialDate: initialDateProp,
  className,
}: CalendarProps): JSX.Element => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsRef = useRef<HTMLDivElement>(null);

  // --- Логика инициализации ---
  const getInitialStateDate = (): Date => {
    const urlDate = searchParams.get("date");
    const targetDate = urlDate || initialDateProp;

    if (targetDate) {
      const parsed = new Date(targetDate);

      if (!isNaN(parsed.getTime())) return startOfDay(parsed);
    }

    return startOfDay(new Date());
  };

  const [selectedDate, setSelectedDate] = useState<Date>(getInitialStateDate);
  const [numberOfDays, setNumberOfDays] = useState(7);
  const [dayButtonWidth, setDayButtonWidth] = useState(64);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  // --- Адаптивность по фактической ширине контейнера ---
  useEffect(() => {
    const getCalendarLayout = (
      width: number,
      measuredControlsWidth: number | null,
    ) => {
      const isSmViewport = window.innerWidth >= 640;
      const gapBetweenDays = 4;
      const containerHorizontalPadding = 12; // p-1.5 => 6px слева + 6px справа
      const fallbackControlsWidth = isSmViewport ? 96 : 84;
      const controlsWidth = measuredControlsWidth ?? fallbackControlsWidth;

      const availableForDays =
        width - containerHorizontalPadding - controlsWidth - gapBetweenDays;

      if (availableForDays <= 0) {
        return { days: 3, buttonWidth: isSmViewport ? 48 : 42 };
      }

      const targetButtonWidth = isSmViewport ? 62 : 54;
      const hardMinButtonWidth = isSmViewport ? 46 : 40;
      const maxPreferredButtonWidth = isSmViewport ? 74 : 64;
      const maxDaysCap = 21;

      const maxDaysByHardMin = Math.max(
        3,
        Math.floor(
          (availableForDays + gapBetweenDays) /
            (hardMinButtonWidth + gapBetweenDays),
        ),
      );

      let days = Math.floor(
        (availableForDays + gapBetweenDays) /
          (targetButtonWidth + gapBetweenDays),
      );

      days = Math.max(
        3,
        Math.min(maxDaysCap, Math.min(maxDaysByHardMin, days)),
      );

      let buttonWidth = Math.floor(
        (availableForDays - gapBetweenDays * (days - 1)) / days,
      );

      while (
        buttonWidth > maxPreferredButtonWidth &&
        days < maxDaysCap &&
        days < maxDaysByHardMin
      ) {
        days += 1;
        buttonWidth = Math.floor(
          (availableForDays - gapBetweenDays * (days - 1)) / days,
        );
      }

      while (buttonWidth < hardMinButtonWidth && days > 3) {
        days -= 1;
        buttonWidth = Math.floor(
          (availableForDays - gapBetweenDays * (days - 1)) / days,
        );
      }

      return {
        days,
        buttonWidth: Math.max(hardMinButtonWidth, buttonWidth),
      };
    };

    const updateByContainer = () => {
      const width = containerRef.current?.clientWidth;

      if (!width) return;

      const controlsWidth = controlsRef.current?.offsetWidth ?? null;
      const layout = getCalendarLayout(width, controlsWidth);

      setNumberOfDays((prev) => (prev === layout.days ? prev : layout.days));
      setDayButtonWidth((prev) =>
        prev === layout.buttonWidth ? prev : layout.buttonWidth,
      );
    };

    updateByContainer();
    const observer = new ResizeObserver(updateByContainer);

    if (containerRef.current) observer.observe(containerRef.current);
    if (controlsRef.current) observer.observe(controlsRef.current);

    return () => observer.disconnect();
  }, []);

  // --- Синхронизация с URL ---
  useEffect(() => {
    const urlDate = searchParams.get("date");

    if (urlDate) {
      const parsed = startOfDay(new Date(urlDate));

      if (!isEqual(parsed, selectedDate)) {
        setSelectedDate(parsed);
        onDateChange(urlDate);
      }
    }
  }, [searchParams]);

  const handleDateSelect = useCallback(
    (date: Date) => {
      const newDate = startOfDay(date);

      setSelectedDate(newDate);
      const formattedDate = format(newDate, "yyyy-MM-dd");

      onDateChange(formattedDate);
      const newUrl = `${window.location.pathname}?date=${formattedDate}`;

      navigate(newUrl);
      setIsPopoverOpen(false);
    },
    [navigate, onDateChange],
  );

  const isDateOutsideVisibleRange =
    startOfDay(selectedDate) >
      startOfDay(addDays(new Date(), numberOfDays - 1)) ||
    startOfDay(selectedDate) < startOfDay(new Date());

  // --- СТИЛИ ---

  const containerClasses =
    "flex w-full max-w-full items-center gap-2 overflow-hidden rounded-[24px] border border-[var(--glass-border-dark)] bg-[linear-gradient(145deg,var(--glass-bg-strong),var(--glass-bg))] p-1.5 text-[var(--text-primary)] shadow-[var(--glass-shadow)] ring-1 ring-[var(--glass-border)] backdrop-blur-2xl";
  const btnBase =
    "relative flex h-[72px] flex-col items-center justify-center overflow-hidden rounded-[16px] transition-all duration-300 sm:h-[80px] sm:rounded-[18px]";
  const controlsBtnBase =
    "relative flex h-[72px] w-[56px] min-w-[56px] flex-col items-center justify-center overflow-hidden rounded-[16px] transition-all duration-300 sm:h-[80px] sm:w-[64px] sm:min-w-[64px] sm:rounded-[18px]";
  const btnInactive =
    "text-[var(--text-muted)] hover:bg-[var(--glass-bg-soft)] hover:text-[var(--text-primary)]";

  const btnActive =
    "bg-gradient-to-br from-[#ff4f1f] via-[#ff7a2f] to-[#f0a640] animate-gradient-rich text-white shadow-[0_8px_20px_-6px_rgba(255,94,46,0.55)] ring-1 ring-white/20 scale-100";

  return (
    <div ref={containerRef} className={`${className} w-full min-w-0`}>
      <div className={containerClasses}>
        <div className="flex min-w-0 flex-1 gap-1 overflow-hidden">
          {Array.from({ length: numberOfDays }).map((_, index) => {
            const date = startOfDay(addDays(new Date(), index));
            const isActive = isEqual(startOfDay(selectedDate), date);

            return (
              <button
                key={format(date, "yyyy-MM-dd")}
                className={`${btnBase} ${isActive ? btnActive : btnInactive}`}
                style={{
                  width: `${dayButtonWidth}px`,
                  minWidth: `${dayButtonWidth}px`,
                }}
                onClick={() => handleDateSelect(date)}
              >
                {isActive && (
                  <div className="pointer-events-none absolute left-0 right-0 top-0 h-2/3 bg-gradient-to-b from-white/25 to-transparent" />
                )}

                <span
                  className={`type-meta z-10 mb-0.5 text-[9px] tracking-[0.1em] ${
                    isActive ? "text-orange-50" : "text-[var(--text-muted)]"
                  }`}
                >
                  {format(date, "MMM", { locale: ru }).replace(".", "")}
                </span>

                <span
                  className={`type-numeric z-10 text-2xl font-bold leading-none drop-shadow-sm ${
                    isActive ? "text-white" : "text-[var(--text-primary)]"
                  }`}
                >
                  {format(date, "dd")}
                </span>

                <span
                  className={`type-label z-10 mt-1 text-[11px] ${
                    isActive ? "text-orange-50" : "text-[var(--text-muted)]"
                  }`}
                >
                  {format(date, "EEE", { locale: ru })}
                </span>
              </button>
            );
          })}
        </div>

        <div ref={controlsRef} className="flex shrink-0 items-center gap-2">
          <div className="my-3 h-12 w-px bg-[var(--glass-border-dark)]" />

          <Popover
            isOpen={isPopoverOpen}
            placement="bottom-end"
            onOpenChange={setIsPopoverOpen}
          >
            <PopoverTrigger asChild>
              <button
                className={`${controlsBtnBase} group ${isDateOutsideVisibleRange ? btnActive : btnInactive}`}
              >
                {isDateOutsideVisibleRange && (
                  <div className="pointer-events-none absolute left-0 right-0 top-0 h-2/3 bg-gradient-to-b from-white/25 to-transparent" />
                )}

                {isDateOutsideVisibleRange ? (
                  <>
                    <span className="type-meta z-10 mb-0.5 text-[9px] tracking-[0.1em] text-orange-50">
                      {format(selectedDate, "MMM", { locale: ru }).replace(
                        ".",
                        "",
                      )}
                    </span>
                    <span className="type-numeric z-10 text-2xl font-bold leading-none text-white drop-shadow-sm">
                      {format(selectedDate, "dd")}
                    </span>
                    <CalendarIcon className="z-10 mt-1 h-3.5 w-3.5 text-orange-50" />
                  </>
                ) : (
                  <>
                    <div className="mb-1 rounded-xl bg-[var(--glass-bg-soft)] p-2 ring-1 ring-[var(--glass-border-dark)] transition-colors group-hover:bg-[var(--glass-bg-strong)]">
                      <CalendarIcon className="h-5 w-5 opacity-60 transition-opacity group-hover:opacity-100" />
                    </div>
                    <span className="type-meta text-[9px] tracking-[0.1em] text-[var(--text-muted)] opacity-75 transition-opacity group-hover:opacity-100">
                      Даты
                    </span>
                  </>
                )}
              </button>
            </PopoverTrigger>

            <PopoverContent className="w-auto overflow-hidden rounded-2xl border border-[var(--glass-border-dark)] bg-[linear-gradient(155deg,var(--glass-bg-strong)_0%,var(--surface-1)_100%)] p-0 text-[var(--text-primary)] shadow-[var(--glass-shadow)] ring-1 ring-[var(--glass-border)] backdrop-blur-xl">
              <I18nProvider locale="ru-RU">
                <HeroCalendar
                  className="bg-transparent p-2 text-[var(--text-primary)]"
                  minValue={today(getLocalTimeZone())}
                  value={parseDate(format(selectedDate, "yyyy-MM-dd"))}
                  onChange={(dateValue) => {
                    handleDateSelect(dateValue.toDate(getLocalTimeZone()));
                  }}
                />
              </I18nProvider>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  );
};
