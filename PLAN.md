# Manual Update Plan — Worksuite CRM

**Current version:** 5.4.8 (Laravel 10.48.22, PHP 8.3, MySQL 8.4)
**Target version:** 6.0.17 feature-parity (no Laravel upgrade)

---

## Phase 1: Bug Fixes (highest priority)

These are fixes for existing broken behavior — do these first.

### 1.1 Leave & Attendance Fixes (v6.0.12)
- Fix leave counts calculation
- Fix attendance bug with biometric clock-in
- Add expiry option for carry-forward leaves
- Add unlimited leave type support

### 1.2 Task & Timelog Fixes (v6.0.16, v6.0.09)
- Fix clock-in with location tracking
- Fix duplicate task timer issue
- Fix task assignment UI
- Fix timesheet entry & visibility
- Fix recurring task creation
- Fix task board display issue
- Fix task dependency handling

### 1.3 Invoice & Estimate Fixes (v5.5.15, v5.5.1)
- Fix project budget calculation
- Fix invoice PDF download
- Fix estimate product edit
- Fix invoice generation
- Fix estimate public link
- Fix estimate tab in Projects
- Add change downloaded contract filename & PDF formatting

### 1.4 Client & Lead Fixes (v5.5.15, v5.5.12)
- Fix lead import
- Fix lead public form
- Fix client import
- Fix client details export
- Fix client permission issues
- Fix lead contact issue

### 1.5 UI/UX Fixes (multiple versions)
- Fix dashboard load error
- Fix notice board client panel issue
- Fix message menu disappear
- Fix message UI
- Fix project status change issue
- Fix ticket creation issue
- Fix project edit issue
- Fix recurring expense issue
- Fix recurring invoice issue

---

## Phase 2: New Features

### 2.1 Lead Enhancements (v6.0.14)
- Multiple lead forms support
- Email to leads with history tracking

### 2.2 Timesheet Enhancements (v5.5.15)
- Add 'Reject' filter for timesheets
- Add option to revert timesheet status after approval/rejection
- Add weekly timesheet manual entry
- Add timesheet reporting manager feature
- Add department filter in timesheet

### 2.3 Employee Features (v5.5.20)
- Add attendance tab to employee overview dashboard
- Add permission to view Employee menu in Role & Permission settings

### 2.4 Invoice Reminder (v6.0.11)
- Add advanced invoice reminder settings

### 2.5 Project Tags (v5.5.15)
- Add project tags feature

### 2.6 Order Page Enhancement (v5.5.1)
- Add order page suggestion for client profile

### 2.7 QR Clock-in Radius Fix (v5.5.0)
- Fix QR code clock-in radius validation

### 2.8 Task Status Details (v5.5.0)
- Show task status details at top of task create form

### 2.9 Export Enhancements (v5.5.0)
- Add more details in project export
- Fix custom field export in timelog CSV

---

## Phase 3: New Modules (stubs/placeholders)

These modules are referenced in the changelog. Create skeleton modules with basic routes/views. Full implementation requires additional design work.

| Module | Status | Notes |
|--------|--------|-------|
| Asset Management | Stub | Track company assets |
| REST API | Stub | API token management |
| Payroll | Stub | Basic payroll structure |
| SMS | Stub | SMS notification gateway |
| Zoom Meeting | Stub | Zoom integration stub |
| Recruit | Stub | Recruitment pipeline stub |
| Language Pack | Stub | Multi-language support stub |
| Purchase | Stub | Purchase order stub |
| E-Invoicing | Stub | Electronic invoicing stub |
| Project Roadmap | Stub | Advanced reporting stub |
| Webhooks | Stub | Webhook management stub |
| Cyber Security | Stub | Security dashboard stub |
| QR Code | Stub | QR generation stub |
| Letter | Stub | Letter management stub |
| Biolinks | Stub | Bio link pages stub |
| Performance | Stub | Employee performance stub |
| Biometric | Stub | ZKTeco device integration stub |
| Server Manager | Stub | Domain/server management stub |
| Policy | Stub | Policy signing stub |
| Onboarding | Stub | Employee onboarding stub |
| Group Message | Stub | Group messaging stub |
| AITools | Stub | AI features stub |

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
