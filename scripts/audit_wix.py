#!/usr/bin/env python3
"""Read public Wix pages and referenced public renderer data. No login or mutation.
Run from the repository root. Preserves every image occurrence; downloads unique originals.
"""
import concurrent.futures, hashlib, json, pathlib, re, urllib.request
from html.parser import HTMLParser
from urllib.parse import urljoin, urlsplit
BASE = 'https://laurenlikestopaint.wixsite.com/mysite'
OUT = pathlib.Path('docs/audit')
MEDIA = pathlib.Path('source-assets/wix')
for p in (OUT,MEDIA): p.mkdir(parents=True,exist_ok=True)
def get(url):
    with urllib.request.urlopen(url,timeout=45) as r: return r.read(),r.geturl(),r.headers.get('Content-Type','')
def save(name,data): (OUT/name).write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
class Page(HTMLParser):
    def __init__(self): super().__init__(); self.skip=0;self.text=[];self.links=[];self.images=[]
    def handle_starttag(self,t,a):
        a=dict(a)
        if t in ('script','style'): self.skip+=1
        if t=='a' and a.get('href'): self.links.append(a['href'])
        if t=='img': self.images.append(a)
    def handle_endtag(self,t):
        if t in ('script','style'): self.skip=max(0,self.skip-1)
    def handle_data(self,s):
        if not self.skip and s.strip(): self.text.append(s.strip())
def walk(x,path=''):
    yield path,x
    if isinstance(x,dict):
        for k,v in x.items():yield from walk(v,path+'/'+k)
    elif isinstance(x,list):
        for i,v in enumerate(x):yield from walk(v,path+'/'+str(i))
root=get(BASE)[0].decode()
model=json.loads(re.search(r'<script[^>]*id="wix-viewer-model"[^>]*>(.*?)</script>',root,re.S).group(1))
router=model['siteFeaturesConfigs']['router'];save('routes.json',router)
sitemap=get(BASE+'/pages-sitemap.xml')[0].decode();(OUT/'pages-sitemap.xml').write_text(sitemap)
urls=[BASE]+[BASE+'/'+v['pageUriSEO'] for v in router['pagesMap'].values()]
queue=list(dict.fromkeys(urls)); pages=[];occurrences=[];galleries=[];assets={}
while queue:
    url=queue.pop(0);slug=url.removeprefix(BASE).strip('/') or 'index'
    if '/' in slug:slug=slug.replace('/','--')
    entry={'url':url,'snapshot':slug+'.json'}
    try:
        body,final,ctype=get(url);s=body.decode();p=Page();p.feed(s)
        entry.update(status='fetched',final_url=final,bytes=len(body),title=(re.findall(r'<title>(.*?)</title>',s,re.S) or [''])[0])
        props={}
        endpoints=list(dict.fromkeys(re.findall(r'https://siteassets.parastorage.com[^"\s<>]+',s)))
        for endpoint in endpoints:
            endpoint=endpoint.replace('&amp;','&')
            # Public URLs linked by the source page; do not manufacture API queries.
            try:
                d=json.loads(get(endpoint)[0]);props.update(d.get('props',{}).get('render',{}).get('compProps',{}))
            except Exception as e: entry.setdefault('renderer_errors',[]).append(str(e))
        for comp,v in props.items():
            if isinstance(v,dict) and isinstance(v.get('items'),list) and any(isinstance(i,dict) and 'image' in i for i in v['items']):
                galleries.append({'source_url':url,'component':comp,'count':len(v['items']),'items':v['items'],'migration_status':'inventoried','destination':None})
        for path,v in walk(props):
            if isinstance(v,dict) and isinstance(v.get('uri'),str) and re.search(r'\.(jpg|jpeg|png|webp|gif|avif)(?:$|[?])',v['uri'],re.I):
                uri=v['uri'];u=uri if uri.startswith('https://') else 'https://static.wixstatic.com/media/'+uri
                occurrences.append({'source_url':url,'component_path':path,'asset_url':u,'metadata':v,'destination':None,'migration_status':'inventoried'})
                assets.setdefault(u,{'url':u,'source_pages':[]})['source_pages'].append(url)
        for i in p.images:
            u=i.get('src','').split('/v1/')[0]
            if u.startswith('https://static.wixstatic.com/media/'):
                assets.setdefault(u,{'url':u,'source_pages':[]})['source_pages'].append(url)
        links=list(dict.fromkeys(urljoin(url,x) for x in p.links))
        save(entry['snapshot'],{'source_url':url,'text':p.text,'links':links,'images':p.images,'render_props':props})
        for u in links:
            if u.startswith(BASE+'/') and '#' not in u and '?' not in u and u not in urls:
                urls.append(u);queue.append(u)
        entry.update(gallery_counters=re.findall(r'data-testid="gallery-counter"[^>]*>(.*?)</div>',s),links=links)
    except Exception as e:entry.update(status='failed',error=str(e))
    pages.append(entry);print(slug,entry['status'],flush=True)
    save('pages.json',pages);save('galleries.json',galleries);save('occurrences.json',occurrences)
def download(a):
    a['source_pages']=sorted(set(a['source_pages'])); name=urlsplit(a['url']).path.rsplit('/',1)[-1]; path=MEDIA/name
    try:
        if path.exists():data=path.read_bytes();ctype='cached'
        else:
            data,_,ctype=get(a['url']);path.write_bytes(data)
        a.update(status='downloaded',local_path=str(path),bytes=len(data),sha256=hashlib.sha256(data).hexdigest(),content_type=ctype,destination=None,rights='unreviewed')
    except Exception as e:a.update(status='failed',error=str(e))
    return a
with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool: results=list(pool.map(download,assets.values()))
save('assets.json',results)
print('SUMMARY',len(pages),'pages',len(galleries),'gallery components',len(occurrences),'occurrences',len(results),'assets',sum(a['status']=='downloaded' for a in results),'downloaded',sum(a.get('bytes',0) for a in results),'bytes')
