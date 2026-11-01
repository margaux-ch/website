#!/usr/bin/env python3
"""Publish an explicitly selected subset of private Are.na content as public site data.

Only run on a repository/branch intended for publishing. The output is public.
"""
import json
import os
from pathlib import Path
from urllib.request import Request, urlopen
from urllib.parse import quote

ROOT = Path(__file__).resolve().parents[1]
API = 'https://api.are.na/v3'
CHANNELS = {
    'home': 'website-home-bcopro9yvre',
    'photos': 'website-photography-tebfw1mo95i',
    'projects': 'website-projects-ptf6x2dvqsc',
    'pretty': 'belles-choses',
    'memory': 'memory-triggers-sluo8qbvjka',
}
TOKEN = os.environ.get('ARENA_TOKEN')
if not TOKEN:
    raise SystemExit('Missing ARENA_TOKEN GitHub Actions secret')


def get(path):
    req = Request(API + path, headers={
        'Authorization': 'Bearer ' + TOKEN,
        'Accept': 'application/json',
        'User-Agent': 'MargauxPortfolioSync/0.1 (+https://margaux-ch.com)',
    })
    with urlopen(req, timeout=35) as res:
        return json.load(res)


def contents(slug):
    # Deliberately first page only; Are.na recommends bounded requests.
    response = get('/channels/' + quote(slug) + '/contents?per=100&sort=position')
    if response.get('meta', {}).get('has_more_pages'):
        print(f'WARNING: {slug} has more than 100 items; only first page published')
    return response.get('data', [])


def plain(value):
    if isinstance(value, dict):
        return value.get('plain') or value.get('markdown') or ''
    return value if isinstance(value, str) else ''


def url_from(obj):
    if isinstance(obj, str):
        return obj if obj.startswith('https://') else ''
    if isinstance(obj, dict):
        for key in ('url', 'src', 'display', 'large', 'original', 'medium', 'thumb'):
            found = url_from(obj.get(key))
            if found:
                return found
    return ''


def picture(block):
    if block.get('type') != 'Image' or block.get('state') not in ('available', None):
        return None
    src = url_from(block.get('image'))
    if not src:
        print('WARNING: no image URL for block', block.get('id'))
        return None
    return {
        'src': src,
        'caption': block.get('title') or plain(block.get('description')),
        'alt': block.get('alt_text') or block.get('title') or '',
        'block_id': block.get('id'),
    }


def channel_item(item):
    return item.get('type') == 'Channel' and bool(item.get('slug'))


def projects_in(parent, kind):
    projects = []
    for child in contents(parent):
        if not channel_item(child):
            continue
        slug = child['slug']
        gallery = [x for b in contents(slug) if (x := picture(b))]
        if not gallery:
            print('WARNING: no images in project', slug)
        projects.append({
            'slug': slug,
            'title': child.get('title') or slug,
            'description': plain(child.get('description')),
            'cover': gallery[0] if gallery else {},
            'images': gallery,
        })
    print(kind, len(projects), 'projects')
    return projects


def main():
    photos = projects_in(CHANNELS['photos'], 'photos')
    projects = projects_in(CHANNELS['projects'], 'projects')
    all_projects = photos + projects
    ownership = {}
    for project in all_projects:
        for image in project['images']:
            ownership.setdefault(image['block_id'], project['slug'])
    home = []
    for block in contents(CHANNELS['home']):
        image = picture(block)
        if image:
            if image['block_id'] in ownership:
                image['project'] = ownership[image['block_id']]
            else:
                print('WARNING: homepage image has no linked project:', image['block_id'])
            home.append(image)
    data = {
        'home': home,
        'photos': photos,
        'videos': [],  # Waiting for a WEBSITE — VIDEOS channel
        'projects': projects,
        'pretty': [x for b in contents(CHANNELS['pretty']) if (x := picture(b))],
        'memory': [x for b in contents(CHANNELS['memory']) if (x := picture(b))],
        'about': '',
        'instagram': '',  # Set only after Instagram profile URL is confirmed
    }
    # Images are deliberately referenced by CDN URL, not downloaded or re-hosted.
    # Check image permissions, CDN accessibility, and hotlink behavior before publication.
    target = ROOT / 'data' / 'content.json'
    target.parent.mkdir(exist_ok=True)
    target.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n')
    print('Wrote', target, 'with', len(home), 'homepage images')


if __name__ == '__main__':
    main()
