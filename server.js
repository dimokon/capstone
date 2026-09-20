require("dotenv").config();
const express = require("express");
const mysql = require("mysql2");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const fs = require("fs");
const session = require("express-session");
const methodOverride = require("method-override");
const multer = require("multer");
const path = require("path");
const { students, events } = require("./data/mockData");

const dbConn = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "L!rg2x!220X75WM",
  database: "kaloboyei_school",
});

dbConn.connect((error) => {
  if (error) {
    console.error("MySQL connection failed:", error.message);
    return;
  }
  console.log("Connected to MySQL database: kaloboyei_school");
});
const db = dbConn.promise();

async function ensureGallerySchema() {
  try {
    const [columns] = await db.query("SHOW COLUMNS FROM gallery");
    const fieldNames = columns.map((column) => column.Field);

    if (!fieldNames.includes("category")) {
      await db.query("ALTER TABLE gallery ADD COLUMN category VARCHAR(100)");
    }

    if (!fieldNames.includes("is_featured")) {
      await db.query(
        "ALTER TABLE gallery ADD COLUMN is_featured BOOLEAN NOT NULL DEFAULT FALSE",
      );
    }

    console.log("Gallery schema verified.");
  } catch (error) {
    console.error("Gallery schema check failed:", error.message);
  }
}

