import React, { useState, useEffect, useRef, useCallback } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useNavigate } from "react-router-dom";
import {
  Sprout, UploadCloud, BarChart2, CalendarDays, ShieldCheck,
  ArrowRight, ChevronDown, TrendingUp, CloudRain, MapPin, Clock,
  CheckCircle2, Users, Star, Zap, Leaf, ArrowUpRight, Play, Pause,
  Quote, ThumbsUp, ChevronLeft, ChevronRight, Plus, Minus,
  MessageSquare, Award, Globe, Phone, Mail, Maximize2, X,
  CirclePlus,
} from "lucide-react";
import { VIDEOS } from "../assets/assets";

gsap.registerPlugin(ScrollTrigger);

/* ═══════════════════════════════════════════════════
   STYLES
═══════════════════════════════════════════════════ */
const S = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,500&family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');

    :root {
      --g1:#16a34a; --g2:#059669; --g3:#0d9488; --gd:#14532d;
      --amber:#eab308; --blue:#3b82f6; --orange:#f97316; --rose:#f43f5e;
      --serif:'Cormorant Garamond',Georgia,serif;
      --sans:'DM Sans',sans-serif;
      --mono:'DM Mono',monospace;
    }
    .wd-root { font-family:var(--sans); color:#111827; overflow-x:hidden; background:#fff; }
    .wd-root *{ box-sizing:border-box; }

    /* ── loader ── */
    .ld-wrap{
      position:fixed;inset:0;z-index:9999;
      background:var(--gd);
      display:flex;flex-direction:column;align-items:center;justify-content:center;gap:24px;
    }
    .ld-title{
      font-family:var(--serif);font-size:3.2rem;font-weight:700;
      color:#fff;letter-spacing:-0.02em;
      opacity:0;transform:translateY(18px);
    }
    .ld-sub{
      font-size:11px;color:rgba(255,255,255,0.35);
      letter-spacing:0.22em;text-transform:uppercase;
      opacity:0;
    }
    .ld-bar-bg{width:180px;height:2px;background:rgba(255,255,255,0.12);border-radius:2px;overflow:hidden;}
    .ld-bar{width:0%;height:100%;background:var(--g1);border-radius:2px;}
    .ld-pct{font-family:var(--mono);font-size:10px;color:rgba(255,255,255,0.4);letter-spacing:0.12em;}

    /* ── grid bg ── */
    .grid-light{
      background-image:linear-gradient(rgba(22,163,74,0.035) 1px,transparent 1px),
                       linear-gradient(90deg,rgba(22,163,74,0.035) 1px,transparent 1px);
      background-size:44px 44px;
    }
    .grid-dark{
      background-image:linear-gradient(rgba(255,255,255,0.04) 1px,transparent 1px),
                       linear-gradient(90deg,rgba(255,255,255,0.04) 1px,transparent 1px);
      background-size:44px 44px;
    }

    /* ── section shared ── */
    .sec{ padding:96px 0; }
    .sec-sm{ padding:64px 0; }
    .mx{ max-width:64rem; margin:0 auto; padding:0 24px; }  /* max-w-5xl = 64rem */

    .sec-pill{
      display:inline-flex;align-items:center;gap:7px;
      padding:5px 14px;border-radius:50px;
      font-size:10px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;
      margin-bottom:18px;
    }
    .pill-green{ background:rgba(22,163,74,0.09);color:var(--g1);border:1px solid rgba(22,163,74,0.22); }
    .pill-amber{ background:rgba(234,179,8,0.09);color:#a16207;border:1px solid rgba(234,179,8,0.22); }
    .pill-blue{  background:rgba(59,130,246,0.09);color:#1d4ed8;border:1px solid rgba(59,130,246,0.22); }

    .sec-h2{
      font-family:var(--serif);
      font-size:clamp(2.1rem,4.2vw,3.4rem);
      font-weight:700;line-height:1.07;letter-spacing:-0.02em;color:#0f172a;
    }
    .sec-sub{
      font-size:14px;color:#6b7280;line-height:1.75;
      font-weight:300;max-width:520px;margin-top:12px;
    }

    /* ── hero ── */
    .hero{
      min-height:100vh;display:flex;flex-direction:column;
      align-items:center;justify-content:center;
      background:linear-gradient(160deg,#f0fdf4 0%,#fff 45%,#ecfdf5 100%);
      position:relative;overflow:hidden;
      padding:120px 24px 80px;
    }
    .hero-blob{
      position:absolute;border-radius:50%;pointer-events:none;
      filter:blur(110px);
    }
    .hero-tag{
      display:inline-flex;align-items:center;gap:8px;
      padding:7px 18px;border-radius:50px;
      background:rgba(22,163,74,0.08);border:1px solid rgba(22,163,74,0.22);
      font-size:10px;font-weight:700;color:var(--g1);
      letter-spacing:0.18em;text-transform:uppercase;
      margin-bottom:26px;opacity:0;
    }
    .hero-h1{
      font-family:var(--serif);
      font-size:clamp(3rem,7vw,5.8rem);
      font-weight:700;line-height:1.02;letter-spacing:-0.025em;
      color:#0f172a;text-align:center;max-width:780px;
      opacity:0;transform:translateY(32px);
    }
    .hero-h1 em{ color:var(--g1);font-style:normal; }
    .hero-p{
      font-size:clamp(14px,2vw,16px);color:#6b7280;line-height:1.78;
      max-width:540px;text-align:center;font-weight:300;
      margin:20px 0 36px;opacity:0;transform:translateY(18px);
    }
    .hero-btns{ display:flex;gap:12px;flex-wrap:wrap;justify-content:center;opacity:0; }

    .btn-primary{
      display:inline-flex;align-items:center;gap:8px;
      padding:13px 26px;border-radius:14px;
      background:linear-gradient(135deg,var(--g1),var(--g2));
      color:#fff;font-size:13.5px;font-weight:600;
      border:none;cursor:pointer;
      box-shadow:0 8px 24px rgba(22,163,74,0.32);
      transition:transform .2s,box-shadow .2s;
    }
    .btn-primary:hover{ transform:translateY(-2px);box-shadow:0 12px 32px rgba(22,163,74,0.42); }
    .btn-ghost{
      display:inline-flex;align-items:center;gap:8px;
      padding:13px 26px;border-radius:14px;
      background:rgba(255,255,255,.75);border:1.5px dashed #d1d5db;
      color:#374151;font-size:13.5px;font-weight:500;
      cursor:pointer;backdrop-filter:blur(8px);
      transition:border-color .2s,transform .2s;
    }
    .btn-ghost:hover{ border-color:var(--g1);transform:translateY(-2px); }

    /* ── float cards ── */
    .fc{
      position:absolute;background:rgba(255,255,255,.92);
      backdrop-filter:blur(12px);border-radius:16px;
      border:1px solid rgba(0,0,0,.07);
      box-shadow:0 8px 28px rgba(0,0,0,.08);
      padding:10px 14px;opacity:0;
    }
    @keyframes floA{0%,100%{transform:translateY(0) rotate(0deg)}50%{transform:translateY(-12px) rotate(1.5deg)}}
    @keyframes floB{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
    .fa{animation:floA 6s ease-in-out infinite;}
    .fb{animation:floB 4.5s ease-in-out infinite;}
    @keyframes scrollBob{0%,100%{transform:translateX(-50%) translateY(0)}50%{transform:translateX(-50%) translateY(5px)}}
    .scroll-hint{
      position:absolute;bottom:28px;left:50%;
      transform:translateX(-50%);
      display:flex;flex-direction:column;align-items:center;gap:7px;
      opacity:0;
    }
    .scroll-hint span{font-size:9px;letter-spacing:.2em;text-transform:uppercase;color:#9ca3af;}
    .scroll-ring{
      width:26px;height:26px;border-radius:50%;
      border:1.5px solid #d1d5db;
      display:flex;align-items:center;justify-content:center;color:#9ca3af;
      animation:scrollBob 2s ease-in-out infinite;
    }

    /* ── stats band ── */
    .stats-band{
      background:linear-gradient(135deg,var(--gd),#065f46,#134e4a);
      padding:52px 0;position:relative;overflow:hidden;
    }

    /* ── why cards ── */
    .why-card{
      background:#fff;border:1.5px dashed #e5e7eb;border-radius:20px;
      padding:22px;transition:transform .3s,box-shadow .3s,border-color .3s;
      opacity:0;transform:translateY(28px);
    }
    .why-card:hover{ transform:translateY(-5px)!important;box-shadow:0 18px 44px rgba(0,0,0,.09); }

    /* ── story pin ── */
    .story-outer{ position:relative; }
    .story-sticky{
      position:sticky;top:0;height:100vh;overflow:hidden;
      background:#f9fafb;display:flex;align-items:center;
    }
    .story-progress{
      position:absolute;left:40px;top:50%;transform:translateY(-50%);
      width:2px;height:200px;background:rgba(0,0,0,.08);border-radius:2px;
    }
    .story-fill{ width:100%;height:0%;background:var(--g1);border-radius:2px;transition:height .08s; }
    .story-dots{
      position:absolute;left:34px;top:50%;transform:translateY(-50%);
      display:flex;flex-direction:column;gap:50px;
    }
    .s-dot{
      width:14px;height:14px;border-radius:50%;
      background:#e5e7eb;border:2px solid #fff;
      box-shadow:0 0 0 2px #e5e7eb;
      transition:background .3s,box-shadow .3s;
      position:relative;left:-6px;
    }
    .s-dot.on{ background:var(--g1);box-shadow:0 0 0 2px var(--g1),0 0 0 5px rgba(22,163,74,.2); }
    .s-panel{
      position:absolute;inset:0;display:flex;align-items:center;
      opacity:0;pointer-events:none;padding:0 72px 0 100px;
    }
    .s-panel.vis{ pointer-events:auto; }
    .s-grid{
      max-width:64rem;width:100%;margin:0 auto;
      display:grid;grid-template-columns:1fr 1fr;gap:64px;align-items:center;
    }
    @media(max-width:768px){
      .s-grid{grid-template-columns:1fr;gap:32px;}
      .s-panel{padding:0 16px 0 56px;}
      .story-progress,.story-dots{left:16px;}
    }

    /* ── video ── */
    .video-wrap{
      position:relative;border-radius:24px;overflow:hidden;
      background:#0f172a;cursor:pointer;
      box-shadow:0 24px 64px rgba(0,0,0,.22);
    }
    .video-thumb{
      width:100%;aspect-ratio:16/9;object-fit:cover;
      display:block;transition:transform .4s,opacity .4s;
    }
    .video-wrap:hover .video-thumb{ transform:scale(1.03);opacity:.85; }
    .play-btn{
      position:absolute;top:50%;left:50%;
      transform:translate(-50%,-50%);
      width:72px;height:72px;border-radius:50%;
      background:rgba(255,255,255,.95);
      display:flex;align-items:center;justify-content:center;
      box-shadow:0 8px 32px rgba(0,0,0,.25);
      transition:transform .2s,box-shadow .2s;
    }
    .video-wrap:hover .play-btn{ transform:translate(-50%,-50%) scale(1.08);box-shadow:0 12px 40px rgba(0,0,0,.3); }
    .video-overlay{
      position:fixed;inset:0;z-index:999;
      background:rgba(0,0,0,.88);backdrop-filter:blur(8px);
      display:flex;align-items:center;justify-content:center;
      padding:24px;
    }
    .video-close{
      position:absolute;top:20px;right:20px;
      width:40px;height:40px;border-radius:50%;
      background:rgba(255,255,255,.12);border:none;cursor:pointer;
      display:flex;align-items:center;justify-content:center;color:#fff;
      transition:background .2s;
    }
    .video-close:hover{ background:rgba(255,255,255,.22); }

    /* ── feature tabs ── */
    .feat-tab{
      padding:9px 18px;border-radius:50px;
      font-size:12px;font-weight:600;cursor:pointer;
      border:1.5px dashed #e5e7eb;background:#fff;color:#6b7280;
      transition:all .2s;white-space:nowrap;
    }
    .feat-tab.active{
      background:var(--g1);color:#fff;border-color:var(--g1);
      box-shadow:0 4px 14px rgba(22,163,74,.3);
    }
    .feat-panel{ display:none; }
    .feat-panel.active{ display:grid; }

    /* ── reviews ── */
    .review-card{
      background:#fff;border:1.5px dashed #e5e7eb;border-radius:20px;
      padding:22px;flex-shrink:0;width:300px;
      opacity:0;transform:translateY(24px);
    }
    .reviews-scroll{
      display:flex;gap:16px;overflow-x:auto;padding:8px 0 16px;
      scroll-snap-type:x mandatory;
    }
    .reviews-scroll::-webkit-scrollbar{ display:none; }
    .review-card{ scroll-snap-align:start; }

    /* ── rating ring ── */
    .rating-ring{ position:relative;width:120px;height:120px; }
    .rating-ring svg{ transform:rotate(-90deg); }
    .ring-bg{ fill:none;stroke:#e5e7eb;stroke-width:8; }
    .ring-fill{
      fill:none;stroke:var(--g1);stroke-width:8;
      stroke-linecap:round;stroke-dasharray:283;stroke-dashoffset:283;
      transition:stroke-dashoffset 1.2s cubic-bezier(.22,1,.36,1);
    }
    .ring-label{
      position:absolute;top:50%;left:50%;
      transform:translate(-50%,-50%);
      text-align:center;
    }

    /* ── faq ── */
    .faq-item{
      border-bottom:1.5px dashed #e5e7eb;
      overflow:hidden;
    }
    .faq-q{
      width:100%;display:flex;align-items:center;justify-content:space-between;
      padding:18px 0;background:transparent;border:none;cursor:pointer;
      font-size:14px;font-weight:600;color:#111827;text-align:left;gap:12px;
      transition:color .2s;
    }
    .faq-q:hover{ color:var(--g1); }
    .faq-a{
      font-size:13px;color:#6b7280;line-height:1.72;
      padding-bottom:16px;display:none;
    }
    .faq-a.open{ display:block; }

    /* ── cta ── */
    .cta-sec{
      position:relative;padding:130px 24px;overflow:hidden;text-align:center;
      background:linear-gradient(160deg,var(--gd) 0%,#065f46 50%,#134e4a 100%);
    }
    @keyframes glowPulse{
      0%,100%{opacity:.2;transform:translate(-50%,-50%) scale(1)}
      50%{opacity:.35;transform:translate(-50%,-50%) scale(1.12)}
    }
    .cta-glow{
      position:absolute;border-radius:50%;filter:blur(130px);
      pointer-events:none;top:50%;left:50%;
      width:700px;height:700px;background:var(--g1);
      animation:glowPulse 9s ease-in-out infinite;
    }

    /* ── misc ── */
    @keyframes pulseDot{0%,100%{opacity:1}50%{opacity:.35}}
    .pdot{ width:6px;height:6px;border-radius:50%;animation:pulseDot 2s infinite; }
    .tag-num{
      font-family:var(--mono);font-size:10px;color:#9ca3af;
      letter-spacing:.12em;
    }
    @keyframes marquee{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
    .marquee-track{
      display:flex;gap:40px;white-space:nowrap;
      animation:marquee 28s linear infinite;
    }
    .marquee-item{
      display:inline-flex;align-items:center;gap:8px;
      font-size:12px;font-weight:600;color:rgba(255,255,255,.5);
      flex-shrink:0;
    }
  `}</style>
);

/* ═══════════════════════════════════════════════════
   LOADER
═══════════════════════════════════════════════════ */
const Loader = ({ onDone }) => {
  const wrapRef = useRef(null);
  const titleRef = useRef(null);
  const subRef = useRef(null);
  const barRef = useRef(null);
  const pctRef = useRef(null);

  useEffect(() => {
    const tl = gsap.timeline();
    tl.to([titleRef.current, subRef.current], {
      opacity: 1, y: 0, duration: 0.6, stagger: 0.15, ease: "power3.out",
    })
    .to(barRef.current, {
      width: "100%", duration: 1.8, ease: "power2.inOut",
      onUpdate() {
        if (pctRef.current) pctRef.current.textContent = Math.round(this.progress() * 100) + "%";
      },
    }, "-=0.2")
    .to(wrapRef.current, {
      yPercent: -100, duration: 0.75, ease: "power3.inOut", delay: 0.25,
      onComplete: onDone,
    });
  }, []);

  return (
    <div ref={wrapRef} className="ld-wrap">
      <div ref={titleRef} className="ld-title" style={{ transform: "translateY(18px)" }}>AgroIntel</div>
      <div ref={subRef} className="ld-sub">Loading your experience</div>
      <div className="ld-bar-bg"><div ref={barRef} className="ld-bar" /></div>
      <span ref={pctRef} className="ld-pct">0%</span>
    </div>
  );
};

/* ═══════════════════════════════════════════════════
   HERO
═══════════════════════════════════════════════════ */
const Hero = ({ navigate }) => {
  const tagRef  = useRef(null);
  const h1Ref   = useRef(null);
  const pRef    = useRef(null);
  const btnsRef = useRef(null);
  const hintRef = useRef(null);
  const fc1Ref  = useRef(null);
  const fc2Ref  = useRef(null);
  const fc3Ref  = useRef(null);
  const fc4Ref  = useRef(null);

  useEffect(() => {
    const tl = gsap.timeline({ delay: 0.15 });
    tl.to(tagRef.current,  { opacity: 1, y: 0, duration: 0.55, ease: "power3.out" })
      .to(h1Ref.current,   { opacity: 1, y: 0, duration: 0.72, ease: "power3.out" }, "-=0.3")
      .to(pRef.current,    { opacity: 1, y: 0, duration: 0.6,  ease: "power3.out" }, "-=0.42")
      .to(btnsRef.current, { opacity: 1, duration: 0.5,        ease: "power2.out" }, "-=0.4")
      .to(hintRef.current, { opacity: 1, duration: 0.6 }, "-=0.2")
      .to([fc1Ref.current, fc3Ref.current], { opacity: 1, y: 0, duration: 0.65, stagger: 0.1, ease: "power3.out" }, "-=0.55")
      .to([fc2Ref.current, fc4Ref.current], { opacity: 1, y: 0, duration: 0.65, stagger: 0.1, ease: "power3.out" }, "-=0.55");
  }, []);

  return (
    <section className="hero grid-light">
      <div className="hero-blob" style={{ width: 480, height: 480, top: "-12%", left: "-6%", background: "#16a34a", opacity: 0.14 }} />
      <div className="hero-blob" style={{ width: 360, height: 360, bottom: "-10%", right: "-5%", background: "#059669", opacity: 0.10 }} />
      <div className="hero-blob" style={{ width: 200, height: 200, top: "40%", right: "20%", background: "#0d9488", opacity: 0.07 }} />

      {/* Floating cards */}
      <div ref={fc1Ref} className="fc fa" style={{ top: "18%", left: "4%", transform: "translateY(16px)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <div style={{ width: 30, height: 30, borderRadius: 9, background: "rgba(22,163,74,.1)", border: "1px solid rgba(22,163,74,.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <TrendingUp size={13} color="#16a34a" />
          </div>
          <div>
            <p style={{ fontSize: 9, color: "#9ca3af", fontFamily: "var(--mono)", marginBottom: 2 }}>Punjab · Wheat</p>
            <p style={{ fontSize: 13, fontWeight: 700, color: "#111827" }}>₹2,520<span style={{ color: "#16a34a", fontSize: 10, marginLeft: 4 }}>+8.2%</span></p>
          </div>
        </div>
      </div>

      <div ref={fc2Ref} className="fc fb" style={{ top: "24%", right: "4%", transform: "translateY(16px)", animationDelay: "1.6s" }}>
        <p style={{ fontSize: 9, color: "#9ca3af", fontFamily: "var(--mono)", marginBottom: 7 }}>14-day weather</p>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 3 }}>
          {[3,5,2,7,4,6,8,3,5,7].map((h, i) => (
            <div key={i} style={{ width: 9, height: h * 5, borderRadius: "3px 3px 0 0", background: i === 3 ? "#3b82f6" : "#bfdbfe" }} />
          ))}
        </div>
      </div>

      <div ref={fc3Ref} className="fc fa" style={{ bottom: "22%", left: "5%", transform: "translateY(16px)", animationDelay: "2.2s" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <CheckCircle2 size={13} color="#16a34a" />
          <span style={{ fontSize: 11, fontWeight: 600, color: "#374151" }}>Soil analysed · NPK extracted</span>
        </div>
      </div>

      <div ref={fc4Ref} className="fc fb" style={{ bottom: "28%", right: "5%", transform: "translateY(16px)", animationDelay: "3s" }}>
        <p style={{ fontSize: 9, color: "#9ca3af", fontFamily: "var(--mono)", marginBottom: 5 }}>Top recommendation</p>
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <Sprout size={11} color="#16a34a" />
          <span style={{ fontSize: 12, fontWeight: 700, color: "#111827" }}>Basmati Rice</span>
          <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 7px", borderRadius: 50, background: "rgba(22,163,74,.1)", color: "#16a34a" }}>91%</span>
        </div>
      </div>

      {/* Content */}
      <div style={{ position: "relative", zIndex: 10, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div ref={tagRef} className="hero-tag">
          <div className="pdot" style={{ background: "#16a34a" }} />
          Watch how it works
        </div>
        <h1 ref={h1Ref} className="hero-h1">
          Smarter farming<br />starts <em>right here.</em>
        </h1>
        <p ref={pRef} className="hero-p">
          AgroIntel turns raw soil data into profitable decisions — blending AI, live mandi prices, and hyperlocal weather into one platform built for Indian farmers.
        </p>
        <div ref={btnsRef} className="hero-btns">
          <button className="btn-primary" onClick={() => navigate("/signup")}>
            <Sprout size={15} /> Start for free <ArrowRight size={14} />
          </button>
          <button className="btn-ghost" onClick={() => document.getElementById("wd-video")?.scrollIntoView({ behavior: "smooth" })}>
            <Play size={13} fill="currentColor" /> Watch demo video
          </button>
        </div>
      </div>

      <div ref={hintRef} className="scroll-hint">
        <span>Scroll to explore</span>
        <div className="scroll-ring"><ChevronDown size={13} /></div>
      </div>
    </section>
  );
};

/* ═══════════════════════════════════════════════════
   MARQUEE BAND
═══════════════════════════════════════════════════ */
const MarqueeBand = () => {
  const items = ["48,000+ Farmers", "18 States", "800+ Mandis", "4.9★ Rating", "₹2.4Cr Extra Income", "94% Accuracy", "< 10s Analysis", "Zero Data Selling"];
  const doubled = [...items, ...items];
  return (
    <div style={{ background: "var(--gd)", padding: "14px 0", overflow: "hidden", borderTop: "1px solid rgba(255,255,255,.06)", borderBottom: "1px solid rgba(255,255,255,.06)" }}>
      <div className="marquee-track">
        {doubled.map((t, i) => (
          <div key={i} className="marquee-item">
            <div className="pdot" style={{ background: "#86efac" }} />{t}
          </div>
        ))}
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════
   STATS
═══════════════════════════════════════════════════ */
const Stats = () => {
  const refs = useRef([]);
  const STATS = [
    { val: "48K+", lbl: "Farmers trust us", icon: Users },
    { val: "₹2.4Cr", lbl: "Extra income created", icon: TrendingUp },
    { val: "18", lbl: "States covered", icon: MapPin },
    { val: "4.9★", lbl: "Average app rating", icon: Star },
  ];
  useEffect(() => {
    ScrollTrigger.create({
      trigger: ".stats-band", start: "top 80%",
      onEnter: () => gsap.to(refs.current, { opacity: 1, y: 0, duration: 0.65, stagger: 0.1, ease: "power3.out" }),
    });
  }, []);
  return (
    <div className="stats-band grid-dark">
      <div className="mx">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 28 }}>
          {STATS.map((s, i) => (
            <div key={i} ref={el => refs.current[i] = el} style={{ textAlign: "center", opacity: 0, transform: "translateY(22px)" }}>
              <p style={{ fontFamily: "var(--serif)", fontSize: "clamp(2rem,4vw,3rem)", fontWeight: 700, color: "#fff", lineHeight: 1, marginBottom: 6 }}>{s.val}</p>
              <p style={{ fontSize: 11, color: "rgba(167,243,208,.72)", letterSpacing: ".1em", textTransform: "uppercase" }}>{s.lbl}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════
   WHY SECTION
═══════════════════════════════════════════════════ */
const Why = () => {
  const headRef = useRef(null);
  const cardRefs = useRef([]);
  const WHY = [
    { icon: Zap,       title: "Real-time mandi prices",  desc: "Live prices from 800+ mandis refreshed every 5 minutes. Never sell at the wrong time again.", accent: "#eab308" },
    { icon: CloudRain, title: "Hyperlocal weather",       desc: "14-day village-level forecasts — not the broad district guesses you get elsewhere.", accent: "#3b82f6" },
    { icon: Leaf,      title: "Soil-to-crop AI",          desc: "Matched against 200+ crop varieties using your exact soil profile for max yield confidence.", accent: "#16a34a" },
    { icon: Clock,     title: "Seasonal planning",        desc: "Sowing windows, irrigation schedules, and harvest timelines from decades of regional data.", accent: "#f97316" },
    { icon: Globe,     title: "18-state coverage",        desc: "From Punjab to Kerala — local knowledge embedded for every major farming belt in India.", accent: "#8b5cf6" },
    { icon: ShieldCheck, title: "Privacy first",          desc: "End-to-end encrypted. You own 100% of your data. We never sell or train on it.", accent: "#059669" },
  ];
  useEffect(() => {
    gsap.from(headRef.current, { opacity: 0, y: 24, duration: 0.7, ease: "power3.out", scrollTrigger: { trigger: headRef.current, start: "top 82%" } });
    cardRefs.current.forEach((el, i) => {
      if (!el) return;
      gsap.to(el, { opacity: 1, y: 0, duration: 0.6, ease: "power3.out", delay: i * 0.08, scrollTrigger: { trigger: el, start: "top 88%" } });
    });
  }, []);
  return (
    <section className="sec" style={{ background: "#fff" }}>
      <div className="mx">
        <div ref={headRef} style={{ textAlign: "center", marginBottom: 52 }}>
          <div className="sec-pill pill-green"><div className="pdot" style={{ background: "var(--g1)" }} />Why AgroIntel</div>
          <h2 className="sec-h2">Built for the realities<br />of Indian farming</h2>
          <p className="sec-sub" style={{ margin: "12px auto 0", textAlign: "center" }}>Not generic ag-tech. Every feature is designed around how farmers in India actually work.</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 18 }}>
          {WHY.map((c, i) => (
            <div key={i} ref={el => cardRefs.current[i] = el} className="why-card">
              <div style={{ width: 40, height: 40, borderRadius: 11, border: `1.5px dashed ${c.accent}40`, background: `${c.accent}10`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
                <c.icon size={17} color={c.accent} />
              </div>
              <p style={{ fontSize: 13, fontWeight: 700, color: "#111827", marginBottom: 7 }}>{c.title}</p>
              <p style={{ fontSize: 12, color: "#6b7280", lineHeight: 1.65 }}>{c.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ═══════════════════════════════════════════════════
   VIDEO DEMO
═══════════════════════════════════════════════════ */
const VideoDemo = () => {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);
  const headRef = useRef(null);

  useEffect(() => {
    gsap.from(headRef.current, { opacity: 0, y: 24, duration: 0.7, ease: "power3.out", scrollTrigger: { trigger: headRef.current, start: "top 82%" } });
    gsap.from(wrapRef.current, { opacity: 0, y: 40, scale: 0.96, duration: 0.85, ease: "power3.out", scrollTrigger: { trigger: wrapRef.current, start: "top 82%" } });
  }, []);

  const CHAPTERS = [
    { t: "0:00", label: "Intro — what is AgroIntel?" },
    { t: "1:12", label: "Uploading your first soil report" },
    { t: "2:45", label: "Reading your AI crop recommendation" },
    { t: "4:10", label: "Setting up your season calendar" },
    { t: "5:38", label: "Understanding mandi price alerts" },
    { t: "7:02", label: "Your data & privacy controls" },
  ];

  return (
    <section id="wd-video" className="sec" style={{ background: "#f9fafb" }}>
      <div className="mx">
        <div ref={headRef} style={{ textAlign: "center", marginBottom: 44 }}>
          <div className="sec-pill pill-amber"><Play size={10} /> Video Tutorial</div>
          <h2 className="sec-h2">See it in action</h2>
          <p className="sec-sub" style={{ margin: "12px auto 0", textAlign: "center" }}>A 7-minute walkthrough of the full platform — from uploading your first soil report to getting your season plan.</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 28, alignItems: "start" }}>
          {/* video */}
          <div ref={wrapRef} className="video-wrap" onClick={() => setOpen(true)}>
            <div style={{
              width: "100%", aspectRatio: "16/9", background: "linear-gradient(135deg,#14532d,#065f46)",
              display: "flex", alignItems: "center", justifyContent: "center", position: "relative",
            }}>
              {/* fake thumbnail */}
              <div style={{ position: "absolute", inset: 0, opacity: 0.3 }} className="grid-dark" />
              <div style={{ textAlign: "center", position: "relative", zIndex: 1 }}>
                <Sprout size={48} color="rgba(255,255,255,.3)" strokeWidth={1.2} />
                <p style={{ fontFamily: "var(--serif)", fontSize: "2.2rem", color: "rgba(255,255,255,.3)", fontWeight: 700, marginTop: 8 }}>AgroIntel</p>
              </div>
              <div style={{ position: "absolute", bottom: 16, left: 16, background: "rgba(0,0,0,.5)", borderRadius: 6, padding: "4px 10px", fontFamily: "var(--mono)", fontSize: 11, color: "#fff" }}>7:14</div>
            </div>
            <div className="play-btn">
              <Play size={26} fill="#16a34a" color="#16a34a" style={{ marginLeft: 3 }} />
            </div>
          </div>

          {/* chapters */}
          <div style={{ background: "#fff", borderRadius: 18, border: "1.5px dashed #e5e7eb", overflow: "hidden" }}>
            <div style={{ padding: "14px 18px", borderBottom: "1.5px dashed #e5e7eb" }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: "#374151" }}>Video chapters</p>
            </div>
            {CHAPTERS.map((c, i) => (
              <div key={i} onClick={() => setOpen(true)} style={{
                display: "flex", alignItems: "center", gap: 12, padding: "11px 18px",
                borderBottom: i < CHAPTERS.length - 1 ? "1px dashed #f3f4f6" : "none",
                cursor: "pointer", transition: "background .15s",
              }}
                onMouseEnter={e => e.currentTarget.style.background = "#f9fafb"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              >
                <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: "#9ca3af", minWidth: 32, flexShrink: 0 }}>{c.t}</span>
                <div style={{ width: 18, height: 18, borderRadius: "50%", background: "rgba(22,163,74,.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Play size={8} fill="#16a34a" color="#16a34a" />
                </div>
                <span style={{ fontSize: 12, color: "#374151" }}>{c.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* video lightbox */}
        {open && (
          <div className="video-overlay" onClick={() => setOpen(false)}>
            <div style={{ width: "100%", maxWidth: 900, position: "relative" }} onClick={e => e.stopPropagation()}>
              <div style={{ background: "#000", borderRadius: 16, aspectRatio: "16/9", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <video src={VIDEOS.tutorial} autoPlay muted loop></video>
              </div>
              <button className="video-close" onClick={() => setOpen(false)}><X size={18} /></button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

/* ═══════════════════════════════════════════════════
   HOW IT WORKS — PINNED STORYTELLING
═══════════════════════════════════════════════════ */
const STEPS = [
  {
    accent: "#16a34a", tag: "Step 01", eyebrow: "Drop it in.",
    title: "Upload your\nsoil reports.",
    desc: "Drag and drop your soil test PDFs. AgroIntel reads NPK levels, pH, moisture, and organic matter — building a complete land profile in under 10 seconds.",
    stat: { val: "< 10s", lbl: "full soil profile extracted" },
    visual: ({ accent }) => {
      const barRef = useRef(null);
      useEffect(() => {
        gsap.fromTo(barRef.current, { width: "0%" }, { width: "100%", duration: 2.1, ease: "power2.inOut", repeat: -1, repeatDelay: 1.3 });
      }, []);
      return (
        <div style={{ width: 240, background: "#fff", borderRadius: 18, border: "1px solid rgba(0,0,0,.07)", boxShadow: "0 8px 28px rgba(0,0,0,.08)", padding: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#374151" }}>Upload Soil Report</span>
            <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 8px", borderRadius: 50, background: `${accent}15`, color: accent }}>PDF</span>
          </div>
          <div style={{ border: `2px dashed ${accent}50`, borderRadius: 12, background: `${accent}06`, padding: "18px 14px", textAlign: "center", marginBottom: 14 }}>
            <UploadCloud size={26} color={accent} strokeWidth={1.5} style={{ margin: "0 auto 8px" }} />
            <p style={{ fontSize: 10, color: "#6b7280" }}>soil_report_kharif_2024.pdf</p>
            <div style={{ display: "flex", gap: 4, justifyContent: "center", marginTop: 8 }}>
              {["NPK", "pH", "OC", "N"].map(t => (
                <span key={t} style={{ fontSize: 8, fontWeight: 700, padding: "2px 6px", borderRadius: 50, background: `${accent}15`, color: accent }}>{t}</span>
              ))}
            </div>
          </div>
          <div style={{ height: 4, background: "rgba(0,0,0,.06)", borderRadius: 4, overflow: "hidden", marginBottom: 6 }}>
            <div ref={barRef} style={{ height: "100%", background: accent, borderRadius: 4 }} />
          </div>
          <p style={{ fontSize: 9, color: "#9ca3af", fontFamily: "var(--mono)" }}>Extracting: moisture, pH, NPK…</p>
        </div>
      );
    },
  },
  {
    accent: "#059669", tag: "Step 02", eyebrow: "The AI does the work.",
    title: "Instant crop\nintelligence.",
    desc: "Our model cross-references your soil data with live market prices and seasonal patterns — surfacing the best crops to plant, ranked by projected yield and profit.",
    stat: { val: "94%", lbl: "recommendation accuracy" },
    visual: ({ accent }) => {
      const barsRef = useRef([]);
      const bars = [58, 72, 44, 91, 63, 78, 85];
      useEffect(() => {
        barsRef.current.forEach((el, i) => {
          if (!el) return;
          gsap.fromTo(el, { scaleY: 0 }, { scaleY: 1, duration: 0.55, ease: "power2.out", delay: i * 0.07, repeat: -1, repeatDelay: 3.8, transformOrigin: "bottom" });
        });
      }, []);
      return (
        <div style={{ width: 240, background: "#fff", borderRadius: 18, border: "1px solid rgba(0,0,0,.07)", boxShadow: "0 8px 28px rgba(0,0,0,.08)", padding: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#374151" }}>AI Crop Score</span>
            <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 8px", borderRadius: 50, background: `${accent}15`, color: accent }}>LIVE</span>
          </div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 5, height: 68, marginBottom: 14 }}>
            {bars.map((h, i) => (
              <div key={i} ref={el => barsRef.current[i] = el}
                style={{ flex: 1, height: `${h}%`, borderRadius: "3px 3px 0 0", background: i === 3 ? accent : `${accent}28`, transformOrigin: "bottom" }} />
            ))}
          </div>
          {[{ c: "Basmati Rice", s: "91%", col: accent }, { c: "Wheat HD-2967", s: "78%", col: "#059669" }, { c: "Soybean", s: "61%", col: "#d97706" }].map(r => (
            <div key={r.c} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: "1px dashed #f3f4f6" }}>
              <span style={{ fontSize: 11, color: "#6b7280" }}>{r.c}</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: r.col, fontFamily: "var(--mono)" }}>{r.s}</span>
            </div>
          ))}
          <div style={{ marginTop: 10, padding: "8px 10px", borderRadius: 9, background: `${accent}0a`, border: `1px solid ${accent}20`, display: "flex", alignItems: "center", gap: 7 }}>
            <TrendingUp size={11} color={accent} />
            <span style={{ fontSize: 10, fontWeight: 600, color: accent }}>+32% projected yield</span>
          </div>
        </div>
      );
    },
  },
  {
    accent: "#0d9488", tag: "Step 03", eyebrow: "Your personalised calendar.",
    title: "Plan your entire\nseason.",
    desc: "Get a complete planting calendar — sowing windows, irrigation schedules, and fertilisation timelines, all computed to your exact soil and target crop.",
    stat: { val: "3.2×", lbl: "average yield improvement" },
    visual: ({ accent }) => {
      const rowRefs = useRef([]);
      const events = [
        { day: "Mar 15", label: "Sowing window", dot: "#16a34a" },
        { day: "Apr 02", label: "First irrigation", dot: "#3b82f6" },
        { day: "Apr 18", label: "Fertilise N-P-K", dot: "#f97316" },
        { day: "Jun 10", label: "Harvest ready", dot: "#eab308" },
      ];
      useEffect(() => {
        rowRefs.current.forEach((el, i) => {
          if (!el) return;
          gsap.fromTo(el, { opacity: 0, x: -10 }, { opacity: 1, x: 0, duration: 0.42, delay: i * 0.14, repeat: -1, repeatDelay: 4.2, ease: "power2.out" });
        });
      }, []);
      return (
        <div style={{ width: 240, background: "#fff", borderRadius: 18, border: "1px solid rgba(0,0,0,.07)", boxShadow: "0 8px 28px rgba(0,0,0,.08)", padding: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <CalendarDays size={14} color={accent} />
            <span style={{ fontSize: 11, fontWeight: 700, color: "#374151" }}>Season Calendar — Kharif</span>
          </div>
          {events.map((e, i) => (
            <div key={i} ref={el => rowRefs.current[i] = el} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: i < events.length - 1 ? "1px dashed #f3f4f6" : "none", opacity: 0 }}>
              <span style={{ fontFamily: "var(--mono)", fontSize: 9, color: "#9ca3af", width: 36, flexShrink: 0 }}>{e.day}</span>
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: e.dot, flexShrink: 0 }} />
              <span style={{ fontSize: 11, fontWeight: 500, color: "#374151" }}>{e.label}</span>
            </div>
          ))}
          <div style={{ marginTop: 12, paddingTop: 10, borderTop: "1px dashed #e5e7eb", display: "flex", alignItems: "center", gap: 6 }}>
            <CheckCircle2 size={11} color={accent} />
            <span style={{ fontSize: 10, color: "#6b7280" }}>Calibrated to your soil profile</span>
          </div>
        </div>
      );
    },
  },
  {
    accent: "#15803d", tag: "Always", eyebrow: "Privacy by design.",
    title: "Your data stays\nyours. Always.",
    desc: "Every byte is encrypted end-to-end and belongs exclusively to you. We never sell, share, or train models on your farm data without explicit, revocable consent.",
    stat: { val: "100%", lbl: "data ownership. full stop." },
    visual: ({ accent }) => {
      const ringRef = useRef(null);
      useEffect(() => {
        gsap.to(ringRef.current, { scale: 1.14, opacity: 0.35, duration: 2.4, repeat: -1, yoyo: true, ease: "sine.inOut" });
      }, []);
      return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
          <div style={{ position: "relative", width: 110, height: 110, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div ref={ringRef} style={{ position: "absolute", inset: -10, borderRadius: "50%", background: accent, opacity: 0.18, filter: "blur(18px)" }} />
            <div style={{ width: 96, height: 96, borderRadius: "50%", background: `${accent}12`, border: `2px dashed ${accent}35`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <ShieldCheck size={38} color={accent} strokeWidth={1.4} />
            </div>
          </div>
          <div style={{ width: 230, background: "#fff", borderRadius: 16, border: "1px solid rgba(0,0,0,.07)", boxShadow: "0 8px 28px rgba(0,0,0,.08)", padding: "14px 18px" }}>
            {["End-to-end encrypted", "Zero data selling", "Full data ownership", "Explicit consent only", "DPDP Act compliant"].map((r, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 0", borderBottom: i < 4 ? "1px dashed #f3f4f6" : "none" }}>
                <CheckCircle2 size={12} color="#16a34a" />
                <span style={{ fontSize: 11, color: "#374151" }}>{r}</span>
              </div>
            ))}
          </div>
        </div>
      );
    },
  },
];

const HowItWorks = () => {
  const outerRef = useRef(null);
  const stickyRef = useRef(null);
  const fillRef = useRef(null);
  const dotsRef = useRef([]);
  const panelsRef = useRef([]);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const panels = panelsRef.current;
    gsap.set(outerRef.current, { height: `${STEPS.length * 100}vh` });
    gsap.set(panels[0], { opacity: 1 });
    panels[0]?.classList.add("vis");

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: outerRef.current,
        start: "top top",
        end: "bottom bottom",
        scrub: 0.55,
        pin: stickyRef.current,
        pinSpacing: false,
        onUpdate(self) {
          const p = self.progress;
          const idx = Math.min(Math.floor(p * STEPS.length), STEPS.length - 1);
          if (fillRef.current) fillRef.current.style.height = (p * 100) + "%";
          dotsRef.current.forEach((d, i) => d && (i <= idx ? d.classList.add("on") : d.classList.remove("on")));
          setActive(idx);
        },
      },
    });

    STEPS.forEach((_, i) => {
      const panel = panels[i];
      if (!panel) return;
      if (i === 0) {
        tl.to(panel, { opacity: 0, x: -50, duration: 0.3, ease: "power2.in" }, `+=${1 / STEPS.length * 0.65}`);
      } else {
        tl.fromTo(panel,
          { opacity: 0, x: 60 },
          {
            opacity: 1, x: 0, duration: 0.3, ease: "power2.out",
            onStart() { panel.classList.add("vis"); },
            onReverseComplete() { panel.classList.remove("vis"); },
          }
        );
        if (i < STEPS.length - 1) {
          tl.to(panel, { opacity: 0, x: -50, duration: 0.3, ease: "power2.in" }, `+=${1 / STEPS.length * 0.38}`);
        }
      }
    });

    return () => ScrollTrigger.getAll().forEach(t => t.kill());
  }, []);

  return (
    <section style={{ background: "#f9fafb" }}>
      <div className="mx" style={{ paddingTop: 80, paddingBottom: 0 }}>
        <div style={{ textAlign: "center", marginBottom: 0, paddingBottom: 48 }}>
          <div className="sec-pill pill-green">How It Works</div>
          <h2 className="sec-h2">From soil report<br />to harvest plan</h2>
          <p className="sec-sub" style={{ margin: "12px auto 0", textAlign: "center" }}>Four steps. Most farmers complete their first plan in under 15 minutes.</p>
        </div>
      </div>
      <div ref={outerRef} className="story-outer">
        <div ref={stickyRef} className="story-sticky">
          <div className="story-progress"><div ref={fillRef} className="story-fill" /></div>
          <div className="story-dots">
            {STEPS.map((_, i) => (
              <div key={i} ref={el => dotsRef.current[i] = el} className={`s-dot ${i === 0 ? "on" : ""}`} />
            ))}
          </div>
          {STEPS.map((step, i) => {
            const Visual = step.visual;
            const isEven = i % 2 === 0;
            return (
              <div key={i} ref={el => panelsRef.current[i] = el} className="s-panel">
                <div className="s-grid" style={{ direction: isEven ? "ltr" : "rtl" }}>
                  <div style={{ direction: "ltr" }}>
                    <span style={{ display: "inline-block", fontSize: 10, fontWeight: 700, letterSpacing: ".2em", textTransform: "uppercase", padding: "4px 12px", borderRadius: 50, background: `${step.accent}12`, color: step.accent, border: `1px solid ${step.accent}25`, marginBottom: 12 }}>{step.tag}</span>
                    <p style={{ fontSize: 13, fontWeight: 600, color: step.accent, marginBottom: 8, fontFamily: "var(--sans)" }}>{step.eyebrow}</p>
                    <h2 style={{ fontFamily: "var(--serif)", fontSize: "clamp(2rem,3.2vw,2.8rem)", fontWeight: 700, lineHeight: 1.07, color: "#0f172a", marginBottom: 16, whiteSpace: "pre-line" }}>{step.title}</h2>
                    <p style={{ fontSize: 14, color: "#6b7280", lineHeight: 1.78, fontWeight: 300, marginBottom: 26 }}>{step.desc}</p>
                    <div style={{ display: "inline-flex", alignItems: "center", gap: 14, padding: "12px 20px", borderRadius: 16, border: `1.5px dashed ${step.accent}28`, background: `${step.accent}07` }}>
                      <span style={{ fontFamily: "var(--serif)", fontSize: "1.9rem", fontWeight: 700, color: step.accent }}>{step.stat.val}</span>
                      <span style={{ fontSize: 12, color: "#6b7280", maxWidth: 110, lineHeight: 1.4 }}>{step.stat.lbl}</span>
                    </div>
                  </div>
                  <div style={{ direction: "ltr", height: 320, background: `${step.accent}07`, border: `1.5px dashed ${step.accent}20`, borderRadius: 22, display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden" }}>
                    <Visual accent={step.accent} />
                  </div>
                </div>
              </div>
            );
          })}
          <span className="tag-num" style={{ position: "absolute", bottom: 24, right: 36 }}>{String(active + 1).padStart(2, "0")} / {String(STEPS.length).padStart(2, "0")}</span>
        </div>
      </div>
    </section>
  );
};

/* ═══════════════════════════════════════════════════
   FEATURE SHOWCASE (tabbed)
═══════════════════════════════════════════════════ */
const Features = () => {
  const [tab, setTab] = useState(0);
  const headRef = useRef(null);
  const TABS = [
    {
      label: "Price Alerts",
      content: {
        title: "Never miss the right selling moment",
        desc: "Set price thresholds for any crop and any mandi. Get notified the moment your target price is hit — by SMS, WhatsApp, or in-app.",
        points: ["Live prices from 800+ mandis", "Custom threshold alerts", "Historical price trends", "Best mandi comparison"],
        mockup: () => (
          <div style={{ background: "#fff", borderRadius: 16, border: "1.5px dashed #e5e7eb", padding: 18, width: 260 }}>
            <p style={{ fontSize: 11, fontWeight: 700, marginBottom: 12, color: "#374151" }}>Price Tracker — Wheat</p>
            {[
              { mandi: "Ludhiana", price: "₹2,520", change: "+8.2%", hot: true },
              { mandi: "Amritsar", price: "₹2,490", change: "+6.1%", hot: false },
              { mandi: "Bathinda", price: "₹2,445", change: "+4.3%", hot: false },
            ].map(r => (
              <div key={r.mandi} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px dashed #f3f4f6" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                  {r.hot && <div className="pdot" style={{ background: "#16a34a" }} />}
                  <span style={{ fontSize: 12, color: "#374151" }}>{r.mandi}</span>
                </div>
                <div style={{ textAlign: "right" }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#111827", fontFamily: "var(--mono)" }}>{r.price}</span>
                  <span style={{ fontSize: 10, color: "#16a34a", marginLeft: 6 }}>{r.change}</span>
                </div>
              </div>
            ))}
            <div style={{ marginTop: 12, padding: "8px 12px", borderRadius: 9, background: "rgba(22,163,74,.08)", border: "1px solid rgba(22,163,74,.18)", fontSize: 11, color: "#15803d", fontWeight: 600 }}>
              🔔 Alert: Ludhiana hit ₹2,500 target
            </div>
          </div>
        ),
      },
    },
    {
      label: "Soil Analysis",
      content: {
        title: "Deep insight into every inch of your land",
        desc: "Upload a PDF or enter values manually. Get a full breakdown of soil health with deficiency flags and exact fertiliser recommendations.",
        points: ["NPK, pH, OC extraction", "Deficiency flags", "Fertiliser dosage calculator", "Multi-plot comparison"],
        mockup: () => (
          <div style={{ background: "#fff", borderRadius: 16, border: "1.5px dashed #e5e7eb", padding: 18, width: 260 }}>
            <p style={{ fontSize: 11, fontWeight: 700, marginBottom: 12, color: "#374151" }}>Soil Health Report</p>
            {[
              { label: "Nitrogen (N)", val: 68, max: 100, color: "#16a34a" },
              { label: "Phosphorus (P)", val: 42, max: 100, color: "#f97316" },
              { label: "Potassium (K)", val: 81, max: 100, color: "#3b82f6" },
              { label: "pH Level", val: 72, max: 100, color: "#8b5cf6" },
            ].map(r => (
              <div key={r.label} style={{ marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontSize: 10, color: "#6b7280" }}>{r.label}</span>
                  <span style={{ fontSize: 10, fontWeight: 700, color: r.color, fontFamily: "var(--mono)" }}>{r.val}</span>
                </div>
                <div style={{ height: 5, background: "#f3f4f6", borderRadius: 3 }}>
                  <div style={{ width: `${r.val}%`, height: "100%", background: r.color, borderRadius: 3 }} />
                </div>
              </div>
            ))}
            <div style={{ marginTop: 10, padding: "7px 10px", borderRadius: 8, background: "rgba(249,115,22,.08)", border: "1px solid rgba(249,115,22,.2)", fontSize: 10, color: "#c2410c" }}>
              ⚠ Low Phosphorus — add 25kg DAP/acre
            </div>
          </div>
        ),
      },
    },
    {
      label: "Weather",
      content: {
        title: "14-day village-level forecasts",
        desc: "Hyperlocal weather data tailored to your farm's GPS coordinates — not just the nearest district. Know exactly when to irrigate or delay sowing.",
        points: ["Village-level precision", "Irrigation timing", "Rain probability", "Frost/heat alerts"],
        mockup: () => (
          <div style={{ background: "#fff", borderRadius: 16, border: "1.5px dashed #e5e7eb", padding: 18, width: 260 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: "#374151" }}>7-day Forecast</p>
              <span style={{ fontSize: 9, color: "#3b82f6", fontWeight: 600 }}>Village level</span>
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
                <div key={i} style={{ flex: 1, textAlign: "center" }}>
                  <p style={{ fontSize: 9, color: "#9ca3af", marginBottom: 6 }}>{d}</p>
                  <div style={{ width: "100%", height: 40, background: i < 2 ? "rgba(59,130,246,.08)" : i < 5 ? "rgba(22,163,74,.08)" : "rgba(249,115,22,.08)", borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {i < 2 ? <CloudRain size={13} color="#3b82f6" /> : <Zap size={13} color={i < 5 ? "#16a34a" : "#f97316"} />}
                  </div>
                  <p style={{ fontSize: 9, fontWeight: 700, color: "#374151", marginTop: 4 }}>{[24, 22, 28, 31, 29, 26, 23][i]}°</p>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 12, padding: "7px 10px", borderRadius: 8, background: "rgba(59,130,246,.06)", border: "1px solid rgba(59,130,246,.15)", fontSize: 10, color: "#1d4ed8" }}>
              💧 Rain on Mon–Tue. Hold irrigation.
            </div>
          </div>
        ),
      },
    },
    {
      label: "Season Plan",
      content: {
        title: "Your entire season, mapped out",
        desc: "Get a complete planting calendar with exact dates for sowing, irrigation, fertilisation and harvest — all personalised to your crops and soil.",
        points: ["Crop-specific timelines", "Irrigation scheduling", "Fertilisation windows", "Harvest date prediction"],
        mockup: () => (
          <div style={{ background: "#fff", borderRadius: 16, border: "1.5px dashed #e5e7eb", padding: 18, width: 260 }}>
            <p style={{ fontSize: 11, fontWeight: 700, marginBottom: 12, color: "#374151" }}>Kharif 2024 Plan</p>
            {[
              { date: "Jun 15", event: "Land preparation", col: "#6b7280" },
              { date: "Jun 20", event: "Sow Basmati seeds", col: "#16a34a" },
              { date: "Jul 05", event: "First irrigation", col: "#3b82f6" },
              { date: "Jul 22", event: "Apply urea 50kg/ac", col: "#f97316" },
              { date: "Oct 10", event: "Harvest window opens", col: "#eab308" },
            ].map((e, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 0", borderBottom: i < 4 ? "1px dashed #f3f4f6" : "none" }}>
                <span style={{ fontFamily: "var(--mono)", fontSize: 9, color: "#9ca3af", width: 38, flexShrink: 0 }}>{e.date}</span>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: e.col, flexShrink: 0 }} />
                <span style={{ fontSize: 11, color: "#374151" }}>{e.event}</span>
              </div>
            ))}
          </div>
        ),
      },
    },
  ];

  useEffect(() => {
    gsap.from(headRef.current, { opacity: 0, y: 24, duration: 0.7, ease: "power3.out", scrollTrigger: { trigger: headRef.current, start: "top 82%" } });
  }, []);

  const c = TABS[tab].content;
  const Mockup = c.mockup;

  return (
    <section className="sec" style={{ background: "#fff" }}>
      <div className="mx">
        <div ref={headRef} style={{ marginBottom: 44 }}>
          <div className="sec-pill pill-green">Feature Deep-Dive</div>
          <h2 className="sec-h2">Explore every tool</h2>
        </div>
        {/* tabs */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 32 }}>
          {TABS.map((t, i) => (
            <button key={i} className={`feat-tab ${tab === i ? "active" : ""}`} onClick={() => setTab(i)}>{t.label}</button>
          ))}
        </div>
        {/* panel */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 48, alignItems: "center", background: "#f9fafb", borderRadius: 22, border: "1.5px dashed #e5e7eb", padding: 36 }}>
          <div>
            <h3 style={{ fontFamily: "var(--serif)", fontSize: "clamp(1.6rem,3vw,2.2rem)", fontWeight: 700, color: "#0f172a", marginBottom: 12, lineHeight: 1.1 }}>{c.title}</h3>
            <p style={{ fontSize: 14, color: "#6b7280", lineHeight: 1.75, fontWeight: 300, marginBottom: 24 }}>{c.desc}</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
              {c.points.map((p, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 9 }}>
                  <CheckCircle2 size={14} color="#16a34a" />
                  <span style={{ fontSize: 13, color: "#374151", fontWeight: 500 }}>{p}</span>
                </div>
              ))}
            </div>
          </div>
          <Mockup />
        </div>
      </div>
    </section>
  );
};

/* ═══════════════════════════════════════════════════
   REVIEWS / RATINGS
═══════════════════════════════════════════════════ */
const REVIEWS = [
  { name: "Harpreet Singh", role: "Wheat farmer, Punjab", avatar: "HS", rating: 5, accent: "#16a34a", date: "Jan 2025", text: "In 20 years of farming I've never had this kind of clarity. The crop recommendation matched exactly what grew best on my land. Income up ₹1.2L this season alone.", verified: true },
  { name: "Meenakshi Devi", role: "Vegetable grower, UP", avatar: "MD", rating: 5, accent: "#059669", date: "Dec 2024", text: "The soil analysis showed low phosphorus I never knew about. Fixed it, yield doubled. Simple as that. I recommend every farmer in my village to try it.", verified: true },
  { name: "Ramesh Patel", role: "Cotton farmer, Gujarat", avatar: "RP", rating: 5, accent: "#0d9488", date: "Nov 2024", text: "Price alert woke me at 5am — cotton hit ₹6,800 in Rajkot. I rushed to the mandi and sold everything. Made ₹80,000 more than my neighbour who waited.", verified: true },
  { name: "Sunita Kumari", role: "Rice grower, Bihar", avatar: "SK", rating: 4, accent: "#8b5cf6", date: "Oct 2024", text: "The calendar feature is a game changer. I used to rely on my father's memory for sowing dates. Now I have exact dates with reminders. Much less stress.", verified: true },
  { name: "Arjun Reddy", role: "Soybean farmer, MP", avatar: "AR", rating: 5, accent: "#f97316", date: "Sep 2024", text: "I was sceptical at first. But the soybean forecast was accurate within 3%. I followed the advice and avoided selling during the dip. Best decision of the year.", verified: true },
  { name: "Kavita Sharma", role: "Multi-crop, Haryana", avatar: "KS", rating: 5, accent: "#eab308", date: "Aug 2024", text: "Hindi support makes it easy for my family to use. My husband, who doesn't read English, now checks the app every morning. That's how good the UX is.", verified: true },
];

const RatingRing = ({ value, label, animRef }) => {
  const fillRef = useRef(null);
  const circumference = 2 * Math.PI * 45;

  useEffect(() => {
    if (!animRef) return;
    ScrollTrigger.create({
      trigger: animRef,
      start: "top 80%",
      onEnter: () => {
        if (!fillRef.current) return;
        const offset = circumference - (value / 5) * circumference;
        fillRef.current.style.strokeDashoffset = offset;
      },
    });
  }, []);

  return (
    <div style={{ textAlign: "center" }}>
      <div className="rating-ring" style={{ width: 110, height: 110, position: "relative", margin: "0 auto 10px" }}>
        <svg viewBox="0 0 100 100" width={110} height={110} style={{ transform: "rotate(-90deg)" }}>
          <circle cx="50" cy="50" r="45" fill="none" stroke="#e5e7eb" strokeWidth="7" />
          <circle ref={fillRef} cx="50" cy="50" r="45" fill="none" stroke="var(--g1)" strokeWidth="7"
            strokeLinecap="round"
            style={{ strokeDasharray: circumference, strokeDashoffset: circumference, transition: "stroke-dashoffset 1.3s cubic-bezier(.22,1,.36,1)" }}
          />
        </svg>
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", textAlign: "center" }}>
          <p style={{ fontFamily: "var(--serif)", fontSize: "1.6rem", fontWeight: 700, color: "#0f172a", lineHeight: 1 }}>{value}</p>
          <p style={{ fontSize: 9, color: "#9ca3af" }}>/ 5</p>
        </div>
      </div>
      <p style={{ fontSize: 11, color: "#6b7280", fontWeight: 500 }}>{label}</p>
    </div>
  );
};

const Reviews = () => {
  const headRef = useRef(null);
  const ratingsRef = useRef(null);
  const scrollRef = useRef(null);

  const scroll = (dir) => {
    if (scrollRef.current) scrollRef.current.scrollBy({ left: dir * 320, behavior: "smooth" });
  };

  useEffect(() => {
    gsap.from(headRef.current, { opacity: 0, y: 24, duration: 0.7, ease: "power3.out", scrollTrigger: { trigger: headRef.current, start: "top 82%" } });
    REVIEWS.forEach((_, i) => {
      const el = document.querySelector(`.rv-${i}`);
      if (!el) return;
      gsap.to(el, { opacity: 1, y: 0, duration: 0.6, ease: "power3.out", delay: i * 0.07, scrollTrigger: { trigger: el, start: "top 90%" } });
    });
  }, []);

  const RATING_BREAKDOWN = [
    { stars: 5, pct: 82 }, { stars: 4, pct: 12 }, { stars: 3, pct: 4 }, { stars: 2, pct: 1 }, { stars: 1, pct: 1 },
  ];

  return (
    <section className="sec" style={{ background: "#f9fafb" }}>
      <div className="mx">
        <div ref={headRef} style={{ marginBottom: 48 }}>
          <div className="sec-pill pill-green"><MessageSquare size={10} /> Reviews & Ratings</div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 16 }}>
            <div>
              <h2 className="sec-h2">Farmers speak for us</h2>
              <p className="sec-sub">48,000+ verified reviews from real farmers across 18 states.</p>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => scroll(-1)} style={{ width: 38, height: 38, borderRadius: "50%", border: "1.5px dashed #e5e7eb", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "border-color .2s" }}
                onMouseEnter={e => e.currentTarget.style.borderColor = "#16a34a"} onMouseLeave={e => e.currentTarget.style.borderColor = "#e5e7eb"}>
                <ChevronLeft size={15} color="#374151" />
              </button>
              <button onClick={() => scroll(1)} style={{ width: 38, height: 38, borderRadius: "50%", border: "1.5px dashed #e5e7eb", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "border-color .2s" }}
                onMouseEnter={e => e.currentTarget.style.borderColor = "#16a34a"} onMouseLeave={e => e.currentTarget.style.borderColor = "#e5e7eb"}>
                <ChevronRight size={15} color="#374151" />
              </button>
            </div>
          </div>
        </div>

        {/* Rating summary + rings */}
        <div ref={ratingsRef} style={{ display: "grid", gridTemplateColumns: "auto 1fr auto auto auto", gap: 40, alignItems: "center", background: "#fff", borderRadius: 22, border: "1.5px dashed #e5e7eb", padding: "28px 36px", marginBottom: 32, flexWrap: "wrap" }}>
          {/* big number */}
          <div style={{ textAlign: "center" }}>
            <p style={{ fontFamily: "var(--serif)", fontSize: "4rem", fontWeight: 700, color: "#0f172a", lineHeight: 1 }}>4.9</p>
            <div style={{ display: "flex", gap: 2, justifyContent: "center", margin: "6px 0 4px" }}>
              {[...Array(5)].map((_, i) => <Star key={i} size={13} fill="#eab308" color="#eab308" />)}
            </div>
            <p style={{ fontSize: 10, color: "#9ca3af" }}>48,241 reviews</p>
          </div>
          {/* bar breakdown */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {RATING_BREAKDOWN.map(r => (
              <div key={r.stars} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 10, color: "#9ca3af", width: 14, textAlign: "right" }}>{r.stars}</span>
                <Star size={10} fill="#eab308" color="#eab308" />
                <div style={{ flex: 1, height: 5, background: "#f3f4f6", borderRadius: 3, overflow: "hidden" }}>
                  <div style={{ width: `${r.pct}%`, height: "100%", background: r.pct > 50 ? "#16a34a" : "#eab308", borderRadius: 3 }} />
                </div>
                <span style={{ fontSize: 10, color: "#9ca3af", width: 24 }}>{r.pct}%</span>
              </div>
            ))}
          </div>
          {/* rings */}
          <RatingRing value={4.9} label="Overall" animRef={ratingsRef.current} />
          <RatingRing value={4.8} label="Ease of use" animRef={ratingsRef.current} />
          <RatingRing value={4.9} label="Accuracy" animRef={ratingsRef.current} />
        </div>

        {/* Review cards scroll */}
        <div ref={scrollRef} className="reviews-scroll">
          {REVIEWS.map((r, i) => (
            <div key={i} className={`review-card rv-${i}`}>
              <div style={{ display: "flex", gap: 2, marginBottom: 10 }}>
                {[...Array(r.rating)].map((_, j) => <Star key={j} size={12} fill="#eab308" color="#eab308" />)}
              </div>
              <Quote size={16} color="rgba(22,163,74,.25)" style={{ marginBottom: 8 }} />
              <p style={{ fontSize: 12.5, color: "#374151", lineHeight: 1.72, marginBottom: 14 }}>{r.text}</p>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 34, height: 34, borderRadius: "50%", background: `${r.accent}12`, border: `1px solid ${r.accent}25`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontSize: 9, fontWeight: 800, color: r.accent, fontFamily: "var(--mono)" }}>{r.avatar}</span>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <p style={{ fontSize: 12, fontWeight: 700, color: "#111827" }}>{r.name}</p>
                    {r.verified && <span style={{ fontSize: 8, fontWeight: 700, padding: "1px 6px", borderRadius: 50, background: "rgba(22,163,74,.1)", color: "#16a34a" }}>Verified</span>}
                  </div>
                  <p style={{ fontSize: 10, color: "#9ca3af" }}>{r.role} · {r.date}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Thumbs up totals */}
        <div style={{ display: "flex", gap: 20, marginTop: 20, flexWrap: "wrap" }}>
          {[
            { icon: ThumbsUp, label: "Would recommend", val: "97%" },
            { icon: Award, label: "Improved yield",     val: "89%" },
            { icon: TrendingUp, label: "Earned more",   val: "76%" },
          ].map((s, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 18px", borderRadius: 12, background: "#fff", border: "1.5px dashed #e5e7eb" }}>
              <s.icon size={14} color="#16a34a" />
              <span style={{ fontSize: 12, color: "#374151" }}>{s.label}</span>
              <span style={{ fontFamily: "var(--mono)", fontSize: 13, fontWeight: 700, color: "#16a34a" }}>{s.val}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ═══════════════════════════════════════════════════
   SOCIAL PROOF MARQUEE (press / awards)
═══════════════════════════════════════════════════ */
const SocialProof = () => (
  <div style={{ padding: "36px 0", background: "#fff", borderTop: "1.5px dashed #f3f4f6", borderBottom: "1.5px dashed #f3f4f6" }}>
    <div className="mx">
      <p style={{ fontSize: 10, color: "#9ca3af", textAlign: "center", letterSpacing: ".18em", textTransform: "uppercase", marginBottom: 24 }}>As seen in & awarded by</p>
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 40, flexWrap: "wrap" }}>
        {["AgriTech India 2024", "NASSCOM Top 10", "Forbes 30 Under 30", "Ministry of Agriculture", "Startup India"].map(b => (
          <span key={b} style={{ fontSize: 12, fontWeight: 700, color: "#d1d5db", letterSpacing: ".05em" }}>{b}</span>
        ))}
      </div>
    </div>
  </div>
);

/* ═══════════════════════════════════════════════════
   FAQ
═══════════════════════════════════════════════════ */
const FAQ = () => {
  const [open, setOpen] = useState(null);
  const headRef = useRef(null);

  const QA = [
    { q: "Is AgroIntel free to use?", a: "Yes — there is a fully functional free tier that includes 1 soil report upload per month, basic crop recommendations, and weekly price digests. Paid plans unlock unlimited uploads, real-time alerts, and multi-plot management." },
    { q: "What type of soil reports does it accept?", a: "AgroIntel accepts any standard soil test PDF from government labs (IARI, KVK) or private labs. You can also enter values manually if you only have a printout. Supported parameters include NPK, pH, EC, OC, micronutrients and more." },
    { q: "How accurate are the crop recommendations?", a: "Our model achieves 94% accuracy measured against actual yield outcomes across our user base. Accuracy improves with each upload as the model learns your specific land's characteristics over multiple seasons." },
    { q: "Which languages is the app available in?", a: "Currently supported: Hindi, English, Punjabi, Marathi, Gujarati, Telugu, and Tamil. Kannada and Bengali support is arriving in Q2 2025." },
    { q: "Is my farm data private and secure?", a: "Absolutely. All data is encrypted at rest and in transit. We are fully compliant with India's DPDP Act. Your data is never sold, never shared with third parties, and never used to train AI models without your explicit, revocable consent." },
    { q: "Does it work without internet on the farm?", a: "The mobile app caches your current season plan, soil data, and 7-day weather forecast offline. You can view and act on recommendations even without a connection. Data syncs automatically when you reconnect." },
    { q: "How does the price alert system work?", a: "You set a target price for any crop at any mandi. When live prices hit or exceed your target, you receive an instant notification via push, SMS, and optionally WhatsApp. You can also browse live prices across all 800+ mandis any time." },
    { q: "Can I manage multiple plots or farms?", a: "Yes. Pro and Enterprise plans support unlimited plots each with their own soil profile, crop schedule, and calendar. Ideal for large farms or farmer producer organisations (FPOs) managing many members." },
  ];

  useEffect(() => {
    gsap.from(headRef.current, { opacity: 0, y: 24, duration: 0.7, ease: "power3.out", scrollTrigger: { trigger: headRef.current, start: "top 82%" } });
  }, []);

  return (
    <section className="sec" style={{ background: "#fff" }}>
      <div className="mx" style={{ maxWidth: "52rem" }}>
        <div ref={headRef} style={{ textAlign: "center", marginBottom: 48 }}>
          <div className="sec-pill pill-green">FAQ</div>
          <h2 className="sec-h2">Common questions</h2>
          <p className="sec-sub" style={{ margin: "12px auto 0", textAlign: "center" }}>Everything you need to know before you start.</p>
        </div>
        {QA.map((item, i) => (
          <div key={i} className="faq-item">
            <button className="faq-q" onClick={() => setOpen(open === i ? null : i)}>
              <span>{item.q}</span>
              <div style={{ width: 26, height: 26, borderRadius: "50%", border: "1.5px dashed #e5e7eb", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "background .2s,border-color .2s", background: open === i ? "var(--g1)" : "#fff", borderColor: open === i ? "var(--g1)" : "#e5e7eb" }}>
                {open === i ? <Minus size={12} color="#fff" /> : <Plus size={12} color="#9ca3af" />}
              </div>
            </button>
            <div className={`faq-a ${open === i ? "open" : ""}`}>{item.a}</div>
          </div>
        ))}
      </div>
    </section>
  );
};

/* ═══════════════════════════════════════════════════
   FINAL CTA
═══════════════════════════════════════════════════ */
const CTA = ({ navigate }) => {
  const h2Ref  = useRef(null);
  const subRef = useRef(null);
  const bRef   = useRef(null);

  useEffect(() => {
    const st = { trigger: ".cta-sec", start: "top 72%" };
    gsap.to(h2Ref.current,  { opacity: 1, y: 0, duration: 0.75, ease: "power3.out",        scrollTrigger: st });
    gsap.to(subRef.current, { opacity: 1, y: 0, duration: 0.65, ease: "power3.out", delay: .12, scrollTrigger: st });
    gsap.to(bRef.current,   { opacity: 1, y: 0, duration: 0.6,  ease: "power3.out", delay: .22, scrollTrigger: st });
  }, []);

  return (
    <section className="cta-sec grid-dark">
      <div className="cta-glow" />
      <div style={{ position: "relative", zIndex: 10, maxWidth: "52rem", margin: "0 auto" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 16px", borderRadius: 50, background: "rgba(255,255,255,.1)", border: "1px solid rgba(255,255,255,.18)", backdropFilter: "blur(8px)", marginBottom: 14 }}>
          <CirclePlus size={11} color="#86efac" />
          <span style={{ fontSize: 10, fontWeight: 700, color: "#86efac", letterSpacing: ".18em", textTransform: "uppercase" }}>Free to start</span>
        </div>
        <h2 ref={h2Ref} style={{ fontFamily: "var(--serif)", fontSize: "clamp(2.8rem,5.5vw,4.8rem)", fontWeight: 700, color: "#fff", lineHeight: 1.04, marginBottom: 16, opacity: 0, transform: "translateY(28px)" }}>
          Ready to grow<br />smarter?
        </h2>
        <p ref={subRef} style={{ fontSize: 15, color: "rgba(209,250,229,.75)", fontWeight: 300, maxWidth: 460, margin: "0 auto 36px", lineHeight: 1.72, opacity: 0, transform: "translateY(18px)" }}>
          Join 48,000+ farmers making better decisions every season. No credit card. No commitments. Just better farming.
        </p>
        <div ref={bRef} style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", opacity: 0, transform: "translateY(16px)" }}>
          <button style={{ display: "inline-flex", alignItems: "center", gap: 9, padding: "14px 28px", borderRadius: 14, background: "#fff", color: "var(--gd)", fontSize: 14, fontWeight: 700, border: "none", cursor: "pointer", boxShadow: "0 8px 28px rgba(0,0,0,.2)", transition: "transform .2s" }}
            onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"} onMouseLeave={e => e.currentTarget.style.transform = ""}
            onClick={() => navigate("/signup")}>
            <Plus size={15} /> Create free account <ArrowRight size={14} />
          </button>
          <button style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "14px 28px", borderRadius: 14, background: "rgba(255,255,255,.08)", border: "1.5px solid rgba(255,255,255,.24)", color: "rgba(255,255,255,.88)", fontSize: 14, fontWeight: 500, cursor: "pointer", backdropFilter: "blur(8px)", transition: "transform .2s,background .2s" }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.background = "rgba(255,255,255,.14)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.background = "rgba(255,255,255,.08)"; }}
            onClick={() => navigate("/login")}>
            Sign in <ArrowUpRight size={14} />
          </button>
        </div>
        <p style={{ fontSize: 11, color: "rgba(167,243,208,.4)", marginTop: 22, letterSpacing: ".05em" }}>No credit card · Full access for 14 days · Cancel anytime</p>
      </div>
    </section>
  );
};

/* ═══════════════════════════════════════════════════
   ROOT
═══════════════════════════════════════════════════ */
const WatchDemo = () => {
  const [loaded, setLoaded] = useState(false);
  const navigate = useNavigate();

  return (
    <>
      <S />
      {!loaded && <Loader onDone={() => setLoaded(true)} />}
      {loaded && (
        <div className="wd-root max-w-5xl mx-auto">
          <Hero navigate={navigate} />
          <MarqueeBand />
          <Stats />
          <Why />
          <VideoDemo />
          <HowItWorks />
          <Features />
          <Reviews />
          <SocialProof />
          <FAQ />
          <CTA navigate={navigate} />
        </div>
      )}
    </>
  );
};

export default WatchDemo;