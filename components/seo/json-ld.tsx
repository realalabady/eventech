/**
 * Renders schema.org JSON-LD.
 *
 * `<` is escaped to `<` before it reaches the DOM. A description or event
 * title containing `</script>` would otherwise close the tag early and inject
 * whatever follows — the classic JSON-in-HTML injection. Everything here comes
 * from Firestore, which means it is user-authored, so this is not theoretical.
 *
 * Rendered from server components, so nothing ships to the client bundle.
 */
export function JsonLd({ schema }: { schema: Record<string, unknown> | null }) {
  if (!schema) return null;

  return (
    <script
      type="application/ld+json"
      // Safe despite the name: the payload is JSON.stringify output with `<`
      // escaped, never raw HTML. JSON-LD has no other outlet in React.
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schema).replace(/</g, "\\u003c"),
      }}
    />
  );
}
