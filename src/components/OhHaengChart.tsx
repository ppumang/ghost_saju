'use client';

import styles from './OhHaengChart.module.css';
import type { SajuDataV2, OhHaeng } from '@/lib/saju/types';
import { OHAENG_COLORS } from '@/lib/saju/constants';

const OHAENG_ORDER: OhHaeng[] = ['목', '화', '토', '금', '수'];

interface OhHaengChartProps {
  sajuData: SajuDataV2;
}

export default function OhHaengChart({ sajuData }: OhHaengChartProps) {
  const { strength, ohHaeng, yongShin } = sajuData;
  const total = OHAENG_ORDER.reduce((sum, oh) => sum + ohHaeng.counts[oh], 0);

  return (
    <div className={styles.wrapper}>
      <h3 className={styles.chartTitle}>오행 분석</h3>

      {/* 강약 뱃지 */}
      <div className={styles.strengthRow}>
        <span className={styles.strengthLabel}>일간 강약</span>
        <span className={styles.strengthBadge}>{strength.strength}</span>
        {strength.deukRyeong && (
          <span className={styles.deukRyeong}>득령</span>
        )}
      </div>

      {/* 오행 바 차트 */}
      <div className={styles.bars}>
        {OHAENG_ORDER.map((oh) => {
          const count = ohHaeng.counts[oh];
          const pct = total > 0 ? (count / total) * 100 : 0;
          const colors = OHAENG_COLORS[oh];
          const isMissing = ohHaeng.missing.includes(oh);

          return (
            <div
              key={oh}
              className={`${styles.barRow} ${isMissing ? styles.barMissing : ''}`}
            >
              <span className={styles.barLabel} style={{ color: colors.text }}>
                {oh}
              </span>
              <div className={styles.barTrack}>
                {!isMissing && (
                  <div
                    className={styles.barFill}
                    style={{
                      width: `${pct}%`,
                      background: `linear-gradient(90deg, ${colors.bg}, ${colors.text})`,
                    }}
                  />
                )}
                {isMissing && (
                  <span className={styles.missingText}>없음</span>
                )}
              </div>
              <span className={styles.barCount}>
                {isMissing ? '0' : count}
              </span>
            </div>
          );
        })}
      </div>

      {/* 용신 / 희신 / 기신 */}
      <div className={styles.shinRow}>
        <div className={`${styles.shinBox} ${styles.yongShinBox}`}>
          <span className={styles.shinLabel}>용신</span>
          <span
            className={styles.shinValue}
            style={{ color: OHAENG_COLORS[yongShin.yongShin].text }}
          >
            {yongShin.yongShin}
          </span>
        </div>
        <div className={`${styles.shinBox} ${styles.huiShinBox}`}>
          <span className={styles.shinLabel}>희신</span>
          <span
            className={styles.shinValue}
            style={{ color: OHAENG_COLORS[yongShin.huiShin].text }}
          >
            {yongShin.huiShin}
          </span>
        </div>
        <div className={`${styles.shinBox} ${styles.giShinBox}`}>
          <span className={styles.shinLabel}>기신</span>
          <span
            className={styles.shinValue}
            style={{ color: OHAENG_COLORS[yongShin.giShin].text }}
          >
            {yongShin.giShin}
          </span>
        </div>
      </div>
    </div>
  );
}
