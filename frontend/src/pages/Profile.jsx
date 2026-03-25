import { useMemo, useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { toast } from "react-toastify";
import FileUpload from "@/components/ui/file-upload"; // Make sure this path is correct
import { useUser } from "../context/UserContext";
import { useLanguage, SUPPORTED_LANGUAGES } from "../context/LanguageContext";
import ConfirmDialog from "../components/ui/ConfirmDialog";

/* ─────────────────────────────────────────
   MOCK DATA (matching mongoose schema)
───────────────────────────────────────── */
const MOCK_USER = {
  fullName: "Rajesh Kumar Yadav",
  email: "rajesh.yadav@farmnet.in",
  phoneNumber: "+91 98765 43210",
  farmerType: "Medium Farmer",
  farmingExperience: 18,
  dateOfBirth: "1978-04-12",
  gender: "Male",
  isVerified: true,
  subscription: { plan: "Premium" },
  language: "Hindi",
  address: {
    village: "Sundarpur",
    district: "Varanasi",
    state: "Uttar Pradesh",
    pincode: "221001",
  },
  landHoldings: {
    totalLandArea: 14.5,
    unit: "acres",
    irrigatedLand: 9,
    nonIrrigatedLand: 5.5,
    soilType: "Alluvial",
    landType: ["Owned", "Leased"],
  },
  currentCrops: [
    {
      cropName: "Wheat",
      variety: "HD-2967",
      area: 6,
      stage: "Vegetative",
      healthStatus: "Healthy",
      sowingDate: "2023-11-15",
    },
    {
      cropName: "Mustard",
      variety: "Pusa Bold",
      area: 4,
      stage: "Flowering",
      healthStatus: "Healthy",
      sowingDate: "2023-10-20",
    },
    {
      cropName: "Potato",
      variety: "Kufri Jyoti",
      area: 4.5,
      stage: "Germination",
      healthStatus: "At Risk",
      sowingDate: "2023-12-01",
    },
  ],
  cropsHistory: [
    {
      cropName: "Rice",
      season: "Kharif",
      year: 2023,
      areaCultivated: 8,
      yieldQuantity: 52,
      unit: "quintals",
      revenue: 104000,
    },
    {
      cropName: "Wheat",
      season: "Rabi",
      year: 2023,
      areaCultivated: 6,
      yieldQuantity: 48,
      unit: "quintals",
      revenue: 96000,
    },
  ],
  equipment: [
    {
      name: "Mahindra 575 DI",
      type: "Tractor",
      ownershipType: "Owned",
      condition: "Good",
    },
    {
      name: "Drip System",
      type: "Irrigation System",
      ownershipType: "Owned",
      condition: "Excellent",
    },
  ],
  enrolledSchemes: [
    {
      schemeName: "PM-KISAN",
      schemeType: "Direct Benefit",
      status: "Active",
      benefits: "₹6,000/year direct bank transfer",
    },
  ],
  loans: [
    {
      loanType: "Crop Loan",
      bankName: "SBI",
      amount: 150000,
      interestRate: 4,
      status: "Active",
    },
  ],
  aiRecommendations: [
    {
      type: "Crop",
      title: "Switch to Zero-Till Wheat",
      description: "Save ₹2,400/acre in preparation costs.",
      isRead: false,
    },
  ],
  weatherAlerts: [
    {
      alertType: "Heavy Rain",
      severity: "Medium",
      message: "Heavy rainfall expected Feb 27–28.",
      isRead: false,
    },
  ],
  transactions: [
    {
      type: "Crop Sale",
      amount: 104000,
      description: "Rice sale – Varanasi Mandi",
      status: "Completed",
      date: "2023-11-10",
    },
  ],
};

const TABS = [
  "Overview",
  "Crops",
  "Land & Equipment",
  "Finance",
  "Schemes",
  "AI Insights",
  "Documents",
  "Settings",
];

const HEALTH_COLOR = {
  Healthy: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
  },
  "At Risk": {
    bg: "bg-orange-50",
    text: "text-orange-700",
    border: "border-orange-200",
  },
};

const STAGE_WIDTH = {
  Sowing: "10%",
  Germination: "25%",
  Vegetative: "50%",
  Flowering: "70%",
  Fruiting: "85%",
  Harvesting: "100%",
};

/* ── HELPERS ── */
const StatBox = ({ label, value, sub, accent }) => (
  <div
    className={`flex flex-col gap-1 p-4 rounded-sm border ${accent ? "bg-emerald-900 border-emerald-800" : "bg-white border-emerald-100 shadow-sm"}`}
  >
    <p
      className={`text-[9px] uppercase tracking-widest font-bold ${accent ? "text-emerald-400" : "text-emerald-600"}`}
    >
      {label}
    </p>
    <p
      className={`text-2xl font-black leading-none font-['Playfair_Display'] ${accent ? "text-white" : "text-emerald-950"}`}
    >
      {value}
    </p>
    {sub && (
      <p
        className={`text-[10px] mt-0.5 ${accent ? "text-emerald-300" : "text-emerald-500"}`}
      >
        {sub}
      </p>
    )}
  </div>
);

const SectionTitle = ({ children }) => (
  <div className="flex items-center gap-3 mb-6">
    <div className="h-0.5 w-8 bg-emerald-800" />
    <p className="text-[11px] uppercase tracking-[0.25em] font-black text-emerald-900">
      {children}
    </p>
    <div className="h-px flex-1 bg-emerald-100" />
  </div>
);

/* ── DOCUMENTS TAB ── */
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

const PERSONAL_DOC_TYPES = [
  "Aadhaar Card",
  "PAN Card",
  "Voter ID",
  "Passport",
  "Driving License",
  "Ration Card",
  "Bank Passbook",
  "Other",
];

const LAND_DOC_TYPES = [
  "Land Ownership Certificate",
  "Khasra / Khatauni",
  "Land Revenue Receipt",
  "Crop Insurance Document",
  "Soil Test Report",
  "Seed Certificate",
  "Fertilizer Invoice",
  "Other",
];

