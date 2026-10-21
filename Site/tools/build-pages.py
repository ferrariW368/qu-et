from pathlib import Path
from html import escape
import re
from PIL import Image

# revS (17 Oct): bilingual build. English is the default at the root, Turkish lives under /tr/.
# Pages are written as directory URLs (/peak/index.html) so Cloudflare Pages serves /peak/ with no redirect,
# and every asset path is absolute because pages now sit at two depths.
SITE = Path(__file__).resolve().parents[1]

# revS2 (17 Oct, Eren): the full shopping flow stays visible (product → bag → details → payment step).
# Payment will be Shopier (SİTE 04); until it is wired, the last step is a disabled "Pay with Shopier" button.

ROUTES = {
    'en': {'home': '/', 'collection': '/collection/', 'about': '/about/', 'peak': '/peak/', 'mid-levels': '/mid-levels/', 'bag': '/bag/', 'checkout': '/checkout/', 'privacy': '/privacy/'},
    'tr': {'home': '/tr/', 'collection': '/tr/koleksiyon/', 'about': '/tr/hakkimizda/', 'peak': '/tr/peak/', 'mid-levels': '/tr/mid-levels/', 'bag': '/tr/sepet/', 'checkout': '/tr/siparis/', 'privacy': '/tr/kvkk/'},
}

# revW (20 Oct): absolute origin for OG tags, robots.txt and sitemap.xml. Domain not chosen yet (SİTE 04/09):
# change this one line when it is, then rebuild + make-dist.
SITE_URL = 'https://qu-et.pages.dev'
OG_LOCALE = {'en': 'en_US', 'tr': 'tr_TR'}

# Copy: TR as approved; EN drafted 17 Oct (_claude/metin-en-taslak.md), awaiting Eren's approval.
T = {}
T['tr'] = {
  'skip': 'İçeriğe geç', 'home_aria': 'qu/et ana sayfa', 'main_menu': 'Ana menü', 'collection': 'Koleksiyon', 'about': 'Hakkında',
  'footer_menu': 'Alt menü', 'studio': 'Stüdyo', 'email': 'E-posta', 'istanbul': 'İstanbul',
  'switch_label': 'EN', 'switch_lang': 'en',
  'product_image': 'Ürün görseli', 'close_image': 'Görseli kapat',
  'home_meta': 'Pınar’ın çizgilerinden doğan gümüş takılar. Hong Kong koleksiyonunu keşfet.',
  'band_alt': 'Hong Kong manzarası önünde Peak küpe', 'explore_collection': 'Koleksiyonu keşfet',
  'explore': 'Keşfet', 'explore_aria': '{name} ürününü keşfet', 'first_paper': 'Önce çizimde', 'first_skin': 'Önce tende',
  'earring': 'Küpe', 'ring': 'Yüzük',
  'drawings_title': "Pınar'ın Hong Kong çizimleri",
  'strip_alt': "Pınar'ın Hong Kong flash sheet'inden üç çizim: 07 Up, merdivenin tepesinde duran bir figür; 08 Levels, üst üste üç çizgi ve en üsttekinde bir figür; 09 Look up, uzun bir çizginin dibinde yürüyen bir figür",
  'about_link': 'Hakkımızda', 'limited': 'Sınırlı üretim', 'collection_aria': 'Koleksiyondaki ürünler',
  'silver_alt': '{name} {kind}, gümüş', 'launch': 'Hong Kong lansmanı · 8 Kasım 2026', 'about_quet': 'qu/et hakkında',
  'collection_meta': 'Hong Kong koleksiyonu. Peak küpe ve Mid-Levels yüzük.',
  'about_title': 'Hakkımızda', 'about_meta': 'qu/et ve Pınar’ın çizgiyle kurduğu ilişki. İstanbul’dan gümüşe uzanan bir tasarım dili.',
  'portrait_alt': 'Pınar, çalışma masasında bir çizim defterini inceliyor', 'quote_footer': 'Pınar — Studio FIYN, İstanbul',
  'sheets_title': 'Hong Kong çizimleri',
  'sheet1_alt': "Hong Kong flash sheet, birinci sayfa: 01 Open end'den 09 Look up'a dokuz ince çizgi tasarım",
  'sheet2_alt': "Hong Kong flash sheet, ikinci sayfa: 10 A way through'dan 15 Elsewhere'e altı tasarım ve 'Reducing things to their simplest form' notu",
  'studio_place': 'Studio FIYN, Nişantaşı / İstanbul.', 'insta': "Instagram'da Pınar",
  'gallery_aria': '{name} görselleri', 'worn_alt': '{name} {kind}, takılı görünüm', 'skin_alt': "{name}, Pınar'ın çizimi tende", 'enlarge': '{alt}, büyüt',
  'sample_price': 'Örnek fiyat', 'preorder_date': 'Ön sipariş · 8 Kasım 2026', 'preorder': 'Ön sipariş', 'preorder_closed': "Ön sipariş 8 Kasım'da açılıyor",
  'material': 'Malzeme', 'material_text': '925 ayar gümüş, kaplamasız.', 'size': 'Ölçü', 'size_text': 'Kesin ölçüler ön sipariş açılışında paylaşılacak.',
  'delivery': 'Ön sipariş ve teslim', 'delivery_text': "Ön siparişler 8 Kasım 2026'da açılacak. Üretim süresi, gönderim seçenekleri ve teslim takvimi sipariş öncesinde paylaşılacak.",
  'same_collection': 'Aynı koleksiyondan', 'related_alt': '{name}, gümüş',
  'product_meta': '{name} · Hong Kong koleksiyonu. Gümüş {kind}. Ön sipariş 8 Kasım 2026.',
  'story_peak': "Victoria Peak, Hong Kong Adası'nın en yüksek noktası. Şehir aşağıda kalır; bir çizgiye tek koluyla tutunan küçük bir figür yukarıda. Önce Pınar'ın çiziminde tendeydi, şimdi gümüşte.",
  'story_mid-levels': "Mid-Levels, şehirle tepe arasındaki yamaç; merkezi yukarıya bağlayan uzun yürüyen merdiven buradan geçer. Yüzükteki iki hat o yolun iki kıyısı, aradaki figür yarı yolda durup soluklanan biri.",
  'nf_title': 'Sayfa bulunamadı', 'nf_text': 'Burada bir şey yok.', 'nf_meta': 'Aradığın sayfa bulunamadı.',
}
T['en'] = {
  'skip': 'Skip to content', 'home_aria': 'qu/et home', 'main_menu': 'Main menu', 'collection': 'Collection', 'about': 'About',
  'footer_menu': 'Footer menu', 'studio': 'Studio', 'email': 'Email', 'istanbul': 'Istanbul',
  'switch_label': 'TR', 'switch_lang': 'tr',
  'product_image': 'Product image', 'close_image': 'Close image',
  'home_meta': "Silver jewellery born from Pınar's lines. Explore the Hong Kong collection.",
  'band_alt': 'Peak earring against the Hong Kong skyline', 'explore_collection': 'Explore the collection',
  'explore': 'Explore', 'explore_aria': 'Explore {name}', 'first_paper': 'First on paper', 'first_skin': 'First on skin',
  'earring': 'Earring', 'ring': 'Ring',
  'drawings_title': "Pınar's Hong Kong drawings",
  'strip_alt': "Three drawings from Pınar's Hong Kong flash sheet: 07 Up, a figure standing at the top of a staircase; 08 Levels, three stacked lines with a figure on the highest; 09 Look up, a figure walking at the foot of a long line",
  'about_link': 'About', 'limited': 'Limited edition', 'collection_aria': 'Pieces in the collection',
  'silver_alt': '{name} {kind}, silver', 'launch': 'Hong Kong launch · 8 November 2026', 'about_quet': 'About qu/et',
  'collection_meta': 'The Hong Kong collection. Peak earring and Mid-Levels ring.',
  'about_title': 'About', 'about_meta': "qu/et and Pınar's relationship with the line. A design language that runs from Istanbul to silver.",
  'portrait_alt': 'Pınar at her desk, looking through a sketchbook', 'quote_footer': 'Pınar — Studio FIYN, Istanbul',
  'sheets_title': 'Hong Kong drawings',
  'sheet1_alt': 'Hong Kong flash sheet, page one: nine fine-line designs, from 01 Open end to 09 Look up',
  'sheet2_alt': "Hong Kong flash sheet, page two: six designs, from 10 A way through to 15 Elsewhere, with the note 'Reducing things to their simplest form'",
  'studio_place': 'Studio FIYN, Nişantaşı / Istanbul.', 'insta': 'Pınar on Instagram',
  'gallery_aria': '{name} images', 'worn_alt': '{name} {kind}, worn', 'skin_alt': "{name}, Pınar's drawing on skin", 'enlarge': '{alt}, enlarge',
  'sample_price': 'Sample price', 'preorder_date': 'Pre-order · 8 November 2026', 'preorder': 'Pre-order', 'preorder_closed': 'Pre-orders open 8 November',
  'material': 'Material', 'material_text': '925 sterling silver, unplated.', 'size': 'Size', 'size_text': 'Exact dimensions will be shared when pre-orders open.',
  'delivery': 'Pre-order and delivery', 'delivery_text': 'Pre-orders open on 8 November 2026. Production time, shipping options and delivery dates will be shared before you order.',
  'same_collection': 'From the same collection', 'related_alt': '{name}, silver',
  'product_meta': '{name} · Hong Kong collection. Silver {kind}. Pre-order 8 November 2026.',
  'story_peak': "Victoria Peak is the highest point on Hong Kong Island. The city stays below; above it, a small figure holds on to a line with one arm. First it was Pınar's drawing on skin. Now it is silver.",
  'story_mid-levels': "Mid-Levels is the slope between the city and the Peak; the long escalator that carries Central uphill runs through it. The ring's two lines are the two edges of that path, and the figure between them is someone pausing halfway to catch their breath.",
  'nf_title': 'Not found', 'nf_text': 'Nothing here.', 'nf_meta': 'This page does not exist.',
}

