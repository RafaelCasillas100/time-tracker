import { useState } from "react";
import Day from "./Day";
import ProjectNames from "./ProjectNames";
import NavigationBar, { pages } from "./NavigationBar";
import Stats from "./stats/Stats";

function App() {
  const [currentPage, setCurrentPage] = useState<string>(pages.day);

  return (
    <NavigationBar setCurrentPage={setCurrentPage}>
      {currentPage === pages.day && <Day />}
      {currentPage === pages.stats && <Stats />}
      {currentPage === pages.projectNames && <ProjectNames />}
    </NavigationBar>
  );
}

export default App;
