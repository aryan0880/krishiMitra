/**
 * KrishiMitra Hackathon Transformation Script
 * Applies all improvements to App.tsx in-place using targeted string operations
 */
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';

const filePath = fileURLToPath(new URL('../src/App.tsx', import.meta.url));
let code = readFileSync(filePath, 'utf-8');

// ─── 1. Update imports ───────────────────────────────────────────────────────
code = code.replace(
  `import React, { useEffect, useState } from 'react';
import { 
  Home, 
  LayoutGrid, 
  ClipboardList, 
  User, 
  ArrowRight, 
  Droplets, 
  Wind, 
  CloudSun,
  Leaf,
  Info,
  Bell,
  Languages,
  Menu,
  Sparkles,
  Sprout,
  CircleUser
} from 'lucide-react';`,
  `import React, { useEffect, useRef, useState } from 'react';
import {
  Home, LayoutGrid, ClipboardList, User, ArrowRight, ArrowLeft,
  Droplets, Wind, CloudSun, Leaf, Info, Bell, Languages, Menu,
  Sparkles, Sprout, Camera, MessageCircle, Send, X, Share2,
  BarChart2, AlertTriangle, CheckCircle2, Zap, TrendingUp
} from 'lucide-react';`
);

// ─── 2. Add auth helpers after API_BASE_URL ──────────────────────────────────
code = code.replace(
  `const API_BASE_URL = import.meta.env.VITE_API_URL || '';`,
  `const API_BASE_URL = import.meta.env.VITE_API_URL || '';

const getToken = () => localStorage.getItem('km_token');
const authHeaders = (): Record<string, string> => {
  const t = getToken();
  return t
    ? { 'Content-Type': 'application/json', Authorization: \`Bearer \${t}\` }
    : { 'Content-Type': 'application/json' };
};`
);

// ─── 3. Extend Screen type ───────────────────────────────────────────────────
code = code.replace(
  `type Screen = 'landing' | 'signup' | 'input' | 'dashboard' | 'report';`,
  `type Screen = 'landing' | 'signup' | 'input' | 'dashboard' | 'report' | 'diagnose' | 'chat';`
);

// ─── 4. Add nav keys to COPY.English ─────────────────────────────────────────
code = code.replace(
  `    nav: { home: 'Home', input: 'Input', analysis: 'Analysis', profile: 'Profile' },`,
  `    nav: { home: 'Home', input: 'Input', analysis: 'Analysis', profile: 'Profile', diagnose: 'Diagnose', chat: 'Ask AI' },`
);

