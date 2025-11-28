// src/config/api.js
const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_URL,
  ENDPOINTS: {
    // Auth endpoints
    LOGIN: '/auth/login',
    SIGNUP: '/auth/',
    ADMIN_REGISTER: '/register/admin',
    APPROVE_ADMIN: '/register/approve',
    GET_ADMIN_REQUESTS: '/register/all-requests',
    SEND_OTP: '/register/sent-otp',
    CHANGE_PASSWORD: '/register/change-password',

    // Bus Stop endpoint
    GET_BUS_STOPS: '/busStop/get',
    CREATE_BUS_STOP: '/admin/post',

    // Route endpoints
    GET_ROUTES: '/route/get',
    CREATE_ROUTE: '/admin/busStopRoute',

    SEARCH_BUSES: "/bus/search",

    GET_ALL_BUSES: '/bus/route',
    CREATE_BUS: '/admin/routeBus',

    CREATE_SEAT: '/admin/postSeat',
    BOOK_SEAT: '/bookSeats',
    CANCLE_TICKET: '/bookSeats/seat',

    // Booking endpoints
    CREATE_BOOKING: '/booking/post',
    GET_ALL_BOOKINGS: '/booking/get',

    // Ticket endpoints
    BOOK_TICKET: '/tickets/seat',
    GENERATE_TICKET: '/tickets/generate',

    // Delete ticket by ticket id
    DELETE_TICKET: '/tickets/ticket',

    // Payment endpoints
    GENERATE_SIGNATURE: '/secret/generateSignature',

    // QFX Cinema Endpoints
    QFX_MOVIES_NOW_SHOWING: '/mock/qfx/api/movies/nowshowing',
    QFX_MOVIES_UPCOMING: '/mock/qfx/api/movies/upcoming',
    QFX_MOVIE_DETAILS: '/mock/qfx/api/movies/', // + {id}
    QFX_CINEMAS: '/mock/qfx/api/cinemas',
    QFX_SHOWTIMES: '/mock/qfx/api/showtimes',
    QFX_SEATS: '/mock/qfx/api/seats/', // + {showtimeId}
    QFX_BOOK_TICKET: '/booking/cinema/qfx',
    QFX_CANCEL_BOOKING: '/booking/cinema/qfx/cancel',
    QFX_BOOKING_STATUS: '/qfx/booking/', // + {bookingId}
  }
};

export default API_CONFIG;