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

interface PlayerRadarChartProps {
  playerData: {
    name: string
    position: string
    team: string
    nationality: string
    stats: Record<string, number>
  }
}

function PlayerRadarChart({ playerData }: PlayerRadarChartProps) {
  const { name, position, team, nationality, stats } = playerData

  // Stats for the grid display (raw values)
  const statsForGrid = [
    { label: 'P/60', value: stats.p_60, rank: stats.p_60_rank, format: 'decimal' },
    { label: 'Goals', value: stats.goals, rank: stats.goals_rank, format: 'integer' },
    { label: 'Assists', value: stats.assists, rank: stats.assists_rank, format: 'integer' },
    { label: 'xG', value: stats.xg, rank: stats.xg_rank, format: 'decimal' },
    { label: 'Corsi For %', value: stats.corsi_for_pct, rank: stats.corsi_rank, format: 'percent' },
    { label: 'High Danger Shots', value: stats.high_danger_shots, rank: stats.hds_rank, format: 'integer' },
  ]

  // Normalized rank values for radar chart (0-100 scale)
  const statsForChart = [
    { stat: 'P/60', value: stats.p_60_rank_norm ?? 0, fullMark: 100 },
    { stat: 'Goals', value: stats.goals_rank_norm ?? 0, fullMark: 100 },
    { stat: 'Assists', value: stats.assists_rank_norm ?? 0, fullMark: 100 },
    { stat: 'High Danger Shots', value: stats.hds_rank_norm ?? 0, fullMark: 100 },
    { stat: 'xG', value: stats.xg_rank_norm ?? 0, fullMark: 100 },
    { stat: 'CF%', value: stats.corsi_rank_norm ?? 0, fullMark: 100 },
  ]

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

  return (
    <div className="radar-chart-container">
      <div className="player-info">
        <h2>{name}</h2>
        <div className="player-details">
          <span className="position">Position: {position}</span>
          <span className="team">Team: {team}</span>
        </div>
      </div>

      <div className="radar-chart-wrapper">
        <ResponsiveContainer width="100%" height={450}>
          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={statsForChart}>
            <PolarGrid stroke="#3a7bd5" />
            <PolarAngleAxis
              dataKey="stat"
              tick={{ fill: '#3a7bd5', fontSize: 18 }}
            />
            <Radar
              name="League rank in even strength scenarios"
              dataKey="value"
              stroke="#00d2ff"
              fill="#00d2ff"
              fillOpacity={0.5}
            />
            <Legend
              verticalAlign="bottom"
              height={50}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      <div className="stats-grid">
        {statsForGrid.map((item) => (
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
}

export default PlayerRadarChart
