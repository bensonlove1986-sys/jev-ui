/**
 * 正式站工作台热修复。
 *
 * jv-automation.com 的 /tools 工作台是 Cloudflare Pages 项目 jev-ui 上的
 * 另一套前端，源码不在本仓库，也不在 jev-rebuild。Pages 是手动上传，
 * 资源文件名带哈希且缓存一年。这个 Worker 只改当前这一版页面和脚本：
 * 登录后先出界面，再分批写入客户阶段；侧栏展开并露出「产品查询」；
 * 产品页只拉第一页。询价、WhatsApp、/api 不经过这里。
 */

export const HOTFIX = "1";

const ORIGIN = "https://98e38984.jev-ui.pages.dev";

const LOADER = "/assets/main-20261019-075731.js";
const APP = "/assets/main-20261019-0757312.js";
const CSS = "/assets/main-20261019-075731.css";
const PRODUCT = "/assets/ProductCenter-20261019-075731.js";

function replaceOnce(text, from, to, label) {
  const count = text.split(from).length - 1;
  if (count !== 1) {
    throw new Error(`${label} expected 1 occurrence, found ${count}`);
  }
  return text.replace(from, to);
}

export function patchLoader(text) {
  let out = text;
  out = replaceOnce(
    out,
    "assets/main-20261019-0757312.js",
    "assets/main-20261019-0757312.js?jevhotfix=1",
    "loader-app-map",
  );
  out = replaceOnce(
    out,
    'import("./main-20261019-0757312.js")',
    'import("./main-20261019-0757312.js?jevhotfix=1")',
    "loader-app-import",
  );
  out = replaceOnce(
    out,
    "assets/main-20261019-075731.css",
    "assets/main-20261019-075731.css?jevhotfix=1",
    "loader-css",
  );
  return out;
}

export function patchApp(text) {
  let out = text;
  out = replaceOnce(
    out,
    'from"./main-20261019-075731.js"',
    'from"./main-20261019-075731.js?jevhotfix=1"',
    "app-helper-import",
  );
  out = replaceOnce(
    out,
    'import("./ProductCenter-20261019-075731.js")',
    'import("./ProductCenter-20261019-075731.js?jevhotfix=1")',
    "app-product-import",
  );
  out = replaceOnce(
    out,
    '"assets/ProductCenter-20261019-075731.js"',
    '"assets/ProductCenter-20261019-075731.js?jevhotfix=1"',
    "app-product-map",
  );
  out = replaceOnce(
    out,
    "applyStage:(n,o)=>{const r=A(n);!r||!o||e(s=>({stagesByCustomerId:{...s.stagesByCustomerId,[r]:o}}))}",
    "applyStage:(n,o)=>{const r=A(n);if(!r||!o)return;const b=Mt.__jevStageBatch||(Mt.__jevStageBatch={});b[r]=o;Mt.__jevStageTimer||(Mt.__jevStageTimer=setTimeout(()=>{const c=Mt.__jevStageBatch||{};Mt.__jevStageBatch={};Mt.__jevStageTimer=0;e(s=>({stagesByCustomerId:{...s.stagesByCustomerId,...c}}))},0))}",
    "app-stage-batch",
  );
  out = replaceOnce(
    out,
    'function wd(){if(typeof window>"u")return!0;try{const e=window.localStorage.getItem(Us);return e===null?!0:e==="true"}catch{return!0}}',
    'function wd(){if(typeof window>"u")return!1;try{if(window.localStorage.getItem("jev_nav_labels_v3")!=="1"){window.localStorage.setItem("jev_nav_labels_v3","1");window.localStorage.setItem(Us,"false");return!1}const e=window.localStorage.getItem(Us);return e===null?!1:e==="true"}catch{return!1}}',
    "app-nav-expanded",
  );
  out = replaceOnce(
    out,
    '{id:"todo-dashboard",labelKey:"nav.todoDashboard",icon:"📊"},{id:"chat",labelKey:"nav.chat",icon:"💬",isActive:!0},{id:"website-chat",labelKey:"nav.websiteChat",icon:"🌐"},{id:"email",labelKey:"nav.email",icon:"✉️"},{id:"google-ads",labelKey:"nav.googleAds",icon:"📈"},{id:"wecom-inquiry",labelKey:"nav.wecomInquiry",icon:"🧾"},{id:"orders",labelKey:"nav.orders",icon:"📦"},{id:"products",labelKey:"nav.productCenter",icon:"🛍️"}',
    '{id:"todo-dashboard",labelKey:"nav.todoDashboard",icon:"📊"},{id:"products",labelKey:"nav.productCenter",icon:"🛍️"},{id:"chat",labelKey:"nav.chat",icon:"💬",isActive:!0},{id:"website-chat",labelKey:"nav.websiteChat",icon:"🌐"},{id:"email",labelKey:"nav.email",icon:"✉️"},{id:"google-ads",labelKey:"nav.googleAds",icon:"📈"},{id:"wecom-inquiry",labelKey:"nav.wecomInquiry",icon:"🧾"},{id:"orders",labelKey:"nav.orders",icon:"📦"}',
    "app-nav-order",
  );
  out = replaceOnce(
    out,
    'const R=y.id==="benson-tenants"&&(m==null?void 0:m.platformRole)==="TENANT_ADMIN"?"公司后台":p(y.labelKey)',
    'const R=y.id==="products"?"产品查询":y.id==="benson-tenants"&&(m==null?void 0:m.platformRole)==="TENANT_ADMIN"?"公司后台":p(y.labelKey)',
    "app-product-label",
  );
  out = replaceOnce(
    out,
    'Pe.onContactSnapshot((t,n)=>{console.log("[CONVERSATION_STORE_CONTACT_SNAPSHOT] Received:"',
    'Pe.onContactSnapshot((t,n)=>{setTimeout(()=>{console.log("[CONVERSATION_STORE_CONTACT_SNAPSHOT] Received:"',
    "app-snapshot-defer-open",
  );
  out = replaceOnce(
    out,
    'contacts")}),Pe.onContactInsert',
    'contacts")},0)}),Pe.onContactInsert',
    "app-snapshot-defer-close",
  );
  return out;
}

