// src/pages/Billing.jsx
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import {
  CreditCard,
  Smartphone,
  Landmark,
  Wallet,
  ChevronLeft,
  CheckCircle2,
  AlertCircle,
  Lock,
  Building2,
  QrCode,
  Timer,
  ArrowRight,
  Banknote,
  Radio,
  Sparkles,
  Zap,
  Sprout,
  Crown,
  BadgeCheck,
  ShieldCheck,
  X,
  ChevronDown,
} from "lucide-react";
import axios from "axios";
import { useUser } from "../context/UserContext";
import { useLanguage } from "../context/LanguageContext";
import { PLANS } from "../assets/plan";

/* ─── Font + keyframes ─── */
const FontStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');
    .font-cormorant { font-family: 'Cormorant Garamond', serif; }
    .font-dm        { font-family: 'DM Sans', sans-serif; }
    * { font-family: 'DM Sans', sans-serif; box-sizing: border-box; }

    @keyframes spin       { to { transform: rotate(360deg); } }
    @keyframes pulseGreen { 0%,100%{opacity:1} 50%{opacity:0.6} }
    @keyframes slideUp    { from{transform:translateY(12px);opacity:0} to{transform:translateY(0);opacity:1} }
    @keyframes iconBounce { 0%,100%{transform:translateY(0)} 40%{transform:translateY(-3px)} 60%{transform:translateY(-1px)} }
    @keyframes iconSpin   { 0%{transform:rotate(0deg)scale(1)} 50%{transform:rotate(180deg)scale(1.15)} 100%{transform:rotate(360deg)scale(1)} }
    @keyframes iconPulse  { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.25);opacity:.85} }
    @keyframes shimmer    { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
    @keyframes borderRotate { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }
    @keyframes floatY     { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
    @keyframes saddleGlow {
      0%,100%{box-shadow:0 0 0 0 rgba(22,163,74,0),0 8px 32px rgba(16,185,129,.12)}
      50%{box-shadow:0 0 18px 4px rgba(22,163,74,.22),0 8px 40px rgba(16,185,129,.18)}
    }
    @keyframes pulseRing  { 0%{transform:scale(1);opacity:.6} 70%{transform:scale(1.15);opacity:0} 100%{transform:scale(1);opacity:0} }

    .animate-spin    { animation: spin 1s linear infinite; }
    .pulse-animation { animation: pulseGreen 2s ease-in-out infinite; }
    .slide-up        { animation: slideUp .3s ease-out; }
    .icon-bounce     { animation: iconBounce 2s ease-in-out infinite; }
    .icon-spin       { animation: iconSpin 4s ease-in-out infinite; }
    .icon-pulse      { animation: iconPulse 1.8s ease-in-out infinite; }
    .float-icon      { animation: floatY 3.2s ease-in-out infinite; }
    .saddle-glow     { animation: saddleGlow 2.8s ease-in-out infinite; }

    .shimmer-text {
      background: linear-gradient(90deg,#15803d 0%,#22c55e 40%,#15803d 60%,#22c55e 100%);
      background-size: 200% 100%;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      animation: shimmer 2.5s linear infinite;
    }

    .dashed-grid {
      background-image:
        linear-gradient(rgba(22,163,74,.07) 1px,transparent 1px),
        linear-gradient(90deg,rgba(22,163,74,.07) 1px,transparent 1px);
      background-size: 36px 36px;
    }

    .method-card { transition: all .22s ease; }
    .method-card:hover { transform: translateY(-2px); }

    .pay-btn {
      box-shadow: 0 6px 24px rgba(22,163,74,.38), 0 2px 8px rgba(22,163,74,.22);
      transition: box-shadow .22s ease, transform .18s ease;
    }
    .pay-btn:hover {
      box-shadow: 0 10px 36px rgba(22,163,74,.52), 0 4px 14px rgba(22,163,74,.30);
      transform: translateY(-2px);
    }

    .input-field {
      transition: border-color .2s ease, box-shadow .2s ease;
    }
    .input-field:focus {
      border-color: #16a34a;
      box-shadow: 0 0 0 3px rgba(22,163,74,.12);
      outline: none;
    }

    .pulse-ring::after {
      content:'';
      position:absolute;
      inset:-4px;
      border-radius:50%;
      border:2px solid currentColor;
      animation: pulseRing 2s ease-out infinite;
    }

    /* custom scrollbar */
    .custom-scroll::-webkit-scrollbar { width: 4px; }
    .custom-scroll::-webkit-scrollbar-track { background: transparent; }
    .custom-scroll::-webkit-scrollbar-thumb { background: #d1fae5; border-radius: 99px; }

    /* mobile summary slide */
    @media(max-width:1023px){
      .summary-drawer { transition: transform .35s cubic-bezier(.22,1,.36,1); }
    }
  `}</style>
);

/* ─── UPI SVG logos (inline, no external dep) ─── */
const GPayIcon = () => (
  <img src="./gpay.png" alt="gpay" width={70} height={70} className="object-cover" />

);
const PhonePeIcon = () => (
  <img src="./phonepe.png" alt="phonepe" width={90} height={90} className="object-cover" />
);
const PaytmIcon = () => (
  <img src="./paytm.png" alt="paytm" width={70} height={70} className="object-cover" />

);
const BhimIcon = () => (
  <img src="./bhim.png" alt="bhim" width={70} height={70} className="object-cover" />
  
);

const UPI_APPS = [
  { id: "gpay",    name: "", Icon: GPayIcon   },
  { id: "phonepe", name: "",   Icon: PhonePeIcon },
  { id: "paytm",   name: "",     Icon: PaytmIcon   },
  { id: "bhim",    name: "",      Icon: BhimIcon    },
];

/* ─── Payment methods ─── */
const PAYMENT_METHODS = [
  { id: "card",       name: "Credit / Debit Card",  icon: CreditCard, description: "Visa, Mastercard, RuPay, Amex",               processingTime: "Instant", convenienceFee: 0   },
  { id: "upi",        name: "UPI",                  icon: Smartphone, description: "GPay, PhonePe, Paytm, BHIM & more",          processingTime: "Instant", convenienceFee: 0   },
  { id: "netbanking", name: "Net Banking",           icon: Landmark,   description: "SBI, HDFC, ICICI, Axis & all major banks",   processingTime: "2–5 min", convenienceFee: 0   },
  { id: "wallet",     name: "Digital Wallet",        icon: Wallet,     description: "Paytm Wallet, Amazon Pay, Mobikwik",         processingTime: "Instant", convenienceFee: 2.5 },
];

const SAVED_CARDS = [
  { id: 1, type: "visa",       last4: "4242", expiry: "12/25", name: "John Doe", isDefault: true  },
  { id: 2, type: "mastercard", last4: "8888", expiry: "08/26", name: "John Doe", isDefault: false },
];

const PLAN_BENEFITS = {
  free:         ["1 farm profile","3 soil report uploads/mo","Basic AI crop suggestions","7-day planting calendar"],
  premium:      ["5 farm profiles","Unlimited soil uploads","Advanced AI recommendations","Full seasonal calendar","Market price integration","Priority email support"],
  superPremium: ["Unlimited farm profiles","Custom AI model training","Multi-user team access","API access & integrations","Dedicated account manager","White-label reporting"],
};

/* ═══════════════════════════════════
   SUB-COMPONENTS
═══════════════════════════════════ */

/* Payment method pill */
const MethodPill = ({ method, isSelected, onSelect }) => {
  const { n } = useLanguage();
  const Icon = method.icon;
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.97 }}
      onClick={() => onSelect(method.id)}
      className={`method-card w-full text-left p-3 sm:p-4 rounded-2xl border-2 cursor-pointer flex items-center gap-3 group
        ${isSelected ? "border-green-500 bg-green-50/80" : "border-gray-100 bg-white/70 hover:border-green-200"}`}
    >
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors
        ${isSelected ? "bg-green-100" : "bg-gray-50 group-hover:bg-green-50"}`}>
        <Icon size={20} className={isSelected ? "text-green-600 icon-bounce" : "text-gray-400"} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`font-dm text-[13.5px] font-semibold ${isSelected ? "text-green-800" : "text-gray-700"}`}>
            {method.name}
          </span>
          {method.convenienceFee === 0
            ? <span className="text-[10px] text-green-600 bg-green-50 border border-green-100 px-1.5 py-0.5 rounded-full">Free</span>
            : method.convenienceFee < 50
              ? <span className="text-[10px] text-amber-600 bg-amber-50 border border-amber-100 px-1.5 py-0.5 rounded-full">+{n(method.convenienceFee)}%</span>
              : <span className="text-[10px] text-amber-600 bg-amber-50 border border-amber-100 px-1.5 py-0.5 rounded-full">+₹{n(method.convenienceFee)}</span>
          }
        </div>
        <p className="text-[11.5px] text-gray-400 truncate">{method.description}</p>
      </div>

      <div className="flex-shrink-0 flex items-center gap-2">
        <span className="hidden sm:flex items-center gap-1 text-[10px] text-gray-400">
          <Timer size={10}/>{method.processingTime}
        </span>
        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center
          ${isSelected ? "border-green-500 bg-green-500" : "border-gray-300"}`}>
          {isSelected && <div className="w-2 h-2 rounded-full bg-white"/>}
        </div>
      </div>
    </motion.button>
  );
};

/* Input field */
const Field = ({ label, ...props }) => (
  <div>
    <label className="block text-[12px] font-medium text-gray-500 mb-1.5">{label}</label>
    <input
      {...props}
      className="input-field w-full px-3.5 py-2.5 border border-gray-200 rounded-xl bg-white/80 text-[13.5px] text-gray-800 placeholder:text-gray-300"
    />
  </div>
);

/* Card Form */
const CardPaymentForm = ({ onSubmit }) => {
  const { t } = useLanguage();
  const [cardDetails, setCardDetails] = useState({ number:"", expiry:"", cvv:"", name:"", saveCard:true });
  const [useNew, setUseNew] = useState(false);
  const upd = (k, v) => setCardDetails(p => ({...p, [k]:v}));

  return (
    <form onSubmit={e=>{e.preventDefault();onSubmit({method:"card",details:cardDetails})}} className="space-y-3.5 slide-up">
      {SAVED_CARDS.length > 0 && !useNew ? (
        <div>
          <p className="text-[12px] font-medium text-gray-500 mb-2">{t("billing.savedCards")}</p>
          <div className="space-y-2">
            {SAVED_CARDS.map(c => (
              <div key={c.id} className="flex items-center gap-3 p-3 border border-gray-100 rounded-xl bg-gray-50/50 cursor-pointer hover:bg-green-50/40 hover:border-green-200 transition-colors">
                <Radio size={14} className="text-gray-300"/>
                <div className="w-8 h-5 bg-gradient-to-r from-blue-600 to-blue-400 rounded flex items-center justify-center">
                  <span className="text-[8px] text-white font-bold">{c.type.toUpperCase().slice(0,4)}</span>
                </div>
                <span className="text-[13px] text-gray-700 font-medium">•••• {c.last4}</span>
                <span className="text-[11px] text-gray-400 ml-1">{c.expiry}</span>
                {c.isDefault && <span className="ml-auto text-[10px] bg-green-100 text-green-600 px-2 py-0.5 rounded-full">Default</span>}
              </div>
            ))}
          </div>
          <button type="button" onClick={()=>setUseNew(true)} className="mt-2 text-[12px] text-green-600 hover:text-green-700 font-medium underline underline-offset-2">
            {t("billing.useNewCard")}
          </button>
        </div>
      ) : (
        <>
          {SAVED_CARDS.length > 0 && (
            <button type="button" onClick={()=>setUseNew(false)} className="text-[12px] text-gray-400 hover:text-gray-600 flex items-center gap-1 mb-1">
              <ChevronLeft size={12}/> {t("billing.backToSaved")}
            </button>
          )}
          <Field label={t("billing.cardNumber")} type="text" placeholder="1234 5678 9012 3456" value={cardDetails.number} onChange={e=>upd("number",e.target.value)}/>
          <div className="grid grid-cols-2 gap-3">
            <Field label={t("billing.expiry")} type="text" placeholder="MM / YY" value={cardDetails.expiry} onChange={e=>upd("expiry",e.target.value)}/>
            <Field label={t("billing.cvv")} type="password" placeholder="•••" maxLength={4} value={cardDetails.cvv} onChange={e=>upd("cvv",e.target.value)}/>
          </div>
          <Field label={t("billing.nameOnCard")} type="text" placeholder="John Doe" value={cardDetails.name} onChange={e=>upd("name",e.target.value)}/>
          <label className="flex items-center gap-2 cursor-pointer mt-1">
            <input type="checkbox" checked={cardDetails.saveCard} onChange={e=>upd("saveCard",e.target.checked)} className="rounded accent-green-600 w-4 h-4"/>
            <span className="text-[12px] text-gray-500">{t("billing.saveCard")}</span>
          </label>
        </>
      )}
      <PayButton label={t("billing.paySecurely")}/>
    </form>
  );
};

/* UPI Form */
const UpiPaymentForm = ({ onSubmit }) => {
  const { t } = useLanguage();
  const [upiId, setUpiId] = useState("");
  const [selectedApp, setSelectedApp] = useState("");

  return (
    <form onSubmit={e=>{e.preventDefault();if(selectedApp||upiId)onSubmit({method:"upi",details:{upiId,app:selectedApp}})}} className="space-y-4 slide-up">
      <div>
        <p className="text-[12px] font-medium text-gray-500 mb-2.5">{t("billing.chooseUpiApp")}</p>
        <div className="grid grid-cols-4 gap-2 items-center justify-baseline">
          {UPI_APPS.map(app => (
            <motion.button
              type="button"
              key={app.id}
              whileHover={{scale:1.04}} whileTap={{scale:.97}}
              onClick={()=>setSelectedApp(app.id)}
              className={`flex flex-col items-center gap-1.5 p-2.5 rounded-2xl cursor-pointer transition-all
                ${selectedApp===app.id?"border-2 border-green-400 bg-green-50/60":""}`}
            >
              <app.Icon/>
            </motion.button>
          ))}
        </div>
      </div>

      <div className="relative">
        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-dashed border-gray-200"/></div>
        <div className="relative flex justify-center">
          <span className="px-3 bg-white text-[11px] text-gray-400 font-medium">{t("billing.orEnterUpiId")}</span>
        </div>
      </div>

      <div>
        <label className="block text-[12px] font-medium text-gray-500 mb-1.5">{t("billing.upiId")}</label>
        <input
          type="text"
          placeholder="username@okhdfcbank"
          value={upiId}
          onChange={e=>setUpiId(e.target.value)}
          className="input-field w-full px-3.5 py-2.5 border border-gray-200 rounded-xl bg-white/80 text-[13.5px] placeholder:text-gray-300"
        />
        <p className="text-[11px] text-gray-400 mt-1">{t("billing.upiHint")}</p>
      </div>

      <div className="flex items-start gap-2.5 p-3 bg-blue-50/60 border border-blue-100 rounded-xl">
        <QrCode size={14} className="text-blue-500 mt-0.5 flex-shrink-0"/>
        <p className="text-[11.5px] text-blue-700">{t("billing.qrScan")}</p>
      </div>

      <PayButton label={t("billing.continueToPay")} disabled={!upiId && !selectedApp}/>
    </form>
  );
};

/* Net Banking Form */
const NetBankingForm = ({ onSubmit }) => {
  const { t } = useLanguage();
  const [selectedBank, setSelectedBank] = useState("");
  const banks = [
    {id:"sbi",name:"State Bank of India",popular:true},
    {id:"hdfc",name:"HDFC Bank",popular:true},
    {id:"icici",name:"ICICI Bank",popular:true},
    {id:"axis",name:"Axis Bank",popular:true},
    {id:"kotak",name:"Kotak Mahindra Bank",popular:false},
    {id:"yes",name:"Yes Bank",popular:false},
    {id:"pnb",name:"Punjab National Bank",popular:false},
    {id:"bob",name:"Bank of Baroda",popular:false},
    {id:"canara",name:"Canara Bank",popular:false},
  ];

  return (
    <form onSubmit={e=>{e.preventDefault();if(selectedBank)onSubmit({method:"netbanking",details:{bank:selectedBank}})}} className="space-y-3 slide-up">
      <p className="text-[12px] font-medium text-gray-500">{t("billing.selectBank")}</p>
      <div className="space-y-1.5 max-h-64 overflow-y-auto custom-scroll pr-1">
        {banks.map(bank => (
          <motion.button
            type="button"
            key={bank.id}
            whileHover={{x:2}}
            onClick={()=>setSelectedBank(bank.id)}
            className={`w-full flex items-center justify-between p-3 rounded-xl border cursor-pointer text-left transition-all
              ${selectedBank===bank.id?"border-green-400 bg-green-50/60":"border-gray-100 hover:border-green-200 hover:bg-gray-50/40"}`}
          >
            <div className="flex items-center gap-2.5">
              <Building2 size={15} className={selectedBank===bank.id?"text-green-500":"text-gray-400"}/>
              <span className="text-[13px] font-medium text-gray-700">{bank.name}</span>
            </div>
            {bank.popular && <span className="text-[10px] bg-blue-50 text-blue-500 border border-blue-100 px-2 py-0.5 rounded-full">{t("billing.popular")}</span>}
          </motion.button>
        ))}
      </div>
      <PayButton label={t("billing.continueToBank")} disabled={!selectedBank}/>
    </form>
  );
};

/* Shared pay button */
const PayButton = ({ label, disabled }) => (
  <motion.button
    type="submit"
    disabled={disabled}
    whileHover={disabled?{}:{scale:1.02}}
    whileTap={disabled?{}:{scale:.98}}
    className="w-full py-3.5 rounded-xl font-dm font-semibold text-[14px] text-white flex items-center justify-center gap-2 mt-2 pay-btn disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
    style={{background:"linear-gradient(135deg,#16a34a,#059669)"}}
  >
    <Lock size={14} className="icon-pulse"/>
    {label}
  </motion.button>
);

/* ─── Order Summary panel ─── */
const OrderSummary = ({ plan, isAnnual, onClose, compact }) => {
  const { t, n } = useLanguage();
  const price  = isAnnual ? plan.annualPrice  : plan.monthlyPrice;
  const gst    = Math.round(price * 0.18);
  const total  = price + gst;
  const benefits = (PLAN_BENEFITS[plan.id] || []).slice(0, compact ? 3 : 4);

  const PlanIcon = plan.id === "premium" ? Zap : plan.id === "superPremium" ? Crown : Sprout;
  const accentColor = plan.id === "premium" ? "#d97706" : plan.id === "superPremium" ? "#7c3aed" : "#16a34a";

  return (
    <div className={`bg-white/90 backdrop-blur-sm rounded-2xl border border-gray-100 shadow-sm saddle-glow ${compact?"p-4":"p-6"}`}>
      {!compact && (
        <h2 className="font-cormorant text-2xl font-bold text-gray-800 mb-4">{t("billing.orderSummary")}</h2>
      )}

      {/* Plan card */}
      <div className="rounded-xl p-3.5 mb-4" style={{background:"linear-gradient(135deg,rgba(22,163,74,.06),rgba(5,150,105,.04))"}}>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-xl bg-white shadow-sm flex items-center justify-center">
            <PlanIcon size={17} style={{color:accentColor}}/>
          </div>
          <div>
            <h3 className="font-cormorant text-[1.3rem] font-bold text-gray-800 leading-tight">{plan.name}</h3>
            <p className="text-[11px] text-gray-400">{isAnnual?t("billing.annualBilling"):t("billing.monthlyBilling")} billing</p>
          </div>
        </div>
        <div className="space-y-1">
          {benefits.map((b,i) => (
            <div key={i} className="flex items-center gap-2">
              <CheckCircle2 size={12} className="text-green-500 flex-shrink-0"/>
              <span className="text-[12px] text-gray-600">{b}</span>
            </div>
          ))}
          {(PLAN_BENEFITS[plan.id]||[]).length > benefits.length && (
            <p className="text-[11px] text-green-600 mt-1 pl-4">+{(PLAN_BENEFITS[plan.id]||[]).length - benefits.length} more</p>
          )}
        </div>
      </div>

      {/* Price breakdown */}
      <div className="space-y-2 mb-4">
        <div className="flex justify-between text-[13px]">
          <span className="text-gray-400">{t("billing.subtotal")}</span>
          <span className="text-gray-700">₹{n(price.toLocaleString("en-IN"))}</span>
        </div>
        <div className="flex justify-between text-[13px]">
          <span className="text-gray-400">{t("billing.gst")}</span>
          <span className="text-gray-700">₹{n(gst.toLocaleString("en-IN"))}</span>
        </div>
        <div className="flex justify-between text-[13px]">
          <span className="text-gray-400">{t("billing.platformFee")}</span>
          <span className="text-green-600 font-medium">Free</span>
        </div>
        {isAnnual && plan.monthlyPrice > 0 && (
          <div className="flex justify-between text-[12px] text-green-600 bg-green-50 px-2.5 py-1.5 rounded-lg">
            <span>{t("billing.annualDiscount")}</span>
            <span>−₹{n(((plan.monthlyPrice - plan.annualPrice)*12).toLocaleString("en-IN"))}</span>
          </div>
        )}
      </div>

      {/* Total */}
      <div className="border-t border-gray-100 pt-3 mb-4">
        <div className="flex justify-between items-center">
          <span className="text-[14px] font-semibold text-gray-700">{t("billing.total")}</span>
          <span className="font-cormorant text-[1.9rem] font-bold leading-none" style={{color:"#16a34a"}}>₹{n(total.toLocaleString("en-IN"))}</span>
        </div>
        <p className="text-[11px] text-gray-400 text-right mt-0.5">{t("billing.includingTaxes")}</p>
      </div>

      {/* Security */}
      <div className="flex items-center justify-center gap-1.5 text-[11px] text-gray-400 mb-3">
        <Lock size={10} className="icon-pulse"/>
        <span>{t("billing.sslEncrypted")}</span>
      </div>

      {!compact && (
        <button onClick={onClose} className="flex items-center justify-center gap-1 mx-auto text-[12px] text-gray-400 hover:text-gray-600 transition-colors mt-1">
          <ChevronLeft size={13}/> {t("billing.changePlan")}
        </button>
      )}
    </div>
  );
};

/* ════════════════════════════════════
   MAIN BILLING COMPONENT
════════════════════════════════════ */
const Billing = () => {
  const location = useLocation();
  const navigate  = useNavigate();
  const { setUserFromApi, refreshUser } = useUser();
  const { t, n } = useLanguage();

  const [selectedMethod, setSelectedMethod] = useState("card");
  const [paymentStep,    setPaymentStep   ] = useState("method"); // method | processing | success
  const [txnId] = useState("AGRO" + Math.random().toString(36).substring(2,10).toUpperCase());
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [error, setError] = useState("");
  const [showMobileSummary, setShowMobileSummary] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";
  const { selectedPlanId, isAnnual, currentPlan } = location.state || {};
  const selectedPlan = PLANS.find(p => p.id === selectedPlanId);

  useEffect(() => {
    if (!selectedPlanId || !selectedPlan) navigate("/subscription");
  }, [selectedPlanId, selectedPlan, navigate]);

  if (!selectedPlan) return null;

  const ensureRazorpayLoaded = () =>
    new Promise((resolve, reject) => {
      if (window.Razorpay) return resolve();
      const s = document.createElement("script");
      s.src = "https://checkout.razorpay.com/v1/checkout.js";
      s.onload = resolve;
      s.onerror = () => reject(new Error("Failed to load Razorpay"));
      document.body.appendChild(s);
    });

  const startRazorpayPayment = async () => {
    try {
      setError("");
      setIsCreatingOrder(true);
      setPaymentStep("processing");
      await ensureRazorpayLoaded();

      const planId      = selectedPlan.id;
      const billingCycle = isAnnual ? "annual" : "monthly";

      const orderRes = await axios.post(`${API_URL}/api/billing/create-order`, { planId, billingCycle }, { withCredentials: true });
      if (!orderRes.data?.success) throw new Error(orderRes.data?.msg || "Failed to create order");

      const { key, order } = orderRes.data;
      const options = {
        key, amount: order.amount, currency: order.currency,
        name: "AgroIntel",
        description: `${selectedPlan.name} - ${billingCycle} subscription`,
        order_id: order.id,
        handler: async (response) => {
          try {
            const verifyRes = await axios.post(`${API_URL}/api/billing/verify`, {
              razorpay_order_id:   response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature:  response.razorpay_signature,
              planId, billingCycle,
            }, { withCredentials: true });

            if (verifyRes.data?.success && verifyRes.data.user) {
              setUserFromApi(verifyRes.data.user);
              // Also refresh from backend to ensure all data is synced
              await refreshUser();
              setPaymentStep("success");
            } else throw new Error(verifyRes.data?.msg || "Verification failed");
          } catch (err) {
            setError(err.response?.data?.msg || err.message || "Payment verification failed");
            setPaymentStep("method");
          }
        },
        prefill: { name: selectedPlan.name },
        notes:   { planId, billingCycle },
        theme:   { color: "#16a34a" },
        method:  { card: true, upi: true, netbanking: true, wallet: true },
        modal: {
          ondismiss: () => {
            setPaymentStep("method");
            setIsCreatingOrder(false);
            setError("Payment was cancelled. You can try again.");
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", resp => {
        setError(resp.error?.description || "Payment failed, please try again");
        setPaymentStep("method");
        setIsCreatingOrder(false);
      });
      rzp.open();
    } catch (err) {
      setError(err.response?.data?.msg || err.message || "Unable to start payment. Please try again.");
      setPaymentStep("method");
    } finally {
      setIsCreatingOrder(false);
    }
  };

  const handlePaymentSubmit = () => startRazorpayPayment();
  const handleSuccess        = () => navigate("/subscription", { state: { paymentSuccess: true, newPlan: selectedPlan.id } });

  return (
    <>
      <FontStyle />
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-green-50 via-white to-emerald-50 dashed-grid">

        {/* ── Blur blobs ── */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute w-96 h-96 rounded-full blur-[120px] -top-24 -left-24" style={{backgroundColor:"rgba(22,163,74,.10)"}}/>
          <div className="absolute w-80 h-80 rounded-full blur-[100px] -bottom-20 -right-20" style={{backgroundColor:"rgba(5,150,105,.08)"}}/>
        </div>

        {/* ── Main content ── */}
        <main className="relative z-10 flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-8 mt-12">
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">

            {/* ══ LEFT: Payment Panel ══ */}
            <div className="flex-1 min-w-0 w-full">
              <AnimatePresence mode="wait">

                {/* Step: method */}
                {paymentStep === "method" && (
                  <motion.div key="method" initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-16}} transition={{duration:.35}}>

                    {/* Title */}
                    <div className="mb-5">
                      <p className="text-[11px] uppercase tracking-widest text-green-600 font-semibold mb-1 flex items-center gap-1.5">
                        <ShieldCheck size={11} className="icon-pulse"/> {t("billing.secureCheckout")}
                      </p>
                      <h2 className="font-cormorant text-[1.9rem] font-bold text-gray-800 leading-tight">
                        {t("billing.selectPaymentMethod")}
                      </h2>
                    </div>

                    {/* Error */}
                    <AnimatePresence>
                      {error && (
                        <motion.div
                          initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-8}}
                          className="mb-4 flex items-start gap-2.5 text-[13px] text-red-600 bg-red-50 border border-red-100 rounded-xl px-3.5 py-3"
                        >
                          <AlertCircle size={15} className="mt-0.5 flex-shrink-0"/>
                          <span>{error}</span>
                          <button onClick={()=>setError("")} className="ml-auto text-red-400 hover:text-red-600"><X size={14}/></button>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Payment method list */}
                    <div className="space-y-2 mb-5">
                      {PAYMENT_METHODS.map(m => (
                        <MethodPill key={m.id} method={m} isSelected={selectedMethod===m.id} onSelect={setSelectedMethod}/>
                      ))}
                    </div>

                    {/* Form panel */}
                    <motion.div
                      layout
                      className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6"
                    >
                      <AnimatePresence mode="wait">
                        {selectedMethod === "card" && (
                          <motion.div key="card" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
                            <div className="flex items-center gap-2 mb-4">
                              <CreditCard size={15} className="text-green-500 icon-bounce"/>
                              <span className="text-[13px] font-semibold text-gray-700">{t("billing.cardDetails")}</span>
                            </div>
                            <CardPaymentForm onSubmit={handlePaymentSubmit}/>
                          </motion.div>
                        )}
                        {selectedMethod === "upi" && (
                          <motion.div key="upi" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
                            <div className="flex items-center gap-2 mb-4">
                              <Smartphone size={15} className="text-green-500 icon-bounce"/>
                              <span className="text-[13px] font-semibold text-gray-700">{t("billing.upiPayment")}</span>
                            </div>
                            <UpiPaymentForm onSubmit={handlePaymentSubmit}/>
                          </motion.div>
                        )}
                        {selectedMethod === "netbanking" && (
                          <motion.div key="nb" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
                            <div className="flex items-center gap-2 mb-4">
                              <Landmark size={15} className="text-green-500 icon-bounce"/>
                              <span className="text-[13px] font-semibold text-gray-700">{t("billing.netBanking")}</span>
                            </div>
                            <NetBankingForm onSubmit={handlePaymentSubmit}/>
                          </motion.div>
                        )}
                        {selectedMethod === "wallet" && (
                          <motion.div key="wallet" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="text-center py-8">
                            <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-3">
                              <Wallet size={24} className="text-gray-300"/>
                            </div>
                            <p className="font-medium text-gray-600 text-[14px]">{t("billing.walletComingSoon")}</p>
                            <p className="text-[12px] text-gray-400 mt-1">{t("billing.chooseAnother")}</p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>

                    {/* Bottom trust strip */}
                    <div className="flex items-center justify-center gap-4 mt-4 flex-wrap">
                      {[
                        {Icon:Lock,     label:t("billing.sslBadge")},
                        {Icon:ShieldCheck, label:t("billing.razorpayBadge")},
                        {Icon:BadgeCheck,  label:t("billing.gstBadge")},
                      ].map(({Icon,label}) => (
                        <div key={label} className="flex items-center gap-1.5 text-[11px] text-gray-400">
                          <Icon size={11} className="text-gray-300 icon-pulse"/>{label}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Step: processing */}
                {paymentStep === "processing" && (
                  <motion.div
                    key="processing"
                    initial={{opacity:0,scale:.95}} animate={{opacity:1,scale:1}} exit={{opacity:0,scale:.95}}
                    className="bg-white/90 backdrop-blur-sm rounded-2xl border border-gray-100 shadow-sm p-12 sm:p-16 text-center"
                  >
                    <div className="relative w-20 h-20 mx-auto mb-6">
                      <div className="absolute inset-0 rounded-full border-4 border-green-100"/>
                      <div className="absolute inset-0 rounded-full border-4 border-t-green-500 animate-spin"/>
                      <div className="absolute inset-3 rounded-full bg-green-50 flex items-center justify-center">
                        <Lock size={16} className="text-green-500 icon-pulse"/>
                      </div>
                    </div>
                    <h3 className="font-cormorant text-[1.8rem] font-bold text-gray-800 mb-2">{t("billing.processingPayment")}</h3>
                    <p className="text-gray-400 text-[13.5px]">{t("billing.processingDesc")}</p>
                    <div className="flex items-center justify-center gap-1.5 mt-6">
                      {[0,1,2].map(i => (
                        <motion.div key={i} className="w-1.5 h-1.5 rounded-full bg-green-400"
                          animate={{opacity:[.3,1,.3],scale:[.8,1.1,.8]}}
                          transition={{duration:1.2,delay:i*.2,repeat:Infinity}}/>
                      ))}
                    </div>
                    <p className="text-[11px] text-gray-300 mt-4">{t("billing.doNotRefresh")}</p>
                  </motion.div>
                )}

                {/* Step: success */}
                {paymentStep === "success" && (
                  <motion.div
                    key="success"
                    initial={{opacity:0,scale:.95}} animate={{opacity:1,scale:1}} exit={{opacity:0}} transition={{duration:.4}}
                    className="bg-white/90 backdrop-blur-sm rounded-2xl border border-gray-100 shadow-sm p-10 sm:p-16 text-center"
                  >
                    <motion.div
                      initial={{scale:0}} animate={{scale:1}}
                      transition={{type:"spring",stiffness:300,damping:20,delay:.1}}
                      className="relative w-20 h-20 mx-auto mb-6"
                    >
                      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                        <CheckCircle2 size={40} className="text-green-500"/>
                      </div>
                      <motion.div
                        className="absolute -top-1 -right-1 w-7 h-7 bg-amber-100 rounded-full flex items-center justify-center"
                        animate={{rotate:[0,15,-15,0]}} transition={{duration:2,repeat:Infinity}}
                      >
                        <Sparkles size={13} className="text-amber-500"/>
                      </motion.div>
                    </motion.div>

                    <motion.h3 initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{delay:.25}}
                      className="font-cormorant text-[2rem] font-bold text-gray-800 mb-2">
                      {t("billing.paymentSuccessful")}
                    </motion.h3>
                    <motion.p initial={{opacity:0}} animate={{opacity:1}} transition={{delay:.35}}
                      className="text-gray-500 text-[13.5px] mb-1">
                      {t("billing.planActive", { plan: selectedPlan.name })}
                    </motion.p>
                    <motion.p initial={{opacity:0}} animate={{opacity:1}} transition={{delay:.4}}
                      className="text-[11.5px] text-gray-400 mb-7">
                      {t("billing.transactionId")} <span className="font-mono text-gray-600">{txnId}</span>
                    </motion.p>

                    <motion.button
                      initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{delay:.5}}
                      whileHover={{scale:1.03}} whileTap={{scale:.97}}
                      onClick={handleSuccess}
                      className="inline-flex items-center gap-2 px-8 py-3 text-white rounded-xl font-semibold text-[14px] pay-btn"
                      style={{background:"linear-gradient(135deg,#16a34a,#059669)"}}
                    >
                      {t("billing.continueToDashboard")}
                      <ArrowRight size={16} className="icon-bounce"/>
                    </motion.button>

                    <p className="text-[11px] text-gray-400 mt-5">{t("billing.confirmationEmail")}</p>
                  </motion.div>
                )}

              </AnimatePresence>
            </div>

            {/* ══ RIGHT: Order Summary (desktop) ══ */}
            <div className="hidden lg:block w-80 xl:w-96 flex-shrink-0 sticky top-20">
              <OrderSummary plan={selectedPlan} isAnnual={isAnnual} onClose={()=>navigate("/subscription")}/>
            </div>

          </div>
        </main>
      </div>
    </>
  );
};

export default Billing;