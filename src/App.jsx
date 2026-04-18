import React, { useState, useEffect } from 'react';
import { MapPin, Calendar, Plus, Quote, Trash2, Download, Loader2 } from 'lucide-react';

// --- 创新版抽象中国地图数据 (基于相对地理位置的 Grid 坐标) ---
// x: 列 (1-9), y: 行 (1-7)
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

// --- 新增：寰宇抽象世界地图数据 ---
// x: 列 (1-8), y: 行 (1-5)
const WORLD_MAP_DATA = [
  { name: '北美', x: 1, y: 2 }, { name: '中美', x: 2, y: 3 }, { name: '南美', x: 2, y: 4 },
  { name: '北欧', x: 4, y: 1 }, { name: '西欧', x: 4, y: 2 }, { name: '东欧', x: 5, y: 2 },
  { name: '非洲', x: 4, y: 3 }, { name: '中东', x: 5, y: 3 }, { name: '俄区', x: 6, y: 1 },
  { name: '东亚', x: 6, y: 2 }, { name: '南亚', x: 6, y: 3 }, { name: '东南亚', x: 7, y: 3 },
  { name: '澳洲', x: 7, y: 4 }, { name: '极地', x: 4, y: 5 }
];

export default function App() {
  const [quotes, setQuotes] = useState([
    {
      id: 1,
      text: "test。",
      date: "2023-11-12",
      province: "北京",
      location: "朝阳区某咖啡馆",
      ticketNo: "WJY-008123"
    },
    {
      id: 2,
      text: "test。",
      date: "2024-03-05",
      province: "上海",
      location: "徐汇滨江",
      ticketNo: "WJY-092441"
    }
  ]);

  // 新增：地图模式状态 (中国 / 世界 / 自定义)
  const [mapMode, setMapMode] = useState('china'); 
  const [exportingId, setExportingId] = useState(null); // 新增：导出状态

  const [form, setForm] = useState({
    text: '',
    date: new Date().toISOString().split('T')[0],
    province: '北京',
    location: ''
  });

  const handleAddQuote = (e) => {
    e.preventDefault();
    if (!form.text.trim()) return;
    
    const newQuote = {
      ...form,
      id: Date.now(),
      ticketNo: `WJY-${Math.floor(Math.random() * 900000) + 100000}`
    };
    
    setQuotes([newQuote, ...quotes]);
    setForm({ ...form, text: '', location: '' }); // 重置部分表单
  };

  const deleteQuote = (id) => {
    setQuotes(quotes.filter(q => q.id !== id));
  };

  // 新增：导出图片功能 (动态加载 html2canvas)
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

      // 截取目标 DOM 元素
      const canvas = await window.html2canvas(element, {
        scale: 2, // 提高导出图片的清晰度，适合手机端查看
        backgroundColor: '#FAFAF8', // 避免由于透明导致截图出现黑底
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
      {/* 动态引入 Google Fonts: 思源宋体 Noto Serif SC */}
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@300;400;500;700;900&display=swap');
        
        .font-serif-sc {
          font-family: 'Noto Serif SC', serif;
        }
        
        .vertical-rl {
          writing-mode: vertical-rl;
          text-orientation: mixed;
        }

        /* 票根内凹半圆孔特效 */
        .ticket-cutout {
          mask-image: radial-gradient(circle at 0 50%, transparent 12px, black 13px), 
                      radial-gradient(circle at 100% 50%, transparent 12px, black 13px);
          mask-size: 51% 100%;
          mask-repeat: no-repeat;
          mask-position: left, right;
        }

        /* 抽象地图网格系统 */
        .china-map-grid {
          display: grid;
          grid-template-columns: repeat(9, 1fr);
          grid-template-rows: repeat(8, 1fr);
          gap: 4px;
          aspect-ratio: 1.2 / 1;
        }

        /* 新增：世界地图网格 */
        .world-map-grid {
          display: grid;
          grid-template-columns: repeat(8, 1fr);
          grid-template-rows: repeat(5, 1fr);
          gap: 4px;
          aspect-ratio: 1.8 / 1;
        }

        /* 红色印章样式 */
        .chinese-seal {
          border: 2px solid #BA3F38;
          color: #BA3F38;
          border-radius: 4px;
          padding: 4px;
          writing-mode: vertical-rl;
          font-family: 'Noto Serif SC', serif;
          font-weight: 900;
          letter-spacing: 2px;
          opacity: 0.85;
          transform: rotate(-5deg);
        }
      `}} />

      {/* Header */}
      <header className="pt-16 pb-10 px-6 text-center">
        <div className="inline-block relative">
          <h1 className="text-4xl md:text-5xl font-bold font-serif-sc tracking-widest text-[#1A1A1A]">
            王纪元同志语录
          </h1>
          <div className="absolute -right-10 -top-4 chinese-seal text-xs">
            王纪<br/>元印
          </div>
        </div>
        <p className="mt-4 text-sm text-gray-500 tracking-widest uppercase font-light">
          Collection of Comrade Wang's Quotes
        </p>
      </header>

      <main className="max-w-6xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* 左侧：录入表单 & 抽象地图 */}
        <section className="lg:col-span-5 space-y-8">
          <div className="bg-[#F6F4F0] p-8 rounded-2xl shadow-sm border border-[#DEDBD5]">
            <h2 className="text-xl font-serif-sc font-bold mb-6 flex items-center gap-2">
              <Quote className="w-5 h-5 text-[#BA3F38]" />
              记载新语录
            </h2>
            
            <form onSubmit={handleAddQuote} className="space-y-5">
              {/* 语录输入框 */}
              <div>
                <textarea
                  required
                  value={form.text}
                  onChange={(e) => setForm({...form, text: e.target.value})}
                  placeholder="“妙语连珠中...”"
                  className="w-full bg-transparent border-b-2 border-[#C8C5C0] focus:border-[#BA3F38] outline-none py-3 resize-none font-serif-sc text-lg transition-colors"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* 日期选择 */}
                <div>
                  <label className="flex items-center gap-2 text-xs text-gray-500 mb-1 tracking-wider">
                    <Calendar className="w-3 h-3" /> 日期
                  </label>
                  <input
                    type="date"
                    required
                    value={form.date}
                    onChange={(e) => setForm({...form, date: e.target.value})}
                    className="w-full bg-transparent border-b border-[#C8C5C0] focus:border-[#BA3F38] outline-none py-1 font-mono text-sm"
                  />
                </div>
                {/* 详细地点 */}
                <div>
                  <label className="flex items-center gap-2 text-xs text-gray-500 mb-1 tracking-wider">
                    <MapPin className="w-3 h-3" /> 详细地点
                  </label>
                  <input
                    type="text"
                    value={form.location}
                    onChange={(e) => setForm({...form, location: e.target.value})}
                    placeholder="如：某咖啡馆"
                    className="w-full bg-transparent border-b border-[#C8C5C0] focus:border-[#BA3F38] outline-none py-1 text-sm"
                  />
                </div>
              </div>

              {/* 创新抽象地图选择器 */}
              <div className="pt-4">
                <div className="flex justify-between items-end mb-3">
                  <label className="block text-xs text-gray-500 tracking-wider">
                    大区划 (可交互先锋地图)
                  </label>
                  <div className="flex gap-3 text-[10px] font-serif-sc">
                    <button type="button" onClick={() => setMapMode('china')} className={`transition-colors pb-0.5 ${mapMode === 'china' ? 'text-[#BA3F38] font-bold border-b border-[#BA3F38]' : 'text-gray-400 hover:text-gray-600'}`}>中国</button>
                    <button type="button" onClick={() => setMapMode('world')} className={`transition-colors pb-0.5 ${mapMode === 'world' ? 'text-[#BA3F38] font-bold border-b border-[#BA3F38]' : 'text-gray-400 hover:text-gray-600'}`}>寰宇</button>
                    <button type="button" onClick={() => setMapMode('custom')} className={`transition-colors pb-0.5 ${mapMode === 'custom' ? 'text-[#BA3F38] font-bold border-b border-[#BA3F38]' : 'text-gray-400 hover:text-gray-600'}`}>自定义</button>
                  </div>
                </div>
                
                <div className="bg-[#EBE7E0] p-4 rounded-xl border border-[#DEDBD5] min-h-[160px] flex flex-col justify-center transition-all">
                  
                  {/* 中国版图 */}
                  {mapMode === 'china' && (
                    <div className="china-map-grid">
                      {MAP_DATA.map((p) => (
                        <button
                          key={p.name}
                          type="button"
                          onClick={() => setForm({...form, province: p.name})}
                          style={{ gridColumn: p.x, gridRow: p.y }}
                          className={`
                            text-[10px] md:text-xs flex items-center justify-center rounded-sm transition-all duration-300
                            ${form.province === p.name 
                              ? 'bg-[#BA3F38] text-white shadow-md scale-110 z-10 font-bold' 
                              : 'bg-[#F6F4F0] text-gray-500 hover:bg-[#DEDBD5]'}
                          `}
                          title={p.name}
                        >
                          {p.name.substring(0, 1)}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* 寰宇版图 */}
                  {mapMode === 'world' && (
                    <div className="world-map-grid">
                      {WORLD_MAP_DATA.map((p) => (
                        <button
                          key={p.name}
                          type="button"
                          onClick={() => setForm({...form, province: p.name})}
                          style={{ gridColumn: p.x, gridRow: p.y }}
                          className={`
                            text-[10px] md:text-[11px] flex items-center justify-center rounded-sm transition-all duration-300
                            ${form.province === p.name 
                              ? 'bg-[#BA3F38] text-white shadow-md scale-110 z-10 font-bold' 
                              : 'bg-[#F6F4F0] text-gray-500 hover:bg-[#DEDBD5]'}
                          `}
                          title={p.name}
                        >
                          {p.name.substring(0, 2)}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* 自定义输入 */}
                  {mapMode === 'custom' && (
                    <div className="flex-1 flex flex-col items-center justify-center space-y-2 py-4">
                      <input
                        type="text"
                        value={form.province}
                        onChange={(e) => setForm({...form, province: e.target.value})}
                        placeholder="输入任意国家、星系或次元..."
                        className="w-3/4 bg-transparent border-b-2 border-[#C8C5C0] focus:border-[#BA3F38] text-center outline-none py-2 font-serif-sc text-sm transition-colors"
                      />
                      <p className="text-[10px] text-gray-400">请在上方手动输入区划名称</p>
                    </div>
                  )}

                  <div className="text-center mt-4 text-xs font-serif-sc text-[#BA3F38] font-bold">
                    当前选择：{form.province || '未指定'}
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-6 bg-[#1A1A1A] hover:bg-[#BA3F38] text-white py-3 rounded-lg flex items-center justify-center gap-2 transition-all duration-300 shadow-md font-serif-sc tracking-widest"
              >
                <Plus className="w-4 h-4" /> 刻印收藏
              </button>
            </form>
          </div>
        </section>

        {/* 右侧：票根展示区 */}
        <section className="lg:col-span-7 space-y-8">
          {quotes.map((quote) => (
            <div key={quote.id} className="relative group perspective-1000">
              
              {/* 操作按钮组：删除 & 导出图片 */}
              <div className="absolute -right-3 -top-3 z-20 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => deleteQuote(quote.id)}
                  className="bg-white p-2 rounded-full shadow-lg text-gray-400 hover:text-red-500 transition-colors"
                  title="删除语录"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => exportTicket(quote.id, quote.ticketNo)}
                  disabled={exportingId === quote.id}
                  className="bg-white p-2 rounded-full shadow-lg text-gray-400 hover:text-[#BA3F38] transition-colors disabled:opacity-50"
                  title="保存为高清图片"
                >
                  {exportingId === quote.id ? (
                    <Loader2 className="w-4 h-4 animate-spin text-[#BA3F38]" />
                  ) : (
                    <Download className="w-4 h-4" />
                  )}
                </button>
              </div>

              {/* 电影票根主体 - 扁平横向、高信息密度 */}
              <div id={`ticket-${quote.id}`} className="flex w-full min-h-[140px] bg-[#FAFAF8] shadow-[0_8px_30px_-10px_rgba(0,0,0,0.08)] rounded-sm ticket-cutout overflow-hidden border border-[#E5E5E5] transition-transform duration-500 hover:-translate-y-1 relative">
                
                {/* 左侧边缘红色装饰带 */}
                <div className="w-1.5 bg-[#BA3F38] shrink-0"></div>

                {/* 票根左侧：横排高密度信息区 */}
                <div className="flex-1 p-5 md:p-6 flex flex-col relative justify-between">
                  
                  {/* 顶部信息栏 & 装饰线 */}
                  <div className="flex justify-between items-center border-b border-[#D1D1D1] pb-2 mb-3">
                    <span className="text-[10px] font-mono text-gray-400 tracking-widest uppercase">Archive No. {quote.id}</span>
                    <span className="text-[10px] font-serif-sc text-gray-400 tracking-[0.2em]">纪元同志语录选编</span>
                  </div>
                  
                  {/* 核心语录文本（横排） */}
                  <div className="flex-1 flex items-center py-2 relative z-10">
                    <Quote className="w-5 h-5 text-[#BA3F38] opacity-30 absolute -top-2 -left-2" />
                    <p className="font-serif-sc text-lg md:text-xl leading-relaxed text-[#1A1A1A] tracking-wide pl-5 font-medium">
                      {quote.text}
                    </p>
                  </div>

                  {/* 底部信息栏 & 装饰线 */}
                  <div className="mt-4 pt-2 border-t border-[#E5E5E5] flex justify-between items-end relative z-10">
                    <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-gray-500">
                      <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5"/> {quote.date.replace(/-/g, '.')}</span>
                      <span className="flex items-center gap-1.5 text-[#BA3F38] font-serif-sc font-bold"><MapPin className="w-3.5 h-3.5"/> {quote.province}</span>
                      <span className="text-gray-400 font-sans">{quote.location || '未知'}</span>
                    </div>
                  </div>

                  {/* 背景印章与水印 */}
                  <div className="absolute right-4 bottom-4 chinese-seal text-[10px] scale-90 opacity-60 pointer-events-none select-none z-0">
                    纪元<br/>真迹
                  </div>
                  <div className="absolute left-1/2 top-1/2 -translate-y-1/2 -translate-x-1/2 opacity-[0.03] font-serif-sc text-8xl pointer-events-none select-none z-0">
                    言
                  </div>
                </div>

                {/* 票根虚线分割线 */}
                <div className="w-[1px] bg-transparent border-l-2 border-dashed border-[#D1D1D1] my-3 relative shrink-0"></div>

                {/* 票根右侧：副券 (Stub) */}
                <div className="w-24 md:w-32 bg-[#F5F4F0] p-4 flex flex-col justify-between items-center relative shrink-0">
                  
                  {/* 顶部：票号 */}
                  <div className="w-full text-center">
                    <p className="text-[8px] text-gray-400 uppercase tracking-widest mb-1">TICKET NO.</p>
                    <p className="font-mono text-xs font-bold text-[#1A1A1A] tracking-wider">{quote.ticketNo}</p>
                  </div>

                  {/* 中间：竖排装饰文字 */}
                  <div className="flex-1 flex items-center justify-center w-full my-3">
                    <div className="font-serif-sc text-[10px] text-gray-400 tracking-[0.4em] vertical-rl opacity-70">
                      · 典 藏 凭 证 ·
                    </div>
                  </div>

                  {/* 底部：装饰性横向条形码 */}
                  <div className="flex gap-[2px] h-6 w-full justify-center opacity-70">
                    {[...Array(14)].map((_, i) => (
                      <div 
                        key={i} 
                        className="bg-[#2C2C2C]" 
                        style={{ width: `${Math.random() * 3 + 1}px` }}
                      ></div>
                    ))}
                  </div>

                </div>
              </div>
            </div>
          ))}
          
          {quotes.length === 0 && (
            <div className="text-center py-20 text-gray-400 font-serif-sc tracking-widest border-2 border-dashed border-[#DEDBD5] rounded-xl">
              暂无收藏，等待新时代的语录诞生...
            </div>
          )}
        </section>

      </main>
    </div>
  );
}