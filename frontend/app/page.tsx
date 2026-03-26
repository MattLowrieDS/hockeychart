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
  const [player1, setPlayer1] = useState<PlayerData | null>(null)
  const [player2, setPlayer2] = useState<PlayerData | null>(null)
  const [loading1, setLoading1] = useState(false)
  const [loading2, setLoading2] = useState(false)
  const [error1, setError1] = useState<string | null>(null)
  const [error2, setError2] = useState<string | null>(null)

  const searchPlayer1 = async (playerName: string) => {
    if (!playerName) {
      setPlayer1(null)
      setError1(null)
      return
    }
    setLoading1(true)
    setError1(null)
    try {
      const response = await axios.get(`/api/player/${encodeURIComponent(playerName)}`)
      setPlayer1(response.data)
    } catch (err: unknown) {
      setError1('Failed to fetch player stats')
    } finally {
      setLoading1(false)
    }
  }

  const searchPlayer2 = async (playerName: string) => {
    if (!playerName) {
      setPlayer2(null)
      setError2(null)
      return
    }
    setLoading2(true)
    setError2(null)
    try {
      const response = await axios.get(`/api/player/${encodeURIComponent(playerName)}`)
      setPlayer2(response.data)
    } catch (err: unknown) {
      setError2('Failed to fetch player stats')
    } finally {
      setLoading2(false)
    }
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Hockey Radar Charts</h1>
        <p>Compare two players to view their stats</p>
        <p className="note">Note: Data only contains forwards from the 2024 season</p>
      </header>

      <main className="app-main">
        <div className="search-section">
          <PlayerSearch onSearch={searchPlayer1} />
          {error1 && <div className="error"><p>❌ {error1}</p></div>}
          {loading1 && <div className="loading-small"><div className="spinner"></div></div>}
          
          <PlayerSearch 
            onSearch={searchPlayer2} 
            className="magenta" 
            placeholder="Choose another player for comparison"
          />
          {error2 && <div className="error"><p>❌ {error2}</p></div>}
          {loading2 && <div className="loading-small"><div className="spinner"></div></div>}
        </div>

        {(player1 || player2) && (
          <PlayerRadarChart player1={player1} player2={player2} />
        )}
      </main>

      <footer className="app-footer">
        <p>Data sourced from <a href="https://moneypuck.com/data.htm" target="_blank" rel="noopener">moneypuck.com</a></p>
      </footer>
    </div>
  )
}
