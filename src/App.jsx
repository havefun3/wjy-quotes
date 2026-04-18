import React, { useState, useEffect } from 'react';
import { MapPin, Calendar, Plus, Quote, Trash2, Download, Loader2 } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

// ！！！【在这里填入你的 Supabase 信息】！！！
const supabaseUrl = 'https://hvudiwtflrdixksarxls.supabase.co'; 
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh2dWRpd3RmbHJkaXhrc2FyeGxzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY0ODE3NDMsImV4cCI6MjA5MjA1Nzc0M30.EuRKJhAc1iVNSFRg2g0KgCCprusZq9DcWqYJ_kZ05Og';
const supabase = createClient(supabaseUrl, supabaseKey);

// --- 中国地图数据 ---
const MAP_DATA = [
  { name: '新疆', x: 1, y: 2 }, { name: '西藏', x: 1, y: 4 }, { name: '青海', x: 2, y: 3 },
  { name: '甘肃', x: 3, y: 2 }, { name: '四川', x: 3, y: 5 }, { name: '云南', x: 3, y: 6 },
  { name: '宁夏', x: 4, y: 3 }, { name: '陕西', x: 4, y: 4 }, { name: '重庆', x: 4, y: 5 },
  { name: '贵州', x: 4, y: 6 }, { name: '内蒙古', x: 5, y: 2 }, { name: '山西', x: 5, y: 3 },
  { name: '河南', x: 5, y: 4 }, { name: '湖北', x: 5, y: 5 }, { name: '湖南', x: 5, y: 6 },
  { name: '广西', x: 5, y: 7 }, { name: '北京', x: 6, y: 2 }, { name: '河北', x: 6, y: 3 },
  { name: '山东', x: 6, y: 4 }, { name: '安徽', x: 6, y: 5 }, { name: '江西', x: 6, y: 6 },
  { name: '广东', x: 6, y: 7 }, { name: '辽宁', x: 7, y: 2 }, { name: '天津', x: 7, y: 3 },
  { name: '江苏', x: 7, y: 5 }, { name: '浙江', x: 7, y: 6 }, { name: '福建', x: 7, y: 7 },
  { name: '吉林', x: 8, y: 2 }, { name: '上海', x: 8, y: 5 }, { name: '台湾', x: 8, y: 7 },
  { name: '黑龙江', x: 9, y: 1 }, { name: '海南', x: 5, y: 8 }, { name: '香港', x: 6, y: 8 },
  { name: '澳门', x: 5.5, y: 8 }
];

// --- 寰宇地图数据 ---
const WORLD_MAP_DATA = [
  { name: '北美', x: 1, y: 2 }, { name: '中美', x: 2, y: 3 }, { name: '南美', x: 2, y: 4 },
  { name: '北欧', x: 4, y: 1 }, { name: '西欧', x: 4, y: 2 }, { name: '东欧', x: 5, y: 2 },
  { name: '非洲', x: 4, y: 3 }, { name: '中东', x: 5, y: 3 }, { name: '俄区', x: 6, y: 1 },
  { name: '东亚', x: 6, y: 2 }, { name: '南亚', x: 6, y: 3 }, { name: '东南亚', x: 7, y: 3 },
  { name: '澳洲', x: 7, y: 4 }, { name: '极地', x: 4, y: 5 }
];

