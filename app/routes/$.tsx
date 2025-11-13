/**
 * Catch-all route loader for unmatched URLs.
 * Throws a 404 response to handle 404 errors, ensuring the root loader runs for all requests.
 */
export function loader() {
  // eslint-disable-next-line @typescript-eslint/only-throw-error
  throw new Response("Not Found", { status: 404 });
}

export default function RouteComponent() {
  return <div>Not Found</div>;
}
