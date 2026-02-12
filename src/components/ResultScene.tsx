"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { track } from "@/lib/mixpanel";
import { notifySlack } from "@/lib/slack";
import styles from "./ResultScene.module.css";
import { SECTIONS } from "@/lib/saju/section-constants";
import type { SajuDataV2, GhostClassification, GhostTypeDef } from "@/lib/saju/types";
import SajuChart from "./SajuChart";
import OhHaengChart from "./OhHaengChart";
import DaeUnTimeline from "./DaeUnTimeline";
import GhostDetection from "./GhostDetection";
import GhostPreview from "./GhostPreview";
import GhostPaywall from "./GhostPaywall";
import GhostReveal from "./GhostReveal";
import type { ResultPhase } from "@/hooks/useIntroSequence";

interface FortuneSection {
  id: string;
  title: string;
  content: string;
  order: number;
}

interface ResultSceneProps {
  sections: FortuneSection[];
  sajuData?: SajuDataV2;
  ghostClassification?: GhostClassification;
  ghostType?: GhostTypeDef;
  previewText?: string;
  readingId?: string | null;
  resultPhase?: ResultPhase;
  onRestart: () => void;
  isStaticPage?: boolean;
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
  ghostClassification,
  ghostType: ghostTypeProp,
  previewText,
  readingId,
  resultPhase = "paid",
  onRestart,
  isStaticPage = false,
}: ResultSceneProps) {
  const [review, setReview] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [chartOpen, setChartOpen] = useState(false);
  const [activeSection, setActiveSection] = useState(sections[0]?.id || "");
  const [ghostType, setGhostType] = useState<GhostTypeDef | undefined>(ghostTypeProp);
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});
  const tocRef = useRef<HTMLDivElement>(null);

  // ghostType을 동적으로 로드 (prop으로 안 온 경우)
  useEffect(() => {
    if (ghostTypeProp) {
      setGhostType(ghostTypeProp);
      return;
    }
    if (ghostClassification) {
      import("@/lib/saju/ghost-types").then(({ getGhostType }) => {
        const gt = getGhostType(ghostClassification.typeId);
        if (gt) setGhostType(gt);
      });
    }
  }, [ghostClassification, ghostTypeProp]);

  const isPaid = resultPhase === "paid" && sections.length > 0;
  const hasTrackedView = useRef(false);

  useEffect(() => {
    if (!hasTrackedView.current) {
      hasTrackedView.current = true;
      track("result_viewed", {
        phase: resultPhase,
        ghost_type: ghostClassification?.typeId,
        is_static: isStaticPage,
      });
    }
  }, [resultPhase, ghostClassification?.typeId, isStaticPage]);

  // IntersectionObserver로 현재 보이는 섹션 추적
  useEffect(() => {
    if (!isPaid) return;

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
  }, [sections, isPaid]);

  // 활성 TOC 아이템 스크롤
  useEffect(() => {
    if (!isPaid || !tocRef.current) return;
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
  }, [activeSection, isPaid]);

  const scrollToSection = useCallback((id: string) => {
    const el = sectionRefs.current[id];
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  const handleReviewSubmit = async () => {
    if (!review.trim() || submitting) return;
    setSubmitting(true);
    track("review_submitted", { readingId });
    notifySlack(`📝 [리뷰] ${review.trim()}`);
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
      {/* TOC - 결제 완료 시에만 표시 */}
      {isPaid && (
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
      )}

      {/* 메인 컨텐츠 */}
      <div className={styles.content}>
        <h1 className={styles.title}>귀신사주</h1>
        <div className={styles.titleDivider} />

        {/* 사주 데이터 — 토글로 접기/펼치기 */}
        {sajuData && (
          <>
            <button
              className={styles.chartToggle}
              onClick={() => setChartOpen((v) => !v)}
            >
              <span className={styles.chartToggleLabel}>
                {sajuData.input.year}년 {sajuData.input.month}월{' '}
                {sajuData.input.day}일
                <span className={styles.birthDot}>·</span>
                {sajuData.input.calendarType === 'solar' ? '양력' : '음력'}
                <span className={styles.birthDot}>·</span>
                {sajuData.input.gender === 'male' ? '남' : '여'}성
                <span className={styles.birthDot}>·</span>
                {sajuData.zodiac}띠
              </span>
              <span className={`${styles.chartToggleArrow} ${chartOpen ? styles.chartToggleArrowOpen : ''}`}>
                ▾
              </span>
            </button>
            <AnimatePresence>
              {chartOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                  style={{ overflow: "hidden", width: "100%" }}
                >
                  <SajuChart sajuData={sajuData} />
                  <OhHaengChart sajuData={sajuData} />
                  <DaeUnTimeline sajuData={sajuData} />
                </motion.div>
              )}
            </AnimatePresence>
            <div className={styles.dataDivider} />
          </>
        )}

        {/* ─── Phase: free (무료 영역) ─── */}
        {!isPaid && ghostClassification && ghostType && sajuData && (
          <>
            {/* 귀신 감지 */}
            <GhostDetection
              ghostClassification={ghostClassification}
              ghostType={ghostType}
            />

            {/* AI 프리뷰 맛보기 */}
            {previewText && <GhostPreview previewText={previewText} />}

            {/* 페이월 */}
            <GhostPaywall
              ghostType={ghostType}
              sajuData={sajuData}
              ghostClassification={ghostClassification}
            />
          </>
        )}

        {/* ─── Phase: paid (유료 영역) ─── */}
        {isPaid && (
          <>
            {/* 귀신 공개 */}
            {ghostType && <GhostReveal ghostType={ghostType} />}

            <div className={styles.dataDivider} />

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
          </>
        )}

        {/* 리스타트 / CTA */}
        {!isStaticPage ? (
          <button className={styles.restartButton} onClick={onRestart}>
            다시 보기
          </button>
        ) : (
          <a
            href="/"
            className={styles.restartButton}
            style={{ textDecoration: "none", display: "inline-block", textAlign: "center" }}
          >
            나도 귀신사주 보기
          </a>
        )}
      </div>
    </motion.div>
  );
}
