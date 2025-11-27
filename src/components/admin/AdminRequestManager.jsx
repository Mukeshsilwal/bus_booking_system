import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import ApiService from "../../services/api.service";
import API_CONFIG from "../../config/api";

export function AdminRequestManager() {
    const [requests, setRequests] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [processingId, setProcessingId] = useState(null);

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            const response = await ApiService.get(API_CONFIG.ENDPOINTS.GET_ADMIN_REQUESTS);
            if (response.ok) {
                const data = await response.json();
                console.log("Fetched requests:", data); // Debugging: Check data structure

                // Normalize data to ensure 'id' exists
                const normalizedData = Array.isArray(data) ? data.map(req => ({
                    ...req,
                    id: req.id || req._id || req.requestId
                })) : [];

                console.log("Normalized data:", normalizedData);
                setRequests(normalizedData);
            } else {
                // Fallback for demo/development if API isn't ready
                console.warn("Failed to fetch requests, using mock data if available or empty list");
                // setRequests([]); 
            }
        } catch (error) {
            console.error("Error fetching requests:", error);
            toast.error("Failed to load registration requests");
        } finally {
            setIsLoading(false);
        }
    };

    const handleApprove = async (id) => {
        setProcessingId(id);
        try {
            // The user specified: @PostMapping(value = "/approve/{id}")
            // So we append the ID to the base URL
            const url = `${API_CONFIG.ENDPOINTS.APPROVE_ADMIN}/${id}`;
            const response = await ApiService.post(url, {});

            if (response.ok) {
                toast.success("Admin approved and credentials emailed.");
                // Remove the approved request from the list
                setRequests(requests.filter(req => req.id !== id));
            } else {
                const errorData = await response.json().catch(() => ({}));
                toast.error(errorData.message || "Failed to approve admin.");
            }
        } catch (error) {
            console.error("Error approving admin:", error);
            toast.error("An error occurred while approving.");
        } finally {
            setProcessingId(null);
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">Registration Requests</h2>
                <span className="bg-indigo-100 text-indigo-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                    {requests.length} Pending
                </span>
            </div>

            {requests.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm p-8 text-center border border-gray-100">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No pending requests</h3>
                    <p className="mt-1 text-sm text-gray-500">All caught up! New registration requests will appear here.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {requests.map((request) => (
                        <div key={request.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden transition-all hover:shadow-md">
                            <div className="p-6">
                                <div className="flex flex-col md:flex-row justify-between gap-6">
                                    {/* Info Section */}
                                    <div className="flex-1 space-y-4">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-900">{request.fullName}</h3>
                                                <p className="text-sm text-gray-500">{request.email}</p>
                                            </div>
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                                Pending
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                                            <div className="flex items-center text-gray-600">
                                                <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                                </svg>
                                                {request.phone}
                                            </div>
                                            <div className="flex items-center text-gray-600">
                                                <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                                                </svg>
                                                {request.citizenshipNumber}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Images Section */}
                                    <div className="flex gap-4 overflow-x-auto pb-2 md:pb-0">
                                        {request.frontImage && (
                                            <div className="relative group w-32 h-24 flex-shrink-0 rounded-lg overflow-hidden border border-gray-200">
                                                <img
                                                    src={request.frontImage}
                                                    alt="Citizenship Front"
                                                    className="w-full h-full object-cover"
                                                />
                                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <a href={request.frontImage} target="_blank" rel="noopener noreferrer" className="text-white text-xs hover:underline">
                                                        View Full
                                                    </a>
                                                </div>
                                            </div>
                                        )}
                                        {request.backImage && (
                                            <div className="relative group w-32 h-24 flex-shrink-0 rounded-lg overflow-hidden border border-gray-200">
                                                <img
                                                    src={request.backImage}
                                                    alt="Citizenship Back"
                                                    className="w-full h-full object-cover"
                                                />
                                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <a href={request.backImage} target="_blank" rel="noopener noreferrer" className="text-white text-xs hover:underline">
                                                        View Full
                                                    </a>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="mt-6 flex justify-end pt-4 border-t border-gray-50">
                                    <button
                                        onClick={() => handleApprove(request.id)}
                                        disabled={processingId === request.id}
                                        className={`inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors
                      ${processingId === request.id ? 'opacity-70 cursor-not-allowed' : ''}
                    `}
                                    >
                                        {processingId === request.id ? (
                                            <>
                                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Approving...
                                            </>
                                        ) : (
                                            <>
                                                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                                Approve Request
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
