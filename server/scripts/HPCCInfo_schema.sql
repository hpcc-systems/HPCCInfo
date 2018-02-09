CREATE DATABASE  IF NOT EXISTS `hpccinfo`;
USE `hpccinfo`;

--
-- Table structure for table `ProjectDetails`
--

CREATE TABLE `projectdetails` (
  `projectdata` TEXT NOT NULL,
  `projectid` varchar(50) NOT NULL,
  `title` varchar(50) NOT NULL,
  `updatedby` varchar(50) NOT NULL,
  `dateupdated` timestamp,
  `file` varchar(100)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `user` (
  `UserId` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `FirstName` varchar(30) NOT NULL,
  `LastName` varchar(30) NOT NULL,
  `UserName` varchar(45) NOT NULL,
  `Password` varchar(50) NOT NULL,
  `Email` varchar(50) NOT NULL,
  `IsDeleted` tinyint(1) NOT NULL,
  `CreatedDate` timestamp NULL DEFAULT NULL,
  `ModifiedDate` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`UserId`),
  UNIQUE KEY `UserName_UNIQUE` (`UserName`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8 