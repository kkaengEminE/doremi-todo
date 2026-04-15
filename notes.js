// 오름차순 음계 (미완료 투두)
export const ASCENDING = [
  { name: '도', freq: 261.63 }, // C4
  { name: '레', freq: 293.66 }, // D4
  { name: '미', freq: 329.63 }, // E4
  { name: '파', freq: 349.23 }, // F4
  { name: '솔', freq: 392.00 }, // G4
  { name: '라', freq: 440.00 }, // A4
  { name: '시', freq: 493.88 }, // B4
  { name: '도', freq: 523.25 }, // C5
];

// 내림차순 음계 (완료된 투두)
export const DESCENDING = [
  { name: '도', freq: 261.63 }, // C4
  { name: '시', freq: 246.94 }, // B3
  { name: '라', freq: 220.00 }, // A3
  { name: '솔', freq: 196.00 }, // G3
  { name: '파', freq: 174.61 }, // F3
  { name: '미', freq: 164.81 }, // E3
  { name: '레', freq: 146.83 }, // D3
  { name: '도', freq: 130.81 }, // C3
];

export const COLORS = [
  '#c0392b', // 도 - warm red
  '#d35400', // 레 - burnt orange
  '#c49f00', // 미 - golden
  '#27ae60', // 파 - forest green
  '#2e8b7a', // 솔 - teal
  '#2874a6', // 라 - deep blue
  '#7d3c98', // 시 - plum
  '#c0392b', // 높은도 - warm red
];

// 오선지 위 음표 Y위치 (px, 오선지 높이 37px 기준)
const STAFF_POSITIONS = [
  42,  // 도  - 오선지 아래
  36,  // 레  - 5번 줄
  31,  // 미  - 4-5번 사이
  27,  // 파  - 4번 줄
  22,  // 솔  - 3-4번 사이
  18,  // 라  - 3번 줄
  13,  // 시  - 2-3번 사이
   9,  // 높은도 - 2번 줄
];

export function getNote(lineCount, completed) {
  const notes = completed ? DESCENDING : ASCENDING;
  const idx = Math.min(lineCount - 1, notes.length - 1);
  const i = Math.max(0, idx);
  return { ...notes[i], color: COLORS[i], staffY: STAFF_POSITIONS[i], noteIndex: i };
}

// 텍스트 기반 줄 수 (프리렌더 추정용)
export function countLinesByText(text) {
  if (!text || !text.trim()) return 1;
  return text.split('\n').filter(l => l.trim()).length;
}

// DOM 요소의 시각적 줄 수 (렌더링 후 측정)
export function countVisualLines(element) {
  if (!element) return 1;
  const style = window.getComputedStyle(element);
  const lineHeight = parseFloat(style.lineHeight);
  if (!lineHeight || isNaN(lineHeight)) return 1;
  const height = element.getBoundingClientRect().height;
  const pt = parseFloat(style.paddingTop) || 0;
  const pb = parseFloat(style.paddingBottom) || 0;
  return Math.max(1, Math.round((height - pt - pb) / lineHeight));
}
