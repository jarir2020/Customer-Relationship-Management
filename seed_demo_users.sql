INSERT INTO users
    (company_id, name, email, password, status, login, email_notifications, locale, dark_theme, rtl, two_factor_confirmed, two_factor_email_confirmed, admin_approval, permission_sync, google_calendar_status, customised_permissions, created_at, updated_at)
VALUES
    (1, 'Admin User', 'admin@demo.local', '$2y$10$pfrwIhJmYBtBTWw.Uu.At.PhUaVRO.3CpUarUyq4vTUdFYuXtH2U6', 'active', 'enable', 1, 'en', 0, 0, 0, 0, 1, 1, 1, 0, NOW(), NOW()),
    (1, 'Employee User', 'employee@demo.local', '$2y$10$pfrwIhJmYBtBTWw.Uu.At.PhUaVRO.3CpUarUyq4vTUdFYuXtH2U6', 'active', 'enable', 1, 'en', 0, 0, 0, 0, 1, 1, 1, 0, NOW(), NOW()),
    (1, 'Client User', 'client@demo.local', '$2y$10$pfrwIhJmYBtBTWw.Uu.At.PhUaVRO.3CpUarUyq4vTUdFYuXtH2U6', 'active', 'enable', 1, 'en', 0, 0, 0, 0, 1, 1, 1, 0, NOW(), NOW());

INSERT INTO role_user (user_id, role_id)
SELECT id, 1 FROM users WHERE email = 'admin@demo.local';
INSERT INTO role_user (user_id, role_id)
SELECT id, 2 FROM users WHERE email = 'employee@demo.local';
INSERT INTO role_user (user_id, role_id)
SELECT id, 3 FROM users WHERE email = 'client@demo.local';
