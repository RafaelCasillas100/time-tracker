import { Table } from "antd";
import type { BaseStats } from "./types";
import { getKeyByLabel } from "./utils";

export const TableSchedule = <T extends BaseStats>({
  data,
  label,
}: {
  data: T[];
  label: string;
}) => {
  const columns = [
    { title: label, dataIndex: getKeyByLabel[label] },
    {
      title: "% Regresó a dormir",
      dataIndex: "avgGoToBedAgainPercentage",
      render: (v: number) =>
        v ? `${v.toString().length > 5 ? v.toFixed(2) : v}%` : "-",
    },
    {
      title: "Hora dejó de trabajar",
      dataIndex: "avgQuitWorkTime",
      render: (v: unknown) => v || "-",
    },
    {
      title: "Hora fue a dormir",
      dataIndex: "avgSleepTime",
      render: (v: unknown) => v || "-",
    },
    {
      title: "Horas dormidas",
      dataIndex: "avgSleepingTime",
      render: (v: unknown) => v || "-",
    },
    {
      title: "Hora comenzó a trabajar",
      dataIndex: "avgStartWorkTime",
      render: (v: unknown) => v || "-",
    },
    {
      title: "Min de despierto a trabajo",
      dataIndex: "avgTimeFromWakeUpToWork",
      render: (v: unknown) => v || "-",
    },
    {
      title: "Hora de despertar",
      dataIndex: "avgWakeUpTime",
      render: (v: unknown) => v || "-",
    },
    {
      title: "Días de ejercicio",
      dataIndex: "daysExercised",
      render: (v: unknown) => v || "-",
    },
    {
      title: "Tiempo ejercicio",
      dataIndex: "totalExerciseTime",
      render: (v: unknown) => v || "-",
    },
  ];

  return (
    <div style={{ maxWidth: "100vw", overflow: "auto" }}>
      <Table
        rowKey="weekStartDate"
        dataSource={data}
        columns={columns}
        pagination={false}
      />
    </div>
  );
};
