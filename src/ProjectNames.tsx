import { Form, Input, Button, Typography, message } from "antd";

const { Title } = Typography;

const ProjectNames = () => {
  const [form] = Form.useForm();

  const onFinish = (values: {
    project1: string;
    project2: string;
    project3: string;
  }) => {
    const nombres = [values.project1, values.project2, values.project3];
    localStorage.setItem("projectNames", JSON.stringify(nombres));
    message.success("Nombres guardados correctamente");
  };

  return (
    <div style={{ maxWidth: 400, margin: "0 auto" }}>
      <Title level={4}>Nombres de Proyectos</Title>
      <Form layout="vertical" form={form} onFinish={onFinish}>
        <Form.Item
          label="Nombre del Proyecto 1"
          name="project1"
          rules={[{ required: true }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Nombre del Proyecto 2"
          name="project2"
          rules={[{ required: true }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Nombre del Proyecto 3"
          name="project3"
          rules={[{ required: true }]}
        >
          <Input />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit">
            Guardar
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default ProjectNames;
