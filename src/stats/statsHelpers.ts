import type { RawData, Day } from "../types";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import type {
  AdditionalActivityStats,
  AdditionalActivityWithOutDevice,
  BaseStats,
  ExtendedStats,
  MonthlyStats,
  QuarterlyStats,
  WeeklyStats,
  YearStats,
} from "./types";
dayjs.extend(duration);

function parseTimeToMinutes(time: string): number {
  if (!time) return 0;
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function formatMinutes(minutes: number): string {
  if (!minutes) return "0:00";
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  return `${h}:${m.toString().padStart(2, "0")}`;
}

function averageTime(times: string[]): string {
  const total = times.reduce((sum, t) => sum + parseTimeToMinutes(t), 0);
  return formatMinutes(total / times.length);
}

function sumDurations(durations: string[]): number {
  return durations.reduce((sum, time) => sum + parseTimeToMinutes(time), 0);
}

export type ProjectKey = "project1" | "project2" | "project3";

export function generateWeeklyStats(rawData: RawData): WeeklyStats[] {
  return rawData.weeks.map((week) => {
    const days = Object.values(week.days).filter(Boolean) as Day[];

    const projectTotals = ["project1", "project2", "project3"].reduce(
      (acc, key) => {
        const total = sumDurations(
          days.map((d) => d.dayTotals[key as keyof Day["dayTotals"]])
        );
        const actualDays = Math.min(
          days.filter(
            (d) =>
              parseTimeToMinutes(d.dayTotals[key as keyof Day["dayTotals"]]) > 0
          ).length,
          5
        );
        acc[key as ProjectKey] = {
          total: formatMinutes(total),
          avgPerDay: actualDays ? formatMinutes(total / actualDays) : "0:00",
        };
        return acc;
      },
      {} as WeeklyStats["projectTotals"]
    );

    const totalWorkTimeMinutes = sumDurations(
      days.map((d) => d.dayTotals.work)
    );

    const totalWorkTime = formatMinutes(totalWorkTimeMinutes);

    const weekdays = days.filter((_, i) => i < 5);
    const numberOfWorkDays = weekdays.filter(
      (d) => d.dayTotals.work && d.dayTotals.work !== "0:00"
    ).length;
    const avgWorkTimePerDay = formatMinutes(
      totalWorkTimeMinutes / numberOfWorkDays
    );

    // If the phases doesn't exist, only return the projectTotals
    if (days.every((d) => !d.phases))
      return {
        weekStartDate: week.weekStartDate,
        projectTotals,
        totalWorkTime,
        numberOfWorkDays,
        avgWorkTimePerDay,
      };

    const timeField = (key: keyof Day) => weekdays.map((d) => d[key] as string);
    const avg = (key: keyof Day) => averageTime(timeField(key));

    const goToBedAgainCount = weekdays.filter((d) => d.goToBedAgain).length;
    const avgGoToBedAgainPercentage =
      (goToBedAgainCount / numberOfWorkDays) * 100;
    const sleepingTimes = weekdays.map(
      (d) =>
        parseTimeToMinutes(d.wakeUpTime) +
        (12 * 60 - parseTimeToMinutes(d.sleepTime))
    );

    const totalExerciseMinutes = sumDurations(
      weekdays.map((d) => d.exerciseTime).filter(Boolean)
    );
    const daysExercised = weekdays.filter((d) => d.exerciseTime).length;

    const personalActivityStats = (
      activity: "breakfast" | "lunch" | "restroom"
    ) => {
      const withDevice: number[] = [];
      const withoutDevice: number[] = [];

      days.forEach((day) =>
        day.phases.forEach((phase) =>
          phase.additionalActivities.forEach((a) => {
            if (a.activityType === activity) {
              const time = parseTimeToMinutes(a.time);
              (a.usedTechDevice ? withDevice : withoutDevice).push(time);
            }
          })
        )
      );

      const calcStats = (arr: number[]): AdditionalActivityStats => ({
        totalTime: formatMinutes(arr.reduce((a, b) => a + b, 0)),
        totalTimes: arr.length,
        avgTime: arr.length
          ? formatMinutes(arr.reduce((a, b) => a + b, 0) / arr.length)
          : "0:00",
      });

      return {
        withDevice: calcStats(withDevice),
        withoutDevice: calcStats(withoutDevice),
      };
    };

    const simpleActivityStats = (
      activity: "errands" | "relax"
    ): AdditionalActivityStats => {
      const times: number[] = [];
      days.forEach((day) =>
        day.phases.forEach((phase) =>
          phase.additionalActivities.forEach((a) => {
            if (a.activityType === activity)
              times.push(parseTimeToMinutes(a.time));
          })
        )
      );
      const total = times.reduce((a, b) => a + b, 0);
      return {
        totalTime: formatMinutes(total),
        totalTimes: times.length,
        avgTime: times.length ? formatMinutes(total / times.length) : "0:00",
      };
    };

    const workByPhase = [0, 1, 2, 3].map((i) => {
      const totalMins = days.reduce(
        (sum, d) => sum + parseTimeToMinutes(d.phases[i].total),
        0
      );
      return {
        phaseIndex: i,
        totalTime: formatMinutes(totalMins),
        avgTime: formatMinutes(totalMins / numberOfWorkDays),
      };
    });

    const meetings = ["project1", "project2", "project3"].reduce((acc, key) => {
      if (!acc || !Object.keys(acc || {})) return {} as WeeklyStats["meetings"];
      const totalMins = sumDurations(
        days.map((d) => d.meetings[key as keyof Day["meetings"]])
      );
      const workMins = parseTimeToMinutes(
        projectTotals[key as ProjectKey].total
      );
      acc[key as ProjectKey] = {
        total: formatMinutes(totalMins),
        avgPerDay: numberOfWorkDays
          ? formatMinutes(totalMins / numberOfWorkDays)
          : "0:00",
        percentageOfWork: workMins
          ? +((totalMins / workMins) * 100).toFixed(2)
          : 0,
      };
      return acc;
    }, {} as WeeklyStats["meetings"]);

    return {
      weekStartDate: week.weekStartDate,
      avgWakeUpTime: avg("wakeUpTime"),
      avgGoToBedAgainPercentage: +avgGoToBedAgainPercentage.toFixed(2),
      avgTimeFromWakeUpToWork: avg("timeFromWakeUpToWork"),
      avgStartWorkTime: avg("startWorkTime"),
      avgQuitWorkTime: avg("quitWorkTime"),
      avgSleepTime: avg("sleepTime"),
      avgSleepingTime: formatMinutes(
        sleepingTimes.reduce((a, b) => a + b, 0) / numberOfWorkDays
      ),
      totalExerciseTime: formatMinutes(totalExerciseMinutes),
      daysExercised,
      personalActivities: {
        breakfast: personalActivityStats("breakfast"),
        lunch: personalActivityStats("lunch"),
        restroom: personalActivityStats("restroom"),
        errands: simpleActivityStats("errands"),
        relax: simpleActivityStats("relax"),
      },
      workByPhase,
      projectTotals,
      meetings,
      totalWorkTime,
      numberOfWorkDays,
      avgWorkTimePerDay,
    };
  });
}

import { parse, format } from "date-fns";
import { groupBy } from "lodash";

// Recibe una duración tipo "1:30" y la divide entre un número, devolviendo un string tipo "0:45"
export function divideDuration(duration: string, divisor: number): string {
  if (!duration || divisor === 0) return "0:00";
  const [hoursStr, minutesStr] = duration.split(":");
  const totalMinutes = parseInt(hoursStr) * 60 + parseInt(minutesStr);
  const resultMinutes = Math.round(totalMinutes / divisor);
  const hours = Math.floor(resultMinutes / 60);
  const minutes = resultMinutes % 60;
  return `${hours}:${minutes.toString().padStart(2, "0")}`;
}

// Helpers para sumar duraciones tipo "1:30"
function addDurations(durations: string[]): number {
  if (!durations) return 0;
  return durations.reduce((acc, time) => {
    if (!time) return acc;
    const [h, m] = time.split(":").map(Number);
    return acc + h * 60 + m;
  }, 0);
}

// Recibe una lista de WeeklyStats y los fusiona en un solo objeto BaseStats
export function mergeStats<T extends BaseStats>(statsArray: T[]): BaseStats {
  const total = statsArray.length;

  // Función para obtener promedio de tiempos tipo "HH:MM"
  const avgTime = (key: keyof BaseStats) =>
    divideDuration(
      formatMinutes(addDurations(statsArray.map((s) => s[key] as string))),
      total
    );

  const mergeProjectTotals = (project: ProjectKey) => {
    const totalMinutes = addDurations(
      statsArray.map((s) => s.projectTotals[project].total)
    );
    // const avgMinutes = Math.round(
    //   totalMinutes /
    //     statsArray.reduce(
    //       (acc, s) =>
    //         acc +
    //         (parseFloat(s.projectTotals[project].avgPerDay.split(":")[0]) > 0
    //           ? 1
    //           : 0),
    //       0
    //     )
    // );
    return {
      total: formatMinutes(totalMinutes),
      avgPerDay: divideDuration(formatMinutes(totalMinutes), 5),
    };
  };

  const mergeMeetings = (project: ProjectKey) => {
    const totalMinutes = addDurations(
      statsArray.map((s) => s.meetings?.[project]?.total || "0:00")
    );
    const avgPerDay = divideDuration(formatMinutes(totalMinutes), 5);
    const workMinutes = addDurations(
      statsArray.map((s) => s.projectTotals[project].total)
    );
    const percentageOfWork =
      workMinutes > 0 ? Math.round((totalMinutes / workMinutes) * 100) : 0;

    return {
      total: formatMinutes(totalMinutes),
      avgPerDay,
      percentageOfWork: +percentageOfWork.toFixed(2),
    };
  };

  const workByPhase = statsArray[0].workByPhase?.map((_, i) => {
    const phaseDurations = statsArray.map(
      (s) => s.workByPhase?.[i]?.totalTime || "0:00"
    );
    const totalTime = formatMinutes(addDurations(phaseDurations));
    const avgTime = divideDuration(totalTime, total);
    return {
      phaseIndex: i,
      totalTime,
      avgTime,
    };
  });

  return {
    avgWakeUpTime: avgTime("avgWakeUpTime"),
    avgGoToBedAgainPercentage:
      statsArray.reduce(
        (acc, s) => acc + (s.avgGoToBedAgainPercentage || 0),
        0
      ) / total,
    avgTimeFromWakeUpToWork: avgTime("avgTimeFromWakeUpToWork"),
    avgStartWorkTime: avgTime("avgStartWorkTime"),
    avgQuitWorkTime: avgTime("avgQuitWorkTime"),
    avgSleepTime: avgTime("avgSleepTime"),
    avgSleepingTime: avgTime("avgSleepingTime"),

    totalExerciseTime: formatMinutes(
      addDurations(statsArray.map((s) => s.totalExerciseTime || "0:00"))
    ),
    daysExercised: statsArray.reduce(
      (acc, s) => acc + (s.daysExercised || 0),
      0
    ),

    personalActivities: {
      breakfast: {
        withDevice: mergeActivity(statsArray, "breakfast", true),
        withoutDevice: mergeActivity(statsArray, "breakfast", false),
      },
      lunch: {
        withDevice: mergeActivity(statsArray, "lunch", true),
        withoutDevice: mergeActivity(statsArray, "lunch", false),
      },
      restroom: {
        withDevice: mergeActivity(statsArray, "restroom", true),
        withoutDevice: mergeActivity(statsArray, "restroom", false),
      },
      errands: mergeActivity(statsArray, "errands"),
      relax: mergeActivity(statsArray, "relax"),
    },

    workByPhase,

    projectTotals: {
      project1: mergeProjectTotals("project1"),
      project2: mergeProjectTotals("project2"),
      project3: mergeProjectTotals("project3"),
    },

    meetings: {
      project1: mergeMeetings("project1"),
      project2: mergeMeetings("project2"),
      project3: mergeMeetings("project3"),
    },

    totalWorkTime: formatMinutes(
      addDurations(statsArray.map((s) => s.totalWorkTime || "0:00"))
    ),
    avgWorkTimePerDay: divideDuration(
      formatMinutes(
        addDurations(statsArray.map((s) => s.avgWorkTimePerDay || "0:00"))
      ),
      total
    ),
  };
}

function mergeActivity<T extends BaseStats>(
  statsArray: T[],
  type: string,
  usedTechDevice?: boolean
): {
  totalTime: string;
  totalTimes: number;
  avgTime: string;
} {
  let totalMinutes = 0;
  let totalCount = 0;

  statsArray.forEach((s) => {
    if (!s.personalActivities) return;
    const activity =
      s.personalActivities[type as keyof typeof s.personalActivities];

    const node =
      usedTechDevice != null
        ? ((activity as AdditionalActivityWithOutDevice)[
            usedTechDevice ? "withDevice" : "withoutDevice"
          ] as AdditionalActivityStats)
        : (activity as AdditionalActivityStats);

    const [h, m] = node.totalTime.split(":").map(Number);
    totalMinutes += h * 60 + m;
    totalCount += node.totalTimes;
  });

  return {
    totalTime: formatMinutes(totalMinutes),
    totalTimes: totalCount,
    avgTime:
      totalCount > 0
        ? divideDuration(formatMinutes(totalMinutes), totalCount)
        : "0:00",
  };
}

function getMonthFromWeek(weekStartDate: string): string {
  const date = parse(weekStartDate, "yyyy-MM-dd", new Date());
  return format(date, "yyyy-MM");
}

function getQuarterFromMonth(month: string): string {
  const y = parseInt(month.split("-")[0]);
  const m = parseInt(month.split("-")[1]);
  if (m <= 3) return y + " - Q1";
  if (m <= 6) return y + " - Q2";
  if (m <= 9) return y + " - Q3";
  return y + " - Q4";
}

function getYearFromQuarter(month: string): string {
  return month.split(" - ")[0];
}

function extendStats(
  stats: BaseStats,
  weeks: (WeeklyStats | MonthlyStats | QuarterlyStats)[]
): ExtendedStats {
  const totalExerciseTime = sumDurations(
    weeks.map((w) => w.totalExerciseTime || "0:00")
  );
  const totalDaysExercised = weeks.reduce(
    (acc, w) => acc + (w.daysExercised || 0),
    0
  );
  const weekCount = weeks.length;

  return {
    ...stats,
    avgExerciseTimePerWeek: divideDuration(
      formatMinutes(totalExerciseTime),
      weekCount
    ),
    avgDaysExercisedPerWeek: parseFloat(
      (totalDaysExercised / weekCount).toFixed(2)
    ),
  };
}

export function generateMonthlyStats(
  weeklyStats: WeeklyStats[]
): MonthlyStats[] {
  const grouped = groupBy(weeklyStats, (w) =>
    getMonthFromWeek(w.weekStartDate)
  );

  return Object.entries(grouped).map(([month, weeks]) => {
    const base = mergeStats(weeks);
    return {
      ...extendStats(base, weeks),
      month,
    };
  });
}

export function generateQuarterlyStats(
  monthlyStats: MonthlyStats[]
): QuarterlyStats[] {
  const grouped = groupBy(monthlyStats, (m) => getQuarterFromMonth(m.month));

  return Object.entries(grouped).map(([quarter, months]) => {
    const base = mergeStats(months);
    return {
      ...extendStats(base, months),
      quarter: quarter as QuarterlyStats["quarter"],
    };
  });
}

export function generateYearStats(quarterStats: QuarterlyStats[]): YearStats[] {
  const grouped = groupBy(quarterStats, (q) => getYearFromQuarter(q.quarter));

  return Object.entries(grouped).map(([year, quarters]) => {
    const base = mergeStats(quarters);
    return {
      ...extendStats(base, quarters),
      year,
    };
  });
}
