#!/usr/bin/env python3
"""Verify local preservation integrity, not source accuracy or publication permission."""
import collections, hashlib, json, pathlib, sys
root=pathlib.Path(__file__).resolve().parents[1]
p=root/'docs/audit'
assets=json.loads((p/'assets.json').read_text());pages=json.loads((p/'pages.json').read_text());galleries=json.loads((p/'galleries.json').read_text())
errors=[]
for a in assets:
    if a['status']!='downloaded':continue
    f=root/a['local_path']
    if not f.exists():errors.append('Missing '+str(f));continue
    data=f.read_bytes()
    if len(data)!=a['bytes'] or hashlib.sha256(data).hexdigest()!=a['sha256']:errors.append('Hash/size mismatch '+str(f))
for page in pages:
    if page['status']=='fetched' and not (p/page['snapshot']).exists():errors.append('Missing snapshot '+page['snapshot'])
canonical=[]
for g in galleries:
    # Wix emits a repeater template plus real instances. Retain both in evidence,
    # count only instances when a base has them. Standalone grids stay included.
    base=g['component'].split('__')[0]
    if '__' not in g['component'] and any(x['source_url']==g['source_url'] and x['component'].startswith(base+'__') for x in galleries):continue
    canonical.append(g)
for page in pages:
    sizes=[g['count'] for g in canonical if g['source_url']==page['url']]
    counters=[int(x.split('/')[-1]) for x in page.get('gallery_counters',[])]
    # PaginatedGridGallery shows page count, not image count (lettering: 1/1).
    if page['url'].endswith('/lettering'):continue
    if sizes!=counters:errors.append('Gallery count mismatch '+page['url']+': '+str(sizes)+' != '+str(counters))
known={a['url'] for a in assets}
for o in json.loads((p/'occurrences.json').read_text()):
    if o['asset_url'] not in known:errors.append('Unmanifested occurrence '+o['asset_url'])
report={'checked_on':'2026-11-15','scope':'Local bytes, snapshots, image-reference coverage and source gallery counters; not content accuracy, rights or complete migration.', 'page_urls':len(pages),'raw_gallery_components':len(galleries),'rendered_gallery_instances':len(canonical),'ordered_gallery_entries':sum(g['count'] for g in canonical),'unique_image_urls':len(assets),'downloaded_images':sum(a['status']=='downloaded' for a in assets),'unavailable_originals':[a['url'] for a in assets if a['status']!='downloaded'],'downloaded_bytes':sum(a.get('bytes',0) for a in assets),'byte_duplicate_groups':sum(v>1 for v in collections.Counter(a['sha256'] for a in assets if 'sha256' in a).values()),'integrity_errors':errors}
(p/'verification.json').write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps({k:v for k,v in report.items() if k!='unavailable_originals'},indent=2))
print('Unavailable originals:',len(report['unavailable_originals']))
if errors:sys.exit(1)