# revS2: bag + checkout copy. TR as before revS; EN drafted 17 Oct.
T['tr'].update({
  'bag': 'Sepet', 'drawer_title': 'Sepetin', 'close_bag': 'Sepeti kapat', 'drawer_note': "Ön siparişler 8 Kasım 2026'da açılıyor.",
  'view_bag': 'Sepeti görüntüle', 'keep_exploring': 'Keşfetmeye devam et',
  'qty_group': 'Ürün adedi', 'qty_dec': 'Adedi azalt', 'qty': 'Adet', 'qty_inc': 'Adedi artır', 'add': 'Sepete ekle',
  'bag_title': 'Sepetin', 'bag_meta': 'Hong Kong koleksiyonundan seçtiğin tasarımlar.', 'bag_empty': 'Sepetin henüz boş.',
  'bag_empty_sub': 'Hong Kong koleksiyonunu keşfet.', 'bag_back': 'Koleksiyona dön', 'bag_continue': 'Koleksiyona devam et',
  'summary': 'Sipariş özeti', 'pieces': 'Parça sayısı', 'sample_total': 'Örnek toplam', 'to_checkout': 'Ön siparişe devam et',
  'bag_note': "Ön siparişler 8 Kasım'da açılıyor. Gösterilen EUR fiyatları tasarım örneğidir. Ödeme alınmaz; ön sipariş talebi oluşturulur.",
  'co_title': 'Sipariş bilgileri', 'co_page': 'Ön sipariş', 'co_meta': 'Hong Kong koleksiyonu ön sipariş akışı.', 'co_steps': 'Sipariş adımları',
  'co_s1': 'Bilgiler', 'co_s2': 'Kontrol', 'co_s3': 'Ödeme', 'co_empty': 'Önce bir tasarım seç.', 'co_empty_sub': "Ön siparişler 8 Kasım'da açılıyor.",
  'co_contact': 'İletişim', 'co_first': 'Ad', 'co_last': 'Soyad', 'co_address_legend': 'Teslimat adresi', 'co_country': 'Ülke / Bölge',
  'co_address': 'Adres', 'co_city': 'Şehir', 'co_postal': 'Posta kodu', 'co_phone': 'Telefon (isteğe bağlı)',
  'co_note': 'Ödeme alınmaz. Bilgilerin yalnızca talebi gönderdiğinde iletilir ve sadece bu ön sipariş için kullanılır.',
  'co_review_btn': 'Bilgileri gözden geçir', 'co_review_title': 'Bilgilerini kontrol et', 'co_edit': 'Bilgileri düzenle',
  'co_pay_title': 'Ödeme henüz açılmadı.', 'co_pay_text': "Talebini bırak; ödeme Shopier'in güvenli sayfasında açıldığında sana e-postayla döneceğiz.", 'co_sent': 'Talebin alındı. Ödeme açıldığında e-postayla döneceğiz.', 'co_err': 'Gönderilemedi. Lütfen tekrar dene ya da bize e-postayla yaz.',
  'co_pay_btn': 'Ön sipariş talebini gönder', 'co_your': 'Seçtiklerin',
  'co_sum_note': 'Gösterilen EUR fiyatları tasarım örneğidir. Kargo ücreti ve teslim takvimi sipariş öncesinde paylaşılacak.', 'co_edit_bag': 'Sepeti düzenle',
})
T['en'].update({
  'bag': 'Bag', 'drawer_title': 'Your bag', 'close_bag': 'Close bag', 'drawer_note': 'Pre-orders open on 8 November 2026.',
  'view_bag': 'View bag', 'keep_exploring': 'Keep exploring',
  'qty_group': 'Quantity', 'qty_dec': 'Decrease quantity', 'qty': 'Quantity', 'qty_inc': 'Increase quantity', 'add': 'Add to bag',
  'bag_title': 'Your bag', 'bag_meta': 'The pieces you chose from the Hong Kong collection.', 'bag_empty': 'Your bag is empty.',
  'bag_empty_sub': 'Explore the Hong Kong collection.', 'bag_back': 'Back to the collection', 'bag_continue': 'Continue browsing',
  'summary': 'Order summary', 'pieces': 'Pieces', 'sample_total': 'Sample total', 'to_checkout': 'Continue to pre-order',
  'bag_note': 'Pre-orders open on 8 November. EUR prices shown are design samples. No payment is taken; a pre-order request is created.',
  'co_title': 'Order details', 'co_page': 'Pre-order', 'co_meta': 'Hong Kong collection pre-order.', 'co_steps': 'Order steps',
  'co_s1': 'Details', 'co_s2': 'Review', 'co_s3': 'Payment', 'co_empty': 'Choose a piece first.', 'co_empty_sub': 'Pre-orders open on 8 November.',
  'co_contact': 'Contact', 'co_first': 'First name', 'co_last': 'Last name', 'co_address_legend': 'Delivery address', 'co_country': 'Country / Region',
  'co_address': 'Address', 'co_city': 'City', 'co_postal': 'Postcode', 'co_phone': 'Phone (optional)',
  'co_note': 'No payment is taken. Your details are sent only when you submit the request and are used only for this pre-order.',
  'co_review_btn': 'Review details', 'co_review_title': 'Check your details', 'co_edit': 'Edit details',
  'co_pay_title': 'Payment is not open yet.', 'co_pay_text': "Leave your request; we will email you when payment opens on Shopier's secure page.", 'co_sent': 'Request received. We will email you when payment opens.', 'co_err': 'Could not send. Please try again or email us.',
  'co_pay_btn': 'Send pre-order request', 'co_your': 'Your pieces',
  'co_sum_note': 'EUR prices shown are design samples. Shipping cost and delivery dates will be shared before you order.', 'co_edit_bag': 'Edit bag',
})

