"""revE (16 Ekim 19:56 geri bildirimi): sade footer, ürün hikâyeleri."""
from pathlib import Path
F = Path(r'C:\FERRARI\01_GARAGE\01_ACTIVE_PROJECTS\qu.et\Site\tools\build-pages.py')
c = F.read_text(encoding='utf-8')
def rep(old, new):
    global c
    assert c.count(old) == 1, old[:90]
    c = c.replace(old, new)

# Footer: one quiet row (links · two city clocks · year), then the wordmark. No repeated place names or logo.
s = c.index("def footer():"); e = c.index("def dialogs():")
c = c[:s] + '''def footer():
    return f\'\'\'<footer class="site-footer"><div class="shell">
  <div class="footer-row">
    <nav class="footer-links" aria-label="Alt menü"><a href="koleksiyon.html">Koleksiyon</a><a href="hakkimizda.html">Hakkında</a><a href="hakkimizda.html#studio">Stüdyo</a></nav>
    <div class="place-times"><span>İstanbul <time data-clock="Europe/Istanbul"></time></span><span>Hong Kong <time data-clock="Asia/Hong_Kong"></time></span></div>
    <span class="footer-copy">© 2026</span>
  </div>
</div><svg class="footer-wordmark" viewBox="0 0 900 300" aria-hidden="true" focusable="false"><text x="0" y="292">qu<tspan class="slash">/</tspan>et</text></svg></footer>\'\'\'

''' + c[e:]

# Product stories (Claude draft, Eren to edit): the place behind each name, then the line from skin to silver.
rep("""'copy':'İnce bir çizgi. Çizginin ucunda küçük bir figür.'""",
    """'copy':"Victoria Peak, Hong Kong Adası'nın en yüksek noktası. Şehir aşağıda kalır; bir çizgiye tek koluyla tutunan küçük bir figür yukarıda. Önce Pınar'ın çiziminde tendeydi, şimdi gümüşte.\"""")
rep("""'copy':'İki hat arasında küçük bir durak.'""",
    """'copy':"Mid-Levels, şehirle tepe arasındaki yamaç; merkezi yukarıya bağlayan uzun yürüyen merdiven buradan geçer. Yüzükteki iki hat o yolun iki kıyısı, aradaki figür yarı yolda durup soluklanan biri.\"""")
F.write_text(c, encoding='utf-8', newline='\n')
print('revE patched')
