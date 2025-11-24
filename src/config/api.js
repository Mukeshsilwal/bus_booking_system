// src/config/api.js
const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_URL,
  ENDPOINTS: {
    // Auth endpoints
    LOGIN: '/auth/login',
    SIGNUP: '/auth/create-user',
    SEND_OTP: '/auth/sent-otp',
    CHANGE_PASSWORD: '/auth/change-password',
    
    // Bus Stop endpoints
    GET_BUS_STOPS: '/busStop/get',
    CREATE_BUS_STOP: '/admin/post',
    
    // Route endpoints
    GET_ROUTES: '/route/get',
    CREATE_ROUTE: '/admin/busStopRoute',

    SEARCH_BUSES: "/bus/search",
    
    // Bus endpoints
    GET_ALL_BUSES: '/bus/route',
    CREATE_BUS: '/admin/routeBus',
    
    // Seat endpoints
    CREATE_SEAT: '/admin/postSeat',
    BOOK_SEAT: '/bookSeats',
    // Ensure leading slash so baseURL + endpoint becomes a valid URL
    CANCLE_TICKET: '/tickets/seat',
    
    // Booking endpoints
    CREATE_BOOKING: '/booking/post',
    
    // Ticket endpoints
    BOOK_TICKET: '/tickets/seat',
    GENERATE_TICKET: '/tickets/generate',

        // Delete ticket by ticket id
    DELETE_TICKET: '/tickets/ticket',
    
    // Payment endpoints
    GENERATE_SIGNATURE: '/secret/generateSignature',
  }
};

export default API_CONFIG;