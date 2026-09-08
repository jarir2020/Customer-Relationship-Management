# AGENTS.md

## Project Overview
Customer Relationship Management (CRM) system built with Laravel 10 + MySQL.

## Setup
```bash
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
npm install && npm run dev
php artisan serve
```

## Conventions
- PHP 8.1+
- MySQL 8+
- Laravel 10.x
- Follow existing code style
- Run `php artisan pint` before committing

## Notes
- Demo credentials in `credentials.txt` (gitignored)
- SQL dump at `database/sql/elitede1_crm.sql`
- 3 roles: admin, employee, client
