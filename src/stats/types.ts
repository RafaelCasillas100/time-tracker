export type AdditionalActivityStats = {
  totalTime: string;
  totalTimes: number;
  avgTime: string;
};

export type AdditionalActivityWithOutDevice = {
  withDevice: AdditionalActivityStats;
  withoutDevice: AdditionalActivityStats;
};

type ProjectTotals = {
  project1: {
    total: string;
    avgPerDay: string; // dividido entre 5 si hay más de 5 días
  };
  project2: {
    total: string;
    avgPerDay: string; // dividido entre 5 si hay más de 5 días
  };
  project3: {
    total: string;
    avgPerDay: string; // dividido entre 5 si hay más de 5 días
  };
};

export type WorkByPhase = Array<{
  phaseIndex: number; // 0 = primera fase (5am-8am), etc.
  totalTime: string; // tiempo total de trabajo en esa fase, sumando todos los días
  avgTime: string; // promedio diario en esa fase
}>;

export type BaseStats = {
  // Despertar y sueño
  avgWakeUpTime?: string; // "04:48"
  avgGoToBedAgainPercentage?: number; // e.g. 20 (%)
  avgTimeFromWakeUpToWork?: string; // "0:23"
  avgStartWorkTime?: string; // "05:22"
  avgQuitWorkTime?: string; // "18:43"
  avgSleepTime?: string; // "21:48"
  avgSleepingTime?: string;
  numberOfWorkDays?: number;

  // Ejercicio
  totalExerciseTime?: string; // "3:45"
  daysExercised?: number; // 4

  // Actividades personales separadas por uso de dispositivo
  personalActivities?: {
    breakfast: AdditionalActivityWithOutDevice;
    lunch: AdditionalActivityWithOutDevice;
    restroom: AdditionalActivityWithOutDevice;
    errands: AdditionalActivityStats;
    relax: AdditionalActivityStats;
  };

  // Tiempo dedicado por fase
  workByPhase?: WorkByPhase;

  // Tiempos por proyecto
  projectTotals: ProjectTotals;

  // Meetings por proyecto
  meetings?: {
    project1: {
      total: string;
      avgPerDay: string;
      percentageOfWork: number; // entre 0 y 100
    };
    project2: {
      total: string;
      avgPerDay: string;
      percentageOfWork: number; // entre 0 y 100
    };
    project3: {
      total: string;
      avgPerDay: string;
      percentageOfWork: number; // entre 0 y 100
    };
  };

  // Metadata (opcional para debug o visualización)
  totalWorkTime: string;
  avgWorkTimePerDay: string;
};

export type ExtendedStats = BaseStats & {
  avgExerciseTimePerWeek?: string;
  avgDaysExercisedPerWeek?: number;
};

export type WeeklyStats = BaseStats & {
  weekStartDate: string; // "2025-06-16"
  numberOfWorkDays: number;
};

export type MonthlyStats = ExtendedStats & {
  month: string;
};

export type QuarterlyStats = ExtendedStats & {
  quarter: string;
};

export type YearStats = ExtendedStats & {
  year: string;
};
