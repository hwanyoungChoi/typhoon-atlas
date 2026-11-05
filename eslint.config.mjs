import nextConfig from "@conychoi/eslint-config/next";

export default [
  ...nextConfig,
  { ignores: [".vinext/**", ".wrangler/**", "playwright-report/**", "test-results/**"] },
  // 공용 config 는 build/ 를 산출물로 보고 무시하지만, 여기서는 vite 플러그인 소스다.
  { ignores: ["!build/**"] },
  // 공용 config 는 프로젝트마다 다른 경로 alias 를 알지 못한다.
  // 알려주지 않으면 @/ 가 외부 패키지로 분류되어 import 순서가 컨벤션과 어긋난다.
  { settings: { "import/internal-regex": "^@/" } },
  {
    rules: {
      // vinext's next/link throws "f is not a function" during prefetch setup,
      // which silently kills the click handler. Plain <a> is the working
      // navigation primitive here until that is fixed upstream.
      "@next/next/no-html-link-for-pages": "off",
    },
  },
];
