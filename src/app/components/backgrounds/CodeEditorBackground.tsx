'use client';

import { useRef } from 'react';
import { useCanvasAnimation } from './useCanvasAnimation';

type TokenType = 'keyword' | 'string' | 'comment' | 'fn' | 'punct' | 'plain';

interface Token {
  text: string;
  type: TokenType;
}

const COLORS: Record<TokenType, string> = {
  keyword: '127, 231, 214',
  string: '224, 169, 61',
  comment: '148, 158, 156',
  fn: '245, 245, 245',
  punct: '150, 165, 163',
  plain: '200, 210, 208'
};

const CODE_LINES: Token[][] = [
  [{ text: 'const', type: 'keyword' }, { text: ' ', type: 'plain' }, { text: 'drone', type: 'plain' }, { text: ' = ', type: 'punct' }, { text: 'new', type: 'keyword' }, { text: ' ', type: 'plain' }, { text: 'DroneController', type: 'fn' }, { text: '(4)', type: 'punct' }, { text: ';', type: 'punct' }],
  [{ text: 'async', type: 'keyword' }, { text: ' ', type: 'plain' }, { text: 'function', type: 'keyword' }, { text: ' ', type: 'plain' }, { text: 'fetchProjects', type: 'fn' }, { text: '() {', type: 'punct' }],
  [{ text: '  const', type: 'keyword' }, { text: ' res = ', type: 'plain' }, { text: 'await', type: 'keyword' }, { text: ' fetch(', type: 'plain' }, { text: "'/api/projects'", type: 'string' }, { text: ');', type: 'punct' }],
  [{ text: '  return', type: 'keyword' }, { text: ' res.', type: 'plain' }, { text: 'json', type: 'fn' }, { text: '();', type: 'punct' }],
  [{ text: '}', type: 'punct' }],
  [{ text: '', type: 'plain' }],
  [{ text: '// keep the swarm in formation', type: 'comment' }],
  [{ text: 'class', type: 'keyword' }, { text: ' ', type: 'plain' }, { text: 'DroneController', type: 'fn' }, { text: ' {', type: 'punct' }],
  [{ text: '  constructor', type: 'fn' }, { text: '(altitude) {', type: 'punct' }],
  [{ text: '    this', type: 'keyword' }, { text: '.altitude = altitude;', type: 'plain' }],
  [{ text: '  }', type: 'punct' }],
  [{ text: '  takeOff', type: 'fn' }, { text: '() {', type: 'punct' }],
  [{ text: '    console.', type: 'plain' }, { text: 'log', type: 'fn' }, { text: '(', type: 'punct' }, { text: "'Ascending...'", type: 'string' }, { text: ');', type: 'punct' }],
  [{ text: '  }', type: 'punct' }],
  [{ text: '}', type: 'punct' }],
  [{ text: '', type: 'plain' }],
  [{ text: 'export', type: 'keyword' }, { text: ' ', type: 'plain' }, { text: 'default', type: 'keyword' }, { text: ' ', type: 'plain' }, { text: 'function', type: 'keyword' }, { text: ' ', type: 'plain' }, { text: 'App', type: 'fn' }, { text: '() {', type: 'punct' }],
  [{ text: '  const', type: 'keyword' }, { text: ' [data, setData] = ', type: 'plain' }, { text: 'useState', type: 'fn' }, { text: '(', type: 'punct' }, { text: 'null', type: 'keyword' }, { text: ');', type: 'punct' }],
  [{ text: '  useEffect', type: 'fn' }, { text: '(() => {', type: 'punct' }],
  [{ text: '    fetchProjects', type: 'fn' }, { text: '().', type: 'punct' }, { text: 'then', type: 'fn' }, { text: '(setData);', type: 'punct' }],
  [{ text: '  }, []);', type: 'punct' }],
  [{ text: '  return', type: 'keyword' }, { text: ' <Dashboard data={data} />;', type: 'plain' }],
  [{ text: '}', type: 'punct' }],
  [{ text: '', type: 'plain' }],
  [{ text: 'SELECT', type: 'keyword' }, { text: ' * ', type: 'plain' }, { text: 'FROM', type: 'keyword' }, { text: ' projects ', type: 'plain' }, { text: 'WHERE', type: 'keyword' }, { text: " status = 'active';", type: 'plain' }],
  [{ text: '', type: 'plain' }],
  [{ text: '$', type: 'keyword' }, { text: ' git commit -m ', type: 'plain' }, { text: '"feat: add project gallery"', type: 'string' }]
];

