//@ts-nocheck
import React, { useEffect, useRef, useState } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { House, Building2, Blocks, Plus, FolderOpen, Loader2, Download, Upload } from 'lucide-react';
import { newProject, downloadJson, normalizeProject } from '@/components/studio/designData';

export default function ProjectDialog({ mode, onClose, onLoad, dirty }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState('一軒家');
  const [blank, setBlank] = useState(false);
  const [importing, setImporting] = useState(false);
  const fileRef = useRef(null);

  // ローカルストレージなどからプロジェクト一覧を読み込む場合のサンプル実装
  const loadProjects = () => {
    setLoading(true);
    try {
      const savedProjects = JSON.parse(localStorage.getItem('madori_projects') || '[]');
      setProjects(savedProjects);
    } catch {
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (mode === 'open') loadProjects();
  }, [mode]);

  const load = (p) => {
    if (dirty && !window.confirm('未保存の変更を破棄して開きますか？')) return;
    onLoad(p);
    onClose();
  };

  const exportOne = (p) => downloadJson(p, (p.name || 'project').replace(/[\\/:*?"<>|]/g, '_') + '_backup.json');

  const exportAll = () => downloadJson({
    app: 'madori studio',
    exported_at: new Date().toISOString(),
    projects
  }, `madori_backup_${new Date().toISOString().slice(0, 10)}.json`);

  const importFile = async (file) => {
    if (!file) return;
    setImporting(true);
    try {
      const data = JSON.parse(await file.text());
      const list = Array.isArray(data?.projects) ? data.projects : [data];
      const rows = list.map(normalizeProject).filter(Boolean);
      if (!rows.length) throw new Error('empty');

      // 必要に応じてローカルストレージに保存する処理などをここに記述
      setProjects((a) => [...rows, ...a]);
      load(rows[0]);
    } catch {
      window.alert('読み込めないファイルです。このアプリの「バックアップ」で書き出した JSON を選んでください。');
    } finally {
      setImporting(false);
    }
  };

  return (
    <Dialog open={!!mode} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-xl">
        <DialogTitle className="text-[#2c4437]">
          {mode === 'new' ? '新しい空間をつくる' : 'プロジェクトを開く'}
        </DialogTitle>
        <DialogDescription>
          {mode === 'new' ? '建物の種類を選んで、設計をはじめましょう。' : '保存したプロジェクトから設計を再開します。'}
        </DialogDescription>

        {mode === 'new' ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const p = newProject(type, blank);
              if (name.trim()) p.name = name.trim();
              load(p);
            }}
          >
            <div className="grid grid-cols-3 gap-3 my-5">
              {[
                ['一軒家', House],
                ['マンション', Building2],
                ['ビル', Blocks],
              ].map(([t, Icon]) => (
                <button
                  type="button"
                  key={t}
                  onClick={() => setType(t)}
                  className={`border rounded-xl py-6 flex flex-col items-center gap-3 text-xs ${type === t
                      ? 'border-[#76917b] bg-[#edf2e8] text-[#375c50]'
                      : 'text-stone-500'
                    }`}
                >
                  <Icon size={26} strokeWidth={1.3} />
                  {t}
                </button>
              ))}
            </div>
            <label className="text-xs text-stone-500">
              プロジェクト名
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="新しいプロジェクト"
                className="w-full border rounded-lg p-3 mt-2 mb-4"
              />
            </label>
            <label className="flex items-center gap-2 text-xs text-stone-500 mb-6">
              <input
                type="checkbox"
                checked={blank}
                onChange={(e) => setBlank(e.target.checked)}
              />
              テンプレートを使わず、白紙から始める
            </label>
            <button
              type="submit"
              className="bg-[#375c50] text-white w-full py-3 rounded-lg text-sm flex justify-center gap-2"
            >
              <Plus size={17} />
              設計をはじめる
            </button>
          </form>
        ) : (
          <div>
            <div className="max-h-80 overflow-y-auto">
              {loading ? (
                <div className="py-10 flex justify-center">
                  <Loader2 className="animate-spin text-stone-400" />
                </div>
              ) : projects.length ? (
                projects.map((p) => (
                  <div
                    key={p.id || p.name}
                    className="flex items-center gap-3 border rounded-lg p-4 mt-3 hover:bg-[#f3f6ef] text-left"
                  >
                    <button
                      onClick={() => load(p)}
                      className="flex flex-1 items-center gap-3 min-w-0 text-left"
                    >
                      <FolderOpen size={20} className="text-[#66846a] shrink-0" />
                      <div className="text-sm min-w-0">
                        {p.name}
                        <p className="text-[11px] text-stone-400 mt-1">
                          {p.building_type} · {p.floors?.length || 0} 階 ·{' '}
                          {p.updated_date ? new Date(p.updated_date).toLocaleDateString('ja-JP') : ''}
                        </p>
                      </div>
                    </button>
                    <button
                      title="このプロジェクトをバックアップ（JSON）"
                      onClick={() => exportOne(p)}
                      className="p-2 text-stone-400 hover:text-[#375c50] hover:bg-[#edf2e8] rounded-lg shrink-0"
                    >
                      <Download size={16} />
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-center text-sm text-stone-400 py-10">
                  まだ保存したプロジェクトがありません。<br />
                  編集画面の「保存」で追加できます。
                </p>
              )}
            </div>
            <div className="flex gap-2 mt-5 pt-4 border-t">
              <button
                onClick={exportAll}
                disabled={loading || !projects.length || importing}
                className="flex-1 text-xs border border-[#c8d5cc] text-[#536b5d] rounded-lg px-3 py-2.5 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Download size={15} />
                全プロジェクトをバックアップ
              </button>
              <button
                onClick={() => fileRef.current?.click()}
                disabled={importing}
                className="flex-1 text-xs bg-[#375c50] text-white rounded-lg px-3 py-2.5 flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {importing ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />}
                バックアップから読み込む
              </button>
              <input
                ref={fileRef}
                type="file"
                accept=".json,application/json"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  e.target.value = '';
                  importFile(f);
                }}
              />
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}