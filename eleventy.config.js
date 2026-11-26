import Image from "@11ty/eleventy-img";
import { HtmlBasePlugin } from "@11ty/eleventy";
import { load as loadYaml } from "js-yaml";
import path from "node:path";
import fs from "node:fs";

const IMAGE_PRESETS = {
  thumb: { widths: [500, 1000], sizes: "(max-width: 700px) 45vw, 220px" },
  full: { widths: [1200, 2400], sizes: "(max-width: 900px) 100vw, 80vw" },
  photo: { widths: [800, 1600], sizes: "(max-width: 700px) 90vw, 40vw" },
};
const IMAGE_EXT = /\.(jpe?g|png|webp|gif|avif|tiff?)$/i;
const VIDEO_EXT = /\.(mp4|webm|mov|m4v)$/i;
const COVER_NAME = /^(thumbnail|cover)\./i;

function resolveFile(src) {
  if (fs.existsSync(src)) return src;
  const dir = path.dirname(src);
  if (!fs.existsSync(dir)) return null;
  const want = path.basename(src).toLowerCase();
  const wantStem = want.replace(/\.[^.]+$/, "");
  const files = fs.readdirSync(dir);
  const hit =
    files.find((f) => f.toLowerCase() === want) ||
    files.find((f) => IMAGE_EXT.test(f) && f.toLowerCase().replace(/\.[^.]+$/, "") === wantStem);
  return hit ? path.join(dir, hit) : null;
}

const missing = new Set();
async function imageMeta(file, from, preset = "full") {
  const base = from ? path.dirname(from) : "src";
  const wanted = file.startsWith("/") ? path.join("src", file) : path.join(base, file);
  const src = resolveFile(wanted);
  if (!src) {
    if (!missing.has(wanted)) { missing.add(wanted); console.warn(`[image] missing: ${wanted}`); }
    return null;
  }
  const { widths } = IMAGE_PRESETS[preset] || IMAGE_PRESETS.full;
  return Image(src, {
    widths,
    formats: ["webp", "auto"],
    outputDir: "_site/img/",
    urlPath: "/img/",
    sharpOptions: { limitInputPixels: false },
    sharpWebpOptions: { quality: 88 },
    sharpJpegOptions: { quality: 88, mozjpeg: true },
    sharpPngOptions: { compressionLevel: 9 },
  });
}

function media(item, kind) {
  const dir = path.join("src", kind, item.folder || "");
  const files = fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => !f.startsWith(".")).sort() : [];
  const pics = files.filter((f) => IMAGE_EXT.test(f));
  const images = item.images || pics.filter((f) => !COVER_NAME.test(f));
  const video = item.video || files.find((f) => VIDEO_EXT.test(f));
  const cover = item.cover || pics.find((f) => COVER_NAME.test(f)) || images[0];
  return {
    from: path.join(dir, "index"),
    url: `/${kind}/${item.folder}/`,
    cover, images, video,
  };
}

const PATH_PREFIX = process.env.PATH_PREFIX || "/";

export default function (eleventyConfig) {
  eleventyConfig.addPlugin(HtmlBasePlugin);
  eleventyConfig.addGlobalData("base", PATH_PREFIX.replace(/\/$/, ""));
  eleventyConfig.addDataExtension("yaml,yml", (contents) => loadYaml(contents));

  eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });
  eleventyConfig.addPassthroughCopy("src/{designs,projects}/**/*.{mp4,MP4,webm,mov,MOV,m4v,pdf}");
  eleventyConfig.addPassthroughCopy({ "src/CNAME": "CNAME" });
  eleventyConfig.ignores.add("src/designs/**");
  eleventyConfig.ignores.add("src/projects/**");

  eleventyConfig.addFilter("media", media);
  eleventyConfig.addFilter("slug", (s) =>
    String(s || "").toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
  );
  eleventyConfig.addFilter("list", (v) => (Array.isArray(v) ? v.join(", ") : v || ""));
  eleventyConfig.addFilter("compact", (arr) => arr.filter((x) => x !== undefined && x !== null && x !== ""));
  eleventyConfig.addFilter("pad", (n) => String(n).padStart(2, "0"));
  eleventyConfig.addFilter("paragraphs", (t) =>
    String(t || "").split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean)
  );
  eleventyConfig.addFilter("categories", (items) => {
    const out = [];
    for (const it of items) {
      const c = it.category;
      if (!c) continue;
      const hit = out.find((o) => o.name.toLowerCase() === c.toLowerCase());
      hit ? hit.count++ : out.push({ name: c, count: 1 });
    }
    return out;
  });
  eleventyConfig.addFilter("neighbours", (items, folder) => {
    const i = items.findIndex((it) => it.folder === folder);
    const n = items.length;
    return { prev: items[(i - 1 + n) % n], next: items[(i + 1) % n], index: i + 1, total: n };
  });
  eleventyConfig.addFilter("highlightAuthor", (authors, me) =>
    me ? String(authors).split(me).join(`<b>${me}</b>`) : authors
  );

  eleventyConfig.addAsyncShortcode("img", async function (file, from, alt = "", preset = "full", cls = "") {
    const meta = file && (await imageMeta(file, from, preset));
    if (!meta) return `<div class="ph ${cls}" aria-label="${alt}"><span>image</span></div>`;
    const { sizes } = IMAGE_PRESETS[preset] || IMAGE_PRESETS.full;
    return Image.generateHTML(meta, {
      alt, sizes,
      loading: preset === "photo" ? "eager" : "lazy",
      decoding: "async",
      class: cls || undefined,
    });
  });

  eleventyConfig.addAsyncShortcode("imgUrl", async function (file, from) {
    const meta = file && (await imageMeta(file, from, "thumb"));
    return meta ? meta.webp[0].url : "";
  });

  return {
    dir: { input: "src", includes: "_includes", data: "_data", output: "_site" },
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
    pathPrefix: PATH_PREFIX,
  };
}
