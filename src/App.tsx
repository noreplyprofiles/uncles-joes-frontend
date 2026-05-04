import { useState, useEffect, useMemo, FormEvent } from 'react';
import { 
  Coffee, 
  MapPin, 
  User, 
  LogIn, 
  LogOut, 
  Search, 
  Filter, 
  ChevronRight, 
  Wifi, 
  Truck, 
  Zap, 
  ArrowRight,
  Clock,
  Navigation,
  Menu as MenuIcon,
  X,
  CreditCard,
  History,
  Store
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// API CONSTANTS
const API_BASE = "https://uncles-joes-api-697166575778.us-central1.run.app";

// TYPES
type Page = 'home' | 'menu' | 'locations' | 'login' | 'dashboard';

interface MenuItem {
  id: number;
  name: string;
  category: string;
  size: string;
  calories: number;
  price: number;
}

interface Location {
  id: number;
  city: string;
  state: string;
  address_one: string;
  open_for_business: boolean;
  wifi: boolean;
  drive_thru: boolean;
  door_dash: boolean;
  [key: string]: any; // for hours
}

interface Member {
  member_id: number;
  name: string;
  email: string;
  phone_number: string;
  home_store: number;
  home_store_city: string;
  home_store_state: string;
  home_store_address: string;
}

interface Order {
  order_id: number;
  order_date: string;
  store_city: string;
  store_state: string;
  order_total: number;
  items: Array<{
    item_name: string;
    size: string;
    quantity: number;
    price: number;
  }>;
}

interface PointsHistory {
  order_id: number;
  order_date: string;
  order_total: number;
  points_earned: number;
}

// HELPERS
const formatHours = (time: number | string | null | undefined): string => {
  if (time === null || time === undefined) return "Closed";
  const num = typeof time === 'string' ? parseInt(time) : time;
  if (isNaN(num)) return "N/A";
  
  const hours = Math.floor(num / 100);
  const minutes = num % 100;
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  const displayMinutes = minutes.toString().padStart(2, '0');
  
  return `${displayHours}:${displayMinutes} ${ampm}`;
};

const formatPrice = (price: number) => `$${price.toFixed(2)}`;

const isCurrentlyOpen = (loc: Location): boolean => {
  if (!loc.open_for_business) return false;

  const now = new Date();
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const day = days[now.getDay()];
  const currentTime = now.getHours() * 100 + now.getMinutes();

  const openTime = loc[`hours_${day}_open`];
  const closeTime = loc[`hours_${day}_close`];

  if (openTime === null || closeTime === null || openTime === undefined || closeTime === undefined) return false;
  
  // Handle case where close time is 0000 or 0 representing midnight
  const effectiveCloseTime = closeTime === 0 ? 2400 : closeTime;
  
  return currentTime >= openTime && currentTime < effectiveCloseTime;
};

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [user, setUser] = useState<Member | null>(null);
  const [isNavOpen, setIsNavOpen] = useState(false);

  // AUTH STATE PERSISTENCE
  useEffect(() => {
    const storedUser = sessionStorage.getItem('uncle_joes_member');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLoginSuccess = (member: Member) => {
    setUser(member);
    sessionStorage.setItem('uncle_joes_member', JSON.stringify(member));
    setCurrentPage('dashboard');
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem('uncle_joes_member');
    setCurrentPage('home');
  };

  // UI COMPONENTS
  const Navbar = () => (
    <nav className="sticky top-0 z-50 glass shadow-sm px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div 
          className="flex items-center gap-2 cursor-pointer group"
          onClick={() => setCurrentPage('home')}
        >
          <div className="bg-coffee-dark p-2 rounded-lg group-hover:bg-coffee-medium transition-colors">
            <Coffee className="text-white w-6 h-6" />
          </div>
          <span className="serif text-xl font-bold tracking-tight text-coffee-dark">Uncle Joe's</span>
        </div>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8 font-medium">
          <button onClick={() => setCurrentPage('home')} className={`hover:text-coffee-light transition-colors ${currentPage === 'home' ? 'text-coffee-light' : ''}`}>Home</button>
          <button onClick={() => setCurrentPage('menu')} className={`hover:text-coffee-light transition-colors ${currentPage === 'menu' ? 'text-coffee-light' : ''}`}>Menu</button>
          <button onClick={() => setCurrentPage('locations')} className={`hover:text-coffee-light transition-colors ${currentPage === 'locations' ? 'text-coffee-light' : ''}`}>Locations</button>
          {user ? (
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setCurrentPage('dashboard')}
                className="flex items-center gap-2 bg-coffee-dark text-white px-5 py-2.5 rounded-full hover:bg-black transition-all shadow-md active:scale-95"
              >
                <User size={18} />
                {user.name.split(' ')[0]}
              </button>
              <button 
                onClick={logout}
                className="text-coffee-dark/40 hover:text-red-500 transition-colors p-1"
                title="Sign Out"
              >
                <LogOut size={20} />
              </button>
            </div>
          ) : (
            <button 
              onClick={() => setCurrentPage('login')}
              className="flex items-center gap-2 bg-coffee-dark text-white px-5 py-2.5 rounded-full hover:bg-black transition-all shadow-md active:scale-95"
            >
              <LogIn size={18} />
              Login
            </button>
          )}
        </div>

        {/* Mobile Toggle */}
        <button className="md:hidden p-2 text-coffee-dark" onClick={() => setIsNavOpen(!isNavOpen)}>
          {isNavOpen ? <X /> : <MenuIcon />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isNavOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden absolute top-full left-0 right-0 bg-white shadow-xl border-t p-6 flex flex-col gap-6 font-medium"
          >
            <button onClick={() => { setCurrentPage('home'); setIsNavOpen(false); }}>Home</button>
            <button onClick={() => { setCurrentPage('menu'); setIsNavOpen(false); }}>Menu</button>
            <button onClick={() => { setCurrentPage('locations'); setIsNavOpen(false); }}>Locations</button>
            {user ? (
              <div className="flex flex-col gap-4">
                <button 
                  onClick={() => { setCurrentPage('dashboard'); setIsNavOpen(false); }}
                  className="flex items-center justify-center gap-2 bg-coffee-dark text-white py-3 rounded-xl w-full"
                >
                  <User size={18} /> {user.name}
                </button>
                <button 
                  onClick={() => { logout(); setIsNavOpen(false); }}
                  className="flex items-center justify-center gap-2 bg-red-50 text-red-600 py-3 rounded-xl border border-red-100 w-full"
                >
                  <LogOut size={18} /> Sign Out
                </button>
              </div>
            ) : (
              <button 
                onClick={() => { setCurrentPage('login'); setIsNavOpen(false); }}
                className="flex items-center justify-center gap-2 bg-coffee-dark text-white py-3 rounded-xl"
              >
                <LogIn size={18} /> Login
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );

  return (
    <div className="min-h-screen flex flex-col selection:bg-coffee-light/20">
      <Navbar />
      
      <main className="flex-grow">
        <AnimatePresence mode="wait">
          {currentPage === 'home' && <HomePage onNavigate={setCurrentPage} />}
          {currentPage === 'menu' && <MenuPage />}
          {currentPage === 'locations' && <LocationsPage />}
          {currentPage === 'login' && <LoginPage onLoginSuccess={handleLoginSuccess} />}
          {currentPage === 'dashboard' && user && <DashboardPage user={user} onLogout={logout} onNavigate={setCurrentPage} />}
        </AnimatePresence>
      </main>

      <footer className="bg-coffee-dark text-parchment/60 py-12 px-6 mt-20">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Coffee className="text-white w-5 h-5" />
              <span className="serif text-white text-lg font-bold">Uncle Joe's</span>
            </div>
            <p className="text-sm max-w-xs">Crafting exceptional moments through artisanal roasting and community. Since 1994.</p>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-white font-bold mb-2">Explore</span>
            <button onClick={() => setCurrentPage('menu')} className="text-left hover:text-white transition-colors">Digital Menu</button>
            <button onClick={() => setCurrentPage('locations')} className="text-left hover:text-white transition-colors">Store Locator</button>
            <button onClick={() => setCurrentPage('login')} className="text-left hover:text-white transition-colors">Member Rewards</button>
          </div>
          <div>
            <span className="text-white font-bold mb-2">Connect</span>
            <p className="text-sm">Follow us for weekly roasts and store updates.</p>
            <div className="flex gap-4 mt-4">
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center cursor-pointer hover:bg-white/20">f</div>
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center cursor-pointer hover:bg-white/20">i</div>
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center cursor-pointer hover:bg-white/20">t</div>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto border-t border-white/5 mt-12 pt-8 text-center text-xs">
          &copy; 2026 Uncle Joe's Coffee Company. All rights reserved. Built with love for coffee lovers.
        </div>
      </footer>
    </div>
  );
}

// --- PAGE COMPONENTS ---

function HomePage({ onNavigate }: { onNavigate: (p: Page) => void }) {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col"
    >
      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex items-center px-6 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&q=80&w=2070')] bg-cover bg-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" />
        </div>
        
        <div className="relative max-w-7xl mx-auto w-full py-20 pb-32">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="max-w-3xl text-white"
          >
            <span className="uppercase tracking-[0.3em] text-xs md:text-sm font-bold opacity-80 mb-6 block">Premium Roasting Since 1994</span>
            <h1 className="serif text-5xl md:text-7xl lg:text-8xl font-bold leading-[1.1] mb-8">
              Brewing <br />
              <span className="italic text-coffee-light">Excellence</span> <br />
              One Cup at a Time.
            </h1>
            <p className="text-base md:text-xl opacity-90 mb-10 leading-relaxed font-light max-w-xl">
              Experience the rich, bold flavors of Uncle Joe's artisanal blends. From ethical beans to expert baristas, we bring the farm to your cup.
            </p>
            <div className="flex flex-wrap gap-4">
              <button 
                onClick={() => onNavigate('menu')}
                className="bg-white text-coffee-dark px-8 py-4 md:px-10 md:py-5 rounded-full font-bold flex items-center gap-2 hover:bg-coffee-light hover:text-white transition-all shadow-xl hover:-translate-y-1 active:translate-y-0"
              >
                View Menu <ChevronRight size={20} />
              </button>
              <button 
                onClick={() => onNavigate('login')}
                className="bg-transparent border-2 border-white/30 text-white px-8 py-4 md:px-10 md:py-5 rounded-full font-bold flex items-center gap-2 hover:bg-white/10 transition-all backdrop-blur-sm"
              >
                Coffee Club <Zap size={20} className="text-yellow-400" />
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Quick Access */}
      <section className="max-w-7xl mx-auto w-full px-6 -mt-16 md:-mt-24 relative z-20 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card 
            title="Fresh Roasts" 
            desc="Explore our seasonal menu featuring organic blends and unique brewing styles." 
            icon={<Coffee className="w-8 h-8 text-coffee-light" />} 
            onClick={() => onNavigate('menu')}
          />
          <Card 
            title="Visit Us" 
            desc="Find our cozy locations across the country and experience the Joe's vibe." 
            icon={<MapPin className="w-8 h-8 text-coffee-light" />} 
            onClick={() => onNavigate('locations')}
          />
          <Card 
            title="Member Perks" 
            desc="Join our Coffee Club to earn points on every purchase and unlock rewards." 
            icon={<CreditCard className="w-8 h-8 text-coffee-light" />} 
            onClick={() => onNavigate('login')}
          />
        </div>
      </section>
    </motion.div>
  );
}

function Card({ title, desc, icon, onClick }: { title: string, desc: string, icon: any, onClick: () => void }) {
  return (
    <motion.div 
      whileHover={{ y: -10 }}
      onClick={onClick}
      className="bg-white p-10 rounded-3xl shadow-xl shadow-coffee-dark/5 border border-parchment cursor-pointer group"
    >
      <div className="mb-6 p-4 bg-cream rounded-2xl w-fit group-hover:bg-coffee-light/10 transition-colors">
        {icon}
      </div>
      <h3 className="serif text-2xl font-bold mb-3">{title}</h3>
      <p className="text-coffee-dark/60 leading-relaxed mb-6">{desc}</p>
      <div className="flex items-center gap-2 text-coffee-light font-bold">
        Learn More <ArrowRight size={18} className="translate-x-0 group-hover:translate-x-2 transition-transform" />
      </div>
    </motion.div>
  );
}

function MenuPage() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  useEffect(() => {
    fetch(`${API_BASE}/menu`)
      .then(res => res.json())
      .then(data => {
        setItems(data);
        setLoading(false);
      })
      .catch(err => {
        setError("Could not load menu. Please try again later.");
        setLoading(false);
      });
  }, []);

  const categories = useMemo(() => ["All", ...new Set(items.map(i => i.category))], [items]);

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === "All" || item.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const groupedItems = useMemo(() => {
    const groups: Record<string, MenuItem[]> = {};
    filteredItems.forEach(item => {
      if (!groups[item.name]) groups[item.name] = [];
      groups[item.name].push(item);
    });
    return Object.values(groups).map(group => 
      group.sort((a, b) => a.price - b.price)
    );
  }, [filteredItems]);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-7xl mx-auto px-6 py-12"
    >
      <header className="mb-12 text-center">
        <h2 className="serif text-5xl font-bold mb-4">Our Digital Menu</h2>
        <p className="text-coffee-dark/60 max-w-xl mx-auto">From robust espressos to smooth signature lattes, find your perfect brew below.</p>
      </header>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-6 mb-12 items-center justify-between glass p-6 rounded-3xl border-parchment">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-coffee-light w-5 h-5" />
          <input 
            type="text" 
            placeholder="Search menu items..."
            className="w-full bg-white pl-12 pr-4 py-3 rounded-2xl border-none ring-1 ring-parchment focus:ring-2 focus:ring-coffee-light outline-none shadow-sm transition-all text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <div className="flex overflow-x-auto gap-2 w-full md:w-auto pb-2 md:pb-0 no-scrollbar">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-6 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all ${
                activeCategory === cat 
                ? 'bg-coffee-dark text-white shadow-lg' 
                : 'bg-white hover:bg-parchment text-coffee-dark/70'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {groupedItems.map(group => {
          const mainItem = group[0];
          return (
            <motion.div 
              layout
              key={mainItem.name}
              className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-parchment group h-full flex flex-col"
            >
              <div className="p-8 flex flex-col h-full">
                <div className="mb-6">
                  <span className="text-[10px] uppercase tracking-widest font-bold text-coffee-light mb-1 block">{mainItem.category}</span>
                  <h3 className="serif text-2xl font-bold group-hover:text-coffee-medium transition-colors">{mainItem.name}</h3>
                </div>
                
                <div className="space-y-3 mt-auto">
                  {group.map(variant => (
                    <div key={variant.id} className="flex justify-between items-center bg-cream/30 p-4 rounded-2xl hover:bg-cream/50 transition-colors">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-coffee-dark">
                          <Navigation size={12} className="text-coffee-light" />
                          {variant.size}
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] font-medium text-coffee-dark/40">
                          <Zap size={10} className="text-orange-400" />
                          {variant.calories} kCal
                        </div>
                      </div>
                      <div className="bg-white px-3 py-1.5 rounded-lg text-sm font-black text-coffee-dark shadow-sm">
                        {formatPrice(variant.price)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-parchment">
          <p className="text-coffee-dark/40 font-medium">No items matched your search. Try another keyword!</p>
        </div>
      )}
    </motion.div>
  );
}

function LocationsPage() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | "Open" | "Closed">("All");

  useEffect(() => {
    fetch(`${API_BASE}/locations?limit=500`)
      .then(res => res.json())
      .then(data => {
        setLocations(data);
        setLoading(false);
      })
      .catch(err => {
        setError("Failed to fetch locations. Please check back later.");
        setLoading(false);
      });
  }, []);

  const isComingSoon = (loc: Location) => {
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    return days.every(day => loc[`hours_${day}_open`] === null || loc[`hours_${day}_open`] === undefined);
  };

  const filtered = locations.filter(l => {
    const matchesSearch = l.city.toLowerCase().includes(activeSearch.toLowerCase()) || 
                          l.state.toLowerCase().includes(activeSearch.toLowerCase()) ||
                          l.address_one.toLowerCase().includes(activeSearch.toLowerCase());
    
    if (statusFilter === "All") return matchesSearch;
    if (statusFilter === "Open") return matchesSearch && isCurrentlyOpen(l);
    if (statusFilter === "Closed") return matchesSearch && !isCurrentlyOpen(l);
    return matchesSearch;
  });

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-7xl mx-auto px-6 py-12"
    >
      <header className="flex flex-col mb-12 gap-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h2 className="serif text-5xl font-bold mb-4">Find Us</h2>
            <p className="text-coffee-dark/60 max-w-sm">From coast to coast, find your nearest Uncle Joe's and settle in.</p>
          </div>
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-coffee-light w-5 h-5" />
            <input 
              type="text" 
              placeholder="Search by city, state, or address..."
              className="w-full bg-white pl-12 pr-4 py-4 rounded-2xl border-none ring-1 ring-parchment focus:ring-2 focus:ring-coffee-light outline-none shadow-sm transition-all"
              value={activeSearch}
              onChange={(e) => setActiveSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          {(["All", "Open", "Closed"] as const).map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-6 py-2 rounded-full text-xs font-bold transition-all ${
                statusFilter === status 
                ? 'bg-coffee-dark text-white shadow-md' 
                : 'bg-white text-coffee-dark/60 border border-parchment hover:bg-parchment'
              }`}
            >
              {status === "All" ? "All Locations" : status === "Open" ? "Open Now" : "Currently Closed"}
            </button>
          ))}
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
        {filtered.map(loc => {
          const comingSoon = isComingSoon(loc);
          const openNow = isCurrentlyOpen(loc);
          
          return (
            <motion.div 
              key={loc.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-[2rem] overflow-hidden shadow-sm hover:shadow-xl transition-all border border-parchment flex flex-col md:flex-row"
            >
              <div className="md:w-1/3 bg-coffee-dark/5 flex items-center justify-center p-8 border-b md:border-b-0 md:border-r border-parchment">
                <Store className="w-12 h-12 text-coffee-light opacity-50" />
              </div>
              <div className="p-8 flex-grow">
                <div className="flex items-center gap-2 mb-4">
                  <div className={`w-2.5 h-2.5 rounded-full ${comingSoon ? 'bg-amber-400' : openNow ? 'bg-green-500 animate-pulse' : 'bg-red-400'}`} />
                  <span className="text-[10px] uppercase tracking-widest font-black text-coffee-dark opacity-40">
                    {comingSoon ? 'Coming Soon' : openNow ? 'Currently Open' : 'Closed'}
                  </span>
                </div>
                <h3 className="serif text-3xl font-bold mb-2">{loc.city}, {loc.state}</h3>
                <p className="text-coffee-dark/60 mb-6 flex items-center gap-2">
                  <MapPin size={16} className="text-coffee-light" />
                  {loc.address_one}
                </p>

                {!comingSoon ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 mb-8 text-sm">
                    <HoursInfo day="Monday" open={loc.hours_monday_open} close={loc.hours_monday_close} />
                    <HoursInfo day="Tuesday" open={loc.hours_tuesday_open} close={loc.hours_tuesday_close} />
                    <HoursInfo day="Wednesday" open={loc.hours_wednesday_open} close={loc.hours_wednesday_close} />
                    <HoursInfo day="Thursday" open={loc.hours_thursday_open} close={loc.hours_thursday_close} />
                    <HoursInfo day="Friday" open={loc.hours_friday_open} close={loc.hours_friday_close} />
                    <HoursInfo day="Weekend" open={loc.hours_saturday_open} close={loc.hours_sunday_close} />
                  </div>
                ) : (
                  <div className="bg-cream/50 rounded-2xl p-6 text-center mb-8 border border-dashed border-parchment">
                    <p className="text-sm font-bold text-coffee-dark/40 italic">Hours coming soon! We're putting the finishing touches on this location.</p>
                  </div>
                )}

                <div className="flex flex-wrap gap-2">
                  {loc.wifi && <Badge icon={<Wifi size={12} />} label="Wi-Fi" />}
                  {loc.drive_thru && <Badge icon={<Navigation size={12} />} label="Drive-Thru" />}
                  {loc.door_dash && <Badge icon={<Truck size={12} />} label="DoorDash" />}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
      
      {filtered.length === 0 && (
        <div className="text-center py-20 bg-white rounded-[2rem] border-2 border-dashed border-parchment">
          <p className="text-coffee-dark/40 font-medium">No locations match your current filters.</p>
        </div>
      )}
    </motion.div>
  );
}

function HoursInfo({ day, open, close }: { day: string, open: any, close: any }) {
  return (
    <div className="flex items-center gap-2">
      <span className="font-bold text-coffee-dark w-24">{day}:</span>
      <span className="text-coffee-dark/50">{formatHours(open)} - {formatHours(close)}</span>
    </div>
  );
}

function Badge({ icon, label }: { icon: any, label: string }) {
  return (
    <div className="flex items-center gap-1.5 bg-coffee-dark/5 px-3 py-1.5 rounded-full text-[10px] font-bold text-coffee-medium border border-coffee-medium/10">
      {icon} {label}
    </div>
  );
}

function LoginPage({ onLoginSuccess }: { onLoginSuccess: (m: Member) => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    fetch(`${API_BASE}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    })
    .then(res => res.json())
    .then(data => {
      if (data.authenticated) {
        onLoginSuccess(data);
      } else {
        setError("Invalid email or password. Please try again.");
      }
      setLoading(false);
    })
    .catch(() => {
      setError("Unable to connect to the server. Please try again.");
      setLoading(false);
    });
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-md mx-auto px-6 py-20"
    >
      <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl shadow-coffee-dark/10 border border-parchment relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 coffee-gradient" />
        
        <div className="text-center mb-10">
          <div className="inline-flex p-4 bg-cream rounded-full mb-6">
            <CreditCard className="w-8 h-8 text-coffee-light" />
          </div>
          <h2 className="serif text-4xl font-bold mb-2">Welcome Back</h2>
          <p className="text-coffee-dark/50 text-sm">Sign in to access your Coffee Club rewards.</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold uppercase tracking-widest text-coffee-dark/60 ml-1">Email Address</label>
            <input 
              type="email" 
              className="w-full bg-cream/30 px-5 py-4 rounded-2xl border-none ring-1 ring-parchment outline-none focus:ring-2 focus:ring-coffee-light transition-all"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold uppercase tracking-widest text-coffee-dark/60 ml-1">Password</label>
            <input 
              type="password" 
              className="w-full bg-cream/30 px-5 py-4 rounded-2xl border-none ring-1 ring-parchment outline-none focus:ring-2 focus:ring-coffee-light transition-all"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium border border-red-100"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <button 
            type="submit"
            disabled={loading}
            className="bg-coffee-dark text-white py-5 rounded-2xl font-bold shadow-xl hover:bg-black transition-all active:scale-[0.98] mt-4 disabled:opacity-50 disabled:pointer-events-none"
          >
            {loading ? "Authenticating..." : "Sign In to Coffee Club"}
          </button>
        </form>
      </div>
    </motion.div>
  );
}

function DashboardPage({ user, onLogout, onNavigate }: { user: Member, onLogout: () => void, onNavigate: (p: Page) => void }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [points, setPoints] = useState<number>(0);
  const [history, setHistory] = useState<PointsHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchAll = async () => {
      try {
        const [ordersRes, pointsRes, historyRes] = await Promise.all([
          fetch(`${API_BASE}/members/${user.member_id}/orders`),
          fetch(`${API_BASE}/members/${user.member_id}/points`),
          fetch(`${API_BASE}/members/${user.member_id}/points/history`)
        ]);
        
        const ordersData = await ordersRes.json();
        const pointsData = await pointsRes.json();
        const historyData = await historyRes.json();

        setOrders(ordersData);
        setPoints(pointsData.points_balance || 0);
        setHistory(historyData);
        setLoading(false);
      } catch (err) {
        console.error("Dashboard error", err);
        setLoading(false);
      }
    };

    fetchAll();
  }, [user]);

  if (!user) return <div className="p-20 text-center">Unauthorized.</div>;
  if (loading) return <LoadingState />;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-7xl mx-auto px-6 py-12"
    >
      <div className="flex flex-col md:flex-row gap-12">
        {/* Profile Sidebar */}
        <aside className="md:w-1/3 flex flex-col gap-6">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-parchment overflow-hidden relative">
            <div className="absolute top-0 right-0 p-8">
              <User className="w-20 h-20 text-coffee-light opacity-[0.03] absolute -top-4 -right-4" />
            </div>
            
            <div className="flex items-center gap-4 mb-8">
              <div className="w-16 h-16 rounded-2xl bg-coffee-dark flex items-center justify-center text-white text-2xl font-bold">
                {user.name.charAt(0)}
              </div>
              <div>
                <h2 className="serif text-2xl font-bold">{user.name}</h2>
                <p className="text-xs text-coffee-dark/40 font-bold uppercase tracking-widest">Premium Member</p>
              </div>
            </div>

            <div className="space-y-6">
              <ProfileItem icon={<User size={16} />} label="Email" val={user.email} />
              <ProfileItem icon={<User size={16} />} label="Phone" val={user.phone_number} />
              <div className="pt-6 border-t border-parchment">
                <span className="text-[10px] font-bold uppercase tracking-widest text-coffee-dark/40 block mb-3">Home Store</span>
                <div className="flex gap-3">
                  <div className="bg-cream p-3 rounded-xl">
                    <Store className="text-coffee-light" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">{user.home_store_city}</h4>
                    <p className="text-xs text-coffee-dark/50">{user.home_store_address}</p>
                  </div>
                </div>
              </div>
            </div>

            <button 
              onClick={onLogout}
              className="w-full mt-10 p-4 rounded-2xl border-2 border-parchment text-coffee-dark/60 font-bold text-sm hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-all flex items-center justify-center gap-2"
            >
              <LogOut size={16} /> Sign Out
            </button>
          </div>

          <div className="coffee-gradient p-10 rounded-[2.5rem] shadow-2xl shadow-coffee-dark/30 text-white overflow-hidden relative">
            <Zap className="absolute -bottom-4 -right-4 w-40 h-40 text-white opacity-[0.05] rotate-12" />
            <span className="text-xs font-bold uppercase tracking-[0.2em] opacity-60 mb-2 block">Rewards Balance</span>
            <div className="flex items-end gap-2 mb-6">
              <h3 className="text-6xl font-black leading-none">{points}</h3>
              <span className="serif italic text-2xl mb-1">pts</span>
            </div>
            <p className="text-sm opacity-70 leading-relaxed mb-6">You're only <span className="font-bold text-white">250 points</span> away from a Free Specialty Roast!</p>
            <button className="w-full bg-white text-coffee-dark py-3 rounded-xl font-bold text-xs shadow-xl active:scale-95 transition-transform">Redeem Rewards</button>
          </div>
        </aside>

        {/* Dynamic Content */}
        <div className="flex-grow flex flex-col gap-8">
          <div className="bg-white p-10 rounded-[2.5rem] shadow-xl border border-parchment">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-cream rounded-xl">
                  <History className="text-coffee-light" />
                </div>
                <h3 className="serif text-3xl font-bold">Order History</h3>
              </div>
              <span className="text-xs font-bold text-coffee-dark/40">{orders.length} total orders</span>
            </div>

            <div className="space-y-4">
              {orders.length > 0 ? orders.map(order => (
                <div key={order.order_id}>
                  <OrderCard order={order} />
                </div>
              )) : (
                <div className="text-center py-20 opacity-30 select-none">
                  <Coffee size={64} className="mx-auto mb-4" />
                  <p>No orders yet. Your next brew awaits!</p>
                </div>
              )}
            </div>
          </div>

          {history.length > 0 && (
            <div className="bg-white p-10 rounded-[2.5rem] shadow-xl border border-parchment">
              <h3 className="serif text-2xl font-bold mb-8">Points Breakdown</h3>
              <div className="space-y-4">
                {history.map(item => (
                  <div key={item.order_id} className="flex items-center justify-between py-4 border-b border-parchment last:border-0">
                    <div>
                      <h4 className="font-bold">Order #{item.order_id}</h4>
                      <p className="text-xs text-coffee-dark/40">{new Date(item.order_date).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-green-600 font-black text-lg">+{item.points_earned}</div>
                      <p className="text-[10px] uppercase font-bold text-coffee-dark/30">Earned</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function ProfileItem({ icon, label, val }: { icon: any, label: string, val: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="text-coffee-light/50">{icon}</div>
      <div>
        <span className="text-[10px] font-bold uppercase tracking-widest text-coffee-dark/30 block">{label}</span>
        <span className="text-sm font-medium">{val}</span>
      </div>
    </div>
  );
}

function OrderCard({ order }: { order: Order }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-cream/30 rounded-3xl border border-parchment overflow-hidden transition-all">
      <div 
        className="p-6 flex items-center justify-between cursor-pointer hover:bg-cream/50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex gap-4 items-center">
          <div className="bg-white p-3 rounded-2xl shadow-sm">
            <span className="text-xs font-black text-coffee-light">#{order.order_id}</span>
          </div>
          <div>
            <h4 className="font-bold text-sm">{order.store_city}, {order.store_state}</h4>
            <p className="text-xs text-coffee-dark/50">{new Date(order.order_date).toLocaleDateString()} at {new Date(order.order_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
          </div>
        </div>
        <div className="text-right flex items-center gap-6">
          <div>
            <p className="text-xs font-bold opacity-30 uppercase tracking-tighter">Total</p>
            <p className="font-black text-lg">{formatPrice(order.order_total)}</p>
          </div>
          <motion.div 
            animate={{ rotate: expanded ? 180 : 0 }}
            className="p-2 bg-white rounded-full shadow-sm"
          >
            <ChevronRight size={16} />
          </motion.div>
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div 
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            className="bg-white/50 border-t border-parchment"
          >
            <div className="p-6 space-y-4">
              <h5 className="text-[10px] font-black uppercase tracking-widest text-coffee-dark/40">Items</h5>
              {order.items.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-lg bg-cream flex items-center justify-center font-bold text-xs">{item.quantity}x</span>
                    <div>
                      <p className="font-bold">{item.item_name}</p>
                      <p className="text-[10px] opacity-40 font-bold uppercase">{item.size}</p>
                    </div>
                  </div>
                  <span className="font-medium">{formatPrice(item.price)}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// --- GLOBAL UI ---

function LoadingState() {
  return (
    <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
      <motion.div 
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
        className="text-coffee-light"
      >
        <Coffee size={48} />
      </motion.div>
      <p className="serif text-xl italic text-coffee-dark/40">Brewing your experience...</p>
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="max-w-md mx-auto my-20 p-10 bg-white rounded-3xl border border-red-100 text-center shadow-xl">
      <div className="bg-red-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
        <X className="text-red-500" />
      </div>
      <h3 className="serif text-2xl font-bold mb-2">Something went wrong</h3>
      <p className="text-coffee-dark/60 mb-8">{message}</p>
      <button 
        onClick={() => window.location.reload()}
        className="bg-coffee-dark text-white px-8 py-3 rounded-xl font-bold"
      >
        Try Again
      </button>
    </div>
  );
}
