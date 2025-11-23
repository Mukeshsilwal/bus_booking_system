import { useEffect, useState } from "react";
import NavigationBar from "../components/Navbar";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import API_CONFIG from "../config/api";

const TicketConfirmed = () => {
  const [pdfUrl, setPdfUrl] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPdf();
  }, []);

  // ------------------------------
  // Fetch Ticket PDF
  // ------------------------------
  async function fetchPdf() {
    const seatResponses = JSON.parse(localStorage.getItem("seatRes")) || [];
    const firstTicket = seatResponses[0];

    if (!firstTicket) {
      toast.error("No ticket found!");
      return;
    }

    try {
      const response = await fetch(
    `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.GENERATE_TICKET}?ticketId=${firstTicket.ticketNo}`
  );

      if (!response.ok) {
        throw new Error("Failed to fetch PDF");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setPdfUrl(url);
    } catch (error) {
      console.error("Error fetching PDF:", error);
      toast.error("Failed to load ticket PDF.");
    }
  }

  // ------------------------------
  // Cancel Ticket
  // ------------------------------
  async function cancelTicket() {
    const selectedBus = JSON.parse(localStorage.getItem("busListDetails"))?.selectedBus;
    const seatNumber = JSON.parse(localStorage.getItem("selectedSeats"))?.[0];
    const seatId = selectedBus?.seats.find((seat) => seat.seatNumber === seatNumber)?.id;
    const email = localStorage.getItem("email");
    const ticketId = JSON.parse(localStorage.getItem("seatRes"))?.[0]?.ticketNo;

    if (!seatId || !ticketId) {
      toast.error("Cannot find ticket or seat to cancel.");
      return;
    }

    try {
      const response = await ApiService.delete(
        `${API_CONFIG.ENDPOINTS.CANCLE_TICKET}/${seatId}?email=${email}&ticketNo=${ticketId}`
      );

      if (response.ok) {
        toast.success("Ticket Cancelled.");
        navigate("/");
      } else {
        toast.error("Failed to cancel ticket.");
      }
    } catch (error) {
      console.error("Error cancelling ticket:", error);
      toast.error("Failed to cancel ticket.");
    }
  }

  return (
    <div className="flex-column h-screen w-screen overflow-auto pt-4 justify-center">
      <NavigationBar />

      <div style={{ width: "100%", height: "500px", marginTop: "3em" }}>
        {pdfUrl ? (
          <>
            <embed
              src={pdfUrl}
              type="application/pdf"
              width="100%"
              height="100%"
            />
            <div className="flex justify-center mt-4 gap-4">
              <a
                href={pdfUrl}
                download="ticket.pdf"
                className="pagination-btn bg-green-600 text-white px-4 py-2 rounded"
              >
                Download Ticket
              </a>
              <button
                onClick={cancelTicket}
                className="pagination-btn bg-red-600 text-white px-4 py-2 rounded"
              >
                Cancel Ticket
              </button>
            </div>
          </>
        ) : (
          <p>Loading ticket...</p>
        )}
      </div>
    </div>
  );
};

export default TicketConfirmed;
