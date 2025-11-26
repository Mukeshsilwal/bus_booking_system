import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useFormik } from "formik";
import { adminRegistrationValidation } from "../validations/auth.validations";
import API_CONFIG from "../config/api";
import ApiService from "../services/api.service";

// Icons
const UserIcon = () => (
  <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const EmailIcon = () => (
  <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const PhoneIcon = () => (
  <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
  </svg>
);

const CardIcon = () => (
  <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
  </svg>
);

const UploadIcon = () => (
  <svg className="w-8 h-8 text-indigo-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
  </svg>
);

const CheckIcon = () => (
  <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

// Components defined OUTSIDE the main component to prevent re-rendering issues
const FileUploadField = ({ id, label, error, touched, onChange, value }) => (
  <div className="w-full">
    <label className="block text-sm font-medium text-slate-700 mb-2">
      {label}
    </label>
    <div className={`relative border-2 border-dashed rounded-xl p-6 transition-all duration-200 ease-in-out
      ${error && touched
        ? 'border-red-300 bg-red-50'
        : value
          ? 'border-green-300 bg-green-50'
          : 'border-slate-300 hover:border-indigo-400 hover:bg-slate-50'
      }
    `}>
      <input
        id={id}
        type="file"
        accept="image/*"
        onChange={onChange}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
      />
      <div className="flex flex-col items-center justify-center text-center">
        {value ? (
          <>
            <CheckIcon />
            <p className="mt-2 text-sm font-medium text-green-700 truncate max-w-[200px]">
              {value.name}
            </p>
            <p className="text-xs text-green-600">Click to change</p>
          </>
        ) : (
          <>
            <UploadIcon />
            <p className="text-sm font-medium text-slate-700">
              <span className="text-indigo-600">Upload a file</span> or drag and drop
            </p>
            <p className="text-xs text-slate-500 mt-1">PNG, JPG up to 5MB</p>
          </>
        )}
      </div>
    </div>
    {error && touched && (
      <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        {error}
      </p>
    )}
  </div>
);

const InputField = ({ id, type, label, icon: Icon, placeholder, ...props }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-slate-700 mb-1">
      {label}
    </label>
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Icon />
      </div>
      <input
        id={id}
        type={type}
        className={`input-field pl-10 transition-all duration-200
          ${props.error && props.touched
            ? 'border-red-300 focus:ring-red-200 focus:border-red-500'
            : 'focus:ring-indigo-200 focus:border-indigo-500'
          }`}
        placeholder={placeholder}
        {...props}
      />
    </div>
    {props.error && props.touched && (
      <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        {props.error}
      </p>
    )}
  </div>
);

export default function Register() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const initialValues = {
    fullName: "",
    email: "",
    phone: "",
    citizenshipNumber: "",
    frontImage: null,
    backImage: null,
  };

  const { values, errors, touched, handleBlur, handleSubmit, handleChange, setFieldValue, resetForm } =
    useFormik({
      initialValues,
      validationSchema: adminRegistrationValidation,
      onSubmit: async (values, action) => {
        setIsLoading(true);
        try {
          const formData = new FormData();
          formData.append("fullName", values.fullName);
          formData.append("email", values.email);
          formData.append("phone", values.phone);
          formData.append("citizenshipNumber", values.citizenshipNumber);
          formData.append("frontImage", values.frontImage);
          formData.append("backImage", values.backImage);

          const response = await ApiService.post(API_CONFIG.ENDPOINTS.ADMIN_REGISTER, formData);

          if (response && response.ok) {
            toast.success("Registration successful! Please wait for admin approval.");
            action.resetForm();

            setTimeout(() => {
              navigate("/admin/login", { replace: true });
            }, 2000);
          } else {
            const errorData = await response.json().catch(() => ({}));
            toast.error(errorData.message || "Registration failed. Please try again.");
          }
        } catch (error) {
          console.error(error);
          toast.error("An error occurred during registration.");
        } finally {
          setIsLoading(false);
          if (action && action.setSubmitting) action.setSubmitting(false);
        }
      },
    });

  useEffect(() => {
    resetForm();
  }, [resetForm]);

  const handleFileChange = (event, fieldName) => {
    const file = event.currentTarget.files[0];
    setFieldValue(fieldName, file);
  };

  return (
    <div className="min-h-screen flex bg-slate-50 font-sans">
      {/* Left Side - Image */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-indigo-900">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=2069&auto=format&fit=crop')] bg-cover bg-center opacity-40 transform hover:scale-105 transition-transform duration-[20s]"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/90 via-purple-900/80 to-slate-900/90"></div>

        <div className="relative z-10 flex flex-col justify-center px-16 text-white h-full">
          <div className="mb-8">
            <div className="h-12 w-12 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center mb-6 border border-white/20">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h2 className="text-5xl font-bold mb-6 leading-tight">
              Drive Your Business <br />
              <span className="text-indigo-300">Forward</span>
            </h2>
            <p className="text-lg text-indigo-100 max-w-md leading-relaxed opacity-90">
              Join our network of premium bus operators. Manage your fleet, track bookings, and grow your revenue with our advanced admin tools.
            </p>
          </div>

          <div className="flex gap-4 mt-8">
            <div className="flex -space-x-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-10 h-10 rounded-full border-2 border-indigo-900 bg-indigo-200 flex items-center justify-center text-xs font-bold text-indigo-800">
                  {i}
                </div>
              ))}
            </div>
            <div className="flex flex-col justify-center">
              <p className="text-sm font-bold text-white">2k+ Operators</p>
              <p className="text-xs text-indigo-200">Trust our platform</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8 lg:p-12 lg:w-1/2 overflow-y-auto bg-white/50 backdrop-blur-sm">
        <div className="w-full max-w-lg space-y-8 bg-white p-8 sm:p-10 rounded-3xl shadow-xl border border-slate-100 my-8">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Admin Registration</h1>
            <p className="text-slate-500">
              Enter your details to request admin access
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 mt-8">
            <div className="space-y-5">
              <InputField
                id="fullName"
                type="text"
                label="Full Name"
                icon={UserIcon}
                placeholder="John Doe"
                value={values.fullName}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.fullName}
                touched={touched.fullName}
              />

              <InputField
                id="email"
                type="email"
                label="Email Address"
                icon={EmailIcon}
                placeholder="admin@company.com"
                value={values.email}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.email}
                touched={touched.email}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <InputField
                  id="phone"
                  type="text"
                  label="Phone Number"
                  icon={PhoneIcon}
                  placeholder="9800000000"
                  value={values.phone}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={errors.phone}
                  touched={touched.phone}
                />

                <InputField
                  id="citizenshipNumber"
                  type="text"
                  label="Citizenship No."
                  icon={CardIcon}
                  placeholder="12-34-56-78"
                  value={values.citizenshipNumber}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={errors.citizenshipNumber}
                  touched={touched.citizenshipNumber}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
                <FileUploadField
                  id="frontImage"
                  label="Citizenship Front"
                  onChange={(e) => handleFileChange(e, "frontImage")}
                  value={values.frontImage}
                  error={errors.frontImage}
                  touched={touched.frontImage}
                />

                <FileUploadField
                  id="backImage"
                  label="Citizenship Back"
                  onChange={(e) => handleFileChange(e, "backImage")}
                  value={values.backImage}
                  error={errors.backImage}
                  touched={touched.backImage}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full btn-primary py-4 rounded-xl font-semibold text-lg shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all duration-300 transform hover:-translate-y-0.5
                ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Processing...</span>
                </div>
              ) : (
                'Submit Application'
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <p className="text-slate-600">
              Already have an account?{' '}
              <Link to="/admin/login" className="text-indigo-600 hover:text-indigo-700 font-semibold hover:underline decoration-2 underline-offset-2 transition-all">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}