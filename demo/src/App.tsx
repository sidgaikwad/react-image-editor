import React, { useRef, useState } from 'react';

import ImageEditor, {
  ImageEditorRef,
  ImageEditorSaveResult,
} from '@unlayer/react-image-editor';
import type { UnlayerLocale } from '@unlayer/types';

const SAMPLE_IMAGES = [
  'https://picsum.photos/id/1015/1200/800',
  'https://picsum.photos/id/1025/1200/800',
  'https://picsum.photos/id/1040/1200/800',
];

export default function App() {
  const editorRef = useRef<ImageEditorRef>(null);

  const [image, setImage] = useState(SAMPLE_IMAGES[0]);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [locale, setLocale] = useState<UnlayerLocale>('en');
  const [saved, setSaved] = useState<ImageEditorSaveResult | null>(null);
  const [status, setStatus] = useState('Loading editor…');

  const nextImage = () => {
    const index = SAMPLE_IMAGES.indexOf(image);
    setImage(SAMPLE_IMAGES[(index + 1) % SAMPLE_IMAGES.length]);
    setStatus('Image changed (reset)');
  };

  const checkChanges = () => {
    const editor = editorRef.current?.editor;
    if (!editor) return;
    setStatus(editor.hasChanges() ? 'Unsaved changes' : 'No unsaved changes');
  };

  const snapshot = () => {
    const dataUrl = editorRef.current?.editor?.getImage();
    if (dataUrl) {
      setSaved({ dataUrl, blob: new Blob() });
      setStatus('Snapshot taken via getImage()');
    }
  };

  return (
    <div className="app">
      <header className="toolbar">
        <h1>React Image Editor</h1>
        <div className="controls">
          <button onClick={nextImage}>Change image</button>
          <button onClick={checkChanges}>Has changes?</button>
          <button onClick={snapshot}>Snapshot</button>
          <label>
            Theme{' '}
            <select
              value={theme}
              onChange={(event) =>
                setTheme(event.target.value as 'light' | 'dark')
              }
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </label>
          <label>
            Locale{' '}
            <select
              value={locale}
              onChange={(event) =>
                setLocale(event.target.value as UnlayerLocale)
              }
            >
              <option value="en">English</option>
              <option value="es">Español</option>
              <option value="fr">Français</option>
              <option value="de">Deutsch</option>
            </select>
          </label>
          <span className="status">{status}</span>
        </div>
      </header>

      <main className="editor">
        <ImageEditor
          ref={editorRef}
          image={image}
          options={{ theme, locale }}
          onLoad={() => setStatus('Editor ready')}
          onSave={(result) => {
            setSaved(result);
            setStatus('Saved!');
          }}
          onCancel={() => setStatus('Cancelled')}
          onLoadError={() => setStatus('Image failed to load')}
          onError={(error) => setStatus(`Error: ${error.message}`)}
        />
      </main>

      {saved && (
        <aside className="preview">
          <div className="preview-header">
            <h2>Saved result</h2>
            <a href={saved.dataUrl} download="edited-image.png">
              Download
            </a>
            <button onClick={() => setSaved(null)}>Close</button>
          </div>
          <img src={saved.dataUrl} alt="Saved result" />
        </aside>
      )}
    </div>
  );
}