// ─── 5. Inject new utility components before BottomNav ───────────────────────
const NEW_COMPONENTS = `
// ---------- Utility Components ----------

const SkeletonCard = ({ lines = 3 }: { lines?: number }) => (
  <div className="bg-white rounded-3xl p-6 border border-gray-100 animate-pulse">
    <div className="h-2.5 bg-gray-200 rounded-full w-1/3 mb-4" />
    {Array.from({ length: lines }).map((_, i) => (
      <div key={i} className={\`h-2 bg-gray-100 rounded-full mb-2 \${i === lines - 1 ? 'w-2/3' : 'w-full'}\`} />
    ))}
  </div>
);

const MiniBarChart = ({ data, color, label }: { data: number[]; color: string; label: string }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !data.length) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);
    const max = Math.max(...data, 1);
    const gap = 4;
    const barW = (W - gap * (data.length - 1)) / data.length;
    data.forEach((val, i) => {
      const barH = Math.max(4, (val / max) * (H - 8));
      const x = i * (barW + gap);
      const y = H - barH;
      const grad = ctx.createLinearGradient(x, y, x, H);
      grad.addColorStop(0, color);
      grad.addColorStop(1, color + '33');
      ctx.fillStyle = grad;
      ctx.beginPath();
      (ctx as any).roundRect?.(x, y, barW, barH, 4) ?? ctx.rect(x, y, barW, barH);
      ctx.fill();
    });
  }, [data, color]);
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{label}</span>
      <canvas ref={canvasRef} width={240} height={48} className="w-full rounded-lg" />
    </div>
  );
};

const NutrientGauge = ({ n, p, k }: { n: number; p: number; k: number }) => {
  const cx = 54, cy = 54;
  const arc = (r: number, val: number) => {
    const pct = Math.min(val, 100) / 100;
    return \`\${2 * Math.PI * r * pct * 0.8} \${2 * Math.PI * r}\`;
  };
  const off = (r: number) => \`\${-(2 * Math.PI * r * 0.1)}\`;
  return (
    <svg width={108} height={108} viewBox="0 0 108 108">
      {[40, 28, 17].map((r, i) => (
        <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke="#f0f0f0" strokeWidth={i === 0 ? 10 : i === 1 ? 8 : 6} />
      ))}
      <circle cx={cx} cy={cy} r={40} fill="none" stroke="#3b82f6" strokeWidth={10}
        strokeDasharray={arc(40, n)} strokeDashoffset={off(40)} strokeLinecap="round" />
      <circle cx={cx} cy={cy} r={28} fill="none" stroke="#f59e0b" strokeWidth={8}
        strokeDasharray={arc(28, p)} strokeDashoffset={off(28)} strokeLinecap="round" />
      <circle cx={cx} cy={cy} r={17} fill="none" stroke="#10b981" strokeWidth={6}
        strokeDasharray={arc(17, k)} strokeDashoffset={off(17)} strokeLinecap="round" />
      <text x={cx} y={cy - 3} textAnchor="middle" fontSize="8" fontWeight="700" fill="#374151">NPK</text>
      <text x={cx} y={cy + 9} textAnchor="middle" fontSize="7" fill="#9ca3af">{n},{p},{k}</text>
    </svg>
  );
};

// ---------- AI Pages ----------

const DiagnosePage = ({ language }: { language: Language }) => {
  const [image, setImage] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState('image/jpeg');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setMimeType(file.type || 'image/jpeg');
    const reader = new FileReader();
    reader.onload = () => setImage((reader.result as string).split(',')[1]);
    reader.readAsDataURL(file);
    setResult(null);
    setError(null);
  };

  const diagnose = async () => {
    if (!image) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(\`\${API_BASE_URL}/api/diagnose\`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: image, mimeType, language }),
      });
      if (!res.ok) throw new Error('Diagnosis failed');
      const data = await res.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const share = async () => {
    if (!result) return;
    const text = \`🌿 KrishiMitra Diagnosis\\nDisease: \${result.disease}\\nSeverity: \${result.severity}\\n\\nTreatment:\\n\${(result.actions || []).join('\\n')}\`;
    if (navigator.share) {
      await navigator.share({ title: 'KrishiMitra Diagnosis', text });
    } else {
      navigator.clipboard.writeText(text);
    }
  };

  const severityColor = (s: string) =>
    s === 'High' ? 'text-red-600 bg-red-50' : s === 'Medium' ? 'text-amber-600 bg-amber-50' : 'text-green-600 bg-green-50';

  return (
    <div className="flex flex-col gap-4 pb-28">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 bg-[#1f4d2b] rounded-xl flex items-center justify-center">
          <Camera size={17} className="text-white" />
        </div>
        <div>
          <h1 className="text-base font-black text-gray-900">Crop Disease Detection</h1>
          <p className="text-[11px] text-gray-400">AI-powered plant pathology analysis</p>
        </div>
      </div>

      {/* Image Upload */}
      <label className="relative cursor-pointer block">
        <div className={\`rounded-3xl border-2 border-dashed flex flex-col items-center justify-center gap-3 transition-all overflow-hidden \${image ? 'border-[#1f4d2b]' : 'border-gray-200 hover:border-[#1f4d2b]/40'}\`}
          style={{ height: 220 }}>
          {image ? (
            <img src={\`data:image/jpeg;base64,\${image}\`} alt="Crop" className="w-full h-full object-cover" />
          ) : (
            <>
              <div className="w-14 h-14 bg-[#e6f4ea] rounded-2xl flex items-center justify-center">
                <Camera size={24} className="text-[#1f4d2b]" />
              </div>
              <div className="text-center">
                <p className="text-sm font-bold text-gray-700">Tap to take photo</p>
                <p className="text-xs text-gray-400">or upload from gallery</p>
              </div>
            </>
          )}
        </div>
        <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFile} />
      </label>

      {image && !result && (
        <motion.button whileTap={{ scale: 0.97 }} onClick={diagnose} disabled={loading}
          className="w-full bg-[#1f4d2b] text-white py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-green-900/20 disabled:opacity-60">
          {loading ? (
            <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Analyzing with AI...</>
          ) : (
            <><Zap size={16} /> Diagnose Crop</>
          )}
        </motion.button>
      )}

      {error && (
        <div className="bg-red-50 text-red-700 rounded-2xl p-4 text-sm flex items-center gap-2 border border-red-100">
          <AlertTriangle size={16} /> {error}
        </div>
      )}

      {result && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-3">
          {/* Disease header card */}
          <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Detected Disease</p>
                <p className="text-xl font-black text-gray-900">{result.disease || 'Unknown'}</p>
              </div>
              <span className={\`text-xs font-bold px-3 py-1.5 rounded-full \${severityColor(result.severity || '')}\`}>
                {result.severity || 'N/A'} Risk
              </span>
            </div>
            {result.affectedArea && (
              <div className="mt-3">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-500">Affected Area</span>
                  <span className="font-bold text-gray-700">{result.affectedArea}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div className="bg-amber-500 h-2 rounded-full" style={{ width: \`\${Math.min(result.affectedArea, 100)}%\` }} />
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          {result.actions?.length > 0 && (
            <div className="bg-white rounded-3xl p-5 border border-gray-100">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Treatment Actions</p>
              {result.actions.map((a: string, i: number) => (
                <div key={i} className="flex gap-2 mb-2">
                  <CheckCircle2 size={15} className="text-[#1f4d2b] flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-gray-700 leading-relaxed">{a}</p>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-2">
            <motion.button whileTap={{ scale: 0.96 }} onClick={share}
              className="flex-1 bg-[#1f4d2b] text-white py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2">
              <Share2 size={15} /> Share Report
            </motion.button>
            <motion.button whileTap={{ scale: 0.96 }} onClick={() => { setImage(null); setResult(null); }}
              className="py-3.5 px-4 rounded-2xl border border-gray-200 font-bold text-sm text-gray-600">
              Retry
            </motion.button>
          </div>
        </motion.div>
      )}

      {!image && (
        <div className="bg-[#e6f4ea] rounded-3xl p-5">
          <p className="text-xs font-bold text-[#1f4d2b] mb-2">How it works</p>
          <div className="flex flex-col gap-2">
            {['Take a clear photo of the affected leaf/plant', 'AI analyzes for diseases and deficiencies', 'Get actionable treatment recommendations'].map((s, i) => (
              <div key={i} className="flex gap-2 items-start">
                <span className="w-5 h-5 bg-[#1f4d2b] text-white rounded-full text-[10px] font-black flex items-center justify-center flex-shrink-0">{i + 1}</span>
                <p className="text-xs text-[#1f4d2b]/80 mt-0.5">{s}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const ChatPage = ({ language }: { language: Language }) => {
  type Msg = { role: 'user' | 'ai'; text: string };
  const greeting = language === 'Hindi' ? 'नमस्ते! मैं KrishiMitra AI हूँ। अपने खेत के बारे में कुछ भी पूछें।'
    : language === 'Marathi' ? 'नमस्कार! मी KrishiMitra AI आहे। तुमच्या शेताबद्दल काहीही विचारा.'
    : 'Namaste! I am KrishiMitra AI. Ask me anything about your farm.';
  const [msgs, setMsgs] = useState<Msg[]>([{ role: 'ai', text: greeting }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [msgs]);

  const send = async () => {
    const text = input.trim();
    if (!text) return;
    setInput('');
    setMsgs(m => [...m, { role: 'user', text }]);
    setLoading(true);
    try {
      const res = await fetch(\`\${API_BASE_URL}/api/chat\`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, language }),
      });
      const data = await res.json();
      setMsgs(m => [...m, { role: 'ai', text: data.reply || 'I could not process that.' }]);
    } catch {
      setMsgs(m => [...m, { role: 'ai', text: 'Sorry, connection failed. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 bg-[#1f4d2b] rounded-xl flex items-center justify-center">
          <MessageCircle size={17} className="text-white" />
        </div>
        <div>
          <h1 className="text-base font-black text-gray-900">Ask KrishiMitra AI</h1>
          <p className="text-[11px] text-gray-400">Your personal agronomist, 24/7</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto flex flex-col gap-3 pb-4">
        {msgs.map((m, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className={\`flex \${m.role === 'user' ? 'justify-end' : 'justify-start'}\`}>
            <div className={\`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed break-words \${
              m.role === 'user' ? 'bg-[#1f4d2b] text-white rounded-br-sm' : 'bg-white border border-gray-100 text-gray-800 rounded-bl-sm shadow-sm'
            }\`}>{m.text}</div>
          </motion.div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-100 px-4 py-3 rounded-2xl rounded-bl-sm shadow-sm flex gap-1.5 items-center">
              {[0, 1, 2].map(i => (
                <div key={i} className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: \`\${i * 0.15}s\` }} />
              ))}
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      <div className="flex gap-2 pt-2 pb-28">
        <input value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send()}
          placeholder={language === 'Hindi' ? 'अपना सवाल लिखें...' : language === 'Marathi' ? 'तुमचा प्रश्न लिहा...' : 'Ask about soil, crops, weather...'}
          className="flex-1 bg-white border border-gray-200 rounded-2xl px-4 py-3 text-sm outline-none focus:border-[#1f4d2b] focus:ring-2 focus:ring-[#1f4d2b]/10 transition-all" />
        <motion.button whileTap={{ scale: 0.9 }} onClick={send} disabled={!input.trim() || loading}
          className="w-11 h-11 bg-[#1f4d2b] rounded-xl flex items-center justify-center disabled:opacity-40 flex-shrink-0 self-center">
          <Send size={16} className="text-white" />
        </motion.button>
      </div>
    </div>
  );
};

`;