# revU2 (17 Oct): sample privacy notice so the flow looks complete. DRAFT: bracketed parts wait for the company details.
T['tr'].update({'privacy': 'KVKK', 'privacy_read': 'Aydınlatma metni', 'pv_title': 'Kişisel verilerin korunması', 'pv_meta': 'qu/et KVKK aydınlatma metni.',
 'pv_draft': 'Taslak: şirket bilgileri eklendiğinde güncellenecektir.',
 'pv_body': [
  ('Veri sorumlusu', '[Pınar ...] — qu/et, [adres], vergi no [..]. İletişim: pnar.akdemiir@gmail.com'),
  ('Hangi verileri topluyoruz', 'Ön sipariş talebinde paylaştığın ad, soyad, e-posta, telefon (isteğe bağlı) ve teslimat adresi ile seçtiğin ürünler.'),
  ('Ne için kullanıyoruz', 'Yalnızca ön sipariş talebini değerlendirmek, ödeme açıldığında seninle iletişime geçmek ve siparişi teslim etmek için.'),
  ('Hukuki sebep', '6698 sayılı KVKK md. 5/2-c: bir sözleşmenin kurulması veya ifasıyla doğrudan ilgili olması.'),
  ('Kimlerle paylaşıyoruz', 'Ödeme aşamasında ödeme kuruluşu (Shopier) ve teslimat için kargo firmasıyla, yalnızca gerekli ölçüde. Veriler Cloudflare altyapısında saklanır.'),
  ('Saklama süresi', 'Talep sonuçlanana kadar; sipariş oluşursa yasal saklama süreleri boyunca.'),
  ('Hakların', 'KVKK md. 11 kapsamında verilerine erişme, düzeltme, silinmesini isteme ve itiraz haklarını e-postayla kullanabilirsin.'),
 ]})
