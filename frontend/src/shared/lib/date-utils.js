import { useState, useEffect } from 'react';

/**
 * Ethiopian Calendar Month Names
 */
export const ETHIOPIAN_MONTHS = {
  en: [
    'Meskerem',
    'Tikimt',
    'Hidar',
    'Tahsas',
    'Tir',
    'Yakatit',
    'Magabit',
    'Miyazya',
    'Ginbot',
    'Sene',
    'Hamle',
    'Nehase',
    'Pagume',
  ],
  am: [
    'መስከረም',
    'ጥቅምት',
    'ኅዳር',
    'ታኅሣሥ',
    'ጥር',
    'የካቲት',
    'መጋቢት',
    'ሚያዝያ',
    'ግንቦት',
    'ሰኔ',
    'ሐምሌ',
    'ነሐሴ',
    'ጳጉሜ',
  ],
  om: [
    'Fulbaana',
    'Onkololeessa',
    'Sadaasa',
    'Muddee',
    'Amajjii',
    'Guraandhala',
    'Bitootessa',
    'Ebla',
    'Caamsaa',
    'Waxabajjii',
    'Adooleessa',
    'Hagayya',
    'Qaammee',
  ],
};

export const TIME_ZONE_OPTIONS = [
  {
    tz: 'Africa/Addis_Ababa',
    label: 'Ethiopia — Africa/Addis_Ababa',
    abbr: 'EAT (UTC+3)',
    city: 'Addis Ababa',
  },
  {
    tz: 'Africa/Nairobi',
    label: 'Kenya — Africa/Nairobi',
    abbr: 'EAT (UTC+3)',
    city: 'Nairobi',
  },
  {
    tz: 'Africa/Cairo',
    label: 'Egypt — Africa/Cairo',
    abbr: 'EET (UTC+2)',
    city: 'Cairo',
  },
  {
    tz: 'Asia/Riyadh',
    label: 'Saudi Arabia — Asia/Riyadh',
    abbr: 'AST (UTC+3)',
    city: 'Riyadh',
  },
  {
    tz: 'Asia/Dubai',
    label: 'United Arab Emirates — Asia/Dubai',
    abbr: 'GST (UTC+4)',
    city: 'Dubai',
  },
  {
    tz: 'Europe/London',
    label: 'United Kingdom — Europe/London',
    abbr: 'GMT/BST',
    city: 'London',
  },
  {
    tz: 'America/New_York',
    label: 'United States — America/New_York',
    abbr: 'EST/EDT',
    city: 'New York',
  },
  {
    tz: 'UTC',
    label: 'UTC — Coordinated Universal Time',
    abbr: 'UTC (UTC+0)',
    city: 'UTC',
  },
];

/**
 * Convert Gregorian (year, month 1-12, day 1-31) to Julian Day Number (JDN)
 */
export function gregorianToJdn(year, month, day) {
  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;
  return (
    day +
    Math.floor((153 * m + 2) / 5) +
    365 * y +
    Math.floor(y / 4) -
    Math.floor(y / 100) +
    Math.floor(y / 400) -
    32045
  );
}

/**
 * Convert Julian Day Number (JDN) to Ethiopian date { year, month: 1-13, day: 1-30 }
 */
export function jdnToEthiopian(jdn) {
  const r = (jdn - 1723856) % 1461;
  const n = (r % 365) + 365 * Math.floor(r / 1460);
  const ethYear =
    4 * Math.floor((jdn - 1723856) / 1461) +
    Math.floor(r / 365) -
    Math.floor(r / 1460);
  const ethMonth = Math.floor(n / 30) + 1;
  const ethDay = (n % 30) + 1;
  return { year: ethYear, month: ethMonth, day: ethDay };
}

/**
 * Convert Ethiopian date (year, month: 1-13, day: 1-30) to Julian Day Number (JDN)
 */
export function ethiopianToJdn(year, month, day) {
  return (
    1723856 +
    365 * year +
    Math.floor(year / 4) +
    30 * (month - 1) +
    day -
    1
  );
}

/**
 * Convert Julian Day Number (JDN) to Gregorian date { year, month: 1-12, day: 1-31 }
 */