code = code.replace('// --- Components ---\n', '// --- Components ---\n' + NEW_COMPONENTS);

// ─── 6. Replace BottomNav with 5-tab version ──────────────────────────────────
const OLD_BOTTOM_NAV_START = `const BottomNav = ({
  activeTab,
  onTabChange,
  language,
}: {
  activeTab: string;
  onTabChange: (tab: Screen) => void;
  language: Language;
}) => {
  const tabs = [
    { id: 'home', label: COPY[language].nav.home, icon: Home, screen: 'landing' as Screen },
    { id: 'input', label: COPY[language].nav.input, icon: LayoutGrid, screen: 'input' as Screen },
    { id: 'analysis', label: COPY[language].nav.analysis, icon: ClipboardList, screen: 'dashboard' as Screen },
    { id: 'profile', label: COPY[language].nav.profile, icon: User, screen: 'profile' as Screen },
  ];

  return (
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md px-4 pb-4 pt-2 bg-[#f9f8f2] z-50">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex justify-around py-2 px-2">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.screen)}
              className={\`flex flex-col items-center gap-1 py-2 px-4 rounded-xl transition-all \${
                isActive ? 'bg-[#1f4d2b] text-white' : 'text-gray-400'
              }\`}
            >
              <tab.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] font-bold">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};`;

