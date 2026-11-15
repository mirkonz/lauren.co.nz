#!/usr/bin/env python3
"""Derive local text drafts and reconciliation from immutable audit evidence.

Use --check after editing to detect drift; generation refuses to overwrite changes.
Media stays archive-only, including gallery entries mapped to draft owners.
"""
import argparse
import hashlib
import json
from pathlib import Path
import re
import sys

ROOT = Path(__file__).resolve().parents[1]
AUDIT = ROOT / 'docs/audit'
MANIFEST = ROOT / 'docs/migration.json'
BASE = 'https://laurenlikestopaint.wixsite.com/mysite'


def read(name):
    return json.loads((AUDIT / f'{name}.json').read_text())


def slug(text):
    return re.sub(r'[^a-z0-9]+', '-', text.lower()).strip('-')


def digest(data):
    return hashlib.sha256(data).hexdigest()


def derive():
    outputs = {}
    destinations = {}
    def record(folder, key, title, page, body='', **fields):
        path = f'src/content/{folder}/{key}/index.md'
        data = dict(key=key, url_slug=key.removeprefix('film-'), title=title,
                    publication='draft', facts_verified=False, source_url=BASE + page, **fields)
        # A JSON object is valid YAML. No additional parser dependency is needed.
        outputs[path] = '---\n' + json.dumps(data, indent=2, ensure_ascii=False) + '\n---\n' + body.rstrip() + '\n'
        return path

    cv = read('cv-transcription')
    text = read('filmography')['text']
    start = text.index('Head of Props Painting Department')
    end = text.index('Lauren May Stewart - Visual Artist  - New Zealand')
    credit_text = [t for t in text[start:end] if t.strip('\u200b ')]
    assert len(credit_text) == 54, 'Unexpected source credit layout'
    credits = [credit_text[i:i+3] for i in range(0, 51, 3)]
    # The final source credit has its date first, unlike the preceding entries.
    credits.append([credit_text[53], credit_text[52], credit_text[51]])
    cv_titles = ['East of Eden', 'Avatar: Sequels', 'Wolfman', 'The Rule of Jenny Pen',
                 'Weta Workshop/Tron', 'After The Party', 'Sweet Tooth Season 2', 'M3gan',
                 'X', 'Pearl', 'Power Of The Dog', 'Mulan', None, 'Blade Runner 2049',
                 'Mortal Engines', 'Ghost in The Shell', 'Savage', 'Time Bandits']
    cv_by_title = {item['title']: item for item in cv['film_experience']}
    film_paths = {}
    cv_links = []
    cv_mapping = {}
    assert len(credits) == len(cv_titles)
    for (role, title, date), cv_title in zip(credits, cv_titles):
        key = 'film-' + slug(title)
        body = ''
        if cv_title:
            claim = cv_by_title[cv_title]
            body = '## CV source claim (unverified)\n\n' + json.dumps(claim, ensure_ascii=False, indent=2) + '\n\nSource: CV transcription. Preserve both source versions; dates and roles have not been reconciled.\n'
        # Explicit production-level source prose, never inferred image attribution.
        if title in ['Blade Runner 2049', 'Mulan']:
            source = read('on-set')['text']
            a = source.index(title) + 1
            b = source.index('press to zoom', a)
            body += '\n## On-set source contribution (unverified)\n\n' + '\n\n'.join(t for t in source[a:b] if t.strip('\u200b ')) + '\n'
        path = record('film', key, title, '/filmography', body, roles=[role], year_label=date)
        film_paths[title] = path
        cv_links.append(path)
        if cv_title:
            cv_mapping[cv_title] = path
    claim = cv_by_title['Weta Workshop/Mulan']
    path = record('film', 'film-weta-workshop-mulan', claim['title'], '/cv',
                  'CV source claim (unverified):\n\n' + json.dumps(claim, ensure_ascii=False, indent=2),
                  roles=[claim['role']], year_label=claim['date_label'])
    cv_mapping[claim['title']] = path
    cv_links.append(path)

    about = read('index')['text']
    # Preserve content paragraphs in source order; navigation and email stay in audit.
    about_body = [about[about.index('Hello') + 1]]
    a = about.index('More about me') + 1
    b = about.index('LASTEST PROJECTS')
    about_body += [t for t in about[a:b] if t.strip('\u200b ')]
    destinations[''] = [record('pages', 'about', 'About', '', '\n\n'.join(about_body), kind='about')]
    destinations['about-5'] = destinations['']
    destinations['home'] = destinations['']
    contact_text = read('contact')['text']
    destinations['contact'] = [record('pages', 'contact', 'Contact', '/contact',
        contact_text[contact_text.index('GET IN TOUCH') + 1], kind='contact')]
    cv_body = cv['summary'] + '\n\n## Filmography\n\n' + '\n'.join(f'- [{Path(p).parent.name}](../../../../{p})' for p in cv_links)
    cv_body += '\n\n## Source interests (unverified)\n\n' + '\n'.join(cv['interests']) + '\n\n' + cv['closing']
    cv_path = record('pages', 'cv', 'CV', '/cv', cv_body, kind='cv',
        skills=[dict(title=s['heading'], items=s['items']) for s in cv['skills']],
        education=[{k:v for k,v in e.items() if k != 'location'} for e in cv['education']],
        experience=cv['other_experience'], languages=cv['languages'])
    destinations['cv'] = [cv_path]
    destinations['filmography'] = list(film_paths.values())

    for title in ['Diwali Festival', 'Circa Theatre']:
        claim = cv_by_title[title]
        path = record('film-practice', 'practice-' + slug(title), title, '/cv',
                      'CV source claim (unverified):\n\n' + json.dumps(claim, ensure_ascii=False, indent=2))
        cv_mapping[title] = path
    destinations['cv'] += [cv_mapping[t] for t in ['Weta Workshop/Mulan', 'Diwali Festival', 'Circa Theatre']]

    galleries = read('galleries')
    gallery_map = read('gallery-map')
    mapped_galleries = []
    gallery_destinations = {}
    for row in gallery_map:
        page = row['source_url'].removeprefix(BASE + '/')
        title = row['source_title']
        gallery_index, gallery = next((i, g) for i, g in enumerate(galleries)
            if g['source_url'] == row['source_url'] and g['component'] == row['component'])
        source = read(page)['text']
        if page == 'lettering':
            body = ''
        else:
            a = source.index(title) + 1
            # Each gallery's explanatory text ends at the next gallery's controls/footer.
            b = next((i for i in range(a, len(source)) if source[i] == 'press to zoom' or source[i].startswith('Lauren May Stewart -')), len(source))
            body = '\n\n'.join(t for t in source[a:b] if t.strip('\u200b '))
        if title in film_paths and page == 'on-set':
            path = film_paths[title]
        else:
            folder = 'film-practice' if page in ['on-set', 'scenic-props-sets'] else 'art-collections'
            key = 'on-set' if title == 'Onset Painting' else slug(title)
            if folder == 'film-practice' and key != 'on-set':
                key = 'practice-' + key
            if page in ['painting', 'invert', 'illustration', 'jewellery-1']:
                heading = {'painting':'Painting', 'invert':'Inverted Paintings', 'illustration':'Illustration & Lettering', 'jewellery-1':'Jewellery'}[page]
                a = source.index(heading) + 1
                b = source.index('press to zoom', a)
                intro = '\n\n'.join(source[a:b])
                body = intro + '\n\n' + body
            fields = {'films': []} if folder == 'film-practice' else {}
            if key == 'on-set':
                body = source[source.index('On-set')+1] + '\n\n' + body
                fields['films'] = ['film-blade-runner-2049', 'film-mulan']
            path = f'src/content/{folder}/{key}/index.md'
            # City Streets is intentionally one draft collection with both ordered sources retained.
            if path not in outputs:
                record(folder, key, title, '/' + page, body, **fields)
        destinations.setdefault(page, []).append(path)
        gallery_destinations[(row['source_url'], row['component'])] = path
        assert gallery['count'] == len(gallery['items']) == row['ordered_entries']
        mapped_galleries.append(dict(source_url=row['source_url'], component=row['component'],
            source_title=title, destination=path, disposition='draft metadata; media archive-only pending permission',
            permission='unreviewed', items=[dict(position=i, source_pointer=f'galleries.json#/{gallery_index}/items/{i}',
                asset_url='https://static.wixstatic.com/media/' + item['image']['uri']) for i,item in enumerate(gallery['items'])]))
    source = read('scenic-props-sets')['text']
    destinations['scenic-props-sets'].insert(0, record('film-practice', 'practice-scenic-props-sets', 'Scenic, Props & Sets', '/scenic-props-sets',
        '\n\n'.join(source[source.index('Scenic, Props & Sets')+1:source.index('press to zoom')])))
    source = read('3dobjects')['text']
    destinations['3dobjects'] = [record('film-practice', 'practice-3d-objects', '3D OBJECTS', '/3dobjects', source[source.index('3D OBJECTS')+1])]

    pages = []
    for page in read('pages'):
        name = page['url'].removeprefix(BASE).strip('/')
        reason = {'projects-8-1':'Template placeholders; no genuine project claims established.',
                  'fullscreen-page':'Empty shell; browser inspection outstanding.',
                  'blank-1':'Dynamic jewellery template returns 404; public records unresolved.'}.get(name)
        pages.append(dict(source_url=page['url'], source_snapshot=page['snapshot'],
            destinations=sorted(set(destinations.get(name, []))),
            disposition='archive-only review' if reason else 'draft metadata',
            review=reason or 'Source facts remain unverified; images remain archive-only.'))
    by_page = {p['source_url']:p for p in pages}
    occurrences = []
    for i, occurrence in enumerate(read('occurrences')):
        component = occurrence['component_path'].split('/')[1]
        target = gallery_destinations.get((occurrence['source_url'], component))
        is_template = not target and any(url == occurrence['source_url'] and comp.startswith(component+'__') for url,comp in gallery_destinations)
        if is_template:
            targets = sorted(set(path for (url,comp),path in gallery_destinations.items() if url == occurrence['source_url'] and comp.startswith(component+'__')))
        else:
            targets = [target] if target else by_page[occurrence['source_url']]['destinations']
        occurrences.append(dict(source_pointer=f'occurrences.json#/{i}', source_url=occurrence['source_url'],
            component_path=occurrence['component_path'], asset_url=occurrence['asset_url'],
            destinations=targets, permission='unreviewed',
            disposition='archive-only repeater template' if is_template else 'archive-only pending permission' if targets else 'archive-only review',
            review='Shared page/template metadata is not image-specific attribution.' if not target else 'Gallery association only; image identity, alt text and rights require review.'))
    assets = []
    for asset in read('assets'):
        assets.append(dict(asset_url=asset['url'], status=asset['status'], local_path=asset.get('local_path'),
            bytes=asset.get('bytes'), sha256=asset.get('sha256'), permission='unreviewed',
            disposition='archive-only pending permission' if asset['status']=='downloaded' else 'unavailable original; owner resolution required',
            occurrence_indices=[i for i,o in enumerate(occurrences) if o['asset_url']==asset['url']]))
    hashes = {}
    for asset in assets:
        if asset['sha256']:
            hashes.setdefault(asset['sha256'], []).append(asset['asset_url'])
    manifest = dict(scope='Local draft metadata only; not factual verification, rights clearance or full P03 completion.',
        source_hashes={p.name:digest(p.read_bytes()) for p in sorted(AUDIT.iterdir()) if p.is_file()},
        record_hashes={p:digest(s.encode()) for p,s in outputs.items()},
        counts=dict(records=len(outputs), source_pages=len(pages), rendered_galleries=len(mapped_galleries),
            ordered_gallery_entries=sum(len(g['items']) for g in mapped_galleries), occurrences=len(occurrences), assets=len(assets)),
        pages=pages, galleries=mapped_galleries, occurrences=occurrences, assets=assets,
        cv_claims=[dict(source_pointer=f'cv-transcription.json#/film_experience/{i}', destination=cv_mapping[c['title']], facts_verified=False)
                   for i,c in enumerate(cv['film_experience'])],
        review=dict(biography='Older Home prose retained in home.json; reconcile with About and CV before publication.',
            contact='Email, phone, social identity and name approval remain in source evidence; settings unchanged.',
            duplicates=[dict(sha256=h, assets=urls, decision='Retain both originals and all occurrences; no storage deduplication authorised.') for h,urls in hashes.items() if len(urls)>1],
            city_streets='One draft collection, two source gallery sequences retained; curation and per-image review outstanding.',
            dynamic_jewellery='Router prefix /jewellery/{title}: unresolved; no individual records fabricated.',
            cv='CV claims retained separately from filmography claims; no release dates inferred. Award attribution remains unresolved.'))
    outputs['docs/migration.json'] = json.dumps(manifest, indent=2, ensure_ascii=False) + '\n'
    # Preserve the initial migration hashes; later title annotations belong to
    # the supplemental ledger and must not be erased by regeneration.
    supplemental = json.loads((ROOT / 'docs/source-media-review.json').read_text())
    for annotation in supplemental.get('deferred_image_review', {}).get('records', []):
        name = annotation['destination']
        original = annotation['original_title']
        if annotation['title'] != '[IMAGES MISSING] ' + original:
            raise ValueError(f'Invalid missing-image title: {name}')
        old = '"title": ' + json.dumps(original, ensure_ascii=False)
        new = '"title": ' + json.dumps(annotation['title'], ensure_ascii=False)
        if outputs[name].count(old) != 1:
            raise ValueError(f'Original title no longer matches: {name}')
        outputs[name] = outputs[name].replace(old, new, 1)
    return outputs


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--check', action='store_true', help='Verify generated records and source hashes without writes.')
    args = parser.parse_args()
    outputs = derive()
    errors = []
    if args.check:
        approvals = json.loads((ROOT / 'docs/content-approvals.json').read_text())['records']
        for name, expected in outputs.items():
            path = ROOT / name
            approved = next((item for item in approvals if item['destination'] == name), None)
            if approved:
                if digest(expected.encode()) != approved['source_record_sha256']:
                    errors.append(f'Approval source mismatch: {name}')
                if not path.exists() or digest(path.read_bytes()) != approved['approved_record_sha256']:
                    errors.append(f'Approved record drift: {name}')
                continue
            if not path.exists() or path.read_text() != expected:
                errors.append(f'Drift: {name}')
        manifest = json.loads(outputs['docs/migration.json'])
        for asset in manifest['assets']:
            if asset['status'] == 'downloaded':
                path = ROOT / asset['local_path']
                if not path.is_file() or path.stat().st_size != asset['bytes'] or digest(path.read_bytes()) != asset['sha256']:
                    errors.append(f'Archive integrity: {asset["local_path"]}')
        if errors:
            print('\n'.join(errors), file=sys.stderr)
            return 1
        print(json.dumps(manifest['counts']))
        print('Draft conversion, complete source mappings and original archive hashes verified; approvals unchanged.')
    else:
        # Preflight every existing record before any writes. Only the three initial
        # schema fixtures may be replaced on the first migration.
        previous = json.loads(MANIFEST.read_text())['record_hashes'] if MANIFEST.exists() else {}
        fixtures = {
            'src/content/film/film-east-of-eden/index.md': '712474939d0ec8cb027d47e629a234d65209f4968a7bd8dbe3784a492618ea87',
            'src/content/art-collections/artificial-landscapes/index.md': 'a617f67a50bf28cfca4cf897b7920478ebf262e5e5e6cc2503ac38b1cf7622c5',
            'src/content/pages/about/index.md': 'a200933a90f0b07e167b4ede81a68aaa27370f570541dbc7686226338ba97a11',
        }
        for name, content in outputs.items():
            path = ROOT / name
            if not path.exists() or path.read_text() == content or name == 'docs/migration.json':
                continue
            if name in previous:
                if digest(path.read_bytes()) != previous[name]:
                    errors.append(f'Edited record; refusing overwrite: {name}')
            elif digest(path.read_bytes()) != fixtures.get(name):
                errors.append(f'Existing record; refusing overwrite: {name}')
        if errors:
            print('\n'.join(errors), file=sys.stderr)
            return 1
        for name, content in outputs.items():
            path = ROOT / name
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_text(content)
        print(f'Wrote {len(outputs)-1} draft records and docs/migration.json. No media copied.')
    return 0


if __name__ == '__main__':
    sys.exit(main())
