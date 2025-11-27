import "./App.css";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/login";
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

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<UserLogin />} errorElement={<ErrorPage />} />
          <Route path="/home" element={<HomePage />} errorElement={<ErrorPage />} />
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

          <Route path="/change-password"
            element={<ChangePassword />}
            errorElement={<ErrorPage />}

          />
          <Route
            path="/ticket-confirm"
            element={<TicketConfirmed />}
            errorElement={<ErrorPage />}
          />
          <Route
            path="/admin/panel"
            element={<AdminPanel />}
            errorElement={<ErrorPage />}
          />
          <Route
            path="/admin/login"
            element={<Login />}
            errorElement={<ErrorPage />}
          />
          <Route
            path="/admin/register"
            element={<Register />}
            errorElement={<ErrorPage />}
          />
          <Route
            path="/login"
            element={<UserLogin />}
            errorElement={<ErrorPage />}
          />
          <Route
            path="/register"
            element={<UserRegister />}
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
    </div>
  );
}

export default App;
