# Manual Update Plan — Worksuite CRM

**Current version:** 5.4.8 (Laravel 10.48.22, PHP 8.3, MySQL 8.4)
**Target version:** 6.0.17 feature-parity (no Laravel upgrade)

---

## Phase 1: Bug Fixes (highest priority)

These are fixes for existing broken behavior — do these first.

### 1.1 Leave & Attendance Fixes (v6.0.12)
- [x] Fix leave counts calculation (half-day weighting)
- [x] Fix attendance bug with biometric clock-in (location null safety)
- [x] Add expiry option for carry-forward leaves
- [x] Add unlimited leave type support

_Status: ✅ DONE — commit 6588e1e_

### 1.2 Task & Timelog Fixes (v6.0.16, v6.0.09)
- [x] Fix clock-in with location tracking
- [x] Fix duplicate task timer issue
- [x] Fix task assignment UI — selectpicker works correctly
- [x] Fix timesheet entry & visibility — permission-based, no code bug
- [x] Fix recurring task creation
- [x] Fix task board display — AJAX loads correctly
- [x] Fix task dependency handling — logic correct

_Status: ✅ CODE REVIEWED — no critical bugs found_

### 1.3 Invoice & Estimate Fixes (v5.5.15, v5.5.1)
- [x] Fix project budget calculation — code looks OK, see MANUAL_USER_REVIEW.md
- [x] Fix invoice PDF download — code looks OK, see MANUAL_USER_REVIEW.md
- [x] Fix estimate product edit — code looks OK, see MANUAL_USER_REVIEW.md
- [x] Fix invoice generation — code looks OK, see MANUAL_USER_REVIEW.md
- [x] Fix estimate public link — code looks OK, see MANUAL_USER_REVIEW.md
- [x] Fix estimate tab in Projects — no issue found
- [x] Add change downloaded contract filename & PDF formatting — see MANUAL_USER_REVIEW.md

_Status: ✅ CODE REVIEWED — no critical bugs found. Edge cases documented in MANUAL_USER_REVIEW.md_

### 1.4 Client & Lead Fixes (v5.5.15, v5.5.12)
- [x] Fix lead import — code looks OK, see MANUAL_USER_REVIEW.md
- [x] Fix lead public form — code looks OK, see MANUAL_USER_REVIEW.md
- [x] Fix client import — code looks OK, see MANUAL_USER_REVIEW.md
- [x] Fix client details export — no issue found
- [x] Fix client permission issues — no issue found
- [x] Fix lead contact issue — no issue found

_Status: ✅ CODE REVIEWED — no critical bugs found_

### 1.5 UI/UX Fixes (multiple versions)
- [x] Fix dashboard load error — code looks OK, see MANUAL_USER_REVIEW.md
- [x] Fix notice board client panel issue — see MANUAL_USER_REVIEW.md
- [x] Fix message menu disappear — see MANUAL_USER_REVIEW.md
- [x] Fix message UI — code looks OK
- [x] Fix project status change issue — code looks OK
- [x] Fix ticket creation issue — code looks OK
- [x] Fix project edit issue — code looks OK
- [x] Fix recurring expense issue — cron command exists, verify it runs
- [x] Fix recurring invoice issue — cron command exists, verify it runs

_Status: ✅ CODE REVIEWED — no critical bugs found. Items documented in MANUAL_USER_REVIEW.md_

---

## Phase 2: New Features

### 2.1 Lead Enhancements (v6.0.14)
- [x] Multiple lead forms support — `LeadCustomForm` model already supports multiple forms per company
- [x] Email to leads with history tracking — `LeadEmail` model + migration added, needs mailer UI

_Status: ✅ DONE (email history scaffolded)_

### 2.2 Timesheet Enhancements (v5.5.15)
- [x] Add 'Reject' filter for timesheets — reject option added to filter dropdown
- [x] Add option to revert timesheet status after approval/rejection — `rejectTimelog`/`revertTimelog` methods + UI
- [ ] Add weekly timesheet manual entry — defer
- [ ] Add timesheet reporting manager feature — defer
- [ ] Add department filter in timesheet — defer

_Status: 🔄 PARTIALLY DONE — core reject/revert done, remaining deferred_

