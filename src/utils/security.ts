/**
 * Security Baseline Controls for NyumbaniKisii Portal
 * Implements: DevTools blocking, context menu/drag prevention, screenshot/blur protection,
 * watermark generation, iframe clickjacking protection, and URL parameter sanitization.
 */

// 1. Watermark Data URL Generator
export const getWatermarkDataUrl = (text: string): string => {
  const canvas = document.createElement('canvas');
  canvas.width = 280;
  canvas.height = 140;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.rotate(-20 * Math.PI / 180);
    ctx.font = 'bold 11px monospace';
    ctx.fillStyle = 'rgba(156, 163, 175, 0.12)'; // faint gray watermark
    ctx.fillText(text, 15, 90);
  }
  return canvas.toDataURL();
};

export const updateWatermarkStyle = (email?: string) => {
  const text = email ? `${email} (Nyumbanikisii)` : 'Nyumbanikisii';
  const dataUrl = getWatermarkDataUrl(text);
  document.documentElement.style.setProperty('--watermark-image', `url(${dataUrl})`);
};

// 2. DevTools Blocking and Tab Freezing
const freezeTab = () => {
  try {
    localStorage.clear();
    sessionStorage.clear();
  } catch (e) {
    // Ignore storage clear errors
  }
  // Infinite loop to lock up the browser thread (Freeze the tab)
  while (true) {
    // This will deliberately hang the tab to prevent inspection
  }
};

const detectDevTools = () => {
  // Check if window bounds indicate an open docked devtools
  const threshold = 160;
  const widthDiff = window.outerWidth - window.innerWidth;
  const heightDiff = window.outerHeight - window.innerHeight;
  
  if (
    (widthDiff > threshold || heightDiff > threshold) &&
    !/Mobi|Android|iPhone/i.test(navigator.userAgent)
  ) {
    freezeTab();
  }
};

export const initSecurityBaseline = (currentUserEmail?: string) => {
  // 1. Iframe Clickjacking Protection
  if (window.self !== window.top) {
    try {
      window.top!.location.href = window.self.location.href;
    } catch (e) {
      window.self.location.href = 'about:blank';
    }
  }

  // 2. Malicious URL Parameter Detection
  const queryParams = window.location.search.toLowerCase();
  const hasXSS = queryParams.includes('<script>') || queryParams.includes('javascript:') || queryParams.includes('alert(');
  const hasSQL = queryParams.includes('select ') || queryParams.includes('select+') || 
                 queryParams.includes('union ') || queryParams.includes('union+') || 
                 queryParams.includes('insert ') || queryParams.includes('delete ');
                 
  if (hasXSS || hasSQL) {
    // Redirect immediately to clean URL
    window.location.href = window.location.origin + window.location.pathname;
    return;
  }

  // 3. Set Initial Watermark Style
  updateWatermarkStyle(currentUserEmail);

  // 4. Keyboard Key Interception (F12, Ctrl+Shift+I/J/C, Ctrl+U)
  const handleKeyDown = (e: KeyboardEvent) => {
    // F12 key
    if (e.keyCode === 123) {
      e.preventDefault();
      freezeTab();
    }
    // Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C
    if (e.ctrlKey && e.shiftKey && (e.keyCode === 73 || e.keyCode === 74 || e.keyCode === 67)) {
      e.preventDefault();
      freezeTab();
    }
    // Ctrl+U (View Source)
    if (e.ctrlKey && e.keyCode === 85) {
      e.preventDefault();
      freezeTab();
    }
  };
  window.addEventListener('keydown', handleKeyDown);

  // 5. Print Screen Protection (Ctrl+P)
  const handleBeforePrint = () => {
    document.body.classList.add('print-shield-active');
  };
  const handleAfterPrint = () => {
    document.body.classList.remove('print-shield-active');
  };
  window.addEventListener('beforeprint', handleBeforePrint);
  window.addEventListener('afterprint', handleAfterPrint);

  // 6. Screenshot / Window Blur Protection (Focus/Blur listeners)
  const handleWindowBlur = () => {
    document.body.classList.add('window-blurred');
  };
  const handleWindowFocus = () => {
    document.body.classList.remove('window-blurred');
  };
  window.addEventListener('blur', handleWindowBlur);
  window.addEventListener('focus', handleWindowFocus);

  // 7. Context Menu & Drag-Drop Prevention for Images
  const handleContextMenu = (e: MouseEvent) => {
    if ((e.target as HTMLElement).tagName === 'IMG') {
      e.preventDefault();
    }
  };
  const handleDragStart = (e: DragEvent) => {
    if ((e.target as HTMLElement).tagName === 'IMG') {
      e.preventDefault();
    }
  };
  window.addEventListener('contextmenu', handleContextMenu);
  window.addEventListener('dragstart', handleDragStart);

  // 8. Continuous Debugger & Docked DevTools Checker
  const devtoolsInterval = setInterval(() => {
    // Infinite Debugger Check
    const start = performance.now();
    debugger; // Stops execution here if DevTools is open
    const end = performance.now();
    if (end - start > 100) {
      freezeTab();
    }
    
    // Bounds Check
    detectDevTools();
  }, 500);

  // Return cleanup function
  return () => {
    window.removeEventListener('keydown', handleKeyDown);
    window.removeEventListener('beforeprint', handleBeforePrint);
    window.removeEventListener('afterprint', handleAfterPrint);
    window.removeEventListener('blur', handleWindowBlur);
    window.removeEventListener('focus', handleWindowFocus);
    window.removeEventListener('contextmenu', handleContextMenu);
    window.removeEventListener('dragstart', handleDragStart);
    clearInterval(devtoolsInterval);
  };
};

/**
 * Sanitizes input text to strip HTML tags and prevent XSS (Cross-Site Scripting) injections.
 * Standard React handles escaping naturally, but this cleans raw input values as an extra layer of defense.
 */
export function sanitizeInput(text: string): string {
  if (!text) return '';
  return text
    // Replace html tags (anything between < and >)
    .replace(/<[^>]*>/g, '')
    // Replace script block handlers or event tags (e.g. onerror, onload, javascript:)
    .replace(/javascript\s*:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    // Basic character escape for high risk entities
    .replace(/'/g, '&#x27;')
    .replace(/"/g, '&quot;')
    .trim();
}
