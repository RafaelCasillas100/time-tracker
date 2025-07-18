import { Table } from "antd";
import type { BaseStats, WorkByPhase } from "./types";
import { getKeyByLabel } from "./utils";

export const TablePhasesAndExercise = <T extends BaseStats>({
  data,
  label,
}: {
  data: T[];
  label: string;
}) => {
  const columns = [
    { title: label, dataIndex: getKeyByLabel[label] },
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
    {
      title: "Promedio de 5-8am",
      dataIndex: "workByPhase",
      render: (phases: WorkByPhase) => {
        const p = phases?.find((f) => f.phaseIndex === 0);
        return p?.avgTime || "-";
      },
    },
    {
      title: "Promedio de 8-11am",
      dataIndex: "workByPhase",
      render: (phases: WorkByPhase) => {
        const p = phases?.find((f) => f.phaseIndex === 1);
        return p?.avgTime || "-";
      },
    },
    {
      title: "Promedio de 11-2pm",
      dataIndex: "workByPhase",
      render: (phases: WorkByPhase) => {
        const p = phases?.find((f) => f.phaseIndex === 2);
        return p?.avgTime || "-";
      },
    },
    {
      title: "Promedio de 2-6pm",
      dataIndex: "workByPhase",
      render: (phases: WorkByPhase) => {
        const p = phases?.find((f) => f.phaseIndex === 3);
        return p?.avgTime || "-";
      },
    },
    {
      title: "Promedio después 6pm",
      dataIndex: "workByPhase",
      render: (phases: WorkByPhase) => {
        const p = phases?.find((f) => f.phaseIndex === 4);
        return p?.avgTime || "-";
      },
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
