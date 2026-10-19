import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { patchApp, patchCss, patchHtml, patchLoader, patchProductCenter } from "./jev-ui-tools-hotfix.js";

const loader = readFileSync("/tmp/jv/main.js", "utf8");
const app = readFileSync("/tmp/jv/app.js", "utf8");
const product = readFileSync("/tmp/jv/ProductCenter.js", "utf8");
const css = readFileSync("/tmp/jv/main.css", "utf8");
const html = `<script type="module" crossorigin src="/assets/main-20261019-075731.js"></script>`;

const patchedLoader = patchLoader(loader);
const patchedApp = patchApp(app);
const patchedProduct = patchProductCenter(product);
const patchedCss = patchCss(css);
const patchedHtml = patchHtml(html);

assert.match(patchedLoader, /main-20261019-0757312\.js\?jevhotfix=1/);
assert.match(patchedLoader, /main-20261019-075731\.css\?jevhotfix=1/);
assert.match(patchedApp, /产品查询/);
assert.match(patchedApp, /__jevStageBatch/);
assert.match(patchedApp, /jev_nav_labels_v3/);
assert.match(patchedApp, /ProductCenter-20261019-075731\.js\?jevhotfix=1/);
assert.doesNotMatch(patchedApp, /await Se\(5e3\)/);
assert.match(patchedApp, /\/api\/chat\/replay/);
assert.match(patchedApp, /whatsapp/i);
assert.match(patchedProduct, /await Se\(40\)/);
assert.match(patchedProduct, /\$\.slice\(0,60\)\.map/);
assert.match(patchedProduct, /只加载第一页/);
assert.match(patchedCss, /产品查询/);
assert.match(patchedHtml, /jevhotfix=1/);

for (const [name, source] of [
  ["loader", patchedLoader],
  ["app", patchedApp],
  ["product", patchedProduct],
]) {
  const file = `/tmp/jv/patched-${name}.js`;
  await import("node:fs").then((fs) => fs.writeFileSync(file, source));
  const checked = spawnSync(process.execPath, ["--check", file], { encoding: "utf8" });
  assert.equal(checked.status, 0, `${name} syntax\n${checked.stderr}`);
}

console.log("hotfix patches ok");
