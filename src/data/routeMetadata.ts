export function routeMetadata(path: string) {
  const preview = path.startsWith('/experience-preview');
  const retired = path.startsWith('/satellite-preview');
  return {
    title: preview ? 'Architectural experience review | Al Nouras' : 'Al Nouras | Dubai Waste Collection & Transporting',
    description: preview ? 'Review the architectural experience foundation and licensed asset shortlist for Al Nouras.' : 'Over 30 years of waste management experience in Dubai. Al Nouras provides medical, construction, commercial and residential waste collection and transporting.',
    robots: preview ? 'noindex,nofollow' : retired ? 'noindex,follow' : 'index,follow',
  };
}
