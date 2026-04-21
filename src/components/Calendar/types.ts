export type CalendarVariant = "default" | "time" | "range" | "multi";

export type WeekStart = 0 | 1 | 6; // Sunday = 0, Monday = 1, Saturday = 6

export type CalendarTheme = {
  primaryColor?: string;
  backgroundColor?: string;
  textColor?: string;
  selectedTextColor?: string;
  todayColor?: string;
  borderColor?: string;
  hoverColor?: string;
};

export type InputStyles = {
  className?: string;
  style?: React.CSSProperties;
  placeholder?: string;
  defaultStyles?: boolean;
};

export type CalendarIcon = {
  icon?: React.ReactNode;
  position?: "left" | "right";
  className?: string;
  style?: React.CSSProperties;
};

export type DateFormat = {
  dateStyle?: "full" | "long" | "medium" | "short";
  timeStyle?: "full" | "long" | "medium" | "short";
  weekday?: "long" | "short" | "narrow";
  year?: "numeric" | "2-digit";
  month?: "numeric" | "2-digit" | "long" | "short" | "narrow";
  day?: "numeric" | "2-digit";
  hour?: "numeric" | "2-digit";
  minute?: "numeric" | "2-digit";
  second?: "numeric" | "2-digit";
  timeZoneName?: "long" | "short";
};

export interface CalendarProps {
  variant?: CalendarVariant;
  value?: Date | Date[] | null;
  onChange?: (value: Date | Date[] | null) => void;
  minDate?: Date;
  maxDate?: Date;
  theme?: CalendarTheme;
  inputStyles?: InputStyles;
  icon?: CalendarIcon;
  format?: string | DateFormat;
  disabled?: boolean;
  readOnly?: boolean;
  clearable?: boolean;
  zIndex?: number;
  className?: string;
  style?: React.CSSProperties;
  onOpen?: () => void;
  onClose?: () => void;
  weekStart?: WeekStart;
  highlightToday?: boolean;
  highlightWeekends?: boolean;
  disabledDates?: Date[];
  enabledDates?: Date[];
  disabledDays?: number[];
  yearRange?: [number, number];
  showOtherMonths?: boolean;
  selectOtherMonths?: boolean;
  timeInterval?: number;
  timeFormat?: "12" | "24";
  showSeconds?: boolean;
  closeOnSelect?: boolean;
  allowKeyboardNavigation?: boolean;
  locale?: string;
  onMonthChange?: (date: Date) => void;
  onYearChange?: (date: Date) => void;
  onError?: (error: string) => void;
  updateOnChange?: boolean;
}
