-- MySQL dump 10.13  Distrib 8.0.34, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: checklist
-- ------------------------------------------------------
-- Server version	8.0.34

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `category`
--

DROP TABLE IF EXISTS `category`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `category` (
  `category_num` varchar(25) NOT NULL,
  `category_name` varchar(45) NOT NULL,
  PRIMARY KEY (`category_num`),
  UNIQUE KEY `category_num` (`category_num`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `category`
--

LOCK TABLES `category` WRITE;
/*!40000 ALTER TABLE `category` DISABLE KEYS */;
INSERT INTO `category` VALUES ('一','消費法規之遵循'),('七','信託業務行銷廣告'),('三','商品申請書、定型化契約之訂定'),('九','我也是新的類別'),('二','行銷廣告'),('五','著作人格權及智慧財產權合法取得'),('八','我是新的類別'),('六','法令覆核'),('四','消費爭議之處理');
/*!40000 ALTER TABLE `category` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `question`
--

DROP TABLE IF EXISTS `question`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `question` (
  `id_question` int NOT NULL AUTO_INCREMENT,
  `category_num` varchar(5) NOT NULL,
  `question_num` varchar(5) NOT NULL,
  `question` varchar(255) NOT NULL,
  `ad_inf` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id_question`),
  UNIQUE KEY `category_question_uk` (`category_num`,`question_num`),
  CONSTRAINT `question_ibfk_1` FOREIGN KEY (`category_num`) REFERENCES `category` (`category_num`)
) ENGINE=InnoDB AUTO_INCREMENT=38 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `question`
--

LOCK TABLES `question` WRITE;
/*!40000 ALTER TABLE `question` DISABLE KEYS */;
INSERT INTO `question` VALUES (1,'一','1','廣告文宣製作設計時，是否詳細審酌參照消費者保護相關法令？','金融消費者保護法'),(2,'一','2','訂定廣告文宣文字內容時，是否詳細審核其適法性？',NULL),(3,'二','1','廣告文宣內容之真實性，是否確認無誇大虛偽宣傳或宣示致使大眾誤解？',NULL),(4,'二','2','針對廣告文宣之活動內容、客戶承作條件、限制條件、優惠條件及相關詳細內容是否確認已明確揭露？',NULL),(5,'二','3','廣告文宣之內容是否確認無誤導消費者不正確之價值及理財觀念？','審核規範後，如果文本中你認為優惠條件沒有明確說明，不符合的原因請確切提出哪部分資訊尚未提供。'),(6,'二','4','廣告文宣之內容是否加註醒語文字，並將重要訊息同時提供於網站首頁以連結方式告知消費者?',NULL),(7,'三','1','各項定型化契約書是否已確實依金管會所訂之定型化契約範本及應記載、不得記載事項加以修改？',NULL),(8,'三','2','各項申請書、定型化契約書中對於各項費用等訊息，是否完整揭露？',NULL),(9,'四','1','是否已設置申訴管道或服務專線？',NULL),(10,'四','2','消費爭議發生時，是否有明確單位負責處理或協調？',NULL),(11,'五','1','廣宣資料內容所使用之圖片、人物、影像、音樂…等之著作人格權及著作智慧財產權是否合法取得及使用?',NULL),(12,'六','1','廣宣資料確定內容無不當、不實陳述、誤導消費者或違反相關法令規章之情事。','審查規範後，如果文本中你認為優惠條件沒有明確說明，不符合的原因請確切提出哪部分資訊尚未提供。'),(13,'七','1','廣告文宣之內容如涉及信託業務，是否符合 信託業從事廣告、業務招攬及營業促銷活動應遵循事項第六條第一項第十一款：從事高齡者或身心障礙者財產信託業務(以下簡稱安養信託)之宣導推廣活動時，提供贈品之單一成本價格上限為新臺幣五百元，安養信託以外之一般信託業務之宣導推廣活動，提供贈品之單一成本價格上限為新臺幣二百元，且均不得重複領取或累積金額以換取其他贈品。贈品活動不得變相誘導投資大眾或客戶申購特定金融商品。',NULL),(14,'七','2','廣告文宣之內容如涉及信託業務，是否未涉及特定投資標的？ （不得對一般大眾）','特定投資標的: 特定金錢信託/有價證券信託'),(15,'七','3','奈米投是否未提及「代操」、「智能理財」等語？',NULL),(16,'七','4','廣告文宣之內容如涉及信託業務，涉及投資理財分析等金融專業及相關事實陳述，是否具備合理分析基礎及根據？','投資理財分析等金融專業及相關事實陳述: 文本中有提到投資產品(實際)的報酬率(%)或相關量化分析的陳述'),(17,'七','5','廣告文宣之內容如涉及信託業務，是否「未引起一般投資大眾或客戶對信託業及其他同業或競爭者之商標或標章等混淆或誤認之虞」？',NULL),(18,'七','6','廣告文宣之內容如涉及信託業務，是否「未貶低或詆毀其他同業或競爭者之業務或聲譽、貶低整體行業聲譽或以攻訐同業之方式作宣傳」？',NULL),(19,'七','7','廣告文宣之內容如涉及信託業務，是否「無虛偽、詐欺、隱匿或其他足致他人誤信之行為」？',NULL),(20,'七','8','廣告文宣之內容如涉及信託業務，是否符合「未將有定期配息性質之金融商品，與定期存款相互比擬，以避免誤導投資人對於金融商品實質風險之誤認」？','定期配息之金融商品:股票股利、債券、定期存款、投資信託、REITs（房地產投資信託）、優先股。'),(21,'七','9','廣告文宣之內容如涉及信託業務，有關賦稅優惠之說明，是否載明所適用之對象及範圍？','如果沒有與稅相關的優惠，則是否符合規定輸出:不適用'),(22,'七','10','有關免稅之說明，是否載明免稅對象、免稅內容？','如果沒有與稅相關的優惠，則是否符合規定輸出:不適用'),(23,'七','11','如涉及比較信託業及其競爭者時(如奈米投)，是否為客觀公平之比較，並揭露該比較之假設條件及比較因素，不得有誤導一般投資大眾或客戶之虞？',NULL),(24,'七','12','是否出現「錯別字」或「不雅之文字」？',NULL),(25,'七','13','是否符合「不得片斷截取報章雜誌之報導作為廣告、業務招攬及營業促銷活動時之資料內容。引用數據、資料及他人論述作為廣告、業務招攬及營業促銷活動之資料內容時，是否註明出處且未有故意隱匿不利之部分致有誤導投資大眾或客戶之虞」？',NULL),(26,'七','14','廣告文宣之內容如涉及信託業務，是否刊登警語者，該警語字體大小，不得小於同一廣告上其他部分最小之字體，並應以粗體印刷顯著標示，以便客戶於快速閱覽相關廣告時，均可顯而易見？',NULL),(27,'七','15','是否載明本行(台北富邦銀行)之名稱及聯絡方式？',NULL),(28,'七','16','廣告文宣之內容如涉及特定投資標的推介或具有暗示性勸誘者，是否符合信託業營運範圍受益權轉讓限制風險揭露及行銷訂約管理辦法第21條第1項第3款之規定「未寄送予年齡為七十歲以上、教育程度為國中畢業以下或有全民健康保險重大傷病證明之非專業投資人」？',NULL),(29,'七','17','廣告文宣之內容如涉及信託業務，是否「未涉及對新台幣走勢之臆測」？',NULL),(30,'七','18','廣告文宣之內容如涉及信託業務，是否符合「未使用「優於定存」、「打敗通膨」等相類詞語」？',NULL),(31,'七','19','廣告中使用了「第一」、「冠軍」、「最多」、「最大」等最高級用語？若適用，則是否有銷售數字或意見調查等客觀數據佐證？','最高級用語:第一、冠軍、最多、最大、最佳、頂尖、最優、最高、首位、領先、榜首、最速、最先、最強、最好、唯一、最頂級、最值得、最受歡迎、最新以此類推(最…)'),(32,'七','20','廣告文宣之內容如涉及信託業務，是否符合「不得採用使人誤信能保證本金之安全或獲利之文字」？',NULL),(33,'七','21','廣告文宣之內容如涉及信託業務，是否符合「對於獲利與風險應作平衡報導」',NULL),(34,'七','22','廣告內容含有推介衍生性金融商品，是否有排除寄送予最近一年內辦理衍生性金融商品交易筆數低於五筆之非專業投資人？',NULL),(35,'七','23','文件內容是否已經部門主管、部門法遵主管審閱，確認內容無不當、不實陳述、誤導客戶或違反相關法令及自律規範（如後附）之情事？',NULL),(36,'七','24','針對已簽立不具運用決定權之金錢信託契約或有價證券信託契約之非專業投資客戶，是否於推介前已取得委託人之同意書？',NULL),(37,'七','25','請確認文案內容與佐證資料是否不符?',NULL);
/*!40000 ALTER TABLE `question` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2023-09-26 14:58:03
-- MySQL dump 10.13  Distrib 8.0.34, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: marketing_cap
-- ------------------------------------------------------
-- Server version	8.0.34

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `audience`
--

DROP TABLE IF EXISTS `audience`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `audience` (
  `audience_id` int NOT NULL AUTO_INCREMENT,
  `targetAudience` varchar(45) NOT NULL,
  `age1` varchar(45) DEFAULT NULL,
  `age2` varchar(45) DEFAULT NULL,
  `salary1` varchar(45) DEFAULT NULL,
  `salary2` varchar(45) DEFAULT NULL,
  `gender` varchar(45) DEFAULT NULL,
  `marriage` varchar(45) DEFAULT NULL,
  `child` varchar(45) DEFAULT NULL,
  `spaceTime` varchar(45) DEFAULT NULL,
  `riskOverwhelming` varchar(45) DEFAULT NULL,
  `socialParticipate` varchar(45) DEFAULT NULL,
  `otherFeature` varchar(45) DEFAULT NULL,
  `user_id` int DEFAULT NULL,
  PRIMARY KEY (`audience_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `audience_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `audience`
--

LOCK TABLES `audience` WRITE;
/*!40000 ALTER TABLE `audience` DISABLE KEYS */;
INSERT INTO `audience` VALUES (3,'未投資奈米投的客戶/曾經投資過奈米投,目前已取消的客戶','25','50','','','不限','不限','不限','休閒活動','投資損失在5％以內的可以接受','喜歡在社群分享自己的投資經驗','退休',1),(5,'單身族','22','45','80','220','不限','未婚','不限','與朋友共渡','投資損失在5％以內的可以接受','喜歡在社群分享自己的投資經驗','上班族',1),(6,'單身族','22','45','80','220','不限','未婚','不限','關注財經趨勢','投資損失在5％以內的可以接受','喜歡在社群分享自己的投資經驗','上班族，只花刀口錢，不花奢侈錢',1);
/*!40000 ALTER TABLE `audience` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `customvalue`
--

DROP TABLE IF EXISTS `customvalue`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `customvalue` (
  `customValue_id` int NOT NULL AUTO_INCREMENT,
  `style` varchar(45) DEFAULT NULL,
  `keyword` varchar(45) DEFAULT NULL,
  `contentStyle` varchar(45) DEFAULT NULL,
  `proposol` varchar(45) NOT NULL,
  `proposolContent` varchar(45) DEFAULT NULL,
  `showOutput` varchar(45) NOT NULL,
  `user_id` int DEFAULT NULL,
  PRIMARY KEY (`customValue_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `customvalue_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `customvalue`
--

LOCK TABLES `customvalue` WRITE;
/*!40000 ALTER TABLE `customvalue` DISABLE KEYS */;
INSERT INTO `customvalue` VALUES (16,'FIRE','FIRE','這也太洗腦了','pas',NULL,'LINE',1),(17,'說服口吻','對自己好一點','這也太洗腦了','pas',NULL,'LINE',1);
/*!40000 ALTER TABLE `customvalue` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `output`
--

DROP TABLE IF EXISTS `output`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `output` (
  `output_id` int NOT NULL AUTO_INCREMENT,
  `step_number` varchar(45) DEFAULT NULL,
  `resultStorage` varchar(45) DEFAULT NULL,
  `Main_list` text,
  `Main_slogan` text,
  `Point1` text,
  `Point2` text,
  `Point3` text,
  `Point_desc1` text,
  `Point_desc2` text,
  `Point_desc3` text,
  `Preferential` text,
  `Product` text,
  `Extra_information` text,
  `Content_1` text,
  `Content_2` text,
  `Content` text,
  `user_id` int DEFAULT NULL,
  `timess` int DEFAULT NULL,
  `task_id` int DEFAULT NULL,
  `showoutput` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`output_id`),
  KEY `user_id` (`user_id`),
  KEY `output_ibfk_2` (`task_id`),
  CONSTRAINT `output_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`),
  CONSTRAINT `output_ibfk_2` FOREIGN KEY (`task_id`) REFERENCES `tasks` (`id`) ON DELETE CASCADE,
  CONSTRAINT `output_ibfk_3` FOREIGN KEY (`task_id`) REFERENCES `tasks` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=34 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `output`
--

LOCK TABLES `output` WRITE;
/*!40000 ALTER TABLE `output` DISABLE KEYS */;
INSERT INTO `output` VALUES (28,'Step 1',NULL,'讓你的青春不留遺憾，讓你的金錢為你工作，讓你的人生自由自在。','資產',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'更多資訊請瀏覽[網址]。','1. 選擇數位理財奈米投，輕鬆進入投資市場。2. 只要1000元台幣，就能投資10-15檔ETF，財富自由不再遙遠。3. 申購贖回免手續費，只收信託管理費，讓你的投資更加划算。','榮獲9項國內外獎項肯定的數位理財奈米投，是你理財的最佳選擇。',NULL,1,1,17,'LINE'),(29,'Step 2',NULL,'讓你的投資智慧升級，讓你的人生不再受困於金錢，讓你的夢想不再受限。','解決財務問題，FIRE你的人生！',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'現在就來[網址]。','1. 透過定時定額投資，穩健獲利，讓你的財富日積月累。2. 專家每日觀察市場變化，主動平衡投資組合，讓你的投資風險降至最低。3. 申購奈米投滿六個月且為負報酬者，可享六個月免信託管理費，讓你的投資更有保障。','數位理財奈米投可自行選擇外債ETF、台灣股票ETF組合，讓你的投資組合更豐富多元。',NULL,1,1,17,'LINE'),(30,'Step 3',NULL,'','實現夢想，FIRE你的人生！',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'立即前往[網址]。','1. 透過數位理財奈米投，你可以實現你的FIRE人生。2. 有富邦網路銀行帳號即可線上申購，讓你的投資更便利，別錯過這個讓你實現夢想的機會。','數位米投的專家每日觀察市場變化，讓你的投資更有保障。',NULL,1,1,17,'LINE'),(31,'Step 1',NULL,'為單身、未婚且關注財經趨勢的您，我們提供一個幫助您實現財富自由夢想的理財平台。','對自己好一點，開始理財旅程',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'點擊了解更多 [網址]','1. 可自行選擇外債ETF、台灣股票ETF組合，共4種組合。 2. 只要1000元台幣即可投資10-15檔ETF。 3. 申購贖回免手續費,只收信託管理費。','我們的產品\"數位理財奈米投\"，2022年榮獲9項國內外獎項肯定，是市場上最受信任的理財平台之一。',NULL,1,2,17,'LINE'),(32,'Step 2',NULL,'如果您對於未來的財務狀況感到不安，或者希望能實現財富自由的夢想，那麼我們的產品就是您的最佳選擇。','別等到無力回天，現在就開始',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'立即投資 [網址]','1. 專家每日觀察市場變化，主動平衡投資組合。 2. 申購奈米投滿六個月且為負報酬者，可享六個月免信託管理費！ 3. 只須有富邦網路銀行帳號即可線上申購。','我們的產品不僅提供了全面的投資組合選擇，還提供了專業的市場觀察和投資組合管理服務，讓您的投資風險最小化。',NULL,1,2,17,'LINE'),(33,'Step 3',NULL,'我們的產品能幫助您有效管理財務，實現財富自由的夢想，讓您的未來更加美好。','投資未來，從現在開始',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'加入我們 [網址]','1. 透過定時定額投資，您可以有系統地節省並投資您的錢。 2. 我們的產品提供了多種投資選擇，讓您可以根據自己的需求和風險承受度來選擇最合適的投資組合。 3. 我們的專業團隊會為您提供市場分析和投資建議，讓您的投資更加安心。','我們的產品，不僅提供了符合您需求的投資選擇，還提供了專業的投資建議和市場分析，讓您的投資更加安心和有保障。',NULL,1,2,17,'LINE');
/*!40000 ALTER TABLE `output` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product`
--

DROP TABLE IF EXISTS `product`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product` (
  `product_id` int NOT NULL AUTO_INCREMENT,
  `productName` varchar(45) NOT NULL,
  `productType` varchar(45) NOT NULL,
  `productFeature` text NOT NULL,
  `productImage` varchar(80) NOT NULL,
  `discount` text,
  `activityMethod` text,
  `advantage` text,
  `disadvantage` text,
  `productStory` text,
  `productDeadline` varchar(45) DEFAULT NULL,
  `afterService` varchar(45) DEFAULT NULL,
  `howToPurchase` varchar(45) DEFAULT NULL,
  `purchaseCondition` varchar(45) DEFAULT NULL,
  `numLimit` varchar(45) DEFAULT NULL,
  `investmentAlert` varchar(45) DEFAULT NULL,
  `user_id` int DEFAULT NULL,
  PRIMARY KEY (`product_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `product_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product`
--

LOCK TABLES `product` WRITE;
/*!40000 ALTER TABLE `product` DISABLE KEYS */;
INSERT INTO `product` VALUES (1,'數位理財奈米投','外債ETF、台灣股票ETF','定時定額投資','年終優惠','優惠方案1	只要1000元台幣可投資10-15檔ETF\n優惠方案2	申購贖回免手續費,只收信託管理費\n優惠方案3	專家每日觀察市場變化,主動平衡投資組合\n優惠方案4	申購奈米投滿六個月且為負報酬者，可享六個月免信託管理費！','可以自行選擇外債ETF、台灣股票ETF組合，共4種組合。','2022年榮獲9項國內外獎項肯定','基金投資免手續費且免信託管理費','北漂青年打拼','2023-12-31','專家每日觀察市場變化','有富邦網路銀行帳號即可線上申購','只到2023/12/31','',NULL,1);
/*!40000 ALTER TABLE `product` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tasks`
--

DROP TABLE IF EXISTS `tasks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tasks` (
  `id` int NOT NULL AUTO_INCREMENT,
  `audience_id` int DEFAULT NULL,
  `customvalue_id` int DEFAULT NULL,
  `product_id` int DEFAULT NULL,
  `user_id` int DEFAULT NULL,
  `status` enum('Todo','InProgress','Done') DEFAULT NULL,
  `taskname` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `audience_id` (`audience_id`),
  KEY `product_id` (`product_id`),
  KEY `customvalue_id` (`customvalue_id`),
  CONSTRAINT `tasks_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tasks`
--

LOCK TABLES `tasks` WRITE;
/*!40000 ALTER TABLE `tasks` DISABLE KEYS */;
INSERT INTO `tasks` VALUES (17,6,17,1,1,'InProgress','today_20230926');
/*!40000 ALTER TABLE `tasks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user` (
  `user_id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(45) NOT NULL,
  `password` varchar(255) NOT NULL,
  PRIMARY KEY (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user`
--

LOCK TABLES `user` WRITE;
/*!40000 ALTER TABLE `user` DISABLE KEYS */;
INSERT INTO `user` VALUES (1,'sab','pbkdf2:sha256:600000$VvzcRiw3y41aMrgO$c26e7621a742b51c81abd3c2c9f1149610e3505a1971d2a7acf0f11b263e6464');
/*!40000 ALTER TABLE `user` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2023-09-26 14:58:03
