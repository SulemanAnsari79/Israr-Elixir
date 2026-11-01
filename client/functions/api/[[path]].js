
const API_ORIGIN = "https://israr-elixir.onrender.com";

export async function onRequest(context) {
  const { request } = context;

  try {
    const incomingUrl = new URL(request.url);

    // Build the Render API URL while preserving
    // the original path and query parameters.
    const upstreamUrl = new URL(
      incomingUrl.pathname + incomingUrl.search,
      API_ORIGIN
    );

    // Forward incoming headers, including auth_token.
    const headers = new Headers(request.headers);

    // Let fetch set the correct upstream Host.
    headers.delete("host");

    const requestOptions = {
      method: request.method,
      headers,
      redirect: "manual",
    };

    // GET and HEAD requests cannot have a body.
    if (!["GET", "HEAD"].includes(request.method)) {
      requestOptions.body = request.body;
    }

    const upstreamRequest = new Request(
      upstreamUrl.toString(),
      requestOptions
    );

    // Send request to Render.
    const response = await fetch(upstreamRequest);

    // Return the original response, including Set-Cookie.
    return response;

  } catch (error) {
    console.error("API proxy error:", error);

    return Response.json(
      {
        success: false,
        message: "API proxy failed",
      },
      { status: 502 }
    );
  }
}
