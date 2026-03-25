import React from "react";
import { motion } from "framer-motion";
import { Sprout, Twitter, Github, Linkedin, Mail } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";

const SOCIALS = [
  { icon: Twitter, href: "https://twitter.com" },
  { icon: Github, href: "https://github.com" },
  { icon: Linkedin, href: "https://linkedin.com" },
  { icon: Mail, href: "mailto:contact@agrointel.com" },
];

const Footer = () => {
  const navigate = useNavigate();
  const { t, n } = useLanguage();

  const LINKS = {
    [t("footer.product")]: [
      t("nav.dashboard"),
      t("nav.soilAnalysis"),
      t("nav.cropPlanner"),
      t("nav.marketTrends"),
    ],
    [t("footer.company")]: [
      t("footer.about"),
      t("footer.blog"),
      t("footer.careers"),
      t("footer.press"),
    ],
    [t("footer.legal")]: [
      t("footer.privacyPolicy"),
      t("footer.termsOfUse"),
      t("footer.dataSecurity"),
    ],
  };

  return (
    <footer className="mt-12 lg:pl-16">
      {/* Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-green-100 to-transparent mx-4 sm:mx-8" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand col */}
          <div className="col-span-2 sm:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <motion.div
                whileHover={{ scale: 1.05, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
                className="w-8 h-8 rounded-[10px] flex items-center justify-center transition-shadow"
              >
                <img src="./logo-brows.png" alt="logo" className="w-8 h-8" />
              </motion.div>
              <span className="font-cormorant text-[1.2rem] font-bold text-gray-800">
                {t("common.brand")}
              </span>
            </div>
            <p className="font-dm font-light text-gray-400 text-[12.5px] leading-relaxed mb-5 max-w-[180px]">
              {t("footer.tagline")}
            </p>
            {/* Socials */}
            <div className="flex gap-2">
              {SOCIALS.map(({ icon: Icon, href }) => (
                <a
                  key={href + Icon.name}
                  href={href}
                  className="w-8 h-8 rounded-xl bg-gray-50 border border-gray-100
                             flex items-center justify-center text-gray-400
                             hover:text-green-600 hover:border-green-200 hover:bg-green-50
                             transition-all duration-150"
                >
                  <Icon size={14} />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(LINKS).map(([section, items]) => (
            <div key={section}>
              <p className="font-dm text-[10.5px] uppercase tracking-[0.18em] text-gray-400 font-medium mb-3">
                {section}
              </p>
              <ul className="space-y-2">
                {items.map((item) => (
                  <li key={item}>
                    <button
                      onClick={() => navigate("/")}
                      className="font-dm text-[12.5px] text-gray-500 font-light
                                 hover:text-green-600 transition-colors cursor-pointer"
                    >
                      {item}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div
          className="mt-10 pt-5 border-t border-gray-100 flex flex-col sm:flex-row
                        items-center justify-between gap-3"
        >
          <p className="font-dm text-[11.5px] text-gray-400 font-light">
            © {n(new Date().getFullYear())} {t("common.brand")} AI. {t("footer.allRights")}
          </p>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            <span className="font-dm text-[11px] text-gray-400">
              {t("footer.allSystemsOperational")}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
