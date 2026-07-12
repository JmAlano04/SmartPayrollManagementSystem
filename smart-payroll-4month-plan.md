# Smart Payroll Management System — 4-month daily plan
Laravel + PostgreSQL + React. 85 weekdays across 17 weeks, start to finish.

## Month 1 — Foundation, data model, payroll engine

### Week 1 — Environment & auth
- [ ] **Day 1** — Install Laravel, connect to PostgreSQL (`.env`), install Sanctum, `git init`
- [ ] **Day 2** — Install `spatie/laravel-permission`, create admin/hr/employee roles, seed them
- [ ] **Day 3** — Auth endpoints (register/login/logout) with Sanctum tokens, test in Postman
- [ ] **Day 4** — Scaffold React app (Vite), Axios instance with auth interceptor, login page
- [ ] **Day 5** — Protected route wrapper in React, role-based guarding, base layout/nav

### Week 2 — Core data model
- [ ] **Day 6** — `employees` migration + model + factory
- [ ] **Day 7** — `salary_structures` migration + model, relate to employee
- [ ] **Day 8** — `tax_brackets` migration + model, seed sample bracket data
- [ ] **Day 9** — `attendance` migration + model + factory (simulate a month of records)
- [ ] **Day 10** — `payroll_runs`, `payslips`, `payroll_run_logs` migrations + models; migrate on Postgres; seed realistic data

### Week 3 — Payroll engine core
- [ ] **Day 11** — Build `TaxCalculatorService`; unit test against manual bracket math
- [ ] **Day 12** — Build `PayrollCalculationService` skeleton: base pay + absence deduction
- [ ] **Day 13** — Add overtime calculation, allowances, gross pay assembly
- [ ] **Day 14** — Wire tax + fixed deductions into net pay; write `calculation_breakdown` JSON
- [ ] **Day 15** — End-to-end test: compute payslips for 3 sample employees, verify by hand

### Week 4 — Payslip generation + queueing
- [ ] **Day 16** — Build `generatePayslip()` persistence method
- [ ] **Day 17** — Create `GeneratePayslipsJob` queued job, dispatch one per employee
- [ ] **Day 18** — Configure Redis queue driver, test with `php artisan queue:work`
- [ ] **Day 19** — `POST /payroll-runs/{id}/generate` endpoint to trigger the batch
- [ ] **Day 20** — React "run payroll" screen showing generated payslips; buffer/review day

## Month 2 — Workflow, smart features, camera clock-in

### Week 5 — Approval state machine
- [ ] **Day 21** — Design `PayrollRun` status enum + legal transition rules
- [ ] **Day 22** — Build `PayrollRunStateService` with guarded transition methods
- [ ] **Day 23** — Log every transition to `payroll_run_logs`
- [ ] **Day 24** — API endpoints for status transitions, role-gated
- [ ] **Day 25** — React approval screen wired to transition endpoints

### Week 6 — Anomaly detection
- [ ] **Day 26** — Build `AnomalyDetectionService`: trailing-average calculation
- [ ] **Day 27** — Hook anomaly check into `PayrollCalculationService`
- [ ] **Day 28** — React: highlight flagged payslips with reason tooltip
- [ ] **Day 29** — Auto-update `flagged_anomalies_count` on payroll runs
- [ ] **Day 30** — Test anomaly detection against seeded edge cases

### Week 7 — Forecasting + dashboard
- [ ] **Day 31** — Build `PayrollForecastService` (moving average / linear regression)
- [ ] **Day 32** — `GET /forecast` endpoint
- [ ] **Day 33** — React dashboard skeleton; fetch forecast + summary stats
- [ ] **Day 34** — Recharts trend line for payroll cost over time
- [ ] **Day 35** — Pending-approvals + flagged-anomalies dashboard widgets

### Week 8 — Camera clock-in
- [ ] **Day 36** — Add `face_descriptor` + `clock_ins` migrations (`jsonb`), run on Postgres
- [ ] **Day 37** — Build `FaceRecognitionService` (Euclidean distance matching)
- [ ] **Day 38** — Build `ClockInController` (store + enroll), routes + middleware
- [ ] **Day 39** — React `CameraClockIn` component; face-api.js model weights, webcam capture
- [ ] **Day 40** — HR enrollment screen; test full identify flow

## Month 3 — Attendance link, notifications, documents, testing

