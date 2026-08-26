import { useState, useCallback, memo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Building2, Mail, Lock, User, Globe, MapPin, Phone, FileText, CheckCircle, AlertCircle, Loader2, Eye, EyeOff } from "lucide-react";
import { api } from "../api/client";

interface FormData {
  companyName: string;
  officialEmail: string;
  password: string;
  confirmPassword: string;
  logo: File | null;
  industry: string;
  companySize: string;
  foundedYear: string;
  website: string;
  description: string;
  country: string;
  state: string;
  city: string;
  address: string;
  contactName: string;
  designation: string;
  contactPhone: string;
  contactEmail: string;
}

interface Errors {
  companyName?: string;
  officialEmail?: string;
  password?: string;
  confirmPassword?: string;
  logo?: string;
  industry?: string;
  companySize?: string;
  foundedYear?: string;
  website?: string;
  description?: string;
  country?: string;
  state?: string;
  city?: string;
  address?: string;
  contactName?: string;
  designation?: string;
  contactPhone?: string;
  contactEmail?: string;
  submit?: string;
}

const INDUSTRIES = [
  "Technology & Software",
  "Finance & Banking",
  "Healthcare & Medical",
  "Manufacturing & Industrial",
  "Retail & E-commerce",
  "Education & Training",
  "Real Estate & Construction",
  "Media & Entertainment",
  "Transportation & Logistics",
  "Energy & Utilities",
  "Consulting & Professional Services",
  "Hospitality & Tourism",
  "Agriculture & Food",
  "Automotive",
  "Aerospace & Defense",
  "Telecommunications",
  "Non-profit & Government",
  "Other"
];

const COMPANY_SIZES = [
  "1-10 employees",
  "11-50 employees",
  "51-200 employees",
  "201-500 employees",
  "501-1000 employees",
  "1001-5000 employees",
  "5001-10000 employees",
  "10000+ employees"
];

const COUNTRIES = [
  "United States",
  "Canada",
  "United Kingdom",
  "Germany",
  "France",
  "Australia",
  "India",
  "Singapore",
  "Japan",
  "Netherlands",
  "Switzerland",
  "Sweden",
  "Other"
];

interface InputFieldProps {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  error?: string;
  touched?: boolean;
  children?: React.ReactNode;
  value: string;
  onChange: (e: React.ChangeEvent<any>) => void;
  onBlur: () => void;
  as?: "input" | "textarea";
  rows?: number;
  min?: number;
  max?: number;
}

const InputField = memo(function InputField({
  label,
  name,
  type = "text",
  placeholder = "",
  required = false,
  error,
  touched,
  children,
  value,
  onChange,
  onBlur,
  as = "input",
  rows,
  min,
  max,
}: InputFieldProps) {
  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-slate-700 mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        {children || (
          as === "textarea" ? (
            <textarea
              name={name}
              placeholder={placeholder}
              value={value}
              onChange={onChange}
              onBlur={onBlur}
              rows={rows || 4}
              className={`w-full px-4 py-2.5 rounded-lg border transition-colors ${
                error && touched
                  ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                  : "border-slate-300 focus:border-[#3B28EC] focus:ring-[#3B28EC]/20"
              } bg-white text-slate-900 placeholder-slate-400 resize-none`}
            />
          ) : (
            <input
              type={type}
              name={name}
              placeholder={placeholder}
              value={value}
              onChange={onChange}
              onBlur={onBlur}
              min={min}
              max={max}
              className={`w-full px-4 py-2.5 rounded-lg border transition-colors ${
                error && touched
                  ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                  : "border-slate-300 focus:border-[#3B28EC] focus:ring-[#3B28EC]/20"
              } bg-white text-slate-900 placeholder-slate-400`}
            />
          )
        )}
        {error && touched && (
          <p className="mt-1.5 text-sm text-red-500 flex items-center gap-1">
            <AlertCircle size={13} />
            {error}
          </p>
        )}
      </div>
    </div>
  );
});

