// 오름차순 음계 (미완료 투두)
// 투두 줄 수: 1줄=도, 2줄=레, 3줄=미, ...
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
// 투두 줄 수: 1줄=도(같음), 2줄=시↓, 3줄=라↓, ...
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
  '#ff6b6b', // 도 - 빨강
  '#ffa94d', // 레 - 주황
  '#ffd43b', // 미 - 노랑
  '#69db7c', // 파 - 초록
  '#38d9a9', // 솔 - 청록
  '#4dabf7', // 라 - 파랑
  '#9775fa', // 시 - 보라
  '#f06595', // 도(높은) - 핑크
];

export function getNote(lineCount, completed) {
  const notes = completed ? DESCENDING : ASCENDING;
  const idx = Math.min(lineCount - 1, notes.length - 1);
  return { ...notes[Math.max(0, idx)], color: COLORS[Math.max(0, idx)] };
}

export function countLines(text) {
  if (!text || !text.trim()) return 1;
  return text.split('\n').filter(l => l.trim()).length;
}
