#!/usr/bin/env python3
"""Inject Android TTS Bridge into index.html for WebView speech synthesis."""
import os, sys

HTML_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)),
    'app', 'src', 'main', 'assets', 'www', 'index.html')

TTS_BRIDGE = """
<script>
(function() {
  var AndroidTTS = null;
  try { AndroidTTS = window.AndroidTTS; } catch(e) {}
  if (AndroidTTS && AndroidTTS.speak) {
    window.speechSynthesis = {
      speak: function(u) { if (u && u.text) AndroidTTS.speak(u.text); },
      cancel: function() { if (AndroidTTS.cancel) AndroidTTS.cancel(); },
      pause: function() {}, resume: function() {},
      getVoices: function() { return []; },
      pending: false, speaking: false, paused: false,
      onvoiceschanged: null,
      addEventListener: function() {}, removeEventListener: function() {},
      dispatchEvent: function() { return false; }
    };
    window.SpeechSynthesisUtterance = function(text) {
      this.text = text; this.lang = 'en-US'; this.rate = 1;
      this.pitch = 1; this.volume = 1; this.voice = null;
      this.onend = null; this.onerror = null; this.onstart = null;
    };
  }
})();
</script>
"""

def main():
    if not os.path.exists(HTML_PATH):
        print('[ERROR] HTML not found: ' + HTML_PATH); sys.exit(1)
    with open(HTML_PATH, 'r', encoding='utf-8') as f:
        html = f.read()

    # Inject TTS bridge before </head>
    if 'AndroidTTS' not in html:
        html = html.replace('</head>', TTS_BRIDGE + '\n</head>')
        print('[OK] TTS Bridge injected')
    else:
        print('[SKIP] TTS Bridge already present')

    with open(HTML_PATH, 'w', encoding='utf-8') as f:
        f.write(html)

if __name__ == '__main__':
    main()
