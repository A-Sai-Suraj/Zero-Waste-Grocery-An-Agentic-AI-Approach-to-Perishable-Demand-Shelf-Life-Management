# ZeroWaste AI local setup (Windows)

This guide uses PowerShell and assumes a fresh clone of this repository. Keep backend, ML service, and frontend running in separate terminals.

## Current checkout limitations

The frontend is configured for `http://localhost:5000/api/v1`. The backend currently in this checkout mounts its routes under `/api`, and its route set does not yet include all of the versioned inventory, forecast, spoilage-risk, and planner endpoints the frontend uses. Its `/health` route exists, but `/ready` does not.

There is no Prisma migration history or seed script in this checkout. Do not treat an empty database as seeded, and do not run a schema reset to work around these gaps. The currently running services on a developer machine may be from a different folder and are not a substitute for validating this checkout.

## Software required

- Node.js 20 LTS (includes npm)
- Python 3.13 (the pinned ML requirements were installed and tested with this version)
- A Neon PostgreSQL project, or a local PostgreSQL server
- Git (for cloning and updates)

## 1. Create a Neon PostgreSQL database

1. Open [Neon](https://neon.tech/) and sign in or create an account.
2. Choose **New Project**, name it (for example, `zerowaste-ai`), choose a region near you, and create the project with its default database.
3. On the project dashboard, choose **Connect** and select the Node.js connection details. Prefer the direct (non-pooled) connection URI for local Prisma setup.
4. Copy the connection URI privately. It contains a password; do not paste it into chat, source control, or a frontend environment file.
5. This Prisma schema reads `DATABASE_URL` only. It does not use `DIRECT_URL`.

For a local PostgreSQL alternative, install PostgreSQL, create an empty database named `zerowaste_ai`, and use its local connection URI instead.

## 2. Configure environment files

Open PowerShell in the repository root:

```powershell
Set-Location -LiteralPath 'D:\hitam hackathon\Zero-Waste-Grocery-An-Agentic-AI-Approach-to-Perishable-Demand-Shelf-Life-Management'
```

Create the backend environment file if it does not already exist, then edit it locally:

```powershell
if (-not (Test-Path -LiteralPath '.\backend\.env')) {
    Copy-Item '.\backend\.env.example' '.\backend\.env'
}
notepad '.\backend\.env'
```

Set `PORT=5000`, `ML_SERVICE_URL=http://127.0.0.1:8000`, a private `JWT_SECRET`, and `DATABASE_URL` to the Neon or local PostgreSQL URI. Keep the database URI in `backend\.env` only. Do not overwrite an existing `.env` without checking its contents locally.

Create the frontend environment file if it does not already exist:

```powershell
if (-not (Test-Path -LiteralPath '.\frontend\.env.local')) {
    Copy-Item '.\frontend\.env.example' '.\frontend\.env.local'
}
notepad '.\frontend\.env.local'
```

The frontend values should be:

```text
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api/v1
```

Only public values belong in `frontend\.env.local`. Next.js reads this file when it starts; restart the frontend after changing it.

The ML service uses `ml-service\.env.example` for non-secret development settings. Its current models are explicitly mock/baseline implementations; do not present them as trained model results.

## 3. Install dependencies and check the schema

From the repository root, install all Node workspace dependencies using the checked-in root lockfile:

```powershell
npm ci
npm exec --workspace backend -- prisma validate
npm run prisma:generate --workspace backend
npm run build:backend
npm run test:backend
```

There are currently no migration files. Only when using a newly created, empty database, review `backend\prisma\schema.prisma` and create the initial migration with:

```powershell
npm run prisma:migrate --workspace backend
```

If Prisma reports drift or offers to reset a database, cancel and investigate; never accept a reset for a database containing data. Once migration files exist, they are tracked by Git.

There is currently no seed script or configured seed command. No seed or second-run idempotency check can be performed until a seed script is added. Do not substitute manually invented production-looking records.

## 4. Start the ML service (Terminal 1)

```powershell
Set-Location -LiteralPath 'D:\hitam hackathon\Zero-Waste-Grocery-An-Agentic-AI-Approach-to-Perishable-Demand-Shelf-Life-Management\ml-service'
py -3.13 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

If PowerShell blocks virtual-environment activation, run this in that terminal and retry activation:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
```

Keep Terminal 1 open. Verify in a separate PowerShell window:

```powershell
Invoke-RestMethod 'http://127.0.0.1:8000/health'
```

Open the interactive API docs at [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs). The service exposes forecast and spoilage-risk contracts; responses should be described according to their model/baseline metadata.

## 5. Start the backend (Terminal 2)

After configuring `backend\.env` and applying an appropriate migration:

```powershell
Set-Location -LiteralPath 'D:\hitam hackathon\Zero-Waste-Grocery-An-Agentic-AI-Approach-to-Perishable-Demand-Shelf-Life-Management'
npm run dev:backend
```

Keep Terminal 2 open. The current checkout exposes `GET http://localhost:5000/health` and `GET http://localhost:5000/api/health`. It does not currently expose `/ready`; its API route prefix and available routes also need to be aligned with the frontend's `/api/v1` contract before claiming end-to-end integration.

## 6. Start the frontend (Terminal 3)

```powershell
Set-Location -LiteralPath 'D:\hitam hackathon\Zero-Waste-Grocery-An-Agentic-AI-Approach-to-Perishable-Demand-Shelf-Life-Management'
npm run dev:frontend
```

Keep Terminal 3 open and open [http://localhost:3000](http://localhost:3000). The frontend uses Express, not the ML service directly. Forecast, risk, recommendation, and planner pages require the versioned backend endpoints noted above.

## Common problems

- **Port already in use:** inspect the listener before stopping anything:

  ```powershell
  Get-NetTCPConnection -State Listen -LocalPort 3000,5000,8000 -ErrorAction SilentlyContinue |
      Select-Object LocalAddress,LocalPort,OwningProcess
  ```

  Identify the process before stopping it; do not terminate an unrelated service.

- **Frontend cannot connect:** check that the backend is listening on port 5000 and that `NEXT_PUBLIC_API_BASE_URL` is exactly `http://localhost:5000/api/v1`. The backend in this checkout currently uses a different route prefix, so correcting the URL alone does not add the missing backend routes.
- **Prisma cannot connect:** check `DATABASE_URL` locally, verify that the Neon project is awake and the URI is complete, and confirm network access. Do not send the URI or password to anyone.
- **Prisma asks to reset:** cancel. This checkout has no migration history yet; diagnose schema/database state before any migration command.
- **Python import/module errors:** activate `ml-service\.venv`, run commands from `ml-service`, and install the pinned `requirements.txt`.
- **No inventory/demo data:** no seed script exists in this checkout. Database-dependent UI flows need a documented, reviewed seed process before they can be demonstrated reliably.

## Stop services

In each of the three service terminals, press **Ctrl+C**. Deactivate the Python environment in Terminal 1 with:

```powershell
deactivate
```