T['en'].update({'privacy': 'Privacy', 'privacy_read': 'Privacy notice', 'pv_title': 'Privacy notice', 'pv_meta': 'qu/et privacy notice.',
 'pv_draft': 'Draft: will be updated once the company details are registered.',
 'pv_body': [
  ('Controller', '[Pınar ...] — qu/et, [address], tax no [..]. Contact: pnar.akdemiir@gmail.com'),
  ('What we collect', 'The name, email, phone (optional) and delivery address you share in a pre-order request, and the pieces you choose.'),
  ('Why', 'Only to review your pre-order request, contact you when payment opens and deliver your order.'),
  ('Legal basis', 'Turkish Personal Data Protection Law (KVKK) art. 5/2-c: necessary to enter into or perform a contract.'),
  ('Who we share it with', 'The payment provider (Shopier) at payment and the courier for delivery, only as needed. Data is stored on Cloudflare infrastructure.'),
  ('How long', 'Until your request is resolved; if an order is placed, for the legally required retention period.'),
  ('Your rights', 'You can ask to access, correct or delete your data, or object, by email (KVKK art. 11).'),
 ]})

# perf: srcset candidates are read from disk (files written by tools/make-variants.py),
# so this table never drifts from the images; a stem without variants simply gets no srcset.
IMAGES = SITE / 'assets' / 'images'
SIZES = {'wide': '(max-width: 760px) calc(100vw - 48px), min(89vw, 1280px)',
         'portrait': '(max-width: 760px) calc(100vw - 48px), 680px',
         'related': '(max-width: 760px) calc(100vw - 48px), 60vw',
         'full': '100vw',
         'split': '(max-width: 760px) 100vw, 45vw',
         'pair': '(max-width: 760px) 100vw, 50vw',
         'card': '(max-width: 760px) calc(100vw - 48px), 50vw'}  # revR: collection cards sit inside the 24px gutters

def candidates(stem):
    smaller = sorted(int(m.group(1)) for f in IMAGES.glob(f'{stem}-*.webp') if (m := re.fullmatch(re.escape(stem) + r'-(\d+)\.webp', f.name)))
    if not smaller:
        return ''
    master = Image.open(IMAGES / f'{stem}.webp').width
    return ', '.join([f'/assets/images/{stem}-{w}.webp {w}w' for w in smaller] + [f'/assets/images/{stem}.webp {master}w'])

def srcset(stem, sizes):
    found = candidates(stem)
    return f'srcset="{found}" sizes="{SIZES[sizes]}"' if found else ''

def out_path(route):
    return SITE / route.strip('/') / 'index.html' if route != '/' else SITE / 'index.html'

def scene(lang, product, name, kind, wide, silver=None, tattoo=None, pair=False, before=None):
    t, r = T[lang], ROUTES[lang]
    before = before or t['first_skin']
    size, sizes, (w, h) = ('full', 'full', (1672, 941)) if wide else ('portrait', 'pair' if pair else 'split', (960, 1200))
    silver = silver or f'{product}-{size}'
    tattoo = tattoo or f'{product}-tattoo-{size}'
    has_tattoo = (IMAGES / f'{tattoo}.webp').exists()
    layout = ('scene-wide' if wide else 'scene-pair' if pair else 'scene-split') + ('' if has_tattoo else ' scene-static')
    # revR: the sketch layer is only seen on hover/focus, so phones never download it (site.js lifts data-src on fine pointers or focus)
    tattoo_img = f'''<img class="scene-tattoo" data-src="/assets/images/{tattoo}.webp" {srcset(tattoo, sizes).replace('srcset=', 'data-srcset=', 1)} alt="" width="{w}" height="{h}" decoding="async">''' if has_tattoo else ''
    tattoo_state = f'<span class="state-tattoo" aria-hidden="true">{before}</span>' if has_tattoo else ''
    return f'''<section class="scene {layout}" aria-labelledby="{product}-title">
    <a class="scene-media" href="{r[product]}" tabindex="-1" aria-hidden="true">
      {tattoo_img}
      <img class="scene-silver" src="/assets/images/{silver}.webp" {srcset(silver, sizes)} alt="" width="{w}" height="{h}" fetchpriority="low" decoding="async">
    </a>
    <div class="scene-copy">
      <h2 class="scene-name" id="{product}-title">{name}</h2>
      <p class="scene-state"><span class="state-silver">{kind}</span>{tattoo_state}</p>
      <a class="text-link" href="{r[product]}" aria-label="{t['explore_aria'].format(name=name)}">{t['explore']}</a>
    </div>
  </section>'''

def hero_scene(suffix='home', variant='c', animate=True):
    return f'''<svg class="hero-photo" viewBox="0 0 1672 941" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <filter id="sun-soft-{suffix}" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="6"/></filter>
        <mask id="sun-area-{suffix}" maskUnits="userSpaceOnUse" x="0" y="0" width="1672" height="941">
          <path d="M 540,568 L 1492,66 L 1492,185 L 790,606 Z" fill="white" filter="url(#sun-soft-{suffix})"/>
        </mask>
      </defs>
      <image href="/assets/images/hero-clean.webp" width="1672" height="941"/>
      <g class="hero-mark hero-mark-{variant}{' hero-mark-animated' if animate else ''}">
        <text class="hero-wordmark" x="836" y="406" text-anchor="middle">qu/et</text>
        <text class="hero-wordmark hero-sunlight" x="836" y="406" text-anchor="middle" mask="url(#sun-area-{suffix})">qu/et</text>
      </g>
    </svg>'''

def header(lang, key, current=''):
    t, r = T[lang], ROUTES[lang]
    other = t['switch_lang']
    def link(k, label):
        active = ' aria-current="page"' if current == k else ''
        return f'<a href="{r[k]}"{active}>{label}</a>'
    # The language switch keeps the reader on the same page in the other language.
    return f'''<a class="skip-link" href="#main">{t['skip']}</a>
<header class="site-header">
  <a class="logo" href="{r['home']}" aria-label="{t['home_aria']}">qu<i>/</i>et</a>
  <nav aria-label="{t['main_menu']}">
    {link('collection', t['collection'])}
    {link('about', t['about'])}
    <a class="cart-link" href="{r['bag']}" data-open-cart hidden>{t['bag']} <span data-cart-count>0</span></a>
    <a class="lang-switch" href="{ROUTES[other].get(key, ROUTES[other]['home'])}" lang="{other}" hreflang="{other}">{t['switch_label']}</a>
  </nav>
</header>'''

