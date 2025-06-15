import { MenuOutlined } from "@ant-design/icons";
import { Drawer, Button, Layout, Menu, Typography, Divider } from "antd";
import React, { useState } from "react";

const { Header, Content } = Layout;
const { Title } = Typography;

type AppLayoutProps = {
  children: React.ReactNode;
  setCurrentPage: React.Dispatch<string>;
};

export const pages = {
  day: "day",
  stats: "stats",
  projectNames: "projectNames",
} as const;

const NavigationBar = ({ children, setCurrentPage }: AppLayoutProps) => {
  const [open, setOpen] = useState(false);

  const toggleDrawer = () => setOpen(!open);

  const updatePage = (value: string) => {
    setCurrentPage(value);
    toggleDrawer();
  };

  return (
    <Layout style={{ minHeight: "100vh", backgroundColor: "white" }}>
      <Header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          backgroundColor: "white",
          paddingInline: 16,
        }}
      >
        <Title level={4} style={{ margin: 0 }}>
          Time tracker
        </Title>
        <Button type="text" icon={<MenuOutlined />} onClick={toggleDrawer} />
      </Header>

      <Drawer title="Menú" placement="left" onClose={toggleDrawer} open={open}>
        <Menu
          mode="vertical"
          onClick={(e) => updatePage(e.key)}
          items={[
            { key: pages.day, label: "Día" },
            { key: pages.stats, label: "Estadísticas" },
            { key: pages.projectNames, label: "Nombre de los proyectos" },
          ]}
        />
      </Drawer>

      <Divider style={{ margin: 0 }} />

      <Content style={{ padding: 24 }}>{children}</Content>
    </Layout>
  );
};

export default NavigationBar;
