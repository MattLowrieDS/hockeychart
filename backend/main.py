import os
import polars as pl
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from typing import List

load_dotenv()

# Load hockey data
DATA_PATH = os.path.join(os.path.dirname(__file__), 'data', 'forwards_5on5_2024.csv')

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Load data on app startup and store in app state."""
    try:
        df = pl.read_csv(DATA_PATH)
        app.state.data = df
        print('Hockey data loaded successfully')
    except Exception as e:
        print(f'Error loading CSV: {e}')
        app.state.data = None
    yield

app = FastAPI(title='Hockey Stats API', lifespan=lifespan)

# CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=['http://localhost:3000', 'http://localhost:5173', 'http://localhost:5174'],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)

@app.get('/api/health')
async def health_check():
    return {'status': 'ok', 'sport': 'hockey'}

@app.get('/api/players/suggest')
async def suggest_players(q: str = Query(..., min_length=2)):
    """
    Suggest player names based on a partial query.
    """
    df = app.state.data
    if df is None:
        return []

    # Filter for names that contain the query string (case-insensitive)
    matches = df.filter(
        pl.col('name').str.to_lowercase().str.contains(q.lower())
    ).select('name').unique().head(10)

    return matches['name'].to_list()

@app.get('/api/player/{player_name}')
async def get_player_stats(player_name: str):
    """
    Fetch player stats from local hockey CSV.
    Returns stats suitable for radar chart visualization.
    """
    df = app.state.data
    if df is None:
        return get_mock_player_stats(player_name)

    # Search for player (exact match preferred since the name could come from the suggestion drop down)
    player_df = df.filter(pl.col('name') == player_name)

    # Fallback to case-insensitive contains if exact match fails
    if player_df.is_empty():
        player_df = df.filter(pl.col('name').str.to_lowercase().str.contains(player_name.lower()))

    if player_df.is_empty():
        raise HTTPException(status_code=404, detail='Player not found')

    # Only providing stats for even strength scenarios
    player = player_df.row(0, named=True)

    # Extract relevant stats for radar chart
    stats = {
        'name': player['name'],
        'position': player['position'],
        'team': player['team'],
        'stats': {
            'games_played': player.get('games_played', 0),
            'icetime': player.get('icetime', 0),
            'p_60': player.get('p/60', 0),
            'p_60_rank': player.get('p/60_rank', 0),
            'p_60_rank_norm': player.get('p/60_rank_norm', 0),
            'goals': player.get('goals', 0),
            'goals_rank': player.get('goals_rank', 0),
            'goals_rank_norm': player.get('goals_rank_norm', 0),
            'assists': player.get('assists', 0),
            'assists_rank': player.get('assists_rank', 0),
            'assists_rank_norm': player.get('assists_rank_norm', 0),
            'xg': player.get('xg', 0),
            'xg_rank': player.get('xg_rank', 0),
            'xg_rank_norm': player.get('xg_rank_norm', 0),
            'corsi_for_pct': player.get('corsi_for_pct', 0),
            'corsi_rank': player.get('corsi_rank', 0),
            'corsi_rank_norm': player.get('corsi_rank_norm', 0),
            'high_danger_shots': player.get('high_danger_shots', 0),
            'hds_rank': player.get('hds_rank', 0),
            'hds_rank_norm': player.get('hds_rank_norm', 0),
        }
    }
    return stats

def get_mock_player_stats(player_name: str) -> dict:
    """Return mock hockey data for development."""
    import random

    return {
        'name': player_name.title(),
        'position': 'Center',
        'player_type': 'Forward',
        'team': 'Sample Hockey Team',
        'nationality': 'Canada',
        'age': '1997-01-01',
        'stats': {
            'goals': random.randint(10, 40),
            'assists': random.randint(20, 60),
            'shots': random.randint(30, 80),
            'hits': random.randint(20, 70),
            'blocks': random.randint(10, 50),
            'takeaways': random.randint(15, 55),
            'P/60': random.random() * 100
        }
    }

if __name__ == '__main__':
    import uvicorn
    uvicorn.run(app, host='0.0.0.0', port=8000)
