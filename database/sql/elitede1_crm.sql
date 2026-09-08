-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Dec 23, 2024 at 11:31 PM
-- Server version: 10.11.10-MariaDB
-- PHP Version: 8.3.14

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `elitede1_crm`
--

-- --------------------------------------------------------

--
-- Table structure for table `accept_estimates`
--

CREATE TABLE `accept_estimates` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `company_id` int(10) UNSIGNED DEFAULT NULL,
  `estimate_id` int(10) UNSIGNED NOT NULL,
  `full_name` varchar(191) NOT NULL,
  `email` varchar(191) NOT NULL,
  `signature` varchar(191) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `appreciations`
--

CREATE TABLE `appreciations` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `company_id` int(10) UNSIGNED DEFAULT NULL,
  `award_id` bigint(20) UNSIGNED NOT NULL,
  `award_to` int(10) UNSIGNED NOT NULL,
  `award_date` date NOT NULL,
  `image` varchar(191) DEFAULT NULL,
  `summary` text DEFAULT NULL,
  `added_by` int(10) UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `attendances`
--

CREATE TABLE `attendances` (
  `id` int(10) UNSIGNED NOT NULL,
  `company_id` int(10) UNSIGNED DEFAULT NULL,
  `user_id` int(10) UNSIGNED NOT NULL,
  `location_id` bigint(20) UNSIGNED DEFAULT NULL,
  `clock_in_time` datetime NOT NULL,
  `clock_out_time` datetime DEFAULT NULL,
  `auto_clock_out` tinyint(1) NOT NULL DEFAULT 0,
  `clock_in_ip` varchar(191) NOT NULL,
  `clock_out_ip` varchar(191) DEFAULT NULL,
  `working_from` varchar(191) DEFAULT 'office',
  `late` enum('yes','no') NOT NULL DEFAULT 'no',
  `half_day` enum('yes','no') NOT NULL,
  `half_day_type` varchar(191) DEFAULT NULL,
  `added_by` int(10) UNSIGNED DEFAULT NULL,
  `last_updated_by` int(10) UNSIGNED DEFAULT NULL,
  `latitude` decimal(10,8) DEFAULT NULL,
  `longitude` decimal(11,8) DEFAULT NULL,
  `shift_start_time` datetime DEFAULT NULL,
  `shift_end_time` datetime DEFAULT NULL,
  `employee_shift_id` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `work_from_type` enum('home','office','other') NOT NULL DEFAULT 'other',
  `overwrite_attendance` enum('yes','no') NOT NULL DEFAULT 'no'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `attendance_settings`
--

CREATE TABLE `attendance_settings` (
  `id` int(10) UNSIGNED NOT NULL,
  `company_id` int(10) UNSIGNED DEFAULT NULL,
  `auto_clock_in` enum('yes','no') NOT NULL DEFAULT 'no',
  `auto_clock_in_location` enum('office','home') NOT NULL DEFAULT 'office',
  `office_start_time` time NOT NULL,
  `office_end_time` time NOT NULL,
  `halfday_mark_time` time DEFAULT NULL,
  `late_mark_duration` tinyint(4) NOT NULL,
  `clockin_in_day` int(11) NOT NULL DEFAULT 1,
  `employee_clock_in_out` enum('yes','no') NOT NULL DEFAULT 'yes',
  `office_open_days` varchar(191) NOT NULL DEFAULT '[1,2,3,4,5]',
  `ip_address` text DEFAULT NULL,
  `radius` int(11) DEFAULT NULL,
  `radius_check` enum('yes','no') NOT NULL DEFAULT 'no',
  `ip_check` enum('yes','no') NOT NULL DEFAULT 'no',
  `alert_after` int(11) DEFAULT NULL,
  `alert_after_status` tinyint(1) NOT NULL DEFAULT 1,
  `save_current_location` tinyint(1) NOT NULL DEFAULT 0,
  `default_employee_shift` bigint(20) UNSIGNED DEFAULT 1,
  `week_start_from` varchar(191) NOT NULL DEFAULT '1',
  `allow_shift_change` tinyint(1) NOT NULL DEFAULT 1,
  `show_clock_in_button` enum('yes','no') NOT NULL DEFAULT 'no',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `monthly_report` tinyint(1) NOT NULL DEFAULT 0,
  `monthly_report_roles` varchar(191) DEFAULT NULL,
  `qr_enable` enum('1','0') NOT NULL DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `attendance_settings`
--

INSERT INTO `attendance_settings` (`id`, `company_id`, `auto_clock_in`, `auto_clock_in_location`, `office_start_time`, `office_end_time`, `halfday_mark_time`, `late_mark_duration`, `clockin_in_day`, `employee_clock_in_out`, `office_open_days`, `ip_address`, `radius`, `radius_check`, `ip_check`, `alert_after`, `alert_after_status`, `save_current_location`, `default_employee_shift`, `week_start_from`, `allow_shift_change`, `show_clock_in_button`, `created_at`, `updated_at`, `monthly_report`, `monthly_report_roles`, `qr_enable`) VALUES
(1, 1, 'no', 'office', '09:00:00', '18:00:00', '13:00:00', 20, 1, 'yes', '[1,2,3,4,5]', NULL, NULL, 'no', 'no', NULL, 0, 0, 2, '1', 1, 'no', '2024-12-17 22:23:25', '2024-12-17 22:23:25', 0, NULL, '1');

-- --------------------------------------------------------

--
-- Table structure for table `automate_shifts`
--

CREATE TABLE `automate_shifts` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` int(10) UNSIGNED NOT NULL,
  `employee_shift_rotation_id` int(10) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `awards`
--

CREATE TABLE `awards` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `company_id` int(10) UNSIGNED DEFAULT NULL,
  `title` varchar(191) NOT NULL,
  `award_icon_id` bigint(20) UNSIGNED DEFAULT NULL,
  `summary` text DEFAULT NULL,
  `status` enum('active','inactive') NOT NULL DEFAULT 'active',
  `color_code` varchar(191) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `award_icons`
--

CREATE TABLE `award_icons` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `title` varchar(191) NOT NULL,
  `icon` varchar(191) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `award_icons`
--

INSERT INTO `award_icons` (`id`, `title`, `icon`, `created_at`, `updated_at`) VALUES
(1, 'Trophy', 'trophy', '2024-12-17 22:23:19', '2024-12-17 22:23:19'),
(2, 'Thumbs Up', 'hand-thumbs-up', '2024-12-17 22:23:19', '2024-12-17 22:23:19'),
(3, 'Award', 'award', '2024-12-17 22:23:19', '2024-12-17 22:23:19'),
(4, 'Book', 'book', '2024-12-17 22:23:19', '2024-12-17 22:23:19'),
(5, 'Gift', 'gift', '2024-12-17 22:23:19', '2024-12-17 22:23:19'),
(6, 'Watch', 'watch', '2024-12-17 22:23:19', '2024-12-17 22:23:19'),
(7, 'Cup', 'cup-hot', '2024-12-17 22:23:19', '2024-12-17 22:23:19'),
(8, 'Puzzle', 'puzzle', '2024-12-17 22:23:19', '2024-12-17 22:23:19'),
(9, 'Plane', 'airplane', '2024-12-17 22:23:19', '2024-12-17 22:23:19'),
(10, 'Money', 'piggy-bank', '2024-12-17 22:23:19', '2024-12-17 22:23:19');

-- --------------------------------------------------------

--
-- Table structure for table `bank_accounts`
--

CREATE TABLE `bank_accounts` (
  `id` int(10) UNSIGNED NOT NULL,
  `company_id` int(10) UNSIGNED DEFAULT NULL,
  `type` varchar(191) DEFAULT NULL,
  `bank_name` varchar(191) DEFAULT NULL,
  `account_name` varchar(191) DEFAULT NULL,
  `account_number` varchar(191) DEFAULT NULL,
  `account_type` varchar(191) DEFAULT NULL,
  `currency_id` int(10) UNSIGNED DEFAULT NULL,
  `contact_number` varchar(191) DEFAULT NULL,
  `opening_balance` double(15,2) DEFAULT NULL,
  `bank_logo` varchar(191) DEFAULT NULL,
  `status` tinyint(1) DEFAULT NULL,
  `added_by` int(10) UNSIGNED DEFAULT NULL,
  `last_updated_by` int(10) UNSIGNED DEFAULT NULL,
  `bank_balance` double(16,2) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `bank_transactions`
--

CREATE TABLE `bank_transactions` (
  `id` int(10) UNSIGNED NOT NULL,
  `company_id` int(10) UNSIGNED DEFAULT NULL,
  `bank_account_id` int(10) UNSIGNED DEFAULT NULL,
  `payment_id` int(10) UNSIGNED DEFAULT NULL,
  `invoice_id` int(10) UNSIGNED DEFAULT NULL,
  `expense_id` int(10) UNSIGNED DEFAULT NULL,
  `amount` double(15,2) DEFAULT NULL,
  `type` enum('Cr','Dr') NOT NULL DEFAULT 'Cr',
  `added_by` int(10) UNSIGNED DEFAULT NULL,
  `last_updated_by` int(10) UNSIGNED DEFAULT NULL,
  `memo` text DEFAULT NULL,
  `transaction_relation` varchar(191) DEFAULT NULL,
  `transaction_related_to` varchar(191) DEFAULT NULL,
  `title` text DEFAULT NULL,
  `transaction_date` date DEFAULT NULL,
  `bank_balance` double(16,2) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `client_categories`
--

CREATE TABLE `client_categories` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `company_id` int(10) UNSIGNED DEFAULT NULL,
  `category_name` varchar(191) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `client_contacts`
--

CREATE TABLE `client_contacts` (
  `id` int(10) UNSIGNED NOT NULL,
  `company_id` int(10) UNSIGNED DEFAULT NULL,
  `user_id` int(10) UNSIGNED NOT NULL,
  `contact_name` varchar(191) NOT NULL,
  `phone` varchar(191) DEFAULT NULL,
  `email` varchar(191) DEFAULT NULL,
  `title` varchar(191) DEFAULT NULL,
  `added_by` int(10) UNSIGNED DEFAULT NULL,
  `last_updated_by` int(10) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `client_details`
--

CREATE TABLE `client_details` (
  `id` int(10) UNSIGNED NOT NULL,
  `company_id` int(10) UNSIGNED DEFAULT NULL,
  `user_id` int(10) UNSIGNED NOT NULL,
  `company_name` varchar(191) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `shipping_address` text DEFAULT NULL,
  `postal_code` varchar(191) DEFAULT NULL,
  `state` varchar(191) DEFAULT NULL,
  `city` varchar(191) DEFAULT NULL,
  `office` varchar(191) DEFAULT NULL,
  `website` varchar(191) DEFAULT NULL,
  `note` text DEFAULT NULL,
  `linkedin` varchar(191) DEFAULT NULL,
  `facebook` varchar(191) DEFAULT NULL,
  `twitter` varchar(191) DEFAULT NULL,
  `skype` varchar(191) DEFAULT NULL,
  `tax_name` varchar(191) DEFAULT NULL,
  `gst_number` varchar(191) DEFAULT NULL,
  `category_id` bigint(20) UNSIGNED DEFAULT NULL,
  `sub_category_id` bigint(20) UNSIGNED DEFAULT NULL,
  `added_by` int(10) UNSIGNED DEFAULT NULL,
  `last_updated_by` int(10) UNSIGNED DEFAULT NULL,
  `company_logo` varchar(191) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `quickbooks_client_id` int(11) DEFAULT NULL,
  `electronic_address` varchar(191) DEFAULT NULL,
  `electronic_address_scheme` varchar(191) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `client_docs`
--

CREATE TABLE `client_docs` (
  `id` int(10) UNSIGNED NOT NULL,
  `company_id` int(10) UNSIGNED DEFAULT NULL,
  `user_id` int(10) UNSIGNED NOT NULL,
  `name` varchar(200) NOT NULL,
  `filename` varchar(200) NOT NULL,
  `hashname` varchar(200) NOT NULL,
  `size` varchar(200) DEFAULT NULL,
  `added_by` int(10) UNSIGNED DEFAULT NULL,
  `last_updated_by` int(10) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `client_notes`
--

CREATE TABLE `client_notes` (
  `id` int(10) UNSIGNED NOT NULL,
  `company_id` int(10) UNSIGNED DEFAULT NULL,
  `client_id` int(10) UNSIGNED DEFAULT NULL,
  `title` varchar(191) NOT NULL,
  `type` tinyint(1) NOT NULL DEFAULT 0,
  `member_id` int(10) UNSIGNED DEFAULT NULL,
  `is_client_show` tinyint(1) NOT NULL DEFAULT 0,
  `ask_password` tinyint(1) NOT NULL DEFAULT 0,
  `details` longtext NOT NULL,
  `added_by` int(10) UNSIGNED DEFAULT NULL,
  `last_updated_by` int(10) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `client_sub_categories`
--

CREATE TABLE `client_sub_categories` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `company_id` int(10) UNSIGNED DEFAULT NULL,
  `category_id` bigint(20) UNSIGNED NOT NULL,
  `category_name` varchar(191) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `client_user_notes`
--

CREATE TABLE `client_user_notes` (
  `id` int(10) UNSIGNED NOT NULL,
  `company_id` int(10) UNSIGNED DEFAULT NULL,
  `user_id` int(10) UNSIGNED NOT NULL,
  `client_note_id` int(10) UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `companies`
--

CREATE TABLE `companies` (
  `id` int(10) UNSIGNED NOT NULL,
  `company_name` varchar(191) NOT NULL,
  `app_name` varchar(191) DEFAULT NULL,
  `company_email` varchar(191) NOT NULL,
  `company_phone` varchar(191) NOT NULL,
  `logo` varchar(191) DEFAULT NULL,
  `light_logo` varchar(191) DEFAULT NULL,
  `favicon` varchar(191) DEFAULT NULL,
  `auth_theme` enum('dark','light') NOT NULL DEFAULT 'light',
  `auth_theme_text` enum('dark','light') NOT NULL DEFAULT 'dark',
  `sidebar_logo_style` enum('square','full') NOT NULL DEFAULT 'square',
  `login_background` varchar(191) DEFAULT NULL,
  `address` text NOT NULL,
  `website` varchar(191) DEFAULT NULL,
  `currency_id` int(10) UNSIGNED DEFAULT NULL,
  `timezone` varchar(191) NOT NULL DEFAULT 'Asia/Kolkata',
  `date_format` varchar(20) NOT NULL DEFAULT 'd-m-Y',
  `date_picker_format` varchar(191) NOT NULL DEFAULT 'dd-mm-yyyy',
  `year_starts_from` varchar(191) NOT NULL DEFAULT '1',
  `moment_format` varchar(191) NOT NULL DEFAULT 'DD-MM-YYYY',
  `time_format` varchar(20) NOT NULL DEFAULT 'h:i a',
  `locale` varchar(191) NOT NULL DEFAULT 'en',
  `latitude` decimal(10,8) NOT NULL DEFAULT 26.91243360,
  `longitude` decimal(11,8) NOT NULL DEFAULT 75.78727090,
  `leaves_start_from` enum('joining_date','year_start') NOT NULL DEFAULT 'joining_date',
  `active_theme` enum('default','custom') NOT NULL DEFAULT 'default',
  `status` enum('active','inactive') NOT NULL DEFAULT 'active',
  `last_updated_by` int(10) UNSIGNED DEFAULT NULL,
  `google_map_key` varchar(191) DEFAULT NULL,
  `task_self` enum('yes','no') NOT NULL DEFAULT 'yes',
  `rounded_theme` tinyint(1) NOT NULL DEFAULT 1,
  `logo_background_color` varchar(191) NOT NULL DEFAULT '#ffffff',
  `header_color` varchar(191) NOT NULL DEFAULT '#1D82F5',
  `before_days` int(11) NOT NULL,
  `after_days` int(11) NOT NULL,
  `on_deadline` enum('yes','no') NOT NULL DEFAULT 'yes',
  `default_task_status` int(10) UNSIGNED DEFAULT NULL,
  `dashboard_clock` tinyint(1) NOT NULL DEFAULT 1,
  `ticket_form_google_captcha` tinyint(1) NOT NULL DEFAULT 0,
  `lead_form_google_captcha` tinyint(1) NOT NULL DEFAULT 0,
  `taskboard_length` int(11) NOT NULL DEFAULT 10,
  `datatable_row_limit` int(11) NOT NULL DEFAULT 10,
  `allow_client_signup` tinyint(1) NOT NULL,
  `admin_client_signup_approval` tinyint(1) NOT NULL,
  `google_calendar_status` enum('active','inactive') NOT NULL DEFAULT 'inactive',
  `google_client_id` text DEFAULT NULL,
  `google_client_secret` text DEFAULT NULL,
  `google_calendar_verification_status` enum('verified','non_verified') NOT NULL DEFAULT 'non_verified',
  `google_id` varchar(191) DEFAULT NULL,
  `name` varchar(191) DEFAULT NULL,
  `token` text DEFAULT NULL,
  `hash` varchar(191) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `last_login` datetime DEFAULT NULL,
  `rtl` tinyint(1) NOT NULL DEFAULT 0,
  `show_new_webhook_alert` tinyint(1) NOT NULL DEFAULT 0,
  `pm_type` varchar(191) DEFAULT NULL,
  `pm_last_four` varchar(191) DEFAULT NULL,
  `employee_can_export_data` tinyint(1) NOT NULL DEFAULT 1,
  `headers` text DEFAULT NULL,
  `register_ip` varchar(191) DEFAULT NULL,
  `location_details` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `companies`
--

INSERT INTO `companies` (`id`, `company_name`, `app_name`, `company_email`, `company_phone`, `logo`, `light_logo`, `favicon`, `auth_theme`, `auth_theme_text`, `sidebar_logo_style`, `login_background`, `address`, `website`, `currency_id`, `timezone`, `date_format`, `date_picker_format`, `year_starts_from`, `moment_format`, `time_format`, `locale`, `latitude`, `longitude`, `leaves_start_from`, `active_theme`, `status`, `last_updated_by`, `google_map_key`, `task_self`, `rounded_theme`, `logo_background_color`, `header_color`, `before_days`, `after_days`, `on_deadline`, `default_task_status`, `dashboard_clock`, `ticket_form_google_captcha`, `lead_form_google_captcha`, `taskboard_length`, `datatable_row_limit`, `allow_client_signup`, `admin_client_signup_approval`, `google_calendar_status`, `google_client_id`, `google_client_secret`, `google_calendar_verification_status`, `google_id`, `name`, `token`, `hash`, `created_at`, `updated_at`, `last_login`, `rtl`, `show_new_webhook_alert`, `pm_type`, `pm_last_four`, `employee_can_export_data`, `headers`, `register_ip`, `location_details`) VALUES
(1, 'Elite Design', 'Elite Design', 'company@email.com', '1234567891', NULL, NULL, NULL, 'light', 'dark', 'square', NULL, 'Your Company address here', 'https://worksuite.biz', 1, 'Asia/Kolkata', 'd-m-Y', 'dd-mm-yyyy', '1', 'DD-MM-YYYY', 'h:i a', 'en', 26.91243360, 75.78727090, 'year_start', 'default', 'active', 1, NULL, 'yes', 1, '#FFFFFF', '#1D82F5', 0, 0, 'yes', 1, 1, 0, 0, 10, 10, 0, 0, 'inactive', NULL, NULL, 'non_verified', NULL, NULL, NULL, '86bc93e6283d54061f162327804344b7', '2024-12-17 22:23:25', '2024-12-23 09:34:51', NULL, 0, 0, NULL, NULL, 1, '{\n    \"userAgent\": \"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/131.0.0.0 Safari\\/537.36\",\n    \"isMobile\": false,\n    \"isTablet\": false,\n    \"isDesktop\": true,\n    \"isBot\": false,\n    \"isChrome\": true,\n    \"isFirefox\": false,\n    \"isOpera\": false,\n    \"isSafari\": false,\n    \"isEdge\": false,\n    \"isInApp\": false,\n    \"isIE\": false,\n    \"browserName\": \"Chrome 131\",\n    \"browserFamily\": \"Chrome\",\n    \"browserVersion\": \"131\",\n    \"browserVersionMajor\": 131,\n    \"browserVersionMinor\": 0,\n    \"browserVersionPatch\": 0,\n    \"browserEngine\": \"Blink\",\n    \"platformName\": \"Windows 10\",\n    \"platformFamily\": \"Windows\",\n    \"platformVersion\": \"10\",\n    \"platformVersionMajor\": 10,\n    \"platformVersionMinor\": 0,\n    \"platformVersionPatch\": 0,\n    \"isWindows\": true,\n    \"isLinux\": false,\n    \"isMac\": false,\n    \"isAndroid\": false,\n    \"deviceFamily\": \"Unknown\",\n    \"deviceModel\": \"\"\n}', NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `company_addresses`
--

CREATE TABLE `company_addresses` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `company_id` int(10) UNSIGNED DEFAULT NULL,
  `country_id` int(10) UNSIGNED DEFAULT NULL,
  `address` mediumtext NOT NULL,
  `is_default` tinyint(1) NOT NULL,
  `tax_number` varchar(191) DEFAULT NULL,
  `tax_name` varchar(191) DEFAULT NULL,
  `location` varchar(191) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `latitude` decimal(10,8) DEFAULT NULL,
  `longitude` decimal(11,8) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `company_addresses`
--

INSERT INTO `company_addresses` (`id`, `company_id`, `country_id`, `address`, `is_default`, `tax_number`, `tax_name`, `location`, `created_at`, `updated_at`, `latitude`, `longitude`) VALUES
(1, 1, NULL, 'Your Company address here', 1, NULL, NULL, 'Worksuite', '2024-12-17 22:23:25', '2024-12-17 22:23:25', NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `contracts`
--

CREATE TABLE `contracts` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `contract_number` varchar(191) DEFAULT NULL,
  `original_contract_number` varchar(191) DEFAULT NULL,
  `company_id` int(10) UNSIGNED DEFAULT NULL,
  `client_id` int(10) UNSIGNED NOT NULL,
  `project_id` int(10) UNSIGNED DEFAULT NULL,
  `subject` varchar(191) NOT NULL,
  `amount` varchar(191) NOT NULL,
  `original_amount` decimal(15,2) NOT NULL,
  `contract_type_id` bigint(20) UNSIGNED DEFAULT NULL,
  `start_date` date NOT NULL,
  `original_start_date` date NOT NULL,
  `end_date` date DEFAULT NULL,
  `original_end_date` date DEFAULT NULL,
  `description` longtext DEFAULT NULL,
  `contract_name` varchar(191) DEFAULT NULL,
  `alternate_address` varchar(191) DEFAULT NULL,
  `contract_note` text DEFAULT NULL,
  `cell` varchar(191) DEFAULT NULL,
  `office` varchar(191) DEFAULT NULL,
  `city` varchar(191) DEFAULT NULL,
  `state` varchar(191) DEFAULT NULL,
  `country` varchar(191) DEFAULT NULL,
  `postal_code` varchar(191) DEFAULT NULL,
  `contract_detail` longtext DEFAULT NULL,
  `added_by` int(10) UNSIGNED DEFAULT NULL,
  `last_updated_by` int(10) UNSIGNED DEFAULT NULL,
  `hash` text DEFAULT NULL,
  `currency_id` int(10) UNSIGNED DEFAULT NULL,
  `event_id` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `company_sign` varchar(191) DEFAULT NULL,
  `sign_date` datetime DEFAULT NULL,
  `sign_by` int(10) UNSIGNED DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `contract_discussions`
--

CREATE TABLE `contract_discussions` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `company_id` int(10) UNSIGNED DEFAULT NULL,
  `contract_id` bigint(20) UNSIGNED NOT NULL,
  `from` int(10) UNSIGNED NOT NULL,
  `message` longtext NOT NULL,
  `added_by` int(10) UNSIGNED DEFAULT NULL,
  `last_updated_by` int(10) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `contract_files`
--

CREATE TABLE `contract_files` (
  `id` int(10) UNSIGNED NOT NULL,
  `company_id` int(10) UNSIGNED DEFAULT NULL,
  `user_id` int(10) UNSIGNED NOT NULL,
  `contract_id` bigint(20) UNSIGNED NOT NULL,
  `filename` varchar(191) NOT NULL,
  `hashname` varchar(191) NOT NULL,
  `size` varchar(191) NOT NULL,
  `google_url` varchar(191) NOT NULL,
  `dropbox_link` varchar(191) NOT NULL,
  `external_link_name` varchar(191) NOT NULL,
  `external_link` varchar(191) NOT NULL,
  `description` text DEFAULT NULL,
  `added_by` int(10) UNSIGNED DEFAULT NULL,
  `last_updated_by` int(10) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `contract_renews`
--

CREATE TABLE `contract_renews` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `company_id` int(10) UNSIGNED DEFAULT NULL,
  `renewed_by` int(10) UNSIGNED NOT NULL,
  `contract_id` bigint(20) UNSIGNED NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `amount` decimal(12,2) NOT NULL,
  `added_by` int(10) UNSIGNED DEFAULT NULL,
  `last_updated_by` int(10) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `contract_signs`
--

CREATE TABLE `contract_signs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `company_id` int(10) UNSIGNED DEFAULT NULL,
  `contract_id` bigint(20) UNSIGNED NOT NULL,
  `full_name` varchar(191) NOT NULL,
  `email` varchar(191) NOT NULL,
  `signature` varchar(191) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `place` varchar(191) DEFAULT NULL,
  `date` varchar(191) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `contract_templates`
--

CREATE TABLE `contract_templates` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `contract_template_number` bigint(20) DEFAULT NULL,
  `company_id` int(10) UNSIGNED DEFAULT NULL,
  `subject` varchar(191) NOT NULL,
  `description` longtext DEFAULT NULL,
  `amount` varchar(191) NOT NULL,
  `contract_type_id` bigint(20) UNSIGNED NOT NULL,
  `currency_id` int(10) UNSIGNED DEFAULT NULL,
  `contract_detail` longtext DEFAULT NULL,
  `added_by` int(11) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `contract_types`
--

CREATE TABLE `contract_types` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `company_id` int(10) UNSIGNED DEFAULT NULL,
  `name` varchar(191) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `conversation`
--

CREATE TABLE `conversation` (
  `id` int(10) UNSIGNED NOT NULL,
  `company_id` int(10) UNSIGNED DEFAULT NULL,
  `user_one` int(10) UNSIGNED NOT NULL,
  `user_two` int(10) UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `conversation_reply`
--

CREATE TABLE `conversation_reply` (
  `id` int(10) UNSIGNED NOT NULL,
  `company_id` int(10) UNSIGNED DEFAULT NULL,
  `conversation_id` int(10) UNSIGNED NOT NULL,
  `reply` text NOT NULL,
  `user_id` int(10) UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `countries`
--

CREATE TABLE `countries` (
  `id` int(10) UNSIGNED NOT NULL,
  `iso` char(2) NOT NULL,
  `name` varchar(80) NOT NULL,
  `nicename` varchar(80) NOT NULL,
  `iso3` char(3) DEFAULT NULL,
  `numcode` smallint(6) DEFAULT NULL,
  `phonecode` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `countries`
--

INSERT INTO `countries` (`id`, `iso`, `name`, `nicename`, `iso3`, `numcode`, `phonecode`) VALUES
(1, 'AF', 'AFGHANISTAN', 'Afghanistan', 'AFG', 4, 93),
(2, 'AL', 'ALBANIA', 'Albania', 'ALB', 8, 355),
(3, 'DZ', 'ALGERIA', 'Algeria', 'DZA', 12, 213),
(4, 'AS', 'AMERICAN SAMOA', 'American Samoa', 'ASM', 16, 1684),
(5, 'AD', 'ANDORRA', 'Andorra', 'AND', 20, 376),
(6, 'AO', 'ANGOLA', 'Angola', 'AGO', 24, 244),
(7, 'AI', 'ANGUILLA', 'Anguilla', 'AIA', 660, 1264),
(8, 'AQ', 'ANTARCTICA', 'Antarctica', NULL, NULL, 0),
(9, 'AG', 'ANTIGUA AND BARBUDA', 'Antigua and Barbuda', 'ATG', 28, 1268),
(10, 'AR', 'ARGENTINA', 'Argentina', 'ARG', 32, 54),
(11, 'AM', 'ARMENIA', 'Armenia', 'ARM', 51, 374),
(12, 'AW', 'ARUBA', 'Aruba', 'ABW', 533, 297),
(13, 'AU', 'AUSTRALIA', 'Australia', 'AUS', 36, 61),
(14, 'AT', 'AUSTRIA', 'Austria', 'AUT', 40, 43),
(15, 'AZ', 'AZERBAIJAN', 'Azerbaijan', 'AZE', 31, 994),
(16, 'BS', 'BAHAMAS', 'Bahamas', 'BHS', 44, 1242),
(17, 'BH', 'BAHRAIN', 'Bahrain', 'BHR', 48, 973),
(18, 'BD', 'BANGLADESH', 'Bangladesh', 'BGD', 50, 880),
(19, 'BB', 'BARBADOS', 'Barbados', 'BRB', 52, 1246),
(20, 'BY', 'BELARUS', 'Belarus', 'BLR', 112, 375),
(21, 'BE', 'BELGIUM', 'Belgium', 'BEL', 56, 32),
(22, 'BZ', 'BELIZE', 'Belize', 'BLZ', 84, 501),
(23, 'BJ', 'BENIN', 'Benin', 'BEN', 204, 229),
(24, 'BM', 'BERMUDA', 'Bermuda', 'BMU', 60, 1441),
(25, 'BT', 'BHUTAN', 'Bhutan', 'BTN', 64, 975),
(26, 'BO', 'BOLIVIA', 'Bolivia', 'BOL', 68, 591),
(27, 'BA', 'BOSNIA AND HERZEGOVINA', 'Bosnia and Herzegovina', 'BIH', 70, 387),
(28, 'BW', 'BOTSWANA', 'Botswana', 'BWA', 72, 267),
(29, 'BV', 'BOUVET ISLAND', 'Bouvet Island', NULL, NULL, 0),
(30, 'BR', 'BRAZIL', 'Brazil', 'BRA', 76, 55),
(31, 'IO', 'BRITISH INDIAN OCEAN TERRITORY', 'British Indian Ocean Territory', NULL, NULL, 246),
(32, 'BN', 'BRUNEI DARUSSALAM', 'Brunei Darussalam', 'BRN', 96, 673),
(33, 'BG', 'BULGARIA', 'Bulgaria', 'BGR', 100, 359),
(34, 'BF', 'BURKINA FASO', 'Burkina Faso', 'BFA', 854, 226),
(35, 'BI', 'BURUNDI', 'Burundi', 'BDI', 108, 257),
(36, 'KH', 'CAMBODIA', 'Cambodia', 'KHM', 116, 855),
(37, 'CM', 'CAMEROON', 'Cameroon', 'CMR', 120, 237),
(38, 'CA', 'CANADA', 'Canada', 'CAN', 124, 1),
(39, 'CV', 'CAPE VERDE', 'Cape Verde', 'CPV', 132, 238),
(40, 'KY', 'CAYMAN ISLANDS', 'Cayman Islands', 'CYM', 136, 1345),
(41, 'CF', 'CENTRAL AFRICAN REPUBLIC', 'Central African Republic', 'CAF', 140, 236),
(42, 'TD', 'CHAD', 'Chad', 'TCD', 148, 235),
(43, 'CL', 'CHILE', 'Chile', 'CHL', 152, 56),
(44, 'CN', 'CHINA', 'China', 'CHN', 156, 86),
(45, 'CX', 'CHRISTMAS ISLAND', 'Christmas Island', NULL, NULL, 61),
(46, 'CC', 'COCOS (KEELING) ISLANDS', 'Cocos (Keeling) Islands', NULL, NULL, 672),
(47, 'CO', 'COLOMBIA', 'Colombia', 'COL', 170, 57),
(48, 'KM', 'COMOROS', 'Comoros', 'COM', 174, 269),
(49, 'CG', 'CONGO', 'Congo', 'COG', 178, 242),
(50, 'CD', 'CONGO, THE DEMOCRATIC REPUBLIC OF THE', 'Congo, the Democratic Republic of the', 'COD', 180, 242),
(51, 'CK', 'COOK ISLANDS', 'Cook Islands', 'COK', 184, 682),
(52, 'CR', 'COSTA RICA', 'Costa Rica', 'CRI', 188, 506),
(53, 'CI', 'COTE D\'IVOIRE', 'Cote D\'Ivoire', 'CIV', 384, 225),
(54, 'HR', 'CROATIA', 'Croatia', 'HRV', 191, 385),
(55, 'CU', 'CUBA', 'Cuba', 'CUB', 192, 53),
(56, 'CY', 'CYPRUS', 'Cyprus', 'CYP', 196, 357),
(57, 'CZ', 'CZECH REPUBLIC', 'Czech Republic', 'CZE', 203, 420),
(58, 'DK', 'DENMARK', 'Denmark', 'DNK', 208, 45),
(59, 'DJ', 'DJIBOUTI', 'Djibouti', 'DJI', 262, 253),
(60, 'DM', 'DOMINICA', 'Dominica', 'DMA', 212, 1767),
(61, 'DO', 'DOMINICAN REPUBLIC', 'Dominican Republic', 'DOM', 214, 1809),
(62, 'EC', 'ECUADOR', 'Ecuador', 'ECU', 218, 593),
(63, 'EG', 'EGYPT', 'Egypt', 'EGY', 818, 20),
(64, 'SV', 'EL SALVADOR', 'El Salvador', 'SLV', 222, 503),
(65, 'GQ', 'EQUATORIAL GUINEA', 'Equatorial Guinea', 'GNQ', 226, 240),
(66, 'ER', 'ERITREA', 'Eritrea', 'ERI', 232, 291),
(67, 'EE', 'ESTONIA', 'Estonia', 'EST', 233, 372),
(68, 'ET', 'ETHIOPIA', 'Ethiopia', 'ETH', 231, 251),
(69, 'FK', 'FALKLAND ISLANDS (MALVINAS)', 'Falkland Islands (Malvinas)', 'FLK', 238, 500),
(70, 'FO', 'FAROE ISLANDS', 'Faroe Islands', 'FRO', 234, 298),
(71, 'FJ', 'FIJI', 'Fiji', 'FJI', 242, 679),
(72, 'FI', 'FINLAND', 'Finland', 'FIN', 246, 358),
(73, 'FR', 'FRANCE', 'France', 'FRA', 250, 33),
(74, 'GF', 'FRENCH GUIANA', 'French Guiana', 'GUF', 254, 594),
(75, 'PF', 'FRENCH POLYNESIA', 'French Polynesia', 'PYF', 258, 689),
(76, 'TF', 'FRENCH SOUTHERN TERRITORIES', 'French Southern Territories', NULL, NULL, 0),
(77, 'GA', 'GABON', 'Gabon', 'GAB', 266, 241),
(78, 'GM', 'GAMBIA', 'Gambia', 'GMB', 270, 220),
(79, 'GE', 'GEORGIA', 'Georgia', 'GEO', 268, 995),
(80, 'DE', 'GERMANY', 'Germany', 'DEU', 276, 49),
(81, 'GH', 'GHANA', 'Ghana', 'GHA', 288, 233),
(82, 'GI', 'GIBRALTAR', 'Gibraltar', 'GIB', 292, 350),
(83, 'GR', 'GREECE', 'Greece', 'GRC', 300, 30),
(84, 'GL', 'GREENLAND', 'Greenland', 'GRL', 304, 299),
(85, 'GD', 'GRENADA', 'Grenada', 'GRD', 308, 1473),
(86, 'GP', 'GUADELOUPE', 'Guadeloupe', 'GLP', 312, 590),
(87, 'GU', 'GUAM', 'Guam', 'GUM', 316, 1671),
(88, 'GT', 'GUATEMALA', 'Guatemala', 'GTM', 320, 502),
(89, 'GN', 'GUINEA', 'Guinea', 'GIN', 324, 224),
(90, 'GW', 'GUINEA-BISSAU', 'Guinea-Bissau', 'GNB', 624, 245),
(91, 'GY', 'GUYANA', 'Guyana', 'GUY', 328, 592),
(92, 'HT', 'HAITI', 'Haiti', 'HTI', 332, 509),
(93, 'HM', 'HEARD ISLAND AND MCDONALD ISLANDS', 'Heard Island and Mcdonald Islands', NULL, NULL, 0),
(94, 'VA', 'HOLY SEE (VATICAN CITY STATE)', 'Holy See (Vatican City State)', 'VAT', 336, 39),
(95, 'HN', 'HONDURAS', 'Honduras', 'HND', 340, 504),
(96, 'HK', 'HONG KONG', 'Hong Kong', 'HKG', 344, 852),
(97, 'HU', 'HUNGARY', 'Hungary', 'HUN', 348, 36),
(98, 'IS', 'ICELAND', 'Iceland', 'ISL', 352, 354),
(99, 'IN', 'INDIA', 'India', 'IND', 356, 91),
(100, 'ID', 'INDONESIA', 'Indonesia', 'IDN', 360, 62),
(101, 'IR', 'IRAN, ISLAMIC REPUBLIC OF', 'Iran, Islamic Republic of', 'IRN', 364, 98),
(102, 'IQ', 'IRAQ', 'Iraq', 'IRQ', 368, 964),
(103, 'IE', 'IRELAND', 'Ireland', 'IRL', 372, 353),
(104, 'IL', 'ISRAEL', 'Israel', 'ISR', 376, 972),
(105, 'IT', 'ITALY', 'Italy', 'ITA', 380, 39),
(106, 'JM', 'JAMAICA', 'Jamaica', 'JAM', 388, 1876),
(107, 'JP', 'JAPAN', 'Japan', 'JPN', 392, 81),
(108, 'JO', 'JORDAN', 'Jordan', 'JOR', 400, 962),
(109, 'KZ', 'KAZAKHSTAN', 'Kazakhstan', 'KAZ', 398, 7),
(110, 'KE', 'KENYA', 'Kenya', 'KEN', 404, 254),
(111, 'KI', 'KIRIBATI', 'Kiribati', 'KIR', 296, 686),
(112, 'KP', 'KOREA, DEMOCRATIC PEOPLE\'S REPUBLIC OF', 'Korea, Democratic People\'s Republic of', 'PRK', 408, 850),
(113, 'KR', 'KOREA, REPUBLIC OF', 'Korea, Republic of', 'KOR', 410, 82),
(114, 'KW', 'KUWAIT', 'Kuwait', 'KWT', 414, 965),
(115, 'KG', 'KYRGYZSTAN', 'Kyrgyzstan', 'KGZ', 417, 996),
(116, 'LA', 'LAO PEOPLE\'S DEMOCRATIC REPUBLIC', 'Lao People\'s Democratic Republic', 'LAO', 418, 856),
(117, 'LV', 'LATVIA', 'Latvia', 'LVA', 428, 371),
(118, 'LB', 'LEBANON', 'Lebanon', 'LBN', 422, 961),
(119, 'LS', 'LESOTHO', 'Lesotho', 'LSO', 426, 266),
(120, 'LR', 'LIBERIA', 'Liberia', 'LBR', 430, 231),
(121, 'LY', 'LIBYAN ARAB JAMAHIRIYA', 'Libyan Arab Jamahiriya', 'LBY', 434, 218),
(122, 'LI', 'LIECHTENSTEIN', 'Liechtenstein', 'LIE', 438, 423),
(123, 'LT', 'LITHUANIA', 'Lithuania', 'LTU', 440, 370),
(124, 'LU', 'LUXEMBOURG', 'Luxembourg', 'LUX', 442, 352),
(125, 'MO', 'MACAO', 'Macao', 'MAC', 446, 853),
(126, 'MK', 'MACEDONIA, THE FORMER YUGOSLAV REPUBLIC OF', 'Macedonia, the Former Yugoslav Republic of', 'MKD', 807, 389),
(127, 'MG', 'MADAGASCAR', 'Madagascar', 'MDG', 450, 261),
(128, 'MW', 'MALAWI', 'Malawi', 'MWI', 454, 265),
(129, 'MY', 'MALAYSIA', 'Malaysia', 'MYS', 458, 60),
(130, 'MV', 'MALDIVES', 'Maldives', 'MDV', 462, 960),
(131, 'ML', 'MALI', 'Mali', 'MLI', 466, 223),
(132, 'MT', 'MALTA', 'Malta', 'MLT', 470, 356),
(133, 'MH', 'MARSHALL ISLANDS', 'Marshall Islands', 'MHL', 584, 692),
(134, 'MQ', 'MARTINIQUE', 'Martinique', 'MTQ', 474, 596),
(135, 'MR', 'MAURITANIA', 'Mauritania', 'MRT', 478, 222),
(136, 'MU', 'MAURITIUS', 'Mauritius', 'MUS', 480, 230),
(137, 'YT', 'MAYOTTE', 'Mayotte', NULL, NULL, 269),
(138, 'MX', 'MEXICO', 'Mexico', 'MEX', 484, 52),
(139, 'FM', 'MICRONESIA, FEDERATED STATES OF', 'Micronesia, Federated States of', 'FSM', 583, 691),
(140, 'MD', 'MOLDOVA, REPUBLIC OF', 'Moldova, Republic of', 'MDA', 498, 373),
(141, 'MC', 'MONACO', 'Monaco', 'MCO', 492, 377),
(142, 'MN', 'MONGOLIA', 'Mongolia', 'MNG', 496, 976),
(143, 'MS', 'MONTSERRAT', 'Montserrat', 'MSR', 500, 1664),
(144, 'MA', 'MOROCCO', 'Morocco', 'MAR', 504, 212),
(145, 'MZ', 'MOZAMBIQUE', 'Mozambique', 'MOZ', 508, 258),
(146, 'MM', 'MYANMAR', 'Myanmar', 'MMR', 104, 95),
(147, 'NA', 'NAMIBIA', 'Namibia', 'NAM', 516, 264),
(148, 'NR', 'NAURU', 'Nauru', 'NRU', 520, 674),
(149, 'NP', 'NEPAL', 'Nepal', 'NPL', 524, 977),
(150, 'NL', 'NETHERLANDS', 'Netherlands', 'NLD', 528, 31),
(151, 'AN', 'NETHERLANDS ANTILLES', 'Netherlands Antilles', 'ANT', 530, 599),
(152, 'NC', 'NEW CALEDONIA', 'New Caledonia', 'NCL', 540, 687),
(153, 'NZ', 'NEW ZEALAND', 'New Zealand', 'NZL', 554, 64),
(154, 'NI', 'NICARAGUA', 'Nicaragua', 'NIC', 558, 505),
(155, 'NE', 'NIGER', 'Niger', 'NER', 562, 227),
(156, 'NG', 'NIGERIA', 'Nigeria', 'NGA', 566, 234),
(157, 'NU', 'NIUE', 'Niue', 'NIU', 570, 683),
(158, 'NF', 'NORFOLK ISLAND', 'Norfolk Island', 'NFK', 574, 672),
(159, 'MP', 'NORTHERN MARIANA ISLANDS', 'Northern Mariana Islands', 'MNP', 580, 1670),
(160, 'NO', 'NORWAY', 'Norway', 'NOR', 578, 47),
(161, 'OM', 'OMAN', 'Oman', 'OMN', 512, 968),
(162, 'PK', 'PAKISTAN', 'Pakistan', 'PAK', 586, 92),
(163, 'PW', 'PALAU', 'Palau', 'PLW', 585, 680),
(164, 'PS', 'PALESTINIAN TERRITORY, OCCUPIED', 'Palestinian Territory, Occupied', NULL, NULL, 970),
(165, 'PA', 'PANAMA', 'Panama', 'PAN', 591, 507),
(166, 'PG', 'PAPUA NEW GUINEA', 'Papua New Guinea', 'PNG', 598, 675),
(167, 'PY', 'PARAGUAY', 'Paraguay', 'PRY', 600, 595),
(168, 'PE', 'PERU', 'Peru', 'PER', 604, 51),
(169, 'PH', 'PHILIPPINES', 'Philippines', 'PHL', 608, 63),
(170, 'PN', 'PITCAIRN', 'Pitcairn', 'PCN', 612, 0),
(171, 'PL', 'POLAND', 'Poland', 'POL', 616, 48),
(172, 'PT', 'PORTUGAL', 'Portugal', 'PRT', 620, 351),
(173, 'PR', 'PUERTO RICO', 'Puerto Rico', 'PRI', 630, 1787),
(174, 'QA', 'QATAR', 'Qatar', 'QAT', 634, 974),
(175, 'RE', 'REUNION', 'Reunion', 'REU', 638, 262),
(176, 'RO', 'ROMANIA', 'Romania', 'ROM', 642, 40),
(177, 'RU', 'RUSSIAN FEDERATION', 'Russian Federation', 'RUS', 643, 7),
(178, 'RW', 'RWANDA', 'Rwanda', 'RWA', 646, 250),
(179, 'SH', 'SAINT HELENA', 'Saint Helena', 'SHN', 654, 290),
(180, 'KN', 'SAINT KITTS AND NEVIS', 'Saint Kitts and Nevis', 'KNA', 659, 1869),
(181, 'LC', 'SAINT LUCIA', 'Saint Lucia', 'LCA', 662, 1758),
(182, 'PM', 'SAINT PIERRE AND MIQUELON', 'Saint Pierre and Miquelon', 'SPM', 666, 508),
(183, 'VC', 'SAINT VINCENT AND THE GRENADINES', 'Saint Vincent and the Grenadines', 'VCT', 670, 1784),
(184, 'WS', 'SAMOA', 'Samoa', 'WSM', 882, 684),
(185, 'SM', 'SAN MARINO', 'San Marino', 'SMR', 674, 378),
(186, 'ST', 'SAO TOME AND PRINCIPE', 'Sao Tome and Principe', 'STP', 678, 239),
(187, 'SA', 'SAUDI ARABIA', 'Saudi Arabia', 'SAU', 682, 966),
(188, 'SN', 'SENEGAL', 'Senegal', 'SEN', 686, 221),
(189, 'CS', 'SERBIA AND MONTENEGRO', 'Serbia and Montenegro', NULL, NULL, 381),
(190, 'SC', 'SEYCHELLES', 'Seychelles', 'SYC', 690, 248),
(191, 'SL', 'SIERRA LEONE', 'Sierra Leone', 'SLE', 694, 232),
(192, 'SG', 'SINGAPORE', 'Singapore', 'SGP', 702, 65),
(193, 'SK', 'SLOVAKIA', 'Slovakia', 'SVK', 703, 421),
(194, 'SI', 'SLOVENIA', 'Slovenia', 'SVN', 705, 386),
(195, 'SB', 'SOLOMON ISLANDS', 'Solomon Islands', 'SLB', 90, 677),
(196, 'SO', 'SOMALIA', 'Somalia', 'SOM', 706, 252),
(197, 'ZA', 'SOUTH AFRICA', 'South Africa', 'ZAF', 710, 27),
(198, 'GS', 'SOUTH GEORGIA AND THE SOUTH SANDWICH ISLANDS', 'South Georgia and the South Sandwich Islands', NULL, NULL, 0),
(199, 'ES', 'SPAIN', 'Spain', 'ESP', 724, 34),
(200, 'LK', 'SRI LANKA', 'Sri Lanka', 'LKA', 144, 94),
(201, 'SD', 'SUDAN', 'Sudan', 'SDN', 736, 249),
(202, 'SR', 'SURINAME', 'Suriname', 'SUR', 740, 597),
(203, 'SJ', 'SVALBARD AND JAN MAYEN', 'Svalbard and Jan Mayen', 'SJM', 744, 47),
(204, 'SZ', 'SWAZILAND', 'Swaziland', 'SWZ', 748, 268),
(205, 'SE', 'SWEDEN', 'Sweden', 'SWE', 752, 46),
(206, 'CH', 'SWITZERLAND', 'Switzerland', 'CHE', 756, 41),
(207, 'SY', 'SYRIAN ARAB REPUBLIC', 'Syrian Arab Republic', 'SYR', 760, 963),
(208, 'TW', 'TAIWAN, PROVINCE OF CHINA', 'Taiwan, Province of China', 'TWN', 158, 886),
(209, 'TJ', 'TAJIKISTAN', 'Tajikistan', 'TJK', 762, 992),
(210, 'TZ', 'TANZANIA, UNITED REPUBLIC OF', 'Tanzania, United Republic of', 'TZA', 834, 255),
(211, 'TH', 'THAILAND', 'Thailand', 'THA', 764, 66),
(212, 'TL', 'TIMOR-LESTE', 'Timor-Leste', NULL, NULL, 670),
(213, 'TG', 'TOGO', 'Togo', 'TGO', 768, 228),
(214, 'TK', 'TOKELAU', 'Tokelau', 'TKL', 772, 690),
(215, 'TO', 'TONGA', 'Tonga', 'TON', 776, 676),
(216, 'TT', 'TRINIDAD AND TOBAGO', 'Trinidad and Tobago', 'TTO', 780, 1868),
(217, 'TN', 'TUNISIA', 'Tunisia', 'TUN', 788, 216),
(218, 'TR', 'TURKEY', 'Turkey', 'TUR', 792, 90),
(219, 'TM', 'TURKMENISTAN', 'Turkmenistan', 'TKM', 795, 7370),
(220, 'TC', 'TURKS AND CAICOS ISLANDS', 'Turks and Caicos Islands', 'TCA', 796, 1649),
(221, 'TV', 'TUVALU', 'Tuvalu', 'TUV', 798, 688),
(222, 'UG', 'UGANDA', 'Uganda', 'UGA', 800, 256),
(223, 'UA', 'UKRAINE', 'Ukraine', 'UKR', 804, 380),
(224, 'AE', 'UNITED ARAB EMIRATES', 'United Arab Emirates', 'ARE', 784, 971),
(225, 'GB', 'UNITED KINGDOM', 'United Kingdom', 'GBR', 826, 44),
(226, 'US', 'UNITED STATES', 'United States', 'USA', 840, 1),
(227, 'UM', 'UNITED STATES MINOR OUTLYING ISLANDS', 'United States Minor Outlying Islands', NULL, NULL, 1),
(228, 'UY', 'URUGUAY', 'Uruguay', 'URY', 858, 598),
(229, 'UZ', 'UZBEKISTAN', 'Uzbekistan', 'UZB', 860, 998),
(230, 'VU', 'VANUATU', 'Vanuatu', 'VUT', 548, 678),
(231, 'VE', 'VENEZUELA', 'Venezuela', 'VEN', 862, 58),
(232, 'VN', 'VIET NAM', 'Viet Nam', 'VNM', 704, 84),
(233, 'VG', 'VIRGIN ISLANDS, BRITISH', 'Virgin Islands, British', 'VGB', 92, 1284),
(234, 'VI', 'VIRGIN ISLANDS, U.S.', 'Virgin Islands, U.s.', 'VIR', 850, 1340),
(235, 'WF', 'WALLIS AND FUTUNA', 'Wallis and Futuna', 'WLF', 876, 681),
(236, 'EH', 'WESTERN SAHARA', 'Western Sahara', 'ESH', 732, 212),
(237, 'YE', 'YEMEN', 'Yemen', 'YEM', 887, 967),
(238, 'ZM', 'ZAMBIA', 'Zambia', 'ZMB', 894, 260),
(239, 'ZW', 'ZIMBABWE', 'Zimbabwe', 'ZWE', 716, 263),
(240, 'RS', 'SERBIA', 'Serbia', 'SRB', 688, 381),
(241, 'AP', 'ASIA PACIFIC REGION', 'Asia / Pacific Region', '0', 0, 0),
(242, 'ME', 'MONTENEGRO', 'Montenegro', 'MNE', 499, 382),
(243, 'AX', 'ALAND ISLANDS', 'Aland Islands', 'ALA', 248, 358),
(244, 'BQ', 'BONAIRE, SINT EUSTATIUS AND SABA', 'Bonaire, Sint Eustatius and Saba', 'BES', 535, 599),
(245, 'CW', 'CURACAO', 'Curacao', 'CUW', 531, 599),
(246, 'GG', 'GUERNSEY', 'Guernsey', 'GGY', 831, 44),
(247, 'IM', 'ISLE OF MAN', 'Isle of Man', 'IMN', 833, 44),
(248, 'JE', 'JERSEY', 'Jersey', 'JEY', 832, 44),
(249, 'XK', 'KOSOVO', 'Kosovo', '---', 0, 381),
(250, 'BL', 'SAINT BARTHELEMY', 'Saint Barthelemy', 'BLM', 652, 590),
(251, 'MF', 'SAINT MARTIN', 'Saint Martin', 'MAF', 663, 590),
(252, 'SX', 'SINT MAARTEN', 'Sint Maarten', 'SXM', 534, 1),
(253, 'SS', 'SOUTH SUDAN', 'South Sudan', 'SSD', 728, 211);

-- --------------------------------------------------------

--
-- Table structure for table `credit_notes`
--

CREATE TABLE `credit_notes` (
  `id` int(10) UNSIGNED NOT NULL,
  `company_id` int(10) UNSIGNED DEFAULT NULL,
  `project_id` int(10) UNSIGNED DEFAULT NULL,
  `client_id` int(10) UNSIGNED DEFAULT NULL,
  `cn_number` varchar(191) NOT NULL,
  `original_credit_note_number` varchar(191) DEFAULT NULL,
  `invoice_id` int(10) UNSIGNED DEFAULT NULL,
  `issue_date` date NOT NULL,
  `due_date` date NOT NULL,
  `discount` double NOT NULL DEFAULT 0,
  `discount_type` enum('percent','fixed') NOT NULL DEFAULT 'percent',
  `sub_total` double(15,2) NOT NULL,
  `total` double(15,2) NOT NULL,
  `adjustment_amount` double(8,2) DEFAULT NULL,
  `currency_id` int(10) UNSIGNED DEFAULT NULL,
  `status` enum('closed','open') NOT NULL DEFAULT 'open',
  `recurring` enum('yes','no') NOT NULL DEFAULT 'no',
  `billing_frequency` varchar(191) DEFAULT NULL,
  `billing_interval` int(11) DEFAULT NULL,
  `billing_cycle` int(11) DEFAULT NULL,
  `file` varchar(191) DEFAULT NULL,
  `file_original_name` varchar(191) DEFAULT NULL,
  `note` text DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `added_by` int(10) UNSIGNED DEFAULT NULL,
  `last_updated_by` int(10) UNSIGNED DEFAULT NULL,
  `calculate_tax` enum('after_discount','before_discount') NOT NULL DEFAULT 'after_discount',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `credit_note_items`
--

CREATE TABLE `credit_note_items` (
  `id` int(10) UNSIGNED NOT NULL,
  `credit_note_id` int(10) UNSIGNED NOT NULL,
  `item_name` varchar(191) NOT NULL,
  `type` enum('item','discount','tax') NOT NULL DEFAULT 'item',
  `quantity` int(11) NOT NULL,
  `unit_price` double(8,2) NOT NULL,
  `amount` double(8,2) NOT NULL,
  `taxes` varchar(191) DEFAULT NULL,
  `hsn_sac_code` varchar(191) DEFAULT NULL,
  `item_summary` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `unit_id` bigint(20) UNSIGNED DEFAULT NULL,
  `product_id` int(10) UNSIGNED DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `credit_note_item_images`
--

CREATE TABLE `credit_note_item_images` (
  `id` int(10) UNSIGNED NOT NULL,
  `credit_note_item_id` int(10) UNSIGNED NOT NULL,
  `filename` varchar(191) DEFAULT NULL,
  `hashname` varchar(191) DEFAULT NULL,
  `size` varchar(191) DEFAULT NULL,
  `external_link` varchar(191) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `currencies`
--

CREATE TABLE `currencies` (
  `id` int(10) UNSIGNED NOT NULL,
  `company_id` int(10) UNSIGNED DEFAULT NULL,
  `currency_name` varchar(191) NOT NULL,
  `currency_symbol` varchar(191) DEFAULT NULL,
  `currency_code` varchar(191) NOT NULL,
  `exchange_rate` double DEFAULT NULL,
  `is_cryptocurrency` enum('yes','no') NOT NULL DEFAULT 'no',
  `usd_price` double DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `currency_position` enum('left','right','left_with_space','right_with_space') NOT NULL DEFAULT 'left',
  `no_of_decimal` int(10) UNSIGNED NOT NULL,
  `thousand_separator` varchar(191) DEFAULT NULL,
  `decimal_separator` varchar(191) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `currencies`
--

INSERT INTO `currencies` (`id`, `company_id`, `currency_name`, `currency_symbol`, `currency_code`, `exchange_rate`, `is_cryptocurrency`, `usd_price`, `created_at`, `updated_at`, `currency_position`, `no_of_decimal`, `thousand_separator`, `decimal_separator`) VALUES
(1, 1, 'Dollars', '$', 'USD', 1, 'no', NULL, '2024-12-17 22:23:25', '2024-12-17 22:23:25', 'left', 2, ',', '.'),
(2, 1, 'Pounds', '£', 'GBP', 1, 'no', NULL, '2024-12-17 22:23:25', '2024-12-17 22:23:25', 'left', 2, ',', '.'),
(3, 1, 'Euros', '€', 'EUR', 1, 'no', NULL, '2024-12-17 22:23:25', '2024-12-17 22:23:25', 'left', 2, ',', '.'),
(4, 1, 'Rupee', '₹', 'INR', 1, 'no', NULL, '2024-12-17 22:23:25', '2024-12-17 22:23:25', 'left', 2, ',', '.');

-- --------------------------------------------------------

--
-- Table structure for table `currency_format_settings`
--

CREATE TABLE `currency_format_settings` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `company_id` int(10) UNSIGNED DEFAULT NULL,
  `currency_position` enum('left','right','left_with_space','right_with_space') NOT NULL DEFAULT 'left',
  `no_of_decimal` int(10) UNSIGNED NOT NULL,
  `thousand_separator` varchar(191) DEFAULT NULL,
  `decimal_separator` varchar(191) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `custom_fields`
--

CREATE TABLE `custom_fields` (
  `id` int(10) UNSIGNED NOT NULL,
  `company_id` int(10) UNSIGNED DEFAULT NULL,
  `custom_field_group_id` int(10) UNSIGNED DEFAULT NULL,
  `label` varchar(100) NOT NULL,
  `name` varchar(100) NOT NULL,
  `type` varchar(10) NOT NULL,
  `required` enum('yes','no') NOT NULL DEFAULT 'no',
  `values` varchar(5000) DEFAULT NULL,
  `export` tinyint(1) DEFAULT 0,
  `visible` enum('true','false') DEFAULT 'false'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `custom_fields_data`
--

CREATE TABLE `custom_fields_data` (
  `id` int(10) UNSIGNED NOT NULL,
  `custom_field_id` int(10) UNSIGNED NOT NULL,
  `model_id` int(10) UNSIGNED NOT NULL,
  `model` varchar(191) DEFAULT NULL,
  `value` varchar(10000) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `custom_field_groups`
--

CREATE TABLE `custom_field_groups` (
  `id` int(10) UNSIGNED NOT NULL,
  `company_id` int(10) UNSIGNED DEFAULT NULL,
  `name` varchar(191) NOT NULL,
  `model` varchar(191) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `custom_field_groups`
--

INSERT INTO `custom_field_groups` (`id`, `company_id`, `name`, `model`) VALUES
(1, 1, 'Client', 'App\\Models\\ClientDetails'),
(2, 1, 'Employee', 'App\\Models\\EmployeeDetails'),
(3, 1, 'Project', 'App\\Models\\Project'),
(4, 1, 'Invoice', 'App\\Models\\Invoice'),
(5, 1, 'Estimate', 'App\\Models\\Estimate'),
(6, 1, 'Task', 'App\\Models\\Task'),
(7, 1, 'Expense', 'App\\Models\\Expense'),
(8, 1, 'Lead', 'App\\Models\\Lead'),
(9, 1, 'Deal', 'App\\Models\\Deal'),
(10, 1, 'Product', 'App\\Models\\Product'),
(11, 1, 'Ticket', 'App\\Models\\Ticket'),
(12, 1, 'Time Log', 'App\\Models\\ProjectTimeLog'),
(13, 1, 'Contract', 'App\\Models\\Contract');

-- --------------------------------------------------------

--
-- Table structure for table `custom_link_settings`
--

CREATE TABLE `custom_link_settings` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `company_id` int(10) UNSIGNED DEFAULT NULL,
  `link_title` varchar(191) NOT NULL,
  `url` text NOT NULL,
  `can_be_viewed_by` varchar(191) DEFAULT NULL,
  `status` enum('active','inactive') NOT NULL DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `dashboard_widgets`
--

CREATE TABLE `dashboard_widgets` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `company_id` int(10) UNSIGNED DEFAULT NULL,
  `widget_name` varchar(191) NOT NULL,
  `status` tinyint(1) NOT NULL DEFAULT 1,
  `dashboard_type` varchar(191) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `dashboard_widgets`
--

INSERT INTO `dashboard_widgets` (`id`, `company_id`, `widget_name`, `status`, `dashboard_type`, `created_at`, `updated_at`) VALUES
(1, 1, 'total_clients', 1, 'admin-dashboard', NULL, NULL),
(2, 1, 'total_employees', 1, 'admin-dashboard', NULL, NULL),
(3, 1, 'total_projects', 1, 'admin-dashboard', NULL, NULL),
(4, 1, 'total_unpaid_invoices', 1, 'admin-dashboard', NULL, NULL),
(5, 1, 'total_hours_logged', 1, 'admin-dashboard', NULL, NULL),
(6, 1, 'total_pending_tasks', 1, 'admin-dashboard', NULL, NULL),
(7, 1, 'total_today_attendance', 1, 'admin-dashboard', NULL, NULL),
(8, 1, 'total_unresolved_tickets', 1, 'admin-dashboard', NULL, NULL),
(9, 1, 'recent_earnings', 1, 'admin-dashboard', NULL, NULL),
(10, 1, 'settings_leaves', 1, 'admin-dashboard', NULL, NULL),
(11, 1, 'new_tickets', 1, 'admin-dashboard', NULL, NULL),
(12, 1, 'overdue_tasks', 1, 'admin-dashboard', NULL, NULL),
(13, 1, 'pending_follow_up', 1, 'admin-dashboard', NULL, NULL),
(14, 1, 'project_activity_timeline', 1, 'admin-dashboard', NULL, NULL),
(15, 1, 'user_activity_timeline', 1, 'admin-dashboard', NULL, NULL),
(16, 1, 'timelogs', 1, 'admin-dashboard', NULL, NULL),
(17, 1, 'total_clients', 1, 'admin-client-dashboard', NULL, NULL),
(18, 1, 'total_leads', 1, 'admin-client-dashboard', NULL, NULL),
(19, 1, 'total_lead_conversions', 1, 'admin-client-dashboard', NULL, NULL),
(20, 1, 'total_contracts_generated', 1, 'admin-client-dashboard', NULL, NULL),
(21, 1, 'total_contracts_signed', 1, 'admin-client-dashboard', NULL, NULL),
(22, 1, 'client_wise_earnings', 1, 'admin-client-dashboard', NULL, NULL),
(23, 1, 'client_wise_timelogs', 1, 'admin-client-dashboard', NULL, NULL),
(24, 1, 'lead_vs_status', 1, 'admin-client-dashboard', NULL, NULL),
(25, 1, 'lead_vs_source', 1, 'admin-client-dashboard', NULL, NULL),
(26, 1, 'latest_client', 1, 'admin-client-dashboard', NULL, NULL),
(27, 1, 'recent_login_activities', 1, 'admin-client-dashboard', NULL, NULL),
(28, 1, 'total_deals', 1, 'admin-client-dashboard', NULL, NULL),
(29, 1, 'total_paid_invoices', 1, 'admin-finance-dashboard', NULL, NULL),
(30, 1, 'total_expenses', 1, 'admin-finance-dashboard', NULL, NULL),
(31, 1, 'total_earnings', 1, 'admin-finance-dashboard', NULL, NULL),
(32, 1, 'total_pending_amount', 1, 'admin-finance-dashboard', NULL, NULL),
(33, 1, 'invoice_overview', 1, 'admin-finance-dashboard', NULL, NULL),
(34, 1, 'estimate_overview', 1, 'admin-finance-dashboard', NULL, NULL),
(35, 1, 'proposal_overview', 1, 'admin-finance-dashboard', NULL, NULL),
(36, 1, 'earnings_by_client', 1, 'admin-finance-dashboard', NULL, NULL),
(37, 1, 'earnings_by_projects', 1, 'admin-finance-dashboard', NULL, NULL),
(38, 1, 'total_unpaid_invoices', 1, 'admin-finance-dashboard', NULL, NULL),
(39, 1, 'total_leaves_approved', 1, 'admin-hr-dashboard', NULL, NULL),
(40, 1, 'total_new_employee', 1, 'admin-hr-dashboard', NULL, NULL),
(41, 1, 'total_employee_exits', 1, 'admin-hr-dashboard', NULL, NULL),
(42, 1, 'average_attendance', 1, 'admin-hr-dashboard', NULL, NULL),
(43, 1, 'department_wise_employee', 1, 'admin-hr-dashboard', NULL, NULL),
(44, 1, 'designation_wise_employee', 1, 'admin-hr-dashboard', NULL, NULL),
(45, 1, 'gender_wise_employee', 1, 'admin-hr-dashboard', NULL, NULL),
(46, 1, 'role_wise_employee', 1, 'admin-hr-dashboard', NULL, NULL),
(47, 1, 'leaves_taken', 1, 'admin-hr-dashboard', NULL, NULL),
(48, 1, 'late_attendance_mark', 1, 'admin-hr-dashboard', NULL, NULL),
(49, 1, 'headcount', 1, 'admin-hr-dashboard', NULL, NULL),
(50, 1, 'joining_vs_attrition', 1, 'admin-hr-dashboard', NULL, NULL),
(51, 1, 'birthday', 1, 'admin-hr-dashboard', NULL, NULL),
(52, 1, 'total_today_attendance', 1, 'admin-hr-dashboard', NULL, NULL),
(53, 1, 'total_project', 1, 'admin-project-dashboard', NULL, NULL),
(54, 1, 'total_hours_logged', 1, 'admin-project-dashboard', NULL, NULL),
(55, 1, 'total_overdue_project', 1, 'admin-project-dashboard', NULL, NULL),
(56, 1, 'status_wise_project', 1, 'admin-project-dashboard', NULL, NULL),
(57, 1, 'pending_milestone', 1, 'admin-project-dashboard', NULL, NULL),
(58, 1, 'total_tickets', 1, 'admin-ticket-dashboard', NULL, NULL),
(59, 1, 'total_unassigned_ticket', 1, 'admin-ticket-dashboard', NULL, NULL),
(60, 1, 'type_wise_ticket', 1, 'admin-ticket-dashboard', NULL, NULL),
(61, 1, 'status_wise_ticket', 1, 'admin-ticket-dashboard', NULL, NULL),
(62, 1, 'channel_wise_ticket', 1, 'admin-ticket-dashboard', NULL, NULL),
(63, 1, 'new_tickets', 1, 'admin-ticket-dashboard', NULL, NULL),
(64, 1, 'profile', 1, 'private-dashboard', NULL, NULL),
(65, 1, 'shift_schedule', 1, 'private-dashboard', NULL, NULL),
(66, 1, 'birthday', 1, 'private-dashboard', NULL, NULL),
(67, 1, 'notices', 1, 'private-dashboard', NULL, NULL),
(68, 1, 'tasks', 1, 'private-dashboard', NULL, NULL),
(69, 1, 'projects', 1, 'private-dashboard', NULL, NULL),
(70, 1, 'my_task', 1, 'private-dashboard', NULL, NULL),
(71, 1, 'my_calender', 1, 'private-dashboard', NULL, NULL),
(72, 1, 'week_timelog', 1, 'private-dashboard', NULL, NULL),
(73, 1, 'leave', 1, 'private-dashboard', NULL, NULL),
(74, 1, 'lead', 1, 'private-dashboard', NULL, NULL),
(75, 1, 'work_from_home', 1, 'private-dashboard', NULL, NULL),
(76, 1, 'appreciation', 1, 'private-dashboard', NULL, NULL),
(77, 1, 'work_anniversary', 1, 'private-dashboard', NULL, NULL),
(78, 1, 'ticket', 1, 'private-dashboard', NULL, NULL),
(79, 1, 'notice_period_duration', 1, 'private-dashboard', NULL, NULL),
(80, 1, 'probation_date', 1, 'private-dashboard', NULL, NULL),
(81, 1, 'contract_date', 1, 'private-dashboard', NULL, NULL),
(82, 1, 'internship_date', 1, 'private-dashboard', NULL, NULL),
(83, 1, 'follow_ups', 1, 'private-dashboard', NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `database_backups`
--

CREATE TABLE `database_backups` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `filename` varchar(191) DEFAULT NULL,
  `size` varchar(191) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `database_backup_cron_settings`
--

CREATE TABLE `database_backup_cron_settings` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `status` enum('active','inactive') NOT NULL DEFAULT 'inactive',
  `hour_of_day` time DEFAULT NULL,
  `backup_after_days` varchar(191) DEFAULT NULL,
  `delete_backup_after_days` varchar(191) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `database_backup_cron_settings`
--

INSERT INTO `database_backup_cron_settings` (`id`, `status`, `hour_of_day`, `backup_after_days`, `delete_backup_after_days`) VALUES
(1, 'inactive', '00:00:00', '0', '0');

-- --------------------------------------------------------

--
-- Table structure for table `deals`
--

CREATE TABLE `deals` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `company_id` int(10) UNSIGNED DEFAULT NULL,
  `name` varchar(191) DEFAULT NULL,
  `column_priority` int(11) NOT NULL DEFAULT 0,
  `lead_pipeline_id` bigint(20) UNSIGNED DEFAULT NULL,
  `pipeline_stage_id` int(10) UNSIGNED DEFAULT NULL,
  `lead_id` int(10) UNSIGNED DEFAULT NULL,
  `close_date` date DEFAULT NULL,
  `agent_id` bigint(20) UNSIGNED DEFAULT NULL,
  `category_id` int(10) UNSIGNED DEFAULT NULL,
  `next_follow_up` enum('yes','no') NOT NULL DEFAULT 'yes',
  `value` double(30,2) DEFAULT 0.00,
  `note` longtext DEFAULT NULL,
  `hash` text DEFAULT NULL,
  `currency_id` int(10) UNSIGNED DEFAULT NULL,
  `added_by` int(10) UNSIGNED DEFAULT NULL,
  `last_updated_by` int(10) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deal_watcher` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `deal_files`
--

CREATE TABLE `deal_files` (
  `id` int(10) UNSIGNED NOT NULL,
  `deal_id` bigint(20) UNSIGNED DEFAULT NULL,
  `user_id` int(10) UNSIGNED NOT NULL,
  `filename` varchar(200) NOT NULL,
  `hashname` varchar(200) NOT NULL,
  `size` varchar(200) NOT NULL,
  `description` text DEFAULT NULL,
  `google_url` varchar(191) DEFAULT NULL,
  `dropbox_link` varchar(191) DEFAULT NULL,
  `added_by` int(10) UNSIGNED DEFAULT NULL,
  `last_updated_by` int(10) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `deal_histories`
--

CREATE TABLE `deal_histories` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `deal_id` bigint(20) UNSIGNED NOT NULL,
  `event_type` varchar(191) NOT NULL,
  `created_by` int(10) UNSIGNED DEFAULT NULL,
  `deal_stage_from_id` bigint(20) UNSIGNED DEFAULT NULL,
  `file_id` bigint(20) UNSIGNED DEFAULT NULL,
  `task_id` bigint(20) UNSIGNED DEFAULT NULL,
  `follow_up_id` bigint(20) UNSIGNED DEFAULT NULL,
  `note_id` bigint(20) UNSIGNED DEFAULT NULL,
  `proposal_id` bigint(20) UNSIGNED DEFAULT NULL,
  `agent_id` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deal_stage_to_id` int(10) UNSIGNED DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `deal_notes`
--

CREATE TABLE `deal_notes` (
  `id` int(10) UNSIGNED NOT NULL,
  `title` varchar(191) DEFAULT NULL,
  `details` longtext DEFAULT NULL,
  `deal_id` bigint(20) UNSIGNED DEFAULT NULL,
  `added_by` int(10) UNSIGNED DEFAULT NULL,
  `last_updated_by` int(10) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `designations`
--

CREATE TABLE `designations` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `company_id` int(10) UNSIGNED DEFAULT NULL,
  `name` varchar(191) NOT NULL,
  `parent_id` int(10) UNSIGNED DEFAULT NULL,
  `added_by` int(10) UNSIGNED DEFAULT NULL,
  `last_updated_by` int(10) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `device_user`
--

CREATE TABLE `device_user` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `device_id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(191) DEFAULT NULL,
  `verified_at` timestamp NULL DEFAULT NULL,
  `reported_as_rogue_at` timestamp NULL DEFAULT NULL,
  `note` text DEFAULT NULL,
  `admin_note` text DEFAULT NULL,
  `data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`data`)),
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `device_user`
--

INSERT INTO `device_user` (`id`, `user_id`, `device_id`, `name`, `verified_at`, `reported_as_rogue_at`, `note`, `admin_note`, `data`, `created_at`, `updated_at`) VALUES
(1, 1, 1, NULL, NULL, NULL, NULL, NULL, NULL, '2024-12-17 22:24:14', '2024-12-17 22:24:14'),
(2, 1, 2, NULL, NULL, NULL, NULL, NULL, NULL, '2024-12-23 09:29:00', '2024-12-23 09:29:00');

-- --------------------------------------------------------

--
-- Table structure for table `discussions`
--

CREATE TABLE `discussions` (
  `id` int(10) UNSIGNED NOT NULL,
  `company_id` int(10) UNSIGNED DEFAULT NULL,
  `discussion_category_id` int(10) UNSIGNED DEFAULT 1,
  `project_id` int(10) UNSIGNED DEFAULT NULL,
  `title` varchar(191) NOT NULL,
  `color` varchar(20) DEFAULT '#232629',
  `user_id` int(10) UNSIGNED NOT NULL,
  `pinned` tinyint(1) NOT NULL DEFAULT 0,
  `closed` tinyint(1) NOT NULL DEFAULT 0,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `last_reply_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `best_answer_id` int(10) UNSIGNED DEFAULT NULL,
  `last_reply_by_id` int(10) UNSIGNED DEFAULT NULL,
  `added_by` int(10) UNSIGNED DEFAULT NULL,
  `last_updated_by` int(10) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `discussion_categories`
--

CREATE TABLE `discussion_categories` (
  `id` int(10) UNSIGNED NOT NULL,
  `company_id` int(10) UNSIGNED DEFAULT NULL,
  `order` int(11) NOT NULL DEFAULT 1,
  `name` varchar(191) NOT NULL,
  `color` varchar(20) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `discussion_categories`
--

INSERT INTO `discussion_categories` (`id`, `company_id`, `order`, `name`, `color`, `created_at`, `updated_at`) VALUES
(1, 1, 1, 'General', '#3498DB', '2024-12-17 22:23:25', '2024-12-17 22:23:25');

-- --------------------------------------------------------

--
-- Table structure for table `discussion_files`
--

CREATE TABLE `discussion_files` (
  `id` int(10) UNSIGNED NOT NULL,
  `company_id` int(10) UNSIGNED DEFAULT NULL,
  `user_id` int(10) UNSIGNED NOT NULL,
  `discussion_id` int(10) UNSIGNED DEFAULT NULL,
  `discussion_reply_id` int(10) UNSIGNED DEFAULT NULL,
  `filename` varchar(191) NOT NULL,
  `description` text DEFAULT NULL,
  `google_url` varchar(191) DEFAULT NULL,
  `hashname` varchar(191) DEFAULT NULL,
  `size` varchar(191) DEFAULT NULL,
  `dropbox_link` varchar(191) DEFAULT NULL,
  `external_link_name` varchar(191) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `discussion_replies`
--

CREATE TABLE `discussion_replies` (
  `id` int(10) UNSIGNED NOT NULL,
  `company_id` int(10) UNSIGNED DEFAULT NULL,
  `discussion_id` int(10) UNSIGNED NOT NULL,
  `user_id` int(10) UNSIGNED NOT NULL,
  `body` longtext NOT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `email_notification_settings`
--

CREATE TABLE `email_notification_settings` (
  `id` int(10) UNSIGNED NOT NULL,
  `company_id` int(10) UNSIGNED DEFAULT NULL,
  `slug` varchar(191) DEFAULT NULL,
  `setting_name` varchar(191) NOT NULL,
  `send_email` enum('yes','no') NOT NULL DEFAULT 'no',
  `send_slack` enum('yes','no') NOT NULL DEFAULT 'no',
  `send_push` enum('yes','no') NOT NULL DEFAULT 'no',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `email_notification_settings`
--

INSERT INTO `email_notification_settings` (`id`, `company_id`, `slug`, `setting_name`, `send_email`, `send_slack`, `send_push`, `created_at`, `updated_at`) VALUES
(1, 1, 'new-expenseadded-by-admin', 'New Expense/Added by Admin', 'yes', 'no', 'no', NULL, NULL),
(2, 1, 'new-expenseadded-by-member', 'New Expense/Added by Member', 'yes', 'no', 'no', NULL, NULL),
(3, 1, 'expense-status-changed', 'Expense Status Changed', 'yes', 'no', 'no', NULL, NULL),
(4, 1, 'new-support-ticket-request', 'New Support Ticket Request', 'yes', 'no', 'no', NULL, NULL),
(5, 1, 'new-leave-application', 'New Leave Application', 'yes', 'no', 'no', NULL, NULL),
(6, 1, 'task-completed', 'Task Completed', 'yes', 'no', 'no', NULL, NULL),
(7, 1, 'task-status-updated', 'Task Status Changed', 'yes', 'no', 'no', NULL, NULL),
(8, 1, 'invoice-createupdate-notification', 'Invoice Create/Update Notification', 'yes', 'no', 'no', NULL, NULL),
(9, 1, 'discussion-reply', 'Discussion Reply', 'yes', 'no', 'no', NULL, NULL),
(10, 1, 'new-product-purchase-request', 'New Product Purchase Request', 'yes', 'no', 'no', NULL, NULL),
(11, 1, 'lead-notification', 'Lead notification', 'yes', 'no', 'no', NULL, NULL),
(12, 1, 'order-createupdate-notification', 'Order Create/Update Notification', 'no', 'no', 'no', NULL, NULL),
(13, 1, 'user-join-via-invitation', 'User Join via Invitation', 'no', 'no', 'no', NULL, NULL),
(14, 1, 'follow-up-reminder', 'Follow Up Reminder', 'no', 'no', 'no', NULL, NULL),
(15, 1, 'user-registrationadded-by-admin', 'User Registration/Added by Admin', 'yes', 'no', 'no', NULL, NULL),
(16, 1, 'employee-assign-to-project', 'Employee Assign to Project', 'yes', 'no', 'no', NULL, NULL),
(17, 1, 'new-notice-published', 'New Notice Published', 'no', 'no', 'no', NULL, NULL),
(18, 1, 'user-assign-to-task', 'User Assign to Task', 'yes', 'no', 'no', NULL, NULL),
(19, 1, 'birthday-notification', 'Birthday notification', 'yes', 'yes', 'no', NULL, NULL),
(20, 1, 'payment-notification', 'Payment Notification', 'yes', 'no', 'no', NULL, NULL),
(21, 1, 'appreciation-notification', 'Employee Appreciation', 'yes', 'no', 'no', NULL, NULL),
(22, 1, 'holiday-notification', 'Holiday Notification', 'no', 'no', 'no', NULL, NULL),
(23, 1, 'estimate-notification', 'Estimate Notification', 'yes', 'no', 'no', NULL, NULL),
(24, 1, 'event-notification', 'Event Notification', 'yes', 'no', 'no', NULL, NULL),
(25, 1, 'message-notification', 'Message Notification', 'yes', 'no', 'no', NULL, NULL),
(26, 1, 'project-mention-notification', 'Project Mention Notification', 'yes', 'no', 'no', NULL, NULL),
(27, 1, 'task-mention-notification', 'Task Mention', 'yes', 'no', 'no', NULL, NULL),
(28, 1, 'shift-assign-notification', 'Shift Assign Notification', 'yes', 'no', 'no', NULL, NULL),
(29, 1, 'daily-schedule-notification', 'Daily Schedule Notification', 'no', 'no', 'no', NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `emergency_contacts`
--

CREATE TABLE `emergency_contacts` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `company_id` int(10) UNSIGNED DEFAULT NULL,
  `user_id` int(10) UNSIGNED NOT NULL,
  `name` varchar(191) DEFAULT NULL,
  `email` varchar(191) DEFAULT NULL,
  `mobile` varchar(191) DEFAULT NULL,
  `relation` varchar(191) DEFAULT NULL,
  `address` varchar(191) DEFAULT NULL,
  `added_by` int(10) UNSIGNED DEFAULT NULL,
  `last_updated_by` int(10) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `employee_activity`
--

CREATE TABLE `employee_activity` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `emp_id` bigint(20) UNSIGNED NOT NULL,
  `employee_activity` varchar(191) NOT NULL,
  `leave_id` bigint(20) UNSIGNED DEFAULT NULL,
  `task_id` bigint(20) UNSIGNED DEFAULT NULL,
  `proj_id` bigint(20) UNSIGNED DEFAULT NULL,
  `invoice_id` bigint(20) UNSIGNED DEFAULT NULL,
  `ticket_id` bigint(20) UNSIGNED DEFAULT NULL,
  `proposal_id` bigint(20) UNSIGNED DEFAULT NULL,
  `estimate_id` bigint(20) UNSIGNED DEFAULT NULL,
  `deal_id` bigint(20) UNSIGNED DEFAULT NULL,
  `deal_followup_id` bigint(20) UNSIGNED DEFAULT NULL,
  `client_id` bigint(20) UNSIGNED DEFAULT NULL,
  `expenses_id` bigint(20) UNSIGNED DEFAULT NULL,
  `timelog_id` bigint(20) UNSIGNED DEFAULT NULL,
  `event_id` bigint(20) UNSIGNED DEFAULT NULL,
  `product_id` bigint(20) UNSIGNED DEFAULT NULL,
  `credit_note_id` bigint(20) UNSIGNED DEFAULT NULL,
  `payment_id` bigint(20) UNSIGNED DEFAULT NULL,
  `order_id` bigint(20) UNSIGNED DEFAULT NULL,
  `contract_id` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `employee_details`
--

CREATE TABLE `employee_details` (
  `id` int(10) UNSIGNED NOT NULL,
  `company_id` int(10) UNSIGNED DEFAULT NULL,
  `user_id` int(10) UNSIGNED NOT NULL,
  `employee_id` varchar(191) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `hourly_rate` double DEFAULT NULL,
  `slack_username` varchar(191) DEFAULT NULL,
  `department_id` int(10) UNSIGNED DEFAULT NULL,
  `designation_id` bigint(20) UNSIGNED DEFAULT NULL,
  `joining_date` timestamp NOT NULL DEFAULT current_timestamp(),
  `last_date` date DEFAULT NULL,
  `added_by` int(10) UNSIGNED DEFAULT NULL,
  `last_updated_by` int(10) UNSIGNED DEFAULT NULL,
  `attendance_reminder` date DEFAULT NULL,
  `date_of_birth` date DEFAULT NULL,
  `calendar_view` text DEFAULT NULL,
  `about_me` text DEFAULT NULL,
  `reporting_to` int(10) UNSIGNED DEFAULT NULL,
  `contract_end_date` date DEFAULT NULL,
  `internship_end_date` date DEFAULT NULL,
  `employment_type` varchar(191) DEFAULT NULL,
  `marriage_anniversary_date` date DEFAULT NULL,
  `marital_status` varchar(191) DEFAULT 'single',
  `notice_period_end_date` date DEFAULT NULL,
  `notice_period_start_date` date DEFAULT NULL,
  `probation_end_date` date DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `company_address_id` bigint(20) UNSIGNED DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `employee_details`
--

INSERT INTO `employee_details` (`id`, `company_id`, `user_id`, `employee_id`, `address`, `hourly_rate`, `slack_username`, `department_id`, `designation_id`, `joining_date`, `last_date`, `added_by`, `last_updated_by`, `attendance_reminder`, `date_of_birth`, `calendar_view`, `about_me`, `reporting_to`, `contract_end_date`, `internship_end_date`, `employment_type`, `marriage_anniversary_date`, `marital_status`, `notice_period_end_date`, `notice_period_start_date`, `probation_end_date`, `created_at`, `updated_at`, `company_address_id`) VALUES
(1, 1, 1, '1', NULL, NULL, NULL, NULL, NULL, '2024-12-17 14:24:09', NULL, NULL, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'single', NULL, NULL, NULL, '2024-12-17 22:24:09', '2024-12-23 09:33:13', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `employee_docs`
--

CREATE TABLE `employee_docs` (
  `id` int(10) UNSIGNED NOT NULL,
  `company_id` int(10) UNSIGNED DEFAULT NULL,
  `user_id` int(10) UNSIGNED NOT NULL,
  `name` varchar(200) NOT NULL,
  `filename` varchar(200) NOT NULL,
  `hashname` varchar(200) NOT NULL,
  `size` varchar(200) DEFAULT NULL,
  `added_by` int(10) UNSIGNED DEFAULT NULL,
  `last_updated_by` int(10) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `employee_leave_quotas`
--

CREATE TABLE `employee_leave_quotas` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` int(10) UNSIGNED NOT NULL,
  `leave_type_id` int(10) UNSIGNED NOT NULL,
  `no_of_leaves` double NOT NULL,
  `leaves_used` double NOT NULL DEFAULT 0,
  `leaves_remaining` double NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `carry_forward_status` text DEFAULT NULL,
  `leave_type_impact` tinyint(1) NOT NULL DEFAULT 0,
  `overutilised_leaves` double NOT NULL DEFAULT 0,
  `unused_leaves` double NOT NULL DEFAULT 0,
  `carry_forward_leaves` double NOT NULL DEFAULT 0,
  `carry_forward_applied` double NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `employee_leave_quotas`
--

INSERT INTO `employee_leave_quotas` (`id`, `user_id`, `leave_type_id`, `no_of_leaves`, `leaves_used`, `leaves_remaining`, `created_at`, `updated_at`, `carry_forward_status`, `leave_type_impact`, `overutilised_leaves`, `unused_leaves`, `carry_forward_leaves`, `carry_forward_applied`) VALUES
(1, 1, 1, 0.5, 0, 0.5, '2024-12-17 22:24:09', '2024-12-17 22:24:09', NULL, 0, 0, 0, 0, 0),
(2, 1, 2, 0.5, 0, 0.5, '2024-12-17 22:24:09', '2024-12-17 22:24:09', NULL, 0, 0, 0, 0, 0),
(3, 1, 3, 0.5, 0, 0.5, '2024-12-17 22:24:09', '2024-12-17 22:24:09', NULL, 0, 0, 0, 0, 0);

-- --------------------------------------------------------

--
-- Table structure for table `employee_leave_quota_histories`
--

CREATE TABLE `employee_leave_quota_histories` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` int(10) UNSIGNED NOT NULL,
  `leave_type_id` int(10) UNSIGNED NOT NULL,
  `no_of_leaves` double NOT NULL,
  `leaves_used` double NOT NULL DEFAULT 0,
  `leaves_remaining` double NOT NULL DEFAULT 0,
  `for_month` date NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `overutilised_leaves` double NOT NULL DEFAULT 0,
  `unused_leaves` double NOT NULL DEFAULT 0,
  `carry_forward_leaves` double NOT NULL DEFAULT 0,
  `carry_forward_applied` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `employee_shifts`
--

CREATE TABLE `employee_shifts` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `company_id` int(10) UNSIGNED DEFAULT NULL,
  `shift_name` varchar(191) NOT NULL,
  `shift_short_code` varchar(191) NOT NULL,
  `shift_type` enum('strict','flexible') NOT NULL DEFAULT 'strict',
  `flexible_total_hours` double DEFAULT NULL,
  `flexible_auto_clockout` double DEFAULT NULL,
  `flexible_half_day_hours` double DEFAULT NULL,
  `color` varchar(191) NOT NULL,
  `office_start_time` time NOT NULL,
  `office_end_time` time NOT NULL,
  `auto_clock_out_time` int(11) NOT NULL DEFAULT 1,
  `halfday_mark_time` time DEFAULT NULL,
  `late_mark_duration` tinyint(4) NOT NULL,
  `clockin_in_day` tinyint(4) NOT NULL,
  `office_open_days` text NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `early_clock_in` varchar(191) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `employee_shifts`
--

INSERT INTO `employee_shifts` (`id`, `company_id`, `shift_name`, `shift_short_code`, `shift_type`, `flexible_total_hours`, `flexible_auto_clockout`, `flexible_half_day_hours`, `color`, `office_start_time`, `office_end_time`, `auto_clock_out_time`, `halfday_mark_time`, `late_mark_duration`, `clockin_in_day`, `office_open_days`, `created_at`, `updated_at`, `early_clock_in`) VALUES
(1, 1, 'Day Off', 'DO', 'strict', NULL, NULL, NULL, '#E8EEF3', '00:00:00', '00:00:00', 1, '00:00:00', 0, 0, '', '2024-12-17 22:23:25', '2024-12-17 22:23:25', NULL),
(2, 1, 'General Shift', 'GS', 'strict', NULL, NULL, NULL, '#99C7F1', '09:00:00', '18:00:00', 1, '13:00:00', 20, 2, '[\"1\",\"2\",\"3\",\"4\",\"5\"]', '2024-12-17 22:23:25', '2024-12-17 22:23:25', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `employee_shift_change_requests`
--

CREATE TABLE `employee_shift_change_requests` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `company_id` int(10) UNSIGNED DEFAULT NULL,
  `shift_schedule_id` bigint(20) UNSIGNED NOT NULL,
  `employee_shift_id` bigint(20) UNSIGNED NOT NULL,
  `status` enum('waiting','accepted','rejected') NOT NULL DEFAULT 'waiting',
  `reason` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `employee_shift_rotations`
--

CREATE TABLE `employee_shift_rotations` (
  `id` int(10) UNSIGNED NOT NULL,
  `company_id` int(10) UNSIGNED DEFAULT NULL,
  `rotation_name` varchar(191) DEFAULT NULL,
  `rotation_frequency` varchar(191) DEFAULT NULL,
  `schedule_on` varchar(191) DEFAULT NULL,
  `rotation_date` int(11) DEFAULT NULL,
  `color_code` varchar(191) DEFAULT NULL,
  `override_shift` enum('yes','no') NOT NULL DEFAULT 'no',
  `status` enum('active','inactive') NOT NULL DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `send_mail` enum('yes','no') NOT NULL DEFAULT 'yes'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `employee_shift_schedules`
--

CREATE TABLE `employee_shift_schedules` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` int(10) UNSIGNED NOT NULL,
  `date` date NOT NULL,
  `employee_shift_id` bigint(20) UNSIGNED NOT NULL,
  `added_by` int(10) UNSIGNED DEFAULT NULL,
  `last_updated_by` int(10) UNSIGNED DEFAULT NULL,
  `shift_start_time` datetime DEFAULT NULL,
  `shift_end_time` datetime DEFAULT NULL,
  `remarks` text DEFAULT NULL,
  `file` varchar(191) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `employee_skills`
--

CREATE TABLE `employee_skills` (
  `id` int(10) UNSIGNED NOT NULL,
  `company_id` int(10) UNSIGNED DEFAULT NULL,
  `user_id` int(10) UNSIGNED NOT NULL,
  `skill_id` int(10) UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `employee_teams`
--

CREATE TABLE `employee_teams` (
  `id` int(10) UNSIGNED NOT NULL,
  `company_id` int(10) UNSIGNED DEFAULT NULL,
  `team_id` int(10) UNSIGNED NOT NULL,
  `user_id` int(10) UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `estimates`
--

CREATE TABLE `estimates` (
  `id` int(10) UNSIGNED NOT NULL,
  `company_id` int(10) UNSIGNED DEFAULT NULL,
  `client_id` int(10) UNSIGNED NOT NULL,
  `estimate_number` varchar(191) DEFAULT NULL,
  `original_estimate_number` varchar(191) DEFAULT NULL,
  `valid_till` date NOT NULL,
  `sub_total` double(16,2) NOT NULL,
  `discount` double NOT NULL DEFAULT 0,
  `discount_type` enum('percent','fixed') NOT NULL DEFAULT 'percent',
  `total` double(16,2) NOT NULL,
  `currency_id` int(10) UNSIGNED DEFAULT NULL,
  `status` enum('declined','accepted','waiting','sent','draft','canceled') NOT NULL DEFAULT 'waiting',
  `note` mediumtext DEFAULT NULL,
  `description` longtext DEFAULT NULL,
  `send_status` tinyint(1) NOT NULL DEFAULT 1,
  `added_by` int(10) UNSIGNED DEFAULT NULL,
  `last_updated_by` int(10) UNSIGNED DEFAULT NULL,
  `hash` text DEFAULT NULL,
  `calculate_tax` enum('after_discount','before_discount') NOT NULL DEFAULT 'after_discount',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `last_viewed` timestamp NULL DEFAULT NULL,
  `ip_address` varchar(191) DEFAULT NULL,
  `estimate_request_id` bigint(20) UNSIGNED DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `estimate_items`
--

CREATE TABLE `estimate_items` (
  `id` int(10) UNSIGNED NOT NULL,
  `estimate_id` int(10) UNSIGNED NOT NULL,
  `item_name` varchar(191) NOT NULL,
  `item_summary` text DEFAULT NULL,
  `type` enum('item','discount','tax') NOT NULL DEFAULT 'item',
  `quantity` double(16,2) NOT NULL,
  `unit_price` double(16,2) NOT NULL,
  `amount` double(16,2) NOT NULL,
  `taxes` varchar(191) DEFAULT NULL,
  `hsn_sac_code` varchar(191) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `unit_id` bigint(20) UNSIGNED DEFAULT NULL,
  `product_id` int(10) UNSIGNED DEFAULT NULL,
  `field_order` int(11) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `estimate_item_images`
--

CREATE TABLE `estimate_item_images` (
  `id` int(10) UNSIGNED NOT NULL,
  `estimate_item_id` int(10) UNSIGNED NOT NULL,
  `filename` varchar(191) DEFAULT NULL,
  `hashname` varchar(191) DEFAULT NULL,
  `size` varchar(191) DEFAULT NULL,
  `external_link` varchar(191) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `estimate_requests`
--

CREATE TABLE `estimate_requests` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `original_request_number` varchar(191) DEFAULT NULL,
  `estimate_request_number` varchar(191) DEFAULT NULL,
  `client_id` int(10) UNSIGNED NOT NULL,
  `company_id` int(10) UNSIGNED DEFAULT NULL,
  `estimate_id` int(10) UNSIGNED DEFAULT NULL,
  `description` longtext NOT NULL,
  `estimated_budget` double(16,2) NOT NULL,
  `project_id` int(10) UNSIGNED DEFAULT NULL,
  `early_requirement` text DEFAULT NULL,
  `currency_id` int(10) UNSIGNED DEFAULT NULL,
  `status` enum('pending','rejected','accepted','in process') NOT NULL DEFAULT 'pending',
  `reason` text NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `added_by` int(10) UNSIGNED DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `estimate_templates`
--

CREATE TABLE `estimate_templates` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `company_id` int(10) UNSIGNED DEFAULT NULL,
  `name` varchar(191) NOT NULL,
  `sub_total` double NOT NULL,
  `total` double NOT NULL,
  `currency_id` int(10) UNSIGNED DEFAULT NULL,
  `discount_type` enum('percent','fixed') NOT NULL,
  `discount` double NOT NULL,
  `invoice_convert` tinyint(1) NOT NULL DEFAULT 0,
  `status` enum('declined','accepted','waiting') NOT NULL DEFAULT 'waiting',
  `note` mediumtext DEFAULT NULL,
  `description` longtext DEFAULT NULL,
  `calculate_tax` enum('after_discount','before_discount') NOT NULL DEFAULT 'after_discount',
  `client_comment` text DEFAULT NULL,
  `signature_approval` tinyint(1) NOT NULL DEFAULT 1,
  `hash` text DEFAULT NULL,
  `added_by` int(10) UNSIGNED DEFAULT NULL,
  `last_updated_by` int(10) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `estimate_template_items`
--

CREATE TABLE `estimate_template_items` (
  `id` int(10) UNSIGNED NOT NULL,
  `company_id` int(10) UNSIGNED DEFAULT NULL,
  `estimate_template_id` bigint(20) UNSIGNED NOT NULL,
  `hsn_sac_code` varchar(191) DEFAULT NULL,
  `item_name` varchar(191) NOT NULL,
  `type` enum('item','discount','tax') NOT NULL DEFAULT 'item',
  `quantity` double NOT NULL,
  `unit_price` double NOT NULL,
  `amount` double NOT NULL,
  `item_summary` text DEFAULT NULL,
  `taxes` varchar(191) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `unit_id` bigint(20) UNSIGNED DEFAULT NULL,
  `product_id` int(10) UNSIGNED DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `estimate_template_item_images`
--

CREATE TABLE `estimate_template_item_images` (
  `id` int(10) UNSIGNED NOT NULL,
  `company_id` int(10) UNSIGNED DEFAULT NULL,
  `estimate_template_item_id` int(10) UNSIGNED NOT NULL,
  `filename` varchar(191) NOT NULL,
  `hashname` varchar(191) DEFAULT NULL,
  `size` varchar(191) DEFAULT NULL,
  `external_link` varchar(191) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `events`
--

CREATE TABLE `events` (
  `id` int(10) UNSIGNED NOT NULL,
  `parent_id` int(10) UNSIGNED DEFAULT NULL,
  `company_id` int(10) UNSIGNED DEFAULT NULL,
  `event_name` varchar(191) NOT NULL,
  `label_color` varchar(191) NOT NULL,
  `where` varchar(191) NOT NULL,
  `description` mediumtext NOT NULL,
  `start_date_time` datetime NOT NULL,
  `end_date_time` datetime NOT NULL,
  `host` int(10) UNSIGNED DEFAULT NULL,
  `status` enum('pending','completed','cancelled') NOT NULL DEFAULT 'pending',
  `note` varchar(191) NOT NULL,
  `repeat` enum('yes','no') NOT NULL DEFAULT 'no',
  `repeat_every` int(11) DEFAULT NULL,
  `repeat_cycles` int(11) DEFAULT NULL,
  `repeat_type` enum('day','week','month','year') NOT NULL DEFAULT 'day',
  `send_reminder` enum('yes','no') NOT NULL DEFAULT 'no',
  `remind_time` int(11) DEFAULT NULL,
  `remind_type` enum('day','hour','minute') NOT NULL DEFAULT 'day',
  `event_link` varchar(191) DEFAULT NULL,
  `added_by` int(10) UNSIGNED DEFAULT NULL,
  `last_updated_by` int(10) UNSIGNED DEFAULT NULL,
  `event_id` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `departments` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `event_attendees`
--

CREATE TABLE `event_attendees` (
  `id` int(10) UNSIGNED NOT NULL,
  `company_id` int(10) UNSIGNED DEFAULT NULL,
  `user_id` int(10) UNSIGNED NOT NULL,
  `event_id` int(10) UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `event_files`
--

CREATE TABLE `event_files` (
  `id` int(10) UNSIGNED NOT NULL,
  `company_id` int(10) UNSIGNED DEFAULT NULL,
  `event_id` int(10) UNSIGNED NOT NULL,
  `filename` varchar(200) DEFAULT NULL,
  `hashname` varchar(200) DEFAULT NULL,
  `size` varchar(200) DEFAULT NULL,
  `added_by` int(10) UNSIGNED DEFAULT NULL,
  `last_updated_by` int(10) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `expenses`
--

CREATE TABLE `expenses` (
  `id` int(10) UNSIGNED NOT NULL,
  `company_id` int(10) UNSIGNED DEFAULT NULL,
  `item_name` varchar(191) NOT NULL,
  `purchase_date` date NOT NULL,
  `purchase_from` varchar(191) DEFAULT NULL,
  `price` double DEFAULT NULL,
  `currency_id` int(10) UNSIGNED NOT NULL,
  `default_currency_id` int(10) UNSIGNED DEFAULT NULL,
  `exchange_rate` double DEFAULT NULL,
  `project_id` int(10) UNSIGNED DEFAULT NULL,
  `bill` varchar(191) DEFAULT NULL,
  `user_id` int(10) UNSIGNED DEFAULT NULL,
  `status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  `can_claim` tinyint(1) NOT NULL DEFAULT 1,
  `category_id` bigint(20) UNSIGNED DEFAULT NULL,
  `expenses_recurring_id` bigint(20) UNSIGNED DEFAULT NULL,
  `created_by` int(10) UNSIGNED DEFAULT NULL,
  `description` longtext DEFAULT NULL,
  `added_by` int(10) UNSIGNED DEFAULT NULL,
  `last_updated_by` int(10) UNSIGNED DEFAULT NULL,
  `approver_id` int(10) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `bank_account_id` int(10) UNSIGNED DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `expenses_category`
--

CREATE TABLE `expenses_category` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `company_id` int(10) UNSIGNED DEFAULT NULL,
  `category_name` varchar(191) NOT NULL,
  `added_by` int(10) UNSIGNED DEFAULT NULL,
  `last_updated_by` int(10) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `expenses_category_roles`
--

CREATE TABLE `expenses_category_roles` (
  `id` int(10) UNSIGNED NOT NULL,
  `company_id` int(10) UNSIGNED DEFAULT NULL,
  `expenses_category_id` bigint(20) UNSIGNED DEFAULT NULL,
  `role_id` int(10) UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `expenses_recurring`
--

CREATE TABLE `expenses_recurring` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `company_id` int(10) UNSIGNED DEFAULT NULL,
  `category_id` bigint(20) UNSIGNED DEFAULT NULL,
  `currency_id` int(10) UNSIGNED DEFAULT NULL,
  `project_id` int(10) UNSIGNED DEFAULT NULL,
  `user_id` int(10) UNSIGNED DEFAULT NULL,
  `created_by` int(10) UNSIGNED DEFAULT NULL,
  `item_name` varchar(191) NOT NULL,
  `day_of_month` int(11) DEFAULT 1,
  `day_of_week` int(11) DEFAULT 1,
  `payment_method` varchar(191) DEFAULT NULL,
  `rotation` enum('monthly','weekly','bi-weekly','quarterly','half-yearly','annually','daily') NOT NULL,
  `billing_cycle` int(11) DEFAULT NULL,
  `issue_date` date NOT NULL,
  `next_expense_date` date DEFAULT NULL,
  `unlimited_recurring` tinyint(1) NOT NULL DEFAULT 0,
  `price` double NOT NULL,
  `bill` varchar(191) DEFAULT NULL,
  `status` enum('active','inactive') NOT NULL DEFAULT 'active',
  `description` text DEFAULT NULL,
  `added_by` int(10) UNSIGNED DEFAULT NULL,
  `last_updated_by` int(10) UNSIGNED DEFAULT NULL,
  `purchase_from` varchar(191) DEFAULT NULL,
  `immediate_expense` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `bank_account_id` int(10) UNSIGNED DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `failed_jobs`
--

CREATE TABLE `failed_jobs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `uuid` varchar(191) NOT NULL,
  `connection` text NOT NULL,
  `queue` text NOT NULL,
  `payload` longtext NOT NULL,
  `exception` longtext NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `file_storage`
--

CREATE TABLE `file_storage` (
  `id` int(10) UNSIGNED NOT NULL,
  `company_id` int(10) UNSIGNED DEFAULT NULL,
  `path` varchar(191) NOT NULL,
  `filename` varchar(191) NOT NULL,
  `type` varchar(50) DEFAULT NULL,
  `size` int(10) UNSIGNED NOT NULL,
  `storage_location` enum('local','aws_s3','digitalocean','wasabi','minio') NOT NULL DEFAULT 'local',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `file_storage_settings`
--

CREATE TABLE `file_storage_settings` (
  `id` int(10) UNSIGNED NOT NULL,
  `filesystem` varchar(191) NOT NULL,
  `auth_keys` text DEFAULT NULL,
  `status` enum('enabled','disabled') NOT NULL DEFAULT 'disabled',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `file_storage_settings`
--

INSERT INTO `file_storage_settings` (`id`, `filesystem`, `auth_keys`, `status`, `created_at`, `updated_at`) VALUES
(1, 'local', NULL, 'enabled', '2024-12-17 22:23:19', '2024-12-17 22:23:19');

-- --------------------------------------------------------

--
-- Table structure for table `flags`
--

CREATE TABLE `flags` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `capital` varchar(191) DEFAULT NULL,
  `code` varchar(191) DEFAULT NULL,
  `continent` varchar(191) DEFAULT NULL,
  `name` varchar(191) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `flags`
--

INSERT INTO `flags` (`id`, `capital`, `code`, `continent`, `name`) VALUES
(1, 'Kabul', 'af', 'Asia', 'Afghanistan'),
(2, 'Mariehamn', 'ax', 'Europe', 'Aland Islands'),
(3, 'Tirana', 'al', 'Europe', 'Albania'),
(4, 'Algiers', 'dz', 'Africa', 'Algeria'),
(5, 'Pago Pago', 'as', 'Oceania', 'American Samoa'),
(6, 'Andorra la Vella', 'ad', 'Europe', 'Andorra'),
(7, 'Luanda', 'ao', 'Africa', 'Angola'),
(8, 'The Valley', 'ai', 'North America', 'Anguilla'),
(9, '', 'aq', '', 'Antarctica'),
(10, 'St. John\'s', 'ag', 'North America', 'Antigua and Barbuda'),
(11, 'Buenos Aires', 'ar', 'South America', 'Argentina'),
(12, 'Yerevan', 'am', 'Asia', 'Armenia'),
(13, 'Oranjestad', 'aw', 'South America', 'Aruba'),
(14, 'Georgetown', 'ac', 'Africa', 'Ascension Island'),
(15, 'Canberra', 'au', 'Oceania', 'Australia'),
(16, 'Vienna', 'at', 'Europe', 'Austria'),
(17, 'Baku', 'az', 'Asia', 'Azerbaijan'),
(18, 'Nassau', 'bs', 'North America', 'Bahamas'),
(19, 'Manama', 'bh', 'Asia', 'Bahrain'),
(20, 'Dhaka', 'bd', 'Asia', 'Bangladesh'),
(21, 'Bridgetown', 'bb', 'North America', 'Barbados'),
(22, 'Minsk', 'by', 'Europe', 'Belarus'),
(23, 'Brussels', 'be', 'Europe', 'Belgium'),
(24, 'Belmopan', 'bz', 'North America', 'Belize'),
(25, 'Porto-Novo', 'bj', 'Africa', 'Benin'),
(26, 'Hamilton', 'bm', 'North America', 'Bermuda'),
(27, 'Thimphu', 'bt', 'Asia', 'Bhutan'),
(28, 'Sucre', 'bo', 'South America', 'Bolivia'),
(29, 'Kralendijk', 'bq', 'South America', 'Bonaire, Sint Eustatius and Saba'),
(30, 'Sarajevo', 'ba', 'Europe', 'Bosnia and Herzegovina'),
(31, 'Gaborone', 'bw', 'Africa', 'Botswana'),
(32, '', 'bv', '', 'Bouvet Island'),
(33, 'Brasília', 'br', 'South America', 'Brazil'),
(34, 'Diego Garcia', 'io', 'Asia', 'British Indian Ocean Territory'),
(35, 'Bandar Seri Begawan', 'bn', 'Asia', 'Brunei Darussalam'),
(36, 'Sofia', 'bg', 'Europe', 'Bulgaria'),
(37, 'Ouagadougou', 'bf', 'Africa', 'Burkina Faso'),
(38, 'Bujumbura', 'bi', 'Africa', 'Burundi'),
(39, 'Praia', 'cv', 'Africa', 'Cabo Verde'),
(40, 'Phnom Penh', 'kh', 'Asia', 'Cambodia'),
(41, 'Yaoundé', 'cm', 'Africa', 'Cameroon'),
(42, 'Ottawa', 'ca', 'North America', 'Canada'),
(43, '', 'ic', '', 'Canary Islands'),
(44, '', 'es-ct', '', 'Catalonia'),
(45, 'George Town', 'ky', 'North America', 'Cayman Islands'),
(46, 'Bangui', 'cf', 'Africa', 'Central African Republic'),
(47, '', 'cefta', '', 'Central European Free Trade Agreement'),
(48, '', 'ea', '', 'Ceuta & Melilla'),
(49, 'N\'Djamena', 'td', 'Africa', 'Chad'),
(50, 'Santiago', 'cl', 'South America', 'Chile'),
(51, 'Beijing', 'cn', 'Asia', 'China'),
(52, 'Flying Fish Cove', 'cx', 'Asia', 'Christmas Island'),
(53, '', 'cp', '', 'Clipperton Island'),
(54, 'West Island', 'cc', 'Asia', 'Cocos (Keeling) Islands'),
(55, 'Bogotá', 'co', 'South America', 'Colombia'),
(56, 'Moroni', 'km', 'Africa', 'Comoros'),
(57, 'Avarua', 'ck', 'Oceania', 'Cook Islands'),
(58, 'San José', 'cr', 'North America', 'Costa Rica'),
(59, 'Zagreb', 'hr', 'Europe', 'Croatia'),
(60, 'Havana', 'cu', 'North America', 'Cuba'),
(61, 'Willemstad', 'cw', 'South America', 'Curaçao'),
(62, 'Nicosia', 'cy', 'Europe', 'Cyprus'),
(63, 'Prague', 'cz', 'Europe', 'Czech Republic'),
(64, 'Yamoussoukro', 'ci', 'Africa', 'Côte d\'Ivoire'),
(65, 'Kinshasa', 'cd', 'Africa', 'Democratic Republic of the Congo'),
(66, 'Copenhagen', 'dk', 'Europe', 'Denmark'),
(67, '', 'dg', '', 'Diego Garcia'),
(68, 'Djibouti', 'dj', 'Africa', 'Djibouti'),
(69, 'Roseau', 'dm', 'North America', 'Dominica'),
(70, 'Santo Domingo', 'do', 'North America', 'Dominican Republic'),
(71, 'Quito', 'ec', 'South America', 'Ecuador'),
(72, 'Cairo', 'eg', 'Africa', 'Egypt'),
(73, 'San Salvador', 'sv', 'North America', 'El Salvador'),
(74, 'London', 'gb-eng', 'Europe', 'England'),
(75, 'Malabo', 'gq', 'Africa', 'Equatorial Guinea'),
(76, 'Asmara', 'er', 'Africa', 'Eritrea'),
(77, 'Tallinn', 'ee', 'Europe', 'Estonia'),
(78, 'Lobamba, Mbabane', 'sz', 'Africa', 'Eswatini'),
(79, 'Addis Ababa', 'et', 'Africa', 'Ethiopia'),
(80, '', 'eu', '', 'Europe'),
(81, 'Stanley', 'fk', 'South America', 'Falkland Islands'),
(82, 'Tórshavn', 'fo', 'Europe', 'Faroe Islands'),
(83, 'Palikir', 'fm', 'Oceania', 'Federated States of Micronesia'),
(84, 'Suva', 'fj', 'Oceania', 'Fiji'),
(85, 'Helsinki', 'fi', 'Europe', 'Finland'),
(86, 'Paris', 'fr', 'Europe', 'France'),
(87, 'Cayenne', 'gf', 'South America', 'French Guiana'),
(88, 'Papeete', 'pf', 'Oceania', 'French Polynesia'),
(89, 'Saint-Pierre, Réunion', 'tf', 'Africa', 'French Southern Territories'),
(90, 'Libreville', 'ga', 'Africa', 'Gabon'),
(91, '', 'es-ga', '', 'Galicia'),
(92, 'Banjul', 'gm', 'Africa', 'Gambia'),
(93, 'Tbilisi', 'ge', 'Asia', 'Georgia'),
(94, 'Berlin', 'de', 'Europe', 'Germany'),
(95, 'Accra', 'gh', 'Africa', 'Ghana'),
(96, 'Gibraltar', 'gi', 'Europe', 'Gibraltar'),
(97, 'Athens', 'gr', 'Europe', 'Greece'),
(98, 'Nuuk', 'gl', 'North America', 'Greenland'),
(99, 'St. George\'s', 'gd', 'North America', 'Grenada'),
(100, 'Basse-Terre', 'gp', 'North America', 'Guadeloupe'),
(101, 'Hagåtña', 'gu', 'Oceania', 'Guam'),
(102, 'Guatemala City', 'gt', 'North America', 'Guatemala'),
(103, 'Saint Peter Port', 'gg', 'Europe', 'Guernsey'),
(104, 'Conakry', 'gn', 'Africa', 'Guinea'),
(105, 'Bissau', 'gw', 'Africa', 'Guinea-Bissau'),
(106, 'Georgetown', 'gy', 'South America', 'Guyana'),
(107, 'Port-au-Prince', 'ht', 'North America', 'Haiti'),
(108, '', 'hm', '', 'Heard Island and McDonald Islands'),
(109, 'Vatican City', 'va', 'Europe', 'Holy See'),
(110, 'Tegucigalpa', 'hn', 'North America', 'Honduras'),
(111, 'Hong Kong', 'hk', 'Asia', 'Hong Kong'),
(112, 'Budapest', 'hu', 'Europe', 'Hungary'),
(113, 'Reykjavik', 'is', 'Europe', 'Iceland'),
(114, 'New Delhi', 'in', 'Asia', 'India'),
(115, 'Jakarta', 'id', 'Asia', 'Indonesia'),
(116, 'Tehran', 'ir', 'Asia', 'Iran'),
(117, 'Baghdad', 'iq', 'Asia', 'Iraq'),
(118, 'Dublin', 'ie', 'Europe', 'Ireland'),
(119, 'Douglas', 'im', 'Europe', 'Isle of Man'),
(120, 'Jerusalem', 'il', 'Asia', 'Israel'),
(121, 'Rome', 'it', 'Europe', 'Italy'),
(122, 'Kingston', 'jm', 'North America', 'Jamaica'),
(123, 'Tokyo', 'jp', 'Asia', 'Japan'),
(124, 'Saint Helier', 'je', 'Europe', 'Jersey'),
(125, 'Amman', 'jo', 'Asia', 'Jordan'),
(126, 'Astana', 'kz', 'Asia', 'Kazakhstan'),
(127, 'Nairobi', 'ke', 'Africa', 'Kenya'),
(128, 'South Tarawa', 'ki', 'Oceania', 'Kiribati'),
(129, 'Pristina', 'xk', 'Europe', 'Kosovo'),
(130, 'Kuwait City', 'kw', 'Asia', 'Kuwait'),
(131, 'Bishkek', 'kg', 'Asia', 'Kyrgyzstan'),
(132, 'Vientiane', 'la', 'Asia', 'Laos'),
(133, 'Riga', 'lv', 'Europe', 'Latvia'),
(134, 'Beirut', 'lb', 'Asia', 'Lebanon'),
(135, 'Maseru', 'ls', 'Africa', 'Lesotho'),
(136, 'Monrovia', 'lr', 'Africa', 'Liberia'),
(137, 'Tripoli', 'ly', 'Africa', 'Libya'),
(138, 'Vaduz', 'li', 'Europe', 'Liechtenstein'),
(139, 'Vilnius', 'lt', 'Europe', 'Lithuania'),
(140, 'Luxembourg City', 'lu', 'Europe', 'Luxembourg'),
(141, 'Macau', 'mo', 'Asia', 'Macau'),
(142, 'Antananarivo', 'mg', 'Africa', 'Madagascar'),
(143, 'Lilongwe', 'mw', 'Africa', 'Malawi'),
(144, 'Kuala Lumpur', 'my', 'Asia', 'Malaysia'),
(145, 'Malé', 'mv', 'Asia', 'Maldives'),
(146, 'Bamako', 'ml', 'Africa', 'Mali'),
(147, 'Valletta', 'mt', 'Europe', 'Malta'),
(148, 'Majuro', 'mh', 'Oceania', 'Marshall Islands'),
(149, 'Fort-de-France', 'mq', 'North America', 'Martinique'),
(150, 'Nouakchott', 'mr', 'Africa', 'Mauritania'),
(151, 'Port Louis', 'mu', 'Africa', 'Mauritius'),
(152, 'Mamoudzou', 'yt', 'Africa', 'Mayotte'),
(153, 'Mexico City', 'mx', 'North America', 'Mexico'),
(154, 'Chișinău', 'md', 'Europe', 'Moldova'),
(155, 'Monaco', 'mc', 'Europe', 'Monaco'),
(156, 'Ulaanbaatar', 'mn', 'Asia', 'Mongolia'),
(157, 'Podgorica', 'me', 'Europe', 'Montenegro'),
(158, 'Little Bay, Brades, Plymouth', 'ms', 'North America', 'Montserrat'),
(159, 'Rabat', 'ma', 'Africa', 'Morocco'),
(160, 'Maputo', 'mz', 'Africa', 'Mozambique'),
(161, 'Naypyidaw', 'mm', 'Asia', 'Myanmar'),
(162, 'Windhoek', 'na', 'Africa', 'Namibia'),
(163, 'Yaren District', 'nr', 'Oceania', 'Nauru'),
(164, 'Kathmandu', 'np', 'Asia', 'Nepal'),
(165, 'Amsterdam', 'nl', 'Europe', 'Netherlands'),
(166, 'Nouméa', 'nc', 'Oceania', 'New Caledonia'),
(167, 'Wellington', 'nz', 'Oceania', 'New Zealand'),
(168, 'Managua', 'ni', 'North America', 'Nicaragua'),
(169, 'Niamey', 'ne', 'Africa', 'Niger'),
(170, 'Abuja', 'ng', 'Africa', 'Nigeria'),
(171, 'Alofi', 'nu', 'Oceania', 'Niue'),
(172, 'Kingston', 'nf', 'Oceania', 'Norfolk Island'),
(173, 'Pyongyang', 'kp', 'Asia', 'North Korea'),
(174, 'Skopje', 'mk', 'Europe', 'North Macedonia'),
(175, 'Belfast', 'gb-nir', 'Europe', 'Northern Ireland'),
(176, 'Saipan', 'mp', 'Oceania', 'Northern Mariana Islands'),
(177, 'Oslo', 'no', 'Europe', 'Norway'),
(178, 'Muscat', 'om', 'Asia', 'Oman'),
(179, 'Islamabad', 'pk', 'Asia', 'Pakistan'),
(180, 'Ngerulmud', 'pw', 'Oceania', 'Palau'),
(181, 'Panama City', 'pa', 'North America', 'Panama'),
(182, 'Port Moresby', 'pg', 'Oceania', 'Papua New Guinea'),
(183, 'Asunción', 'py', 'South America', 'Paraguay'),
(184, 'Lima', 'pe', 'South America', 'Peru'),
(185, 'Manila', 'ph', 'Asia', 'Philippines'),
(186, 'Adamstown', 'pn', 'Oceania', 'Pitcairn'),
(187, 'Warsaw', 'pl', 'Europe', 'Poland'),
(188, 'Lisbon', 'pt', 'Europe', 'Portugal'),
(189, 'San Juan', 'pr', 'North America', 'Puerto Rico'),
(190, 'Doha', 'qa', 'Asia', 'Qatar'),
(191, 'Brazzaville', 'cg', 'Africa', 'Republic of the Congo'),
(192, 'Bucharest', 'ro', 'Europe', 'Romania'),
(193, 'Moscow', 'ru', 'Europe', 'Russia'),
(194, 'Kigali', 'rw', 'Africa', 'Rwanda'),
(195, 'Saint-Denis', 're', 'Africa', 'Réunion'),
(196, 'Gustavia', 'bl', 'North America', 'Saint Barthélemy'),
(197, 'Jamestown', 'sh', 'Africa', 'Saint Helena, Ascension and Tristan da Cunha'),
(198, 'Basseterre', 'kn', 'North America', 'Saint Kitts and Nevis'),
(199, 'Castries', 'lc', 'North America', 'Saint Lucia'),
(200, 'Marigot', 'mf', 'North America', 'Saint Martin'),
(201, 'Saint-Pierre', 'pm', 'North America', 'Saint Pierre and Miquelon'),
(202, 'Kingstown', 'vc', 'North America', 'Saint Vincent and the Grenadines'),
(203, 'Apia', 'ws', 'Oceania', 'Samoa'),
(204, 'San Marino', 'sm', 'Europe', 'San Marino'),
(205, 'São Tomé', 'st', 'Africa', 'Sao Tome and Principe'),
(206, 'Riyadh', 'sa', 'Asia', 'Saudi Arabia'),
(207, 'Edinburgh', 'gb-sct', 'Europe', 'Scotland'),
(208, 'Dakar', 'sn', 'Africa', 'Senegal'),
(209, 'Belgrade', 'rs', 'Europe', 'Serbia'),
(210, 'Victoria', 'sc', 'Africa', 'Seychelles'),
(211, 'Freetown', 'sl', 'Africa', 'Sierra Leone'),
(212, 'Singapore', 'sg', 'Asia', 'Singapore'),
(213, 'Philipsburg', 'sx', 'North America', 'Sint Maarten'),
(214, 'Bratislava', 'sk', 'Europe', 'Slovakia'),
(215, 'Ljubljana', 'si', 'Europe', 'Slovenia'),
(216, 'Honiara', 'sb', 'Oceania', 'Solomon Islands'),
(217, 'Mogadishu', 'so', 'Africa', 'Somalia'),
(218, 'Pretoria', 'za', 'Africa', 'South Africa'),
(219, 'King Edward Point', 'gs', 'Antarctica', 'South Georgia and the South Sandwich Islands'),
(220, 'Seoul', 'kr', 'Asia', 'South Korea'),
(221, 'Juba', 'ss', 'Africa', 'South Sudan'),
(222, 'Madrid', 'es', 'Europe', 'Spain'),
(223, 'Sri Jayawardenepura Kotte, Colombo', 'lk', 'Asia', 'Sri Lanka'),
(224, 'Ramallah', 'ps', 'Asia', 'State of Palestine'),
(225, 'Khartoum', 'sd', 'Africa', 'Sudan'),
(226, 'Paramaribo', 'sr', 'South America', 'Suriname'),
(227, 'Longyearbyen', 'sj', 'Europe', 'Svalbard and Jan Mayen'),
(228, 'Stockholm', 'se', 'Europe', 'Sweden'),
(229, 'Bern', 'ch', 'Europe', 'Switzerland'),
(230, 'Damascus', 'sy', 'Asia', 'Syria'),
(231, 'Taipei', 'tw', 'Asia', 'Taiwan'),
(232, 'Dushanbe', 'tj', 'Asia', 'Tajikistan'),
(233, 'Dodoma', 'tz', 'Africa', 'Tanzania'),
(234, 'Bangkok', 'th', 'Asia', 'Thailand'),
(235, 'Dili', 'tl', 'Asia', 'Timor-Leste'),
(236, 'Lomé', 'tg', 'Africa', 'Togo'),
(237, 'Nukunonu, Atafu,Tokelau', 'tk', 'Oceania', 'Tokelau'),
(238, 'Nukuʻalofa', 'to', 'Oceania', 'Tonga'),
(239, 'Port of Spain', 'tt', 'South America', 'Trinidad and Tobago'),
(240, '', 'ta', '', 'Tristan da Cunha'),
(241, 'Tunis', 'tn', 'Africa', 'Tunisia'),
(242, 'Ankara', 'tr', 'Asia', 'Turkey'),
(243, 'Ashgabat', 'tm', 'Asia', 'Turkmenistan'),
(244, 'Cockburn Town', 'tc', 'North America', 'Turks and Caicos Islands'),
(245, 'Funafuti', 'tv', 'Oceania', 'Tuvalu'),
(246, 'Kampala', 'ug', 'Africa', 'Uganda'),
(247, 'Kiev', 'ua', 'Europe', 'Ukraine'),
(248, 'Abu Dhabi', 'ae', 'Asia', 'United Arab Emirates'),
(249, 'London', 'gb', 'Europe', 'United Kingdom'),
(250, '', 'un', '', 'United Nations'),
(251, 'Washington, D.C.', 'um', 'North America', 'United States Minor Outlying Islands'),
(252, 'Washington, D.C.', 'us', 'North America', 'United States of America'),
(253, '', 'xx', '', 'Unknown'),
(254, 'Montevideo', 'uy', 'South America', 'Uruguay'),
(255, 'Tashkent', 'uz', 'Asia', 'Uzbekistan'),
(256, 'Port Vila', 'vu', 'Oceania', 'Vanuatu'),
(257, 'Caracas', 've', 'South America', 'Venezuela'),
(258, 'Hanoi', 'vn', 'Asia', 'Vietnam'),
(259, 'Road Town', 'vg', 'North America', 'Virgin Islands (British)'),
(260, 'Charlotte Amalie', 'vi', 'North America', 'Virgin Islands (U.S.)'),
(261, 'Cardiff', 'gb-wls', 'Europe', 'Wales'),
(262, 'Mata-Utu', 'wf', 'Oceania', 'Wallis and Futuna'),
(263, 'Laayoune', 'eh', 'Africa', 'Western Sahara'),
(264, 'Sana\'a', 'ye', 'Asia', 'Yemen'),
(265, 'Lusaka', 'zm', 'Africa', 'Zambia'),
(266, 'Harare', 'zw', 'Africa', 'Zimbabwe');

-- --------------------------------------------------------

--
-- Table structure for table `gantt_links`
--

CREATE TABLE `gantt_links` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `type` varchar(191) NOT NULL,
  `project_id` int(10) UNSIGNED DEFAULT NULL,
  `source` int(10) UNSIGNED NOT NULL,
  `target` int(10) UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `gdpr_settings`
--

CREATE TABLE `gdpr_settings` (
  `id` int(10) UNSIGNED NOT NULL,
  `enable_gdpr` tinyint(1) NOT NULL DEFAULT 0,
  `show_customer_area` tinyint(1) NOT NULL DEFAULT 0,
  `show_customer_footer` tinyint(1) NOT NULL DEFAULT 0,
  `top_information_block` longtext DEFAULT NULL,
  `enable_export` tinyint(1) NOT NULL DEFAULT 0,
  `data_removal` tinyint(1) NOT NULL DEFAULT 0,
  `lead_removal_public_form` tinyint(1) NOT NULL DEFAULT 0,
  `terms_customer_footer` tinyint(1) NOT NULL DEFAULT 0,
  `terms` longtext DEFAULT NULL,
  `policy` longtext DEFAULT NULL,
  `public_lead_edit` tinyint(1) NOT NULL DEFAULT 0,
  `consent_customer` tinyint(1) NOT NULL DEFAULT 0,
  `consent_leads` tinyint(1) NOT NULL DEFAULT 0,
  `consent_block` longtext DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `gdpr_settings`
--

INSERT INTO `gdpr_settings` (`id`, `enable_gdpr`, `show_customer_area`, `show_customer_footer`, `top_information_block`, `enable_export`, `data_removal`, `lead_removal_public_form`, `terms_customer_footer`, `terms`, `policy`, `public_lead_edit`, `consent_customer`, `consent_leads`, `consent_block`, `created_at`, `updated_at`) VALUES
(1, 0, 0, 0, NULL, 0, 0, 0, 0, NULL, NULL, 0, 0, 0, NULL, '2024-12-17 22:23:19', '2024-12-17 22:23:19');

-- --------------------------------------------------------

--
-- Table structure for table `global_settings`
--

CREATE TABLE `global_settings` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `global_app_name` varchar(191) DEFAULT NULL,
  `logo` varchar(191) DEFAULT NULL,
  `light_logo` varchar(191) DEFAULT NULL,
  `login_background` varchar(191) DEFAULT NULL,
  `logo_background_color` varchar(191) DEFAULT NULL,
  `header_color` varchar(191) NOT NULL DEFAULT '#1D82F5',
  `sidebar_logo_style` varchar(191) DEFAULT 'square',
  `locale` varchar(191) NOT NULL DEFAULT 'en',
  `hash` varchar(191) DEFAULT NULL,
  `purchase_code` varchar(100) DEFAULT NULL,
  `supported_until` timestamp NULL DEFAULT NULL,
  `purchased_on` timestamp NULL DEFAULT NULL,
  `last_license_verified_at` timestamp NULL DEFAULT NULL,
  `google_recaptcha_status` enum('active','deactive') NOT NULL DEFAULT 'deactive',
  `google_recaptcha_v2_status` enum('active','deactive') NOT NULL DEFAULT 'deactive',
  `google_recaptcha_v2_site_key` varchar(191) DEFAULT NULL,
  `google_recaptcha_v2_secret_key` varchar(191) DEFAULT NULL,
  `google_recaptcha_v3_status` enum('active','deactive') NOT NULL DEFAULT 'deactive',
  `google_recaptcha_v3_site_key` varchar(191) DEFAULT NULL,
  `google_recaptcha_v3_secret_key` varchar(191) DEFAULT NULL,
  `app_debug` tinyint(1) NOT NULL DEFAULT 0,
  `currency_converter_key` varchar(191) NOT NULL,
  `currency_key_version` varchar(191) NOT NULL DEFAULT 'free',
  `dedicated_subdomain` varchar(191) DEFAULT NULL,
  `date_format` varchar(20) NOT NULL DEFAULT 'd-m-Y',
  `time_format` varchar(20) NOT NULL DEFAULT 'h:i a',
  `moment_format` varchar(191) NOT NULL DEFAULT 'DD-MM-YYYY',
  `timezone` varchar(191) NOT NULL DEFAULT 'Asia/Kolkata',
  `rtl` tinyint(1) NOT NULL DEFAULT 0,
  `license_type` varchar(20) DEFAULT NULL,
  `hide_cron_message` tinyint(1) NOT NULL DEFAULT 0,
  `system_update` tinyint(1) NOT NULL DEFAULT 1,
  `show_review_modal` tinyint(1) NOT NULL DEFAULT 1,
  `last_cron_run` timestamp NULL DEFAULT NULL,
  `favicon` varchar(191) DEFAULT NULL,
  `auth_theme` enum('dark','light') NOT NULL DEFAULT 'light',
  `auth_theme_text` enum('dark','light') NOT NULL DEFAULT 'dark',
  `session_driver` enum('file','database') NOT NULL DEFAULT 'file',
  `allowed_file_types` text DEFAULT NULL,
  `allowed_file_size` int(11) NOT NULL DEFAULT 10,
  `allow_max_no_of_files` int(11) NOT NULL DEFAULT 10,
  `datatable_row_limit` int(11) NOT NULL DEFAULT 10,
  `show_update_popup` tinyint(1) NOT NULL DEFAULT 1,
  `terms_link` text DEFAULT NULL,
  `sign_up_terms` enum('yes','no') NOT NULL DEFAULT 'no',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `google_map_key` text DEFAULT NULL,
  `google_calendar_status` enum('active','inactive') NOT NULL DEFAULT 'inactive',
  `google_client_id` text DEFAULT NULL,
  `google_client_secret` text DEFAULT NULL,
  `email` varchar(191) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `global_settings`
--

INSERT INTO `global_settings` (`id`, `global_app_name`, `logo`, `light_logo`, `login_background`, `logo_background_color`, `header_color`, `sidebar_logo_style`, `locale`, `hash`, `purchase_code`, `supported_until`, `purchased_on`, `last_license_verified_at`, `google_recaptcha_status`, `google_recaptcha_v2_status`, `google_recaptcha_v2_site_key`, `google_recaptcha_v2_secret_key`, `google_recaptcha_v3_status`, `google_recaptcha_v3_site_key`, `google_recaptcha_v3_secret_key`, `app_debug`, `currency_converter_key`, `currency_key_version`, `dedicated_subdomain`, `date_format`, `time_format`, `moment_format`, `timezone`, `rtl`, `license_type`, `hide_cron_message`, `system_update`, `show_review_modal`, `last_cron_run`, `favicon`, `auth_theme`, `auth_theme_text`, `session_driver`, `allowed_file_types`, `allowed_file_size`, `allow_max_no_of_files`, `datatable_row_limit`, `show_update_popup`, `terms_link`, `sign_up_terms`, `created_at`, `updated_at`, `google_map_key`, `google_calendar_status`, `google_client_id`, `google_client_secret`, `email`) VALUES
(1, 'Elite Design', NULL, NULL, NULL, '#FFFFFF', '#1D82F5', 'square', 'en', '9f87903c72a5b09cfc24e13c0f5c3f9f', NULL, NULL, NULL, NULL, 'deactive', 'deactive', NULL, NULL, 'deactive', NULL, NULL, 0, '', 'free', NULL, 'd-m-Y', 'h:i a', 'DD-MM-YYYY', 'Asia/Kolkata', 0, NULL, 0, 1, 1, NULL, NULL, 'light', 'dark', 'file', 'image/*,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/docx,application/pdf,text/plain,application/msword,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/zip,application/x-zip-compressed, application/x-compressed, multipart/x-zip,.xlsx,video/x-flv,video/mp4,application/x-mpegURL,video/MP2T,video/3gpp,video/quicktime,video/x-msvideo,video/x-ms-wmv,application/sla,.stl', 10, 10, 10, 1, NULL, 'no', '2024-12-17 22:23:22', '2024-12-23 09:34:51', NULL, 'inactive', NULL, NULL, 'company@email.com');

-- --------------------------------------------------------

--
-- Table structure for table `google_calendar_modules`
--

CREATE TABLE `google_calendar_modules` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `company_id` int(10) UNSIGNED DEFAULT NULL,
  `lead_status` tinyint(1) NOT NULL DEFAULT 0,
  `leave_status` tinyint(1) NOT NULL DEFAULT 0,
  `invoice_status` tinyint(1) NOT NULL DEFAULT 0,
  `contract_status` tinyint(1) NOT NULL DEFAULT 0,
  `task_status` tinyint(1) NOT NULL DEFAULT 0,
  `event_status` tinyint(1) NOT NULL DEFAULT 0,
  `holiday_status` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `google_calendar_modules`
--

INSERT INTO `google_calendar_modules` (`id`, `company_id`, `lead_status`, `leave_status`, `invoice_status`, `contract_status`, `task_status`, `event_status`, `holiday_status`, `created_at`, `updated_at`) VALUES
(1, 1, 0, 0, 0, 0, 0, 0, 0, '2024-12-17 22:23:25', '2024-12-17 22:23:25');

-- --------------------------------------------------------

--
-- Table structure for table `holidays`
--

CREATE TABLE `holidays` (
  `id` int(10) UNSIGNED NOT NULL,
  `company_id` int(10) UNSIGNED DEFAULT NULL,
  `date` date NOT NULL,
  `occassion` varchar(100) DEFAULT NULL,
  `added_by` int(10) UNSIGNED DEFAULT NULL,
  `last_updated_by` int(10) UNSIGNED DEFAULT NULL,
  `event_id` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `department_id_json` text DEFAULT NULL,
  `designation_id_json` text DEFAULT NULL,
  `employment_type_json` text DEFAULT NULL,
  `notification_sent` enum('yes','no') NOT NULL DEFAULT 'no'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `invoices`
--

CREATE TABLE `invoices` (
  `id` int(10) UNSIGNED NOT NULL,
  `company_id` int(10) UNSIGNED DEFAULT NULL,
  `project_id` int(10) UNSIGNED DEFAULT NULL,
  `client_id` int(10) UNSIGNED DEFAULT NULL,
  `order_id` bigint(20) UNSIGNED DEFAULT NULL,
  `invoice_number` varchar(191) NOT NULL,
  `original_invoice_number` varchar(191) DEFAULT NULL,
  `issue_date` date NOT NULL,
  `due_date` date NOT NULL,
  `sub_total` double(16,2) NOT NULL,
  `discount` double NOT NULL DEFAULT 0,
  `discount_type` enum('percent','fixed') NOT NULL DEFAULT 'percent',
  `total` double(16,2) NOT NULL,
  `currency_id` int(10) UNSIGNED DEFAULT NULL,
  `default_currency_id` int(10) UNSIGNED DEFAULT NULL,
  `exchange_rate` double DEFAULT NULL,
  `status` enum('paid','unpaid','partial','canceled','draft','pending-confirmation') NOT NULL DEFAULT 'unpaid',
  `recurring` enum('yes','no') NOT NULL DEFAULT 'no',
  `billing_cycle` int(11) DEFAULT NULL,
  `billing_interval` int(11) DEFAULT NULL,
  `billing_frequency` varchar(191) DEFAULT NULL,
  `file` varchar(191) DEFAULT NULL,
  `file_original_name` varchar(191) DEFAULT NULL,
  `note` text DEFAULT NULL,
  `credit_note` tinyint(1) NOT NULL DEFAULT 0,
  `show_shipping_address` enum('yes','no') NOT NULL DEFAULT 'no',
  `estimate_id` int(10) UNSIGNED DEFAULT NULL,
  `send_status` tinyint(1) NOT NULL DEFAULT 1,
  `due_amount` double NOT NULL DEFAULT 0,
  `parent_id` int(10) UNSIGNED DEFAULT NULL,
  `invoice_recurring_id` bigint(20) UNSIGNED DEFAULT NULL,
  `created_by` int(10) UNSIGNED DEFAULT NULL,
  `added_by` int(10) UNSIGNED DEFAULT NULL,
  `last_updated_by` int(10) UNSIGNED DEFAULT NULL,
  `hash` text DEFAULT NULL,
  `calculate_tax` enum('after_discount','before_discount') NOT NULL DEFAULT 'after_discount',
  `company_address_id` bigint(20) UNSIGNED DEFAULT NULL,
  `event_id` text DEFAULT NULL,
  `custom_invoice_number` varchar(191) DEFAULT NULL,
  `payment_status` enum('1','0') NOT NULL DEFAULT '0',
  `offline_method_id` int(10) UNSIGNED DEFAULT NULL,
  `transaction_id` varchar(191) DEFAULT NULL,
  `invoice_payment_id` bigint(20) UNSIGNED DEFAULT NULL,
  `gateway` varchar(191) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `bank_account_id` int(10) UNSIGNED DEFAULT NULL,
  `last_viewed` timestamp NULL DEFAULT NULL,
  `ip_address` varchar(191) DEFAULT NULL,
  `quickbooks_invoice_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `invoice_files`
--

CREATE TABLE `invoice_files` (
  `id` int(10) UNSIGNED NOT NULL,
  `invoice_id` int(10) UNSIGNED NOT NULL,
  `added_by` int(10) UNSIGNED DEFAULT NULL,
  `last_updated_by` int(10) UNSIGNED DEFAULT NULL,
  `filename` varchar(200) DEFAULT NULL,
  `hashname` varchar(200) DEFAULT NULL,
  `size` varchar(200) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `invoice_items`
--

CREATE TABLE `invoice_items` (
  `id` int(10) UNSIGNED NOT NULL,
  `invoice_id` int(10) UNSIGNED NOT NULL,
  `item_name` varchar(191) NOT NULL,
  `item_summary` text DEFAULT NULL,
  `type` enum('item','discount','tax') NOT NULL DEFAULT 'item',
  `quantity` double(16,2) NOT NULL,
  `unit_price` double(16,2) NOT NULL,
  `amount` double(16,2) NOT NULL,
  `taxes` varchar(191) DEFAULT NULL,
  `hsn_sac_code` varchar(191) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `unit_id` bigint(20) UNSIGNED DEFAULT NULL,
  `product_id` int(10) UNSIGNED DEFAULT NULL,
  `field_order` int(11) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `invoice_item_images`
--

CREATE TABLE `invoice_item_images` (
  `id` int(10) UNSIGNED NOT NULL,
  `invoice_item_id` int(10) UNSIGNED NOT NULL,
  `filename` varchar(191) DEFAULT NULL,
  `hashname` varchar(191) DEFAULT NULL,
  `size` varchar(191) DEFAULT NULL,
  `external_link` varchar(191) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `invoice_payment_details`
--

CREATE TABLE `invoice_payment_details` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `company_id` int(10) UNSIGNED DEFAULT NULL,
  `title` varchar(191) NOT NULL,
  `image` varchar(191) DEFAULT NULL,
  `payment_details` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `invoice_recurring`
--

CREATE TABLE `invoice_recurring` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `company_id` int(10) UNSIGNED DEFAULT NULL,
  `currency_id` int(10) UNSIGNED DEFAULT NULL,
  `project_id` int(10) UNSIGNED DEFAULT NULL,
  `client_id` int(10) UNSIGNED DEFAULT NULL,
  `user_id` int(10) UNSIGNED DEFAULT NULL,
  `created_by` int(10) UNSIGNED DEFAULT NULL,
  `issue_date` date NOT NULL,
  `next_invoice_date` date DEFAULT NULL,
  `due_date` date NOT NULL,
  `sub_total` double NOT NULL DEFAULT 0,
  `total` double NOT NULL DEFAULT 0,
  `discount` double NOT NULL DEFAULT 0,
  `discount_type` enum('percent','fixed') NOT NULL DEFAULT 'percent',
  `status` enum('active','inactive') NOT NULL DEFAULT 'active',
  `file` varchar(191) DEFAULT NULL,
  `file_original_name` varchar(191) DEFAULT NULL,
  `note` text DEFAULT NULL,
  `show_shipping_address` enum('yes','no') NOT NULL DEFAULT 'no',
  `day_of_month` int(11) DEFAULT 1,
  `day_of_week` int(11) DEFAULT 1,
  `payment_method` varchar(191) DEFAULT NULL,
  `rotation` enum('monthly','weekly','bi-weekly','quarterly','half-yearly','annually','daily') NOT NULL,
  `billing_cycle` int(11) DEFAULT NULL,
  `client_can_stop` tinyint(1) NOT NULL DEFAULT 1,
  `unlimited_recurring` tinyint(1) NOT NULL DEFAULT 0,
  `deleted_at` datetime DEFAULT NULL,
  `shipping_address` text DEFAULT NULL,
  `added_by` int(10) UNSIGNED DEFAULT NULL,
  `last_updated_by` int(10) UNSIGNED DEFAULT NULL,
  `calculate_tax` enum('after_discount','before_discount') NOT NULL DEFAULT 'after_discount',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `immediate_invoice` tinyint(1) NOT NULL DEFAULT 0,
  `bank_account_id` int(10) UNSIGNED DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `invoice_recurring_items`
--

CREATE TABLE `invoice_recurring_items` (
  `id` int(10) UNSIGNED NOT NULL,
  `invoice_recurring_id` bigint(20) UNSIGNED NOT NULL,
  `item_name` varchar(191) NOT NULL,
  `quantity` double NOT NULL,
  `unit_price` double NOT NULL,
  `amount` double NOT NULL,
  `taxes` text DEFAULT NULL,
  `type` enum('item','discount','tax') NOT NULL DEFAULT 'item',
  `item_summary` text DEFAULT NULL,
  `hsn_sac_code` varchar(191) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `unit_id` bigint(20) UNSIGNED DEFAULT NULL,
  `product_id` int(10) UNSIGNED DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `invoice_recurring_item_images`
--

CREATE TABLE `invoice_recurring_item_images` (
  `id` int(10) UNSIGNED NOT NULL,
  `invoice_recurring_item_id` int(10) UNSIGNED NOT NULL,
  `filename` varchar(191) NOT NULL,
  `hashname` varchar(191) DEFAULT NULL,
  `size` varchar(191) DEFAULT NULL,
  `external_link` varchar(191) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `invoice_settings`
--

CREATE TABLE `invoice_settings` (
  `id` int(10) UNSIGNED NOT NULL,
  `company_id` int(10) UNSIGNED DEFAULT NULL,
  `invoice_prefix` varchar(191) NOT NULL,
  `invoice_number_separator` varchar(191) NOT NULL DEFAULT '#',
  `invoice_digit` int(10) UNSIGNED NOT NULL DEFAULT 3,
  `estimate_prefix` varchar(191) NOT NULL DEFAULT 'EST',
  `estimate_number_separator` varchar(191) NOT NULL DEFAULT '#',
  `estimate_digit` int(10) UNSIGNED NOT NULL DEFAULT 3,
  `credit_note_prefix` varchar(191) NOT NULL DEFAULT 'CN',
  `credit_note_number_separator` varchar(191) NOT NULL DEFAULT '#',
  `credit_note_digit` int(10) UNSIGNED NOT NULL DEFAULT 3,
  `contract_prefix` varchar(191) NOT NULL DEFAULT 'CONT',
  `contract_number_separator` varchar(191) NOT NULL DEFAULT '#',
  `estimate_request_prefix` varchar(191) NOT NULL DEFAULT 'ESTRQ',
  `estimate_request_number_separator` varchar(191) NOT NULL DEFAULT '#',
  `estimate_request_digit` int(11) NOT NULL DEFAULT 3,
  `contract_digit` int(10) UNSIGNED NOT NULL DEFAULT 3,
  `order_prefix` varchar(191) NOT NULL DEFAULT 'ODR',
  `order_number_separator` varchar(191) NOT NULL DEFAULT '#',
  `order_digit` int(10) UNSIGNED NOT NULL DEFAULT 3,
  `proposal_prefix` varchar(191) NOT NULL DEFAULT 'Proposal',
  `proposal_number_separator` varchar(191) NOT NULL DEFAULT '#',
  `proposal_digit` int(11) NOT NULL DEFAULT 3,
  `template` varchar(191) NOT NULL,
  `due_after` int(11) NOT NULL,
  `invoice_terms` text NOT NULL,
  `other_info` text DEFAULT NULL,
  `estimate_terms` text DEFAULT NULL,
  `gst_number` varchar(191) DEFAULT NULL,
  `show_gst` enum('yes','no') DEFAULT 'no',
  `logo` varchar(80) DEFAULT NULL,
  `hsn_sac_code_show` tinyint(1) NOT NULL DEFAULT 0,
  `locale` varchar(191) DEFAULT 'en',
  `send_reminder` int(11) NOT NULL DEFAULT 0,
  `reminder` enum('after','every') DEFAULT NULL,
  `send_reminder_after` int(11) NOT NULL DEFAULT 0,
  `tax_calculation_msg` tinyint(1) NOT NULL DEFAULT 0,
  `show_status` tinyint(1) NOT NULL DEFAULT 1,
  `authorised_signatory` tinyint(1) NOT NULL DEFAULT 0,
  `authorised_signatory_signature` varchar(191) DEFAULT NULL,
  `show_project` int(11) NOT NULL DEFAULT 0,
  `show_client_name` enum('yes','no') DEFAULT 'no',
  `show_client_email` enum('yes','no') DEFAULT 'no',
  `show_client_phone` enum('yes','no') DEFAULT 'no',
  `show_client_company_address` enum('yes','no') DEFAULT 'no',
  `show_client_company_name` enum('yes','no') DEFAULT 'no',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `invoice_settings`
--

INSERT INTO `invoice_settings` (`id`, `company_id`, `invoice_prefix`, `invoice_number_separator`, `invoice_digit`, `estimate_prefix`, `estimate_number_separator`, `estimate_digit`, `credit_note_prefix`, `credit_note_number_separator`, `credit_note_digit`, `contract_prefix`, `contract_number_separator`, `estimate_request_prefix`, `estimate_request_number_separator`, `estimate_request_digit`, `contract_digit`, `order_prefix`, `order_number_separator`, `order_digit`, `proposal_prefix`, `proposal_number_separator`, `proposal_digit`, `template`, `due_after`, `invoice_terms`, `other_info`, `estimate_terms`, `gst_number`, `show_gst`, `logo`, `hsn_sac_code_show`, `locale`, `send_reminder`, `reminder`, `send_reminder_after`, `tax_calculation_msg`, `show_status`, `authorised_signatory`, `authorised_signatory_signature`, `show_project`, `show_client_name`, `show_client_email`, `show_client_phone`, `show_client_company_address`, `show_client_company_name`, `created_at`, `updated_at`) VALUES
(1, 1, 'INV', '#', 3, 'EST', '#', 3, 'CN', '#', 3, 'CONT', '#', 'ESTRQ', '#', 3, 3, 'ODR', '#', 3, 'Proposal', '#', 3, 'invoice-5', 15, 'Thank you for your business.', NULL, NULL, NULL, 'no', NULL, 0, 'en', 0, NULL, 0, 0, 1, 0, NULL, 0, 'yes', 'yes', 'yes', 'yes', 'yes', '2024-12-17 22:23:25', '2024-12-17 22:23:25');

-- --------------------------------------------------------

--
-- Table structure for table `issues`
--

CREATE TABLE `issues` (
  `id` int(10) UNSIGNED NOT NULL,
  `company_id` int(10) UNSIGNED DEFAULT NULL,
  `description` mediumtext NOT NULL,
  `user_id` int(10) UNSIGNED DEFAULT NULL,
  `project_id` int(10) UNSIGNED DEFAULT NULL,
  `status` enum('pending','resolved') NOT NULL DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `jobs`
--

CREATE TABLE `jobs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `queue` varchar(191) NOT NULL,
  `payload` longtext NOT NULL,
  `attempts` tinyint(3) UNSIGNED NOT NULL,
  `reserved_at` int(10) UNSIGNED DEFAULT NULL,
  `available_at` int(10) UNSIGNED NOT NULL,
  `created_at` int(10) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `job_batches`
--

CREATE TABLE `job_batches` (
  `id` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `total_jobs` int(11) NOT NULL,
  `pending_jobs` int(11) NOT NULL,
  `failed_jobs` int(11) NOT NULL,
  `failed_job_ids` text NOT NULL,
  `options` mediumtext DEFAULT NULL,
  `cancelled_at` int(11) DEFAULT NULL,
  `created_at` int(11) NOT NULL,
  `finished_at` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `knowledge_bases`
--

CREATE TABLE `knowledge_bases` (
  `id` int(10) UNSIGNED NOT NULL,
  `company_id` int(10) UNSIGNED DEFAULT NULL,
  `to` varchar(191) NOT NULL DEFAULT 'employee',
  `heading` varchar(191) DEFAULT NULL,
  `category_id` int(10) UNSIGNED DEFAULT NULL,
  `description` mediumtext DEFAULT NULL,
  `added_by` int(10) UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `knowledge_base_files`
--

CREATE TABLE `knowledge_base_files` (
  `id` int(10) UNSIGNED NOT NULL,
  `company_id` int(10) UNSIGNED DEFAULT NULL,
  `knowledge_base_id` int(10) UNSIGNED NOT NULL,
  `filename` varchar(200) DEFAULT NULL,
  `hashname` varchar(200) DEFAULT NULL,
  `size` varchar(200) DEFAULT NULL,
  `external_link_name` varchar(191) DEFAULT NULL,
  `external_link` text DEFAULT NULL,
  `added_by` int(10) UNSIGNED DEFAULT NULL,
  `last_updated_by` int(10) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `knowledge_categories`
--

CREATE TABLE `knowledge_categories` (
  `id` int(10) UNSIGNED NOT NULL,
  `company_id` int(10) UNSIGNED DEFAULT NULL,
  `name` varchar(191) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `language_settings`
--

CREATE TABLE `language_settings` (
  `id` int(10) UNSIGNED NOT NULL,
  `language_code` varchar(191) NOT NULL,
  `language_name` varchar(191) NOT NULL,
  `status` enum('enabled','disabled') NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `flag_code` varchar(191) DEFAULT NULL,
  `is_rtl` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `language_settings`
--

INSERT INTO `language_settings` (`id`, `language_code`, `language_name`, `status`, `created_at`, `updated_at`, `flag_code`, `is_rtl`) VALUES
(1, 'en', 'English', 'enabled', NULL, NULL, 'en', 0),
(2, 'ar', 'Arabic', 'disabled', NULL, NULL, 'sa', 1),
(3, 'bg', 'Bulgarian', 'disabled', NULL, NULL, 'bg', 0),
(4, 'th', 'Thai', 'disabled', NULL, NULL, 'th', 0),
(5, 'sr', 'Serbian', 'disabled', NULL, NULL, 'rs', 0),
(6, 'ka', 'Georgian', 'disabled', NULL, NULL, 'ge', 0),
(7, 'de', 'German', 'disabled', NULL, NULL, 'de', 0),
(8, 'es', 'Spanish', 'disabled', NULL, NULL, 'es', 0),
(9, 'et', 'Estonian', 'disabled', NULL, NULL, 'et', 0),
(10, 'fa', 'Farsi', 'disabled', NULL, NULL, 'ir', 1),
(11, 'fr', 'French', 'disabled', NULL, NULL, 'fr', 0),
(12, 'ja', 'Japanese', 'disabled', NULL, NULL, 'jp', 0),
(13, 'el', 'Greek', 'disabled', NULL, NULL, 'gr', 0),
(14, 'hi', 'Hindi', 'disabled', NULL, NULL, 'in', 0),
(15, 'id', 'Indonesian', 'disabled', NULL, NULL, 'id', 0),
(16, 'it', 'Italian', 'disabled', NULL, NULL, 'it', 0),
(17, 'nl', 'Dutch', 'disabled', NULL, NULL, 'nl', 0),
(18, 'pl', 'Polish', 'disabled', NULL, NULL, 'pl', 0),
(19, 'pt', 'Portuguese', 'disabled', NULL, NULL, 'pt', 0),
(20, 'pt-br', 'Portuguese (Brazil)', 'disabled', NULL, NULL, 'br', 0),
(21, 'ro', 'Romanian', 'disabled', NULL, NULL, 'ro', 0),
(22, 'ru', 'Russian', 'disabled', NULL, NULL, 'ru', 0),
(23, 'tr', 'Turkish', 'disabled', NULL, NULL, 'tr', 0),
(24, 'vi', 'Vietnamese', 'disabled', NULL, NULL, 'vn', 0),
(25, 'zh-CN', 'Chinese (S)', 'disabled', NULL, NULL, 'cn', 0),
(26, 'zh-TW', 'Chinese (T)', 'disabled', NULL, NULL, 'cn', 0),
(27, 'sq', 'Albanian', 'disabled', NULL, NULL, 'al', 0),
(28, 'ko', 'korean', 'disabled', NULL, NULL, 'ko', 0);

-- --------------------------------------------------------

--
-- Table structure for table `leads`
--

CREATE TABLE `leads` (
  `id` int(10) UNSIGNED NOT NULL,
  `company_id` int(10) UNSIGNED DEFAULT NULL,
  `client_id` int(11) DEFAULT NULL,
  `source_id` int(11) DEFAULT NULL,
  `status_id` int(11) DEFAULT NULL,
  `column_priority` int(11) NOT NULL,
  `company_name` varchar(191) DEFAULT NULL,
  `website` varchar(191) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `salutation` enum('mr','mrs','miss','dr','sir','madam') DEFAULT NULL,
  `client_name` varchar(191) NOT NULL,
  `client_email` varchar(191) DEFAULT NULL,
  `mobile` varchar(191) DEFAULT NULL,
  `cell` varchar(191) DEFAULT NULL,
  `office` varchar(191) DEFAULT NULL,
  `city` varchar(191) DEFAULT NULL,
  `state` varchar(191) DEFAULT NULL,
  `country` varchar(191) DEFAULT NULL,
  `postal_code` varchar(191) DEFAULT NULL,
  `note` text DEFAULT NULL,
  `category_id` int(10) UNSIGNED DEFAULT NULL,
  `added_by` int(10) UNSIGNED DEFAULT NULL,
  `lead_owner` int(11) DEFAULT NULL,
  `last_updated_by` int(10) UNSIGNED DEFAULT NULL,
  `hash` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `lead_agents`
--

CREATE TABLE `lead_agents` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `company_id` int(10) UNSIGNED DEFAULT NULL,
  `user_id` int(10) UNSIGNED NOT NULL,
  `lead_category_id` int(10) UNSIGNED DEFAULT NULL,
  `status` enum('enabled','disabled') NOT NULL DEFAULT 'enabled',
  `added_by` int(10) UNSIGNED DEFAULT NULL,
  `last_updated_by` int(10) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `lead_category`
--

CREATE TABLE `lead_category` (
  `id` int(10) UNSIGNED NOT NULL,
  `company_id` int(10) UNSIGNED DEFAULT NULL,
  `category_name` varchar(191) NOT NULL,
  `added_by` int(10) UNSIGNED DEFAULT NULL,
  `last_updated_by` int(10) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `lead_custom_forms`
--

CREATE TABLE `lead_custom_forms` (
  `id` int(10) UNSIGNED NOT NULL,
  `company_id` int(10) UNSIGNED DEFAULT NULL,
  `custom_fields_id` int(10) UNSIGNED DEFAULT NULL,
  `field_display_name` varchar(191) NOT NULL,
  `field_name` varchar(191) NOT NULL,
  `field_order` int(11) NOT NULL,
  `status` enum('active','inactive') NOT NULL DEFAULT 'active',
  `required` tinyint(1) NOT NULL DEFAULT 0,
  `added_by` int(10) UNSIGNED DEFAULT NULL,
  `last_updated_by` int(10) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `lead_custom_forms`
--

INSERT INTO `lead_custom_forms` (`id`, `company_id`, `custom_fields_id`, `field_display_name`, `field_name`, `field_order`, `status`, `required`, `added_by`, `last_updated_by`, `created_at`, `updated_at`) VALUES
(1, 1, NULL, 'Name', 'name', 1, 'active', 1, NULL, NULL, NULL, NULL),
(2, 1, NULL, 'Email', 'email', 2, 'active', 0, NULL, NULL, NULL, NULL),
(3, 1, NULL, 'Company Name', 'company_name', 3, 'active', 0, NULL, NULL, NULL, NULL),
(4, 1, NULL, 'Website', 'website', 4, 'active', 0, NULL, NULL, NULL, NULL),
(5, 1, NULL, 'Address', 'address', 5, 'active', 0, NULL, NULL, NULL, NULL),
(6, 1, NULL, 'Mobile', 'mobile', 6, 'active', 0, NULL, NULL, NULL, NULL),
(7, 1, NULL, 'Message', 'message', 7, 'active', 0, NULL, NULL, NULL, NULL),
(8, 1, NULL, 'City', 'city', 1, 'active', 0, NULL, NULL, NULL, NULL),
(9, 1, NULL, 'State', 'state', 2, 'active', 0, NULL, NULL, NULL, NULL),
(10, 1, NULL, 'Country', 'country', 3, 'active', 0, NULL, NULL, NULL, NULL),
(11, 1, NULL, 'Postal Code', 'postal_code', 4, 'active', 0, NULL, NULL, NULL, NULL),
(12, 1, NULL, 'Source', 'source', 8, 'active', 0, NULL, NULL, NULL, NULL),
(13, 1, NULL, 'Product', 'product', 9, 'active', 0, NULL, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `lead_follow_up`
--

CREATE TABLE `lead_follow_up` (
  `id` int(10) UNSIGNED NOT NULL,
  `deal_id` bigint(20) UNSIGNED DEFAULT NULL,
  `remark` longtext DEFAULT NULL,
  `next_follow_up_date` datetime DEFAULT NULL,
  `added_by` int(10) UNSIGNED DEFAULT NULL,
  `last_updated_by` int(10) UNSIGNED DEFAULT NULL,
  `event_id` text DEFAULT NULL,
  `send_reminder` enum('yes','no') DEFAULT 'no',
  `remind_time` text DEFAULT NULL,
  `remind_type` enum('minute','hour','day') DEFAULT NULL,
  `status` varchar(191) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `lead_notes`
--

CREATE TABLE `lead_notes` (
  `id` int(10) UNSIGNED NOT NULL,
  `lead_id` int(10) UNSIGNED DEFAULT NULL,
  `title` varchar(191) NOT NULL,
  `type` tinyint(1) NOT NULL DEFAULT 0,
  `member_id` int(10) UNSIGNED DEFAULT NULL,
  `is_lead_show` tinyint(1) NOT NULL DEFAULT 0,
  `ask_password` tinyint(1) NOT NULL DEFAULT 0,
  `details` text DEFAULT NULL,
  `added_by` int(10) UNSIGNED DEFAULT NULL,
  `last_updated_by` int(10) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `lead_pipelines`
--

CREATE TABLE `lead_pipelines` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `company_id` int(10) UNSIGNED DEFAULT NULL,
  `name` varchar(191) DEFAULT NULL,
  `slug` varchar(191) DEFAULT NULL,
  `priority` int(11) NOT NULL DEFAULT 0,
  `label_color` varchar(191) NOT NULL DEFAULT '#ff0000',
  `default` tinyint(1) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `added_by` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `lead_pipelines`
--

INSERT INTO `lead_pipelines` (`id`, `company_id`, `name`, `slug`, `priority`, `label_color`, `default`, `created_at`, `updated_at`, `added_by`) VALUES
(1, 1, 'Sales Pipeline', 'sales-pipeline', 1, '#009EFF', 1, '2024-12-17 22:23:26', '2024-12-17 22:23:26', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `lead_pipeline_stages`
--

CREATE TABLE `lead_pipeline_stages` (
  `id` int(10) UNSIGNED NOT NULL,
  `lead_pipeline_id` bigint(20) UNSIGNED DEFAULT NULL,
  `pipeline_stages_id` int(10) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `lead_products`
--

CREATE TABLE `lead_products` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `deal_id` bigint(20) UNSIGNED DEFAULT NULL,
  `product_id` int(10) UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `lead_setting`
--

CREATE TABLE `lead_setting` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `status` tinyint(1) NOT NULL DEFAULT 0,
  `user_id` int(10) UNSIGNED NOT NULL,
  `company_id` int(10) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `ticket_round_robin_status` tinyint(4) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `lead_sources`
--

CREATE TABLE `lead_sources` (
  `id` int(10) UNSIGNED NOT NULL,
  `company_id` int(10) UNSIGNED DEFAULT NULL,
  `type` varchar(191) NOT NULL,
  `added_by` int(10) UNSIGNED DEFAULT NULL,
  `last_updated_by` int(10) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `lead_sources`
--

INSERT INTO `lead_sources` (`id`, `company_id`, `type`, `added_by`, `last_updated_by`, `created_at`, `updated_at`) VALUES
(1, 1, 'Email', NULL, NULL, NULL, NULL),
(2, 1, 'Google', NULL, NULL, NULL, NULL),
(3, 1, 'Facebook', NULL, NULL, NULL, NULL),
(4, 1, 'Friend', NULL, NULL, NULL, NULL),
(5, 1, 'Direct', NULL, NULL, NULL, NULL),
(6, 1, 'Tv', NULL, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `lead_status`
--

CREATE TABLE `lead_status` (
  `id` int(10) UNSIGNED NOT NULL,
  `company_id` int(10) UNSIGNED DEFAULT NULL,
  `type` varchar(191) NOT NULL,
  `priority` int(11) NOT NULL,
  `default` tinyint(1) NOT NULL,
  `label_color` varchar(191) NOT NULL DEFAULT '#ff0000',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `lead_status`
--

INSERT INTO `lead_status` (`id`, `company_id`, `type`, `priority`, `default`, `label_color`, `created_at`, `updated_at`) VALUES
(1, 1, 'pending', 1, 1, '#FFE700', NULL, NULL),
(2, 1, 'in process', 2, 0, '#009EFF', NULL, NULL),
(3, 1, 'done', 3, 0, '#1FAE07', NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `lead_user_notes`
--

CREATE TABLE `lead_user_notes` (
  `id` int(10) UNSIGNED NOT NULL,
  `user_id` int(10) UNSIGNED NOT NULL,
  `lead_note_id` int(10) UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `leaves`
--

CREATE TABLE `leaves` (
  `id` int(10) UNSIGNED NOT NULL,
  `company_id` int(10) UNSIGNED DEFAULT NULL,
  `user_id` int(10) UNSIGNED NOT NULL,
  `leave_type_id` int(10) UNSIGNED NOT NULL,
  `unique_id` varchar(191) DEFAULT NULL,
  `duration` varchar(191) NOT NULL,
  `leave_date` date NOT NULL,
  `reason` text NOT NULL,
  `status` enum('approved','pending','rejected') NOT NULL,
  `reject_reason` text DEFAULT NULL,
  `paid` tinyint(1) NOT NULL DEFAULT 0,
  `added_by` int(10) UNSIGNED DEFAULT NULL,
  `last_updated_by` int(10) UNSIGNED DEFAULT NULL,
  `event_id` text DEFAULT NULL,
  `approved_by` int(10) UNSIGNED DEFAULT NULL,
  `approved_at` datetime DEFAULT NULL,
  `half_day_type` varchar(191) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `manager_status_permission` enum('pre-approve','approved') DEFAULT NULL,
  `approve_reason` text DEFAULT NULL,
  `over_utilized` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `leave_files`
--

CREATE TABLE `leave_files` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `company_id` int(10) UNSIGNED DEFAULT NULL,
  `user_id` int(10) UNSIGNED NOT NULL,
  `leave_id` int(10) UNSIGNED NOT NULL,
  `filename` varchar(191) NOT NULL,
  `hashname` varchar(191) DEFAULT NULL,
  `size` varchar(191) DEFAULT NULL,
  `added_by` int(10) UNSIGNED DEFAULT NULL,
  `last_updated_by` int(10) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `leave_settings`
--

CREATE TABLE `leave_settings` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `company_id` int(10) UNSIGNED DEFAULT NULL,
  `manager_permission` enum('pre-approve','approved','cannot-approve') NOT NULL DEFAULT 'pre-approve',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `leave_settings`
--

INSERT INTO `leave_settings` (`id`, `company_id`, `manager_permission`, `created_at`, `updated_at`) VALUES
(1, 1, 'pre-approve', '2024-12-17 22:23:25', '2024-12-17 22:23:25');

-- --------------------------------------------------------

--
-- Table structure for table `leave_types`
--

CREATE TABLE `leave_types` (
  `id` int(10) UNSIGNED NOT NULL,
  `company_id` int(10) UNSIGNED DEFAULT NULL,
  `type_name` varchar(191) NOT NULL,
  `color` varchar(191) NOT NULL,
  `no_of_leaves` double NOT NULL DEFAULT 5,
  `paid` tinyint(1) NOT NULL DEFAULT 1,
  `monthly_limit` decimal(10,2) NOT NULL DEFAULT 0.00,
  `effective_after` int(11) DEFAULT NULL,
  `effective_type` varchar(191) DEFAULT NULL,
  `unused_leave` varchar(191) DEFAULT NULL,
  `encashed` tinyint(1) NOT NULL,
  `allowed_probation` tinyint(1) NOT NULL,
  `allowed_notice` tinyint(1) NOT NULL,
  `gender` varchar(191) DEFAULT NULL,
  `marital_status` varchar(191) DEFAULT NULL,
  `department` longtext DEFAULT NULL,
  `designation` longtext DEFAULT NULL,
  `role` longtext DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `leavetype` enum('monthly','yearly') DEFAULT NULL,
  `over_utilization` enum('not_allowed','allow_paid','allow_unpaid') NOT NULL DEFAULT 'not_allowed'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `leave_types`
--

INSERT INTO `leave_types` (`id`, `company_id`, `type_name`, `color`, `no_of_leaves`, `paid`, `monthly_limit`, `effective_after`, `effective_type`, `unused_leave`, `encashed`, `allowed_probation`, `allowed_notice`, `gender`, `marital_status`, `department`, `designation`, `role`, `created_at`, `updated_at`, `deleted_at`, `leavetype`, `over_utilization`) VALUES
(1, 1, 'Casual', '#16813D', 5, 1, 0.00, NULL, NULL, 'carry forward', 0, 0, 0, '[\"male\",\"female\",\"others\"]', '[\"single\",\"married\",\"widower\",\"widow\",\"separate\",\"divorced\",\"engaged\"]', NULL, NULL, '[1,2]', '2024-12-17 22:23:25', NULL, NULL, 'yearly', 'not_allowed'),
(2, 1, 'Sick', '#DB1313', 5, 1, 0.00, NULL, NULL, 'carry forward', 0, 0, 0, '[\"male\",\"female\",\"others\"]', '[\"single\",\"married\",\"widower\",\"widow\",\"separate\",\"divorced\",\"engaged\"]', NULL, NULL, '[1,2]', '2024-12-17 22:23:25', NULL, NULL, 'yearly', 'not_allowed'),
(3, 1, 'Earned', '#B078C6', 5, 1, 0.00, NULL, NULL, 'carry forward', 0, 0, 0, '[\"male\",\"female\",\"others\"]', '[\"single\",\"married\",\"widower\",\"widow\",\"separate\",\"divorced\",\"engaged\"]', NULL, NULL, '[1,2]', '2024-12-17 22:23:25', NULL, NULL, 'yearly', 'not_allowed');

-- --------------------------------------------------------

--
-- Table structure for table `log_time_for`
--

CREATE TABLE `log_time_for` (
  `id` int(10) UNSIGNED NOT NULL,
  `company_id` int(10) UNSIGNED DEFAULT NULL,
  `log_time_for` enum('project','task') NOT NULL DEFAULT 'project',
  `auto_timer_stop` enum('yes','no') NOT NULL DEFAULT 'no',
  `approval_required` tinyint(1) NOT NULL,
  `tracker_reminder` tinyint(1) NOT NULL,
  `timelog_report` tinyint(1) NOT NULL,
  `daily_report_roles` varchar(191) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `time` time DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `log_time_for`
--

INSERT INTO `log_time_for` (`id`, `company_id`, `log_time_for`, `auto_timer_stop`, `approval_required`, `tracker_reminder`, `timelog_report`, `daily_report_roles`, `created_at`, `updated_at`, `time`) VALUES
(1, 1, 'project', 'no', 0, 0, 0, NULL, '2024-12-17 22:23:25', '2024-12-17 22:23:25', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `ltm_translations`
--

CREATE TABLE `ltm_translations` (
  `id` int(10) UNSIGNED NOT NULL,
  `status` int(11) NOT NULL DEFAULT 0,
  `locale` varchar(191) NOT NULL,
  `group` varchar(191) NOT NULL,
  `key` varchar(191) NOT NULL,
  `value` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `mention_users`
--

CREATE TABLE `mention_users` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `task_comment_id` int(10) UNSIGNED DEFAULT NULL,
  `task_note_id` int(10) UNSIGNED DEFAULT NULL,
  `task_id` int(10) UNSIGNED DEFAULT NULL,
  `project_id` int(10) UNSIGNED DEFAULT NULL,
  `project_note_id` int(10) UNSIGNED DEFAULT NULL,
  `discussion_id` int(10) UNSIGNED DEFAULT NULL,
  `ticket_id` int(10) UNSIGNED DEFAULT NULL,
  `event_id` int(10) UNSIGNED DEFAULT NULL,
  `user_chat_id` int(10) UNSIGNED DEFAULT NULL,
  `user_id` int(10) UNSIGNED DEFAULT NULL,
  `discussion_reply_id` int(10) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `menus`
--

CREATE TABLE `menus` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `menu_name` varchar(100) NOT NULL,
  `translate_name` varchar(191) DEFAULT NULL,
  `route` varchar(100) DEFAULT NULL,
  `module` varchar(191) DEFAULT NULL,
  `icon` varchar(191) DEFAULT NULL,
  `setting_menu` tinyint(1) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `menu_settings`
--

CREATE TABLE `menu_settings` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `main_menu` longtext DEFAULT NULL,
  `default_main_menu` longtext DEFAULT NULL,
  `setting_menu` longtext DEFAULT NULL,
  `default_setting_menu` longtext DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `message_settings`
--

CREATE TABLE `message_settings` (
  `id` int(10) UNSIGNED NOT NULL,
  `company_id` int(10) UNSIGNED DEFAULT NULL,
  `allow_client_admin` enum('yes','no') NOT NULL DEFAULT 'no',
  `allow_client_employee` enum('yes','no') NOT NULL DEFAULT 'no',
  `restrict_client` enum('yes','no') NOT NULL DEFAULT 'no',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `send_sound_notification` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `message_settings`
--

INSERT INTO `message_settings` (`id`, `company_id`, `allow_client_admin`, `allow_client_employee`, `restrict_client`, `created_at`, `updated_at`, `send_sound_notification`) VALUES
(1, 1, 'no', 'no', 'no', '2024-12-17 22:23:25', '2024-12-17 22:23:25', 0);

-- --------------------------------------------------------

--
-- Table structure for table `migrations`
--

CREATE TABLE `migrations` (
  `id` int(10) UNSIGNED NOT NULL,
  `migration` varchar(191) NOT NULL,
  `batch` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `migrations`
--

INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES
(1, '2018_01_01_000000_create_worksuite_new_table', 1),
(2, '2022_07_04_111754_add_project_short_code_column_project_table', 1),
(3, '2022_07_14_063826_contract_templates', 1),
(4, '2022_07_22_042424_create_proposal_templates_table', 1),
(5, '2022_07_28_043824_add_export_column_custom_fields_table', 1),
(6, '2022_08_03_101616_create_event_files_table', 1),
(7, '2022_08_12_000000_create_other_migration_till_date_table', 1),
(8, '2022_08_13_070443_add_task_unique_id_column_tasks_table', 1),
(9, '2022_08_18_120924_create_task_settings_table', 1),
(10, '2022_08_19_100314_add_leave_widget_in_dashboard_widget_table', 1),
(11, '2022_08_19_115209_create_project_status_settings_table', 1),
(12, '2022_08_22_104028_knowledge_heading_missing', 1),
(13, '2022_08_23_065943_change_status_type_projects_table', 1),
(14, '2022_08_24_122345_add_lead_widget_in_dashboard_widget_table', 1),
(15, '2022_08_25_085025_add_other_location_to_attendances_table', 1),
(16, '2022_08_25_123713_add_work_from_home_widget_in_dashboard_widgets_table', 1),
(17, '2022_08_26_042542_remove_on_delete_cascade_from_invoice_recurring_id_to_invoices', 1),
(18, '2022_08_26_053139_add_parent_id_column_designation_table', 1),
(19, '2022_08_29_064339_add_added_by_to_project_template', 1),
(20, '2022_08_29_103443_add_flag_code_column_to_language_settings', 1),
(21, '2022_09_00_000000_create_company_table', 1),
(22, '2022_09_01_000000_add_company_id_in_all_table', 1),
(23, '2022_09_01_060824_create_appreciations_table', 1),
(24, '2022_09_01_083053_create_global_settings_table', 1),
(25, '2022_09_02_151515_create_flags_table', 1),
(26, '2022_09_05_064405_add_miro_board_column_in_project_table', 1),
(27, '2022_09_07_172743_add_lead_status_column_to_permissions', 1),
(28, '2022_09_13_075642_add_customised_permission_column', 1),
(29, '2022_09_13_075642_create_leave_settings_table', 1),
(30, '2022_09_16_071005_add_headcount_and_joining_vs_attrition_widget_in_dashboard_widget_table', 1),
(31, '2022_09_16_105720_update_permission_of_client_and_employee_document', 1),
(32, '2022_09_19_124014_add_delete_approve_leave_in_permission_table', 1),
(33, '2022_09_20_045836_add_bank_account_module_in_module_table', 1),
(34, '2022_09_23_053942_update_type_of_hsn_sac_code_to_proposal_template_items', 1),
(35, '2022_09_23_181722_add_approve_reason_column_to_leaves_table', 1),
(36, '2022_10_09_155207_add_custom_year_to_companies_table', 1),
(37, '2022_10_31_130459_order_with_order_number', 1),
(38, '2022_11_03_115958_add_auto_clock_in_location_to_attendance_settings_table', 1),
(39, '2022_11_16_122431_add_contract_note_to_contracts_table', 1),
(40, '2022_11_23_070556_show_new_webhook_alert', 1),
(41, '2022_11_25_083742_add_company_id_for_null_values', 1),
(42, '2022_12_01_070705_create_leave_files_table', 1),
(43, '2022_12_05_062331_create_emoji_address_ticket_widget_table', 1),
(44, '2022_12_12_113800_add_wasabi_hash_test_payfast', 1),
(45, '2022_12_13_071454_add_currency_id_in_currency_format_table', 1),
(46, '2022_12_13_112213_add_new_fields_in_employee_details_table', 1),
(47, '2022_12_28_112213_add_new_fields_in_companies_table', 1),
(48, '2022_12_29_061634_add_column_in_invoice_table', 1),
(49, '2022_12_29_084526_create_subscriptions_table', 1),
(50, '2022_12_30_045028_add_number_separator_to_invoice_settings_table', 1),
(51, '2022_12_30_090615_move_google_map_key', 1),
(52, '2023_01_05_084453_add_column_in_log_time_table', 1),
(53, '2023_01_09_162235_create_estimate_templates_table', 1),
(54, '2023_01_20_052539_create_unit_types_table', 1),
(55, '2023_01_23_122023_add_column_in_invoice_recurring_table', 1),
(56, '2023_01_31_072924_add_settings_to_email_notification_settings', 1),
(57, '2023_02_01_085841_add_company_sign_contracts_table', 1),
(58, '2023_02_04_064358_create_lead_products_table', 1),
(59, '2023_02_07_122807_create_quick_books_settings_table', 1),
(60, '2023_02_09_083357_create_passprt_and_visa_table', 1),
(61, '2023_02_13_045833_add_report_column_in_log_time_table', 1),
(62, '2023_02_15_045950_add_unit_id_orders_table', 1),
(63, '2023_02_15_121548_add_data_in_ticket_custom_forms_table', 1),
(64, '2023_02_17_052112_add_permissions_for_lead_report', 1),
(65, '2023_02_27_081104_add_column_in_leave_type_table', 1),
(66, '2023_03_16_105629_add_manage_ticket_group_field_in_permission_table', 1),
(67, '2023_03_17_045842_lead_custom_field', 1),
(68, '2023_03_21_090422_add_order_prefix_in_invoice_settings_table', 1),
(69, '2023_03_21_095340_add_column_in_attendance_setting_table', 1),
(70, '2023_03_23_064221_add_country_phonecode_column_in_users_table', 1),
(71, '2023_03_24_073030_add_payment_columns_in_invoices_table', 1),
(72, '2023_03_24_081626_add_permission_for_sales_report', 1),
(73, '2023_03_29_072032_create_order_carts_table', 1),
(74, '2023_03_29_090137_create_custom_link_settings_table', 1),
(75, '2023_03_31_123237_fix_timelog_project_id', 1),
(76, '2023_04_03_132318_fix_invoice_units', 1),
(77, '2023_04_04_101429_google_calendar_keys_move_to_global_settings', 1),
(78, '2023_04_11_083659_add_bank_column_in_recurring_invoice_table', 1),
(79, '2023_04_11_101429_task_hash_insert_in_task_table', 1),
(80, '2023_04_12_073033_add_contract_setting_permission', 1),
(81, '2023_04_17_085738_add_visible_column_in_custom_fields_table', 1),
(82, '2023_04_18_061829_add_file_column_in_employee_shift_schedules_table', 1),
(83, '2023_04_18_124728_create_mention_users_table', 1),
(84, '2023_04_19_100128_add_auth_theme_text_to_global_settings_table', 1),
(85, '2023_04_27_082330_create_invoice_files_table', 1),
(86, '2023_05_02_100907_fix_bug', 1),
(87, '2023_05_16_083058_add_ids_in_mention_users_table', 1),
(88, '2023_05_16_085400_remove_translations', 1),
(89, '2023_05_16_114755_file_upload_to_s3', 1),
(90, '2023_05_31_052844_add_user_chat_id_in_mention_users_table', 1),
(91, '2023_06_12_094139_fix_file_upload_to_s3', 1),
(92, '2023_06_28_120547_alter_description_column_in_expenses_table', 1),
(93, '2023_07_10_064057_add_shift_assign_notification_setting', 1),
(94, '2023_09_05_111736_employee_can_export_data_tabled', 1),
(95, '2023_09_12_062223_create_ticket_activities_table', 1),
(96, '2023_09_25_055948_add_column_for_number_with_prefix', 1),
(97, '2023_10_12_043341_fix_estimate_item_images_column', 1),
(98, '2023_10_12_125041_fix_greek_language', 1),
(99, '2023_10_25_073702_add_new_language_bg_and_id', 1),
(100, '2023_10_27_071930_repeat_event_parnet_id', 1),
(101, '2023_10_31_102848_add_email_to_global_setting', 1),
(102, '2023_11_08_123050_add_e_invoice_column_to_client_details', 1),
(103, '2023_11_21_112750_add_permissions_for_leave_reports', 1),
(104, '2023_11_23_065925_alter_sign_date_contracts', 1),
(105, '2023_11_27_081917_add_email_verified_setting', 1),
(106, '2023_12_04_113645_add_other_information_to_invoice_settings_table', 1),
(107, '2023_12_05_062223_create_lead_contract_table', 1),
(108, '2023_12_19_091940_change_column_type_in_order_items_table', 1),
(109, '2023_12_19_091940_purchase_on_setting_table', 1),
(110, '2023_12_26_102738_add_project_column_in_orders_table', 1),
(111, '2023_12_29_110515_add_view_project_orders_field_in_permission_table', 1),
(112, '2024_01_11_113519_update_marital_status_enum', 1),
(113, '2024_01_24_105920_add_column_sku_in_order_items_table', 1),
(114, '2024_01_29_052114_lead_changes', 1),
(115, '2024_02_02_082817_add_column_tax_name_in_client_details_table', 1),
(116, '2024_02_02_114946_lead-files_changes_for_deals', 1),
(117, '2024_02_02_213519_update_deal_followup', 1),
(118, '2024_02_04_074746_add_column_host_and_status_in_events_table', 1),
(119, '2024_02_07_213519_update_user_lead_board_setting', 1),
(120, '2024_02_07_213519_update_users_header_ip', 1),
(121, '2024_02_13_094338_add_soft_delete_table_leave_types', 1),
(122, '2024_02_14_094339_employee_leave_quota_changes', 1),
(123, '2024_02_19_062223_create_deal_notes_table', 1),
(124, '2024_03_05_213519_update_users_headers', 1),
(125, '2024_03_07_100454_add_column_in_users_table', 1),
(126, '2024_03_08_091320_create_deal_histories_table', 1),
(127, '2024_03_12_065738_add_columns_fix_to_holidays_table', 1),
(128, '2024_03_18_041113_add_owned_permission_to_edit_delete_sub_tasks_table', 1),
(129, '2024_03_22_104517_create_qrcode_table', 1),
(130, '2024_03_22_125152_add_columns_to_attendance_settings_table', 1),
(131, '2024_03_29_054907_add_webhook_secret_razorpay', 1),
(132, '2024_04_15_112542_add_location_details', 1),
(133, '2024_04_15_112542_password_encrypt', 1),
(134, '2024_04_17_064540_add_add_to_budget_column_in_proj_table', 1),
(135, '2024_04_18_105848_create_employee_activity_table', 1),
(136, '2024_04_22_065735_add_notification_in_notification_settings_table', 1),
(137, '2024_04_23_082735_modify_column_in_deals_table', 1),
(138, '2024_04_29_123208_add_column_type_in_ticket_replies_table', 1),
(139, '2024_04_29_124448_create_ticket_reply_users_table', 1),
(140, '2024_05_03_062538_lead_contact_view_permission_changes_to_all_and_none', 1),
(141, '2024_05_03_102713_update_exchange_rate_in_expenses_table', 1),
(142, '2024_05_06_050805_modify_lead_notes_table', 1),
(143, '2024_05_06_084949_create_employee_leave_quota_histories_table', 1),
(144, '2024_05_16_135801_create_lead_setting_table', 1),
(145, '2024_05_23_050905_modify_shift_schedule_table', 1),
(146, '2024_05_24_054942_add_column_sku_in_products_table', 1),
(147, '2024_05_24_054942_daily-schedule-hide', 1),
(148, '2024_05_30_062721_add_added_by_column_in_lead_pipelines_table', 1),
(149, '2024_05_30_114047_add_rtl_to_language_settings', 1),
(150, '2024_05_31_044253_deal_pipeline_and_manage_deal_stage_permission_remove', 1),
(151, '2024_05_31_120806_remove_duplicate_permission_upsert', 1),
(152, '2024_06_03_062841_add_company_address_id_to_employee_details_table', 1),
(153, '2024_06_04_083820_modify_status_column_in_pending_invoice_table', 1),
(154, '2024_06_04_113803_add_notification_in_notification_setting_table', 1),
(155, '2024_06_05_051512_add_ticket_round_robin_status_to_lead_settings_table', 1),
(156, '2024_06_05_101518_add_half_day_type_to_attendances_table', 1),
(157, '2024_06_06_085555_change_lead_contact_permission_all_added_owned_both_none', 1),
(158, '2024_06_11_063115_create_project_departments_table', 1),
(159, '2024_06_12_105831_project_time_log_null_entries_on_task_soft_delete', 1),
(160, '2024_06_14_105841_add_column_in_leavetype_and_employeeleavequota_table', 1),
(161, '2024_06_19_110315_upfate_default_shift_time', 1),
(162, '2024_06_20_044837_add_column_in_holiday_table', 1),
(163, '2024_06_21_070747_create_estimate_requests_table', 1),
(164, '2024_06_21_093830_add_column_in_projects', 1),
(165, '2024_06_21_113438_create_gantt_links_table', 1),
(166, '2024_06_25_043142_create_shift_rotation_table', 1),
(167, '2024_06_25_044434_create_shift_rotation_sequence_table', 1),
(168, '2024_06_25_044638_update_employeeleavequota_table', 1),
(169, '2024_06_26_105345_create_automate_shifts_table', 1),
(170, '2024_06_27_080827_insert_row_in_taskboard_column', 1),
(171, '2024_07_01_045113_update_phonecode_for_republic_democreatic_congo_kinshasa', 1),
(172, '2024_07_01_115253_add_estimate_request_permission_and_request_number', 1),
(173, '2024_07_01_122207_create_rotation_automate_log', 1),
(174, '2024_07_03_105326_change_holiday_permission_for_employee', 1),
(175, '2024_07_04_125225_add_estimate_request_prefix_to_invoice_settings', 1),
(176, '2024_07_09_083337_add_proposal_prefix_to_invoice_settings', 1),
(177, '2024_07_10_085653_update_currency_exchangerate_and_invoives', 1),
(178, '2024_07_11_103437_create_remove_old_device_user_table', 1),
(179, '2024_07_12_053537_change_datatype_of_approvalsend_column', 1),
(180, '2024_07_22_051342_update_module_setting', 1),
(181, '2024_07_22_114153_add_leave_type_impact_to_employee_leave_quotas_table', 1),
(182, '2024_07_23_052746_create_ticket_settings_for_agents', 1),
(183, '2024_07_26_080201_add_timestamps_to_leave_types_table', 1),
(184, '2024_07_31_115255_update_taskboard_column', 1),
(185, '2024_07_31_12573412_insert_ticket_setting', 1),
(186, '2024_08_01_121908_update_null_leavetype_to_yearly', 1),
(187, '2024_08_08_063009_update_proposal_prefix_issue', 1),
(188, '2024_08_09_081908_add_twitter_id_to_users_table', 1),
(189, '2024_08_12_121751_pending_and_negative_leaves_settlement', 1),
(190, '2024_08_13_050249_add_column_in_event', 1),
(191, '2024_08_13_071923_add_column_to_employee_shift_rotations_table', 1),
(192, '2024_08_22_101139_add_lead_permissions', 1),
(193, '2024_08_27_043137_cleanup_deleted_ticket_data', 1),
(194, '2024_08_27_051140_cleanup_deleted_task_data', 1),
(195, '2024_08_27_093025_add_over_utilization_column_leave_types', 1),
(196, '2024_08_27_124352_fix_leave_paid_status', 1),
(197, '2024_08_28_072957_add_flexible_shift_column', 1),
(198, '2024_09_05_051501_change_title_field_nullabe_to_deal_notes_table', 1),
(199, '2024_09_06_093758_create_promotions_table', 1),
(200, '2024_09_11_060652_fix_flexible_shift_columns', 1),
(201, '2024_09_11_121116_create_table_invoice_payment_details_table', 1),
(202, '2024_09_11_123540_add_column_in_project_templates_task_table', 1),
(203, '2024_09_12_044645_remove_on_delete_cascade_from_created_by_to_tasks', 1),
(204, '2024_09_12_085411_add_invoice_payment_id_to_invoices_table', 1),
(205, '2024_09_13_060425_add_promotion_permission', 1),
(206, '2024_09_13_092310_add_field_order_column_in_order_items_table', 1),
(207, '2024_09_13_114425_create_notice_files_table', 1),
(208, '2024_09_16_093352_add_sign_by_contracts_table', 1),
(209, '2024_09_19_122038_update_expense_exchange_rate_column_value', 1),
(210, '2024_09_23_081839_alter_data_type_of_task_table_columns', 1),
(211, '2024_10_01_055853_change_price_type_of_expense', 1),
(212, '2024_10_04_043201_cleanup_deleted_leaves_data', 1),
(213, '2024_10_15_082340_update_halfday_mark_time_for_day_off_shifts', 1),
(214, '2024_10_18_051921_update_bank_account_type_value', 1),
(215, '2024_10_19_092843_recalculate_leaves', 1),
(216, '2024_10_24_064017_add_followups_widget_in_dashboard_widgets_table', 1),
(217, '2024_10_25_084453_update_attendancesetting_halfday_mark_time_field', 1),
(218, '2024_10_28_090541_update_company_date_format', 1),
(219, '2024_11_04_121543_add_deal_stage_from_id_to_deal_histories', 1),
(220, '2024_11_05_051148_image_offline_payment', 1),
(221, '2024_11_05_051148_update_task_short_code', 1);

-- --------------------------------------------------------

--
-- Table structure for table `modules`
--

CREATE TABLE `modules` (
  `id` int(10) UNSIGNED NOT NULL,
  `module_name` varchar(191) NOT NULL,
  `description` varchar(191) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `modules`
--

INSERT INTO `modules` (`id`, `module_name`, `description`, `created_at`, `updated_at`) VALUES
(1, 'leads', NULL, '2024-12-17 22:22:58', '2024-12-17 22:22:58'),
(2, 'estimates', NULL, '2024-12-17 22:23:10', '2024-12-17 22:23:10'),
(3, 'clients', NULL, '2024-12-17 22:23:19', '2024-12-17 22:23:19'),
(4, 'employees', NULL, '2024-12-17 22:23:19', '2024-12-17 22:23:19'),
(5, 'projects', 'User can view the basic details of projects assigned to him even without any permission.', '2024-12-17 22:23:20', '2024-12-17 22:23:20'),
(6, 'attendance', 'User can view his own attendance even without any permission.', '2024-12-17 22:23:21', '2024-12-17 22:23:21'),
(7, 'tasks', 'User can view the tasks assigned to him even without any permission.', '2024-12-17 22:23:21', '2024-12-17 22:23:21'),
(8, 'invoices', NULL, '2024-12-17 22:23:21', '2024-12-17 22:23:21'),
(9, 'payments', NULL, '2024-12-17 22:23:21', '2024-12-17 22:23:21'),
(10, 'timelogs', NULL, '2024-12-17 22:23:21', '2024-12-17 22:23:21'),
(11, 'tickets', 'User can view the tickets generated by him as default even without any permission.', '2024-12-17 22:23:21', '2024-12-17 22:23:21'),
(12, 'events', 'User can view the events to be attended by him as default even without any permission.', '2024-12-17 22:23:21', '2024-12-17 22:23:21'),
(13, 'notices', NULL, '2024-12-17 22:23:21', '2024-12-17 22:23:21'),
(14, 'leaves', 'User can view the leaves applied by him as default even without any permission.', '2024-12-17 22:23:21', '2024-12-17 22:23:21'),
(15, 'holidays', NULL, '2024-12-17 22:23:21', '2024-12-17 22:23:21'),
(16, 'products', NULL, '2024-12-17 22:23:21', '2024-12-17 22:23:21'),
(17, 'expenses', 'User can view and add(self expenses) the expenses as default even without any permission.', '2024-12-17 22:23:21', '2024-12-17 22:23:21'),
(18, 'contracts', 'User can view all contracts', '2024-12-17 22:23:22', '2024-12-17 22:23:22'),
(19, 'reports', 'User can manage permission of particular report', '2024-12-17 22:23:22', '2024-12-17 22:23:22'),
(20, 'settings', 'User can manage settings', '2024-12-17 22:23:22', '2024-12-17 22:23:22'),
(21, 'dashboards', NULL, '2024-12-17 22:23:22', '2024-12-17 22:23:22'),
(22, 'orders', NULL, '2024-12-17 22:23:22', '2024-12-17 22:23:22'),
(23, 'knowledgebase', NULL, '2024-12-17 22:23:22', '2024-12-17 22:23:22'),
(24, 'bankaccount', NULL, '2024-12-17 22:23:22', '2024-12-17 22:23:22'),
(25, 'messages', NULL, '2024-12-17 22:23:22', '2024-12-17 22:23:22');

-- --------------------------------------------------------

--
-- Table structure for table `module_settings`
--

CREATE TABLE `module_settings` (
  `id` int(10) UNSIGNED NOT NULL,
  `company_id` int(10) UNSIGNED DEFAULT NULL,
  `module_name` varchar(191) NOT NULL,
  `status` enum('active','deactive') NOT NULL,
  `type` enum('admin','employee','client') NOT NULL DEFAULT 'admin',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `module_settings`
--

INSERT INTO `module_settings` (`id`, `company_id`, `module_name`, `status`, `type`, `created_at`, `updated_at`) VALUES
(1, 1, 'projects', 'active', 'admin', NULL, NULL),
(2, 1, 'tickets', 'active', 'admin', NULL, NULL),
(3, 1, 'invoices', 'active', 'admin', NULL, NULL),
(4, 1, 'estimates', 'active', 'admin', NULL, NULL),
(5, 1, 'events', 'active', 'admin', NULL, NULL),
(6, 1, 'messages', 'active', 'admin', NULL, NULL),
(7, 1, 'tasks', 'active', 'admin', NULL, NULL),
(8, 1, 'timelogs', 'active', 'admin', NULL, NULL),
(9, 1, 'contracts', 'active', 'admin', NULL, NULL),
(10, 1, 'notices', 'active', 'admin', NULL, NULL),
(11, 1, 'payments', 'active', 'admin', NULL, NULL),
(12, 1, 'orders', 'active', 'admin', NULL, NULL),
(13, 1, 'knowledgebase', 'active', 'admin', NULL, NULL),
(14, 1, 'clients', 'active', 'admin', NULL, NULL),
(15, 1, 'employees', 'active', 'admin', NULL, NULL),
(16, 1, 'attendance', 'active', 'admin', NULL, NULL),
(17, 1, 'expenses', 'active', 'admin', NULL, NULL),
(18, 1, 'leaves', 'active', 'admin', NULL, NULL),
(19, 1, 'leads', 'active', 'admin', NULL, NULL),
(20, 1, 'holidays', 'active', 'admin', NULL, NULL),
(21, 1, 'products', 'active', 'admin', NULL, NULL),
(22, 1, 'reports', 'active', 'admin', NULL, NULL),
(23, 1, 'settings', 'active', 'admin', NULL, NULL),
(24, 1, 'bankaccount', 'active', 'admin', NULL, NULL),
(25, 1, 'projects', 'active', 'employee', NULL, NULL),
(26, 1, 'tickets', 'active', 'employee', NULL, NULL),
(27, 1, 'invoices', 'active', 'employee', NULL, NULL),
(28, 1, 'estimates', 'active', 'employee', NULL, NULL),
(29, 1, 'events', 'active', 'employee', NULL, NULL),
(30, 1, 'messages', 'active', 'employee', NULL, NULL),
(31, 1, 'tasks', 'active', 'employee', NULL, NULL),
(32, 1, 'timelogs', 'active', 'employee', NULL, NULL),
(33, 1, 'contracts', 'active', 'employee', NULL, NULL),
(34, 1, 'notices', 'active', 'employee', NULL, NULL),
(35, 1, 'payments', 'active', 'employee', NULL, NULL),
(36, 1, 'orders', 'active', 'employee', NULL, NULL),
(37, 1, 'knowledgebase', 'active', 'employee', NULL, NULL),
(38, 1, 'clients', 'active', 'employee', NULL, NULL),
(39, 1, 'employees', 'active', 'employee', NULL, NULL),
(40, 1, 'attendance', 'active', 'employee', NULL, NULL),
(41, 1, 'expenses', 'active', 'employee', NULL, NULL),
(42, 1, 'leaves', 'active', 'employee', NULL, NULL),
(43, 1, 'leads', 'active', 'employee', NULL, NULL),
(44, 1, 'holidays', 'active', 'employee', NULL, NULL),
(45, 1, 'products', 'active', 'employee', NULL, NULL),
(46, 1, 'reports', 'active', 'employee', NULL, NULL),
(47, 1, 'settings', 'active', 'employee', NULL, NULL),
(48, 1, 'bankaccount', 'active', 'employee', NULL, NULL),
(49, 1, 'projects', 'active', 'client', NULL, NULL),
(50, 1, 'tickets', 'active', 'client', NULL, NULL),
(51, 1, 'invoices', 'active', 'client', NULL, NULL),
(52, 1, 'estimates', 'active', 'client', NULL, NULL),
(53, 1, 'events', 'active', 'client', NULL, NULL),
(54, 1, 'messages', 'active', 'client', NULL, NULL),
(55, 1, 'tasks', 'active', 'client', NULL, NULL),
(56, 1, 'timelogs', 'active', 'client', NULL, NULL),
(57, 1, 'contracts', 'active', 'client', NULL, NULL),
(58, 1, 'notices', 'active', 'client', NULL, NULL),
(59, 1, 'payments', 'active', 'client', NULL, NULL),
(60, 1, 'orders', 'active', 'client', NULL, NULL),
(61, 1, 'knowledgebase', 'active', 'client', NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `notices`
--

CREATE TABLE `notices` (
  `id` int(10) UNSIGNED NOT NULL,
  `company_id` int(10) UNSIGNED DEFAULT NULL,
  `to` varchar(191) NOT NULL DEFAULT 'employee',
  `heading` varchar(191) NOT NULL,
  `description` mediumtext DEFAULT NULL,
  `department_id` int(10) UNSIGNED DEFAULT NULL,
  `added_by` int(10) UNSIGNED DEFAULT NULL,
  `last_updated_by` int(10) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `notice_board_users`
--

CREATE TABLE `notice_board_users` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `notice_id` int(10) UNSIGNED NOT NULL,
  `type` enum('employee','client') NOT NULL DEFAULT 'employee',
  `user_id` int(10) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `notice_files`
--

CREATE TABLE `notice_files` (
  `id` int(10) UNSIGNED NOT NULL,
  `notice_id` int(10) UNSIGNED NOT NULL,
  `filename` varchar(191) NOT NULL,
  `description` text DEFAULT NULL,
  `google_url` varchar(191) DEFAULT NULL,
  `hashname` varchar(191) DEFAULT NULL,
  `size` varchar(191) DEFAULT NULL,
  `dropbox_link` varchar(191) DEFAULT NULL,
  `external_link` varchar(191) DEFAULT NULL,
  `external_link_name` varchar(191) DEFAULT NULL,
  `added_by` int(10) UNSIGNED DEFAULT NULL,
  `last_updated_by` int(10) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `notice_views`
--

CREATE TABLE `notice_views` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `company_id` int(10) UNSIGNED DEFAULT NULL,
  `notice_id` int(10) UNSIGNED NOT NULL,
  `user_id` int(10) UNSIGNED NOT NULL,
  `read` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `id` char(36) NOT NULL,
  `type` varchar(191) NOT NULL,
  `notifiable_type` varchar(191) NOT NULL,
  `notifiable_id` bigint(20) UNSIGNED NOT NULL,
  `data` text NOT NULL,
  `read_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `notifications`
--

INSERT INTO `notifications` (`id`, `type`, `notifiable_type`, `notifiable_id`, `data`, `read_at`, `created_at`, `updated_at`) VALUES
('66b57c3d-3f81-4ef7-b705-878f63ee7e2e', 'App\\Notifications\\NewUserSlack', 'App\\Models\\User', 1, '{\"id\":1,\"company_id\":1,\"name\":\"daily janatar bangladesh\",\"email\":\"info@elitedesign.com.bd\",\"two_factor_secret\":null,\"two_factor_recovery_codes\":null,\"two_factor_confirmed\":0,\"two_factor_email_confirmed\":0,\"image\":null,\"country_phonecode\":null,\"mobile\":null,\"gender\":\"male\",\"salutation\":null,\"locale\":\"en\",\"status\":\"active\",\"login\":\"enable\",\"onesignal_player_id\":null,\"last_login\":null,\"email_notifications\":1,\"country_id\":null,\"dark_theme\":0,\"rtl\":0,\"two_fa_verify_via\":null,\"two_factor_code\":null,\"two_factor_expires_at\":null,\"admin_approval\":1,\"permission_sync\":1,\"google_calendar_status\":1,\"customised_permissions\":0,\"stripe_id\":null,\"pm_type\":null,\"pm_last_four\":null,\"trial_ends_at\":null,\"register_ip\":null,\"inactive_date\":null,\"twitter_id\":null,\"image_url\":\"http:\\/\\/localhost\\/public\\/img\\/gravatar.png\",\"modules\":[],\"mobile_with_phonecode\":\"--\",\"name_salutation\":\"daily janatar bangladesh\",\"session\":null}', NULL, '2024-12-17 22:24:12', '2024-12-17 22:24:12');

-- --------------------------------------------------------

--
-- Table structure for table `offline_payment_methods`
--

CREATE TABLE `offline_payment_methods` (
  `id` int(10) UNSIGNED NOT NULL,
  `company_id` int(10) UNSIGNED DEFAULT NULL,
  `name` varchar(191) NOT NULL,
  `image` varchar(191) DEFAULT NULL,
  `description` longtext DEFAULT NULL,
  `status` enum('yes','no') DEFAULT 'yes',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--

CREATE TABLE `orders` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `order_number` varchar(191) DEFAULT NULL,
  `original_order_number` varchar(191) DEFAULT NULL,
  `company_id` int(10) UNSIGNED DEFAULT NULL,
  `client_id` int(10) UNSIGNED DEFAULT NULL,
  `project_id` int(10) UNSIGNED DEFAULT NULL,
  `order_date` date NOT NULL,
  `sub_total` double(8,2) NOT NULL,
  `discount` double NOT NULL DEFAULT 0,
  `discount_type` enum('percent','fixed') NOT NULL DEFAULT 'percent',
  `total` double(8,2) NOT NULL,
  `status` enum('pending','on-hold','failed','processing','completed','canceled','refunded') NOT NULL DEFAULT 'pending',
  `currency_id` int(10) UNSIGNED DEFAULT NULL,
  `show_shipping_address` enum('yes','no') NOT NULL DEFAULT 'no',
  `note` varchar(191) DEFAULT NULL,
  `added_by` int(10) UNSIGNED DEFAULT NULL,
  `last_updated_by` int(10) UNSIGNED DEFAULT NULL,
  `company_address_id` bigint(20) UNSIGNED DEFAULT NULL,
  `custom_order_number` varchar(191) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `order_carts`
--

CREATE TABLE `order_carts` (
  `id` int(10) UNSIGNED NOT NULL,
  `product_id` int(10) UNSIGNED NOT NULL,
  `client_id` int(10) UNSIGNED DEFAULT NULL,
  `item_name` varchar(191) NOT NULL,
  `description` text DEFAULT NULL,
  `type` enum('item','discount','tax') NOT NULL DEFAULT 'item',
  `quantity` double(16,2) NOT NULL,
  `unit_price` double(16,2) NOT NULL,
  `amount` double(16,2) NOT NULL,
  `taxes` varchar(191) DEFAULT NULL,
  `hsn_sac_code` varchar(191) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `unit_id` bigint(20) UNSIGNED DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `order_items`
--

CREATE TABLE `order_items` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `order_id` bigint(20) UNSIGNED NOT NULL,
  `product_id` int(10) UNSIGNED DEFAULT NULL,
  `item_name` varchar(191) NOT NULL,
  `item_summary` text DEFAULT NULL,
  `type` enum('item','discount','tax') NOT NULL DEFAULT 'item',
  `quantity` double(16,2) NOT NULL,
  `unit_price` double NOT NULL,
  `amount` double(8,2) NOT NULL,
  `hsn_sac_code` varchar(191) DEFAULT NULL,
  `taxes` varchar(191) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `unit_id` bigint(20) UNSIGNED DEFAULT NULL,
  `sku` varchar(191) DEFAULT NULL,
  `field_order` int(11) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `order_item_images`
--

CREATE TABLE `order_item_images` (
  `id` int(10) UNSIGNED NOT NULL,
  `order_item_id` bigint(20) UNSIGNED DEFAULT NULL,
  `external_link` varchar(191) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `passport_details`
--

CREATE TABLE `passport_details` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `company_id` int(10) UNSIGNED DEFAULT NULL,
  `user_id` int(10) UNSIGNED DEFAULT NULL,
  `country_id` int(10) UNSIGNED DEFAULT NULL,
  `added_by` int(10) UNSIGNED DEFAULT NULL,
  `passport_number` varchar(191) NOT NULL,
  `issue_date` date NOT NULL,
  `expiry_date` date NOT NULL,
  `file` varchar(191) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `password_resets`
--

CREATE TABLE `password_resets` (
  `email` varchar(191) NOT NULL,
  `token` varchar(191) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `payments`
--

CREATE TABLE `payments` (
  `id` int(10) UNSIGNED NOT NULL,
  `company_id` int(10) UNSIGNED DEFAULT NULL,
  `project_id` int(10) UNSIGNED DEFAULT NULL,
  `invoice_id` int(10) UNSIGNED DEFAULT NULL,
  `order_id` bigint(20) UNSIGNED DEFAULT NULL,
  `credit_notes_id` int(10) UNSIGNED DEFAULT NULL,
  `amount` double NOT NULL,
  `gateway` varchar(191) DEFAULT NULL,
  `transaction_id` varchar(191) DEFAULT NULL,
  `currency_id` int(10) UNSIGNED DEFAULT NULL,
  `default_currency_id` int(10) UNSIGNED DEFAULT NULL,
  `exchange_rate` double DEFAULT NULL,
  `plan_id` varchar(191) DEFAULT NULL,
  `customer_id` varchar(191) DEFAULT NULL,
  `event_id` varchar(191) DEFAULT NULL,
  `status` enum('complete','pending','failed') NOT NULL DEFAULT 'pending',
  `paid_on` datetime DEFAULT NULL,
  `remarks` text DEFAULT NULL,
  `offline_method_id` int(10) UNSIGNED DEFAULT NULL,
  `bill` varchar(191) DEFAULT NULL,
  `added_by` int(10) UNSIGNED DEFAULT NULL,
  `last_updated_by` int(10) UNSIGNED DEFAULT NULL,
  `payment_gateway_response` text DEFAULT NULL COMMENT 'null = success',
  `payload_id` varchar(191) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `bank_account_id` int(10) UNSIGNED DEFAULT NULL,
  `quickbooks_payment_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `payment_gateway_credentials`
--

CREATE TABLE `payment_gateway_credentials` (
  `id` int(10) UNSIGNED NOT NULL,
  `company_id` int(10) UNSIGNED DEFAULT NULL,
  `paypal_client_id` varchar(191) DEFAULT NULL,
  `paypal_secret` varchar(191) DEFAULT NULL,
  `paypal_status` enum('active','deactive') NOT NULL DEFAULT 'deactive',
  `live_stripe_client_id` varchar(191) DEFAULT NULL,
  `live_stripe_secret` text DEFAULT NULL,
  `live_stripe_webhook_secret` varchar(191) DEFAULT NULL,
  `stripe_status` enum('active','deactive') NOT NULL DEFAULT 'deactive',
  `live_razorpay_key` varchar(191) DEFAULT NULL,
  `live_razorpay_secret` text DEFAULT NULL,
  `live_razorpay_webhook_secret` varchar(191) DEFAULT NULL,
  `razorpay_status` enum('active','inactive') NOT NULL DEFAULT 'inactive',
  `paypal_mode` enum('sandbox','live') NOT NULL DEFAULT 'sandbox',
  `sandbox_paypal_client_id` varchar(191) DEFAULT NULL,
  `sandbox_paypal_secret` text DEFAULT NULL,
  `test_stripe_client_id` varchar(191) DEFAULT NULL,
  `test_stripe_secret` text DEFAULT NULL,
  `test_razorpay_key` varchar(191) DEFAULT NULL,
  `test_razorpay_secret` text DEFAULT NULL,
  `test_razorpay_webhook_secret` varchar(191) DEFAULT NULL,
  `test_stripe_webhook_secret` text DEFAULT NULL,
  `stripe_mode` enum('test','live') NOT NULL DEFAULT 'test',
  `razorpay_mode` enum('test','live') NOT NULL DEFAULT 'test',
  `paystack_key` varchar(191) DEFAULT NULL,
  `paystack_secret` text DEFAULT NULL,
  `paystack_merchant_email` varchar(191) DEFAULT NULL,
  `paystack_status` enum('active','deactive') DEFAULT 'deactive',
  `paystack_mode` enum('sandbox','live') NOT NULL DEFAULT 'sandbox',
  `test_paystack_key` varchar(191) DEFAULT NULL,
  `test_paystack_secret` text DEFAULT NULL,
  `test_paystack_merchant_email` varchar(191) DEFAULT NULL,
  `paystack_payment_url` varchar(191) DEFAULT 'https://api.paystack.co',
  `mollie_api_key` text DEFAULT NULL,
  `mollie_status` enum('active','deactive') DEFAULT 'deactive',
  `payfast_merchant_id` varchar(191) DEFAULT NULL,
  `payfast_merchant_key` text DEFAULT NULL,
  `payfast_passphrase` varchar(191) DEFAULT NULL,
  `payfast_mode` enum('sandbox','live') NOT NULL DEFAULT 'sandbox',
  `payfast_status` enum('active','deactive') DEFAULT 'deactive',
  `authorize_api_login_id` varchar(191) DEFAULT NULL,
  `authorize_transaction_key` text DEFAULT NULL,
  `authorize_environment` enum('sandbox','live') NOT NULL DEFAULT 'sandbox',
  `authorize_status` enum('active','deactive') NOT NULL DEFAULT 'deactive',
  `square_application_id` varchar(191) DEFAULT NULL,
  `square_access_token` text DEFAULT NULL,
  `square_location_id` varchar(191) DEFAULT NULL,
  `square_environment` enum('sandbox','production') NOT NULL DEFAULT 'sandbox',
  `square_status` enum('active','deactive') NOT NULL DEFAULT 'deactive',
  `flutterwave_status` enum('active','deactive') NOT NULL DEFAULT 'deactive',
  `flutterwave_mode` enum('sandbox','live') NOT NULL DEFAULT 'sandbox',
  `test_flutterwave_key` varchar(191) DEFAULT NULL,
  `test_flutterwave_secret` text DEFAULT NULL,
  `test_flutterwave_hash` varchar(191) DEFAULT NULL,
  `live_flutterwave_key` text DEFAULT NULL,
  `live_flutterwave_secret` varchar(191) DEFAULT NULL,
  `live_flutterwave_hash` varchar(191) DEFAULT NULL,
  `flutterwave_webhook_secret_hash` varchar(191) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `test_payfast_merchant_id` varchar(191) DEFAULT NULL,
  `test_payfast_merchant_key` text DEFAULT NULL,
  `test_payfast_passphrase` varchar(191) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `payment_gateway_credentials`
--

INSERT INTO `payment_gateway_credentials` (`id`, `company_id`, `paypal_client_id`, `paypal_secret`, `paypal_status`, `live_stripe_client_id`, `live_stripe_secret`, `live_stripe_webhook_secret`, `stripe_status`, `live_razorpay_key`, `live_razorpay_secret`, `live_razorpay_webhook_secret`, `razorpay_status`, `paypal_mode`, `sandbox_paypal_client_id`, `sandbox_paypal_secret`, `test_stripe_client_id`, `test_stripe_secret`, `test_razorpay_key`, `test_razorpay_secret`, `test_razorpay_webhook_secret`, `test_stripe_webhook_secret`, `stripe_mode`, `razorpay_mode`, `paystack_key`, `paystack_secret`, `paystack_merchant_email`, `paystack_status`, `paystack_mode`, `test_paystack_key`, `test_paystack_secret`, `test_paystack_merchant_email`, `paystack_payment_url`, `mollie_api_key`, `mollie_status`, `payfast_merchant_id`, `payfast_merchant_key`, `payfast_passphrase`, `payfast_mode`, `payfast_status`, `authorize_api_login_id`, `authorize_transaction_key`, `authorize_environment`, `authorize_status`, `square_application_id`, `square_access_token`, `square_location_id`, `square_environment`, `square_status`, `flutterwave_status`, `flutterwave_mode`, `test_flutterwave_key`, `test_flutterwave_secret`, `test_flutterwave_hash`, `live_flutterwave_key`, `live_flutterwave_secret`, `live_flutterwave_hash`, `flutterwave_webhook_secret_hash`, `created_at`, `updated_at`, `test_payfast_merchant_id`, `test_payfast_merchant_key`, `test_payfast_passphrase`) VALUES
(1, 1, NULL, NULL, 'deactive', NULL, NULL, NULL, 'deactive', NULL, NULL, NULL, 'inactive', 'sandbox', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'test', 'test', NULL, NULL, NULL, 'deactive', 'sandbox', NULL, NULL, NULL, 'https://api.paystack.co', NULL, 'deactive', NULL, NULL, NULL, 'sandbox', 'deactive', NULL, NULL, 'sandbox', 'deactive', NULL, NULL, NULL, 'sandbox', 'deactive', 'deactive', 'sandbox', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2024-12-17 22:23:25', '2024-12-17 22:23:25', NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `permissions`
--

CREATE TABLE `permissions` (
  `id` int(10) UNSIGNED NOT NULL,
  `name` varchar(191) NOT NULL,
  `display_name` varchar(191) DEFAULT NULL,
  `description` varchar(191) DEFAULT NULL,
  `module_id` int(10) UNSIGNED NOT NULL,
  `is_custom` tinyint(1) NOT NULL DEFAULT 0,
  `allowed_permissions` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `permissions`
--

INSERT INTO `permissions` (`id`, `name`, `display_name`, `description`, `module_id`, `is_custom`, `allowed_permissions`, `created_at`, `updated_at`) VALUES
(1, 'add_deals', 'Add Deals', NULL, 1, 1, '{\"all\":4, \"none\":5}', '2024-12-17 22:22:58', '2024-12-17 22:22:58'),
(2, 'view_deals', 'View Deals', NULL, 1, 1, '{\"all\":4, \"added\":1, \"owned\":2,\"both\":3, \"none\":5}', '2024-12-17 22:22:58', '2024-12-17 22:22:58'),
(3, 'edit_deals', 'Edit Deals', NULL, 1, 1, '{\"all\":4, \"added\":1, \"owned\":2,\"both\":3, \"none\":5}', '2024-12-17 22:22:58', '2024-12-17 22:22:58'),
(4, 'delete_deals', 'Delete Deals', NULL, 1, 1, '{\"all\":4, \"added\":1, \"owned\":2,\"both\":3, \"none\":5}', '2024-12-17 22:22:58', '2024-12-17 22:22:58'),
(6, 'change_deal_stages', 'Change Deal Stages', NULL, 1, 1, '{\"all\":4, \"none\":5}', '2024-12-17 22:22:58', '2024-12-17 22:22:58'),
(11, 'add_deal_note', 'Add Deal Note', NULL, 1, 1, '{\"all\":4, \"added\":1, \"owned\":2,\"both\":3, \"none\":5}', '2024-12-17 22:22:58', '2024-12-17 22:22:58'),
(12, 'view_deal_note', 'View Deal Note', NULL, 1, 1, '{\"all\":4, \"added\":1, \"owned\":2,\"both\":3, \"none\":5}', '2024-12-17 22:22:58', '2024-12-17 22:22:58'),
(13, 'edit_deal_note', 'Edit Deal Note', NULL, 1, 1, '{\"all\":4, \"added\":1, \"owned\":2,\"both\":3, \"none\":5}', '2024-12-17 22:22:58', '2024-12-17 22:22:58'),
(14, 'delete_deal_note', 'Delete Deal Note', NULL, 1, 1, '{\"all\":4, \"added\":1, \"owned\":2,\"both\":3, \"none\":5}', '2024-12-17 22:22:58', '2024-12-17 22:22:58'),
(15, 'add_estimate_request', 'Add Estimate Request', NULL, 2, 1, '{\"all\":4, \"none\":5}', '2024-12-17 22:23:10', '2024-12-17 22:23:10'),
(16, 'view_estimate_request', 'View Estimate Request', NULL, 2, 1, '{\"all\":4, \"added\":1, \"owned\":2,\"both\":3, \"none\":5}', '2024-12-17 22:23:10', '2024-12-17 22:23:10'),
(17, 'edit_estimate_request', 'Edit Estimate Request', NULL, 2, 1, '{\"all\":4, \"added\":1, \"owned\":2,\"both\":3, \"none\":5}', '2024-12-17 22:23:10', '2024-12-17 22:23:10'),
(18, 'delete_estimate_request', 'Delete Estimate Request', NULL, 2, 1, '{\"all\":4, \"added\":1, \"owned\":2,\"both\":3, \"none\":5}', '2024-12-17 22:23:10', '2024-12-17 22:23:10'),
(19, 'reject_estimate_request', 'Reject Estimate Request', NULL, 2, 1, '{\"all\":4, \"none\":5}', '2024-12-17 22:23:10', '2024-12-17 22:23:10'),
(20, 'add_clients', 'Add Clients', NULL, 3, 0, '{\"all\":4, \"none\":5}', '2024-12-17 22:23:19', '2024-12-17 22:23:19'),
(21, 'view_clients', 'View Clients', NULL, 3, 0, '{\"all\":4, \"added\":1, \"none\":5}', '2024-12-17 22:23:19', '2024-12-17 22:23:19'),
(22, 'edit_clients', 'Edit Clients', NULL, 3, 0, '{\"all\":4, \"added\":1, \"none\":5}', '2024-12-17 22:23:19', '2024-12-17 22:23:19'),
(23, 'delete_clients', 'Delete Clients', NULL, 3, 0, '{\"all\":4, \"added\":1, \"none\":5}', '2024-12-17 22:23:19', '2024-12-17 22:23:19'),
(24, 'manage_client_category', 'Manage Client Category', NULL, 3, 1, '{\"all\":4, \"none\":5}', '2024-12-17 22:23:19', '2024-12-17 22:23:19'),
(25, 'manage_client_subcategory', 'Manage Client Subcategory', NULL, 3, 1, '{\"all\":4, \"none\":5}', '2024-12-17 22:23:19', '2024-12-17 22:23:19'),
(26, 'add_client_contacts', 'Add Client Contacts', NULL, 3, 1, '{\"all\":4, \"none\":5}', '2024-12-17 22:23:19', '2024-12-17 22:23:19'),
(27, 'view_client_contacts', 'View Client Contacts', NULL, 3, 1, '{\"all\":4, \"added\":1, \"none\":5}', '2024-12-17 22:23:19', '2024-12-17 22:23:19'),
(28, 'edit_client_contacts', 'Edit Client Contacts', NULL, 3, 1, '{\"all\":4, \"none\":5}', '2024-12-17 22:23:19', '2024-12-17 22:23:19'),
(29, 'delete_client_contacts', 'Delete Client Contacts', NULL, 3, 1, '{\"all\":4, \"none\":5}', '2024-12-17 22:23:19', '2024-12-17 22:23:19'),
(30, 'add_client_note', 'Add Client Note', NULL, 3, 1, '{\"all\":4, \"none\":5}', '2024-12-17 22:23:19', '2024-12-17 22:23:19'),
(31, 'view_client_note', 'View Client Note', NULL, 3, 1, '{\"all\":4, \"added\":1, \"owned\":2,\"both\":3, \"none\":5}', '2024-12-17 22:23:19', '2024-12-17 22:23:19'),
(32, 'edit_client_note', 'Edit Client Note', NULL, 3, 1, '{\"all\":4, \"added\":1, \"owned\":2,\"both\":3, \"none\":5}', '2024-12-17 22:23:19', '2024-12-17 22:23:19'),
(33, 'delete_client_note', 'Delete Client Note', NULL, 3, 1, '{\"all\":4, \"added\":1, \"owned\":2,\"both\":3, \"none\":5}', '2024-12-17 22:23:19', '2024-12-17 22:23:19'),
(34, 'add_client_document', 'Add Client Document', NULL, 3, 1, '{\"all\":4, \"none\":5}', '2024-12-17 22:23:19', '2024-12-17 22:23:19'),
(35, 'view_client_document', 'View Client Document', NULL, 3, 1, '{\"all\":4, \"added\":1, \"owned\":2,\"both\":3, \"none\":5}', '2024-12-17 22:23:19', '2024-12-17 22:23:19'),
(36, 'edit_client_document', 'Edit Client Document', NULL, 3, 1, '{\"all\":4, \"added\":1, \"owned\":2,\"both\":3, \"none\":5}', '2024-12-17 22:23:19', '2024-12-17 22:23:19'),
(37, 'delete_client_document', 'Delete Client Document', NULL, 3, 1, '{\"all\":4, \"added\":1, \"owned\":2,\"both\":3, \"none\":5}', '2024-12-17 22:23:19', '2024-12-17 22:23:19'),
(38, 'add_employees', 'Add Employees', NULL, 4, 0, '{\"all\":4, \"none\":5}', '2024-12-17 22:23:20', '2024-12-17 22:23:20'),
(39, 'view_employees', 'View Employees', NULL, 4, 0, '{\"all\":4, \"added\":1, \"owned\":2,\"both\":3, \"none\":5}', '2024-12-17 22:23:20', '2024-12-17 22:23:20'),
(40, 'edit_employees', 'Edit Employees', NULL, 4, 0, '{\"all\":4, \"added\":1, \"owned\":2,\"both\":3, \"none\":5}', '2024-12-17 22:23:20', '2024-12-17 22:23:20'),
(41, 'delete_employees', 'Delete Employees', NULL, 4, 0, '{\"all\":4, \"added\":1, \"none\":5}', '2024-12-17 22:23:20', '2024-12-17 22:23:20'),
(42, 'add_designation', 'Add Designation', NULL, 4, 1, '{\"all\":4, \"none\":5}', '2024-12-17 22:23:20', '2024-12-17 22:23:20'),
(43, 'view_designation', 'View Designation', NULL, 4, 1, '{\"all\":4, \"none\":5}', '2024-12-17 22:23:20', '2024-12-17 22:23:20'),
(44, 'edit_designation', 'Edit Designation', NULL, 4, 1, '{\"all\":4, \"none\":5}', '2024-12-17 22:23:20', '2024-12-17 22:23:20'),
(45, 'delete_designation', 'Delete Designation', NULL, 4, 1, '{\"all\":4, \"none\":5}', '2024-12-17 22:23:20', '2024-12-17 22:23:20'),
(46, 'add_department', 'Add Department', NULL, 4, 1, '{\"all\":4, \"none\":5}', '2024-12-17 22:23:20', '2024-12-17 22:23:20'),
(47, 'view_department', 'View Department', NULL, 4, 1, '{\"all\":4, \"none\":5}', '2024-12-17 22:23:20', '2024-12-17 22:23:20'),
(48, 'edit_department', 'Edit Department', NULL, 4, 1, '{\"all\":4, \"none\":5}', '2024-12-17 22:23:20', '2024-12-17 22:23:20'),
(49, 'delete_department', 'Delete Department', NULL, 4, 1, '{\"all\":4, \"none\":5}', '2024-12-17 22:23:20', '2024-12-17 22:23:20'),
(50, 'add_documents', 'Add Documents', NULL, 4, 1, '{\"all\":4, \"none\":5}', '2024-12-17 22:23:20', '2024-12-17 22:23:20'),
(51, 'view_documents', 'View Documents', NULL, 4, 1, '{\"all\":4, \"added\":1, \"owned\":2,\"both\":3, \"none\":5}', '2024-12-17 22:23:20', '2024-12-17 22:23:20'),
(52, 'edit_documents', 'Edit Documents', NULL, 4, 1, '{\"all\":4, \"added\":1, \"owned\":2,\"both\":3, \"none\":5}', '2024-12-17 22:23:20', '2024-12-17 22:23:20'),
(53, 'delete_documents', 'Delete Documents', NULL, 4, 1, '{\"all\":4, \"added\":1, \"owned\":2,\"both\":3, \"none\":5}', '2024-12-17 22:23:20', '2024-12-17 22:23:20'),
(54, 'view_leaves_taken', 'View Leaves Taken', NULL, 4, 1, '{\"all\":4, \"none\":5}', '2024-12-17 22:23:20', '2024-12-17 22:23:20'),
(55, 'update_leaves_quota', 'Update Leaves Quota', NULL, 4, 1, '{\"all\":4, \"none\":5}', '2024-12-17 22:23:20', '2024-12-17 22:23:20'),
(56, 'view_employee_tasks', 'View Employee Tasks', NULL, 4, 1, '{\"all\":4, \"none\":5}', '2024-12-17 22:23:20', '2024-12-17 22:23:20'),
(57, 'view_employee_projects', 'View Employee Projects', NULL, 4, 1, '{\"all\":4, \"none\":5}', '2024-12-17 22:23:20', '2024-12-17 22:23:20'),
(58, 'view_employee_timelogs', 'View Employee Timelogs', NULL, 4, 1, '{\"all\":4, \"none\":5}', '2024-12-17 22:23:20', '2024-12-17 22:23:20'),
(59, 'change_employee_role', 'Change Employee Role', NULL, 4, 1, '{\"all\":4, \"none\":5}', '2024-12-17 22:23:20', '2024-12-17 22:23:20'),
(60, 'manage_emergency_contact', 'Manage Emergency Contact', NULL, 4, 1, '{\"all\":4, \"none\":5}', '2024-12-17 22:23:20', '2024-12-17 22:23:20'),
(61, 'manage_award', 'Manage Award', NULL, 4, 1, '{\"all\":4, \"none\":5}', '2024-12-17 22:23:20', '2024-12-17 22:23:20'),
(62, 'add_appreciation', 'Add Appreciation', NULL, 4, 1, '{\"all\":4, \"none\":5}', '2024-12-17 22:23:20', '2024-12-17 22:23:20'),
(63, 'view_appreciation', 'View Appreciation', NULL, 4, 1, '{\"all\":4, \"added\":1, \"owned\":2,\"both\":3, \"none\":5}', '2024-12-17 22:23:20', '2024-12-17 22:23:20'),
(64, 'edit_appreciation', 'Edit Appreciation', NULL, 4, 1, '{\"all\":4, \"added\":1, \"owned\":2,\"both\":3, \"none\":5}', '2024-12-17 22:23:20', '2024-12-17 22:23:20'),
(65, 'delete_appreciation', 'Delete Appreciation', NULL, 4, 1, '{\"all\":4, \"added\":1, \"owned\":2,\"both\":3, \"none\":5}', '2024-12-17 22:23:20', '2024-12-17 22:23:20'),
(66, 'add_immigration', 'Add Immigration', NULL, 4, 1, '{\"all\":4, \"owned\":2, \"none\":5}', '2024-12-17 22:23:20', '2024-12-17 22:23:20'),
(67, 'view_immigration', 'View Immigration', NULL, 4, 1, '{\"all\":4, \"added\":1, \"owned\":2,\"both\":3, \"none\":5}', '2024-12-17 22:23:20', '2024-12-17 22:23:20'),
(68, 'edit_immigration', 'Edit Immigration', NULL, 4, 1, '{\"all\":4, \"added\":1, \"owned\":2,\"both\":3, \"none\":5}', '2024-12-17 22:23:20', '2024-12-17 22:23:20'),
(69, 'delete_immigration', 'Delete Immigration', NULL, 4, 1, '{\"all\":4, \"added\":1, \"owned\":2,\"both\":3, \"none\":5}', '2024-12-17 22:23:20', '2024-12-17 22:23:20'),
(70, 'view_increment_promotion', 'View Increment Promotion', NULL, 4, 1, '{\"all\":4, \"none\":5}', '2024-12-17 22:23:20', '2024-12-17 22:23:20'),
(71, 'manage_increment_promotion', 'Manage Increment Promotion', NULL, 4, 1, '{\"all\":4, \"none\":5}', '2024-12-17 22:23:20', '2024-12-17 22:23:20'),
(72, 'add_projects', 'Add Projects', NULL, 5, 0, '{\"all\":4, \"none\":5}', '2024-12-17 22:23:20', '2024-12-17 22:23:20'),
(73, 'view_projects', 'View Projects', NULL, 5, 0, '{\"all\":4, \"added\":1, \"owned\":2,\"both\":3, \"none\":5}', '2024-12-17 22:23:20', '2024-12-17 22:23:20'),
(74, 'edit_projects', 'Edit Projects', NULL, 5, 0, '{\"all\":4, \"added\":1, \"owned\":2,\"both\":3, \"none\":5}', '2024-12-17 22:23:20', '2024-12-17 22:23:20'),
(75, 'delete_projects', 'Delete Projects', NULL, 5, 0, '{\"all\":4, \"added\":1, \"owned\":2,\"both\":3, \"none\":5}', '2024-12-17 22:23:20', '2024-12-17 22:23:20'),
(76, 'manage_project_category', 'Manage Project Category', NULL, 5, 1, '{\"all\":4, \"none\":5}', '2024-12-17 22:23:20', '2024-12-17 22:23:20'),
(77, 'view_project_files', 'View Project Files', NULL, 5, 1, '{\"all\":4, \"added\":1, \"none\":5}', '2024-12-17 22:23:20', '2024-12-17 22:23:20'),
(78, 'add_project_files', 'Add Project Files', NULL, 5, 1, '{\"all\":4, \"none\":5}', '2024-12-17 22:23:20', '2024-12-17 22:23:20'),
(79, 'delete_project_files', 'Delete Project Files', NULL, 5, 1, '{\"all\":4, \"added\":1, \"none\":5}', '2024-12-17 22:23:20', '2024-12-17 22:23:20'),
(80, 'view_project_discussions', 'View Project Discussions', NULL, 5, 1, '{\"all\":4, \"added\":1, \"none\":5}', '2024-12-17 22:23:20', '2024-12-17 22:23:20'),
(81, 'add_project_discussions', 'Add Project Discussions', NULL, 5, 1, '{\"all\":4, \"none\":5}', '2024-12-17 22:23:20', '2024-12-17 22:23:20'),
(82, 'edit_project_discussions', 'Edit Project Discussions', NULL, 5, 1, '{\"all\":4, \"added\":1, \"none\":5}', '2024-12-17 22:23:20', '2024-12-17 22:23:20'),
(83, 'delete_project_discussions', 'Delete Project Discussions', NULL, 5, 1, '{\"all\":4, \"added\":1, \"none\":5}', '2024-12-17 22:23:20', '2024-12-17 22:23:20'),
(84, 'manage_discussion_category', 'Manage Discussion Category', NULL, 5, 1, '{\"all\":4, \"none\":5}', '2024-12-17 22:23:20', '2024-12-17 22:23:20'),
(85, 'view_project_milestones', 'View Project Milestones', NULL, 5, 1, '{\"all\":4, \"added\":1, \"owned\":2, \"none\":5}', '2024-12-17 22:23:20', '2024-12-17 22:23:20'),
(86, 'add_project_milestones', 'Add Project Milestones', NULL, 5, 1, '{\"all\":4, \"none\":5}', '2024-12-17 22:23:20', '2024-12-17 22:23:20'),
(87, 'edit_project_milestones', 'Edit Project Milestones', NULL, 5, 1, '{\"all\":4, \"added\":1, \"owned\":2, \"none\":5}', '2024-12-17 22:23:20', '2024-12-17 22:23:20'),
(88, 'delete_project_milestones', 'Delete Project Milestones', NULL, 5, 1, '{\"all\":4, \"added\":1, \"owned\":2, \"none\":5}', '2024-12-17 22:23:20', '2024-12-17 22:23:20'),
(89, 'view_project_members', 'View Project Members', NULL, 5, 1, '{\"all\":4, \"none\":5}', '2024-12-17 22:23:20', '2024-12-17 22:23:20'),
(90, 'add_project_members', 'Add Project Members', NULL, 5, 1, '{\"all\":4, \"none\":5}', '2024-12-17 22:23:20', '2024-12-17 22:23:20'),
(91, 'edit_project_members', 'Edit Project Members', NULL, 5, 1, '{\"all\":4, \"none\":5}', '2024-12-17 22:23:20', '2024-12-17 22:23:20'),
(92, 'delete_project_members', 'Delete Project Members', NULL, 5, 1, '{\"all\":4, \"none\":5}', '2024-12-17 22:23:20', '2024-12-17 22:23:20'),
(93, 'view_project_rating', 'View Project Rating', NULL, 5, 1, '{\"all\":4, \"added\":1, \"owned\":2,\"both\":3, \"none\":5}', '2024-12-17 22:23:21', '2024-12-17 22:23:21'),
(94, 'add_project_rating', 'Add Project Rating', NULL, 5, 1, '{\"all\":4, \"none\":5}', '2024-12-17 22:23:21', '2024-12-17 22:23:21'),
(95, 'edit_project_rating', 'Edit Project Rating', NULL, 5, 1, '{\"all\":4, \"added\":1, \"owned\":2,\"both\":3, \"none\":5}', '2024-12-17 22:23:21', '2024-12-17 22:23:21'),
(96, 'delete_project_rating', 'Delete Project Rating', NULL, 5, 1, '{\"all\":4, \"added\":1, \"owned\":2,\"both\":3, \"none\":5}', '2024-12-17 22:23:21', '2024-12-17 22:23:21'),
(97, 'view_project_budget', 'View Project Budget', NULL, 5, 1, '{\"all\":4, \"none\":5}', '2024-12-17 22:23:21', '2024-12-17 22:23:21'),
(98, 'view_project_timelogs', 'View Project Timelogs', NULL, 5, 1, '{\"all\":4, \"none\":5}', '2024-12-17 22:23:21', '2024-12-17 22:23:21'),
(99, 'view_project_expenses', 'View Project Expenses', NULL, 5, 1, '{\"all\":4, \"none\":5}', '2024-12-17 22:23:21', '2024-12-17 22:23:21'),
(100, 'view_project_tasks', 'View Project Tasks', NULL, 5, 1, '{\"all\":4, \"none\":5}', '2024-12-17 22:23:21', '2024-12-17 22:23:21'),
(101, 'view_project_invoices', 'View Project Invoices', NULL, 5, 1, '{\"all\":4, \"none\":5}', '2024-12-17 22:23:21', '2024-12-17 22:23:21'),
(102, 'view_project_burndown_chart', 'View Project Burndown Chart', NULL, 5, 1, '{\"all\":4, \"none\":5}', '2024-12-17 22:23:21', '2024-12-17 22:23:21'),
(103, 'view_project_payments', 'View Project Payments', NULL, 5, 1, '{\"all\":4, \"none\":5}', '2024-12-17 22:23:21', '2024-12-17 22:23:21'),
(104, 'view_project_gantt_chart', 'View Project Gantt Chart', NULL, 5, 1, '{\"all\":4, \"none\":5}', '2024-12-17 22:23:21', '2024-12-17 22:23:21'),
(105, 'add_project_note', 'Add Project Note', NULL, 5, 1, '{\"all\":4, \"none\":5}', '2024-12-17 22:23:21', '2024-12-17 22:23:21'),
(106, 'view_project_note', 'View Project Note', NULL, 5, 1, '{\"all\":4, \"added\":1, \"owned\":2,\"both\":3, \"none\":5}', '2024-12-17 22:23:21', '2024-12-17 22:23:21'),
(107, 'edit_project_note', 'Edit Project Note', NULL, 5, 1, '{\"all\":4, \"added\":1, \"owned\":2,\"both\":3, \"none\":5}', '2024-12-17 22:23:21', '2024-12-17 22:23:21'),
(108, 'delete_project_note', 'Delete Project Note', NULL, 5, 1, '{\"all\":4, \"added\":1, \"owned\":2,\"both\":3, \"none\":5}', '2024-12-17 22:23:21', '2024-12-17 22:23:21'),
(109, 'manage_project_template', 'Manage Project Template', NULL, 5, 1, '{\"all\":4, \"added\":1, \"owned\":2,\"both\":3, \"none\":5}', '2024-12-17 22:23:21', '2024-12-17 22:23:21'),
(110, 'view_project_template', 'View Project Template', NULL, 5, 1, '{\"all\":4, \"none\":5}', '2024-12-17 22:23:21', '2024-12-17 22:23:21'),
(111, 'view_project_hourly_rates', 'View Project Hourly Rates', NULL, 5, 1, '{\"all\":4, \"none\":5}', '2024-12-17 22:23:21', '2024-12-17 22:23:21'),
(112, 'create_public_project', 'Create Public Project', NULL, 5, 1, '{\"all\":4, \"none\":5}', '2024-12-17 22:23:21', '2024-12-17 22:23:21'),
(113, 'view_miroboard', 'View Miroboard', NULL, 5, 1, '{\"all\":4, \"none\":5}', '2024-12-17 22:23:21', '2024-12-17 22:23:21'),
(114, 'manage_employee_shifts', 'Manage Employee Shifts', NULL, 6, 1, '{\"all\":4, \"none\":5}', '2024-12-17 22:23:21', '2024-12-17 22:23:21'),
(115, 'view_shift_roster', 'View Shift Roster', NULL, 6, 1, '{\"all\":4, \"owned\":2, \"none\":5}', '2024-12-17 22:23:21', '2024-12-17 22:23:21'),
(116, 'add_attendance', 'Add Attendance', NULL, 6, 0, '{\"all\":4, \"none\":5}', '2024-12-17 22:23:21', '2024-12-17 22:23:21'),
(117, 'view_attendance', 'View Attendance', NULL, 6, 0, '{\"all\":4, \"added\":1, \"owned\":2,\"both\":3, \"none\":5}', '2024-12-17 22:23:21', '2024-12-17 22:23:21'),
(118, 'edit_attendance', 'Edit Attendance', NULL, 6, 0, '{\"all\":4, \"added\":1, \"owned\":2,\"both\":3, \"none\":5}', '2024-12-17 22:23:21', '2024-12-17 22:23:21'),
(119, 'delete_attendance', 'Delete Attendance', NULL, 6, 0, '{\"all\":4, \"added\":1, \"owned\":2,\"both\":3, \"none\":5}', '2024-12-17 22:23:21', '2024-12-17 22:23:21'),
(120, 'add_tasks', 'Add Tasks', NULL, 7, 0, '{\"all\":4, \"added\":1, \"none\":5}', '2024-12-17 22:23:21', '2024-12-17 22:23:21'),
(121, 'view_tasks', 'View Tasks', NULL, 7, 0, '{\"all\":4, \"added\":1, \"owned\":2,\"both\":3, \"none\":5}', '2024-12-17 22:23:21', '2024-12-17 22:23:21'),
(122, 'edit_tasks', 'Edit Tasks', NULL, 7, 0, '{\"all\":4, \"added\":1, \"owned\":2,\"both\":3, \"none\":5}', '2024-12-17 22:23:21', '2024-12-17 22:23:21'),
(123, 'delete_tasks', 'Delete Tasks', NULL, 7, 0, '{\"all\":4, \"added\":1, \"owned\":2,\"both\":3, \"none\":5}', '2024-12-17 22:23:21', '2024-12-17 22:23:21'),
(124, 'view_task_category', 'View Task Category', NULL, 7, 1, '{\"all\":4, \"added\":1, \"none\":5}', '2024-12-17 22:23:21', '2024-12-17 22:23:21'),
(125, 'add_task_category', 'Add Task Category', NULL, 7, 1, '{\"all\":4, \"none\":5}', '2024-12-17 22:23:21', '2024-12-17 22:23:21'),
(126, 'edit_task_category', 'Edit Task Category', NULL, 7, 1, '{\"all\":4, \"added\":1, \"none\":5}', '2024-12-17 22:23:21', '2024-12-17 22:23:21'),
(127, 'delete_task_category', 'Delete Task Category', NULL, 7, 1, '{\"all\":4, \"added\":1, \"none\":5}', '2024-12-17 22:23:21', '2024-12-17 22:23:21'),
(128, 'view_task_files', 'View Task Files', NULL, 7, 1, '{\"all\":4, \"added\":1, \"none\":5}', '2024-12-17 22:23:21', '2024-12-17 22:23:21'),
(129, 'add_task_files', 'Add Task Files', NULL, 7, 1, '{\"all\":4, \"added\":1, \"owned\":2,\"both\":3, \"none\":5}', '2024-12-17 22:23:21', '2024-12-17 22:23:21'),
(130, 'delete_task_files', 'Delete Task Files', NULL, 7, 1, '{\"all\":4, \"added\":1, \"none\":5}', '2024-12-17 22:23:21', '2024-12-17 22:23:21'),
(131, 'view_sub_tasks', 'View Sub Tasks', NULL, 7, 1, '{\"all\":4, \"added\":1, \"none\":5}', '2024-12-17 22:23:21', '2024-12-17 22:23:21'),
(132, 'add_sub_tasks', 'Add Sub Tasks', NULL, 7, 1, '{\"all\":4, \"added\":1, \"owned\":2,\"both\":3, \"none\":5}', '2024-12-17 22:23:21', '2024-12-17 22:23:21'),
(133, 'edit_sub_tasks', 'Edit Sub Tasks', NULL, 7, 1, '{\"all\":4, \"added\":1, \"none\":5}', '2024-12-17 22:23:21', '2024-12-17 22:23:21'),
(134, 'delete_sub_tasks', 'Delete Sub Tasks', NULL, 7, 1, '{\"all\":4, \"added\":1, \"none\":5}', '2024-12-17 22:23:21', '2024-12-17 22:23:21'),
(135, 'view_task_comments', 'View Task Comments', NULL, 7, 1, '{\"all\":4, \"added\":1, \"none\":5}', '2024-12-17 22:23:21', '2024-12-17 22:23:21'),
(136, 'add_task_comments', 'Add Task Comments', NULL, 7, 1, '{\"all\":4, \"added\":1, \"owned\":2,\"both\":3, \"none\":5}', '2024-12-17 22:23:21', '2024-12-17 22:23:21'),
(137, 'edit_task_comments', 'Edit Task Comments', NULL, 7, 1, '{\"all\":4, \"added\":1, \"owned\":2,\"both\":3, \"none\":5}', '2024-12-17 22:23:21', '2024-12-17 22:23:21'),
(138, 'delete_task_comments', 'Delete Task Comments', NULL, 7, 1, '{\"all\":4, \"added\":1, \"owned\":2,\"both\":3, \"none\":5}', '2024-12-17 22:23:21', '2024-12-17 22:23:21'),
(139, 'view_task_notes', 'View Task Notes', NULL, 7, 1, '{\"all\":4, \"added\":1, \"owned\":2,\"both\":3, \"none\":5}', '2024-12-17 22:23:21', '2024-12-17 22:23:21'),
(140, 'add_task_notes', 'Add Task Notes', NULL, 7, 1, '{\"all\":4, \"added\":1, \"owned\":2,\"both\":3, \"none\":5}', '2024-12-17 22:23:21', '2024-12-17 22:23:21'),
(141, 'edit_task_notes', 'Edit Task Notes', NULL, 7, 1, '{\"all\":4, \"added\":1, \"owned\":2,\"both\":3, \"none\":5}', '2024-12-17 22:23:21', '2024-12-17 22:23:21'),
(142, 'delete_task_notes', 'Delete Task Notes', NULL, 7, 1, '{\"all\":4, \"added\":1, \"owned\":2,\"both\":3, \"none\":5}', '2024-12-17 22:23:21', '2024-12-17 22:23:21'),
(143, 'task_labels', 'Task Labels', NULL, 7, 1, '{\"all\":4, \"none\":5}', '2024-12-17 22:23:21', '2024-12-17 22:23:21'),
(144, 'change_status', 'Change Status', NULL, 7, 1, '{\"all\":4, \"added\":1, \"owned\":2,\"both\":3, \"none\":5}', '2024-12-17 22:23:21', '2024-12-17 22:23:21'),
(145, 'send_reminder', 'Send Reminder', NULL, 7, 1, '{\"all\":4, \"added\":1, \"owned\":2,\"both\":3, \"none\":5}', '2024-12-17 22:23:21', '2024-12-17 22:23:21'),
(146, 'add_status', 'Add Status', NULL, 7, 1, '{\"all\":4, \"none\":5}', '2024-12-17 22:23:21', '2024-12-17 22:23:21'),
(147, 'view_unassigned_tasks', 'View Unassigned Tasks', NULL, 7, 1, '{\"all\":4, \"none\":5}', '2024-12-17 22:23:21', '2024-12-17 22:23:21'),
(148, 'create_unassigned_tasks', 'Create Unassigned Tasks', NULL, 7, 1, '{\"all\":4, \"none\":5}', '2024-12-17 22:23:21', '2024-12-17 22:23:21'),
(149, 'add_estimates', 'Add Estimates', NULL, 2, 0, '{\"all\":4, \"none\":5}', '2024-12-17 22:23:21', '2024-12-17 22:23:21'),
(150, 'view_estimates', 'View Estimates', NULL, 2, 0, '{\"all\":4, \"added\":1, \"owned\":2,\"both\":3, \"none\":5}', '2024-12-17 22:23:21', '2024-12-17 22:23:21'),
(151, 'edit_estimates', 'Edit Estimates', NULL, 2, 0, '{\"all\":4, \"added\":1, \"owned\":2,\"both\":3, \"none\":5}', '2024-12-17 22:23:21', '2024-12-17 22:23:21'),
(152, 'delete_estimates', 'Delete Estimates', NULL, 2, 0, '{\"all\":4, \"added\":1, \"owned\":2,\"both\":3, \"none\":5}', '2024-12-17 22:23:21', '2024-12-17 22:23:21'),
(153, 'add_invoices', 'Add Invoices', NULL, 8, 0, '{\"all\":4, \"none\":5}', '2024-12-17 22:23:21', '2024-12-17 22:23:21'),
(154, 'view_invoices', 'View Invoices', NULL, 8, 0, '{\"all\":4, \"added\":1, \"owned\":2,\"both\":3, \"none\":5}', '2024-12-17 22:23:21', '2024-12-17 22:23:21'),
(155, 'edit_invoices', 'Edit Invoices', NULL, 8, 0, '{\"all\":4, \"added\":1, \"owned\":2,\"both\":3, \"none\":5}', '2024-12-17 22:23:21', '2024-12-17 22:23:21'),
(156, 'delete_invoices', 'Delete Invoices', NULL, 8, 0, '{\"all\":4, \"added\":1, \"owned\":2,\"both\":3, \"none\":5}', '2024-12-17 22:23:21', '2024-12-17 22:23:21'),
(157, 'manage_tax', 'Manage Tax', NULL, 8, 1, '{\"all\":4, \"none\":5}', '2024-12-17 22:23:21', '2024-12-17 22:23:21'),
(158, 'link_invoice_bank_account', 'Link Invoice Bank Account', NULL, 8, 1, '{\"all\":4, \"none\":5}', '2024-12-17 22:23:21', '2024-12-17 22:23:21'),
(159, 'manage_recurring_invoice', 'Manage Recurring Invoice', NULL, 8, 1, '{\"all\":4, \"none\":5}', '2024-12-17 22:23:21', '2024-12-17 22:23:21'),
(160, 'add_payments', 'Add Payments', NULL, 9, 0, '{\"all\":4, \"none\":5}', '2024-12-17 22:23:21', '2024-12-17 22:23:21'),
(161, 'view_payments', 'View Payments', NULL, 9, 0, '{\"all\":4, \"added\":1, \"owned\":2,\"both\":3, \"none\":5}', '2024-12-17 22:23:21', '2024-12-17 22:23:21'),
(162, 'edit_payments', 'Edit Payments', NULL, 9, 0, '{\"all\":4, \"added\":1, \"owned\":2,\"both\":3, \"none\":5}', '2024-12-17 22:23:21', '2024-12-17 22:23:21'),
(163, 'delete_payments', 'Delete Payments', NULL, 9, 0, '{\"all\":4, \"added\":1, \"owned\":2,\"both\":3, \"none\":5}', '2024-12-17 22:23:21', '2024-12-17 22:23:21'),
(164, 'link_payment_bank_account', 'Link Payment Bank Account', NULL, 9, 1, '{\"all\":4, \"none\":5}', '2024-12-17 22:23:21', '2024-12-17 22:23:21'),
(165, 'add_timelogs', 'Add Timelogs', NULL, 10, 0, '{\"all\":4,\"added\":1, \"none\":5}', '2024-12-17 22:23:21', '2024-12-17 22:23:21'),
(166, 'view_timelogs', 'View Timelogs', NULL, 10, 0, '{\"all\":4, \"added\":1, \"owned\":2,\"both\":3, \"none\":5}', '2024-12-17 22:23:21', '2024-12-17 22:23:21'),
(167, 'edit_timelogs', 'Edit Timelogs', NULL, 10, 0, '{\"all\":4, \"added\":1, \"owned\":2,\"both\":3, \"none\":5}', '2024-12-17 22:23:21', '2024-12-17 22:23:21'),
(168, 'delete_timelogs', 'Delete Timelogs', NULL, 10, 0, '{\"all\":4, \"added\":1, \"owned\":2,\"both\":3, \"none\":5}', '2024-12-17 22:23:21', '2024-12-17 22:23:21'),
(169, 'approve_timelogs', 'Approve Timelogs', NULL, 10, 1, '{\"all\":4, \"none\":5}', '2024-12-17 22:23:21', '2024-12-17 22:23:21'),
(170, 'manage_active_timelogs', 'Manage Active Timelogs', NULL, 10, 1, '{\"all\":4, \"none\":5}', '2024-12-17 22:23:21', '2024-12-17 22:23:21'),
(171, 'view_timelog_earnings', 'View Timelog Earnings', NULL, 10, 1, '{\"all\":4, \"none\":5}', '2024-12-17 22:23:21', '2024-12-17 22:23:21'),
(172, 'add_tickets', 'Add Tickets', NULL, 11, 0, '{\"all\":4,\"added\":1, \"none\":5}', '2024-12-17 22:23:21', '2024-12-17 22:23:21'),
(173, 'view_tickets', 'View Tickets', NULL, 11, 0, '{\"all\":4, \"added\":1, \"owned\":2,\"both\":3, \"none\":5}', '2024-12-17 22:23:21', '2024-12-17 22:23:21'),
(174, 'edit_tickets', 'Edit Tickets', NULL, 11, 0, '{\"all\":4, \"added\":1, \"owned\":2,\"both\":3, \"none\":5}', '2024-12-17 22:23:21', '2024-12-17 22:23:21'),
(175, 'delete_tickets', 'Delete Tickets', NULL, 11, 0, '{\"all\":4, \"added\":1, \"owned\":2,\"both\":3, \"none\":5}', '2024-12-17 22:23:21', '2024-12-17 22:23:21'),
(176, 'manage_ticket_type', 'Manage Ticket Type', NULL, 11, 1, '{\"all\":4, \"none\":5}', '2024-12-17 22:23:21', '2024-12-17 22:23:21'),
(177, 'manage_ticket_agent', 'Manage Ticket Agent', NULL, 11, 1, '{\"all\":4, \"added\":1, \"owned\":2,\"both\":3, \"none\":5}', '2024-12-17 22:23:21', '2024-12-17 22:23:21'),
(178, 'manage_ticket_channel', 'Manage Ticket Channel', NULL, 11, 1, '{\"all\":4, \"none\":5}', '2024-12-17 22:23:21', '2024-12-17 22:23:21'),
(179, 'manage_ticket_tags', 'Manage Ticket Tags', NULL, 11, 1, '{\"all\":4, \"none\":5}', '2024-12-17 22:23:21', '2024-12-17 22:23:21'),
(180, 'manage_ticket_groups', 'Manage Ticket Groups', NULL, 11, 1, '{\"all\":4, \"none\":5}', '2024-12-17 22:23:21', '2024-12-17 22:23:21'),
(181, 'add_events', 'Add Events', NULL, 12, 0, '{\"all\":4, \"none\":5}', '2024-12-17 22:23:21', '2024-12-17 22:23:21'),
(182, 'view_events', 'View Events', NULL, 12, 0, '{\"all\":4, \"added\":1, \"owned\":2,\"both\":3, \"none\":5}', '2024-12-17 22:23:21', '2024-12-17 22:23:21'),
(183, 'edit_events', 'Edit Events', NULL, 12, 0, '{\"all\":4, \"added\":1, \"owned\":2,\"both\":3, \"none\":5}', '2024-12-17 22:23:21', '2024-12-17 22:23:21'),
(184, 'delete_events', 'Delete Events', NULL, 12, 0, '{\"all\":4, \"added\":1, \"owned\":2,\"both\":3, \"none\":5}', '2024-12-17 22:23:21', '2024-12-17 22:23:21'),
(185, 'add_notice', 'Add Notice', NULL, 13, 0, '{\"all\":4, \"none\":5}', '2024-12-17 22:23:21', '2024-12-17 22:23:21'),
(186, 'view_notice', 'View Notice', NULL, 13, 0, '{\"all\":4, \"added\":1, \"owned\":2,\"both\":3, \"none\":5}', '2024-12-17 22:23:21', '2024-12-17 22:23:21'),
(187, 'edit_notice', 'Edit Notice', NULL, 13, 0, '{\"all\":4, \"added\":1, \"owned\":2,\"both\":3, \"none\":5}', '2024-12-17 22:23:21', '2024-12-17 22:23:21'),
(188, 'delete_notice', 'Delete Notice', NULL, 13, 0, '{\"all\":4, \"added\":1, \"owned\":2,\"both\":3, \"none\":5}', '2024-12-17 22:23:21', '2024-12-17 22:23:21'),
(189, 'add_leave', 'Add Leave', NULL, 14, 0, '{\"all\":4, \"added\":1, \"none\":5}', '2024-12-17 22:23:21', '2024-12-17 22:23:21'),
(190, 'view_leave', 'View Leave', NULL, 14, 0, '{\"all\":4, \"added\":1, \"owned\":2,\"both\":3, \"none\":5}', '2024-12-17 22:23:21', '2024-12-17 22:23:21'),
(191, 'edit_leave', 'Edit Leave', NULL, 14, 0, '{\"all\":4, \"added\":1, \"owned\":2,\"both\":3, \"none\":5}', '2024-12-17 22:23:21', '2024-12-17 22:23:21'),
(192, 'delete_leave', 'Delete Leave', NULL, 14, 0, '{\"all\":4, \"added\":1, \"owned\":2,\"both\":3, \"none\":5}', '2024-12-17 22:23:21', '2024-12-17 22:23:21'),
(193, 'approve_or_reject_leaves', 'Approve Or Reject Leaves', NULL, 14, 1, '{\"all\":4, \"none\":5}', '2024-12-17 22:23:21', '2024-12-17 22:23:21'),
(194, 'delete_approve_leaves', 'Delete Approve Leaves', NULL, 14, 1, '{\"all\":4, \"none\":5}', '2024-12-17 22:23:21', '2024-12-17 22:23:21'),
(195, 'add_lead', 'Add Lead', NULL, 1, 0, '{\"all\":4, \"added\":1, \"none\":5}', '2024-12-17 22:23:21', '2024-12-17 22:23:21'),
(196, 'view_lead', 'View Lead', NULL, 1, 0, '{\"all\":4, \"added\":1, \"owned\":2,\"both\":3, \"none\":5}', '2024-12-17 22:23:21', '2024-12-17 22:23:21'),
(197, 'edit_lead', 'Edit Lead', NULL, 1, 0, '{\"all\":4, \"added\":1, \"owned\":2,\"both\":3, \"none\":5}', '2024-12-17 22:23:21', '2024-12-17 22:23:21'),
(198, 'delete_lead', 'Delete Lead', NULL, 1, 0, '{\"all\":4, \"added\":1, \"owned\":2,\"both\":3, \"none\":5}', '2024-12-17 22:23:21', '2024-12-17 22:23:21'),
(199, 'manage_lead_custom_forms', 'Manage Lead Custom Forms', NULL, 1, 1, '{\"all\":4, \"none\":5}', '2024-12-17 22:23:21', '2024-12-17 22:23:21'),
(200, 'view_lead_sources', 'View Lead Sources', NULL, 1, 1, '{\"all\":4, \"added\":1, \"none\":5}', '2024-12-17 22:23:21', '2024-12-17 22:23:21'),
(201, 'add_lead_sources', 'Add Lead Sources', NULL, 1, 1, '{\"all\":4, \"none\":5}', '2024-12-17 22:23:21', '2024-12-17 22:23:21'),
(202, 'edit_lead_sources', 'Edit Lead Sources', NULL, 1, 1, '{\"all\":4, \"added\":1, \"none\":5}', '2024-12-17 22:23:21', '2024-12-17 22:23:21'),
(203, 'delete_lead_sources', 'Delete Lead Sources', NULL, 1, 1, '{\"all\":4, \"added\":1, \"none\":5}', '2024-12-17 22:23:21', '2024-12-17 22:23:21'),
(204, 'add_lead_note', 'Add Lead Note', NULL, 1, 1, '{\"all\":4, \"none\":5}', '2024-12-17 22:23:21', '2024-12-17 22:23:21'),
(205, 'view_lead_note', 'View Lead Note', NULL, 1, 1, '{\"all\":4, \"added\":1, \"owned\":2,\"both\":3, \"none\":5}', '2024-12-17 22:23:21', '2024-12-17 22:23:21'),
(206, 'edit_lead_note', 'Edit Lead Note', NULL, 1, 1, '{\"all\":4, \"added\":1, \"owned\":2,\"both\":3, \"none\":5}', '2024-12-17 22:23:21', '2024-12-17 22:23:21'),
(207, 'delete_lead_note', 'Delete Lead Note', NULL, 1, 1, '{\"all\":4, \"added\":1, \"owned\":2,\"both\":3, \"none\":5}', '2024-12-17 22:23:21', '2024-12-17 22:23:21'),
(208, 'view_lead_category', 'View Lead Category', NULL, 1, 1, '{\"all\":4, \"added\":1, \"owned\":2,\"both\":3, \"none\":5}', '2024-12-17 22:23:21', '2024-12-17 22:23:21'),
(209, 'add_lead_category', 'Add Lead Category', NULL, 1, 1, '{\"all\":4, \"none\":5}', '2024-12-17 22:23:21', '2024-12-17 22:23:21'),
(210, 'edit_lead_category', 'Edit Lead Category', NULL, 1, 1, '{\"all\":4, \"none\":5}', '2024-12-17 22:23:21', '2024-12-17 22:23:21'),
(211, 'delete_lead_category', 'Delete Lead Category', NULL, 1, 1, '{\"all\":4, \"none\":5}', '2024-12-17 22:23:21', '2024-12-17 22:23:21'),
(212, 'manage_deal_stages', 'Manage Deal Stages', NULL, 1, 1, '{\"all\":4, \"none\":5}', '2024-12-17 22:23:21', '2024-12-17 22:23:21'),
(213, 'view_lead_agents', 'View Lead Agents', NULL, 1, 1, '{\"all\":4, \"added\":1, \"owned\":2,\"both\":3, \"none\":5}', '2024-12-17 22:23:21', '2024-12-17 22:23:21'),
(214, 'add_lead_agent', 'Add Lead Agent', NULL, 1, 1, '{\"all\":4, \"none\":5}', '2024-12-17 22:23:21', '2024-12-17 22:23:21'),
(215, 'edit_lead_agent', 'Edit Lead Agent', NULL, 1, 1, '{\"all\":4, \"added\":1, \"owned\":2,\"both\":3, \"none\":5}', '2024-12-17 22:23:21', '2024-12-17 22:23:21'),
(216, 'delete_lead_agent', 'Delete Lead Agent', NULL, 1, 1, '{\"all\":4, \"added\":1, \"owned\":2,\"both\":3, \"none\":5}', '2024-12-17 22:23:21', '2024-12-17 22:23:21'),
(217, 'view_lead_files', 'View Lead Files', NULL, 1, 1, '{\"all\":4, \"added\":1, \"none\":5}', '2024-12-17 22:23:21', '2024-12-17 22:23:21'),
(218, 'add_lead_files', 'Add Lead Files', NULL, 1, 1, '{\"all\":4, \"none\":5}', '2024-12-17 22:23:21', '2024-12-17 22:23:21'),
(219, 'delete_lead_files', 'Delete Lead Files', NULL, 1, 1, '{\"all\":4, \"added\":1, \"none\":5}', '2024-12-17 22:23:21', '2024-12-17 22:23:21'),
(220, 'view_lead_follow_up', 'View Lead Follow Up', NULL, 1, 1, '{\"all\":4, \"added\":1, \"none\":5}', '2024-12-17 22:23:21', '2024-12-17 22:23:21'),
(221, 'add_lead_follow_up', 'Add Lead Follow Up', NULL, 1, 1, '{\"all\":4, \"none\":5}', '2024-12-17 22:23:21', '2024-12-17 22:23:21'),
(222, 'edit_lead_follow_up', 'Edit Lead Follow Up', NULL, 1, 1, '{\"all\":4, \"added\":1, \"none\":5}', '2024-12-17 22:23:21', '2024-12-17 22:23:21'),
(223, 'delete_lead_follow_up', 'Delete Lead Follow Up', NULL, 1, 1, '{\"all\":4, \"added\":1, \"none\":5}', '2024-12-17 22:23:21', '2024-12-17 22:23:21'),
(224, 'view_lead_proposals', 'View Lead Proposals', NULL, 1, 1, '{\"all\":4, \"added\":1, \"none\":5}', '2024-12-17 22:23:21', '2024-12-17 22:23:21'),
(225, 'add_lead_proposals', 'Add Lead Proposals', NULL, 1, 1, '{\"all\":4, \"none\":5}', '2024-12-17 22:23:21', '2024-12-17 22:23:21'),
(226, 'edit_lead_proposals', 'Edit Lead Proposals', NULL, 1, 1, '{\"all\":4, \"added\":1, \"none\":5}', '2024-12-17 22:23:21', '2024-12-17 22:23:21'),
(227, 'delete_lead_proposals', 'Delete Lead Proposals', NULL, 1, 1, '{\"all\":4, \"added\":1, \"none\":5}', '2024-12-17 22:23:21', '2024-12-17 22:23:21'),
(228, 'manage_proposal_template', 'Manage Proposal Template', NULL, 1, 1, '{\"all\":4, \"added\":1, \"none\":5}', '2024-12-17 22:23:21', '2024-12-17 22:23:21'),
(229, 'add_deal_pipeline', 'Add Deal Pipeline', NULL, 1, 1, '{\"all\":4, \"added\":1, \"owned\":2,\"both\":3, \"none\":5}', '2024-12-17 22:23:21', '2024-12-17 22:23:21'),
(230, 'view_deal_pipeline', 'View Deal Pipeline', NULL, 1, 1, '{\"all\":4, \"added\":1, \"owned\":2,\"both\":3, \"none\":5}', '2024-12-17 22:23:21', '2024-12-17 22:23:21'),
(231, 'edit_deal_pipeline', 'Edit Deal Pipeline', NULL, 1, 1, '{\"all\":4, \"added\":1, \"owned\":2,\"both\":3, \"none\":5}', '2024-12-17 22:23:21', '2024-12-17 22:23:21'),
(232, 'delete_deal_pipeline', 'Delete Deal Pipeline', NULL, 1, 1, '{\"all\":4, \"added\":1, \"owned\":2,\"both\":3, \"none\":5}', '2024-12-17 22:23:21', '2024-12-17 22:23:21'),
(233, 'add_holiday', 'Add Holiday', NULL, 15, 0, '{\"all\":4, \"none\":5}', '2024-12-17 22:23:21', '2024-12-17 22:23:21'),
(234, 'view_holiday', 'View Holiday', NULL, 15, 0, '{\"all\":4, \"added\":1, \"owned\":2,\"both\":3, \"none\":5}', '2024-12-17 22:23:21', '2024-12-17 22:23:21'),
(235, 'edit_holiday', 'Edit Holiday', NULL, 15, 0, '{\"all\":4, \"added\":1, \"owned\":2,\"both\":3, \"none\":5}', '2024-12-17 22:23:21', '2024-12-17 22:23:21'),
(236, 'delete_holiday', 'Delete Holiday', NULL, 15, 0, '{\"all\":4, \"added\":1, \"owned\":2,\"both\":3, \"none\":5}', '2024-12-17 22:23:21', '2024-12-17 22:23:21'),
(237, 'add_product', 'Add Product', NULL, 16, 0, '{\"all\":4, \"none\":5}', '2024-12-17 22:23:21', '2024-12-17 22:23:21'),
(238, 'view_product', 'View Product', NULL, 16, 0, '{\"all\":4, \"added\":1, \"none\":5}', '2024-12-17 22:23:21', '2024-12-17 22:23:21'),
(239, 'edit_product', 'Edit Product', NULL, 16, 0, '{\"all\":4, \"added\":1, \"none\":5}', '2024-12-17 22:23:21', '2024-12-17 22:23:21'),
(240, 'delete_product', 'Delete Product', NULL, 16, 0, '{\"all\":4, \"added\":1, \"none\":5}', '2024-12-17 22:23:21', '2024-12-17 22:23:21'),
(241, 'manage_product_category', 'Manage Product Category', NULL, 16, 1, '{\"all\":4, \"none\":5}', '2024-12-17 22:23:21', '2024-12-17 22:23:21'),
(242, 'manage_product_sub_category', 'Manage Product Sub Category', NULL, 16, 1, '{\"all\":4, \"none\":5}', '2024-12-17 22:23:21', '2024-12-17 22:23:21'),
(243, 'add_expenses', 'Add Expenses', NULL, 17, 0, '{\"all\":4, \"added\":1, \"none\":5}', '2024-12-17 22:23:21', '2024-12-17 22:23:21'),
(244, 'view_expenses', 'View Expenses', NULL, 17, 0, '{\"all\":4, \"added\":1, \"owned\":2,\"both\":3, \"none\":5}', '2024-12-17 22:23:21', '2024-12-17 22:23:21'),
(245, 'edit_expenses', 'Edit Expenses', NULL, 17, 0, '{\"all\":4, \"added\":1, \"owned\":2,\"both\":3, \"none\":5}', '2024-12-17 22:23:21', '2024-12-17 22:23:21'),
(246, 'delete_expenses', 'Delete Expenses', NULL, 17, 0, '{\"all\":4, \"added\":1, \"owned\":2,\"both\":3, \"none\":5}', '2024-12-17 22:23:21', '2024-12-17 22:23:21'),
(247, 'manage_expense_category', 'Manage Expense Category', NULL, 17, 1, '{\"all\":4, \"none\":5}', '2024-12-17 22:23:21', '2024-12-17 22:23:21'),
(248, 'manage_recurring_expense', 'Manage Recurring Expense', NULL, 17, 1, '{\"all\":4, \"none\":5}', '2024-12-17 22:23:21', '2024-12-17 22:23:21'),
(249, 'approve_expenses', 'Approve Expenses', NULL, 17, 1, '{\"all\":4, \"added\":1, \"owned\":2,\"both\":3, \"none\":5}', '2024-12-17 22:23:21', '2024-12-17 22:23:21'),
(250, 'link_expense_bank_account', 'Link Expense Bank Account', NULL, 17, 1, '{\"all\":4, \"none\":5}', '2024-12-17 22:23:22', '2024-12-17 22:23:22'),
(251, 'add_contract', 'Add Contract', NULL, 18, 0, '{\"all\":4, \"none\":5}', '2024-12-17 22:23:22', '2024-12-17 22:23:22'),
(252, 'view_contract', 'View Contract', NULL, 18, 0, '{\"all\":4, \"added\":1, \"owned\":2,\"both\":3, \"none\":5}', '2024-12-17 22:23:22', '2024-12-17 22:23:22'),
(253, 'edit_contract', 'Edit Contract', NULL, 18, 0, '{\"all\":4, \"added\":1, \"owned\":2,\"both\":3, \"none\":5}', '2024-12-17 22:23:22', '2024-12-17 22:23:22'),
(254, 'delete_contract', 'Delete Contract', NULL, 18, 0, '{\"all\":4, \"added\":1, \"owned\":2,\"both\":3, \"none\":5}', '2024-12-17 22:23:22', '2024-12-17 22:23:22'),
(255, 'manage_contract_type', 'Manage Contract Type', NULL, 18, 1, '{\"all\":4, \"none\":5}', '2024-12-17 22:23:22', '2024-12-17 22:23:22'),
(256, 'renew_contract', 'Renew Contract', NULL, 18, 1, '{\"all\":4, \"added\":1, \"owned\":2,\"both\":3, \"none\":5}', '2024-12-17 22:23:22', '2024-12-17 22:23:22'),
(257, 'add_contract_discussion', 'Add Contract Discussion', NULL, 18, 1, '{\"all\":4, \"none\":5}', '2024-12-17 22:23:22', '2024-12-17 22:23:22'),
(258, 'edit_contract_discussion', 'Edit Contract Discussion', NULL, 18, 1, '{\"all\":4, \"added\":1, \"none\":5}', '2024-12-17 22:23:22', '2024-12-17 22:23:22'),
(259, 'view_contract_discussion', 'View Contract Discussion', NULL, 18, 1, '{\"all\":4, \"added\":1, \"none\":5}', '2024-12-17 22:23:22', '2024-12-17 22:23:22'),
(260, 'delete_contract_discussion', 'Delete Contract Discussion', NULL, 18, 1, '{\"all\":4, \"added\":1, \"none\":5}', '2024-12-17 22:23:22', '2024-12-17 22:23:22'),
(261, 'add_contract_files', 'Add Contract Files', NULL, 18, 1, '{\"all\":4, \"none\":5}', '2024-12-17 22:23:22', '2024-12-17 22:23:22'),
(262, 'view_contract_files', 'View Contract Files', NULL, 18, 1, '{\"all\":4, \"added\":1, \"none\":5}', '2024-12-17 22:23:22', '2024-12-17 22:23:22'),
(263, 'delete_contract_files', 'Delete Contract Files', NULL, 18, 1, '{\"all\":4, \"added\":1, \"none\":5}', '2024-12-17 22:23:22', '2024-12-17 22:23:22'),
(264, 'manage_contract_template', 'Manage Contract Template', NULL, 18, 1, '{\"all\":4, \"added\":1, \"none\":5}', '2024-12-17 22:23:22', '2024-12-17 22:23:22'),
(265, 'view_task_report', 'View Task Report', NULL, 19, 1, '{\"all\":4, \"none\":5}', '2024-12-17 22:23:22', '2024-12-17 22:23:22'),
(266, 'view_time_log_report', 'View Time Log Report', NULL, 19, 1, '{\"all\":4, \"none\":5}', '2024-12-17 22:23:22', '2024-12-17 22:23:22'),
(267, 'view_finance_report', 'View Finance Report', NULL, 19, 1, '{\"all\":4, \"added\":1, \"owned\":2,\"both\":3, \"none\":5}', '2024-12-17 22:23:22', '2024-12-17 22:23:22'),
(268, 'view_income_expense_report', 'View Income Vs Expense Report', NULL, 19, 1, '{\"all\":4, \"none\":5}', '2024-12-17 22:23:22', '2024-12-17 22:23:22'),
(269, 'view_leave_report', 'View Leave Report', NULL, 19, 1, '{\"all\":4, \"none\":5}', '2024-12-17 22:23:22', '2024-12-17 22:23:22'),
(270, 'view_attendance_report', 'View Attendance Report', NULL, 19, 1, '{\"all\":4, \"none\":5}', '2024-12-17 22:23:22', '2024-12-17 22:23:22'),
(271, 'view_expense_report', 'View Expense Report', NULL, 19, 1, '{\"all\":4, \"none\":5}', '2024-12-17 22:23:22', '2024-12-17 22:23:22'),
(272, 'view_lead_report', 'View Lead Report', NULL, 19, 1, '{\"all\":4, \"none\":5}', '2024-12-17 22:23:22', '2024-12-17 22:23:22'),
(273, 'view_sales_report', 'View Sales Report', NULL, 19, 1, '{\"all\":4, \"none\":5}', '2024-12-17 22:23:22', '2024-12-17 22:23:22'),
(274, 'manage_company_setting', 'Manage Company Setting', NULL, 20, 1, '{\"all\":4, \"none\":5}', '2024-12-17 22:23:22', '2024-12-17 22:23:22'),
(275, 'manage_app_setting', 'Manage App Setting', NULL, 20, 1, '{\"all\":4, \"none\":5}', '2024-12-17 22:23:22', '2024-12-17 22:23:22'),
(276, 'manage_notification_setting', 'Manage Notification Setting', NULL, 20, 1, '{\"all\":4, \"none\":5}', '2024-12-17 22:23:22', '2024-12-17 22:23:22'),
(277, 'manage_currency_setting', 'Manage Currency Setting', NULL, 20, 1, '{\"all\":4, \"none\":5}', '2024-12-17 22:23:22', '2024-12-17 22:23:22'),
(278, 'manage_payment_setting', 'Manage Payment Setting', NULL, 20, 1, '{\"all\":4, \"none\":5}', '2024-12-17 22:23:22', '2024-12-17 22:23:22'),
(279, 'manage_finance_setting', 'Manage Finance Setting', NULL, 20, 1, '{\"all\":4, \"none\":5}', '2024-12-17 22:23:22', '2024-12-17 22:23:22'),
(280, 'manage_ticket_setting', 'Manage Ticket Setting', NULL, 20, 1, '{\"all\":4, \"none\":5}', '2024-12-17 22:23:22', '2024-12-17 22:23:22'),
(281, 'manage_project_setting', 'Manage Project Setting', NULL, 20, 1, '{\"all\":4, \"none\":5}', '2024-12-17 22:23:22', '2024-12-17 22:23:22'),
(282, 'manage_attendance_setting', 'Manage Attendance Setting', NULL, 20, 1, '{\"all\":4, \"none\":5}', '2024-12-17 22:23:22', '2024-12-17 22:23:22'),
(283, 'manage_leave_setting', 'Manage Leave Setting', NULL, 20, 1, '{\"all\":4, \"none\":5}', '2024-12-17 22:23:22', '2024-12-17 22:23:22'),
(284, 'manage_custom_field_setting', 'Manage Custom Field Setting', NULL, 20, 1, '{\"all\":4, \"none\":5}', '2024-12-17 22:23:22', '2024-12-17 22:23:22'),
(285, 'manage_message_setting', 'Manage Message Setting', NULL, 20, 1, '{\"all\":4, \"none\":5}', '2024-12-17 22:23:22', '2024-12-17 22:23:22'),
(286, 'manage_storage_setting', 'Manage Storage Setting', NULL, 20, 1, '{\"all\":4, \"none\":5}', '2024-12-17 22:23:22', '2024-12-17 22:23:22'),
(287, 'manage_language_setting', 'Manage Language Setting', NULL, 20, 1, '{\"all\":4, \"none\":5}', '2024-12-17 22:23:22', '2024-12-17 22:23:22'),
(288, 'manage_lead_setting', 'Manage Lead Setting', NULL, 20, 1, '{\"all\":4, \"none\":5}', '2024-12-17 22:23:22', '2024-12-17 22:23:22'),
(289, 'manage_time_log_setting', 'Manage Time Log Setting', NULL, 20, 1, '{\"all\":4, \"none\":5}', '2024-12-17 22:23:22', '2024-12-17 22:23:22'),
(290, 'manage_task_setting', 'Manage Task Setting', NULL, 20, 1, '{\"all\":4, \"none\":5}', '2024-12-17 22:23:22', '2024-12-17 22:23:22'),
(291, 'manage_social_login_setting', 'Manage Social Login Setting', NULL, 20, 1, '{\"all\":4, \"none\":5}', '2024-12-17 22:23:22', '2024-12-17 22:23:22'),
(292, 'manage_security_setting', 'Manage Security Setting', NULL, 20, 1, '{\"all\":4, \"none\":5}', '2024-12-17 22:23:22', '2024-12-17 22:23:22'),
(293, 'manage_gdpr_setting', 'Manage Gdpr Setting', NULL, 20, 1, '{\"all\":4, \"none\":5}', '2024-12-17 22:23:22', '2024-12-17 22:23:22'),
(294, 'manage_theme_setting', 'Manage Theme Setting', NULL, 20, 1, '{\"all\":4, \"none\":5}', '2024-12-17 22:23:22', '2024-12-17 22:23:22'),
(295, 'manage_role_permission_setting', 'Manage Role Permission Setting', NULL, 20, 1, '{\"all\":4, \"none\":5}', '2024-12-17 22:23:22', '2024-12-17 22:23:22'),
(296, 'manage_module_setting', 'Manage Module Setting', NULL, 20, 1, '{\"all\":4, \"none\":5}', '2024-12-17 22:23:22', '2024-12-17 22:23:22'),
(297, 'manage_google_calendar_setting', 'Manage Google Calendar Setting', NULL, 20, 1, '{\"all\":4, \"none\":5}', '2024-12-17 22:23:22', '2024-12-17 22:23:22'),
(298, 'manage_contract_setting', 'Manage Contract Setting', NULL, 20, 1, '{\"all\":4, \"none\":5}', '2024-12-17 22:23:22', '2024-12-17 22:23:22'),
(299, 'manage_custom_link_setting', 'Manage Custom Link Setting', NULL, 20, 1, '{\"all\":4, \"none\":5}', '2024-12-17 22:23:22', '2024-12-17 22:23:22'),
(300, 'view_overview_dashboard', 'View Overview Dashboard', NULL, 21, 1, '{\"all\":4, \"none\":5}', '2024-12-17 22:23:22', '2024-12-17 22:23:22'),
(301, 'view_project_dashboard', 'View Project Dashboard', NULL, 21, 1, '{\"all\":4, \"none\":5}', '2024-12-17 22:23:22', '2024-12-17 22:23:22'),
(302, 'view_client_dashboard', 'View Client Dashboard', NULL, 21, 1, '{\"all\":4, \"none\":5}', '2024-12-17 22:23:22', '2024-12-17 22:23:22'),
(303, 'view_hr_dashboard', 'View Hr Dashboard', NULL, 21, 1, '{\"all\":4, \"none\":5}', '2024-12-17 22:23:22', '2024-12-17 22:23:22'),
(304, 'view_ticket_dashboard', 'View Ticket Dashboard', NULL, 21, 1, '{\"all\":4, \"none\":5}', '2024-12-17 22:23:22', '2024-12-17 22:23:22'),
(305, 'view_finance_dashboard', 'View Finance Dashboard', NULL, 21, 1, '{\"all\":4, \"none\":5}', '2024-12-17 22:23:22', '2024-12-17 22:23:22'),
(306, 'add_order', 'Add Order', NULL, 22, 0, '{\"all\":4, \"none\":5}', '2024-12-17 22:23:22', '2024-12-17 22:23:22'),
(307, 'view_order', 'View Order', NULL, 22, 0, '{\"all\":4, \"added\":1, \"owned\":2,\"both\":3, \"none\":5}', '2024-12-17 22:23:22', '2024-12-17 22:23:22'),
(308, 'edit_order', 'Edit Order', NULL, 22, 0, '{\"all\":4, \"added\":1, \"owned\":2,\"both\":3, \"none\":5}', '2024-12-17 22:23:22', '2024-12-17 22:23:22'),
(309, 'delete_order', 'Delete Order', NULL, 22, 0, '{\"all\":4, \"added\":1, \"owned\":2,\"both\":3, \"none\":5}', '2024-12-17 22:23:22', '2024-12-17 22:23:22'),
(310, 'view_project_orders', 'View Project Orders', NULL, 22, 1, '{\"all\":4, \"none\":5}', '2024-12-17 22:23:22', '2024-12-17 22:23:22'),
(311, 'add_knowledgebase', 'Add Knowledgebase', NULL, 23, 0, '{\"all\":4, \"none\":5}', '2024-12-17 22:23:22', '2024-12-17 22:23:22'),
(312, 'view_knowledgebase', 'View Knowledgebase', NULL, 23, 0, '{\"all\":4,\"added\":1,\"none\":5}', '2024-12-17 22:23:22', '2024-12-17 22:23:22'),
(313, 'edit_knowledgebase', 'Edit Knowledgebase', NULL, 23, 0, '{\"all\":4,\"added\":1,\"none\":5}', '2024-12-17 22:23:22', '2024-12-17 22:23:22'),
(314, 'delete_knowledgebase', 'Delete Knowledgebase', NULL, 23, 0, '{\"all\":4,\"added\":1,\"none\":5}', '2024-12-17 22:23:22', '2024-12-17 22:23:22'),
(315, 'add_bankaccount', 'Add Bankaccount', NULL, 24, 0, '{\"all\":4, \"none\":5}', '2024-12-17 22:23:22', '2024-12-17 22:23:22'),
(316, 'view_bankaccount', 'View Bankaccount', NULL, 24, 0, '{\"all\":4,\"added\":1, \"none\":5}', '2024-12-17 22:23:22', '2024-12-17 22:23:22'),
(317, 'edit_bankaccount', 'Edit Bankaccount', NULL, 24, 0, '{\"all\":4,\"added\":1, \"none\":5}', '2024-12-17 22:23:22', '2024-12-17 22:23:22'),
(318, 'delete_bankaccount', 'Delete Bankaccount', NULL, 24, 0, '{\"all\":4,\"added\":1, \"none\":5}', '2024-12-17 22:23:22', '2024-12-17 22:23:22'),
(319, 'add_bank_transfer', 'Add Bank Transfer', NULL, 24, 1, '{\"all\":4, \"none\":5}', '2024-12-17 22:23:22', '2024-12-17 22:23:22'),
(320, 'add_bank_deposit', 'Add Bank Deposit', NULL, 24, 1, '{\"all\":4, \"none\":5}', '2024-12-17 22:23:22', '2024-12-17 22:23:22'),
(321, 'add_bank_withdraw', 'Add Bank Withdraw', NULL, 24, 1, '{\"all\":4, \"none\":5}', '2024-12-17 22:23:22', '2024-12-17 22:23:22');

-- --------------------------------------------------------

--
-- Table structure for table `permission_role`
--

CREATE TABLE `permission_role` (
  `permission_id` int(10) UNSIGNED NOT NULL,
  `role_id` int(10) UNSIGNED NOT NULL,
  `permission_type_id` bigint(20) UNSIGNED NOT NULL DEFAULT 5
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `permission_role`
--

INSERT INTO `permission_role` (`permission_id`, `role_id`, `permission_type_id`) VALUES
(79, 2, 1),
(79, 3, 1),
(82, 2, 1),
(82, 3, 1),
(83, 2, 1),
(83, 3, 1),
(120, 2, 1),
(122, 2, 1),
(123, 2, 1),
(130, 2, 1),
(133, 2, 1),
(134, 2, 1),
(137, 2, 1),
(137, 3, 1),
(138, 2, 1),
(138, 3, 1),
(141, 2, 1),
(141, 3, 1),
(142, 2, 1),
(142, 3, 1),
(165, 2, 1),
(167, 2, 1),
(172, 2, 1),
(172, 3, 1),
(174, 3, 1),
(175, 2, 1),
(175, 3, 1),
(189, 2, 1),
(195, 2, 1),
(197, 2, 1),
(217, 2, 1),
(222, 2, 1),
(223, 2, 1),
(243, 2, 1),
(245, 2, 1),
(246, 2, 1),
(63, 2, 2),
(66, 2, 2),
(67, 2, 2),
(68, 2, 2),
(69, 2, 2),
(73, 2, 2),
(73, 3, 2),
(117, 2, 2),
(121, 3, 2),
(150, 3, 2),
(154, 3, 2),
(161, 3, 2),
(166, 3, 2),
(182, 2, 2),
(182, 3, 2),
(186, 2, 2),
(186, 3, 2),
(234, 2, 2),
(252, 3, 2),
(307, 3, 2),
(121, 2, 3),
(166, 2, 3),
(173, 2, 3),
(173, 3, 3),
(174, 2, 3),
(190, 2, 3),
(244, 2, 3),
(1, 1, 4),
(2, 1, 4),
(3, 1, 4),
(4, 1, 4),
(6, 1, 4),
(11, 1, 4),
(12, 1, 4),
(13, 1, 4),
(14, 1, 4),
(15, 1, 4),
(16, 1, 4),
(17, 1, 4),
(18, 1, 4),
(19, 1, 4),
(20, 1, 4),
(21, 1, 4),
(22, 1, 4),
(23, 1, 4),
(24, 1, 4),
(25, 1, 4),
(26, 1, 4),
(27, 1, 4),
(28, 1, 4),
(29, 1, 4),
(30, 1, 4),
(31, 1, 4),
(32, 1, 4),
(33, 1, 4),
(34, 1, 4),
(35, 1, 4),
(36, 1, 4),
(37, 1, 4),
(38, 1, 4),
(39, 1, 4),
(40, 1, 4),
(41, 1, 4),
(42, 1, 4),
(43, 1, 4),
(44, 1, 4),
(45, 1, 4),
(46, 1, 4),
(47, 1, 4),
(48, 1, 4),
(49, 1, 4),
(50, 1, 4),
(51, 1, 4),
(52, 1, 4),
(53, 1, 4),
(54, 1, 4),
(54, 2, 4),
(55, 1, 4),
(56, 1, 4),
(57, 1, 4),
(58, 1, 4),
(59, 1, 4),
(60, 1, 4),
(61, 1, 4),
(62, 1, 4),
(63, 1, 4),
(64, 1, 4),
(65, 1, 4),
(66, 1, 4),
(67, 1, 4),
(68, 1, 4),
(69, 1, 4),
(70, 1, 4),
(71, 1, 4),
(72, 1, 4),
(73, 1, 4),
(74, 1, 4),
(75, 1, 4),
(76, 1, 4),
(77, 1, 4),
(77, 2, 4),
(77, 3, 4),
(78, 1, 4),
(78, 2, 4),
(78, 3, 4),
(79, 1, 4),
(80, 1, 4),
(80, 2, 4),
(80, 3, 4),
(81, 1, 4),
(81, 2, 4),
(81, 3, 4),
(82, 1, 4),
(83, 1, 4),
(84, 1, 4),
(85, 1, 4),
(86, 1, 4),
(87, 1, 4),
(88, 1, 4),
(89, 1, 4),
(89, 2, 4),
(89, 3, 4),
(90, 1, 4),
(91, 1, 4),
(92, 1, 4),
(93, 1, 4),
(94, 1, 4),
(95, 1, 4),
(96, 1, 4),
(97, 1, 4),
(98, 1, 4),
(98, 2, 4),
(98, 3, 4),
(99, 1, 4),
(100, 1, 4),
(100, 2, 4),
(100, 3, 4),
(101, 1, 4),
(101, 3, 4),
(102, 1, 4),
(103, 1, 4),
(103, 3, 4),
(104, 1, 4),
(105, 1, 4),
(106, 1, 4),
(106, 2, 4),
(106, 3, 4),
(107, 1, 4),
(108, 1, 4),
(109, 1, 4),
(110, 1, 4),
(111, 1, 4),
(112, 1, 4),
(113, 1, 4),
(114, 1, 4),
(115, 1, 4),
(116, 1, 4),
(117, 1, 4),
(118, 1, 4),
(119, 1, 4),
(120, 1, 4),
(121, 1, 4),
(122, 1, 4),
(123, 1, 4),
(124, 1, 4),
(125, 1, 4),
(126, 1, 4),
(127, 1, 4),
(128, 1, 4),
(128, 2, 4),
(128, 3, 4),
(129, 1, 4),
(129, 2, 4),
(130, 1, 4),
(131, 1, 4),
(131, 2, 4),
(131, 3, 4),
(132, 1, 4),
(132, 2, 4),
(133, 1, 4),
(134, 1, 4),
(135, 1, 4),
(135, 2, 4),
(135, 3, 4),
(136, 1, 4),
(136, 2, 4),
(136, 3, 4),
(137, 1, 4),
(138, 1, 4),
(139, 1, 4),
(139, 2, 4),
(139, 3, 4),
(140, 1, 4),
(140, 2, 4),
(140, 3, 4),
(141, 1, 4),
(142, 1, 4),
(143, 1, 4),
(144, 1, 4),
(145, 1, 4),
(146, 1, 4),
(147, 1, 4),
(148, 1, 4),
(149, 1, 4),
(150, 1, 4),
(151, 1, 4),
(152, 1, 4),
(153, 1, 4),
(154, 1, 4),
(155, 1, 4),
(156, 1, 4),
(157, 1, 4),
(158, 1, 4),
(159, 1, 4),
(160, 1, 4),
(161, 1, 4),
(162, 1, 4),
(163, 1, 4),
(164, 1, 4),
(165, 1, 4),
(166, 1, 4),
(167, 1, 4),
(168, 1, 4),
(169, 1, 4),
(170, 1, 4),
(171, 1, 4),
(172, 1, 4),
(173, 1, 4),
(174, 1, 4),
(175, 1, 4),
(176, 1, 4),
(177, 1, 4),
(178, 1, 4),
(179, 1, 4),
(180, 1, 4),
(181, 1, 4),
(182, 1, 4),
(183, 1, 4),
(184, 1, 4),
(185, 1, 4),
(186, 1, 4),
(187, 1, 4),
(188, 1, 4),
(189, 1, 4),
(190, 1, 4),
(191, 1, 4),
(192, 1, 4),
(193, 1, 4),
(194, 1, 4),
(195, 1, 4),
(196, 1, 4),
(196, 2, 4),
(197, 1, 4),
(198, 1, 4),
(199, 1, 4),
(200, 1, 4),
(201, 1, 4),
(202, 1, 4),
(203, 1, 4),
(204, 1, 4),
(205, 1, 4),
(206, 1, 4),
(207, 1, 4),
(208, 1, 4),
(209, 1, 4),
(210, 1, 4),
(211, 1, 4),
(212, 1, 4),
(213, 1, 4),
(214, 1, 4),
(215, 1, 4),
(216, 1, 4),
(217, 1, 4),
(218, 1, 4),
(218, 2, 4),
(219, 1, 4),
(220, 1, 4),
(220, 2, 4),
(221, 1, 4),
(221, 2, 4),
(222, 1, 4),
(223, 1, 4),
(224, 1, 4),
(225, 1, 4),
(226, 1, 4),
(227, 1, 4),
(228, 1, 4),
(229, 1, 4),
(230, 1, 4),
(231, 1, 4),
(232, 1, 4),
(233, 1, 4),
(234, 1, 4),
(235, 1, 4),
(236, 1, 4),
(237, 1, 4),
(238, 1, 4),
(238, 3, 4),
(239, 1, 4),
(240, 1, 4),
(241, 1, 4),
(242, 1, 4),
(243, 1, 4),
(244, 1, 4),
(245, 1, 4),
(246, 1, 4),
(247, 1, 4),
(248, 1, 4),
(249, 1, 4),
(250, 1, 4),
(251, 1, 4),
(252, 1, 4),
(253, 1, 4),
(254, 1, 4),
(255, 1, 4),
(256, 1, 4),
(257, 1, 4),
(257, 3, 4),
(258, 1, 4),
(259, 1, 4),
(259, 3, 4),
(260, 1, 4),
(261, 1, 4),
(262, 1, 4),
(262, 3, 4),
(263, 1, 4),
(264, 1, 4),
(265, 1, 4),
(266, 1, 4),
(267, 1, 4),
(268, 1, 4),
(269, 1, 4),
(270, 1, 4),
(271, 1, 4),
(272, 1, 4),
(273, 1, 4),
(274, 1, 4),
(275, 1, 4),
(276, 1, 4),
(277, 1, 4),
(278, 1, 4),
(279, 1, 4),
(280, 1, 4),
(281, 1, 4),
(282, 1, 4),
(283, 1, 4),
(284, 1, 4),
(285, 1, 4),
(286, 1, 4),
(287, 1, 4),
(288, 1, 4),
(289, 1, 4),
(290, 1, 4),
(291, 1, 4),
(292, 1, 4),
(293, 1, 4),
(294, 1, 4),
(295, 1, 4),
(296, 1, 4),
(297, 1, 4),
(298, 1, 4),
(299, 1, 4),
(300, 1, 4),
(301, 1, 4),
(302, 1, 4),
(303, 1, 4),
(304, 1, 4),
(305, 1, 4),
(306, 1, 4),
(306, 3, 4),
(307, 1, 4),
(308, 1, 4),
(309, 1, 4),
(310, 1, 4),
(311, 1, 4),
(312, 1, 4),
(313, 1, 4),
(314, 1, 4),
(315, 1, 4),
(316, 1, 4),
(317, 1, 4),
(318, 1, 4),
(319, 1, 4),
(320, 1, 4),
(321, 1, 4),
(1, 2, 5),
(1, 3, 5),
(2, 2, 5),
(2, 3, 5),
(3, 2, 5),
(3, 3, 5),
(4, 2, 5),
(4, 3, 5),
(6, 2, 5),
(6, 3, 5),
(11, 2, 5),
(11, 3, 5),
(12, 2, 5),
(12, 3, 5),
(13, 2, 5),
(13, 3, 5),
(14, 2, 5),
(14, 3, 5),
(15, 2, 5),
(15, 3, 5),
(16, 2, 5),
(16, 3, 5),
(17, 2, 5),
(17, 3, 5),
(18, 2, 5),
(18, 3, 5),
(19, 2, 5),
(19, 3, 5),
(20, 2, 5),
(20, 3, 5),
(21, 2, 5),
(21, 3, 5),
(22, 2, 5),
(22, 3, 5),
(23, 2, 5),
(23, 3, 5),
(24, 2, 5),
(24, 3, 5),
(25, 2, 5),
(25, 3, 5),
(26, 2, 5),
(26, 3, 5),
(27, 2, 5),
(27, 3, 5),
(28, 2, 5),
(28, 3, 5),
(29, 2, 5),
(29, 3, 5),
(30, 2, 5),
(30, 3, 5),
(31, 2, 5),
(31, 3, 5),
(32, 2, 5),
(32, 3, 5),
(33, 2, 5),
(33, 3, 5),
(34, 2, 5),
(34, 3, 5),
(35, 2, 5),
(35, 3, 5),
(36, 2, 5),
(36, 3, 5),
(37, 2, 5),
(37, 3, 5),
(38, 2, 5),
(38, 3, 5),
(39, 2, 5),
(39, 3, 5),
(40, 2, 5),
(40, 3, 5),
(41, 2, 5),
(41, 3, 5),
(42, 2, 5),
(42, 3, 5),
(43, 2, 5),
(43, 3, 5),
(44, 2, 5),
(44, 3, 5),
(45, 2, 5),
(45, 3, 5),
(46, 2, 5),
(46, 3, 5),
(47, 2, 5),
(47, 3, 5),
(48, 2, 5),
(48, 3, 5),
(49, 2, 5),
(49, 3, 5),
(50, 2, 5),
(50, 3, 5),
(51, 2, 5),
(51, 3, 5),
(52, 2, 5),
(52, 3, 5),
(53, 2, 5),
(53, 3, 5),
(54, 3, 5),
(55, 2, 5),
(55, 3, 5),
(56, 2, 5),
(56, 3, 5),
(57, 2, 5),
(57, 3, 5),
(58, 2, 5),
(58, 3, 5),
(59, 2, 5),
(59, 3, 5),
(60, 2, 5),
(60, 3, 5),
(61, 2, 5),
(61, 3, 5),
(62, 2, 5),
(62, 3, 5),
(63, 3, 5),
(64, 2, 5),
(64, 3, 5),
(65, 2, 5),
(65, 3, 5),
(66, 3, 5),
(67, 3, 5),
(68, 3, 5),
(69, 3, 5),
(70, 2, 5),
(70, 3, 5),
(71, 2, 5),
(71, 3, 5),
(72, 2, 5),
(72, 3, 5),
(74, 2, 5),
(74, 3, 5),
(75, 2, 5),
(75, 3, 5),
(76, 2, 5),
(76, 3, 5),
(84, 2, 5),
(84, 3, 5),
(85, 2, 5),
(85, 3, 5),
(86, 2, 5),
(86, 3, 5),
(87, 2, 5),
(87, 3, 5),
(88, 2, 5),
(88, 3, 5),
(90, 2, 5),
(90, 3, 5),
(91, 2, 5),
(91, 3, 5),
(92, 2, 5),
(92, 3, 5),
(93, 2, 5),
(93, 3, 5),
(94, 2, 5),
(94, 3, 5),
(95, 2, 5),
(95, 3, 5),
(96, 2, 5),
(96, 3, 5),
(97, 2, 5),
(97, 3, 5),
(99, 2, 5),
(99, 3, 5),
(101, 2, 5),
(102, 2, 5),
(102, 3, 5),
(103, 2, 5),
(104, 2, 5),
(104, 3, 5),
(105, 2, 5),
(105, 3, 5),
(107, 2, 5),
(107, 3, 5),
(108, 2, 5),
(108, 3, 5),
(109, 2, 5),
(109, 3, 5),
(110, 2, 5),
(110, 3, 5),
(111, 2, 5),
(111, 3, 5),
(112, 2, 5),
(112, 3, 5),
(113, 2, 5),
(113, 3, 5),
(114, 2, 5),
(114, 3, 5),
(115, 2, 5),
(115, 3, 5),
(116, 2, 5),
(116, 3, 5),
(117, 3, 5),
(118, 2, 5),
(118, 3, 5),
(119, 2, 5),
(119, 3, 5),
(120, 3, 5),
(122, 3, 5),
(123, 3, 5),
(124, 2, 5),
(124, 3, 5),
(125, 2, 5),
(125, 3, 5),
(126, 2, 5),
(126, 3, 5),
(127, 2, 5),
(127, 3, 5),
(129, 3, 5),
(130, 3, 5),
(132, 3, 5),
(133, 3, 5),
(134, 3, 5),
(143, 2, 5),
(143, 3, 5),
(144, 2, 5),
(144, 3, 5),
(145, 2, 5),
(145, 3, 5),
(146, 2, 5),
(146, 3, 5),
(147, 2, 5),
(147, 3, 5),
(148, 2, 5),
(148, 3, 5),
(149, 2, 5),
(149, 3, 5),
(150, 2, 5),
(151, 2, 5),
(151, 3, 5),
(152, 2, 5),
(152, 3, 5),
(153, 2, 5),
(153, 3, 5),
(154, 2, 5),
(155, 2, 5),
(155, 3, 5),
(156, 2, 5),
(156, 3, 5),
(157, 2, 5),
(157, 3, 5),
(158, 2, 5),
(158, 3, 5),
(159, 2, 5),
(159, 3, 5),
(160, 2, 5),
(160, 3, 5),
(161, 2, 5),
(162, 2, 5),
(162, 3, 5),
(163, 2, 5),
(163, 3, 5),
(164, 2, 5),
(164, 3, 5),
(165, 3, 5),
(167, 3, 5),
(168, 2, 5),
(168, 3, 5),
(169, 2, 5),
(169, 3, 5),
(170, 2, 5),
(170, 3, 5),
(171, 2, 5),
(171, 3, 5),
(176, 2, 5),
(176, 3, 5),
(177, 2, 5),
(177, 3, 5),
(178, 2, 5),
(178, 3, 5),
(179, 2, 5),
(179, 3, 5),
(180, 2, 5),
(180, 3, 5),
(181, 2, 5),
(181, 3, 5),
(183, 2, 5),
(183, 3, 5),
(184, 2, 5),
(184, 3, 5),
(185, 2, 5),
(185, 3, 5),
(187, 2, 5),
(187, 3, 5),
(188, 2, 5),
(188, 3, 5),
(189, 3, 5),
(190, 3, 5),
(191, 2, 5),
(191, 3, 5),
(192, 2, 5),
(192, 3, 5),
(193, 2, 5),
(193, 3, 5),
(194, 2, 5),
(194, 3, 5),
(195, 3, 5),
(196, 3, 5),
(197, 3, 5),
(198, 2, 5),
(198, 3, 5),
(199, 2, 5),
(199, 3, 5),
(200, 2, 5),
(200, 3, 5),
(201, 2, 5),
(201, 3, 5),
(202, 2, 5),
(202, 3, 5),
(203, 2, 5),
(203, 3, 5),
(204, 2, 5),
(204, 3, 5),
(205, 2, 5),
(205, 3, 5),
(206, 2, 5),
(206, 3, 5),
(207, 2, 5),
(207, 3, 5),
(208, 2, 5),
(208, 3, 5),
(209, 2, 5),
(209, 3, 5),
(210, 2, 5),
(210, 3, 5),
(211, 2, 5),
(211, 3, 5),
(212, 2, 5),
(212, 3, 5),
(213, 2, 5),
(213, 3, 5),
(214, 2, 5),
(214, 3, 5),
(215, 2, 5),
(215, 3, 5),
(216, 2, 5),
(216, 3, 5),
(217, 3, 5),
(218, 3, 5),
(219, 2, 5),
(219, 3, 5),
(220, 3, 5),
(221, 3, 5),
(222, 3, 5),
(223, 3, 5),
(224, 2, 5),
(224, 3, 5),
(225, 2, 5),
(225, 3, 5),
(226, 2, 5),
(226, 3, 5),
(227, 2, 5),
(227, 3, 5),
(228, 2, 5),
(228, 3, 5),
(229, 2, 5),
(229, 3, 5),
(230, 2, 5),
(230, 3, 5),
(231, 2, 5),
(231, 3, 5),
(232, 2, 5),
(232, 3, 5),
(233, 2, 5),
(233, 3, 5),
(234, 3, 5),
(235, 2, 5),
(235, 3, 5),
(236, 2, 5),
(236, 3, 5),
(237, 2, 5),
(237, 3, 5),
(238, 2, 5),
(239, 2, 5),
(239, 3, 5),
(240, 2, 5),
(240, 3, 5),
(241, 2, 5),
(241, 3, 5),
(242, 2, 5),
(242, 3, 5),
(243, 3, 5),
(244, 3, 5),
(245, 3, 5),
(246, 3, 5),
(247, 2, 5),
(247, 3, 5),
(248, 2, 5),
(248, 3, 5),
(249, 2, 5),
(249, 3, 5),
(250, 2, 5),
(250, 3, 5),
(251, 2, 5),
(251, 3, 5),
(252, 2, 5),
(253, 2, 5),
(253, 3, 5),
(254, 2, 5),
(254, 3, 5),
(255, 2, 5),
(255, 3, 5),
(256, 2, 5),
(256, 3, 5),
(257, 2, 5),
(258, 2, 5),
(258, 3, 5),
(259, 2, 5),
(260, 2, 5),
(260, 3, 5),
(261, 2, 5),
(261, 3, 5),
(262, 2, 5),
(263, 2, 5),
(263, 3, 5),
(264, 2, 5),
(264, 3, 5),
(265, 2, 5),
(265, 3, 5),
(266, 2, 5),
(266, 3, 5),
(267, 2, 5),
(267, 3, 5),
(268, 2, 5),
(268, 3, 5),
(269, 2, 5),
(269, 3, 5),
(270, 2, 5),
(270, 3, 5),
(271, 2, 5),
(271, 3, 5),
(272, 2, 5),
(272, 3, 5),
(273, 2, 5),
(273, 3, 5),
(274, 2, 5),
(274, 3, 5),
(275, 2, 5),
(275, 3, 5),
(276, 2, 5),
(276, 3, 5),
(277, 2, 5),
(277, 3, 5),
(278, 2, 5),
(278, 3, 5),
(279, 2, 5),
(279, 3, 5),
(280, 2, 5),
(280, 3, 5),
(281, 2, 5),
(281, 3, 5),
(282, 2, 5),
(282, 3, 5),
(283, 2, 5),
(283, 3, 5),
(284, 2, 5),
(284, 3, 5),
(285, 2, 5),
(285, 3, 5),
(286, 2, 5),
(286, 3, 5),
(287, 2, 5),
(287, 3, 5),
(288, 2, 5),
(288, 3, 5),
(289, 2, 5),
(289, 3, 5),
(290, 2, 5),
(290, 3, 5),
(291, 2, 5),
(291, 3, 5),
(292, 2, 5),
(292, 3, 5),
(293, 2, 5),
(293, 3, 5),
(294, 2, 5),
(294, 3, 5),
(295, 2, 5),
(295, 3, 5),
(296, 2, 5),
(296, 3, 5),
(297, 2, 5),
(297, 3, 5),
(298, 2, 5),
(298, 3, 5),
(299, 2, 5),
(299, 3, 5),
(300, 2, 5),
(300, 3, 5),
(301, 2, 5),
(301, 3, 5),
(302, 2, 5),
(302, 3, 5),
(303, 2, 5),
(303, 3, 5),
(304, 2, 5),
(304, 3, 5),
(305, 2, 5),
(305, 3, 5),
(306, 2, 5),
(307, 2, 5),
(308, 2, 5),
(308, 3, 5),
(309, 2, 5),
(309, 3, 5),
(310, 2, 5),
(310, 3, 5),
(311, 2, 5),
(311, 3, 5),
(312, 2, 5),
(312, 3, 5),
(313, 2, 5),
(313, 3, 5),
(314, 2, 5),
(314, 3, 5),
(315, 2, 5),
(315, 3, 5),
(316, 2, 5),
(316, 3, 5),
(317, 2, 5),
(317, 3, 5),
(318, 2, 5),
(318, 3, 5),
(319, 2, 5),
(319, 3, 5),
(320, 2, 5),
(320, 3, 5),
(321, 2, 5),
(321, 3, 5);

-- --------------------------------------------------------

--
-- Table structure for table `permission_types`
--

CREATE TABLE `permission_types` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(191) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `permission_types`
--

INSERT INTO `permission_types` (`id`, `name`, `created_at`, `updated_at`) VALUES
(1, 'added', NULL, NULL),
(2, 'owned', NULL, NULL),
(3, 'both', NULL, NULL),
(4, 'all', NULL, NULL),
(5, 'none', NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `pinned`
--

CREATE TABLE `pinned` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `company_id` int(10) UNSIGNED DEFAULT NULL,
  `project_id` int(10) UNSIGNED DEFAULT NULL,
  `task_id` int(10) UNSIGNED DEFAULT NULL,
  `user_id` int(10) UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `pipeline_stages`
--

CREATE TABLE `pipeline_stages` (
  `id` int(10) UNSIGNED NOT NULL,
  `company_id` int(10) UNSIGNED DEFAULT NULL,
  `lead_pipeline_id` bigint(20) UNSIGNED DEFAULT NULL,
  `name` varchar(191) DEFAULT NULL,
  `slug` varchar(191) DEFAULT NULL,
  `priority` int(11) NOT NULL DEFAULT 0,
  `default` tinyint(1) NOT NULL DEFAULT 0,
  `label_color` varchar(191) NOT NULL DEFAULT '#ff0000',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `pipeline_stages`
--

INSERT INTO `pipeline_stages` (`id`, `company_id`, `lead_pipeline_id`, `name`, `slug`, `priority`, `default`, `label_color`, `created_at`, `updated_at`) VALUES
(1, 1, 1, 'Generated', 'generated', 1, 1, '#FFD700', NULL, NULL),
(2, 1, 1, 'Qualified', 'qualified', 2, 0, '#009EFF', NULL, NULL),
(3, 1, 1, 'Initial Contact', 'initial-contact', 3, 0, '#00CED1', NULL, NULL),
(4, 1, 1, 'Schedule Appointment', 'schedule-appointment', 4, 0, '#32CD32', NULL, NULL),
(5, 1, 1, 'Proposal Sent', 'proposal-sent', 5, 0, '#FFA07A', NULL, NULL),
(6, 1, 1, 'Win', 'win', 6, 0, '#1FAE07', NULL, NULL),
(7, 1, 1, 'Lost', 'lost', 7, 0, '#DB1313', NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `id` int(10) UNSIGNED NOT NULL,
  `company_id` int(10) UNSIGNED DEFAULT NULL,
  `name` varchar(191) NOT NULL,
  `price` varchar(191) NOT NULL,
  `taxes` varchar(191) DEFAULT NULL,
  `allow_purchase` tinyint(1) NOT NULL DEFAULT 0,
  `downloadable` tinyint(1) NOT NULL DEFAULT 0,
  `downloadable_file` varchar(191) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `category_id` bigint(20) UNSIGNED DEFAULT NULL,
  `sub_category_id` bigint(20) UNSIGNED DEFAULT NULL,
  `added_by` int(10) UNSIGNED DEFAULT NULL,
  `last_updated_by` int(10) UNSIGNED DEFAULT NULL,
  `hsn_sac_code` varchar(191) DEFAULT NULL,
  `default_image` varchar(191) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `unit_id` bigint(20) UNSIGNED DEFAULT NULL,
  `sku` varchar(191) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `product_category`
--

CREATE TABLE `product_category` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `company_id` int(10) UNSIGNED DEFAULT NULL,
  `category_name` varchar(191) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `product_files`
--

CREATE TABLE `product_files` (
  `id` int(10) UNSIGNED NOT NULL,
  `company_id` int(10) UNSIGNED DEFAULT NULL,
  `product_id` int(10) UNSIGNED NOT NULL,
  `filename` varchar(200) DEFAULT NULL,
  `hashname` varchar(200) DEFAULT NULL,
  `size` varchar(200) DEFAULT NULL,
  `added_by` int(10) UNSIGNED DEFAULT NULL,
  `last_updated_by` int(10) UNSIGNED DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `product_sub_category`
--

CREATE TABLE `product_sub_category` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `company_id` int(10) UNSIGNED DEFAULT NULL,
  `category_id` bigint(20) UNSIGNED NOT NULL,
  `category_name` varchar(191) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `projects`
--

CREATE TABLE `projects` (
  `id` int(10) UNSIGNED NOT NULL,
  `company_id` int(10) UNSIGNED DEFAULT NULL,
  `project_name` varchar(191) NOT NULL,
  `project_short_code` varchar(191) DEFAULT NULL,
  `project_summary` longtext DEFAULT NULL,
  `project_admin` int(10) UNSIGNED DEFAULT NULL,
  `start_date` date NOT NULL,
  `deadline` date DEFAULT NULL,
  `notes` longtext DEFAULT NULL,
  `category_id` int(10) UNSIGNED DEFAULT NULL,
  `client_id` int(10) UNSIGNED DEFAULT NULL,
  `team_id` int(10) UNSIGNED DEFAULT NULL,
  `feedback` mediumtext DEFAULT NULL,
  `manual_timelog` enum('enable','disable') NOT NULL DEFAULT 'disable',
  `client_view_task` enum('enable','disable') NOT NULL DEFAULT 'disable',
  `allow_client_notification` enum('enable','disable') NOT NULL DEFAULT 'disable',
  `completion_percent` tinyint(4) NOT NULL,
  `calculate_task_progress` enum('true','false') NOT NULL DEFAULT 'true',
  `project_budget` double(20,2) DEFAULT NULL,
  `currency_id` int(10) UNSIGNED DEFAULT NULL,
  `hours_allocated` double(8,2) DEFAULT NULL,
  `status` varchar(191) NOT NULL DEFAULT 'in progress',
  `added_by` int(10) UNSIGNED DEFAULT NULL,
  `last_updated_by` int(10) UNSIGNED DEFAULT NULL,
  `hash` text DEFAULT NULL,
  `public` tinyint(1) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `enable_miroboard` tinyint(1) NOT NULL DEFAULT 0,
  `miro_board_id` varchar(191) DEFAULT NULL,
  `client_access` tinyint(1) NOT NULL DEFAULT 0,
  `public_taskboard` enum('enable','disable') NOT NULL DEFAULT 'enable',
  `public_gantt_chart` enum('enable','disable') NOT NULL DEFAULT 'enable',
  `need_approval_by_admin` enum('0','1') NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `project_activity`
--

CREATE TABLE `project_activity` (
  `id` int(10) UNSIGNED NOT NULL,
  `project_id` int(10) UNSIGNED NOT NULL,
  `activity` text NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `project_category`
--

CREATE TABLE `project_category` (
  `id` int(10) UNSIGNED NOT NULL,
  `company_id` int(10) UNSIGNED DEFAULT NULL,
  `category_name` varchar(191) NOT NULL,
  `added_by` int(10) UNSIGNED DEFAULT NULL,
  `last_updated_by` int(10) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `project_departments`
--

CREATE TABLE `project_departments` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `project_id` int(10) UNSIGNED NOT NULL,
  `team_id` int(10) UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `project_files`
--

CREATE TABLE `project_files` (
  `id` int(10) UNSIGNED NOT NULL,
  `company_id` int(10) UNSIGNED DEFAULT NULL,
  `user_id` int(10) UNSIGNED NOT NULL,
  `project_id` int(10) UNSIGNED NOT NULL,
  `filename` varchar(191) NOT NULL,
  `hashname` varchar(191) DEFAULT NULL,
  `size` varchar(191) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `google_url` varchar(191) DEFAULT NULL,
  `dropbox_link` varchar(191) DEFAULT NULL,
  `external_link_name` varchar(191) DEFAULT NULL,
  `external_link` text DEFAULT NULL,
  `added_by` int(10) UNSIGNED DEFAULT NULL,
  `last_updated_by` int(10) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `project_members`
--

CREATE TABLE `project_members` (
  `id` int(10) UNSIGNED NOT NULL,
  `user_id` int(10) UNSIGNED NOT NULL,
  `project_id` int(10) UNSIGNED NOT NULL,
  `hourly_rate` double NOT NULL,
  `added_by` int(10) UNSIGNED DEFAULT NULL,
  `last_updated_by` int(10) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `project_milestones`
--

CREATE TABLE `project_milestones` (
  `id` int(10) UNSIGNED NOT NULL,
  `project_id` int(10) UNSIGNED DEFAULT NULL,
  `currency_id` int(10) UNSIGNED DEFAULT NULL,
  `milestone_title` varchar(191) NOT NULL,
  `summary` mediumtext NOT NULL,
  `cost` double(16,2) NOT NULL,
  `status` enum('complete','incomplete') NOT NULL DEFAULT 'incomplete',
  `add_to_budget` enum('yes','no') NOT NULL DEFAULT 'no',
  `invoice_created` tinyint(1) NOT NULL,
  `invoice_id` int(11) DEFAULT NULL,
  `added_by` int(10) UNSIGNED DEFAULT NULL,
  `last_updated_by` int(10) UNSIGNED DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `project_notes`
--

CREATE TABLE `project_notes` (
  `id` int(10) UNSIGNED NOT NULL,
  `project_id` int(10) UNSIGNED DEFAULT NULL,
  `title` varchar(191) NOT NULL,
  `type` tinyint(1) NOT NULL DEFAULT 0,
  `client_id` int(10) UNSIGNED DEFAULT NULL,
  `is_client_show` tinyint(1) NOT NULL DEFAULT 0,
  `ask_password` tinyint(1) NOT NULL DEFAULT 0,
  `details` longtext NOT NULL,
  `added_by` int(10) UNSIGNED DEFAULT NULL,
  `last_updated_by` int(10) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `project_ratings`
--

CREATE TABLE `project_ratings` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `project_id` int(10) UNSIGNED NOT NULL,
  `rating` double NOT NULL DEFAULT 0,
  `comment` text DEFAULT NULL,
  `user_id` int(10) UNSIGNED NOT NULL,
  `added_by` int(10) UNSIGNED DEFAULT NULL,
  `last_updated_by` int(10) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `project_settings`
--

CREATE TABLE `project_settings` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `company_id` int(10) UNSIGNED DEFAULT NULL,
  `send_reminder` enum('yes','no') NOT NULL,
  `remind_time` int(11) NOT NULL,
  `remind_type` varchar(191) NOT NULL,
  `remind_to` varchar(191) NOT NULL DEFAULT '["admins","members"]',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `project_settings`
--

INSERT INTO `project_settings` (`id`, `company_id`, `send_reminder`, `remind_time`, `remind_type`, `remind_to`, `created_at`, `updated_at`) VALUES
(1, 1, 'no', 5, 'days', '[\"admins\",\"members\"]', '2024-12-17 22:23:25', '2024-12-17 22:23:25');

-- --------------------------------------------------------

--
-- Table structure for table `project_status_settings`
--

CREATE TABLE `project_status_settings` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `company_id` int(10) UNSIGNED DEFAULT NULL,
  `status_name` varchar(191) NOT NULL,
  `color` varchar(191) NOT NULL,
  `status` enum('active','inactive') NOT NULL,
  `default_status` enum('1','0') NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `project_status_settings`
--

INSERT INTO `project_status_settings` (`id`, `company_id`, `status_name`, `color`, `status`, `default_status`, `created_at`, `updated_at`) VALUES
(1, 1, 'in progress', '#00b5ff', 'active', '1', NULL, NULL),
(2, 1, 'not started', '#616e80', 'active', '0', NULL, NULL),
(3, 1, 'on hold', '#f5c308', 'active', '0', NULL, NULL),
(4, 1, 'canceled', '#d21010', 'active', '0', NULL, NULL),
(5, 1, 'finished', '#679c0d', 'active', '0', NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `project_templates`
--

CREATE TABLE `project_templates` (
  `id` int(10) UNSIGNED NOT NULL,
  `company_id` int(10) UNSIGNED DEFAULT NULL,
  `project_name` varchar(191) NOT NULL,
  `category_id` int(10) UNSIGNED DEFAULT NULL,
  `client_id` int(10) UNSIGNED DEFAULT NULL,
  `project_summary` mediumtext DEFAULT NULL,
  `notes` longtext DEFAULT NULL,
  `feedback` mediumtext DEFAULT NULL,
  `client_view_task` enum('enable','disable') NOT NULL DEFAULT 'disable',
  `allow_client_notification` enum('enable','disable') NOT NULL DEFAULT 'disable',
  `manual_timelog` enum('enable','disable') NOT NULL DEFAULT 'disable',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `added_by` int(11) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `project_template_members`
--

CREATE TABLE `project_template_members` (
  `id` int(10) UNSIGNED NOT NULL,
  `user_id` int(10) UNSIGNED NOT NULL,
  `project_template_id` int(10) UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `project_template_sub_tasks`
--

CREATE TABLE `project_template_sub_tasks` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `project_template_task_id` int(10) UNSIGNED NOT NULL,
  `title` text NOT NULL,
  `start_date` datetime DEFAULT NULL,
  `due_date` datetime DEFAULT NULL,
  `status` enum('incomplete','complete') NOT NULL DEFAULT 'incomplete',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `project_template_tasks`
--

CREATE TABLE `project_template_tasks` (
  `id` int(10) UNSIGNED NOT NULL,
  `heading` varchar(191) NOT NULL,
  `description` mediumtext DEFAULT NULL,
  `project_template_id` int(10) UNSIGNED NOT NULL,
  `priority` enum('low','medium','high') NOT NULL DEFAULT 'medium',
  `task_labels` text DEFAULT NULL,
  `project_template_task_category_id` int(10) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `project_template_task_users`
--

CREATE TABLE `project_template_task_users` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `project_template_task_id` int(10) UNSIGNED NOT NULL,
  `user_id` int(10) UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `project_time_logs`
--

CREATE TABLE `project_time_logs` (
  `id` int(10) UNSIGNED NOT NULL,
  `company_id` int(10) UNSIGNED DEFAULT NULL,
  `project_id` int(10) UNSIGNED DEFAULT NULL,
  `task_id` int(10) UNSIGNED DEFAULT NULL,
  `user_id` int(10) UNSIGNED NOT NULL,
  `start_time` datetime NOT NULL,
  `end_time` datetime DEFAULT NULL,
  `memo` text DEFAULT NULL,
  `total_hours` varchar(191) DEFAULT NULL,
  `total_minutes` varchar(191) DEFAULT NULL,
  `edited_by_user` int(10) UNSIGNED DEFAULT NULL,
  `hourly_rate` int(11) NOT NULL,
  `earnings` double NOT NULL,
  `approved` tinyint(1) NOT NULL DEFAULT 1,
  `approved_by` int(10) UNSIGNED DEFAULT NULL,
  `invoice_id` int(10) UNSIGNED DEFAULT NULL,
  `added_by` int(10) UNSIGNED DEFAULT NULL,
  `last_updated_by` int(10) UNSIGNED DEFAULT NULL,
  `total_break_minutes` varchar(191) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `project_time_log_breaks`
--

CREATE TABLE `project_time_log_breaks` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `company_id` int(10) UNSIGNED DEFAULT NULL,
  `project_time_log_id` int(10) UNSIGNED DEFAULT NULL,
  `start_time` datetime NOT NULL,
  `end_time` datetime DEFAULT NULL,
  `reason` text NOT NULL,
  `total_hours` varchar(191) DEFAULT NULL,
  `total_minutes` varchar(191) DEFAULT NULL,
  `added_by` int(10) UNSIGNED DEFAULT NULL,
  `last_updated_by` int(10) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `project_user_notes`
--

CREATE TABLE `project_user_notes` (
  `id` int(10) UNSIGNED NOT NULL,
  `user_id` int(10) UNSIGNED NOT NULL,
  `project_note_id` int(10) UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `promotions`
--

CREATE TABLE `promotions` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `company_id` int(10) UNSIGNED DEFAULT NULL,
  `employee_id` int(10) UNSIGNED DEFAULT NULL,
  `date` date DEFAULT NULL,
  `previous_designation_id` bigint(20) UNSIGNED DEFAULT NULL,
  `current_designation_id` bigint(20) UNSIGNED DEFAULT NULL,
  `send_notification` enum('yes','no') NOT NULL DEFAULT 'no',
  `previous_department_id` int(10) UNSIGNED DEFAULT NULL,
  `current_department_id` int(10) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `proposals`
--

CREATE TABLE `proposals` (
  `id` int(10) UNSIGNED NOT NULL,
  `proposal_number` varchar(191) DEFAULT NULL,
  `original_proposal_number` varchar(191) DEFAULT NULL,
  `company_id` int(10) UNSIGNED DEFAULT NULL,
  `deal_id` bigint(20) UNSIGNED DEFAULT NULL,
  `valid_till` date NOT NULL,
  `sub_total` double(16,2) NOT NULL,
  `total` double(16,2) NOT NULL,
  `currency_id` int(10) UNSIGNED DEFAULT NULL,
  `discount_type` enum('percent','fixed') NOT NULL,
  `discount` double NOT NULL,
  `invoice_convert` tinyint(1) NOT NULL DEFAULT 0,
  `status` enum('declined','accepted','waiting') NOT NULL DEFAULT 'waiting',
  `note` mediumtext DEFAULT NULL,
  `description` longtext DEFAULT NULL,
  `client_comment` text DEFAULT NULL,
  `signature_approval` tinyint(1) NOT NULL DEFAULT 1,
  `added_by` int(10) UNSIGNED DEFAULT NULL,
  `last_updated_by` int(10) UNSIGNED DEFAULT NULL,
  `hash` text DEFAULT NULL,
  `calculate_tax` enum('after_discount','before_discount') NOT NULL DEFAULT 'after_discount',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `last_viewed` timestamp NULL DEFAULT NULL,
  `ip_address` varchar(191) DEFAULT NULL,
  `send_status` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `proposal_items`
--

CREATE TABLE `proposal_items` (
  `id` int(10) UNSIGNED NOT NULL,
  `proposal_id` int(10) UNSIGNED NOT NULL,
  `item_name` varchar(191) NOT NULL,
  `type` enum('item','discount','tax') NOT NULL DEFAULT 'item',
  `quantity` double(16,2) NOT NULL,
  `unit_price` double(16,2) NOT NULL,
  `amount` double(16,2) NOT NULL,
  `item_summary` text DEFAULT NULL,
  `taxes` varchar(191) DEFAULT NULL,
  `hsn_sac_code` varchar(191) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `unit_id` bigint(20) UNSIGNED DEFAULT NULL,
  `product_id` int(10) UNSIGNED DEFAULT NULL,
  `field_order` int(11) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `proposal_item_images`
--

CREATE TABLE `proposal_item_images` (
  `id` int(10) UNSIGNED NOT NULL,
  `proposal_item_id` int(10) UNSIGNED NOT NULL,
  `filename` varchar(191) NOT NULL,
  `hashname` varchar(191) DEFAULT NULL,
  `size` varchar(191) DEFAULT NULL,
  `external_link` varchar(191) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `proposal_signs`
--

CREATE TABLE `proposal_signs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `proposal_id` int(10) UNSIGNED NOT NULL,
  `full_name` varchar(191) NOT NULL,
  `email` varchar(191) NOT NULL,
  `signature` varchar(191) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `proposal_templates`
--

CREATE TABLE `proposal_templates` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `company_id` int(10) UNSIGNED DEFAULT NULL,
  `name` varchar(191) NOT NULL,
  `sub_total` double NOT NULL,
  `total` double NOT NULL,
  `currency_id` int(10) UNSIGNED DEFAULT NULL,
  `discount_type` enum('percent','fixed') NOT NULL,
  `discount` double NOT NULL,
  `invoice_convert` tinyint(1) NOT NULL DEFAULT 0,
  `description` longtext DEFAULT NULL,
  `client_comment` text DEFAULT NULL,
  `signature_approval` tinyint(1) NOT NULL DEFAULT 1,
  `hash` text DEFAULT NULL,
  `added_by` int(10) UNSIGNED DEFAULT NULL,
  `last_updated_by` int(10) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `proposal_template_items`
--

CREATE TABLE `proposal_template_items` (
  `id` int(10) UNSIGNED NOT NULL,
  `company_id` int(10) UNSIGNED DEFAULT NULL,
  `proposal_template_id` bigint(20) UNSIGNED NOT NULL,
  `hsn_sac_code` varchar(191) DEFAULT NULL,
  `item_name` varchar(191) NOT NULL,
  `type` enum('item','discount','tax') NOT NULL DEFAULT 'item',
  `quantity` double NOT NULL,
  `unit_price` double NOT NULL,
  `amount` double NOT NULL,
  `item_summary` text DEFAULT NULL,
  `taxes` varchar(191) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `unit_id` bigint(20) UNSIGNED DEFAULT NULL,
  `product_id` int(10) UNSIGNED DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `proposal_template_item_images`
--

CREATE TABLE `proposal_template_item_images` (
  `id` int(10) UNSIGNED NOT NULL,
  `company_id` int(10) UNSIGNED DEFAULT NULL,
  `proposal_template_item_id` int(10) UNSIGNED NOT NULL,
  `filename` varchar(191) NOT NULL,
  `hashname` varchar(191) DEFAULT NULL,
  `size` varchar(191) DEFAULT NULL,
  `external_link` varchar(191) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `purpose_consent`
--

CREATE TABLE `purpose_consent` (
  `id` int(10) UNSIGNED NOT NULL,
  `name` varchar(191) NOT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `purpose_consent_leads`
--

CREATE TABLE `purpose_consent_leads` (
  `id` int(10) UNSIGNED NOT NULL,
  `deal_id` bigint(20) UNSIGNED DEFAULT NULL,
  `purpose_consent_id` int(10) UNSIGNED NOT NULL,
  `status` enum('agree','disagree') NOT NULL DEFAULT 'agree',
  `ip` varchar(191) DEFAULT NULL,
  `updated_by_id` int(10) UNSIGNED DEFAULT NULL,
  `additional_description` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `purpose_consent_users`
--

CREATE TABLE `purpose_consent_users` (
  `id` int(10) UNSIGNED NOT NULL,
  `client_id` int(10) UNSIGNED NOT NULL,
  `purpose_consent_id` int(10) UNSIGNED NOT NULL,
  `status` enum('agree','disagree') NOT NULL DEFAULT 'agree',
  `ip` varchar(191) DEFAULT NULL,
  `updated_by_id` int(10) UNSIGNED NOT NULL,
  `additional_description` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `pusher_settings`
--

CREATE TABLE `pusher_settings` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `pusher_app_id` varchar(191) DEFAULT NULL,
  `pusher_app_key` varchar(191) DEFAULT NULL,
  `pusher_app_secret` varchar(191) DEFAULT NULL,
  `pusher_cluster` varchar(191) DEFAULT NULL,
  `force_tls` tinyint(1) NOT NULL,
  `status` tinyint(1) NOT NULL,
  `taskboard` tinyint(1) NOT NULL DEFAULT 1,
  `messages` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `pusher_settings`
--

INSERT INTO `pusher_settings` (`id`, `pusher_app_id`, `pusher_app_key`, `pusher_app_secret`, `pusher_cluster`, `force_tls`, `status`, `taskboard`, `messages`, `created_at`, `updated_at`) VALUES
(1, NULL, NULL, NULL, NULL, 0, 0, 1, 0, '2024-12-17 22:23:19', '2024-12-17 22:23:19');

-- --------------------------------------------------------

--
-- Table structure for table `push_notification_settings`
--

CREATE TABLE `push_notification_settings` (
  `id` int(10) UNSIGNED NOT NULL,
  `onesignal_app_id` text DEFAULT NULL,
  `onesignal_rest_api_key` text DEFAULT NULL,
  `notification_logo` varchar(191) DEFAULT NULL,
  `status` enum('active','inactive') NOT NULL DEFAULT 'inactive',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `push_notification_settings`
--

INSERT INTO `push_notification_settings` (`id`, `onesignal_app_id`, `onesignal_rest_api_key`, `notification_logo`, `status`, `created_at`, `updated_at`) VALUES
(1, NULL, NULL, NULL, 'inactive', '2024-12-17 22:23:19', '2024-12-17 22:23:19');

-- --------------------------------------------------------

--
-- Table structure for table `push_subscriptions`
--

CREATE TABLE `push_subscriptions` (
  `id` int(10) UNSIGNED NOT NULL,
  `company_id` int(10) UNSIGNED DEFAULT NULL,
  `user_id` int(10) UNSIGNED NOT NULL,
  `endpoint` varchar(191) NOT NULL,
  `public_key` varchar(191) DEFAULT NULL,
  `auth_token` varchar(191) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `qrcode`
--

CREATE TABLE `qrcode` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `qr_enable` enum('1','0') NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `quick_books_settings`
--

CREATE TABLE `quick_books_settings` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `company_id` int(10) UNSIGNED DEFAULT NULL,
  `sandbox_client_id` varchar(191) NOT NULL,
  `sandbox_client_secret` varchar(191) NOT NULL,
  `client_id` varchar(191) NOT NULL,
  `client_secret` varchar(191) NOT NULL,
  `access_token` varchar(191) NOT NULL,
  `refresh_token` varchar(191) NOT NULL,
  `realmid` varchar(191) NOT NULL,
  `sync_type` enum('one_way','two_way') NOT NULL DEFAULT 'one_way',
  `environment` enum('Development','Production') NOT NULL DEFAULT 'Production',
  `status` tinyint(1) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `quick_books_settings`
--

INSERT INTO `quick_books_settings` (`id`, `company_id`, `sandbox_client_id`, `sandbox_client_secret`, `client_id`, `client_secret`, `access_token`, `refresh_token`, `realmid`, `sync_type`, `environment`, `status`, `created_at`, `updated_at`) VALUES
(1, 1, '', '', '', '', '', '', '', 'one_way', 'Production', 0, '2024-12-17 22:23:25', '2024-12-17 22:23:25');

-- --------------------------------------------------------

--
-- Table structure for table `quotations`
--

CREATE TABLE `quotations` (
  `id` int(10) UNSIGNED NOT NULL,
  `company_id` int(10) UNSIGNED DEFAULT NULL,
  `business_name` varchar(191) NOT NULL,
  `client_name` varchar(191) NOT NULL,
  `client_email` varchar(191) NOT NULL,
  `phone` varchar(191) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `sub_total` double(8,2) NOT NULL,
  `total` double(8,2) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `quotation_items`
--

CREATE TABLE `quotation_items` (
  `id` int(10) UNSIGNED NOT NULL,
  `quotation_id` int(10) UNSIGNED NOT NULL,
  `item_name` varchar(191) NOT NULL,
  `quantity` int(11) NOT NULL,
  `unit_price` int(11) NOT NULL,
  `amount` double(8,2) NOT NULL,
  `hsn_sac_code` varchar(191) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `removal_requests`
--

CREATE TABLE `removal_requests` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `company_id` int(10) UNSIGNED DEFAULT NULL,
  `name` varchar(191) NOT NULL,
  `description` varchar(191) NOT NULL,
  `user_id` int(10) UNSIGNED DEFAULT NULL,
  `status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `removal_requests_lead`
--

CREATE TABLE `removal_requests_lead` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `company_id` int(10) UNSIGNED DEFAULT NULL,
  `name` varchar(191) NOT NULL,
  `description` varchar(191) NOT NULL,
  `lead_id` int(10) UNSIGNED DEFAULT NULL,
  `status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `roles`
--

CREATE TABLE `roles` (
  `id` int(10) UNSIGNED NOT NULL,
  `company_id` int(10) UNSIGNED DEFAULT NULL,
  `name` varchar(191) NOT NULL,
  `display_name` varchar(191) DEFAULT NULL,
  `description` varchar(191) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `roles`
--

INSERT INTO `roles` (`id`, `company_id`, `name`, `display_name`, `description`, `created_at`, `updated_at`) VALUES
(1, 1, 'admin', 'App Administrator', 'Admin is allowed to manage everything of the app.', '2024-12-17 22:23:25', '2024-12-17 22:23:25'),
(2, 1, 'employee', 'Employee', 'Employee can see tasks and projects assigned to him.', '2024-12-17 22:23:25', '2024-12-17 22:23:25'),
(3, 1, 'client', 'Client', 'Client can see own tasks and projects.', '2024-12-17 22:23:25', '2024-12-17 22:23:25');

-- --------------------------------------------------------

--
-- Table structure for table `role_user`
--

CREATE TABLE `role_user` (
  `user_id` int(10) UNSIGNED NOT NULL,
  `role_id` int(10) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `role_user`
--

INSERT INTO `role_user` (`user_id`, `role_id`) VALUES
(1, 1),
(1, 2);

-- --------------------------------------------------------

--
-- Table structure for table `rotation_automate_log`
--

CREATE TABLE `rotation_automate_log` (
  `id` int(10) UNSIGNED NOT NULL,
  `company_id` int(10) UNSIGNED DEFAULT NULL,
  `user_id` int(10) UNSIGNED NOT NULL,
  `employee_shift_rotation_id` int(10) UNSIGNED DEFAULT NULL,
  `employee_shift_id` bigint(20) UNSIGNED DEFAULT NULL,
  `sequence` int(11) DEFAULT NULL,
  `cron_run_date` date DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `sessions`
--

CREATE TABLE `sessions` (
  `id` varchar(191) NOT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `payload` mediumtext NOT NULL,
  `last_activity` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `shift_rotation_sequences`
--

CREATE TABLE `shift_rotation_sequences` (
  `id` int(10) UNSIGNED NOT NULL,
  `employee_shift_rotation_id` int(10) UNSIGNED DEFAULT NULL,
  `employee_shift_id` bigint(20) UNSIGNED DEFAULT NULL,
  `sequence` int(11) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `skills`
--

CREATE TABLE `skills` (
  `id` int(10) UNSIGNED NOT NULL,
  `company_id` int(10) UNSIGNED DEFAULT NULL,
  `name` varchar(200) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `slack_settings`
--

CREATE TABLE `slack_settings` (
  `id` int(10) UNSIGNED NOT NULL,
  `company_id` int(10) UNSIGNED DEFAULT NULL,
  `slack_webhook` text DEFAULT NULL,
  `slack_logo` varchar(191) DEFAULT NULL,
  `status` enum('active','inactive') NOT NULL DEFAULT 'inactive',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `slack_settings`
--

INSERT INTO `slack_settings` (`id`, `company_id`, `slack_webhook`, `slack_logo`, `status`, `created_at`, `updated_at`) VALUES
(1, 1, NULL, NULL, 'inactive', '2024-12-17 22:23:25', '2024-12-17 22:23:25');

-- --------------------------------------------------------

--
-- Table structure for table `smtp_settings`
--

CREATE TABLE `smtp_settings` (
  `id` int(10) UNSIGNED NOT NULL,
  `mail_driver` varchar(191) NOT NULL DEFAULT 'smtp',
  `mail_host` varchar(191) NOT NULL DEFAULT 'smtp.gmail.com',
  `mail_port` varchar(191) NOT NULL DEFAULT '587',
  `mail_username` varchar(191) NOT NULL DEFAULT 'youremail@gmail.com',
  `mail_password` text DEFAULT NULL,
  `mail_from_name` varchar(191) NOT NULL DEFAULT 'your name',
  `mail_from_email` varchar(191) NOT NULL DEFAULT 'from@email.com',
  `mail_encryption` enum('ssl','tls','starttls') DEFAULT 'tls',
  `email_verified` tinyint(1) NOT NULL DEFAULT 0,
  `verified` tinyint(1) NOT NULL DEFAULT 0,
  `mail_connection` enum('sync','database') NOT NULL DEFAULT 'sync',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `smtp_settings`
--

INSERT INTO `smtp_settings` (`id`, `mail_driver`, `mail_host`, `mail_port`, `mail_username`, `mail_password`, `mail_from_name`, `mail_from_email`, `mail_encryption`, `email_verified`, `verified`, `mail_connection`, `created_at`, `updated_at`) VALUES
(1, 'smtp', 'smtp.gmail.com', '465', 'myemail@gmail.com', NULL, 'Worksuite', 'from@email.com', 'ssl', 0, 0, 'sync', '2024-12-17 22:23:19', '2024-12-23 09:33:21');

-- --------------------------------------------------------

--
-- Table structure for table `socials`
--

CREATE TABLE `socials` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` int(10) UNSIGNED DEFAULT NULL,
  `social_id` text NOT NULL,
  `social_service` text NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `social_auth_settings`
--

CREATE TABLE `social_auth_settings` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `facebook_client_id` varchar(191) DEFAULT NULL,
  `facebook_secret_id` text DEFAULT NULL,
  `facebook_status` enum('enable','disable') NOT NULL DEFAULT 'disable',
  `google_client_id` varchar(191) DEFAULT NULL,
  `google_secret_id` text DEFAULT NULL,
  `google_status` enum('enable','disable') NOT NULL DEFAULT 'disable',
  `twitter_client_id` varchar(191) DEFAULT NULL,
  `twitter_secret_id` text DEFAULT NULL,
  `twitter_status` enum('enable','disable') NOT NULL DEFAULT 'disable',
  `linkedin_client_id` varchar(191) DEFAULT NULL,
  `linkedin_secret_id` text DEFAULT NULL,
  `linkedin_status` enum('enable','disable') NOT NULL DEFAULT 'disable',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `social_auth_settings`
--

INSERT INTO `social_auth_settings` (`id`, `facebook_client_id`, `facebook_secret_id`, `facebook_status`, `google_client_id`, `google_secret_id`, `google_status`, `twitter_client_id`, `twitter_secret_id`, `twitter_status`, `linkedin_client_id`, `linkedin_secret_id`, `linkedin_status`, `created_at`, `updated_at`) VALUES
(1, NULL, NULL, 'disable', NULL, NULL, 'disable', NULL, NULL, 'disable', NULL, NULL, 'disable', '2024-12-17 22:23:19', '2024-12-17 22:23:19');

-- --------------------------------------------------------

--
-- Table structure for table `sticky_notes`
--

CREATE TABLE `sticky_notes` (
  `id` int(10) UNSIGNED NOT NULL,
  `company_id` int(10) UNSIGNED DEFAULT NULL,
  `user_id` int(10) UNSIGNED NOT NULL,
  `note_text` mediumtext NOT NULL,
  `colour` enum('blue','yellow','red','gray','purple','green') NOT NULL DEFAULT 'blue',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `subscriptions`
--

CREATE TABLE `subscriptions` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `company_id` int(10) UNSIGNED DEFAULT NULL,
  `user_id` int(10) UNSIGNED DEFAULT NULL,
  `name` varchar(191) NOT NULL,
  `stripe_id` varchar(191) NOT NULL,
  `stripe_status` varchar(191) NOT NULL,
  `stripe_price` varchar(191) DEFAULT NULL,
  `quantity` int(11) DEFAULT NULL,
  `trial_ends_at` timestamp NULL DEFAULT NULL,
  `ends_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `subscription_items`
--

CREATE TABLE `subscription_items` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `subscription_id` bigint(20) UNSIGNED NOT NULL,
  `stripe_id` varchar(191) NOT NULL,
  `stripe_product` varchar(191) NOT NULL,
  `stripe_price` varchar(191) NOT NULL,
  `quantity` int(11) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `sub_tasks`
--

CREATE TABLE `sub_tasks` (
  `id` int(10) UNSIGNED NOT NULL,
  `task_id` int(10) UNSIGNED NOT NULL,
  `title` text NOT NULL,
  `due_date` datetime DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `status` enum('incomplete','complete') NOT NULL DEFAULT 'incomplete',
  `assigned_to` int(10) UNSIGNED DEFAULT NULL,
  `added_by` int(10) UNSIGNED DEFAULT NULL,
  `last_updated_by` int(10) UNSIGNED DEFAULT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `sub_task_files`
--

CREATE TABLE `sub_task_files` (
  `id` int(10) UNSIGNED NOT NULL,
  `user_id` int(10) UNSIGNED DEFAULT NULL,
  `sub_task_id` int(10) UNSIGNED NOT NULL,
  `filename` varchar(191) NOT NULL,
  `description` text DEFAULT NULL,
  `google_url` varchar(191) DEFAULT NULL,
  `hashname` varchar(191) DEFAULT NULL,
  `size` varchar(191) DEFAULT NULL,
  `dropbox_link` varchar(191) DEFAULT NULL,
  `external_link` varchar(191) DEFAULT NULL,
  `external_link_name` varchar(191) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `taskboard_columns`
--

CREATE TABLE `taskboard_columns` (
  `id` int(10) UNSIGNED NOT NULL,
  `company_id` int(10) UNSIGNED DEFAULT NULL,
  `column_name` varchar(191) NOT NULL,
  `slug` varchar(191) DEFAULT NULL,
  `label_color` varchar(191) NOT NULL,
  `priority` int(11) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `taskboard_columns`
--

INSERT INTO `taskboard_columns` (`id`, `company_id`, `column_name`, `slug`, `label_color`, `priority`, `created_at`, `updated_at`) VALUES
(1, 1, 'Incomplete', 'incomplete', '#d21010', 1, NULL, NULL),
(2, 1, 'To Do', 'to_do', '#f5c308', 2, NULL, NULL),
(3, 1, 'Doing', 'doing', '#00b5ff', 3, NULL, NULL),
(4, 1, 'Completed', 'completed', '#679c0d', 4, NULL, NULL),
(5, 1, 'Waiting Approval', 'waiting_approval', '#000', 5, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `tasks`
--

CREATE TABLE `tasks` (
  `id` int(10) UNSIGNED NOT NULL,
  `task_short_code` varchar(191) DEFAULT NULL,
  `company_id` int(10) UNSIGNED DEFAULT NULL,
  `heading` varchar(191) NOT NULL,
  `description` longtext DEFAULT NULL,
  `due_date` datetime DEFAULT NULL,
  `start_date` datetime DEFAULT NULL,
  `project_id` int(10) UNSIGNED DEFAULT NULL,
  `task_category_id` int(10) UNSIGNED DEFAULT NULL,
  `priority` enum('low','medium','high') NOT NULL DEFAULT 'medium',
  `status` enum('incomplete','completed') NOT NULL DEFAULT 'incomplete',
  `board_column_id` int(10) UNSIGNED DEFAULT 1,
  `column_priority` int(11) NOT NULL,
  `completed_on` datetime DEFAULT NULL,
  `created_by` int(10) UNSIGNED DEFAULT NULL,
  `recurring_task_id` int(10) UNSIGNED DEFAULT NULL,
  `dependent_task_id` int(10) UNSIGNED DEFAULT NULL,
  `milestone_id` int(10) UNSIGNED DEFAULT NULL,
  `is_private` tinyint(1) NOT NULL DEFAULT 0,
  `billable` tinyint(1) NOT NULL DEFAULT 1,
  `estimate_hours` int(11) NOT NULL,
  `estimate_minutes` int(11) NOT NULL,
  `added_by` int(10) UNSIGNED DEFAULT NULL,
  `last_updated_by` int(10) UNSIGNED DEFAULT NULL,
  `hash` varchar(64) DEFAULT NULL,
  `repeat` tinyint(1) NOT NULL DEFAULT 0,
  `repeat_complete` tinyint(1) NOT NULL DEFAULT 0,
  `repeat_count` int(11) DEFAULT NULL,
  `repeat_type` enum('day','week','month','year') NOT NULL DEFAULT 'day',
  `repeat_cycles` int(11) DEFAULT NULL,
  `event_id` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `approval_send` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `task_category`
--

CREATE TABLE `task_category` (
  `id` int(10) UNSIGNED NOT NULL,
  `company_id` int(10) UNSIGNED DEFAULT NULL,
  `category_name` varchar(191) NOT NULL,
  `added_by` int(10) UNSIGNED DEFAULT NULL,
  `last_updated_by` int(10) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `task_comments`
--

CREATE TABLE `task_comments` (
  `id` int(10) UNSIGNED NOT NULL,
  `comment` longtext NOT NULL,
  `user_id` int(10) UNSIGNED NOT NULL,
  `task_id` int(10) UNSIGNED NOT NULL,
  `added_by` int(10) UNSIGNED DEFAULT NULL,
  `last_updated_by` int(10) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `task_comment_emoji`
--

CREATE TABLE `task_comment_emoji` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` int(10) UNSIGNED DEFAULT NULL,
  `comment_id` int(10) UNSIGNED DEFAULT NULL,
  `emoji_name` varchar(191) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `task_files`
--

CREATE TABLE `task_files` (
  `id` int(10) UNSIGNED NOT NULL,
  `user_id` int(10) UNSIGNED NOT NULL,
  `task_id` int(10) UNSIGNED NOT NULL,
  `filename` varchar(191) NOT NULL,
  `description` text DEFAULT NULL,
  `google_url` varchar(191) DEFAULT NULL,
  `hashname` varchar(191) DEFAULT NULL,
  `size` varchar(191) DEFAULT NULL,
  `dropbox_link` varchar(191) DEFAULT NULL,
  `external_link` varchar(191) DEFAULT NULL,
  `external_link_name` varchar(191) DEFAULT NULL,
  `added_by` int(10) UNSIGNED DEFAULT NULL,
  `last_updated_by` int(10) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `task_history`
--

CREATE TABLE `task_history` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `task_id` int(10) UNSIGNED NOT NULL,
  `sub_task_id` int(10) UNSIGNED DEFAULT NULL,
  `user_id` int(10) UNSIGNED NOT NULL,
  `details` text NOT NULL,
  `board_column_id` int(10) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `task_labels`
--

CREATE TABLE `task_labels` (
  `id` int(10) UNSIGNED NOT NULL,
  `label_id` int(10) UNSIGNED NOT NULL,
  `task_id` int(10) UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `task_label_list`
--

CREATE TABLE `task_label_list` (
  `id` int(10) UNSIGNED NOT NULL,
  `company_id` int(10) UNSIGNED DEFAULT NULL,
  `project_id` int(10) UNSIGNED DEFAULT NULL,
  `label_name` varchar(191) NOT NULL,
  `color` varchar(191) DEFAULT NULL,
  `description` varchar(191) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `task_notes`
--

CREATE TABLE `task_notes` (
  `id` int(10) UNSIGNED NOT NULL,
  `task_id` int(10) UNSIGNED NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `note` longtext DEFAULT NULL,
  `added_by` int(10) UNSIGNED DEFAULT NULL,
  `last_updated_by` int(10) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `task_settings`
--

CREATE TABLE `task_settings` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `company_id` int(10) UNSIGNED DEFAULT NULL,
  `task_category` enum('yes','no') NOT NULL DEFAULT 'yes',
  `project` enum('yes','no') NOT NULL DEFAULT 'yes',
  `start_date` enum('yes','no') NOT NULL DEFAULT 'yes',
  `due_date` enum('yes','no') NOT NULL DEFAULT 'yes',
  `assigned_to` enum('yes','no') NOT NULL DEFAULT 'yes',
  `assigned_by` enum('yes','no') NOT NULL DEFAULT 'yes',
  `description` enum('yes','no') NOT NULL DEFAULT 'yes',
  `label` enum('yes','no') NOT NULL DEFAULT 'yes',
  `status` enum('yes','no') NOT NULL DEFAULT 'yes',
  `priority` enum('yes','no') NOT NULL DEFAULT 'yes',
  `make_private` enum('yes','no') NOT NULL DEFAULT 'yes',
  `time_estimate` enum('yes','no') NOT NULL DEFAULT 'yes',
  `hours_logged` enum('yes','no') NOT NULL DEFAULT 'yes',
  `custom_fields` enum('yes','no') NOT NULL DEFAULT 'yes',
  `copy_task_link` enum('yes','no') NOT NULL DEFAULT 'yes',
  `files` enum('yes','no') NOT NULL DEFAULT 'yes',
  `sub_task` enum('yes','no') NOT NULL DEFAULT 'yes',
  `comments` enum('yes','no') NOT NULL DEFAULT 'yes',
  `time_logs` enum('yes','no') NOT NULL DEFAULT 'yes',
  `notes` enum('yes','no') NOT NULL DEFAULT 'yes',
  `history` enum('yes','no') NOT NULL DEFAULT 'yes',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `task_settings`
--

INSERT INTO `task_settings` (`id`, `company_id`, `task_category`, `project`, `start_date`, `due_date`, `assigned_to`, `assigned_by`, `description`, `label`, `status`, `priority`, `make_private`, `time_estimate`, `hours_logged`, `custom_fields`, `copy_task_link`, `files`, `sub_task`, `comments`, `time_logs`, `notes`, `history`, `created_at`, `updated_at`) VALUES
(1, 1, 'yes', 'yes', 'yes', 'yes', 'yes', 'yes', 'yes', 'yes', 'yes', 'yes', 'yes', 'yes', 'yes', 'yes', 'yes', 'yes', 'yes', 'yes', 'yes', 'yes', 'yes', '2024-12-17 22:23:25', '2024-12-17 22:23:25');

-- --------------------------------------------------------

--
-- Table structure for table `task_users`
--

CREATE TABLE `task_users` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `task_id` int(10) UNSIGNED NOT NULL,
  `user_id` int(10) UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `taxes`
--

CREATE TABLE `taxes` (
  `id` int(10) UNSIGNED NOT NULL,
  `company_id` int(10) UNSIGNED DEFAULT NULL,
  `tax_name` varchar(191) NOT NULL,
  `rate_percent` varchar(191) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `teams`
--

CREATE TABLE `teams` (
  `id` int(10) UNSIGNED NOT NULL,
  `company_id` int(10) UNSIGNED DEFAULT NULL,
  `team_name` varchar(191) NOT NULL,
  `parent_id` int(10) UNSIGNED DEFAULT NULL,
  `added_by` int(10) UNSIGNED DEFAULT NULL,
  `last_updated_by` int(10) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `theme_settings`
--

CREATE TABLE `theme_settings` (
  `id` int(10) UNSIGNED NOT NULL,
  `company_id` int(10) UNSIGNED DEFAULT NULL,
  `panel` varchar(191) NOT NULL,
  `header_color` varchar(191) NOT NULL,
  `sidebar_color` varchar(191) NOT NULL,
  `sidebar_text_color` varchar(191) NOT NULL,
  `link_color` varchar(191) NOT NULL DEFAULT '#ffffff',
  `user_css` longtext DEFAULT NULL,
  `sidebar_theme` enum('dark','light') NOT NULL DEFAULT 'dark',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `theme_settings`
--

INSERT INTO `theme_settings` (`id`, `company_id`, `panel`, `header_color`, `sidebar_color`, `sidebar_text_color`, `link_color`, `user_css`, `sidebar_theme`, `created_at`, `updated_at`) VALUES
(1, 1, 'admin', '#1D82F5', '#171F29', '#99A5B5', '#F7FAFF', NULL, 'dark', NULL, '2024-12-23 09:34:51'),
(2, 1, 'project_admin', '#1d82f5', '#171F29', '#99A5B5', '#F7FAFF', NULL, 'dark', NULL, NULL),
(3, 1, 'employee', '#1D82F5', '#171F29', '#99A5B5', '#F7FAFF', NULL, 'dark', NULL, '2024-12-23 09:34:51'),
(4, 1, 'client', '#1D82F5', '#171F29', '#99A5B5', '#F7FAFF', NULL, 'dark', NULL, '2024-12-23 09:34:51');

-- --------------------------------------------------------

--
-- Table structure for table `tickets`
--

CREATE TABLE `tickets` (
  `id` int(10) UNSIGNED NOT NULL,
  `ticket_number` bigint(20) DEFAULT NULL,
  `company_id` int(10) UNSIGNED DEFAULT NULL,
  `user_id` int(10) UNSIGNED NOT NULL,
  `subject` text NOT NULL,
  `status` enum('open','pending','resolved','closed') NOT NULL DEFAULT 'open',
  `priority` enum('low','medium','high','urgent') NOT NULL DEFAULT 'medium',
  `agent_id` int(10) UNSIGNED DEFAULT NULL,
  `channel_id` int(10) UNSIGNED DEFAULT NULL,
  `type_id` int(10) UNSIGNED DEFAULT NULL,
  `group_id` int(10) UNSIGNED DEFAULT NULL,
  `project_id` int(10) UNSIGNED DEFAULT NULL,
  `close_date` date DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `mobile` varchar(191) DEFAULT NULL,
  `country_id` int(10) UNSIGNED DEFAULT NULL,
  `added_by` int(10) UNSIGNED DEFAULT NULL,
  `last_updated_by` int(10) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `ticket_activities`
--

CREATE TABLE `ticket_activities` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `ticket_id` int(10) UNSIGNED NOT NULL,
  `user_id` int(10) UNSIGNED NOT NULL,
  `assigned_to` int(10) UNSIGNED DEFAULT NULL,
  `channel_id` int(10) UNSIGNED DEFAULT NULL,
  `group_id` int(10) UNSIGNED DEFAULT NULL,
  `type_id` int(10) UNSIGNED DEFAULT NULL,
  `status` varchar(191) NOT NULL DEFAULT 'open',
  `priority` varchar(191) NOT NULL DEFAULT 'medium',
  `type` varchar(191) NOT NULL DEFAULT 'create',
  `content` longtext DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `ticket_agent_groups`
--

CREATE TABLE `ticket_agent_groups` (
  `id` int(10) UNSIGNED NOT NULL,
  `company_id` int(10) UNSIGNED DEFAULT NULL,
  `agent_id` int(10) UNSIGNED NOT NULL,
  `group_id` int(10) UNSIGNED DEFAULT NULL,
  `status` enum('enabled','disabled') NOT NULL DEFAULT 'enabled',
  `added_by` int(10) UNSIGNED DEFAULT NULL,
  `last_updated_by` int(10) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `ticket_channels`
--

CREATE TABLE `ticket_channels` (
  `id` int(10) UNSIGNED NOT NULL,
  `company_id` int(10) UNSIGNED DEFAULT NULL,
  `channel_name` varchar(191) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `ticket_channels`
--

INSERT INTO `ticket_channels` (`id`, `company_id`, `channel_name`, `created_at`, `updated_at`) VALUES
(1, 1, 'Email', NULL, NULL),
(2, 1, 'Phone', NULL, NULL),
(3, 1, 'Twitter', NULL, NULL),
(4, 1, 'Facebook', NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `ticket_custom_forms`
--

CREATE TABLE `ticket_custom_forms` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `company_id` int(10) UNSIGNED DEFAULT NULL,
  `custom_fields_id` int(10) UNSIGNED DEFAULT NULL,
  `field_display_name` varchar(191) NOT NULL,
  `field_name` varchar(191) NOT NULL,
  `field_type` varchar(191) NOT NULL DEFAULT 'text',
  `field_order` int(11) NOT NULL,
  `status` enum('active','inactive') NOT NULL DEFAULT 'active',
  `required` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `ticket_custom_forms`
--

INSERT INTO `ticket_custom_forms` (`id`, `company_id`, `custom_fields_id`, `field_display_name`, `field_name`, `field_type`, `field_order`, `status`, `required`, `created_at`, `updated_at`) VALUES
(1, 1, NULL, 'Name', 'name', 'text', 1, 'active', 0, '2024-12-17 22:23:25', '2024-12-17 22:23:25'),
(2, 1, NULL, 'Email', 'email', 'text', 2, 'active', 0, '2024-12-17 22:23:25', '2024-12-17 22:23:25'),
(3, 1, NULL, 'Ticket Subject', 'ticket_subject', 'text', 3, 'active', 0, '2024-12-17 22:23:25', '2024-12-17 22:23:25'),
(4, 1, NULL, 'Ticket Description', 'ticket_description', 'textarea', 4, 'active', 0, '2024-12-17 22:23:25', '2024-12-17 22:23:25'),
(5, 1, NULL, 'Type', 'type', 'select', 5, 'active', 0, '2024-12-17 22:23:25', '2024-12-17 22:23:25'),
(6, 1, NULL, 'Priority', 'priority', 'select', 6, 'active', 0, '2024-12-17 22:23:25', '2024-12-17 22:23:25'),
(7, 1, NULL, 'Assign Group', 'assign_group', 'select', 7, 'active', 0, '2024-12-17 22:23:25', '2024-12-17 22:23:25');

-- --------------------------------------------------------

--
-- Table structure for table `ticket_email_settings`
--

CREATE TABLE `ticket_email_settings` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `company_id` int(10) UNSIGNED DEFAULT NULL,
  `mail_username` varchar(191) DEFAULT NULL,
  `mail_password` varchar(191) DEFAULT NULL,
  `mail_from_name` varchar(191) DEFAULT NULL,
  `mail_from_email` varchar(191) DEFAULT NULL,
  `imap_host` varchar(191) DEFAULT NULL,
  `imap_port` varchar(191) DEFAULT NULL,
  `imap_encryption` varchar(191) DEFAULT NULL,
  `status` tinyint(1) NOT NULL,
  `verified` tinyint(1) NOT NULL,
  `sync_interval` int(11) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `ticket_email_settings`
--

INSERT INTO `ticket_email_settings` (`id`, `company_id`, `mail_username`, `mail_password`, `mail_from_name`, `mail_from_email`, `imap_host`, `imap_port`, `imap_encryption`, `status`, `verified`, `sync_interval`, `created_at`, `updated_at`) VALUES
(1, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, 1, '2024-12-17 22:23:25', '2024-12-17 22:23:25');

-- --------------------------------------------------------

--
-- Table structure for table `ticket_files`
--

CREATE TABLE `ticket_files` (
  `id` int(10) UNSIGNED NOT NULL,
  `user_id` int(10) UNSIGNED NOT NULL,
  `ticket_reply_id` int(10) UNSIGNED NOT NULL,
  `filename` varchar(191) NOT NULL,
  `description` text DEFAULT NULL,
  `google_url` varchar(191) DEFAULT NULL,
  `hashname` varchar(191) DEFAULT NULL,
  `size` varchar(191) DEFAULT NULL,
  `dropbox_link` varchar(191) DEFAULT NULL,
  `external_link` varchar(191) DEFAULT NULL,
  `external_link_name` varchar(191) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `ticket_groups`
--

CREATE TABLE `ticket_groups` (
  `id` int(10) UNSIGNED NOT NULL,
  `company_id` int(10) UNSIGNED DEFAULT NULL,
  `group_name` varchar(191) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `ticket_replies`
--

CREATE TABLE `ticket_replies` (
  `id` int(10) UNSIGNED NOT NULL,
  `ticket_id` int(10) UNSIGNED NOT NULL,
  `user_id` int(10) UNSIGNED NOT NULL,
  `message` mediumtext DEFAULT NULL,
  `type` enum('reply','note') NOT NULL DEFAULT 'reply',
  `deleted_at` timestamp NULL DEFAULT NULL,
  `imap_message_id` varchar(191) DEFAULT NULL,
  `imap_message_uid` varchar(191) DEFAULT NULL,
  `imap_in_reply_to` varchar(191) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `ticket_reply_templates`
--

CREATE TABLE `ticket_reply_templates` (
  `id` int(10) UNSIGNED NOT NULL,
  `company_id` int(10) UNSIGNED DEFAULT NULL,
  `reply_heading` mediumtext NOT NULL,
  `reply_text` mediumtext NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `ticket_reply_users`
--

CREATE TABLE `ticket_reply_users` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `ticket_reply_id` int(10) UNSIGNED NOT NULL,
  `user_id` int(10) UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `ticket_settings_for_agents`
--

CREATE TABLE `ticket_settings_for_agents` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` int(10) UNSIGNED DEFAULT NULL,
  `company_id` int(10) UNSIGNED DEFAULT NULL,
  `ticket_scope` varchar(191) DEFAULT NULL,
  `group_id` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`group_id`)),
  `updated_by` int(10) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `ticket_settings_for_agents`
--

INSERT INTO `ticket_settings_for_agents` (`id`, `user_id`, `company_id`, `ticket_scope`, `group_id`, `updated_by`, `created_at`, `updated_at`) VALUES
(1, NULL, 1, 'assigned_tickets', NULL, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `ticket_tags`
--

CREATE TABLE `ticket_tags` (
  `id` int(10) UNSIGNED NOT NULL,
  `company_id` int(10) UNSIGNED DEFAULT NULL,
  `tag_id` int(10) UNSIGNED NOT NULL,
  `ticket_id` int(10) UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `ticket_tag_list`
--

CREATE TABLE `ticket_tag_list` (
  `id` int(10) UNSIGNED NOT NULL,
  `company_id` int(10) UNSIGNED DEFAULT NULL,
  `tag_name` varchar(191) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `ticket_types`
--

CREATE TABLE `ticket_types` (
  `id` int(10) UNSIGNED NOT NULL,
  `company_id` int(10) UNSIGNED DEFAULT NULL,
  `type` varchar(191) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `ticket_types`
--

INSERT INTO `ticket_types` (`id`, `company_id`, `type`, `created_at`, `updated_at`) VALUES
(1, 1, 'Bug', NULL, NULL),
(2, 1, 'Suggestion', NULL, NULL),
(3, 1, 'Question', NULL, NULL),
(4, 1, 'Sales', NULL, NULL),
(5, 1, 'Code', NULL, NULL),
(6, 1, 'Management', NULL, NULL),
(7, 1, 'Problem', NULL, NULL),
(8, 1, 'Incident', NULL, NULL),
(9, 1, 'Feature Request', NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `track_devices`
--

CREATE TABLE `track_devices` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `device_uuid` varchar(191) NOT NULL,
  `device_type` varchar(191) NOT NULL,
  `ip` varchar(40) NOT NULL,
  `device_hijacked_at` timestamp NULL DEFAULT NULL,
  `data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`data`)),
  `is_rogue_device` tinyint(1) NOT NULL DEFAULT 0,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `track_devices`
--

INSERT INTO `track_devices` (`id`, `device_uuid`, `device_type`, `ip`, `device_hijacked_at`, `data`, `is_rogue_device`, `deleted_at`, `created_at`, `updated_at`) VALUES
(1, 'd6ef32eb-5e51-49fb-9ddd-d808bfe68673q3hFfrWBVGMUpdHUwOJNUXo7UmiQp7B5LZSjSjDzO7MHCrkyckCcGX3n39zLDOPg', 'Windows|Chrome', '::1', NULL, '{\"is_bot\":false,\"version\":\"131\",\"engine\":\"Blink\",\"platform_family\":\"Windows\",\"platform_name\":\"Windows 10\",\"platform_version\":\"10\",\"device_model\":\"\",\"ip_addresses\":[\"::1\"],\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/131.0.0.0 Safari\\/537.36\"}', 0, NULL, '2024-12-17 22:24:14', '2024-12-17 22:24:14'),
(2, '4014eeb8-5c40-45b2-9f66-cf58fdfb6eb5LtxNUxsUSp5eIDoDvzdFxOmpkVp5sdP5wsX3PEdIhTMveSwV9N1fKMGp3rJlZeGb', 'Windows|Chrome', '103.131.145.159', NULL, '{\"is_bot\":false,\"version\":\"131\",\"engine\":\"Blink\",\"platform_family\":\"Windows\",\"platform_name\":\"Windows 10\",\"platform_version\":\"10\",\"device_model\":\"\",\"ip_addresses\":[\"103.131.145.159\"],\"user_agent\":\"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/131.0.0.0 Safari\\/537.36\"}', 0, NULL, '2024-12-23 09:29:00', '2024-12-23 09:34:04');

-- --------------------------------------------------------

--
-- Table structure for table `translate_settings`
--

CREATE TABLE `translate_settings` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `google_key` varchar(191) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `translate_settings`
--

INSERT INTO `translate_settings` (`id`, `google_key`, `created_at`, `updated_at`) VALUES
(1, NULL, '2024-12-17 22:23:19', '2024-12-17 22:23:19');

-- --------------------------------------------------------

--
-- Table structure for table `unit_types`
--

CREATE TABLE `unit_types` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `company_id` int(10) UNSIGNED DEFAULT NULL,
  `unit_type` varchar(191) NOT NULL,
  `default` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `unit_types`
--

INSERT INTO `unit_types` (`id`, `company_id`, `unit_type`, `default`, `created_at`, `updated_at`) VALUES
(1, 1, 'Pcs', 1, '2024-12-17 22:23:25', '2024-12-17 22:23:25');

-- --------------------------------------------------------

--
-- Table structure for table `universal_search`
--

CREATE TABLE `universal_search` (
  `id` int(10) UNSIGNED NOT NULL,
  `company_id` int(10) UNSIGNED DEFAULT NULL,
  `searchable_id` int(11) NOT NULL,
  `module_type` enum('ticket','invoice','notice','proposal','task','creditNote','client','employee','project','estimate','lead') DEFAULT NULL,
  `title` varchar(191) NOT NULL,
  `route_name` varchar(191) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `universal_search`
--

INSERT INTO `universal_search` (`id`, `company_id`, `searchable_id`, `module_type`, `title`, `route_name`, `created_at`, `updated_at`) VALUES
(1, NULL, 1, NULL, 'daily janatar bangladesh', 'employees.show', '2024-12-17 22:24:12', '2024-12-17 22:24:12');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(10) UNSIGNED NOT NULL,
  `company_id` int(10) UNSIGNED DEFAULT NULL,
  `name` varchar(191) NOT NULL,
  `email` varchar(191) DEFAULT NULL,
  `password` varchar(191) NOT NULL,
  `two_factor_secret` text DEFAULT NULL,
  `two_factor_recovery_codes` text DEFAULT NULL,
  `two_factor_confirmed` tinyint(1) NOT NULL DEFAULT 0,
  `two_factor_email_confirmed` tinyint(1) NOT NULL DEFAULT 0,
  `image` varchar(191) DEFAULT NULL,
  `country_phonecode` int(11) DEFAULT NULL,
  `mobile` varchar(191) DEFAULT NULL,
  `gender` enum('male','female','others') DEFAULT 'male',
  `salutation` enum('mr','mrs','miss','dr','sir','madam') DEFAULT NULL,
  `locale` varchar(191) NOT NULL DEFAULT 'en',
  `status` enum('active','deactive') NOT NULL DEFAULT 'active',
  `login` enum('enable','disable') NOT NULL DEFAULT 'enable',
  `onesignal_player_id` text DEFAULT NULL,
  `last_login` timestamp NULL DEFAULT NULL,
  `email_notifications` tinyint(1) NOT NULL DEFAULT 1,
  `country_id` int(10) UNSIGNED DEFAULT NULL,
  `dark_theme` tinyint(1) NOT NULL,
  `rtl` tinyint(1) NOT NULL,
  `two_fa_verify_via` enum('email','google_authenticator','both') DEFAULT NULL,
  `two_factor_code` varchar(191) DEFAULT NULL COMMENT 'when authenticator is email',
  `two_factor_expires_at` datetime DEFAULT NULL,
  `admin_approval` tinyint(1) NOT NULL DEFAULT 1,
  `permission_sync` tinyint(1) NOT NULL DEFAULT 1,
  `google_calendar_status` tinyint(1) NOT NULL DEFAULT 1,
  `remember_token` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `customised_permissions` tinyint(1) NOT NULL DEFAULT 0,
  `stripe_id` varchar(191) DEFAULT NULL,
  `pm_type` varchar(191) DEFAULT NULL,
  `pm_last_four` varchar(4) DEFAULT NULL,
  `trial_ends_at` timestamp NULL DEFAULT NULL,
  `headers` text DEFAULT NULL,
  `register_ip` varchar(191) DEFAULT NULL,
  `location_details` text DEFAULT NULL,
  `inactive_date` date DEFAULT NULL,
  `twitter_id` varchar(191) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `company_id`, `name`, `email`, `password`, `two_factor_secret`, `two_factor_recovery_codes`, `two_factor_confirmed`, `two_factor_email_confirmed`, `image`, `country_phonecode`, `mobile`, `gender`, `salutation`, `locale`, `status`, `login`, `onesignal_player_id`, `last_login`, `email_notifications`, `country_id`, `dark_theme`, `rtl`, `two_fa_verify_via`, `two_factor_code`, `two_factor_expires_at`, `admin_approval`, `permission_sync`, `google_calendar_status`, `remember_token`, `created_at`, `updated_at`, `customised_permissions`, `stripe_id`, `pm_type`, `pm_last_four`, `trial_ends_at`, `headers`, `register_ip`, `location_details`, `inactive_date`, `twitter_id`) VALUES
(1, 1, 'Elite Design', 'info@elitedesign.com.bd', '$2y$10$q1cemHLxg298J7dsR6MWIOPB.0cWuesGBOdxfb1F2saaXPY.qkt8m', NULL, NULL, 0, 0, NULL, 0, NULL, 'male', NULL, 'en', 'active', 'enable', NULL, '2024-12-23 09:34:04', 1, NULL, 0, 0, NULL, NULL, NULL, 1, 1, 1, NULL, '2024-12-17 22:24:09', '2024-12-23 09:34:04', 0, NULL, NULL, NULL, NULL, '{\n    \"userAgent\": \"Mozilla\\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\\/537.36 (KHTML, like Gecko) Chrome\\/131.0.0.0 Safari\\/537.36\",\n    \"isMobile\": false,\n    \"isTablet\": false,\n    \"isDesktop\": true,\n    \"isBot\": false,\n    \"isChrome\": true,\n    \"isFirefox\": false,\n    \"isOpera\": false,\n    \"isSafari\": false,\n    \"isEdge\": false,\n    \"isInApp\": false,\n    \"isIE\": false,\n    \"browserName\": \"Chrome 131\",\n    \"browserFamily\": \"Chrome\",\n    \"browserVersion\": \"131\",\n    \"browserVersionMajor\": 131,\n    \"browserVersionMinor\": 0,\n    \"browserVersionPatch\": 0,\n    \"browserEngine\": \"Blink\",\n    \"platformName\": \"Windows 10\",\n    \"platformFamily\": \"Windows\",\n    \"platformVersion\": \"10\",\n    \"platformVersionMajor\": 10,\n    \"platformVersionMinor\": 0,\n    \"platformVersionPatch\": 0,\n    \"isWindows\": true,\n    \"isLinux\": false,\n    \"isMac\": false,\n    \"isAndroid\": false,\n    \"deviceFamily\": \"Unknown\",\n    \"deviceModel\": \"\"\n}', NULL, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `users_chat`
--

CREATE TABLE `users_chat` (
  `id` int(10) UNSIGNED NOT NULL,
  `company_id` int(10) UNSIGNED DEFAULT NULL,
  `user_one` int(10) UNSIGNED NOT NULL,
  `user_id` int(10) UNSIGNED NOT NULL,
  `message` mediumtext DEFAULT NULL,
  `from` int(10) UNSIGNED DEFAULT NULL,
  `to` int(10) UNSIGNED DEFAULT NULL,
  `message_seen` enum('yes','no') NOT NULL DEFAULT 'no',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `notification_sent` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users_chat_files`
--

CREATE TABLE `users_chat_files` (
  `id` int(10) UNSIGNED NOT NULL,
  `company_id` int(10) UNSIGNED DEFAULT NULL,
  `user_id` int(10) UNSIGNED NOT NULL,
  `users_chat_id` int(10) UNSIGNED NOT NULL,
  `filename` varchar(191) NOT NULL,
  `description` text DEFAULT NULL,
  `google_url` varchar(191) DEFAULT NULL,
  `hashname` varchar(191) DEFAULT NULL,
  `size` varchar(191) DEFAULT NULL,
  `external_link` varchar(191) DEFAULT NULL,
  `external_link_name` varchar(191) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `user_activities`
--

CREATE TABLE `user_activities` (
  `id` int(10) UNSIGNED NOT NULL,
  `company_id` int(10) UNSIGNED DEFAULT NULL,
  `user_id` int(10) UNSIGNED NOT NULL,
  `activity` text NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `user_activities`
--

INSERT INTO `user_activities` (`id`, `company_id`, `user_id`, `activity`, `created_at`, `updated_at`) VALUES
(1, 1, 1, 'messages.updatedProfile', '2024-12-23 09:33:13', '2024-12-23 09:33:13');

-- --------------------------------------------------------

--
-- Table structure for table `user_invitations`
--

CREATE TABLE `user_invitations` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `company_id` int(10) UNSIGNED DEFAULT NULL,
  `user_id` int(10) UNSIGNED NOT NULL,
  `invitation_type` enum('email','link') NOT NULL DEFAULT 'email',
  `email` varchar(191) DEFAULT NULL,
  `invitation_code` varchar(191) NOT NULL,
  `status` enum('active','inactive') NOT NULL DEFAULT 'active',
  `email_restriction` varchar(191) DEFAULT NULL,
  `message` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `user_leadboard_settings`
--

CREATE TABLE `user_leadboard_settings` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `company_id` int(10) UNSIGNED DEFAULT NULL,
  `user_id` int(10) UNSIGNED NOT NULL,
  `pipeline_stage_id` int(10) UNSIGNED DEFAULT NULL,
  `collapsed` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `user_permissions`
--

CREATE TABLE `user_permissions` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` int(10) UNSIGNED NOT NULL,
  `permission_id` int(10) UNSIGNED NOT NULL,
  `permission_type_id` bigint(20) UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `user_permissions`
--

INSERT INTO `user_permissions` (`id`, `user_id`, `permission_id`, `permission_type_id`, `created_at`, `updated_at`) VALUES
(1, 1, 1, 4, '2024-12-17 22:24:12', '2024-12-17 22:24:12'),
(2, 1, 2, 4, '2024-12-17 22:24:12', '2024-12-17 22:24:12'),
(3, 1, 3, 4, '2024-12-17 22:24:12', '2024-12-17 22:24:12'),
(4, 1, 4, 4, '2024-12-17 22:24:12', '2024-12-17 22:24:12'),
(5, 1, 6, 4, '2024-12-17 22:24:12', '2024-12-17 22:24:12'),
(6, 1, 11, 4, '2024-12-17 22:24:12', '2024-12-17 22:24:12'),
(7, 1, 12, 4, '2024-12-17 22:24:12', '2024-12-17 22:24:12'),
(8, 1, 13, 4, '2024-12-17 22:24:12', '2024-12-17 22:24:12'),
(9, 1, 14, 4, '2024-12-17 22:24:12', '2024-12-17 22:24:12'),
(10, 1, 15, 4, '2024-12-17 22:24:12', '2024-12-17 22:24:12'),
(11, 1, 16, 4, '2024-12-17 22:24:12', '2024-12-17 22:24:12'),
(12, 1, 17, 4, '2024-12-17 22:24:12', '2024-12-17 22:24:12'),
(13, 1, 18, 4, '2024-12-17 22:24:12', '2024-12-17 22:24:12'),
(14, 1, 19, 4, '2024-12-17 22:24:12', '2024-12-17 22:24:12'),
(15, 1, 20, 4, '2024-12-17 22:24:12', '2024-12-17 22:24:12'),
(16, 1, 21, 4, '2024-12-17 22:24:12', '2024-12-17 22:24:12'),
(17, 1, 22, 4, '2024-12-17 22:24:12', '2024-12-17 22:24:12'),
(18, 1, 23, 4, '2024-12-17 22:24:12', '2024-12-17 22:24:12'),
(19, 1, 24, 4, '2024-12-17 22:24:12', '2024-12-17 22:24:12'),
(20, 1, 25, 4, '2024-12-17 22:24:12', '2024-12-17 22:24:12'),
(21, 1, 26, 4, '2024-12-17 22:24:12', '2024-12-17 22:24:12'),
(22, 1, 27, 4, '2024-12-17 22:24:12', '2024-12-17 22:24:12'),
(23, 1, 28, 4, '2024-12-17 22:24:12', '2024-12-17 22:24:12'),
(24, 1, 29, 4, '2024-12-17 22:24:12', '2024-12-17 22:24:12'),
(25, 1, 30, 4, '2024-12-17 22:24:12', '2024-12-17 22:24:12'),
(26, 1, 31, 4, '2024-12-17 22:24:12', '2024-12-17 22:24:12'),
(27, 1, 32, 4, '2024-12-17 22:24:12', '2024-12-17 22:24:12'),
(28, 1, 33, 4, '2024-12-17 22:24:12', '2024-12-17 22:24:12'),
(29, 1, 34, 4, '2024-12-17 22:24:12', '2024-12-17 22:24:12'),
(30, 1, 35, 4, '2024-12-17 22:24:12', '2024-12-17 22:24:12'),
(31, 1, 36, 4, '2024-12-17 22:24:12', '2024-12-17 22:24:12'),
(32, 1, 37, 4, '2024-12-17 22:24:12', '2024-12-17 22:24:12'),
(33, 1, 38, 4, '2024-12-17 22:24:12', '2024-12-17 22:24:12'),
(34, 1, 39, 4, '2024-12-17 22:24:12', '2024-12-17 22:24:12'),
(35, 1, 40, 4, '2024-12-17 22:24:12', '2024-12-17 22:24:12'),
(36, 1, 41, 4, '2024-12-17 22:24:13', '2024-12-17 22:24:13'),
(37, 1, 42, 4, '2024-12-17 22:24:13', '2024-12-17 22:24:13'),
(38, 1, 43, 4, '2024-12-17 22:24:13', '2024-12-17 22:24:13'),
(39, 1, 44, 4, '2024-12-17 22:24:13', '2024-12-17 22:24:13'),
(40, 1, 45, 4, '2024-12-17 22:24:13', '2024-12-17 22:24:13'),
(41, 1, 46, 4, '2024-12-17 22:24:13', '2024-12-17 22:24:13'),
(42, 1, 47, 4, '2024-12-17 22:24:13', '2024-12-17 22:24:13'),
(43, 1, 48, 4, '2024-12-17 22:24:13', '2024-12-17 22:24:13'),
(44, 1, 49, 4, '2024-12-17 22:24:13', '2024-12-17 22:24:13'),
(45, 1, 50, 4, '2024-12-17 22:24:13', '2024-12-17 22:24:13'),
(46, 1, 51, 4, '2024-12-17 22:24:13', '2024-12-17 22:24:13'),
(47, 1, 52, 4, '2024-12-17 22:24:13', '2024-12-17 22:24:13'),
(48, 1, 53, 4, '2024-12-17 22:24:13', '2024-12-17 22:24:13'),
(49, 1, 54, 4, '2024-12-17 22:24:13', '2024-12-17 22:24:13'),
(50, 1, 55, 4, '2024-12-17 22:24:13', '2024-12-17 22:24:13'),
(51, 1, 56, 4, '2024-12-17 22:24:13', '2024-12-17 22:24:13'),
(52, 1, 57, 4, '2024-12-17 22:24:13', '2024-12-17 22:24:13'),
(53, 1, 58, 4, '2024-12-17 22:24:13', '2024-12-17 22:24:13'),
(54, 1, 59, 4, '2024-12-17 22:24:13', '2024-12-17 22:24:13'),
(55, 1, 60, 4, '2024-12-17 22:24:13', '2024-12-17 22:24:13'),
(56, 1, 61, 4, '2024-12-17 22:24:13', '2024-12-17 22:24:13'),
(57, 1, 62, 4, '2024-12-17 22:24:13', '2024-12-17 22:24:13'),
(58, 1, 63, 4, '2024-12-17 22:24:13', '2024-12-17 22:24:13'),
(59, 1, 64, 4, '2024-12-17 22:24:13', '2024-12-17 22:24:13'),
(60, 1, 65, 4, '2024-12-17 22:24:13', '2024-12-17 22:24:13'),
(61, 1, 66, 4, '2024-12-17 22:24:13', '2024-12-17 22:24:13'),
(62, 1, 67, 4, '2024-12-17 22:24:13', '2024-12-17 22:24:13'),
(63, 1, 68, 4, '2024-12-17 22:24:13', '2024-12-17 22:24:13'),
(64, 1, 69, 4, '2024-12-17 22:24:13', '2024-12-17 22:24:13'),
(65, 1, 70, 4, '2024-12-17 22:24:13', '2024-12-17 22:24:13'),
(66, 1, 71, 4, '2024-12-17 22:24:13', '2024-12-17 22:24:13'),
(67, 1, 72, 4, '2024-12-17 22:24:13', '2024-12-17 22:24:13'),
(68, 1, 73, 4, '2024-12-17 22:24:13', '2024-12-17 22:24:13'),
(69, 1, 74, 4, '2024-12-17 22:24:13', '2024-12-17 22:24:13'),
(70, 1, 75, 4, '2024-12-17 22:24:13', '2024-12-17 22:24:13'),
(71, 1, 76, 4, '2024-12-17 22:24:13', '2024-12-17 22:24:13'),
(72, 1, 77, 4, '2024-12-17 22:24:13', '2024-12-17 22:24:13'),
(73, 1, 78, 4, '2024-12-17 22:24:13', '2024-12-17 22:24:13'),
(74, 1, 79, 4, '2024-12-17 22:24:13', '2024-12-17 22:24:13'),
(75, 1, 80, 4, '2024-12-17 22:24:13', '2024-12-17 22:24:13'),
(76, 1, 81, 4, '2024-12-17 22:24:13', '2024-12-17 22:24:13'),
(77, 1, 82, 4, '2024-12-17 22:24:13', '2024-12-17 22:24:13'),
(78, 1, 83, 4, '2024-12-17 22:24:13', '2024-12-17 22:24:13'),
(79, 1, 84, 4, '2024-12-17 22:24:13', '2024-12-17 22:24:13'),
(80, 1, 85, 4, '2024-12-17 22:24:13', '2024-12-17 22:24:13'),
(81, 1, 86, 4, '2024-12-17 22:24:13', '2024-12-17 22:24:13'),
(82, 1, 87, 4, '2024-12-17 22:24:13', '2024-12-17 22:24:13'),
(83, 1, 88, 4, '2024-12-17 22:24:13', '2024-12-17 22:24:13'),
(84, 1, 89, 4, '2024-12-17 22:24:13', '2024-12-17 22:24:13'),
(85, 1, 90, 4, '2024-12-17 22:24:13', '2024-12-17 22:24:13'),
(86, 1, 91, 4, '2024-12-17 22:24:13', '2024-12-17 22:24:13'),
(87, 1, 92, 4, '2024-12-17 22:24:13', '2024-12-17 22:24:13'),
(88, 1, 93, 4, '2024-12-17 22:24:13', '2024-12-17 22:24:13'),
(89, 1, 94, 4, '2024-12-17 22:24:13', '2024-12-17 22:24:13'),
(90, 1, 95, 4, '2024-12-17 22:24:13', '2024-12-17 22:24:13'),
(91, 1, 96, 4, '2024-12-17 22:24:13', '2024-12-17 22:24:13'),
(92, 1, 97, 4, '2024-12-17 22:24:13', '2024-12-17 22:24:13'),
(93, 1, 98, 4, '2024-12-17 22:24:13', '2024-12-17 22:24:13'),
(94, 1, 99, 4, '2024-12-17 22:24:13', '2024-12-17 22:24:13'),
(95, 1, 100, 4, '2024-12-17 22:24:13', '2024-12-17 22:24:13'),
(96, 1, 101, 4, '2024-12-17 22:24:13', '2024-12-17 22:24:13'),
(97, 1, 102, 4, '2024-12-17 22:24:13', '2024-12-17 22:24:13'),
(98, 1, 103, 4, '2024-12-17 22:24:13', '2024-12-17 22:24:13'),
(99, 1, 104, 4, '2024-12-17 22:24:13', '2024-12-17 22:24:13'),
(100, 1, 105, 4, '2024-12-17 22:24:13', '2024-12-17 22:24:13'),
(101, 1, 106, 4, '2024-12-17 22:24:13', '2024-12-17 22:24:13'),
(102, 1, 107, 4, '2024-12-17 22:24:13', '2024-12-17 22:24:13'),
(103, 1, 108, 4, '2024-12-17 22:24:13', '2024-12-17 22:24:13'),
(104, 1, 109, 4, '2024-12-17 22:24:13', '2024-12-17 22:24:13'),
(105, 1, 110, 4, '2024-12-17 22:24:13', '2024-12-17 22:24:13'),
(106, 1, 111, 4, '2024-12-17 22:24:13', '2024-12-17 22:24:13'),
(107, 1, 112, 4, '2024-12-17 22:24:13', '2024-12-17 22:24:13'),
(108, 1, 113, 4, '2024-12-17 22:24:13', '2024-12-17 22:24:13'),
(109, 1, 114, 4, '2024-12-17 22:24:13', '2024-12-17 22:24:13'),
(110, 1, 115, 4, '2024-12-17 22:24:13', '2024-12-17 22:24:13'),
(111, 1, 116, 4, '2024-12-17 22:24:13', '2024-12-17 22:24:13'),
(112, 1, 117, 4, '2024-12-17 22:24:13', '2024-12-17 22:24:13'),
(113, 1, 118, 4, '2024-12-17 22:24:13', '2024-12-17 22:24:13'),
(114, 1, 119, 4, '2024-12-17 22:24:13', '2024-12-17 22:24:13'),
(115, 1, 120, 4, '2024-12-17 22:24:13', '2024-12-17 22:24:13'),
(116, 1, 121, 4, '2024-12-17 22:24:13', '2024-12-17 22:24:13'),
(117, 1, 122, 4, '2024-12-17 22:24:13', '2024-12-17 22:24:13'),
(118, 1, 123, 4, '2024-12-17 22:24:13', '2024-12-17 22:24:13'),
(119, 1, 124, 4, '2024-12-17 22:24:13', '2024-12-17 22:24:13'),
(120, 1, 125, 4, '2024-12-17 22:24:13', '2024-12-17 22:24:13'),
(121, 1, 126, 4, '2024-12-17 22:24:13', '2024-12-17 22:24:13'),
(122, 1, 127, 4, '2024-12-17 22:24:13', '2024-12-17 22:24:13'),
(123, 1, 128, 4, '2024-12-17 22:24:13', '2024-12-17 22:24:13'),
(124, 1, 129, 4, '2024-12-17 22:24:13', '2024-12-17 22:24:13'),
(125, 1, 130, 4, '2024-12-17 22:24:13', '2024-12-17 22:24:13'),
(126, 1, 131, 4, '2024-12-17 22:24:13', '2024-12-17 22:24:13'),
(127, 1, 132, 4, '2024-12-17 22:24:13', '2024-12-17 22:24:13'),
(128, 1, 133, 4, '2024-12-17 22:24:13', '2024-12-17 22:24:13'),
(129, 1, 134, 4, '2024-12-17 22:24:13', '2024-12-17 22:24:13'),
(130, 1, 135, 4, '2024-12-17 22:24:13', '2024-12-17 22:24:13'),
(131, 1, 136, 4, '2024-12-17 22:24:13', '2024-12-17 22:24:13'),
(132, 1, 137, 4, '2024-12-17 22:24:13', '2024-12-17 22:24:13'),
(133, 1, 138, 4, '2024-12-17 22:24:13', '2024-12-17 22:24:13'),
(134, 1, 139, 4, '2024-12-17 22:24:13', '2024-12-17 22:24:13'),
(135, 1, 140, 4, '2024-12-17 22:24:13', '2024-12-17 22:24:13'),
(136, 1, 141, 4, '2024-12-17 22:24:13', '2024-12-17 22:24:13'),
(137, 1, 142, 4, '2024-12-17 22:24:13', '2024-12-17 22:24:13'),
(138, 1, 143, 4, '2024-12-17 22:24:13', '2024-12-17 22:24:13'),
(139, 1, 144, 4, '2024-12-17 22:24:13', '2024-12-17 22:24:13'),
(140, 1, 145, 4, '2024-12-17 22:24:13', '2024-12-17 22:24:13'),
(141, 1, 146, 4, '2024-12-17 22:24:13', '2024-12-17 22:24:13'),
(142, 1, 147, 4, '2024-12-17 22:24:13', '2024-12-17 22:24:13'),
(143, 1, 148, 4, '2024-12-17 22:24:13', '2024-12-17 22:24:13'),
(144, 1, 149, 4, '2024-12-17 22:24:13', '2024-12-17 22:24:13'),
(145, 1, 150, 4, '2024-12-17 22:24:13', '2024-12-17 22:24:13'),
(146, 1, 151, 4, '2024-12-17 22:24:13', '2024-12-17 22:24:13'),
(147, 1, 152, 4, '2024-12-17 22:24:13', '2024-12-17 22:24:13'),
(148, 1, 153, 4, '2024-12-17 22:24:13', '2024-12-17 22:24:13'),
(149, 1, 154, 4, '2024-12-17 22:24:13', '2024-12-17 22:24:13'),
(150, 1, 155, 4, '2024-12-17 22:24:13', '2024-12-17 22:24:13'),
(151, 1, 156, 4, '2024-12-17 22:24:13', '2024-12-17 22:24:13'),
(152, 1, 157, 4, '2024-12-17 22:24:13', '2024-12-17 22:24:13'),
(153, 1, 158, 4, '2024-12-17 22:24:13', '2024-12-17 22:24:13'),
(154, 1, 159, 4, '2024-12-17 22:24:13', '2024-12-17 22:24:13'),
(155, 1, 160, 4, '2024-12-17 22:24:13', '2024-12-17 22:24:13'),
(156, 1, 161, 4, '2024-12-17 22:24:13', '2024-12-17 22:24:13'),
(157, 1, 162, 4, '2024-12-17 22:24:13', '2024-12-17 22:24:13'),
(158, 1, 163, 4, '2024-12-17 22:24:13', '2024-12-17 22:24:13'),
(159, 1, 164, 4, '2024-12-17 22:24:13', '2024-12-17 22:24:13'),
(160, 1, 165, 4, '2024-12-17 22:24:13', '2024-12-17 22:24:13'),
(161, 1, 166, 4, '2024-12-17 22:24:13', '2024-12-17 22:24:13'),
(162, 1, 167, 4, '2024-12-17 22:24:13', '2024-12-17 22:24:13'),
(163, 1, 168, 4, '2024-12-17 22:24:13', '2024-12-17 22:24:13'),
(164, 1, 169, 4, '2024-12-17 22:24:13', '2024-12-17 22:24:13'),
(165, 1, 170, 4, '2024-12-17 22:24:13', '2024-12-17 22:24:13'),
(166, 1, 171, 4, '2024-12-17 22:24:13', '2024-12-17 22:24:13'),
(167, 1, 172, 4, '2024-12-17 22:24:13', '2024-12-17 22:24:13'),
(168, 1, 173, 4, '2024-12-17 22:24:13', '2024-12-17 22:24:13'),
(169, 1, 174, 4, '2024-12-17 22:24:13', '2024-12-17 22:24:13'),
(170, 1, 175, 4, '2024-12-17 22:24:13', '2024-12-17 22:24:13'),
(171, 1, 176, 4, '2024-12-17 22:24:13', '2024-12-17 22:24:13'),
(172, 1, 177, 4, '2024-12-17 22:24:13', '2024-12-17 22:24:13'),
(173, 1, 178, 4, '2024-12-17 22:24:13', '2024-12-17 22:24:13'),
(174, 1, 179, 4, '2024-12-17 22:24:13', '2024-12-17 22:24:13'),
(175, 1, 180, 4, '2024-12-17 22:24:13', '2024-12-17 22:24:13'),
(176, 1, 181, 4, '2024-12-17 22:24:13', '2024-12-17 22:24:13'),
(177, 1, 182, 4, '2024-12-17 22:24:13', '2024-12-17 22:24:13'),
(178, 1, 183, 4, '2024-12-17 22:24:13', '2024-12-17 22:24:13'),
(179, 1, 184, 4, '2024-12-17 22:24:13', '2024-12-17 22:24:13'),
(180, 1, 185, 4, '2024-12-17 22:24:13', '2024-12-17 22:24:13'),
(181, 1, 186, 4, '2024-12-17 22:24:13', '2024-12-17 22:24:13'),
(182, 1, 187, 4, '2024-12-17 22:24:13', '2024-12-17 22:24:13'),
(183, 1, 188, 4, '2024-12-17 22:24:13', '2024-12-17 22:24:13'),
(184, 1, 189, 4, '2024-12-17 22:24:13', '2024-12-17 22:24:13'),
(185, 1, 190, 4, '2024-12-17 22:24:13', '2024-12-17 22:24:13'),
(186, 1, 191, 4, '2024-12-17 22:24:13', '2024-12-17 22:24:13'),
(187, 1, 192, 4, '2024-12-17 22:24:13', '2024-12-17 22:24:13'),
(188, 1, 193, 4, '2024-12-17 22:24:13', '2024-12-17 22:24:13'),
(189, 1, 194, 4, '2024-12-17 22:24:13', '2024-12-17 22:24:13'),
(190, 1, 195, 4, '2024-12-17 22:24:13', '2024-12-17 22:24:13'),
(191, 1, 196, 4, '2024-12-17 22:24:13', '2024-12-17 22:24:13'),
(192, 1, 197, 4, '2024-12-17 22:24:13', '2024-12-17 22:24:13'),
(193, 1, 198, 4, '2024-12-17 22:24:13', '2024-12-17 22:24:13'),
(194, 1, 199, 4, '2024-12-17 22:24:13', '2024-12-17 22:24:13'),
(195, 1, 200, 4, '2024-12-17 22:24:13', '2024-12-17 22:24:13'),
(196, 1, 201, 4, '2024-12-17 22:24:13', '2024-12-17 22:24:13'),
(197, 1, 202, 4, '2024-12-17 22:24:13', '2024-12-17 22:24:13'),
(198, 1, 203, 4, '2024-12-17 22:24:13', '2024-12-17 22:24:13'),
(199, 1, 204, 4, '2024-12-17 22:24:13', '2024-12-17 22:24:13'),
(200, 1, 205, 4, '2024-12-17 22:24:13', '2024-12-17 22:24:13'),
(201, 1, 206, 4, '2024-12-17 22:24:13', '2024-12-17 22:24:13'),
(202, 1, 207, 4, '2024-12-17 22:24:13', '2024-12-17 22:24:13'),
(203, 1, 208, 4, '2024-12-17 22:24:13', '2024-12-17 22:24:13'),
(204, 1, 209, 4, '2024-12-17 22:24:13', '2024-12-17 22:24:13'),
(205, 1, 210, 4, '2024-12-17 22:24:13', '2024-12-17 22:24:13'),
(206, 1, 211, 4, '2024-12-17 22:24:13', '2024-12-17 22:24:13'),
(207, 1, 212, 4, '2024-12-17 22:24:13', '2024-12-17 22:24:13'),
(208, 1, 213, 4, '2024-12-17 22:24:13', '2024-12-17 22:24:13'),
(209, 1, 214, 4, '2024-12-17 22:24:13', '2024-12-17 22:24:13'),
(210, 1, 215, 4, '2024-12-17 22:24:13', '2024-12-17 22:24:13'),
(211, 1, 216, 4, '2024-12-17 22:24:13', '2024-12-17 22:24:13'),
(212, 1, 217, 4, '2024-12-17 22:24:13', '2024-12-17 22:24:13'),
(213, 1, 218, 4, '2024-12-17 22:24:13', '2024-12-17 22:24:13'),
(214, 1, 219, 4, '2024-12-17 22:24:13', '2024-12-17 22:24:13'),
(215, 1, 220, 4, '2024-12-17 22:24:13', '2024-12-17 22:24:13'),
(216, 1, 221, 4, '2024-12-17 22:24:13', '2024-12-17 22:24:13'),
(217, 1, 222, 4, '2024-12-17 22:24:13', '2024-12-17 22:24:13'),
(218, 1, 223, 4, '2024-12-17 22:24:13', '2024-12-17 22:24:13'),
(219, 1, 224, 4, '2024-12-17 22:24:13', '2024-12-17 22:24:13'),
(220, 1, 225, 4, '2024-12-17 22:24:13', '2024-12-17 22:24:13'),
(221, 1, 226, 4, '2024-12-17 22:24:13', '2024-12-17 22:24:13'),
(222, 1, 227, 4, '2024-12-17 22:24:14', '2024-12-17 22:24:14'),
(223, 1, 228, 4, '2024-12-17 22:24:14', '2024-12-17 22:24:14'),
(224, 1, 229, 4, '2024-12-17 22:24:14', '2024-12-17 22:24:14'),
(225, 1, 230, 4, '2024-12-17 22:24:14', '2024-12-17 22:24:14'),
(226, 1, 231, 4, '2024-12-17 22:24:14', '2024-12-17 22:24:14'),
(227, 1, 232, 4, '2024-12-17 22:24:14', '2024-12-17 22:24:14'),
(228, 1, 233, 4, '2024-12-17 22:24:14', '2024-12-17 22:24:14'),
(229, 1, 234, 4, '2024-12-17 22:24:14', '2024-12-17 22:24:14'),
(230, 1, 235, 4, '2024-12-17 22:24:14', '2024-12-17 22:24:14'),
(231, 1, 236, 4, '2024-12-17 22:24:14', '2024-12-17 22:24:14'),
(232, 1, 237, 4, '2024-12-17 22:24:14', '2024-12-17 22:24:14'),
(233, 1, 238, 4, '2024-12-17 22:24:14', '2024-12-17 22:24:14'),
(234, 1, 239, 4, '2024-12-17 22:24:14', '2024-12-17 22:24:14'),
(235, 1, 240, 4, '2024-12-17 22:24:14', '2024-12-17 22:24:14'),
(236, 1, 241, 4, '2024-12-17 22:24:14', '2024-12-17 22:24:14'),
(237, 1, 242, 4, '2024-12-17 22:24:14', '2024-12-17 22:24:14'),
(238, 1, 243, 4, '2024-12-17 22:24:14', '2024-12-17 22:24:14'),
(239, 1, 244, 4, '2024-12-17 22:24:14', '2024-12-17 22:24:14'),
(240, 1, 245, 4, '2024-12-17 22:24:14', '2024-12-17 22:24:14'),
(241, 1, 246, 4, '2024-12-17 22:24:14', '2024-12-17 22:24:14'),
(242, 1, 247, 4, '2024-12-17 22:24:14', '2024-12-17 22:24:14'),
(243, 1, 248, 4, '2024-12-17 22:24:14', '2024-12-17 22:24:14'),
(244, 1, 249, 4, '2024-12-17 22:24:14', '2024-12-17 22:24:14'),
(245, 1, 250, 4, '2024-12-17 22:24:14', '2024-12-17 22:24:14'),
(246, 1, 251, 4, '2024-12-17 22:24:14', '2024-12-17 22:24:14'),
(247, 1, 252, 4, '2024-12-17 22:24:14', '2024-12-17 22:24:14'),
(248, 1, 253, 4, '2024-12-17 22:24:14', '2024-12-17 22:24:14'),
(249, 1, 254, 4, '2024-12-17 22:24:14', '2024-12-17 22:24:14'),
(250, 1, 255, 4, '2024-12-17 22:24:14', '2024-12-17 22:24:14'),
(251, 1, 256, 4, '2024-12-17 22:24:14', '2024-12-17 22:24:14'),
(252, 1, 257, 4, '2024-12-17 22:24:14', '2024-12-17 22:24:14'),
(253, 1, 258, 4, '2024-12-17 22:24:14', '2024-12-17 22:24:14'),
(254, 1, 259, 4, '2024-12-17 22:24:14', '2024-12-17 22:24:14'),
(255, 1, 260, 4, '2024-12-17 22:24:14', '2024-12-17 22:24:14'),
(256, 1, 261, 4, '2024-12-17 22:24:14', '2024-12-17 22:24:14'),
(257, 1, 262, 4, '2024-12-17 22:24:14', '2024-12-17 22:24:14'),
(258, 1, 263, 4, '2024-12-17 22:24:14', '2024-12-17 22:24:14'),
(259, 1, 264, 4, '2024-12-17 22:24:14', '2024-12-17 22:24:14'),
(260, 1, 265, 4, '2024-12-17 22:24:14', '2024-12-17 22:24:14'),
(261, 1, 266, 4, '2024-12-17 22:24:14', '2024-12-17 22:24:14'),
(262, 1, 267, 4, '2024-12-17 22:24:14', '2024-12-17 22:24:14'),
(263, 1, 268, 4, '2024-12-17 22:24:14', '2024-12-17 22:24:14'),
(264, 1, 269, 4, '2024-12-17 22:24:14', '2024-12-17 22:24:14'),
(265, 1, 270, 4, '2024-12-17 22:24:14', '2024-12-17 22:24:14'),
(266, 1, 271, 4, '2024-12-17 22:24:14', '2024-12-17 22:24:14'),
(267, 1, 272, 4, '2024-12-17 22:24:14', '2024-12-17 22:24:14'),
(268, 1, 273, 4, '2024-12-17 22:24:14', '2024-12-17 22:24:14'),
(269, 1, 274, 4, '2024-12-17 22:24:14', '2024-12-17 22:24:14'),
(270, 1, 275, 4, '2024-12-17 22:24:14', '2024-12-17 22:24:14'),
(271, 1, 276, 4, '2024-12-17 22:24:14', '2024-12-17 22:24:14'),
(272, 1, 277, 4, '2024-12-17 22:24:14', '2024-12-17 22:24:14'),
(273, 1, 278, 4, '2024-12-17 22:24:14', '2024-12-17 22:24:14'),
(274, 1, 279, 4, '2024-12-17 22:24:14', '2024-12-17 22:24:14'),
(275, 1, 280, 4, '2024-12-17 22:24:14', '2024-12-17 22:24:14'),
(276, 1, 281, 4, '2024-12-17 22:24:14', '2024-12-17 22:24:14'),
(277, 1, 282, 4, '2024-12-17 22:24:14', '2024-12-17 22:24:14'),
(278, 1, 283, 4, '2024-12-17 22:24:14', '2024-12-17 22:24:14'),
(279, 1, 284, 4, '2024-12-17 22:24:14', '2024-12-17 22:24:14'),
(280, 1, 285, 4, '2024-12-17 22:24:14', '2024-12-17 22:24:14'),
(281, 1, 286, 4, '2024-12-17 22:24:14', '2024-12-17 22:24:14'),
(282, 1, 287, 4, '2024-12-17 22:24:14', '2024-12-17 22:24:14'),
(283, 1, 288, 4, '2024-12-17 22:24:14', '2024-12-17 22:24:14'),
(284, 1, 289, 4, '2024-12-17 22:24:14', '2024-12-17 22:24:14'),
(285, 1, 290, 4, '2024-12-17 22:24:14', '2024-12-17 22:24:14'),
(286, 1, 291, 4, '2024-12-17 22:24:14', '2024-12-17 22:24:14'),
(287, 1, 292, 4, '2024-12-17 22:24:14', '2024-12-17 22:24:14'),
(288, 1, 293, 4, '2024-12-17 22:24:14', '2024-12-17 22:24:14'),
(289, 1, 294, 4, '2024-12-17 22:24:14', '2024-12-17 22:24:14'),
(290, 1, 295, 4, '2024-12-17 22:24:14', '2024-12-17 22:24:14'),
(291, 1, 296, 4, '2024-12-17 22:24:14', '2024-12-17 22:24:14'),
(292, 1, 297, 4, '2024-12-17 22:24:14', '2024-12-17 22:24:14'),
(293, 1, 298, 4, '2024-12-17 22:24:14', '2024-12-17 22:24:14'),
(294, 1, 299, 4, '2024-12-17 22:24:14', '2024-12-17 22:24:14'),
(295, 1, 300, 4, '2024-12-17 22:24:14', '2024-12-17 22:24:14'),
(296, 1, 301, 4, '2024-12-17 22:24:14', '2024-12-17 22:24:14'),
(297, 1, 302, 4, '2024-12-17 22:24:14', '2024-12-17 22:24:14'),
(298, 1, 303, 4, '2024-12-17 22:24:14', '2024-12-17 22:24:14'),
(299, 1, 304, 4, '2024-12-17 22:24:14', '2024-12-17 22:24:14'),
(300, 1, 305, 4, '2024-12-17 22:24:14', '2024-12-17 22:24:14'),
(301, 1, 306, 4, '2024-12-17 22:24:14', '2024-12-17 22:24:14'),
(302, 1, 307, 4, '2024-12-17 22:24:14', '2024-12-17 22:24:14'),
(303, 1, 308, 4, '2024-12-17 22:24:14', '2024-12-17 22:24:14'),
(304, 1, 309, 4, '2024-12-17 22:24:14', '2024-12-17 22:24:14'),
(305, 1, 310, 4, '2024-12-17 22:24:14', '2024-12-17 22:24:14'),
(306, 1, 311, 4, '2024-12-17 22:24:14', '2024-12-17 22:24:14'),
(307, 1, 312, 4, '2024-12-17 22:24:14', '2024-12-17 22:24:14'),
(308, 1, 313, 4, '2024-12-17 22:24:14', '2024-12-17 22:24:14'),
(309, 1, 314, 4, '2024-12-17 22:24:14', '2024-12-17 22:24:14'),
(310, 1, 315, 4, '2024-12-17 22:24:14', '2024-12-17 22:24:14'),
(311, 1, 316, 4, '2024-12-17 22:24:14', '2024-12-17 22:24:14'),
(312, 1, 317, 4, '2024-12-17 22:24:14', '2024-12-17 22:24:14'),
(313, 1, 318, 4, '2024-12-17 22:24:14', '2024-12-17 22:24:14'),
(314, 1, 319, 4, '2024-12-17 22:24:14', '2024-12-17 22:24:14'),
(315, 1, 320, 4, '2024-12-17 22:24:14', '2024-12-17 22:24:14'),
(316, 1, 321, 4, '2024-12-17 22:24:14', '2024-12-17 22:24:14');

-- --------------------------------------------------------

--
-- Table structure for table `user_taskboard_settings`
--

CREATE TABLE `user_taskboard_settings` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `company_id` int(10) UNSIGNED DEFAULT NULL,
  `user_id` int(10) UNSIGNED NOT NULL,
  `board_column_id` int(10) UNSIGNED NOT NULL,
  `collapsed` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `visa_details`
--

CREATE TABLE `visa_details` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `company_id` int(10) UNSIGNED DEFAULT NULL,
  `user_id` int(10) UNSIGNED DEFAULT NULL,
  `country_id` int(10) UNSIGNED DEFAULT NULL,
  `added_by` int(10) UNSIGNED DEFAULT NULL,
  `visa_number` varchar(191) NOT NULL,
  `issue_date` date NOT NULL,
  `expiry_date` date NOT NULL,
  `file` varchar(191) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `accept_estimates`
--
ALTER TABLE `accept_estimates`
  ADD PRIMARY KEY (`id`),
  ADD KEY `accept_estimates_company_id_foreign` (`company_id`),
  ADD KEY `accept_estimates_estimate_id_foreign` (`estimate_id`);

--
-- Indexes for table `appreciations`
--
ALTER TABLE `appreciations`
  ADD PRIMARY KEY (`id`),
  ADD KEY `appreciations_company_id_foreign` (`company_id`),
  ADD KEY `appreciations_award_id_foreign` (`award_id`),
  ADD KEY `appreciations_award_to_foreign` (`award_to`),
  ADD KEY `appreciations_added_by_foreign` (`added_by`);

--
-- Indexes for table `attendances`
--
ALTER TABLE `attendances`
  ADD PRIMARY KEY (`id`),
  ADD KEY `attendances_company_id_foreign` (`company_id`),
  ADD KEY `attendances_user_id_foreign` (`user_id`),
  ADD KEY `attendances_location_id_foreign` (`location_id`),
  ADD KEY `attendances_clock_in_time_index` (`clock_in_time`),
  ADD KEY `attendances_clock_out_time_index` (`clock_out_time`),
  ADD KEY `attendances_added_by_foreign` (`added_by`),
  ADD KEY `attendances_last_updated_by_foreign` (`last_updated_by`),
  ADD KEY `attendances_employee_shift_id_foreign` (`employee_shift_id`);

--
-- Indexes for table `attendance_settings`
--
ALTER TABLE `attendance_settings`
  ADD PRIMARY KEY (`id`),
  ADD KEY `attendance_settings_company_id_foreign` (`company_id`),
  ADD KEY `attendance_settings_default_employee_shift_foreign` (`default_employee_shift`);

--
-- Indexes for table `automate_shifts`
--
ALTER TABLE `automate_shifts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `automate_shifts_employee_shift_rotation_id_foreign` (`employee_shift_rotation_id`),
  ADD KEY `employee_shift_schedules_user_id_foreign` (`user_id`);

--
-- Indexes for table `awards`
--
ALTER TABLE `awards`
  ADD PRIMARY KEY (`id`),
  ADD KEY `awards_company_id_foreign` (`company_id`),
  ADD KEY `awards_award_icon_id_foreign` (`award_icon_id`);

--
-- Indexes for table `award_icons`
--
ALTER TABLE `award_icons`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `bank_accounts`
--
ALTER TABLE `bank_accounts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `bank_accounts_company_id_foreign` (`company_id`),
  ADD KEY `bank_accounts_currency_id_foreign` (`currency_id`),
  ADD KEY `bank_accounts_added_by_foreign` (`added_by`),
  ADD KEY `bank_accounts_last_updated_by_foreign` (`last_updated_by`);

--
-- Indexes for table `bank_transactions`
--
ALTER TABLE `bank_transactions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `bank_transactions_company_id_foreign` (`company_id`),
  ADD KEY `bank_transactions_bank_account_id_foreign` (`bank_account_id`),
  ADD KEY `bank_transactions_payment_id_foreign` (`payment_id`),
  ADD KEY `bank_transactions_invoice_id_foreign` (`invoice_id`),
  ADD KEY `bank_transactions_expense_id_foreign` (`expense_id`),
  ADD KEY `bank_transactions_added_by_foreign` (`added_by`),
  ADD KEY `bank_transactions_last_updated_by_foreign` (`last_updated_by`);

--
-- Indexes for table `client_categories`
--
ALTER TABLE `client_categories`
  ADD PRIMARY KEY (`id`),
  ADD KEY `client_categories_company_id_foreign` (`company_id`);

--
-- Indexes for table `client_contacts`
--
ALTER TABLE `client_contacts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `client_contacts_company_id_foreign` (`company_id`),
  ADD KEY `client_contacts_user_id_foreign` (`user_id`),
  ADD KEY `client_contacts_added_by_foreign` (`added_by`),
  ADD KEY `client_contacts_last_updated_by_foreign` (`last_updated_by`);

--
-- Indexes for table `client_details`
--
ALTER TABLE `client_details`
  ADD PRIMARY KEY (`id`),
  ADD KEY `client_details_company_id_foreign` (`company_id`),
  ADD KEY `client_details_user_id_foreign` (`user_id`),
  ADD KEY `client_details_category_id_foreign` (`category_id`),
  ADD KEY `client_details_sub_category_id_foreign` (`sub_category_id`),
  ADD KEY `client_details_added_by_foreign` (`added_by`),
  ADD KEY `client_details_last_updated_by_foreign` (`last_updated_by`);

--
-- Indexes for table `client_docs`
--
ALTER TABLE `client_docs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `client_docs_company_id_foreign` (`company_id`),
  ADD KEY `client_docs_user_id_foreign` (`user_id`),
  ADD KEY `client_docs_added_by_foreign` (`added_by`),
  ADD KEY `client_docs_last_updated_by_foreign` (`last_updated_by`);

--
-- Indexes for table `client_notes`
--
ALTER TABLE `client_notes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `client_notes_company_id_foreign` (`company_id`),
  ADD KEY `client_notes_client_id_foreign` (`client_id`),
  ADD KEY `client_notes_member_id_foreign` (`member_id`),
  ADD KEY `client_notes_added_by_foreign` (`added_by`),
  ADD KEY `client_notes_last_updated_by_foreign` (`last_updated_by`);

--
-- Indexes for table `client_sub_categories`
--
ALTER TABLE `client_sub_categories`
  ADD PRIMARY KEY (`id`),
  ADD KEY `client_sub_categories_company_id_foreign` (`company_id`),
  ADD KEY `client_sub_categories_category_id_foreign` (`category_id`);

--
-- Indexes for table `client_user_notes`
--
ALTER TABLE `client_user_notes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `client_user_notes_company_id_foreign` (`company_id`),
  ADD KEY `client_user_notes_user_id_foreign` (`user_id`),
  ADD KEY `client_user_notes_client_note_id_foreign` (`client_note_id`);

--
-- Indexes for table `companies`
--
ALTER TABLE `companies`
  ADD PRIMARY KEY (`id`),
  ADD KEY `companies_currency_id_foreign` (`currency_id`),
  ADD KEY `companies_last_updated_by_foreign` (`last_updated_by`),
  ADD KEY `companies_default_task_status_foreign` (`default_task_status`);

--
-- Indexes for table `company_addresses`
--
ALTER TABLE `company_addresses`
  ADD PRIMARY KEY (`id`),
  ADD KEY `company_addresses_company_id_foreign` (`company_id`),
  ADD KEY `company_addresses_country_id_foreign` (`country_id`);

--
-- Indexes for table `contracts`
--
ALTER TABLE `contracts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `contracts_company_id_foreign` (`company_id`),
  ADD KEY `contracts_client_id_foreign` (`client_id`),
  ADD KEY `contracts_contract_type_id_foreign` (`contract_type_id`),
  ADD KEY `contracts_added_by_foreign` (`added_by`),
  ADD KEY `contracts_last_updated_by_foreign` (`last_updated_by`),
  ADD KEY `contracts_currency_id_foreign` (`currency_id`),
  ADD KEY `contracts_project_id_foreign` (`project_id`),
  ADD KEY `contracts_sign_by_foreign` (`sign_by`);

--
-- Indexes for table `contract_discussions`
--
ALTER TABLE `contract_discussions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `contract_discussions_company_id_foreign` (`company_id`),
  ADD KEY `contract_discussions_contract_id_foreign` (`contract_id`),
  ADD KEY `contract_discussions_from_foreign` (`from`),
  ADD KEY `contract_discussions_added_by_foreign` (`added_by`),
  ADD KEY `contract_discussions_last_updated_by_foreign` (`last_updated_by`);

--
-- Indexes for table `contract_files`
--
ALTER TABLE `contract_files`
  ADD PRIMARY KEY (`id`),
  ADD KEY `contract_files_company_id_foreign` (`company_id`),
  ADD KEY `contract_files_user_id_foreign` (`user_id`),
  ADD KEY `contract_files_contract_id_foreign` (`contract_id`),
  ADD KEY `contract_files_added_by_foreign` (`added_by`),
  ADD KEY `contract_files_last_updated_by_foreign` (`last_updated_by`);

--
-- Indexes for table `contract_renews`
--
ALTER TABLE `contract_renews`
  ADD PRIMARY KEY (`id`),
  ADD KEY `contract_renews_company_id_foreign` (`company_id`),
  ADD KEY `contract_renews_renewed_by_foreign` (`renewed_by`),
  ADD KEY `contract_renews_contract_id_foreign` (`contract_id`),
  ADD KEY `contract_renews_added_by_foreign` (`added_by`),
  ADD KEY `contract_renews_last_updated_by_foreign` (`last_updated_by`);

--
-- Indexes for table `contract_signs`
--
ALTER TABLE `contract_signs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `contract_signs_contract_id_foreign` (`contract_id`),
  ADD KEY `contract_signs_company_id_foreign` (`company_id`);

--
-- Indexes for table `contract_templates`
--
ALTER TABLE `contract_templates`
  ADD PRIMARY KEY (`id`),
  ADD KEY `contract_templates_company_id_foreign` (`company_id`),
  ADD KEY `contract_templates_contract_type_id_foreign` (`contract_type_id`),
  ADD KEY `contract_templates_currency_id_foreign` (`currency_id`);

--
-- Indexes for table `contract_types`
--
ALTER TABLE `contract_types`
  ADD PRIMARY KEY (`id`),
  ADD KEY `contract_types_company_id_foreign` (`company_id`);

--
-- Indexes for table `conversation`
--
ALTER TABLE `conversation`
  ADD PRIMARY KEY (`id`),
  ADD KEY `conversation_company_id_foreign` (`company_id`),
  ADD KEY `conversation_user_one_foreign` (`user_one`),
  ADD KEY `conversation_user_two_foreign` (`user_two`);

--
-- Indexes for table `conversation_reply`
--
ALTER TABLE `conversation_reply`
  ADD PRIMARY KEY (`id`),
  ADD KEY `conversation_reply_company_id_foreign` (`company_id`),
  ADD KEY `conversation_reply_conversation_id_foreign` (`conversation_id`),
  ADD KEY `conversation_reply_user_id_foreign` (`user_id`);

--
-- Indexes for table `countries`
--
ALTER TABLE `countries`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `credit_notes`
--
ALTER TABLE `credit_notes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `credit_notes_company_id_foreign` (`company_id`),
  ADD KEY `credit_notes_project_id_foreign` (`project_id`),
  ADD KEY `credit_notes_client_id_foreign` (`client_id`),
  ADD KEY `credit_notes_currency_id_foreign` (`currency_id`),
  ADD KEY `credit_notes_added_by_foreign` (`added_by`),
  ADD KEY `credit_notes_last_updated_by_foreign` (`last_updated_by`);

--
-- Indexes for table `credit_note_items`
--
ALTER TABLE `credit_note_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `credit_note_items_credit_note_id_foreign` (`credit_note_id`),
  ADD KEY `credit_note_items_unit_id_foreign` (`unit_id`),
  ADD KEY `credit_note_items_product_id_foreign` (`product_id`);

--
-- Indexes for table `credit_note_item_images`
--
ALTER TABLE `credit_note_item_images`
  ADD PRIMARY KEY (`id`),
  ADD KEY `credit_note_item_images_credit_note_item_id_foreign` (`credit_note_item_id`);

--
-- Indexes for table `currencies`
--
ALTER TABLE `currencies`
  ADD PRIMARY KEY (`id`),
  ADD KEY `currencies_company_id_foreign` (`company_id`);

--
-- Indexes for table `currency_format_settings`
--
ALTER TABLE `currency_format_settings`
  ADD PRIMARY KEY (`id`),
  ADD KEY `currency_format_settings_company_id_foreign` (`company_id`);

--
-- Indexes for table `custom_fields`
--
ALTER TABLE `custom_fields`
  ADD PRIMARY KEY (`id`),
  ADD KEY `custom_fields_company_id_foreign` (`company_id`),
  ADD KEY `custom_fields_custom_field_group_id_foreign` (`custom_field_group_id`);

--
-- Indexes for table `custom_fields_data`
--
ALTER TABLE `custom_fields_data`
  ADD PRIMARY KEY (`id`),
  ADD KEY `custom_fields_data_custom_field_id_foreign` (`custom_field_id`),
  ADD KEY `custom_fields_data_model_index` (`model`);

--
-- Indexes for table `custom_field_groups`
--
ALTER TABLE `custom_field_groups`
  ADD PRIMARY KEY (`id`),
  ADD KEY `custom_field_groups_company_id_foreign` (`company_id`),
  ADD KEY `custom_field_groups_model_index` (`model`);

--
-- Indexes for table `custom_link_settings`
--
ALTER TABLE `custom_link_settings`
  ADD PRIMARY KEY (`id`),
  ADD KEY `custom_link_settings_company_id_foreign` (`company_id`);

--
-- Indexes for table `dashboard_widgets`
--
ALTER TABLE `dashboard_widgets`
  ADD PRIMARY KEY (`id`),
  ADD KEY `dashboard_widgets_company_id_foreign` (`company_id`);

--
-- Indexes for table `database_backups`
--
ALTER TABLE `database_backups`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `database_backup_cron_settings`
--
ALTER TABLE `database_backup_cron_settings`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `deals`
--
ALTER TABLE `deals`
  ADD PRIMARY KEY (`id`),
  ADD KEY `deals_company_id_foreign` (`company_id`),
  ADD KEY `deals_lead_pipeline_id_foreign` (`lead_pipeline_id`),
  ADD KEY `deals_pipeline_stage_id_foreign` (`pipeline_stage_id`),
  ADD KEY `deals_lead_id_foreign` (`lead_id`),
  ADD KEY `deals_added_by_foreign` (`added_by`),
  ADD KEY `deals_last_updated_by_foreign` (`last_updated_by`),
  ADD KEY `leads_agent_id_foreign` (`agent_id`),
  ADD KEY `leads_currency_id_foreign` (`currency_id`),
  ADD KEY `deals_category_id_foreign` (`category_id`);

--
-- Indexes for table `deal_files`
--
ALTER TABLE `deal_files`
  ADD PRIMARY KEY (`id`),
  ADD KEY `lead_files_user_id_foreign` (`user_id`),
  ADD KEY `lead_files_added_by_foreign` (`added_by`),
  ADD KEY `lead_files_last_updated_by_foreign` (`last_updated_by`),
  ADD KEY `deal_files_deal_id_foreign` (`deal_id`);

--
-- Indexes for table `deal_histories`
--
ALTER TABLE `deal_histories`
  ADD PRIMARY KEY (`id`),
  ADD KEY `deal_histories_deal_id_foreign` (`deal_id`),
  ADD KEY `deal_histories_created_by_foreign` (`created_by`),
  ADD KEY `deal_histories_deal_stage_to_id_foreign` (`deal_stage_to_id`);

--
-- Indexes for table `deal_notes`
--
ALTER TABLE `deal_notes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `deal_notes_last_updated_by_foreign` (`last_updated_by`),
  ADD KEY `deal_notes_added_by_foreign` (`added_by`),
  ADD KEY `deal_notes_deal_id_foreign` (`deal_id`);

--
-- Indexes for table `designations`
--
ALTER TABLE `designations`
  ADD PRIMARY KEY (`id`),
  ADD KEY `designations_company_id_foreign` (`company_id`),
  ADD KEY `designations_added_by_foreign` (`added_by`),
  ADD KEY `designations_last_updated_by_foreign` (`last_updated_by`);

--
-- Indexes for table `device_user`
--
ALTER TABLE `device_user`
  ADD PRIMARY KEY (`id`),
  ADD KEY `device_user_user_id_device_id_index` (`user_id`,`device_id`),
  ADD KEY `device_user_user_id_index` (`user_id`),
  ADD KEY `device_user_device_id_index` (`device_id`),
  ADD KEY `device_user_reported_as_rogue_at_index` (`reported_as_rogue_at`);

--
-- Indexes for table `discussions`
--
ALTER TABLE `discussions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `discussions_discussion_category_id_foreign` (`discussion_category_id`),
  ADD KEY `discussions_project_id_foreign` (`project_id`),
  ADD KEY `discussions_user_id_foreign` (`user_id`),
  ADD KEY `discussions_best_answer_id_foreign` (`best_answer_id`),
  ADD KEY `discussions_last_reply_by_id_foreign` (`last_reply_by_id`),
  ADD KEY `discussions_added_by_foreign` (`added_by`),
  ADD KEY `discussions_last_updated_by_foreign` (`last_updated_by`),
  ADD KEY `discussions_company_id_foreign` (`company_id`);

--
-- Indexes for table `discussion_categories`
--
ALTER TABLE `discussion_categories`
  ADD PRIMARY KEY (`id`),
  ADD KEY `discussion_categories_company_id_foreign` (`company_id`);

--
-- Indexes for table `discussion_files`
--
ALTER TABLE `discussion_files`
  ADD PRIMARY KEY (`id`),
  ADD KEY `discussion_files_company_id_foreign` (`company_id`),
  ADD KEY `discussion_files_user_id_foreign` (`user_id`),
  ADD KEY `discussion_files_discussion_id_foreign` (`discussion_id`),
  ADD KEY `discussion_files_discussion_reply_id_foreign` (`discussion_reply_id`);

--
-- Indexes for table `discussion_replies`
--
ALTER TABLE `discussion_replies`
  ADD PRIMARY KEY (`id`),
  ADD KEY `discussion_replies_discussion_id_foreign` (`discussion_id`),
  ADD KEY `discussion_replies_user_id_foreign` (`user_id`),
  ADD KEY `discussion_replies_company_id_foreign` (`company_id`);

--
-- Indexes for table `email_notification_settings`
--
ALTER TABLE `email_notification_settings`
  ADD PRIMARY KEY (`id`),
  ADD KEY `email_notification_settings_company_id_foreign` (`company_id`);

--
-- Indexes for table `emergency_contacts`
--
ALTER TABLE `emergency_contacts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `emergency_contacts_company_id_foreign` (`company_id`),
  ADD KEY `emergency_contacts_user_id_foreign` (`user_id`),
  ADD KEY `emergency_contacts_added_by_foreign` (`added_by`),
  ADD KEY `emergency_contacts_last_updated_by_foreign` (`last_updated_by`);

--
-- Indexes for table `employee_activity`
--
ALTER TABLE `employee_activity`
  ADD PRIMARY KEY (`id`),
  ADD KEY `employee_activity_deal_id_foreign` (`deal_id`);

--
-- Indexes for table `employee_details`
--
ALTER TABLE `employee_details`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `employee_details_employee_id_company_id_unique` (`employee_id`,`company_id`),
  ADD UNIQUE KEY `employee_details_slack_username_company_id_unique` (`slack_username`,`company_id`),
  ADD KEY `employee_details_company_id_foreign` (`company_id`),
  ADD KEY `employee_details_user_id_foreign` (`user_id`),
  ADD KEY `employee_details_department_id_foreign` (`department_id`),
  ADD KEY `employee_details_designation_id_foreign` (`designation_id`),
  ADD KEY `employee_details_added_by_foreign` (`added_by`),
  ADD KEY `employee_details_last_updated_by_foreign` (`last_updated_by`),
  ADD KEY `employee_details_reporting_to_foreign` (`reporting_to`),
  ADD KEY `employee_details_company_address_id_foreign` (`company_address_id`);

--
-- Indexes for table `employee_docs`
--
ALTER TABLE `employee_docs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `employee_docs_company_id_foreign` (`company_id`),
  ADD KEY `employee_docs_user_id_foreign` (`user_id`),
  ADD KEY `employee_docs_added_by_foreign` (`added_by`),
  ADD KEY `employee_docs_last_updated_by_foreign` (`last_updated_by`);

--
-- Indexes for table `employee_leave_quotas`
--
ALTER TABLE `employee_leave_quotas`
  ADD PRIMARY KEY (`id`),
  ADD KEY `employee_leave_quotas_user_id_foreign` (`user_id`),
  ADD KEY `employee_leave_quotas_leave_type_id_foreign` (`leave_type_id`);

--
-- Indexes for table `employee_leave_quota_histories`
--
ALTER TABLE `employee_leave_quota_histories`
  ADD PRIMARY KEY (`id`),
  ADD KEY `employee_leave_quotas_user_id_foreign` (`user_id`),
  ADD KEY `employee_leave_quotas_leave_type_id_foreign` (`leave_type_id`);

--
-- Indexes for table `employee_shifts`
--
ALTER TABLE `employee_shifts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `employee_shifts_company_id_foreign` (`company_id`);

--
-- Indexes for table `employee_shift_change_requests`
--
ALTER TABLE `employee_shift_change_requests`
  ADD PRIMARY KEY (`id`),
  ADD KEY `employee_shift_change_requests_company_id_foreign` (`company_id`),
  ADD KEY `employee_shift_change_requests_shift_schedule_id_foreign` (`shift_schedule_id`),
  ADD KEY `employee_shift_change_requests_employee_shift_id_foreign` (`employee_shift_id`);

--
-- Indexes for table `employee_shift_rotations`
--
ALTER TABLE `employee_shift_rotations`
  ADD PRIMARY KEY (`id`),
  ADD KEY `employee_shift_rotations_company_id_foreign` (`company_id`);

--
-- Indexes for table `employee_shift_schedules`
--
ALTER TABLE `employee_shift_schedules`
  ADD PRIMARY KEY (`id`),
  ADD KEY `employee_shift_schedules_user_id_foreign` (`user_id`),
  ADD KEY `employee_shift_schedules_date_index` (`date`),
  ADD KEY `employee_shift_schedules_employee_shift_id_foreign` (`employee_shift_id`),
  ADD KEY `employee_shift_schedules_added_by_foreign` (`added_by`),
  ADD KEY `employee_shift_schedules_last_updated_by_foreign` (`last_updated_by`);

--
-- Indexes for table `employee_skills`
--
ALTER TABLE `employee_skills`
  ADD PRIMARY KEY (`id`),
  ADD KEY `employee_skills_company_id_foreign` (`company_id`),
  ADD KEY `employee_skills_user_id_foreign` (`user_id`),
  ADD KEY `employee_skills_skill_id_foreign` (`skill_id`);

--
-- Indexes for table `employee_teams`
--
ALTER TABLE `employee_teams`
  ADD PRIMARY KEY (`id`),
  ADD KEY `employee_teams_company_id_foreign` (`company_id`),
  ADD KEY `employee_teams_team_id_foreign` (`team_id`),
  ADD KEY `employee_teams_user_id_foreign` (`user_id`);

--
-- Indexes for table `estimates`
--
ALTER TABLE `estimates`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `estimates_estimate_number_company_id_unique` (`estimate_number`,`company_id`),
  ADD KEY `estimates_company_id_foreign` (`company_id`),
  ADD KEY `estimates_client_id_foreign` (`client_id`),
  ADD KEY `estimates_currency_id_foreign` (`currency_id`),
  ADD KEY `estimates_added_by_foreign` (`added_by`),
  ADD KEY `estimates_last_updated_by_foreign` (`last_updated_by`),
  ADD KEY `estimates_estimate_request_id_foreign` (`estimate_request_id`);

--
-- Indexes for table `estimate_items`
--
ALTER TABLE `estimate_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `estimate_items_estimate_id_foreign` (`estimate_id`),
  ADD KEY `estimate_items_unit_id_foreign` (`unit_id`),
  ADD KEY `estimate_items_product_id_foreign` (`product_id`);

--
-- Indexes for table `estimate_item_images`
--
ALTER TABLE `estimate_item_images`
  ADD PRIMARY KEY (`id`),
  ADD KEY `estimate_item_images_estimate_item_id_foreign` (`estimate_item_id`);

--
-- Indexes for table `estimate_requests`
--
ALTER TABLE `estimate_requests`
  ADD PRIMARY KEY (`id`),
  ADD KEY `estimate_requests_client_id_foreign` (`client_id`),
  ADD KEY `estimate_requests_company_id_foreign` (`company_id`),
  ADD KEY `estimate_requests_estimate_id_foreign` (`estimate_id`),
  ADD KEY `estimate_requests_project_id_foreign` (`project_id`),
  ADD KEY `estimate_requests_currency_id_foreign` (`currency_id`),
  ADD KEY `estimate_requests_added_by_foreign` (`added_by`);

--
-- Indexes for table `estimate_templates`
--
ALTER TABLE `estimate_templates`
  ADD PRIMARY KEY (`id`),
  ADD KEY `estimate_templates_company_id_foreign` (`company_id`),
  ADD KEY `estimate_templates_currency_id_foreign` (`currency_id`),
  ADD KEY `estimate_templates_added_by_foreign` (`added_by`),
  ADD KEY `estimate_templates_last_updated_by_foreign` (`last_updated_by`);

--
-- Indexes for table `estimate_template_items`
--
ALTER TABLE `estimate_template_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `estimate_template_items_company_id_foreign` (`company_id`),
  ADD KEY `estimate_template_items_estimate_template_id_foreign` (`estimate_template_id`),
  ADD KEY `estimate_template_items_unit_id_foreign` (`unit_id`),
  ADD KEY `estimate_template_items_product_id_foreign` (`product_id`);

--
-- Indexes for table `estimate_template_item_images`
--
ALTER TABLE `estimate_template_item_images`
  ADD PRIMARY KEY (`id`),
  ADD KEY `estimate_template_item_images_company_id_foreign` (`company_id`),
  ADD KEY `estimate_template_item_images_estimate_template_item_id_foreign` (`estimate_template_item_id`);

--
-- Indexes for table `events`
--
ALTER TABLE `events`
  ADD PRIMARY KEY (`id`),
  ADD KEY `events_company_id_foreign` (`company_id`),
  ADD KEY `events_added_by_foreign` (`added_by`),
  ADD KEY `events_last_updated_by_foreign` (`last_updated_by`),
  ADD KEY `events_parent_id_foreign` (`parent_id`),
  ADD KEY `events_host_foreign` (`host`);

--
-- Indexes for table `event_attendees`
--
ALTER TABLE `event_attendees`
  ADD PRIMARY KEY (`id`),
  ADD KEY `event_attendees_company_id_foreign` (`company_id`),
  ADD KEY `event_attendees_user_id_foreign` (`user_id`),
  ADD KEY `event_attendees_event_id_foreign` (`event_id`);

--
-- Indexes for table `event_files`
--
ALTER TABLE `event_files`
  ADD PRIMARY KEY (`id`),
  ADD KEY `event_files_company_id_foreign` (`company_id`),
  ADD KEY `event_files_event_id_foreign` (`event_id`),
  ADD KEY `event_files_added_by_foreign` (`added_by`),
  ADD KEY `event_files_last_updated_by_foreign` (`last_updated_by`);

--
-- Indexes for table `expenses`
--
ALTER TABLE `expenses`
  ADD PRIMARY KEY (`id`),
  ADD KEY `expenses_company_id_foreign` (`company_id`),
  ADD KEY `expenses_currency_id_foreign` (`currency_id`),
  ADD KEY `expenses_user_id_foreign` (`user_id`),
  ADD KEY `expenses_category_id_foreign` (`category_id`),
  ADD KEY `expenses_expenses_recurring_id_foreign` (`expenses_recurring_id`),
  ADD KEY `expenses_created_by_foreign` (`created_by`),
  ADD KEY `expenses_added_by_foreign` (`added_by`),
  ADD KEY `expenses_last_updated_by_foreign` (`last_updated_by`),
  ADD KEY `expenses_approver_id_foreign` (`approver_id`),
  ADD KEY `expenses_bank_account_id_foreign` (`bank_account_id`),
  ADD KEY `expenses_default_currency_id_foreign` (`default_currency_id`);

--
-- Indexes for table `expenses_category`
--
ALTER TABLE `expenses_category`
  ADD PRIMARY KEY (`id`),
  ADD KEY `expenses_category_company_id_foreign` (`company_id`),
  ADD KEY `expenses_category_added_by_foreign` (`added_by`),
  ADD KEY `expenses_category_last_updated_by_foreign` (`last_updated_by`);

--
-- Indexes for table `expenses_category_roles`
--
ALTER TABLE `expenses_category_roles`
  ADD PRIMARY KEY (`id`),
  ADD KEY `expenses_category_roles_company_id_foreign` (`company_id`),
  ADD KEY `expenses_category_roles_expenses_category_id_foreign` (`expenses_category_id`),
  ADD KEY `expenses_category_roles_role_id_foreign` (`role_id`);

--
-- Indexes for table `expenses_recurring`
--
ALTER TABLE `expenses_recurring`
  ADD PRIMARY KEY (`id`),
  ADD KEY `expenses_recurring_company_id_foreign` (`company_id`),
  ADD KEY `expenses_recurring_category_id_foreign` (`category_id`),
  ADD KEY `expenses_recurring_currency_id_foreign` (`currency_id`),
  ADD KEY `expenses_recurring_project_id_foreign` (`project_id`),
  ADD KEY `expenses_recurring_user_id_foreign` (`user_id`),
  ADD KEY `expenses_recurring_created_by_foreign` (`created_by`),
  ADD KEY `expenses_recurring_added_by_foreign` (`added_by`),
  ADD KEY `expenses_recurring_last_updated_by_foreign` (`last_updated_by`),
  ADD KEY `expenses_recurring_bank_account_id_foreign` (`bank_account_id`);

--
-- Indexes for table `failed_jobs`
--
ALTER TABLE `failed_jobs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`);

--
-- Indexes for table `file_storage`
--
ALTER TABLE `file_storage`
  ADD PRIMARY KEY (`id`),
  ADD KEY `file_storage_company_id_foreign` (`company_id`);

--
-- Indexes for table `file_storage_settings`
--
ALTER TABLE `file_storage_settings`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `flags`
--
ALTER TABLE `flags`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `gantt_links`
--
ALTER TABLE `gantt_links`
  ADD PRIMARY KEY (`id`),
  ADD KEY `gantt_links_project_id_foreign` (`project_id`),
  ADD KEY `gantt_links_source_foreign` (`source`),
  ADD KEY `gantt_links_target_foreign` (`target`);

--
-- Indexes for table `gdpr_settings`
--
ALTER TABLE `gdpr_settings`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `global_settings`
--
ALTER TABLE `global_settings`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `google_calendar_modules`
--
ALTER TABLE `google_calendar_modules`
  ADD PRIMARY KEY (`id`),
  ADD KEY `google_calendar_modules_company_id_foreign` (`company_id`);

--
-- Indexes for table `holidays`
--
ALTER TABLE `holidays`
  ADD PRIMARY KEY (`id`),
  ADD KEY `holidays_company_id_foreign` (`company_id`),
  ADD KEY `holidays_date_index` (`date`),
  ADD KEY `holidays_added_by_foreign` (`added_by`),
  ADD KEY `holidays_last_updated_by_foreign` (`last_updated_by`);

--
-- Indexes for table `invoices`
--
ALTER TABLE `invoices`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `invoices_invoice_number_company_id_unique` (`invoice_number`,`company_id`),
  ADD UNIQUE KEY `invoices_transaction_id_unique` (`transaction_id`),
  ADD KEY `invoices_company_id_foreign` (`company_id`),
  ADD KEY `invoices_project_id_foreign` (`project_id`),
  ADD KEY `invoices_client_id_foreign` (`client_id`),
  ADD KEY `invoices_order_id_foreign` (`order_id`),
  ADD KEY `invoices_due_date_index` (`due_date`),
  ADD KEY `invoices_currency_id_foreign` (`currency_id`),
  ADD KEY `invoices_estimate_id_foreign` (`estimate_id`),
  ADD KEY `invoices_parent_id_foreign` (`parent_id`),
  ADD KEY `invoices_invoice_recurring_id_foreign` (`invoice_recurring_id`),
  ADD KEY `invoices_created_by_foreign` (`created_by`),
  ADD KEY `invoices_added_by_foreign` (`added_by`),
  ADD KEY `invoices_last_updated_by_foreign` (`last_updated_by`),
  ADD KEY `invoices_company_address_id_foreign` (`company_address_id`),
  ADD KEY `invoices_bank_account_id_foreign` (`bank_account_id`),
  ADD KEY `invoices_default_currency_id_foreign` (`default_currency_id`),
  ADD KEY `payments_offline_method_id_foreign` (`offline_method_id`),
  ADD KEY `invoices_invoice_payment_id_foreign` (`invoice_payment_id`);

--
-- Indexes for table `invoice_files`
--
ALTER TABLE `invoice_files`
  ADD PRIMARY KEY (`id`),
  ADD KEY `invoice_files_invoice_id_foreign` (`invoice_id`),
  ADD KEY `invoice_files_added_by_foreign` (`added_by`),
  ADD KEY `invoice_files_last_updated_by_foreign` (`last_updated_by`);

--
-- Indexes for table `invoice_items`
--
ALTER TABLE `invoice_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `invoice_items_invoice_id_foreign` (`invoice_id`),
  ADD KEY `invoice_items_unit_id_foreign` (`unit_id`),
  ADD KEY `invoice_items_product_id_foreign` (`product_id`);

--
-- Indexes for table `invoice_item_images`
--
ALTER TABLE `invoice_item_images`
  ADD PRIMARY KEY (`id`),
  ADD KEY `invoice_item_images_invoice_item_id_foreign` (`invoice_item_id`);

--
-- Indexes for table `invoice_payment_details`
--
ALTER TABLE `invoice_payment_details`
  ADD PRIMARY KEY (`id`),
  ADD KEY `invoice_payment_details_company_id_foreign` (`company_id`);

--
-- Indexes for table `invoice_recurring`
--
ALTER TABLE `invoice_recurring`
  ADD PRIMARY KEY (`id`),
  ADD KEY `invoice_recurring_company_id_foreign` (`company_id`),
  ADD KEY `invoice_recurring_currency_id_foreign` (`currency_id`),
  ADD KEY `invoice_recurring_project_id_foreign` (`project_id`),
  ADD KEY `invoice_recurring_client_id_foreign` (`client_id`),
  ADD KEY `invoice_recurring_user_id_foreign` (`user_id`),
  ADD KEY `invoice_recurring_created_by_foreign` (`created_by`),
  ADD KEY `invoice_recurring_added_by_foreign` (`added_by`),
  ADD KEY `invoice_recurring_last_updated_by_foreign` (`last_updated_by`),
  ADD KEY `invoice_recurring_bank_account_id_foreign` (`bank_account_id`);

--
-- Indexes for table `invoice_recurring_items`
--
ALTER TABLE `invoice_recurring_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `invoice_recurring_items_invoice_recurring_id_foreign` (`invoice_recurring_id`),
  ADD KEY `invoice_recurring_items_unit_id_foreign` (`unit_id`),
  ADD KEY `invoice_recurring_items_product_id_foreign` (`product_id`);

--
-- Indexes for table `invoice_recurring_item_images`
--
ALTER TABLE `invoice_recurring_item_images`
  ADD PRIMARY KEY (`id`),
  ADD KEY `invoice_recurring_item_images_invoice_recurring_item_id_foreign` (`invoice_recurring_item_id`);

--
-- Indexes for table `invoice_settings`
--
ALTER TABLE `invoice_settings`
  ADD PRIMARY KEY (`id`),
  ADD KEY `invoice_settings_company_id_foreign` (`company_id`);

--
-- Indexes for table `issues`
--
ALTER TABLE `issues`
  ADD PRIMARY KEY (`id`),
  ADD KEY `issues_company_id_foreign` (`company_id`),
  ADD KEY `issues_user_id_foreign` (`user_id`),
  ADD KEY `issues_project_id_foreign` (`project_id`);

--
-- Indexes for table `jobs`
--
ALTER TABLE `jobs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `jobs_queue_index` (`queue`);

--
-- Indexes for table `job_batches`
--
ALTER TABLE `job_batches`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `knowledge_bases`
--
ALTER TABLE `knowledge_bases`
  ADD PRIMARY KEY (`id`),
  ADD KEY `knowledge_bases_company_id_foreign` (`company_id`),
  ADD KEY `knowledge_bases_category_id_foreign` (`category_id`);

--
-- Indexes for table `knowledge_base_files`
--
ALTER TABLE `knowledge_base_files`
  ADD PRIMARY KEY (`id`),
  ADD KEY `knowledge_base_files_company_id_foreign` (`company_id`),
  ADD KEY `knowledge_base_files_knowledge_base_id_foreign` (`knowledge_base_id`),
  ADD KEY `knowledge_base_files_added_by_foreign` (`added_by`),
  ADD KEY `knowledge_base_files_last_updated_by_foreign` (`last_updated_by`);

--
-- Indexes for table `knowledge_categories`
--
ALTER TABLE `knowledge_categories`
  ADD PRIMARY KEY (`id`),
  ADD KEY `knowledge_categories_company_id_foreign` (`company_id`);

--
-- Indexes for table `language_settings`
--
ALTER TABLE `language_settings`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `leads`
--
ALTER TABLE `leads`
  ADD PRIMARY KEY (`id`),
  ADD KEY `leads_company_id_foreign` (`company_id`),
  ADD KEY `leads_category_id_foreign` (`category_id`),
  ADD KEY `leads_added_by_foreign` (`added_by`),
  ADD KEY `leads_last_updated_by_foreign` (`last_updated_by`);

--
-- Indexes for table `lead_agents`
--
ALTER TABLE `lead_agents`
  ADD PRIMARY KEY (`id`),
  ADD KEY `lead_agents_company_id_foreign` (`company_id`),
  ADD KEY `lead_agents_user_id_foreign` (`user_id`),
  ADD KEY `lead_agents_added_by_foreign` (`added_by`),
  ADD KEY `lead_agents_last_updated_by_foreign` (`last_updated_by`),
  ADD KEY `lead_agents_lead_category_id_foreign` (`lead_category_id`);

--
-- Indexes for table `lead_category`
--
ALTER TABLE `lead_category`
  ADD PRIMARY KEY (`id`),
  ADD KEY `lead_category_company_id_foreign` (`company_id`),
  ADD KEY `lead_category_added_by_foreign` (`added_by`),
  ADD KEY `lead_category_last_updated_by_foreign` (`last_updated_by`);

--
-- Indexes for table `lead_custom_forms`
--
ALTER TABLE `lead_custom_forms`
  ADD PRIMARY KEY (`id`),
  ADD KEY `lead_custom_forms_company_id_foreign` (`company_id`),
  ADD KEY `lead_custom_forms_custom_fields_id_foreign` (`custom_fields_id`),
  ADD KEY `lead_custom_forms_added_by_foreign` (`added_by`),
  ADD KEY `lead_custom_forms_last_updated_by_foreign` (`last_updated_by`);

--
-- Indexes for table `lead_follow_up`
--
ALTER TABLE `lead_follow_up`
  ADD PRIMARY KEY (`id`),
  ADD KEY `lead_follow_up_added_by_foreign` (`added_by`),
  ADD KEY `lead_follow_up_last_updated_by_foreign` (`last_updated_by`),
  ADD KEY `lead_follow_up_deal_id_foreign` (`deal_id`);

--
-- Indexes for table `lead_notes`
--
ALTER TABLE `lead_notes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `lead_notes_lead_id_foreign` (`lead_id`),
  ADD KEY `lead_notes_member_id_foreign` (`member_id`),
  ADD KEY `lead_notes_added_by_foreign` (`added_by`),
  ADD KEY `lead_notes_last_updated_by_foreign` (`last_updated_by`);

--
-- Indexes for table `lead_pipelines`
--
ALTER TABLE `lead_pipelines`
  ADD PRIMARY KEY (`id`),
  ADD KEY `lead_pipelines_company_id_foreign` (`company_id`);

--
-- Indexes for table `lead_pipeline_stages`
--
ALTER TABLE `lead_pipeline_stages`
  ADD PRIMARY KEY (`id`),
  ADD KEY `lead_pipeline_stages_lead_pipeline_id_foreign` (`lead_pipeline_id`),
  ADD KEY `lead_pipeline_stages_pipeline_stages_id_foreign` (`pipeline_stages_id`);

--
-- Indexes for table `lead_products`
--
ALTER TABLE `lead_products`
  ADD PRIMARY KEY (`id`),
  ADD KEY `lead_products_product_id_foreign` (`product_id`),
  ADD KEY `lead_products_deal_id_foreign` (`deal_id`);

--
-- Indexes for table `lead_setting`
--
ALTER TABLE `lead_setting`
  ADD PRIMARY KEY (`id`),
  ADD KEY `lead_setting_company_id_foreign` (`company_id`),
  ADD KEY `lead_setting_user_id_foreign` (`user_id`);

--
-- Indexes for table `lead_sources`
--
ALTER TABLE `lead_sources`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `lead_sources_type_company_id_unique` (`type`,`company_id`),
  ADD KEY `lead_sources_company_id_foreign` (`company_id`),
  ADD KEY `lead_sources_added_by_foreign` (`added_by`),
  ADD KEY `lead_sources_last_updated_by_foreign` (`last_updated_by`);

--
-- Indexes for table `lead_status`
--
ALTER TABLE `lead_status`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `lead_status_type_company_id_unique` (`type`,`company_id`),
  ADD KEY `lead_status_company_id_foreign` (`company_id`);

--
-- Indexes for table `lead_user_notes`
--
ALTER TABLE `lead_user_notes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `lead_user_notes_user_id_foreign` (`user_id`),
  ADD KEY `lead_user_notes_lead_note_id_foreign` (`lead_note_id`);

--
-- Indexes for table `leaves`
--
ALTER TABLE `leaves`
  ADD PRIMARY KEY (`id`),
  ADD KEY `leaves_company_id_foreign` (`company_id`),
  ADD KEY `leaves_user_id_foreign` (`user_id`),
  ADD KEY `leaves_leave_type_id_foreign` (`leave_type_id`),
  ADD KEY `leaves_leave_date_index` (`leave_date`),
  ADD KEY `leaves_added_by_foreign` (`added_by`),
  ADD KEY `leaves_last_updated_by_foreign` (`last_updated_by`),
  ADD KEY `leaves_approved_by_foreign` (`approved_by`);

--
-- Indexes for table `leave_files`
--
ALTER TABLE `leave_files`
  ADD PRIMARY KEY (`id`),
  ADD KEY `leave_files_company_id_foreign` (`company_id`),
  ADD KEY `leave_files_user_id_foreign` (`user_id`),
  ADD KEY `leave_files_leave_id_foreign` (`leave_id`),
  ADD KEY `leave_files_added_by_foreign` (`added_by`),
  ADD KEY `leave_files_last_updated_by_foreign` (`last_updated_by`);

--
-- Indexes for table `leave_settings`
--
ALTER TABLE `leave_settings`
  ADD PRIMARY KEY (`id`),
  ADD KEY `leave_settings_company_id_foreign` (`company_id`);

--
-- Indexes for table `leave_types`
--
ALTER TABLE `leave_types`
  ADD PRIMARY KEY (`id`),
  ADD KEY `leave_types_company_id_foreign` (`company_id`);

--
-- Indexes for table `log_time_for`
--
ALTER TABLE `log_time_for`
  ADD PRIMARY KEY (`id`),
  ADD KEY `log_time_for_company_id_foreign` (`company_id`);

--
-- Indexes for table `ltm_translations`
--
ALTER TABLE `ltm_translations`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `mention_users`
--
ALTER TABLE `mention_users`
  ADD PRIMARY KEY (`id`),
  ADD KEY `mention_users_task_comment_id_foreign` (`task_comment_id`),
  ADD KEY `mention_users_task_note_id_foreign` (`task_note_id`),
  ADD KEY `mention_users_task_id_foreign` (`task_id`),
  ADD KEY `mention_users_project_id_foreign` (`project_id`),
  ADD KEY `mention_users_project_note_id_foreign` (`project_note_id`),
  ADD KEY `mention_users_discussion_id_foreign` (`discussion_id`),
  ADD KEY `mention_users_user_id_foreign` (`user_id`),
  ADD KEY `mention_users_discussion_reply_id_foreign` (`discussion_reply_id`),
  ADD KEY `mention_users_ticket_id_foreign` (`ticket_id`),
  ADD KEY `mention_users_event_id_foreign` (`event_id`),
  ADD KEY `mention_users_user_chat_id_foreign` (`user_chat_id`);

--
-- Indexes for table `menus`
--
ALTER TABLE `menus`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `menu_settings`
--
ALTER TABLE `menu_settings`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `message_settings`
--
ALTER TABLE `message_settings`
  ADD PRIMARY KEY (`id`),
  ADD KEY `message_settings_company_id_foreign` (`company_id`);

--
-- Indexes for table `migrations`
--
ALTER TABLE `migrations`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `modules`
--
ALTER TABLE `modules`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `module_settings`
--
ALTER TABLE `module_settings`
  ADD PRIMARY KEY (`id`),
  ADD KEY `module_settings_company_id_foreign` (`company_id`);

--
-- Indexes for table `notices`
--
ALTER TABLE `notices`
  ADD PRIMARY KEY (`id`),
  ADD KEY `notices_company_id_foreign` (`company_id`),
  ADD KEY `notices_department_id_foreign` (`department_id`),
  ADD KEY `notices_added_by_foreign` (`added_by`),
  ADD KEY `notices_last_updated_by_foreign` (`last_updated_by`);

--
-- Indexes for table `notice_board_users`
--
ALTER TABLE `notice_board_users`
  ADD PRIMARY KEY (`id`),
  ADD KEY `notice_views_notice_id_foreign` (`notice_id`),
  ADD KEY `notice_views_user_id_foreign` (`user_id`);

--
-- Indexes for table `notice_files`
--
ALTER TABLE `notice_files`
  ADD PRIMARY KEY (`id`),
  ADD KEY `notice_files_notice_id_foreign` (`notice_id`),
  ADD KEY `notice_files_added_by_foreign` (`added_by`),
  ADD KEY `notice_files_last_updated_by_foreign` (`last_updated_by`);

--
-- Indexes for table `notice_views`
--
ALTER TABLE `notice_views`
  ADD PRIMARY KEY (`id`),
  ADD KEY `notice_views_company_id_foreign` (`company_id`),
  ADD KEY `notice_views_notice_id_foreign` (`notice_id`),
  ADD KEY `notice_views_user_id_foreign` (`user_id`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `notifications_notifiable_type_notifiable_id_index` (`notifiable_type`,`notifiable_id`);

--
-- Indexes for table `offline_payment_methods`
--
ALTER TABLE `offline_payment_methods`
  ADD PRIMARY KEY (`id`),
  ADD KEY `offline_payment_methods_company_id_foreign` (`company_id`);

--
-- Indexes for table `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`),
  ADD KEY `orders_company_id_foreign` (`company_id`),
  ADD KEY `orders_client_id_foreign` (`client_id`),
  ADD KEY `orders_currency_id_foreign` (`currency_id`),
  ADD KEY `orders_added_by_foreign` (`added_by`),
  ADD KEY `orders_last_updated_by_foreign` (`last_updated_by`),
  ADD KEY `orders_company_address_id_foreign` (`company_address_id`),
  ADD KEY `orders_project_id_foreign` (`project_id`);

--
-- Indexes for table `order_carts`
--
ALTER TABLE `order_carts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `order_carts_product_id_foreign` (`product_id`),
  ADD KEY `order_carts_client_id_foreign` (`client_id`),
  ADD KEY `order_carts_unit_id_foreign` (`unit_id`);

--
-- Indexes for table `order_items`
--
ALTER TABLE `order_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `order_items_order_id_foreign` (`order_id`),
  ADD KEY `order_items_product_id_foreign` (`product_id`),
  ADD KEY `order_items_unit_id_foreign` (`unit_id`);

--
-- Indexes for table `order_item_images`
--
ALTER TABLE `order_item_images`
  ADD PRIMARY KEY (`id`),
  ADD KEY `order_item_images_order_item_id_index` (`order_item_id`);

--
-- Indexes for table `passport_details`
--
ALTER TABLE `passport_details`
  ADD PRIMARY KEY (`id`),
  ADD KEY `passport_details_company_id_foreign` (`company_id`),
  ADD KEY `passport_details_user_id_foreign` (`user_id`),
  ADD KEY `passport_details_added_by_foreign` (`added_by`),
  ADD KEY `passport_details_country_id_foreign` (`country_id`);

--
-- Indexes for table `password_resets`
--
ALTER TABLE `password_resets`
  ADD PRIMARY KEY (`email`);

--
-- Indexes for table `payments`
--
ALTER TABLE `payments`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `payments_plan_id_unique` (`plan_id`),
  ADD UNIQUE KEY `payments_event_id_company_id_unique` (`event_id`,`company_id`),
  ADD UNIQUE KEY `payments_transaction_id_company_id_unique` (`transaction_id`,`company_id`),
  ADD KEY `payments_company_id_foreign` (`company_id`),
  ADD KEY `payments_project_id_foreign` (`project_id`),
  ADD KEY `payments_invoice_id_foreign` (`invoice_id`),
  ADD KEY `payments_order_id_foreign` (`order_id`),
  ADD KEY `payments_credit_notes_id_foreign` (`credit_notes_id`),
  ADD KEY `payments_currency_id_foreign` (`currency_id`),
  ADD KEY `payments_paid_on_index` (`paid_on`),
  ADD KEY `payments_offline_method_id_foreign` (`offline_method_id`),
  ADD KEY `payments_added_by_foreign` (`added_by`),
  ADD KEY `payments_last_updated_by_foreign` (`last_updated_by`),
  ADD KEY `payments_bank_account_id_foreign` (`bank_account_id`),
  ADD KEY `payments_default_currency_id_foreign` (`default_currency_id`);

--
-- Indexes for table `payment_gateway_credentials`
--
ALTER TABLE `payment_gateway_credentials`
  ADD PRIMARY KEY (`id`),
  ADD KEY `payment_gateway_credentials_company_id_foreign` (`company_id`);

--
-- Indexes for table `permissions`
--
ALTER TABLE `permissions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `permissions_name_module_id_unique` (`name`,`module_id`),
  ADD KEY `permissions_module_id_foreign` (`module_id`);

--
-- Indexes for table `permission_role`
--
ALTER TABLE `permission_role`
  ADD PRIMARY KEY (`permission_id`,`role_id`),
  ADD KEY `permission_role_role_id_foreign` (`role_id`),
  ADD KEY `permission_role_permission_type_id_foreign` (`permission_type_id`);

--
-- Indexes for table `permission_types`
--
ALTER TABLE `permission_types`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `pinned`
--
ALTER TABLE `pinned`
  ADD PRIMARY KEY (`id`),
  ADD KEY `pinned_company_id_foreign` (`company_id`),
  ADD KEY `pinned_project_id_foreign` (`project_id`),
  ADD KEY `pinned_task_id_foreign` (`task_id`),
  ADD KEY `pinned_user_id_foreign` (`user_id`);

--
-- Indexes for table `pipeline_stages`
--
ALTER TABLE `pipeline_stages`
  ADD PRIMARY KEY (`id`),
  ADD KEY `pipeline_stages_company_id_foreign` (`company_id`),
  ADD KEY `pipeline_stages_lead_pipeline_id_foreign` (`lead_pipeline_id`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`),
  ADD KEY `products_company_id_foreign` (`company_id`),
  ADD KEY `products_category_id_foreign` (`category_id`),
  ADD KEY `products_sub_category_id_foreign` (`sub_category_id`),
  ADD KEY `products_added_by_foreign` (`added_by`),
  ADD KEY `products_last_updated_by_foreign` (`last_updated_by`),
  ADD KEY `products_unit_id_foreign` (`unit_id`);

--
-- Indexes for table `product_category`
--
ALTER TABLE `product_category`
  ADD PRIMARY KEY (`id`),
  ADD KEY `product_category_company_id_foreign` (`company_id`);

--
-- Indexes for table `product_files`
--
ALTER TABLE `product_files`
  ADD PRIMARY KEY (`id`),
  ADD KEY `product_files_product_id_foreign` (`product_id`),
  ADD KEY `product_files_added_by_foreign` (`added_by`),
  ADD KEY `product_files_last_updated_by_foreign` (`last_updated_by`),
  ADD KEY `product_files_company_id_foreign` (`company_id`);

--
-- Indexes for table `product_sub_category`
--
ALTER TABLE `product_sub_category`
  ADD PRIMARY KEY (`id`),
  ADD KEY `product_sub_category_company_id_foreign` (`company_id`),
  ADD KEY `product_sub_category_category_id_foreign` (`category_id`);

--
-- Indexes for table `projects`
--
ALTER TABLE `projects`
  ADD PRIMARY KEY (`id`),
  ADD KEY `projects_company_id_foreign` (`company_id`),
  ADD KEY `projects_project_admin_foreign` (`project_admin`),
  ADD KEY `projects_category_id_foreign` (`category_id`),
  ADD KEY `projects_client_id_foreign` (`client_id`),
  ADD KEY `projects_team_id_foreign` (`team_id`),
  ADD KEY `projects_currency_id_foreign` (`currency_id`),
  ADD KEY `projects_added_by_foreign` (`added_by`),
  ADD KEY `projects_last_updated_by_foreign` (`last_updated_by`),
  ADD KEY `projects_deleted_at_index` (`deleted_at`);

--
-- Indexes for table `project_activity`
--
ALTER TABLE `project_activity`
  ADD PRIMARY KEY (`id`),
  ADD KEY `project_activity_project_id_foreign` (`project_id`),
  ADD KEY `project_activity_created_at_index` (`created_at`);

--
-- Indexes for table `project_category`
--
ALTER TABLE `project_category`
  ADD PRIMARY KEY (`id`),
  ADD KEY `project_category_company_id_foreign` (`company_id`),
  ADD KEY `project_category_added_by_foreign` (`added_by`),
  ADD KEY `project_category_last_updated_by_foreign` (`last_updated_by`);

--
-- Indexes for table `project_departments`
--
ALTER TABLE `project_departments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `project_departments_project_id_foreign` (`project_id`),
  ADD KEY `project_departments_team_id_foreign` (`team_id`);

--
-- Indexes for table `project_files`
--
ALTER TABLE `project_files`
  ADD PRIMARY KEY (`id`),
  ADD KEY `project_files_company_id_foreign` (`company_id`),
  ADD KEY `project_files_user_id_foreign` (`user_id`),
  ADD KEY `project_files_project_id_foreign` (`project_id`),
  ADD KEY `project_files_added_by_foreign` (`added_by`),
  ADD KEY `project_files_last_updated_by_foreign` (`last_updated_by`);

--
-- Indexes for table `project_members`
--
ALTER TABLE `project_members`
  ADD PRIMARY KEY (`id`),
  ADD KEY `project_members_user_id_foreign` (`user_id`),
  ADD KEY `project_members_project_id_foreign` (`project_id`),
  ADD KEY `project_members_added_by_foreign` (`added_by`),
  ADD KEY `project_members_last_updated_by_foreign` (`last_updated_by`);

--
-- Indexes for table `project_milestones`
--
ALTER TABLE `project_milestones`
  ADD PRIMARY KEY (`id`),
  ADD KEY `project_milestones_project_id_foreign` (`project_id`),
  ADD KEY `project_milestones_currency_id_foreign` (`currency_id`),
  ADD KEY `project_milestones_added_by_foreign` (`added_by`),
  ADD KEY `project_milestones_last_updated_by_foreign` (`last_updated_by`);

--
-- Indexes for table `project_notes`
--
ALTER TABLE `project_notes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `project_notes_project_id_foreign` (`project_id`),
  ADD KEY `project_notes_client_id_foreign` (`client_id`),
  ADD KEY `project_notes_added_by_foreign` (`added_by`),
  ADD KEY `project_notes_last_updated_by_foreign` (`last_updated_by`);

--
-- Indexes for table `project_ratings`
--
ALTER TABLE `project_ratings`
  ADD PRIMARY KEY (`id`),
  ADD KEY `project_ratings_project_id_foreign` (`project_id`),
  ADD KEY `project_ratings_user_id_foreign` (`user_id`),
  ADD KEY `project_ratings_added_by_foreign` (`added_by`),
  ADD KEY `project_ratings_last_updated_by_foreign` (`last_updated_by`);

--
-- Indexes for table `project_settings`
--
ALTER TABLE `project_settings`
  ADD PRIMARY KEY (`id`),
  ADD KEY `project_settings_company_id_foreign` (`company_id`);

--
-- Indexes for table `project_status_settings`
--
ALTER TABLE `project_status_settings`
  ADD PRIMARY KEY (`id`),
  ADD KEY `project_status_settings_company_id_foreign` (`company_id`);

--
-- Indexes for table `project_templates`
--
ALTER TABLE `project_templates`
  ADD PRIMARY KEY (`id`),
  ADD KEY `project_templates_company_id_foreign` (`company_id`),
  ADD KEY `project_templates_category_id_foreign` (`category_id`),
  ADD KEY `project_templates_client_id_foreign` (`client_id`);

--
-- Indexes for table `project_template_members`
--
ALTER TABLE `project_template_members`
  ADD PRIMARY KEY (`id`),
  ADD KEY `project_template_members_user_id_foreign` (`user_id`),
  ADD KEY `project_template_members_project_template_id_foreign` (`project_template_id`);

--
-- Indexes for table `project_template_sub_tasks`
--
ALTER TABLE `project_template_sub_tasks`
  ADD PRIMARY KEY (`id`),
  ADD KEY `project_template_sub_tasks_project_template_task_id_foreign` (`project_template_task_id`);

--
-- Indexes for table `project_template_tasks`
--
ALTER TABLE `project_template_tasks`
  ADD PRIMARY KEY (`id`),
  ADD KEY `project_template_tasks_project_template_id_foreign` (`project_template_id`),
  ADD KEY `project_template_tasks_project_template_task_category_id_foreign` (`project_template_task_category_id`);

--
-- Indexes for table `project_template_task_users`
--
ALTER TABLE `project_template_task_users`
  ADD PRIMARY KEY (`id`),
  ADD KEY `project_template_task_users_project_template_task_id_foreign` (`project_template_task_id`),
  ADD KEY `project_template_task_users_user_id_foreign` (`user_id`);

--
-- Indexes for table `project_time_logs`
--
ALTER TABLE `project_time_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `project_time_logs_company_id_foreign` (`company_id`),
  ADD KEY `project_time_logs_project_id_foreign` (`project_id`),
  ADD KEY `project_time_logs_task_id_foreign` (`task_id`),
  ADD KEY `project_time_logs_user_id_foreign` (`user_id`),
  ADD KEY `project_time_logs_start_time_index` (`start_time`),
  ADD KEY `project_time_logs_end_time_index` (`end_time`),
  ADD KEY `project_time_logs_edited_by_user_foreign` (`edited_by_user`),
  ADD KEY `project_time_logs_approved_by_foreign` (`approved_by`),
  ADD KEY `project_time_logs_invoice_id_foreign` (`invoice_id`),
  ADD KEY `project_time_logs_added_by_foreign` (`added_by`),
  ADD KEY `project_time_logs_last_updated_by_foreign` (`last_updated_by`);

--
-- Indexes for table `project_time_log_breaks`
--
ALTER TABLE `project_time_log_breaks`
  ADD PRIMARY KEY (`id`),
  ADD KEY `project_time_log_breaks_company_id_foreign` (`company_id`),
  ADD KEY `project_time_log_breaks_project_time_log_id_foreign` (`project_time_log_id`),
  ADD KEY `project_time_log_breaks_start_time_index` (`start_time`),
  ADD KEY `project_time_log_breaks_end_time_index` (`end_time`),
  ADD KEY `project_time_log_breaks_added_by_foreign` (`added_by`),
  ADD KEY `project_time_log_breaks_last_updated_by_foreign` (`last_updated_by`);

--
-- Indexes for table `project_user_notes`
--
ALTER TABLE `project_user_notes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `project_user_notes_user_id_foreign` (`user_id`),
  ADD KEY `project_user_notes_project_note_id_foreign` (`project_note_id`);

--
-- Indexes for table `promotions`
--
ALTER TABLE `promotions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `promotions_company_id_foreign` (`company_id`),
  ADD KEY `promotions_employee_id_foreign` (`employee_id`),
  ADD KEY `promotions_previous_designation_id_foreign` (`previous_designation_id`),
  ADD KEY `promotions_current_designation_id_foreign` (`current_designation_id`),
  ADD KEY `promotions_previous_department_id_foreign` (`previous_department_id`),
  ADD KEY `promotions_current_department_id_foreign` (`current_department_id`);

--
-- Indexes for table `proposals`
--
ALTER TABLE `proposals`
  ADD PRIMARY KEY (`id`),
  ADD KEY `proposals_company_id_foreign` (`company_id`),
  ADD KEY `proposals_currency_id_foreign` (`currency_id`),
  ADD KEY `proposals_added_by_foreign` (`added_by`),
  ADD KEY `proposals_last_updated_by_foreign` (`last_updated_by`),
  ADD KEY `proposals_deal_id_foreign` (`deal_id`);

--
-- Indexes for table `proposal_items`
--
ALTER TABLE `proposal_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `proposal_items_proposal_id_foreign` (`proposal_id`),
  ADD KEY `proposal_items_unit_id_foreign` (`unit_id`),
  ADD KEY `proposal_items_product_id_foreign` (`product_id`);

--
-- Indexes for table `proposal_item_images`
--
ALTER TABLE `proposal_item_images`
  ADD PRIMARY KEY (`id`),
  ADD KEY `proposal_item_images_proposal_item_id_foreign` (`proposal_item_id`);

--
-- Indexes for table `proposal_signs`
--
ALTER TABLE `proposal_signs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `proposal_signs_proposal_id_foreign` (`proposal_id`);

--
-- Indexes for table `proposal_templates`
--
ALTER TABLE `proposal_templates`
  ADD PRIMARY KEY (`id`),
  ADD KEY `proposal_templates_company_id_foreign` (`company_id`),
  ADD KEY `proposal_templates_added_by_foreign` (`added_by`),
  ADD KEY `proposal_templates_last_updated_by_foreign` (`last_updated_by`),
  ADD KEY `proposal_templates_currency_id_foreign` (`currency_id`);

--
-- Indexes for table `proposal_template_items`
--
ALTER TABLE `proposal_template_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `proposal_template_items_company_id_foreign` (`company_id`),
  ADD KEY `proposal_template_items_proposal_template_id_foreign` (`proposal_template_id`),
  ADD KEY `proposal_template_items_unit_id_foreign` (`unit_id`),
  ADD KEY `proposal_template_items_product_id_foreign` (`product_id`);

--
-- Indexes for table `proposal_template_item_images`
--
ALTER TABLE `proposal_template_item_images`
  ADD PRIMARY KEY (`id`),
  ADD KEY `proposal_template_item_images_company_id_foreign` (`company_id`),
  ADD KEY `proposal_template_item_images_proposal_template_item_id_foreign` (`proposal_template_item_id`);

--
-- Indexes for table `purpose_consent`
--
ALTER TABLE `purpose_consent`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `purpose_consent_leads`
--
ALTER TABLE `purpose_consent_leads`
  ADD PRIMARY KEY (`id`),
  ADD KEY `purpose_consent_leads_purpose_consent_id_foreign` (`purpose_consent_id`),
  ADD KEY `purpose_consent_leads_updated_by_id_foreign` (`updated_by_id`),
  ADD KEY `purpose_consent_leads_deal_id_foreign` (`deal_id`);

--
-- Indexes for table `purpose_consent_users`
--
ALTER TABLE `purpose_consent_users`
  ADD PRIMARY KEY (`id`),
  ADD KEY `purpose_consent_users_client_id_foreign` (`client_id`),
  ADD KEY `purpose_consent_users_purpose_consent_id_foreign` (`purpose_consent_id`),
  ADD KEY `purpose_consent_users_updated_by_id_foreign` (`updated_by_id`);

--
-- Indexes for table `pusher_settings`
--
ALTER TABLE `pusher_settings`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `push_notification_settings`
--
ALTER TABLE `push_notification_settings`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `push_subscriptions`
--
ALTER TABLE `push_subscriptions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `push_subscriptions_endpoint_company_id_unique` (`endpoint`,`company_id`),
  ADD KEY `push_subscriptions_company_id_foreign` (`company_id`),
  ADD KEY `push_subscriptions_user_id_index` (`user_id`);

--
-- Indexes for table `qrcode`
--
ALTER TABLE `qrcode`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `quick_books_settings`
--
ALTER TABLE `quick_books_settings`
  ADD PRIMARY KEY (`id`),
  ADD KEY `quick_books_settings_company_id_foreign` (`company_id`);

--
-- Indexes for table `quotations`
--
ALTER TABLE `quotations`
  ADD PRIMARY KEY (`id`),
  ADD KEY `quotations_company_id_foreign` (`company_id`);

--
-- Indexes for table `quotation_items`
--
ALTER TABLE `quotation_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `quotation_items_quotation_id_foreign` (`quotation_id`);

--
-- Indexes for table `removal_requests`
--
ALTER TABLE `removal_requests`
  ADD PRIMARY KEY (`id`),
  ADD KEY `removal_requests_company_id_foreign` (`company_id`),
  ADD KEY `removal_requests_user_id_foreign` (`user_id`);

--
-- Indexes for table `removal_requests_lead`
--
ALTER TABLE `removal_requests_lead`
  ADD PRIMARY KEY (`id`),
  ADD KEY `removal_requests_lead_company_id_foreign` (`company_id`),
  ADD KEY `removal_requests_lead_lead_id_foreign` (`lead_id`);

--
-- Indexes for table `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `roles_name_company_id_unique` (`name`,`company_id`),
  ADD KEY `roles_company_id_foreign` (`company_id`);

--
-- Indexes for table `role_user`
--
ALTER TABLE `role_user`
  ADD PRIMARY KEY (`user_id`,`role_id`),
  ADD KEY `role_user_role_id_foreign` (`role_id`);

--
-- Indexes for table `rotation_automate_log`
--
ALTER TABLE `rotation_automate_log`
  ADD PRIMARY KEY (`id`),
  ADD KEY `rotation_automate_log_company_id_foreign` (`company_id`),
  ADD KEY `rotation_automate_log_employee_shift_rotation_id_foreign` (`employee_shift_rotation_id`),
  ADD KEY `rotation_automate_log_employee_shift_id_foreign` (`employee_shift_id`),
  ADD KEY `employee_shift_schedules_user_id_foreign` (`user_id`);

--
-- Indexes for table `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sessions_user_id_index` (`user_id`),
  ADD KEY `sessions_last_activity_index` (`last_activity`);

--
-- Indexes for table `shift_rotation_sequences`
--
ALTER TABLE `shift_rotation_sequences`
  ADD PRIMARY KEY (`id`),
  ADD KEY `shift_rotation_sequences_employee_shift_rotation_id_foreign` (`employee_shift_rotation_id`),
  ADD KEY `shift_rotation_sequences_employee_shift_id_foreign` (`employee_shift_id`);

--
-- Indexes for table `skills`
--
ALTER TABLE `skills`
  ADD PRIMARY KEY (`id`),
  ADD KEY `skills_company_id_foreign` (`company_id`);

--
-- Indexes for table `slack_settings`
--
ALTER TABLE `slack_settings`
  ADD PRIMARY KEY (`id`),
  ADD KEY `slack_settings_company_id_foreign` (`company_id`);

--
-- Indexes for table `smtp_settings`
--
ALTER TABLE `smtp_settings`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `socials`
--
ALTER TABLE `socials`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `social_auth_settings`
--
ALTER TABLE `social_auth_settings`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `sticky_notes`
--
ALTER TABLE `sticky_notes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sticky_notes_company_id_foreign` (`company_id`),
  ADD KEY `sticky_notes_user_id_foreign` (`user_id`);

--
-- Indexes for table `subscriptions`
--
ALTER TABLE `subscriptions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `subscriptions_stripe_id_unique` (`stripe_id`),
  ADD KEY `subscriptions_company_id_foreign` (`company_id`),
  ADD KEY `subscriptions_user_id_stripe_status_index` (`user_id`,`stripe_status`);

--
-- Indexes for table `subscription_items`
--
ALTER TABLE `subscription_items`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `subscription_items_subscription_id_stripe_price_unique` (`subscription_id`,`stripe_price`),
  ADD UNIQUE KEY `subscription_items_stripe_id_unique` (`stripe_id`);

--
-- Indexes for table `sub_tasks`
--
ALTER TABLE `sub_tasks`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sub_tasks_task_id_foreign` (`task_id`),
  ADD KEY `sub_tasks_assigned_to_foreign` (`assigned_to`),
  ADD KEY `sub_tasks_added_by_foreign` (`added_by`),
  ADD KEY `sub_tasks_last_updated_by_foreign` (`last_updated_by`);

--
-- Indexes for table `sub_task_files`
--
ALTER TABLE `sub_task_files`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sub_task_files_user_id_foreign` (`user_id`),
  ADD KEY `sub_task_files_sub_task_id_foreign` (`sub_task_id`);

--
-- Indexes for table `taskboard_columns`
--
ALTER TABLE `taskboard_columns`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `taskboard_columns_column_name_company_id_unique` (`column_name`,`company_id`),
  ADD KEY `taskboard_columns_company_id_foreign` (`company_id`);

--
-- Indexes for table `tasks`
--
ALTER TABLE `tasks`
  ADD PRIMARY KEY (`id`),
  ADD KEY `tasks_company_id_foreign` (`company_id`),
  ADD KEY `tasks_due_date_index` (`due_date`),
  ADD KEY `tasks_project_id_foreign` (`project_id`),
  ADD KEY `tasks_task_category_id_foreign` (`task_category_id`),
  ADD KEY `tasks_board_column_id_foreign` (`board_column_id`),
  ADD KEY `tasks_created_by_foreign` (`created_by`),
  ADD KEY `tasks_recurring_task_id_foreign` (`recurring_task_id`),
  ADD KEY `tasks_dependent_task_id_foreign` (`dependent_task_id`),
  ADD KEY `tasks_milestone_id_foreign` (`milestone_id`),
  ADD KEY `tasks_added_by_foreign` (`added_by`),
  ADD KEY `tasks_last_updated_by_foreign` (`last_updated_by`),
  ADD KEY `tasks_deleted_at_index` (`deleted_at`);

--
-- Indexes for table `task_category`
--
ALTER TABLE `task_category`
  ADD PRIMARY KEY (`id`),
  ADD KEY `task_category_company_id_foreign` (`company_id`),
  ADD KEY `task_category_added_by_foreign` (`added_by`),
  ADD KEY `task_category_last_updated_by_foreign` (`last_updated_by`);

--
-- Indexes for table `task_comments`
--
ALTER TABLE `task_comments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `task_comments_user_id_foreign` (`user_id`),
  ADD KEY `task_comments_task_id_foreign` (`task_id`),
  ADD KEY `task_comments_added_by_foreign` (`added_by`),
  ADD KEY `task_comments_last_updated_by_foreign` (`last_updated_by`);

--
-- Indexes for table `task_comment_emoji`
--
ALTER TABLE `task_comment_emoji`
  ADD PRIMARY KEY (`id`),
  ADD KEY `task_comment_emoji_user_id_foreign` (`user_id`),
  ADD KEY `task_comment_emoji_comment_id_foreign` (`comment_id`);

--
-- Indexes for table `task_files`
--
ALTER TABLE `task_files`
  ADD PRIMARY KEY (`id`),
  ADD KEY `task_files_user_id_foreign` (`user_id`),
  ADD KEY `task_files_task_id_foreign` (`task_id`),
  ADD KEY `task_files_added_by_foreign` (`added_by`),
  ADD KEY `task_files_last_updated_by_foreign` (`last_updated_by`);

--
-- Indexes for table `task_history`
--
ALTER TABLE `task_history`
  ADD PRIMARY KEY (`id`),
  ADD KEY `task_history_task_id_foreign` (`task_id`),
  ADD KEY `task_history_sub_task_id_foreign` (`sub_task_id`),
  ADD KEY `task_history_user_id_foreign` (`user_id`),
  ADD KEY `task_history_board_column_id_foreign` (`board_column_id`);

--
-- Indexes for table `task_labels`
--
ALTER TABLE `task_labels`
  ADD PRIMARY KEY (`id`),
  ADD KEY `task_labels_label_id_foreign` (`label_id`),
  ADD KEY `task_tags_task_id_foreign` (`task_id`);

--
-- Indexes for table `task_label_list`
--
ALTER TABLE `task_label_list`
  ADD PRIMARY KEY (`id`),
  ADD KEY `task_label_list_company_id_foreign` (`company_id`),
  ADD KEY `task_label_list_project_id_foreign` (`project_id`);

--
-- Indexes for table `task_notes`
--
ALTER TABLE `task_notes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `task_notes_task_id_foreign` (`task_id`),
  ADD KEY `task_notes_added_by_foreign` (`added_by`),
  ADD KEY `task_notes_last_updated_by_foreign` (`last_updated_by`);

--
-- Indexes for table `task_settings`
--
ALTER TABLE `task_settings`
  ADD PRIMARY KEY (`id`),
  ADD KEY `task_settings_company_id_foreign` (`company_id`);

--
-- Indexes for table `task_users`
--
ALTER TABLE `task_users`
  ADD PRIMARY KEY (`id`),
  ADD KEY `task_users_task_id_foreign` (`task_id`),
  ADD KEY `task_users_user_id_foreign` (`user_id`);

--
-- Indexes for table `taxes`
--
ALTER TABLE `taxes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `taxes_company_id_foreign` (`company_id`);

--
-- Indexes for table `teams`
--
ALTER TABLE `teams`
  ADD PRIMARY KEY (`id`),
  ADD KEY `teams_company_id_foreign` (`company_id`),
  ADD KEY `teams_added_by_foreign` (`added_by`),
  ADD KEY `teams_last_updated_by_foreign` (`last_updated_by`);

--
-- Indexes for table `theme_settings`
--
ALTER TABLE `theme_settings`
  ADD PRIMARY KEY (`id`),
  ADD KEY `theme_settings_company_id_foreign` (`company_id`);

--
-- Indexes for table `tickets`
--
ALTER TABLE `tickets`
  ADD PRIMARY KEY (`id`),
  ADD KEY `tickets_company_id_foreign` (`company_id`),
  ADD KEY `tickets_user_id_foreign` (`user_id`),
  ADD KEY `tickets_agent_id_foreign` (`agent_id`),
  ADD KEY `tickets_channel_id_foreign` (`channel_id`),
  ADD KEY `tickets_type_id_foreign` (`type_id`),
  ADD KEY `tickets_country_id_foreign` (`country_id`),
  ADD KEY `tickets_added_by_foreign` (`added_by`),
  ADD KEY `tickets_last_updated_by_foreign` (`last_updated_by`),
  ADD KEY `tickets_updated_at_index` (`updated_at`),
  ADD KEY `tickets_group_id_foreign` (`group_id`),
  ADD KEY `tickets_project_id_foreign` (`project_id`);

--
-- Indexes for table `ticket_activities`
--
ALTER TABLE `ticket_activities`
  ADD PRIMARY KEY (`id`),
  ADD KEY `ticket_activities_ticket_id_foreign` (`ticket_id`),
  ADD KEY `ticket_activities_user_id_foreign` (`user_id`),
  ADD KEY `ticket_activities_assigned_to_foreign` (`assigned_to`),
  ADD KEY `ticket_activities_channel_id_foreign` (`channel_id`),
  ADD KEY `ticket_activities_group_id_foreign` (`group_id`),
  ADD KEY `ticket_activities_type_id_foreign` (`type_id`);

--
-- Indexes for table `ticket_agent_groups`
--
ALTER TABLE `ticket_agent_groups`
  ADD PRIMARY KEY (`id`),
  ADD KEY `ticket_agent_groups_company_id_foreign` (`company_id`),
  ADD KEY `ticket_agent_groups_agent_id_foreign` (`agent_id`),
  ADD KEY `ticket_agent_groups_group_id_foreign` (`group_id`),
  ADD KEY `ticket_agent_groups_added_by_foreign` (`added_by`),
  ADD KEY `ticket_agent_groups_last_updated_by_foreign` (`last_updated_by`);

--
-- Indexes for table `ticket_channels`
--
ALTER TABLE `ticket_channels`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `ticket_channels_channel_name_company_id_unique` (`channel_name`,`company_id`),
  ADD KEY `ticket_channels_company_id_foreign` (`company_id`);

--
-- Indexes for table `ticket_custom_forms`
--
ALTER TABLE `ticket_custom_forms`
  ADD PRIMARY KEY (`id`),
  ADD KEY `ticket_custom_forms_company_id_foreign` (`company_id`),
  ADD KEY `ticket_custom_forms_custom_fields_id_foreign` (`custom_fields_id`);

--
-- Indexes for table `ticket_email_settings`
--
ALTER TABLE `ticket_email_settings`
  ADD PRIMARY KEY (`id`),
  ADD KEY `ticket_email_settings_company_id_foreign` (`company_id`);

--
-- Indexes for table `ticket_files`
--
ALTER TABLE `ticket_files`
  ADD PRIMARY KEY (`id`),
  ADD KEY `ticket_files_user_id_foreign` (`user_id`),
  ADD KEY `ticket_files_ticket_reply_id_foreign` (`ticket_reply_id`);

--
-- Indexes for table `ticket_groups`
--
ALTER TABLE `ticket_groups`
  ADD PRIMARY KEY (`id`),
  ADD KEY `ticket_groups_company_id_foreign` (`company_id`);

--
-- Indexes for table `ticket_replies`
--
ALTER TABLE `ticket_replies`
  ADD PRIMARY KEY (`id`),
  ADD KEY `ticket_replies_ticket_id_foreign` (`ticket_id`),
  ADD KEY `ticket_replies_user_id_foreign` (`user_id`);

--
-- Indexes for table `ticket_reply_templates`
--
ALTER TABLE `ticket_reply_templates`
  ADD PRIMARY KEY (`id`),
  ADD KEY `ticket_reply_templates_company_id_foreign` (`company_id`);

--
-- Indexes for table `ticket_reply_users`
--
ALTER TABLE `ticket_reply_users`
  ADD PRIMARY KEY (`id`),
  ADD KEY `ticket_reply_users_ticket_reply_id_foreign` (`ticket_reply_id`),
  ADD KEY `ticket_reply_users_user_id_foreign` (`user_id`);

--
-- Indexes for table `ticket_settings_for_agents`
--
ALTER TABLE `ticket_settings_for_agents`
  ADD PRIMARY KEY (`id`),
  ADD KEY `ticket_settings_for_agents_company_id_foreign` (`company_id`),
  ADD KEY `ticket_settings_for_agents_updated_by_foreign` (`updated_by`),
  ADD KEY `ticket_setting_user_id_foreign` (`user_id`);

--
-- Indexes for table `ticket_tags`
--
ALTER TABLE `ticket_tags`
  ADD PRIMARY KEY (`id`),
  ADD KEY `ticket_tags_company_id_foreign` (`company_id`),
  ADD KEY `ticket_tags_tag_id_foreign` (`tag_id`),
  ADD KEY `ticket_tags_ticket_id_foreign` (`ticket_id`);

--
-- Indexes for table `ticket_tag_list`
--
ALTER TABLE `ticket_tag_list`
  ADD PRIMARY KEY (`id`),
  ADD KEY `ticket_tag_list_company_id_foreign` (`company_id`);

--
-- Indexes for table `ticket_types`
--
ALTER TABLE `ticket_types`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `ticket_types_type_company_id_unique` (`type`,`company_id`),
  ADD KEY `ticket_types_company_id_foreign` (`company_id`);

--
-- Indexes for table `track_devices`
--
ALTER TABLE `track_devices`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `track_devices_device_uuid_unique` (`device_uuid`),
  ADD KEY `track_devices_device_type_index` (`device_type`),
  ADD KEY `track_devices_ip_index` (`ip`),
  ADD KEY `track_devices_is_rogue_device_index` (`is_rogue_device`);

--
-- Indexes for table `translate_settings`
--
ALTER TABLE `translate_settings`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `unit_types`
--
ALTER TABLE `unit_types`
  ADD PRIMARY KEY (`id`),
  ADD KEY `unit_types_company_id_foreign` (`company_id`);

--
-- Indexes for table `universal_search`
--
ALTER TABLE `universal_search`
  ADD PRIMARY KEY (`id`),
  ADD KEY `universal_search_company_id_foreign` (`company_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `users_email_company_id_unique` (`email`,`company_id`),
  ADD KEY `users_country_id_foreign` (`country_id`),
  ADD KEY `users_company_id_foreign` (`company_id`),
  ADD KEY `users_stripe_id_index` (`stripe_id`);

--
-- Indexes for table `users_chat`
--
ALTER TABLE `users_chat`
  ADD PRIMARY KEY (`id`),
  ADD KEY `users_chat_company_id_foreign` (`company_id`),
  ADD KEY `users_chat_user_one_foreign` (`user_one`),
  ADD KEY `users_chat_user_id_foreign` (`user_id`),
  ADD KEY `users_chat_from_foreign` (`from`),
  ADD KEY `users_chat_to_foreign` (`to`);

--
-- Indexes for table `users_chat_files`
--
ALTER TABLE `users_chat_files`
  ADD PRIMARY KEY (`id`),
  ADD KEY `users_chat_files_company_id_foreign` (`company_id`),
  ADD KEY `users_chat_files_user_id_foreign` (`user_id`),
  ADD KEY `users_chat_files_users_chat_id_foreign` (`users_chat_id`);

--
-- Indexes for table `user_activities`
--
ALTER TABLE `user_activities`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_activities_company_id_foreign` (`company_id`),
  ADD KEY `user_activities_user_id_foreign` (`user_id`),
  ADD KEY `user_activities_created_at_index` (`created_at`);

--
-- Indexes for table `user_invitations`
--
ALTER TABLE `user_invitations`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_invitations_company_id_foreign` (`company_id`),
  ADD KEY `user_invitations_user_id_foreign` (`user_id`);

--
-- Indexes for table `user_leadboard_settings`
--
ALTER TABLE `user_leadboard_settings`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_leadboard_settings_company_id_foreign` (`company_id`),
  ADD KEY `user_leadboard_settings_user_id_foreign` (`user_id`),
  ADD KEY `user_leadboard_settings_pipeline_stage_id_foreign` (`pipeline_stage_id`);

--
-- Indexes for table `user_permissions`
--
ALTER TABLE `user_permissions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_permissions_permission_id_user_id_unique` (`permission_id`,`user_id`),
  ADD KEY `user_permissions_user_id_foreign` (`user_id`),
  ADD KEY `user_permissions_permission_id_foreign` (`permission_id`),
  ADD KEY `user_permissions_permission_type_id_foreign` (`permission_type_id`);

--
-- Indexes for table `user_taskboard_settings`
--
ALTER TABLE `user_taskboard_settings`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_taskboard_settings_company_id_foreign` (`company_id`),
  ADD KEY `user_taskboard_settings_user_id_foreign` (`user_id`),
  ADD KEY `user_taskboard_settings_board_column_id_foreign` (`board_column_id`);

--
-- Indexes for table `visa_details`
--
ALTER TABLE `visa_details`
  ADD PRIMARY KEY (`id`),
  ADD KEY `visa_details_company_id_foreign` (`company_id`),
  ADD KEY `visa_details_user_id_foreign` (`user_id`),
  ADD KEY `visa_details_added_by_foreign` (`added_by`),
  ADD KEY `visa_details_country_id_foreign` (`country_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `accept_estimates`
--
ALTER TABLE `accept_estimates`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `appreciations`
--
ALTER TABLE `appreciations`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `attendances`
--
ALTER TABLE `attendances`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `attendance_settings`
--
ALTER TABLE `attendance_settings`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `automate_shifts`
--
ALTER TABLE `automate_shifts`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `awards`
--
ALTER TABLE `awards`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `award_icons`
--
ALTER TABLE `award_icons`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `bank_accounts`
--
ALTER TABLE `bank_accounts`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `bank_transactions`
--
ALTER TABLE `bank_transactions`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `client_categories`
--
ALTER TABLE `client_categories`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `client_contacts`
--
ALTER TABLE `client_contacts`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `client_details`
--
ALTER TABLE `client_details`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `client_docs`
--
ALTER TABLE `client_docs`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `client_notes`
--
ALTER TABLE `client_notes`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `client_sub_categories`
--
ALTER TABLE `client_sub_categories`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `client_user_notes`
--
ALTER TABLE `client_user_notes`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `companies`
--
ALTER TABLE `companies`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `company_addresses`
--
ALTER TABLE `company_addresses`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `contracts`
--
ALTER TABLE `contracts`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `contract_discussions`
--
ALTER TABLE `contract_discussions`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `contract_files`
--
ALTER TABLE `contract_files`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `contract_renews`
--
ALTER TABLE `contract_renews`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `contract_signs`
--
ALTER TABLE `contract_signs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `contract_templates`
--
ALTER TABLE `contract_templates`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `contract_types`
--
ALTER TABLE `contract_types`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `conversation`
--
ALTER TABLE `conversation`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `conversation_reply`
--
ALTER TABLE `conversation_reply`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `countries`
--
ALTER TABLE `countries`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=254;

--
-- AUTO_INCREMENT for table `credit_notes`
--
ALTER TABLE `credit_notes`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `credit_note_items`
--
ALTER TABLE `credit_note_items`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `credit_note_item_images`
--
ALTER TABLE `credit_note_item_images`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `currencies`
--
ALTER TABLE `currencies`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `currency_format_settings`
--
ALTER TABLE `currency_format_settings`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `custom_fields`
--
ALTER TABLE `custom_fields`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `custom_fields_data`
--
ALTER TABLE `custom_fields_data`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `custom_field_groups`
--
ALTER TABLE `custom_field_groups`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `custom_link_settings`
--
ALTER TABLE `custom_link_settings`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `dashboard_widgets`
--
ALTER TABLE `dashboard_widgets`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=84;

--
-- AUTO_INCREMENT for table `database_backups`
--
ALTER TABLE `database_backups`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `database_backup_cron_settings`
--
ALTER TABLE `database_backup_cron_settings`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `deals`
--
ALTER TABLE `deals`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `deal_files`
--
ALTER TABLE `deal_files`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `deal_histories`
--
ALTER TABLE `deal_histories`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `deal_notes`
--
ALTER TABLE `deal_notes`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `designations`
--
ALTER TABLE `designations`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `device_user`
--
ALTER TABLE `device_user`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `discussions`
--
ALTER TABLE `discussions`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `discussion_categories`
--
ALTER TABLE `discussion_categories`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `discussion_files`
--
ALTER TABLE `discussion_files`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `discussion_replies`
--
ALTER TABLE `discussion_replies`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `email_notification_settings`
--
ALTER TABLE `email_notification_settings`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=30;

--
-- AUTO_INCREMENT for table `emergency_contacts`
--
ALTER TABLE `emergency_contacts`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `employee_activity`
--
ALTER TABLE `employee_activity`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `employee_details`
--
ALTER TABLE `employee_details`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `employee_docs`
--
ALTER TABLE `employee_docs`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `employee_leave_quotas`
--
ALTER TABLE `employee_leave_quotas`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `employee_leave_quota_histories`
--
ALTER TABLE `employee_leave_quota_histories`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `employee_shifts`
--
ALTER TABLE `employee_shifts`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `employee_shift_change_requests`
--
ALTER TABLE `employee_shift_change_requests`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `employee_shift_rotations`
--
ALTER TABLE `employee_shift_rotations`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `employee_shift_schedules`
--
ALTER TABLE `employee_shift_schedules`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `employee_skills`
--
ALTER TABLE `employee_skills`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `employee_teams`
--
ALTER TABLE `employee_teams`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `estimates`
--
ALTER TABLE `estimates`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `estimate_items`
--
ALTER TABLE `estimate_items`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `estimate_item_images`
--
ALTER TABLE `estimate_item_images`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `estimate_requests`
--
ALTER TABLE `estimate_requests`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `estimate_templates`
--
ALTER TABLE `estimate_templates`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `estimate_template_items`
--
ALTER TABLE `estimate_template_items`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `estimate_template_item_images`
--
ALTER TABLE `estimate_template_item_images`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `events`
--
ALTER TABLE `events`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `event_attendees`
--
ALTER TABLE `event_attendees`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `event_files`
--
ALTER TABLE `event_files`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `expenses`
--
ALTER TABLE `expenses`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `expenses_category`
--
ALTER TABLE `expenses_category`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `expenses_category_roles`
--
ALTER TABLE `expenses_category_roles`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `expenses_recurring`
--
ALTER TABLE `expenses_recurring`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `failed_jobs`
--
ALTER TABLE `failed_jobs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `file_storage`
--
ALTER TABLE `file_storage`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `file_storage_settings`
--
ALTER TABLE `file_storage_settings`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `flags`
--
ALTER TABLE `flags`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=267;

--
-- AUTO_INCREMENT for table `gantt_links`
--
ALTER TABLE `gantt_links`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `gdpr_settings`
--
ALTER TABLE `gdpr_settings`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `global_settings`
--
ALTER TABLE `global_settings`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `google_calendar_modules`
--
ALTER TABLE `google_calendar_modules`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `holidays`
--
ALTER TABLE `holidays`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `invoices`
--
ALTER TABLE `invoices`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `invoice_files`
--
ALTER TABLE `invoice_files`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `invoice_items`
--
ALTER TABLE `invoice_items`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `invoice_item_images`
--
ALTER TABLE `invoice_item_images`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `invoice_payment_details`
--
ALTER TABLE `invoice_payment_details`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `invoice_recurring`
--
ALTER TABLE `invoice_recurring`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `invoice_recurring_items`
--
ALTER TABLE `invoice_recurring_items`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `invoice_recurring_item_images`
--
ALTER TABLE `invoice_recurring_item_images`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `invoice_settings`
--
ALTER TABLE `invoice_settings`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `issues`
--
ALTER TABLE `issues`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `jobs`
--
ALTER TABLE `jobs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `knowledge_bases`
--
ALTER TABLE `knowledge_bases`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `knowledge_base_files`
--
ALTER TABLE `knowledge_base_files`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `knowledge_categories`
--
ALTER TABLE `knowledge_categories`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `language_settings`
--
ALTER TABLE `language_settings`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=29;

--
-- AUTO_INCREMENT for table `leads`
--
ALTER TABLE `leads`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `lead_agents`
--
ALTER TABLE `lead_agents`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `lead_category`
--
ALTER TABLE `lead_category`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `lead_custom_forms`
--
ALTER TABLE `lead_custom_forms`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `lead_follow_up`
--
ALTER TABLE `lead_follow_up`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `lead_notes`
--
ALTER TABLE `lead_notes`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `lead_pipelines`
--
ALTER TABLE `lead_pipelines`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `lead_pipeline_stages`
--
ALTER TABLE `lead_pipeline_stages`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `lead_products`
--
ALTER TABLE `lead_products`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `lead_setting`
--
ALTER TABLE `lead_setting`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `lead_sources`
--
ALTER TABLE `lead_sources`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `lead_status`
--
ALTER TABLE `lead_status`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `lead_user_notes`
--
ALTER TABLE `lead_user_notes`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `leaves`
--
ALTER TABLE `leaves`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `leave_files`
--
ALTER TABLE `leave_files`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `leave_settings`
--
ALTER TABLE `leave_settings`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `leave_types`
--
ALTER TABLE `leave_types`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `log_time_for`
--
ALTER TABLE `log_time_for`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `ltm_translations`
--
ALTER TABLE `ltm_translations`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `mention_users`
--
ALTER TABLE `mention_users`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `menus`
--
ALTER TABLE `menus`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `menu_settings`
--
ALTER TABLE `menu_settings`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `message_settings`
--
ALTER TABLE `message_settings`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `migrations`
--
ALTER TABLE `migrations`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=222;

--
-- AUTO_INCREMENT for table `modules`
--
ALTER TABLE `modules`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=26;

--
-- AUTO_INCREMENT for table `module_settings`
--
ALTER TABLE `module_settings`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=62;

--
-- AUTO_INCREMENT for table `notices`
--
ALTER TABLE `notices`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `notice_board_users`
--
ALTER TABLE `notice_board_users`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `notice_files`
--
ALTER TABLE `notice_files`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `notice_views`
--
ALTER TABLE `notice_views`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `offline_payment_methods`
--
ALTER TABLE `offline_payment_methods`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `orders`
--
ALTER TABLE `orders`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `order_carts`
--
ALTER TABLE `order_carts`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `order_items`
--
ALTER TABLE `order_items`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `order_item_images`
--
ALTER TABLE `order_item_images`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `passport_details`
--
ALTER TABLE `passport_details`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `payments`
--
ALTER TABLE `payments`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `payment_gateway_credentials`
--
ALTER TABLE `payment_gateway_credentials`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `permissions`
--
ALTER TABLE `permissions`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=322;

--
-- AUTO_INCREMENT for table `permission_types`
--
ALTER TABLE `permission_types`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `pinned`
--
ALTER TABLE `pinned`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `pipeline_stages`
--
ALTER TABLE `pipeline_stages`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `product_category`
--
ALTER TABLE `product_category`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `product_files`
--
ALTER TABLE `product_files`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `product_sub_category`
--
ALTER TABLE `product_sub_category`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `projects`
--
ALTER TABLE `projects`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `project_activity`
--
ALTER TABLE `project_activity`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `project_category`
--
ALTER TABLE `project_category`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `project_departments`
--
ALTER TABLE `project_departments`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `project_files`
--
ALTER TABLE `project_files`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `project_members`
--
ALTER TABLE `project_members`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `project_milestones`
--
ALTER TABLE `project_milestones`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `project_notes`
--
ALTER TABLE `project_notes`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `project_ratings`
--
ALTER TABLE `project_ratings`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `project_settings`
--
ALTER TABLE `project_settings`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `project_status_settings`
--
ALTER TABLE `project_status_settings`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `project_templates`
--
ALTER TABLE `project_templates`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `project_template_members`
--
ALTER TABLE `project_template_members`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `project_template_sub_tasks`
--
ALTER TABLE `project_template_sub_tasks`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `project_template_tasks`
--
ALTER TABLE `project_template_tasks`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `project_template_task_users`
--
ALTER TABLE `project_template_task_users`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `project_time_logs`
--
ALTER TABLE `project_time_logs`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `project_time_log_breaks`
--
ALTER TABLE `project_time_log_breaks`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `project_user_notes`
--
ALTER TABLE `project_user_notes`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `promotions`
--
ALTER TABLE `promotions`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `proposals`
--
ALTER TABLE `proposals`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `proposal_items`
--
ALTER TABLE `proposal_items`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `proposal_item_images`
--
ALTER TABLE `proposal_item_images`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `proposal_signs`
--
ALTER TABLE `proposal_signs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `proposal_templates`
--
ALTER TABLE `proposal_templates`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `proposal_template_items`
--
ALTER TABLE `proposal_template_items`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `proposal_template_item_images`
--
ALTER TABLE `proposal_template_item_images`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `purpose_consent`
--
ALTER TABLE `purpose_consent`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `purpose_consent_leads`
--
ALTER TABLE `purpose_consent_leads`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `purpose_consent_users`
--
ALTER TABLE `purpose_consent_users`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `pusher_settings`
--
ALTER TABLE `pusher_settings`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `push_notification_settings`
--
ALTER TABLE `push_notification_settings`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `push_subscriptions`
--
ALTER TABLE `push_subscriptions`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `qrcode`
--
ALTER TABLE `qrcode`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `quick_books_settings`
--
ALTER TABLE `quick_books_settings`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `quotations`
--
ALTER TABLE `quotations`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `quotation_items`
--
ALTER TABLE `quotation_items`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `removal_requests`
--
ALTER TABLE `removal_requests`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `removal_requests_lead`
--
ALTER TABLE `removal_requests_lead`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `roles`
--
ALTER TABLE `roles`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `rotation_automate_log`
--
ALTER TABLE `rotation_automate_log`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `shift_rotation_sequences`
--
ALTER TABLE `shift_rotation_sequences`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `skills`
--
ALTER TABLE `skills`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `slack_settings`
--
ALTER TABLE `slack_settings`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `smtp_settings`
--
ALTER TABLE `smtp_settings`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `socials`
--
ALTER TABLE `socials`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `social_auth_settings`
--
ALTER TABLE `social_auth_settings`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `sticky_notes`
--
ALTER TABLE `sticky_notes`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `subscriptions`
--
ALTER TABLE `subscriptions`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `subscription_items`
--
ALTER TABLE `subscription_items`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `sub_tasks`
--
ALTER TABLE `sub_tasks`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `sub_task_files`
--
ALTER TABLE `sub_task_files`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `taskboard_columns`
--
ALTER TABLE `taskboard_columns`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `tasks`
--
ALTER TABLE `tasks`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `task_category`
--
ALTER TABLE `task_category`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `task_comments`
--
ALTER TABLE `task_comments`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `task_comment_emoji`
--
ALTER TABLE `task_comment_emoji`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `task_files`
--
ALTER TABLE `task_files`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `task_history`
--
ALTER TABLE `task_history`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `task_labels`
--
ALTER TABLE `task_labels`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `task_label_list`
--
ALTER TABLE `task_label_list`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `task_notes`
--
ALTER TABLE `task_notes`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `task_settings`
--
ALTER TABLE `task_settings`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `task_users`
--
ALTER TABLE `task_users`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `taxes`
--
ALTER TABLE `taxes`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `teams`
--
ALTER TABLE `teams`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `theme_settings`
--
ALTER TABLE `theme_settings`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `tickets`
--
ALTER TABLE `tickets`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `ticket_activities`
--
ALTER TABLE `ticket_activities`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `ticket_agent_groups`
--
ALTER TABLE `ticket_agent_groups`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `ticket_channels`
--
ALTER TABLE `ticket_channels`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `ticket_custom_forms`
--
ALTER TABLE `ticket_custom_forms`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `ticket_email_settings`
--
ALTER TABLE `ticket_email_settings`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `ticket_files`
--
ALTER TABLE `ticket_files`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `ticket_groups`
--
ALTER TABLE `ticket_groups`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `ticket_replies`
--
ALTER TABLE `ticket_replies`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `ticket_reply_templates`
--
ALTER TABLE `ticket_reply_templates`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `ticket_reply_users`
--
ALTER TABLE `ticket_reply_users`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `ticket_settings_for_agents`
--
ALTER TABLE `ticket_settings_for_agents`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `ticket_tags`
--
ALTER TABLE `ticket_tags`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `ticket_tag_list`
--
ALTER TABLE `ticket_tag_list`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `ticket_types`
--
ALTER TABLE `ticket_types`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `track_devices`
--
ALTER TABLE `track_devices`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `translate_settings`
--
ALTER TABLE `translate_settings`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `unit_types`
--
ALTER TABLE `unit_types`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `universal_search`
--
ALTER TABLE `universal_search`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `users_chat`
--
ALTER TABLE `users_chat`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users_chat_files`
--
ALTER TABLE `users_chat_files`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `user_activities`
--
ALTER TABLE `user_activities`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `user_invitations`
--
ALTER TABLE `user_invitations`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `user_leadboard_settings`
--
ALTER TABLE `user_leadboard_settings`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `user_permissions`
--
ALTER TABLE `user_permissions`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=317;

--
-- AUTO_INCREMENT for table `user_taskboard_settings`
--
ALTER TABLE `user_taskboard_settings`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `visa_details`
--
ALTER TABLE `visa_details`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `accept_estimates`
--
ALTER TABLE `accept_estimates`
  ADD CONSTRAINT `accept_estimates_company_id_foreign` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `accept_estimates_estimate_id_foreign` FOREIGN KEY (`estimate_id`) REFERENCES `estimates` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `appreciations`
--
ALTER TABLE `appreciations`
  ADD CONSTRAINT `appreciations_added_by_foreign` FOREIGN KEY (`added_by`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `appreciations_award_id_foreign` FOREIGN KEY (`award_id`) REFERENCES `awards` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `appreciations_award_to_foreign` FOREIGN KEY (`award_to`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `appreciations_company_id_foreign` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `attendances`
--
ALTER TABLE `attendances`
  ADD CONSTRAINT `attendances_added_by_foreign` FOREIGN KEY (`added_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `attendances_company_id_foreign` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `attendances_employee_shift_id_foreign` FOREIGN KEY (`employee_shift_id`) REFERENCES `employee_shifts` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `attendances_last_updated_by_foreign` FOREIGN KEY (`last_updated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `attendances_location_id_foreign` FOREIGN KEY (`location_id`) REFERENCES `company_addresses` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `attendances_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `attendance_settings`
--
ALTER TABLE `attendance_settings`
  ADD CONSTRAINT `attendance_settings_company_id_foreign` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `attendance_settings_default_employee_shift_foreign` FOREIGN KEY (`default_employee_shift`) REFERENCES `employee_shifts` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `automate_shifts`
--
ALTER TABLE `automate_shifts`
  ADD CONSTRAINT `automate_shifts_employee_shift_rotation_id_foreign` FOREIGN KEY (`employee_shift_rotation_id`) REFERENCES `employee_shift_rotations` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `automate_shifts_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `awards`
--
ALTER TABLE `awards`
  ADD CONSTRAINT `awards_award_icon_id_foreign` FOREIGN KEY (`award_icon_id`) REFERENCES `award_icons` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `awards_company_id_foreign` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `bank_accounts`
--
ALTER TABLE `bank_accounts`
  ADD CONSTRAINT `bank_accounts_added_by_foreign` FOREIGN KEY (`added_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `bank_accounts_company_id_foreign` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `bank_accounts_currency_id_foreign` FOREIGN KEY (`currency_id`) REFERENCES `currencies` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `bank_accounts_last_updated_by_foreign` FOREIGN KEY (`last_updated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `bank_transactions`
--
ALTER TABLE `bank_transactions`
  ADD CONSTRAINT `bank_transactions_added_by_foreign` FOREIGN KEY (`added_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `bank_transactions_bank_account_id_foreign` FOREIGN KEY (`bank_account_id`) REFERENCES `bank_accounts` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `bank_transactions_company_id_foreign` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `bank_transactions_expense_id_foreign` FOREIGN KEY (`expense_id`) REFERENCES `expenses` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `bank_transactions_invoice_id_foreign` FOREIGN KEY (`invoice_id`) REFERENCES `invoices` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `bank_transactions_last_updated_by_foreign` FOREIGN KEY (`last_updated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `bank_transactions_payment_id_foreign` FOREIGN KEY (`payment_id`) REFERENCES `payments` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `client_categories`
--
ALTER TABLE `client_categories`
  ADD CONSTRAINT `client_categories_company_id_foreign` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `client_contacts`
--
ALTER TABLE `client_contacts`
  ADD CONSTRAINT `client_contacts_added_by_foreign` FOREIGN KEY (`added_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `client_contacts_company_id_foreign` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `client_contacts_last_updated_by_foreign` FOREIGN KEY (`last_updated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `client_contacts_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `client_details`
--
ALTER TABLE `client_details`
  ADD CONSTRAINT `client_details_added_by_foreign` FOREIGN KEY (`added_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `client_details_category_id_foreign` FOREIGN KEY (`category_id`) REFERENCES `client_categories` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `client_details_company_id_foreign` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `client_details_last_updated_by_foreign` FOREIGN KEY (`last_updated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `client_details_sub_category_id_foreign` FOREIGN KEY (`sub_category_id`) REFERENCES `client_sub_categories` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `client_details_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `client_docs`
--
ALTER TABLE `client_docs`
  ADD CONSTRAINT `client_docs_added_by_foreign` FOREIGN KEY (`added_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `client_docs_company_id_foreign` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `client_docs_last_updated_by_foreign` FOREIGN KEY (`last_updated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `client_docs_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `client_notes`
--
ALTER TABLE `client_notes`
  ADD CONSTRAINT `client_notes_added_by_foreign` FOREIGN KEY (`added_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `client_notes_client_id_foreign` FOREIGN KEY (`client_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `client_notes_company_id_foreign` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `client_notes_last_updated_by_foreign` FOREIGN KEY (`last_updated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `client_notes_member_id_foreign` FOREIGN KEY (`member_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `client_sub_categories`
--
ALTER TABLE `client_sub_categories`
  ADD CONSTRAINT `client_sub_categories_category_id_foreign` FOREIGN KEY (`category_id`) REFERENCES `client_categories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `client_sub_categories_company_id_foreign` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `client_user_notes`
--
ALTER TABLE `client_user_notes`
  ADD CONSTRAINT `client_user_notes_client_note_id_foreign` FOREIGN KEY (`client_note_id`) REFERENCES `client_notes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `client_user_notes_company_id_foreign` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `client_user_notes_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `companies`
--
ALTER TABLE `companies`
  ADD CONSTRAINT `companies_currency_id_foreign` FOREIGN KEY (`currency_id`) REFERENCES `currencies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `companies_default_task_status_foreign` FOREIGN KEY (`default_task_status`) REFERENCES `taskboard_columns` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `companies_last_updated_by_foreign` FOREIGN KEY (`last_updated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `company_addresses`
--
ALTER TABLE `company_addresses`
  ADD CONSTRAINT `company_addresses_company_id_foreign` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `company_addresses_country_id_foreign` FOREIGN KEY (`country_id`) REFERENCES `countries` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `contracts`
--
ALTER TABLE `contracts`
  ADD CONSTRAINT `contracts_added_by_foreign` FOREIGN KEY (`added_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `contracts_client_id_foreign` FOREIGN KEY (`client_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `contracts_company_id_foreign` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `contracts_contract_type_id_foreign` FOREIGN KEY (`contract_type_id`) REFERENCES `contract_types` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `contracts_currency_id_foreign` FOREIGN KEY (`currency_id`) REFERENCES `currencies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `contracts_last_updated_by_foreign` FOREIGN KEY (`last_updated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `contracts_project_id_foreign` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `contracts_sign_by_foreign` FOREIGN KEY (`sign_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `contract_discussions`
--
ALTER TABLE `contract_discussions`
  ADD CONSTRAINT `contract_discussions_added_by_foreign` FOREIGN KEY (`added_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `contract_discussions_company_id_foreign` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `contract_discussions_contract_id_foreign` FOREIGN KEY (`contract_id`) REFERENCES `contracts` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `contract_discussions_from_foreign` FOREIGN KEY (`from`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `contract_discussions_last_updated_by_foreign` FOREIGN KEY (`last_updated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `contract_files`
--
ALTER TABLE `contract_files`
  ADD CONSTRAINT `contract_files_added_by_foreign` FOREIGN KEY (`added_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `contract_files_company_id_foreign` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `contract_files_contract_id_foreign` FOREIGN KEY (`contract_id`) REFERENCES `contracts` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `contract_files_last_updated_by_foreign` FOREIGN KEY (`last_updated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `contract_files_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `contract_renews`
--
ALTER TABLE `contract_renews`
  ADD CONSTRAINT `contract_renews_added_by_foreign` FOREIGN KEY (`added_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `contract_renews_company_id_foreign` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `contract_renews_contract_id_foreign` FOREIGN KEY (`contract_id`) REFERENCES `contracts` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `contract_renews_last_updated_by_foreign` FOREIGN KEY (`last_updated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `contract_renews_renewed_by_foreign` FOREIGN KEY (`renewed_by`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `contract_signs`
--
ALTER TABLE `contract_signs`
  ADD CONSTRAINT `contract_signs_company_id_foreign` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `contract_signs_contract_id_foreign` FOREIGN KEY (`contract_id`) REFERENCES `contracts` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `contract_templates`
--
ALTER TABLE `contract_templates`
  ADD CONSTRAINT `contract_templates_company_id_foreign` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `contract_templates_contract_type_id_foreign` FOREIGN KEY (`contract_type_id`) REFERENCES `contract_types` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `contract_templates_currency_id_foreign` FOREIGN KEY (`currency_id`) REFERENCES `currencies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `contract_types`
--
ALTER TABLE `contract_types`
  ADD CONSTRAINT `contract_types_company_id_foreign` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `conversation`
--
ALTER TABLE `conversation`
  ADD CONSTRAINT `conversation_company_id_foreign` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `conversation_reply`
--
ALTER TABLE `conversation_reply`
  ADD CONSTRAINT `conversation_reply_company_id_foreign` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `conversation_reply_conversation_id_foreign` FOREIGN KEY (`conversation_id`) REFERENCES `conversation` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `conversation_reply_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `credit_notes`
--
ALTER TABLE `credit_notes`
  ADD CONSTRAINT `credit_notes_added_by_foreign` FOREIGN KEY (`added_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `credit_notes_client_id_foreign` FOREIGN KEY (`client_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `credit_notes_company_id_foreign` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `credit_notes_currency_id_foreign` FOREIGN KEY (`currency_id`) REFERENCES `currencies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `credit_notes_last_updated_by_foreign` FOREIGN KEY (`last_updated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `credit_notes_project_id_foreign` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `credit_note_items`
--
ALTER TABLE `credit_note_items`
  ADD CONSTRAINT `credit_note_items_credit_note_id_foreign` FOREIGN KEY (`credit_note_id`) REFERENCES `credit_notes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `credit_note_items_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `credit_note_items_unit_id_foreign` FOREIGN KEY (`unit_id`) REFERENCES `unit_types` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `credit_note_item_images`
--
ALTER TABLE `credit_note_item_images`
  ADD CONSTRAINT `credit_note_item_images_credit_note_item_id_foreign` FOREIGN KEY (`credit_note_item_id`) REFERENCES `credit_note_items` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `currencies`
--
ALTER TABLE `currencies`
  ADD CONSTRAINT `currencies_company_id_foreign` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `currency_format_settings`
--
ALTER TABLE `currency_format_settings`
  ADD CONSTRAINT `currency_format_settings_company_id_foreign` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `custom_fields`
--
ALTER TABLE `custom_fields`
  ADD CONSTRAINT `custom_fields_company_id_foreign` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `custom_fields_custom_field_group_id_foreign` FOREIGN KEY (`custom_field_group_id`) REFERENCES `custom_field_groups` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `custom_fields_data`
--
ALTER TABLE `custom_fields_data`
  ADD CONSTRAINT `custom_fields_data_custom_field_id_foreign` FOREIGN KEY (`custom_field_id`) REFERENCES `custom_fields` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `custom_field_groups`
--
ALTER TABLE `custom_field_groups`
  ADD CONSTRAINT `custom_field_groups_company_id_foreign` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `custom_link_settings`
--
ALTER TABLE `custom_link_settings`
  ADD CONSTRAINT `custom_link_settings_company_id_foreign` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `dashboard_widgets`
--
ALTER TABLE `dashboard_widgets`
  ADD CONSTRAINT `dashboard_widgets_company_id_foreign` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `deals`
--
ALTER TABLE `deals`
  ADD CONSTRAINT `deals_added_by_foreign` FOREIGN KEY (`added_by`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `deals_agent_id_foreign` FOREIGN KEY (`agent_id`) REFERENCES `lead_agents` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `deals_category_id_foreign` FOREIGN KEY (`category_id`) REFERENCES `lead_category` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `deals_company_id_foreign` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `deals_currency_id_foreign` FOREIGN KEY (`currency_id`) REFERENCES `currencies` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `deals_last_updated_by_foreign` FOREIGN KEY (`last_updated_by`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `deals_lead_id_foreign` FOREIGN KEY (`lead_id`) REFERENCES `leads` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `deals_lead_pipeline_id_foreign` FOREIGN KEY (`lead_pipeline_id`) REFERENCES `lead_pipelines` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `deals_pipeline_stage_id_foreign` FOREIGN KEY (`pipeline_stage_id`) REFERENCES `pipeline_stages` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `deal_files`
--
ALTER TABLE `deal_files`
  ADD CONSTRAINT `deal_files_deal_id_foreign` FOREIGN KEY (`deal_id`) REFERENCES `deals` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `lead_files_added_by_foreign` FOREIGN KEY (`added_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `lead_files_last_updated_by_foreign` FOREIGN KEY (`last_updated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `lead_files_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `deal_histories`
--
ALTER TABLE `deal_histories`
  ADD CONSTRAINT `deal_histories_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `deal_histories_deal_id_foreign` FOREIGN KEY (`deal_id`) REFERENCES `deals` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `deal_histories_deal_stage_to_id_foreign` FOREIGN KEY (`deal_stage_to_id`) REFERENCES `pipeline_stages` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `deal_notes`
--
ALTER TABLE `deal_notes`
  ADD CONSTRAINT `deal_notes_added_by_foreign` FOREIGN KEY (`added_by`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `deal_notes_deal_id_foreign` FOREIGN KEY (`deal_id`) REFERENCES `deals` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `deal_notes_last_updated_by_foreign` FOREIGN KEY (`last_updated_by`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `designations`
--
ALTER TABLE `designations`
  ADD CONSTRAINT `designations_added_by_foreign` FOREIGN KEY (`added_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `designations_company_id_foreign` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `designations_last_updated_by_foreign` FOREIGN KEY (`last_updated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `device_user`
--
ALTER TABLE `device_user`
  ADD CONSTRAINT `device_user_device_id_foreign` FOREIGN KEY (`device_id`) REFERENCES `track_devices` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `discussions`
--
ALTER TABLE `discussions`
  ADD CONSTRAINT `discussions_added_by_foreign` FOREIGN KEY (`added_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `discussions_best_answer_id_foreign` FOREIGN KEY (`best_answer_id`) REFERENCES `discussion_replies` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `discussions_company_id_foreign` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `discussions_discussion_category_id_foreign` FOREIGN KEY (`discussion_category_id`) REFERENCES `discussion_categories` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `discussions_last_reply_by_id_foreign` FOREIGN KEY (`last_reply_by_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `discussions_last_updated_by_foreign` FOREIGN KEY (`last_updated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `discussions_project_id_foreign` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `discussions_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `discussion_categories`
--
ALTER TABLE `discussion_categories`
  ADD CONSTRAINT `discussion_categories_company_id_foreign` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `discussion_files`
--
ALTER TABLE `discussion_files`
  ADD CONSTRAINT `discussion_files_company_id_foreign` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `discussion_files_discussion_id_foreign` FOREIGN KEY (`discussion_id`) REFERENCES `discussions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `discussion_files_discussion_reply_id_foreign` FOREIGN KEY (`discussion_reply_id`) REFERENCES `discussion_replies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `discussion_files_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `discussion_replies`
--
ALTER TABLE `discussion_replies`
  ADD CONSTRAINT `discussion_replies_company_id_foreign` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `discussion_replies_discussion_id_foreign` FOREIGN KEY (`discussion_id`) REFERENCES `discussions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `discussion_replies_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `email_notification_settings`
--
ALTER TABLE `email_notification_settings`
  ADD CONSTRAINT `email_notification_settings_company_id_foreign` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `emergency_contacts`
--
ALTER TABLE `emergency_contacts`
  ADD CONSTRAINT `emergency_contacts_added_by_foreign` FOREIGN KEY (`added_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `emergency_contacts_company_id_foreign` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `emergency_contacts_last_updated_by_foreign` FOREIGN KEY (`last_updated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `emergency_contacts_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `employee_activity`
--
ALTER TABLE `employee_activity`
  ADD CONSTRAINT `employee_activity_deal_id_foreign` FOREIGN KEY (`deal_id`) REFERENCES `deals` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `employee_details`
--
ALTER TABLE `employee_details`
  ADD CONSTRAINT `employee_details_added_by_foreign` FOREIGN KEY (`added_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `employee_details_company_address_id_foreign` FOREIGN KEY (`company_address_id`) REFERENCES `company_addresses` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `employee_details_company_id_foreign` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `employee_details_department_id_foreign` FOREIGN KEY (`department_id`) REFERENCES `teams` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `employee_details_designation_id_foreign` FOREIGN KEY (`designation_id`) REFERENCES `designations` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `employee_details_last_updated_by_foreign` FOREIGN KEY (`last_updated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `employee_details_reporting_to_foreign` FOREIGN KEY (`reporting_to`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `employee_details_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `employee_docs`
--
ALTER TABLE `employee_docs`
  ADD CONSTRAINT `employee_docs_added_by_foreign` FOREIGN KEY (`added_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `employee_docs_company_id_foreign` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `employee_docs_last_updated_by_foreign` FOREIGN KEY (`last_updated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `employee_docs_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `employee_leave_quotas`
--
ALTER TABLE `employee_leave_quotas`
  ADD CONSTRAINT `employee_leave_quotas_leave_type_id_foreign` FOREIGN KEY (`leave_type_id`) REFERENCES `leave_types` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `employee_leave_quotas_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `employee_leave_quota_histories`
--
ALTER TABLE `employee_leave_quota_histories`
  ADD CONSTRAINT `employee_leave_quota_histories_leave_type_id_foreign` FOREIGN KEY (`leave_type_id`) REFERENCES `leave_types` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `employee_leave_quota_histories_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `employee_shifts`
--
ALTER TABLE `employee_shifts`
  ADD CONSTRAINT `employee_shifts_company_id_foreign` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `employee_shift_change_requests`
--
ALTER TABLE `employee_shift_change_requests`
  ADD CONSTRAINT `employee_shift_change_requests_company_id_foreign` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `employee_shift_change_requests_employee_shift_id_foreign` FOREIGN KEY (`employee_shift_id`) REFERENCES `employee_shifts` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `employee_shift_change_requests_shift_schedule_id_foreign` FOREIGN KEY (`shift_schedule_id`) REFERENCES `employee_shift_schedules` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `employee_shift_rotations`
--
ALTER TABLE `employee_shift_rotations`
  ADD CONSTRAINT `employee_shift_rotations_company_id_foreign` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `employee_shift_schedules`
--
ALTER TABLE `employee_shift_schedules`
  ADD CONSTRAINT `employee_shift_schedules_added_by_foreign` FOREIGN KEY (`added_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `employee_shift_schedules_employee_shift_id_foreign` FOREIGN KEY (`employee_shift_id`) REFERENCES `employee_shifts` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `employee_shift_schedules_last_updated_by_foreign` FOREIGN KEY (`last_updated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `employee_shift_schedules_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `employee_skills`
--
ALTER TABLE `employee_skills`
  ADD CONSTRAINT `employee_skills_company_id_foreign` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `employee_skills_skill_id_foreign` FOREIGN KEY (`skill_id`) REFERENCES `skills` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `employee_skills_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `employee_teams`
--
ALTER TABLE `employee_teams`
  ADD CONSTRAINT `employee_teams_company_id_foreign` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `employee_teams_team_id_foreign` FOREIGN KEY (`team_id`) REFERENCES `teams` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `employee_teams_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `estimates`
--
ALTER TABLE `estimates`
  ADD CONSTRAINT `estimates_added_by_foreign` FOREIGN KEY (`added_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `estimates_client_id_foreign` FOREIGN KEY (`client_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `estimates_company_id_foreign` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `estimates_currency_id_foreign` FOREIGN KEY (`currency_id`) REFERENCES `currencies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `estimates_estimate_request_id_foreign` FOREIGN KEY (`estimate_request_id`) REFERENCES `estimate_requests` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `estimates_last_updated_by_foreign` FOREIGN KEY (`last_updated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `estimate_items`
--
ALTER TABLE `estimate_items`
  ADD CONSTRAINT `estimate_items_estimate_id_foreign` FOREIGN KEY (`estimate_id`) REFERENCES `estimates` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `estimate_items_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `estimate_items_unit_id_foreign` FOREIGN KEY (`unit_id`) REFERENCES `unit_types` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `estimate_item_images`
--
ALTER TABLE `estimate_item_images`
  ADD CONSTRAINT `estimate_item_images_estimate_item_id_foreign` FOREIGN KEY (`estimate_item_id`) REFERENCES `estimate_items` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `estimate_requests`
--
ALTER TABLE `estimate_requests`
  ADD CONSTRAINT `estimate_requests_added_by_foreign` FOREIGN KEY (`added_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `estimate_requests_client_id_foreign` FOREIGN KEY (`client_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `estimate_requests_company_id_foreign` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `estimate_requests_currency_id_foreign` FOREIGN KEY (`currency_id`) REFERENCES `currencies` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `estimate_requests_estimate_id_foreign` FOREIGN KEY (`estimate_id`) REFERENCES `estimates` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `estimate_requests_project_id_foreign` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `estimate_templates`
--
ALTER TABLE `estimate_templates`
  ADD CONSTRAINT `estimate_templates_added_by_foreign` FOREIGN KEY (`added_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `estimate_templates_company_id_foreign` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `estimate_templates_currency_id_foreign` FOREIGN KEY (`currency_id`) REFERENCES `currencies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `estimate_templates_last_updated_by_foreign` FOREIGN KEY (`last_updated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `estimate_template_items`
--
ALTER TABLE `estimate_template_items`
  ADD CONSTRAINT `estimate_template_items_company_id_foreign` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `estimate_template_items_estimate_template_id_foreign` FOREIGN KEY (`estimate_template_id`) REFERENCES `estimate_templates` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `estimate_template_items_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `estimate_template_items_unit_id_foreign` FOREIGN KEY (`unit_id`) REFERENCES `unit_types` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `estimate_template_item_images`
--
ALTER TABLE `estimate_template_item_images`
  ADD CONSTRAINT `estimate_template_item_images_company_id_foreign` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `estimate_template_item_images_estimate_template_item_id_foreign` FOREIGN KEY (`estimate_template_item_id`) REFERENCES `estimate_template_items` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `events`
--
ALTER TABLE `events`
  ADD CONSTRAINT `events_added_by_foreign` FOREIGN KEY (`added_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `events_company_id_foreign` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `events_host_foreign` FOREIGN KEY (`host`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `events_last_updated_by_foreign` FOREIGN KEY (`last_updated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `events_parent_id_foreign` FOREIGN KEY (`parent_id`) REFERENCES `events` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `event_attendees`
--
ALTER TABLE `event_attendees`
  ADD CONSTRAINT `event_attendees_company_id_foreign` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `event_attendees_event_id_foreign` FOREIGN KEY (`event_id`) REFERENCES `events` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `event_attendees_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `event_files`
--
ALTER TABLE `event_files`
  ADD CONSTRAINT `event_files_added_by_foreign` FOREIGN KEY (`added_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `event_files_company_id_foreign` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `event_files_event_id_foreign` FOREIGN KEY (`event_id`) REFERENCES `events` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `event_files_last_updated_by_foreign` FOREIGN KEY (`last_updated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `expenses`
--
ALTER TABLE `expenses`
  ADD CONSTRAINT `expenses_added_by_foreign` FOREIGN KEY (`added_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `expenses_approver_id_foreign` FOREIGN KEY (`approver_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `expenses_bank_account_id_foreign` FOREIGN KEY (`bank_account_id`) REFERENCES `bank_accounts` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `expenses_category_id_foreign` FOREIGN KEY (`category_id`) REFERENCES `expenses_category` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `expenses_company_id_foreign` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `expenses_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `expenses_currency_id_foreign` FOREIGN KEY (`currency_id`) REFERENCES `currencies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `expenses_default_currency_id_foreign` FOREIGN KEY (`default_currency_id`) REFERENCES `currencies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `expenses_expenses_recurring_id_foreign` FOREIGN KEY (`expenses_recurring_id`) REFERENCES `expenses_recurring` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `expenses_last_updated_by_foreign` FOREIGN KEY (`last_updated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `expenses_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `expenses_category`
--
ALTER TABLE `expenses_category`
  ADD CONSTRAINT `expenses_category_added_by_foreign` FOREIGN KEY (`added_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `expenses_category_company_id_foreign` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `expenses_category_last_updated_by_foreign` FOREIGN KEY (`last_updated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `expenses_category_roles`
--
ALTER TABLE `expenses_category_roles`
  ADD CONSTRAINT `expenses_category_roles_company_id_foreign` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `expenses_category_roles_expenses_category_id_foreign` FOREIGN KEY (`expenses_category_id`) REFERENCES `expenses_category` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `expenses_category_roles_role_id_foreign` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `expenses_recurring`
--
ALTER TABLE `expenses_recurring`
  ADD CONSTRAINT `expenses_recurring_added_by_foreign` FOREIGN KEY (`added_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `expenses_recurring_bank_account_id_foreign` FOREIGN KEY (`bank_account_id`) REFERENCES `bank_accounts` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `expenses_recurring_category_id_foreign` FOREIGN KEY (`category_id`) REFERENCES `expenses_category` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `expenses_recurring_company_id_foreign` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `expenses_recurring_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `expenses_recurring_currency_id_foreign` FOREIGN KEY (`currency_id`) REFERENCES `currencies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `expenses_recurring_last_updated_by_foreign` FOREIGN KEY (`last_updated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `expenses_recurring_project_id_foreign` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `expenses_recurring_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `file_storage`
--
ALTER TABLE `file_storage`
  ADD CONSTRAINT `file_storage_company_id_foreign` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `gantt_links`
--
ALTER TABLE `gantt_links`
  ADD CONSTRAINT `gantt_links_project_id_foreign` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `gantt_links_source_foreign` FOREIGN KEY (`source`) REFERENCES `tasks` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `gantt_links_target_foreign` FOREIGN KEY (`target`) REFERENCES `tasks` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `google_calendar_modules`
--
ALTER TABLE `google_calendar_modules`
  ADD CONSTRAINT `google_calendar_modules_company_id_foreign` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `holidays`
--
ALTER TABLE `holidays`
  ADD CONSTRAINT `holidays_added_by_foreign` FOREIGN KEY (`added_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `holidays_company_id_foreign` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `holidays_last_updated_by_foreign` FOREIGN KEY (`last_updated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `invoices`
--
ALTER TABLE `invoices`
  ADD CONSTRAINT `invoices_added_by_foreign` FOREIGN KEY (`added_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `invoices_bank_account_id_foreign` FOREIGN KEY (`bank_account_id`) REFERENCES `bank_accounts` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `invoices_client_id_foreign` FOREIGN KEY (`client_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `invoices_company_address_id_foreign` FOREIGN KEY (`company_address_id`) REFERENCES `company_addresses` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `invoices_company_id_foreign` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `invoices_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `invoices_currency_id_foreign` FOREIGN KEY (`currency_id`) REFERENCES `currencies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `invoices_default_currency_id_foreign` FOREIGN KEY (`default_currency_id`) REFERENCES `currencies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `invoices_estimate_id_foreign` FOREIGN KEY (`estimate_id`) REFERENCES `estimates` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `invoices_invoice_payment_id_foreign` FOREIGN KEY (`invoice_payment_id`) REFERENCES `invoice_payment_details` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `invoices_invoice_recurring_id_foreign` FOREIGN KEY (`invoice_recurring_id`) REFERENCES `invoice_recurring` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `invoices_last_updated_by_foreign` FOREIGN KEY (`last_updated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `invoices_offline_method_id_foreign` FOREIGN KEY (`offline_method_id`) REFERENCES `offline_payment_methods` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `invoices_order_id_foreign` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `invoices_parent_id_foreign` FOREIGN KEY (`parent_id`) REFERENCES `invoices` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `invoices_project_id_foreign` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `invoice_files`
--
ALTER TABLE `invoice_files`
  ADD CONSTRAINT `invoice_files_added_by_foreign` FOREIGN KEY (`added_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `invoice_files_invoice_id_foreign` FOREIGN KEY (`invoice_id`) REFERENCES `invoices` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `invoice_files_last_updated_by_foreign` FOREIGN KEY (`last_updated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `invoice_items`
--
ALTER TABLE `invoice_items`
  ADD CONSTRAINT `invoice_items_invoice_id_foreign` FOREIGN KEY (`invoice_id`) REFERENCES `invoices` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `invoice_items_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `invoice_items_unit_id_foreign` FOREIGN KEY (`unit_id`) REFERENCES `unit_types` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `invoice_item_images`
--
ALTER TABLE `invoice_item_images`
  ADD CONSTRAINT `invoice_item_images_invoice_item_id_foreign` FOREIGN KEY (`invoice_item_id`) REFERENCES `invoice_items` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `invoice_payment_details`
--
ALTER TABLE `invoice_payment_details`
  ADD CONSTRAINT `invoice_payment_details_company_id_foreign` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `invoice_recurring`
--
ALTER TABLE `invoice_recurring`
  ADD CONSTRAINT `invoice_recurring_added_by_foreign` FOREIGN KEY (`added_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `invoice_recurring_bank_account_id_foreign` FOREIGN KEY (`bank_account_id`) REFERENCES `bank_accounts` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `invoice_recurring_client_id_foreign` FOREIGN KEY (`client_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `invoice_recurring_company_id_foreign` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `invoice_recurring_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `invoice_recurring_currency_id_foreign` FOREIGN KEY (`currency_id`) REFERENCES `currencies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `invoice_recurring_last_updated_by_foreign` FOREIGN KEY (`last_updated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `invoice_recurring_project_id_foreign` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `invoice_recurring_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `invoice_recurring_items`
--
ALTER TABLE `invoice_recurring_items`
  ADD CONSTRAINT `invoice_recurring_items_invoice_recurring_id_foreign` FOREIGN KEY (`invoice_recurring_id`) REFERENCES `invoice_recurring` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `invoice_recurring_items_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `invoice_recurring_items_unit_id_foreign` FOREIGN KEY (`unit_id`) REFERENCES `unit_types` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `invoice_recurring_item_images`
--
ALTER TABLE `invoice_recurring_item_images`
  ADD CONSTRAINT `invoice_recurring_item_images_invoice_recurring_item_id_foreign` FOREIGN KEY (`invoice_recurring_item_id`) REFERENCES `invoice_recurring_items` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `invoice_settings`
--
ALTER TABLE `invoice_settings`
  ADD CONSTRAINT `invoice_settings_company_id_foreign` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `issues`
--
ALTER TABLE `issues`
  ADD CONSTRAINT `issues_company_id_foreign` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `issues_project_id_foreign` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `issues_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `knowledge_bases`
--
ALTER TABLE `knowledge_bases`
  ADD CONSTRAINT `knowledge_bases_category_id_foreign` FOREIGN KEY (`category_id`) REFERENCES `knowledge_categories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `knowledge_bases_company_id_foreign` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `knowledge_base_files`
--
ALTER TABLE `knowledge_base_files`
  ADD CONSTRAINT `knowledge_base_files_added_by_foreign` FOREIGN KEY (`added_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `knowledge_base_files_company_id_foreign` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `knowledge_base_files_knowledge_base_id_foreign` FOREIGN KEY (`knowledge_base_id`) REFERENCES `knowledge_bases` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `knowledge_base_files_last_updated_by_foreign` FOREIGN KEY (`last_updated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `knowledge_categories`
--
ALTER TABLE `knowledge_categories`
  ADD CONSTRAINT `knowledge_categories_company_id_foreign` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `leads`
--
ALTER TABLE `leads`
  ADD CONSTRAINT `leads_added_by_foreign` FOREIGN KEY (`added_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `leads_category_id_foreign` FOREIGN KEY (`category_id`) REFERENCES `lead_category` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `leads_company_id_foreign` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `leads_last_updated_by_foreign` FOREIGN KEY (`last_updated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `lead_agents`
--
ALTER TABLE `lead_agents`
  ADD CONSTRAINT `lead_agents_added_by_foreign` FOREIGN KEY (`added_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `lead_agents_company_id_foreign` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `lead_agents_last_updated_by_foreign` FOREIGN KEY (`last_updated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `lead_agents_lead_category_id_foreign` FOREIGN KEY (`lead_category_id`) REFERENCES `lead_category` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `lead_agents_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `lead_category`
--
ALTER TABLE `lead_category`
  ADD CONSTRAINT `lead_category_added_by_foreign` FOREIGN KEY (`added_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `lead_category_company_id_foreign` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `lead_category_last_updated_by_foreign` FOREIGN KEY (`last_updated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `lead_custom_forms`
--
ALTER TABLE `lead_custom_forms`
  ADD CONSTRAINT `lead_custom_forms_added_by_foreign` FOREIGN KEY (`added_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `lead_custom_forms_company_id_foreign` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `lead_custom_forms_custom_fields_id_foreign` FOREIGN KEY (`custom_fields_id`) REFERENCES `custom_fields` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `lead_custom_forms_last_updated_by_foreign` FOREIGN KEY (`last_updated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `lead_follow_up`
--
ALTER TABLE `lead_follow_up`
  ADD CONSTRAINT `lead_follow_up_added_by_foreign` FOREIGN KEY (`added_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `lead_follow_up_deal_id_foreign` FOREIGN KEY (`deal_id`) REFERENCES `deals` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `lead_follow_up_last_updated_by_foreign` FOREIGN KEY (`last_updated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `lead_notes`
--
ALTER TABLE `lead_notes`
  ADD CONSTRAINT `lead_notes_added_by_foreign` FOREIGN KEY (`added_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `lead_notes_last_updated_by_foreign` FOREIGN KEY (`last_updated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `lead_notes_lead_id_foreign` FOREIGN KEY (`lead_id`) REFERENCES `leads` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `lead_notes_member_id_foreign` FOREIGN KEY (`member_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `lead_pipelines`
--
ALTER TABLE `lead_pipelines`
  ADD CONSTRAINT `lead_pipelines_company_id_foreign` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `lead_pipeline_stages`
--
ALTER TABLE `lead_pipeline_stages`
  ADD CONSTRAINT `lead_pipeline_stages_lead_pipeline_id_foreign` FOREIGN KEY (`lead_pipeline_id`) REFERENCES `lead_pipelines` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `lead_pipeline_stages_pipeline_stages_id_foreign` FOREIGN KEY (`pipeline_stages_id`) REFERENCES `pipeline_stages` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `lead_products`
--
ALTER TABLE `lead_products`
  ADD CONSTRAINT `lead_products_deal_id_foreign` FOREIGN KEY (`deal_id`) REFERENCES `deals` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `lead_products_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `lead_setting`
--
ALTER TABLE `lead_setting`
  ADD CONSTRAINT `lead_setting_company_id_foreign` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `lead_setting_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `lead_sources`
--
ALTER TABLE `lead_sources`
  ADD CONSTRAINT `lead_sources_added_by_foreign` FOREIGN KEY (`added_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `lead_sources_company_id_foreign` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `lead_sources_last_updated_by_foreign` FOREIGN KEY (`last_updated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `lead_status`
--
ALTER TABLE `lead_status`
  ADD CONSTRAINT `lead_status_company_id_foreign` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `lead_user_notes`
--
ALTER TABLE `lead_user_notes`
  ADD CONSTRAINT `lead_user_notes_lead_note_id_foreign` FOREIGN KEY (`lead_note_id`) REFERENCES `lead_notes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `lead_user_notes_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `leaves`
--
ALTER TABLE `leaves`
  ADD CONSTRAINT `leaves_added_by_foreign` FOREIGN KEY (`added_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `leaves_approved_by_foreign` FOREIGN KEY (`approved_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `leaves_company_id_foreign` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `leaves_last_updated_by_foreign` FOREIGN KEY (`last_updated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `leaves_leave_type_id_foreign` FOREIGN KEY (`leave_type_id`) REFERENCES `leave_types` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `leaves_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `leave_files`
--
ALTER TABLE `leave_files`
  ADD CONSTRAINT `leave_files_added_by_foreign` FOREIGN KEY (`added_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `leave_files_company_id_foreign` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `leave_files_last_updated_by_foreign` FOREIGN KEY (`last_updated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `leave_files_leave_id_foreign` FOREIGN KEY (`leave_id`) REFERENCES `leaves` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `leave_files_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `leave_settings`
--
ALTER TABLE `leave_settings`
  ADD CONSTRAINT `leave_settings_company_id_foreign` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `leave_types`
--
ALTER TABLE `leave_types`
  ADD CONSTRAINT `leave_types_company_id_foreign` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `log_time_for`
--
ALTER TABLE `log_time_for`
  ADD CONSTRAINT `log_time_for_company_id_foreign` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `mention_users`
--
ALTER TABLE `mention_users`
  ADD CONSTRAINT `mention_users_discussion_id_foreign` FOREIGN KEY (`discussion_id`) REFERENCES `discussions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `mention_users_discussion_reply_id_foreign` FOREIGN KEY (`discussion_reply_id`) REFERENCES `discussion_replies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `mention_users_event_id_foreign` FOREIGN KEY (`event_id`) REFERENCES `events` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `mention_users_project_id_foreign` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `mention_users_project_note_id_foreign` FOREIGN KEY (`project_note_id`) REFERENCES `project_notes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `mention_users_task_comment_id_foreign` FOREIGN KEY (`task_comment_id`) REFERENCES `task_comments` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `mention_users_task_id_foreign` FOREIGN KEY (`task_id`) REFERENCES `tasks` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `mention_users_task_note_id_foreign` FOREIGN KEY (`task_note_id`) REFERENCES `task_notes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `mention_users_ticket_id_foreign` FOREIGN KEY (`ticket_id`) REFERENCES `tickets` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `mention_users_user_chat_id_foreign` FOREIGN KEY (`user_chat_id`) REFERENCES `users_chat` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `mention_users_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `message_settings`
--
ALTER TABLE `message_settings`
  ADD CONSTRAINT `message_settings_company_id_foreign` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `module_settings`
--
ALTER TABLE `module_settings`
  ADD CONSTRAINT `module_settings_company_id_foreign` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `notices`
--
ALTER TABLE `notices`
  ADD CONSTRAINT `notices_added_by_foreign` FOREIGN KEY (`added_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `notices_company_id_foreign` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `notices_department_id_foreign` FOREIGN KEY (`department_id`) REFERENCES `teams` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `notices_last_updated_by_foreign` FOREIGN KEY (`last_updated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `notice_board_users`
--
ALTER TABLE `notice_board_users`
  ADD CONSTRAINT `notice_board_users_notice_id_foreign` FOREIGN KEY (`notice_id`) REFERENCES `notices` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `notice_board_users_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `notice_files`
--
ALTER TABLE `notice_files`
  ADD CONSTRAINT `notice_files_added_by_foreign` FOREIGN KEY (`added_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `notice_files_last_updated_by_foreign` FOREIGN KEY (`last_updated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `notice_files_notice_id_foreign` FOREIGN KEY (`notice_id`) REFERENCES `notices` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `notice_views`
--
ALTER TABLE `notice_views`
  ADD CONSTRAINT `notice_views_company_id_foreign` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `notice_views_notice_id_foreign` FOREIGN KEY (`notice_id`) REFERENCES `notices` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `notice_views_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `offline_payment_methods`
--
ALTER TABLE `offline_payment_methods`
  ADD CONSTRAINT `offline_payment_methods_company_id_foreign` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `orders_added_by_foreign` FOREIGN KEY (`added_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `orders_client_id_foreign` FOREIGN KEY (`client_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `orders_company_address_id_foreign` FOREIGN KEY (`company_address_id`) REFERENCES `company_addresses` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `orders_company_id_foreign` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `orders_currency_id_foreign` FOREIGN KEY (`currency_id`) REFERENCES `currencies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `orders_last_updated_by_foreign` FOREIGN KEY (`last_updated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `orders_project_id_foreign` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `order_carts`
--
ALTER TABLE `order_carts`
  ADD CONSTRAINT `order_carts_client_id_foreign` FOREIGN KEY (`client_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `order_carts_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `order_carts_unit_id_foreign` FOREIGN KEY (`unit_id`) REFERENCES `unit_types` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `order_items`
--
ALTER TABLE `order_items`
  ADD CONSTRAINT `order_items_order_id_foreign` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `order_items_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `order_items_unit_id_foreign` FOREIGN KEY (`unit_id`) REFERENCES `unit_types` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `order_item_images`
--
ALTER TABLE `order_item_images`
  ADD CONSTRAINT `order_item_images_order_item_id_foreign` FOREIGN KEY (`order_item_id`) REFERENCES `order_items` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

--
-- Constraints for table `passport_details`
--
ALTER TABLE `passport_details`
  ADD CONSTRAINT `passport_details_added_by_foreign` FOREIGN KEY (`added_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `passport_details_company_id_foreign` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `passport_details_country_id_foreign` FOREIGN KEY (`country_id`) REFERENCES `countries` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `passport_details_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `payments`
--
ALTER TABLE `payments`
  ADD CONSTRAINT `payments_added_by_foreign` FOREIGN KEY (`added_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `payments_bank_account_id_foreign` FOREIGN KEY (`bank_account_id`) REFERENCES `bank_accounts` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `payments_company_id_foreign` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `payments_credit_notes_id_foreign` FOREIGN KEY (`credit_notes_id`) REFERENCES `credit_notes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `payments_currency_id_foreign` FOREIGN KEY (`currency_id`) REFERENCES `currencies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `payments_default_currency_id_foreign` FOREIGN KEY (`default_currency_id`) REFERENCES `currencies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `payments_invoice_id_foreign` FOREIGN KEY (`invoice_id`) REFERENCES `invoices` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `payments_last_updated_by_foreign` FOREIGN KEY (`last_updated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `payments_offline_method_id_foreign` FOREIGN KEY (`offline_method_id`) REFERENCES `offline_payment_methods` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `payments_order_id_foreign` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `payments_project_id_foreign` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `payment_gateway_credentials`
--
ALTER TABLE `payment_gateway_credentials`
  ADD CONSTRAINT `payment_gateway_credentials_company_id_foreign` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `permissions`
--
ALTER TABLE `permissions`
  ADD CONSTRAINT `permissions_module_id_foreign` FOREIGN KEY (`module_id`) REFERENCES `modules` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `permission_role`
--
ALTER TABLE `permission_role`
  ADD CONSTRAINT `permission_role_permission_id_foreign` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `permission_role_permission_type_id_foreign` FOREIGN KEY (`permission_type_id`) REFERENCES `permission_types` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `permission_role_role_id_foreign` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `pinned`
--
ALTER TABLE `pinned`
  ADD CONSTRAINT `pinned_company_id_foreign` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `pinned_project_id_foreign` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `pinned_task_id_foreign` FOREIGN KEY (`task_id`) REFERENCES `tasks` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `pinned_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `pipeline_stages`
--
ALTER TABLE `pipeline_stages`
  ADD CONSTRAINT `pipeline_stages_company_id_foreign` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `pipeline_stages_lead_pipeline_id_foreign` FOREIGN KEY (`lead_pipeline_id`) REFERENCES `lead_pipelines` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `products`
--
ALTER TABLE `products`
  ADD CONSTRAINT `products_added_by_foreign` FOREIGN KEY (`added_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `products_category_id_foreign` FOREIGN KEY (`category_id`) REFERENCES `product_category` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `products_company_id_foreign` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `products_last_updated_by_foreign` FOREIGN KEY (`last_updated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `products_sub_category_id_foreign` FOREIGN KEY (`sub_category_id`) REFERENCES `product_sub_category` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `products_unit_id_foreign` FOREIGN KEY (`unit_id`) REFERENCES `unit_types` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `product_category`
--
ALTER TABLE `product_category`
  ADD CONSTRAINT `product_category_company_id_foreign` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `product_files`
--
ALTER TABLE `product_files`
  ADD CONSTRAINT `product_files_added_by_foreign` FOREIGN KEY (`added_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `product_files_company_id_foreign` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `product_files_last_updated_by_foreign` FOREIGN KEY (`last_updated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `product_files_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `product_sub_category`
--
ALTER TABLE `product_sub_category`
  ADD CONSTRAINT `product_sub_category_category_id_foreign` FOREIGN KEY (`category_id`) REFERENCES `product_category` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `product_sub_category_company_id_foreign` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `projects`
--
ALTER TABLE `projects`
  ADD CONSTRAINT `projects_added_by_foreign` FOREIGN KEY (`added_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `projects_category_id_foreign` FOREIGN KEY (`category_id`) REFERENCES `project_category` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `projects_client_id_foreign` FOREIGN KEY (`client_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `projects_company_id_foreign` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `projects_currency_id_foreign` FOREIGN KEY (`currency_id`) REFERENCES `currencies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `projects_last_updated_by_foreign` FOREIGN KEY (`last_updated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `projects_project_admin_foreign` FOREIGN KEY (`project_admin`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `projects_team_id_foreign` FOREIGN KEY (`team_id`) REFERENCES `teams` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `project_activity`
--
ALTER TABLE `project_activity`
  ADD CONSTRAINT `project_activity_project_id_foreign` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `project_category`
--
ALTER TABLE `project_category`
  ADD CONSTRAINT `project_category_added_by_foreign` FOREIGN KEY (`added_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `project_category_company_id_foreign` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `project_category_last_updated_by_foreign` FOREIGN KEY (`last_updated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `project_departments`
--
ALTER TABLE `project_departments`
  ADD CONSTRAINT `project_departments_project_id_foreign` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `project_departments_team_id_foreign` FOREIGN KEY (`team_id`) REFERENCES `teams` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `project_files`
--
ALTER TABLE `project_files`
  ADD CONSTRAINT `project_files_added_by_foreign` FOREIGN KEY (`added_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `project_files_company_id_foreign` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `project_files_last_updated_by_foreign` FOREIGN KEY (`last_updated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `project_files_project_id_foreign` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `project_files_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `project_members`
--
ALTER TABLE `project_members`
  ADD CONSTRAINT `project_members_added_by_foreign` FOREIGN KEY (`added_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `project_members_last_updated_by_foreign` FOREIGN KEY (`last_updated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `project_members_project_id_foreign` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `project_members_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `project_milestones`
--
ALTER TABLE `project_milestones`
  ADD CONSTRAINT `project_milestones_added_by_foreign` FOREIGN KEY (`added_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `project_milestones_currency_id_foreign` FOREIGN KEY (`currency_id`) REFERENCES `currencies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `project_milestones_last_updated_by_foreign` FOREIGN KEY (`last_updated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `project_milestones_project_id_foreign` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `project_notes`
--
ALTER TABLE `project_notes`
  ADD CONSTRAINT `project_notes_added_by_foreign` FOREIGN KEY (`added_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `project_notes_client_id_foreign` FOREIGN KEY (`client_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `project_notes_last_updated_by_foreign` FOREIGN KEY (`last_updated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `project_notes_project_id_foreign` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `project_ratings`
--
ALTER TABLE `project_ratings`
  ADD CONSTRAINT `project_ratings_added_by_foreign` FOREIGN KEY (`added_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `project_ratings_last_updated_by_foreign` FOREIGN KEY (`last_updated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `project_ratings_project_id_foreign` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `project_ratings_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `project_settings`
--
ALTER TABLE `project_settings`
  ADD CONSTRAINT `project_settings_company_id_foreign` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `project_status_settings`
--
ALTER TABLE `project_status_settings`
  ADD CONSTRAINT `project_status_settings_company_id_foreign` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `project_templates`
--
ALTER TABLE `project_templates`
  ADD CONSTRAINT `project_templates_category_id_foreign` FOREIGN KEY (`category_id`) REFERENCES `project_category` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `project_templates_client_id_foreign` FOREIGN KEY (`client_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `project_templates_company_id_foreign` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `project_template_members`
--
ALTER TABLE `project_template_members`
  ADD CONSTRAINT `project_template_members_project_template_id_foreign` FOREIGN KEY (`project_template_id`) REFERENCES `project_templates` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `project_template_members_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `project_template_sub_tasks`
--
ALTER TABLE `project_template_sub_tasks`
  ADD CONSTRAINT `project_template_sub_tasks_project_template_task_id_foreign` FOREIGN KEY (`project_template_task_id`) REFERENCES `project_template_tasks` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `project_template_tasks`
--
ALTER TABLE `project_template_tasks`
  ADD CONSTRAINT `project_template_tasks_project_template_id_foreign` FOREIGN KEY (`project_template_id`) REFERENCES `project_templates` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `project_template_tasks_project_template_task_category_id_foreign` FOREIGN KEY (`project_template_task_category_id`) REFERENCES `task_category` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `project_template_task_users`
--
ALTER TABLE `project_template_task_users`
  ADD CONSTRAINT `project_template_task_users_project_template_task_id_foreign` FOREIGN KEY (`project_template_task_id`) REFERENCES `project_template_tasks` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `project_template_task_users_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `project_time_logs`
--
ALTER TABLE `project_time_logs`
  ADD CONSTRAINT `project_time_logs_added_by_foreign` FOREIGN KEY (`added_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `project_time_logs_approved_by_foreign` FOREIGN KEY (`approved_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `project_time_logs_company_id_foreign` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `project_time_logs_edited_by_user_foreign` FOREIGN KEY (`edited_by_user`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `project_time_logs_invoice_id_foreign` FOREIGN KEY (`invoice_id`) REFERENCES `invoices` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `project_time_logs_last_updated_by_foreign` FOREIGN KEY (`last_updated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `project_time_logs_project_id_foreign` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `project_time_logs_task_id_foreign` FOREIGN KEY (`task_id`) REFERENCES `tasks` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `project_time_logs_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `project_time_log_breaks`
--
ALTER TABLE `project_time_log_breaks`
  ADD CONSTRAINT `project_time_log_breaks_added_by_foreign` FOREIGN KEY (`added_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `project_time_log_breaks_company_id_foreign` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `project_time_log_breaks_last_updated_by_foreign` FOREIGN KEY (`last_updated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `project_time_log_breaks_project_time_log_id_foreign` FOREIGN KEY (`project_time_log_id`) REFERENCES `project_time_logs` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `project_user_notes`
--
ALTER TABLE `project_user_notes`
  ADD CONSTRAINT `project_user_notes_project_note_id_foreign` FOREIGN KEY (`project_note_id`) REFERENCES `project_notes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `project_user_notes_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `promotions`
--
ALTER TABLE `promotions`
  ADD CONSTRAINT `promotions_company_id_foreign` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `promotions_current_department_id_foreign` FOREIGN KEY (`current_department_id`) REFERENCES `teams` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `promotions_current_designation_id_foreign` FOREIGN KEY (`current_designation_id`) REFERENCES `designations` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `promotions_employee_id_foreign` FOREIGN KEY (`employee_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `promotions_previous_department_id_foreign` FOREIGN KEY (`previous_department_id`) REFERENCES `teams` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `promotions_previous_designation_id_foreign` FOREIGN KEY (`previous_designation_id`) REFERENCES `designations` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `proposals`
--
ALTER TABLE `proposals`
  ADD CONSTRAINT `proposals_added_by_foreign` FOREIGN KEY (`added_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `proposals_company_id_foreign` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `proposals_currency_id_foreign` FOREIGN KEY (`currency_id`) REFERENCES `currencies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `proposals_deal_id_foreign` FOREIGN KEY (`deal_id`) REFERENCES `deals` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `proposals_last_updated_by_foreign` FOREIGN KEY (`last_updated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `proposal_items`
--
ALTER TABLE `proposal_items`
  ADD CONSTRAINT `proposal_items_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `proposal_items_proposal_id_foreign` FOREIGN KEY (`proposal_id`) REFERENCES `proposals` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `proposal_items_unit_id_foreign` FOREIGN KEY (`unit_id`) REFERENCES `unit_types` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `proposal_item_images`
--
ALTER TABLE `proposal_item_images`
  ADD CONSTRAINT `proposal_item_images_proposal_item_id_foreign` FOREIGN KEY (`proposal_item_id`) REFERENCES `proposal_items` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `proposal_signs`
--
ALTER TABLE `proposal_signs`
  ADD CONSTRAINT `proposal_signs_proposal_id_foreign` FOREIGN KEY (`proposal_id`) REFERENCES `proposals` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `proposal_templates`
--
ALTER TABLE `proposal_templates`
  ADD CONSTRAINT `proposal_templates_added_by_foreign` FOREIGN KEY (`added_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `proposal_templates_company_id_foreign` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `proposal_templates_currency_id_foreign` FOREIGN KEY (`currency_id`) REFERENCES `currencies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `proposal_templates_last_updated_by_foreign` FOREIGN KEY (`last_updated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `proposal_template_items`
--
ALTER TABLE `proposal_template_items`
  ADD CONSTRAINT `proposal_template_items_company_id_foreign` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `proposal_template_items_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `proposal_template_items_proposal_template_id_foreign` FOREIGN KEY (`proposal_template_id`) REFERENCES `proposal_templates` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `proposal_template_items_unit_id_foreign` FOREIGN KEY (`unit_id`) REFERENCES `unit_types` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `proposal_template_item_images`
--
ALTER TABLE `proposal_template_item_images`
  ADD CONSTRAINT `proposal_template_item_images_company_id_foreign` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `proposal_template_item_images_proposal_template_item_id_foreign` FOREIGN KEY (`proposal_template_item_id`) REFERENCES `proposal_template_items` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `purpose_consent_leads`
--
ALTER TABLE `purpose_consent_leads`
  ADD CONSTRAINT `purpose_consent_leads_deal_id_foreign` FOREIGN KEY (`deal_id`) REFERENCES `deals` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `purpose_consent_leads_purpose_consent_id_foreign` FOREIGN KEY (`purpose_consent_id`) REFERENCES `purpose_consent` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `purpose_consent_leads_updated_by_id_foreign` FOREIGN KEY (`updated_by_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `purpose_consent_users`
--
ALTER TABLE `purpose_consent_users`
  ADD CONSTRAINT `purpose_consent_users_client_id_foreign` FOREIGN KEY (`client_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `purpose_consent_users_purpose_consent_id_foreign` FOREIGN KEY (`purpose_consent_id`) REFERENCES `purpose_consent` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `purpose_consent_users_updated_by_id_foreign` FOREIGN KEY (`updated_by_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `push_subscriptions`
--
ALTER TABLE `push_subscriptions`
  ADD CONSTRAINT `push_subscriptions_company_id_foreign` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `push_subscriptions_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

--
-- Constraints for table `quick_books_settings`
--
ALTER TABLE `quick_books_settings`
  ADD CONSTRAINT `quick_books_settings_company_id_foreign` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `quotations`
--
ALTER TABLE `quotations`
  ADD CONSTRAINT `quotations_company_id_foreign` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `quotation_items`
--
ALTER TABLE `quotation_items`
  ADD CONSTRAINT `quotation_items_quotation_id_foreign` FOREIGN KEY (`quotation_id`) REFERENCES `quotations` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `removal_requests`
--
ALTER TABLE `removal_requests`
  ADD CONSTRAINT `removal_requests_company_id_foreign` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `removal_requests_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `removal_requests_lead`
--
ALTER TABLE `removal_requests_lead`
  ADD CONSTRAINT `removal_requests_lead_company_id_foreign` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `removal_requests_lead_lead_id_foreign` FOREIGN KEY (`lead_id`) REFERENCES `leads` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `roles`
--
ALTER TABLE `roles`
  ADD CONSTRAINT `roles_company_id_foreign` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `role_user`
--
ALTER TABLE `role_user`
  ADD CONSTRAINT `role_user_role_id_foreign` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `role_user_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `rotation_automate_log`
--
ALTER TABLE `rotation_automate_log`
  ADD CONSTRAINT `rotation_automate_log_company_id_foreign` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `rotation_automate_log_employee_shift_id_foreign` FOREIGN KEY (`employee_shift_id`) REFERENCES `employee_shifts` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `rotation_automate_log_employee_shift_rotation_id_foreign` FOREIGN KEY (`employee_shift_rotation_id`) REFERENCES `employee_shift_rotations` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `rotation_automate_log_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `shift_rotation_sequences`
--
ALTER TABLE `shift_rotation_sequences`
  ADD CONSTRAINT `shift_rotation_sequences_employee_shift_id_foreign` FOREIGN KEY (`employee_shift_id`) REFERENCES `employee_shifts` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `shift_rotation_sequences_employee_shift_rotation_id_foreign` FOREIGN KEY (`employee_shift_rotation_id`) REFERENCES `employee_shift_rotations` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `skills`
--
ALTER TABLE `skills`
  ADD CONSTRAINT `skills_company_id_foreign` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `slack_settings`
--
ALTER TABLE `slack_settings`
  ADD CONSTRAINT `slack_settings_company_id_foreign` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `sticky_notes`
--
ALTER TABLE `sticky_notes`
  ADD CONSTRAINT `sticky_notes_company_id_foreign` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `sticky_notes_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `subscriptions`
--
ALTER TABLE `subscriptions`
  ADD CONSTRAINT `subscriptions_company_id_foreign` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `subscriptions_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `sub_tasks`
--
ALTER TABLE `sub_tasks`
  ADD CONSTRAINT `sub_tasks_added_by_foreign` FOREIGN KEY (`added_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `sub_tasks_assigned_to_foreign` FOREIGN KEY (`assigned_to`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `sub_tasks_last_updated_by_foreign` FOREIGN KEY (`last_updated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `sub_tasks_task_id_foreign` FOREIGN KEY (`task_id`) REFERENCES `tasks` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `sub_task_files`
--
ALTER TABLE `sub_task_files`
  ADD CONSTRAINT `sub_task_files_sub_task_id_foreign` FOREIGN KEY (`sub_task_id`) REFERENCES `sub_tasks` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `sub_task_files_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `taskboard_columns`
--
ALTER TABLE `taskboard_columns`
  ADD CONSTRAINT `taskboard_columns_company_id_foreign` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `tasks`
--
ALTER TABLE `tasks`
  ADD CONSTRAINT `tasks_added_by_foreign` FOREIGN KEY (`added_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `tasks_board_column_id_foreign` FOREIGN KEY (`board_column_id`) REFERENCES `taskboard_columns` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `tasks_company_id_foreign` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `tasks_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `tasks_dependent_task_id_foreign` FOREIGN KEY (`dependent_task_id`) REFERENCES `tasks` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `tasks_last_updated_by_foreign` FOREIGN KEY (`last_updated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `tasks_milestone_id_foreign` FOREIGN KEY (`milestone_id`) REFERENCES `project_milestones` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `tasks_project_id_foreign` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `tasks_recurring_task_id_foreign` FOREIGN KEY (`recurring_task_id`) REFERENCES `tasks` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `tasks_task_category_id_foreign` FOREIGN KEY (`task_category_id`) REFERENCES `task_category` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `task_category`
--
ALTER TABLE `task_category`
  ADD CONSTRAINT `task_category_added_by_foreign` FOREIGN KEY (`added_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `task_category_company_id_foreign` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `task_category_last_updated_by_foreign` FOREIGN KEY (`last_updated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `task_comments`
--
ALTER TABLE `task_comments`
  ADD CONSTRAINT `task_comments_added_by_foreign` FOREIGN KEY (`added_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `task_comments_last_updated_by_foreign` FOREIGN KEY (`last_updated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `task_comments_task_id_foreign` FOREIGN KEY (`task_id`) REFERENCES `tasks` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `task_comments_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `task_comment_emoji`
--
ALTER TABLE `task_comment_emoji`
  ADD CONSTRAINT `task_comment_emoji_comment_id_foreign` FOREIGN KEY (`comment_id`) REFERENCES `task_comments` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `task_comment_emoji_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `task_files`
--
ALTER TABLE `task_files`
  ADD CONSTRAINT `task_files_added_by_foreign` FOREIGN KEY (`added_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `task_files_last_updated_by_foreign` FOREIGN KEY (`last_updated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `task_files_task_id_foreign` FOREIGN KEY (`task_id`) REFERENCES `tasks` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `task_files_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `task_history`
--
ALTER TABLE `task_history`
  ADD CONSTRAINT `task_history_board_column_id_foreign` FOREIGN KEY (`board_column_id`) REFERENCES `taskboard_columns` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `task_history_sub_task_id_foreign` FOREIGN KEY (`sub_task_id`) REFERENCES `sub_tasks` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `task_history_task_id_foreign` FOREIGN KEY (`task_id`) REFERENCES `tasks` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `task_history_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `task_labels`
--
ALTER TABLE `task_labels`
  ADD CONSTRAINT `task_labels_label_id_foreign` FOREIGN KEY (`label_id`) REFERENCES `task_label_list` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `task_tags_task_id_foreign` FOREIGN KEY (`task_id`) REFERENCES `tasks` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `task_label_list`
--
ALTER TABLE `task_label_list`
  ADD CONSTRAINT `task_label_list_company_id_foreign` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `task_label_list_project_id_foreign` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `task_notes`
--
ALTER TABLE `task_notes`
  ADD CONSTRAINT `task_notes_added_by_foreign` FOREIGN KEY (`added_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `task_notes_last_updated_by_foreign` FOREIGN KEY (`last_updated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `task_notes_task_id_foreign` FOREIGN KEY (`task_id`) REFERENCES `tasks` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `task_settings`
--
ALTER TABLE `task_settings`
  ADD CONSTRAINT `task_settings_company_id_foreign` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `task_users`
--
ALTER TABLE `task_users`
  ADD CONSTRAINT `task_users_task_id_foreign` FOREIGN KEY (`task_id`) REFERENCES `tasks` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `task_users_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `taxes`
--
ALTER TABLE `taxes`
  ADD CONSTRAINT `taxes_company_id_foreign` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `teams`
--
ALTER TABLE `teams`
  ADD CONSTRAINT `teams_added_by_foreign` FOREIGN KEY (`added_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `teams_company_id_foreign` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `teams_last_updated_by_foreign` FOREIGN KEY (`last_updated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `theme_settings`
--
ALTER TABLE `theme_settings`
  ADD CONSTRAINT `theme_settings_company_id_foreign` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `tickets`
--
ALTER TABLE `tickets`
  ADD CONSTRAINT `tickets_added_by_foreign` FOREIGN KEY (`added_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `tickets_agent_id_foreign` FOREIGN KEY (`agent_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `tickets_channel_id_foreign` FOREIGN KEY (`channel_id`) REFERENCES `ticket_channels` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `tickets_company_id_foreign` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `tickets_country_id_foreign` FOREIGN KEY (`country_id`) REFERENCES `countries` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `tickets_group_id_foreign` FOREIGN KEY (`group_id`) REFERENCES `ticket_groups` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `tickets_last_updated_by_foreign` FOREIGN KEY (`last_updated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `tickets_project_id_foreign` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `tickets_type_id_foreign` FOREIGN KEY (`type_id`) REFERENCES `ticket_types` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `tickets_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `ticket_activities`
--
ALTER TABLE `ticket_activities`
  ADD CONSTRAINT `ticket_activities_assigned_to_foreign` FOREIGN KEY (`assigned_to`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `ticket_activities_channel_id_foreign` FOREIGN KEY (`channel_id`) REFERENCES `ticket_channels` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `ticket_activities_group_id_foreign` FOREIGN KEY (`group_id`) REFERENCES `ticket_groups` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `ticket_activities_ticket_id_foreign` FOREIGN KEY (`ticket_id`) REFERENCES `tickets` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `ticket_activities_type_id_foreign` FOREIGN KEY (`type_id`) REFERENCES `ticket_types` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `ticket_activities_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `ticket_agent_groups`
--
ALTER TABLE `ticket_agent_groups`
  ADD CONSTRAINT `ticket_agent_groups_added_by_foreign` FOREIGN KEY (`added_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `ticket_agent_groups_agent_id_foreign` FOREIGN KEY (`agent_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `ticket_agent_groups_company_id_foreign` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `ticket_agent_groups_group_id_foreign` FOREIGN KEY (`group_id`) REFERENCES `ticket_groups` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `ticket_agent_groups_last_updated_by_foreign` FOREIGN KEY (`last_updated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `ticket_channels`
--
ALTER TABLE `ticket_channels`
  ADD CONSTRAINT `ticket_channels_company_id_foreign` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `ticket_custom_forms`
--
ALTER TABLE `ticket_custom_forms`
  ADD CONSTRAINT `ticket_custom_forms_company_id_foreign` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `ticket_custom_forms_custom_fields_id_foreign` FOREIGN KEY (`custom_fields_id`) REFERENCES `custom_fields` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `ticket_email_settings`
--
ALTER TABLE `ticket_email_settings`
  ADD CONSTRAINT `ticket_email_settings_company_id_foreign` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `ticket_files`
--
ALTER TABLE `ticket_files`
  ADD CONSTRAINT `ticket_files_ticket_reply_id_foreign` FOREIGN KEY (`ticket_reply_id`) REFERENCES `ticket_replies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `ticket_files_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `ticket_groups`
--
ALTER TABLE `ticket_groups`
  ADD CONSTRAINT `ticket_groups_company_id_foreign` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `ticket_replies`
--
ALTER TABLE `ticket_replies`
  ADD CONSTRAINT `ticket_replies_ticket_id_foreign` FOREIGN KEY (`ticket_id`) REFERENCES `tickets` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `ticket_replies_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `ticket_reply_templates`
--
ALTER TABLE `ticket_reply_templates`
  ADD CONSTRAINT `ticket_reply_templates_company_id_foreign` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `ticket_reply_users`
--
ALTER TABLE `ticket_reply_users`
  ADD CONSTRAINT `ticket_reply_users_ticket_reply_id_foreign` FOREIGN KEY (`ticket_reply_id`) REFERENCES `ticket_replies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `ticket_reply_users_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `ticket_settings_for_agents`
--
ALTER TABLE `ticket_settings_for_agents`
  ADD CONSTRAINT `ticket_settings_for_agents_company_id_foreign` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `ticket_settings_for_agents_updated_by_foreign` FOREIGN KEY (`updated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `ticket_settings_for_agents_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `ticket_tags`
--
ALTER TABLE `ticket_tags`
  ADD CONSTRAINT `ticket_tags_company_id_foreign` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `ticket_tags_tag_id_foreign` FOREIGN KEY (`tag_id`) REFERENCES `ticket_tag_list` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `ticket_tags_ticket_id_foreign` FOREIGN KEY (`ticket_id`) REFERENCES `tickets` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `ticket_tag_list`
--
ALTER TABLE `ticket_tag_list`
  ADD CONSTRAINT `ticket_tag_list_company_id_foreign` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `ticket_types`
--
ALTER TABLE `ticket_types`
  ADD CONSTRAINT `ticket_types_company_id_foreign` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `unit_types`
--
ALTER TABLE `unit_types`
  ADD CONSTRAINT `unit_types_company_id_foreign` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `universal_search`
--
ALTER TABLE `universal_search`
  ADD CONSTRAINT `universal_search_company_id_foreign` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `users_company_id_foreign` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `users_country_id_foreign` FOREIGN KEY (`country_id`) REFERENCES `countries` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `users_chat`
--
ALTER TABLE `users_chat`
  ADD CONSTRAINT `users_chat_company_id_foreign` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `users_chat_from_foreign` FOREIGN KEY (`from`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `users_chat_to_foreign` FOREIGN KEY (`to`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `users_chat_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `users_chat_user_one_foreign` FOREIGN KEY (`user_one`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `users_chat_files`
--
ALTER TABLE `users_chat_files`
  ADD CONSTRAINT `users_chat_files_company_id_foreign` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `users_chat_files_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `users_chat_files_users_chat_id_foreign` FOREIGN KEY (`users_chat_id`) REFERENCES `users_chat` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `user_activities`
--
ALTER TABLE `user_activities`
  ADD CONSTRAINT `user_activities_company_id_foreign` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `user_activities_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `user_invitations`
--
ALTER TABLE `user_invitations`
  ADD CONSTRAINT `user_invitations_company_id_foreign` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `user_invitations_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `user_leadboard_settings`
--
ALTER TABLE `user_leadboard_settings`
  ADD CONSTRAINT `user_leadboard_settings_company_id_foreign` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `user_leadboard_settings_pipeline_stage_id_foreign` FOREIGN KEY (`pipeline_stage_id`) REFERENCES `pipeline_stages` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `user_leadboard_settings_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `user_permissions`
--
ALTER TABLE `user_permissions`
  ADD CONSTRAINT `user_permissions_permission_id_foreign` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `user_permissions_permission_type_id_foreign` FOREIGN KEY (`permission_type_id`) REFERENCES `permission_types` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `user_permissions_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `user_taskboard_settings`
--
ALTER TABLE `user_taskboard_settings`
  ADD CONSTRAINT `user_taskboard_settings_board_column_id_foreign` FOREIGN KEY (`board_column_id`) REFERENCES `taskboard_columns` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `user_taskboard_settings_company_id_foreign` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `user_taskboard_settings_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `visa_details`
--
ALTER TABLE `visa_details`
  ADD CONSTRAINT `visa_details_added_by_foreign` FOREIGN KEY (`added_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `visa_details_company_id_foreign` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `visa_details_country_id_foreign` FOREIGN KEY (`country_id`) REFERENCES `countries` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `visa_details_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
