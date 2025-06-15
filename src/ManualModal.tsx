import { useEffect, useState } from "react";
import { Modal, Input, Button } from "antd";

type ManualModalProps = {
  open: boolean;
  onCancel: () => void;
  onSubmit: (project1: string, project2: string, project3: string) => void;
};

const ManualModal = ({ open, onCancel, onSubmit }: ManualModalProps) => {
  const [project1, setProject1] = useState("");
  const [project2, setProject2] = useState("");
  const [project3, setProject3] = useState("");

  const [projectNames, setProjectNames] = useState<[string, string, string]>([
    "Proyecto 1",
    "Proyecto 2",
    "Proyecto 3",
  ]);

  useEffect(() => {
    const names = localStorage.getItem("projectNames");
    if (names) setProjectNames(JSON.parse(names));
  }, []);

  const handleSubmit = () => {
    onSubmit(project1 || "0:00", project2 || "0:00", project3 || "0:00");
    setProject1("");
    setProject2("");
    setProject3("");
  };

  return (
    <Modal
      title="Ingresa los valores"
      open={open}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Cancel
        </Button>,
        <Button key="submit" type="primary" onClick={handleSubmit}>
          Submit
        </Button>,
      ]}
    >
      Tiempo trabajado en {projectNames[0]}
      <Input
        value={project1}
        onChange={(e) => setProject1(e.target.value)}
        style={{ marginBottom: 12 }}
      />
      Tiempo trabajado en {projectNames[1]}
      <Input
        value={project2}
        onChange={(e) => setProject2(e.target.value)}
        style={{ marginBottom: 12 }}
      />
      Tiempo trabajado en {projectNames[2]}
      <Input value={project3} onChange={(e) => setProject3(e.target.value)} />
    </Modal>
  );
};

export default ManualModal;
