export function parseAlbumQuery(input: string): string {
  const query = input.trim().replace(/[“”]/g, '"').replace(/[‘’]/g, "'").replace(/^(?:i think (?:it(?:'s| is) )?|(?:find|search for|show me)\s+)/i, '').replace(/\?+$/, '').trim()
  if (/\b(?:artist|album):/i.test(query)) return query
  const artist = query.match(/^(?:albums? (?:by|from)|(?:the )?artist)\s+(.+)$/i)
  if (artist) return `artist:"${artist[1].replace(/"/g, '').trim()}"`
  const by = query.match(/^(?:the album\s+)?(.+?)\s+by\s+(.+)$/i)
  if (by) return `album:"${by[1].replace(/"/g, '').trim()}" artist:"${by[2].replace(/"/g, '').trim()}"`
  const possessive = query.match(/^(.+?)'s\s+(?:album\s+)?(.+)$/i)
  if (possessive) return `artist:"${possessive[1].replace(/"/g, '').trim()}" album:"${possessive[2].replace(/"/g, '').trim()}"`
  return query
}
