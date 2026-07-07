const defaultScriptUrl = 'https://cdn.unlayer.com/image-editor/embed.js';

// One in-flight/settled promise per script URL so any number of components
// share a single <script> tag.
const loadPromises = new Map<string, Promise<void>>();

const findScriptTag = (scriptUrl: string): HTMLScriptElement | null => {
  const scripts = Array.from(document.querySelectorAll('script'));
  return scripts.find((script) => script.src.includes(scriptUrl)) ?? null;
};

/**
 * Load the image editor embed script. Resolves once window.ImageEditor is
 * available; rejects if the script fails to load.
 */
export const loadScript = (
  scriptUrl: string = defaultScriptUrl
): Promise<void> => {
  // The embed loader assigns window.ImageEditor synchronously while
  // embed.js evaluates, so its presence means the script already ran
  // (whether we injected it or the host page did).
  if (window.ImageEditor) {
    return Promise.resolve();
  }

  const cached = loadPromises.get(scriptUrl);
  if (cached) {
    return cached;
  }

  const promise = new Promise<void>((resolve, reject) => {
    // Reuse a host-injected tag that hasn't loaded yet instead of
    // injecting a duplicate.
    let tag = findScriptTag(scriptUrl);
    if (!tag) {
      tag = document.createElement('script');
      tag.src = scriptUrl;
      document.head.appendChild(tag);
    }
    const script = tag;

    script.addEventListener(
      'load',
      () => {
        // Prefetch the versioned bundle so the first createEditor doesn't
        // pay a second network hop. A prefetch failure is swallowed here —
        // the same failure surfaces through createEditor's rejection.
        window.ImageEditor?.load().catch(() => {});
        resolve();
      },
      { once: true }
    );

    script.addEventListener(
      'error',
      () => {
        // A tag that fired `error` never fires again — evict the cache and
        // remove the dead tag so a retry injects a fresh one.
        loadPromises.delete(scriptUrl);
        script.remove();
        reject(
          new Error(
            `Failed to load the image editor embed script: ${scriptUrl}`
          )
        );
      },
      { once: true }
    );
  });

  loadPromises.set(scriptUrl, promise);
  return promise;
};

/**
 * Hard-reset the embed loader. The CDN loader caches its versioned-bundle
 * promise forever — including rejections — so after a bundle-load failure
 * the only way to retry is to reload embed.js with fresh module state.
 * Removes the embed script tag, deletes window.ImageEditor, and evicts the
 * cached load promise; the next loadScript call starts from scratch.
 */
export const resetLoader = (scriptUrl: string = defaultScriptUrl): void => {
  loadPromises.delete(scriptUrl);
  findScriptTag(scriptUrl)?.remove();
  delete window.ImageEditor;
};
