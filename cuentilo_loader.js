/* Cuentilo P7C: on-demand Story assets; stable legacy globals/IDs. */
window.CuentiloModules = (() => {
  'use strict';
  const VERSION = '07a8p11';
  const storyAssets = [
    ['stories/catalog.js', 'PALABRA_STORY_CATALOG'],
    ['lexicon.js', 'PALABRA_LEXICON'],
    ['story_vocabulary.js', 'PALABRA_STORY_VOCABULARY'],
    ['stories.js', 'PalabraStories']
  ];
  let storiesPromise = null;
  function loadScript(file) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = new URL(file + '?v=' + VERSION, document.baseURI).href;
      script.async = false;
      script.onload = () => resolve();
      script.onerror = () => {
        script.remove();
        reject(new Error('Die Datei ' + file + ' konnte nicht geladen werden. Bitte Internetverbindung prüfen.'));
      };
      document.head.appendChild(script);
    });
  }
  async function loadStories() {
    if (window.PalabraStories && window.PALABRA_STORY_CATALOG && window.PALABRA_LEXICON) return;
    for (const [file, globalName] of storyAssets) {
      if (!window[globalName]) await loadScript(file);
      if (!window[globalName]) throw new Error(file + ' wurde geladen, aber die benötigten Daten fehlen.');
    }
  }
  return {
    stories() {
      if (!storiesPromise) storiesPromise = loadStories().catch(error => {
        storiesPromise = null; // Permit a retry after an interrupted download.
        throw error;
      });
      return storiesPromise;
    }
  };
})();