export function patchProductCenter(text) {
  let out = text;
  out = replaceOnce(out, "await Se(5e3)", "await Se(40)", "product-page-size");
  out = replaceOnce(
    out,
    'i.useEffect(()=>{v("")},[v])',
    'i.useEffect(()=>{const r=setTimeout(()=>{v("")},1);return()=>clearTimeout(r)},[v])',
    "product-defer",
  );
  out = replaceOnce(
    out,
    'className:"pc-product-list",children:[$.map(r=>',
    'className:"pc-product-list",children:[$.slice(0,60).map(r=>',
    "product-render-cap",
  );
  out = replaceOnce(
    out,
    "先审核图和参数，再从聊天页发送给客户。",
    "先输入型号再点搜索。打开时只加载第一页，避免一次把全部产品塞进页面。",
    "product-hint",
  );
  return out;
}

export function patchCss(text) {
  return `${text}
@media (max-width: 768px) {
  .workbench-side-nav { display: block !important; max-height: 42vh; overflow: auto !important; }
  .workbench-layout, .workbench-layout.workbench-layout-nav-collapsed { grid-template-rows: auto minmax(0, 1fr); }
  .side-nav.side-nav-collapsed { width: 100% !important; align-items: stretch !important; }
  .side-nav.side-nav-collapsed .side-nav-title { display: block !important; }
  .side-nav.side-nav-collapsed .side-nav-menu { align-items: stretch !important; }
  .side-nav.side-nav-collapsed .nav-item-container { justify-content: flex-start !important; }
  .side-nav.side-nav-collapsed .nav-item-name { display: inline !important; }
  .side-nav.side-nav-collapsed .nav-item { width: auto !important; height: auto !important; min-height: 38px !important; justify-content: flex-start !important; padding: 8px 10px !important; gap: 10px !important; }
}
.nav-item[aria-label^="产品查询"], .nav-item[title^="产品查询"] { box-shadow: inset 3px 0 0 #2dd4bf; }
`;
}

export function patchHtml(text) {
  const from = 'src="/assets/main-20261019-075731.js"';
  const to = 'src="/assets/main-20261019-075731.js?jevhotfix=1"';
  if (!text.includes(from)) {
    if (text.includes(to)) return text;
    throw new Error("html entry script not found");
  }
  return text.replace(from, to);
}

function patchedHeaders(upstream, contentType) {
  const headers = new Headers();
  headers.set("content-type", contentType || upstream.headers.get("content-type") || "text/plain; charset=utf-8");
  headers.set("cache-control", "no-store");
  headers.set("x-content-type-options", "nosniff");
  headers.set("access-control-allow-origin", "*");
  headers.set("x-jev-hotfix", HOTFIX);
  return headers;
}

async function fromOrigin(request) {
  const url = new URL(request.url);
  const target = new URL(url.pathname + url.search, ORIGIN);
  const headers = new Headers(request.headers);
  headers.delete("host");
  return fetch(target.toString(), {
    method: request.method,
    headers,
    redirect: "follow",
  });
}

export default {
  async fetch(request) {
    const url = new URL(request.url);
    if (url.pathname.startsWith("/api/") || url.pathname === "/api") {
      return fromOrigin(request);
    }
    if (request.headers.get("upgrade") === "websocket") {
      return fromOrigin(request);
    }

    const wantsHotfix = url.searchParams.get("jevhotfix") === "1";
    const isAsset = url.pathname === LOADER || url.pathname === APP || url.pathname === CSS || url.pathname === PRODUCT;
    if (isAsset && !wantsHotfix) {
      return fromOrigin(request);
    }

    const upstream = await fromOrigin(request);
    if (!upstream.ok || request.method === "HEAD") {
      return upstream;
    }

    const type = upstream.headers.get("content-type") || "";
    const text = await upstream.text();
    try {
      let body = text;
      if (url.pathname === LOADER && wantsHotfix) body = patchLoader(text);
      else if (url.pathname === APP && wantsHotfix) body = patchApp(text);
      else if (url.pathname === PRODUCT && wantsHotfix) body = patchProductCenter(text);
      else if (url.pathname === CSS && wantsHotfix) body = patchCss(text);
      else if (type.includes("text/html")) body = patchHtml(text);
      else return upstream;
      return new Response(body, { status: upstream.status, headers: patchedHeaders(upstream, type) });
    } catch (error) {
      const headers = patchedHeaders(upstream, type);
      headers.set("x-jev-hotfix", "passthrough");
      headers.set("x-jev-hotfix-error", String(error && error.message || error).slice(0, 180));
      return new Response(text, { status: upstream.status, headers });
    }
  },
};
