"use client";

import { useState, useMemo } from "react";

// Bikram Sambat month names
const BS_MONTHS = [
  "बैशाख",
  "जेठ",
  "असार",
  "श्रावण",
  "भदौ",
  "आश्विन",
  "कार्तिक",
  "मंसिर",
  "पौष",
  "माघ",
  "फाल्गुन",
  "चैत्र",
];

const BS_MONTHS_EN = [
  "Baisakh",
  "Jestha",
  "Asar",
  "Shrawan",
  "Bhadra",
  "Ashwin",
  "Kartik",
  "Mangsir",
  "Poush",
  "Magh",
  "Falgun",
  "Chaitra",
];

const BS_DAYS = ["आइत", "सोम", "मंगल", "बुध", "बिहि", "शुक्र", "शनि"];

const AD_MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const NEPALI_DIGITS = ["०", "१", "२", "३", "४", "५", "६", "७", "८", "९"];

// Days in each month of BS years (2080-2090)
const BS_CALENDAR_DATA: Record<number, number[]> = {
  2080: [31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
  2081: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2082: [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
  2083: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2084: [30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
  2085: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2086: [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
  2087: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2088: [31, 31, 31, 32, 31, 31, 30, 29, 30, 29, 30, 30],
  2089: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2090: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
};

// Nepali holidays that fall on FIXED Bikram Sambat dates every year.
// Lunar festivals (Dashain, Tihar, Teej, Shivaratri, Holi, Buddha Jayanti,
// Sonam/Gyalpo Lhosar, Chhath, Janai Purnima) shift each year and are
// intentionally NOT listed here — they cannot be derived from a fixed BS day.
// Format: { [month (0-indexed)]: { [day]: string } }
const NEPAL_EVENTS: Record<number, Record<number, string>> = {
  0: {
    // Baisakh
    1: "नयाँ वर्ष (Nepali New Year)",
    18: "मजदुर दिवस (Labour Day)",
  },
  1: {
    // Jestha
    15: "गणतन्त्र दिवस (Republic Day)",
  },
  2: {
    // Asar
    15: "धान दिवस / रोपाइँ जात्रा (National Paddy Day)",
  },
  5: {
    // Ashwin
    3: "संविधान दिवस (Constitution Day)",
  },
  8: {
    // Poush
    15: "तमु ल्होसार (Tamu Lhosar)",
  },
  9: {
    // Magh
    1: "माघे संक्रान्ति (Maghe Sankranti)",
    16: "शहीद दिवस (Martyrs' Day)",
  },
  10: {
    // Falgun
    7: "प्रजातन्त्र दिवस (Democracy Day)",
  },
};

// Reference date: BS 2080/01/01 = AD 2023/04/14 (Friday = day 5)
const REF_BS_YEAR = 2080;
const REF_BS_MONTH = 0;
const REF_AD_DATE = new Date(2023, 3, 14); // April 14, 2023
const REF_DAY_OF_WEEK = 5; // Friday

function toNepaliDigits(num: number): string {
  return num
    .toString()
    .split("")
    .map((d) => NEPALI_DIGITS[parseInt(d)])
    .join("");
}

function adToBS(adDate: Date): { year: number; month: number; day: number } {
  const diffTime = adDate.getTime() - REF_AD_DATE.getTime();
  let totalDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  let bsYear = REF_BS_YEAR;
  let bsMonth = REF_BS_MONTH;
  let bsDay = 1;

  if (totalDays >= 0) {
    while (totalDays > 0) {
      const daysInMonth = BS_CALENDAR_DATA[bsYear]?.[bsMonth] || 30;
      const remainingDaysInMonth = daysInMonth - bsDay;

      if (totalDays <= remainingDaysInMonth) {
        bsDay += totalDays;
        totalDays = 0;
      } else {
        totalDays -= remainingDaysInMonth + 1;
        bsDay = 1;
        bsMonth++;
        if (bsMonth >= 12) {
          bsMonth = 0;
          bsYear++;
        }
      }
    }
  }

  return { year: bsYear, month: bsMonth, day: bsDay };
}

function bsToAD(bsYear: number, bsMonth: number, bsDay: number): Date {
  let totalDays = 0;

  let y = REF_BS_YEAR;
  let m = REF_BS_MONTH;

  while (y < bsYear || (y === bsYear && m < bsMonth)) {
    totalDays += BS_CALENDAR_DATA[y]?.[m] || 30;
    m++;
    if (m >= 12) {
      m = 0;
      y++;
    }
  }

  totalDays += bsDay - 1;

  const adDate = new Date(REF_AD_DATE);
  adDate.setDate(adDate.getDate() + totalDays);
  return adDate;
}

function getFirstDayOfMonth(bsYear: number, bsMonth: number): number {
  let totalDays = 0;

  if (bsYear > REF_BS_YEAR || (bsYear === REF_BS_YEAR && bsMonth > REF_BS_MONTH)) {
    let y = REF_BS_YEAR;
    let m = REF_BS_MONTH;

    while (y < bsYear || (y === bsYear && m < bsMonth)) {
      totalDays += BS_CALENDAR_DATA[y]?.[m] || 30;
      m++;
      if (m >= 12) {
        m = 0;
        y++;
      }
    }
  }

  return (REF_DAY_OF_WEEK + totalDays) % 7;
}

export function NepaliCalendar() {
  const today = useMemo(() => adToBS(new Date()), []);
  const [viewYear, setViewYear] = useState(today.year);
  const [viewMonth, setViewMonth] = useState(today.month);
  const [selectedDay, setSelectedDay] = useState<number | null>(today.day);

  const daysInMonth = BS_CALENDAR_DATA[viewYear]?.[viewMonth] || 30;
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);

  // Get AD date range for this BS month
  const monthStartAD = useMemo(
    () => bsToAD(viewYear, viewMonth, 1),
    [viewYear, viewMonth]
  );
  const monthEndAD = useMemo(
    () => bsToAD(viewYear, viewMonth, daysInMonth),
    [viewYear, viewMonth, daysInMonth]
  );

  // Get event for selected day
  const selectedEvent = selectedDay
    ? NEPAL_EVENTS[viewMonth]?.[selectedDay] || null
    : null;

  // Get AD date for selected day
  const selectedAD = useMemo(
    () => (selectedDay ? bsToAD(viewYear, viewMonth, selectedDay) : null),
    [viewYear, viewMonth, selectedDay]
  );

  // Get all events for current month
  const monthEvents = NEPAL_EVENTS[viewMonth] || {};
  const eventDays = Object.keys(monthEvents).map(Number);

  function prevMonth() {
    setSelectedDay(null);
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  }

  function nextMonth() {
    setSelectedDay(null);
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  }

  const isToday = (day: number) =>
    viewYear === today.year && viewMonth === today.month && day === today.day;

  // Build calendar grid
  const calendarDays: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) {
    calendarDays.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    calendarDays.push(d);
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#1d3557] to-[#457b9d] p-4">
        <div className="flex items-center justify-between">
          <button
            onClick={prevMonth}
            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/10 text-white/80"
            aria-label="Previous month"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="text-center">
            <p className="font-bold text-white text-sm">
              {BS_MONTHS[viewMonth]} {toNepaliDigits(viewYear)}
            </p>
            <p className="text-[11px] text-blue-200 mt-0.5">
              {BS_MONTHS_EN[viewMonth]} {viewYear} BS
            </p>
          </div>
          <button
            onClick={nextMonth}
            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/10 text-white/80"
            aria-label="Next month"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
        {/* English date range */}
        <p className="text-center text-[10px] text-blue-200/70 mt-1">
          {AD_MONTHS[monthStartAD.getMonth()]} {monthStartAD.getDate()}, {monthStartAD.getFullYear()} – {AD_MONTHS[monthEndAD.getMonth()]} {monthEndAD.getDate()}, {monthEndAD.getFullYear()}
        </p>
      </div>

      <div className="p-4">
        {/* Day names */}
        <div className="grid grid-cols-7 gap-0.5 mb-1">
          {BS_DAYS.map((day, i) => (
            <div
              key={day}
              className={`text-center text-[10px] font-medium py-1 ${
                i === 6 ? "text-red-500" : "text-gray-400"
              }`}
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-0.5">
          {calendarDays.map((day, index) => {
            const hasEvent = day !== null && eventDays.includes(day);
            const isSaturday = index % 7 === 6;
            const isTodayDay = day !== null && isToday(day);
            const isSelected = day !== null && day === selectedDay;

            return (
              <button
                key={index}
                onClick={() => day !== null && setSelectedDay(day)}
                disabled={day === null}
                className={`aspect-square flex flex-col items-center justify-center rounded-lg text-xs relative ${
                  day === null
                    ? ""
                    : isTodayDay
                    ? "bg-gradient-to-br from-[#e63946] to-[#c1121f] text-white font-bold shadow-sm"
                    : isSelected
                    ? "bg-[#457b9d]/10 border border-[#457b9d]/30 text-[#1d3557] font-bold"
                    : isSaturday
                    ? "text-red-500 font-medium hover:bg-red-50"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                {day !== null && (
                  <>
                    <span>{toNepaliDigits(day)}</span>
                    {hasEvent && !isTodayDay && (
                      <span className="absolute bottom-0.5 w-1 h-1 bg-[#e63946] rounded-full"></span>
                    )}
                  </>
                )}
              </button>
            );
          })}
        </div>

        {/* Selected day info */}
        {selectedDay && selectedAD && (
          <div className="mt-4 pt-3 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-900">
                  {toNepaliDigits(selectedDay)} {BS_MONTHS[viewMonth]} {toNepaliDigits(viewYear)}
                </p>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  {AD_MONTHS[selectedAD.getMonth()]} {selectedAD.getDate()}, {selectedAD.getFullYear()} AD
                </p>
              </div>
              <span className="text-[10px] text-gray-400">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][selectedAD.getDay()]}
              </span>
            </div>

            {/* Event for selected day */}
            {selectedEvent && (
              <div className="mt-2 p-2.5 bg-red-50/80 border border-red-100 rounded-lg">
                <div className="flex items-start space-x-2">
                  <span className="text-sm">🎉</span>
                  <p className="text-xs font-medium text-red-800 leading-relaxed">
                    {selectedEvent}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Upcoming events this month */}
        {eventDays.length > 0 && (
          <div className="mt-4 pt-3 border-t border-gray-100">
            <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Fixed-date holidays
            </p>
            <div className="space-y-1.5 max-h-32 overflow-y-auto">
              {eventDays.map((day) => (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={`w-full text-left flex items-center space-x-2 py-1.5 px-2 rounded-md text-xs hover:bg-gray-50 ${
                    day === selectedDay ? "bg-gray-50" : ""
                  }`}
                >
                  <span className="text-[#e63946] font-bold min-w-[20px]">
                    {toNepaliDigits(day)}
                  </span>
                  <span className="text-gray-600 truncate">
                    {monthEvents[day]}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
