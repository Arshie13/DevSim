// Mock data for the student portal

export interface Student {
  id: string;
  name: string;
  email: string;
  studentId: string;
  program: string;
  yearLevel: string;
  avatar?: string;
}

export interface Grade {
  id: string;
  courseCode: string;
  courseName: string;
  units: number;
  grade: string;
  semester: string;
  academicYear: string;
}

export interface ScheduleItem {
  id: string;
  courseCode: string;
  courseName: string;
  day: string;
  time: string;
  room: string;
  professor: string;
}

export interface TuitionFee {
  id: string;
  description: string;
  amount: number;
  dueDate: string;
  status: 'paid' | 'pending' | 'overdue';
  semester: string;
  academicYear: string;
}

export interface Standing {
  totalUnits: number;
  gpa: number;
  totalCredits: number;
  earnedCredits: number;
  academicStatus: 'good' | 'warning' | 'probation';
  semester: string;
  academicYear: string;
}

// Current logged in student
export const currentStudent: Student = {
  id: "12-346-78",
  name: "John Michael Smith",
  email: "john.smith@school.edu",
  studentId: "12-346-78",
  program: "Bachelor of Science in Computer Science",
  yearLevel: "3rd Year",
};

// Grades data
export const grades: Grade[] = [
  {
    id: "1",
    courseCode: "CS 301",
    courseName: "Data Structures and Algorithms",
    units: 3,
    grade: "A",
    semester: "1st Semester",
    academicYear: "2025-2026",
  },
  {
    id: "2",
    courseCode: "CS 302",
    courseName: "Database Management Systems",
    units: 3,
    grade: "A-",
    semester: "1st Semester",
    academicYear: "2025-2026",
  },
  {
    id: "3",
    courseCode: "CS 303",
    courseName: "Software Engineering",
    units: 3,
    grade: "B+",
    semester: "1st Semester",
    academicYear: "2025-2026",
  },
  {
    id: "4",
    courseCode: "MATH 301",
    courseName: "Discrete Mathematics",
    units: 3,
    grade: "A",
    semester: "1st Semester",
    academicYear: "2025-2026",
  },
  {
    id: "5",
    courseCode: "CS 201",
    courseName: "Computer Architecture",
    units: 3,
    grade: "B",
    semester: "2nd Semester",
    academicYear: "2024-2025",
  },
  {
    id: "6",
    courseCode: "CS 202",
    courseName: "Operating Systems",
    units: 3,
    grade: "A-",
    semester: "2nd Semester",
    academicYear: "2024-2025",
  },
  {
    id: "7",
    courseCode: "CS 203",
    courseName: "Computer Networks",
    units: 3,
    grade: "B+",
    semester: "2nd Semester",
    academicYear: "2024-2025",
  },
  {
    id: "8",
    courseCode: "MATH 201",
    courseName: "Linear Algebra",
    units: 3,
    grade: "B",
    semester: "2nd Semester",
    academicYear: "2024-2025",
  },
];

// Schedule data
export const schedule: ScheduleItem[] = [
  {
    id: "1",
    courseCode: "CS 301",
    courseName: "Data Structures and Algorithms",
    day: "Monday, Wednesday, Friday",
    time: "9:00 AM - 10:30 AM",
    room: "Room 301",
    professor: "Dr. Sarah Johnson",
  },
  {
    id: "2",
    courseCode: "CS 302",
    courseName: "Database Management Systems",
    day: "Tuesday, Thursday",
    time: "1:00 PM - 2:30 PM",
    room: "Room 205",
    professor: "Prof. Michael Brown",
  },
  {
    id: "3",
    courseCode: "CS 303",
    courseName: "Software Engineering",
    day: "Monday, Wednesday",
    time: "2:00 PM - 3:30 PM",
    room: "Room 402",
    professor: "Dr. Emily Davis",
  },
  {
    id: "4",
    courseCode: "MATH 301",
    courseName: "Discrete Mathematics",
    day: "Tuesday, Thursday",
    time: "10:00 AM - 11:30 AM",
    room: "Room 103",
    professor: "Dr. Robert Wilson",
  },
];

// Tuition fees data
export const tuitionFees: TuitionFee[] = [
  {
    id: "1",
    description: "Tuition Fee - 1st Semester 2025-2026",
    amount: 25000,
    dueDate: "2025-08-15",
    status: "paid",
    semester: "1st Semester",
    academicYear: "2025-2026",
  },
  {
    id: "2",
    description: "Laboratory Fee - CS 301",
    amount: 1500,
    dueDate: "2025-08-15",
    status: "paid",
    semester: "1st Semester",
    academicYear: "2025-2026",
  },
  {
    id: "3",
    description: "Laboratory Fee - CS 302",
    amount: 1500,
    dueDate: "2025-08-15",
    status: "paid",
    semester: "1st Semester",
    academicYear: "2025-2026",
  },
  {
    id: "4",
    description: "Library Fee",
    amount: 500,
    dueDate: "2025-08-15",
    status: "paid",
    semester: "1st Semester",
    academicYear: "2025-2026",
  },
  {
    id: "5",
    description: "Student Council Fee",
    amount: 300,
    dueDate: "2025-08-15",
    status: "paid",
    semester: "1st Semester",
    academicYear: "2025-2026",
  },
  {
    id: "6",
    description: "Tuition Fee - 2nd Semester 2025-2026",
    amount: 25000,
    dueDate: "2026-01-15",
    status: "pending",
    semester: "2nd Semester",
    academicYear: "2025-2026",
  },
];

// Standing data
export const currentStanding: Standing = {
  totalUnits: 21,
  gpa: 3.67,
  totalCredits: 90,
  earnedCredits: 78,
  academicStatus: "good",
  semester: "1st Semester",
  academicYear: "2025-2026",
};

// Grade points per letter grade
const GRADE_POINTS: Record<string, number> = {
  "A": 4.0, "A-": 3.7, "B+": 3.3, "B": 3.0, "B-": 2.7,
  "C+": 2.3, "C": 2.0, "C-": 1.7, "D+": 1.3, "D": 1.0, "F": 0.0,
};

/**
 * Single source of truth for the cumulative GPA, weighted by course units.
 *
 * Previously each page computed (or hard-coded) its own value, so the dashboard
 * and standing pages drifted out of sync with the grades page.
 */
export function computeCumulativeGPA(gradeList: Grade[]): number {
  if (!gradeList || gradeList.length === 0) return 0;

  let totalPoints = 0;
  let totalUnits = 0;

  for (const entry of gradeList) {
    const points = GRADE_POINTS[entry.grade] ?? 0;
    totalPoints += points * entry.units;
    totalUnits += entry.units;
  }

  if (totalUnits === 0) return 0;

  return totalPoints / totalUnits;
}
