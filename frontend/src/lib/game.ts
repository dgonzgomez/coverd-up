export const STAGES = [6, 10, 16, 24, 36] as const
export const normalize = (value: string) => value.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]/g, '')
export function matches(title: string, guess: string) {
  return normalize(title) === normalize(guess) || normalize(title.replace(/\s*[([](?:deluxe|expanded|remastered|anniversary)[^)\]]*[)\]]/gi, '')) === normalize(guess)
}