### Week 9 — Attendance integration
- [ ] **Day 41** — Link `clock_ins` to `attendance` — derive hours/overtime from in/out pairs
- [ ] **Day 42** — Scheduled command to reconcile daily clock-ins into attendance rows
- [ ] **Day 43** — Handle edge cases: missed clock-out, duplicate scans, manual override
- [ ] **Day 44** — React attendance calendar view per employee
- [ ] **Day 45** — Buffer/testing day for camera + attendance pipeline

### Week 10 — Notifications
- [ ] **Day 46** — Laravel Notifications (mail channel): "payroll run needs approval"
- [ ] **Day 47** — Notification for flagged anomalies to HR
- [ ] **Day 48** — Notification to employee when payslip is ready
- [ ] **Day 49** — Queue notifications; test with Mailtrap or local SMTP
- [ ] **Day 50** — Optional in-app notification list, or confirm email-only is enough

### Week 11 — Documents & exports
- [ ] **Day 51** — Install `laravel-dompdf`, build payslip PDF template
- [ ] **Day 52** — Endpoint to download an individual payslip as PDF
- [ ] **Day 53** — Payroll summary CSV export (per run)
- [ ] **Day 54** — React download buttons wired to both endpoints
- [ ] **Day 55** — Polish PDF/CSV formatting; test with real seeded data

### Week 12 — Testing
- [ ] **Day 56** — Unit tests: `TaxCalculatorService` bracket edge cases
- [ ] **Day 57** — Unit tests: `PayrollCalculationService` (overtime, absences)
- [ ] **Day 58** — Unit tests: `AnomalyDetectionService`, `FaceRecognitionService`
- [ ] **Day 59** — Feature test: full payroll run lifecycle (draft → paid) via API
- [ ] **Day 60** — Feature test: clock-in identification flow end-to-end; fix bugs

## Month 4 — Security, admin tools, CI/CD, launch

### Week 13 — Security & hardening
- [ ] **Day 61** — Rate limiting on auth & clock-in endpoints; review Sanctum token expiry
- [ ] **Day 62** — Form request validation classes for all major inputs; sanitize photo uploads
- [ ] **Day 63** — Laravel Policies for Employee/PayrollRun authorization (replace ad-hoc checks)
- [ ] **Day 64** — Backup strategy notes; consider encrypting `face_descriptor` at rest
- [ ] **Day 65** — Security review: `composer audit`, basic OWASP checklist pass

### Week 14 — Settings & admin UI
- [ ] **Day 66** — Settings page: manage tax brackets via UI instead of manual seeding
- [ ] **Day 67** — Settings page: anomaly threshold, overtime multiplier defaults
- [ ] **Day 68** — Employee management screens (CRUD) in React
- [ ] **Day 69** — Role management UI (assign hr/admin/employee)
- [ ] **Day 70** — Buffer/testing day for admin UI

### Week 15 — CI/CD, monitoring, docs
- [ ] **Day 71** — GitHub Actions CI: run tests + lint on push
- [ ] **Day 72** — Logging for payroll calculation errors and queue failures
- [ ] **Day 73** — Basic monitoring: Laravel Telescope or a health-check endpoint
- [ ] **Day 74** — API documentation (Postman collection or OpenAPI spec)
- [ ] **Day 75** — Developer README + deployment runbook

### Week 16 — Deployment
- [ ] **Day 76** — Production Postgres + Redis, environment config, `.env` secrets
- [ ] **Day 77** — Configure queue worker + scheduler (Supervisor, or Forge/Vapor)
- [ ] **Day 78** — Deploy backend, run migrations on production
- [ ] **Day 79** — Deploy React frontend, point at production API
- [ ] **Day 80** — Smoke test on production: login → run payroll → approve → clock in → download PDF

### Week 17 — Final QA & handover
- [ ] **Day 81** — Full regression test across all modules
- [ ] **Day 82** — Load-test payslip generation with a larger seeded dataset (e.g. 500 employees)
- [ ] **Day 83** — Fix bugs found in regression/load testing
- [ ] **Day 84** — Final UI polish (loading states, error messages, empty states)
- [ ] **Day 85** — Project handover: demo walkthrough, backlog of future features

## Notes
- Postgres-specific: use `jsonb` (not `json`) for `employees.face_descriptor` and `payslips.calculation_breakdown`.
- Highest-risk weeks: 3 (calculation logic), 6 (anomaly thresholds), 8 (camera), 13 (security) — protect these if you fall behind, borrow time from buffer days (20, 45, 70) instead.