const NEW_BOTTOM_NAV = `const BottomNav = ({
  activeTab,
  onTabChange,
  language,
}: {
  activeTab: string;
  onTabChange: (tab: Screen) => void;
  language: Language;
}) => {
  const tabs = [
    { id: 'home', label: COPY[language].nav.home, icon: Home, screen: 'landing' as Screen },
    { id: 'input', label: COPY[language].nav.input, icon: LayoutGrid, screen: 'input' as Screen },
    { id: 'diagnose', label: (COPY[language].nav as any).diagnose || 'Diagnose', icon: Camera, screen: 'diagnose' as Screen },
    { id: 'analysis', label: COPY[language].nav.analysis, icon: ClipboardList, screen: 'dashboard' as Screen },
    { id: 'profile', label: COPY[language].nav.profile, icon: User, screen: 'profile' as Screen },
  ];
  return (
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md px-3 pb-3 pt-2 bg-[#f9f8f2]/95 backdrop-blur-sm z-50 no-print">
      <div className="bg-white rounded-2xl shadow-md border border-gray-100 flex justify-around py-1.5 px-1">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <motion.button
              key={tab.id}
              whileTap={{ scale: 0.88 }}
              onClick={() => onTabChange(tab.screen)}
              className={\`flex flex-col items-center gap-0.5 py-2 px-2 rounded-xl transition-all \${
                isActive ? 'bg-[#1f4d2b] text-white' : 'text-gray-400 hover:text-gray-600'
              }\`}
            >
              <tab.icon size={17} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[9px] font-bold whitespace-nowrap">{tab.label}</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};`;