interface SelectFieldProps {
  label: string;
  name: string;
  options: string[];
  placeholder?: string;
  required?: boolean;
  error?: string;
  touched?: boolean;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onBlur: () => void;
}

const SelectField = memo(function SelectField({
  label,
  name,
  options,
  placeholder,
  required = false,
  error,
  touched,
  value,
  onChange,
  onBlur,
}: SelectFieldProps) {
  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-slate-700 mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        <select
          name={name}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          className={`w-full px-4 py-2.5 rounded-lg border appearance-none bg-white text-slate-900 ${
            error && touched
              ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
              : "border-slate-300 focus:border-[#3B28EC] focus:ring-[#3B28EC]/20"
          }`}
        >
          <option value="" disabled>{placeholder || `Select ${label}`}</option>
          {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
        {error && touched && (
          <p className="mt-1.5 text-sm text-red-500 flex items-center gap-1">
            <AlertCircle size={13} />
            {error}
          </p>
        )}
      </div>
    </div>
  );
});

interface SectionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

const Section = memo(function Section({ title, icon, children }: SectionProps) {
  return (
    <section className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-[#F96302]">
          {icon}
        </div>
        <h2 className="text-xl font-bold text-slate-900">{title}</h2>
      </div>
      <div className="space-y-5">{children}</div>
    </section>
  );
});

export default function CompanyRegisterPage() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const [formData, setFormData] = useState<FormData>({
    companyName: "",
    officialEmail: "",
    password: "",
    confirmPassword: "",
    logo: null,
    industry: "",
    companySize: "",
    foundedYear: "",
    website: "",
    description: "",
    country: "",
    state: "",
    city: "",
    address: "",
    contactName: "",
    designation: "",
    contactPhone: "",
    contactEmail: "",
  });

  const [errors, setErrors] = useState<Errors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const validateField = useCallback((name: string, value: any): string | undefined => {
    switch (name) {
      case "companyName":
        if (!value.trim()) return "Company name is required";
        if (value.trim().length < 2) return "Company name must be at least 2 characters";
        break;
      case "officialEmail":
        if (!value.trim()) return "Official company email is required";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "Please enter a valid email address";
        if (!value.includes("@")) return "Please enter a valid company email";
        break;
      case "password":
        if (!value) return "Password is required";
        if (value.length < 8) return "Password must be at least 8 characters";
        if (!/[A-Z]/.test(value)) return "Password must contain at least one uppercase letter";
        if (!/[a-z]/.test(value)) return "Password must contain at least one lowercase letter";
        if (!/[0-9]/.test(value)) return "Password must contain at least one number";
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(value)) return "Password must contain at least one special character";
        break;
      case "confirmPassword":
        if (!value) return "Please confirm your password";
        if (value !== formData.password) return "Passwords do not match";
        break;
      case "logo":
        if (value) {
          const file = value as File;
          if (!["image/jpeg", "image/png", "image/svg+xml", "image/webp"].includes(file.type)) {
            return "Logo must be a JPEG, PNG, SVG, or WebP file";
          }
          if (file.size > 2 * 1024 * 1024) {
            return "Logo must be less than 2MB";
          }
        }
        break;
      case "industry":
        if (!value) return "Industry is required";
        break;
      case "companySize":
        if (!value) return "Company size is required";
        break;
      case "foundedYear":
        if (value) {
          const year = parseInt(value);
          const currentYear = new Date().getFullYear();
          if (isNaN(year) || year < 1800 || year > currentYear) {
            return `Please enter a valid year between 1800 and ${currentYear}`;
          }
        }
        break;
      case "website":
        if (value && !/^https?:\/\/.+/.test(value)) {
          return "Please enter a valid URL starting with http:// or https://";
        }
        break;
      case "description":
        if (!value.trim()) return "Company description is required";
        if (value.trim().length < 50) return "Description must be at least 50 characters";
        break;
      case "country":
        if (!value) return "Country is required";
        break;
      case "state":
        if (!value.trim()) return "State is required";
        break;
      case "city":
        if (!value.trim()) return "City is required";
        break;
      case "address":
        if (!value.trim()) return "Company address is required";
        break;
      case "contactName":
        if (!value.trim()) return "Contact person name is required";
        break;
      case "designation":
        break;
      case "contactPhone":
        if (!value.trim()) return "Contact phone is required";
        if (!/^[\+]?[0-9\s\-\(\)]{7,20}$/.test(value)) {
          return "Please enter a valid phone number";
        }
        break;
      case "contactEmail":
        if (!value.trim()) return "Contact email is required";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "Please enter a valid email address";
        break;
    }
    return undefined;
  }, [formData.password]);

  const handleChange = (name: string, value: any) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleBlur = (name: string) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    const error = validateField(name, formData[name as keyof FormData]);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setLogoPreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setLogoPreview(null);
    }
    handleChange("logo", file);
  };

  const validateForm = (): boolean => {
    const newErrors: Errors = {};
    let isValid = true;

    const requiredFields: (keyof FormData)[] = [
      "companyName", "officialEmail", "password", "confirmPassword",
      "industry", "companySize", "description",
      "country", "state", "city", "address",
      "contactName", "contactPhone", "contactEmail"
    ];

    requiredFields.forEach(field => {
      const error = validateField(field, formData[field]);
      if (error) {
        newErrors[field] = error;
        isValid = false;
      }
    });

    if (formData.foundedYear) {
      const error = validateField("foundedYear", formData.foundedYear);
      if (error) {
        newErrors.foundedYear = error;
        isValid = false;
      }
    }

    if (formData.website) {
      const error = validateField("website", formData.website);
      if (error) {
        newErrors.website = error;
        isValid = false;
      }
    }

    if (formData.logo) {
      const error = validateField("logo", formData.logo);
      if (error) {
        newErrors.logo = error;
        isValid = false;
      }
    }

    setErrors(newErrors);
    setTouched(Object.fromEntries(Object.keys(formData).map(key => [key, true])));
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    setErrors(prev => ({ ...prev, submit: undefined }));

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("companyName", formData.companyName);
      formDataToSend.append("officialEmail", formData.officialEmail);
      formDataToSend.append("password", formData.password);
      formDataToSend.append("industry", formData.industry);
      formDataToSend.append("companySize", formData.companySize);
      if (formData.foundedYear) formDataToSend.append("foundedYear", formData.foundedYear);
      if (formData.website) formDataToSend.append("website", formData.website);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("country", formData.country);
      formDataToSend.append("state", formData.state);
      formDataToSend.append("city", formData.city);
      formDataToSend.append("address", formData.address);
      formDataToSend.append("contactName", formData.contactName);
      if (formData.designation) formDataToSend.append("designation", formData.designation);
      formDataToSend.append("contactPhone", formData.contactPhone);
      formDataToSend.append("contactEmail", formData.contactEmail);
      if (formData.logo) formDataToSend.append("logo", formData.logo);

      const response = await api.post("/company/register", formDataToSend, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data.success) {
        setSubmitSuccess(true);
        setTimeout(() => {
          navigate("/company/registration-success");
        }, 3000);
      }
    } catch (error: any) {
      const message = error.response?.data?.message || "Registration failed. Please try again.";
      setErrors(prev => ({ ...prev, submit: message }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const passwordStrength = (password: string): { score: number; label: string; color: string } => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++;

    if (score <= 2) return { score, label: "Weak", color: "bg-red-500" };
    if (score <= 3) return { score, label: "Fair", color: "bg-yellow-500" };
    if (score <= 4) return { score, label: "Good", color: "bg-blue-500" };
    return { score, label: "Strong", color: "bg-green-500" };
  };

  const strength = passwordStrength(formData.password);

  if (submitSuccess) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600 mx-auto mb-6">
              <CheckCircle size={32} />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Account Submitted Successfully</h1>
            <p className="text-slate-600 mb-6">
              Your company registration has been submitted for verification.
              You will receive an email once your company has been approved.
            </p>
            <Link
              to="/"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#3B28EC] to-[#F96302] text-white font-bold hover:opacity-95 transition"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:py-16">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="text-center mb-10">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <Building2 size={32} className="text-[#F96302]" />
          </Link>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Build Your Company Presence
          </h1>
          <p className="mt-3 text-lg text-slate-600 max-w-2xl mx-auto">
            Create your company account and start connecting with the right talent.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          {/* Section A: Company Account */}
          <Section title="Company Account" icon={<Building2 size={20} />}>
            <div className="grid gap-5 sm:grid-cols-2">
              <InputField
                label="Company Name"
                name="companyName"
                placeholder="Enter your company name"
                required
                value={formData.companyName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange("companyName", e.target.value)}
                onBlur={() => handleBlur("companyName")}
                error={errors.companyName}
                touched={touched.companyName}
              />
              <InputField
                label="Official Company Email"
                name="officialEmail"
                type="email"
                placeholder="company@domain.com"
                required
                value={formData.officialEmail}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange("officialEmail", e.target.value)}
                onBlur={() => handleBlur("officialEmail")}
                error={errors.officialEmail}
                touched={touched.officialEmail}
              />
              <InputField
                label="Password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Create a strong password"
                required
                value={formData.password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange("password", e.target.value)}
                onBlur={() => handleBlur("password")}
                error={errors.password}
                touched={touched.password}
              />
              <div className="sm:col-span-2">
                <InputField
                  label="Confirm Password"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  required
                  value={formData.confirmPassword}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange("confirmPassword", e.target.value)}
                  onBlur={() => handleBlur("confirmPassword")}
                  error={errors.confirmPassword}
                  touched={touched.confirmPassword}
                />
                {formData.password && (
                  <div className="mt-2">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-slate-500">Password Strength</span>
                      <span className={`font-medium ${strength.color.replace("bg-", "text-")}`}>{strength.label}</span>
                    </div>
                    <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${strength.color}`}
                        style={{ width: `${(strength.score / 5) * 100}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Section>

          {/* Section B: Company Information */}
          <Section title="Company Information" icon={<FileText size={20} />}>
            <div className="space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="w-full">
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Company Logo
                  </label>
                  <div className="flex items-center gap-4">
                    <label className="flex h-16 w-16 items-center justify-center rounded-xl border-2 border-dashed border-slate-300 cursor-pointer hover:border-[#F96302] hover:bg-orange-50 transition relative">
                      {logoPreview ? (
                        <img src={logoPreview} alt="Logo preview" className="h-full w-full object-cover rounded-lg" />
                      ) : (
                        <FileText size={24} className="text-slate-400" />
                      )}
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/svg+xml,image/webp"
                        onChange={handleLogoChange}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                    </label>
                    <div className="flex-1">
                      <p className="text-sm text-slate-600">JPEG, PNG, SVG, or WebP (max 2MB)</p>
                      {errors.logo && touched.logo && (
                        <p className="mt-1.5 text-sm text-red-500 flex items-center gap-1">
                          <AlertCircle size={13} />
                          {errors.logo}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <SelectField
                  label="Industry"
                  name="industry"
                  options={INDUSTRIES}
                  placeholder="Select industry"
                  required
                  value={formData.industry}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleChange("industry", e.target.value)}
                  onBlur={() => handleBlur("industry")}
                  error={errors.industry}
                  touched={touched.industry}
                />
                <SelectField
                  label="Company Size"
                  name="companySize"
                  options={COMPANY_SIZES}
                  placeholder="Select company size"
                  required
                  value={formData.companySize}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleChange("companySize", e.target.value)}
                  onBlur={() => handleBlur("companySize")}
                  error={errors.companySize}
                  touched={touched.companySize}
                />
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <InputField
                  label="Founded Year"
                  name="foundedYear"
                  type="number"
                  placeholder="2020"
                  value={formData.foundedYear}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange("foundedYear", e.target.value)}
                  onBlur={() => handleBlur("foundedYear")}
                  error={errors.foundedYear}
                  touched={touched.foundedYear}
                  min={1800}
                  max={new Date().getFullYear()}
                />
                <InputField
                  label="Company Website"
                  name="website"
                  type="url"
                  placeholder="https://www.company.com"
                  value={formData.website}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange("website", e.target.value)}
                  onBlur={() => handleBlur("website")}
                  error={errors.website}
                  touched={touched.website}
                />
              </div>

              <InputField
                label="Company Description"
                name="description"
                placeholder="Describe your company, mission, culture, and what makes you unique..."
                required
                value={formData.description}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleChange("description", e.target.value)}
                onBlur={() => handleBlur("description")}
                error={errors.description}
                touched={touched.description}
                as="textarea"
                rows={4}
              />
            </div>
          </Section>

          {/* Section C: Company Location */}
          <Section title="Company Location" icon={<MapPin size={20} />}>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <SelectField
                label="Country"
                name="country"
                options={COUNTRIES}
                placeholder="Select country"
                required
                value={formData.country}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleChange("country", e.target.value)}
                onBlur={() => handleBlur("country")}
                error={errors.country}
                touched={touched.country}
              />
              <InputField
                label="State / Province"
                name="state"
                placeholder="State or Province"
                required
                value={formData.state}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange("state", e.target.value)}
                onBlur={() => handleBlur("state")}
                error={errors.state}
                touched={touched.state}
              />
              <InputField
                label="City"
                name="city"
                placeholder="City"
                required
                value={formData.city}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange("city", e.target.value)}
                onBlur={() => handleBlur("city")}
                error={errors.city}
                touched={touched.city}
              />
              <InputField
                label="Company Address"
                name="address"
                placeholder="Street address, suite, building"
                required
                value={formData.address}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange("address", e.target.value)}
                onBlur={() => handleBlur("address")}
                error={errors.address}
                touched={touched.address}
              />
            </div>
          </Section>

          {/* Section D: Primary Contact */}
          <Section title="Primary Contact" icon={<User size={20} />}>
            <div className="grid gap-5 sm:grid-cols-2">
              <InputField
                label="Contact Person Name"
                name="contactName"
                placeholder="Full name of primary contact"
                required
                value={formData.contactName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange("contactName", e.target.value)}
                onBlur={() => handleBlur("contactName")}
                error={errors.contactName}
                touched={touched.contactName}
              />
              <InputField
                label="Designation / Title"
                name="designation"
                placeholder="e.g., HR Director, Founder, CEO"
                value={formData.designation}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange("designation", e.target.value)}
                onBlur={() => handleBlur("designation")}
                error={errors.designation}
                touched={touched.designation}
              />
              <InputField
                label="Contact Phone"
                name="contactPhone"
                type="tel"
                placeholder="+1 (555) 123-4567"
                required
                value={formData.contactPhone}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange("contactPhone", e.target.value)}
                onBlur={() => handleBlur("contactPhone")}
                error={errors.contactPhone}
                touched={touched.contactPhone}
              />
              <InputField
                label="Contact Email"
                name="contactEmail"
                type="email"
                placeholder="contact@company.com"
                required
                value={formData.contactEmail}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange("contactEmail", e.target.value)}
                onBlur={() => handleBlur("contactEmail")}
                error={errors.contactEmail}
                touched={touched.contactEmail}
              />
            </div>
          </Section>

          {/* Submit Button */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8">
            {errors.submit && (
              <div className="mb-4 p-4 rounded-lg bg-red-50 border border-red-200 flex items-center gap-3 text-red-700">
                <AlertCircle size={20} />
                <p className="text-sm">{errors.submit}</p>
              </div>
            )}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#3B28EC] via-[#6335F3] to-[#F25C05] text-white font-bold text-lg hover:opacity-95 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Creating Account...
                </>
              ) : (
                "Create Company Account"
              )}
            </button>
          </div>

          {/* Already have account */}
          <div className="text-center text-slate-600">
            <p>Already have a company account?{" "}
              <Link to="/login" className="font-semibold text-[#3B28EC] hover:text-[#2B26D9] underline">
                Sign In
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}