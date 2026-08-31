import { createRequire } from 'module';const require = createRequire(import.meta.url);
import {
  AngularAppEngine,
  InlineCriticalCssProcessor,
  getFirstHeaderValue,
  isProxyHeaderAllowed,
  normalizeTrustProxyHeaders,
  validateUrl
} from "./chunk-BLOZ4VII.js";
import {
  SERVER_CONTEXT,
  renderApplication,
  renderModule
} from "./chunk-S5EO3KK4.js";
import "./chunk-IINVGAPZ.js";
import "./chunk-QYOVYKHA.js";
import "./chunk-KWNACK5H.js";
import "./chunk-MBMPOULD.js";
import "./chunk-ZDMTL42V.js";
import "./chunk-DEOFJXAW.js";
import "./chunk-CUG4IDYG.js";
import {
  __spreadProps,
  __spreadValues
} from "./chunk-SOE35BD4.js";

// node_modules/@angular/ssr/fesm2022/node.mjs
import * as fs from "fs";
import { dirname, join, normalize, resolve } from "path";
import { URL as URL$1, fileURLToPath } from "url";
import { readFile } from "fs/promises";
import { argv } from "process";
function getAllowedHostsFromEnv() {
  return getArrayFromEnv("NG_ALLOWED_HOSTS");
}
function getTrustProxyHeadersFromEnv() {
  return getArrayFromEnv("NG_TRUST_PROXY_HEADERS");
}
function getArrayFromEnv(envName) {
  const envValue = process.env[envName];
  if (!envValue) {
    return void 0;
  }
  const values = [];
  for (const value of envValue.split(",")) {
    const trimmed = value.trim();
    if (trimmed.length > 0) {
      values.push(trimmed);
    }
  }
  return values;
}
var CommonEngineInlineCriticalCssProcessor = class {
  resourceCache = /* @__PURE__ */ new Map();
  async process(html, outputPath) {
    const beasties = new InlineCriticalCssProcessor(async (path) => {
      let resourceContent = this.resourceCache.get(path);
      if (resourceContent === void 0) {
        resourceContent = await readFile(path, "utf-8");
        this.resourceCache.set(path, resourceContent);
      }
      return resourceContent;
    }, outputPath);
    return beasties.process(html);
  }
};
var PERFORMANCE_MARK_PREFIX = "🅰️";
function printPerformanceLogs() {
  let maxWordLength = 0;
  const benchmarks = [];
  for (const {
    name,
    duration
  } of performance.getEntriesByType("measure")) {
    if (!name.startsWith(PERFORMANCE_MARK_PREFIX)) {
      continue;
    }
    const step = name.slice(PERFORMANCE_MARK_PREFIX.length + 1) + ":";
    if (step.length > maxWordLength) {
      maxWordLength = step.length;
    }
    benchmarks.push([step, `${duration.toFixed(1)}ms`]);
    performance.clearMeasures(name);
  }
  console.log("********** Performance results **********");
  for (const [step, value] of benchmarks) {
    const spaces = maxWordLength - step.length + 5;
    console.log(step + " ".repeat(spaces) + value);
  }
  console.log("*****************************************");
}
async function runMethodAndMeasurePerf(label, asyncMethod) {
  const labelName = `${PERFORMANCE_MARK_PREFIX}:${label}`;
  const startLabel = `start:${labelName}`;
  const endLabel = `end:${labelName}`;
  try {
    performance.mark(startLabel);
    return await asyncMethod();
  } finally {
    performance.mark(endLabel);
    performance.measure(labelName, startLabel, endLabel);
    performance.clearMarks(startLabel);
    performance.clearMarks(endLabel);
  }
}
function noopRunMethodAndMeasurePerf(label, asyncMethod) {
  return asyncMethod();
}
var SSG_MARKER_REGEXP = /ng-server-context=["']\w*\|?ssg\|?\w*["']/;
var CommonEngine = class {
  options;
  templateCache = /* @__PURE__ */ new Map();
  inlineCriticalCssProcessor = new CommonEngineInlineCriticalCssProcessor();
  pageIsSSG = /* @__PURE__ */ new Map();
  allowedHosts;
  constructor(options) {
    this.options = options;
    this.allowedHosts = new Set(getAllowedHostsFromEnv() ?? this.options?.allowedHosts ?? []);
  }
  /**
   * Render an HTML document for a specific URL with specified
   * render options
   */
  async render(opts) {
    const {
      url
    } = opts;
    if (url && URL$1.canParse(url)) {
      const urlObj = new URL$1(url);
      try {
        validateUrl(urlObj, this.allowedHosts);
      } catch (error) {
        const isAllowedHostConfigured = this.allowedHosts.size > 0;
        console.error(`ERROR: ${error.message}Please provide a list of allowed hosts in the "allowedHosts" option in the "CommonEngine" constructor.`, isAllowedHostConfigured ? "" : "\nFalling back to client side rendering. This will become a 400 Bad Request in a future major version.");
        if (!isAllowedHostConfigured) {
          let document = opts.document;
          if (!document && opts.documentFilePath) {
            document = opts.document ?? await this.getDocument(opts.documentFilePath);
          }
          if (document) {
            return document;
          }
        }
        throw error;
      }
    }
    const enablePerformanceProfiler = this.options?.enablePerformanceProfiler;
    const runMethod = enablePerformanceProfiler ? runMethodAndMeasurePerf : noopRunMethodAndMeasurePerf;
    let html = await runMethod("Retrieve SSG Page", () => this.retrieveSSGPage(opts));
    if (html === void 0) {
      html = await runMethod("Render Page", () => this.renderApplication(opts));
      if (opts.inlineCriticalCss !== false) {
        const content = await runMethod("Inline Critical CSS", () => (
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          this.inlineCriticalCss(html, opts)
        ));
        html = content;
      }
    }
    if (enablePerformanceProfiler) {
      printPerformanceLogs();
    }
    return html;
  }
  inlineCriticalCss(html, opts) {
    const outputPath = opts.publicPath ?? (opts.documentFilePath ? dirname(opts.documentFilePath) : "");
    return this.inlineCriticalCssProcessor.process(html, outputPath);
  }
  async retrieveSSGPage(opts) {
    const {
      publicPath,
      documentFilePath,
      url
    } = opts;
    if (!publicPath || !documentFilePath || url === void 0) {
      return void 0;
    }
    const {
      pathname
    } = new URL$1(url, "resolve://");
    const pagePath = join(publicPath, pathname, "index.html");
    if (this.pageIsSSG.get(pagePath)) {
      return fs.promises.readFile(pagePath, "utf-8");
    }
    if (!pagePath.startsWith(normalize(publicPath))) {
      return void 0;
    }
    if (pagePath === resolve(documentFilePath) || !await exists(pagePath)) {
      this.pageIsSSG.set(pagePath, false);
      return void 0;
    }
    const content = await fs.promises.readFile(pagePath, "utf-8");
    const isSSG = SSG_MARKER_REGEXP.test(content);
    this.pageIsSSG.set(pagePath, isSSG);
    return isSSG ? content : void 0;
  }
  async renderApplication(opts) {
    const moduleOrFactory = this.options?.bootstrap ?? opts.bootstrap;
    if (!moduleOrFactory) {
      throw new Error("A module or bootstrap option must be provided.");
    }
    const extraProviders = [{
      provide: SERVER_CONTEXT,
      useValue: "ssr"
    }, ...opts.providers ?? [], ...this.options?.providers ?? []];
    let document = opts.document;
    if (!document && opts.documentFilePath) {
      document = await this.getDocument(opts.documentFilePath);
    }
    const commonRenderingOptions = {
      url: opts.url,
      document,
      // Validation is already happened in the render method.
      allowedHosts: ["*"]
    };
    return isBootstrapFn(moduleOrFactory) ? renderApplication(moduleOrFactory, __spreadValues({
      platformProviders: extraProviders
    }, commonRenderingOptions)) : renderModule(moduleOrFactory, __spreadValues({
      extraProviders
    }, commonRenderingOptions));
  }
  /** Retrieve the document from the cache or the filesystem */
  async getDocument(filePath) {
    let doc = this.templateCache.get(filePath);
    if (!doc) {
      doc = await fs.promises.readFile(filePath, "utf-8");
      this.templateCache.set(filePath, doc);
    }
    return doc;
  }
};
async function exists(path) {
  try {
    await fs.promises.access(path, fs.constants.F_OK);
    return true;
  } catch {
    return false;
  }
}
function isBootstrapFn(value) {
  return typeof value === "function" && !("ɵmod" in value);
}
var HTTP2_PSEUDO_HEADERS = /* @__PURE__ */ new Set([":method", ":scheme", ":authority", ":path", ":status"]);
function createWebRequestFromNodeRequest(nodeRequest, trustProxyHeaders) {
  const trustProxyHeadersNormalized = normalizeTrustProxyHeaders(trustProxyHeaders);
  const {
    headers,
    method = "GET"
  } = nodeRequest;
  const withBody = method !== "GET" && method !== "HEAD";
  return new Request(createRequestUrl(nodeRequest, trustProxyHeadersNormalized), {
    method,
    headers: createRequestHeaders(headers),
    body: withBody ? nodeRequest : void 0,
    duplex: withBody ? "half" : void 0
  });
}
function createRequestHeaders(nodeHeaders) {
  const headers = new Headers();
  for (const [name, value] of Object.entries(nodeHeaders)) {
    if (HTTP2_PSEUDO_HEADERS.has(name)) {
      continue;
    }
    if (typeof value === "string") {
      headers.append(name, value);
    } else if (Array.isArray(value)) {
      for (const item of value) {
        headers.append(name, item);
      }
    }
  }
  return headers;
}
function createRequestUrl(nodeRequest, trustProxyHeaders) {
  const {
    headers,
    socket,
    url = "",
    originalUrl
  } = nodeRequest;
  const protocol = getAllowedProxyHeaderValue(headers, "x-forwarded-proto", trustProxyHeaders) ?? ("encrypted" in socket && socket.encrypted ? "https" : "http");
  const hostname = getAllowedProxyHeaderValue(headers, "x-forwarded-host", trustProxyHeaders) ?? headers.host ?? headers[":authority"];
  if (Array.isArray(hostname)) {
    throw new Error("host value cannot be an array.");
  }
  let hostnameWithPort = hostname;
  if (!hostname?.includes(":")) {
    const port = getAllowedProxyHeaderValue(headers, "x-forwarded-port", trustProxyHeaders);
    if (port) {
      hostnameWithPort += `:${port}`;
    }
  }
  return new URL(`${protocol}://${hostnameWithPort}${originalUrl ?? url}`);
}
function getAllowedProxyHeaderValue(headers, headerName, trustProxyHeaders) {
  return isProxyHeaderAllowed(headerName, trustProxyHeaders) ? getFirstHeaderValue(headers[headerName]) : void 0;
}
var AngularNodeAppEngine = class {
  angularAppEngine;
  trustProxyHeaders;
  /**
   * Creates a new instance of the Angular Node.js server application engine.
   * @param options Options for the Angular Node.js server application engine.
   */
  constructor(options) {
    const appEngineOptions = __spreadProps(__spreadValues({}, options), {
      allowedHosts: getAllowedHostsFromEnv() ?? options?.allowedHosts,
      trustProxyHeaders: getTrustProxyHeadersFromEnv() ?? options?.trustProxyHeaders
    });
    this.angularAppEngine = new AngularAppEngine(appEngineOptions);
    this.trustProxyHeaders = appEngineOptions.trustProxyHeaders;
  }
  /**
   * Handles an incoming HTTP request by serving prerendered content, performing server-side rendering,
   * or delivering a static file for client-side rendered routes based on the `RenderMode` setting.
   *
   * This method adapts Node.js's `IncomingMessage`, `Http2ServerRequest` or `Request`
   * to a format compatible with the `AngularAppEngine` and delegates the handling logic to it.
   *
   * @param request - The incoming HTTP request (`IncomingMessage`, `Http2ServerRequest` or `Request`).
   * @param requestContext - Optional context for rendering, such as metadata associated with the request.
   * @returns A promise that resolves to the resulting HTTP response object, or `null` if no matching Angular route is found.
   *
   * @remarks A request to `https://www.example.com/page/index.html` will serve or render the Angular route
   * corresponding to `https://www.example.com/page`.
   *
   * @remarks
   * To prevent potential Server-Side Request Forgery (SSRF), this function verifies the hostname
   * of the `request.url` against a list of authorized hosts.
   * If the hostname is not recognized and `allowedHosts` is not empty, a Client-Side Rendered (CSR) version of the
   * page is returned otherwise a 400 Bad Request is returned.
   *
   * Resolution:
   * Authorize your hostname by configuring `allowedHosts` in `angular.json` in:
   * `projects.[project-name].architect.build.options.security.allowedHosts`.
   * Alternatively, you can define the allowed hostname via the environment variable `process.env['NG_ALLOWED_HOSTS']`
   * or pass it directly through the configuration options of `AngularNodeAppEngine`.
   *
   * For more information see: https://angular.dev/best-practices/security#preventing-server-side-request-forgery-ssrf
   */
  async handle(request, requestContext) {
    const webRequest = request instanceof Request ? request : createWebRequestFromNodeRequest(request, this.trustProxyHeaders);
    return this.angularAppEngine.handle(webRequest, requestContext);
  }
};
function createNodeRequestHandler(handler) {
  handler["__ng_node_request_handler__"] = true;
  return handler;
}
async function writeResponseToNodeResponse(source, destination) {
  const {
    status,
    headers,
    body
  } = source;
  destination.statusCode = status;
  let cookieHeaderSet = false;
  for (const [name, value] of headers.entries()) {
    if (name === "set-cookie") {
      if (cookieHeaderSet) {
        continue;
      }
      destination.setHeader(name, headers.getSetCookie());
      cookieHeaderSet = true;
    } else {
      destination.setHeader(name, value);
    }
  }
  if (!body) {
    destination.end();
    return;
  }
  try {
    const reader = body.getReader();
    destination.on("close", () => {
      reader.cancel().catch((error) => {
        console.error(`An error occurred while writing the response body for: ${destination.req.url}.`, error);
      });
    });
    while (true) {
      const {
        done,
        value
      } = await reader.read();
      if (done) {
        destination.end();
        break;
      }
      const canContinue = destination.write(value);
      if (canContinue === false) {
        await new Promise((resolve2) => destination.once("drain", resolve2));
      }
    }
  } catch {
    destination.end("Internal server error.");
  }
}
function isMainModule(url) {
  return url.startsWith("file:") && argv[1] === fileURLToPath(url);
}
export {
  AngularNodeAppEngine,
  CommonEngine,
  createNodeRequestHandler,
  createWebRequestFromNodeRequest,
  isMainModule,
  writeResponseToNodeResponse
};
//# sourceMappingURL=@angular_ssr_node.js.map
