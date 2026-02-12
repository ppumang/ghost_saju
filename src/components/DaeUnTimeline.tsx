'use client';

import styles from './DaeUnTimeline.module.css';
import type { SajuDataV2, CheonGan } from '@/lib/saju/types';
import { OHAENG_COLORS, GAN_TO_OHAENG } from '@/lib/saju/constants';
import { useRef, useEffect } from 'react';

interface DaeUnTimelineProps {
  sajuData: SajuDataV2;
}

export default function DaeUnTimeline({ sajuData }: DaeUnTimelineProps) {
  const { daeUn, input } = sajuData;
  const currentAge = new Date().getFullYear() - input.year;
  const scrollRef = useRef<HTMLDivElement>(null);
  const currentRef = useRef<HTMLDivElement>(null);

  // 현재 대운으로 자동 스크롤
  useEffect(() => {
    if (currentRef.current && scrollRef.current) {
      const container = scrollRef.current;
      const item = currentRef.current;
      const offset = item.offsetLeft - container.offsetWidth / 2 + item.offsetWidth / 2;
      container.scrollTo({ left: Math.max(0, offset), behavior: 'smooth' });
    }
  }, []);

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <h3 className={styles.chartTitle}>대운 흐름</h3>
        <span className={styles.direction}>
          {daeUn.isForward ? '순행 →' : '← 역행'}
        </span>
      </div>

      <div className={styles.timeline} ref={scrollRef}>
        {daeUn.items.map((item, i) => {
          const gan = item.ganJi[0] as CheonGan;
          const ohHaeng = GAN_TO_OHAENG[gan];
          const colors = ohHaeng
            ? OHAENG_COLORS[ohHaeng]
            : { bg: '#222', text: '#888' };
          const isCurrent =
            currentAge >= item.startAge && currentAge <= item.endAge;

          return (
            <div
              key={i}
              ref={isCurrent ? currentRef : undefined}
              className={`${styles.item} ${isCurrent ? styles.itemCurrent : ''}`}
            >
              <span className={styles.ageRange}>
                {item.startAge}~{item.endAge}세
              </span>
              <div
                className={styles.ganJiBox}
                style={{
                  background: colors.bg,
                  borderColor: isCurrent ? '#d4c5a9' : `${colors.text}44`,
                }}
              >
                <span
                  className={styles.ganJi}
                  style={{ color: colors.text }}
                >
                  {item.ganJi}
                </span>
              </div>
              <span className={styles.yearRange}>
                {item.startYear}~{item.endYear}
              </span>
              {isCurrent && <span className={styles.currentLabel}>현재</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
