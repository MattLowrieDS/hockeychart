# Hockey Radar Charts

Visualize hockey player performance with interactive radar charts. This application compares key player statistics using 5-on-5 data from the 2024 NHL season, sourced from MoneyPuck.com.

## Features

- **Player Search**: Search for NHL forwards and view their performance across multiple metrics.
- **Interactive Radar Chart**: Visualize statistics including:
  - **Points/60**: Offensive productivity per 60 minutes.
  - **Goals & Assists**: Raw scoring output.
  - **xG (Expected Goals)**: Shot quality and scoring potential.
  - **Corsi For %**: A proxy for puck possession and shot volume.
  - **High Danger Shots**: Ability to create high-quality scoring chances.
- **Normalized Percentile Ranking**: Each metric is ranked and normalized (0-100) relative to other forwards in the dataset (minimum 30 games played).

## Project Structure

```
hockeychart/
├── backend/          # FastAPI server
│   ├── main.py       # API entry point (Python + Polars)
│   └── data/         # Loaded from root data directory
├── frontend/         # Next.js application
│   ├── app/          # React components and styling
│   └── public/       # Static assets
└── data/             # CSV data and processing scripts
    ├── forwards_5on5_2024.csv  # Main dataset
    └── mp_forwards_5on5.py     # Data processing script
```

## Technologies Used

- **Backend**: [FastAPI](https://fastapi.tiangolo.com/), [Polars](https://pola.rs/) (High-performance data manipulation)
- **Frontend**: [Next.js](https://nextjs.org/), [Recharts](https://recharts.org/), [Tailwind CSS](https://tailwindcss.com/)
- **Data Source**: [MoneyPuck.com](https://moneypuck.com/data.php)

## Setup & Running

### 1. Backend

The backend requires Python 3.8+.

```bash
cd backend
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
python main.py
```

The API will be available at `http://localhost:8000`.

### 2. Frontend

The frontend requires Node.js 18+.

```bash
cd frontend
npm install
npm run dev
```

The application will be available at `http://localhost:3000`.

## Data Processing

The dataset is generated from MoneyPuck's raw "Skaters" CSV. To generate a fresh dataset:

```bash
python data/mp_forwards_5on5.py --input_filename raw_moneypuck_data.csv --output_filename data/forwards_5on5_2024.csv
```
