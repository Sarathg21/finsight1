const BACKEND_ORIGIN =
  process.env.VITE_BACKEND ||
  process.env.VITE_API_BASE_URL ||
  "http://13.233.207.68:8000";

export default async function handler(req, res) {
  const { path, ...restQuery } = req.query;
  const pathStr = Array.isArray(path) ? path.join("/") : path || "";

  const upstreamQuery = new URLSearchParams();
  Object.entries(restQuery).forEach(([key, value]) => {
    if (value === undefined || value === null) {
      return;
    }

    if (Array.isArray(value)) {
      value.forEach((entry) => upstreamQuery.append(key, String(entry)));
      return;
    }

    upstreamQuery.append(key, String(value));
  });

  const querySuffix = upstreamQuery.toString();
  const targetUrl = `${BACKEND_ORIGIN.replace(/\/+$/, "")}/api/${pathStr}${
    querySuffix ? `?${querySuffix}` : ""
  }`;

  try {
    const headers = { ...req.headers };
    delete headers.host;
    delete headers.connection;
    delete headers["content-length"];
    delete headers["x-forwarded-for"];
    delete headers["x-forwarded-host"];
    delete headers["x-forwarded-proto"];
    delete headers["x-vercel-id"];
    delete headers["x-vercel-ip-country"];
    delete headers["x-vercel-ip-continent"];
    delete headers["x-vercel-ip-timezone"];
    delete headers["x-vercel-ip-latitude"];
    delete headers["x-vercel-ip-longitude"];
    delete headers["x-vercel-ip-as-number"];
    delete headers["x-vercel-ip-postal-code"];
    delete headers["x-vercel-ip-country-region"];
    delete headers["x-vercel-proxied-for"];
    delete headers["x-real-ip"];

    const options = {
      method: req.method,
      headers,
    };

    if (
      req.method !== "GET" &&
      req.method !== "HEAD" &&
      req.body !== undefined &&
      req.body !== null
    ) {
      options.body =
        typeof req.body === "string"
          ? req.body
          : JSON.stringify(req.body);

      if (!headers["content-type"]) {
        headers["content-type"] = "application/json";
      }
    }

    const response = await fetch(targetUrl, options);
    const data = await response.arrayBuffer();

    res.status(response.status);

    response.headers.forEach((value, key) => {
      const lower = key.toLowerCase();
      if (
        lower !== "transfer-encoding" &&
        lower !== "content-encoding" &&
        lower !== "connection"
      ) {
        res.setHeader(key, value);
      }
    });

    res.send(Buffer.from(data));
  } catch (error) {
    console.error("Proxy error:", error);
    res.status(502).json({
      error: "Bad Gateway",
      details: error.message,
    });
  }
}
