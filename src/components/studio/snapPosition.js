const THRESHOLD = 0.2;
const dot = (a, b) => a.x * b.x + a.y * b.y;
const axes = e => { const r = (e.rotation || 0) * Math.PI / 180; return [{ x: Math.cos(r), y: Math.sin(r) }, { x: -Math.sin(r), y: Math.cos(r) }]; };
const interval = (e, axis) => {
    const own = axes(e), center = dot({ x: e.x + e.w / 2, y: e.y + e.h / 2 }, axis);
    const radius = Math.abs(dot(own[0], axis)) * e.w / 2 + Math.abs(dot(own[1], axis)) * e.h / 2;
    return [center - radius, center + radius];
};
const nearest = values => values.filter(v => Math.abs(v) <= THRESHOLD + 1e-8).sort((a, b) => Math.abs(a) - Math.abs(b))[0];
export default function snapPosition(element, elements, enabled = true) {
    if (!enabled) return { x: element.x, y: element.y };
    let best = null;
    for (const other of elements) {
        if (other.id === element.id) continue;
        const angle = ((element.rotation || 0) - (other.rotation || 0)) * Math.PI / 180;
        if (Math.abs(Math.sin(angle * 2)) > 1e-6) continue;
        const basis = axes(other), a = basis.map(axis => interval(element, axis)), b = basis.map(axis => interval(other, axis));
        const inside = other.type === 'room' && element.type !== 'room' && a.every(([lo, hi], i) => (lo + hi) / 2 >= b[i][0] && (lo + hi) / 2 <= b[i][1]);
        for (let i = 0; i < 2; i++) {
            const j = 1 - i, gap = Math.max(b[j][0] - a[j][1], a[j][0] - b[j][1], 0);
            if (gap > THRESHOLD) continue;
            const contact = nearest(inside ? [b[i][0] - a[i][0], b[i][1] - a[i][1]] : [b[i][0] - a[i][1], b[i][1] - a[i][0]]);
            if (contact === undefined) continue;
            const along = nearest(gap > 0 ? [b[j][0] - a[j][1], b[j][1] - a[j][0]] : [b[j][0] - a[j][0], b[j][1] - a[j][1]]) ?? 0;
            const dx = basis[i].x * contact + basis[j].x * along, dy = basis[i].y * contact + basis[j].y * along;
            const score = Math.hypot(dx, dy);
            if (!best || score < best.score) best = { dx, dy, score };
        }
    }
    return best ? { x: Number((element.x + best.dx).toFixed(8)), y: Number((element.y + best.dy).toFixed(8)) } : { x: element.x, y: element.y };
}