-- MySQL dump 10.13  Distrib 8.0.40, for Win64 (x86_64)
--
-- Host: localhost    Database: pre_enrolment
-- ------------------------------------------------------
-- Server version	5.5.5-10.4.32-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Current Database: `pre_enrolment`
--

/*!40000 DROP DATABASE IF EXISTS `pre_enrolment`*/;

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `pre_enrolment` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci */;

USE `pre_enrolment`;

--
-- Table structure for table `courses`
--

DROP TABLE IF EXISTS `courses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `courses` (
  `id` varchar(50) NOT NULL,
  `name` varchar(255) NOT NULL,
  `unit_code` varchar(50) NOT NULL,
  `semester` varchar(20) NOT NULL,
  `day_of_week` varchar(20) NOT NULL,
  `time_slot` varchar(20) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unit_code` (`unit_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `courses`
--

LOCK TABLES `courses` WRITE;
/*!40000 ALTER TABLE `courses` DISABLE KEYS */;
INSERT INTO `courses` VALUES ('BUS101','Business Communication','BUS101','1','Monday','14:45-17:45','2026-05-04 00:34:21'),('BUS108','Business Ethics in Digital Age','BUS108','2','Tuesday','8:15-11:15','2026-05-04 00:34:21'),('BUS112','Management Principles and Operations','BUS112','1','Monday','18:00-21:00','2026-05-04 00:34:21'),('BUS306','Work Integrated Learning (Internship)','BUS306','6','Wednesday','8:15-11:15','2026-05-04 00:34:21'),('ICT101','Introduction to Information Technology','ICT101','1','Monday','8:15-11:15','2026-05-04 00:34:21'),('ICT102','Networking','ICT102','2','Tuesday','14:45-17:45','2026-05-04 00:34:21'),('ICT103','Programming','ICT103','1','Monday','11:30-14:30','2026-05-04 00:34:21'),('ICT104','Fundamentals of Computability','ICT104','2','Tuesday','11:30-14:30','2026-05-04 00:34:21'),('ICT201','Database Systems','ICT201','2','Tuesday','18:00-21:00','2026-05-04 00:34:21'),('ICT202','Cloud Computing','ICT202','3','Wednesday','8:15-11:15','2026-05-04 00:34:21'),('ICT203','Web Application Development','ICT203','3','Wednesday','11:30-14:30','2026-05-04 00:34:21'),('ICT204','Cyber Security','ICT204','4','Thursday','11:30-14:30','2026-05-04 00:34:21'),('ICT205','Mobile Application Development','ICT205','4','Thursday','8:15-11:15','2026-05-04 00:34:21'),('ICT206','Software Engineering','ICT206','3','Wednesday','14:45-17:45','2026-05-04 00:34:21'),('ICT208','Algorithms and Data Structures','ICT208','3','Wednesday','18:00-21:00','2026-05-04 00:34:21'),('ICT301','Information Technology Project Management','ICT301','4','Thursday','14:45-17:45','2026-05-04 00:34:21'),('ICT303','Big Data','ICT303','5','Friday','8:15-11:15','2026-05-04 00:34:21'),('ICT305','Topics in IT','ICT305','5','Friday','18:00-21:00','2026-05-04 00:34:21'),('ICT306','Advanced Cyber Security','ICT306','6','Wednesday','8:15-11:15','2026-05-04 00:34:21'),('ICT307','Project 1 (Analysis and Design)','ICT307','5','Friday','14:45-17:45','2026-05-04 00:34:21'),('ICT308','Project 2 (Programming and Testing)','ICT308','6','Wednesday','11:30-14:30','2026-05-04 00:34:21'),('ICT309','Information Technology Governance, Risk and Compliance','ICT309','5','Friday','11:30-14:30','2026-05-04 00:34:21'),('ICT310','Information Technology Services Management','ICT310','6','Wednesday','14:45-17:45','2026-05-04 00:34:21');
/*!40000 ALTER TABLE `courses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `preferences`
--

DROP TABLE IF EXISTS `preferences`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `preferences` (
  `id` varchar(255) NOT NULL,
  `student_email` varchar(255) NOT NULL,
  `course_id` varchar(50) NOT NULL,
  `time_preference` varchar(20) NOT NULL,
  `day_preference` varchar(20) NOT NULL,
  `status` enum('pending','approved','rejected') DEFAULT 'pending',
  `submitted_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_preferences_user` (`student_email`),
  KEY `fk_preferences_course` (`course_id`),
  CONSTRAINT `fk_preferences_course` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_preferences_user` FOREIGN KEY (`student_email`) REFERENCES `users` (`email`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `preferences`
--

LOCK TABLES `preferences` WRITE;
/*!40000 ALTER TABLE `preferences` DISABLE KEYS */;
INSERT INTO `preferences` VALUES ('chris@cihe.edu:ICT201:1778431833710','chris@cihe.edu','ICT201','8:15-11:15','Tuesday','pending','2026-05-11 02:50:33'),('chris@cihe.edu:ICT204:1778431941940','chris@cihe.edu','ICT204','14:45-17:45','Wednesday','pending','2026-05-11 02:52:21'),('emma@cihe.edu:ICT103:1778431700830','emma@cihe.edu','ICT103','11:30-14:30','Monday','pending','2026-05-11 02:48:20'),('emma@cihe.edu:ICT201:1778431720406','emma@cihe.edu','ICT201','8:15-11:15','Tuesday','pending','2026-05-11 02:48:40'),('michael@cihe.edu:ICT101:1778431515619','michael@cihe.edu','ICT101','8:15-11:15','Monday','pending','2026-05-11 02:45:15'),('michael@cihe.edu:ICT103:1778431535989','michael@cihe.edu','ICT103','11:30-14:30','Monday','pending','2026-05-11 02:45:35'),('michael@cihe.edu:ICT201:1778389188612','michael@cihe.edu','ICT201','8:15-11:15','Tuesday','pending','2026-05-10 14:59:48'),('sarah@cihe.edu:ICT101:1778431369812','sarah@cihe.edu','ICT101','8:15-11:15','Monday','pending','2026-05-11 02:42:49'),('sarah@cihe.edu:ICT103:1778431389529','sarah@cihe.edu','ICT103','11:30-14:30','Monday','pending','2026-05-11 02:43:09'),('student@cihe.edu:ICT101:1','student@cihe.edu','ICT101','8:15-11:15','Monday','pending','2025-03-15 00:00:00'),('student@cihe.edu:ICT103:2','student@cihe.edu','ICT103','11:30-14:30','Monday','pending','2025-03-15 00:00:00');
/*!40000 ALTER TABLE `preferences` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `role` enum('student','admin') NOT NULL,
  `cihe_id` varchar(50) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES ('admin@cihe.edu','$2b$12$TvWYLoK0ADdXdt.nskAkiuFnb/hjbO6LzVQq8ZsBPM5Hlfpu2eiXW','Admin User','admin',NULL,'2026-05-04 00:34:21'),('chris@cihe.edu','$2b$12$AncGWCMB78nIQUu7pG7SA.E8RUZRK8nn.s.2D7dHW7yIS43XzrH.O','chris','student','CIHE618308','2026-05-10 16:32:58'),('emma@cihe.edu','$2b$12$BZo8XJIDW96uzS/sJKUAS.dXTqbj.pRvPsP/VE03HDYQuHMCS9mOK','Emma Williams','student','CIHE231557','2026-05-04 00:34:20'),('marmikkarki20@gmail.com','$2b$12$sQOTGuhB/71fSnRaJbV3weABQYSdZaH59MvMH/Jytx/HXHD2xCb.q','marmik','student','CIHE894910','2026-05-04 00:47:18'),('michael@cihe.edu','$2b$12$Ok7/5NXLvWsPnb8qilA2a.ctLLHZRF4LZb8VIrQwa8PiKXTSOheie','Michael Chen','student','CIHE231556','2026-05-04 00:34:20'),('sarah@cihe.edu','$2b$12$H/t0I35oTZddHmlir052Q.QNRKMcX1vLwpimJefqWwLwolB1cqfRO','Sarah Johnson','student','CIHE231555','2026-05-04 00:34:20'),('student@cihe.edu','$2b$12$dmwXJkfkVhDtN8mN3pf8aeWN9zQzwRVCQeF0l9ZsAwpFMJnhdgD1W','student','student','CIHE231554','2026-05-04 00:34:20'),('test1@cihe.edu','$2b$12$TIaaG15s2hVAHlHElXkPjeB7MXAaw1fTOYF.cqCjqFhQNkTOP/8xa','test1','student','CIHE146355','2026-05-10 17:08:18');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping routines for database 'pre_enrolment'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-05-11 11:03:27
