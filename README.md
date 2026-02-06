# Website Scanner - Privacy & Security Analysis Tool

A comprehensive web application for analyzing website privacy and security by detecting trackers, third-party scripts, cookies, and other privacy concerns. The project uses a modern tech stack with a React-based frontend and Django backend with Celery task queuing.

## 📋 Table of Contents

- [Project Overview](#project-overview)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [How It Works](#how-it-works)
- [Database Models](#database-models)
- [Contributing](#contributing)

## 🎯 Project Overview

Website Scanner is a full-stack application that analyzes websites for privacy and security issues. It performs automated scans to detect:

- **Trackers**: Third-party tracking scripts and pixels
- **Cookies**: First-party and third-party cookies with analysis
- **Third-Party Scripts**: External JavaScript libraries and services
- **HTTP Headers**: Security-related headers analysis
- **Privacy Score**: Calculated grade based on privacy factors

Users can register, add websites to scan, and view detailed reports with evidence of privacy concerns.

## 🏗️ Architecture

The application follows a client-server architecture with asynchronous task processing:

```
┌─────────────────────┐
│   Frontend (React)  │
│   Port: 5173        │
└──────────┬──────────┘
           │ HTTP/WebSocket
           ▼
┌─────────────────────────────────┐
│   Django REST API               │
│   Port: 8000                    │
│   - User Management             │
│   - Website CRUD                │
│   - Report Retrieval            │
└──────────┬──────────────────────┘
           │
      ┌────┴─────┐
      ▼          ▼
   ┌──────┐  ┌──────────┐
   │SQLite│  │   Celery │
   │ DB   │  │  Worker  │
   └──────┘  └─────┬────┘
                   │
                   ▼
            ┌──────────────┐
            │   Playwright │
            │   + BeautifulSoup
            │   (Web Scraper) │
            └──────────────┘
```

## 🛠️ Tech Stack

### Frontend

- **React** 19.2.0 - UI framework
- **Vite** 7.2.4 - Build tool and dev server
- **Tailwind CSS** 4.1.17 - Utility-first CSS framework
- **React Router** 7.9.6 - Client-side routing
- **Axios** 1.13.2 - HTTP client
- **GSAP** 3.13.0 - Animation library
- **React Icons** 5.5.0 - Icon components

### Backend

- **Django** 5.2.8 - Web framework
- **Django REST Framework** - API framework
- **Celery** - Asynchronous task queue
- **Redis** - Message broker and result backend
- **Playwright** - Browser automation for scanning
- **BeautifulSoup** - HTML parsing
- **SQLite** - Database (development)

## ✨ Features

### User Management

- User registration and authentication
- Session-based authentication
- User-specific website and report management

### Website Management

- Add websites to scan (CRUD operations)
- Track last scan timestamp
- Organize multiple websites per user

### Privacy Scanning

- Automated website scanning with Playwright
- Tracks detection:
  - Third-party tracking scripts and pixels
  - Cookie analysis (first-party vs third-party)
  - External script detection
- Security headers analysis
- Privacy scoring system (0-100)
- Grade assignment (A-F scale)
- Evidence collection for violations

### Report Generation

- Detailed scan reports with timestamps
- Historical report tracking
- Cookie and tracker statistics
- Third-party script listing
- HTTP headers analysis
- Privacy evidence documentation

### Async Processing

- Background scanning with Celery
- Non-blocking user experience
- Automatic retry on failure (max 3 retries)
- Redis-based task queue

## 📁 Project Structure

```
.
├── frontend/                          # React SPA
│   ├── src/
│   │   ├── main.jsx                  # Application entry point
│   │   ├── App.jsx                   # Root component
│   │   ├── api/
│   │   │   └── axiosClient.js        # Configured axios instance
│   │   ├── Components/
│   │   │   ├── About/                # About page
│   │   │   ├── History/              # Scan history page
│   │   │   ├── Home/                 # Landing page
│   │   │   ├── Login/                # Login page
│   │   │   ├── Logout/               # Logout handler
│   │   │   ├── Results/              # Scan results display
│   │   │   └── Scanner/              # Scanning interface
│   │   └── index.css                 # Global styles
│   ├── Components/                   # Reusable components
│   │   ├── CardNav/                  # Navigation cards
│   │   ├── DarkVeil/                 # Modal overlay
│   │   └── TextType/                 # Text animation
│   ├── vite.config.js                # Vite configuration
│   ├── eslint.config.js              # ESLint rules
│   └── package.json
│
└── privacy-dashboard/                 # Django project
    ├── core/                         # Project configuration
    │   ├── settings.py               # Django settings
    │   ├── urls.py                   # URL routing
    │   ├── wsgi.py                   # WSGI config
    │   ├── asgi.py                   # ASGI config
    │   └── celery.py                 # Celery configuration
    ├── scanner/                      # Main app
    │   ├── models.py                 # Data models (Website, Report)
    │   ├── views.py                  # API views and endpoints
    │   ├── serializers.py            # DRF serializers
    │   ├── scraper.py                # Web scraping logic
    │   ├── tasks.py                  # Celery tasks
    │   ├── admin.py                  # Django admin config
    │   ├── migrations/               # Database migrations
    │   └── tests.py                  # Unit tests
    ├── manage.py                     # Django CLI
    └── db.sqlite3                    # SQLite database (dev)
```

## 📦 Prerequisites

- **Python** 3.8+
- **Node.js** 18+
- **Redis** (for Celery broker)
- **Git** (for version control)
