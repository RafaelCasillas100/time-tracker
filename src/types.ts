export type AdditionalActivity = {
  activityType: "breakfast" | "lunch" | "restroom" | "errands" | "relax";
  time: string;
  usedTechDevice: boolean;
};

export type Phase = {
  phaseNumber: 1 | 2 | 3 | 4 | 5;
  phaseName: string;
  project1: string;
  project2: string;
  project3: string;
  total: string;
  additionalActivities: AdditionalActivity[];
};

export type Day = {
  date: string;
  wakeUpTime: string;
  goToBedAgain: boolean;
  timeFromWakeUpToWork: string;
  startWorkTime: string;
  quitWorkTime: string;
  sleepTime: string;
  exerciseTime: string;
  phases: Phase[];
  dayTotals: {
    project1: string;
    project2: string;
    project3: string;
    breakfast: string;
    lunch: string;
    restroom: string;
    relax: string;
    errands: string;
    work: string;
    otherActivities: string;
  };
  meetings: {
    project1: string;
    project2: string;
    project3: string;
    total: string;
  };
};

export const activityOptions = [
  { label: "Desayuno", value: "breakfast" },
  { label: "Comida", value: "lunch" },
  { label: "Ida al baño", value: "restroom" },
  { label: "Relajarme", value: "relax" },
  { label: "Pendientes", value: "errands" },
];

export const phaseNames = [
  "5am a 8am",
  "8am a 11am",
  "11am a 2pm",
  "2pm a 6pm",
  "Después de las 6pm",
];

export const defaultDay: Day = {
  date: "",
  wakeUpTime: "",
  goToBedAgain: false,
  timeFromWakeUpToWork: "",
  startWorkTime: "",
  quitWorkTime: "",
  sleepTime: "",
  exerciseTime: "",
  phases: [1, 2, 3, 4, 5].map((n) => ({
    phaseNumber: n as 1 | 2 | 3 | 4 | 5,
    phaseName: phaseNames[n - 1],
    project1: "",
    project2: "",
    project3: "",
    total: "",
    additionalActivities: [],
  })),
  dayTotals: {
    project1: "0:00",
    project2: "0:00",
    project3: "0:00",
    breakfast: "0:00",
    lunch: "0:00",
    restroom: "0:00",
    relax: "0:00",
    errands: "0:00",
    work: "0:00",
    otherActivities: "0:00",
  },
  meetings: {
    project1: "",
    project2: "",
    project3: "",
    total: "",
  },
};

export type WeekTotals = {
  project1: string;
  project2: string;
  project3: string;
  total: string;
};

export const defaultWeekTotals: WeekTotals = {
  project1: "",
  project2: "",
  project3: "",
  total: "",
};

type DayString = "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun";

export type Week = {
  weekStartDate: string; // First day of the week, which is the Monday
  notes: string;
  days: Record<DayString, Day | null>;
};

export type RawData = { weeks: Week[] };

export type OldDay = {
  date: string;
  dayTotals: {
    project1: string;
    project2: string;
    project3: string;
    work: string;
  };
};

export const defaultWeek: Week = {
  weekStartDate: "",
  notes: "",
  days: {
    Mon: null,
    Tue: null,
    Wed: null,
    Thu: null,
    Fri: null,
    Sat: null,
    Sun: null,
  },
};
