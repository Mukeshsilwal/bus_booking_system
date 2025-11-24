import { useContext, useEffect, useState } from "react";
import NavigationBar from "../components/Navbar";
import SelectedBusContext from "../context/selectedbus";
import API_CONFIG from "../config/api";
import ApiService from "../services/api.service";
import { toast } from "react-toastify";
import  "./SeatSelection.css";

export default function TicketDetails() {
  const { selectedBus } = useContext(SelectedBusContext);

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

  // -----------------------------------
  // ESEWA PAYMENT FORM SUBMIT
  // -----------------------------------
  async function esewaPaymentCall(signature, tid, _bookingId) {
    // Build form payload and submit to eSewa
    const formData = {
      amount: totalCost,
      failure_url: "https://busbookingsystem-mu.vercel.app/booking-failed",
      product_delivery_charge: "0",
      product_service_charge: "0",
      product_code: "EPAYTEST",
      signature: signature,
      signed_field_names: "total_amount,transaction_uuid,product_code",
      success_url: "https://busbookingsystem-mu.vercel.app/ticket-confirm",
      tax_amount: "0",
      total_amount: totalCost,
      transaction_uuid: tid,
      secret: "8gBm/:&EnhH.1/q",
    };

    const form = document.createElement("form");
    form.method = "POST";
    form.action = "https://rc-epay.esewa.com.np/api/epay/main/v2/form";

    Object.entries(formData).forEach(([key, value]) => {
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
    <div className="ticket-details-container">
      <NavigationBar />

      <div className="all-details">
        <div className="left-details">
          <h2>Passenger Details</h2>

          <div className="passenger-details">
            <div className="passenger-details-item">
              <label>Passenger Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
            </div>

            <div className="passenger-details-item">
              <label>Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>

            <div className="passenger-details-item">
              <label>Contact</label>
              <input type="tel" value={contact} onChange={(e) => setContact(e.target.value)} />
            </div>
          </div>

          <h2>Select Seats</h2>

          <div className="seat-selection-div">
            <div className="seat-selection">
              {selectedBus?.seats?.map((seat) => {
                const reserved = isSeatReserved(seat);
                const isSelected = selectedSeats.includes(seat.seatNumber);

                return (
                  <div
                    key={seat.id}
                    className={`seat 
                      ${reserved ? "booked" : "available"} 
                      ${isSelected ? "selected" : ""}
                    `}
                    onClick={() => {
                      if (reserved || isBooking) return;
                      setSelectedSeats((prev) =>
                        prev.includes(seat.seatNumber)
                          ? prev.filter((s) => s !== seat.seatNumber)
                          : [...prev, seat.seatNumber]
                      );
                    }}
                  >
                    {seat.seatNumber}
                    {!reserved && <div>{seat.price}</div>}
                  </div>
                );
              })}
            </div>

            <div className="seat-info">
              <label>Available</label>
              <div className="seat available"></div>

              <label>Booked</label>
              <div className="seat booked"></div>

              <label>Selected</label>
              <div className="seat selected"></div>
            </div>
          </div>

                  <button onClick={bookTicket} disabled={isBooking} className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-60">
                    {isBooking ? 'Processing...' : 'Pay with eSewa'}
                  </button>
        </div>

        <div className="right-details">
          <h2>Route Details</h2>

          <div className="route-details">
            <p>
              Route: {selectedBus.route12?.sourceBusStop?.name} →{" "}
              {selectedBus.route12?.destinationBusStop?.name}
            </p>
            <p>Date: {selectedBus?.departureDateTime ? new Date(selectedBus.departureDateTime).toLocaleString() : "-"}</p>
            <p>Seats: {selectedSeats.join(", ")}</p>
            <p>Bus: {selectedBus.busName}</p>
          </div>

          <h2>Payment Details</h2>
          <div className="payment-details">
            <p>Total Cost: NPR {totalCost}</p>
            <p>Selected Seats: {selectedSeats.length}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
