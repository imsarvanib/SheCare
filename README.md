# 🌸 SheCare – An Integrated Women Health Web Application

## Overview

**SheCare** is a comprehensive women-centric healthcare and wellness platform designed to provide essential health management services through a single integrated web application. The platform focuses on improving women's physical, reproductive, and mental well-being by combining health tracking, awareness, reminders, assessments, and support services into a unified digital ecosystem.

The application addresses the challenge of fragmented healthcare management, where users often rely on multiple applications for menstrual tracking, pregnancy care, medication reminders, mental wellness, and health awareness. SheCare brings these services together through an intuitive and user-friendly interface.

---

## Problem Statement

Women frequently need to manage multiple aspects of their health, including menstrual cycles, pregnancy care, medication schedules, hormonal health, and mental well-being. Existing solutions often focus on only one aspect of healthcare, resulting in scattered health records and reduced accessibility.

SheCare aims to provide a centralized platform that enables users to monitor, manage, and improve their health through a single application.

---

## Key Features

### 🩸 Period Tracker

* Cycle logging and tracking
* Flow intensity monitoring
* Symptom tracking
* Pain level recording
* Period history management
* Next cycle prediction
* Health insights and trends

### 🤰 Pregnancy Care & Appointment Management

* Pregnancy milestone tracking
* Weekly pregnancy guidance
* Appointment scheduling
* Upcoming appointment reminders
* Maternal health support

### 💊 Medicine Reminder System

* Create medication schedules
* Set dosage and frequency
* Enable or disable reminders
* Edit and delete reminders
* Daily medication management

### 🧠 PCOS/PCOD Smart Checker

* Health assessment questionnaire
* BMI calculation
* Menstrual cycle analysis
* Symptom-based risk evaluation
* Lifestyle assessment
* Personalized recommendations
* Historical assessment records

### 😊 Mental Health Support

* Mood tracking
* Daily journaling
* Wellness reflections
* Motivational content
* Emotional well-being monitoring

### 🏥 Women Healthcare Scheme Finder

* Healthcare scheme discovery
* Eligibility-based filtering
* Awareness of government initiatives
* Support program information

### 👤 User Profile Management

* Personal information management
* Health preferences
* Theme customization
* Account settings

---

## Technology Stack

### Frontend

* React.js
* TypeScript
* Vite
* React Router
* Tailwind CSS
* Framer Motion
* Recharts

### Backend

* Node.js
* Express.js
* REST API Architecture

### Database

* MongoDB
* Mongoose ODM

### Authentication

* JWT-Based Authentication

### Deployment

* GitHub
* Netlify (Frontend)
* Render (Backend)
* MongoDB Atlas

---

## System Architecture

```text
User Interface (React)
          │
          ▼
      REST APIs
          │
          ▼
 Node.js + Express.js
          │
          ▼
       MongoDB
```

### Workflow

1. User interacts with the React frontend.
2. Frontend sends API requests to the Express backend.
3. Backend processes business logic through controllers.
4. Database operations are handled using Mongoose models.
5. Responses are returned as JSON data.
6. Frontend dynamically updates the user interface.

---

## Backend Structure

### Controllers

Business logic layer responsible for processing requests.

* authController.js
* trackerController.js
* medicineController.js
* pregnancyController.js
* profileController.js
* healthController.js

### Routes

API endpoint definitions.

* authRoutes.js
* trackerRoutes.js
* medicineRoutes.js
* pregnancyRoutes.js
* pcosAssessmentRoutes.js
* profileRoutes.js
* schemeRoutes.js
* journalRoutes.js
* savedQuoteRoutes.js

### Models

MongoDB schemas used to store application data.

Examples:

* User
* Period Logs
* Medicine Reminders
* PCOS Assessments
* Pregnancy Records
* Journal Entries

---

## PCOS/PCOD Smart Checker Logic

The PCOS/PCOD module uses a rule-based intelligent assessment system.

The assessment considers:

* Age
* BMI
* Menstrual regularity
* Cycle length
* Missed periods
* Hormonal symptoms
* Lifestyle factors
* Family medical history

Based on predefined medical indicators and weighted scoring, the system generates:

* Risk level assessment
* Health observations
* Personalized recommendations

**Note:** This module is intended for awareness and preliminary screening purposes only and is not a medical diagnostic tool.

---

## User Experience Features

* Responsive design
* Mobile-friendly interface
* Soft feminine healthcare-inspired UI
* Light and dark theme support
* Accessibility-focused layouts
* Smooth animations and transitions
* Reusable component architecture

---

## Installation

### Clone Repository

```bash
git clone <repository-url>
cd SheCare
```

### Install Dependencies

Frontend:

```bash
npm install
```

Backend:

```bash
cd backend
npm install
```

### Run Frontend

```bash
npm run dev
```

### Run Backend

```bash
npm start
```

---

## Future Enhancements

* AI-powered healthcare recommendations
* Wearable device integration
* Telemedicine support
* Doctor consultation booking
* Advanced analytics dashboard
* Health report generation
* Multi-language support
* Push notifications
* Emergency support features

---

## Project Objectives

* Promote women's healthcare awareness
* Simplify health management
* Encourage preventive healthcare practices
* Improve accessibility to healthcare resources
* Support physical, reproductive, and mental well-being
* Provide an integrated digital healthcare experience

---

## Disclaimer

SheCare is an educational healthcare support platform intended for awareness, tracking, and wellness assistance. It is not a substitute for professional medical diagnosis, treatment, or consultation.
