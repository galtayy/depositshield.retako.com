-- MySQL dump 10.13  Distrib 9.2.0, for macos14.7 (x86_64)
--
-- Host: localhost    Database: depositshield_db
-- ------------------------------------------------------
-- Server version	9.2.0

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
-- Table structure for table `declaration_shares`
--

DROP TABLE IF EXISTS `declaration_shares`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `declaration_shares` (
  `id` int NOT NULL AUTO_INCREMENT,
  `report_id` int NOT NULL,
  `shared_by` int NOT NULL,
  `shared_with` int NOT NULL,
  `status` enum('pending','viewed','responded') DEFAULT 'pending',
  `response_text` text,
  `response_date` timestamp NULL DEFAULT NULL,
  `shared_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_declaration_shares_report_id` (`report_id`),
  KEY `idx_declaration_shares_shared_by` (`shared_by`),
  KEY `idx_declaration_shares_shared_with` (`shared_with`),
  CONSTRAINT `declaration_shares_ibfk_1` FOREIGN KEY (`report_id`) REFERENCES `reports` (`id`) ON DELETE CASCADE,
  CONSTRAINT `declaration_shares_ibfk_2` FOREIGN KEY (`shared_by`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `declaration_shares_ibfk_3` FOREIGN KEY (`shared_with`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `declaration_shares`
--

LOCK TABLES `declaration_shares` WRITE;
/*!40000 ALTER TABLE `declaration_shares` DISABLE KEYS */;
INSERT INTO `declaration_shares` VALUES (1,8,2,3,'viewed',NULL,NULL,'2025-04-23 20:30:21'),(2,9,2,3,'viewed',NULL,NULL,'2025-04-23 20:40:47');
/*!40000 ALTER TABLE `declaration_shares` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `photo_tags`
--

DROP TABLE IF EXISTS `photo_tags`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `photo_tags` (
  `id` int NOT NULL AUTO_INCREMENT,
  `photo_id` int NOT NULL,
  `tag` varchar(50) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `photo_id` (`photo_id`,`tag`),
  KEY `idx_photo_tags_photo_id` (`photo_id`),
  CONSTRAINT `photo_tags_ibfk_1` FOREIGN KEY (`photo_id`) REFERENCES `photos` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `photo_tags`
--

LOCK TABLES `photo_tags` WRITE;
/*!40000 ALTER TABLE `photo_tags` DISABLE KEYS */;
INSERT INTO `photo_tags` VALUES (5,19,'mm','2025-04-23 20:28:11');
/*!40000 ALTER TABLE `photo_tags` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `photos`
--

DROP TABLE IF EXISTS `photos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `photos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `report_id` int DEFAULT NULL,
  `room_id` varchar(255) DEFAULT NULL,
  `property_id` int DEFAULT NULL,
  `file_path` varchar(255) NOT NULL,
  `note` text,
  `timestamp` timestamp NOT NULL,
  `uploaded_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_photos_report_id` (`report_id`),
  CONSTRAINT `photos_ibfk_1` FOREIGN KEY (`report_id`) REFERENCES `reports` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=221 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `photos`
--

LOCK TABLES `photos` WRITE;
/*!40000 ALTER TABLE `photos` DISABLE KEYS */;
INSERT INTO `photos` VALUES (19,8,NULL,NULL,'1745439812630-698469506.png',NULL,'2025-04-23 20:23:33','2025-04-23 20:23:32'),(81,NULL,'room_1747072503915_794',36,'1747072513337-812633202.jpg',NULL,'2025-05-12 17:55:13','2025-05-12 17:55:13'),(82,NULL,'room_1747072503915_794',36,'1747072513381-200589460.jpg',NULL,'2025-05-12 17:55:13','2025-05-12 17:55:13'),(83,NULL,'room_1747072503915_794',36,'1747072513413-405832472.jpg',NULL,'2025-05-12 17:55:13','2025-05-12 17:55:13'),(84,NULL,'room_1747072503915_794',36,'1747072513446-637515779.jpg',NULL,'2025-05-12 17:55:13','2025-05-12 17:55:13'),(85,NULL,'room_1747072503915_794',36,'1747072513468-579697527.jpg',NULL,'2025-05-12 17:55:13','2025-05-12 17:55:13'),(86,NULL,'room_1747072707301_720',36,'1747072715956-918448312.jpg',NULL,'2025-05-12 17:58:36','2025-05-12 17:58:35'),(87,NULL,'room_1747072707301_720',36,'1747072715980-712026690.jpg',NULL,'2025-05-12 17:58:36','2025-05-12 17:58:35'),(88,NULL,'room_1747072707301_720',36,'1747072716001-275498999.jpg',NULL,'2025-05-12 17:58:36','2025-05-12 17:58:36'),(89,NULL,'room_1747072707301_720',36,'1747072716026-989552504.jpg',NULL,'2025-05-12 17:58:36','2025-05-12 17:58:36'),(90,NULL,'room_1747073091001_588',36,'1747073101103-842608025.jpg',NULL,'2025-05-12 18:05:01','2025-05-12 18:05:01'),(91,NULL,'room_1747073091001_588',36,'1747073101141-707981422.jpg',NULL,'2025-05-12 18:05:01','2025-05-12 18:05:01'),(92,NULL,'room_1747073091001_588',36,'1747073101156-285215398.jpg',NULL,'2025-05-12 18:05:01','2025-05-12 18:05:01'),(93,NULL,'room_1747073091001_588',36,'1747073101171-983404759.jpg',NULL,'2025-05-12 18:05:01','2025-05-12 18:05:01'),(94,NULL,'room_1747073091001_588',36,'1747073101195-711167457.jpg',NULL,'2025-05-12 18:05:01','2025-05-12 18:05:01'),(95,NULL,'room_1747073306253_916',36,'1747073315697-689319610.jpg',NULL,'2025-05-12 18:08:36','2025-05-12 18:08:35'),(96,NULL,'room_1747073306253_916',36,'1747073315757-782887555.jpg',NULL,'2025-05-12 18:08:36','2025-05-12 18:08:35'),(97,NULL,'room_1747073306253_916',36,'1747073315779-16261159.jpg',NULL,'2025-05-12 18:08:36','2025-05-12 18:08:35'),(98,NULL,'room_1747073306253_916',36,'1747073315816-61485143.jpg',NULL,'2025-05-12 18:08:36','2025-05-12 18:08:35'),(99,NULL,'room_1747073953755_982',36,'1747073963270-981638104.jpg',NULL,'2025-05-12 18:19:23','2025-05-12 18:19:23'),(100,NULL,'room_1747073953755_982',36,'1747073963304-413545130.jpg',NULL,'2025-05-12 18:19:23','2025-05-12 18:19:23'),(101,NULL,'room_1747073953755_982',36,'1747073963321-737671516.jpg',NULL,'2025-05-12 18:19:23','2025-05-12 18:19:23'),(102,NULL,'room_1747073953755_982',36,'1747073963349-934582976.jpg',NULL,'2025-05-12 18:19:23','2025-05-12 18:19:23'),(103,NULL,'room_1747074507661_541',36,'1747074563945-121597140.jpg',NULL,'2025-05-12 18:29:24','2025-05-12 18:29:23'),(104,NULL,'room_1747074507661_541',36,'1747074563974-27215941.jpg',NULL,'2025-05-12 18:29:24','2025-05-12 18:29:23'),(105,NULL,'room_1747074507661_541',36,'1747074563996-336213507.jpg',NULL,'2025-05-12 18:29:24','2025-05-12 18:29:23'),(106,NULL,'room_1747074507661_541',36,'1747074564011-554067357.jpg',NULL,'2025-05-12 18:29:24','2025-05-12 18:29:24'),(107,NULL,'room_1747074507661_541',36,'1747074564033-707572035.jpg',NULL,'2025-05-12 18:29:24','2025-05-12 18:29:24'),(108,NULL,'room_1747074507661_541',36,'1747074564052-825054159.jpg',NULL,'2025-05-12 18:29:24','2025-05-12 18:29:24'),(109,NULL,'room_1747074768869_849',36,'1747074777782-380077246.jpg',NULL,'2025-05-12 18:32:58','2025-05-12 18:32:57'),(110,NULL,'room_1747074768869_849',36,'1747074777815-794776615.jpg',NULL,'2025-05-12 18:32:58','2025-05-12 18:32:57'),(111,NULL,'room_1747074768869_849',36,'1747074777834-567352918.jpg',NULL,'2025-05-12 18:32:58','2025-05-12 18:32:57'),(112,NULL,'room_1747074768869_849',36,'1747074777901-393150597.jpg',NULL,'2025-05-12 18:32:58','2025-05-12 18:32:57'),(113,NULL,'room_1747117489985_933',37,'1747117505448-513339580.jpg',NULL,'2025-05-13 06:25:05','2025-05-13 06:25:05'),(114,NULL,'room_1747117489985_933',37,'1747117505568-958335694.jpg',NULL,'2025-05-13 06:25:06','2025-05-13 06:25:05'),(115,NULL,'room_1747117489985_933',37,'1747117505615-924364162.jpg',NULL,'2025-05-13 06:25:06','2025-05-13 06:25:05'),(116,NULL,'room_1747117489985_933',37,'1747117505652-851140946.jpg',NULL,'2025-05-13 06:25:06','2025-05-13 06:25:05'),(117,NULL,'room_1747117489985_933',37,'1747117505702-456733138.jpg',NULL,'2025-05-13 06:25:06','2025-05-13 06:25:05'),(118,NULL,'room_1747118113763_600',38,'1747118122671-360227622.jpg',NULL,'2025-05-13 06:35:23','2025-05-13 06:35:22'),(119,NULL,'room_1747118113763_600',38,'1747118122719-123198645.jpg',NULL,'2025-05-13 06:35:23','2025-05-13 06:35:22'),(120,NULL,'room_1747118113763_600',38,'1747118122734-690820450.jpg',NULL,'2025-05-13 06:35:23','2025-05-13 06:35:22'),(121,NULL,'room_1747118113763_600',38,'1747118122749-773997833.jpg',NULL,'2025-05-13 06:35:23','2025-05-13 06:35:22'),(122,NULL,'room_1747119859539_658',38,'1747119881320-139574472.jpg',NULL,'2025-05-13 07:04:41','2025-05-13 07:04:41'),(123,NULL,'room_1747119859539_658',38,'1747119881361-844179756.jpg',NULL,'2025-05-13 07:04:41','2025-05-13 07:04:41'),(124,NULL,'room_1747119859539_658',38,'1747119881375-51461573.jpg',NULL,'2025-05-13 07:04:41','2025-05-13 07:04:41'),(125,NULL,'room_1747119859539_658',38,'1747119881390-169298887.jpg',NULL,'2025-05-13 07:04:41','2025-05-13 07:04:41'),(126,NULL,'room_1747119859539_658',38,'1747119881415-100488335.jpg',NULL,'2025-05-13 07:04:41','2025-05-13 07:04:41'),(127,NULL,'room_1747119859539_658',38,'1747119881430-272749837.jpg',NULL,'2025-05-13 07:04:41','2025-05-13 07:04:41'),(128,NULL,'room_1747120330173_654',39,'1747120338206-179486816.jpg',NULL,'2025-05-13 07:12:18','2025-05-13 07:12:18'),(129,NULL,'room_1747120330173_654',39,'1747120338230-195836222.jpg',NULL,'2025-05-13 07:12:18','2025-05-13 07:12:18'),(130,NULL,'room_1747120330173_654',39,'1747120338240-120234371.jpg',NULL,'2025-05-13 07:12:18','2025-05-13 07:12:18'),(131,NULL,'room_1747120330173_654',39,'1747120338253-86793212.jpg',NULL,'2025-05-13 07:12:18','2025-05-13 07:12:18'),(132,NULL,'room_1747120330173_654',39,'1747120338266-533869445.jpg',NULL,'2025-05-13 07:12:18','2025-05-13 07:12:18'),(133,NULL,'room_1747120330173_654',39,'1747120338275-201090417.jpg',NULL,'2025-05-13 07:12:18','2025-05-13 07:12:18'),(134,NULL,'room_1747120342612_63',39,'1747120356674-205744333.jpg',NULL,'2025-05-13 07:12:37','2025-05-13 07:12:36'),(135,NULL,'room_1747120342612_63',39,'1747120356697-646517829.jpg',NULL,'2025-05-13 07:12:37','2025-05-13 07:12:36'),(136,NULL,'room_1747120342612_63',39,'1747120356712-183760374.jpg',NULL,'2025-05-13 07:12:37','2025-05-13 07:12:36'),(137,NULL,'room_1747120342612_63',39,'1747120356723-830132886.jpg',NULL,'2025-05-13 07:12:37','2025-05-13 07:12:36'),(138,NULL,'room_1747121849028_142',40,'1747121857702-418038257.jpg',NULL,'2025-05-13 07:37:38','2025-05-13 07:37:37'),(139,NULL,'room_1747121849028_142',40,'1747121857740-599499844.jpg',NULL,'2025-05-13 07:37:38','2025-05-13 07:37:37'),(140,NULL,'room_1747121849028_142',40,'1747121857757-120633712.jpg',NULL,'2025-05-13 07:37:38','2025-05-13 07:37:37'),(141,NULL,'room_1747121849028_142',40,'1747121857774-55846994.jpg',NULL,'2025-05-13 07:37:38','2025-05-13 07:37:37'),(142,NULL,'room_1747121849028_142',40,'1747121857793-986316553.jpg',NULL,'2025-05-13 07:37:38','2025-05-13 07:37:37'),(143,NULL,'room_1747121863732_515',40,'1747121881619-236103154.jpg',NULL,'2025-05-13 07:38:02','2025-05-13 07:38:01'),(144,NULL,'room_1747121863732_515',40,'1747121881712-758057476.jpg',NULL,'2025-05-13 07:38:02','2025-05-13 07:38:01'),(145,NULL,'room_1747121863732_515',40,'1747121881743-353034811.jpg',NULL,'2025-05-13 07:38:02','2025-05-13 07:38:01'),(146,NULL,'room_1747126328216_923',41,'1747126337576-258473033.jpg',NULL,'2025-05-13 08:52:18','2025-05-13 08:52:17'),(147,NULL,'room_1747126328216_923',41,'1747126337630-950889769.jpg',NULL,'2025-05-13 08:52:18','2025-05-13 08:52:17'),(148,NULL,'room_1747126328216_923',41,'1747126337643-41250674.jpg',NULL,'2025-05-13 08:52:18','2025-05-13 08:52:17'),(149,NULL,'room_1747126328216_923',41,'1747126337656-181153279.jpg',NULL,'2025-05-13 08:52:18','2025-05-13 08:52:17'),(150,NULL,'room_1747126328216_923',41,'1747126337674-32641432.jpg',NULL,'2025-05-13 08:52:18','2025-05-13 08:52:17'),(151,NULL,'room_1747126328216_923',41,'1747126337687-530146436.jpg',NULL,'2025-05-13 08:52:18','2025-05-13 08:52:17'),(152,NULL,'room_1747126341589_287',41,'1747126358421-158463914.jpg',NULL,'2025-05-13 08:52:38','2025-05-13 08:52:38'),(153,NULL,'room_1747126341589_287',41,'1747126358449-575880436.jpg',NULL,'2025-05-13 08:52:38','2025-05-13 08:52:38'),(154,NULL,'room_1747126341589_287',41,'1747126358491-68520387.jpg',NULL,'2025-05-13 08:52:38','2025-05-13 08:52:38'),(155,NULL,'room_1747126341589_287',41,'1747126358566-194351637.jpg',NULL,'2025-05-13 08:52:39','2025-05-13 08:52:38'),(156,NULL,'room_1747132737678_454',42,'1747132747992-219488687.jpg',NULL,'2025-05-13 10:39:08','2025-05-13 10:39:08'),(157,NULL,'room_1747132737678_454',42,'1747132748028-546376689.jpg',NULL,'2025-05-13 10:39:08','2025-05-13 10:39:08'),(158,NULL,'room_1747132737678_454',42,'1747132748042-664580119.jpg',NULL,'2025-05-13 10:39:08','2025-05-13 10:39:08'),(159,NULL,'room_1747132737678_454',42,'1747132748054-943334915.jpg',NULL,'2025-05-13 10:39:08','2025-05-13 10:39:08'),(160,NULL,'room_1747132737678_454',42,'1747132748073-995611983.jpg',NULL,'2025-05-13 10:39:08','2025-05-13 10:39:08'),(161,NULL,'room_1747132737678_454',42,'1747132748086-834427101.jpg',NULL,'2025-05-13 10:39:08','2025-05-13 10:39:08'),(162,NULL,'room_1747132753046_437',42,'1747132761919-798187483.jpg',NULL,'2025-05-13 10:39:22','2025-05-13 10:39:21'),(163,NULL,'room_1747132753046_437',42,'1747132761931-879655119.jpg',NULL,'2025-05-13 10:39:22','2025-05-13 10:39:21'),(164,NULL,'room_1747132753046_437',42,'1747132761955-211272133.jpg',NULL,'2025-05-13 10:39:22','2025-05-13 10:39:21'),(165,NULL,'room_1747132753046_437',42,'1747132761969-922081617.jpg',NULL,'2025-05-13 10:39:22','2025-05-13 10:39:21'),(166,NULL,'room_1747143072684_511',43,'1747143082192-183850581.jpg',NULL,'2025-05-13 10:31:22','2025-05-13 13:31:22'),(167,NULL,'room_1747143072684_511',43,'1747143082243-475798879.jpg',NULL,'2025-05-13 10:31:22','2025-05-13 13:31:22'),(168,NULL,'room_1747143072684_511',43,'1747143082256-454733149.jpg',NULL,'2025-05-13 10:31:22','2025-05-13 13:31:22'),(169,NULL,'room_1747143072684_511',43,'1747143082268-994551057.jpg',NULL,'2025-05-13 10:31:22','2025-05-13 13:31:22'),(170,NULL,'room_1747143072684_511',43,'1747143082285-325908524.jpg',NULL,'2025-05-13 10:31:22','2025-05-13 13:31:22'),(171,NULL,'room_1747143072684_511',43,'1747143082293-11710964.jpg',NULL,'2025-05-13 10:31:22','2025-05-13 13:31:22'),(172,NULL,'room_1747143086627_560',43,'1747143097497-389820361.jpg',NULL,'2025-05-13 10:31:38','2025-05-13 13:31:37'),(173,NULL,'room_1747143086627_560',43,'1747143097515-139840157.jpg',NULL,'2025-05-13 10:31:38','2025-05-13 13:31:37'),(174,NULL,'room_1747143086627_560',43,'1747143097536-792513435.jpg',NULL,'2025-05-13 10:31:38','2025-05-13 13:31:37'),(175,NULL,'room_1747143086627_560',43,'1747143097547-246124367.jpg',NULL,'2025-05-13 10:31:38','2025-05-13 13:31:37'),(176,NULL,'room_1747145166486_404',44,'1747146635284-689297828.jpg',NULL,'2025-05-13 11:30:36','2025-05-13 14:30:35'),(177,NULL,'room_1747145166486_404',44,'1747146635728-755242265.jpg',NULL,'2025-05-13 11:30:36','2025-05-13 14:30:35'),(178,NULL,'room_1747145166486_404',44,'1747146635752-447923781.jpg',NULL,'2025-05-13 11:30:36','2025-05-13 14:30:35'),(179,NULL,'room_1747147168101_856',46,'1747147378129-319958911.jpg',NULL,'2025-05-13 11:42:58','2025-05-13 14:42:58'),(180,NULL,'room_1747147168101_856',46,'1747147378186-953529816.jpg',NULL,'2025-05-13 11:42:58','2025-05-13 14:42:58'),(181,NULL,'room_1747204004664_990',48,'1747204016001-802594398.jpg',NULL,'2025-05-14 03:26:56','2025-05-14 06:26:56'),(182,NULL,'room_1747204004664_990',48,'1747204016045-96162638.jpg',NULL,'2025-05-14 03:26:56','2025-05-14 06:26:56'),(183,NULL,'room_1747204004664_990',48,'1747204016064-255768011.jpg',NULL,'2025-05-14 03:26:56','2025-05-14 06:26:56'),(184,NULL,'room_1747204004664_990',48,'1747204016086-289836416.jpg',NULL,'2025-05-14 03:26:56','2025-05-14 06:26:56'),(185,NULL,'room_1747204004664_990',48,'1747204016102-61052921.jpg',NULL,'2025-05-14 03:26:56','2025-05-14 06:26:56'),(186,NULL,'room_1747204021411_426',48,'1747204034244-111632508.jpg',NULL,'2025-05-14 03:27:14','2025-05-14 06:27:14'),(187,NULL,'room_1747204021411_426',48,'1747204034254-417090473.jpg',NULL,'2025-05-14 03:27:14','2025-05-14 06:27:14'),(188,NULL,'room_1747204021411_426',48,'1747204034267-192032370.jpg',NULL,'2025-05-14 03:27:14','2025-05-14 06:27:14'),(189,NULL,'room_1747204021411_426',48,'1747204034287-855118096.jpg',NULL,'2025-05-14 03:27:14','2025-05-14 06:27:14'),(190,NULL,'room_1747204021411_426',48,'1747204034297-396185822.jpg',NULL,'2025-05-14 03:27:14','2025-05-14 06:27:14'),(191,45,'room_1747211880721_203',49,'1747211888799-606952846.jpg',NULL,'2025-05-14 05:38:09','2025-05-14 08:38:08'),(192,45,'room_1747211892945_228',49,'1747211914579-550449689.jpg',NULL,'2025-05-14 05:38:35','2025-05-14 08:38:34'),(193,45,'room_1747211921286_449',49,'1747211930801-121532325.jpg',NULL,'2025-05-14 05:38:51','2025-05-14 08:38:50'),(194,45,'room_1747211921286_449',49,'1747211930813-446245299.jpg',NULL,'2025-05-14 05:38:51','2025-05-14 08:38:50'),(195,45,'room_1747211921286_449',49,'1747211930844-567203281.jpg',NULL,'2025-05-14 05:38:51','2025-05-14 08:38:50'),(196,45,'room_1747211921286_449',49,'1747211930854-78552957.jpg',NULL,'2025-05-14 05:38:51','2025-05-14 08:38:50'),(197,45,'room_1747211921286_449',49,'1747211930867-962690407.jpg',NULL,'2025-05-14 05:38:51','2025-05-14 08:38:50'),(198,45,'room_1747211921286_449',49,'1747213156325-682055748.jpg','Move-out photo','2025-05-14 05:59:16','2025-05-14 08:59:16'),(199,45,'room_1747211921286_449',49,'1747213156416-488134997.jpg','Move-out photo','2025-05-14 05:59:16','2025-05-14 08:59:16'),(200,45,'room_1747211921286_449',49,'1747213156447-989676974.jpg','Move-out photo','2025-05-14 05:59:16','2025-05-14 08:59:16'),(201,45,'room_1747211921286_449',49,'1747213156476-410345067.jpg','Move-out photo','2025-05-14 05:59:16','2025-05-14 08:59:16'),(202,45,'room_1747211921286_449',49,'1747213156501-161118238.jpg','Move-out photo','2025-05-14 05:59:17','2025-05-14 08:59:16'),(203,45,'room_1747211892945_228',49,'1747214435632-321137437.jpg','Move-out photo','2025-05-14 06:20:36','2025-05-14 09:20:35'),(204,45,'room_1747211892945_228',49,'1747214435740-916077920.jpg','Move-out photo','2025-05-14 06:20:36','2025-05-14 09:20:35'),(205,45,'room_1747211880721_203',49,'1747214450309-452023839.jpg','Move-out photo','2025-05-14 06:20:50','2025-05-14 09:20:50'),(206,45,'room_1747211880721_203',49,'1747214450375-315311764.jpg','Move-out photo','2025-05-14 06:20:50','2025-05-14 09:20:50'),(207,45,'room_1747211880721_203',49,'1747214450411-780523884.jpg','Move-out photo','2025-05-14 06:20:50','2025-05-14 09:20:50'),(208,NULL,'room_1747230340787_643',51,'1747230350691-388912650.jpg',NULL,'2025-05-14 10:45:51','2025-05-14 13:45:50'),(209,NULL,'room_1747230340787_643',51,'1747230350725-477048289.jpg',NULL,'2025-05-14 10:45:51','2025-05-14 13:45:50'),(210,NULL,'room_1747230340787_643',51,'1747230350736-586949773.jpg',NULL,'2025-05-14 10:45:51','2025-05-14 13:45:50'),(211,NULL,'room_1747230340787_643',51,'1747230350746-121591324.jpg',NULL,'2025-05-14 10:45:51','2025-05-14 13:45:50'),(212,NULL,'room_1747230356237_598',51,'1747230389542-696967033.jpg',NULL,'2025-05-14 10:46:30','2025-05-14 13:46:29'),(213,NULL,'room_1747230356237_598',51,'1747230389588-938287898.jpg',NULL,'2025-05-14 10:46:30','2025-05-14 13:46:29'),(214,NULL,'room_1747230356237_598',51,'1747230389610-663265815.jpg',NULL,'2025-05-14 10:46:30','2025-05-14 13:46:29'),(215,NULL,'room_1747230701953_328',52,'1747230711075-741530763.jpg',NULL,'2025-05-14 10:51:51','2025-05-14 13:51:51'),(216,NULL,'room_1747230701953_328',52,'1747230711106-598681516.jpg',NULL,'2025-05-14 10:51:51','2025-05-14 13:51:51'),(217,NULL,'room_1747230715275_816',52,'1747230729645-166788704.jpg',NULL,'2025-05-14 10:52:10','2025-05-14 13:52:09'),(218,NULL,'room_1747230715275_816',52,'1747230729659-236657209.jpg',NULL,'2025-05-14 10:52:10','2025-05-14 13:52:09'),(219,NULL,'room_1747230734474_723',52,'1747230742560-419943510.jpg',NULL,'2025-05-14 10:52:23','2025-05-14 13:52:22'),(220,NULL,'room_1747230734474_723',52,'1747230742575-891272151.jpg',NULL,'2025-05-14 10:52:23','2025-05-14 13:52:22');
/*!40000 ALTER TABLE `photos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `properties`
--

DROP TABLE IF EXISTS `properties`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `properties` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `address` varchar(255) NOT NULL,
  `description` text,
  `unit_number` varchar(20) DEFAULT NULL,
  `property_type` enum('apartment','house','condo','townhouse','commercial','other') DEFAULT 'apartment',
  `bedrooms` int DEFAULT '0',
  `bathrooms` int DEFAULT '0',
  `living_rooms` int DEFAULT '0',
  `square_feet` int DEFAULT '0',
  `has_parking` tinyint(1) DEFAULT '0',
  `has_garden` tinyint(1) DEFAULT '0',
  `has_elevator` tinyint(1) DEFAULT '0',
  `floor_number` int DEFAULT '0',
  `construction_year` int DEFAULT NULL,
  `role_at_this_property` enum('landlord','renter','other') NOT NULL,
  `deposit_amount` decimal(10,2) DEFAULT NULL,
  `contract_start_date` date DEFAULT NULL,
  `contract_end_date` date DEFAULT NULL,
  `move_in_date` date DEFAULT NULL,
  `lease_duration` int DEFAULT NULL,
  `lease_duration_type` enum('weeks','months','years') DEFAULT 'months',
  `kitchen_count` int DEFAULT NULL,
  `additional_spaces` text,
  `landlord_email` varchar(255) DEFAULT NULL,
  `landlord_phone` varchar(20) DEFAULT NULL,
  `rooms_json` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `square_footage` int DEFAULT NULL,
  `year_built` int DEFAULT NULL,
  `parking_spaces` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_properties_user_id` (`user_id`),
  KEY `idx_properties_property_type` (`property_type`),
  KEY `idx_properties_bedrooms` (`bedrooms`),
  KEY `idx_properties_bathrooms` (`bathrooms`),
  CONSTRAINT `properties_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=53 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `properties`
--

LOCK TABLES `properties` WRITE;
/*!40000 ALTER TABLE `properties` DISABLE KEYS */;
INSERT INTO `properties` VALUES (7,2,'Soğanlık Yeni Mah. Baltacı Mehmet Paşa Sk. No:4 B Blok Daire 18 Kartal İstanbul','Sdalsdmald',NULL,'apartment',0,0,0,0,0,0,0,0,NULL,'landlord',NULL,NULL,NULL,NULL,NULL,'months',NULL,NULL,NULL,NULL,NULL,'2025-04-23 20:22:27','2025-04-23 20:22:27',NULL,NULL,NULL),(43,1,'Gurkan Home','Istanbul, Kartal','1231','apartment',0,0,0,0,0,0,0,0,NULL,'renter',12000.00,'2025-05-13','2026-05-13',NULL,12,'months',NULL,NULL,'gurkan.altay@iesyazilim.com.tr','5532935067',NULL,'2025-05-13 13:31:06','2025-05-13 14:37:12',NULL,NULL,NULL),(44,1,'Emri Gemi Home','Istanbul, Maltepe','123','apartment',0,0,0,0,0,0,0,0,NULL,'renter',25000.00,'2025-05-01','2026-05-01','2025-05-01',12,'months',NULL,NULL,'emir.gemi@iesyazilim.com.tr','(123) 122-1221',NULL,'2025-05-13 14:05:44','2025-05-13 14:32:25',NULL,NULL,NULL),(46,1,'asd','asd','123','apartment',0,0,0,0,0,0,0,0,NULL,'renter',12.00,'2025-05-13','2026-05-13','2025-05-13',12,'months',NULL,NULL,'asd@asd.com','(123) 123-1231',NULL,'2025-05-13 14:38:41','2025-05-13 14:43:27',NULL,NULL,NULL),(49,1,'L.A. New Home','Los Angeles, California','121','apartment',0,0,0,0,0,0,0,0,NULL,'renter',12000.00,'2025-03-01','2026-03-01','2025-04-01',12,'months',NULL,NULL,'gurkan.altay@iesyazilim.com.tr','(123) 123-1111',NULL,'2025-05-14 08:37:55','2025-05-14 08:39:03',NULL,NULL,NULL),(52,48,'Mert Home','Istanbul, Esenyurt','1231','apartment',0,0,0,0,0,0,0,0,NULL,'renter',10000.00,'2025-05-14','2026-05-14','2025-05-13',12,'months',NULL,NULL,'gurkan.altay@iesyazilim.com.tr','(123) 121-2111',NULL,'2025-05-14 13:50:56','2025-05-14 13:52:35',NULL,NULL,NULL);
/*!40000 ALTER TABLE `properties` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `property_rooms`
--

DROP TABLE IF EXISTS `property_rooms`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `property_rooms` (
  `id` int NOT NULL AUTO_INCREMENT,
  `property_id` int NOT NULL,
  `room_id` varchar(50) NOT NULL,
  `room_name` varchar(100) NOT NULL,
  `room_type` varchar(50) NOT NULL,
  `room_quality` varchar(50) DEFAULT NULL,
  `room_issue_notes` text,
  `photo_count` int DEFAULT '0',
  `timestamp` varchar(50) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `property_id` (`property_id`,`room_id`),
  CONSTRAINT `property_rooms_ibfk_1` FOREIGN KEY (`property_id`) REFERENCES `properties` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `property_rooms`
--

LOCK TABLES `property_rooms` WRITE;
/*!40000 ALTER TABLE `property_rooms` DISABLE KEYS */;
INSERT INTO `property_rooms` VALUES (3,43,'room_1747143072684_511','Living Room','living','good','[]',6,'2025-05-13T14:37:19.489Z','2025-05-13 13:31:12','2025-05-13 14:37:19'),(4,43,'room_1747143086627_560','Bedroom','bedroom','attention','[\"asdasd\",\"sdads\"]',4,'2025-05-13T14:37:19.489Z','2025-05-13 13:31:26','2025-05-13 14:37:19'),(5,44,'room_1747145166486_404','Living Room','living','attention','[\"sdfsdfsdf\",\"sdasd\"]',3,'2025-05-14T07:53:24.265Z','2025-05-13 14:06:06','2025-05-14 07:53:24'),(6,46,'room_1747147168101_856','Living Room','living','good','[]',2,'2025-05-13T14:44:32.353Z','2025-05-13 14:39:28','2025-05-13 14:44:32'),(10,49,'room_1747211880721_203','Living Room','living','good','[]',1,'2025-05-14T09:20:50.514Z','2025-05-14 08:38:00','2025-05-14 09:20:50'),(11,49,'room_1747211892945_228','Bedroom','bedroom','attention','[\"kajsdlkas\",\"asdasdad\",\"sdasdad\",\"adsadad\",\"sdasdasdad\",\"sdadadsasd\",\"adaasdadad\",\"sdasdadad\",\"sdadadsasdsad\",\"dadasdasd\"]',1,'2025-05-14T09:20:50.514Z','2025-05-14 08:38:13','2025-05-14 09:20:50'),(12,49,'room_1747211921286_449','Kitchen','kitchen','good','[]',5,'2025-05-14T09:20:50.514Z','2025-05-14 08:38:41','2025-05-14 09:20:50'),(15,52,'room_1747230701953_328','Living Room','living','good','[]',2,'2025-05-14T13:53:20.791Z','2025-05-14 13:51:41','2025-05-14 13:53:20'),(16,52,'room_1747230715275_816','Bedroom','bedroom','attention','[\"asdad\",\"sd asd adad ads asd asd\",\"asdsa d sad asdsa d\"]',2,'2025-05-14T13:53:20.791Z','2025-05-14 13:51:55','2025-05-14 13:53:20'),(17,52,'room_1747230734474_723','Kitchen','kitchen','good','[]',2,'2025-05-14T13:53:20.791Z','2025-05-14 13:52:14','2025-05-14 13:53:20');
/*!40000 ALTER TABLE `property_rooms` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `report_views`
--

DROP TABLE IF EXISTS `report_views`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `report_views` (
  `id` int NOT NULL AUTO_INCREMENT,
  `report_id` int NOT NULL,
  `viewer_id` int DEFAULT NULL,
  `viewed_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `viewer_id` (`viewer_id`),
  KEY `idx_report_views_report_id` (`report_id`),
  CONSTRAINT `report_views_ibfk_1` FOREIGN KEY (`report_id`) REFERENCES `reports` (`id`) ON DELETE CASCADE,
  CONSTRAINT `report_views_ibfk_2` FOREIGN KEY (`viewer_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=1066 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `report_views`
--

LOCK TABLES `report_views` WRITE;
/*!40000 ALTER TABLE `report_views` DISABLE KEYS */;
INSERT INTO `report_views` VALUES (154,8,2,'2025-04-23 20:23:32'),(155,8,2,'2025-04-23 20:23:37'),(156,8,2,'2025-04-23 20:23:40'),(157,8,2,'2025-04-23 20:23:41'),(158,8,2,'2025-04-23 20:23:42'),(159,8,2,'2025-04-23 20:23:48'),(160,8,2,'2025-04-23 20:25:28'),(161,8,2,'2025-04-23 20:26:17'),(162,8,2,'2025-04-23 20:26:20'),(163,8,2,'2025-04-23 20:26:26'),(164,8,2,'2025-04-23 20:28:02'),(165,8,2,'2025-04-23 20:28:07'),(166,8,2,'2025-04-23 20:28:17'),(167,8,2,'2025-04-23 20:29:55'),(168,8,2,'2025-04-23 20:30:21'),(169,8,2,'2025-04-23 20:30:28'),(170,8,2,'2025-04-23 20:30:28'),(171,8,2,'2025-04-23 20:30:47'),(172,8,2,'2025-04-23 20:32:07'),(173,8,2,'2025-04-23 20:32:10'),(174,8,2,'2025-04-23 20:34:16'),(175,8,2,'2025-04-23 20:40:02'),(176,9,2,'2025-04-23 20:40:41'),(177,9,2,'2025-04-23 20:40:43'),(178,9,2,'2025-04-23 20:40:48'),(179,9,2,'2025-04-23 20:42:42'),(1021,41,NULL,'2025-05-14 12:05:50'),(1022,41,NULL,'2025-05-14 12:09:24'),(1023,41,NULL,'2025-05-14 12:09:56'),(1024,41,NULL,'2025-05-14 12:10:19'),(1025,41,NULL,'2025-05-14 12:10:35'),(1026,41,NULL,'2025-05-14 12:10:42'),(1027,42,NULL,'2025-05-14 12:13:07'),(1028,43,NULL,'2025-05-14 12:28:12'),(1029,43,NULL,'2025-05-14 12:29:53'),(1030,43,NULL,'2025-05-14 12:30:13'),(1031,43,NULL,'2025-05-14 12:30:29'),(1032,43,NULL,'2025-05-14 12:30:34'),(1033,43,NULL,'2025-05-14 12:30:44'),(1034,43,NULL,'2025-05-14 12:31:23'),(1035,44,NULL,'2025-05-14 12:35:51'),(1036,44,NULL,'2025-05-14 12:36:01'),(1037,45,NULL,'2025-05-14 12:42:38'),(1038,45,NULL,'2025-05-14 12:43:34'),(1039,46,NULL,'2025-05-14 12:48:13'),(1040,46,NULL,'2025-05-14 12:49:14'),(1041,46,NULL,'2025-05-14 12:50:51'),(1042,46,NULL,'2025-05-14 12:50:51'),(1043,46,NULL,'2025-05-14 12:51:42'),(1044,46,NULL,'2025-05-14 12:57:17'),(1045,46,NULL,'2025-05-14 13:00:34'),(1046,47,NULL,'2025-05-14 13:01:01'),(1047,47,NULL,'2025-05-14 13:04:07'),(1048,47,NULL,'2025-05-14 13:04:07'),(1049,47,NULL,'2025-05-14 13:04:13'),(1050,47,NULL,'2025-05-14 13:04:20'),(1051,47,NULL,'2025-05-14 13:04:31'),(1052,47,NULL,'2025-05-14 13:04:45'),(1053,48,NULL,'2025-05-14 13:08:03'),(1054,48,NULL,'2025-05-14 13:10:06'),(1055,48,NULL,'2025-05-14 13:12:58'),(1056,47,1,'2025-05-14 13:19:53'),(1057,47,1,'2025-05-14 13:19:53'),(1058,48,NULL,'2025-05-14 13:26:01'),(1059,48,NULL,'2025-05-14 13:26:12'),(1060,48,NULL,'2025-05-14 13:38:08'),(1061,48,NULL,'2025-05-14 13:45:10'),(1062,52,NULL,'2025-05-14 13:47:15'),(1063,48,NULL,'2025-05-14 13:51:48'),(1064,52,NULL,'2025-05-14 13:53:52'),(1065,52,NULL,'2025-05-14 13:54:01');
/*!40000 ALTER TABLE `report_views` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reports`
--

DROP TABLE IF EXISTS `reports`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reports` (
  `id` int NOT NULL AUTO_INCREMENT,
  `property_id` int NOT NULL,
  `created_by` int NOT NULL,
  `type` enum('move-in','move-out','general') NOT NULL,
  `uuid` varchar(36) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text,
  `rooms_json` text,
  `approval_status` enum('pending','approved','rejected') DEFAULT 'pending',
  `is_archived` tinyint(1) DEFAULT '0',
  `archived_at` timestamp NULL DEFAULT NULL,
  `archive_reason` varchar(255) DEFAULT NULL,
  `approved_at` timestamp NULL DEFAULT NULL,
  `rejected_at` timestamp NULL DEFAULT NULL,
  `approved_message` text,
  `rejection_message` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uuid` (`uuid`),
  KEY `idx_reports_property_id` (`property_id`),
  KEY `idx_reports_created_by` (`created_by`),
  KEY `idx_reports_approval_status` (`approval_status`),
  KEY `idx_reports_is_archived` (`is_archived`),
  CONSTRAINT `reports_ibfk_1` FOREIGN KEY (`property_id`) REFERENCES `properties` (`id`) ON DELETE CASCADE,
  CONSTRAINT `reports_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=55 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reports`
--

LOCK TABLES `reports` WRITE;
/*!40000 ALTER TABLE `reports` DISABLE KEYS */;
INSERT INTO `reports` VALUES (8,7,2,'move-in','1446fe70-adfd-440b-8c73-031685d4563c','sadad','asdsad',NULL,'pending',0,NULL,NULL,NULL,NULL,NULL,NULL,'2025-04-23 20:23:32','2025-04-23 20:23:32'),(9,7,2,'move-out','9060b6c4-e5eb-419a-b83e-5c86b0d21c67','asdasd','asdasd',NULL,'pending',0,NULL,NULL,NULL,NULL,NULL,NULL,'2025-04-23 20:40:41','2025-04-23 20:40:41'),(29,43,1,'move-in','19f2c997-8d31-46f4-a862-b6f494762b83','Walkthrough for Istanbul, Kartal','Automatically generated walkthrough report',NULL,'pending',0,NULL,NULL,NULL,NULL,NULL,NULL,'2025-05-13 13:32:07','2025-05-13 13:32:07'),(30,44,1,'move-in','35e4e8dd-9b88-4d61-b50b-d6dc83ff6e14','Walkthrough for Istanbul, Maltepe','Automatically generated walkthrough report',NULL,'pending',0,NULL,NULL,NULL,NULL,NULL,NULL,'2025-05-13 14:34:08','2025-05-13 14:34:08'),(31,46,1,'move-in','513dd9ae-e4a1-4543-982d-466e802b3509','Walkthrough for asd','Automatically generated walkthrough report',NULL,'pending',0,NULL,NULL,NULL,NULL,NULL,NULL,'2025-05-13 14:43:22','2025-05-13 14:43:22'),(33,49,1,'move-in','efce6cff-9bc0-4aec-88d3-b1270fe9120b','Walkthrough for Los Angeles, California','Automatically generated walkthrough report',NULL,'pending',0,NULL,NULL,NULL,NULL,NULL,NULL,'2025-05-14 08:39:15','2025-05-14 08:39:15'),(34,49,1,'move-out','2d306880-1e3c-4159-9fb5-38bec4815ea2','Move-Out Report - L.A. New Home','Move-out report for L.A. New Home',NULL,'pending',0,NULL,NULL,NULL,NULL,NULL,NULL,'2025-05-14 09:42:08','2025-05-14 09:42:08'),(35,49,1,'move-out','743712b7-4e95-4aaa-a88a-18dd4635b02a','Move-Out Report - L.A. New Home','Move-out report for L.A. New Home',NULL,'pending',0,NULL,NULL,NULL,NULL,NULL,NULL,'2025-05-14 09:45:59','2025-05-14 09:45:59'),(36,49,1,'move-out','d9ec069e-adde-44ce-ba62-c2404a88fa58','Move-Out Report - L.A. New Home','Move-out report for L.A. New Home',NULL,'pending',0,NULL,NULL,NULL,NULL,NULL,NULL,'2025-05-14 11:31:31','2025-05-14 11:31:31'),(37,49,1,'move-out','3ecf5fe2-f3c7-45cd-bb63-d1a164ea3b1f','Move-Out Report - L.A. New Home','Move-out report for L.A. New Home',NULL,'pending',0,NULL,NULL,NULL,NULL,NULL,NULL,'2025-05-14 11:35:12','2025-05-14 11:35:12'),(38,49,1,'move-out','4eab2c2d-a399-4d5d-899d-028082ad4160','Move-Out Report - L.A. New Home','Move-out report for L.A. New Home',NULL,'pending',0,NULL,NULL,NULL,NULL,NULL,NULL,'2025-05-14 11:41:21','2025-05-14 11:41:21'),(39,49,1,'move-out','ed3b0428-8ebe-419b-ac42-8d4780f94d92','Move-Out Report - L.A. New Home','Move-out report for L.A. New Home',NULL,'pending',0,NULL,NULL,NULL,NULL,NULL,NULL,'2025-05-14 11:51:39','2025-05-14 11:51:39'),(40,49,1,'move-out','ccd98883-ff46-4567-b7dc-06eb4d87f88c','Move-Out Report - L.A. New Home','Move-out report for L.A. New Home',NULL,'pending',0,NULL,NULL,NULL,NULL,NULL,NULL,'2025-05-14 12:00:35','2025-05-14 12:00:35'),(41,49,1,'move-out','05dafda9-9fd5-4950-879c-e475578dc3b1','Move-Out Report - L.A. New Home','Move-out report for L.A. New Home',NULL,'pending',0,NULL,NULL,NULL,NULL,NULL,NULL,'2025-05-14 12:05:34','2025-05-14 12:05:34'),(42,49,1,'move-out','198e4f8d-061f-4f19-abf1-2b47dd7b3665','Move-Out Report - L.A. New Home','Move-out report for L.A. New Home','[{\"id\":\"room_1747211880721_203\",\"name\":\"Living Room\",\"type\":\"living\",\"notes\":[\"asdad asda das dasd\"],\"photo_count\":3,\"move_out_date\":\"2025-05-14T09:20:50.301Z\"},{\"id\":\"room_1747211892945_228\",\"name\":\"Bedroom\",\"type\":\"bedroom\",\"notes\":[\"asdasdasdad\"],\"photo_count\":2,\"move_out_date\":\"2025-05-14T09:20:35.570Z\"},{\"id\":\"room_1747211921286_449\",\"name\":\"Kitchen\",\"type\":\"kitchen\",\"notes\":[\"jahsdjkahd akslsla dlksajdlask djalskd jalkd\"],\"photo_count\":5,\"move_out_date\":\"2025-05-14T08:59:16.231Z\"}]','pending',0,NULL,NULL,NULL,NULL,NULL,NULL,'2025-05-14 12:12:59','2025-05-14 12:12:59'),(43,49,1,'move-out','21925220-9b80-49f2-b956-3444e7bf8fe3','Move-Out Report - 789 Broadway, Unit 7C','Move-out report for 789 Broadway, Unit 7C','[{\"id\":\"room_1747211880721_203\",\"name\":\"Living Room\",\"type\":\"living\",\"moveOutNotes\":[\"asdad asda das dasd\"],\"notes\":[\"asdad asda das dasd\"],\"photo_count\":3,\"move_out_date\":\"2025-05-14T09:20:50.301Z\",\"address\":\"789 Broadway, Unit 7C\"},{\"id\":\"room_1747211892945_228\",\"name\":\"Bedroom\",\"type\":\"bedroom\",\"moveOutNotes\":[\"asdasdasdad\"],\"notes\":[\"asdasdasdad\"],\"photo_count\":2,\"move_out_date\":\"2025-05-14T09:20:35.570Z\",\"address\":\"789 Broadway, Unit 7C\"},{\"id\":\"room_1747211921286_449\",\"name\":\"Kitchen\",\"type\":\"kitchen\",\"moveOutNotes\":[\"jahsdjkahd akslsla dlksajdlask djalskd jalkd\"],\"notes\":[\"jahsdjkahd akslsla dlksajdlask djalskd jalkd\"],\"photo_count\":5,\"move_out_date\":\"2025-05-14T08:59:16.231Z\",\"address\":\"789 Broadway, Unit 7C\"}]','pending',0,NULL,NULL,NULL,NULL,NULL,NULL,'2025-05-14 12:28:00','2025-05-14 12:28:00'),(44,49,1,'move-out','e7c82023-736c-4638-9174-87fc29be8900','Move-Out Report - L.A. New Home','Move-out report for L.A. New Home','[{\"id\":\"room_1747211880721_203\",\"name\":\"Living Room\",\"type\":\"living\",\"notes\":[\"asdad asda das dasd\"],\"photo_count\":3,\"move_out_date\":\"2025-05-14T09:20:50.301Z\"},{\"id\":\"room_1747211892945_228\",\"name\":\"Bedroom\",\"type\":\"bedroom\",\"notes\":[\"asdasdasdad\"],\"photo_count\":2,\"move_out_date\":\"2025-05-14T09:20:35.570Z\"},{\"id\":\"room_1747211921286_449\",\"name\":\"Kitchen\",\"type\":\"kitchen\",\"notes\":[\"jahsdjkahd akslsla dlksajdlask djalskd jalkd\"],\"photo_count\":5,\"move_out_date\":\"2025-05-14T08:59:16.231Z\"}]','pending',0,NULL,NULL,NULL,NULL,NULL,NULL,'2025-05-14 12:35:41','2025-05-14 12:35:41'),(45,49,1,'move-out','bca14ded-a3ef-48e1-8507-3dc2d2214ec9','Move-Out Report - L.A. New Home','Move-out report for L.A. New Home','[{\"id\":\"room_1747211880721_203\",\"name\":\"Living Room\",\"type\":\"living\",\"moveOutNotes\":[\"asdad asda das dasd\"],\"notes\":[\"asdad asda das dasd\"],\"photo_count\":3,\"move_out_date\":\"2025-05-14T09:20:50.301Z\",\"address\":\"L.A. New Home\"},{\"id\":\"room_1747211892945_228\",\"name\":\"Bedroom\",\"type\":\"bedroom\",\"moveOutNotes\":[\"asdasdasdad\"],\"notes\":[\"asdasdasdad\"],\"photo_count\":2,\"move_out_date\":\"2025-05-14T09:20:35.570Z\",\"address\":\"L.A. New Home\"},{\"id\":\"room_1747211921286_449\",\"name\":\"Kitchen\",\"type\":\"kitchen\",\"moveOutNotes\":[\"jahsdjkahd akslsla dlksajdlask djalskd jalkd\"],\"notes\":[\"jahsdjkahd akslsla dlksajdlask djalskd jalkd\"],\"photo_count\":5,\"move_out_date\":\"2025-05-14T08:59:16.231Z\",\"address\":\"L.A. New Home\"}]','pending',0,NULL,NULL,NULL,NULL,NULL,NULL,'2025-05-14 12:42:28','2025-05-14 12:42:28'),(46,49,1,'move-out','5d01eb98-cdbc-47ba-953f-94500092fb8f','Move-Out Report - L.A. New Home','Move-out report for L.A. New Home','[{\"id\":\"room_1747211880721_203\",\"name\":\"Living Room\",\"type\":\"living\",\"moveOutNotes\":[\"asdad asda das dasd\"],\"notes\":[\"asdad asda das dasd\"],\"photo_count\":3,\"move_out_date\":\"2025-05-14T09:20:50.301Z\",\"address\":\"L.A. New Home\"},{\"id\":\"room_1747211892945_228\",\"name\":\"Bedroom\",\"type\":\"bedroom\",\"moveOutNotes\":[\"asdasdasdad\"],\"notes\":[\"asdasdasdad\"],\"photo_count\":2,\"move_out_date\":\"2025-05-14T09:20:35.570Z\",\"address\":\"L.A. New Home\"},{\"id\":\"room_1747211921286_449\",\"name\":\"Kitchen\",\"type\":\"kitchen\",\"moveOutNotes\":[\"jahsdjkahd akslsla dlksajdlask djalskd jalkd\"],\"notes\":[\"jahsdjkahd akslsla dlksajdlask djalskd jalkd\"],\"photo_count\":5,\"move_out_date\":\"2025-05-14T08:59:16.231Z\",\"address\":\"L.A. New Home\"}]','pending',0,NULL,NULL,NULL,NULL,NULL,NULL,'2025-05-14 12:48:05','2025-05-14 12:48:05'),(47,49,1,'move-out','d02bca0b-a6c4-4bbf-84cc-a8f61b4e690a','Move-Out Report - L.A. New Home','Move-out report for L.A. New Home','[{\"id\":\"room_1747211880721_203\",\"name\":\"Living Room\",\"type\":\"living\",\"moveOutNotes\":[\"asdad asda das dasd\"],\"notes\":[\"asdad asda das dasd\"],\"photo_count\":3,\"move_out_date\":\"2025-05-14T09:20:50.301Z\",\"address\":\"L.A. New Home\"},{\"id\":\"room_1747211892945_228\",\"name\":\"Bedroom\",\"type\":\"bedroom\",\"moveOutNotes\":[\"asdasdasdad\"],\"notes\":[\"asdasdasdad\"],\"photo_count\":2,\"move_out_date\":\"2025-05-14T09:20:35.570Z\",\"address\":\"L.A. New Home\"},{\"id\":\"room_1747211921286_449\",\"name\":\"Kitchen\",\"type\":\"kitchen\",\"moveOutNotes\":[\"jahsdjkahd akslsla dlksajdlask djalskd jalkd\"],\"notes\":[\"jahsdjkahd akslsla dlksajdlask djalskd jalkd\"],\"photo_count\":5,\"move_out_date\":\"2025-05-14T08:59:16.231Z\",\"address\":\"L.A. New Home\"}]','pending',0,NULL,NULL,NULL,NULL,NULL,NULL,'2025-05-14 13:00:48','2025-05-14 13:00:48'),(48,49,1,'move-out','cf161073-d2b6-48e6-a1c2-f3403b08bfd0','Move-Out Report - L.A. New Home','Move-out report for L.A. New Home','[{\"id\":\"room_1747211880721_203\",\"name\":\"Living Room\",\"type\":\"living\",\"moveOutNotes\":[\"asdad asda das dasd\"],\"notes\":[\"asdad asda das dasd\"],\"photo_count\":3,\"move_out_date\":\"2025-05-14T09:20:50.301Z\",\"address\":\"L.A. New Home\"},{\"id\":\"room_1747211892945_228\",\"name\":\"Bedroom\",\"type\":\"bedroom\",\"moveOutNotes\":[\"asdasdasdad\"],\"notes\":[\"asdasdasdad\"],\"photo_count\":2,\"move_out_date\":\"2025-05-14T09:20:35.570Z\",\"address\":\"L.A. New Home\"},{\"id\":\"room_1747211921286_449\",\"name\":\"Kitchen\",\"type\":\"kitchen\",\"moveOutNotes\":[\"jahsdjkahd akslsla dlksajdlask djalskd jalkd\"],\"notes\":[\"jahsdjkahd akslsla dlksajdlask djalskd jalkd\"],\"photo_count\":5,\"move_out_date\":\"2025-05-14T08:59:16.231Z\",\"address\":\"L.A. New Home\"}]','pending',0,NULL,NULL,NULL,NULL,NULL,NULL,'2025-05-14 13:07:47','2025-05-14 13:07:47'),(49,49,1,'move-out','6c8b9083-ba53-45dc-b0c9-c447254cb940','Move-Out Report - L.A. New Home','Move-out report for L.A. New Home','[{\"id\":\"room_1747211880721_203\",\"name\":\"Living Room\",\"type\":\"living\",\"moveOutNotes\":[\"asdad asda das dasd\"],\"notes\":[\"asdad asda das dasd\"],\"photo_count\":3,\"move_out_date\":\"2025-05-14T09:20:50.301Z\",\"address\":\"L.A. New Home\"},{\"id\":\"room_1747211892945_228\",\"name\":\"Bedroom\",\"type\":\"bedroom\",\"moveOutNotes\":[\"asdasdasdad\"],\"notes\":[\"asdasdasdad\"],\"photo_count\":2,\"move_out_date\":\"2025-05-14T09:20:35.570Z\",\"address\":\"L.A. New Home\"},{\"id\":\"room_1747211921286_449\",\"name\":\"Kitchen\",\"type\":\"kitchen\",\"moveOutNotes\":[\"jahsdjkahd akslsla dlksajdlask djalskd jalkd\"],\"notes\":[\"jahsdjkahd akslsla dlksajdlask djalskd jalkd\"],\"photo_count\":5,\"move_out_date\":\"2025-05-14T08:59:16.231Z\",\"address\":\"L.A. New Home\"}]','pending',0,NULL,NULL,NULL,NULL,NULL,NULL,'2025-05-14 13:22:26','2025-05-14 13:22:26'),(50,49,1,'move-out','140c851c-ac51-4bd4-b42a-7105720bdf12','Move-Out Report - L.A. New Home','Move-out report for L.A. New Home','[{\"id\":\"room_1747211880721_203\",\"name\":\"Living Room\",\"type\":\"living\",\"moveOutNotes\":[\"asdad asda das dasd\"],\"notes\":[\"asdad asda das dasd\"],\"photo_count\":3,\"move_out_date\":\"2025-05-14T09:20:50.301Z\",\"address\":\"L.A. New Home\"},{\"id\":\"room_1747211892945_228\",\"name\":\"Bedroom\",\"type\":\"bedroom\",\"moveOutNotes\":[\"asdasdasdad\"],\"notes\":[\"asdasdasdad\"],\"photo_count\":2,\"move_out_date\":\"2025-05-14T09:20:35.570Z\",\"address\":\"L.A. New Home\"},{\"id\":\"room_1747211921286_449\",\"name\":\"Kitchen\",\"type\":\"kitchen\",\"moveOutNotes\":[\"jahsdjkahd akslsla dlksajdlask djalskd jalkd\"],\"notes\":[\"jahsdjkahd akslsla dlksajdlask djalskd jalkd\"],\"photo_count\":5,\"move_out_date\":\"2025-05-14T08:59:16.231Z\",\"address\":\"L.A. New Home\"}]','pending',0,NULL,NULL,NULL,NULL,NULL,NULL,'2025-05-14 13:25:14','2025-05-14 13:25:14'),(51,49,1,'move-out','8301c67b-34e5-4140-b039-579ffb4e7aaf','Move-Out Report - L.A. New Home','Move-out report for L.A. New Home','[{\"id\":\"room_1747211880721_203\",\"name\":\"Living Room\",\"type\":\"living\",\"moveOutNotes\":[\"asdad asda das dasd\"],\"notes\":[\"asdad asda das dasd\"],\"photo_count\":3,\"move_out_date\":\"2025-05-14T09:20:50.301Z\",\"address\":\"L.A. New Home\"},{\"id\":\"room_1747211892945_228\",\"name\":\"Bedroom\",\"type\":\"bedroom\",\"moveOutNotes\":[\"asdasdasdad\"],\"notes\":[\"asdasdasdad\"],\"photo_count\":2,\"move_out_date\":\"2025-05-14T09:20:35.570Z\",\"address\":\"L.A. New Home\"},{\"id\":\"room_1747211921286_449\",\"name\":\"Kitchen\",\"type\":\"kitchen\",\"moveOutNotes\":[\"jahsdjkahd akslsla dlksajdlask djalskd jalkd\"],\"notes\":[\"jahsdjkahd akslsla dlksajdlask djalskd jalkd\"],\"photo_count\":5,\"move_out_date\":\"2025-05-14T08:59:16.231Z\",\"address\":\"L.A. New Home\"}]','pending',0,NULL,NULL,NULL,NULL,NULL,NULL,'2025-05-14 13:26:02','2025-05-14 13:26:02'),(52,49,1,'move-out','ad0b003e-ca32-48e9-b875-24a3889f9002','Move-Out Report - L.A. New Home','Move-out report for L.A. New Home','[{\"id\":\"room_1747211880721_203\",\"name\":\"Living Room\",\"type\":\"living\",\"moveOutNotes\":[\"asdad asda das dasd\"],\"notes\":[\"asdad asda das dasd\"],\"photo_count\":3,\"move_out_date\":\"2025-05-14T09:20:50.301Z\",\"address\":\"L.A. New Home\"},{\"id\":\"room_1747211892945_228\",\"name\":\"Bedroom\",\"type\":\"bedroom\",\"moveOutNotes\":[\"asdasdasdad\"],\"notes\":[\"asdasdasdad\"],\"photo_count\":2,\"move_out_date\":\"2025-05-14T09:20:35.570Z\",\"address\":\"L.A. New Home\"},{\"id\":\"room_1747211921286_449\",\"name\":\"Kitchen\",\"type\":\"kitchen\",\"moveOutNotes\":[\"jahsdjkahd akslsla dlksajdlask djalskd jalkd\"],\"notes\":[\"jahsdjkahd akslsla dlksajdlask djalskd jalkd\"],\"photo_count\":5,\"move_out_date\":\"2025-05-14T08:59:16.231Z\",\"address\":\"L.A. New Home\"}]','pending',0,NULL,NULL,NULL,NULL,NULL,NULL,'2025-05-14 13:26:25','2025-05-14 13:26:25'),(54,52,48,'move-in','a9e1e09e-c9ff-4b67-9f1b-0a195e0631f0','Move-in Walkthrough for Istanbul, Esenyurt','Automatically generated move-in walkthrough report','[{\"id\":\"room_1747230701953_328\",\"name\":\"Living Room\",\"type\":\"living\",\"notes\":[]},{\"id\":\"room_1747230715275_816\",\"name\":\"Bedroom\",\"type\":\"bedroom\",\"notes\":[\"asdad\",\"sd asd adad ads asd asd\",\"asdsa d sad asdsa d\"]},{\"id\":\"room_1747230734474_723\",\"name\":\"Kitchen\",\"type\":\"kitchen\",\"notes\":[]}]','pending',0,NULL,NULL,NULL,NULL,NULL,NULL,'2025-05-14 13:53:41','2025-05-14 13:53:41');
/*!40000 ALTER TABLE `reports` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `role` varchar(50) DEFAULT 'tenant',
  `password` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `verification_code` varchar(10) DEFAULT NULL,
  `is_verified` tinyint(1) DEFAULT '0',
  `reset_code` varchar(10) DEFAULT NULL,
  `reset_expires` datetime DEFAULT NULL,
  `reset_token` varchar(255) DEFAULT NULL,
  `reset_token_expires` datetime DEFAULT NULL,
  `verification_expires` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_users_role` (`role`)
) ENGINE=InnoDB AUTO_INCREMENT=49 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'Gurkan Altay','grkanalty@gmail.com','tenant','$2a$10$RwsKZ312aM7Uhcwaikp0ZublL468nUk9lh/EvkKRfQxZSS/fUmxcC','2025-04-22 09:15:37','2025-05-14 13:42:05',NULL,1,NULL,NULL,NULL,NULL,NULL),(2,'Test Landlord','test@test.com','landlord','$2a$10$.pvBZQ0Tlj/zNLVB7jWNYua8FdSXroqD2N0.7FCndOjoVbv2z1zRu','2025-04-23 19:57:06','2025-05-13 15:14:25',NULL,1,NULL,NULL,NULL,NULL,NULL),(3,'Test Tenant','test2@test.com','tenant','$2a$10$ayAu5LTnRMCqxMFDtfjX8OCmdb4dbE1umL7iTXJQsqKlhGk9aijpu','2025-04-23 20:00:49','2025-04-23 20:00:49',NULL,0,NULL,NULL,NULL,NULL,NULL),(35,'mugeonen79','mugeonen79@gmail.com','tenant','$2a$10$oxZWMoVvHXgQlvm2/VnyKubfyGCf3EeShqWogVv1WhoAQBofgNHqK','2025-05-09 07:13:27','2025-05-09 07:15:09',NULL,1,NULL,NULL,NULL,NULL,NULL),(36,'emre.duver','emre.duver@iesyazilim.com.tr','tenant','$2a$10$uDA1bhuE.Mh7VdjI.z.1..lUgeam3.V/SPjyfiYVMi49SD91.w4pi','2025-05-09 11:59:06','2025-05-09 12:00:52',NULL,1,NULL,NULL,NULL,NULL,NULL),(38,'test','test@test2.com','tenant','$2a$10$t5a/Zql98zvZu5zTIiKtEO6V4xTZVaA6.MZBHNyebA90ulnyO4oGG','2025-05-11 15:34:14','2025-05-11 15:34:32',NULL,1,NULL,NULL,NULL,NULL,NULL),(43,'emir.gemi','emir.gemi@iesyazilim.com.tr','tenant','$2a$10$Uhz.gbhkf9V0Bs2QkP7Uf.jMKggQ0E1kBOcmpHCsA1I6X7wxyZ2.e','2025-05-13 15:16:29','2025-05-13 15:16:46',NULL,1,NULL,NULL,NULL,NULL,NULL),(47,'enes','enes@test.com','tenant','$2a$10$K8fFETyJA1UGG23qJ0JCHeF2hDPxK4bBxtcodWoTwr.2SgHufK2Lq','2025-05-14 07:19:35','2025-05-14 07:19:49',NULL,1,NULL,NULL,NULL,NULL,NULL),(48,'mkaya','mkaya@asd.com','tenant','$2a$10$k5E9EbNeaHHHfU78OcUmhOCG4ia.7zdI06HnCf9v4lJwIb6n1nvBe','2025-05-14 13:42:20','2025-05-14 13:42:28',NULL,1,NULL,NULL,NULL,NULL,NULL);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-05-14 17:07:18
