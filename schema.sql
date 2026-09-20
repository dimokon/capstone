-- Teachers & Admins
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'teacher') NOT NULL DEFAULT 'teacher',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Students (own login via assessment_number)
CREATE TABLE students (
  id INT AUTO_INCREMENT PRIMARY KEY,
  assessment_number VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  full_name VARCHAR(100) NOT NULL,
  class_grade VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Exam Results
CREATE TABLE results (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  subject VARCHAR(100) NOT NULL,
  score DECIMAL(5,2) NULL,
  term VARCHAR(50),
  year YEAR NOT NULL,
  uploaded_by INT NOT NULL,
  result_pdf_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (uploaded_by) REFERENCES users(id)
);

-- Assignments
CREATE TABLE assignments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(150) NOT NULL,
  description TEXT,
  class_grade VARCHAR(50),
  due_date DATE,
  file_url VARCHAR(255),
  uploaded_by INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (uploaded_by) REFERENCES users(id)
);

-- Events
CREATE TABLE events (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(150) NOT NULL,
  description TEXT,
  event_date DATE NOT NULL,
  image_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Gallery
CREATE TABLE gallery (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(150),
  category VARCHAR(100),
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  image_url VARCHAR(255) NOT NULL,
  uploaded_by INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (uploaded_by) REFERENCES users(id)
);


INSERT INTO users (name, email, password, role)
VALUES (
  'School Administrator',
  'admin@kaloboyei.org',
  '$2a$12$mWAPN5GHTAAxojRHpq7ALekjXBHKpo5klAzA5KGC512.h.sis1n4W',
  'admin'
);

  UPDATE users
  SET password = '$2a$12$Mbd7NE2M2dbKwejhRr0uQ.Vv3Upb5T6BcJPi3mvp3PnvsefhR8.au'
  WHERE email = 'admin@kaloboyei.org'
    AND role = 'admin';