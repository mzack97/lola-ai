# LOLA AI website — progress

## Phase 1–4 (built)
- [x] Project setup: Next.js 15, PostgreSQL, Drizzle, Tailwind, Docker
- [x] Registration / login (phone + password), sessions, roles
- [x] Landing page (hero, courses, about, freelance & marketplace "Tez kunda", news, team, contacts)
- [x] News list + article, course catalog + course page, coming-soon pages
- [x] Enrollment requests; teacher approves / rejects; capacity check; auto-approve option
- [x] Student cabinet + profile + password change
- [x] Course room: sections (add/rename/reorder/hide/delete), chat (auto-refresh), Meet lesson cards, materials (link or file)
- [x] Teacher cabinet: courses, requests, students
- [x] Admin: dashboard, landing blocks, team, contacts, news, categories, courses + teacher assignment, enrollments overview, users (role, block, reset password, create)
- [x] Deploy kit: Dockerfile, docker-compose, Caddy HTTPS, backups, update script, README

## Phase 5 — launch
- [ ] Domain + server bought
- [ ] Code on GitHub
- [ ] Deployed to lola-ai.uz, admin login works
- [ ] Real content: courses, teachers, team photos, contacts
- [ ] Pilot: 1 course, 1 teacher, ~10 students

## Later
- [ ] Telegram/SMS notifications for new lessons
- [ ] SMS password reset, OneID
- [ ] Attendance, certificates
- [ ] Freelance, marketplace

## Review
- E2E test passed locally: register → apply → teacher approves → section → Meet lesson → chat both ways → admin creates course with teacher. No server errors.
