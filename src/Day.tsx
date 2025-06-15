import { useEffect, useMemo, useState } from "react";
import {
  Form,
  Input,
  Button,
  DatePicker,
  Collapse,
  Select,
  Modal,
  Space,
  Divider,
  Typography,
  message,
  Switch,
  Descriptions,
  Checkbox,
} from "antd";
import {
  activityOptions,
  defaultDay,
  defaultWeek,
  defaultWeekTotals,
  phaseNames,
  type Day,
  type WeekTotals,
} from "./types";
import dayjs from "dayjs";
import "dayjs/locale/es";
import {
  calcularPorcentaje,
  calculateDayTotals,
  calculateMeetingsTime,
  formatDate,
  generateWeekTotals,
  getMonday,
  getWeekTotalsKey,
  sumTimes,
  validateDayTimes,
} from "./utils";
import {
  CloseOutlined,
  LaptopOutlined,
  PhoneOutlined,
} from "@ant-design/icons";
import ManualModal from "./ManualModal";

dayjs.locale("es");

const { Panel } = Collapse;
const { Option } = Select;
const { Title } = Typography;

const DayForm = () => {
  const [form] = Form.useForm();
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [modalOpen, setModalOpen] = useState(false);
  const [day, setDay] = useState<Day>({ ...defaultDay });
  const [weekTotals, setWeekTotals] = useState<WeekTotals>({
    ...defaultWeekTotals,
  });
  const [projectNames, setProjectNames] = useState<[string, string, string]>([
    "Proyecto 1",
    "Proyecto 2",
    "Proyecto 3",
  ]);

  const [modal, modalContextHolder] = Modal.useModal();
  const [toast, messageContextHolder] = message.useMessage();

  useEffect(() => {
    const names = localStorage.getItem("projectNames");
    if (names) setProjectNames(JSON.parse(names));

    const weekTotalsKey = getWeekTotalsKey();
    const weekTotals = localStorage.getItem(weekTotalsKey);
    if (weekTotals) setWeekTotals(JSON.parse(weekTotals));

    const storedDate = localStorage.getItem("selectedDay");
    if (storedDate) {
      setSelectedDate(storedDate);
      const saved = localStorage.getItem(storedDate);
      if (saved) {
        const day = JSON.parse(saved) as Day;
        form.setFieldsValue({ ...day });
        setDay({ ...day });
      } else {
        form.setFieldsValue({ ...defaultDay });
        setDay({ ...defaultDay });
      }
    }
  }, [form]);

  const saveDay = (day: Day) => {
    const errors = validateDayTimes(day);
    if (errors.length) toast.error(JSON.stringify(errors), 15);
    else {
      setDay(day);
      localStorage.setItem(selectedDate, JSON.stringify(day));
      toast.success("Datos del día guardados");
    }
  };

  const handleDateChange = (date: dayjs.Dayjs | null) => {
    if (!date) return;
    const dateStr = date.format("YYYY-MM-DD");
    setSelectedDate(dateStr);
    localStorage.setItem("selectedDay", dateStr);
    const saved = localStorage.getItem(dateStr);
    if (saved) {
      const day = JSON.parse(saved) as Day;
      form.setFieldsValue({ ...day });
      setDay({ ...day });
    } else {
      form.setFieldsValue({ ...defaultDay });
      setDay({ ...defaultDay });
    }
  };

  const onFinish = (newDayFields: Partial<Day>) => {
    if (!selectedDate) return;

    delete newDayFields.dayTotals;

    const updatedDay = {
      ...day,
      ...newDayFields,
      date: selectedDate,
      meetings: {
        ...day.meetings,
        ...newDayFields.meetings,
      },
    };

    const saved = localStorage.getItem(selectedDate);
    if (saved) {
      const savedDay = JSON.parse(saved) as Day;
      if (!updatedDay.phases) updatedDay.phases = [];
      if (!updatedDay.phases?.[0] && savedDay.phases?.[0]) {
        updatedDay.phases[0] = savedDay.phases[0];
      }
      if (!updatedDay.phases?.[1] && savedDay.phases?.[1]) {
        updatedDay.phases[1] = savedDay.phases[1];
      }
      if (!updatedDay.phases?.[2] && savedDay.phases?.[2]) {
        updatedDay.phases[2] = savedDay.phases[2];
      }
      if (!updatedDay.phases?.[3] && savedDay.phases?.[3]) {
        updatedDay.phases[3] = savedDay.phases[3];
      }
    }

    const phase1 = updatedDay.phases?.[0];
    const phase2 = updatedDay.phases?.[1];
    const phase3 = updatedDay.phases?.[2];
    const phase4 = updatedDay.phases?.[3];
    if (phase1) {
      updatedDay.phases[0].total = sumTimes(
        phase1.project1,
        phase1.project2,
        phase1.project3
      );
    }
    if (phase2) {
      updatedDay.phases[1].total = sumTimes(
        phase2.project1,
        phase2.project2,
        phase2.project3
      );
    }
    if (phase3) {
      updatedDay.phases[2].total = sumTimes(
        phase3.project1,
        phase3.project2,
        phase3.project3
      );
    }
    if (phase4) {
      updatedDay.phases[3].total = sumTimes(
        phase4.project1,
        phase4.project2,
        phase4.project3
      );
    }

    try {
      updatedDay.dayTotals = calculateDayTotals(updatedDay);
      updatedDay.meetings = calculateMeetingsTime(updatedDay);
      updatedDay.goToBedAgain = updatedDay.goToBedAgain || false;
      saveDay(updatedDay);
    } catch (error) {
      toast.error((error as Error).message, 15);
    }
  };

  const manualSubmit = (
    project1: string,
    project2: string,
    project3: string
  ) => {
    const saved = localStorage.getItem(selectedDate);
    const day: Day = saved ? JSON.parse(saved) : { ...defaultDay };
    day.date = selectedDate;
    day.dayTotals.project1 = project1;
    day.dayTotals.project2 = project2;
    day.dayTotals.project3 = project3;
    day.phases = [];
    try {
      day.dayTotals.work = sumTimes(project1, project2, project3);
      form.setFieldsValue(day);
      saveDay(day);
      setModalOpen(false);
    } catch (error) {
      toast.error((error as Error).message, 15);
    }
  };

  const currentDate = useMemo(() => {
    if (!selectedDate) return "";
    const date = dayjs(selectedDate);
    if (!date.isValid()) return "";

    const dayName = date.format("dddd");
    const dayNumber = date.format("D");
    const monthName = date.format("MMMM");

    const capitalizedDay = dayName.charAt(0).toUpperCase() + dayName.slice(1);

    return `${capitalizedDay} ${dayNumber} de ${monthName}`;
  }, [selectedDate]);

  const copyJSONToClipboard = () => {
    const json = localStorage.getItem(selectedDate);
    if (json) {
      toast.success("Datos del día copiados");
      navigator.clipboard.writeText(JSON.stringify(day));
    } else {
      toast.error("No se encontraron datos del " + currentDate);
    }
  };

  const copyDefaultWeekToClipboard = () => {
    const week = { ...defaultWeek };
    week.weekStartDate = formatDate(getMonday());
    toast.success("Default Week copiada");
    navigator.clipboard.writeText(JSON.stringify(week));
  };

  const getTotalTime = (time: string) => {
    if (!time || time === "0:00") return "";
    return ` - ${time}`;
  };

  if (!selectedDate) {
    return (
      <div>
        <Title level={4}>Selecciona un día</Title>
        <DatePicker onChange={handleDateChange} format="YYYY-MM-DD" />
      </div>
    );
  }

  return (
    <Form form={form} layout="vertical" onFinish={onFinish}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        {currentDate}
        <DatePicker
          format="YYYY-MM-DD"
          onChange={handleDateChange}
          value={dayjs(selectedDate)}
          placeholder="Change day"
        />
      </div>

      <Divider />

      <Collapse accordion>
        <Panel header="Horarios clave" key="horarios">
          <Form.Item label="Hora de dormir" name="sleepTime">
            <Input autoComplete="off" />
          </Form.Item>
          <Form.Item label="Hora de despertador" name="wakeUpTime">
            <Input autoComplete="off" />
          </Form.Item>
          <Form.Item label="Me volví a acostar en la cama?" name="goToBedAgain">
            <Switch checkedChildren="Sí" unCheckedChildren="No" />
          </Form.Item>
          <Form.Item
            label="Tiempo desde que sonó hasta iniciar"
            name="timeFromWakeUpToWork"
          >
            <Input autoComplete="off" />
          </Form.Item>
          <Form.Item label="Hora de comenzar trabajo" name="startWorkTime">
            <Input autoComplete="off" />
          </Form.Item>
          <Form.Item label="Hora de terminar trabajo" name="quitWorkTime">
            <Input autoComplete="off" />
          </Form.Item>
          <Form.Item label="Tiempo haciendo ejercicio" name="exerciseTime">
            <Input autoComplete="off" />
          </Form.Item>
        </Panel>
      </Collapse>

      <Divider orientation="left">Fases del día</Divider>
      <Collapse accordion>
        {phaseNames.map((name, index) => (
          <Panel
            header={`${name} ${getTotalTime(day.phases[index]?.total)}`}
            key={index + 1}
          >
            <Form.Item
              label={"Tiempo en " + projectNames[0]}
              name={["phases", index, "project1"]}
            >
              <Input autoComplete="off" />
            </Form.Item>
            <Form.Item
              label={"Tiempo en " + projectNames[1]}
              name={["phases", index, "project2"]}
            >
              <Input autoComplete="off" />
            </Form.Item>
            <Form.Item
              label={"Tiempo en " + projectNames[2]}
              name={["phases", index, "project3"]}
            >
              <Input autoComplete="off" />
            </Form.Item>

            <Divider orientation="left">Actividades Adicionales</Divider>

            <Form.List name={["phases", index, "additionalActivities"]}>
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name, ...restField }) => (
                    <Space key={key} align="baseline">
                      <Form.Item {...restField} name={[name, "activityType"]}>
                        <Select style={{ width: 110 }}>
                          {activityOptions.map((opt) => (
                            <Option value={opt.value} key={opt.value}>
                              {opt.label}
                            </Option>
                          ))}
                        </Select>
                      </Form.Item>

                      <Form.Item {...restField} name={[name, "time"]}>
                        <Input autoComplete="off" />
                      </Form.Item>

                      <Form.Item
                        {...restField}
                        name={[name, "usedTechDevice"]}
                        valuePropName="checked"
                        style={{ minWidth: 72 }}
                      >
                        <Checkbox>
                          <LaptopOutlined /> / <PhoneOutlined />
                        </Checkbox>
                      </Form.Item>

                      <Button
                        danger
                        style={{ padding: 6 }}
                        onClick={() =>
                          modal.confirm({
                            title: "¿Eliminar actividad?",
                            onOk: () => remove(name),
                            maskClosable: true,
                          })
                        }
                      >
                        <CloseOutlined />
                      </Button>
                    </Space>
                  ))}

                  <Button type="dashed" onClick={() => add()}>
                    + Añadir Actividad
                  </Button>
                </>
              )}
            </Form.List>
          </Panel>
        ))}
      </Collapse>

      <Divider />

      <Title level={4}>Total del día {getTotalTime(day.dayTotals.work)}</Title>
      <Descriptions column={1} bordered size="small">
        <Descriptions.Item label={projectNames[0]}>
          {day.dayTotals.project1 +
            calcularPorcentaje(day.dayTotals.work, day.dayTotals.project1)}
        </Descriptions.Item>
        <Descriptions.Item label={projectNames[1]}>
          {day.dayTotals.project2 +
            calcularPorcentaje(day.dayTotals.work, day.dayTotals.project2)}
        </Descriptions.Item>
        <Descriptions.Item label={projectNames[2]}>
          {day.dayTotals.project3 +
            calcularPorcentaje(day.dayTotals.work, day.dayTotals.project3)}
        </Descriptions.Item>
      </Descriptions>

      <br />

      <Collapse accordion>
        <Panel
          header={`Tiempo en juntas ${getTotalTime(
            day.meetings.total
          )}${calcularPorcentaje(day.dayTotals.work, day.meetings.total)}`}
          key={0}
        >
          <Form.Item
            label={"Tiempo en juntas en " + projectNames[0]}
            name={["meetings", "project1"]}
          >
            <Input autoComplete="off" />
          </Form.Item>
          <Form.Item
            label={"Tiempo en juntas en " + projectNames[1]}
            name={["meetings", "project2"]}
          >
            <Input autoComplete="off" />
          </Form.Item>
          <Form.Item
            label={"Tiempo en juntas en " + projectNames[2]}
            name={["meetings", "project3"]}
          >
            <Input autoComplete="off" />
          </Form.Item>
        </Panel>
      </Collapse>

      <br />

      <Collapse accordion>
        <Panel
          header={`Otras actividades ${getTotalTime(
            day.dayTotals.otherActivities
          )}`}
          key={0}
        >
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="Desayuno">
              {day.dayTotals.breakfast}
            </Descriptions.Item>
            <Descriptions.Item label="Comida">
              {day.dayTotals.lunch}
            </Descriptions.Item>
            <Descriptions.Item label="Ida al baño">
              {day.dayTotals.restroom}
            </Descriptions.Item>
            <Descriptions.Item label="Relajarme">
              {day.dayTotals.relax}
            </Descriptions.Item>
            <Descriptions.Item label="Pendientes">
              {day.dayTotals.errands}
            </Descriptions.Item>
          </Descriptions>
        </Panel>
      </Collapse>

      <br />

      <Collapse accordion>
        <Panel
          header={
            "Total semana" + (weekTotals.total ? " - " + weekTotals.total : "")
          }
          key={0}
        >
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label={projectNames[0]}>
              {weekTotals.project1}
            </Descriptions.Item>
            <Descriptions.Item label={projectNames[1]}>
              {weekTotals.project2}
            </Descriptions.Item>
            <Descriptions.Item label={projectNames[2]}>
              {weekTotals.project3}
            </Descriptions.Item>
          </Descriptions>
        </Panel>
      </Collapse>

      <div
        style={{
          marginTop: 24,
          display: "flex",
          justifyContent: "space-between",
          width: "100%",
        }}
      >
        <Button
          type="default"
          htmlType="button"
          onClick={() => setModalOpen(true)}
        >
          Manual
        </Button>
        <Button type="default" htmlType="button" onClick={copyJSONToClipboard}>
          Copiar JSON
        </Button>
        <Form.Item>
          <Button type="primary" htmlType="submit">
            Guardar Día
          </Button>
        </Form.Item>
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          width: "100%",
        }}
      >
        <Button
          type="default"
          htmlType="button"
          onClick={copyDefaultWeekToClipboard}
        >
          Copy Default Week
        </Button>

        <Button
          type="default"
          htmlType="button"
          onClick={() => {
            setWeekTotals(generateWeekTotals());
            toast.success("Datos de la semana calculados");
          }}
        >
          Generar Total Semana
        </Button>
      </div>

      <ManualModal
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onSubmit={manualSubmit}
      />

      {modalContextHolder}
      {messageContextHolder}
    </Form>
  );
};

export default DayForm;
