# Typhoon Atlas

전 세계 태풍·허리케인·사이클론의 과거 경로와 현재 예보를 지도에서 탐색하는 웹 앱입니다.

![Typhoon Atlas 화면](docs/cyclone-atlas.png)

## 주요 기능

- 연도·해역·태풍 선택으로 과거 경로 탐색
- 전 세계 열대저기압 경로와 현재 예보 표시
- 풍속에 따른 경로 지점 색상과 영향 범위 시각화
- 모바일에 대응하는 지도 중심 UI

## 데이터

과거 확정 경로는 JMA RSMC Tokyo와 NOAA NHC 자료를 사용하고, 현재·예보 정보는 일본 기상청 방재정보를 사용합니다.

`.github/workflows/update-storm-data.yml`이 매일 공식 원본을 확인하며, 데이터가 변경된 경우에만 `public/data`를 갱신합니다.

## 개발

Node.js 22.13 이상이 필요합니다.

```bash
npm install
npm run dev
npm run build
```

## 배포

Cloudflare Workers Builds에서 아래 명령으로 배포합니다.

```bash
npm run build
npx wrangler deploy --config dist/server/wrangler.json
```
