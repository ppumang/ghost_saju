"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { track } from "@/lib/mixpanel";
import { birthTimeOptions } from "@/data/birthTimeOptions";
import type { BirthData } from "@/hooks/useIntroSequence";
import styles from "./BirthForm.module.css";

interface BirthFormProps {
  onSubmit: (data: BirthData) => void;
  error: string | null;
}

const currentYear = new Date().getFullYear();
const years = Array.from({ length: currentYear - 1920 + 1 }, (_, i) => 1920 + i);
const months = Array.from({ length: 12 }, (_, i) => i + 1);
const days = Array.from({ length: 31 }, (_, i) => i + 1);

export default function BirthForm({ onSubmit, error }: BirthFormProps) {
  const [showDisclaimer, setShowDisclaimer] = useState(true);
  const [gender, setGender] = useState<"male" | "female" | "">("");
  const hasTracked = useRef(false);

  useEffect(() => {
    if (!hasTracked.current) {
      hasTracked.current = true;
      track("birth_form_viewed");
    }
  }, []);
  const [calendarType, setCalendarType] = useState<"solar" | "lunar">("solar");
  const [isLeapMonth, setIsLeapMonth] = useState(false);
  const [year, setYear] = useState("");
  const [month, setMonth] = useState("");
  const [day, setDay] = useState("");
  const [hour, setHour] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!year || !month || !day || !hour || !gender) return;
    onSubmit({
      year: Number(year),
      month: Number(month),
      day: Number(day),
      hour,
      calendarType,
      isLeapMonth: calendarType === "lunar" && isLeapMonth,
      gender,
    });
  };

  const isValid = year && month && day && hour && gender;

  return (
    <motion.div
      className={styles.container}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
    >
      <div className={styles.vignette} />

      <AnimatePresence>
        {showDisclaimer && (
          <motion.div
            className={styles.overlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <motion.div
              className={styles.popup}
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <p className={styles.disclaimerText}>
                해당 사주풀이는 정통 명리학 기반 사주와 약간의 개인적 해석에 차이가
                존재하며, 특히 일운을 보는 부분에 있어서는 토속적인 관점이
                가미되었음을 미리 알려드립니다.
              </p>
              <p className={styles.disclaimerText}>
                정통 사주학 관점의 풀이를 보시는 분들은 다른 곳으로의 방문을
                추천드립니다.
              </p>
              <button
                type="button"
                className={styles.disclaimerButton}
                onClick={() => {
                  track("disclaimer_confirmed");
                  setShowDisclaimer(false);
                }}
              >
                확인
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <form className={styles.form} onSubmit={handleSubmit}>
        <h2 className={styles.title}>생년월일을 알려주세요</h2>

        <div className={styles.fields}>
          <div className={styles.fieldGroup}>
            <label className={styles.label}>성별</label>
            <div className={styles.toggleRow}>
              <button
                type="button"
                className={`${styles.toggleButton} ${gender === "male" ? styles.toggleActive : ""}`}
                onClick={() => setGender("male")}
              >
                남
              </button>
              <button
                type="button"
                className={`${styles.toggleButton} ${gender === "female" ? styles.toggleActive : ""}`}
                onClick={() => setGender("female")}
              >
                여
              </button>
            </div>
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label}>달력 기준</label>
            <div className={styles.toggleRow}>
              <button
                type="button"
                className={`${styles.toggleButton} ${calendarType === "solar" ? styles.toggleActive : ""}`}
                onClick={() => { setCalendarType("solar"); setIsLeapMonth(false); }}
              >
                양력
              </button>
              <button
                type="button"
                className={`${styles.toggleButton} ${calendarType === "lunar" ? styles.toggleActive : ""}`}
                onClick={() => setCalendarType("lunar")}
              >
                음력
              </button>
            </div>
          </div>

          {calendarType === "lunar" && (
            <div className={styles.fieldGroup}>
              <label className={styles.label}>윤달 여부</label>
              <div className={styles.toggleRow}>
                <button
                  type="button"
                  className={`${styles.toggleButton} ${!isLeapMonth ? styles.toggleActive : ""}`}
                  onClick={() => setIsLeapMonth(false)}
                >
                  평달
                </button>
                <button
                  type="button"
                  className={`${styles.toggleButton} ${isLeapMonth ? styles.toggleActive : ""}`}
                  onClick={() => setIsLeapMonth(true)}
                >
                  윤달
                </button>
              </div>
            </div>
          )}

          <div className={styles.fieldGroup}>
            <label className={styles.label} htmlFor="year">연도</label>
            <select
              id="year"
              className={styles.select}
              value={year}
              onChange={(e) => setYear(e.target.value)}
            >
              <option value="">선택</option>
              {years.map((y) => (
                <option key={y} value={y}>{y}년</option>
              ))}
            </select>
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label} htmlFor="month">월</label>
            <select
              id="month"
              className={styles.select}
              value={month}
              onChange={(e) => setMonth(e.target.value)}
            >
              <option value="">선택</option>
              {months.map((m) => (
                <option key={m} value={m}>{m}월</option>
              ))}
            </select>
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label} htmlFor="day">일</label>
            <select
              id="day"
              className={styles.select}
              value={day}
              onChange={(e) => setDay(e.target.value)}
            >
              <option value="">선택</option>
              {days.map((d) => (
                <option key={d} value={d}>{d}일</option>
              ))}
            </select>
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label} htmlFor="hour">태어난 시간</label>
            <select
              id="hour"
              className={styles.select}
              value={hour}
              onChange={(e) => setHour(e.target.value)}
            >
              <option value="">선택</option>
              {birthTimeOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>

        {error && <p className={styles.error}>{error}</p>}

        <motion.button
          type="submit"
          className={styles.submitButton}
          disabled={!isValid}
          whileTap={{ scale: 0.97 }}
        >
          사주 풀이 시작
        </motion.button>
      </form>
    </motion.div>
  );
}
