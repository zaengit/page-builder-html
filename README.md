# Visual HTML Page Builder

A 100% client-side React + TypeScript visual editor for existing HTML files and small HTML/CSS/JS projects. Files stay in the browser: import uses the File API, editing uses the iframe DOM/CSSOM, autosave/revisions use browser storage, and export uses Blob URLs.

## Run

```bash
npm install
npm run dev
```

## Security model

The canvas iframe uses `sandbox="allow-same-origin allow-scripts"` because the editor must synchronously access `iframe.contentDocument` and project-local JavaScript files are supported in preview. Before rendering, imported inline `<script>` code and inline event-handler attributes such as `onclick` are disabled, and unresolved/external script sources are blocked. Only JavaScript files that are explicitly part of the imported browser workspace are injected into the preview. Forms and ordinary navigation are prevented by the editor, while popups and top navigation are not granted by the sandbox.

This is a visual editing preview, not a general-purpose secure HTML execution environment. Project JavaScript should be treated as trusted project code. External passive resources such as images, fonts, and stylesheets may still be requested by the iframe, so opening untrusted HTML can disclose the browser IP/user agent to third-party resource hosts.

## Builder features

- Visual iframe editing with click selection, tree navigation, drag/drop insertion and block reordering.
- Content, attribute, inline CSS, page CSS, class, responsive layout and pseudo-state editing.
- Desktop, tablet and mobile responsive CSS editing.
- HTML/CSS/JS workspace with Monaco raw editing and project-folder import.
- HTML/file export plus full project ZIP export.
- Browser autosave, undo/redo and manual revision snapshots.
- Page metadata editing for title, description and favicon.
- Keyboard commands for undo/redo, duplicate, copy/paste, move and delete.

## Architecture

React UI lives in `src/components` and `src/panels`; the DOM editor engine is separated into `src/editor`. Elements receive temporary `data-vpb-id` identifiers for synchronization between the iframe and tree. Export clones the DOM and removes editor-only `data-vpb-*` metadata while restoring original workspace links/scripts before serialization.

Property panels are capability-driven. `analyzeElement()` combines tag name, direct text nodes, children, attributes, and computed styles, so behavior is not hard-coded solely by tag. Text editing changes only direct text nodes and preserves nested markup.

History stores bounded DOM snapshots around grouped UI edits (property fields commit on blur/change rather than every keystroke), covering styles, attributes, text, images, deletion, duplication, reordering and responsive design changes.