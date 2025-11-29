import { useContext, useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useLocation } from "react-router-dom";
import BusDetail from "../components/busDetail";
import NavigationBar from "../components/Navbar";
import BusListContext from "../context/busdetails";
import Footer from "../components/Footer";
import { busService } from "../services/bus.service";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import Button from "../components/ui/Button";

const BusList = () => {
  const { setBusList } = useContext(BusListContext);
  const location = useLocation();

  // State for infinite scroll
  const [buses, setBuses] = useState([]);
  const [cursor, setCursor] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  // Search params from navigation or local storage
  const searchParams = useMemo(() => {
    if (location.state?.source && location.state?.destination && location.state?.date) {
      return {
        source: location.state.source,
        destination: location.state.destination,
        date: location.state.date
      };
    }

    // Fallback to local storage if available
    try {
      const stored = localStorage.getItem("searchDetails");
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error("Failed to parse stored search details", e);
    }

    return null;
  }, [location.state]);

  const [filters, setFilters] = useState({
    maxPrice: "",
    busType: "",
  });

  // Observer for infinite scroll
  const observer = useRef();
  const lastBusElementRef = useCallback(node => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        loadMoreBuses();
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, hasMore]);

  const loadMoreBuses = async (isInitial = false) => {
    if (loading || (!isInitial && !hasMore)) return;

    if (!searchParams) {
      setLoading(false);
      setInitialLoadComplete(true);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const currentCursor = isInitial ? null : cursor;
      const response = await busService.searchBuses({
        ...searchParams,
        cursor: currentCursor,
        pageSize: 10
      });

      setBuses(prev => {
        const newBuses = isInitial ? response.buses : [...prev, ...response.buses];
        // Update context for other components if needed
        setBusList(newBuses);
        return newBuses;
      });

      setCursor(response.nextCursor);
      setHasMore(response.hasMore);
    } catch (err) {
      setError(err.message || "Failed to load buses");
    } finally {
      setLoading(false);
      setInitialLoadComplete(true);
    }
  };

  // Initial load
  useEffect(() => {
    setBuses([]);
    setCursor(null);
    setHasMore(true);
    setInitialLoadComplete(false);
    loadMoreBuses(true);
  }, [searchParams]);

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: value,
    }));
  };

  const getStartingFare = (bus) => {
    if (!bus || !Array.isArray(bus.seats) || bus.seats.length === 0) return 0;
    return Math.min(...bus.seats.map((s) => Number(s.price) || 0));
  };

  const filteredBuses = useMemo(() => {
    return (buses || []).filter((bus) => {
      const fare = getStartingFare(bus);
      const maxPriceOk =
        filters.maxPrice === "" || fare <= Number(filters.maxPrice || 0);
      const typeOk = filters.busType === "" || bus.busType === filters.busType;
      return maxPriceOk && typeOk;
    });
  }, [buses, filters]);

  if (!initialLoadComplete && loading && buses.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <NavigationBar />
        <main className="flex-grow flex items-center justify-center">
          <LoadingSpinner size="lg" text="Finding the best buses for you..." />
        </main>
        <Footer />
      </div>
    );
  }

  if (error && buses.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <NavigationBar />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center p-8 bg-white rounded-xl shadow-sm border border-red-100 max-w-md">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Something went wrong</h3>
            <p className="text-slate-600 mb-6">{error}</p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <NavigationBar />

      <main className="flex-grow pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <aside className="w-full lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 sticky top-24">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-slate-900">Filters</h3>
                <button
                  className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                  onClick={() => setFilters({ maxPrice: "", busType: "" })}
                >
                  Reset
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Max Price</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">Rs.</span>
                    <input
                      type="number"
                      name="maxPrice"
                      min={0}
                      placeholder="e.g. 2000"
                      value={filters.maxPrice}
                      onChange={handleFilterChange}
                      className="input-field pl-10"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Bus Type</label>
                  <select
                    name="busType"
                    value={filters.busType}
                    onChange={handleFilterChange}
                    className="input-field"
                  >
                    <option value="">All Types</option>
                    <option value="Deluxe">Deluxe</option>
                    <option value="Luxury">Luxury</option>
                    <option value="Standard">Standard</option>
                  </select>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-slate-100">
                <p className="text-sm text-slate-500 text-center">
                  Found {filteredBuses.length} buses
                </p>
              </div>
            </div>
          </aside>

          {/* Bus List */}
          <div className="flex-1">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-slate-900">Available Buses</h2>
              <div className="text-sm text-slate-500">
                Showing {filteredBuses.length} results
              </div>
            </div>

            {filteredBuses.length === 0 && !loading ? (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-slate-900 mb-2">No buses found</h3>
                <p className="text-slate-500">Try adjusting your filters or search criteria.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredBuses.map((bus, index) => {
                  if (index === filteredBuses.length - 1) {
                    return (
                      <div ref={lastBusElementRef} key={bus.id || bus._id || index}>
                        <BusDetail bus={bus} />
                      </div>
                    );
                  } else {
                    return <BusDetail bus={bus} key={bus.id || bus._id || index} />;
                  }
                })}
              </div>
            )}

            {/* Loading more indicator */}
            {loading && buses.length > 0 && (
              <div className="py-8 flex justify-center">
                <LoadingSpinner size="md" />
              </div>
            )}

            {!hasMore && buses.length > 0 && (
              <div className="py-8 text-center text-slate-500 text-sm">
                You've reached the end of the list.
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};
export default BusList;