export default function App() {
  const [quotes, setQuotes] = useState([]);
  const [isLoading, setIsLoading] = useState(true); // 新增：加载状态
  const [mapMode, setMapMode] = useState('china'); 
  const [exportingId, setExportingId] = useState(null);

  const [form, setForm] = useState({
    text: '',
    date: new Date().toISOString().split('T')[0],
    province: '北京',
    location: ''
  });

  // --- 新增：从云端拉取数据 ---
  useEffect(() => {
    fetchQuotes();
  }, []);

  const fetchQuotes = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('quotes')
        .select('*')
        .order('id', { ascending: false }); // 最新的排在最前
      
      if (error) throw error;
      setQuotes(data || []);
    } catch (error) {
      console.error('获取语录失败:', error);
      alert('无法连接到云端数据库，请刷新重试！');
    } finally {
      setIsLoading(false);
    }
  };

  // --- 修改：将新语录保存到云端 ---
  const handleAddQuote = async (e) => {
    e.preventDefault();
    if (!form.text.trim()) return;
    
    const newQuoteData = {
      text: form.text,
      date: form.date,
      province: form.province,
      location: form.location,
      ticketNo: `WJY-${Math.floor(Math.random() * 900000) + 100000}`
    };
    
    try {
      // 1. 存入 Supabase 云端
      const { data, error } = await supabase
        .from('quotes')
        .insert([newQuoteData])
        .select();

      if (error) throw error;

      // 2. 更新本地画面
      if (data && data.length > 0) {
        setQuotes([data[0], ...quotes]);
      }
      setForm({ ...form, text: '', location: '' }); 
    } catch (error) {
      console.error('保存失败:', error);
      alert('保存失败，请稍后重试！');
    }
  };

  // --- 修改：从云端删除语录 ---
  const deleteQuote = async (id) => {
    const confirmDelete = window.confirm("确定要销毁这张典藏凭证吗？");
    if (!confirmDelete) return;

    try {
      const { error } = await supabase
        .from('quotes')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setQuotes(quotes.filter(q => q.id !== id));
    } catch (error) {
      console.error('删除失败:', error);
      alert('删除失败，请稍后重试！');
    }
  };

  const exportTicket = async (id, ticketNo) => {
    setExportingId(id);
    const element = document.getElementById(`ticket-${id}`);
    if (!element) {
      setExportingId(null);
      return;
    }

    try {
      if (!window.html2canvas) {
        await new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
          script.onload = resolve;
          script.onerror = reject;
          document.head.appendChild(script);
        });
      }

      const canvas = await window.html2canvas(element, {
        scale: 2, 
        backgroundColor: '#FAFAF8', 
        useCORS: true
      });
      
      const link = document.createElement('a');
      link.download = `纪元语录_${ticketNo}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('导出图片失败:', error);
    } finally {
      setExportingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#EBE7E0] text-[#2C2C2C] font-sans selection:bg-[#BA3F38] selection:text-white pb-20">
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@300;400;500;700;900&display=swap');
        .font-serif-sc { font-family: 'Noto Serif SC', serif; }
        .vertical-rl { writing-mode: vertical-rl; text-orientation: mixed; }
        .ticket-cutout { mask-image: radial-gradient(circle at 0 50%, transparent 12px, black 13px), radial-gradient(circle at 100% 50%, transparent 12px, black 13px); mask-size: 51% 100%; mask-repeat: no-repeat; mask-position: left, right; }
        .china-map-grid { display: grid; grid-template-columns: repeat(9, 1fr); grid-template-rows: repeat(8, 1fr); gap: 4px; aspect-ratio: 1.2 / 1; }
        .world-map-grid { display: grid; grid-template-columns: repeat(8, 1fr); grid-template-rows: repeat(5, 1fr); gap: 4px; aspect-ratio: 1.8 / 1; }
        .chinese-seal { border: 2px solid #BA3F38; color: #BA3F38; border-radius: 4px; padding: 4px; writing-mode: vertical-rl; font-family: 'Noto Serif SC', serif; font-weight: 900; letter-spacing: 2px; transform: rotate(-5deg); }
      `}} />

      <header className="pt-16 pb-10 px-6 text-center">
        <div className="inline-block relative">
          <h1 className="text-4xl md:text-5xl font-bold font-serif-sc tracking-widest text-[#1A1A1A]">
            王纪元同志语录
          </h1>
          <div className="absolute -right-10 -top-4 chinese-seal text-xs opacity-85">
            王纪<br/>元印
          </div>
        </div>
        <p className="mt-4 text-sm text-gray-500 tracking-widest uppercase font-light">
          Collection of Comrade Wang's Quotes
        </p>
      </header>

      <main className="max-w-6xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-12 gap-12">
        <section className="lg:col-span-5 space-y-8">
          <div className="bg-[#F6F4F0] p-8 rounded-2xl shadow-sm border border-[#DEDBD5]">
            <h2 className="text-xl font-serif-sc font-bold mb-6 flex items-center gap-2">
              <Quote className="w-5 h-5 text-[#BA3F38]" />
              记载新语录
            </h2>
            
            <form onSubmit={handleAddQuote} className="space-y-5">
              <div>
                <textarea required value={form.text} onChange={(e) => setForm({...form, text: e.target.value})} placeholder="“今天他又说了什么惊世骇俗的话...”" className="w-full bg-transparent border-b-2 border-[#C8C5C0] focus:border-[#BA3F38] outline-none py-3 resize-none font-serif-sc text-lg transition-colors" rows={3} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center gap-2 text-xs text-gray-500 mb-1 tracking-wider"><Calendar className="w-3 h-3" /> 日期</label>
                  <input type="date" required value={form.date} onChange={(e) => setForm({...form, date: e.target.value})} className="w-full bg-transparent border-b border-[#C8C5C0] focus:border-[#BA3F38] outline-none py-1 font-mono text-sm" />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-xs text-gray-500 mb-1 tracking-wider"><MapPin className="w-3 h-3" /> 详细地点</label>
                  <input type="text" value={form.location} onChange={(e) => setForm({...form, location: e.target.value})} placeholder="如：某咖啡馆" className="w-full bg-transparent border-b border-[#C8C5C0] focus:border-[#BA3F38] outline-none py-1 text-sm" />
                </div>
              </div>

              <div className="pt-4">
                <div className="flex justify-between items-end mb-3">
                  <label className="block text-xs text-gray-500 tracking-wider">大区划 (可交互先锋地图)</label>
                  <div className="flex gap-3 text-[10px] font-serif-sc">
                    <button type="button" onClick={() => setMapMode('china')} className={`transition-colors pb-0.5 ${mapMode === 'china' ? 'text-[#BA3F38] font-bold border-b border-[#BA3F38]' : 'text-gray-400 hover:text-gray-600'}`}>中国</button>
                    <button type="button" onClick={() => setMapMode('world')} className={`transition-colors pb-0.5 ${mapMode === 'world' ? 'text-[#BA3F38] font-bold border-b border-[#BA3F38]' : 'text-gray-400 hover:text-gray-600'}`}>寰宇</button>
                    <button type="button" onClick={() => setMapMode('custom')} className={`transition-colors pb-0.5 ${mapMode === 'custom' ? 'text-[#BA3F38] font-bold border-b border-[#BA3F38]' : 'text-gray-400 hover:text-gray-600'}`}>自定义</button>
                  </div>
                </div>
                
                <div className="bg-[#EBE7E0] p-4 rounded-xl border border-[#DEDBD5] min-h-[160px] flex flex-col justify-center transition-all">
                  {mapMode === 'china' && (
                    <div className="china-map-grid">
                      {MAP_DATA.map((p) => (
                        <button key={p.name} type="button" onClick={() => setForm({...form, province: p.name})} style={{ gridColumn: p.x, gridRow: p.y }} className={`text-[10px] md:text-xs flex items-center justify-center rounded-sm transition-all duration-300 ${form.province === p.name ? 'bg-[#BA3F38] text-white shadow-md scale-110 z-10 font-bold' : 'bg-[#F6F4F0] text-gray-500 hover:bg-[#DEDBD5]'}`} title={p.name}>{p.name.substring(0, 1)}</button>
                      ))}
                    </div>
                  )}

                  {mapMode === 'world' && (
                    <div className="world-map-grid">
                      {WORLD_MAP_DATA.map((p) => (
                        <button key={p.name} type="button" onClick={() => setForm({...form, province: p.name})} style={{ gridColumn: p.x, gridRow: p.y }} className={`text-[10px] md:text-[11px] flex items-center justify-center rounded-sm transition-all duration-300 ${form.province === p.name ? 'bg-[#BA3F38] text-white shadow-md scale-110 z-10 font-bold' : 'bg-[#F6F4F0] text-gray-500 hover:bg-[#DEDBD5]'}`} title={p.name}>{p.name.substring(0, 2)}</button>
                      ))}
                    </div>
                  )}

                  {mapMode === 'custom' && (
                    <div className="flex-1 flex flex-col items-center justify-center space-y-2 py-4">
                      <input type="text" value={form.province} onChange={(e) => setForm({...form, province: e.target.value})} placeholder="输入任意国家、星系或次元..." className="w-3/4 bg-transparent border-b-2 border-[#C8C5C0] focus:border-[#BA3F38] text-center outline-none py-2 font-serif-sc text-sm transition-colors" />
                      <p className="text-[10px] text-gray-400">请在上方手动输入区划名称</p>
                    </div>
                  )}

                  <div className="text-center mt-4 text-xs font-serif-sc text-[#BA3F38] font-bold">
                    当前选择：{form.province || '未指定'}
                  </div>
                </div>
              </div>

              <button type="submit" className="w-full mt-6 bg-[#1A1A1A] hover:bg-[#BA3F38] text-white py-3 rounded-lg flex items-center justify-center gap-2 transition-all duration-300 shadow-md font-serif-sc tracking-widest">
                <Plus className="w-4 h-4" /> 刻印收藏
              </button>
            </form>
          </div>
        </section>

        <section className="lg:col-span-7 space-y-8">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400 space-y-4">
              <Loader2 className="w-8 h-8 animate-spin text-[#BA3F38]" />
              <p className="font-serif-sc tracking-widest">正在从云端调取档案...</p>
            </div>
          ) : quotes.length === 0 ? (
            <div className="text-center py-20 text-gray-400 font-serif-sc tracking-widest border-2 border-dashed border-[#DEDBD5] rounded-xl">
              暂无云端收藏，等待新时代的语录诞生...
            </div>
          ) : (
            quotes.map((quote) => (
              <div key={quote.id} className="relative group perspective-1000">
                
                <div className="absolute -right-3 -top-3 z-20 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => deleteQuote(quote.id)} className="bg-white p-2 rounded-full shadow-lg text-gray-400 hover:text-red-500 transition-colors" title="删除语录"><Trash2 className="w-4 h-4" /></button>
                  <button onClick={() => exportTicket(quote.id, quote.ticketNo)} disabled={exportingId === quote.id} className="bg-white p-2 rounded-full shadow-lg text-gray-400 hover:text-[#BA3F38] transition-colors disabled:opacity-50" title="保存为高清图片">
                    {exportingId === quote.id ? <Loader2 className="w-4 h-4 animate-spin text-[#BA3F38]" /> : <Download className="w-4 h-4" />}
                  </button>
                </div>

                <div id={`ticket-${quote.id}`} className="flex w-full min-h-[140px] bg-[#FAFAF8] shadow-[0_8px_30px_-10px_rgba(0,0,0,0.08)] rounded-sm ticket-cutout overflow-hidden border border-[#E5E5E5] transition-transform duration-500 hover:-translate-y-1 relative">
                  <div className="w-1.5 bg-[#BA3F38] shrink-0"></div>
                  <div className="flex-1 p-5 md:p-6 flex flex-col relative justify-between">
                    <div className="flex justify-between items-center border-b border-[#D1D1D1] pb-2 mb-3">
                      <span className="text-[10px] font-mono text-gray-400 tracking-widest uppercase">Archive No. {quote.id}</span>
                      <span className="text-[10px] font-serif-sc text-gray-400 tracking-[0.2em]">纪元同志语录选编</span>
                    </div>
                    
                    <div className="flex-1 flex items-center py-2 relative z-10">
                      <Quote className="w-5 h-5 text-[#BA3F38] opacity-30 absolute -top-2 -left-2" />
                      <p className="font-serif-sc text-lg md:text-xl leading-relaxed text-[#1A1A1A] tracking-wide pl-5 font-medium">{quote.text}</p>
                    </div>

                    <div className="mt-4 pt-2 border-t border-[#E5E5E5] flex justify-between items-end relative z-10">
                      <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-gray-500">
                        <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5"/> {quote.date.replace(/-/g, '.')}</span>
                        <span className="flex items-center gap-1.5 text-[#BA3F38] font-serif-sc font-bold"><MapPin className="w-3.5 h-3.5"/> {quote.province}</span>
                        <span className="text-gray-400 font-sans">{quote.location || '未知'}</span>
                      </div>
                    </div>

                    <div className="absolute right-4 bottom-4 chinese-seal text-[10px] scale-90 opacity-60 pointer-events-none select-none z-0">纪元<br/>真迹</div>
                    <div className="absolute left-1/2 top-1/2 -translate-y-1/2 -translate-x-1/2 opacity-[0.03] font-serif-sc text-8xl pointer-events-none select-none z-0">言</div>
                  </div>

                  <div className="w-[1px] bg-transparent border-l-2 border-dashed border-[#D1D1D1] my-3 relative shrink-0"></div>

                  <div className="w-24 md:w-32 bg-[#F5F4F0] p-4 flex flex-col justify-between items-center relative shrink-0">
                    <div className="w-full text-center">
                      <p className="text-[8px] text-gray-400 uppercase tracking-widest mb-1">TICKET NO.</p>
                      <p className="font-mono text-xs font-bold text-[#1A1A1A] tracking-wider">{quote.ticketNo}</p>
                    </div>
                    <div className="flex-1 flex items-center justify-center w-full my-3">
                      <div className="font-serif-sc text-[10px] text-gray-400 tracking-[0.4em] vertical-rl opacity-70">· 典 藏 凭 证 ·</div>
                    </div>
                    <div className="flex gap-[2px] h-6 w-full justify-center opacity-70">
                      {[...Array(14)].map((_, i) => (<div key={i} className="bg-[#2C2C2C]" style={{ width: `${Math.random() * 3 + 1}px` }}></div>))}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </section>
      </main>
    </div>
  );
}