const LINE_HEIGHT = 22;
const FONT_SIZE = 14.5;
const CHAR_WIDTH = FONT_SIZE * 0.6;
const SCROLL_SPEED = 12; // px per second

export function CodeEditorBackground() {
  const cursorBlink = useRef(0);

  const canvasRef = useCanvasAnimation((ctx, width, height, t) => {
    if (width === 0 || height === 0) return;

    ctx.clearRect(0, 0, width, height);
    ctx.font = `${FONT_SIZE}px "Fira Code", "Courier New", monospace`;
    ctx.textBaseline = 'top';

    const totalHeight = CODE_LINES.length * LINE_HEIGHT;
    const scrollY = (t * SCROLL_SPEED) % totalHeight;
    const gutterWidth = 34;
    const startX = gutterWidth + 16;

    const firstVisible = Math.floor(scrollY / LINE_HEIGHT) - 1;
    const visibleCount = Math.ceil(height / LINE_HEIGHT) + 2;

    for (let i = 0; i < visibleCount; i++) {
      const lineIndex = firstVisible + i;
      const wrappedIndex = ((lineIndex % CODE_LINES.length) + CODE_LINES.length) % CODE_LINES.length;
      const line = CODE_LINES[wrappedIndex];
      const y = lineIndex * LINE_HEIGHT - scrollY;
      if (y < -LINE_HEIGHT || y > height + LINE_HEIGHT) continue;

      // fade near top/bottom edges
      const edgeFade = Math.min(1, Math.min(y + LINE_HEIGHT, height - y) / (LINE_HEIGHT * 3));
      const fade = Math.max(0, Math.min(1, edgeFade));

      // line number gutter
      const lineNumber = ((wrappedIndex + 1) % 1000).toString().padStart(2, '0');
      ctx.fillStyle = `rgba(148, 158, 156, ${0.28 * fade})`;
      ctx.fillText(lineNumber, gutterWidth - lineNumber.length * CHAR_WIDTH, y);

      // tokens
      let x = startX;
      line.forEach((token) => {
        const [r, g, b] = COLORS[token.type].split(',').map((v) => v.trim());
        const baseAlpha = token.type === 'comment' ? 0.55 : token.type === 'plain' ? 0.7 : 0.9;
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${baseAlpha * fade})`;
        ctx.fillText(token.text, x, y);
        x += token.text.length * CHAR_WIDTH;
      });
    }

    // blinking cursor on the vertical middle line
    cursorBlink.current = t;
    const blinkOn = Math.floor(t * 1.8) % 2 === 0;
    if (blinkOn) {
      const midLineIndex = firstVisible + Math.floor(visibleCount / 2);
      const wrapped = ((midLineIndex % CODE_LINES.length) + CODE_LINES.length) % CODE_LINES.length;
      const lineTokens = CODE_LINES[wrapped];
      const lineLen = lineTokens.reduce((acc, tok) => acc + tok.text.length, 0);
      const y = midLineIndex * LINE_HEIGHT - scrollY;
      const x = startX + lineLen * CHAR_WIDTH + 2;
      ctx.fillStyle = 'rgba(127, 231, 214, 0.8)';
      ctx.fillRect(x, y + 1, 2, FONT_SIZE);
    }

    // subtle gutter divider
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
    ctx.beginPath();
    ctx.moveTo(gutterWidth + 6, 0);
    ctx.lineTo(gutterWidth + 6, height);
    ctx.stroke();
  });

  return <canvas ref={canvasRef} className="bg-canvas bg-canvas--code" aria-hidden="true" />;
}
