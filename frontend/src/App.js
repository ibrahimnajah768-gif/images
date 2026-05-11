import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { createClient } from '@supabase/supabase-js';
import { 
  Sparkles, Image as ImageIcon, Download, Trash2, 
  Filter, History, ChevronRight, X, Check, ArrowLeftRight, Plus, ChevronDown, Zap
} from 'lucide-react';
import './App.css';

// --- [ إعدادات Supabase ] ---
const SUPABASE_URL = "https://hhmwphjamdqmgfvdayst.supabase.co"; 
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhobXdwaGphbWRxbWdmdmRheXN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU4MTcxNzUsImV4cCI6MjA5MTM5MzE3NX0.VtD3nNUJDjGg8OSPxXQje1yfr2nwdEiFurSU1s_8Cdw"; 
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [resultImage, setResultImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('none');
  const [intensity, setIntensity] = useState(1); 
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [history, setHistory] = useState([]);
  const [showFilters, setShowFilters] = useState(true); 
  const [showHistory, setShowHistory] = useState(true);
  const [sliderPos, setSliderPos] = useState(50);

  const filtersList = [
    { id: 'none', name: 'بدون فلتر', css: (val) => 'none' },
    { id: 'natural_hd', name: 'الوضع الطبيعي HD', css: (val) => `contrast(${1 + 0.1*val}) saturate(${1 + 0.1*val})` },
    { id: 'brl1', name: 'BRL - Light', css: (val) => `brightness(${1 + 0.2*val}) contrast(${1 + 0.1*val})` },
    { id: 'brl2', name: 'BRL - Pure', css: (val) => `brightness(${1 + 0.3*val}) saturate(${1 + 0.3*val})` },
    { id: 'brl3', name: 'BRL - Ultra', css: (val) => `brightness(${1 + 0.5*val}) contrast(1.2) saturate(1.4)` },
    { id: 'ntrl1', name: 'NTRL - Soft', css: (val) => `saturate(${1 + 0.2*val})` },
    { id: 'ntrl2', name: 'NTRL - Warm', css: (val) => `sepia(${0.1*val}) saturate(${1 + 0.3*val})` },
    { id: 'ntrl3', name: 'NTRL - Vivid', css: (val) => `contrast(${1 + 0.2*val}) brightness(1.05)` },
    { id: 'apr1', name: 'APR - Golden', css: (val) => `sepia(${0.3*val}) hue-rotate(-10deg)` },
    { id: 'apr2', name: 'APR - Sunset', css: (val) => `sepia(${0.5*val}) brightness(1.1)` },
    { id: 'apr3', name: 'APR - Deep', css: (val) => `sepia(${0.7*val}) contrast(1.1)` },
    { id: 'crisp', name: 'Crisp ✨', css: (val) => `contrast(${1 + 0.5*val}) brightness(${1 + 0.1*val})` },
    { id: 'cross', name: 'تقاطع ضوء 💡', css: (val) => `contrast(${1.4*val}) hue-rotate(20deg)` },
    { id: 'mil1', name: 'MIL - 1', css: (val) => `grayscale(${0.2*val}) brightness(1.1)` },
    { id: 'mil2', name: 'MIL - 2', css: (val) => `opacity(${1 - 0.1*val}) contrast(1.1)` },
    { id: 'mil3', name: 'MIL - 3', css: (val) => `sepia(${0.2*val}) saturate(0.8)` },
    { id: 'glow', name: 'Studio Glow 💎', css: (val) => `brightness(${1 + 0.1*val}) drop-shadow(0 0 ${8*val}px white)` },
    { id: 'white', name: 'تبييض ملكي ✨', css: (val) => `brightness(${1 + 0.2*val}) contrast(1.05) saturate(0.95)` },
    { id: 'hdr', name: 'HDR سينمائي 🎬', css: (val) => `contrast(${1 + 0.4*val}) brightness(1.1) saturate(1.3)` },
    { id: 'silver', name: 'فضي كلاسيك 🥈', css: (val) => `grayscale(${100*val}%) contrast(1.2)` },
    { id: 'skin', name: 'بشرة حريرية 🧴', css: (val) => `blur(${0.2*val}px) brightness(1.05)` },
    { id: 'vivid', name: 'ألوان حيوية 🌈', css: (val) => `saturate(${1.2 + val}) contrast(1.1)` },
  ];

  const fetchHistory = async () => {
    const { data, error } = await supabase.from('images').select('url').order('created_at', { ascending: false });
    if (data) setHistory(data.map(item => item.url));
    if (error) console.error("Database Error:", error.message);
  };

  // وظيفة الحذف من قاعدة البيانات والمخزون
  const deleteFromHistory = async (imageUrl) => {
    const confirmDelete = window.confirm("هل تريد حذف هذه الصورة نهائياً؟");
    if (!confirmDelete) return;

    const { error } = await supabase
      .from('images')
      .delete()
      .eq('url', imageUrl);

    if (error) {
      alert("حدث خطأ أثناء الحذف");
    } else {
      setHistory(prev => prev.filter(url => url !== imageUrl));
    }
  };

  useEffect(() => { fetchHistory(); }, []);
  useEffect(() => { if (resultImage) fetchHistory(); }, [resultImage]);

  const onFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
      setResultImage(null);
    }
  };

  const handleSliderMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    if (!clientX) return;
    const x = ((clientX - rect.left) / rect.width) * 100;
    setSliderPos(Math.min(Math.max(x, 0), 100));
  };

  const getAppliedFilter = () => {
    const active = filtersList.find(f => f.id === filter);
    return active ? active.css(intensity) : 'none';
  };

  const onUpload = async () => {
    if (!selectedFile) return;
    setLoading(true);
    const formData = new FormData();
    formData.append('image', selectedFile);
    try {
      const response = await axios.post('http://localhost:5000/process-image', formData);
      setResultImage(response.data.result_url);
    } catch (error) {
      alert("خطأ في المعالجة");
    } finally {
      setLoading(false);
    }
  };

  const onFastFilter = async () => {
    if (!selectedFile) return;
    setLoading(true);
    const formData = new FormData();
    formData.append('image', selectedFile);
    try {
      const response = await axios.post('http://localhost:5000/upload-only', formData);
      setResultImage(response.data.result_url);
      setIsSidebarOpen(true);
    } catch (error) {
      alert("خطأ في الرفع");
    } finally {
      setLoading(false);
    }
  };

  const downloadImage = async () => {
    if (!resultImage) return;
    try {
      const response = await fetch(resultImage);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `ElevateAI_${Date.now()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      window.open(resultImage, '_blank');
    }
  };

  return (
    <div className="luxury-app">
      <div className="bg-glow"></div>
      <header className="app-header">
        <h1 className="luxury-title">ELEVATE <span className="gold">AI</span></h1>
        <div className="title-underline"></div>
      </header>

      <main className="main-container">
        <div className="workspace-card">
          {resultImage ? (
            <div className="slider-container" onMouseMove={handleSliderMove} onTouchMove={(e) => handleSliderMove(e)}>
              <div className="label-top before-label">قبل</div>
              <div className="label-top after-label">بعد</div>
              <div className="image-wrapper"><img src={preview} alt="original" className="luxury-img" /></div>
              <div className="image-wrapper overlay" style={{ width: `${sliderPos}%` }}>
                <img src={resultImage} alt="restored" className="luxury-img" style={{ filter: getAppliedFilter() }} />
              </div>
              <div className="slider-line" style={{ left: `${sliderPos}%` }}>
                <div className="slider-handle"><div className="handle-glow"></div><ArrowLeftRight size={20} color="#000" /></div>
              </div>
            </div>
          ) : (
            <label className="upload-zone-wrapper">
              <input type="file" onChange={onFileChange} hidden />
              {preview ? (
                <div className="preview-ready">
                  <div className="image-wrapper"><img src={preview} className="luxury-img preview-fade" alt="preview" /></div>
                  <div className="change-image-overlay"><Plus size={40} className="gold" /><span>تبديل الصورة</span></div>
                </div>
              ) : (
                <div className="empty-state-center">
                  <div className="icon-box-animated"><ImageIcon size={50} className="gold" /></div>
                  <h2 className="upload-text">اضغط هنا لرفع صورتك</h2>
                </div>
              )}
            </label>
          )}
        </div>

        <div className="luxury-controls">
          <div className="file-info-box">
             <div className={`status-dot ${selectedFile ? 'active' : ''}`}></div>
             <span className="file-name-display">{selectedFile ? selectedFile.name : "بانتظار ملف..."}</span>
          </div>
          <button className={`ctrl-btn enhance-btn ${loading ? 'loading-pulse' : ''}`} onClick={onUpload} disabled={loading}>
            <Sparkles size={18} /><span>{loading ? "جاري التحسين..." : "تحسين بالذكاء"}</span>
          </button>
          <button className="ctrl-btn fast-btn" onClick={onFastFilter} disabled={loading}>
            <Zap size={18} /><span>فلاتر مباشرة</span>
          </button>
          {resultImage && (
            <>
              <button onClick={downloadImage} className="ctrl-btn save-btn"><Download size={18} /><span>حفظ</span></button>
              <button className="ctrl-btn delete-btn" onClick={() => {setResultImage(null); setPreview(null); setSelectedFile(null);}}><Trash2 size={18} /></button>
            </>
          )}
        </div>
      </main>

      <div className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <button className="toggle-sidebar" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
          {isSidebarOpen ? <X size={20}/> : <ChevronRight size={20} />}
        </button>

        <div className="sidebar-inner">
          <div className={`sidebar-section ${showFilters ? 'expanded' : 'collapsed'}`}>
            <div className="section-header clickable" onClick={() => setShowFilters(!showFilters)}>
              <div className="header-title-wrapper"><Filter className="gold" size={20} /><span>الفلاتر الملكية</span></div>
              <ChevronDown className={`arrow-icon ${showFilters ? 'rotate' : ''}`} size={18} />
            </div>
            {showFilters && (
              <div className="dropdown-list scroll-styled animate-fade-in">
                {filtersList.map((f) => (
                  <div key={f.id} className="filter-control-group">
                    <button className={`filter-btn ${filter === f.id ? 'active' : ''}`} onClick={() => { setFilter(f.id); setIntensity(1); }}>
                      <span className="filter-name-text">{f.name}</span>{filter === f.id && <Check size={14} />}
                    </button>
                    {filter === f.id && f.id !== 'none' && (
                      <div className="intensity-bar"><input type="range" min="0" max="2" step="0.1" value={intensity} onChange={(e) => setIntensity(parseFloat(e.target.value))} className="gold-range" /></div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className={`sidebar-section ${showHistory ? 'expanded' : 'collapsed'}`}>
            <div className="section-header clickable" onClick={() => setShowHistory(!showHistory)}>
              <div className="header-title-wrapper"><History className="gold" size={20} /><span>المخزون</span></div>
              <ChevronDown className={`arrow-icon ${showHistory ? 'rotate' : ''}`} size={18} />
            </div>
            {showHistory && (
              <div className="inventory-grid scroll-styled animate-fade-in">
                {history.map((url, i) => (
                  <div key={i} className="inventory-card">
                    <img src={url} alt={`hist-${i}`} onClick={() => {setResultImage(url); setPreview(url); setFilter('none');}} />
                    <button className="del-history-btn" onClick={(e) => { e.stopPropagation(); deleteFromHistory(url); }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
                {history.length === 0 && <p className="empty-msg">المخزون فارغ</p>}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;