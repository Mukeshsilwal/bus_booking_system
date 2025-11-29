import { useContext, useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import NavigationBar from "../components/Navbar";
import SelectedBusContext from "../context/selectedbus";
import API_CONFIG from "../config/api";
import ApiService from "../services/api.service";
import authService from "../services/authService";
import { toast } from "react-toastify";
import Footer from "../components/Footer";
import { SeatIcon } from "../components/SeatIcon";
import { validateBookingForm } from "../utils/validators";
import { LoadingSpinner } from "../components/LoadingFallback";
import Logger from "../utils/logger";
import "./SeatSelection.css";

export default function TicketDetails() {
  const { selectedBus } = useContext(SelectedBusContext);
  const navigate = useNavigate();
  const location = useLocation();

  const [selectedSeats, setSelectedSeats] = useState([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [contact, setContact] = useState("");
  const [totalCost, setTotalCost] = useState(0);
  const [isBooking, setIsBooking] = useState(false);
  const [formErrors, setFormErrors] = useState({});


  // -----------------------------------
  // CALCULATE TOTAL COST
  // -----------------------------------
  useEffect(() => {
    if (!selectedBus?.seats) return;

    const total = selectedSeats.reduce((sum, seatNum) => {
      const seat = selectedBus.seats.find((s) => s.seatNumber === seatNum);
      return sum + (seat ? Number(seat.price) : 0);
    }, 0);

    setTotalCost(total);
  }, [selectedSeats, selectedBus]);

  useEffect(() => {
    // reset selected seats if bus changed
    setSelectedSeats([]);
  }, [selectedBus?.id]);

  // -----------------------------------
  // GENERATE RANDOM TRANSACTION ID
  // -----------------------------------
  function generateRandomId() {
    return Array.from({ length: 10 }, () => Math.floor(Math.random() * 10)).join("");
  }
  const [provider, setProvider] = useState("esewa");

  // -----------------------------------
  // INITIATE PAYMENT (BACKEND → PROVIDER)
  // -----------------------------------
  async function handlePayment(tid, totalCost, user) {
    // For Khalti, use specific payload structure
    if (provider === 'khalti') {
      const khaltiPayload = {
        public_key: process.env.REACT_APP_KHALTI_PUBLIC_KEY || "",
        mobile: contact || "",
        transaction_pin: "",
        product_identity: tid,
        product_name: "Bus Ticket Booking",
        amount: totalCost * 100, // Khalti expects amount in paisa (1 NPR = 100 paisa)
        return_url: "https://busbookingsystem-mu.vercel.app/ticket-confirm",
        website_url: "https://busbookingsystem-mu.vercel.app"
      };

      console.log("Sending Khalti payload:", khaltiPayload);

      try {
        const response = await ApiService.post(
          `${API_CONFIG.ENDPOINTS.ESEWA_INITIATE}/${provider}`,
          khaltiPayload
        );

        const responseData = await response.json();
        console.log("Khalti backend response:", responseData);

        // Khalti returns a payment_url to redirect to
        const paymentUrl = responseData.payment_url || responseData.data?.payment_url || responseData.data?.pidx;

        if (paymentUrl) {
          console.log("Redirecting to Khalti:", paymentUrl);
          window.location.href = paymentUrl;
          return;
        } else {
          console.error("No payment URL in Khalti response:", responseData);
          toast.error("Khalti payment URL not received. Please check backend configuration.");
          setIsBooking(false);
          return;
        }
      } catch (error) {
        console.error("Khalti payment error:", error);
        toast.error("Failed to initiate Khalti payment: " + (error.message || "Unknown error"));
        setIsBooking(false);
        return;
      }
    }

    // For eSewa and IME Pay
    const payload = {
      customerId: user?.id ?? "USER-123",
      amount: totalCost,
      metadata: {
        productId: "BUS-TICKET-2025",
        tid: tid
      },
      successUrl: "https://busbookingsystem-mu.vercel.app/ticket-confirm",
      failureUrl: "https://busbookingsystem-mu.vercel.app/booking-failed",
      customerEmail: user.email,
      customerName: user.name
    };

    // -----------------------------
    // 1) CALL BACKEND TO INITIATE
    // -----------------------------
    const response = await ApiService.post(
      `${API_CONFIG.ENDPOINTS.ESEWA_INITIATE}/${provider}`,
      payload
    );

    // Parse the JSON response
    const responseData = await response.json();
    console.log(`${provider} backend response:`, responseData);

    // Expected backend response structure:
    // {
    //   "status": "INITIATED",
    //   "data": {
    //     "gatewayUrl": "...",
    //     "params": { ... }
    //   }
    // }
    let gatewayUrl = responseData.data?.gatewayUrl || responseData.gatewayUrl;
    let params = responseData.data?.params || responseData.params || responseData;

    // Fallback to hardcoded URLs if backend doesn't provide them
    if (!gatewayUrl) {
      if (provider === 'esewa') {
        gatewayUrl = 'https://rc-epay.esewa.com.np/api/epay/main/v2/form';
      } else if (provider === 'imepay') {
        gatewayUrl = 'https://payment.imepay.com.np:7979/WebCheckout/Checkout';
      }
    }

    console.log(`Using gateway URL for ${provider}:`, gatewayUrl);

    // -----------------------------
    // 2) REDIRECT USER TO PAYMENT GATEWAY
    // -----------------------------
    const form = document.createElement("form");
    form.method = "POST";
    form.action = gatewayUrl;   // <--- dynamic URL from backend or fallback

    Object.entries(params).forEach(([key, value]) => {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = key;
      input.value = value;
      form.appendChild(input);
    });

    document.body.appendChild(form);
    form.submit();
  }


  // -----------------------------------
  // BOOK TICKET MAIN FUNCTION
  // -----------------------------------
  async function bookTicket() {
    // Force Login Check
    const token = localStorage.getItem("token");
    if (!token) {
      toast.info("Please login to proceed with payment.");
      navigate("/login", { state: { from: location } });
      return;
    }

    // Get User Data
    const userData = authService.getUserData();
    const userId = userData?.id || 0;

    // Enhanced validation using validators utility
    const validation = validateBookingForm({
      name,
      email,
      contact,
      selectedSeats
    });

    if (!validation.valid) {
      setFormErrors(validation.errors);
      const firstError = Object.values(validation.errors)[0];
      toast.error(firstError);
      return;
    }

    // Clear form errors
    setFormErrors({});

    setIsBooking(true);
    const tid = generateRandomId();

    try {
      // Map selected seat numbers to seat IDs
      const seatIds = selectedSeats.map(seatNum => {
        const seat = selectedBus.seats.find(s => s.seatNumber === seatNum);
        return seat ? seat.id : null;
      }).filter(id => id !== null);

      if (seatIds.length !== selectedSeats.length) {
        throw new Error("Invalid seat selection");
      }

      // 1️⃣ Create booking with seats in one go
      // Use sanitized data from validation
      const payload = {
        bookingId: selectedBus.id || selectedBus._id,
        fullName: validation.sanitized.name,
        userId: Number(userId),
        email: validation.sanitized.email,
        seatIds: seatIds
      };

      const bookingRes = await ApiService.post(API_CONFIG.ENDPOINTS.CREATE_BOOKING, payload);

      if (!bookingRes.ok) {
        const err = await bookingRes.json().catch(() => ({}));
        throw new Error(err.message || "Failed to create booking");
      }

      const data = await bookingRes.json();
      // Assuming the response contains the created booking ID for reference
      const newBookingId = data.bookingId || data.booking_id || data.id || "";

      localStorage.setItem("bookingRes", JSON.stringify(data));
      localStorage.setItem("seatRes", JSON.stringify(data.tickets || [])); // Adjust based on actual response if needed
      localStorage.setItem("selectedSeats", JSON.stringify(selectedSeats));
      localStorage.setItem("email", email);

      // 2️⃣ Get eSewa signature
      const sigRes = await ApiService.get(
        `${API_CONFIG.ENDPOINTS.GENERATE_SIGNATURE}?total_cost=${totalCost}&transaction_uuid=${tid}`
      );

      if (!sigRes.ok) {
        const err = await sigRes.json().catch(() => ({}));
        throw new Error(err.message || "Failed to generate signature");
      }

      const signature = await sigRes.text();

      // 3️⃣ Submit to Payment Gateway (FIXED: correct parameters)
      await handlePayment(tid, totalCost, userData);

    } catch (err) {
      Logger.error("Booking Error:", err);

      // User-friendly error messages
      let errorMessage = "Booking failed. Please try again.";
      if (err.isTimeout) {
        errorMessage = "Request timeout. Please check your internet connection.";
      } else if (err.message) {
        errorMessage = err.message;
      }

      toast.error(errorMessage);
      setIsBooking(false);
    }
  }

  // -----------------------------------
  // SEAT AVAILABILITY LOGIC (FIXED)
  // -----------------------------------
  function isSeatReserved(seat) {
    return (
      seat.reserved === true ||
      seat.status === "BOOKED" ||
      seat.isBooked === true
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <NavigationBar />

      <main className="flex-grow pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <h1 className="text-3xl font-bold text-slate-900 mb-8">Complete Your Booking</h1>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Column: Passenger & Seats */}
          <div className="flex-1 space-y-8">
            {/* Passenger Details */}
            <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-xl font-semibold text-slate-900 mb-6 flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm">1</span>
                Passenger Details
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (formErrors.name) {
                        setFormErrors(prev => ({ ...prev, name: undefined }));
                      }
                    }}
                    className={`input-field ${formErrors.name ? 'border-red-500' : ''}`}
                    placeholder="John Doe"
                    required
                  />
                  {formErrors.name && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (formErrors.email) {
                        setFormErrors(prev => ({ ...prev, email: undefined }));
                      }
                    }}
                    className={`input-field ${formErrors.email ? 'border-red-500' : ''}`}
                    placeholder="john@example.com"
                    required
                  />
                  {formErrors.email && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.email}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Contact Number</label>
                  <input
                    type="tel"
                    value={contact}
                    onChange={(e) => {
                      setContact(e.target.value);
                      if (formErrors.contact) {
                        setFormErrors(prev => ({ ...prev, contact: undefined }));
                      }
                    }}
                    className={`input-field ${formErrors.contact ? 'border-red-500' : ''}`}
                    placeholder="+977 9800000000"
                    required
                  />
                  {formErrors.contact && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.contact}</p>
                  )}
                </div>
              </div>
            </section>

            {/* Seat Selection */}
            <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-xl font-semibold text-slate-900 mb-6 flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm">2</span>
                Select Seats
              </h2>

              <div className="flex flex-col items-center">
                <div className="seat-selection-div w-full max-w-md">
                  <div className="seat-selection grid grid-cols-4 gap-3 p-4 bg-slate-50 rounded-lg border border-slate-200">
                    {selectedBus?.seats?.map((seat) => {
                      const reserved = isSeatReserved(seat);
                      const isSelected = selectedSeats.includes(seat.seatNumber);

                      return (
                        <div key={seat.id} className="aspect-square flex items-center justify-center">
                          <SeatIcon
                            status={reserved ? 'booked' : isSelected ? 'selected' : 'available'}
                            seatNumber={seat.seatNumber}
                            price={seat.price}
                            className="w-12 h-12"
                            onClick={() => {
                              if (reserved || isBooking) return;
                              setSelectedSeats((prev) =>
                                prev.includes(seat.seatNumber)
                                  ? prev.filter((s) => s !== seat.seatNumber)
                                  : [...prev, seat.seatNumber]
                              );
                            }}
                          />
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex justify-center gap-6 mt-8 text-sm">
                    <div className="flex items-center gap-2">
                      <SeatIcon status="available" className="w-5 h-5" />
                      <span className="text-slate-600">Available</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <SeatIcon status="booked" className="w-5 h-5" />
                      <span className="text-slate-600">Booked</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <SeatIcon status="selected" className="w-5 h-5" />
                      <span className="text-slate-600">Selected</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Right Column: Summary */}
          <div className="lg:w-96 flex-shrink-0">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 sticky top-24">
              <h2 className="text-lg font-bold text-slate-900 mb-4">Booking Summary</h2>

              <div className="space-y-4 text-sm">
                <div className="pb-4 border-b border-slate-100">
                  <p className="text-slate-500 mb-1">Bus Operator</p>
                  <p className="font-medium text-slate-900">{selectedBus?.busName || 'Standard Bus'}</p>
                </div>

                <div className="pb-4 border-b border-slate-100">
                  <p className="text-slate-500 mb-1">Route</p>
                  <div className="flex items-center gap-2 font-medium text-slate-900">
                    <span>{selectedBus?.route12?.sourceBusStop?.name || 'Source'}</span>
                    <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                    <span>{selectedBus?.route12?.destinationBusStop?.name || 'Destination'}</span>
                  </div>
                </div>

                <div className="pb-4 border-b border-slate-100">
                  <p className="text-slate-500 mb-1">Departure</p>
                  <p className="font-medium text-slate-900">
                    {selectedBus?.departureDateTime ? new Date(selectedBus.departureDateTime).toLocaleString() : "TBD"}
                  </p>
                </div>

                <div className="pb-4 border-b border-slate-100">
                  <div className="flex justify-between mb-2">
                    <span className="text-slate-600">Selected Seats ({selectedSeats.length})</span>
                    <span className="font-medium text-slate-900">{selectedSeats.join(", ") || '-'}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold text-slate-900 mt-2">
                    <span>Total Amount</span>
                    <span className="text-indigo-600">NPR {totalCost}</span>
                  </div>
                </div>

                <div className="pb-4 border-b border-slate-100">
                  <p className="text-slate-500 mb-2">Payment Method</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setProvider('esewa')}
                      className={`flex-1 py-2 px-2 border rounded-md text-sm font-medium transition-colors ${provider === 'esewa' ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 text-gray-600 hover:border-green-300'}`}
                    >
                      eSewa
                    </button>
                    <button
                      onClick={() => setProvider('khalti')}
                      className={`flex-1 py-2 px-2 border rounded-md text-sm font-medium transition-colors ${provider === 'khalti' ? 'border-purple-500 bg-purple-50 text-purple-700' : 'border-gray-200 text-gray-600 hover:border-purple-300'}`}
                    >
                      Khalti
                    </button>
                    <button
                      onClick={() => setProvider('imepay')}
                      className={`flex-1 py-2 px-2 border rounded-md text-sm font-medium transition-colors ${provider === 'imepay' ? 'border-red-500 bg-red-50 text-red-700' : 'border-gray-200 text-gray-600 hover:border-red-300'}`}
                    >
                      IME Pay
                    </button>
                  </div>
                </div>

                <button
                  onClick={bookTicket}
                  disabled={isBooking || selectedSeats.length === 0}
                  className={`w-full btn-primary py-3 font-bold text-lg shadow-md hover:shadow-lg transform transition-all active:scale-95 ${isBooking || selectedSeats.length === 0 ? 'opacity-60 cursor-not-allowed' : ''}`}
                  style={{
                    backgroundColor: provider === 'khalti' ? '#5c2d91' : provider === 'imepay' ? '#ed1c24' : undefined,
                    borderColor: provider === 'khalti' ? '#5c2d91' : provider === 'imepay' ? '#ed1c24' : undefined
                  }}
                >
                  {isBooking ? (
                    <span className="flex items-center justify-center gap-2">
                      <LoadingSpinner size="small" />
                      Processing...
                    </span>
                  ) : (
                    `Pay with ${provider === 'esewa' ? 'eSewa' : provider === 'khalti' ? 'Khalti' : 'IME Pay'}`
                  )}
                </button>
                <p className="text-xs text-center text-slate-500 mt-4">
                  By clicking Pay, you agree to our Terms & Conditions
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