def footer(lang):
    t, r = T[lang], ROUTES[lang]
    return f'''<footer class="site-footer"><div class="shell">
  <div class="footer-row">
    <nav class="footer-links" aria-label="{t['footer_menu']}"><a href="{r['collection']}">{t['collection']}</a><a href="{r['about']}">{t['about']}</a><a href="{r['about']}#studio">{t['studio']}</a><a href="https://www.instagram.com/pinar.ink/" target="_blank" rel="noopener">Instagram</a><a href="mailto:pnar.akdemiir@gmail.com">{t['email']}</a><a href="{r['privacy']}">{t['privacy']}</a></nav>
    <div class="place-times"><span>{t['istanbul']} <time data-clock="Europe/Istanbul"></time></span><span>Hong Kong <time data-clock="Asia/Hong_Kong"></time></span></div>
    <span class="footer-copy">© 2026</span>
  </div>
</div><svg class="footer-wordmark" viewBox="16 12 811 369" aria-hidden="true" focusable="false"><text x="0" y="292">qu<tspan class="slash">/</tspan>et</text></svg></footer>'''

def dialogs(lang):
    t = T[lang]
    return f'''<dialog class="cart-drawer" id="cart-dialog" aria-labelledby="cart-title">
  <div class="drawer-layout">
    <div class="drawer-heading"><h2 id="cart-title">{t['drawer_title']}</h2><button class="icon-close" type="button" data-close-dialog aria-label="{t['close_bag']}">×</button></div>
    <div class="drawer-items" data-cart-items="drawer"></div>
    <div class="drawer-bottom" data-cart-filled><p>{t['drawer_note']}</p><a class="primary-button" href="{ROUTES[lang]['bag']}">{t['view_bag']}</a><button class="secondary-button" type="button" data-close-dialog>{t['keep_exploring']}</button></div>
  </div>
</dialog>
<dialog class="image-dialog" id="image-dialog" aria-label="{t['product_image']}">
  <button class="icon-close" type="button" data-close-dialog aria-label="{t['close_image']}">×</button><img id="zoom-image" alt="">
</dialog>
<p class="sr-only" role="status" aria-live="polite" id="site-status"></p>'''

# revT2: /assets files keep a 1-hour cache but their names never change, so phones kept showing old CSS, JS and
# images after a deploy. Each asset URL gets ?v=<content hash>: a changed file gets a new URL, an unchanged one stays cached.
import hashlib
_VERSION = {}
def versioned(doc):
    def tag(m):
        path = m.group(1)
        if path not in _VERSION:
            f = SITE / path.lstrip('/')
            _VERSION[path] = hashlib.sha1(f.read_bytes()).hexdigest()[:8] if f.is_file() else None
        return path + ('?v=' + _VERSION[path] if _VERSION[path] else '')
    return re.sub(r'(/assets/[A-Za-z0-9_./-]+\.(?:css|js|webp|svg|png|jpg|woff2))(?![?\w])', tag, doc)

def og_tags(lang, key, title, description, path):
    # revW: link previews (Instagram/WhatsApp/X). One shared 1200x630 image; og:url only for routed pages.
    full = 'qu/et' if title == 'qu/et' else f'{title} · qu/et'
    url = f'<meta property="og:url" content="{SITE_URL}{ROUTES[lang][key]}">' if path is None and key in ROUTES[lang] else ''
    return (f'<meta property="og:type" content="website"><meta property="og:site_name" content="qu/et">'
            f'<meta property="og:title" content="{escape(full, quote=True)}"><meta property="og:description" content="{escape(description, quote=True)}">'
            f'<meta property="og:image" content="{SITE_URL}/assets/og-image.jpg"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">'
            f'<meta property="og:image:alt" content="{escape(T[lang]["band_alt"], quote=True)}"><meta property="og:locale" content="{OG_LOCALE[lang]}">'
            f'{url}<meta name="twitter:card" content="summary_large_image">')

def page(lang, key, title, description, main, current='', home=False, extra='', path=None, alternates=True):
    alt_links = ''
    if alternates and key in ROUTES['en']:
        alt_links = (f'<link rel="alternate" hreflang="en" href="{ROUTES["en"][key]}">\n  '
                     f'<link rel="alternate" hreflang="tr" href="{ROUTES["tr"][key]}">\n  '
                     f'<link rel="alternate" hreflang="x-default" href="{ROUTES["en"][key]}">')
    doc = f'''<!doctype html>
<html lang="{lang}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="{escape(description, quote=True)}">
  <meta name="color-scheme" content="dark">
  <meta name="theme-color" content="#121211">
  <title>{escape(title) if title == 'qu/et' else escape(title) + ' · qu/et'}</title>
  <link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">
  <link rel="apple-touch-icon" href="/assets/apple-touch-icon.png">
  {og_tags(lang, key, title, description, path)}
  <link rel="stylesheet" href="/assets/site.css">
  {alt_links}
  {extra}
</head>
<body class="{'home' if home else 'interior'}" data-page="{key}">
{header(lang, key, current)}
{main}
{footer(lang)}
{dialogs(lang)}
<script src="/assets/site.js" defer></script>
<script src="/assets/comparison.js" defer></script>
</body>
</html>
'''
    doc = versioned(doc)
    target = path or out_path(ROUTES[lang][key])
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(doc, encoding='utf-8', newline='\n')

