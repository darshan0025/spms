-- PostgreSQL dump for spms_db
-- ------------------------------------------------------

-- Drop tables if they exist (PostgreSQL syntax)
DROP TABLE IF EXISTS meeting_attendance CASCADE;
DROP TABLE IF EXISTS project_meeting CASCADE;
DROP TABLE IF EXISTS project_proposal CASCADE;
DROP TABLE IF EXISTS project_document CASCADE;
DROP TABLE IF EXISTS documents CASCADE;
DROP TABLE IF EXISTS project_evaluation CASCADE;
DROP TABLE IF EXISTS project_group_member CASCADE;
DROP TABLE IF EXISTS project_group CASCADE;
DROP TABLE IF EXISTS login CASCADE;
DROP TABLE IF EXISTS staff CASCADE;
DROP TABLE IF EXISTS student CASCADE;
DROP TABLE IF EXISTS department CASCADE;
DROP TABLE IF EXISTS academic_year CASCADE;
DROP TABLE IF EXISTS project_type CASCADE;

--
-- Table structure for table academic_year
--

CREATE TABLE academic_year (
  academic_year_id SERIAL PRIMARY KEY,
  year_name varchar(20) NOT NULL,
  start_date date DEFAULT NULL,
  end_date date DEFAULT NULL,
  created_at timestamp DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO academic_year (academic_year_id, year_name, start_date, end_date, created_at, updated_at) VALUES 
(1,'2023-2024','2023-06-01','2024-05-31','2026-03-05 14:08:20','2026-03-05 14:08:20'),
(2,'2024-2025','2024-06-01','2025-05-31','2026-03-05 14:08:20','2026-03-05 14:08:20'),
(3,'2025-2026','2025-06-01','2026-05-31','2026-03-05 14:08:20','2026-03-05 14:08:20'),
(4,'2022-2023',NULL,NULL,'2026-03-05 16:36:54','2026-03-05 16:36:54');

--
-- Table structure for table department
--

CREATE TABLE department (
  department_id SERIAL PRIMARY KEY,
  department_name varchar(100) NOT NULL,
  description text,
  created_at timestamp DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO department (department_id, department_name, description, created_at, updated_at) VALUES 
(1,'Computer Engineering',NULL,'2026-03-05 14:08:10','2026-03-05 14:08:10'),
(2,'Information Technology',NULL,'2026-03-05 14:08:10','2026-03-05 14:08:10'),
(3,'Mechanical Engineering',NULL,'2026-03-05 14:08:10','2026-03-05 14:08:10'),
(4,'Electrical Engineering',NULL,'2026-03-05 14:08:10','2026-03-05 14:08:10'),
(5,'BBA',NULL,'2026-03-05 16:36:41','2026-03-05 16:36:41');

--
-- Table structure for table project_type
--

CREATE TABLE project_type (
  project_type_id SERIAL PRIMARY KEY,
  project_type_name varchar(50) NOT NULL,
  description text,
  created_at timestamp DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO project_type (project_type_id, project_type_name, description, created_at, updated_at) VALUES 
(1,'Major',NULL,'2026-03-15 05:57:07','2026-03-15 05:57:07'),
(2,'Mini',NULL,'2026-03-15 05:57:07','2026-03-15 05:57:07'),
(3,'Research',NULL,'2026-03-15 05:57:07','2026-03-15 05:57:07');

--
-- Table structure for table staff
--

CREATE TABLE staff (
  staff_id SERIAL PRIMARY KEY,
  staff_name varchar(100) NOT NULL,
  phone varchar(15) DEFAULT NULL,
  email varchar(100) DEFAULT NULL,
  password varchar(255) DEFAULT NULL,
  created_at timestamp DEFAULT CURRENT_TIMESTAMP,
  phone_no varchar(20) DEFAULT NULL,
  department_id integer REFERENCES department(department_id)
);

INSERT INTO staff (staff_id, staff_name, phone, email, password, created_at, phone_no, department_id) VALUES 
(7,'Staff1',NULL,'staff1@gmail.com',NULL,'2026-03-06 07:45:05',NULL,1),
(10,'Staff2',NULL,'staff2@gmail.com',NULL,'2026-03-15 07:43:28',NULL,2),
(11,'Staff3',NULL,'staff3@gmail.com',NULL,'2026-03-15 11:12:59',NULL,2);

--
-- Table structure for table student
--

CREATE TABLE student (
  student_id SERIAL PRIMARY KEY,
  student_name varchar(100) NOT NULL,
  phone varchar(15) DEFAULT NULL,
  email varchar(100) DEFAULT NULL,
  created_at timestamp DEFAULT CURRENT_TIMESTAMP,
  phone_no varchar(20) DEFAULT NULL,
  department_id integer REFERENCES department(department_id),
  academic_year_id integer REFERENCES academic_year(academic_year_id)
);

INSERT INTO student (student_id, student_name, phone, email, created_at, phone_no, department_id, academic_year_id) VALUES 
(1002,'darshan','+91 9090990999','darshan@gmail.com','2026-03-11 07:10:52',NULL,1,2),
(1003,'parth ','+91 7102879220','parth@gmail.com','2026-03-11 07:15:47',NULL,1,2),
(1004,'Arjun Sharma','+91 98765 43210','arjun.sharma@example.com','2026-03-15 08:27:11',NULL,2,3),
(1005,'Priya Patel','+91 91234 56789','priya@gmail.com','2026-03-15 08:28:21',NULL,2,3),
(1006,'Rohan Mehta','+91 99887 76655','rohan.mehta@example.com','2026-03-15 08:29:03',NULL,2,3),
(1007,'Ananya Iyer','+91 95550 12345','iyer.ananya@webmail.com','2026-03-15 08:29:45',NULL,2,3),
(1008,'Vikram Singh','+91 90001 88822','v.singh@gmail.com','2026-03-15 08:30:41',NULL,2,3),
(1009,'Sanya Malhotra','+91 88776 65544','sanya.m@example.com','2026-03-15 08:31:27',NULL,1,1),
(1010,'Ishaan Verma','+91 76655 44332','ishaan.v@gmail.com','2026-03-15 08:32:10',NULL,1,1),
(1011,'Kavya Reddy','+91 92233 44556','reddy.kavya@yahoo.com','2026-03-15 08:33:12',NULL,1,1),
(1012,'Sneha Rao','+91 70011 22334','sneha.rao@provider.net','2026-03-15 18:39:24','+91 70011 22334',1,1),
(1013,'Test Student',NULL,'test@example.com','2026-03-16 18:02:36','1234567890',1,1);

--
-- Table structure for table login
--

CREATE TABLE login (
  login_id SERIAL PRIMARY KEY,
  username varchar(100) NOT NULL UNIQUE,
  password varchar(255) NOT NULL,
  role varchar(20) NOT NULL CHECK (role IN ('ADMIN','STAFF','STUDENT')),
  staff_id integer REFERENCES staff(staff_id),
  student_id integer REFERENCES student(student_id),
  created_at timestamp DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO login (login_id, username, password, role, staff_id, student_id, created_at) VALUES 
(1,'admin','$2b$10$KeWHFU.RPdmZbGXqfmls2.JdRxgoi9MK9StBjy2.n4.MQOAVpLYnu','ADMIN',NULL,NULL,'2026-02-16 16:02:01'),
(33,'staff1','$2b$10$GeOtCj7qkZlN65lu9srN2ugPPu55yAyat1MqlAaE7qoWPql4wy6Ii','STAFF',7,NULL,'2026-03-06 07:45:05'),
(41,'darshan','$2b$10$epoRnJVAcykyybbyXe0S1./.K.FNTKgcNOnlre/jttgIEoBRFMFBO','STUDENT',NULL,1002,'2026-03-11 07:10:52'),
(42,'parth','$2b$10$cV3BjzO/KaR2AkGYzanh9O2179.BsXQEfNdYA7J1gSTJZ0qlDNt7G','STUDENT',NULL,1003,'2026-03-11 07:15:47'),
(43,'staff2','$2b$10$nnMU5QC9OewvxMIdA6qBc.YkT71XLmisI01o0hPKhWMsQuJ4R8V2O','STAFF',10,NULL,'2026-03-15 07:43:28'),
(44,'arjun','$2b$10$K93lFq12H0fCzd0QgceqS.ug.vuSQHhV44vggNWBX7pGlna6feFUK','STUDENT',NULL,1004,'2026-03-15 08:27:11'),
(45,'priya','$2b$10$IEXZYS4QW2cUOwmRckPlruH7M48549VUrEHCskHfXcgD6UastUm0a','STUDENT',NULL,1005,'2026-03-15 08:28:21'),
(46,'rohan','$2b$10$xm5r8yh1K5uBr/z8.SLBVuzipEBIs8u.H.8LXCbEp4VhWxq/qaikG','STUDENT',NULL,1006,'2026-03-15 08:29:04'),
(47,'ananya','$2b$10$G3ZJNYsRgm./lpfWE3OLded0afvnbAOMv9mS3OHUxzoubR3nL.R/O','STUDENT',NULL,1007,'2026-03-15 08:29:46'),
(48,'vikram','$2b$10$VEawc9vTczneOPCpb3lxO.JcFMTfTgG8mkxbNZUSm31drSBjEDe52','STUDENT',NULL,1008,'2026-03-15 08:30:41'),
(49,'sanya','$2b$10$fajbIUS0iu9L7OscydFRc.g8RyGQDnTQx9staUFNnSGgAV00Q.gAi','STUDENT',NULL,1009,'2026-03-15 08:31:27'),
(50,'ishaan','$2b$10$LFWtWZ6/OwPre01RB6Ll3u1TmC/d250zk1lM.r3e8OSNyVREyGU6y','STUDENT',NULL,1010,'2026-03-15 08:32:10'),
(51,'kavya','$2b$10$AI6TIZrPv0jCfgLfz0eHcOEikJpRXyG5F0LHrxJ98EzjeUgaIzNGS','STUDENT',NULL,1011,'2026-03-15 08:33:13'),
(52,'staff3','$2b$10$F5nlYz.orCwMrT3gLWLq1OLX0HLk883upc1U2gv5yBkh.Onv/WrmO','STAFF',11,NULL,'2026-03-15 11:12:59'),
(53,'sneha','$2b$10$6tWlZDzo/o6PaYlr1e2bL.b8THGFTzksvlqnn5mtnAsHyPectJ0Ba','STUDENT',NULL,1012,'2026-03-15 18:39:24'),
(54,'test_student','$2b$10$2Dx8Yp7c689XDNpH4OFoieo74w2kV4nxC3rlDUYpgUuMeotDp8ppq','STUDENT',NULL,1013,'2026-03-16 18:02:36');

--
-- Table structure for table project_group
--

CREATE TABLE project_group (
  project_group_id SERIAL PRIMARY KEY,
  group_name varchar(100) DEFAULT NULL,
  project_title varchar(200) DEFAULT NULL,
  project_area varchar(100) DEFAULT NULL,
  project_description text,
  project_type_id integer REFERENCES project_type(project_type_id),
  convener_staff_id integer REFERENCES staff(staff_id),
  expert_staff_id integer REFERENCES staff(staff_id),
  created_at timestamp DEFAULT CURRENT_TIMESTAMP,
  status varchar(20) DEFAULT 'PENDING',
  department_id integer REFERENCES department(department_id),
  guide_staff_id integer REFERENCES staff(staff_id)
);

INSERT INTO project_group (project_group_id, group_name, project_title, project_area, project_description, project_type_id, convener_staff_id, expert_staff_id, created_at, status, department_id, guide_staff_id) VALUES 
(28,'AI Innovators','Face Mask Detection System','Artificial Intelligence','Deep learning system to detect face masks using CNN.',1,7,7,'2026-03-15 07:40:41','APPROVED',1,NULL),
(29,'Neural Knights','Sign Language Translator','Computer Vision','A real-time system using LSTM and CNN to translate hand gestures into text/speech.',2,10,10,'2026-03-15 09:29:27','APPROVED',2,NULL),
(30,'Data Wizards','Stock Market Predictor','Predictive Analytics','Utilizing GRU networks to analyze historical trends and sentiment for price forecasting.',1,10,10,'2026-03-15 09:35:55','APPROVED',2,NULL),
(34,'Cyber Sentinels','Phishing URL Classifier','Cybersecurity','A machine learning approach using Random Forest to detect malicious links in real-time.',2,10,10,'2026-03-16 07:45:31','APPROVED',3,NULL);

--
-- Table structure for table project_group_member
--

CREATE TABLE project_group_member (
  group_member_id SERIAL PRIMARY KEY,
  project_group_id integer REFERENCES project_group(project_group_id),
  student_id integer REFERENCES student(student_id),
  is_leader boolean DEFAULT false,
  cgpa decimal(4,2) DEFAULT NULL
);

INSERT INTO project_group_member (group_member_id, project_group_id, student_id, is_leader, cgpa) VALUES 
(2,28,1003,true,NULL),
(3,28,1002,false,NULL),
(4,29,1004,false,NULL),
(5,29,1005,true,NULL),
(6,29,1006,false,NULL),
(7,29,1007,false,NULL),
(8,30,1005,true,NULL),
(9,30,1007,false,NULL),
(10,30,1008,false,NULL),
(21,34,1002,true,NULL),
(22,34,1005,false,NULL),
(23,34,1007,false,NULL);

--
-- Table structure for table project_meeting
--

CREATE TABLE project_meeting (
  meeting_id SERIAL PRIMARY KEY,
  project_group_id integer REFERENCES project_group(project_group_id),
  guide_staff_id integer REFERENCES staff(staff_id),
  meeting_datetime timestamp DEFAULT NULL,
  meeting_purpose varchar(200) DEFAULT NULL,
  meeting_status varchar(50) DEFAULT NULL
);

INSERT INTO project_meeting (meeting_id, project_group_id, guide_staff_id, meeting_datetime, meeting_purpose, meeting_status) VALUES 
(3,28,10,'2026-03-16 13:28:00','Phase-I Review','Scheduled'),
(4,29,10,'2026-03-15 15:03:00','Phase-I Review','Scheduled');

--
-- Table structure for table meeting_attendance
--

CREATE TABLE meeting_attendance (
  attendance_id SERIAL PRIMARY KEY,
  meeting_id integer REFERENCES project_meeting(meeting_id),
  student_id integer REFERENCES student(student_id),
  is_present boolean DEFAULT NULL,
  remarks varchar(100) DEFAULT NULL
);

INSERT INTO meeting_attendance (attendance_id, meeting_id, student_id, is_present, remarks) VALUES 
(4,3,1003,false,NULL),
(5,3,1002,true,NULL),
(6,4,1005,true,NULL),
(7,4,1007,false,NULL),
(8,4,1004,true,NULL),
(9,4,1006,true,NULL);

--
-- Table structure for table project_proposal
--

CREATE TABLE project_proposal (
  proposal_id SERIAL PRIMARY KEY,
  project_group_id integer NOT NULL REFERENCES project_group(project_group_id),
  proposal_title varchar(200) DEFAULT NULL,
  proposal_description text,
  proposal_file varchar(255) DEFAULT NULL,
  proposal_status varchar(20) DEFAULT 'SUBMITTED',
  submitted_at timestamp DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO project_proposal (proposal_id, project_group_id, proposal_title, proposal_description, proposal_file, proposal_status, submitted_at) VALUES 
(1,28,'AI Innovators','m',NULL,'SUBMITTED','2026-03-15 17:43:47');

--
-- Table structure for table documents
--

CREATE TABLE documents (
  doc_id SERIAL PRIMARY KEY,
  file_name varchar(255) NOT NULL,
  file_url varchar(512) NOT NULL,
  file_id varchar(255) NOT NULL,
  file_type varchar(100) DEFAULT NULL,
  file_size bigint DEFAULT NULL,
  uploaded_by integer NOT NULL,
  uploader_role varchar(20) NOT NULL,
  project_group_id integer REFERENCES project_group(project_group_id),
  description text,
  created_at timestamp DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO documents (doc_id, file_name, file_url, file_id, file_type, file_size, uploaded_by, uploader_role, project_group_id, description, created_at) VALUES 
(1,'28012026092100AM_1KbGiK-YC.pdf','https://ik.imagekit.io/darsh0025/spms/documents/staff/28012026092100AM_1KbGiK-YC.pdf','69b6a86a5c7cd75eb8e81f3a','non-image',764204,33,'STAFF',NULL,NULL,'2026-03-15 12:39:07'),
(5,'20022026085951AM_bbcpdh5FE.pptx','https://ik.imagekit.io/darsh0025/spms/documents/staff/20022026085951AM_bbcpdh5FE.pptx','69b6f6915c7cd75eb865280a','non-image',4462827,43,'STAFF',NULL,NULL,'2026-03-15 18:12:34'),
(7,'03122025100041AM_9uV9rkElh.pdf','https://ik.imagekit.io/darsh0025/spms/documents/staff/03122025100041AM_9uV9rkElh.pdf','69b7ddc25c7cd75eb88f8c43','non-image',3379460,43,'STAFF',29,NULL,'2026-03-16 10:38:58');

--
-- Table structure for table project_evaluation
--

CREATE TABLE project_evaluation (
  evaluation_id SERIAL PRIMARY KEY,
  project_group_id integer REFERENCES project_group(project_group_id),
  staff_id integer REFERENCES staff(staff_id),
  marks integer DEFAULT NULL,
  feedback text,
  evaluated_at timestamp DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO project_evaluation (evaluation_id, project_group_id, staff_id, marks, feedback, evaluated_at) VALUES 
(1,28,7,95,'Excellent','2026-03-15 10:14:22'),
(2,29,10,90,'Phase-I: Very Good','2026-03-15 18:11:06'),
(3,30,10,92,'	Phase-II: Excellent','2026-03-15 18:11:31');

-- Reset sequences to start after the last inserted ID
SELECT setval(pg_get_serial_sequence('academic_year', 'academic_year_id'), (SELECT max(academic_year_id) FROM academic_year));
SELECT setval(pg_get_serial_sequence('department', 'department_id'), (SELECT max(department_id) FROM department));
SELECT setval(pg_get_serial_sequence('project_type', 'project_type_id'), (SELECT max(project_type_id) FROM project_type));
SELECT setval(pg_get_serial_sequence('staff', 'staff_id'), (SELECT max(staff_id) FROM staff));
SELECT setval(pg_get_serial_sequence('student', 'student_id'), (SELECT max(student_id) FROM student));
SELECT setval(pg_get_serial_sequence('login', 'login_id'), (SELECT max(login_id) FROM login));
SELECT setval(pg_get_serial_sequence('project_group', 'project_group_id'), (SELECT max(project_group_id) FROM project_group));
SELECT setval(pg_get_serial_sequence('project_group_member', 'group_member_id'), (SELECT max(group_member_id) FROM project_group_member));
SELECT setval(pg_get_serial_sequence('project_meeting', 'meeting_id'), (SELECT max(meeting_id) FROM project_meeting));
SELECT setval(pg_get_serial_sequence('meeting_attendance', 'attendance_id'), (SELECT max(attendance_id) FROM meeting_attendance));
SELECT setval(pg_get_serial_sequence('project_proposal', 'proposal_id'), (SELECT max(proposal_id) FROM project_proposal));
SELECT setval(pg_get_serial_sequence('documents', 'doc_id'), (SELECT max(doc_id) FROM documents));
SELECT setval(pg_get_serial_sequence('project_evaluation', 'evaluation_id'), (SELECT max(evaluation_id) FROM project_evaluation));
