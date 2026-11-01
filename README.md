# margaux-ch.com — first website scaffold

This is a **working front-end scaffold**, not yet connected to Are.na. All content arrays are deliberately empty rather than publishing unapproved images. It includes:

- Homepage: one random large image per visit; avoids repeating the previous image when there is more than one.
- Navigation: photos, videos, projects, things i find pretty, memory triggers, about me, instagram.
- Project gallery pages and image-to-project links.
- Pretty and memory viewers: random starting image, arrows, keyboard controls, captions.
- Mobile menu and responsive layout.

## Preview safely

From this folder run `python3 -m http.server 8000`, then visit http://localhost:8000. Don't overwrite the existing live `index.html` until ready.

## Content format

Edit `data/content.json` for initial testing. Example image object:

`{"src":"./images/example.jpg","caption":"Untitled, 2026","project":"project-slug"}`

A project in `photos`, `videos`, or `projects` looks like:

`{"slug":"project-slug","title":"Project name","description":"Short description","cover":{"src":"./images/cover.jpg"},"images":[{"src":"./images/cover.jpg","caption":"Image caption"}]}`

`pretty` and `memory` are arrays of image objects.

## Are.na integration (next phase)

Source channels:
- Home: private `WEBSITE — HOME` (channel identifier still needed)
- Photos/videos/projects: private project channels (identifiers still needed)
- Pretty: https://www.are.na/mx-ch/belles-choses
- Memory: https://www.are.na/mx-ch/memory-triggers-sluo8qbvjka

A future authenticated GitHub Actions sync will generate `data/content.json` and publish only approved images. Store the Are.na API token as an Actions secret, **never** in the front-end. Confirm publication rights for third-party images, particularly from collections. Instagram profile URL still needed.

Do not commit any personal access tokens or raw private Are.na channel exports.

## Added: authenticated Are.na sync test

`python3 scripts/sync_arena.py` fetches the five confirmed channel slugs using
`ARENA_TOKEN` from the environment and writes `data/content.json`.

The included `.github/workflows/sync-arena.yml` is **manual-only**. Run it in
GitHub → Actions → Preview Are.na content sync → Run workflow. It uploads the
result as a short-lived workflow artifact; it **does not publish** private
content to the live website or commit it to the repository.

IMPORTANT: Generated JSON and image URLs become publicly accessible if you
publish them to GitHub Pages. Review the JSON and third-party image rights first.
The script intentionally ignores non-image blocks in Pretty/Memory, and only
reads the first 100 items per channel. It assumes project channels are connected
to their parent Photos or Projects channel. Image CDN URL shapes have not yet
been tested against an authenticated private-channel response.
