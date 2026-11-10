import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';
import nextTypescript from 'eslint-config-next/typescript';

const eslintConfig = [
  { ignores: ['.next-fresh/**', 'node_modules/**', 'playwright-report/**', 'test-results/**'] },
  ...nextCoreWebVitals,
  ...nextTypescript,
  {
    rules: {
      // Pre-existing patterns from before lint was wired into CI (syncing
      // external state like localStorage on mount, a plain closure
      // accumulator in a .map()). Left as warnings rather than silently
      // rewritten, since fixing them is unrelated to CI/CD setup.
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/immutability': 'warn',
    },
  },
];

export default eslintConfig;
