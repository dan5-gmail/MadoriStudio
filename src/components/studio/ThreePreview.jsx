import React, { useEffect, useRef } from 'react';
import { createRig } from '@/components/studio/threeRig';
import { floorBase, rebuildModel } from '@/components/studio/threeGeometry';
import useThreeGestures from '@/components/studio/useThreeGestures';
export default function ThreePreview({ s, snap, grid, dimensions, zoom, fitKey }) {
    const host = useRef(null), rig = useRef(null), state = useRef({ s, snap }), previousZoom = useRef(zoom); state.current = { s, snap };
    useEffect(() => { rig.current = createRig(host.current); return () => rig.current.dispose(); }, []);
    useThreeGestures(rig, state);
    useEffect(() => { rebuildModel(rig.current.model, s.project, s.floor.id, s.selected, dimensions); }, [s.project, s.floor.id, s.selected, dimensions]);
    useEffect(() => { const base = floorBase(s.project, s.floor.id); rig.current.grid.position.y = base - 0.07; rig.current.fit(s.floor, base, zoom); previousZoom.current = zoom; }, [s.floor.id, fitKey]);
    useEffect(() => { rig.current.grid.visible = grid; }, [grid]);
    useEffect(() => { const r = rig.current, ratio = previousZoom.current / zoom; r.camera.position.sub(r.controls.target).multiplyScalar(ratio).add(r.controls.target); r.controls.update(); previousZoom.current = zoom; }, [zoom]);
    useEffect(() => { host.current.style.cursor = s.tool === 'pan' ? 'grab' : s.tool === 'select' ? 'default' : 'crosshair'; }, [s.tool]);
    const instruction = s.tool === 'pan' ? 'ドラッグで視点を回転 · 右ドラッグで平行移動' : s.tool === 'select' ? '要素をクリックで選択・ドラッグで移動 · 空白をドラッグで回転' : ['room', 'wall'].includes(s.tool) ? '床の上をドラッグして、部屋・壁を立体で描画' : '床の上をクリックして配置';
    return <div className="absolute inset-0"><div ref={host} className="w-full h-full touch-none" /><div className="absolute top-3 left-4 rounded-lg bg-white/90 px-3 py-2 text-[10px] text-muted-foreground pointer-events-none">{s.floor.name} を編集中 · 他の階は半透明で表示</div><div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-xl bg-white/95 border px-4 py-2.5 text-[10px] text-stone-500 shadow-sm text-center max-w-[94%] w-max pointer-events-none">{instruction}<br /><span className="text-stone-400">スクロール / ピンチでズーム · Ctrl+C / Ctrl+V でコピー・貼り付け · 高さ・回転はプロパティで調整</span></div></div>;
}