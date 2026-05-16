// app/page.tsx
'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight, ArrowLeft, Sparkles, Camera, Clock, Globe,
  User, Package, Video, Download, Copy, CheckCircle,
  Settings, FileText, Film, Lightbulb, RefreshCw, Star,
  Zap, LayoutGrid
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const angles = [
  { id: 'unboxing', name: 'Unboxing', icon: '📦', desc: 'Lo descubrí por accidente y me cambió todo' },
  { id: 'problem-solution', name: 'Problema/Solución', icon: '💡', desc: 'Llevaba meses buscando algo así' },
  { id: 'asmr-lifestyle', name: 'ASMR Lifestyle', icon: '🎧', desc: 'Lo uso todos los días en mi rutina' },
  { id: 'testimonial', name: 'Testimonial', icon: '⭐', desc: 'Vi el resultado en pocos días' },
  { id: 'doctor-recommended', name: 'Recomendación Experta', icon: '👨‍⚕️', desc: 'Mi doctor me lo recomendó y funcionó' }
];

const markets = [
  { id: 'MX', name: 'México', flag: '🇲🇽' },
  { id: 'ES', name: 'España', flag: '🇪🇸' },
  { id: 'US', name: 'Estados Unidos', flag: '🇺🇸' }
];

const aiModels = [
  { id: 'veo3', name: 'VEo3', duration: '15s por clip' },
  { id: 'seedance', name: 'Seedance 2.0', duration: '15s por clip' },
  { id: 'kling', name: 'Kling AI', duration: '15s por clip' },
  { id: 'heygen', name: 'HeyGen', duration: '30s por clip' }
];

const stepIcons = [Package, User, Settings, Sparkles];
const stepTitles = ['Producto', 'Avatar / Persona', 'Configuración', 'Ángulo UGC'];

