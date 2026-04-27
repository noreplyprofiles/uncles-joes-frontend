import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom'
import Locations from './pages/Locations'
import Menu from './pages/Menu'

export default function App() {
  return (
    <BrowserRouter>
      <header className="header">
        <div className="header-inner">
          <NavLink to="/" className="logo">
            <span className="logo-icon">☕</span>
            <span>Uncle Joe's Coffee</span>
          </NavLink>
          <nav>
            <NavLink
              to="/"
              end
              className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
            >
              Locations
            </NavLink>
            <NavLink
              to="/menu"
              className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
            >
              Menu
            </NavLink>
          </nav>
        </div>
      </header>
      <main>
        <Routes>
          <Route path="/" element={<Locations />} />
          <Route path="/menu" element={<Menu />} />
        </Routes>
      </main>
    </BrowserRouter>
  )
}
