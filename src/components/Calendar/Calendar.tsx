import React, { useState, useRef, useEffect } from "react";
import { CalendarHeader } from "./CalendarHeader";
import { CalendarGrid } from "./CalendarGrid";
import { TimePicker } from "./TimePicker";
import { CalendarProps } from "./types";
import styles from "./Calendar.module.css";
import { formatDate as utilFormatDate, isSameDate } from "./utils";

export const Calendar: React.FC<CalendarProps> = ({
  variant = "default",
  value,
  onChange,
  minDate,
  maxDate,
  theme = {},
  inputStyles = {},
  icon,
  format,
  disabled = false,
  readOnly = false,
  clearable = true,
  zIndex = 1000,
  className,
  style,
  onOpen,
  onClose,
  onMonthChange,
  onYearChange,
  yearRange,
  updateOnChange = false,
}) => {
  const today = new Date();
  const [currentDate, setCurrentDate] = useState(today);
  const [selectedDates, setSelectedDates] = useState<Date[]>(() => {
    // If value is provided, use it
    if (value) {
      return Array.isArray(value) ? value : [value];
    }

    // If no value is provided and it's not a multi-select, initialize with today's date
    if (variant !== "multi" && variant !== "range") {
      return [today];
    }

    return [];
  });
  const [hour, setHour] = useState(12);
  const [minute, setMinute] = useState(0);
  const [isAM, setIsAM] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [animateOut, setAnimateOut] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [modalStyle, setModalStyle] = useState({});

  const handleDateSelect = (date: Date) => {
    if (variant === "range") {
      if (selectedDates.length === 1) {
        const [firstDate] = selectedDates;
        const newDates =
          firstDate < date ? [firstDate, date] : [date, firstDate];
        setSelectedDates(newDates);
        if (updateOnChange) {
          onChange?.(newDates);
          hideModal();
        }
      } else {
        setSelectedDates([date]);
        if (updateOnChange) {
          onChange?.([date]);
        }
      }
    } else if (variant === "multi") {
      const isSelected = selectedDates.some((d) => isSameDate(d, date));
      let newDates;

      if (isSelected) {
        newDates = selectedDates.filter((d) => !isSameDate(d, date));
      } else {
        newDates = [...selectedDates, date];
      }

      setSelectedDates(newDates);
      if (updateOnChange) {
        onChange?.(newDates);
      }
    } else {
      setSelectedDates([date]);
      if (variant !== "time" && updateOnChange) {
        onChange?.(date);
        hideModal();
      }
    }
  };

  const handleConfirm = () => {
    if (selectedDates.length > 0) {
      if (variant === "time") {
        const date = selectedDates[0];
        date.setHours(isAM ? hour % 12 : (hour % 12) + 12);
        date.setMinutes(minute);
        onChange?.(date);
      } else if (variant === "multi") {
        onChange?.(selectedDates);
      } else if (variant === "range") {
        onChange?.(selectedDates);
      } else {
        onChange?.(selectedDates[0]);
      }
      hideModal();
    }
  };

  const formatDate = (date: Date) => {
    if (!date) return "";

    // For default variant, strip any time patterns from the format
    if (variant === "default") {
      const defaultFormat = format
        ? format.toString().replace(/[H|h|M|s|:|\s]+/g, "") || "dd/mm/yyyy"
        : "dd/mm/yyyy";
      return utilFormatDate(date, defaultFormat);
    }

    if (variant === "time") {
      return `${utilFormatDate(date, format || "dd/mm/yyyy")} ${hour
        .toString()
        .padStart(2, "0")}:${minute.toString().padStart(2, "0")} ${
        isAM ? "AM" : "PM"
      }`;
    }

    return utilFormatDate(date, format || "dd/mm/yyyy");
  };

  const getFormattedValue = () => {
    if (!selectedDates.length) return "";

    if (variant === "range" && selectedDates.length === 2) {
      return `${formatDate(selectedDates[0])} - ${formatDate(
        selectedDates[1]
      )}`;
    }

    if (variant === "multi") {
      return selectedDates.map((date) => formatDate(date)).join(", ");
    }

    return formatDate(selectedDates[0]);
  };

  const calculateModalPosition = () => {
    if (!inputRef.current) return;

    const rect = inputRef.current.getBoundingClientRect();
    const modalHeight = variant === "time" ? 380 : 340; // Base height
    const padding = 8;
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;

    // Mobile view - center the modal
    if (viewportWidth <= 768) {
      setModalStyle({
        position: "relative",
        transform: "none",
        margin: "0",
        width: "100%",
      });
      return;
    }

    // Calculate available space below and above
    const spaceBelow = viewportHeight - rect.bottom;
    const spaceAbove = rect.top;

    // Initialize position object
    let position: React.CSSProperties = {
      position: "fixed",
      width: variant === "time" ? "480px" : "260px",
      zIndex: zIndex + 1,
    };

    // Horizontal positioning
    if (rect.left + (variant === "time" ? 480 : 260) > viewportWidth) {
      position.right = `${window.innerWidth - rect.right}px`;
    } else {
      position.left = `${rect.left}px`;
    }

    // Vertical positioning
    if (spaceBelow >= modalHeight + padding || spaceBelow > spaceAbove) {
      position.top = `${rect.bottom + padding}px`;
    } else {
      position.bottom = `${window.innerHeight - rect.top + padding}px`;
    }

    setModalStyle(position);
  };

  const showModalWithPosition = () => {
    if (disabled || readOnly) return;
    calculateModalPosition();
    setShowModal(true);
    setAnimateOut(false);
    onOpen?.();
  };

  const hideModal = () => {
    setAnimateOut(true);
    setTimeout(() => {
      setShowModal(false);
      setAnimateOut(false);
      onClose?.();
    }, 200);
  };

  const handleClear = () => {
    setSelectedDates([]);
    onChange?.(null);
    hideModal();
  };

  const handleMonthChange = (date: Date) => {
    setCurrentDate(date);
    onMonthChange?.(date);
  };

  const handleYearChange = (date: Date) => {
    setCurrentDate(date);
    onYearChange?.(date);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        hideModal();
      }
    };

    if (showModal) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showModal]);

  // Listen for external value changes
  useEffect(() => {
    if (value) {
      setSelectedDates(Array.isArray(value) ? value : [value]);
    }
  }, [value]);

  // Notify parent of default value on initial render if needed
  useEffect(() => {
    // If we have a default date selected (today) and no value was provided initially
    if (selectedDates.length > 0 && !value) {
      if (variant === "multi" || variant === "range") {
        onChange?.(selectedDates);
      } else {
        onChange?.(selectedDates[0]);
      }
    }
    // We want this to run only once on mount, hence the empty dependency array
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Apply theme styles
  const themeStyles = {
    "--primary-color": theme.primaryColor || "#7e6bf5",
    "--background-color": theme.backgroundColor || "#fff",
    "--text-color": theme.textColor || "#333",
    "--selected-text-color": theme.selectedTextColor || "#fff",
    "--today-color": theme.todayColor || "#e6e6e6",
    "--border-color": theme.borderColor || "#ddd",
    "--hover-color": theme.hoverColor || "#f0f0f0",
  } as React.CSSProperties;

  const DefaultCalendarIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );

  const renderIcon = () => {
    const iconElement = icon?.icon || <DefaultCalendarIcon />;
    const position = icon?.position || "right";

    return (
      <div
        className={`${styles.icon} ${
          position === "left" ? styles.iconLeft : styles.iconRight
        } ${icon?.className || ""}`}
        style={icon?.style}
      >
        {iconElement}
      </div>
    );
  };

  return (
    <div
      className={`${styles.container} ${className || ""}`}
      style={{ ...style, ...themeStyles, position: "relative" }}
    >
      <div className={styles.inputWrapper}>
        <input
          ref={inputRef}
          className={`${styles.dateInput} ${
            inputStyles.defaultStyles !== false ? styles.defaultInput : ""
          } ${inputStyles.className || ""} ${
            icon?.position === "left" ? styles.hasLeftIcon : styles.hasRightIcon
          }`}
          style={inputStyles.style}
          value={getFormattedValue()}
          onClick={showModalWithPosition}
          readOnly
          disabled={disabled}
          placeholder={inputStyles.placeholder}
        />
        {renderIcon()}
      </div>

      {showModal && (
        <div className={styles.modalBackdrop}>
          <div
            ref={modalRef}
            className={`${styles.modalContent} ${
              animateOut ? styles.slideOut : styles.slideIn
            }`}
            style={modalStyle}
            data-variant={variant}
          >
            <CalendarHeader
              currentDate={currentDate}
              onPrev={() =>
                setCurrentDate(
                  new Date(
                    currentDate.getFullYear(),
                    currentDate.getMonth() - 1,
                    1
                  )
                )
              }
              onNext={() =>
                setCurrentDate(
                  new Date(
                    currentDate.getFullYear(),
                    currentDate.getMonth() + 1,
                    1
                  )
                )
              }
              onMonthChange={handleMonthChange}
              onYearChange={handleYearChange}
              yearRange={yearRange}
            />
            <div
              className={`${styles.contentWrapper} ${
                variant === "time" ? styles.timeLayout : ""
              }`}
            >
              <CalendarGrid
                currentDate={currentDate}
                selectedDates={selectedDates}
                onSelectDate={handleDateSelect}
                minDate={minDate}
                maxDate={maxDate}
                isRange={variant === "range"}
                isMulti={variant === "multi"}
              />
              {variant === "time" && (
                <TimePicker
                  hour={hour}
                  minute={minute}
                  isAM={isAM}
                  setHour={setHour}
                  setMinute={setMinute}
                  setIsAM={setIsAM}
                />
              )}
            </div>

            <div className={styles.actions}>
              {clearable && (
                <button onClick={handleClear} className={styles.clear}>
                  Clear
                </button>
              )}
              {(variant === "time" ||
                variant === "range" ||
                variant === "multi" ||
                !updateOnChange) && (
                <button onClick={handleConfirm} className={styles.confirm}>
                  Confirm
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
