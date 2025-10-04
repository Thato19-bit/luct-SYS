
CREATE TABLE IF NOT EXISTS roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE
);

INSERT INTO roles (name) VALUES 
('student'),
('lecturer'),
('prl'),
('pl'),
('admin');

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE,
    password VARCHAR(255) NOT NULL,
    role_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES roles(id)
);


INSERT INTO users (name, email, password, role_id) VALUES
('Judith', 'judith@example.com', '123456', 5),  -- admin
('Karabo', 'karabo@example.com', '123456', 2),  -- lecturer
('Moxxy', 'moxxy@example.com', '123456', 1),   -- student
('Lerato', 'lerato@example.com', '123456', 1), -- student
('Thabo', 'thabo@example.com', '123456', 2),   -- lecturer
('Thato', 'thato@example.com', '123456', 3),   -- PRL
('Refiloe', 'refiloe@example.com', '123456', 4);-- PL

CREATE TABLE IF NOT EXISTS faculties (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE
);

INSERT INTO faculties (name) VALUES 
('Science'),
('Engineering'),
('Arts'),
('Business'),
('IT');


CREATE TABLE IF NOT EXISTS courses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20) NOT NULL UNIQUE,
    description TEXT,
    faculty_id INT NOT NULL,
    FOREIGN KEY (faculty_id) REFERENCES faculties(id)
);

INSERT INTO courses (name, code, description, faculty_id) VALUES
('Mathematics', 'MAT101', 'Intro to Maths', 1),
('Physics', 'PHY101', 'Physics Basics', 1),
('Sesotho Literature', 'SEL101', 'Study of Sesotho texts', 3),
('Entrepreneurship', 'BBE101', 'Business skills', 4),
('Information Technology', 'BIT101', 'IT fundamentals', 5),
('Computer Science', 'CS101', 'Computer Science basics', 1),
('Mechanical Engineering', 'ME201', 'Intro to ME', 2),
('Business Info Tech', 'BIT201', 'Business IT', 4);


CREATE TABLE IF NOT EXISTS classes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    course_id INT NOT NULL,
    active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (course_id) REFERENCES courses(id)
);

INSERT INTO classes (name, course_id, active) VALUES
('Math - Lerato', 1, TRUE),
('Physics - Thabo', 2, TRUE),
('Sesotho Lit - Keletso', 3, TRUE),
('Entrepreneurship - Sasa', 4, TRUE),
('IT - Didi', 5, TRUE);


CREATE TABLE IF NOT EXISTS reports (
    id INT AUTO_INCREMENT PRIMARY KEY,
    course_id INT NOT NULL,
    lecturer_id INT NOT NULL,
    actual_present INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(id),
    FOREIGN KEY (lecturer_id) REFERENCES users(id)
);

INSERT INTO reports (course_id, lecturer_id, actual_present, created_at) VALUES
(6, 2, 45, NOW()),
(7, 5, 32, NOW() - INTERVAL 1 DAY),
(8, 5, 30, NOW() - INTERVAL 2 DAY);
