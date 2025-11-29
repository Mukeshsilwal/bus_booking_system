import "./App.css";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";
import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ROLES } from "./services/authService";
import ErrorBoundary from "./components/ErrorBoundary";
import LoadingFallback from "./components/LoadingFallback";
import { ProtectedRoute } from "./components/ProtectedRoute";

// Lazy load components for code splitting
const AdminLogin = lazy(() => import("./pages/AdminLogin"));
const SuperAdminLogin = lazy(() => import("./pages/SuperAdminLogin"));
const ChangePassword = lazy(() => import("./pages/ChangePassword"));
const Register = lazy(() => import("./pages/register"));
const UserLogin = lazy(() => import("./pages/UserLogin"));
const UserRegister = lazy(() => import("./pages/UserRegister"));
const HomePage = lazy(() => import("./pages/Homepage"));
const BusList = lazy(() => import("./pages/BusList"));
const TicketDetails = lazy(() => import("./pages/ticketDetails"));
const ErrorPage = lazy(() => import("./pages/error-page"));
const TicketConfirmed = lazy(() => import("./pages/ticketconfirm"));
const AdminPanel = lazy(() => import("./pages/admin").then(module => ({ default: module.AdminPanel })));
const PlaneList = lazy(() => import("./pages/PlaneList"));
const PlaneSeatSelection = lazy(() => import("./pages/PlaneSeatSelection"));
const PlaneTicketConfirm = lazy(() => import("./pages/PlaneTicketConfirm"));
const QfxMovies = lazy(() => import("./pages/QfxMovies"));
const QfxMovieDetails = lazy(() => import("./pages/QfxMovieDetails"));
const QfxSeatSelection = lazy(() => import("./pages/QfxSeatSelection"));
const QfxBookingConfirmation = lazy(() => import("./pages/QfxBookingConfirmation"));

function App() {
  return (
    <div className="App">
      <ErrorBoundary>
        <BrowserRouter>
          <Suspense fallback={<LoadingFallback fullScreen message="Loading application..." />}>
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
          </Suspense>
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