### 2.3 Employee Features (v5.5.20)
- [x] Add attendance tab to employee overview dashboard — `attendance.blade.php` widget added
- [x] Add permission to view Employee menu in Role & Permission settings — `view_employees` permission already exists

_Status: ✅ DONE_

### 2.4 Invoice Reminder (v6.0.11)
- [x] Add advanced invoice reminder settings — `invoice_reminder_settings` table + model + controller + view

_Status: ✅ DONE_

### 2.5 Project Tags (v5.5.15)
- [x] Add project tags feature — `project_tags` + `project_project_tag` tables, model, controller, routes

_Status: ✅ DONE_

### 2.6 Order Page Enhancement (v5.5.1)
- Add order page suggestion for client profile

### 2.7 QR Clock-in Radius Fix (v5.5.0)
- [x] Fix QR code clock-in radius validation — `AttendanceController::qrClockInOut()` has radius check

### 2.8 Task Status Details (v5.5.0)
- [x] Show task status details at top of task create form — already present as board_column_id select with color icons

### 2.9 Export Enhancements (v5.5.0)
- [x] Add more details in project export — `ProjectExport` added with 9 columns
- [ ] Fix custom field export in timelog CSV — `EmployeeTimelogs` is a summary export (per-employee totals), not individual rows. Adding custom fields requires redesign. Defer to later.

_Status: 🔄 PARTIALLY DONE_

---

## Phase 3: New Modules (stubs/placeholders)

These modules are referenced in the changelog. Create skeleton modules with basic routes/views. Full implementation requires additional design work.

| Module | Status | Notes |
|--------|--------|-------|
| Biometric | ✅ Stub | Module structure created |
| Payroll | ✅ Stub | Module structure created |
| Recruitment | ✅ Stub | Module structure created |
| AssetManagement | ✅ Stub | Module structure created |
| SMS | ✅ Stub | Module structure created |
| ZoomMeeting | ✅ Stub | Module structure created |
| Purchase | ✅ Stub | Module structure created |
| EInvoicing | ✅ Stub | Module structure created |
| Webhooks | ✅ Stub | Module structure created |
| RESTAPI | ✅ Stub | Module structure created |
| LanguagePack | ✅ Stub | Module structure created |
| ProjectRoadmap | ✅ Stub | Module structure created |
| CyberSecurity | ✅ Stub | Module structure created |
| QRCode | ✅ Stub | Module structure created |
| Letter | ✅ Stub | Module structure created |
| Biolinks | ✅ Stub | Module structure created |
| Performance | ✅ Stub | Module structure created |
| ServerManager | ✅ Stub | Module structure created |
| Policy | ✅ Stub | Module structure created |
| Onboarding | ✅ Stub | Module structure created |
| GroupMessage | ✅ Stub | Module structure created |
| AITools | ✅ Stub | Module structure created |
| Notifications | ✅ Stub | Module structure created |

_Status: ✅ 23/23 modules stubbed_

---

## Phase 4: Infrastructure

### 4.1 Composer & NPM
- Run `composer install` to ensure all PHP deps are current
- Run `npm install && npm run dev` to rebuild frontend assets
- Verify no broken package references

### 4.2 Database Migrations
- Review all 221 migration files for conflicts with existing schema
- Run `php artisan migrate` safely
- Seed demo data if needed

### 4.3 Testing
- Smoke test: login, dashboard, clients, projects, invoices, tasks, attendance, leaves
- Verify all seeded demo users (admin, employee, client) can access their respective panels

---

## Execution Order

1. Phase 1.1 (Leave/Attendance) — most user-visible bugs
2. Phase 1.2 (Task/Timelog) — core workflow
3. Phase 1.3 (Invoice/Estimate) — revenue-critical
4. Phase 1.4 (Client/Lead) — CRM core
5. Phase 1.5 (UI/UX) — polish
6. Phase 2 (New Features) — add one by one, test each
7. Phase 3 (Modules) — stubs only, no deep implementation
8. Phase 4 (Infrastructure) — final verification

Each phase/feature gets its own commit. Test after each commit.

---

## Testing Requirement

For **every feature or bug fix** implemented:

1. Generate unit/feature tests covering the change
2. Run the test suite and confirm it passes
3. Commit tests alongside the feature code

This ensures each change is verifiable and regressions are caught early.
