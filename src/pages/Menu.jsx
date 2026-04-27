import { useState, useEffect, useMemo } from 'react'

const API_URL = import.meta.env.VITE_API_URL || 'https://uncles-joes-api-697166575778.us-central1.run.app'
const CATEGORY_ORDER = ['Coffee', 'Espresso', 'Tea', 'Other']
const SIZE_LABELS = ['Small', 'Medium', 'Large']

export default function Menu() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeCategory, setActiveCategory] = useState(null)

  useEffect(() => {
    fetch(`${API_URL}/menu`)
      .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json() })
      .then(data => {
        setItems(data)
        const first = CATEGORY_ORDER.find(c => data.some(i => i.category === c))
        setActiveCategory(first || data[0]?.category || null)
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  const grouped = useMemo(() => {
    const result = {}
    items.forEach(item => {
      if (!result[item.category]) result[item.category] = {}
      if (!result[item.category][item.name]) result[item.category][item.name] = []
      result[item.category][item.name].push(item)
    })
    Object.values(result).forEach(byName =>
      Object.values(byName).forEach(variants =>
        variants.sort((a, b) => a.price - b.price)
      )
    )
    return result
  }, [items])

  const categories = CATEGORY_ORDER.filter(c => grouped[c])

  if (loading) return <div className="loading">Loading menu…</div>
  if (error) return <div className="error">Failed to load menu: {error}</div>

  const currentItems = activeCategory ? grouped[activeCategory] : {}

  return (
    <div className="page">
      <div className="page-header">
        <h1>Our Menu</h1>
        <p>Handcrafted drinks, made to order</p>
      </div>

      <div className="category-tabs">
        {categories.map(cat => (
          <button
            key={cat}
            className={activeCategory === cat ? 'tab active' : 'tab'}
            onClick={() => setActiveCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="menu-grid">
        {Object.entries(currentItems).map(([name, variants]) => (
          <div key={name} className="card menu-card">
            <h3 className="item-name">{name}</h3>
            <p className="item-category">{activeCategory}</p>
            <div className="size-list">
              {variants.map((v, i) => (
                <div key={v.id} className="size-row">
                  <span className="size-label">{SIZE_LABELS[i] ?? `Size ${i + 1}`}</span>
                  <span className="size-price">${v.price.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
