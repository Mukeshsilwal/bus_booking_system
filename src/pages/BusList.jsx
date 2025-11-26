import { useContext, useState, useEffect, useMemo } from "react";
import BusDetail from "../components/busDetail";
import NavigationBar from "../components/Navbar";
import BusListContext from "../context/busdetails";
import Footer from "../components/Footer";

const BusList = () => {
  const { busList: buses = [] } = useContext(BusListContext);
  const [filters, setFilters] = useState({
    maxPrice: "",
    busType: "",
  });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: value,
    }));
  };

  const handleNextPage = () => {
    const totalPages = Math.ceil(filteredBuses.length / itemsPerPage) || 1;
    if (currentPage < totalPages) setCurrentPage((p) => p + 1);
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) setCurrentPage((p) => p - 1);
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

  const indexOfLastBus = currentPage * itemsPerPage;
  const indexOfFirstBus = indexOfLastBus - itemsPerPage;
  const currentBuses = filteredBuses.slice(indexOfFirstBus, indexOfLastBus);

  useEffect(() => {
    // Reset to first page when filters or list change
    setCurrentPage(1);
  }, [filters.busType, filters.maxPrice, filteredBuses.length]);

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
                Showing {currentBuses.length} of {filteredBuses.length} results
              </div>
            </div>

            {filteredBuses.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-slate-900 mb-2">No buses found</h3>
                <p className="text-slate-500">Try adjusting your filters to see more results.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {currentBuses.map((bus) => (
                  <BusDetail bus={bus} key={bus.id || bus._id} />
                ))}
              </div>
            )}

            {/* Pagination */}
            {filteredBuses.length > itemsPerPage && (
              <div className="mt-8 flex justify-center gap-2">
                <button
                  className="px-4 py-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  onClick={handlePreviousPage}
                  disabled={currentPage === 1}
                >
                  Previous
                </button>
                <div className="flex gap-2">
                  {Array.from({ length: Math.max(1, Math.ceil(filteredBuses.length / itemsPerPage)) }).map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentPage(idx + 1)}
                      className={`w-10 h-10 rounded-lg font-medium transition-colors ${currentPage === idx + 1
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                    >
                      {idx + 1}
                    </button>
                  ))}
                </div>
                <button
                  className="px-4 py-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  onClick={handleNextPage}
                  disabled={currentPage >= Math.ceil(filteredBuses.length / itemsPerPage)}
                >
                  Next
                </button>
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
