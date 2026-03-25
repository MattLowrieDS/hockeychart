'use client'

import { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import './PlayerSearch.css'

interface PlayerSearchProps {
  onSearch: (playerName: string) => void
}

function PlayerSearch({ onSearch }: PlayerSearchProps) {
  const [playerName, setPlayerName] = useState('')
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (playerName.length < 2) {
        setSuggestions([])
        return
      }

      setIsLoading(true)
      try {
        const response = await axios.get(`/api/players/suggest?q=${encodeURIComponent(playerName)}`)
        setSuggestions(response.data)
      } catch (err) {
        console.error('Error fetching suggestions:', err)
      } finally {
        setIsLoading(false)
      }
    }

    const timer = setTimeout(() => {
      if (showSuggestions) {
        fetchSuggestions()
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [playerName, showSuggestions])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (playerName.trim()) {
      onSearch(playerName)
      setShowSuggestions(false)
    }
  }

  const handleSuggestionClick = (name: string) => {
    setPlayerName(name)
    onSearch(name)
    setShowSuggestions(false)
  }

  return (
    <div className="player-search-container" ref={dropdownRef}>
      <form className="player-search" onSubmit={handleSubmit}>
        <div className="input-wrapper">
          <input
            type="text"
            placeholder="Search for a player (e.g., MacKinnon, Ovechkin)"
            value={playerName}
            onChange={(e) => {
              setPlayerName(e.target.value)
              setShowSuggestions(true)
            }}
            onFocus={() => setShowSuggestions(true)}
            className="search-input"
            autoComplete="off"
          />
          {isLoading && <div className="input-spinner"></div>}
        </div>
        <button type="submit" className="search-button">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        </button>
      </form>

      {showSuggestions && suggestions.length > 0 && (
        <ul className="suggestions-list">
          {suggestions.map((name) => (
            <li
              key={name}
              onClick={() => handleSuggestionClick(name)}
              className="suggestion-item"
            >
              {name}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default PlayerSearch
