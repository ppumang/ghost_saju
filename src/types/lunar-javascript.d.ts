declare module 'lunar-javascript' {
  export class Solar {
    static fromYmd(year: number, month: number, day: number): Solar;
    static fromYmdHms(year: number, month: number, day: number, hour: number, minute: number, second: number): Solar;
    static fromDate(date: Date): Solar;
    getYear(): number;
    getMonth(): number;
    getDay(): number;
    getHour(): number;
    getMinute(): number;
    getSecond(): number;
    getLunar(): Lunar;
    toYmd(): string;
    toYmdHms(): string;
    toString(): string;
    toFullString(): string;
  }

  export class Lunar {
    static fromYmd(year: number, month: number, day: number): Lunar;
    static fromYmdHms(year: number, month: number, day: number, hour: number, minute: number, second: number): Lunar;
    static fromSolar(solar: Solar): Lunar;
    static fromDate(date: Date): Lunar;
    getYear(): number;
    getMonth(): number;
    getDay(): number;
    getHour(): number;
    getMinute(): number;
    getSecond(): number;
    getYearInChinese(): string;
    getMonthInChinese(): string;
    getDayInChinese(): string;
    getYearInGanZhi(): string;
    getMonthInGanZhi(): string;
    getDayInGanZhi(): string;
    getTimeInGanZhi(): string;
    getYearGan(): string;
    getYearZhi(): string;
    getMonthGan(): string;
    getMonthZhi(): string;
    getDayGan(): string;
    getDayZhi(): string;
    getTimeGan(): string;
    getTimeZhi(): string;
    getYearNaYin(): string;
    getMonthNaYin(): string;
    getDayNaYin(): string;
    getTimeNaYin(): string;
    getYearShengXiao(): string;
    getSolar(): Solar;
    getEightChar(): EightChar;
    getBaZi(): string[];
    getBaZiWuXing(): string[];
    getBaZiNaYin(): string[];
    getBaZiShiShenGan(): string[];
    getBaZiShiShenZhi(): string[][];
    next(days: number): Lunar;
    toFullString(): string;
  }

  export class EightChar {
    static fromLunar(lunar: Lunar): EightChar;
    setSect(sect: number): void;
    getSect(): number;
    getYear(): string;
    getMonth(): string;
    getDay(): string;
    getTime(): string;
    getYearGan(): string;
    getYearZhi(): string;
    getMonthGan(): string;
    getMonthZhi(): string;
    getDayGan(): string;
    getDayZhi(): string;
    getTimeGan(): string;
    getTimeZhi(): string;
    getDayGanIndex(): number;
    getDayZhiIndex(): number;
    getYearHideGan(): string[];
    getMonthHideGan(): string[];
    getDayHideGan(): string[];
    getTimeHideGan(): string[];
    getYearWuXing(): string;
    getMonthWuXing(): string;
    getDayWuXing(): string;
    getTimeWuXing(): string;
    getYearNaYin(): string;
    getMonthNaYin(): string;
    getDayNaYin(): string;
    getTimeNaYin(): string;
    getYearShiShenGan(): string;
    getMonthShiShenGan(): string;
    getDayShiShenGan(): string;
    getTimeShiShenGan(): string;
    getYearShiShenZhi(): string[];
    getMonthShiShenZhi(): string[];
    getDayShiShenZhi(): string[];
    getTimeShiShenZhi(): string[];
    getYearDiShi(): string;
    getMonthDiShi(): string;
    getDayDiShi(): string;
    getTimeDiShi(): string;
    getYearXun(): string;
    getMonthXun(): string;
    getDayXun(): string;
    getTimeXun(): string;
    getYearXunKong(): string;
    getMonthXunKong(): string;
    getDayXunKong(): string;
    getTimeXunKong(): string;
    getTaiYuan(): string;
    getTaiYuanNaYin(): string;
    getTaiXi(): string;
    getTaiXiNaYin(): string;
    getMingGong(): string;
    getMingGongNaYin(): string;
    getShenGong(): string;
    getShenGongNaYin(): string;
    getYun(gender: number, sect?: number): Yun;
    getLunar(): Lunar;
    toString(): string;
  }

  export class Yun {
    getGender(): number;
    getStartYear(): number;
    getStartMonth(): number;
    getStartDay(): number;
    getStartHour(): number;
    isForward(): boolean;
    getLunar(): Lunar;
    getStartSolar(): Solar;
    getDaYun(n?: number): DaYun[];
  }

  export class DaYun {
    getStartYear(): number;
    getEndYear(): number;
    getStartAge(): number;
    getEndAge(): number;
    getIndex(): number;
    getGanZhi(): string;
    getXun(): string;
    getXunKong(): string;
    getLunar(): Lunar;
    getLiuNian(n?: number): LiuNian[];
    getXiaoYun(n?: number): XiaoYun[];
  }

  export class LiuNian {
    getYear(): number;
    getAge(): number;
    getGanZhi(): string;
    getXun(): string;
    getXunKong(): string;
    getLunar(): Lunar;
  }

  export class XiaoYun {
    getYear(): number;
    getAge(): number;
    getGanZhi(): string;
    getXun(): string;
    getXunKong(): string;
  }
}
