# Gloam Review

Review stills and videos of Gloam VR work in progress, kept out of the main repo so its history stays light.

Pages:
- `index.html`: current work only (what Samuel is reviewing now), newest first.
- `archive.html`: the progress archive, every entry including superseded ones, newest first (for grant reviewers).
- `approach.html`: technology, method, what was retired and why, what comes next. Static text; update it by hand.

Shared code and style: `site.js` (renderer and full-screen viewer), `site.css`.

Add a review: put media in `media/<date>-<topic>/` and add an entry to `reviews.json` with `posted` (ISO time with offset, e.g. `2026-10-09T13:51-04:00`), shown on the pages in Montreal time, and `"status": "current"`.

Retire a review: do NOT delete it or its media. Set `"status": "archived"`, `"superseded_by": "<id of the entry that replaced it>"` and `"superseded_note"` (a few plain sentences: what replaced it and what we learned). Keep its original text and `posted` time unchanged. It leaves the main page and stays in the archive.
