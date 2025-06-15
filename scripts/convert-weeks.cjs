const fs = require("fs");
const path = require("path");

const inputFile = path.join(__dirname, "weeks.txt");
const outputFile = path.join(__dirname, "weeks.json");
const text = fs.readFileSync(inputFile, "utf8");

function parseTimeToMinutes(str) {
  if (!str || !/^\d+:\d{2}$/.test(str)) return 0;
  const [h, m] = str.split(":").map(Number);
  return h * 60 + m;
}

function formatMinutesToTime(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}:${m.toString().padStart(2, "0")}`;
}

function parseWeeks(text) {
  const weekBlocks = text.split(/\n(?=\d{4} - \w+ \d+ week)/);
  const weeks = [];

  for (const block of weekBlocks) {
    const lines = block.trim().split("\n");
    if (lines.length === 0) continue;

    const weekHeader = lines.shift();
    const match = weekHeader.match(/(\d{4}) - (\w+) (\d{1,2}) week/);
    if (!match) continue;

    const [_, year, monthName, day] = match;
    const weekStartDate = new Date(`${monthName} ${day}, ${year}`);
    const startISO = weekStartDate.toISOString().split("T")[0];

    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const projectData = {};
    let currentProject = "";

    for (const line of lines) {
      if (!line.trim()) continue;
      if (/^[A-Za-z0-9]+$/.test(line)) {
        currentProject = line.toLowerCase();
        projectData[currentProject] = {};
      } else {
        const [day, time] = line.split(": ");
        if (day && time) {
          projectData[currentProject][day] = time.trim();
        }
      }
    }

    const days = {};
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStartDate);
      date.setDate(weekStartDate.getDate() + i);
      const dayName = dayNames[date.getDay()];
      const isoDate = date.toISOString().split("T")[0];

      const totals = {};
      let totalMinutes = 0;
      let hasData = false;

      for (const project in projectData) {
        const time = projectData[project][dayName] || "";
        totals[project] = time;
        if (time) {
          totalMinutes += parseTimeToMinutes(time);
          hasData = true;
        }
      }

      if (hasData) {
        totals.work = formatMinutesToTime(totalMinutes);
        days[dayName] = { date: isoDate, dayTotals: totals };
      } else {
        days[dayName] = null;
      }
    }

    weeks.push({
      weekStartDate: startISO,
      notes: "",
      days,
    });
  }

  return { weeks };
}

const parsed = parseWeeks(text);
fs.writeFileSync(outputFile, JSON.stringify(parsed, null, 2), "utf8");
console.log(`✅ Done! Output written to ${outputFile}`);