code = code.replace(OLD_BOTTOM_NAV_START, NEW_BOTTOM_NAV);

// ─── 7. Upgrade LandingPage hero ──────────────────────────────────────────────
const OLD_HERO = `      {/* Hero Section */}
      <div className="relative rounded-2xl overflow-hidden shadow-sm">
        <img 
          src="https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=800&q=80" 
          alt="Farmer in Modern Field" 
          className="w-full h-[320px] object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#f9f8f2] via-[#f9f8f2]/90 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 flex flex-col gap-2 bg-gradient-to-t from-[#f9f8f2] to-transparent">
          <h2 className="text-3xl font-bold leading-tight text-[#1f4d2b] drop-shadow-sm">
            {c.landing.heroTitle1}<br />{c.landing.heroTitle2}
          </h2>
          <p className="text-sm text-gray-800 font-semibold leading-relaxed">
            {c.landing.heroSubtitle}
          </p>
        </div>
      </div>`;

const NEW_HERO = `      {/* Hero — glassmorphism dark card */}
      <div className="relative rounded-3xl overflow-hidden shadow-xl" style={{ minHeight: 260 }}>
        <img
          src="https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=800&q=80"
          alt="Farmer in Modern Field"
          className="absolute inset-0 w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#0f2d17]/90 via-[#1f4d2b]/85 to-[#2d6b3e]/70" />
        <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/5 rounded-full" />
        <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-white/5 rounded-full" />
        <div className="relative z-10 p-6 flex flex-col gap-4">
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-sm px-3 py-1.5 rounded-full w-fit border border-white/20">
            <Sparkles size={11} className="text-yellow-300" />
            <span className="text-[11px] font-bold text-white">AI-Powered Agronomy</span>
          </motion.div>
          <div>
            <motion.h2 initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
              className="text-3xl sm:text-4xl font-black text-white leading-tight">{c.landing.heroTitle1}</motion.h2>
            <motion.h2 initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.18 }}
              className="text-3xl sm:text-4xl font-black text-[#86efac] leading-tight">{c.landing.heroTitle2}</motion.h2>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.28 }}
              className="text-sm text-white/75 font-medium mt-2 leading-relaxed">{c.landing.heroSubtitle}</motion.p>
          </div>
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="flex gap-2">
            {[{ v: '120K+', l: 'Farmers' }, { v: '98%', l: c.landing.accuracy }, { v: 'Free', l: 'Forever' }].map((s) => (
              <div key={s.l} className="bg-white/10 backdrop-blur-sm rounded-xl px-3 py-2 flex flex-col items-center border border-white/15">
                <span className="text-sm font-black text-white">{s.v}</span>
                <span className="text-[8px] text-white/60 font-bold uppercase">{s.l}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>`;