# revW: generated before any page so versioned() can hash them. PNG icon for iOS home screen, OG image, robots.txt, sitemap.xml (generated, never hand-edited).
from PIL import ImageDraw
_icon = Image.new('RGB', (180, 180), '#121211'); ImageDraw.Draw(_icon).line([(112.5, 33.75), (67.5, 146.25)], fill='#e9e5df', width=5)
_icon.save(SITE/'assets'/'apple-touch-icon.png', optimize=True)
_hk = Image.open(IMAGES/'hong-kong.webp').convert('RGB'); _h = round(_hk.width * 630 / 1200)
_hk.crop((0, 0, _hk.width, _h)).resize((1200, 630), Image.LANCZOS).save(SITE/'assets'/'og-image.jpg', 'JPEG', quality=82, optimize=True, progressive=True)
_m = (_hk.width - 1100) // 2
_hk.crop((_m, 0, _m + 1100, _hk.height)).save(IMAGES/'hong-kong-m.webp', 'WEBP', quality=90, method=6)
(SITE/'robots.txt').write_text(f'User-agent: *\nAllow: /\n\nSitemap: {SITE_URL}/sitemap.xml\n', encoding='utf-8', newline='\n')
_urls = []
for _k in ('home', 'collection', 'about', 'peak', 'mid-levels', 'privacy'):
    _alt = ''.join(f'<xhtml:link rel="alternate" hreflang="{l}" href="{SITE_URL}{ROUTES[l][_k]}"/>' for l in ('en', 'tr'))
    _alt += f'<xhtml:link rel="alternate" hreflang="x-default" href="{SITE_URL}{ROUTES["en"][_k]}"/>'
    _urls += [f'  <url><loc>{SITE_URL}{ROUTES[l][_k]}</loc>{_alt}</url>' for l in ('en', 'tr')]
(SITE/'sitemap.xml').write_text('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n' + '\n'.join(_urls) + '\n</urlset>\n', encoding='utf-8', newline='\n')

def collection_card(lang, pid, name, kind):
    # Collection A (Eren, 17 Oct): the piece alone on stone first; hover/focus reveals it worn. No controls.
    # revR: the worn layer is hover-only, so phones never download it (site.js lifts data-src).
    alt = T[lang]['silver_alt'].format(name=name, kind=kind.lower())
    return f'''<a class="collection-card" href="{ROUTES[lang][pid]}"><div class="product-frame"><img class="card-worn" data-src="/assets/images/{pid}-portrait.webp" {srcset(pid + '-portrait', 'card').replace('srcset=', 'data-srcset=', 1)} alt="" width="960" height="1200" decoding="async"><img class="card-still" src="/assets/images/{pid}-still.webp" {srcset(pid + '-still', 'card')} alt="{alt}" width="960" height="1200" fetchpriority="high" decoding="async"></div><div class="card-meta"><h2>{name}</h2><span>{kind}</span></div></a>'''

def frame(lang, stem, alt, first=False):
    # Product page A: one frame = one image; clicking it opens the zoom dialog. No sliders, no thumbnails.
    w, h = Image.open(IMAGES / f'{stem}.webp').size
    loading = 'fetchpriority="high"' if first else 'loading="lazy"'
    return f'''<figure class="product-frame-item"><button type="button" class="frame-zoom" data-zoom aria-label="{T[lang]['enlarge'].format(alt=alt)}"><img src="/assets/images/{stem}.webp" {srcset(stem, 'portrait')} alt="{alt}" width="{w}" height="{h}" {loading} decoding="async"></button></figure>'''

PRODUCTS = [('peak', 'Peak', 'earring', 180, 'mid-levels', 'Mid-Levels'), ('mid-levels', 'Mid-Levels', 'ring', 160, 'peak', 'Peak')]

