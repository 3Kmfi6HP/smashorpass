// src/proxy.ts
var proxy_default = {
  async fetch(request, env, ctx) {
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    var raw = JSON.stringify({
      "seenImages": []
    });
    var requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: raw,
      redirect: "follow"
    };
    let res = await fetch("https://www.smashorpass.ai/api/images", requestOptions);
    let image = await res.json();
    let imageUrl = "https://storage.googleapis.com/smash-test-images/images/" + image.imageUrl;
    console.log(imageUrl);
    let imageResponse = await fetch(imageUrl);
    const response = new Response(await imageResponse.blob(), {
      status: 200,
      headers: {
        "Content-Type": imageResponse.headers.get("Content-Type") || "image/jpeg"
      }
    });
    return response;
  }
};

// src/redirect.ts
var redirect_default = {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const redirectUrl = url.searchParams.get("redirectUrl");
    if (!redirectUrl) {
      return new Response("Bad request: Missing `redirectUrl` query param", { status: 400 });
    }
    return Response.redirect(redirectUrl);
  }
};

// node_modules/itty-router/dist/itty-router.mjs
var e = ({ base: e2 = "", routes: r = [] } = {}) => ({ __proto__: new Proxy({}, { get: (a, o, t) => (a2, ...p) => r.push([o.toUpperCase(), RegExp(`^${(e2 + a2).replace(/(\/?)\*/g, "($1.*)?").replace(/(\/$)|((?<=\/)\/)/, "").replace(/(:(\w+)\+)/, "(?<$2>.*)").replace(/:(\w+)(\?)?(\.)?/g, "$2(?<$1>[^/]+)$2$3").replace(/\.(?=[\w(])/, "\\.").replace(/\)\.\?\(([^\[]+)\[\^/g, "?)\\.?($1(?<=\\.)[^\\.")}/*$`), p]) && t }), routes: r, async handle(e3, ...a) {
  let o, t, p = new URL(e3.url), l = e3.query = {};
  for (let [e4, r2] of p.searchParams)
    l[e4] = void 0 === l[e4] ? r2 : [l[e4], r2].flat();
  for (let [l2, s, c] of r)
    if ((l2 === e3.method || "ALL" === l2) && (t = p.pathname.match(s))) {
      e3.params = t.groups || {};
      for (let r2 of c)
        if (void 0 !== (o = await r2(e3.proxy || e3, ...a)))
          return o;
    }
} });

// src/router.ts
var router = e();
router.get("/api/todos", () => new Response("Todos Index!"));
router.get("/api/todos/:id", ({ params }) => new Response(`Todo #${params.id}`));
router.post("/api/todos", async (request) => {
  const content = await request.json();
  return new Response("Creating Todo: " + JSON.stringify(content));
});
router.all("*", () => new Response("Not Found.", { status: 404 }));
var router_default = router;

// src/worker.ts
var worker_default = {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    switch (url.pathname) {
      case "/redirect":
        return redirect_default.fetch(request, env, ctx);
      case "/smashorpass":
        return proxy_default.fetch(request, env, ctx);
    }
    if (url.pathname.startsWith("/api/")) {
      return router_default.handle(request);
    }
    return new Response(
      `Try making requests to:
      <ul>
      <li><code><a href="/redirect?redirectUrl=https://example.com/">/redirect?redirectUrl=https://example.com/</a></code>,</li>
      <li><code><a href="/proxy?modify&proxyUrl=https://example.com/">/proxy?modify&proxyUrl=https://example.com/</a></code>, or</li>
      <li><code><a href="/api/todos">/api/todos</a></code></li>`,
      { headers: { "Content-Type": "text/html" } }
    );
  }
};
export {
  worker_default as default
};
//# sourceMappingURL=worker.js.map
