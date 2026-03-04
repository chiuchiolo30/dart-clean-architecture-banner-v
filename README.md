# dart-clean-architecture-banner

Dynamic banner image service for the [Dart Clean Architecture](https://marketplace.visualstudio.com/items?itemName=FlutterCleanArchitecture.dart-clena-architecture-hex) VS Code extension.

Generates a **real PNG** with live install count, rating and reviews fetched from the VS Code Marketplace API.

## How it works

1. Request hits the Vercel serverless function
2. Fetches live stats from VS Code Marketplace API
3. Renders HTML with Puppeteer → screenshot → returns PNG
4. Cached for 1 hour (`s-maxage=3600`)

## Deploy

```bash
npm i -g vercel
vercel
```

## Usage in README.md

```markdown
<a href="https://marketplace.visualstudio.com/items?itemName=FlutterCleanArchitecture.dart-clena-architecture-hex">
  <img src="https://dart-clean-architecture-banner.vercel.app" width="100%">
</a>
```

## Local dev

```bash
npm install
node api/index.js
```
