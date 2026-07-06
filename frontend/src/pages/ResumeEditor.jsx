// ResumeEditor.jsx
// Shows the ORIGINAL uploaded resume image directly — no OCR text, no garbled words.
// User clicks anywhere on the image to add a text annotation on top.
// Annotations can be dragged, edited inline, styled.
// Final export: bakes annotations onto the image → download as JPG or PDF.

import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import {
  ArrowLeft, Download, Image as ImageIcon, Trash2,
  ZoomIn, ZoomOut, RotateCcw, Info, ChevronRight
} from "lucide-react";
import { useResume } from "../api/ResumeContext";

const COLORS = [
  { hex: "#111111", label: "Black" },
  { hex: "#1d4ed8", label: "Blue" },
  { hex: "#15803d", label: "Green" },
  { hex: "#b91c1c", label: "Red" },
  { hex: "#7c3aed", label: "Purple" },
  { hex: "#b45309", label: "Brown" },
];
const SIZES = [8, 9, 10, 11, 12, 13, 14, 16, 18, 20];

let idCounter = 1;
function newId() { return `ann_${Date.now()}_${idCounter++}`; }

export default function ResumeEditor() {
  const { uploadedFileURL, uploadedFile, analysis, targetRole } = useResume();
  const navigate = useNavigate();

  const imgRef = useRef(null);
  const canvasRef = useRef(null);       // hidden canvas for export
  const containerRef = useRef(null);    // the annotation overlay div
  const editInputRef = useRef(null);

  const [imgNatural, setImgNatural] = useState({ w: 0, h: 0 });  // natural px size
  const [imgDisplay, setImgDisplay] = useState({ w: 0, h: 0 });  // displayed px size
  const [zoom, setZoom] = useState(1);
  const [annotations, setAnnotations] = useState([]);
  const [selected, setSelected] = useState(null);
  const [editing, setEditing] = useState(null);   // id being inline-edited
  const [dragState, setDragState] = useState(null);
  const [tool, setTool] = useState({ size: 11, bold: false, italic: false, color: "#111111" });
  const [imageLoaded, setImageLoaded] = useState(false);

  // If no uploaded file go back to upload
  useEffect(() => {
    if (!uploadedFileURL) navigate("/upload");
  }, [uploadedFileURL, navigate]);

  // Track image display size (changes on zoom)
  const measureImage = useCallback(() => {
    if (!imgRef.current) return;
    const r = imgRef.current.getBoundingClientRect();
    setImgDisplay({ w: r.width, h: r.height });
  }, []);

  useEffect(() => {
    window.addEventListener("resize", measureImage);
    return () => window.removeEventListener("resize", measureImage);
  }, [measureImage]);

  function onImgLoad(e) {
    setImgNatural({ w: e.target.naturalWidth, h: e.target.naturalHeight });
    setImageLoaded(true);
    setTimeout(measureImage, 50); // wait for layout
  }

  // ── Annotations ────────────────────────────────────────────────────────────
  function addAnnotation(e) {
    // Click on the overlay div
    if (e.target !== e.currentTarget) return; // ignore clicks on existing annotations
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;  // % of image width
    const y = ((e.clientY - rect.top)  / rect.height) * 100; // % of image height
    const id = newId();
    const ann = { id, x, y, text: "Type here", ...tool };
    setAnnotations(prev => [...prev, ann]);
    setSelected(id);
    setEditing(id);
  }

  function startDrag(e, id) {
    e.stopPropagation();
    e.preventDefault();
    const rect = containerRef.current.getBoundingClientRect();
    const ann = annotations.find(a => a.id === id);
    setDragState({
      id,
      startMouseX: e.clientX,
      startMouseY: e.clientY,
      startAnnX: ann.x,
      startAnnY: ann.y,
      rectW: rect.width,
      rectH: rect.height,
    });
    setSelected(id);
  }

  function onMouseMove(e) {
    if (!dragState) return;
    const dx = ((e.clientX - dragState.startMouseX) / dragState.rectW) * 100;
    const dy = ((e.clientY - dragState.startMouseY) / dragState.rectH) * 100;
    setAnnotations(prev => prev.map(a => a.id === dragState.id
      ? { ...a, x: Math.max(0, Math.min(95, dragState.startAnnX + dx)), y: Math.max(0, Math.min(95, dragState.startAnnY + dy)) }
      : a
    ));
  }

  function onMouseUp() { setDragState(null); }

  function updateAnn(id, field, value) {
    setAnnotations(prev => prev.map(a => a.id === id ? { ...a, [field]: value } : a));
  }

  function updateTool(field, value) {
    setTool(prev => ({ ...prev, [field]: value }));
    if (selected) updateAnn(selected, field, value);
  }

  function deleteSelected() {
    setAnnotations(prev => prev.filter(a => a.id !== selected));
    setSelected(null);
    setEditing(null);
  }

  function addKeyword(kw) {
    const id = newId();
    setAnnotations(prev => [...prev, { id, x: 5, y: 5 + prev.length * 5, text: kw, ...tool }]);
    setSelected(id);
  }

  // ── Export ─────────────────────────────────────────────────────────────────
  function buildExportCanvas() {
    return new Promise((resolve) => {
      const canvas = canvasRef.current;
      const img = imgRef.current;
      const natW = imgNatural.w;
      const natH = imgNatural.h;
      canvas.width  = natW;
      canvas.height = natH;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, natW, natH);

      // scale from % coordinates to natural px
      annotations.forEach(ann => {
        const px = (ann.x / 100) * natW;
        const py = (ann.y / 100) * natH;
        const scaledSize = Math.round(ann.size * (natW / (imgDisplay.w || natW)));
        const fontDecl = `${ann.italic ? "italic " : ""}${ann.bold ? "bold " : ""}${scaledSize}px Arial`;
        ctx.font = fontDecl;
        const metrics = ctx.measureText(ann.text);
        // White pill background
        ctx.fillStyle = "rgba(255,255,255,0.88)";
        ctx.beginPath();
        ctx.roundRect(px - 4, py - scaledSize - 2, metrics.width + 8, scaledSize + 6, 3);
        ctx.fill();
        // Text
        ctx.fillStyle = ann.color;
        ctx.fillText(ann.text, px, py);
      });
      resolve(canvas);
    });
  }

  async function downloadJPG() {
    const canvas = await buildExportCanvas();
    const a = document.createElement("a");
    a.download = `${(targetRole || "resume").replace(/\s+/g, "_")}_edited.jpg`;
    a.href = canvas.toDataURL("image/jpeg", 0.96);
    a.click();
  }

  async function downloadPDF() {
    const canvas = await buildExportCanvas();
    const imgData = canvas.toDataURL("image/jpeg", 0.96);
    const isLandscape = imgNatural.w > imgNatural.h;
    const pdf = new jsPDF({
      orientation: isLandscape ? "landscape" : "portrait",
      unit: "px",
      format: [imgNatural.w, imgNatural.h],
    });
    pdf.addImage(imgData, "JPEG", 0, 0, imgNatural.w, imgNatural.h);
    pdf.save(`${(targetRole || "resume").replace(/\s+/g, "_")}_edited.pdf`);
  }

  const selectedAnn = annotations.find(a => a.id === selected);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col" style={{ minHeight: "100vh", background: "#070B18" }}>

      {/* ── Top bar ── */}
      <div className="flex items-center justify-between px-4 py-3 glass border-b border-line/50 sticky top-0 z-50">
        <button onClick={() => navigate("/results")}
          className="flex items-center gap-2 text-slate hover:text-white transition-colors text-sm">
          <ArrowLeft size={16} /><span className="hidden sm:inline">Back to results</span>
        </button>

        <span className="text-white text-sm font-semibold">Resume Editor</span>

        <div className="flex items-center gap-2">
          <button onClick={downloadJPG}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium"
            style={{ background: "rgba(34,211,238,0.1)", color: "#22D3EE", border: "1px solid rgba(34,211,238,0.25)" }}>
            <ImageIcon size={13} />JPG
          </button>
          <button onClick={downloadPDF}
            className="gradient-btn flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-semibold text-bg">
            <Download size={13} />PDF
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">

        {/* ── Canvas area ── */}
        <div className="flex-1 overflow-auto" style={{ background: "#0A0F1E", padding: "16px" }}>

          {/* Toolbar */}
          <div className="flex flex-wrap items-center gap-3 mb-3 px-3 py-2 rounded-xl"
            style={{ background: "rgba(13,20,37,0.95)", border: "1px solid rgba(255,255,255,0.1)" }}>

            {/* Font size */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate text-xs">Size</span>
              <select value={tool.size}
                onChange={e => updateTool("size", Number(e.target.value))}
                className="text-xs rounded-md px-1.5 py-1 text-white focus:outline-none"
                style={{ background: "#1E293B", border: "1px solid rgba(255,255,255,0.1)" }}>
                {SIZES.map(s => <option key={s} value={s}>{s}px</option>)}
              </select>
            </div>

            {/* Bold / Italic */}
            {[["B", "bold", "font-bold"], ["I", "italic", "italic font-medium"]].map(([label, key, cls]) => (
              <button key={key}
                onClick={() => updateTool(key, !tool[key])}
                className={`w-7 h-7 rounded flex items-center justify-center text-sm transition-all ${cls} ${tool[key] ? "text-bg" : "text-slate hover:text-white"}`}
                style={{ background: tool[key] ? "#22D3EE" : "rgba(255,255,255,0.06)" }}>
                {label}
              </button>
            ))}

            {/* Colors */}
            <div className="flex items-center gap-1">
              {COLORS.map(c => (
                <button key={c.hex} title={c.label}
                  onClick={() => updateTool("color", c.hex)}
                  className="rounded-full transition-all"
                  style={{
                    width: tool.color === c.hex ? "20px" : "16px",
                    height: tool.color === c.hex ? "20px" : "16px",
                    background: c.hex,
                    border: tool.color === c.hex ? "2px solid #22D3EE" : "1.5px solid rgba(255,255,255,0.2)",
                  }} />
              ))}
            </div>

            {/* Zoom */}
            <div className="flex items-center gap-1 ml-auto">
              <button onClick={() => setZoom(z => Math.max(0.3, +(z - 0.1).toFixed(1)))}
                className="text-slate hover:text-white transition-colors p-1">
                <ZoomOut size={15} />
              </button>
              <span className="text-slate text-xs font-mono w-10 text-center">{Math.round(zoom * 100)}%</span>
              <button onClick={() => setZoom(z => Math.min(3, +(z + 0.1).toFixed(1)))}
                className="text-slate hover:text-white transition-colors p-1">
                <ZoomIn size={15} />
              </button>
            </div>

            {/* Actions */}
            {selected && (
              <button onClick={deleteSelected}
                className="flex items-center gap-1 text-rose text-xs hover:opacity-75 transition-opacity">
                <Trash2 size={13} />Delete
              </button>
            )}
            <button onClick={() => { setAnnotations([]); setSelected(null); setEditing(null); }}
              className="text-slate hover:text-white text-xs flex items-center gap-1 transition-colors">
              <RotateCcw size={12} />Clear all
            </button>
          </div>

          {/* Hint */}
          <p className="text-slate text-xs mb-3 flex items-center gap-1.5">
            <Info size={12} className="text-cyan shrink-0" />
            Click anywhere on your resume to add text. Drag to move. Double-click to edit.
          </p>

          {/* Image + annotation overlay */}
          <div style={{ display: "inline-block", transform: `scale(${zoom})`, transformOrigin: "top left" }}>
            <div
              ref={containerRef}
              className="relative"
              style={{ display: "inline-block", cursor: "crosshair", lineHeight: 0 }}
              onMouseMove={onMouseMove}
              onMouseUp={onMouseUp}
              onMouseLeave={onMouseUp}
              onClick={addAnnotation}
            >
              {/* ORIGINAL RESUME IMAGE — shown as-is, no OCR text */}
              <img
                ref={imgRef}
                src={uploadedFileURL}
                alt="Your resume"
                onLoad={onImgLoad}
                draggable={false}
                style={{
                  display: "block",
                  maxWidth: "750px",
                  width: "100%",
                  userSelect: "none",
                  boxShadow: "0 4px 32px rgba(0,0,0,0.5)",
                  borderRadius: "4px",
                  pointerEvents: "none",
                }}
              />

              {/* Annotations on top of the image */}
              {annotations.map(ann => (
                <div
                  key={ann.id}
                  style={{
                    position: "absolute",
                    left: `${ann.x}%`,
                    top: `${ann.y}%`,
                    zIndex: 10,
                    cursor: "move",
                    userSelect: "none",
                    outline: selected === ann.id ? "1.5px dashed #22D3EE" : "none",
                    outlineOffset: "3px",
                    borderRadius: "2px",
                  }}
                  onMouseDown={e => { e.stopPropagation(); startDrag(e, ann.id); }}
                  onDoubleClick={e => { e.stopPropagation(); setEditing(ann.id); setSelected(ann.id); }}
                  onClick={e => { e.stopPropagation(); setSelected(ann.id); }}
                >
                  {editing === ann.id ? (
                    <input
                      ref={editInputRef}
                      autoFocus
                      value={ann.text}
                      onChange={e => updateAnn(ann.id, "text", e.target.value)}
                      onBlur={() => setEditing(null)}
                      onKeyDown={e => {
                        if (e.key === "Enter" || e.key === "Escape") setEditing(null);
                        e.stopPropagation();
                      }}
                      onClick={e => e.stopPropagation()}
                      style={{
                        font: `${ann.italic ? "italic " : ""}${ann.bold ? "bold " : ""}${ann.size}px Arial, sans-serif`,
                        color: ann.color,
                        background: "rgba(255,255,255,0.92)",
                        border: "1px solid #22D3EE",
                        borderRadius: "3px",
                        outline: "none",
                        padding: "1px 5px",
                        minWidth: "60px",
                        whiteSpace: "nowrap",
                      }}
                    />
                  ) : (
                    <span style={{
                      display: "inline-block",
                      font: `${ann.italic ? "italic " : ""}${ann.bold ? "bold " : ""}${ann.size}px Arial, sans-serif`,
                      color: ann.color,
                      background: "rgba(255,255,255,0.88)",
                      padding: "1px 5px",
                      borderRadius: "2px",
                      whiteSpace: "nowrap",
                      lineHeight: "1.3",
                    }}>
                      {ann.text}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Hidden canvas used only for export */}
          <canvas ref={canvasRef} style={{ display: "none" }} />
        </div>

        {/* ── Right panel: suggestions ── */}
        <div className="w-60 shrink-0 overflow-y-auto p-4"
          style={{ background: "#0D1425", borderLeft: "1px solid rgba(255,255,255,0.07)" }}>

          {/* Missing keywords */}
          {analysis?.missingSkills?.length > 0 && (
            <div className="mb-5">
              <p className="text-white text-xs font-semibold mb-2 flex items-center gap-1.5">
                <ChevronRight size={13} className="text-cyan" />Add missing keywords
              </p>
              <p className="text-slate text-xs mb-2">Click a keyword to place it on your resume:</p>
              <div className="flex flex-wrap gap-1.5">
                {analysis.missingSkills.map(kw => (
                  <button key={kw}
                    onClick={() => addKeyword(kw)}
                    className="text-xs px-2.5 py-1 rounded-full transition-opacity hover:opacity-75"
                    style={{ background: "rgba(251,113,133,0.12)", color: "#FB7185", border: "1px solid rgba(251,113,133,0.25)" }}>
                    + {kw}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ATS suggestions */}
          {analysis?.suggestions?.length > 0 && (
            <div className="mb-5">
              <p className="text-white text-xs font-semibold mb-2 flex items-center gap-1.5">
                <ChevronRight size={13} className="text-cyan" />Improvement tips
              </p>
              <ul className="space-y-2.5">
                {analysis.suggestions.map((tip, i) => (
                  <li key={i} className="text-slate text-xs leading-relaxed flex gap-1.5">
                    <span className="text-cyan shrink-0">›</span>{tip}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Score */}
          {analysis && (
            <div className="rounded-xl p-3 mt-2"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <p className="text-slate text-xs mb-1">ATS score</p>
              <p className="font-mono text-2xl font-bold"
                style={{ color: analysis.score >= 80 ? "#2DD4BF" : analysis.score >= 60 ? "#22D3EE" : "#FBBF24" }}>
                {analysis.score}<span className="text-slate text-xs font-normal">/100</span>
              </p>
              <p className="text-slate text-xs mt-2 leading-relaxed">
                After editing, re-upload to get an updated score.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
