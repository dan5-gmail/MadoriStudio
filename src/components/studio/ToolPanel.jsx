import React from 'react';
import { MousePointer2, Square, Minus, DoorOpen, PanelTop, Columns3, Footprints, Armchair, Plus, Layers, Copy, Trash2, LogOut } from 'lucide-react';
import { tools } from '@/components/studio/designData';

const icons = { MousePointer2, Square, Minus, DoorOpen, PanelTop, Columns3, Footprints, Armchair };

export default function ToolPanel({ s, onLogout }) {
  return (
    <aside className="w-[208px] bg-[#fff] border-r shrink-0 flex flex-col max-lg:w-[164px] max-md:w-[66px]">
      <div className="p-5 pb-3 max-md:p-3">
        <p className="text-[10px] text-[#99a196] tracking-[0.18em] mb-4 max-md:hidden">DESIGN TOOLS</p>
        <h2 className="text-xs font-semibold mb-4 max-md:hidden">空間をつくる</h2>
        <div className="grid grid-cols-2 gap-2 max-md:grid-cols-1">
          {tools.map(t => {
            const Icon = icons[t.icon];
            return (
              <button
                key={t.id}
                title={t.name}
                onClick={() => { s.setTool(t.id); s.setSelected(null); }}
                className={`flex flex-col items-center justify-center gap-2 py-3 rounded-lg text-[11px] border transition ${s.tool === t.id ? 'bg-[#eaf0e9] border-[#b1c5b4] text-[#3c6752]' : 'border-[#eeefea] text-[#6f786f] hover:bg-[#f7f8f4]'
                  }`}
              >
                <Icon size={19} strokeWidth={1.5} />
                <span className="max-md:hidden">{t.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="p-5 border-t mt-5 max-md:p-2">
        <div className="flex justify-between items-center mb-4">
          <span className="text-xs font-semibold max-md:hidden">フロア</span>
          <button onClick={s.addFloor} title="階を追加" className="text-stone-500">
            <Plus size={16} />
          </button>
        </div>
        {s.project.floors.map(f => (
          <button
            key={f.id}
            onClick={() => { s.setFloorId(f.id); s.setSelected(null); }}
            className={`w-full flex items-center gap-3 text-xs rounded-md py-3 px-3 mb-1 max-md:px-1 ${s.floor.id === f.id ? 'bg-[#f0f3ec] text-[#416450]' : 'text-stone-500'
              }`}
          >
            <Layers size={15} />
            {f.name}
            <span className="ml-auto text-[9px] max-md:hidden">
              {f.elements.filter(e => e.type === 'room').length} 室
            </span>
          </button>
        ))}
        <div className="flex gap-4 text-stone-400 mt-3 max-md:hidden">
          <button title="この階を複製" onClick={s.copyFloor}>
            <Copy size={13} />
          </button>
          <button
            title="この階を削除"
            disabled={s.project.floors.length === 1}
            onClick={() => window.confirm('この階を削除しますか？') && s.deleteFloor()}
            className="disabled:opacity-30"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      <div className="mt-auto p-5 max-md:p-3 border-t">
        <div className="max-md:hidden text-[10px] text-stone-400 leading-relaxed mb-3">
          アイデアを図面に。<br />あなたの設計ワークスペース。
        </div>
        <button
          onClick={onLogout}
          className="flex items-center gap-2 text-[10px] text-stone-400 hover:text-stone-600 transition"
        >
          <LogOut size={14} />
          <span className="max-md:hidden">ログアウト</span>
        </button>
      </div>
    </aside>
  );
}