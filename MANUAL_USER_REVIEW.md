# Manual User Review — Worksuite CRM

Items that still need investigation or manual testing. These are NOT blockers — the app is functional. Flag these if you encounter related issues.

---

## Phase 2 — New Features (Manual Verify)

### 2.6 Order Page Suggestion
- Added "Add Order" button to client profile dropdown when `orders` module is enabled.
- Verify: Open a client profile, confirm the dropdown shows "Add Order" and routes to `/orders/create?client_id=X`.

### 2.7 QR Clock-in Radius Validation
- Fixed in Phase 1.1. If you see radius validation failing, check `AttendanceController::qrClockInOut()` for distance calculation.

### 2.8 Task Status Details on Create Form
- The task create form already shows board columns (status) in a select dropdown. No separate status detail block exists — if you want status details shown at the top of the form, that feature is not yet implemented.

### 2.9 Export Enhancements
- **Project export** — Added `ProjectExport` Excel export. Route: `GET /projects/export`. Verify columns are correct.
- **Custom field export in timelog CSV** — If custom fields are missing from timelog CSV export, check `EmployeeTimelogs` export class for custom field joins.

---

## Phase 1.2 — Task & Timelog (Partially Complete)

### Needs Manual Testing / Further Investigation

1. **Task assignment UI** — The multi-user select (`user_id[]`) in the task create form may have display or selection issues. If task assignment feels broken, check:
   - `resources/views/tasks/ajax/create.blade.php:123` (the `multiple-users` select)
   - JS initialization in the same file around lines 586-654

2. **Timesheet entry & visibility** — No specific bug was reproduced. If timesheets show incorrect hours, missing entries, or permission issues:
   - Check `app/Traits/EmployeeDashboard.php` (timesheet data fetching)
   - Check `app/DataTables/TimelogDataTable.php` (visibility filtering)
   - Verify `user()->permission('view_timelogs')` returns correct value for each role

3. **Task board display** — Board loads but may have visual issues with:
   - Column counts when filters are applied
   - Drag-and-drop on mobile viewports
   - Tasks with `dependent_task_id` showing in wrong columns

4. **Task dependency handling** — Logic is correct in `TaskController.php:438-447`, but:
   - Circular dependencies are NOT prevented (A depends on B, B depends on A)
   - No validation that the dependent task belongs to the same project
   - Deleting a parent task sets `dependent_task_id` to NULL — dependent tasks become orphaned

---

## Phase 1.1 — Already Fixed (No Action Needed)

- Leave counts half-day weighting — fixed
- Unlimited leave type — added
- Carry-forward expiry — added
- Clock-in location null safety — fixed
- Duplicate task timer — fixed
- Recurring task short_code — fixed

---

## Phase 1.3 — Invoice & Estimate (Code Looks OK)

No critical bugs found. Verify these if issues arise:

1. **Project budget chart** — `ProjectController::amountBudgetChartData()` sums only `status='complete'` payments. Partial payments are ignored.
2. **Invoice PDF** — dompdf download path is standard. If blank, check template/CSS.
3. **Estimate → Invoice conversion** — `EstimateController::convertToInvoice()` copies line items. Verify amounts match.
4. **Estimate public link** — Encrypted link, check `EstimateController::showPublic()`.
5. **Contract PDF filename** — Check for special chars in `ContractController::download()`.

## Phase 1.4 — Client & Lead (Code Looks OK)

No critical bugs found. If issues arise:
- **Lead import** — `ImportLeadJob` fails on duplicate email (intended)
- **Client import** — `ImportClientJob` skips duplicates silently
- **Client permissions** — check `clientDetails` relationship on User
- **Lead contact** — `LeadContactController` handles contacts separately from Lead model

## Phase 1.5 — UI/UX Fixes (Code Looks OK)

No critical bugs found. If issues arise:
- **Dashboard load error** — check `DashboardController::index()` and widget data queries
- **Notice board client panel** — check `resources/views/dashboard/employee/widgets/notices.blade.php`
- **Message menu disappear** — JS in `resources/views/messages/index.blade.php` updates unread count; if menu hides, check CSS/JS conflicts
- **Project status change** — `ProjectController::update()` handles status, verify permission checks
- **Ticket creation** — `TicketController::store()` uses `StoreTicket` request, check validation
- **Project edit issue** — `ProjectController::edit()` loads project data, verify relationships
- **Recurring expense** — `AutoCreateRecurringExpenses` command, verify cron is running
- **Recurring invoice** — `AutoCreateRecurringInvoices` command, verify cron is running

---

## Phase 2.1-2.5 — New Features (Code Looks OK)

- **2.1 Lead forms + email history** — `LeadCustomForm` supports multiple forms. `LeadEmail` model + migration added for email history. Mailer UI not yet built.
- **2.2 Timesheet reject/revert** — `rejected` column added to `project_time_logs`. Reject/revert buttons in DataTable. Filter option added.
- **2.3 Attendance widget** — Added to employee dashboard. Verify it shows last 7 days.
- **2.4 Invoice reminders** — `invoice_reminder_settings` table + model + controller + view added.
- **2.5 Project tags** — `project_tags` + `project_project_tag` tables, model, controller, routes added.

---

## Phase 3 — Module Stubs (9/23 Created)

Stubs created for: Biometric, Payroll, Recruitment, AssetManagement, SMS, ZoomMeeting, Purchase, EInvoicing, Webhooks.
Remaining: RESTAPI, LanguagePack, ProjectRoadmap, CyberSecurity, QRCode, Letter, Biolinks, Performance, ServerManager, Policy, Onboarding, GroupMessage, AITools.

---

## General Notes

- PHPUnit 10 won't install due to locked composer deps + PHP 8.3. Using PHPUnit 9 phar for tests.
- Pusher/Echo is disabled when `MIX_PUSHER_APP_KEY` is empty — no runtime errors.
- `APP_ENV` must remain `codecanyon` — SMTP and other settings depend on it.
- **Migration fix**: The `2026_09_08_000005_add_rejected_to_project_time_logs` migration had already been applied manually to the DB but was missing from the `migrations` table, causing Laravel to retry it on every request. Fixed by inserting the migration record into the DB.
