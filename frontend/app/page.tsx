'use client'

import { useState } from 'react'
import axios from 'axios'
import PlayerSearch from './components/PlayerSearch'
import PlayerRadarChart from './components/PlayerRadarChart'
import './page.css'

interface PlayerData {
  name: string
  position: string
  team: string
  nationality: string
  stats: {
    games_played: number
    icetime: number
    p_60: number
    p_60_rank: number
    p_60_rank_norm: number
    goals: number
    goals_rank: number
    goals_rank_norm: number
    assists: number
    assists_rank: number
    assists_rank_norm: number
    xg: number
    xg_rank: number
    xg_rank_norm: number
    corsi_for_pct: number
    corsi_rank: number
    corsi_rank_norm: number
    high_danger_shots: number
    hds_rank: number
    hds_rank_norm: number
  }
}

export default function Home() {
  const [playerData, setPlayerData] = useState<PlayerData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const searchPlayer = async (playerName: string) => {
    if (!playerName.trim()) return

    setLoading(true)
    setError(null)
    setPlayerData(null)

    try {
      const response = await axios.get(`/api/player/${encodeURIComponent(playerName)}`)
      setPlayerData(response.data)
    } catch (err: unknown) {
      const errorMessage = err instanceof Error && 'response' in err 
        ? (err as { response?: { data?: { detail?: string } } }).response?.data?.detail || 'Failed to fetch player stats'
        : 'Failed to fetch player stats'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Hockey Radar Charts</h1>
        <p>Search for a player to view their stats</p>
        <p className="note">Note: Data only contains forwards from the 2024 season</p>
      </header>

      <main className="app-main">
        <PlayerSearch onSearch={searchPlayer} />

        {loading && (
          <div className="loading">
            <div className="spinner"></div>
            <p>Loading player stats...</p>
          </div>
        )}

        {error && (
          <div className="error">
            <p>❌ {error}</p>
          </div>
        )}

        {playerData && (
          <PlayerRadarChart playerData={playerData} />
        )}
      </main>

      <footer className="app-footer">
        <p>Data provided by <a href="https://moneypuck.com/data.htm" target="_blank" rel="noopener noreferrer">moneypuck.com</a></p>
      </footer>
    </div>
  )
}
