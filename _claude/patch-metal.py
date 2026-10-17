"""C kararı: metal buton durağan, hareket yalnız hover/focus; hız geçişi 200 ms ramp; tek ripple."""
from pathlib import Path
A = Path(r'C:\FERRARI\01_GARAGE\01_ACTIVE_PROJECTS\qu.et\Site\assets')

bundle = A / 'liquid-metal-button.js'
c = bundle.read_text(encoding='utf-8')
reps = [
    ('s=()=>i?.setSpeed(t.matches?0:a||r?1:.6);',
     'sp=0,raf=0,s=()=>{let g=t.matches?0:a||r?1:0;cancelAnimationFrame(raf);if(t.matches){sp=0,i?.setSpeed(0);return}'
     'let t0=performance.now(),from=sp,step=now=>{let k=Math.min(1,(now-t0)/200);sp=from+(g-from)*(1-(1-k)*(1-k));i?.setSpeed(sp);'
     'k<1&&(raf=requestAnimationFrame(step))};raf=requestAnimationFrame(step)};'),
    ('void 0,t.matches?0:.6,1200', 'void 0,0,1200'),
    ('i?.setSpeed(2.4),clearTimeout(n)', 'cancelAnimationFrame(raf),sp=2.4,i?.setSpeed(2.4),clearTimeout(n)'),
    ('o.append(l)', 'o.querySelectorAll(".liquid-metal-ripple").forEach(x=>x.remove()),o.append(l)'),
    ('c.persisted||(clearTimeout(n),', 'c.persisted||(clearTimeout(n),cancelAnimationFrame(raf),'),
]
for old, new in reps:
    assert c.count(old) == 1, old
    c = c.replace(old, new)
bundle.write_text(c, encoding='utf-8', newline='\n')

src = A / 'liquid-metal-button.source.js'
s = src.read_text(encoding='utf-8')
sreps = [
    ("  let focused = false;\n  const syncSpeed = () => shader?.setSpeed(motion.matches ? 0 : (hovered || focused ? 1 : 0.6));",
     "  let focused = false;\n  // qu/et C kararı (16 Ekim): durağan doku; hareket yalnız hover/focus, 200 ms ease-out ramp.\n"
     "  let speed = 0;\n  let raf = 0;\n  const syncSpeed = () => {\n    const target = motion.matches ? 0 : (hovered || focused ? 1 : 0);\n"
     "    cancelAnimationFrame(raf);\n    if (motion.matches) { speed = 0; shader?.setSpeed(0); return; }\n"
     "    const start = performance.now(), from = speed;\n    const step = (now) => {\n      const k = Math.min(1, (now - start) / 200);\n"
     "      speed = from + (target - from) * (1 - (1 - k) * (1 - k));\n      shader?.setSpeed(speed);\n      if (k < 1) raf = requestAnimationFrame(step);\n    };\n"
     "    raf = requestAnimationFrame(step);\n  };"),
    ("}, undefined, motion.matches ? 0 : 0.6, 1200", "}, undefined, 0, 1200"),
    ("    shader?.setSpeed(2.4);", "    cancelAnimationFrame(raf);\n    speed = 2.4;\n    shader?.setSpeed(2.4);"),
    ("    button.append(ripple);", "    button.querySelectorAll('.liquid-metal-ripple').forEach((old) => old.remove());\n    button.append(ripple);"),
    ("    clearTimeout(pulse);\n    motion.removeEventListener", "    clearTimeout(pulse);\n    cancelAnimationFrame(raf);\n    motion.removeEventListener"),
]
for old, new in sreps:
    assert s.count(old) == 1, old
    s = s.replace(old, new)
src.write_text(s, encoding='utf-8', newline='\n')
print('metal patched')
