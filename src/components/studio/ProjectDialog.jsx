import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { House, Building2, Blocks, Plus, FolderOpen, Loader2 } from 'lucide-react';
import { newProject } from '@/components/studio/designData';

export default function ProjectDialog({
  mode,
  onClose,
  onLoad,
  dirty,
  fetchProjects // API取得関数を外部から注入できるように追加
}) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState('一軒家');
  const [blank, setBlank] = useState(false);

  // プロジェクト一覧の取得（Base44の代替）
  useEffect(() => {
    if (mode === 'open') {
      let isMounted = true;
      setLoading(true);

      const loadProjects = async () => {
        try {
          if (fetchProjects) {
            const data = await fetchProjects();
            if (isMounted) setProjects(data);
          } else {
            // fetchProjectsが渡されなかった場合のダミーデータ（開発用）
            const dummyData = [
              { id: '1', name: 'サンプル邸', building_type: '一軒家', floors: [1, 2], updated_date: new Date().toISOString() },
              { id: '2', name: 'テストマンション', building_type: 'マンション', floors: [1], updated_date: new Date().toISOString() }
            ];
            // 擬似的なネットワーク遅延
            await new Promise(resolve => setTimeout(resolve, 800));
            if (isMounted) setProjects(dummyData);
          }
        } catch (error) {
          console.error('プロジェクトの取得に失敗しました:', error);
        } finally {
          if (isMounted) setLoading(false);
        }
      };

      loadProjects();

      return () => {
        isMounted = false;
      };
    }
  }, [mode, fetchProjects]);

  // プロジェクトを読み込む際の未保存確認
  const handleLoad = (project) => {
    if (dirty && !window.confirm('未保存の変更を破棄して開きますか？')) {
      return;
    }
    onLoad(project);
    onClose();
  };

  // フォーム送信（新規作成）
  const handleSubmit = (e) => {
    e.preventDefault();
    const p = newProject(type, blank);
    if (name.trim()) {
      p.name = name.trim();
    }
    handleLoad(p);
  };

  const buildingTypes = [
    { label: '一軒家', Icon: House },
    { label: 'マンション', Icon: Building2 },
    { label: 'ビル', Icon: Blocks },
  ];

  return (
    <Dialog open={!!mode} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-xl">
        <DialogTitle className="text-[#2c4437]">
          {mode === 'new' ? '新しい空間をつくる' : 'プロジェクトを開く'}
        </DialogTitle>

        <DialogDescription>
          {mode === 'new'
            ? '建物の種類を選んで、設計をはじめましょう。'
            : '保存したプロジェクトから設計を再開します。'}
        </DialogDescription>

        {mode === 'new' ? (
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-3 gap-3 my-5">
              {buildingTypes.map(({ label, Icon }) => (
                <button
                  type="button"
                  key={label}
                  onClick={() => setType(label)}
                  className={`border rounded-xl py-6 flex flex-col items-center gap-3 text-xs transition-colors ${type === label
                      ? 'border-[#76917b] bg-[#edf2e8] text-[#375c50]'
                      : 'text-stone-500 hover:bg-stone-50'
                    }`}
                >
                  <Icon size={26} strokeWidth={1.3} />
                  {label}
                </button>
              ))}
            </div>

            <label className="text-xs text-stone-500 block mb-4">
              プロジェクト名
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="新しいプロジェクト"
                className="w-full border rounded-lg p-3 mt-2 outline-none focus:border-[#76917b] transition-colors"
              />
            </label>

            <label className="flex items-center gap-2 text-xs text-stone-500 mb-6 cursor-pointer">
              <input
                type="checkbox"
                checked={blank}
                onChange={(e) => setBlank(e.target.checked)}
                className="accent-[#375c50]"
              />
              テンプレートを使わず、白紙から始める
            </label>

            <button
              type="submit"
              className="bg-[#375c50] hover:bg-[#2c4437] text-white w-full py-3 rounded-lg text-sm flex justify-center items-center gap-2 transition-colors"
            >
              <Plus size={17} />
              設計をはじめる
            </button>
          </form>
        ) : (
          <div className="max-h-80 overflow-y-auto pr-2">
            {loading ? (
              <div className="py-10 flex justify-center">
                <Loader2 className="animate-spin text-stone-400" />
              </div>
            ) : projects.length > 0 ? (
              projects.map((p) => (
                <button
                  key={p.id}
                  onClick={() => handleLoad(p)}
                  className="flex w-full items-center gap-3 border rounded-lg p-4 mt-3 hover:bg-[#f3f6ef] transition-colors text-left group"
                >
                  <FolderOpen size={20} className="text-[#66846a]" />
                  <div className="text-sm">
                    {p.name}
                    <p className="text-[11px] text-stone-400 mt-1">
                      {p.building_type} · {p.floors.length} 階 · {new Date(p.updated_date).toLocaleDateString('ja-JP')}
                    </p>
                  </div>
                  <span className="ml-auto text-stone-300 group-hover:text-[#66846a] transition-colors">
                    →
                  </span>
                </button>
              ))
            ) : (
              <p className="text-center text-sm text-stone-400 py-10">
                まだ保存したプロジェクトがありません。<br />
                編集画面の「保存」で追加できます。
              </p>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}