def build(lang):
    t, r = T[lang], ROUTES[lang]

    home = f'''<main id="main">
  <section class="hero" aria-label="qu/et">
    <h1 class="sr-only">qu/et</h1>
    {hero_scene()}
  </section>
  <section class="collection-band" aria-labelledby="collection-heading">
    <picture><source media="(max-width: 760px)" srcset="/assets/images/hong-kong-m.webp"><img src="/assets/images/hong-kong.webp" alt="{t['band_alt']}" width="1672" height="941" fetchpriority="low" decoding="async"></picture>
    <div class="copy"><h2 id="collection-heading">Hong Kong</h2>
      <a class="text-link band-link" href="{r['collection']}">{t['explore_collection']}</a>
    </div>
  </section>
  <div class="scene-duo">
  {scene(lang, 'peak', 'Peak', t['earring'], wide=False, pair=True, silver='peak-still', tattoo='peak-still-sketch', before=t['first_paper'])}
  {scene(lang, 'mid-levels', 'Mid-Levels', t['ring'], wide=False, pair=True)}
  </div>
  <section class="sketch-strip" aria-labelledby="sketch-title">
    <h2 class="sr-only" id="sketch-title">{t['drawings_title']}</h2>
    <img src="/assets/images/hk-strip.webp" {srcset('hk-strip', 'full')} alt="{t['strip_alt']}" width="2000" height="682" loading="lazy" decoding="async">
    <div class="sketch-meta shell"><span>Hong Kong flash sheets — Pınar</span><a class="text-link" href="{r['about']}">{t['about_link']}</a></div>
  </section>
</main>'''
    page(lang, 'home', 'qu/et', t['home_meta'], home, home=True, extra='<link rel="preload" as="image" href="/assets/images/hero-clean.webp">\n  <script src="/assets/intro.js"></script>')

    collection = f'''<main id="main">
  <section class="collection-head shell" aria-labelledby="hong-kong-title">
    <h1 id="hong-kong-title">Hong Kong</h1>
    <p>{t['limited']}</p>
  </section>
  <section class="collection-products shell" id="pieces" aria-label="{t['collection_aria']}">
    <div class="collection-grid">
      {collection_card(lang, 'peak', 'Peak', t['earring'])}
      {collection_card(lang, 'mid-levels', 'Mid-Levels', t['ring'])}
    </div>
  </section>
</main>'''
    page(lang, 'collection', 'Hong Kong', t['collection_meta'], collection, current='collection')

    # revT (17 Oct, Eren): the launch-date row under the cards is gone (date sits on product pages, About in the menu).
    # revN (17 Oct): About built from Pınar's own material (@pinar.ink, Hong Kong Flash sheets, 27 Sep 2026; Eren has full rights).
    about = f'''<main id="main">
  <section class="about-artist shell" aria-labelledby="about-title">
    <h1 class="sr-only" id="about-title">{t['about_title']}</h1>
    <figure class="about-portrait"><img src="/assets/images/pinar-portrait.webp" {srcset('pinar-portrait', 'pair')} alt="{t['portrait_alt']}" width="960" height="1200" fetchpriority="high" decoding="async"></figure>
    <blockquote class="about-quote"><p lang="en">Less to see.<br>More to feel.</p><footer>{t['quote_footer']}</footer></blockquote>
  </section>
  <section class="about-sheets" aria-labelledby="sheets-title">
    <div class="shell">
      <h2 id="sheets-title" class="sheets-title">{t['sheets_title']}</h2>
      <div class="sheets-grid">
        <img src="/assets/images/hk-sheet-1.webp" {srcset('hk-sheet-1', 'pair')} alt="{t['sheet1_alt']}" width="1440" height="1800" loading="lazy" decoding="async">
        <img src="/assets/images/hk-sheet-2.webp" {srcset('hk-sheet-2', 'pair')} alt="{t['sheet2_alt']}" width="1440" height="1800" loading="lazy" decoding="async">
      </div>
    </div>
  </section>
  <section class="studio-section shell" id="studio" aria-labelledby="studio-title">
    <h2 id="studio-title">{t['studio']}</h2>
    <div class="studio-copy"><p>{t['studio_place']}</p><a class="text-link" href="https://www.instagram.com/pinar.ink/" target="_blank" rel="noopener">{t['insta']}</a></div>
  </section>
</main>'''
    page(lang, 'about', t['about_title'], t['about_meta'], about, current='about')

    for pid, name, kind_key, price, other, other_name in PRODUCTS:
        kind = t[kind_key]
        still = f'{pid}-still' if (IMAGES / f'{pid}-still.webp').exists() else f'{pid}-detail'
        # Order (Eren, A): worn → the piece alone in silver → the drawing on skin it came from.
        frames = '\n      '.join([
            frame(lang, f'{pid}-portrait', t['worn_alt'].format(name=name, kind=kind.lower()), first=True),
            frame(lang, still, t['silver_alt'].format(name=name, kind=kind.lower())),
            frame(lang, f'{pid}-tattoo-portrait', t['skin_alt'].format(name=name)),
        ])
        product = f'''<main id="main" class="shell">
  <section class="product-layout" data-product="{pid}">
    <div class="product-gallery-wrap">
      <div class="product-gallery product-frames" aria-label="{t['gallery_aria'].format(name=name)}" data-frames>
        {frames}
      </div>
      <div class="frame-dots" aria-hidden="true"><span class="is-active"></span><span></span><span></span></div>
    </div>
    <div class="product-info">
      <a class="product-back" href="{r['collection']}">Hong Kong</a><h1>{name}</h1>
      <!-- revV (17 Oct, Eren): kind label and story hidden for now; copy stays in T['story_*'] for later. -->
      <div class="price-block"><p class="price-label">{t['sample_price']}</p><p class="sample-price">€{price}</p><span class="price-meta">{t['preorder_date']}</span><span class="price-meta edition-note">{t['limited']}</span></div>
      <div class="order-actions"><div class="quantity-control" aria-label="{t['qty_group']}"><button type="button" data-product-quantity="-1" aria-label="{t['qty_dec']}">−</button><input id="product-quantity" type="number" min="1" max="50" value="1" inputmode="numeric" aria-label="{t['qty']}"><button type="button" data-product-quantity="1" aria-label="{t['qty_inc']}">+</button></div><button class="primary-button" type="button" data-add-to-cart="{pid}">{t['add']}</button></div>
      <div class="product-details">
        <details open><summary>{t['material']}</summary><p>{t['material_text']}</p></details>
        <details><summary>{t['size']}</summary><p>{t['size_text']}</p></details>
        <details><summary>{t['delivery']}</summary><p>{t['delivery_text']}</p></details>
      </div>
    </div>
  </section>
  <section class="related-product"><div><p class="eyebrow">{t['same_collection']}</p><h2><a href="{r[other]}">{other_name}</a></h2></div><a class="related-photo" href="{r[other]}" aria-label="{t['explore_aria'].format(name=other_name)}"><img src="/assets/images/{other}-still.webp" {srcset(other + '-still', 'portrait')} alt="{t['related_alt'].format(name=other_name)}" width="960" height="1200" loading="lazy" decoding="async"></a></section>
</main>'''
        page(lang, pid, name, t['product_meta'].format(name=name, kind=kind.lower()), product, current='collection')

    cart = f'''<main id="main" class="shell">
  <section class="page-intro"><div><h1>{t['bag_title']}</h1></div></section>
  <div class="empty-bag" data-cart-empty><h2>{t['bag_empty']}</h2><p>{t['bag_empty_sub']}</p><a class="primary-button" href="{r['collection']}">{t['bag_back']}</a></div>
  <section class="bag-layout" data-cart-filled hidden>
    <div><div class="bag-page-items" data-cart-items="page"></div><a class="text-link" href="{r['collection']}">{t['bag_continue']}</a></div>
    <aside class="summary-panel" aria-labelledby="bag-summary"><h2 id="bag-summary">{t['summary']}</h2><div class="summary-row"><span>{t['pieces']}</span><span data-cart-count>0</span></div><div class="summary-row summary-total"><span>{t['sample_total']}</span><span data-cart-total>€0</span></div><a class="primary-button" href="{r['checkout']}">{t['to_checkout']}</a><p class="summary-note">{t['bag_note']}</p></aside>
  </section>
</main>'''
    page(lang, 'bag', t['bag_title'], t['bag_meta'], cart)

    # The form stays in the page only: no storage, no query, no request (site.js). Payment step = Shopier, closed until wired.
    checkout = f'''<main id="main" class="shell">
  <section class="checkout-heading"><h1>{t['co_title']}</h1><ol class="checkout-steps" aria-label="{t['co_steps']}"><li aria-current="step" data-step="1">{t['co_s1']}</li><li data-step="2">{t['co_s2']}</li><li>{t['co_s3']}</li></ol></section>
  <div class="empty-bag" data-cart-empty><h2>{t['co_empty']}</h2><p>{t['co_empty_sub']}</p><a class="primary-button" href="{r['collection']}">{t['explore_collection']}</a></div>
  <section class="checkout-layout" data-cart-filled hidden>
    <div>
      <form class="checkout-form" id="checkout-form" novalidate>
        <fieldset><legend>{t['co_contact']}</legend><div class="field-grid"><label class="field field-wide">{t['email']}<input name="email" type="email" autocomplete="email" required maxlength="160"></label><label class="field">{t['co_first']}<input name="firstName" autocomplete="given-name" required maxlength="60"></label><label class="field">{t['co_last']}<input name="lastName" autocomplete="family-name" required maxlength="60"></label></div></fieldset>
        <fieldset><legend>{t['co_address_legend']}</legend><div class="field-grid"><label class="field field-wide">{t['co_country']}<input name="country" required maxlength="80" autocomplete="country-name"></label><label class="field field-wide">{t['co_address']}<input name="address" required maxlength="200" autocomplete="street-address"></label><label class="field">{t['co_city']}<input name="city" required maxlength="80" autocomplete="address-level2"></label><label class="field">{t['co_postal']}<input name="postal" required maxlength="20" autocomplete="postal-code"></label><label class="field field-wide">{t['co_phone']}<input name="phone" type="tel" maxlength="30" autocomplete="tel"></label></div></fieldset>
        <p class="checkout-preview-note">{t['co_note']} <a class="text-link" href="{r['privacy']}">{t['privacy_read']}</a></p>
        <button class="primary-button" type="submit" disabled>{t['co_review_btn']}</button>
      </form>
      <section id="checkout-review" hidden aria-labelledby="review-title" tabindex="-1"><h2 id="review-title">{t['co_review_title']}</h2><address class="review-address" id="review-address"></address><div class="review-actions"><button class="secondary-button" type="button" id="edit-checkout">{t['co_edit']}</button></div><div class="notice-panel"><h3>{t['co_pay_title']}</h3><p>{t['co_pay_text']}</p></div><button class="primary-button" type="button" id="send-preorder">{t['co_pay_btn']}</button><p class="summary-note" id="preorder-result" role="status" hidden data-sent="{t['co_sent']}" data-error="{t['co_err']}"></p></section>
    </div>
    <aside class="summary-panel" aria-labelledby="checkout-summary"><h2 id="checkout-summary">{t['co_your']}</h2><div class="checkout-summary-items" data-cart-items="summary"></div><div class="summary-row summary-total"><span>{t['sample_total']}</span><span data-cart-total>€0</span></div><p class="summary-note">{t['co_sum_note']}</p><a class="text-link" href="{r['bag']}">{t['co_edit_bag']}</a></aside>
  </section>
</main>'''
    page(lang, 'checkout', t['co_page'], t['co_meta'], checkout)

    privacy = f'''<main id="main" class="shell">
  <section class="page-intro"><div><h1>{t['pv_title']}</h1><p class="intro-side">{t['pv_draft']}</p></div></section>
  <section class="legal-text">{''.join(f'<h2>{h}</h2><p>{b}</p>' for h, b in t['pv_body'])}</section>
</main>'''
    page(lang, 'privacy', t['pv_title'], t['pv_meta'], privacy)

    # Without a top-level 404.html, Cloudflare Pages treats the site as an SPA and answers every unknown URL with the home page.
    not_found = f'''<main id="main" class="shell">
  <section class="page-intro"><div><h1>{t['nf_text']}</h1><a class="text-link" href="{r['collection']}">{t['collection']}</a></div></section>
</main>'''
    page(lang, 'home', t['nf_title'], t['nf_meta'], not_found, alternates=False,
         path=SITE / ('404.html' if lang == 'en' else 'tr/404.html'))

