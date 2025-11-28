import { useContext, useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import NavigationBar from "../components/Navbar";
import SelectedBusContext from "../context/selectedbus";
import API_CONFIG from "../config/api";
import ApiService from "../services/api.service";
import { toast } from "react-toastify";
import Footer from "../components/Footer";
import { SeatIcon } from "../components/SeatIcon";
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
  let provider = "esewa";

  // -----------------------------------
  // INITIATE PAYMENT (BACKEND → ESEWA)
  // -----------------------------------
  async function esewaPaymentCall(tid, totalCost, user) {
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

    // Expected backend response ↓
    // {
    //   gatewayUrl: "https://uat.esewa.com.np/epay/main",
    //   params: { ... }
    // }
    const { gatewayUrl, params } = response.data;

    // -----------------------------
    // 2) REDIRECT USER TO ESEWA
    // -----------------------------
    const form = document.createElement("form");
    form.method = "POST";
    form.action = gatewayUrl;   // <--- dynamic URL from backend

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

    // client-side validation
    if (!selectedSeats.length) return toast.error("No seat selected!");
    if (!name.trim()) return toast.error("Enter passenger name!");
    if (!email.trim()) return toast.error("Enter email!");
    if (!/^[\w.-]+@[\w.-]+\.[A-Za-z]{2,}$/.test(email)) return toast.error("Enter a valid email!");
    if (!contact || String(contact).length < 7) return toast.error("Enter a valid phone number!");

    setIsBooking(true);
    const tid = generateRandomId();

    // 1️⃣ Create booking
    let bookingId = "";
    try {
      const bookingRes = await ApiService.post(API_CONFIG.ENDPOINTS.CREATE_BOOKING, {
        fullName: name,
        email,
      });

      if (!bookingRes.ok) {
        const err = await bookingRes.json().catch(() => ({}));
        throw new Error(err.message || "Failed to create booking");
      }

      const data = await bookingRes.json();
      bookingId = data.bookingId || data.booking_id || data.id || "";
      localStorage.setItem("bookingRes", JSON.stringify(data));
    } catch (err) {
      console.error("Booking API error:", err);
      toast.error(err.message || "Error creating booking");
      setIsBooking(false);
      return;
    }

    // 2️⃣ Book seats (reserve on backend). If any seat booking fails, stop and show error.
    const seatResponses = [];
    const bookedSeatNumbers = [];

    try {
      for (const seatNum of selectedSeats) {
        const seat = selectedBus.seats.find((s) => s.seatNumber === seatNum);
        if (!seat) throw new Error(`Seat ${seatNum} not found`);

        const res = await ApiService.post(
          `${API_CONFIG.ENDPOINTS.BOOK_TICKET}/${seat.id}/book/${bookingId}`,
          {}
        );

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          const serverMsg = err && err.message ? err.message : `Failed to book seat ${seat.seatNumber}`;
          console.error('Seat booking failed for seat', seat.seatNumber, { status: res.status, body: err });
          // Provide a clearer error to the user including seat number
          if (/(same entry)/i.test(serverMsg)) {
            throw new Error(`Seat ${seat.seatNumber} could not be booked: ${serverMsg}. It appears a ticket already exists for this seat. Please refresh the page or choose a different seat.`);
          }
          throw new Error(`${serverMsg} (seat ${seat.seatNumber})`);
        }

        const data = await res.json();
        seatResponses.push(data);
        bookedSeatNumbers.push(seat.seatNumber);

        // Confirm seat (mark as occupied)
        try {
          await ApiService.post(`${API_CONFIG.ENDPOINTS.BOOK_SEAT}/${seat.id}`, {});
        } catch (confirmErr) {
          console.warn('Failed to confirm seat occupancy after booking', seat.seatNumber, confirmErr);
          // non-fatal: continue — the main booking succeeded and seatResponses contains the server data
        }
      }
    } catch (err) {
      console.error("Seat booking error:", err);
      toast.error(err.message || "One or more seats couldn't be booked");
      setIsBooking(false);
      return;
    }

    // Save booking and seat info locally before payment
    localStorage.setItem("seatRes", JSON.stringify(seatResponses));
    localStorage.setItem("selectedSeats", JSON.stringify(bookedSeatNumbers));
    localStorage.setItem("email", email);

    // 3️⃣ Get eSewa signature
    try {
      const sigRes = await ApiService.get(
        `${API_CONFIG.ENDPOINTS.GENERATE_SIGNATURE}?total_cost=${totalCost}&transaction_uuid=${tid}`
      );

      if (!sigRes.ok) {
        const err = await sigRes.json().catch(() => ({}));
        throw new Error(err.message || "Failed to generate signature");
      }

      const signature = await sigRes.text();

      // 4️⃣ Submit to eSewa
      await esewaPaymentCall(signature, tid, bookingId);
    } catch (err) {
      console.error("Signature/API error:", err);
      toast.error(err.message || "Signature API error!");
      setIsBooking(false);
      return;
    }
    // isBooking will end after redirect; keep true briefly
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
                    onChange={(e) => setName(e.target.value)}
                    className="input-field"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-field"
                    placeholder="john@example.com"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Contact Number</label>
                  <input
                    type="tel"
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    className="input-field"
                    placeholder="+977 9800000000"
                  />
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

                <button
                  onClick={bookTicket}
                  disabled={isBooking || selectedSeats.length === 0}
                  className={`w-full btn-primary py-3 font-bold text-lg shadow-md hover:shadow-lg transform transition-all active:scale-95 ${isBooking || selectedSeats.length === 0 ? 'opacity-60 cursor-not-allowed' : ''}`}
                >
                  {isBooking ? 'Processing...' : 'Pay with eSewa'}
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
