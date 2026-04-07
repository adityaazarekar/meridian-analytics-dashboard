# Meridian Analytics Dashboard

A high-performance, premium financial analytics platform built with React, Vite, and Recharts. This dashboard provides a comprehensive view of global capital intelligence across various sectors and economies.

## 🚀 Key Features

- **Advanced Authentication**: Custom-built login/register system with session persistence.
- **Global Overview**: Real-time KPI tracking for capital gravity, revenue flow, and valuation indices.
- **Interactive Multi-Tab Intelligence**:
  - **Sector Intelligence**: Deep dive into sector-specific capital and revenue distribution.
  - **Country Analysis**: Economic data by nation with company-level granularity.
  - **Portfolio Builder**: Simulate asset allocation and track weighted performance.
  - **Peer Comparison**: Head-to-head metrics using radar and comparative charts.
  - **Risk & Correlation**: Anomaly detection and metric correlation matrices.
  - **Monte Carlo Simulation**: 200+ runs for value-at-risk (VaR) and return distribution.
  - **Technical Indicators**: RSI, MACD, and Bollinger Bands tracking.
- **Dynamic Data Processing**: Powered by `papaparse` for high-speed CSV ingestion.
- **Premium UI/UX**: Dark mode aesthetic with particle canvas backgrounds and micro-animations.

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite
- **Data Viz**: Recharts
- **Parsing**: PapaParse
- **Styling**: Vanilla CSS (Custom Meridian UI)

## 📦 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [npm](https://www.npmjs.com/)

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open your browser to `http://localhost:5173`.

## 📂 Project Structure

- `src/App.jsx`: Main dashboard logic and visualization components.
- `src/AuthWrapper.jsx`: Authentication state management.
- `src/Login.jsx`: User authentication interface.
- `public/companies.csv`: Core dataset for analytics.

## 🤝 Contributing

This project is currently on the `trial` branch for experimentation and final staging before merging into `main`.
