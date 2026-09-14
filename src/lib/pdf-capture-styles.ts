/** Applies PDF-only inline styles and returns an idempotent exact restoration. */
export function preparePdfCaptureStyles(element: HTMLElement): () => void {
  const originalElementStyle = element.style.cssText;
  const textElements = Array.from(
    element.querySelectorAll<HTMLElement>('span, p, h2, td, th'),
  );
  const originalTextStyles = textElements.map((textElement) => textElement.style.cssText);
  let restored = false;

  element.style.background = '#ffffff';
  element.style.color = '#111827';
  element.style.padding = '24px';

  textElements.forEach((textElement) => {
    if (!textElement.className.includes('text-[#D97757]') && !textElement.closest('.keep-color')) {
      textElement.style.setProperty('color', '#1f2937', 'important');
    }
  });

  return () => {
    if (restored) return;
    restored = true;
    element.style.cssText = originalElementStyle;
    textElements.forEach((textElement, index) => {
      textElement.style.cssText = originalTextStyles[index] ?? '';
    });
  };
}
