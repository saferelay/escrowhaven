export function openCentered(url: string, w = 480, h = 720, name = 'Onramp') {
    const width  = window.outerWidth  ?? 1024;
    const height = window.outerHeight ?? 768;
    const left = Math.max(0, (width  - w) / 2);
    const top  = Math.max(0, (height - h) / 2);
    return window.open(url, name, `width=${w},height=${h},left=${left},top=${top}`);
  }
  