export default function Home() {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({
    productName: '',
    productFeatures: '',
    avatarDescription: '',
    aiModel: 'veo3',
    duration: 30,
    market: 'MX',
    angle: 'unboxing'
  });
  const [results, setResults] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const updateForm = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);
    try {
      const response = await fetch('/api/generate-ugc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Error al generar contenido');
      }

      const data = await response.json();
      setResults(data);
    } catch (err: any) {
      setError(err.message || 'Error desconocido');
    } finally {
      setIsGenerating(false);
      setStep(4);
    }
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const exportPDF = async () => {
    if (!resultsRef.current) return;
    try {
      const canvas = await html2canvas(resultsRef.current, {
        backgroundColor: '#0a0a0f',
        scale: 2,
        useCORS: true
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const ratio = Math.min(pdfWidth / canvas.width, pdfHeight / canvas.height);
      const scaledWidth = canvas.width * ratio;
      const scaledHeight = canvas.height * ratio;

      let heightLeft = scaledHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', (pdfWidth - scaledWidth) / 2, 10, scaledWidth, scaledHeight);
      heightLeft -= (pdfHeight - 20);

      while (heightLeft > 0) {
        position = heightLeft - scaledHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', (pdfWidth - scaledWidth) / 2, position, scaledWidth, scaledHeight);
        heightLeft -= (pdfHeight - 20);
      }

      pdf.save(`UGC-${formData.productName.replace(/\s+/g, '-')}.pdf`);
    } catch (err) {
      console.error('Error exporting PDF:', err);
    }
  };

  const getClipsInfo = () => {
    const clipDuration = formData.aiModel === 'heygen' ? 30 : 15;
    const totalClips = formData.duration <= 30
      ? (formData.aiModel === 'heygen' ? 1 : 2)
      : (formData.aiModel === 'heygen' ? 2 : 4);
    return { totalClips, clipDuration };
  };

  const { totalClips, clipDuration } = getClipsInfo();

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white font-sans selection:bg-violet-500/30">
      <style>{`
        body { font-family: 'Inter', sans-serif; }
        .font-mono { font-family: 'JetBrains Mono', monospace; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        .glow { box-shadow: 0 0 60px rgba(139, 92, 246, 0.15); }
      `}</style>

      <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#0a0a0f]/80 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
                <Video className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold tracking-tight">Ecomlabs <span className="text-violet-400">UGC AI</span></h1>
                <p className="text-[10px] text-white/40 font-mono -mt-1">SISTEMA DE PRODUCCIÓN</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {results && (
                <motion.button
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  onClick={() => { setResults(null); setError(null); setStep(0); }}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-sm"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span className="hidden sm:inline">Nuevo UGC</span>
                </motion.button>
              )}
              <div className="px-3 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20">
                <span className="text-xs font-medium text-violet-400">v2.0</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!results && step < 4 && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
            <div className="flex items-center justify-center gap-2 sm:gap-4">
              {stepTitles.map((title, i) => {
                const Icon = stepIcons[i];
                const isActive = i === step;
                const isCompleted = i < step;
                return (
                  <React.Fragment key={i}>
                    <motion.div className={`flex items-center gap-2 sm:gap-3 px-3 sm:px-5 py-2.5 rounded-xl transition-all duration-300 ${isActive ? 'bg-violet-500/15 border border-violet-500/30 shadow-lg shadow-violet-500/10' : isCompleted ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-white/5 border border-white/10'}`} animate={isActive ? { scale: 1.05 } : { scale: 1 }}>
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${isActive ? 'bg-violet-500 text-white' : isCompleted ? 'bg-emerald-500 text-white' : 'bg-white/10 text-white/40'}`}>
                        {isCompleted ? <CheckCircle className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                      </div>
                      <span className={`text-xs sm:text-sm font-medium hidden md:inline ${isActive ? 'text-white' : isCompleted ? 'text-emerald-400' : 'text-white/40'}`}>{title}</span>
                    </motion.div>
                    {i < stepTitles.length - 1 && <div className={`w-6 sm:w-10 h-px ${i < step ? 'bg-emerald-500/50' : 'bg-white/10'}`} />}
                  </React.Fragment>
                );
              })}
            </div>
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div key="step-0" initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 50 }} transition={{ duration: 0.3 }} className="max-w-2xl mx-auto">
              <div className="bg-[#12121a] border border-white/5 rounded-2xl p-6 sm:p-8 glow">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 flex items-center justify-center"><Package className="w-6 h-6 text-violet-400" /></div>
                  <div><h2 className="text-xl font-bold">Información del Producto</h2><p className="text-sm text-white/50 mt-1">Cuéntanos sobre el producto para generar el UGC perfecto</p></div>
                </div>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">Nombre del producto <span className="text-red-400">*</span></label>
                    <input type="text" value={formData.productName} onChange={(e) => updateForm('productName', e.target.value)} placeholder="ej: Sérum Vitamina C GlowSkin" className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">Características principales</label>
                    <textarea value={formData.productFeatures} onChange={(e) => updateForm('productFeatures', e.target.value)} placeholder="ej: Hidratante, anti-edad, con ácido hialurónico, para todo tipo de piel..." rows={4} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 transition-all resize-none" />
                  </div>
                  <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <Lightbulb className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                      <div><p className="text-sm text-amber-300 font-medium">Tip Pro</p><p className="text-xs text-amber-200/60 mt-1">Mientras más detalles des, más personalizado será el guion. Incluye beneficios clave y lo que lo hace único.</p></div>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end mt-8">
                  <button onClick={() => formData.productName && setStep(1)} disabled={!formData.productName} className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${formData.productName ? 'bg-violet-500 hover:bg-violet-400 text-white shadow-lg shadow-violet-500/25' : 'bg-white/10 text-white/30 cursor-not-allowed'}`}>
                    Siguiente <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div key="step-1" initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 50 }} transition={{ duration: 0.3 }} className="max-w-2xl mx-auto">
              <div className="bg-[#12121a] border border-white/5 rounded-2xl p-6 sm:p-8 glow">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 flex items-center justify-center"><User className="w-6 h-6 text-violet-400" /></div>
                  <div><h2 className="text-xl font-bold">Describe tu Avatar / Persona</h2><p className="text-sm text-white/50 mt-1">Define cómo quieres que se vea la persona del video</p></div>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">
                      Descripción del avatar <span className="text-red-400">*</span>
                    </label>
                    <textarea
                      value={formData.avatarDescription}
                      onChange={(e) => updateForm('avatarDescription', e.target.value)}
                      placeholder="Ej: Mujer latina de 28-32 años, piel morena clara, cabello negro largo y liso, estilo casual con blusa blanca, apariencia natural y accesible. Grabando en su cocina con luz de ventana por la mañana."
                      rows={6}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 transition-all resize-none"
                    />
                  </div>

                  <div className="bg-violet-500/5 border border-violet-500/20 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <Camera className="w-5 h-5 text-violet-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm text-violet-300 font-medium">¿Qué incluir?</p>
                        <ul className="text-xs text-violet-200/60 mt-2 space-y-1 list-disc list-inside">
                          <li>Género y rango de edad</li>
                          <li>Tono de piel y tipo de cabello</li>
                          <li>Estilo de ropa (casual, deportivo, elegante)</li>
                          <li>Ubicación donde graba (casa, gym, calle, café)</li>
                          <li>Cualquier detalle físico relevante</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <Lightbulb className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm text-amber-300 font-medium">Tip para mejores resultados</p>
                        <p className="text-xs text-amber-200/60 mt-1">Describe a una persona atractiva pero accesible, no un modelo perfecto. La piel real con imperfecciones leves genera más confianza en UGC orgánico.</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between mt-8">
                  <button onClick={() => setStep(0)} className="flex items-center gap-2 px-5 py-3 rounded-xl font-medium bg-white/5 hover:bg-white/10 transition-all">
                    <ArrowLeft className="w-4 h-4" /> Anterior
                  </button>
                  <button onClick={() => formData.avatarDescription && setStep(2)} disabled={!formData.avatarDescription} className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${formData.avatarDescription ? 'bg-violet-500 hover:bg-violet-400 text-white shadow-lg shadow-violet-500/25' : 'bg-white/10 text-white/30 cursor-not-allowed'}`}>
                    Siguiente <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step-2" initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 50 }} transition={{ duration: 0.3 }} className="max-w-2xl mx-auto">
              <div className="bg-[#12121a] border border-white/5 rounded-2xl p-6 sm:p-8 glow">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 flex items-center justify-center"><Settings className="w-6 h-6 text-violet-400" /></div>
                  <div><h2 className="text-xl font-bold">Configuración del Video</h2><p className="text-sm text-white/50 mt-1">Duración, mercado y modelo de IA</p></div>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-3">Modelo de IA <span className="text-red-400">*</span></label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {aiModels.map((m) => (
                        <button key={m.id} onClick={() => updateForm('aiModel', m.id)} className={`p-3 rounded-xl border transition-all text-center ${formData.aiModel === m.id ? 'border-violet-500 bg-violet-500/10' : 'border-white/10 bg-white/5 hover:border-white/20'}`}>
                          <div className="text-sm font-semibold">{m.name}</div>
                          <div className="text-xs text-white/40 mt-0.5">{m.duration}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-3">Duración total del video</label>
                    <div className="flex gap-3">
                      {[30, 45, 60].map((d) => (
                        <button key={d} onClick={() => updateForm('duration', d)} className={`flex-1 py-3 rounded-xl border transition-all font-medium ${formData.duration === d ? 'border-violet-500 bg-violet-500/10 text-violet-300' : 'border-white/10 bg-white/5 hover:border-white/20'}`}>
                          {d}s
                        </button>
                      ))}
                    </div>
                    <div className="mt-2 px-3 py-2 rounded-lg bg-white/5 text-xs text-white/50">
                      Tu video de {formData.duration}s se dividirá en {totalClips} clip{totalClips > 1 ? 's' : ''} de {clipDuration}s cada uno.
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-3">Mercado objetivo</label>
                    <div className="flex gap-3">
                      {markets.map((m) => (
                        <button key={m.id} onClick={() => updateForm('market', m.id)} className={`flex-1 py-3 rounded-xl border transition-all ${formData.market === m.id ? 'border-violet-500 bg-violet-500/10' : 'border-white/10 bg-white/5 hover:border-white/20'}`}>
                          <span className="text-lg">{m.flag}</span>
                          <div className="text-sm font-medium mt-1">{m.name}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex justify-between mt-8">
                  <button onClick={() => setStep(1)} className="flex items-center gap-2 px-5 py-3 rounded-xl font-medium bg-white/5 hover:bg-white/10 transition-all">
                    <ArrowLeft className="w-4 h-4" /> Anterior
                  </button>
                  <button onClick={() => setStep(3)} className="flex items-center gap-2 px-6 py-3 rounded-xl font-medium bg-violet-500 hover:bg-violet-400 text-white shadow-lg shadow-violet-500/25">
                    Siguiente <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="step-3" initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 50 }} transition={{ duration: 0.3 }} className="max-w-3xl mx-auto">
              <div className="bg-[#12121a] border border-white/5 rounded-2xl p-6 sm:p-8 glow">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 flex items-center justify-center"><Sparkles className="w-6 h-6 text-violet-400" /></div>
                  <div><h2 className="text-xl font-bold">Ángulo UGC</h2><p className="text-sm text-white/50 mt-1">Elige el enfoque de la recomendación</p></div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                  {angles.map((a) => (
                    <motion.button key={a.id} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => updateForm('angle', a.id)} className={`relative p-5 rounded-2xl border-2 transition-all text-left ${formData.angle === a.id ? 'border-violet-500 bg-violet-500/10 shadow-lg shadow-violet-500/10' : 'border-white/10 bg-white/5 hover:border-white/20'}`}>
                      {formData.angle === a.id && <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-violet-500 flex items-center justify-center"><CheckCircle className="w-4 h-4 text-white" /></div>}
                      <div className="text-2xl mb-2">{a.icon}</div>
                      <h3 className="font-bold">{a.name}</h3>
                      <p className="text-xs text-white/50 mt-1 italic">"{a.desc}"</p>
                    </motion.button>
                  ))}
                </div>

                <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-8">
                  <h4 className="text-sm font-semibold text-white/80 mb-3">Resumen de configuración</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div><span className="text-white/40 block">Producto</span><span className="text-white font-medium">{formData.productName}</span></div>
                    <div><span className="text-white/40 block">Avatar</span><span className="text-white font-medium truncate block">{formData.avatarDescription.substring(0, 25)}...</span></div>
                    <div><span className="text-white/40 block">Duración</span><span className="text-white font-medium">{formData.duration}s ({totalClips} clips)</span></div>
                    <div><span className="text-white/40 block">Ángulo</span><span className="text-white font-medium">{angles.find(a => a.id === formData.angle)?.name}</span></div>
                  </div>
                </div>

                <div className="flex justify-between">
                  <button onClick={() => setStep(2)} className="flex items-center gap-2 px-5 py-3 rounded-xl font-medium bg-white/5 hover:bg-white/10 transition-all">
                    <ArrowLeft className="w-4 h-4" /> Anterior
                  </button>
                  <button onClick={handleGenerate} disabled={isGenerating} className="flex items-center gap-2 px-8 py-3 rounded-xl font-bold bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-400 hover:to-fuchsia-400 text-white shadow-lg shadow-violet-500/25 transition-all disabled:opacity-50">
                    {isGenerating ? (
                      <><RefreshCw className="w-4 h-4 animate-spin" /> Generando...</>
                    ) : (
                      <><Sparkles className="w-4 h-4" /> Generar UGC</>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {isGenerating && (
            <motion.div key="generating" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl mx-auto text-center py-20">
              <div className="relative w-32 h-32 mx-auto mb-8">
                <div className="absolute inset-0 rounded-full border-4 border-violet-500/20" />
                <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-violet-500 animate-spin" />
                <div className="absolute inset-4 rounded-full border-4 border-transparent border-t-fuchsia-500 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
                <div className="absolute inset-0 flex items-center justify-center"><Sparkles className="w-10 h-10 text-violet-400 animate-pulse" /></div>
              </div>
              <h2 className="text-2xl font-bold mb-3">Generando tu UGC con Qwen...</h2>
              <p className="text-white/50 max-w-md mx-auto">La IA está creando prompts hiper-realistas, guiones orgánicos y notas de producción.</p>
              <div className="mt-8 max-w-md mx-auto space-y-2">
                {['Conectando con Qwen API...', 'Analizando producto y avatar...', 'Generando perspectiva selfie...', 'Creando guion orgánico...'].map((text, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.7 }} className="flex items-center gap-2 text-sm">
                    <div className={`w-2 h-2 rounded-full ${i < 2 ? 'bg-violet-500' : 'bg-white/20'}`} />
                    <span className={i < 2 ? 'text-white/60' : 'text-white/30'}>{text}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {error && (
            <motion.div key="error" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto">
              <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-red-500/20 flex items-center justify-center flex-shrink-0"><span className="text-2xl">⚠️</span></div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-red-400">Error al generar UGC</h3>
                    <p className="text-sm text-red-300/70 mt-2">{error}</p>
                    <div className="mt-4 flex gap-3">
                      <button onClick={() => { setError(null); setStep(3); }} className="px-4 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 text-sm font-medium transition-colors">Reintentar</button>
                      <button onClick={() => { setError(null); setStep(0); }} className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 text-sm font-medium transition-colors">Volver al inicio</button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {results && !isGenerating && !error && (
            <motion.div key="results" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} ref={resultsRef} className="space-y-6">
              <div className="bg-[#12121a] border border-white/5 rounded-2xl p-6 sm:p-8 glow">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center"><CheckCircle className="w-7 h-7 text-emerald-400" /></div>
                    <div><h2 className="text-xl sm:text-2xl font-bold">UGC Generado con Éxito</h2><p className="text-sm text-white/50 mt-0.5">{formData.productName} · {formData.duration}s · {totalClips} clips · {markets.find(m => m.id === formData.market)?.name}</p></div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button onClick={exportPDF} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all text-sm font-medium"><Download className="w-4 h-4" /> <span className="hidden sm:inline">Exportar PDF</span></button>
                    <button onClick={() => { setResults(null); setError(null); setStep(0); }} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-violet-500 hover:bg-violet-400 transition-all text-sm font-medium"><Sparkles className="w-4 h-4" /> Nuevo UGC</button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-[#12121a] border border-white/5 rounded-2xl overflow-hidden">
                  <div className="p-5 border-b border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-3"><Camera className="w-5 h-5 text-violet-400" /><h3 className="font-bold">📸 Fotograma Inicial</h3></div>
                    <button onClick={() => copyToClipboard(results.initialFramePrompt, 'initial')} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-all text-xs">{copiedField === 'initial' ? <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />} {copiedField === 'initial' ? 'Copiado' : 'Copiar'}</button>
                  </div>
                  <div className="p-5"><pre className="text-xs text-white/70 font-mono whitespace-pre-wrap leading-relaxed max-h-96 overflow-y-auto scrollbar-hide">{results.initialFramePrompt}</pre></div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-[#12121a] border border-white/5 rounded-2xl overflow-hidden">
                  <div className="p-5 border-b border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-3"><Camera className="w-5 h-5 text-fuchsia-400" /><h3 className="font-bold">📸 Fotograma Final</h3></div>
                    <button onClick={() => copyToClipboard(results.finalFramePrompt, 'final')} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-all text-xs">{copiedField === 'final' ? <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />} {copiedField === 'final' ? 'Copiado' : 'Copiar'}</button>
                  </div>
                  <div className="p-5"><pre className="text-xs text-white/70 font-mono whitespace-pre-wrap leading-relaxed max-h-96 overflow-y-auto scrollbar-hide">{results.finalFramePrompt}</pre></div>
                </motion.div>
              </div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-[#12121a] border border-white/5 rounded-2xl overflow-hidden">
                <div className="p-5 border-b border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-3"><FileText className="w-5 h-5 text-amber-400" /><h3 className="font-bold">🎬 Guión Completo</h3></div>
                  <button onClick={() => copyToClipboard(results.fullScript, 'script')} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-all text-xs">{copiedField === 'script' ? <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />} {copiedField === 'script' ? 'Copiado' : 'Copiar'}</button>
                </div>
                <div className="p-5"><pre className="text-sm text-white/80 whitespace-pre-wrap leading-relaxed">{results.fullScript}</pre></div>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="space-y-4">
                <div className="flex items-center gap-3"><Film className="w-5 h-5 text-rose-400" /><h3 className="font-bold text-lg">🎥 Prompts de Video por Clip</h3></div>
                {results.clips.map((clip: any, index: number) => (
                  <div key={index} className="bg-[#12121a] border border-white/5 rounded-2xl overflow-hidden">
                    <div className="p-4 sm:p-5 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center"><span className="text-sm font-bold text-rose-400">{clip.number}</span></div>
                        <div><h4 className="font-semibold text-sm">Clip {clip.number}</h4><div className="flex items-center gap-2 text-xs text-white/40"><Clock className="w-3 h-3" /><span>{clip.timestamp}</span><span>·</span><span>{clip.wordCount} palabras</span></div></div>
                      </div>
                      <button onClick={() => copyToClipboard(clip.videoPrompt, `clip-${index}`)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-all text-xs self-start sm:self-auto">{copiedField === `clip-${index}` ? <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />} {copiedField === `clip-${index}` ? 'Copiado' : 'Copiar prompt'}</button>
                    </div>
                    <div className="p-4 sm:p-5">
                      <div className="mb-4"><h5 className="text-xs font-semibold text-white/50 mb-2 uppercase tracking-wider">Guión del clip</h5><p className="text-sm text-white/80 italic">"{clip.script}"</p></div>
                      <h5 className="text-xs font-semibold text-white/50 mb-2 uppercase tracking-wider">Prompt de video</h5>
                      <pre className="text-xs text-white/70 font-mono whitespace-pre-wrap leading-relaxed">{clip.videoPrompt}</pre>
                    </div>
                  </div>
                ))}
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="bg-[#12121a] border border-white/5 rounded-2xl overflow-hidden">
                <div className="p-5 border-b border-white/5"><div className="flex items-center gap-3"><Lightbulb className="w-5 h-5 text-emerald-400" /><h3 className="font-bold">✅ Notas de Producción</h3></div></div>
                <div className="p-5 space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-white/5 rounded-xl p-4"><h4 className="text-sm font-semibold text-white/80 mb-2 flex items-center gap-2"><Zap className="w-4 h-4 text-amber-400" /> Herramienta recomendada</h4><p className="text-sm text-white/60">{results.productionNotes.tool}</p></div>
                    <div className="bg-white/5 rounded-xl p-4"><h4 className="text-sm font-semibold text-white/80 mb-2 flex items-center gap-2"><User className="w-4 h-4 text-violet-400" /> Configuración del avatar</h4><p className="text-sm text-white/60">{results.productionNotes.avatarConfig}</p></div>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4"><h4 className="text-sm font-semibold text-white/80 mb-3 flex items-center gap-2"><Settings className="w-4 h-4 text-fuchsia-400" /> Tips de generación</h4><pre className="text-xs text-white/60 font-mono whitespace-pre-wrap">{results.productionNotes.generationTips}</pre></div>
                  <div className="bg-white/5 rounded-xl p-4"><h4 className="text-sm font-semibold text-white/80 mb-3 flex items-center gap-2"><LayoutGrid className="w-4 h-4 text-emerald-400" /> Tips de edición</h4><pre className="text-xs text-white/60 font-mono whitespace-pre-wrap">{results.productionNotes.editingTips}</pre></div>
                  <div><h4 className="text-sm font-semibold text-white/80 mb-3">Herramientas recomendadas</h4><div className="flex flex-wrap gap-2">{results.productionNotes.tools.map((tool: string, i: number) => (<span key={i} className="px-3 py-1.5 rounded-lg bg-violet-500/10 border border-violet-500/20 text-xs font-medium text-violet-300">{tool}</span>))}</div></div>
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="bg-gradient-to-br from-violet-500/5 to-fuchsia-500/5 border border-violet-500/10 rounded-2xl p-5 sm:p-6">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Star className="w-5 h-5 text-amber-400" /> Reglas de Oro del UGC Orgánico</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { icon: '🚫', rule: 'Sin b-rolls: El video es continuo' },
                    { icon: '🚫', rule: 'Sin efectos: No slow-mo, no zoom' },
                    { icon: '🚫', rule: 'Sin subtítulos: Audio es el texto' },
                    { icon: '💪', rule: 'Brazo siempre visible' },
                    { icon: '☀️', rule: 'Luz siempre natural' },
                    { icon: '🏠', rule: 'Fondo siempre real' },
                    { icon: '👤', rule: 'Persona accesible, piel real' },
                    { icon: '💬', rule: 'Guión nunca suena a anuncio' }
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm"><span>{item.icon}</span><span className="text-white/70">{item.rule}</span></div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="border-t border-white/5 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center"><Video className="w-3.5 h-3.5 text-white" /></div>
              <span className="text-sm font-medium text-white/40">Ecomlabs UGC AI</span>
            </div>
            <p className="text-xs text-white/30 font-mono">Sistema de Producción de Contenido UGC v2.0 · Powered by Qwen</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