const app = express();
const port = process.env.PORT || 3000;
const resultUploadDirectory = path.join(__dirname, "private", "results");
const galleryUploadDirectory = path.join(
  __dirname,
  "public",
  "uploads",
  "gallery",
);
fs.mkdirSync(resultUploadDirectory, { recursive: true });
fs.mkdirSync(galleryUploadDirectory, { recursive: true });
const resultUpload = multer({
  storage: multer.diskStorage({
    destination: resultUploadDirectory,
    filename: (req, file, callback) =>
      callback(null, `${crypto.randomUUID()}.pdf`),
  }),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, callback) => {
    if (file.mimetype !== "application/pdf")
      return callback(new Error("Only PDF files are allowed."));
    callback(null, true);
  },
});
const galleryUpload = multer({
  storage: multer.diskStorage({
    destination: galleryUploadDirectory,
    filename: (req, file, callback) => {
      const extension = path.extname(file.originalname).toLowerCase();
      callback(null, `${crypto.randomUUID()}${extension}`);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, callback) => {
    if (
      !["image/jpeg", "image/png", "image/webp", "image/gif"].includes(
        file.mimetype,
      )
    )
      return callback(
        new Error("Only JPG, PNG, WEBP or GIF images are allowed."),
      );
    callback(null, true);
  },
});

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.use(methodOverride("_method"));
app.use(
  session({
    secret: process.env.SESSION_SECRET || "kaloboyei-development-secret",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 8 },
  }),
);

app.use((req, res, next) => {
  res.locals.currentUser = req.session.student || null;
  res.locals.currentTeacher = req.session.teacher || null;
  res.locals.currentAdmin = req.session.admin || null;
  res.locals.currentPath = req.path;
  next();
});

const requireAdmin = (req, res, next) => {
  if (!req.session.admin) return res.redirect("/admin/login");
  next();
};
const requireTeacher = (req, res, next) => {
  if (!req.session.teacher) return res.redirect("/teacher/login");
  next();
};

app.get("/", async (req, res) => {
  let gallery = [];
  let featuredImage = null;

  try {
    const [featuredRows] = await db.query(
      "SELECT title, image_url AS image, category FROM gallery WHERE is_featured = TRUE LIMIT 1",
    );
    const [galleryRows] = await db.query(
      "SELECT title, image_url AS image, category FROM gallery WHERE is_featured = FALSE OR is_featured IS NULL ORDER BY created_at DESC LIMIT 6",
    );

    featuredImage = featuredRows[0] || galleryRows[0] || null;
    gallery =
      featuredImage &&
      galleryRows[0] &&
      galleryRows[0].image === featuredImage.image
        ? galleryRows.slice(1)
        : galleryRows;
  } catch (error) {
    console.error("Loading gallery preview failed:", error.message);
  }

  res.render("home", {
    title: "A school where every future has room to grow",
    events,
    gallery,
    featuredImage,
  });
});
app.get("/about", (req, res) =>
  res.render("about", { title: "About Kaloboyei" }),
);
app.get("/events", (req, res) =>
  res.render("events", { title: "What is happening at Kaloboyei", events }),
);
app.get("/gallery", async (req, res) => {
  let gallery = [];
  try {
    const [galleryRows] = await db.query(
      "SELECT title, image_url AS image, category FROM gallery ORDER BY created_at DESC",
    );
    gallery = galleryRows;
  } catch (error) {
    console.error("Loading gallery failed:", error.message);
  }
  res.render("gallery", { title: "Life at Kaloboyei", gallery });
});
app.get("/donate", (req, res) =>
  res.render("donate", { title: "Help a learner keep learning" }),
);

app.get("/student/login", (req, res) =>
  res.render("student-login", { title: "Student results portal", error: null }),
);
app.get("/student/dashboard", (req, res) => {
  if (!req.session.student) return res.redirect("/student/login");
  res.render("student-dashboard", {
    title: "My learning dashboard",
    student: req.session.student,
  });
});
app.post("/student/logout", (req, res) =>
  req.session.destroy(() => res.redirect("/")),
);

app.post("/student/login", async (req, res) => {
  const assessmentNumber = (req.body.assessmentNumber || "")
    .trim()
    .toUpperCase();
  const password = req.body.password || "";

  try {
    const [studentRows] = await db.query(
      "SELECT id, assessment_number, full_name, class_grade, password FROM students WHERE assessment_number = ? LIMIT 1",
      [assessmentNumber],
    );
    const studentRecord = studentRows[0];
    if (
      studentRecord &&
      (await bcrypt.compare(password, studentRecord.password))
    ) {
      const [results] = await db.query(
        "SELECT id, subject, score, term, year, result_pdf_url FROM results WHERE student_id = ? ORDER BY year DESC, term DESC",
        [studentRecord.id],
      );
      req.session.student = {
        id: studentRecord.id,
        assessmentNumber: studentRecord.assessment_number,
        name: studentRecord.full_name,
        className: studentRecord.class_grade || "Student",
        results: results.map((result) => ({
          subject: result.subject,
          score: result.score === null ? null : Number(result.score),
          grade:
            result.score === null
              ? "PDF"
              : Number(result.score) >= 80
                ? "A"
                : Number(result.score) >= 70
                  ? "B"
                  : "C",
          note: `${result.term || "Latest"} · ${result.year}`,
          id: result.id,
          pdfUrl: result.result_pdf_url,
        })),
        assignments: [],
      };
      return res.redirect("/student/dashboard");
    }
  } catch (error) {
    console.error("Student login failed:", error.message);
  }

  const demoStudent = students[assessmentNumber];
  if (demoStudent && assessmentNumber === "KLS2024018" && password === "demo") {
    req.session.student = demoStudent;
    return res.redirect("/student/dashboard");
  }
  return res.status(401).render("student-login", {
    title: "Student results portal",
    error: "We could not find that assessment number or password.",
  });
});

app.get("/student/register", (req, res) =>
  res.render("student-register", {
    title: "Student registration",
    error: null,
    success: null,
    formData: {},
  }),
);
app.post("/student/register", async (req, res) => {
  const name = (req.body.name || "").trim();
  const assessmentNumber = (req.body.assessmentNumber || "")
    .trim()
    .toUpperCase();
  const password = req.body.password || "";
  const confirmPassword = req.body.confirmPassword || "";
  const formData = { name, assessmentNumber };

  const renderError = (error, status = 400) =>
    res.status(status).render("student-register", {
      title: "Student registration",
      error,
      success: null,
      formData,
    });

  if (!name || !assessmentNumber || !password || !confirmPassword)
    return renderError("Please complete every field.");
  if (password.length < 6)
    return renderError("Your password must be at least 6 characters.");
  if (password !== confirmPassword)
    return renderError("The passwords do not match.");

  try {
    const [existingStudents] = await db.query(
      "SELECT id FROM students WHERE assessment_number = ? LIMIT 1",
      [assessmentNumber],
    );
    if (existingStudents.length)
      return renderError("That assessment number is already registered.", 409);

    const passwordHash = await bcrypt.hash(password, 12);
    await db.query(
      "INSERT INTO students (assessment_number, password, full_name) VALUES (?, ?, ?)",
      [assessmentNumber, passwordHash, name],
    );
    return res.render("student-register", {
      title: "Student registration",
      error: null,
      success: "Your account is ready. You can now sign in.",
      formData: {},
    });
  } catch (error) {
    console.error("Student registration failed:", error.message);
    return renderError(
      "We could not create your account right now. Please try again.",
      500,
    );
  }
});
app.get("/teacher/login", (req, res) =>
  res.render("teacher-login", { title: "Teacher workspace", error: null }),
);
app.post("/teacher/login", async (req, res) => {
  const email = (req.body.email || "").trim().toLowerCase();
  const isDemoTeacher =
    email === "teacher@kaloboyei.org" && req.body.password === "demo";
  if (isDemoTeacher) {
    req.session.teacher = {
      name: "Demo Teacher",
      email: "teacher@kaloboyei.org",
    };
    return res.redirect("/teacher/dashboard");
  }

  try {
    const [teachers] = await db.query(
      "SELECT id, name, email, password FROM users WHERE email = ? AND role = 'teacher' LIMIT 1",
      [email],
    );
    const teacher = teachers[0];
    const passwordMatches =
      teacher &&
      (await bcrypt.compare(req.body.password || "", teacher.password));
    if (passwordMatches) {
      req.session.teacher = {
        id: teacher.id,
        name: teacher.name,
        email: teacher.email,
      };
      return res.redirect("/teacher/dashboard");
    }
  } catch (error) {
    console.error("Teacher login failed:", error.message);
  }

  res.status(401).render("teacher-login", {
    title: "Teacher workspace",
    error: "The email or password is incorrect.",
  });
});
app.get("/teacher/register", requireAdmin, (req, res) =>
  res.render("teacher-register", {
    title: "Teacher registration",
    error: null,
    success: null,
    formData: {},
  }),
);
app.post("/teacher/register", requireAdmin, async (req, res) => {
  const name = (req.body.name || "").trim();
  const email = (req.body.email || "").trim().toLowerCase();
  const password = req.body.password || "";
  const confirmPassword = req.body.confirmPassword || "";
  const formData = { name, email };

  if (!name || !email || !password || !confirmPassword)
    return res.status(400).render("teacher-register", {
      title: "Teacher registration",
      error: "Please complete every field.",
      success: null,
      formData,
    });
  if (password.length < 6)
    return res.status(400).render("teacher-register", {
      title: "Teacher registration",
      error: "Your password must be at least 6 characters.",
      success: null,
      formData,
    });
  if (password !== confirmPassword)
    return res.status(400).render("teacher-register", {
      title: "Teacher registration",
      error: "The passwords do not match.",
      success: null,
      formData,
    });
  try {
    const [existingTeachers] = await db.query(
      "SELECT id FROM users WHERE email = ? LIMIT 1",
      [email],
    );
    if (existingTeachers.length)
      return res.status(409).render("teacher-register", {
        title: "Teacher registration",
        error: "An account with that email already exists.",
        success: null,
        formData,
      });

    const passwordHash = await bcrypt.hash(password, 12);
    await db.query(
      "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, 'teacher')",
      [name, email, passwordHash],
    );
    return res.render("teacher-register", {
      title: "Teacher registration",
      error: null,
      success: "Your registration is complete. You can now sign in.",
      formData: {},
    });
  } catch (error) {
    console.error("Teacher registration failed:", error.message);
    return res.status(500).render("teacher-register", {
      title: "Teacher registration",
      error: "We could not create your account right now. Please try again.",
      success: null,
      formData,
    });
  }
});
app.get("/teacher/dashboard", requireTeacher, async (req, res) => {
  let availableStudents = [];
  try {
    const [studentRows] = await db.query(
      "SELECT id, assessment_number, full_name, class_grade FROM students ORDER BY full_name",
    );
    availableStudents = studentRows;
  } catch (error) {
    console.error("Loading students for results upload failed:", error.message);
  }
  res.render("teacher-dashboard", {
    title: "Teacher workspace",
    teacher: req.session.teacher,
    availableStudents,
    uploaded: req.query.uploaded === "1",
  });
});
app.post(
  "/teacher/results",
  requireTeacher,
  (req, res, next) => {
    resultUpload.single("resultsFile")(req, res, (error) => {
      if (error) return res.status(400).send(error.message);
      next();
    });
  },
  async (req, res) => {
    const studentId = Number(req.body.studentId);
    const subject = (req.body.subject || "").trim();
    const term = (req.body.term || "").trim();
    const year = Number(req.body.year);
    if (!req.file || !studentId || !subject || !term || !year) {
      if (req.file) fs.unlink(req.file.path, () => {});
      return res
        .status(400)
        .send("Student, subject, term, year and a PDF are required.");
    }
    if (!req.session.teacher.id) {
      fs.unlink(req.file.path, () => {});
      return res
        .status(403)
        .send("A registered teacher account is required to upload results.");
    }

    try {
      await db.query(
        "INSERT INTO results (student_id, subject, score, term, year, uploaded_by, result_pdf_url) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [
          studentId,
          subject,
          null,
          term,
          year,
          req.session.teacher.id,
          req.file.filename,
        ],
      );
      return res.redirect("/teacher/dashboard?uploaded=1");
    } catch (error) {
      fs.unlink(req.file.path, () => {});
      console.error("Result upload failed:", error.message);
      return res.status(500).send("The result could not be saved.");
    }
  },
);