export function jdnToGregorian(jdn) {
  const a = jdn + 32044;
  const b = Math.floor((4 * a + 3) / 146097);
  const c = a - Math.floor((146097 * b) / 4);
  const d = Math.floor((4 * c + 3) / 1461);
  const e = c - Math.floor((1461 * d) / 4);
  const m = Math.floor((5 * e + 2) / 153);
  const day = e - Math.floor((153 * m + 2) / 5) + 1;
  const month = m + 3 - 12 * Math.floor(m / 10);
  const year = 100 * b + d - 4800 + Math.floor(m / 10);
  return { year, month, day };
}

/**
 * Convert Ethiopian date to Gregorian date object { year, month, day }
 */
export function ethiopianToGregorian(year, month, day) {
  const jdn = ethiopianToJdn(year, month, day);
  return jdnToGregorian(jdn);
}

/**
 * Convert Gregorian date to Ethiopian calendar representation
 */
export function gregorianToEthiopian(dateInput) {
  if (!dateInput) return null;

  let y, m, d;
  if (typeof dateInput === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateInput.trim())) {
    const parts = dateInput.trim().split('-');
    y = parseInt(parts[0], 10);
    m = parseInt(parts[1], 10);
    d = parseInt(parts[2], 10);
  } else {
    const dateObj = dateInput instanceof Date ? dateInput : new Date(dateInput);
    if (isNaN(dateObj.getTime())) return null;
    y = dateObj.getFullYear();
    m = dateObj.getMonth() + 1;
    d = dateObj.getDate();
  }

  const jdn = gregorianToJdn(y, m, d);
  return jdnToEthiopian(jdn);
}

/**
 * Helper to check if a timezone is an Ethiopian timezone
 */
export function isEthiopianTimeZone(tz) {
  if (!tz) return true;
  return tz.includes('Addis_Ababa') || tz.toLowerCase().includes('ethiopia');
}

/**
 * Read active system preferences from localStorage
 */
export function getStoredPreferences() {
  const dateFormat = localStorage.getItem('pharmacy_date_format') || 'DD/MM/YYYY';
  const timeZone = localStorage.getItem('pharmacy_timezone') || 'Africa/Addis_Ababa';
  const isEthTz = isEthiopianTimeZone(timeZone);

  // Time-zone selection based:
  // If timeZone is Ethiopia (Africa/Addis_Ababa) -> 'ethiopian' (E.C.), otherwise 'gregorian'
  const explicitCalendar = localStorage.getItem('pharmacy_calendar_type');
  const calendarType = explicitCalendar || (isEthTz ? 'ethiopian' : 'gregorian');
  const language = (localStorage.getItem('pharmacy_language') || 'en').slice(0, 2);

  return { dateFormat, calendarType, timeZone, language, isEthiopianTz: isEthTz };
}

/**
 * Get date & time components in the selected time zone
 */
export function getDateParts(dateInput, timeZone = 'Africa/Addis_Ababa') {
  if (!dateInput) return null;

  // Handle pure YYYY-MM-DD date string without time
  if (typeof dateInput === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateInput.trim())) {
    const [yStr, mStr, dStr] = dateInput.trim().split('-');
    return {
      year: parseInt(yStr, 10),
      month: parseInt(mStr, 10),
      day: parseInt(dStr, 10),
      timeStr: '',
    };
  }

  const dateObj = dateInput instanceof Date ? dateInput : new Date(dateInput);
  if (isNaN(dateObj.getTime())) return null;

  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timeZone || 'Africa/Addis_Ababa',
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
    const parts = formatter.formatToParts(dateObj);
    const map = {};
    for (const p of parts) map[p.type] = p.value;

    const hour = map.hour || '12';
    const minute = map.minute || '00';
    const dayPeriod = map.dayPeriod || 'AM';

    return {
      year: parseInt(map.year, 10),
      month: parseInt(map.month, 10),
      day: parseInt(map.day, 10),
      timeStr: `${hour}:${minute} ${dayPeriod}`,
    };
  } catch {
    return {
      year: dateObj.getFullYear(),
      month: dateObj.getMonth() + 1,
      day: dateObj.getDate(),
      timeStr: dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
  }
}

/**
 * Formats a date string or object according to active or specified calendar, format, and timezone
 * 
 * @param {Date|string|number} dateInput - The date to format
 * @param {Object} options - Configuration overrides
 * @returns {string} Formatted date string
 */
