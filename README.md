# 🚀 GrowEasy AI-Powered CSV Importer

An intelligent CSV importer that uses AI (Google Gemini) to automatically map any CSV format into GrowEasy CRM lead records. Upload files from Facebook Lead Exports, Google Ads, Excel sheets, Real Estate CRMs, or any custom spreadsheet — the AI handles the rest.

![Tech Stack](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)
![Tech Stack](https://img.shields.io/badge/Express.js-4-green?style=flat-square&logo=express)
![Tech Stack](https://img.shields.io/badge/Gemini_AI-2.0_Flash-blue?style=flat-square&logo=google)
![Tech Stack](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)

## ✨ Features

### Frontend
- 📁 **Drag & Drop Upload** — Intuitive file upload with drag-and-drop support
- 📊 **CSV Preview** — Beautiful, scrollable table with sticky headers
- 🔄 **Step-by-Step Wizard** — Upload → Preview → Processing → Results
- 🎨 **Dark/Light Mode** — System preference detection with manual toggle
- 📱 **Responsive Design** — Works on mobile, tablet, and desktop
- 💾 **Export Results** — Download parsed CRM records as CSV
- ⏳ **Loading States** — Animated progress indicators during AI processing

### Backend
- 🤖 **AI-Powered Extraction** — Google Gemini 2.0 Flash for intelligent field mapping
- 📦 **Batch Processing** — Handles large CSVs by processing in batches of 25
- 🔄 **Retry Mechanism** — Exponential backoff with 3 retries per batch
- ✅ **Validation** — Post-processing validation enforces CRM enum constraints
- 🛡️ **Error Handling** — Graceful error handling with descriptive messages
- 📏 **Type Safety** — Full TypeScript with strict mode

### AI Capabilities
- Maps arbitrary column names to CRM fields (e.g., "Full Name" → `name`)
- Extracts country codes from phone numbers
- Infers CRM status from textual descriptions
- Handles multiple emails/phones (first → main field, rest → notes)
- Skips records without email or mobile number
- Matches data sources to allowed values when confident

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, React 18, Vanilla CSS |
| Backend | Express.js, TypeScript, Multer |
| AI | Google Gemini 2.0 Flash (`@google/genai`) |
| CSV | PapaParse (client + server) |
| Container | Docker + Docker Compose |

## 📁 Project Structure

```
├── client/                    # Next.js Frontend
│   └── src/
│       ├── app/               # App Router pages & layout
│       ├── components/        # React components
│       ├── hooks/             # Custom hooks
│       ├── lib/               # Utilities & API client
│       └── types/             # TypeScript types
├── server/                    # Express Backend
│   └── src/
│       ├── config/            # Environment config
│       ├── controllers/       # Request handlers
│       ├── prompts/           # AI prompt templates
│       ├── routes/            # API routes
│       ├── services/          # Business logic (CSV, AI)
│       ├── types/             # TypeScript types
│       └── utils/             # Validation utilities
├── samples/                   # Sample CSV files for testing
├── docker-compose.yml         # Docker setup
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ 
- **npm** 8+
- **Google Gemini API Key** — Get one at [Google AI Studio](https://aistudio.google.com/apikey)

### 1. Clone the Repository

```bash
git clone <repository-url>
cd ai_powered_csv_importer
```

### 2. Setup the Backend

```bash
cd server

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Add your Gemini API key to .env
# GEMINI_API_KEY=your_api_key_here

# Start development server
npm run dev
```

The backend will start on **http://localhost:3001**

### 3. Setup the Frontend

```bash
cd client

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will start on **http://localhost:3000**

### 4. Use the App

1. Open **http://localhost:3000** in your browser
2. Upload a CSV file (drag & drop or click to browse)
3. Preview the parsed data
4. Click **"Import Records"** to trigger AI extraction
5. View the results — imported records, skipped records, and stats
6. Export the parsed CRM data as CSV



## 🔌 API Reference

### POST `/api/import`

Upload a CSV file for AI-powered CRM extraction.

**Request:**
- Method: `POST`
- Content-Type: `multipart/form-data`
- Body: `file` (CSV file, max 50MB)

**Response:**
```json
{
  "success": true,
  "data": {
    "records": [
      {
        "created_at": "2026-05-13 14:20:48",
        "name": "John Doe",
        "email": "john.doe@example.com",
        "country_code": "+91",
        "mobile_without_country_code": "9876543210",
        "company": "GrowEasy",
        "city": "Mumbai",
        "state": "Maharashtra",
        "country": "India",
        "lead_owner": "",
        "crm_status": "GOOD_LEAD_FOLLOW_UP",
        "crm_note": "",
        "data_source": "",
        "possession_time": "",
        "description": ""
      }
    ],
    "skipped": [
      {
        "row": 8,
        "reason": "No email or mobile number found",
        "originalData": { "Full Name": "Empty Record" }
      }
    ],
    "stats": {
      "totalRows": 10,
      "imported": 9,
      "skipped": 1,
      "successRate": 90
    }
  }
}
```

### GET `/api/health`

Health check endpoint.

## 🧪 Sample CSV Files

The `samples/` directory contains test CSVs with different formats:

| File | Description |
|------|-------------|
| `sample_crm_export.csv` | Generic CRM export with status & notes |
| `facebook_leads_export.csv` | Facebook Lead Ads format with campaign data |
| `real_estate_crm_export.csv` | Property CRM with possession times & agent emails |

## 📋 CRM Fields

| Field | Description |
|-------|-------------|
| `created_at` | Lead creation date |
| `name` | Lead name |
| `email` | Primary email |
| `country_code` | Phone country code |
| `mobile_without_country_code` | Mobile number |
| `company` | Company name |
| `city` | City |
| `state` | State |
| `country` | Country |
| `lead_owner` | Lead owner email |
| `crm_status` | Status: `GOOD_LEAD_FOLLOW_UP`, `DID_NOT_CONNECT`, `BAD_LEAD`, `SALE_DONE` |
| `crm_note` | Notes, remarks, extra contacts |
| `data_source` | Source: `leads_on_demand`, `meridian_tower`, `eden_park`, `varah_swamy`, `sarjapur_plots` |
| `possession_time` | Property possession timeline |
| `description` | Additional description |

## 🔧 Environment Variables

### Server (`server/.env`)

| Variable | Description | Default |
|----------|-------------|---------|
| `GEMINI_API_KEY` | Google Gemini API key | *required* |
| `PORT` | Server port | `3001` |
| `CLIENT_URL` | Frontend URL for CORS | `http://localhost:3000` |

### Client

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | `http://localhost:3001` |