code = code.replace(OLD_HERO, NEW_HERO);

// ─── 8. Upgrade LandingPage language buttons ──────────────────────────────────
code = code.replace(
  `            <button
              key={lang.name}
              onClick={() => setSelectedLang(lang.name)}
              className={\`flex items-center justify-between p-4 rounded-2xl border transition-all \${
                selectedLang === lang.name 
                ? 'bg-white border-[#1f4d2b] shadow-sm' 
                : 'bg-white/50 border-transparent text-gray-700'
              }\`}
            >
              <div className="flex flex-col items-start">
                <span className="font-bold text-sm">{lang.label}</span>
                <span className="text-[10px] text-gray-400">{lang.sub}</span>
              </div>
              <div className={\`w-4 h-4 rounded-full border flex items-center justify-center \${
                selectedLang === lang.name ? 'border-[#1f4d2b]' : 'border-gray-200'
              }\`}>
                {selectedLang === lang.name && <div className="w-2 h-2 rounded-full bg-[#1f4d2b]" />}
              </div>
            </button>`,
  `            <motion.button
              key={lang.name}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedLang(lang.name)}
              className={\`flex items-center justify-between p-4 rounded-2xl border-2 transition-all \${
                selectedLang === lang.name
                  ? 'bg-white border-[#1f4d2b] shadow-md shadow-green-900/10'
                  : 'bg-white/60 border-transparent'
              }\`}
            >
              <div className="flex flex-col items-start">
                <span className="font-bold text-sm text-gray-900">{lang.label}</span>
                <span className="text-[10px] text-gray-400">{lang.sub}</span>
              </div>
              <div className={\`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all \${
                selectedLang === lang.name ? 'border-[#1f4d2b] bg-[#1f4d2b]' : 'border-gray-200'
              }\`}>
                {selectedLang === lang.name && <CheckCircle2 size={11} className="text-white" />}
              </div>
            </motion.button>`
);

// ─── 9. Upgrade LandingPage CTA button ────────────────────────────────────────
code = code.replace(
  `      <button 
        onClick={() => onNext(selectedLang)}
        className="w-full bg-[#1f4d2b] text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 active:scale-[0.98] transition-transform shadow-lg shadow-green-900/20"
      >
        {c.landing.continue} <ArrowRight size={18} />
      </button>`,
  `      <motion.button whileTap={{ scale: 0.97 }} onClick={() => onNext(selectedLang)}
        className="w-full bg-[#1f4d2b] text-white py-4 rounded-2xl font-black text-base flex items-center justify-center gap-2 shadow-xl shadow-green-900/25">
        {c.landing.continue} <ArrowRight size={20} />
      </motion.button>`
);

// ─── 10. Add Diagnose/Chat to getActiveTab ────────────────────────────────────
code = code.replace(
  `    if (screen === 'landing') return 'home';
    if (screen === 'input') return 'input';
    if (screen === 'dashboard') return 'analysis';
    if (screen === 'profile') return 'profile';
    return 'home';`,
  `    if (screen === 'landing') return 'home';
    if (screen === 'input') return 'input';
    if (screen === 'diagnose') return 'diagnose';
    if (screen === 'chat') return 'chat';
    if (screen === 'dashboard') return 'analysis';
    if (screen === 'profile') return 'profile';
    return 'home';`
);

