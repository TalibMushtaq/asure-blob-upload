# Blob Drive

Google Drive-style file manager for Azure Blob Storage. Browse, upload, delete, and share files with time-limited SAS URLs.

Built with **Next.js 14** (App Router), **TypeScript**, and the **Azure Storage Blob SDK**.

## Features

- **File browser** with folder hierarchy, breadcrumbs, and search
- **Direct-to-Azure uploads** with real-time byte-level progress bars
- **Drag & drop** files or entire folders (preserves directory structure)
- **SAS URL generation** for sharing files (read-only, expiry up to 1 year)
- **Login authentication** with HMAC-signed httpOnly cookies
- **Delete protection** — folders require typing the name and `DELETE` to confirm
- **Dark theme** with IBM Plex Sans & Mono fonts
- **Activity log drawer** with color-coded entries

## Architecture

```
Browser ──(direct SAS upload)──► Azure Blob Storage
  │
  └──(REST API)──► Next.js Server ──► Azure Blob Storage
```

Uploads go directly from the browser to Azure (real progress). All other operations (list, delete, create folder) go through the Next.js API layer.

## API Endpoints

| Method | Route | Purpose |
|--------|-------|---------|
| `GET` | `/api/blobs?container=X&prefix=Y` | List folders & files |
| `GET` | `/api/blobs?containers=true` | List all containers |
| `POST` | `/api/blobs?action=mkdir` | Create a virtual folder |
| `DELETE` | `/api/blobs?blob=X` | Delete a file |
| `DELETE` | `/api/blobs?folder=X/` | Delete a folder recursively |
| `GET` | `/api/sas?blob=X&expiry=N` | Generate read SAS URL |
| `GET` | `/api/sas-upload?blob=X` | Generate write SAS URL |
| `POST` | `/api/upload` | Server-side upload (fallback) |
| `GET` | `/api/test` | R/W connectivity test |
| `GET` | `/api/cors-setup` | Configure Azure CORS |
| `POST` | `/api/login` | Authenticate and set session cookie |
| `POST` | `/api/logout` | Clear session cookie |

## Getting Started

### Prerequisites

- Node.js 18+
- An Azure Storage account with shared key access enabled

### Setup

```bash
git clone https://github.com/TalibMushtaq/asure-blob-upload.git
cd asure-blob-upload
npm install
```

Create `.env.local`:

```env
AZURE_STORAGE_ACCOUNT_NAME=your_account
AZURE_STORAGE_ACCOUNT_KEY=your_key
AZURE_STORAGE_CONNECTION_STRING=DefaultEndpointsProtocol=https;AccountName=...;AccountKey=...;EndpointSuffix=core.windows.net
AZURE_STORAGE_CONTAINER_NAME=uploads
AUTH_USER=your_username
AUTH_PASS=your_password
AUTH_SECRET=a_random_secret_string
```

### Run

```bash
npm run dev     # Development on http://localhost:3000
npm run build   # Production build
npm start       # Production server
```

## Deployment

Supports any Next.js-compatible platform (Vercel, Docker, Node.js server).

Set the environment variables above in your hosting platform. The app will **refuse to start** if `AUTH_USER`, `AUTH_PASS`, or `AUTH_SECRET` are missing.

For direct browser-to-Azure uploads to work, the app auto-configures CORS on the storage account on first page load. You can also manually trigger it via the CORS button in the header.

## Project Structure

```
src/
├── lib/
│   ├── blob.ts          # Azure Blob SDK wrapper
│   └── auth.ts          # HMAC token sign/verify
├── app/
│   ├── layout.tsx       # Root layout + favicon + fonts
│   ├── page.tsx         # File manager dashboard
│   ├── login/page.tsx   # Login page
│   └── api/
│       ├── blobs/       # List, create folder, delete
│       ├── sas/         # Read SAS URL generator
│       ├── sas-upload/  # Write SAS URL generator
│       ├── upload/      # Server-side upload fallback
│       ├── test/        # Connectivity test
│       ├── cors-setup/  # Azure CORS configuration
│       ├── login/       # Authentication
│       └── logout/      # Session clear
├── middleware.ts         # Auth guard for all routes
└── public/
    └── favicon.png
```

## License

GNU General Public License v3.0 (GPL-3.0-or-later)

i edited it