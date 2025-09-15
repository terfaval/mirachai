export function lockSize(el: HTMLElement | null, on: boolean) {
  if (!el) return;
  if (on) {
    const rect = el.getBoundingClientRect();
    el.style.width = `${rect.width}px`;
    el.style.height = `${rect.height}px`;
  } else {
    el.style.removeProperty('width');
    el.style.removeProperty('height');
  }
}