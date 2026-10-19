-- MariaDB dump 10.19  Distrib 10.4.32-MariaDB, for Linux (x86_64)
--
-- Host: localhost    Database: db-kelola-parkir
-- ------------------------------------------------------
-- Server version	10.4.32-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Current Database: `db-kelola-parkir`
--

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `db-kelola-parkir` /*!40100 DEFAULT CHARACTER SET latin1 COLLATE latin1_swedish_ci */;

USE `db-kelola-parkir`;

--
-- Table structure for table `tb_area_parkir`
--

DROP TABLE IF EXISTS `tb_area_parkir`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tb_area_parkir` (
  `id_area` int(11) NOT NULL AUTO_INCREMENT,
  `nama_area` varchar(50) NOT NULL,
  `kapasitas` int(5) NOT NULL,
  `terisi` int(5) NOT NULL,
  PRIMARY KEY (`id_area`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tb_area_parkir`
--

LOCK TABLES `tb_area_parkir` WRITE;
/*!40000 ALTER TABLE `tb_area_parkir` DISABLE KEYS */;
INSERT INTO `tb_area_parkir` VALUES (1,'Zona A - Mobil',20,1),(2,'Zona B - Mobil',15,0),(3,'Zona Motor',50,1);
/*!40000 ALTER TABLE `tb_area_parkir` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tb_kendaraan`
--

DROP TABLE IF EXISTS `tb_kendaraan`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tb_kendaraan` (
  `id_kendaraan` int(11) NOT NULL AUTO_INCREMENT,
  `plat_nomor` varchar(15) NOT NULL,
  `jenis_kendaraan` varchar(20) NOT NULL,
  `warna` varchar(20) DEFAULT NULL,
  `pemilik` varchar(100) DEFAULT NULL,
  `id_user` int(11) NOT NULL,
  PRIMARY KEY (`id_kendaraan`),
  KEY `tb_kendaraan_plat_nomor_index` (`plat_nomor`),
  KEY `tb_kendaraan_id_user_foreign` (`id_user`),
  CONSTRAINT `tb_kendaraan_id_user_foreign` FOREIGN KEY (`id_user`) REFERENCES `tb_user` (`id_user`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tb_kendaraan`
--

LOCK TABLES `tb_kendaraan` WRITE;
/*!40000 ALTER TABLE `tb_kendaraan` DISABLE KEYS */;
INSERT INTO `tb_kendaraan` VALUES (1,'B 1234 ABC','mobil','Hitam','Budi',1),(2,'B 5678 DEF','motor','Merah','Sari',1),(3,'D 9012 GHI','mobil','Putih','Andi',1);
/*!40000 ALTER TABLE `tb_kendaraan` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tb_log_aktivitas`
--

DROP TABLE IF EXISTS `tb_log_aktivitas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tb_log_aktivitas` (
  `id_log` int(11) NOT NULL AUTO_INCREMENT,
  `id_user` int(11) NOT NULL,
  `aktivitas` varchar(100) NOT NULL,
  `waktu_aktivitas` datetime NOT NULL,
  PRIMARY KEY (`id_log`),
  KEY `tb_log_aktivitas_id_user_foreign` (`id_user`),
  CONSTRAINT `tb_log_aktivitas_id_user_foreign` FOREIGN KEY (`id_user`) REFERENCES `tb_user` (`id_user`)
) ENGINE=InnoDB AUTO_INCREMENT=30 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tb_log_aktivitas`
--

LOCK TABLES `tb_log_aktivitas` WRITE;
/*!40000 ALTER TABLE `tb_log_aktivitas` DISABLE KEYS */;
INSERT INTO `tb_log_aktivitas` VALUES (16,1,'Login ke sistem','2026-10-19 08:59:33'),(17,1,'Logout dari sistem','2026-10-19 08:59:44'),(18,2,'Login ke sistem','2026-10-19 08:59:58'),(19,2,'Logout dari sistem','2026-10-19 09:00:05'),(20,3,'Login ke sistem','2026-10-19 09:00:12'),(21,3,'Logout dari sistem','2026-10-19 09:19:16'),(22,1,'Login ke sistem','2026-10-19 09:23:27'),(23,2,'Login ke sistem','2026-10-19 09:23:36'),(24,3,'Login ke sistem','2026-10-19 09:23:41'),(25,1,'Login ke sistem','2026-10-19 09:25:02'),(26,2,'Login ke sistem','2026-10-19 09:25:06'),(27,3,'Login ke sistem','2026-10-19 09:25:12'),(28,2,'Login ke sistem','2026-10-19 09:25:45'),(29,1,'Login ke sistem','2026-10-19 09:26:38');
/*!40000 ALTER TABLE `tb_log_aktivitas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tb_tarif`
--

DROP TABLE IF EXISTS `tb_tarif`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tb_tarif` (
  `id_tarif` int(11) NOT NULL AUTO_INCREMENT,
  `jenis_kendaraan` enum('motor','mobil','lainnya') NOT NULL,
  `tarif_per_jam` decimal(10,0) NOT NULL,
  PRIMARY KEY (`id_tarif`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tb_tarif`
--

LOCK TABLES `tb_tarif` WRITE;
/*!40000 ALTER TABLE `tb_tarif` DISABLE KEYS */;
INSERT INTO `tb_tarif` VALUES (1,'motor',2000),(2,'mobil',5000),(3,'lainnya',8000);
/*!40000 ALTER TABLE `tb_tarif` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tb_transaksi`
--

DROP TABLE IF EXISTS `tb_transaksi`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tb_transaksi` (
  `id_parkir` int(11) NOT NULL AUTO_INCREMENT,
  `id_kendaraan` int(11) NOT NULL,
  `waktu_masuk` datetime NOT NULL,
  `waktu_keluar` datetime DEFAULT NULL,
  `id_tarif` int(11) NOT NULL,
  `durasi_jam` int(5) DEFAULT NULL,
  `biaya_total` decimal(10,0) DEFAULT NULL,
  `status` enum('masuk','keluar') NOT NULL DEFAULT 'masuk',
  `id_user` int(11) NOT NULL,
  `id_area` int(11) NOT NULL,
  PRIMARY KEY (`id_parkir`),
  KEY `tb_transaksi_waktu_masuk_index` (`waktu_masuk`),
  KEY `tb_transaksi_status_index` (`status`),
  KEY `tb_transaksi_id_area_foreign` (`id_area`),
  KEY `tb_transaksi_id_user_foreign` (`id_user`),
  KEY `tb_transaksi_id_tarif_foreign` (`id_tarif`),
  KEY `tb_transaksi_id_kendaraan_foreign` (`id_kendaraan`),
  CONSTRAINT `tb_transaksi_id_area_foreign` FOREIGN KEY (`id_area`) REFERENCES `tb_area_parkir` (`id_area`),
  CONSTRAINT `tb_transaksi_id_kendaraan_foreign` FOREIGN KEY (`id_kendaraan`) REFERENCES `tb_kendaraan` (`id_kendaraan`),
  CONSTRAINT `tb_transaksi_id_tarif_foreign` FOREIGN KEY (`id_tarif`) REFERENCES `tb_tarif` (`id_tarif`),
  CONSTRAINT `tb_transaksi_id_user_foreign` FOREIGN KEY (`id_user`) REFERENCES `tb_user` (`id_user`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tb_transaksi`
--

LOCK TABLES `tb_transaksi` WRITE;
/*!40000 ALTER TABLE `tb_transaksi` DISABLE KEYS */;
INSERT INTO `tb_transaksi` VALUES (3,1,'2026-10-17 08:00:00','2026-10-17 13:00:00',2,5,25000,'keluar',2,1),(4,2,'2026-10-16 08:00:00','2026-10-16 09:00:00',1,1,2000,'keluar',2,3),(5,3,'2026-10-15 08:00:00','2026-10-15 11:00:00',2,3,15000,'keluar',2,2),(6,1,'2026-10-14 08:00:00','2026-10-14 10:00:00',2,2,10000,'keluar',2,1),(7,2,'2026-10-13 08:00:00','2026-10-13 12:00:00',1,4,8000,'keluar',2,3),(8,3,'2026-10-18 08:00:00','2026-10-18 16:00:00',2,8,40000,'keluar',2,1),(9,1,'2026-10-19 08:00:00','2026-10-19 14:00:00',2,6,30000,'keluar',2,2),(10,2,'2026-10-19 07:24:52',NULL,1,NULL,NULL,'masuk',2,3),(11,3,'2026-10-19 08:24:52',NULL,2,NULL,NULL,'masuk',2,1);
/*!40000 ALTER TABLE `tb_transaksi` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tb_user`
--

DROP TABLE IF EXISTS `tb_user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tb_user` (
  `id_user` int(11) NOT NULL AUTO_INCREMENT,
  `nama_lengkap` varchar(50) NOT NULL,
  `username` varchar(50) NOT NULL,
  `password` varchar(100) NOT NULL,
  `role` enum('admin','petugas','owner') NOT NULL,
  `status_aktif` tinyint(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id_user`),
  UNIQUE KEY `tb_user_username_unique` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tb_user`
--

LOCK TABLES `tb_user` WRITE;
/*!40000 ALTER TABLE `tb_user` DISABLE KEYS */;
INSERT INTO `tb_user` VALUES (1,'Administrator','admin','$2y$12$6MngWgB04fSlhjdfwVSdbe8hvlpLgEZhnsFWHoxQpYyzmDyZDi4J2','admin',1),(2,'Petugas Pos','petugas','$2y$12$82WiMRFVcirSxQvp332KX.zvHwjJmqVLvuiiQheCEZbi37ay6.xE2','petugas',1),(3,'Pemilik Usaha','owner','$2y$12$2u4f2FW.BTKnAyVsTGTLOONbZHb2CkUmukT7KjE6Z5B3ZmtN0Qkvi','owner',1);
/*!40000 ALTER TABLE `tb_user` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-10-19  9:26:58
