"""Read-only browser acceptance checks. No purchases, forms or AI calls."""
import json
from playwright.sync_api import sync_playwright

BASE = 'http://127.0.0.1:3105'
results = []
def check(name, ok, detail=''):
    results.append({'test': name, 'pass': bool(ok), 'detail': detail})
    print(json.dumps(results[-1], ensure_ascii=False), flush=True)

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={'width': 1440, 'height': 900})
    errors, videos = [], []
    page.on('pageerror', lambda e: errors.append(str(e)))
    page.on('request', lambda r: videos.append(r.url) if '.mp4' in r.url else None)
    response = page.goto(BASE+'/marketplace')
    page.wait_for_load_state('networkidle')
    check('marketplace HTTP', response.status == 200)
    check('no video downloaded before play', len(videos) == 0, str(videos))
    check('single H1', page.locator('h1').count() == 1)
    check('Italian document', page.locator('html').get_attribute('lang') == 'it')
    links = page.locator('.swa-tool-card a').evaluate_all('(els)=>els.map(e=>e.getAttribute("href"))')
    check('eleven catalogue tools', len(links) == 11, str(len(links)))
    check('renamed analyzer', page.get_by_role('heading', name='Mercati Finanziari Analyzer', exact=True).count() == 1)
    check('desktop no overflow', page.evaluate('document.documentElement.scrollWidth <= innerWidth'))
    print('BUTTONS', page.locator('button').all_text_contents(), flush=True)
    page.get_by_role('button', name='Marketing & contenuti', exact=True).click()
    check('category filter', page.locator('.swa-tool-card').count() == 1)
    page.get_by_role('button', name='Tutti', exact=True).click()
    page.get_by_role('searchbox').fill('Mercati')
    check('search analyzer', page.locator('.swa-tool-card').count() == 1)
    page.get_by_role('searchbox').fill('zzzznessuno')
    check('empty results', page.locator('.swa-empty').is_visible())
    page.get_by_role('button', name='mostra tutti gli strumenti').click()
    check('reset filter', page.locator('.swa-tool-card').count() == 11)
    page.locator('summary').filter(has_text='Chi è Odino?').click()
    check('Odino global mascot FAQ', page.locator('details[open]').inner_text().find('mascotte di SWA') >= 0)
    page.get_by_role('button', name='Riproduci: Odino presenta UGC Video Creator').click()
    page.wait_for_function('document.querySelector("video")?.readyState >= 2')
    check('video plays after explicit click', len(videos) > 0 and page.locator('video').count() == 1)
    page.locator('video').evaluate('(v)=>v.pause()')
    page.screenshot(path='/private/tmp/swa-tested-desktop.png', full_page=True)
    external = set()
    for path in links:
        r = page.goto(BASE+path)
        page.wait_for_load_state('networkidle')
        canonical = page.locator('link[rel="canonical"]').get_attribute('href')
        schemas = page.locator('script[type="application/ld+json"]').all_text_contents()
        valid_schema = all(json.loads(s).get('@context') == 'https://schema.org' for s in schemas)
        check('detail '+path, r.status == 200 and page.locator('h1').count() == 1 and canonical == 'https://www.socialautomation.app'+path and bool(schemas) and valid_schema)
        for a in page.locator('a[href^="https://"]').evaluate_all('(els)=>els.map(e=>e.href)'):
            external.add(a)
        if path.endswith('/ugc'):
            page.screenshot(path='/private/tmp/swa-tested-ugc.png', full_page=True)
    for width in [360, 390, 768]:
        page.set_viewport_size({'width':width,'height':844})
        for path in ['/marketplace','/marketplace/ugc','/marketplace/mercati-finanziari-analyzer']:
            page.goto(BASE+path)
            page.wait_for_load_state('networkidle')
            check('responsive '+str(width)+' '+path, page.evaluate('document.documentElement.scrollWidth <= innerWidth'))
        if width == 390:
            page.get_by_role('button', name='Apri menu').click()
            check('mobile menu opens', page.locator('#swa-navigation').is_visible())
            page.locator('#swa-navigation').get_by_role('link',name='Marketplace').click()
            check('mobile menu closes', page.get_by_role('button', name='Apri menu').get_attribute('aria-expanded') == 'false')
            page.screenshot(path='/private/tmp/swa-tested-mobile.png', full_page=True)
    for path, ending in [('/apps/ugc','/marketplace/ugc'),('/apps/softi','/marketplace/mercati-finanziari-analyzer'),('/marketplace/softi','/marketplace/mercati-finanziari-analyzer')]:
        r = page.goto(BASE+path)
        check('legacy redirect '+path, r.status == 200 and page.url.endswith(ending))
    for path in ['/sign-in','/sign-up','/workspace/ugc']:
        r = page.goto(BASE+path)
        page.wait_for_load_state('networkidle')
        check('access preview '+path, r.status == 200, str(r.status))
    r = page.goto(BASE+'/marketplace/non-existent-tool')
    check('unknown tool returns 404', r.status == 404)
    check('no browser runtime errors', len(errors) == 0, str(errors))
    print('EXTERNAL_LINKS', json.dumps(sorted(external),ensure_ascii=False), flush=True)
    print('SUMMARY', json.dumps({'passed':sum(r['pass'] for r in results),'total':len(results),'failures':[r for r in results if not r['pass']]},ensure_ascii=False), flush=True)
    browser.close()
