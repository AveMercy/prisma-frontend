interface Env {}

export const onRequest: PagesFunction<Env> = async (context) => {
    const url = new URL(context.request.url);
    const backendUrl = `http://194.226.125.55${url.pathname}${url.search}`;

    const init: RequestInit = {
        method: context.request.method,
        headers: context.request.headers,
        body: ['GET', 'HEAD'].includes(context.request.method)
            ? undefined
            : await context.request.text(),
        redirect: 'manual',
    };

    const headers = new Headers(init.headers);
    headers.delete('host');
    headers.delete('cf-connecting-ip');
    headers.delete('cf-ipcountry');
    headers.delete('cf-ray');
    headers.delete('cf-visitor');
    headers.delete('x-forwarded-proto');
    headers.delete('x-real-ip');
    init.headers = headers;

    const response = await fetch(backendUrl, init);

    const responseHeaders = new Headers(response.headers);
    responseHeaders.delete('content-encoding');
    responseHeaders.delete('content-length');
    responseHeaders.delete('transfer-encoding');

    return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders,
    });
};