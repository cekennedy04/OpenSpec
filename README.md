# WorkSpaceRx

WorkSpaceRx is an AI-powered compliance tool designed for hospital environments. It uses Google Gemini 1.5 Flash to analyze workspace images for cleanliness violations and ergonomic risks, ensuring a safe and sanitary environment for healthcare professionals.

## 🚀 Features

- **AI Image Analysis**: Detects spills, open food, and unsanitary surfaces.
- **Ergonomic Assessment**: Evaluates monitor height, keyboard positioning, and seating posture.
- **Automated Reporting**: Generates structured compliance reports based on AI findings.
- **Privacy-First**: Temporary images are deleted immediately after analysis.

## 🛠️ Tech Stack

- **Frontend**: React, Vite, TypeScript
- **Backend**: Node.js, Express, Multer
- **AI**: Google Gemini AI (Generative Multimodal Models)

## 📋 Prerequisites

- Node.js (v18 or higher)
- A Google Gemini API Key ([Get one here](https://aistudio.google.com/app/apikey))

## ⚙️ Setup & Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/cekennedy04/OpenSpec.git
   cd workspacerx-app
   ```

2. **Configure Environment Variables**:
   Create a `.env` file in the `backend` directory:
   ```env
   GEMINI_API_KEY=your_actual_api_key_here
   PORT=3000
   FRONTEND_URL=http://localhost:5173
   ```

3. **Install Dependencies**:
   ```bash
   # Install backend dependencies
   cd backend
   npm install
   ```

4. **Run the Application**:
   ```bash
   # Start the backend
   npm start
   ```

## 🔒 License

This project is developed for the Shirley Ryan AbilityLab workspace initiative.