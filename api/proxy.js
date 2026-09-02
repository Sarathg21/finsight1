export default async function handler(req, res) {
  const { path } = req.query;
  const pathStr = Array.isArray(path) ? path.join("/") : (path || "");
  
  const targetUrl = `http://13.233.207.68:8000/api/${pathStr}`;
  
  try {
    const options = {
      method: req.method,
      headers: { ...req.headers, host: "13.233.207.68:8000" }
    };
    
    delete options.headers["x-forwarded-for"];
    delete options.headers["x-forwarded-host"];
    delete options.headers["x-forwarded-proto"];
    delete options.headers["connection"];
    
    if (req.method !== "GET" && req.method !== "HEAD" && req.body) {
      options.body = typeof req.body === "object" ? JSON.stringify(req.body) : req.body;
    }
    
    const response = await fetch(targetUrl, options);
    const data = await response.text();
    
    res.status(response.status);
    
    response.headers.forEach((value, key) => {
      if (key.toLowerCase() !== "transfer-encoding" && key.toLowerCase() !== "content-encoding") {
        res.setHeader(key, value);
      }
    });
    
    res.send(data);
  } catch (error) {
    console.error("Proxy error:", error);
    res.status(502).json({ error: "Bad Gateway", details: error.message });
  }
}
