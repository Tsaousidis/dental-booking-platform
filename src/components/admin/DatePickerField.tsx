"use client";

import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useRef, useState } from "react";

const monthNames = [
  "Ιανουάριος",
  "Φεβρουάριος",
  "Μάρτιος",
  "Απρίλιος",
  "Μάιος",
  "Ιούνιος",
  "Ιούλιος",
  "Αύγουστος",
  "Σεπτέμβριος",
  "Οκτώβριος",
  "Νοέμβριος",
  "Δεκέμβριος",
];

const weekdayLabels = ["ΔΕ", "ΤΡ", "ΤΕ", "ΠΕ", "ΠΑ", "ΣΑ", "ΚΥ"];

export function DatePickerField({
  name,
  defaultValue = "",
  required = true,
}: {
  name: string;
  defaultValue?: string;
  required?: boolean;
}) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [value, setValue] = useState(defaultValue);
  const [visibleMonth, setVisibleMonth] = useState(() => getInitialMonth(defaultValue));
  const selectedDate = parseGreekDate(value);
  const calendarDays = useMemo(() => getCalendarDays(visibleMonth), [visibleMonth]);

  return (
    <div ref={wrapperRef} className="relative">
      <div className="flex min-h-11 items-center rounded-sm border border-line bg-background focus-within:border-accent">
        <input
          name={name}
          type="text"
          value={value}
          onChange={(event) => {
            setValue(event.target.value);
            const parsed = parseGreekDate(event.target.value);

            if (parsed) {
              setVisibleMonth(startOfMonth(parsed));
            }
          }}
          onFocus={() => setIsOpen(true)}
          required={required}
          inputMode="numeric"
          pattern="\d{2}/\d{2}/\d{4}"
          placeholder="dd/mm/yyyy"
          className="min-w-0 flex-1 bg-transparent px-3 text-base outline-none"
        />
        <button
          type="button"
          aria-label="Άνοιγμα ημερολογίου"
          onClick={() => setIsOpen((open) => !open)}
          className="flex h-10 w-10 shrink-0 items-center justify-center text-accent transition hover:bg-champagne/25"
        >
          <CalendarDays size={17} aria-hidden="true" />
        </button>
      </div>

      {isOpen ? (
        <div className="absolute left-0 top-[calc(100%+8px)] z-50 w-[min(20rem,calc(100vw-3rem))] rounded-lg border border-line bg-surface p-3 shadow-[0_18px_45px_rgba(104,92,82,0.18)]">
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              aria-label="Προηγούμενος μήνας"
              onClick={() => setVisibleMonth(addMonths(visibleMonth, -1))}
              className="flex h-9 w-9 items-center justify-center rounded-sm border border-line text-accent transition hover:bg-champagne/25"
            >
              <ChevronLeft size={17} aria-hidden="true" />
            </button>
            <p className="text-sm font-semibold">
              {monthNames[visibleMonth.getMonth()]} {visibleMonth.getFullYear()}
            </p>
            <button
              type="button"
              aria-label="Επόμενος μήνας"
              onClick={() => setVisibleMonth(addMonths(visibleMonth, 1))}
              className="flex h-9 w-9 items-center justify-center rounded-sm border border-line text-accent transition hover:bg-champagne/25"
            >
              <ChevronRight size={17} aria-hidden="true" />
            </button>
          </div>

          <div className="mt-3 grid grid-cols-7 gap-1 text-center">
            {weekdayLabels.map((day) => (
              <span key={day} className="py-2 text-[10px] font-semibold tracking-[0.12em] text-muted">
                {day}
              </span>
            ))}
            {calendarDays.map((day) => {
              const isCurrentMonth = day.date.getMonth() === visibleMonth.getMonth();
              const isSelected =
                selectedDate && toDateKey(selectedDate) === toDateKey(day.date);

              return (
                <button
                  key={toDateKey(day.date)}
                  type="button"
                  onClick={() => {
                    setValue(formatGreekDate(day.date));
                    setVisibleMonth(startOfMonth(day.date));
                    setIsOpen(false);
                  }}
                  className={`min-h-10 rounded-sm text-sm font-medium transition ${
                    isSelected
                      ? "bg-accent text-surface"
                      : isCurrentMonth
                        ? "text-foreground hover:bg-champagne/30"
                        : "text-muted/40 hover:bg-champagne/20"
                  }`}
                >
                  {day.date.getDate()}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function getInitialMonth(value: string) {
  return startOfMonth(parseGreekDate(value) ?? new Date());
}

function parseGreekDate(value: string) {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value.trim());

  if (!match) {
    return null;
  }

  const [, day, month, year] = match;
  const date = new Date(Number(year), Number(month) - 1, Number(day));

  if (
    date.getFullYear() !== Number(year) ||
    date.getMonth() !== Number(month) - 1 ||
    date.getDate() !== Number(day)
  ) {
    return null;
  }

  return date;
}

function formatGreekDate(date: Date) {
  return `${String(date.getDate()).padStart(2, "0")}/${String(date.getMonth() + 1).padStart(2, "0")}/${date.getFullYear()}`;
}

function getCalendarDays(month: Date) {
  const firstDay = startOfMonth(month);
  const mondayBasedOffset = (firstDay.getDay() + 6) % 7;
  const start = new Date(firstDay);
  start.setDate(firstDay.getDate() - mondayBasedOffset);

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);

    return { date };
  });
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function addMonths(date: Date, months: number) {
  return new Date(date.getFullYear(), date.getMonth() + months, 1);
}

function toDateKey(date: Date) {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}
