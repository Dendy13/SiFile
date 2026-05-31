/**
 * A lightweight, safe regex-based markdown parser to HTML.
 * Formatted with CSS classes tailored for the SiFile Design System.
 */
export function parseMarkdown(md: string): string {
  if (!md) return ''
  
  // Escape HTML to prevent XSS (allowing only safe text)
  let html = md
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

  // Headers (H3, H2, H1)
  html = html.replace(/^### (.*$)/gim, '<h4 class="text-lg font-bold mt-5 mb-2 text-[var(--color-text)]">$1</h4>')
  html = html.replace(/^## (.*$)/gim, '<h3 class="text-xl font-bold mt-7 mb-3 text-[var(--color-text)] border-b border-[var(--color-border)] pb-2">$1</h3>')
  html = html.replace(/^# (.*$)/gim, '<h2 class="text-2xl font-display mt-8 mb-4 text-[var(--color-text)]">$1</h2>')

  // Bold (**text**)
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-[var(--color-text)]">$1</strong>')

  // Bullet Lists (- item or * item)
  html = html.replace(/^\s*[-*]\s+(.*)$/gim, '<li class="ml-6 list-disc mb-1.5 text-[var(--color-text-muted)]">$1</li>')

  // Group list items into <ul>
  html = html.replace(/(<li.*?>[\s\S]*?<\/li>)/g, '<ul>$1</ul>')
  // Clean up nested <ul> tags
  html = html.replace(/<\/ul>\s*<ul>/g, '')

  // Tables
  const lines = html.split('\n')
  let inTable = false
  const processedLines = lines.map(line => {
    const trimmed = line.trim()
    if (trimmed.startsWith('|')) {
      const cells = trimmed.split('|').map(c => c.trim()).filter((c, idx, arr) => idx > 0 && idx < arr.length - 1)
      if (cells.length === 0) return ''
      
      // If it's a separator row like |---|---|
      if (cells.every(c => c.startsWith('-'))) {
        return ''
      }
      
      const tag = inTable ? 'td' : 'th'
      const cellHtml = cells.map(c => `<${tag} class="px-4 py-2.5 border border-[var(--color-border)] text-sm">${c}</${tag}>`).join('')
      
      let prefix = ''
      if (!inTable) {
        inTable = true
        prefix = '<div class="overflow-x-auto my-5 rounded-xl border border-[var(--color-border)]"><table class="w-full text-left border-collapse"><thead>'
      }
      return `${prefix}<tr class="${tag === 'th' ? 'bg-[var(--color-bg-muted)] font-semibold' : 'even:bg-[var(--color-bg-muted)]'}">${cellHtml}</tr>`
    } else {
      let suffix = ''
      if (inTable) {
        inTable = false
        suffix = '</tbody></table></div>'
      }
      return suffix + line
    }
  })
  
  html = processedLines.join('\n')

  // Paragraphs (double newlines)
  html = html.split(/\n\s*\n/).map(p => {
    const trimmed = p.trim()
    if (
      trimmed.startsWith('<h') || 
      trimmed.startsWith('<ul') || 
      trimmed.startsWith('<div') || 
      trimmed.startsWith('<li') || 
      trimmed.startsWith('<tr') || 
      trimmed.startsWith('<table')
    ) {
      return p
    }
    return `<p class="mb-4 leading-relaxed text-[var(--color-text-muted)] text-base">${p}</p>`
  }).join('\n')

  return html
}
