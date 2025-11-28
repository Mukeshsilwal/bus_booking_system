import "./App.css";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AdminLogin from "./pages/AdminLogin";
import SuperAdminLogin from "./pages/SuperAdminLogin";
import ChangePassword from "./pages/ChangePassword";
import Register from "./pages/register";
import UserLogin from "./pages/UserLogin";
import UserRegister from "./pages/UserRegister";
import HomePage from "./pages/Homepage";
import BusList from "./pages/BusList";
import TicketDetails from "./pages/ticketDetails";
import ErrorPage from "./pages/error-page";
import TicketConfirmed from "./pages/ticketconfirm";
import { AdminPanel } from "./pages/admin";
import PlaneList from "./pages/PlaneList";
import PlaneSeatSelection from "./pages/PlaneSeatSelection";
import PlaneTicketConfirm from "./pages/PlaneTicketConfirm";
import QfxMovies from "./pages/QfxMovies";
import QfxMovieDetails from "./pages/QfxMovieDetails";
import QfxSeatSelection from "./pages/QfxSeatSelection";
import QfxBookingConfirmation from "./pages/QfxBookingConfirmation";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { ROLES } from "./services/authService";
import ErrorBoundary from "./components/ErrorBoundary";

function App() {
  return (
    <div className="App">
      <ErrorBoundary>
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<UserLogin />} errorElement={<ErrorPage />} />
            <Route path="/home" element={<HomePage />} errorElement={<ErrorPage />} />

            {/* User Login Routes */}
            <Route path="/login" element={<UserLogin />} errorElement={<ErrorPage />} />
            <Route path="/register" element={<UserRegister />} errorElement={<ErrorPage />} />

            {/* Admin Login Routes */}
            <Route path="/admin/login" element={<AdminLogin />} errorElement={<ErrorPage />} />
            <Route path="/admin/register" element={<Register />} errorElement={<ErrorPage />} />

            {/* Super Admin Login Route */}
            <Route path="/super-admin/login" element={<SuperAdminLogin />} errorElement={<ErrorPage />} />

            {/* Booking Routes - Accessible to all authenticated users */}
            <Route
              path="/buslist"
              element={<BusList />}
              errorElement={<ErrorPage />}
            />
            <Route
              path="/ticket-details"
              element={<TicketDetails />}
              errorElement={<ErrorPage />}
            />
            <Route
              path="/ticket-confirm"
              element={<TicketConfirmed />}
              errorElement={<ErrorPage />}
            />

            {/* Plane Booking Routes */}
            <Route
              path="/plane-list"
              element={<PlaneList />}
              errorElement={<ErrorPage />}
            />
            <Route
              path="/plane-seats"
              element={<PlaneSeatSelection />}
              errorElement={<ErrorPage />}
            />
            <Route
              path="/plane-confirm"
              element={<PlaneTicketConfirm />}
              errorElement={<ErrorPage />}
            />

            {/* QFX Cinema Routes */}
            <Route
              path="/qfx/movies"
              element={<QfxMovies />}
              errorElement={<ErrorPage />}
            />
            <Route
              path="/qfx/movie/:id"
              element={<QfxMovieDetails />}
              errorElement={<ErrorPage />}
            />
            <Route
              path="/qfx/seats/:showtimeId"
              element={<QfxSeatSelection />}
              errorElement={<ErrorPage />}
            />
            <Route
              path="/qfx/confirmation"
              element={<QfxBookingConfirmation />}
              errorElement={<ErrorPage />}
            />

            {/* Protected Admin Routes - Requires ADMIN or SUPER_ADMIN role */}
            <Route
              path="/admin/panel"
              element={
                <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.SUPER_ADMIN]}>
                  <AdminPanel />
                </ProtectedRoute>
              }
              errorElement={<ErrorPage />}
            />

            {/* Utility Routes */}
            <Route
              path="/change-password"
              element={<ChangePassword />}
              errorElement={<ErrorPage />}
            />
          </Routes>
        </BrowserRouter>
        <ToastContainer
          position="bottom-left"
          autoClose={5000}
          hideProgressBar={true}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </ErrorBoundary>
    </div>
  );
}

export default App;
