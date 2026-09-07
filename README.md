# Visual HTML Page Builder

A 100% client-side React + TypeScript visual editor for existing HTML files. Files stay in the browser: import uses the File API, editing uses the iframe DOM/CSSOM, and export uses Blob URLs.

## Run

```bash
npm install
npm run dev
```

## Security model

The canvas iframe uses `sandbox="allow-same-origin"` and intentionally **does not** grant `allow-scripts`, `allow-forms`, `allow-popups`, or top-navigation permissions. `allow-same-origin` is necessary because the editor must synchronously access `iframe.contentDocument` to inspect and mutate the uploaded DOM. Scripts in imported HTML therefore do not execute, inline event handlers cannot run, forms cannot submit, and popups/top navigation are blocked by the sandbox. Canvas click/submit handlers also prevent normal navigation during editing.

Trade-off: external passive resources such as images, fonts, and stylesheets may still be requested by the iframe, so importing untrusted HTML can disclose the browser IP/user agent to third-party resource hosts. A stricter offline mode could strip or proxy external URLs, but proxying would require a backend and stripping them would reduce fidelity. Never add both `allow-scripts` and `allow-same-origin` for arbitrary uploaded HTML; that combination would substantially weaken isolation.

## Architecture

React UI lives in `src/components` and `src/panels`; the DOM editor engine is separated into `src/editor`. Elements receive temporary `data-vpb-id` identifiers for synchronization between the iframe and tree. Export clones the DOM and removes all `data-vpb-*` metadata plus injected editor styles before serialization.

Property panels are capability-driven. `analyzeElement()` combines tag name, direct text nodes, children, attributes, and computed styles, so behavior is not hard-coded solely by tag. Text editing changes only direct text nodes and preserves nested markup.

History stores bounded DOM snapshots around grouped UI edits (property fields commit on blur/change rather than every keystroke), covering styles, attributes, text, images, deletion, duplication, and reordering.