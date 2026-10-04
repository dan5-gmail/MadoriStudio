import { useRef, useState } from 'react';
import { newProject, uid } from '@/components/studio/designData';

export default function useStudio(onSave) {
  const [project, setProject] = useState(() => newProject()),
    [floorId, setFloorId] = useState(null),
    [selected, setSelected] = useState(null),
    [tool, setTool] = useState('select'),
    [past, setPast] = useState([]),
    [future, setFuture] = useState([]),
    [dirty, setDirty] = useState(false),
    [saving, setSaving] = useState(false),
    [message, setMessage] = useState(''),
    [error, setError] = useState('');

  const clipboard = useRef(null), pasteCount = useRef(0);
  const floor = project.floors.find(f => f.id === floorId) || project.floors[0];

  const commit = p => {
    setPast(a => [...a.slice(-49), project]);
    setFuture([]);
    setProject(p);
    setDirty(true);
    setMessage('');
  };

  const changeElements = elements => commit({
    ...project,
    floors: project.floors.map(f => f.id === floor.id ? { ...f, elements } : f)
  });

  const updateElement = (id, patch) => changeElements(floor.elements.map(e => e.id === id ? { ...e, ...patch } : e));
  const remove = () => { changeElements(floor.elements.filter(e => e.id !== selected)); setSelected(null); };

  const duplicate = () => {
    const e = floor.elements.find(e => e.id === selected);
    if (e) {
      const copy = { ...e, id: uid(), x: e.x + 0.3, y: e.y + 0.3 };
      changeElements([...floor.elements, copy]);
      setSelected(copy.id);
    }
  };

  const copy = () => {
    const e = floor.elements.find(e => e.id === selected);
    if (!e) return false;
    clipboard.current = { ...e };
    pasteCount.current = 0;
    return true;
  };

  const paste = () => {
    if (!clipboard.current) return false;
    const e = clipboard.current,
      offset = 0.3 * ++pasteCount.current,
      item = { ...e, id: uid(), x: Number((e.x + offset).toFixed(8)), y: Number((e.y + offset).toFixed(8)) };
    changeElements([...floor.elements, item]);
    setSelected(item.id);
    setTool('select');
    return true;
  };

  const undo = () => {
    if (past.length) {
      setFuture(a => [project, ...a]);
      setProject(past[past.length - 1]);
      setPast(a => a.slice(0, -1));
      setDirty(true);
      setMessage('');
      setSelected(null);
    }
  };

  const redo = () => {
    if (future.length) {
      setPast(a => [...a, project]);
      setProject(future[0]);
      setFuture(a => a.slice(1));
      setDirty(true);
      setMessage('');
      setSelected(null);
    }
  };

  const load = p => {
    setProject(p);
    setFloorId(p.floors[0].id);
    setSelected(null);
    setPast([]);
    setFuture([]);
    setDirty(!p.id);
    setMessage('');
  };

  // 保存処理の外部委譲（引数として渡された onSave を実行、なければダミー動作）
  const save = async () => {
    setSaving(true);
    setError('');
    try {
      if (onSave) {
        const saved = await onSave(project);
        if (saved?.id) {
          setProject(p => ({ ...p, id: saved.id }));
        }
      }
      setDirty(false);
      setMessage('保存しました');
    } catch (e) {
      setError('保存できませんでした。' + e.message);
    } finally {
      setSaving(false);
    }
  };

  const addFloor = () => {
    const f = { id: uid(), name: `${project.floors.length + 1}F`, height: 2.7, elements: [] };
    commit({ ...project, floors: [...project.floors, f] });
    setFloorId(f.id);
    setSelected(null);
  };

  const copyFloor = () => {
    const f = { ...floor, id: uid(), name: `${project.floors.length + 1}F`, elements: floor.elements.map(e => ({ ...e, id: uid() })) };
    commit({ ...project, floors: [...project.floors, f] });
    setFloorId(f.id);
    setSelected(null);
  };

  const deleteFloor = () => {
    if (project.floors.length > 1) {
      commit({ ...project, floors: project.floors.filter(f => f.id !== floor.id) });
      setFloorId(project.floors.find(f => f.id !== floor.id).id);
      setSelected(null);
    }
  };

  return {
    project, floor, selected, setSelected, tool, setTool,
    commit, changeElements, updateElement, remove, duplicate,
    copy, paste, undo, redo,
    canUndo: past.length > 0, canRedo: future.length > 0,
    load, save, dirty, saving, message, error,
    addFloor, copyFloor, deleteFloor, setFloorId
  };
}