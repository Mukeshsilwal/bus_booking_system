import { useContext, useEffect, useState } from "react";
import NavigationBar from "../components/Navbar";
import SelectedBusContext from "../context/selectedbus";
import API_CONFIG from "../config/api";
import ApiService from "../services/api.service";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import  "./SeatSelection.css";

export default function TicketDetails() {
  const { selectedBus } = useContext(SelectedBusContext);

  const [selectedSeats, setSelectedSeats] = useState([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [contact, setContact] = useState("");
  const [totalCost, setTotalCost] = useState(0);

  const navigate = useNavigate();

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

  // -----------------------------------
  // GENERATE RANDOM TRANSACTION ID
  // -----------------------------------
  function generateRandomId() {
    return Array.from({ length: 10 }, () => Math.floor(Math.random() * 10)).join("");
  }

  // -----------------------------------
  // ESEWA PAYMENT FORM SUBMIT
  // -----------------------------------
  async function esewaPaymentCall(signature, tid, bookingId) {
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

    // Prepare form
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

    // -------------------------
    // BOOK SEATS
    // -------------------------
    const seatResponses = [];
    const bookedSeatNumbers = [];

    for (const seatNum of selectedSeats) {
      const seat = selectedBus.seats.find((s) => s.seatNumber === seatNum);
      if (!seat) continue;

      try {
        // Save ticket booking
        const res = await ApiService.post(
          `${API_CONFIG.ENDPOINTS.BOOK_TICKET}/${seat.id}/book/${bookingId}`,
          {}
        );

        if (res.ok) {
          const data = await res.json();
          seatResponses.push(data);
          bookedSeatNumbers.push(seat.seatNumber);
        }

        // Confirm seat
        await ApiService.post(`${API_CONFIG.ENDPOINTS.BOOK_SEAT}/${seat.id}`, {});
      } catch (err) {
        console.error("Seat booking error:", err);
      }
    }

    // Store responses
    localStorage.setItem("seatRes", JSON.stringify(seatResponses));
    localStorage.setItem("selectedSeats", JSON.stringify(bookedSeatNumbers));
    localStorage.setItem("email", email);

    // Submit form (redirect to eSewa)
    form.submit();
  }

  // -----------------------------------
  // BOOK TICKET MAIN FUNCTION
  // -----------------------------------
  async function bookTicket() {
    if (!selectedSeats.length) return toast.error("No seat selected!");
    if (!name) return toast.error("Enter passenger name!");
    if (!email) return toast.error("Enter email!");
    if (!contact) return toast.error("Enter phone number!");

    const tid = generateRandomId();

    // 1️⃣ Create booking
    let bookingId = "";
    try {
      const bookingRes = await ApiService.post(API_CONFIG.ENDPOINTS.CREATE_BOOKING, {
        fullName: name,
        email,
      });

      if (!bookingRes.ok) return toast.error("Failed to create booking!");

      const data = await bookingRes.json();
      bookingId = data.bookingId;

      localStorage.setItem("bookingRes", JSON.stringify(data));
    } catch (err) {
      toast.error("Error calling booking API.");
      return;
    }

    // 2️⃣ Get eSewa signature
    try {
      const sigRes = await ApiService.get(
        `${API_CONFIG.ENDPOINTS.GENERATE_SIGNATURE}?total_cost=${totalCost}&transaction_uuid=${tid}`
      );

      if (!sigRes.ok) return toast.error("Failed to generate signature");

      const signature = await sigRes.text();

      // 3️⃣ Submit to eSewa
      await esewaPaymentCall(signature, tid, bookingId);
    } catch (err) {
      toast.error("Signature API error!");
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
    <div className="ticket-details-container">
      <NavigationBar />

      <div className="all-details">
        <div className="left-details">
          <h2>Passenger Details</h2>

          <div className="passenger-details">
            <div className="passenger-details-item">
              <label>Passenger Name</label>
              <input type="text" onChange={(e) => setName(e.target.value)} />
            </div>

            <div className="passenger-details-item">
              <label>Email</label>
              <input type="text" onChange={(e) => setEmail(e.target.value)} />
            </div>

            <div className="passenger-details-item">
              <label>Contact</label>
              <input type="number" onChange={(e) => setContact(e.target.value)} />
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
                      if (reserved) return;

                      if (!isSelected) {
                        setSelectedSeats([...selectedSeats, seat.seatNumber]);
                      } else {
                        setSelectedSeats(
                          selectedSeats.filter((s) => s !== seat.seatNumber)
                        );
                      }
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

          <button onClick={bookTicket}>Pay with eSewa</button>
        </div>

        <div className="right-details">
          <h2>Route Details</h2>

          <div className="route-details">
            <p>
              Route: {selectedBus.route12?.sourceBusStop?.name} →{" "}
              {selectedBus.route12?.destinationBusStop?.name}
            </p>
            <p>Date: {new Date(selectedBus.departureDateTime).toLocaleDateString()}</p>
            <p>Seats: {selectedSeats.join(", ")}</p>
            <p>Bus: {selectedBus.busName}</p>
          </div>

          <h2>Payment Details</h2>
          <div className="payment-details">
            <p>Total Cost: NPR {totalCost}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
