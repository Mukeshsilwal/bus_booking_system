import { useEffect, useState } from "react";
import NavigationBar from "../components/Navbar";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import API_CONFIG from "../config/api";
import ApiService from "../services/api.service";

const TicketConfirmed = () => {
  const [pdfUrl, setPdfUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCancelling, setIsCancelling] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchPdf();
    // revoke object URL on unmount or when pdfUrl changes
    return () => {
      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchPdf() {
    setIsLoading(true);
    setError("");

    const raw = JSON.parse(localStorage.getItem("seatRes")) || [];
    const seatResponses = Array.isArray(raw) ? raw : [raw];
    const firstTicket = seatResponses[0] || {};

    const ticketId = firstTicket.ticketNo || firstTicket.ticketId || firstTicket.id;

    if (!ticketId) {
      setError("No ticket found.");
      toast.error("No ticket found!");
      setIsLoading(false);
      return;
    }

    try {
      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.GENERATE_TICKET}?ticketId=${encodeURIComponent(
        ticketId
      )}`;

      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch PDF");

      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      setPdfUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return objectUrl;
      });
    } catch (err) {
      console.error("Error fetching PDF:", err);
      setError("Failed to load ticket PDF.");
      toast.error("Failed to load ticket PDF.");
    } finally {
      setIsLoading(false);
    }
  }

  async function cancelTicket() {
    setIsCancelling(true);
    setError("");

    const raw = JSON.parse(localStorage.getItem("seatRes")) || [];
    const seatResponses = Array.isArray(raw) ? raw : [raw];
    const email = localStorage.getItem("email") || "";

    const ticketObj = seatResponses[0] || {};
    const ticketId = ticketObj.ticketNo || ticketObj.ticketId || ticketObj.id;

    if (!ticketId) {
      toast.error("Cannot find ticket to cancel.");
      setIsCancelling(false);
      return;
    }

    try {
      const url = `${API_CONFIG.ENDPOINTS.CANCLE_TICKET}?email=${encodeURIComponent(
        email
      )}&ticketNo=${encodeURIComponent(ticketId)}`;

      const response = await ApiService.delete(url);

      if (response && response.ok) {
        toast.success("Ticket cancelled.");
        localStorage.removeItem("seatRes");
        localStorage.removeItem("selectedSeats");
        localStorage.removeItem("bookingRes");
        navigate("/");
      } else {
        const err = response ? await response.json().catch(() => ({})) : {};
        const msg = err.message || "Failed to cancel ticket.";
        toast.error(msg);
      }
    } catch (err) {
      console.error("Error cancelling ticket:", err);
      toast.error("Failed to cancel ticket.");
    } finally {
      setIsCancelling(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <NavigationBar />

      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md mt-8 p-6">
        <h2 className="text-xl font-semibold mb-4">Ticket Confirmation</h2>

        {isLoading ? (
          <div className="text-center py-20">Loading ticket...</div>
        ) : error ? (
          <div className="text-center py-8 text-red-600">{error}</div>
        ) : pdfUrl ? (
          <>
            <div style={{ width: "100%", height: "600px" }} className="border rounded overflow-hidden">
              <embed src={pdfUrl} type="application/pdf" width="100%" height="100%" />
            </div>

            <div className="flex justify-center mt-4 gap-4">
              <a
                href={pdfUrl}
                download="ticket.pdf"
                className="bg-green-600 text-white px-4 py-2 rounded shadow hover:bg-green-700"
              >
                Download Ticket
              </a>
              <button
                onClick={cancelTicket}
                disabled={isCancelling}
                className={`px-4 py-2 rounded shadow ${isCancelling ? 'bg-red-400 text-white cursor-not-allowed' : 'bg-red-600 text-white hover:bg-red-700'}`}
              >
                {isCancelling ? 'Cancelling...' : 'Cancel Ticket'}
              </button>
            </div>
          </>
        ) : (
          <div className="text-center py-8">No ticket available.</div>
        )}
      </div>
    </div>
  );
};

export default TicketConfirmed;
