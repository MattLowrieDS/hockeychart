'use client'

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts'
import './PlayerRadarChart.css'

interface PlayerData {
  name: string
  position: string
  team: string
  nationality: string
  stats: Record<string, number>
}

interface PlayerRadarChartProps {
  player1: PlayerData | null
  player2: PlayerData | null
}

function PlayerRadarChart({ player1, player2 }: PlayerRadarChartProps) {
  const formatValue = (value: number, format: string) => {
    switch (format) {
      case 'decimal':
        return value.toFixed(2)
      case 'percent':
        return `${(value * 100).toFixed(1)}%`
      default:
        return value.toString()
    }
  }

  const getStatsForGrid = (player: PlayerData) => [
    { label: 'P/60', value: player.stats.p_60, rank: player.stats.p_60_rank, format: 'decimal' },
    { label: 'Goals', value: player.stats.goals, rank: player.stats.goals_rank, format: 'integer' },
    { label: 'Assists', value: player.stats.assists, rank: player.stats.assists_rank, format: 'integer' },
    { label: 'xG', value: player.stats.xg, rank: player.stats.xg_rank, format: 'decimal' },
    { label: 'Corsi For %', value: player.stats.corsi_for_pct, rank: player.stats.corsi_rank, format: 'percent' },
    { label: 'High Danger Shots', value: player.stats.high_danger_shots, rank: player.stats.hds_rank, format: 'integer' },
  ]

  const statsLabels = [
    { key: 'p_60_rank_norm', label: 'P/60' },
    { key: 'goals_rank_norm', label: 'Goals' },
    { key: 'assists_rank_norm', label: 'Assists' },
    { key: 'hds_rank_norm', label: 'HDS' },
    { key: 'xg_rank_norm', label: 'xG' },
    { key: 'corsi_rank_norm', label: 'CF%' },
  ]

  const statsForChart = statsLabels.map(stat => ({
    stat: stat.label,
    player1: player1?.stats[stat.key] ?? 0,
    player2: player2?.stats[stat.key] ?? 0,
  }))

  const PlayerStatsGrid = ({ player, colorClass }: { player: PlayerData, colorClass: string }) => (
    <div className={`player-stats-section ${colorClass}`}>
      <div className="player-info">
        <h2>{player.name}</h2>
        <div className="player-details">
          <span className="position">Position: {player.position}</span>
          <span className="team">Team: {player.team}</span>
        </div>
      </div>
      <div className="stats-grid">
        {getStatsForGrid(player).map((item) => (
          <div key={item.label} className="stat-item">
            <div className="stat-row">
              <span className="stat-label">{item.label}</span>
              <span className="stat-value">
                {formatValue(item.value, item.format)}
              </span>
            </div>
            <div className="stat-row">
              <span className="stat-label">Rank</span>
              <span className="stat-value">{item.rank}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  return (
    <div className="radar-chart-container">
      <div className="radar-chart-wrapper">
        <ResponsiveContainer width="100%" height={450}>
          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={statsForChart}>
            <PolarGrid stroke="#3a7bd5" />
            <PolarAngleAxis
              dataKey="stat"
              tick={{ fill: '#3a7bd5', fontSize: 18 }}
            />
            {player1 && (
              <Radar
                name={player1.name}
                dataKey="player1"
                stroke="#00d2ff"
                fill="#00d2ff"
                fillOpacity={0.4}
              />
            )}
            {player2 && (
              <Radar
                name={player2.name}
                dataKey="player2"
                stroke="#ff00ff"
                fill="#ff00ff"
                fillOpacity={0.4}
              />
            )}
            <Legend verticalAlign="bottom" height={50} />
            <Tooltip />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      <div className="players-grids-container">
        {player1 && <PlayerStatsGrid player={player1} colorClass="player1-stats" />}
        {player2 && <PlayerStatsGrid player={player2} colorClass="player2-stats" />}
      </div>
    </div>
  )
}

export default PlayerRadarChart
