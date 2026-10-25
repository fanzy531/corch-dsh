/** Visual styles extracted from the supplied capability-map HTML example. */
export const JD_SEARCH_REPORT_STYLES = String.raw`:root {
    --c-bg: #f6f7f4;
    --c-paper: #ffffff;
    --c-ink: #1a2725;
    --c-ink-soft: #4a5956;
    --c-ink-mute: #7a8580;
    --c-line: #e0e5dd;
    --c-line-soft: #eef1ea;
    --c-accent: #2c6e62;
    --c-accent-2: #84a99a;
    --c-tag-core: #c0392b;
    --c-tag-imp: #2c5d8a;
    --c-tag-add: #6b6b6b;
    --c-gap-p0: #c0392b;
    --c-gap-p1: #d68910;
    --c-gap-p2: #229954;
    --c-shadow: 0 1px 3px rgba(44,110,98,.08);
  }
  @media (prefers-color-scheme: dark) {
    :root {
      --c-bg: #1a1f1d;
      --c-paper: #2a322f;
      --c-ink: #ecf0ed;
      --c-ink-soft: #bcc4bf;
      --c-ink-mute: #8a948f;
      --c-line: #3a423e;
      --c-line-soft: #303633;
      --c-accent: #84a99a;
      --c-accent-2: #2c6e62;
      --c-shadow: 0 1px 3px rgba(0,0,0,.4);
    }
  }
  * { box-sizing: border-box; }
  html, body {
    margin: 0; padding: 0;
    background: var(--c-bg);
    color: var(--c-ink);
    font-family: "PingFang SC", "Microsoft YaHei", "Source Han Serif SC", "Noto Serif SC", serif;
    line-height: 1.7;
    font-size: 15px;
  }
  .page {
    max-width: 920px;
    margin: 0 auto;
    padding: 60px 50px;
    background: var(--c-paper);
    box-shadow: var(--c-shadow);
    min-height: 100vh;
  }
  /* Cover */
  .cover {
    border-top: 4px double var(--c-accent);
    border-bottom: 1px solid var(--c-line);
    padding: 50px 0 40px;
    text-align: center;
    margin-bottom: 50px;
  }
  .cover .badge {
    display: inline-block;
    border: 1px solid var(--c-accent);
    color: var(--c-accent);
    padding: 3px 12px;
    font-size: 12px;
    letter-spacing: 4px;
    font-family: "PingFang SC", sans-serif;
    margin-bottom: 28px;
  }
  .cover h1 {
    font-size: 38px;
    font-weight: 700;
    margin: 0 0 16px;
    letter-spacing: 2px;
    line-height: 1.3;
  }
  .cover .subtitle {
    font-size: 18px;
    color: var(--c-ink-soft);
    margin: 0 0 8px;
    font-family: "PingFang SC", sans-serif;
  }
  .cover .meta {
    font-size: 13px;
    color: var(--c-ink-mute);
    margin-top: 28px;
    font-family: "PingFang SC", sans-serif;
  }
  .cover .meta-row {
    display: flex;
    justify-content: center;
    gap: 32px;
    flex-wrap: wrap;
  }
  .cover .icon {
    font-size: 64px;
    margin-bottom: 12px;
    color: var(--c-accent);
    opacity: 0.7;
  }
  /* TOC */
  .toc {
    border: 1px solid var(--c-line);
    padding: 24px 32px;
    background: var(--c-line-soft);
    margin-bottom: 50px;
    page-break-after: avoid;
  }
  .toc h3 {
    margin: 0 0 16px;
    font-size: 14px;
    letter-spacing: 4px;
    color: var(--c-accent);
    font-family: "PingFang SC", sans-serif;
  }
  .toc ol { padding-left: 24px; margin: 0; font-family: "PingFang SC", sans-serif; font-size: 14px; }
  .toc li { margin: 6px 0; }
  .toc a { color: var(--c-ink-soft); text-decoration: none; }
  .toc a:hover { color: var(--c-accent); }
  /* Sections */
  h2 {
    font-size: 24px;
    font-weight: 700;
    margin: 50px 0 24px;
    padding-bottom: 10px;
    border-bottom: 2px solid var(--c-accent);
    page-break-after: avoid;
  }
  h3 {
    font-size: 18px;
    font-weight: 700;
    margin: 32px 0 16px;
    color: var(--c-ink);
    page-break-after: avoid;
  }
  h4 {
    font-size: 15px;
    font-weight: 700;
    margin: 20px 0 10px;
    color: var(--c-ink-soft);
    page-break-after: avoid;
  }
  p { margin: 12px 0; color: var(--c-ink-soft); }
  blockquote {
    border-left: 3px solid var(--c-accent);
    margin: 16px 0;
    padding: 10px 18px;
    background: var(--c-line-soft);
    color: var(--c-ink-soft);
    font-size: 14px;
  }
  blockquote p { margin: 0; }
  /* Tables */
  table {
    width: 100%;
    border-collapse: collapse;
    margin: 18px 0;
    font-size: 13.5px;
    font-family: "PingFang SC", sans-serif;
  }
  th, td {
    border: 1px solid var(--c-line);
    padding: 8px 12px;
    text-align: left;
    vertical-align: top;
  }
  th {
    background: var(--c-line-soft);
    font-weight: 600;
    color: var(--c-ink);
    font-size: 13px;
  }
  tr:nth-child(even) td { background: rgba(44,110,98,.025); }
  @media (prefers-color-scheme: dark) {
    tr:nth-child(even) td { background: rgba(255,255,255,.02); }
  }
  .layer-core { color: var(--c-tag-core); font-weight: 600; }
  .layer-imp  { color: var(--c-tag-imp); font-weight: 600; }
  .layer-add  { color: var(--c-tag-add); }
  .sup-strong { color: var(--c-gap-p1); font-size: 18px; font-weight: 700; }
  .sup-weak   { color: var(--c-gap-p1); font-size: 18px; }
  .sup-none   { color: var(--c-gap-p0); font-size: 18px; }
  .trend-new { color: var(--c-gap-p1); font-weight: 700; }
  .trend-hot { color: var(--c-gap-p0); font-weight: 700; }
  .trend-dec { color: var(--c-ink-mute); font-weight: 700; }
  /* Tree */
  .tree {
    font-family: "Menlo", "Consolas", monospace;
    background: var(--c-line-soft);
    border: 1px solid var(--c-line);
    padding: 20px 24px;
    border-radius: 4px;
    line-height: 1.9;
    font-size: 13.5px;
    overflow-x: auto;
    color: var(--c-ink-soft);
  }
  /* Job family card */
  .jobmap {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
    gap: 12px;
    margin: 20px 0;
  }
  .jobcard {
    border: 1px solid var(--c-line);
    border-top: 3px solid var(--c-accent);
    padding: 16px 14px;
    background: var(--c-paper);
    text-align: center;
  }
  .jobcard .id { font-size: 12px; color: var(--c-ink-mute); margin-bottom: 6px; font-family: "PingFang SC", sans-serif; }
  .jobcard .title { font-weight: 700; color: var(--c-ink); margin-bottom: 6px; font-size: 14px; }
  .jobcard .stars { color: var(--c-accent); letter-spacing: 2px; margin-bottom: 4px; }
  .jobcard .weight { font-size: 12px; color: var(--c-ink-soft); }
  code {
    font-family: "Menlo", "Consolas", "Courier New", monospace;
    background: var(--c-line-soft);
    padding: 1px 6px;
    border-radius: 3px;
    font-size: 12.5px;
    color: var(--c-accent);
  }
  pre {
    background: #2c322e;
    color: #e0e5dd;
    padding: 18px;
    border-radius: 4px;
    overflow-x: auto;
    font-size: 12.5px;
    line-height: 1.55;
    margin: 16px 0;
  }
  pre code { background: none; color: inherit; padding: 0; font-size: inherit; }
  /* Exec */
  .exec {
    background: var(--c-line-soft);
    border-left: 4px solid var(--c-accent);
    padding: 20px 28px;
    margin: 24px 0;
  }
  .exec table { margin: 0; border: none; background: transparent; font-size: 13px; }
  .exec td { border: none; padding: 5px 0; }
  .exec td:first-child { color: var(--c-ink-mute); width: 30%; }
  /* Comparison */
  .compare {
    background: var(--c-line-soft);
    border: 1px solid var(--c-line);
    border-radius: 4px;
    padding: 20px 28px;
    margin: 24px 0;
  }
  .compare h4 { color: var(--c-accent); margin: 0 0 12px; }
  .compare table { font-size: 13px; }
  /* Footer */
  footer {
    margin-top: 80px;
    padding-top: 24px;
    border-top: 1px solid var(--c-line);
    font-size: 12px;
    color: var(--c-ink-mute);
    text-align: center;
    font-family: "PingFang SC", sans-serif;
  }
  /* Print */
  @media print {
    body { background: white; color: black; }
    .page { box-shadow: none; padding: 20px; max-width: none; }
    h2 { page-break-before: always; }
    table { page-break-inside: avoid; }
  }
  /* Back to top */
  .top {
    position: fixed;
    bottom: 24px;
    right: 24px;
    background: var(--c-accent);
    color: white;
    width: 42px; height: 42px;
    border-radius: 50%;
    text-align: center;
    line-height: 42px;
    text-decoration: none;
    font-size: 18px;
    box-shadow: 0 2px 8px rgba(0,0,0,.15);
    opacity: 0.85;
  }
  .top:hover { opacity: 1; }
  /* Stats banner on cover */
  .quickstat {
    display: flex;
    justify-content: center;
    gap: 40px;
    margin-top: 32px;
    flex-wrap: wrap;
  }
  .stat { text-align: center; }
  .stat .num { font-size: 32px; font-weight: 700; color: var(--c-accent); font-family: "PingFang SC", sans-serif; }
  .stat .lbl { font-size: 12px; color: var(--c-ink-mute); font-family: "PingFang SC", sans-serif; }`
