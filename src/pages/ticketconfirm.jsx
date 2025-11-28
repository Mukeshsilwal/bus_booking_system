import { useEffect, useState } from "react";
import NavigationBar from "../components/Navbar";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import API_CONFIG from "../config/api";
import ApiService from "../services/api.service";

const TicketConfirmed = () => {
  const [pdfUrl, setPdfUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCancelling, setIsCancelling] = useState(false);
  const [error, setError] = useState("");
  const [devCancelResponse, setDevCancelResponse] = useState(null);
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();

  useEffect(() => {
    const esewaData = searchParams.get("data");
    const khaltiPidx = searchParams.get("pidx");
    const imeRefId = searchParams.get("RefId");

    if (esewaData) {
      verifyPayment("esewa", esewaData);
    } else if (khaltiPidx) {
      verifyPayment("khalti", khaltiPidx);
    } else if (imeRefId) {
      verifyPayment("imepay", imeRefId);
    } else {
      fetchPdf();
    }
    // revoke object URL on unmount or when pdfUrl changes
    return () => {
      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    };
  }, [searchParams]);

  async function verifyPayment(provider, data) {
    setIsLoading(true);
    setError("");
    try {
      let transactionId = "";
      let providerToken = "";

      if (provider === "esewa") {
        // Decode the base64 encoded data from eSewa to get transaction_uuid
        try {
          const decoded = JSON.parse(atob(data));
          transactionId = decoded.transaction_uuid;
          providerToken = data; // encoded data
        } catch (e) {
          console.error("Failed to decode eSewa data", e);
          throw new Error("Invalid payment data");
        }
      } else if (provider === "khalti") {
        transactionId = data; // pidx
        providerToken = data; // pidx
      } else if (provider === "imepay") {
        transactionId = data; // RefId
        providerToken = searchParams.get("TokenId") || data;
      }

      const response = await ApiService.post(`${API_CONFIG.ENDPOINTS.ESEWA_VERIFY_PAYMENT}/${provider}`, {
        transactionId: transactionId,
        providerToken: providerToken
      });

      if (response.status === 200 || response.status === 201) {
        toast.success("Payment successful! Ticket confirmed.");
        // Assuming backend returns ticket details including ID
        const ticketData = response.data;
        // Store in localStorage to match existing flow (optional, but good for consistency)
        localStorage.setItem("seatRes", JSON.stringify([ticketData]));

        // Now fetch the PDF using the ticket ID from response
        const ticketId = ticketData.ticketNo || ticketData.ticketId || ticketData.id;
        if (ticketId) {
          fetchPdf(ticketId);
        }
      } else {
        throw new Error("Payment verification failed");
      }
    } catch (err) {
      console.error("Payment verification error:", err);
      setError("Payment verification failed. Please contact support.");
      toast.error("Payment verification failed.");
    } finally {
      setIsLoading(false);
    }
  }

  async function fetchPdf(specificTicketId = null) {
    setIsLoading(true);
    setError("");

    let ticketId = specificTicketId;

    if (!ticketId) {
      const raw = JSON.parse(localStorage.getItem("seatRes")) || [];
      const seatResponses = Array.isArray(raw) ? raw : [raw];
      const firstTicket = seatResponses[0] || {};
      ticketId = firstTicket.ticketNo || firstTicket.ticketId || firstTicket.id;
    }

    if (!ticketId) {
      setError("No ticket found.");
      // Only show toast if we are not in the middle of a payment verification flow that failed
      if (!searchParams.get("data")) {
        toast.error("No ticket found!");
      }
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
      try {
        // Backend expects ticket number in header and email in JSON body
        const postResp = await ApiService.request(`/bookSeats/cancel`, {
          method: 'POST',
          body: JSON.stringify({ email, ticketNo: ticketId }),
        });


        if (postResp && postResp.ok) {
          toast.success("Ticket cancelled.");
          localStorage.removeItem("seatRes");
          localStorage.removeItem("selectedSeats");
          localStorage.removeItem("bookingRes");
          navigate("/");
          setIsCancelling(false);
          return;
        }
        // otherwise fallthrough to try DELETE below
      } catch (postErr) {
        console.warn('Cancel POST request failed, will try DELETE fallback', postErr);
      }

      const endpoint = `${API_CONFIG.ENDPOINTS.CANCLE_TICKET}?email=${encodeURIComponent(
        email
      )}&ticketNo=${encodeURIComponent(ticketId)}`;

      const response = await ApiService.delete(endpoint);

      if (response && response.ok) {
        toast.success("Ticket cancelled.");
        localStorage.removeItem("seatRes");
        localStorage.removeItem("selectedSeats");
        localStorage.removeItem("bookingRes");
        navigate("/");
      } else {
        // Try to extract a helpful error message from server
        let msg = "Failed to cancel ticket.";
        try {
          if (response) {
            const body = await response.json().catch(() => null);
            // store for dev debug panel
            if (process.env.NODE_ENV === 'development') setDevCancelResponse(body || { status: response.status, statusText: response.statusText });
            if (body && body.message) msg = body.message;
            else if (response.statusText) msg = `${msg} (${response.status} ${response.statusText})`;
            else msg = `${msg} (status ${response.status || 'unknown'})`;
          }
        } catch (e) {
          console.warn('Error parsing cancel response body', e);
        }
        console.error('Cancel ticket failed', { endpoint, status: response && response.status });
        // If server responded with method not allowed or bad request, try a POST fallback
        if (response && [400, 404, 405].includes(response.status)) {
          try {
            console.info('Attempting POST fallback to cancel endpoint');
            const postResp = await ApiService.post(API_CONFIG.ENDPOINTS.CANCLE_TICKET, { email, ticketNo: ticketId });
            if (postResp && postResp.ok) {
              toast.success('Ticket cancelled (fallback).');
              localStorage.removeItem('seatRes');
              localStorage.removeItem('selectedSeats');
              localStorage.removeItem('bookingRes');
              navigate('/');
              return;
            } else {
              const body = postResp ? await postResp.json().catch(() => null) : null;
              const pm = (body && body.message) || `Fallback failed (${postResp && postResp.status})`;
              console.error('Fallback cancel failed', { pm, postResp });
              toast.error(pm);
            }
          } catch (pfErr) {
            console.error('Fallback cancel error', pfErr);
            if (process.env.NODE_ENV === 'development') setDevCancelResponse({ error: pfErr && (pfErr.message || String(pfErr)) });
            toast.error('Cancel failed (fallback).');
          }
        } else {
          toast.error(msg);
        }
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
                className="inline-flex items-center justify-center bg-green-600 text-white px-4 py-2 rounded shadow hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-300"
              >
                Download Ticket
              </a>
              <button
                onClick={cancelTicket}
                disabled={isCancelling}
                className={`inline-flex items-center justify-center px-4 py-2 rounded shadow focus:outline-none focus:ring-2 focus:ring-red-300 ${isCancelling ? 'bg-red-400 text-white cursor-not-allowed opacity-70' : 'bg-red-600 text-white hover:bg-red-700'}`}
              >
                {isCancelling ? 'Cancelling...' : 'Cancel Ticket'}
              </button>
            </div>
            {process.env.NODE_ENV === 'development' && devCancelResponse && (
              <div className="mt-4 p-3 bg-gray-50 border rounded text-xs text-gray-700">
                <div className="font-medium mb-2">Dev: Last cancel response</div>
                <pre className="whitespace-pre-wrap">{JSON.stringify(devCancelResponse, null, 2)}</pre>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-8">No ticket available.</div>
        )}
      </div>
    </div>
  );
};

export default TicketConfirmed;
