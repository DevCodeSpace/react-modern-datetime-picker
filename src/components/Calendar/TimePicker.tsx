import React, { useCallback, useRef } from "react";
import styles from "./Calendar.module.css";

type Timeout = ReturnType<typeof setTimeout>;

interface Props {
  hour: number;
  minute: number;
  isAM: boolean;
  setHour: (val: number | ((h: number) => number)) => void;
  setMinute: (val: number | ((m: number) => number)) => void;
  setIsAM: (val: boolean) => void;
}

export const TimePicker: React.FC<Props> = ({
  hour,
  minute,
  isAM,
  setHour,
  setMinute,
  setIsAM,
}) => {
  const format = (val: number) => val.toString().padStart(2, "0");
  const intervalRef = useRef<Timeout | undefined>(undefined);
  const initialTimeoutRef = useRef<Timeout | undefined>(undefined);

  const startAutoIncrement = useCallback((updateFn: () => void) => {
    updateFn(); // Initial update

    // Set initial delay of 500ms before starting auto-repeat
    initialTimeoutRef.current = setTimeout(() => {
      intervalRef.current = setInterval(updateFn, 100); // Then update every 100ms
    }, 500);
  }, []);

  const stopAutoIncrement = useCallback(() => {
    if (initialTimeoutRef.current) {
      clearTimeout(initialTimeoutRef.current);
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  }, []);

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      if (initialTimeoutRef.current) {
        clearTimeout(initialTimeoutRef.current);
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return (
    <div className={styles.timePicker}>
      <div className={styles.timeSection}>
        <div className={styles.timeColumn}>
          <button
            onMouseDown={() =>
              startAutoIncrement(() => setHour((h) => (h === 12 ? 1 : h + 1)))
            }
            onMouseUp={stopAutoIncrement}
            onMouseLeave={stopAutoIncrement}
            className={styles.timeButton}
          >
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
              <path d="m18 15-6-6-6 6" />
            </svg>
          </button>
          <div className={styles.timeText}>{format(hour)}</div>
          <button
            onMouseDown={() =>
              startAutoIncrement(() => setHour((h) => (h === 1 ? 12 : h - 1)))
            }
            onMouseUp={stopAutoIncrement}
            onMouseLeave={stopAutoIncrement}
            className={styles.timeButton}
          >
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
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>
        </div>
        <div className={styles.timeSeparator}>:</div>
        <div className={styles.timeColumn}>
          <button
            onMouseDown={() =>
              startAutoIncrement(() => setMinute((m) => (m + 1) % 60))
            }
            onMouseUp={stopAutoIncrement}
            onMouseLeave={stopAutoIncrement}
            className={styles.timeButton}
          >
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
              <path d="m18 15-6-6-6 6" />
            </svg>
          </button>
          <div className={styles.timeText}>{format(minute)}</div>
          <button
            onMouseDown={() =>
              startAutoIncrement(() => setMinute((m) => (m - 1 + 60) % 60))
            }
            onMouseUp={stopAutoIncrement}
            onMouseLeave={stopAutoIncrement}
            className={styles.timeButton}
          >
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
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>
        </div>
      </div>
      <div className={styles.ampmToggle}>
        <div className={styles.ampmSlider} data-am={isAM} />
        <button
          onClick={() => setIsAM(true)}
          className={`${styles.ampmButton} ${isAM ? styles.active : ""}`}
        >
          AM
        </button>
        <button
          onClick={() => setIsAM(false)}
          className={`${styles.ampmButton} ${!isAM ? styles.active : ""}`}
        >
          PM
        </button>
      </div>
    </div>
  );
};
