import React, { useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, FileText, Image, File } from "lucide-react";
import { useDropzone } from "react-dropzone";
import GridPattern from "./grid-pattern";

/* ── File type icon map ── */
const FILE_ICONS = {
  pdf: <FileText size={13} className="text-red-400" />,
  doc: <FileText size={13} className="text-blue-400" />,
  docx: <FileText size={13} className="text-blue-400" />,
  jpg: <Image size={13} className="text-amber-400" />,
  jpeg: <Image size={13} className="text-amber-400" />,
  png: <Image size={13} className="text-amber-400" />,
};

const getExt = (name) => name.split(".").pop().toLowerCase();

/* ── Float animation variants (inspired by the shared FileUpload) ── */
const floatVariant = {
  initial: { x: 0, y: 0, rotate: -1 },
  animate: { x: 16, y: -16, rotate: 2, opacity: 0.88 },
};

const ghostVariant = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
};

/* ────────────────────────────────────────────
   FILE CHIP
──────────────────────────────────────────── */
const FileChip = ({ file, onRemove }) => {
  const icon = FILE_ICONS[getExt(file.name)] || (
    <File size={13} className="text-gray-400" />
  );
  const sizeMB = (file.size / (1024 * 1024)).toFixed(2);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.8, y: 8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.75, x: -8 }}
      transition={{ type: "spring", stiffness: 420, damping: 30 }}
      className="flex items-center gap-2 pl-2.5 pr-1.5 py-1.5 bg-white border border-green-200 rounded-full shadow-sm"
    >
      {icon}
      <span className="text-[11.5px] text-gray-700 truncate max-w-[120px] font-dm">
        {file.name}
      </span>
      {file.docType && (
        <span className="text-[9px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-full shrink-0">
          {file.docType}
        </span>
      )}
      <span className="text-[10px] text-gray-400 shrink-0 font-dm">
        {sizeMB} MB
      </span>
      <button
        type="button"
        onClick={() => onRemove(file.name)}
        className="w-[18px] h-[18px] flex items-center justify-center rounded-full
                   bg-gray-100 hover:bg-red-100 hover:text-red-500 text-gray-400
                   transition-colors ml-0.5 shrink-0"
      >
        <X size={10} strokeWidth={3} />
      </button>
    </motion.div>
  );
};

/* ────────────────────────────────────────────
   FILE UPLOAD ZONE
──────────────────────────────────────────── */
const FileUpload = ({ files, onAdd, onRemove, uploading = false, docTypeSelector }) => {
  const fileInputRef = useRef(null);

  const { getRootProps, isDragActive } = useDropzone({
    noClick: true,
    multiple: true,
    onDrop: onAdd,
  });

  return (
    <div className="space-y-3">
      {/* Optional document type selector rendered above drop zone */}
      {docTypeSelector && docTypeSelector}
      {/* ── Drop Zone ── */}
      <motion.div
        {...getRootProps()}
        whileHover="animate"
        onClick={() => fileInputRef.current?.click()}
        className="group/file relative w-full cursor-pointer overflow-hidden rounded-2xl
                   border border-green-200/80 bg-transparent min-h-[130px]"
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="*/*"
          className="hidden"
          onChange={(e) => onAdd(Array.from(e.target.files || []))}
        />

        {/* Tiled grid background */}
        <GridPattern />

        {/* Radial vignette — fades grid toward edges */}
        <div
          className="absolute inset-0 pointer-events-none rounded-2xl"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(255,255,255,0) 30%, rgba(255,255,255,0.72) 100%)",
          }}
        />

        {/* Centre content */}
        <div className="relative z-10 flex flex-col items-center justify-center py-7 gap-1.5">
          {/* Floating icon card */}
          <div className="relative w-16 h-16 mb-1">
            {/* Ghost dashed border — appears on hover */}
            <motion.div
              variants={ghostVariant}
              className="absolute inset-0 z-20 rounded-[14px] border-2 border-dashed
                         border-green-400/70 bg-transparent opacity-0
                         group-hover/file:opacity-100 transition-opacity duration-300"
            />

            {/* Main card — floats on hover */}
            <motion.div
              variants={floatVariant}
              transition={{ type: "spring", stiffness: 280, damping: 18 }}
              className="relative z-30 flex h-full w-full items-center justify-center
                         rounded-[14px] bg-white
                         shadow-[0px_8px_28px_rgba(16,185,129,0.20)]
                         group-hover/file:shadow-[0px_16px_44px_rgba(16,185,129,0.32)]
                         transition-shadow"
            >
              <AnimatePresence mode="wait">
                {isDragActive ? (
                  <motion.div
                    key="drop"
                    initial={{ opacity: 0, scale: 0.7 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.7 }}
                    className="flex flex-col items-center gap-0.5 text-green-500"
                  >
                    <span className="text-xl leading-none">↓</span>
                    <span className="text-[9px] font-dm font-semibold uppercase tracking-wider">
                      Drop
                    </span>
                  </motion.div>
                ) : (
                  <motion.div
                    key="upload"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-green-500"
                  >
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M12 15V3m0 0L8 7m4-4l4 4"
                        stroke="currentColor"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M3 15v3a2 2 0 002 2h14a2 2 0 002-2v-3"
                        stroke="currentColor"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                      />
                    </svg>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>

          <p className="text-[13px] font-dm font-semibold text-gray-700">
            {uploading
              ? "Uploading…"
              : isDragActive
                ? "Release to upload"
                : "Upload Documents"}
          </p>
          <p className="text-[11px] font-dm text-gray-400">
            Drag & drop or{" "}
            <span className="text-green-600 font-medium">browse</span> — any
            format
          </p>
        </div>
      </motion.div>

      {/* ── File chips + Add More ── */}
      <AnimatePresence>
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.26, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <motion.div layout className="flex flex-wrap gap-2 pt-0.5">
              <AnimatePresence>
                {files.map((file) => (
                  <FileChip key={file.name} file={file} onRemove={onRemove} />
                ))}
              </AnimatePresence>

              {/* Add more pill */}
              <motion.button
                type="button"
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 pl-2 pr-3 py-1.5
                           bg-green-50 border border-dashed border-green-300 rounded-full
                           text-green-600 hover:bg-green-100 transition-colors"
              >
                <Plus size={11} strokeWidth={3} />
                <span className="text-[11.5px] font-dm font-medium">
                  Add more
                </span>
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FileUpload;