const DocumentsTab = ({ currentUser, onProfileUpdated }) => {
  const { logout } = useUser();
  const { n } = useLanguage();
  const [personalDocs, setPersonalDocs] = useState([]);
  const [landDocs, setLandDocs] = useState([]);
  const [otherDocs, setOtherDocs] = useState([]);
  const [uploadingCategory, setUploadingCategory] = useState(null);
  const [parsedSuggestion, setParsedSuggestion] = useState(null);
  const [formValues, setFormValues] = useState(null);
  const [formCategory, setFormCategory] = useState(null);
  const [applyLoading, setApplyLoading] = useState(false);
  const [error, setError] = useState(null);

  // Document type selection state
  const [personalDocType, setPersonalDocType] = useState("");
  const [personalDocTypeCustom, setPersonalDocTypeCustom] = useState("");
  const [landDocType, setLandDocType] = useState("");
  const [landDocTypeCustom, setLandDocTypeCustom] = useState("");

  // Toast notification styles matching your theme
  const toastStyles = {
    success: {
      style: { background: "#10b981", color: "white" },
      icon: "🌱",
      progressStyle: { background: "#064e3b" },
    },
    error: {
      style: { background: "#ef4444", color: "white" },
      icon: "⚠️",
      progressStyle: { background: "#7f1d1d" },
    },
    warning: {
      style: { background: "#f59e0b", color: "white" },
      icon: "🌾",
      progressStyle: { background: "#92400e" },
    },
    info: {
      style: { background: "#059669", color: "white" },
      icon: "📋",
      progressStyle: { background: "#065f46" },
    },
  };

  // Load existing documents from backend on mount
  useEffect(() => {
    const loadExistingDocs = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/user/documents`, {
          withCredentials: true,
        });
        const docs = res.data?.documents || [];
        const personal = [];
        const land = [];
        const other = [];

        docs.forEach((d) => {
          const base = {
            id: d._id || d.publicId || `${Date.now()}-${Math.random()}`,
            name: d.fileName,
            size: d.fileSize,
            type: d.fileType,
            url: d.url,
            docType: d.docType || "",
            uploadedAt: new Date(
              d.metadata?.uploadedAt || Date.now(),
            ).toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            }),
          };
          if (d.fileCategory === "identity_document") {
            personal.push(base);
          } else if (d.fileCategory === "land_document") {
            land.push(base);
          } else {
            other.push(base);
          }
        });

        setPersonalDocs(personal);
        setLandDocs(land);
        setOtherDocs(other);
      } catch (err) {
        console.error("LOAD_DOCUMENTS_ERROR:", err);
        toast.error("Failed to load documents", {
          position: "top-right",
          autoClose: 3000,
          style: toastStyles.error.style,
          progressStyle: toastStyles.error.progressStyle,
          icon: toastStyles.error.icon,
        });
      }
    };

    loadExistingDocs();
  }, []);

  const handleDownload = async (url, filename) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = filename || "document";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);

      toast.success("Download started", {
        position: "top-right",
        autoClose: 2000,
        style: toastStyles.success.style,
        progressStyle: toastStyles.success.progressStyle,
        icon: toastStyles.success.icon,
      });
    } catch (err) {
      console.error("DOWNLOAD_ERROR:", err);
      // Fallback
      window.open(url, "_blank");
      toast.info("Opening in new tab", {
        position: "top-right",
        autoClose: 2000,
        style: toastStyles.info.style,
        progressStyle: toastStyles.info.progressStyle,
        icon: toastStyles.info.icon,
      });
    }
  };

  const buildInitialFormValues = (parsed) => {
    if (!parsed || !parsed.category || !parsed.fields) return null;
    const user = currentUser || {};

    if (parsed.category === "personal") {
      const address = parsed.fields.address || {};
      const existingAddr = user.address || {};
      return {
        fullName: parsed.fields.fullName || user.fullName || "",
        // email is intentionally NOT editable via this form
        phoneNumber: parsed.fields.phoneNumber || user.phoneNumber || "",
        dateOfBirthRaw:
          parsed.fields.dateOfBirthRaw ||
          (user.dateOfBirth
            ? new Date(user.dateOfBirth).toLocaleDateString("en-GB")
            : ""),
        address: {
          village: address.village || existingAddr.village || "",
          district: address.district || existingAddr.district || "",
          state: address.state || existingAddr.state || "",
          pincode: address.pincode || existingAddr.pincode || "",
        },
      };
    }

    if (parsed.category === "land") {
      const existing = user.landHoldings || {};
      return {
        totalLandArea:
          parsed.fields.totalLandArea ?? existing.totalLandArea ?? "",
        unit: parsed.fields.unit || existing.unit || "acres",
        soilType: parsed.fields.soilType || existing.soilType || "",
      };
    }

    if (parsed.category === "crop") {
      const crops = Array.isArray(parsed.fields.currentCrops)
        ? parsed.fields.currentCrops
        : [];
      return {
        currentCrops: crops.map((c) => ({
          cropName: c.cropName || "",
          area: c.area ?? "",
        })),
      };
    }

    return null;
  };

  const handleUpload = async (files, category, docType) => {
    if (!files || !files.length) return;

    // Require document type selection before upload
    if (!docType) {
      toast.warning("Please select a document type before uploading.", {
        position: "top-right",
        autoClose: 3000,
        style: toastStyles.warning.style,
        progressStyle: toastStyles.warning.progressStyle,
        icon: "📋",
      });
      return;
    }

    setError(null);
    setParsedSuggestion(null);
    setFormValues(null);
    setFormCategory(null);
    setUploadingCategory(category);

    const formData = new FormData();
    files.forEach((file) => {
      formData.append("documents", file);
    });
    formData.append("category", category);
    formData.append("docType", docType);

    try {
      const response = await axios.post(
        `${API_URL}/api/user/documents`,
        formData,
        {
          withCredentials: true,
        },
      );

      // ✅ FIX: Access 'documents' from response.data, not 'document'
      const docs = response.data?.documents || [];

      const mapped = docs.map((d) => ({
        id: d._id || d.publicId || `${Date.now()}-${Math.random()}`,
        name: d.fileName,
        size: d.fileSize,
        type: d.fileType,
        url: d.url,
        docType: d.docType || docType,
        uploadedAt: new Date(
          d.metadata?.uploadedAt || Date.now(),
        ).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
      }));

      if (category === "personal") {
        setPersonalDocs((prev) => [...prev, ...mapped]);
        const pointsMsg = response.data?.points?.pointsAdded 
          ? ` 🪙 +${n(response.data.points.pointsAdded)} points`
          : '';
        toast.success(
          `📄 ${n(files.length)} personal document${files.length > 1 ? "s" : ""} uploaded${pointsMsg}`,
          {
            position: "top-right",
            autoClose: 3000,
            style: toastStyles.success.style,
            progressStyle: toastStyles.success.progressStyle,
            icon: "📑",
          },
        );
      } else if (category === "land") {
        setLandDocs((prev) => [...prev, ...mapped]);
        const pointsMsg = response.data?.points?.pointsAdded 
          ? ` 🪙 +${n(response.data.points.pointsAdded)} points`
          : '';
        toast.success(
          `🌾 ${n(files.length)} land document${files.length > 1 ? "s" : ""} uploaded${pointsMsg}`,
          {
            position: "top-right",
            autoClose: 3000,
            style: toastStyles.success.style,
            progressStyle: toastStyles.success.progressStyle,
            icon: "🌱",
          },
        );
      }

      // Handle parsed data if present
      if (response.data?.parsed) {
        setParsedSuggestion(response.data.parsed);
        setFormCategory(response.data.parsed.category);
        setFormValues(buildInitialFormValues(response.data.parsed));

        toast.info(
          "Document parsed successfully! Review extracted information.",
          {
            position: "top-right",
            autoClose: 5000,
            style: toastStyles.info.style,
            progressStyle: toastStyles.info.progressStyle,
            icon: "🔍",
          },
        );
      }
    } catch (err) {
      console.error("DOCUMENT_UPLOAD_ERROR:", err);
      if (err.response?.status === 401) {
        setError("Your session has expired. Please log in again.");
        toast.error("Session expired. Please log in again.", {
          position: "top-right",
          autoClose: 3000,
          style: toastStyles.error.style,
          progressStyle: toastStyles.error.progressStyle,
          icon: toastStyles.error.icon,
        });
        await logout();
      } else {
        setError(
          err.response?.data?.msg ||
            "Failed to upload and parse document. Please try again.",
        );
        toast.error("Upload failed. Please try again.", {
          position: "top-right",
          autoClose: 3000,
          style: toastStyles.error.style,
          progressStyle: toastStyles.error.progressStyle,
          icon: toastStyles.error.icon,
        });
      }
    } finally {
      setUploadingCategory(null);
    }
  };

  const addPersonal = (files) => {
    const resolvedType = personalDocType === "Other" ? personalDocTypeCustom.trim() : personalDocType;
    handleUpload(files, "personal", resolvedType);
  };
  const addLand = (files) => {
    const resolvedType = landDocType === "Other" ? landDocTypeCustom.trim() : landDocType;
    handleUpload(files, "land", resolvedType);
  };

  const removePersonal = async (fileName) => {
    const docToDelete = personalDocs.find((d) => d.name === fileName);
    if (docToDelete && docToDelete.id) {
      try {
        const response = await axios.delete(`${API_URL}/api/user/documents/${docToDelete.id}`, {
          withCredentials: true,
        });
        setPersonalDocs((prev) => prev.filter((d) => d.name !== fileName));
        const pointsMsg = response.data?.points?.pointsDeducted 
          ? ` 🪙 -${n(response.data.points.pointsDeducted)} points`
          : '';
        toast.warning(`Document removed${pointsMsg}`, {
          position: "top-right",
          autoClose: 2000,
          style: toastStyles.warning.style,
          progressStyle: toastStyles.warning.progressStyle,
          icon: "🗑️",
        });
      } catch (err) {
        console.error("FAIL_DELETE_PERSONAL:", err);
        setError("Failed to delete document from server.");
        toast.error("Failed to remove document", {
          position: "top-right",
          autoClose: 3000,
          style: toastStyles.error.style,
          progressStyle: toastStyles.error.progressStyle,
          icon: toastStyles.error.icon,
        });
      }
    } else {
      setPersonalDocs((prev) => prev.filter((d) => d.name !== fileName));
    }
  };

  const removeLand = async (fileName) => {
    const docToDelete = landDocs.find((d) => d.name === fileName);
    if (docToDelete && docToDelete.id) {
      try {
        const response = await axios.delete(`${API_URL}/api/user/documents/${docToDelete.id}`, {
          withCredentials: true,
        });
        setLandDocs((prev) => prev.filter((d) => d.name !== fileName));
        const pointsMsg = response.data?.points?.pointsDeducted 
          ? ` 🪙 -${n(response.data.points.pointsDeducted)} points`
          : '';
        toast.warning(`Document removed${pointsMsg}`, {
          position: "top-right",
          autoClose: 2000,
          style: toastStyles.warning.style,
          progressStyle: toastStyles.warning.progressStyle,
          icon: "🗑️",
        });
      } catch (err) {
        console.error("FAIL_DELETE_LAND:", err);
        setError("Failed to delete document from server.");
        toast.error("Failed to remove document", {
          position: "top-right",
          autoClose: 3000,
          style: toastStyles.error.style,
          progressStyle: toastStyles.error.progressStyle,
          icon: toastStyles.error.icon,
        });
      }
    } else {
      setLandDocs((prev) => prev.filter((d) => d.name !== fileName));
    }
  };

  const removeAllPersonal = () => setPersonalDocs([]);
  const removeAllLand = () => setLandDocs([]);
  const removeAllOther = () => setOtherDocs([]);

  const handleApplyParsed = async () => {
    if (!parsedSuggestion || !formValues) return;
    setApplyLoading(true);
    setError(null);

    try {
      let fieldsPayload = {};
      if (formCategory === "personal") {
        fieldsPayload = {
          fullName: formValues.fullName,
          // email intentionally omitted – cannot be changed by parsing
          phoneNumber: formValues.phoneNumber,
          dateOfBirthRaw: formValues.dateOfBirthRaw,
          address: {
            village: formValues.address?.village,
            district: formValues.address?.district,
            state: formValues.address?.state,
            pincode: formValues.address?.pincode,
          },
        };
      } else if (formCategory === "land") {
        fieldsPayload = {
          totalLandArea:
            formValues.totalLandArea === ""
              ? undefined
              : Number(formValues.totalLandArea),
          unit: formValues.unit,
          soilType: formValues.soilType,
        };
      } else if (formCategory === "crop") {
        fieldsPayload = {
          currentCrops: (formValues.currentCrops || []).map((c) => ({
            cropName: c.cropName,
            area: c.area === "" ? undefined : Number(c.area),
          })),
        };
      }

      const res = await axios.post(
        `${API_URL}/api/user/documents/apply-parsed`,
        {
          category: formCategory || parsedSuggestion.category,
          fields: fieldsPayload,
        },
        { withCredentials: true },
      );

      if (res.data?.success && res.data.user && onProfileUpdated) {
        onProfileUpdated(res.data.user);
      }

      setParsedSuggestion(null);
      setFormValues(null);
      setFormCategory(null);

      toast.success("✨ Profile updated with document information!", {
        position: "top-right",
        autoClose: 4000,
        style: toastStyles.success.style,
        progressStyle: toastStyles.success.progressStyle,
        icon: "✅",
      });
    } catch (err) {
      console.error("APPLY_PARSED_ERROR:", err);
      if (err.response?.status === 401) {
        setError("Your session has expired. Please log in again.");
        toast.error("Session expired. Please log in again.", {
          position: "top-right",
          autoClose: 3000,
          style: toastStyles.error.style,
          progressStyle: toastStyles.error.progressStyle,
          icon: toastStyles.error.icon,
        });
        await logout();
      } else {
        setError(
          err.response?.data?.msg ||
            "Failed to apply document details to your profile.",
        );
        toast.error("Failed to update profile", {
          position: "top-right",
          autoClose: 3000,
          style: toastStyles.error.style,
          progressStyle: toastStyles.error.progressStyle,
          icon: toastStyles.error.icon,
        });
      }
    } finally {
      setApplyLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-10"
    >
      {/* Top notice banner */}
      <div className="flex items-start gap-4 p-4 rounded-sm border border-emerald-200 bg-emerald-50">
        <span className="text-emerald-800 text-base mt-0.5">🔐</span>
        <div>
          <p className="text-xs font-black text-emerald-900">
            Secure Document Vault
          </p>
          <p className="text-[10px] text-emerald-600 mt-0.5 leading-relaxed">
            All uploaded documents are encrypted and stored securely. Only you
            and authorized agents can access them. Accepted formats: PDF, JPG,
            PNG, DOC, DOCX.
          </p>
          {error && <p className="text-[10px] text-red-600 mt-1">{error}</p>}
        </div>
      </div>

      {/* Summary row */}
      <div className="grid grid-cols-2 gap-px bg-emerald-100 border border-emerald-100 rounded-sm overflow-hidden shadow-sm">
        <div className="bg-white p-5">
          <StatBox
            label="Personal Documents"
            value={n(personalDocs.length)}
            sub="Identity & KYC Records"
          />
        </div>
        <div className="bg-white p-5">
          <StatBox
            label="Land & Crop Documents"
            value={n(landDocs.length)}
            sub="Property & Agricultural Records"
            accent
          />
        </div>
      </div>

      {parsedSuggestion && formValues && (
        <div className="border border-emerald-200 bg-emerald-50 rounded-sm p-4 space-y-3">
          <p className="text-[10px] uppercase tracking-[0.18em] font-black text-emerald-800">
            Confirm details from document
          </p>

          {formCategory === "personal" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[11px] text-emerald-900">
              <div className="space-y-2">
                <label className="block">
                  <span className="block font-semibold mb-1">Full Name</span>
                  <input
                    type="text"
                    className="w-full border border-emerald-200 rounded-sm px-2 py-1 text-[11px] bg-white"
                    value={formValues.fullName}
                    onChange={(e) =>
                      setFormValues((p) => ({ ...p, fullName: e.target.value }))
                    }
                  />
                </label>
                <label className="block">
                  <span className="block font-semibold mb-1">Phone</span>
                  <input
                    type="text"
                    className="w-full border border-emerald-200 rounded-sm px-2 py-1 text-[11px] bg-white"
                    value={formValues.phoneNumber}
                    onChange={(e) =>
                      setFormValues((p) => ({
                        ...p,
                        phoneNumber: e.target.value,
                      }))
                    }
                  />
                </label>
                <label className="block">
                  <span className="block font-semibold mb-1">
                    Date of Birth
                  </span>
                  <input
                    type="text"
                    className="w-full border border-emerald-200 rounded-sm px-2 py-1 text-[11px] bg-white"
                    placeholder="DD/MM/YYYY"
                    value={formValues.dateOfBirthRaw}
                    onChange={(e) =>
                      setFormValues((p) => ({
                        ...p,
                        dateOfBirthRaw: e.target.value,
                      }))
                    }
                  />
                </label>
              </div>

              <div className="space-y-2">
                <label className="block">
                  <span className="block font-semibold mb-1">
                    Email (unchanged)
                  </span>
                  <input
                    type="text"
                    className="w-full border border-emerald-100 rounded-sm px-2 py-1 text-[11px] bg-emerald-50 text-emerald-700 cursor-not-allowed"
                    value={currentUser?.email || ""}
                    disabled
                  />
                </label>
                <label className="block">
                  <span className="block font-semibold mb-1">Village</span>
                  <input
                    type="text"
                    className="w-full border border-emerald-200 rounded-sm px-2 py-1 text-[11px] bg-white"
                    value={formValues.address?.village || ""}
                    onChange={(e) =>
                      setFormValues((p) => ({
                        ...p,
                        address: {
                          ...(p.address || {}),
                          village: e.target.value,
                        },
                      }))
                    }
                  />
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <label className="block col-span-1">
                    <span className="block font-semibold mb-1">District</span>
                    <input
                      type="text"
                      className="w-full border border-emerald-200 rounded-sm px-2 py-1 text-[11px] bg-white"
                      value={formValues.address?.district || ""}
                      onChange={(e) =>
                        setFormValues((p) => ({
                          ...p,
                          address: {
                            ...(p.address || {}),
                            district: e.target.value,
                          },
                        }))
                      }
                    />
                  </label>
                  <label className="block col-span-1">
                    <span className="block font-semibold mb-1">State</span>
                    <input
                      type="text"
                      className="w-full border border-emerald-200 rounded-sm px-2 py-1 text-[11px] bg-white"
                      value={formValues.address?.state || ""}
                      onChange={(e) =>
                        setFormValues((p) => ({
                          ...p,
                          address: {
                            ...(p.address || {}),
                            state: e.target.value,
                          },
                        }))
                      }
                    />
                  </label>
                  <label className="block col-span-1">
                    <span className="block font-semibold mb-1">Pincode</span>
                    <input
                      type="text"
                      className="w-full border border-emerald-200 rounded-sm px-2 py-1 text-[11px] bg-white"
                      value={formValues.address?.pincode || ""}
                      onChange={(e) =>
                        setFormValues((p) => ({
                          ...p,
                          address: {
                            ...(p.address || {}),
                            pincode: e.target.value,
                          },
                        }))
                      }
                    />
                  </label>
                </div>
              </div>
            </div>
          )}

          {formCategory === "land" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-[11px] text-emerald-900">
              <label className="block">
                <span className="block font-semibold mb-1">
                  Total Land Area
                </span>
                <input
                  type="number"
                  step="0.01"
                  className="w-full border border-emerald-200 rounded-sm px-2 py-1 text-[11px] bg-white"
                  value={formValues.totalLandArea}
                  onChange={(e) =>
                    setFormValues((p) => ({
                      ...p,
                      totalLandArea: e.target.value,
                    }))
                  }
                />
              </label>
              <label className="block">
                <span className="block font-semibold mb-1">Unit</span>
                <select
                  className="w-full border border-emerald-200 rounded-sm px-2 py-1 text-[11px] bg-white"
                  value={formValues.unit}
                  onChange={(e) =>
                    setFormValues((p) => ({ ...p, unit: e.target.value }))
                  }
                >
                  <option value="acres">Acres</option>
                  <option value="hectares">Hectares</option>
                </select>
              </label>
              <label className="block">
                <span className="block font-semibold mb-1">Soil Type</span>
                <input
                  type="text"
                  className="w-full border border-emerald-200 rounded-sm px-2 py-1 text-[11px] bg-white"
                  value={formValues.soilType}
                  onChange={(e) =>
                    setFormValues((p) => ({
                      ...p,
                      soilType: e.target.value,
                    }))
                  }
                />
              </label>
            </div>
          )}

          {formCategory === "crop" && (
            <div className="space-y-2 text-[11px] text-emerald-900">
              <p className="font-semibold">Crop details</p>
              <div className="space-y-1">
                {(formValues.currentCrops || []).map((c, idx) => (
                  <div
                    key={idx}
                    className="grid grid-cols-[2fr_1fr] gap-2 items-center"
                  >
                    <input
                      type="text"
                      className="border border-emerald-200 rounded-sm px-2 py-1 text-[11px] bg-white"
                      placeholder="Crop name"
                      value={c.cropName}
                      onChange={(e) =>
                        setFormValues((p) => {
                          const next = [...(p.currentCrops || [])];
                          next[idx] = {
                            ...next[idx],
                            cropName: e.target.value,
                          };
                          return { ...p, currentCrops: next };
                        })
                      }
                    />
                    <input
                      type="number"
                      step="0.01"
                      className="border border-emerald-200 rounded-sm px-2 py-1 text-[11px] bg-white"
                      placeholder="Area"
                      value={c.area}
                      onChange={(e) =>
                        setFormValues((p) => {
                          const next = [...(p.currentCrops || [])];
                          next[idx] = { ...next[idx], area: e.target.value };
                          return { ...p, currentCrops: next };
                        })
                      }
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center gap-3 pt-1">
            <button
              type="button"
              disabled={applyLoading}
              onClick={handleApplyParsed}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-sm bg-emerald-900 text-[11px] font-bold uppercase tracking-widest text-emerald-50 disabled:opacity-60"
            >
              {applyLoading ? "Saving…" : "Save & update profile"}
            </button>
            <button
              type="button"
              onClick={() => {
                setParsedSuggestion(null);
                setFormValues(null);
                setFormCategory(null);
                toast.info("Changes discarded", {
                  position: "top-right",
                  autoClose: 2000,
                  style: toastStyles.info.style,
                  progressStyle: toastStyles.info.progressStyle,
                  icon: "↩️",
                });
              }}
              className="text-[11px] text-emerald-700 underline underline-offset-2"
            >
              Ignore for now
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Personal Documents Section */}
        <div className="space-y-4">
          <SectionTitle>Personal Documents</SectionTitle>
          <FileUpload
            files={personalDocs}
            onAdd={addPersonal}
            onRemove={removePersonal}
            onRemoveAll={removeAllPersonal}
            uploading={uploadingCategory === "personal"}
            docTypeSelector={
              <div className="space-y-2">
                <label className="block text-[11px] font-bold text-emerald-900 uppercase tracking-widest">
                  Document Type
                </label>
                <select
                  value={personalDocType}
                  onChange={(e) => {
                    setPersonalDocType(e.target.value);
                    if (e.target.value !== "Other") setPersonalDocTypeCustom("");
                  }}
                  className="w-full border border-emerald-200 rounded-lg px-3 py-2 text-[12px] bg-white text-emerald-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">Select document type…</option>
                  {PERSONAL_DOC_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
                {personalDocType === "Other" && (
                  <input
                    type="text"
                    placeholder="Enter document type…"
                    value={personalDocTypeCustom}
                    onChange={(e) => setPersonalDocTypeCustom(e.target.value)}
                    className="w-full border border-emerald-200 rounded-lg px-3 py-2 text-[12px] bg-white text-emerald-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                )}
              </div>
            }
          />
        </div>

        {/* Land & Crop Documents Section */}
        <div className="space-y-4">
          <SectionTitle>Land & Crop Documents</SectionTitle>
          <FileUpload
            files={landDocs}
            onAdd={addLand}
            onRemove={removeLand}
            onRemoveAll={removeAllLand}
            uploading={uploadingCategory === "land"}
            docTypeSelector={
              <div className="space-y-2">
                <label className="block text-[11px] font-bold text-emerald-900 uppercase tracking-widest">
                  Document Type
                </label>
                <select
                  value={landDocType}
                  onChange={(e) => {
                    setLandDocType(e.target.value);
                    if (e.target.value !== "Other") setLandDocTypeCustom("");
                  }}
                  className="w-full border border-emerald-200 rounded-lg px-3 py-2 text-[12px] bg-white text-emerald-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">Select document type…</option>
                  {LAND_DOC_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
                {landDocType === "Other" && (
                  <input
                    type="text"
                    placeholder="Enter document type…"
                    value={landDocTypeCustom}
                    onChange={(e) => setLandDocTypeCustom(e.target.value)}
                    className="w-full border border-emerald-200 rounded-lg px-3 py-2 text-[12px] bg-white text-emerald-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                )}
              </div>
            }
          />
        </div>
      </div>

      {/* Other Documents (e.g. uploaded during registration) */}
      {otherDocs.length > 0 && (
        <div className="space-y-4">
          <SectionTitle>Uploaded Documents</SectionTitle>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[11px]">
            {otherDocs.map((d) => (
              <div
                key={d.id}
                className="flex items-center justify-between gap-3 px-3 py-2 rounded-sm border border-emerald-100 bg-white"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-emerald-900 truncate">
                      {d.name}
                    </p>
                    {d.docType && (
                      <span className="text-[9px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-full shrink-0">
                        {d.docType}
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-emerald-500">
                    {d.uploadedAt} · {n((d.size / (1024 * 1024)).toFixed(2))} MB
                  </p>
                </div>
                {d.url && (
                  <div className="flex items-center gap-2 shrink-0">
                    <a
                      href={d.url}
                      target="_blank"
                      rel="noreferrer"
                      className="px-2 py-1 rounded-sm border border-emerald-200 text-emerald-800 hover:bg-emerald-50"
                    >
                      View
                    </a>
                    <button
                      type="button"
                      onClick={() => handleDownload(d.url, d.name)}
                      className="px-2 py-1 rounded-sm bg-emerald-900 text-emerald-50"
                    >
                      Download
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Document library with view/download */}
      <div className="space-y-4">
        <SectionTitle>Saved Documents</SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[11px]">
          <div className="space-y-2">
            <p className="font-semibold text-emerald-900">Personal</p>
            {personalDocs.length === 0 && (
              <p className="text-emerald-500">
                No personal documents uploaded yet.
              </p>
            )}
            {personalDocs.map((d) => (
              <div
                key={d.id}
                className="flex items-center justify-between gap-3 px-3 py-2 rounded-sm border border-emerald-100 bg-white"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-emerald-900 truncate">
                      {d.name}
                    </p>
                    {d.docType && (
                      <span className="text-[9px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-full shrink-0">
                        {d.docType}
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-emerald-500">
                    {d.uploadedAt} · {n((d.size / (1024 * 1024)).toFixed(2))} MB
                  </p>
                </div>
                {d.url && (
                  <div className="flex items-center gap-2 shrink-0">
                    <a
                      href={d.url}
                      target="_blank"
                      rel="noreferrer"
                      className="px-2 py-1 rounded-sm border border-emerald-200 text-emerald-800 hover:bg-emerald-50"
                    >
                      View
                    </a>
                    <button
                      type="button"
                      onClick={() => handleDownload(d.url, d.name)}
                      className="px-2 py-1 rounded-sm bg-emerald-900 text-emerald-50"
                    >
                      Download
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <p className="font-semibold text-emerald-900">Land & Crop</p>
            {landDocs.length === 0 && (
              <p className="text-emerald-500">
                No land or crop documents uploaded yet.
              </p>
            )}
            {landDocs.map((d) => (
              <div
                key={d.id}
                className="flex items-center justify-between gap-3 px-3 py-2 rounded-sm border border-emerald-100 bg-white"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-emerald-900 truncate">
                      {d.name}
                    </p>
                    {d.docType && (
                      <span className="text-[9px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-full shrink-0">
                        {d.docType}
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-emerald-500">
                    {d.uploadedAt} · {n((d.size / (1024 * 1024)).toFixed(2))} MB
                  </p>
                </div>
                {d.url && (
                  <div className="flex items-center gap-2 shrink-0">
                    <a
                      href={d.url}
                      target="_blank"
                      rel="noreferrer"
                      className="px-2 py-1 rounded-sm border border-emerald-200 text-emerald-800 hover:bg-emerald-50"
                    >
                      View
                    </a>
                    <button
                      type="button"
                      onClick={() => handleDownload(d.url, d.name)}
                      className="px-2 py-1 rounded-sm bg-emerald-900 text-emerald-50"
                    >
                      Download
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

/* ── OVERVIEW TAB ── */
const OverviewTab = ({ user }) => {
  const { n } = useLanguage();
  const totalRevenue = (user?.cropsHistory || []).reduce(
    (s, c) => s + (c?.revenue || 0),
    0,
  );
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-10"
    >
      <div>
        <SectionTitle>Estate Performance</SectionTitle>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-emerald-100 border border-emerald-100 rounded-sm overflow-hidden shadow-sm">
          <div className="bg-white p-6">
            <StatBox
              label="Total Land"
              value={`${n(user?.landHoldings?.totalLandArea ?? 0)} ac`}
              sub="Managed Territory"
            />
          </div>
          <div className="bg-white p-6">
            <StatBox
              label="Experience"
              value={`${n(user?.farmingExperience ?? 0)} yrs`}
              sub="Master Cultivator"
            />
          </div>
          <div className="bg-white p-6">
            <StatBox
              label="Net Revenue"
              value={`₹${n((totalRevenue / 1000).toFixed(0))}K`}
              sub="Current Season"
              accent
            />
          </div>
          <div className="bg-white p-6">
            <StatBox
              label="Active Crops"
              value={n((user?.currentCrops || []).length)}
              sub="Biological Assets"
            />
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <SectionTitle>Current Cultivation</SectionTitle>
          <div className="space-y-3">
            {(user?.currentCrops || []).map((crop, i) => (
              <div
                key={i}
                className="flex items-center gap-4 p-4 rounded-sm border border-emerald-100 bg-white hover:border-emerald-300 transition-all group"
              >
                <div className="w-12 h-12 rounded-sm bg-emerald-50 flex items-center justify-center text-xl border border-emerald-100 group-hover:bg-emerald-100">
                  {crop.cropName === "Wheat" ? "🌾" : "🌻"}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <p className="text-sm font-black text-emerald-950">
                      {crop.cropName}{" "}
                      <span className="text-[10px] font-normal text-emerald-500 ml-2">
                        {crop.variety}
                      </span>
                    </p>
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-sm border ${HEALTH_COLOR[crop.healthStatus]?.bg} ${HEALTH_COLOR[crop.healthStatus]?.text} ${HEALTH_COLOR[crop.healthStatus]?.border}`}
                    >
                      {crop.healthStatus}
                    </span>
                  </div>
                  <div className="h-1 bg-emerald-50 rounded-sm overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: STAGE_WIDTH[crop.stage] || "0%" }}
                      className="h-full bg-emerald-800"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <SectionTitle>Risk Intelligence</SectionTitle>
          <div className="space-y-3">
            {(user?.weatherAlerts || []).map((a, i) => (
              <div
                key={i}
                className="p-4 rounded-sm border-l-4 border-l-emerald-800 border border-emerald-100 bg-white shadow-sm"
              >
                <p className="text-[10px] font-black text-emerald-900 uppercase tracking-widest mb-1">
                  {a.alertType}
                </p>
                <p className="text-xs text-emerald-700 leading-relaxed">
                  {a.message}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

/* ── SETTINGS TAB ── */
const SettingsTab = () => {
  const { language, setLanguage, t, supportedLanguages } = useLanguage();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      {/* Language Preference Section */}
      <div className="bg-white border border-emerald-100 rounded-lg p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-1">
          <span className="text-lg">🌐</span>
          <h3 className="font-bold text-emerald-950 text-lg">
            {t("settings.languagePreference")}
          </h3>
        </div>
        <p className="text-emerald-600 text-sm mb-6 ml-8">
          {t("settings.languageDesc")}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 ml-8">
          {supportedLanguages.map((lang) => {
            const isActive = language === lang.code;
            return (
              <button
                key={lang.code}
                onClick={() => setLanguage(lang.code)}
                className={`relative flex flex-col items-center gap-1 px-5 py-4 rounded-xl border-2 transition-all duration-200 cursor-pointer
                  ${
                    isActive
                      ? "border-emerald-600 bg-emerald-50 shadow-md"
                      : "border-emerald-100 bg-white hover:border-emerald-300 hover:bg-emerald-50/50"
                  }`}
              >
                {isActive && (
                  <span className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-emerald-500" />
                )}
                <span className="text-base font-bold text-emerald-900">
                  {lang.nativeLabel}
                </span>
                <span className="text-[11px] text-emerald-500 font-medium">
                  {lang.label}
                </span>
              </button>
            );
          })}
        </div>

        <p className="text-[11px] text-emerald-400 mt-4 ml-8 font-medium">
          {t("settings.currentLanguage")}:{" "}
          <span className="text-emerald-700 font-bold">
            {supportedLanguages.find((l) => l.code === language)?.nativeLabel}
          </span>
        </p>
      </div>
    </motion.div>
  );
};

const TAB_CONTENT = {
  Overview: OverviewTab,
  Crops: () => (
    <div className="text-emerald-900 p-10 text-center font-bold">
      Crop Detailed Ledger (Premium View)
    </div>
  ),
  "Land & Equipment": () => (
    <div className="text-emerald-900 p-10 text-center font-bold">
      Asset Management
    </div>
  ),
  Finance: () => (
    <div className="text-emerald-900 p-10 text-center font-bold">
      Financial Statements
    </div>
  ),
  Schemes: () => (
    <div className="text-emerald-900 p-10 text-center font-bold">
      Government Liaisons
    </div>
  ),
  "AI Insights": () => (
    <div className="text-emerald-900 p-10 text-center font-bold">
      Neural Engine Recommendations
    </div>
  ),
  Documents: DocumentsTab,
  Settings: SettingsTab,
};

/* ─────────────────────────────────────────
   MAIN PROFILE PAGE
───────────────────────────────────────── */
export default function Profile() {
  const [activeTab, setActiveTab] = useState("Overview");
  const { user, setUserFromApi } = useUser();
  const { setLanguage: setGlobalLanguage, t, n } = useLanguage();
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [profileImagePreview, setProfileImagePreview] = useState(null);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const fileInputRef = useRef(null);
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

  // Toast notification styles matching your theme
  const toastStyles = {
    success: {
      style: { background: "#10b981", color: "white" },
      icon: "🌱",
      progressStyle: { background: "#064e3b" },
    },
    error: {
      style: { background: "#ef4444", color: "white" },
      icon: "⚠️",
      progressStyle: { background: "#7f1d1d" },
    },
    warning: {
      style: { background: "#f59e0b", color: "white" },
      icon: "🌾",
      progressStyle: { background: "#92400e" },
    },
    info: {
      style: { background: "#059669", color: "white" },
      icon: "📋",
      progressStyle: { background: "#065f46" },
    },
  };

  const storedUser = useMemo(() => {
    try {
      const raw = localStorage.getItem("user");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, []);

  const viewUser = user || storedUser || MOCK_USER;
  const ActiveContent = TAB_CONTENT[activeTab];

  // Initialize form data when edit modal opens
  const handleOpenEditProfile = () => {
    setEditFormData({
      fullName: viewUser?.fullName || "",
      email: viewUser?.email || "",
      phoneNumber: viewUser?.phoneNumber || "",
      dateOfBirth: viewUser?.dateOfBirth || "",
      gender: viewUser?.gender || "",
      farmerType: viewUser?.farmerType || "",
      language: viewUser?.language || "",
    });
    setIsEditingProfile(true);
  };

  // Handle profile image upload
  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size should be less than 5MB", {
        position: "top-right",
        autoClose: 3000,
        style: toastStyles.error.style,
        progressStyle: toastStyles.error.progressStyle,
        icon: toastStyles.error.icon,
      });
      return;
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file", {
        position: "top-right",
        autoClose: 3000,
        style: toastStyles.error.style,
        progressStyle: toastStyles.error.progressStyle,
        icon: toastStyles.error.icon,
      });
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (event) => {
      setProfileImagePreview(event.target.result);
    };
    reader.readAsDataURL(file);

    // Upload to backend
    setIsUploadingImage(true);
    const formData = new FormData();
    formData.append("profileImage", file);

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${API_URL}/api/user/upload-profile-image`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        },
      );

      if (response.data.success) {
        // Update local user state
        const updatedUser = {
          ...viewUser,
          profilePicture: response.data.profilePicture,
        };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        setUserFromApi(updatedUser);
        setProfileImagePreview(null);

        toast.success("🌿 Profile image updated!", {
          position: "top-right",
          autoClose: 3000,
          style: toastStyles.success.style,
          progressStyle: toastStyles.success.progressStyle,
          icon: "📸",
        });
      }
    } catch (error) {
      console.error("Image upload error:", error);
      toast.error(
        "Failed to upload image: " +
          (error.response?.data?.msg || error.message),
        {
          position: "top-right",
          autoClose: 3000,
          style: toastStyles.error.style,
          progressStyle: toastStyles.error.progressStyle,
          icon: toastStyles.error.icon,
        },
      );
      setProfileImagePreview(null);
    } finally {
      setIsUploadingImage(false);
    }
  };

  // Handle profile image removal
  const handleRemoveProfileImage = () => {
    setShowRemoveConfirm(true);
  };

  const confirmRemoveProfileImage = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.delete(`${API_URL}/api/user/profile-image`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        const updatedUser = { ...viewUser, profilePicture: null };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        setUserFromApi(updatedUser);

        toast.warning("Profile image removed", {
          position: "top-right",
          autoClose: 3000,
          style: toastStyles.warning.style,
          progressStyle: toastStyles.warning.progressStyle,
          icon: "🗑️",
        });
      }
    } catch (error) {
      console.error("Image removal error:", error);
      toast.error(
        "Failed to remove image: " +
          (error.response?.data?.msg || error.message),
        {
          position: "top-right",
          autoClose: 3000,
          style: toastStyles.error.style,
          progressStyle: toastStyles.error.progressStyle,
          icon: toastStyles.error.icon,
        },
      );
    }
  };

  // Handle profile form submission
  const handleSaveProfileChanges = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `${API_URL}/api/user/currentuser`,
        editFormData,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (response.data.success) {
        const updatedUser = { ...viewUser, ...editFormData };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        setUserFromApi(updatedUser);
        setIsEditingProfile(false);

        // Sync language context if language was changed
        if (editFormData.language) {
          setGlobalLanguage(editFormData.language);
        }

        toast.success("✨ Profile updated successfully!", {
          position: "top-right",
          autoClose: 3000,
          style: toastStyles.success.style,
          progressStyle: toastStyles.success.progressStyle,
          icon: "✅",
        });
      }
    } catch (error) {
      console.error("Profile update error:", error);
      toast.error(
        "Failed to update profile: " +
          (error.response?.data?.msg || error.message),
        {
          position: "top-right",
          autoClose: 3000,
          style: toastStyles.error.style,
          progressStyle: toastStyles.error.progressStyle,
          icon: toastStyles.error.icon,
        },
      );
    }
  };

  return (
    <div className="min-h-screen max-w-5xl mx-auto bg-[#fcfdfc] font-['Lato'] pb-20">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Lato:wght@300;400;700;900&display=swap');
      `}</style>

      <div className="h-2 bg-emerald-900 max-w-5xl mx-auto" />

      {/* HERO */}
      <div className="max-w-5xl mx-auto px-6 pt-16 pb-12 grid md:grid-cols-[1fr_auto] items-end gap-8 border-b border-emerald-100 mt-7">
        <div>
          {/* Mobile profile image */}
          <div className="flex md:hidden items-center gap-4 mb-6">
            <div className="relative group">
              <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-emerald-200 bg-emerald-50 flex items-center justify-center">
                {profileImagePreview ? (
                  <img
                    src={profileImagePreview}
                    alt="Profile preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <img
                    src={viewUser?.profilePicture?.url || "/default-avatar.svg"}
                    alt={viewUser?.fullName || "Profile photo"}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              {/* Tap overlay for mobile */}
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingImage}
                className="absolute bottom-0 right-0 bg-emerald-600 text-white p-1.5 rounded-full shadow-md border-2 border-white disabled:opacity-50"
                title="Upload image"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>
              {viewUser?.profilePicture?.url && (
                <button
                  onClick={handleRemoveProfileImage}
                  className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-full shadow-md border-2 border-white"
                  title="Remove image"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
            <div>
              <span className="bg-emerald-100 text-emerald-900 text-[10px] font-black px-2 py-1 rounded-sm uppercase tracking-tighter">
                {viewUser?.subscription?.plan || "Premium"} Member
              </span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-3 mb-4">
            <span className="bg-emerald-100 text-emerald-900 text-[10px] font-black px-2 py-1 rounded-sm uppercase tracking-tighter">
              {viewUser?.subscription?.plan || "Premium"} Member
            </span>
            <div className="w-1 h-1 bg-emerald-300 rounded-sm" />
            <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest">
              Master ID: 99281-AG
            </span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <h1 className="font-['Playfair_Display'] text-5xl md:text-6xl font-black text-emerald-950 leading-tight">
              {viewUser?.fullName || "—"}
            </h1>
            <button
              onClick={handleOpenEditProfile}
              className="px-3 py-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 rounded text-xs font-bold uppercase tracking-wider transition-colors"
            >
              ✎ Edit
            </button>
          </div>
          <p className="text-emerald-700 mt-4 max-w-md text-sm leading-relaxed border-l-2 border-emerald-800 pl-4 font-light italic">
            Managing {viewUser?.landHoldings?.totalLandArea ?? 0} acres of{" "}
            {viewUser?.landHoldings?.soilType || "—"} terrain in{" "}
            {viewUser?.address?.village || "—"},{" "}
            {viewUser?.address?.state || "—"}.
          </p>
        </div>
        {/* Shared hidden file input for both mobile & desktop */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="hidden"
        />
        <div className="hidden md:flex items-center gap-5 border-l border-emerald-100 pl-8 py-2">
          <div className="relative group">
            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-emerald-200 bg-emerald-50 flex items-center justify-center cursor-pointer hover:border-emerald-400 transition-colors">
              {profileImagePreview ? (
                <img
                  src={profileImagePreview}
                  alt="Profile preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <img
                  src={viewUser?.profilePicture?.url || "/default-avatar.svg"}
                  alt={viewUser?.fullName || "Profile photo"}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            {/* Hover buttons */}
            <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingImage}
                className="bg-white text-emerald-900 p-1.5 rounded-full hover:bg-emerald-50 transition-colors disabled:opacity-50"
                title="Upload image"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              </button>
              {viewUser?.profilePicture?.url && (
                <button
                  onClick={handleRemoveProfileImage}
                  className="bg-white text-red-600 p-1.5 rounded-full hover:bg-red-50 transition-colors"
                  title="Remove image"
                >
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M6 18L18 6M6 6l12 12"
                      stroke="currentColor"
                      strokeWidth={2}
                    />
                  </svg>
                </button>
              )}
            </div>
          </div>
          <div className="text-right">
            <p className="text-[9px] uppercase font-black text-emerald-400">
              Soil Health
            </p>
            <p className="text-lg font-black text-emerald-900 italic">
              Optimal
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 mt-12">
        {/* SUMMARY GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-emerald-100 border border-emerald-100 rounded-sm overflow-hidden mb-12 shadow-sm">
          <div className="bg-white p-6 flex items-center gap-4">
            <div className="text-xs uppercase font-black text-emerald-400 [writing-mode:vertical-lr] rotate-180">
              Contact
            </div>
            <div>
              <p className="text-xs font-bold text-emerald-950">
                {viewUser?.email || "—"}
              </p>
              <p className="text-xs text-emerald-600 mt-1">
                {viewUser?.phoneNumber || "—"}
              </p>
            </div>
          </div>
          <div className="bg-white p-6 flex items-center gap-4">
            <div className="text-xs uppercase font-black text-emerald-400 [writing-mode:vertical-lr] rotate-180">
              Registry
            </div>
            <div>
              <p className="text-xs font-bold text-emerald-950">
                {viewUser?.farmerType || "—"}
              </p>
              <p className="text-xs text-emerald-600 mt-1">Verified Estate</p>
            </div>
          </div>
          <div className="bg-white p-6 flex items-center gap-4">
            <div className="text-xs uppercase font-black text-emerald-400 [writing-mode:vertical-lr] rotate-180">
              Region
            </div>
            <div>
              <p className="text-xs font-bold text-emerald-950">
                {viewUser?.address?.district || "—"},{" "}
                {viewUser?.address?.state || "—"}
              </p>
              <p className="text-xs text-emerald-600 mt-1">
                Pincode: {viewUser?.address?.pincode || "—"}
              </p>
            </div>
          </div>
        </div>

        {/* NAV TABS */}
        <div className="flex border-b border-emerald-100 mb-10 overflow-x-auto no-scrollbar">
          {TABS.map((tab) => {
            const TAB_I18N = {
              Overview: t("profile.overview"),
              Crops: t("profile.crops"),
              "Land & Equipment": t("profile.landEquipment"),
              Finance: t("profile.finance"),
              Schemes: t("profile.schemes"),
              "AI Insights": t("profile.aiInsights"),
              Documents: t("profile.documents"),
              Settings: t("nav.settings"),
            };
            return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-4 text-[11px] font-black uppercase tracking-widest transition-all relative min-w-max
                ${activeTab === tab ? "text-emerald-950" : "text-emerald-300 hover:text-emerald-500"}`}
            >
              {TAB_I18N[tab] || tab}
              {tab === "Documents" && (
                <span className="ml-1.5 inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 align-middle mb-0.5" />
              )}
              {tab === "Settings" && (
                <span className="ml-1.5 inline-block align-middle mb-0.5">⚙️</span>
              )}
              {activeTab === tab && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-900"
                />
              )}
            </button>
            );
          })}
        </div>

        {/* CONTENT */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === "Overview" && <ActiveContent user={viewUser} />}
            {activeTab === "Documents" && (
              <DocumentsTab
                currentUser={viewUser}
                onProfileUpdated={(nextUser) => {
                  setUserFromApi?.(nextUser);
                }}
              />
            )}
            {activeTab === "Settings" && <SettingsTab />}
            {activeTab !== "Overview" && activeTab !== "Documents" && activeTab !== "Settings" && (
              <ActiveContent />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* EDIT PROFILE MODAL */}
      <AnimatePresence>
        {isEditingProfile && (
          <motion.div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsEditingProfile(false)}
          >
            <motion.div
              className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-screen overflow-y-auto"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-emerald-900 text-white p-6 flex items-center justify-between border-b border-emerald-800">
                <h2 className="text-xl font-bold">Edit Profile Information</h2>
                <button
                  onClick={() => setIsEditingProfile(false)}
                  className="text-white hover:bg-emerald-800 p-1 rounded transition-colors"
                >
                  ✕
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Full Name */}
                <div>
                  <label className="block text-sm font-bold text-emerald-900 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={editFormData.fullName || ""}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        fullName: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-emerald-200 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-bold text-emerald-900 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={editFormData.email || ""}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        email: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-emerald-200 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* Phone Number */}
                <div>
                  <label className="block text-sm font-bold text-emerald-900 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={editFormData.phoneNumber || ""}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        phoneNumber: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-emerald-200 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* Date of Birth */}
                <div>
                  <label className="block text-sm font-bold text-emerald-900 mb-2">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    value={editFormData.dateOfBirth || ""}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        dateOfBirth: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-emerald-200 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* Gender */}
                <div>
                  <label className="block text-sm font-bold text-emerald-900 mb-2">
                    Gender
                  </label>
                  <select
                    value={editFormData.gender || ""}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        gender: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-emerald-200 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* Farmer Type */}
                <div>
                  <label className="block text-sm font-bold text-emerald-900 mb-2">
                    Farmer Type
                  </label>
                  <select
                    value={editFormData.farmerType || ""}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        farmerType: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-emerald-200 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="">Select Type</option>
                    <option value="Small Farmer">Small Farmer</option>
                    <option value="Medium Farmer">Medium Farmer</option>
                    <option value="Large Farmer">Large Farmer</option>
                  </select>
                </div>

                {/* Language */}
                <div>
                  <label className="block text-sm font-bold text-emerald-900 mb-2">
                    {t("profile.preferredLanguage")}
                  </label>
                  <select
                    value={editFormData.language || ""}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        language: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-emerald-200 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="">{t("profile.selectLanguage")}</option>
                    {SUPPORTED_LANGUAGES.map((lang) => (
                      <option key={lang.code} value={lang.code}>
                        {lang.nativeLabel} ({lang.label})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-6 border-t border-emerald-100">
                  <button
                    onClick={() => setIsEditingProfile(false)}
                    className="flex-1 px-4 py-2 border border-emerald-200 text-emerald-900 rounded hover:bg-emerald-50 transition-colors font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveProfileChanges}
                    className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 transition-colors font-bold"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Remove profile image confirmation dialog */}
      <ConfirmDialog
        open={showRemoveConfirm}
        onClose={() => setShowRemoveConfirm(false)}
        onConfirm={confirmRemoveProfileImage}
        title="Remove profile image?"
        description="Your current profile photo will be permanently removed. You can upload a new one at any time."
        confirmLabel="Yes, remove"
        cancelLabel="Keep it"
        variant="danger"
      />
    </div>
  );
}