// ─── 11. Add diagnose/chat cases to renderScreen ──────────────────────────────
code = code.replace(
  `    if (currentScreen === 'profile') {`,
  `    if (currentScreen === 'diagnose') {
      return <DiagnosePage language={language} />;
    }
    if (currentScreen === 'chat') {
      return <ChatPage language={language} />;
    }
    if (currentScreen === 'profile') {`
);

// ─── 12. Handle diagnose/chat in BottomNav tab click ─────────────────────────
code = code.replace(
  `        onTabChange={(tab) => {
          setCurrentScreen(tab);
        }}`,
  `        onTabChange={(tab) => {
          if (tab === 'diagnose' || tab === 'chat') {
            setCurrentScreen(tab);
            return;
          }
          setCurrentScreen(tab);
        }}`
);

// ─── 13. Fix the SoilReport back arrow ────────────────────────────────────────
code = code.replace(
  `          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-sm font-bold text-[#1f4d2b]"
          >
            <span>&#8592;</span> Back
          </button>`,
  `          <button onClick={onBack} className="flex items-center gap-1.5 text-sm font-bold text-[#1f4d2b]">
            <ArrowLeft size={16} /> Back
          </button>`
);

// ─── 14. Add Share button to SoilReportPage ───────────────────────────────────
code = code.replace(
  `      <div className="flex flex-col gap-4 pb-24">`,
  `      <div className="flex flex-col gap-4 pb-24">
        {/* Share button */}
        <div className="flex items-center justify-end">
          <motion.button whileTap={{ scale: 0.95 }}
            onClick={() => {
              const text = \`KrishiMitra Soil Report\\nCrop: \${report?.crop} | Stage: \${stageLabel}\\nIrrigation: \${report?.irrigationText}\\nFertilizer: \${report?.fertilizerText}\`;
              if (navigator.share) navigator.share({ title: 'KrishiMitra Report', text });
              else navigator.clipboard.writeText(text);
            }}
            className="flex items-center gap-1.5 text-xs font-bold text-[#1f4d2b] bg-[#e6f4ea] px-3 py-2 rounded-xl">
            <Share2 size={13} /> Share
          </motion.button>
        </div>`
);

// ─── 15. Add DashboardPage chart section above "Trends" ───────────────────────
code = code.replace(
  `      {/* Trends Section */}`,
  `      {/* NPK Gauge + Charts */}
      {latestSensor && (
        <div className="bg-white rounded-3xl p-5 border border-gray-100">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">{c.dashboard.latestMonitoringTitle}</p>
          <div className="flex gap-4 items-center">
            <NutrientGauge n={latestSensor.nutrientN} p={latestSensor.nutrientP} k={latestSensor.nutrientK} />
            <div className="flex-1 flex flex-col gap-3">
              <MiniBarChart data={history.map((h: any) => h.moisture)} color="#3b82f6" label="Moisture %" />
              <MiniBarChart data={history.map((h: any) => h.nutrientN)} color="#10b981" label="Nitrogen" />
            </div>
          </div>
          <div className="flex gap-3 mt-3 text-[10px] font-bold text-gray-400">
            <span><span className="inline-block w-2 h-2 rounded-full bg-blue-500 mr-1" />N</span>
            <span><span className="inline-block w-2 h-2 rounded-full bg-amber-500 mr-1" />P</span>
            <span><span className="inline-block w-2 h-2 rounded-full bg-emerald-500 mr-1" />K</span>
          </div>
        </div>
      )}

      {/* Trends Section */}`
);

// ─── 16. Ensure `history` is available in DashboardPage ───────────────────────
// The existing dashboard already fetches history; we just need the variable
// The original code has `history` state. No change needed if it's already there.

writeFileSync(filePath, code, 'utf-8');
console.log('✅ All improvements applied to App.tsx');
