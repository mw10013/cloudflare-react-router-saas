export default {
  fetch: (request, _env, _ctx) =>
    Promise.resolve(new Response(`👋 ${request.url}`)),
} satisfies ExportedHandler<Env>;
