# ChecklistDiary – Personal Calendar Task Tracker (Frontend Only)

## Project Goal
Create a modern, lightweight, personal web application that visualizes daily task completion status in a **monthly calendar view**, using a **Google Apps Script JSON API** as the data source.

This is a **read-only frontend** project (no login, no heavy traffic, no backend logic inside frontend).

---

## Data Source (CRITICAL)
Use the following REST API endpoint as the only data source:

API_URL:
https://script.google.com/macros/s/AKfycbwLuhPOVkLIVW3iMSXC78MMeu-fyRyOccDEnR1gQyEKEac4h80yCMqjYFxxnBwzStOS/exec

API returns JSON in this format:
```json
[
  {
    "id": 1,
    "date": "2025-04-21",
    "status": 1,
    "note": "Work Started"
  }
]
