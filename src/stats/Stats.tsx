import { useState } from "react";
import { Input, Button, Tabs, Typography } from "antd";
import {
  generateMonthlyStats,
  generateQuarterlyStats,
  generateWeeklyStats,
  generateYearStats,
} from "./statsHelpers";
import TabPane from "antd/es/tabs/TabPane";
import type {
  BaseStats,
  MonthlyStats,
  QuarterlyStats,
  WeeklyStats,
  YearStats,
} from "./types";
import { TablePersonal } from "./TablePersonal";
import { TableWorkAndMeetings } from "./TableWorkAndMeetings";
import { TableSchedule } from "./TableSchedule";
import { TablePhasesAndExercise } from "./TablePhasesAndExercise";
const { TextArea } = Input;
const { Title } = Typography;

const StatsTabs = <T extends BaseStats>({
  data,
  label,
}: {
  data: T[];
  label: string;
}) => {
  return (
    <Tabs defaultActiveKey="1">
      <TabPane tab="Horas Trabajadas" key="2">
        <TableWorkAndMeetings data={data} label={label} />
      </TabPane>
      <TabPane tab="Equilibrio en mis horas" key="1">
        <TableSchedule data={data} label={label} />
      </TabPane>
      <TabPane tab="Fases y Ejercicio" key="4">
        <TablePhasesAndExercise data={data} label={label} />
      </TabPane>
      <TabPane tab="Actividades adicionales" key="3">
        <TablePersonal data={data} label={label} />
      </TabPane>
    </Tabs>
  );
};

type Stats = {
  weekly: WeeklyStats[];
  monthly: MonthlyStats[];
  quarterly: QuarterlyStats[];
  year: YearStats[];
};

export default function Stats() {
  const [rawJson, setRawJson] = useState("");
  const [stats, setStats] = useState<Stats>();

  const processData = () => {
    const data = JSON.parse(rawJson);

    const weeksStats = generateWeeklyStats(data);
    const monthsStats = generateMonthlyStats(weeksStats);
    const quartersStats = generateQuarterlyStats(monthsStats);
    const yearsStats = generateYearStats(quartersStats);

    setStats({
      weekly: weeksStats,
      monthly: monthsStats,
      quarterly: quartersStats,
      year: yearsStats,
    });
  };

  if (!stats)
    return (
      <div style={{ padding: "1rem" }}>
        <Title level={2}>📊 Estadísticas</Title>

        <TextArea
          rows={8}
          value={rawJson}
          onChange={(e) => setRawJson(e.target.value)}
          placeholder="Pega aquí tu JSON..."
          style={{ marginBottom: "1rem" }}
        />

        <Button type="primary" onClick={processData}>
          Procesar datos
        </Button>
      </div>
    );

  return (
    <div style={{ padding: "1rem" }}>
      <Tabs defaultActiveKey="1">
        <TabPane tab="Semanales" key="1">
          <StatsTabs data={stats.weekly} label="Semana" />
        </TabPane>
        <TabPane tab="Mensuales" key="2">
          <StatsTabs data={stats.monthly} label="Mes" />
        </TabPane>
        <TabPane tab="Trimestrales" key="3">
          <StatsTabs data={stats.quarterly} label="Trimestre" />
        </TabPane>
      </Tabs>
    </div>
  );
}
