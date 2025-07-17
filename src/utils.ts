import { defaultDay, type Day, type WeekTotals } from "./types";

const regex = /^(?:[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/;

export const sumTimes = (...times: string[]): string => {
  let totalMinutes = 0;

  for (const time of times) {
    if (!time) continue;
    if (!regex.test(time)) throw new Error("Invalid date format: " + time);
    const [hoursStr, minutesStr] = time.split(":");
    const hours = parseInt(hoursStr, 10);
    const minutes = parseInt(minutesStr, 10);
    totalMinutes += hours * 60 + minutes;
  }

  const totalHours = Math.floor(totalMinutes / 60);
  const remainingMinutes = totalMinutes % 60;

  return `${totalHours}:${remainingMinutes.toString().padStart(2, "0")}`;
};

export const calculateMeetingsTime = (day: Day): Day["meetings"] => {
  const meetings = { ...defaultDay.meetings };
  if (!day.meetings) return meetings;
  meetings.project1 = day.meetings.project1 || "";
  meetings.project2 = day.meetings.project2 || "";
  meetings.project3 = day.meetings.project3 || "";
  meetings.total = sumTimes(
    meetings.project1,
    meetings.project2,
    meetings.project3
  );
  return meetings;
};

export const calculateDayTotals = (day: Day): Day["dayTotals"] => {
  const totals = { ...defaultDay.dayTotals };

  if (!day.phases) return totals;

  for (const phase of day.phases) {
    totals.project1 = sumTimes(totals.project1, phase?.project1);
    totals.project2 = sumTimes(totals.project2, phase?.project2);
    totals.project3 = sumTimes(totals.project3, phase?.project3);

    if (phase?.additionalActivities) {
      for (const activity of phase.additionalActivities) {
        totals[activity.activityType] = sumTimes(
          totals[activity.activityType],
          activity.time
        );
      }
    }
  }

  totals.work = sumTimes(totals.project1, totals.project2, totals.project3);
  totals.otherActivities = sumTimes(
    totals.breakfast,
    totals.lunch,
    totals.restroom,
    totals.relax,
    totals.errands
  );

  return totals;
};

export const validateDayTimes = (day: Day): string[] => {
  const errors: string[] = [];
  const timeFields: [string, string][] = [];

  if (day.wakeUpTime) timeFields.push(["wakeUpTime", day.wakeUpTime]);
  if (day.timeFromWakeUpToWork)
    timeFields.push(["timeFromWakeUpToWork", day.timeFromWakeUpToWork]);
  if (day.startWorkTime) timeFields.push(["startWorkTime", day.startWorkTime]);
  if (day.quitWorkTime) timeFields.push(["quitWorkTime", day.quitWorkTime]);
  if (day.sleepTime) timeFields.push(["sleepTime", day.sleepTime]);
  if (day.exerciseTime) timeFields.push(["exerciseTime", day.exerciseTime]);

  if (day.dayTotals) {
    Object.entries(day.dayTotals).forEach(([key, value]) => {
      timeFields.push([`dayTotals.${key}`, value]);
    });
  }

  if (day.meetings) {
    Object.entries(day.meetings).forEach(([key, value]) => {
      timeFields.push([`meetings.${key}`, value]);
    });
  }

  if (day?.phases?.length) {
    day.phases.forEach((phase, index) => {
      timeFields.push([`phases[${index}].project1`, phase?.project1]);
      timeFields.push([`phases[${index}].project2`, phase?.project2]);
      timeFields.push([`phases[${index}].project3`, phase?.project3]);

      if (phase?.additionalActivities?.length) {
        phase.additionalActivities.forEach((activity, i) => {
          timeFields.push([
            `phases[${index}].additionalActivities[${i}].time`,
            activity.time,
          ]);
        });
      }
    });
  }

  timeFields.forEach(([fieldName, value]) => {
    if (value && !regex.test(value)) {
      errors.push(`${fieldName} has invalid format: ${value}`);
    }
  });

  return errors;
};

export function parseTimeToMinutes(timeStr: string): number {
  const [h, m] = timeStr.split(":").map(Number);
  return h * 60 + m;
}

export function formatMinutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}:${m.toString().padStart(2, "0")}`;
}

export const calcularPorcentaje = (
  tiempoTotal: string,
  tiempoParcial: string
) => {
  if (!tiempoTotal || !tiempoParcial) return "";

  const totalMin = parseTimeToMinutes(tiempoTotal);
  const parcialMin = parseTimeToMinutes(tiempoParcial);

  if (totalMin === 0 || parcialMin === 0) return "";

  const porcentaje = (parcialMin / totalMin) * 100;
  const total = Math.round(porcentaje * 100) / 100;
  return ` (${total}%)`;
};

export function getMonday(): Date {
  const now = new Date();
  const date = new Date(now.getFullYear(), now.getMonth(), now.getDate()); // clone to avoid mutating
  const day = date.getDay(); // 0 (Sun) to 6 (Sat)
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  date.setDate(diff);
  return date;
}

export function formatDate(date: Date): string {
  return date.toISOString().split("T")[0]; // YYYY-MM-DD
}

function getDatesFromMondayToToday(): string[] {
  const monday = getMonday();
  const today = new Date();

  const dates: string[] = [];
  const current = new Date(monday);
  while (current <= today) {
    dates.push(formatDate(current));
    current.setDate(current.getDate() + 1);
  }

  return dates;
}

export const generateWeekTotals = (): WeekTotals => {
  const dates = getDatesFromMondayToToday();
  let project1 = 0,
    project2 = 0,
    project3 = 0;

  for (const date of dates) {
    const json = localStorage.getItem(date);
    if (!json) continue;

    try {
      const data = JSON.parse(json);
      const totals = data.dayTotals;

      if (totals?.project1) project1 += parseTimeToMinutes(totals.project1);
      if (totals?.project2) project2 += parseTimeToMinutes(totals.project2);
      if (totals?.project3) project3 += parseTimeToMinutes(totals.project3);
    } catch {
      console.warn(`Invalid JSON for date ${date}`);
    }
  }

  const total = project1 + project2 + project3;

  const weekStartDate = formatDate(getMonday());

  const weekTotals: WeekTotals = {
    project1: formatMinutesToTime(project1),
    project2: formatMinutesToTime(project2),
    project3: formatMinutesToTime(project3),
    total: formatMinutesToTime(total),
  };

  localStorage.setItem(`week-${weekStartDate}`, JSON.stringify(weekTotals));
  return weekTotals;
};

export const getWeekTotalsKey = () => {
  const weekStartDate = formatDate(getMonday());
  return `week-${weekStartDate}`;
};