app.get("/student/results/:resultId/download", async (req, res) => {
  if (!req.session.student) return res.redirect("/student/login");
  try {
    const [rows] = await db.query(
      "SELECT result_pdf_url FROM results WHERE id = ? AND student_id = ? LIMIT 1",
      [Number(req.params.resultId), req.session.student.id],
    );
    const filename = rows[0]?.result_pdf_url;
    if (!filename) return res.status(404).send("Result PDF not found.");
    return res.download(
      path.join(resultUploadDirectory, filename),
      "exam-result.pdf",
    );
  } catch (error) {
    console.error("Result download failed:", error.message);
    return res.status(404).send("Result PDF not found.");
  }
});

app.get("/admin/login", (req, res) =>
  res.render("admin-login", { title: "Admin login", error: null }),
);
app.post("/admin/login", async (req, res) => {
  const email = (req.body.email || "").trim().toLowerCase();

  try {
    const [admins] = await db.query(
      "SELECT id, name, email, password FROM users WHERE email = ? AND role = 'admin' LIMIT 1",
      [email],
    );
    const admin = admins[0];
    const passwordMatches =
      admin && (await bcrypt.compare(req.body.password || "", admin.password));

    if (passwordMatches) {
      req.session.admin = {
        id: admin.id,
        name: admin.name,
        email: admin.email,
      };
      return res.redirect("/admin/dashboard");
    }
  } catch (error) {
    console.error("Admin login failed:", error.message);
  }

  res.status(401).render("admin-login", {
    title: "Admin login",
    error: "The admin email or password is incorrect.",
  });
});
app.get("/admin/dashboard", requireAdmin, async (req, res) => {
  try {
    const [[studentCount]] = await db.query(
      "SELECT COUNT(*) AS total FROM students",
    );
    const [[teacherCount]] = await db.query(
      "SELECT COUNT(*) AS total FROM users WHERE role = 'teacher'",
    );
    const [[resultCount]] = await db.query(
      "SELECT COUNT(*) AS total FROM results",
    );
    const [[eventCount]] = await db.query(
      "SELECT COUNT(*) AS total FROM events",
    );
    const [[galleryCount]] = await db.query(
      "SELECT COUNT(*) AS total FROM gallery",
    );

    return res.render("admin-dashboard", {
      title: "Admin dashboard",
      admin: req.session.admin,
      stats: {
        students: studentCount.total,
        teachers: teacherCount.total,
        results: resultCount.total,
        events: eventCount.total,
        gallery: galleryCount.total,
      },
    });
  } catch (error) {
    console.error("Admin dashboard failed:", error.message);
    return res.status(500).render("admin-dashboard", {
      title: "Admin dashboard",
      admin: req.session.admin,
      stats: null,
    });
  }
});
app.post(
  "/admin/gallery",
  requireAdmin,
  (req, res, next) => {
    galleryUpload.single("image")(req, res, (error) => {
      if (error) return res.status(400).send(error.message);
      next();
    });
  },
  async (req, res) => {
    const title = (req.body.title || "").trim();
    const category = (req.body.category || "").trim();
    const isFeatured =
      req.body.isFeatured === "true" ||
      req.body.isFeatured === "on" ||
      req.body.isFeatured === "1";

    if (!req.file || !title || !category) {
      if (req.file) fs.unlink(req.file.path, () => {});
      return res.status(400).send("Title, category and an image are required.");
    }
    if (!req.session.admin.id) {
      fs.unlink(req.file.path, () => {});
      return res.status(403).send("A database admin account is required.");
    }

    try {
      await db.query("START TRANSACTION");

      if (isFeatured) {
        await db.query(
          "UPDATE gallery SET is_featured = FALSE WHERE is_featured = TRUE",
        );
      }

      await db.query(
        "INSERT INTO gallery (title, category, is_featured, image_url, uploaded_by) VALUES (?, ?, ?, ?, ?)",
        [
          title,
          category,
          isFeatured ? 1 : 0,
          `/uploads/gallery/${req.file.filename}`,
          req.session.admin.id,
        ],
      );

      await db.query("COMMIT");
      return res.redirect("/admin/dashboard?galleryUploaded=1");
    } catch (error) {
      await db.query("ROLLBACK").catch(() => {});
      fs.unlink(req.file.path, () => {});
      console.error("Gallery upload failed:", error.message);
      return res.status(500).send("The gallery image could not be saved.");
    }
  },
);
app.post("/admin/logout", (req, res) => {
  req.session.admin = null;
  res.redirect("/admin/login");
});

app.use((req, res) =>
  res.status(404).render("404", { title: "Page not found" }),
);

ensureGallerySchema().then(() => {
  app.listen(port, () =>
    console.log(`Kaloboyei School portal running at http://localhost:${port}`),
  );
});
