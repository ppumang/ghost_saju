export interface ResolvedTime {
  hour: number;
  minute: number;
  isUnknown: boolean;
  isYajaси: boolean; // 야자시 (23:00~00:00)
}

/**
 * birthTimeOptions의 value 문자열에서 시간을 추출한다.
 * 예: "인시초 (03:00~03:30)" → { hour: 3, minute: 15 } (중간값)
 * 예: "모름" → { hour: -1, minute: -1, isUnknown: true }
 * 예: "야자시초 (23:00~23:30)" → { hour: 23, minute: 15, isYajaси: true }
 */
export function resolveTime(hourString: string): ResolvedTime {
  if (hourString === '모름') {
    return { hour: -1, minute: -1, isUnknown: true, isYajaси: false };
  }

  const isYaja = hourString.startsWith('야자시');

  // 괄호 안의 시간 범위 추출: "HH:MM~HH:MM"
  const match = hourString.match(/\((\d{2}):(\d{2})~(\d{2}):(\d{2})\)/);
  if (!match) {
    return { hour: -1, minute: -1, isUnknown: true, isYajaси: false };
  }

  const startHour = parseInt(match[1], 10);
  const startMin = parseInt(match[2], 10);
  const endHour = parseInt(match[3], 10);
  const endMin = parseInt(match[4], 10);

  // 중간값 계산
  const startTotal = startHour * 60 + startMin;
  let endTotal = endHour * 60 + endMin;

  // 자정을 넘는 경우 (예: 23:30~00:00)
  if (endTotal <= startTotal) {
    endTotal += 24 * 60;
  }

  const midTotal = Math.floor((startTotal + endTotal) / 2);
  const midHour = Math.floor((midTotal % (24 * 60)) / 60);
  const midMinute = midTotal % 60;

  return {
    hour: midHour,
    minute: midMinute,
    isUnknown: false,
    isYajaси: isYaja,
  };
}
