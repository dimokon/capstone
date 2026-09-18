const students = {
  KLS2024018: {
    assessmentNumber: "KLS2024018",
    name: "Amina Noor",
    className: "Grade 8 · Blue",
    guardian: "Hawa Noor",
    attendance: "96%",
    average: "78.4%",
    position: "8 of 42",
    results: [
      { subject: "English", score: 84, grade: "A", note: "Excellent progress" },
      {
        subject: "Mathematics",
        score: 76,
        grade: "B+",
        note: "Keep practising algebra",
      },
      {
        subject: "Integrated Science",
        score: 79,
        grade: "B+",
        note: "Strong practical work",
      },
      {
        subject: "Social Studies",
        score: 75,
        grade: "B",
        note: "Good understanding",
      },
      { subject: "Kiswahili", score: 78, grade: "B+", note: "Very consistent" },
    ],
    assignments: [
      {
        subject: "Mathematics",
        title: "Linear equations practice",
        due: "18 Sep 2026",
        status: "Due soon",
      },
      {
        subject: "English",
        title: "Write a one-page memoir",
        due: "20 Sep 2026",
        status: "Assigned",
      },
      {
        subject: "Science",
        title: "Water and soil observation",
        due: "24 Sep 2026",
        status: "Assigned",
      },
    ],
  },
};

const events = [
  {
    date: "24",
    month: "SEP",
    title: "Community learning day",
    detail:
      "Families, partners and learners gather for a day of reading, play and shared stories.",
    tag: "Community",
  },
  {
    date: "02",
    month: "OCT",
    title: "Term 3 examinations",
    detail: "Learners begin their end-of-term assessment week.",
    tag: "Academic",
  },
  {
    date: "11",
    month: "OCT",
    title: "School garden open day",
    detail:
      "See how our agriculture club is growing food and practical skills.",
    tag: "Clubs",
  },
];

module.exports = { students, events };
