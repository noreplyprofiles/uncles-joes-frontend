import { useState, useEffect, useMemo } from 'react'

const API_URL = import.meta.env.VITE_API_URL || 'https://uncles-joes-api-697166575778.us-central1.run.app'
const PAGE_SIZE = 24

export default function Locations() {
  const [locations, setLocations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [stateFilter, setStateFilter] = useState('')
  const [cityFilter, setCityFilter] = useState('')
  const [openFilter, setOpenFilter] = useState('all')
  const [page, setPage] = useState(1)

  useEffect(() => {
    fetch(`${API_URL}/locations?limit=500`)
      .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json() })
      .then(data => setLocations(data))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  const states = useMemo(
    () => [...new Set(locations.map(l => l.state))].sort(),
    [locations]
  )

  const filtered = useMemo(() => {
    return locations.filter(l => {
      if (stateFilter && l.state !== stateFilter) return false
      if (cityFilter && !l.city.toLowerCase().includes(cityFilter.toLowerCase())) return false
      if (openFilter === 'open' && !l.open_for_business) return false
      if (openFilter === 'closed' && l.open_for_business) return false
      return true
    })
  }, [locations, stateFilter, cityFilter, openFilter])

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  function onFilterChange(setter) {
    return e => { setter(e.target.value); setPage(1) }
  }

  if (loading) return <div className="loading">Loading locations…</div>
  if (error) return <div className="error">Failed to load locations: {error}</div>

  return (
    <div className="page">
      <div className="page-header">
        <h1>Find a Store</h1>
        <p>
          {filtered.length} location{filtered.length !== 1 ? 's' : ''} found
          {locations.length !== filtered.length ? ` of ${locations.length}` : ''}
        </p>
      </div>

      <div className="filters">
        <select value={stateFilter} onChange={onFilterChange(setStateFilter)}>
          <option value="">All States</option>
          {states.map(s => <option key={s} value={s}>{s}</option>)}
        </select>

        <input
          type="text"
          placeholder="Search by city…"
          value={cityFilter}
          onChange={onFilterChange(setCityFilter)}
        />

        <div className="toggle-group">
          {[['all', 'All'], ['open', 'Open'], ['closed', 'Closed']].map(([val, label]) => (
            <button
              key={val}
              className={openFilter === val ? 'toggle active' : 'toggle'}
              onClick={() => { setOpenFilter(val); setPage(1) }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {paginated.length === 0 ? (
        <div className="empty">No locations match your filters.</div>
      ) : (
        <div className="cards-grid">
          {paginated.map(loc => (
            <div key={loc.id} className="card location-card">
              <div className="card-top">
                <h3>{loc.city}, {loc.state}</h3>
                <span className={`badge ${loc.open_for_business ? 'badge-open' : 'badge-closed'}`}>
                  {loc.open_for_business ? 'Open' : 'Closed'}
                </span>
              </div>
              <p className="address">{loc.address_one}</p>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="pagination">
          <button disabled={page === 1} onClick={() => setPage(p => p - 1)}>← Prev</button>
          <span>Page {page} of {totalPages}</span>
          <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Next →</button>
        </div>
      )}
    </div>
  )
}
