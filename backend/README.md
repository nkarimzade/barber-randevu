# Berber Backend

Node.js API for services, appointment availability, admin controls, and booking records.

Data is stored in Firebase Firestore.

## Run

```bash
npm install
npm run dev
```

The API runs on `http://localhost:4000`.

Create `.env` from `.env.example`, set `ADMIN_TOKEN`, then place your Firebase private key JSON at `backend/service-account.json`.

## Endpoints

- `GET /api/services`
- `GET /api/closed-days`
- `GET /api/availability?date=YYYY-MM-DD`
- `GET /api/appointments/lookup?numberId=PHONE`
- `POST /api/appointments`

Admin endpoints require `Authorization: Bearer <ADMIN_TOKEN>`.

- `GET /api/admin/dashboard?date=YYYY-MM-DD`
- `GET /api/admin/appointments/pdf?date=YYYY-MM-DD`
- `PATCH /api/admin/services/:id`
- `POST /api/admin/services`
- `DELETE /api/admin/services/:id`
- `POST /api/admin/closed-days`
- `DELETE /api/admin/closed-days/:date`
- `POST /api/admin/blocked-slots`
- `DELETE /api/admin/blocked-slots/:id`
- `POST /api/admin/blocked-phones`
- `DELETE /api/admin/blocked-phones/:phone`
