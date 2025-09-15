const MarkupScript = ({jsonLd}: {jsonLd: Record<string, unknown>}) => {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c'),
      }}
    />
  )
}
export default MarkupScript