export function formatAppDate(dateInput, options = {}) {
  if (!dateInput) return '—';

  const prefs = getStoredPreferences();
  const timeZone = options.timeZone || prefs.timeZone;
  const isEthTz = isEthiopianTimeZone(timeZone);
  const calendarType =
    options.calendarType ||
    options.calendar ||
    (options.timeZone ? (isEthTz ? 'ethiopian' : 'gregorian') : prefs.calendarType);
  const dateFormat = options.dateFormat || options.format || prefs.dateFormat;
  const language = options.language || prefs.language;

  const parts = getDateParts(dateInput, timeZone);
  if (!parts) return '—';

  let y, m, d, suffix = '';

  if (calendarType === 'ethiopian') {
    const eth = gregorianToEthiopian(`${parts.year}-${String(parts.month).padStart(2, '0')}-${String(parts.day).padStart(2, '0')}`);
    if (!eth) return '—';
    y = eth.year;
    m = eth.month;
    d = eth.day;

    if (options.showSuffix !== false) {
      if (language === 'am') {
        suffix = ' ዓ.ም';
      } else {
        suffix = ' E.C.';
      }
    }

    if (options.showMonthName) {
      const monthNames = ETHIOPIAN_MONTHS[language] || ETHIOPIAN_MONTHS.en;
      const monthName = monthNames[m - 1] || `Month ${m}`;
      if (dateFormat === 'MM/DD/YYYY') {
        return `${monthName} ${d}, ${y}${suffix}`;
      }
      return `${d} ${monthName} ${y}${suffix}`;
    }
  } else {
    // Gregorian calendar
    y = parts.year;
    m = parts.month;
    d = parts.day;

    if (options.showSuffix) {
      suffix = ' G.C.';
    }
  }

  const dd = String(d).padStart(2, '0');
  const mm = String(m).padStart(2, '0');
  const yyyy = String(y);

  if (dateFormat === 'MM/DD/YYYY') {
    return `${mm}/${dd}/${yyyy}${suffix}`;
  }
  if (dateFormat === 'YYYY-MM-DD') {
    return `${yyyy}-${mm}-${dd}${suffix}`;
  }
  // Default 'DD/MM/YYYY'
  return `${dd}/${mm}/${yyyy}${suffix}`;
}

/**
 * Formats a date AND time string or object according to active preferences
 */
export function formatAppDateTime(dateInput, options = {}) {
  if (!dateInput) return '—';

  const prefs = getStoredPreferences();
  const timeZone = options.timeZone || prefs.timeZone;

  const dateStr = formatAppDate(dateInput, options);
  if (dateStr === '—') return '—';

  const parts = getDateParts(dateInput, timeZone);
  if (!parts || !parts.timeStr) return dateStr;

  return `${dateStr}, ${parts.timeStr}`;
}

/**
 * Formats only the time portion in active timezone
 */
export function formatAppTime(dateInput, options = {}) {
  if (!dateInput) return '—';
  const prefs = getStoredPreferences();
  const timeZone = options.timeZone || prefs.timeZone;

  const parts = getDateParts(dateInput, timeZone);
  return parts?.timeStr || '—';
}

/**
 * Reactive React Hook for date/time formatting across all components.
 * Subscribes to settings query and storage changes to re-render in real time.
 */
export function useAppDate() {
  const [prefs, setPrefs] = useState(() => getStoredPreferences());

  useEffect(() => {
    const handleStorage = () => {
      setPrefs(getStoredPreferences());
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener('pharmacy_preferences_changed', handleStorage);

    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('pharmacy_preferences_changed', handleStorage);
    };
  }, []);

  const formatDate = (date, options = {}) => {
    return formatAppDate(date, {
      calendarType: prefs.calendarType,
      dateFormat: prefs.dateFormat,
      timeZone: prefs.timeZone,
      language: prefs.language,
      ...options,
    });
  };

  const formatDateTime = (date, options = {}) => {
    return formatAppDateTime(date, {
      calendarType: prefs.calendarType,
      dateFormat: prefs.dateFormat,
      timeZone: prefs.timeZone,
      language: prefs.language,
      ...options,
    });
  };

  const formatTime = (date, options = {}) => {
    return formatAppTime(date, {
      timeZone: prefs.timeZone,
      ...options,
    });
  };

  return {
    ...prefs,
    formatDate,
    formatDateTime,
    formatTime,
    getStoredPreferences,
  };
}

