import { useEffect, useState } from "react";
import { Input, Button, Tabs, Typography, Modal } from "antd";
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
    <Tabs defaultActiveKey="1" centered>
      <TabPane tab="Trabajo" key="1">
        <TableWorkAndMeetings data={data} label={label} />
      </TabPane>
      <TabPane tab="Rutina" key="2">
        <TableSchedule data={data} label={label} />
      </TabPane>
      <TabPane tab="Fases" key="3">
        <TablePhasesAndExercise data={data} label={label} />
      </TabPane>
      <TabPane tab="Actividades" key="4">
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
  const [modalOpen, setModalOpen] = useState(false);

  const processData = () => {
    const data = JSON.parse(rawJson);

    data.weeks = data.weeks?.filter(
      (val: { weekStartDate: string }) => !!val.weekStartDate
    );

    const weeksStats = generateWeeklyStats(data);
    const monthsStats = generateMonthlyStats(weeksStats);
    const quartersStats = generateQuarterlyStats(monthsStats);
    const yearsStats = generateYearStats(quartersStats);

    const stats = {
      weekly: weeksStats,
      monthly: monthsStats,
      quarterly: quartersStats,
      year: yearsStats,
    };

    setStats(stats);
    localStorage.setItem("stats", JSON.stringify(stats));
    setModalOpen(false);
  };

  useEffect(() => {
    const stats = localStorage.getItem("stats");
    if (stats) {
      setStats(JSON.parse(stats));
    }
  }, []);

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <Title level={4}>📊 Estadísticas</Title>
        <Button onClick={() => setModalOpen(true)}>Actualizar datos</Button>
      </div>

      {stats && (
        <Tabs defaultActiveKey="1" centered>
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
      )}

      <Modal
        title="Pega aquí tu JSON..."
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={[
          <Button key="cancel" onClick={() => setModalOpen(false)}>
            Cancelar
          </Button>,
          <Button type="primary" onClick={processData}>
            Procesar datos
          </Button>,
        ]}
      >
        <TextArea
          rows={8}
          value={rawJson}
          onChange={(e) => setRawJson(e.target.value)}
          placeholder=""
          style={{ marginBottom: "1rem" }}
        />
      </Modal>
    </>
  );
}
