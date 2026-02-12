"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./LoadingScene.module.css";

const messages = [
  "사주를 풀고 있습니다...",
  "운명의 흐름을 읽는 중...",
  "귀신 사주가 말하고 있습니다...",
];

const reviews = [
  { name: "김**", date: "2025.02.12", text: "토속 기반 사주 과거 듣기만 했었는데 너무 소름돋게 정확하다... 등에 소름 돋았음" },
  { name: "이**", date: "2025.02.11", text: "할머니 말투가 진짜 생생해서 무서웠는데 내 성격 부분 완전 맞음 ㄷㄷ" },
  { name: "박**", date: "2025.02.11", text: "귀신사주라길래 장난인줄 알았는데 재물운 부분 소름.. 진짜 지금 그 상황임" },
  { name: "최**", date: "2025.02.10", text: "새벽에 혼자 봤는데 조심해야 할 것 부분에서 진짜 뒤돌아봄;;" },
  { name: "정**", date: "2025.02.10", text: "잘 풀렸을 때 인생 파트 읽고 동기부여 제대로 됨. 근데 앞부분은 진짜 무섭다" },
  { name: "강**", date: "2025.02.09", text: "엄마 사주도 봐드렸는데 엄마가 이거 어떻게 아냐고 놀라심 ㅋㅋㅋ" },
  { name: "윤**", date: "2025.02.09", text: "인연 부분 완전 소름... 지금 만나는 사람 특징이랑 너무 똑같음" },
  { name: "한**", date: "2025.02.08", text: "귀신 조심하라는 말이 자꾸 머리에 남는다.. 무섭지만 자꾸 보게 됨" },
  { name: "서**", date: "2025.02.08", text: "건강 부분 찔렸다 ㅠㅠ 진짜 요즘 그쪽이 안 좋았는데 어떻게 알지" },
  { name: "장**", date: "2025.02.07", text: "친구들이랑 같이 봤는데 다 소름돋아서 조용해짐 ㅋㅋ 분위기 싸해짐" },
  { name: "조**", date: "2025.02.07", text: "사주 풀이 많이 봤는데 이런 스타일은 처음이다. 진짜 할머니가 앞에서 말하는 느낌" },
  { name: "임**", date: "2025.02.06", text: "액운 시기가 딱 작년이었는데 진짜 그때 힘들었거든... 소름" },
  { name: "오**", date: "2025.02.06", text: "정통 명리학이랑은 해석이 좀 다른 부분이 있긴 한데.. 오히려 그래서 더 찔림. 토속 사주 특유의 느낌이 있다" },
  { name: "배**", date: "2025.02.05", text: "기존 사주랑 약간 다른 관점이 있어서 처음엔 어? 했는데 읽다보니까 오히려 이게 더 현실적임 ㅋㅋ" },
  { name: "노**", date: "2025.02.05", text: "글이 너무 길다.. 핵심만 짧게 해주면 좋겠음" },
  { name: "문**", date: "2025.02.04", text: "무서운 분위기는 좋은데 좀 과하게 공포 조장하는 느낌도 있음. 심약한 사람은 주의" },
  { name: "송**", date: "2025.02.04", text: "재미로 본 건데 너무 맞아서 기분이 묘하다... 차라리 안 봤으면 ㅋㅋ" },
];

export default function LoadingScene() {
  const [msgIndex, setMsgIndex] = useState(0);
  const [visibleReviews, setVisibleReviews] = useState<number[]>([0, 1, 2]);
  const reviewRef = useRef(3);

  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIndex((prev) => (prev + 1) % messages.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const next = reviewRef.current % reviews.length;
      reviewRef.current += 1;
      setVisibleReviews((prev) => [...prev.slice(1), next]);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      className={styles.container}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6, ease: "easeInOut" }}
    >
      <div className={styles.vignette} />

      <div className={styles.inner}>
        <div className={styles.content}>
          <AnimatePresence mode="wait">
            <motion.p
              key={msgIndex}
              className={styles.message}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            >
              {messages[msgIndex]}
            </motion.p>
          </AnimatePresence>
        </div>

        <div className={styles.reviewSection}>
          <div className={styles.reviewHeader}>
            <span className={styles.reviewTab}>실시간 리뷰보기</span>
            <span className={styles.reviewSub}>
              사주 풀이 후 누구나 남길 수 있는 내돈내산 리얼 리뷰 입니다
            </span>
            <span className={styles.reviewNotice}>
              사주 파일은 pdf로 제공됩니다
            </span>
          </div>

          <div className={styles.reviewList}>
            <AnimatePresence mode="popLayout">
              {visibleReviews.map((ri, i) => (
                <motion.div
                  key={`${ri}-${i}-${reviewRef.current}`}
                  className={styles.reviewItem}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                >
                  <div className={styles.reviewMeta}>
                    <span className={styles.reviewName}>
                      {reviews[ri].name}
                    </span>
                    <span className={styles.reviewDate}>
                      {reviews[ri].date}
                    </span>
                  </div>
                  <p className={styles.reviewText}>{reviews[ri].text}</p>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
