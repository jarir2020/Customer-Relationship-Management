# Manual User Review — Worksuite CRM

Items that still need investigation or manual testing. These are NOT blockers — the app is functional. Flag these if you encounter related issues.

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

---

## Phase 1.3 — Invoice & Estimate (Code Looks OK, Manual Verify)

No critical bugs found in code review. Verify these if issues arise:

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

## General Notes

- PHPUnit 10 won't install due to locked composer deps + PHP 8.3. Using PHPUnit 9 phar for tests.
- Pusher/Echo is disabled when `MIX_PUSHER_APP_KEY` is empty — no runtime errors.
- `APP_ENV` must remain `codecanyon` — SMTP and other settings depend on it.
