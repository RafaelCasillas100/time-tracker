import { Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import type { BaseStats } from "./types";
import { getKeyByLabel } from "./utils";
import { useEffect, useState } from "react";
import type { ProjectKey } from "./statsHelpers";

export const TableWorkAndMeetings = <T extends BaseStats>({
  data,
  label,
}: {
  data: T[];
  label: string;
}) => {
  const [projectNames, setProjectNames] = useState({
    project1: "Proyecto 1",
    project2: "Proyecto 2",
    project3: "Proyecto 3",
  });

  useEffect(() => {
    const names = localStorage.getItem("projectNames");
    if (names) {
      const [project1, project2, project3] = JSON.parse(names);
      setProjectNames({
        project1,
        project2,
        project3,
      });
    }
  }, []);

  // Columns for main table
  const columns: ColumnsType<T> = [
    {
      title: "Semana",
      dataIndex: "weekStartDate",
      key: "weekStartDate",
    },
    {
      title: "Días laborados",
      dataIndex: "numberOfWorkDays",
      key: "numberOfWorkDays",
      render: (v: unknown) => "Días laborados: " + v,
    },
    {
      title: "Total trabajo",
      dataIndex: "totalWorkTime",
      key: "totalWorkTime",
      render: (v: unknown) => "Total trabajo: " + v,
    },
    {
      title: "Prom. diario",
      dataIndex: "avgWorkTimePerDay",
      key: "avgWorkTimePerDay",
      render: (v: unknown) => "Prom. diario: " + v,
    },
  ];

  // Columns for subtable
  const expandedRowRender = (record: T) => {
    const data = ["project1", "project2", "project3", ""].map((project) => ({
      key: project,
      project,
      total: record.projectTotals?.[project as ProjectKey]?.total ?? "-",
      avgPerDay:
        record.projectTotals?.[project as ProjectKey]?.avgPerDay ?? "-",
      meetings: record.meetings?.[project as ProjectKey]?.total ?? "-",
      meetingsPerDay:
        record.meetings?.[project as ProjectKey]?.avgPerDay ?? "-",
      percentage:
        record.meetings?.[project as ProjectKey]?.percentageOfWork ?? "-",
    }));

    const subColumns = [
      {
        title: "Project",
        dataIndex: "project",
        key: "project",
        render: (v: unknown) => projectNames[v as ProjectKey],
      },
      {
        title: "Total",
        dataIndex: "total",
        key: "total",
      },
      {
        title: "Prom/día",
        dataIndex: "avgPerDay",
        key: "avgPerDay",
      },
      {
        title: "Juntas",
        dataIndex: "meetings",
        key: "meetings",
      },
      {
        title: "Prom/día",
        dataIndex: "meetingsPerDay",
        key: "meetingsPerDay",
      },
      {
        title: "% de tiempo en juntas",
        dataIndex: "percentage",
        key: "percentage",
        render: (v: number | string) =>
          v && v !== "-"
            ? `${v.toString().length > 5 ? (v as number).toFixed(2) : v}%`
            : "-",
      },
    ];

    return <Table columns={subColumns} dataSource={data} pagination={false} />;
  };

  return (
    <Table
      columns={columns}
      dataSource={data.map((item) => ({
        ...item,
        key: getKeyByLabel[label],
      }))}
      expandable={{ expandedRowRender, defaultExpandAllRows: true }}
      pagination={false}
    />
  );
};