for lang in ('en', 'tr'):
    build(lang)

# Internal design-review page (never deployed; make-dist.py leaves it out).
preview = f'''<main id="main" class="hero-review">
  <div class="shell review-heading"><p class="eyebrow">Tasarım karşılaştırması</p><h1>İlk karşılaşma.</h1><p>Aynı sahne, aynı ölçü. B: net kırık beyaz. C: mat gümüş, yalnızca ışık hattında parlak.</p>
    <div class="review-controls" role="group" aria-label="Logo seçeneği"><button type="button" data-hero-variant="b" aria-pressed="false">B · Net logo</button><button type="button" data-hero-variant="c" aria-pressed="true">C · Işık vurgusu</button><button type="button" data-hero-replay>Geçişi oynat</button></div>
  </div>
  <section class="hero hero-preview" aria-label="Hero logo karşılaştırması"><span class="logo preview-corner" aria-hidden="true">qu<i>/</i>et</span>{hero_scene('preview', animate=False)}</section>
  <div class="shell review-caption"><p data-hero-description>C · Mat gümüş; fotoğraftaki güneş hattı harflerin üstünde sabit kalır.</p><a class="text-link" href="/tr/">Ana sayfaya dön</a></div>
</main>'''
page('tr', 'review', 'Hero karşılaştırması', 'qu/et için iki logo yaklaşımı.', preview, alternates=False, path=SITE / 'hero-karsilastirma.html')

(SITE/'assets'/'favicon.svg').write_text('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="12" fill="#121211"/><path d="M40 12 24 52" stroke="#e9e5df" stroke-width="2"/></svg>',encoding='utf-8')
print('Built 7 pages + 404 in EN (/) and TR (/tr/), and the internal hero comparison.')
