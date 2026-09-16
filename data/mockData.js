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

const gallery = [
  {
    title: "Learning under every sky",
    category: "Classrooms",
    image:
      "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1000&q=85",
  },
  {
    title: "A place to belong",
    category: "Community",
    image:
      "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=1000&q=85",
  },
  {
    title: "Curious hands, bright futures",
    category: "Clubs",
    image:
      "https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=1000&q=85",
  },
  {
    title: "Every voice matters",
    category: "Student life",
    image:
      "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=1000&q=85",
  },
  {
    title: "Growing together",
    category: "Agriculture",
    image:
      "https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=1000&q=85",
  },
  {
    title: "The joy of discovery",
    category: "Science",
    image:
      "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=1000&q=85",
  },
];

module.exports = { students, events, gallery };
