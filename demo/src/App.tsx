import React, { useRef, useState } from 'react';

import ImageEditor, {
  ImageEditorRef,
  ImageEditorSaveResult,
} from '@unlayer/react-image-editor';
import type { UnlayerLocale } from '@unlayer/types';

import Toolbar, { TOOL_NAMES, ToolName } from './Toolbar';

const SAMPLE_IMAGES = [
  'https://picsum.photos/id/1015/1200/800',
  'https://picsum.photos/id/1025/1200/800',
  'https://picsum.photos/id/1040/1200/800',
];

const allToolsEnabled = () =>
  Object.fromEntries(TOOL_NAMES.map((tool) => [tool, true])) as Record<
    ToolName,
    boolean
  >;

export default function App() {
  const editorRef = useRef<ImageEditorRef>(null);

  const [image, setImage] = useState(SAMPLE_IMAGES[0]);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [locale, setLocale] = useState<UnlayerLocale>('en');
  const [tools, setTools] =
    useState<Record<ToolName, boolean>>(allToolsEnabled);
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

  const toggleTool = (tool: ToolName) => {
    setTools((previous) => ({ ...previous, [tool]: !previous[tool] }));
    setStatus(`Tool "${tool}" toggled (remount)`);
  };

  return (
    <div className="app">
      <Toolbar
        theme={theme}
        onThemeChange={setTheme}
        locale={locale}
        onLocaleChange={setLocale}
        tools={tools}
        onToolToggle={toggleTool}
        status={status}
        onChangeImage={nextImage}
        onCheckChanges={checkChanges}
        onSnapshot={snapshot}
      />

      <main className="editor">
        <ImageEditor
          ref={editorRef}
          image={image}
          options={{
            theme,
            locale,
            features: { imageEditor: { tools } },
          }}
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
