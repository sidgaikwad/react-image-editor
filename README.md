# React Image Editor

[![npm version](https://img.shields.io/npm/v/@unlayer/react-image-editor.svg)](https://www.npmjs.com/package/@unlayer/react-image-editor)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![CI](https://github.com/unlayer/react-image-editor/actions/workflows/ci.yml/badge.svg)](https://github.com/unlayer/react-image-editor/actions/workflows/ci.yml)

The excellent [Unlayer Image Editor](https://unlayer.com) as a React.js wrapper component — crop, resize, draw, text, shapes, stickers, frames, filters, and an optional AI assistant.

|         |                                                                                                        |
| ------- | ------------------------------------------------------------------------------------------------------ |
| Sibling | [react-email-editor](https://github.com/unlayer/react-email-editor) — Unlayer's email editor for React |

## Installation

```sh
npm install @unlayer/react-image-editor
```

## Usage

Requires React >= 18.

```jsx
import React, { useRef } from 'react';
import ImageEditor from '@unlayer/react-image-editor';

const App = () => {
  const editorRef = useRef(null);

  return (
    <ImageEditor
      ref={editorRef}
      image="https://example.com/photo.jpg"
      options={{ projectId: 1234, theme: 'light' }}
      onSave={({ dataUrl, blob }) => {
        // Persist the edited image
        console.info('Saved', dataUrl.length, 'bytes');
      }}
      onCancel={() => console.info('Editing cancelled')}
    />
  );
};
```

The component works out of the box in React Server Components environments (e.g. Next.js App Router) — it ships with the `'use client'` directive and touches the DOM only inside effects.

## Props

| Prop          | Type                          | Description                                                                                                                                                                                                    |
| ------------- | ----------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `image`       | `string` (required)           | Image URL or base64 data URL to edit.                                                                                                                                                                          |
| `options`     | `ImageEditorOptions`          | Editor configuration: `projectId`, `user`, `features`, `theme`, `locale`, `translations`, `env`, `offline`, `licenseUrl`, `defaultPrompt`, `autoSubmitPrompt`, `aiAssistantOpenState`.                         |
| `editorId`    | `string`                      | id for the container div. Cosmetic — the editor mounts by element reference.                                                                                                                                   |
| `minHeight`   | `number \| string`            | Minimum height of the editor container. Defaults to `500`.                                                                                                                                                     |
| `style`       | `CSSProperties`               | Styles applied to the container div.                                                                                                                                                                           |
| `scriptUrl`   | `string`                      | Override the embed script URL. Defaults to `https://cdn.unlayer.com/image-editor/embed.js`. One embed per page — the first loader to run wins globally, so don't mix different `scriptUrl`s across components. |
| `onLoad`      | `(editor) => void`            | Called with the editor instance once it is mounted.                                                                                                                                                            |
| `onSave`      | `({ dataUrl, blob }) => void` | Called when the user saves the edited image.                                                                                                                                                                   |
| `onCancel`    | `() => void`                  | Called when the user cancels editing.                                                                                                                                                                          |
| `onLoadError` | `() => void`                  | Called when the image fails to load into the canvas (CORS, 404, decode error).                                                                                                                                 |
| `onError`     | `(error: Error) => void`      | Wrapper-level failures: embed script load, editor creation, or image reset. Falls back to `console.error` when absent.                                                                                         |

## Editor instance (ref)

The `ref` exposes `{ editor }` — `null` until the editor mounts, then an instance with:

| Method                   | Description                                                                  |
| ------------------------ | ---------------------------------------------------------------------------- |
| `getImage()`             | Current canvas as a data URL (flattened), or `null`.                         |
| `hasChanges()`           | Whether there are unsaved edits.                                             |
| `reset(imageUrl?)`       | Reset editor state (clears undo/redo and chat), optionally load a new image. |
| `updateOptions(partial)` | Update options like `theme` / `locale` at runtime.                           |
| `destroy()`              | Unmount the editor (the component does this automatically on unmount).       |

```jsx
const dataUrl = editorRef.current?.editor?.getImage();
```

## How prop changes are applied

| Change                                                       | Behavior                                                                                                                                 |
| ------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `image`                                                      | Applied via `reset(newImage)` — **clears undo/redo history and AI chat**. Rapid changes are serialized and collapse to the latest value. |
| `options.theme`, `options.locale`, `options.translations`    | Applied via `updateOptions()` — no remount, editor state preserved.                                                                      |
| Any other `options` key, `scriptUrl`                         | Full remount — the editor is destroyed and recreated with the new configuration.                                                         |
| `onSave` / `onCancel` / `onLoadError` / `onLoad` / `onError` | Always call the latest handler; changing them never remounts.                                                                            |

## Error handling

Two distinct channels:

- **`onLoadError`** — the editor loaded fine, but the _image_ couldn't be loaded into the canvas (CORS, dead URL, decode error).
- **`onError`** — the wrapper couldn't reach a working editor: the embed script failed to load, editor creation was rejected, or re-applying a changed `image` failed. After a CDN failure the wrapper automatically resets its loader state, so a later remount retries from scratch.

## AI Assistant

The editor includes an optional AI assistant (chat-based edits, magic image). It requires a `projectId` from your [Unlayer account](https://dashboard.unlayer.com) with the feature enabled:

```jsx
<ImageEditor
  image={url}
  options={{
    projectId: 1234,
    features: { ai: { enabled: true, assistant: true } },
  }}
/>
```

## Localization

Set `options.locale` (bundled: `en`, `es`, `fr`, `de`, `it`, `pt`, `nl`, `ja`, `ko`, `zh`) and optionally override strings with `options.translations`.

## Demo

A Vite-based demo lives in [`demo/`](demo):

```sh
cd demo
npm install
npm run dev
```

## License

Copyright (c) 2026 Unlayer. [MIT](LICENSE) Licensed.
