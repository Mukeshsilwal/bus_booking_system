import { useContext, useState, useEffect, useMemo } from "react";
import BusDetail from "../components/busDetail";
import NavigationBar from "../components/Navbar";
import BusListContext from "../context/busdetails";

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

  // const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="bus-list-main">
      <NavigationBar />
      <div className="bus-list-container">
        <aside className="bus-filters p-4 rounded-lg bg-white shadow-sm">
          <h3 className="text-lg font-semibold mb-3">Filters</h3>

          <div className="filter-item mb-3">
            <label className="block text-sm text-gray-700">Max Price</label>
            <input
              type="number"
              name="maxPrice"
              min={0}
              placeholder="e.g. 500"
              value={filters.maxPrice}
              onChange={handleFilterChange}
              className="mt-1 p-2 border rounded w-full"
            />
          </div>

          <div className="filter-item mb-3">
            <label className="block text-sm text-gray-700">Bus Type</label>
            <select
              name="busType"
              value={filters.busType}
              onChange={handleFilterChange}
              className="mt-1 p-2 border rounded w-full"
            >
              <option value="">All</option>
              <option value="Deluxe">Deluxe</option>
              <option value="Luxury">Luxury</option>
              <option value="Standard">Standard</option>
            </select>
          </div>

          <div className="flex gap-2">
            <button
              className="px-3 py-2 bg-indigo-600 text-white rounded"
              onClick={() => setFilters({ maxPrice: "", busType: "" })}
            >
              Clear
            </button>
            <div className="ml-auto text-sm text-gray-600 pt-2">{filteredBuses.length} results</div>
          </div>
        </aside>

        <div className="bus-details">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Bus List</h2>
            <div className="text-sm text-gray-600">Showing {currentBuses.length} of {filteredBuses.length}</div>
          </div>

          <div className={`bus-list-pagination my-4 flex items-center gap-2`}> 
            <button className="pagination-btn px-3 py-1 bg-gray-200 rounded disabled:opacity-60" onClick={handlePreviousPage} disabled={currentPage === 1}>
              Previous
            </button>
            <div className="flex gap-1 items-center">
              {Array.from({ length: Math.max(1, Math.ceil(filteredBuses.length / itemsPerPage)) }).map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentPage(idx + 1)}
                  className={`px-2 py-1 rounded ${currentPage === idx + 1 ? 'bg-indigo-600 text-white' : 'bg-gray-100'}`}
                >
                  {idx + 1}
                </button>
              ))}
            </div>
            <button className="pagination-btn px-3 py-1 bg-gray-200 rounded disabled:opacity-60 ml-auto" onClick={handleNextPage} disabled={currentPage >= Math.ceil(filteredBuses.length / itemsPerPage) || filteredBuses.length === 0}>
              Next
            </button>
          </div>

          <div className={`bus-detail-header hidden md:flex text-sm font-medium text-gray-600 mb-2`}> 
            <p className="bus-name w-1/3">Travels</p>
            <p className="bus-type w-1/6">Bus Type</p>
            <p className="bus-departure-time w-1/6">Departure</p>
            <p className="bus-price w-1/6">Starting Fare</p>
            <div className="w-1/6"></div>
          </div>

          {filteredBuses.length === 0 ? (
            <div className="p-6 text-center text-gray-600">No buses match your filters.</div>
          ) : (
            <ul>
              {currentBuses.map((bus) => (
                <BusDetail bus={bus} key={bus.id || bus._id} />
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};
export default BusList;
