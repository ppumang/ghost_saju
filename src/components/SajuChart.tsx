'use client';

import styles from './SajuChart.module.css';
import type { SajuDataV2, CheonGan, Ju } from '@/lib/saju/types';
import { OHAENG_COLORS, GAN_TO_OHAENG } from '@/lib/saju/constants';

interface PillarInfo {
  label: string;
  ju: Ju;
  pillarKey: 'time' | 'day' | 'month' | 'year';
}

interface SajuChartProps {
  sajuData: SajuDataV2;
}

export default function SajuChart({ sajuData }: SajuChartProps) {
  const { saju, expandedSinSal } = sajuData;

  const pillars: PillarInfo[] = [];
  if (saju.timeJu) {
    pillars.push({ label: '시(時)', ju: saju.timeJu, pillarKey: 'time' });
  }
  pillars.push({ label: '일(日)', ju: saju.dayJu, pillarKey: 'day' });
  pillars.push({ label: '월(月)', ju: saju.monthJu, pillarKey: 'month' });
  pillars.push({ label: '년(年)', ju: saju.yearJu, pillarKey: 'year' });

  return (
    <div className={styles.wrapper}>
      <h3 className={styles.chartTitle}>사주 원국</h3>
      <div
        className={styles.grid}
        style={{ gridTemplateColumns: `auto repeat(${pillars.length}, 1fr)` }}
      >
        {/* Header row */}
        <div className={styles.cornerCell} />
        {pillars.map((p) => (
          <div key={p.pillarKey} className={styles.colHeader}>
            {p.label}
          </div>
        ))}

        {/* 천간 row */}
        <div className={styles.rowLabel}>천간</div>
        {pillars.map((p) => {
          const oh = p.ju.ganJi.ganOhHaeng;
          const colors = OHAENG_COLORS[oh];
          return (
            <div
              key={p.pillarKey}
              className={styles.ganCell}
              style={{ background: colors.bg }}
            >
              <span className={styles.mainChar} style={{ color: colors.text }}>
                {p.ju.ganJi.gan}
              </span>
              <span className={styles.ohLabel} style={{ color: colors.text }}>
                {oh}
              </span>
            </div>
          );
        })}

        {/* 지지 row */}
        <div className={styles.rowLabel}>지지</div>
        {pillars.map((p) => {
          const oh = p.ju.ganJi.jiOhHaeng;
          const colors = OHAENG_COLORS[oh];
          return (
            <div
              key={p.pillarKey}
              className={styles.jiCell}
              style={{ background: colors.bg }}
            >
              <span className={styles.mainChar} style={{ color: colors.text }}>
                {p.ju.ganJi.ji}
              </span>
              <span className={styles.ohLabel} style={{ color: colors.text }}>
                {oh}
              </span>
              {p.ju.hideGan.length > 0 && (
                <div className={styles.hideGanRow}>
                  {p.ju.hideGan.map((hg, i) => {
                    const hgOh = GAN_TO_OHAENG[hg as CheonGan];
                    const hgColors = hgOh
                      ? OHAENG_COLORS[hgOh]
                      : { bg: '#222', text: '#888' };
                    return (
                      <span
                        key={i}
                        className={styles.hideGanBadge}
                        style={{
                          background: hgColors.bg,
                          color: hgColors.text,
                          border: `1px solid ${hgColors.text}33`,
                        }}
                      >
                        {hg}
                      </span>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        {/* 십신 row */}
        <div className={styles.rowLabel}>십신</div>
        {pillars.map((p) => (
          <div key={p.pillarKey} className={styles.infoCell}>
            {p.ju.sipShinGan}
          </div>
        ))}

        {/* 운성 row */}
        <div className={styles.rowLabel}>운성</div>
        {pillars.map((p) => (
          <div key={p.pillarKey} className={styles.infoCell}>
            {p.ju.diShi}
          </div>
        ))}

        {/* 신살 row */}
        <div className={styles.rowLabel}>신살</div>
        {pillars.map((p) => {
          const sinsals = expandedSinSal.byPillar[p.pillarKey];
          return (
            <div key={p.pillarKey} className={styles.sinsalCell}>
              {sinsals.length > 0 ? (
                sinsals.map((s, i) => (
                  <span key={i} className={styles.sinsalBadge}>
                    {s}
                  </span>
                ))
              ) : (
                <span className={styles.sinsalEmpty}>—</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
