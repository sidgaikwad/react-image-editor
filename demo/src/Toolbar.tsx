import React from 'react';

import type { UnlayerLocale } from '@unlayer/types';

export const TOOL_NAMES = [
  'crop',
  'resize',
  'filter',
  'draw',
  'text',
  'shapes',
  'stickers',
  'frame',
] as const;

export type ToolName = (typeof TOOL_NAMES)[number];

const LOCALES: { value: UnlayerLocale; label: string }[] = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Español' },
  { value: 'fr', label: 'Français' },
  { value: 'de', label: 'Deutsch' },
  { value: 'ja', label: '日本語' },
];

interface ToolbarProps {
  theme: 'light' | 'dark';
  onThemeChange(theme: 'light' | 'dark'): void;
  locale: UnlayerLocale;
  onLocaleChange(locale: UnlayerLocale): void;
  tools: Record<ToolName, boolean>;
  onToolToggle(tool: ToolName): void;
  status: string;
  onChangeImage(): void;
  onCheckChanges(): void;
  onSnapshot(): void;
}

export default function Toolbar(props: ToolbarProps) {
  return (
    <header className="toolbar">
      <div className="toolbar-row">
        <h1>React Image Editor</h1>

        <div className="group">
          <span className="group-label">Actions</span>
          <button onClick={props.onChangeImage}>Change image</button>
          <button onClick={props.onCheckChanges}>Has changes?</button>
          <button onClick={props.onSnapshot}>Snapshot</button>
        </div>

        <div className="group">
          <span className="group-label">Options (live)</span>
          <label>
            Theme{' '}
            <select
              value={props.theme}
              onChange={(event) =>
                props.onThemeChange(event.target.value as 'light' | 'dark')
              }
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </label>
          <label>
            Locale{' '}
            <select
              value={props.locale}
              onChange={(event) =>
                props.onLocaleChange(event.target.value as UnlayerLocale)
              }
            >
              {LOCALES.map((locale) => (
                <option key={locale.value} value={locale.value}>
                  {locale.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <span className="status">{props.status}</span>
      </div>

      <div className="toolbar-row">
        <div className="group">
          <span className="group-label">Tools (remounts editor)</span>
          {TOOL_NAMES.map((tool) => (
            <label key={tool} className="tool-toggle">
              <input
                type="checkbox"
                checked={props.tools[tool]}
                onChange={() => props.onToolToggle(tool)}
              />
              {tool}
            </label>
          ))}
        </div>
      </div>
    </header>
  );
}
