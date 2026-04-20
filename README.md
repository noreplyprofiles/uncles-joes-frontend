
# Uncle Joe’s Coffee Company – Frontend Application

## Overview
This repository contains the frontend application for Uncle Joe’s Coffee Company internal pilot system.

The frontend is a standalone web application deployed on **Google Cloud Run**. It communicates with the **FastAPI backend service** via REST API calls to retrieve and display data stored in BigQuery.

---

## System Architecture

This application follows a decoupled cloud architecture:

User → Frontend (Cloud Run) → Backend API (Cloud Run) → BigQuery

- Frontend: UI layer (Vue.js / JavaScript)
- Backend: FastAPI REST API
- BigQuery: Central data warehouse
- Cloud Run: Hosting for both services

---

## Tech Stack
- Vue.js (CDN-based, no build step)
- JavaScript (ES6)
- HTML/CSS
- REST API (Fetch)
- Google Cloud Run

---

## Features

### Public Access
- Menu browsing (items, categories, pricing, calories)
- Store locator (addresses, hours, amenities)

### Authenticated Access
- Coffee Club login
- Order history view (with item-level details)
- Loyalty points dashboard

---

## API Integration
The frontend consumes the FastAPI backend via REST endpoints.

Example:
```javascript
fetch(`${API_BASE_URL}/menu`)
  .then(res => res.json())
  .then(data => {
    console.log(data);
  });
```

## Deployment

The frontend is containerized and deployed independently to Google Cloud Run. It operates as a stateless client application that communicates exclusively with the backend API.

Notes:
This is a read-first system (no ordering/payment processing)
All data is sourced from the FastAPI backend connected to BigQuery
AI tools may have been used to assist development, but final implementation is fully reviewed and tested

Update README

Update (2.0)

