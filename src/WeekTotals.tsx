import { Table } from "antd";
import { useMemo } from "react";
import {
  formatDate,
  formatMinutesToTime,
  getMonday,
  parseTimeToMinutes,
} from "./utils";
import type { Day } from "./types";

const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri"];
const projectKeys = ["project1", "project2", "project3"];

type ProjectRow = {
  key: string;
  project: string;
  Mon?: string;
  Tue?: string;
  Wed?: string;
  Thu?: string;
  Fri?: string;
  total: string;
  average: string;
};

function getDateForWeekday(weekdayIndex: number): string {
  const monday = getMonday(); // returns Date object for Monday of current week
  const date = new Date(monday);
  date.setDate(monday.getDate() + weekdayIndex); // 0 = Mon, 4 = Fri
  return formatDate(date);
}

function getWeekDayData(): Record<string, Day["dayTotals"]> {
  const result: Record<string, Day["dayTotals"]> = {};

  for (let i = 0; i < 5; i++) {
    const dateStr = getDateForWeekday(i);
    const raw = localStorage.getItem(dateStr);
    if (raw) {
      try {
        result[daysOfWeek[i]] = JSON.parse(raw)?.dayTotals || {};
      } catch {
        console.warn("Invalid JSON for date", dateStr);
      }
    }
  }

  return result;
}

export const WeekTotalsTable = ({
  projectNames,
}: {
  projectNames: string[];
}) => {
  const dayData = useMemo(() => getWeekDayData(), []);

  const dataSource: ProjectRow[] = projectKeys.map((projectKey, idx) => {
    let total = 0;
    let count = 0;

    const row: ProjectRow = {
      key: projectKey,
      project: projectNames[idx],
      total: "",
      average: "",
    };

    for (const day of daysOfWeek) {
      const time = (dayData?.[day] as Record<string, string>)?.[projectKey];
      if (time) {
        row[day as keyof ProjectRow] = time;
        total += parseTimeToMinutes(time);
        count++;
      } else {
        row[day as keyof ProjectRow] = "-";
      }
    }

    row.total = formatMinutesToTime(total);
    row.average = count ? formatMinutesToTime(Math.round(total / count)) : "-";

    return row;
  });

  let total = 0;
  let count = 0;

  const totals: ProjectRow = {
    key: "totals",
    project: "Total",
    total: "",
    average: "",
  };

  for (const day of daysOfWeek) {
    const time = dataSource.reduce((prev, data) => {
      const dayTotal = data[day];
      if (!dayTotal || dayTotal === "-") return prev;
      return prev + parseTimeToMinutes(dayTotal);
    }, 0);

    if (time) {
      totals[day as keyof ProjectRow] = formatMinutesToTime(time);
      total += time;
      count++;
    } else {
      totals[day as keyof ProjectRow] = "-";
    }
  }

  totals.total = formatMinutesToTime(total);

  totals.average = count ? formatMinutesToTime(Math.round(total / count)) : "-";

  dataSource.push({ key: "emptyRow" } as ProjectRow);
  dataSource.push(totals);

  const columns = [
    { title: "Proyecto", dataIndex: "project", key: "project" },
    ...daysOfWeek.map((day) => ({
      title: day,
      dataIndex: day,
      key: day,
      align: "center" as const,
    })),
    { title: "Total semana", dataIndex: "total", key: "total" },
    { title: "Prom. por día", dataIndex: "average", key: "average" },
  ];

  return (
    <Table
      dataSource={dataSource}
      columns={columns}
      pagination={false}
      size="small"
      bordered
    />
  );
};
