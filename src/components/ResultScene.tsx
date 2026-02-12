"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import styles from "./ResultScene.module.css";
import { SECTIONS } from "@/lib/saju/section-constants";
import type { SajuDataV2 } from "@/lib/saju/types";
import SajuChart from "./SajuChart";
import OhHaengChart from "./OhHaengChart";
import DaeUnTimeline from "./DaeUnTimeline";

interface FortuneSection {
  id: string;
  title: string;
  content: string;
  order: number;
}

interface ResultSceneProps {
  sections: FortuneSection[];
  sajuData?: SajuDataV2;
  readingId?: string | null;
  onRestart: () => void;
}

function renderBold(text: string) {
  const parts = text.split(/\*\*(.+?)\*\*/g);
  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <strong key={i} className={styles.bold}>
        {part}
      </strong>
    ) : (
      part
    )
  );
}

// 섹션 정의에서 한자 아이콘 가져오기
const sectionIconMap = Object.fromEntries(
  SECTIONS.map((s) => [s.id, s.hanjaIcon])
);

export default function ResultScene({
  sections,
  sajuData,
  readingId,
  onRestart,
}: ResultSceneProps) {
  const [review, setReview] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [activeSection, setActiveSection] = useState(sections[0]?.id || "");
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});
  const tocRef = useRef<HTMLDivElement>(null);

  // IntersectionObserver로 현재 보이는 섹션 추적
  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    for (const section of sections) {
      const el = sectionRefs.current[section.id];
      if (!el) continue;

      const observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              setActiveSection(section.id);
            }
          }
        },
        { threshold: 0.3, rootMargin: "-80px 0px -50% 0px" }
      );

      observer.observe(el);
      observers.push(observer);
    }

    return () => observers.forEach((o) => o.disconnect());
  }, [sections]);

  // 활성 TOC 아이템 스크롤
  useEffect(() => {
    if (!tocRef.current) return;
    const activeEl = tocRef.current.querySelector(
      `[data-section-id="${activeSection}"]`
    );
    if (activeEl) {
      activeEl.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    }
  }, [activeSection]);

  const scrollToSection = useCallback((id: string) => {
    const el = sectionRefs.current[id];
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  const handleReviewSubmit = async () => {
    if (!review.trim() || submitting) return;
    setSubmitting(true);
    try {
      await fetch("/api/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ review: review.trim(), readingId }),
      });
      setSubmitted(true);
    } catch {
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div
      className={styles.container}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1, ease: "easeInOut" }}
    >
      {/* TOC - 모바일: 상단 가로 스크롤, 데스크탑: 좌측 사이드바 */}
      <nav className={styles.toc} ref={tocRef}>
        {sections.map((section) => (
          <button
            key={section.id}
            data-section-id={section.id}
            className={`${styles.tocItem} ${
              activeSection === section.id ? styles.tocItemActive : ""
            }`}
            onClick={() => scrollToSection(section.id)}
          >
            <span className={styles.tocIcon}>
              {sectionIconMap[section.id] || ""}
            </span>
            <span className={styles.tocLabel}>{section.title}</span>
          </button>
        ))}
      </nav>

      {/* 메인 컨텐츠 */}
      <div className={styles.content}>
        <h1 className={styles.title}>귀신사주</h1>
        <div className={styles.titleDivider} />

        {/* 사주 데이터 시각화 */}
        {sajuData && (
          <>
            <div className={styles.birthSummary}>
              <span>
                {sajuData.input.year}년 {sajuData.input.month}월{' '}
                {sajuData.input.day}일
              </span>
              <span className={styles.birthDot}>·</span>
              <span>
                {sajuData.input.calendarType === 'solar' ? '양력' : '음력'}
              </span>
              <span className={styles.birthDot}>·</span>
              <span>
                {sajuData.input.gender === 'male' ? '남' : '여'}성
              </span>
              <span className={styles.birthDot}>·</span>
              <span>{sajuData.zodiac}띠</span>
            </div>
            <SajuChart sajuData={sajuData} />
            <OhHaengChart sajuData={sajuData} />
            <DaeUnTimeline sajuData={sajuData} />
            <div className={styles.dataDivider} />
          </>
        )}

        {/* 13개 섹션 */}
        {sections.map((section) => (
          <section
            key={section.id}
            ref={(el) => { sectionRefs.current[section.id] = el; }}
            className={styles.section}
            id={`section-${section.id}`}
          >
            <div className={styles.sectionHeader}>
              <span className={styles.sectionIcon}>
                {sectionIconMap[section.id] || ""}
              </span>
              <h2 className={styles.sectionTitle}>{section.title}</h2>
            </div>
            <div className={styles.sectionContent}>
              {section.content.split("\n").map((paragraph, i) => {
                const trimmed = paragraph.trim();
                if (!trimmed) return <br key={i} />;
                return (
                  <p key={i} className={styles.paragraph}>
                    {renderBold(trimmed)}
                  </p>
                );
              })}
            </div>
            <div className={styles.sectionDivider} />
          </section>
        ))}

        {/* 리뷰 섹션 */}
        <div className={styles.reviewSection}>
          <h3 className={styles.reviewTitle}>리얼 리뷰를 남겨주세요</h3>
          <p className={styles.reviewSub}>
            사주 풀이를 받으신 소감을 자유롭게 남겨주세요
          </p>

          {!submitted ? (
            <>
              <textarea
                className={styles.reviewInput}
                value={review}
                onChange={(e) => setReview(e.target.value)}
                placeholder="사주 풀이 후기를 남겨주세요..."
                rows={4}
                maxLength={500}
              />
              <button
                className={styles.reviewSubmitButton}
                onClick={handleReviewSubmit}
                disabled={!review.trim() || submitting}
              >
                {submitting ? "제출 중..." : "리뷰 남기기"}
              </button>
            </>
          ) : (
            <p className={styles.reviewThanks}>소중한 리뷰 감사합니다.</p>
          )}
        </div>

        <button className={styles.restartButton} onClick={onRestart}>
          다시 보기
        </button>
      </div>
    </motion.div>
  );
}
