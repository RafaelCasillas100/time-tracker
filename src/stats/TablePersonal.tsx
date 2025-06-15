import { Table } from "antd";
import type { BaseStats } from "./types";
import { getKeyByLabel } from "./utils";

export const TablePersonal = <T extends BaseStats>({
  data,
  label,
}: {
  data: T[];
  label: string;
}) => {
  const columns = [
    { title: label, dataIndex: getKeyByLabel[label] },
    {
      title: "Desayuno con disp.",
      dataIndex: ["personalActivities", "breakfast", "withDevice", "totalTime"],
      render: (v: unknown) => v || "-",
    },
    {
      title: "Desayuno sin disp.",
      dataIndex: [
        "personalActivities",
        "breakfast",
        "withoutDevice",
        "totalTime",
      ],
      render: (v: unknown) => v || "-",
    },
    {
      title: "Almuerzo con disp.",
      dataIndex: ["personalActivities", "lunch", "withDevice", "totalTime"],
      render: (v: unknown) => v || "-",
    },
    {
      title: "Almuerzo sin disp.",
      dataIndex: ["personalActivities", "lunch", "withoutDevice", "totalTime"],
      render: (v: unknown) => v || "-",
    },
    {
      title: "Baño con disp.",
      dataIndex: ["personalActivities", "restroom", "withDevice", "totalTime"],
      render: (v: unknown) => v || "-",
    },
    {
      title: "Baño sin disp.",
      dataIndex: [
        "personalActivities",
        "restroom",
        "withoutDevice",
        "totalTime",
      ],
      render: (v: unknown) => v || "-",
    },
    {
      title: "Mandados",
      dataIndex: ["personalActivities", "errands", "totalTime"],
      render: (v: unknown) => v || "-",
    },
    {
      title: "Relajación",
      dataIndex: ["personalActivities", "relax", "totalTime"],
      render: (v: unknown) => v || "-",
    },
  ];

  return (
    <Table
      rowKey="weekStartDate"
      dataSource={data}
      columns={columns}
      scroll={{ x: 1500 }}
      pagination={false}
    />
  );
};
