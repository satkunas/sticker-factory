export interface FontConfig {
  name: string
  family: string
  weights: number[]
  category: 'serif' | 'sans-serif' | 'monospace' | 'display' | 'handwriting' | 'dingbats'
  source: 'google' | 'adobe' | 'web' | 'system'
  fontUrl?: string  // CSS @import or link URL
  googleFontUrl?: string  // Legacy support
  cssRules?: string[]  // Custom CSS @font-face rules
  fallback: string
}

export const FONT_CATEGORIES = {
  'sans-serif': 'Sans Serif',
  'serif': 'Serif',
  'monospace': 'Monospace',
  'display': 'Display',
  'handwriting': 'Handwriting',
  'dingbats': 'Symbols'
} as const

export const AVAILABLE_FONTS: FontConfig[] = [
  // Sans Serif Fonts
  {
    name: 'Inter',
    family: 'Inter',
    weights: [400, 500, 600, 700],
    category: 'sans-serif',
    source: 'google',
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
    fallback: 'system-ui, sans-serif'
  },
  {
    name: 'Roboto',
    family: 'Roboto',
    weights: [400, 500, 700],
    category: 'sans-serif',
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap',
    fallback: 'Arial, sans-serif'
  },
  {
    name: 'Open Sans',
    family: 'Open Sans',
    weights: [400, 600, 700],
    category: 'sans-serif',
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600;700&display=swap',
    fallback: 'Arial, sans-serif'
  },
  {
    name: 'Lato',
    family: 'Lato',
    weights: [400, 700],
    category: 'sans-serif',
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Lato:wght@400;700&display=swap',
    fallback: 'Arial, sans-serif'
  },
  {
    name: 'Poppins',
    family: 'Poppins',
    weights: [400, 500, 600, 700],
    category: 'sans-serif',
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap',
    fallback: 'Arial, sans-serif'
  },
  
  // Serif Fonts
  {
    name: 'Playfair Display',
    family: 'Playfair Display',
    weights: [400, 700],
    category: 'serif',
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&display=swap',
    fallback: 'Georgia, serif'
  },
  {
    name: 'Merriweather',
    family: 'Merriweather',
    weights: [400, 700],
    category: 'serif',
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Merriweather:wght@400;700&display=swap',
    fallback: 'Georgia, serif'
  },
  {
    name: 'Libre Baskerville',
    family: 'Libre Baskerville',
    weights: [400, 700],
    category: 'serif',
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Libre+Baskerville:wght@400;700&display=swap',
    fallback: 'Georgia, serif'
  },
  
  // Monospace Fonts
  {
    name: 'JetBrains Mono',
    family: 'JetBrains Mono',
    weights: [400, 500, 700],
    category: 'monospace',
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&display=swap',
    fallback: 'Menlo, monospace'
  },
  {
    name: 'Fira Code',
    family: 'Fira Code',
    weights: [400, 500, 700],
    category: 'monospace',
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500;700&display=swap',
    fallback: 'Monaco, monospace'
  },
  {
    name: 'Source Code Pro',
    family: 'Source Code Pro',
    weights: [400, 600],
    category: 'monospace',
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Source+Code+Pro:wght@400;600&display=swap',
    fallback: 'Consolas, monospace'
  },
  
  // Display Fonts
  {
    name: 'Oswald',
    family: 'Oswald',
    weights: [400, 500, 600, 700],
    category: 'display',
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600;700&display=swap',
    fallback: 'Arial, sans-serif'
  },
  {
    name: 'Bebas Neue',
    family: 'Bebas Neue',
    weights: [400],
    category: 'display',
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap',
    fallback: 'Arial, sans-serif'
  },
  {
    name: 'Montserrat',
    family: 'Montserrat',
    weights: [400, 500, 600, 700],
    category: 'display',
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap',
    fallback: 'Arial, sans-serif'
  },
  {
    name: 'Raleway',
    family: 'Raleway',
    weights: [400, 500, 600, 700],
    category: 'display',
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Raleway:wght@400;500;600;700&display=swap',
    fallback: 'Arial, sans-serif'
  },
  
  // Handwriting Fonts
  {
    name: 'Dancing Script',
    family: 'Dancing Script',
    weights: [400, 700],
    category: 'handwriting',
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400;700&display=swap',
    fallback: 'cursive'
  },
  {
    name: 'Pacifico',
    family: 'Pacifico',
    weights: [400],
    category: 'handwriting',
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Pacifico&display=swap',
    fallback: 'cursive'
  },
  {
    name: 'Caveat',
    family: 'Caveat',
    weights: [400, 700],
    category: 'handwriting',
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Caveat:wght@400;700&display=swap',
    fallback: 'cursive'
  },
  
  // Additional Sans Serif Fonts
  {
    name: 'Source Sans 3',
    family: 'Source Sans 3',
    weights: [400, 600, 700],
    category: 'sans-serif',
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Source+Sans+3:wght@400;600;700&display=swap',
    fallback: 'Arial, sans-serif'
  },
  {
    name: 'Nunito',
    family: 'Nunito',
    weights: [400, 600, 700],
    category: 'sans-serif',
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700&display=swap',
    fallback: 'Arial, sans-serif'
  },
  {
    name: 'Rubik',
    family: 'Rubik',
    weights: [400, 500, 700],
    category: 'sans-serif',
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Rubik:wght@400;500;700&display=swap',
    fallback: 'Arial, sans-serif'
  },
  {
    name: 'Work Sans',
    family: 'Work Sans',
    weights: [400, 500, 700],
    category: 'sans-serif',
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Work+Sans:wght@400;500;700&display=swap',
    fallback: 'Arial, sans-serif'
  },
  {
    name: 'Noto Sans',
    family: 'Noto Sans',
    weights: [400, 500, 700],
    category: 'sans-serif',
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Noto+Sans:wght@400;500;700&display=swap',
    fallback: 'Arial, sans-serif'
  },
  {
    name: 'IBM Plex Sans',
    family: 'IBM Plex Sans',
    weights: [400, 500, 700],
    category: 'sans-serif',
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;700&display=swap',
    fallback: 'Arial, sans-serif'
  },
  
  // Additional Serif Fonts
  {
    name: 'Lora',
    family: 'Lora',
    weights: [400, 500, 700],
    category: 'serif',
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Lora:wght@400;500;700&display=swap',
    fallback: 'Georgia, serif'
  },
  {
    name: 'Crimson Text',
    family: 'Crimson Text',
    weights: [400, 600, 700],
    category: 'serif',
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Crimson+Text:wght@400;600;700&display=swap',
    fallback: 'Georgia, serif'
  },
  {
    name: 'Source Serif 4',
    family: 'Source Serif 4',
    weights: [400, 600, 700],
    category: 'serif',
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Source+Serif+4:wght@400;600;700&display=swap',
    fallback: 'Georgia, serif'
  },
  {
    name: 'PT Serif',
    family: 'PT Serif',
    weights: [400, 700],
    category: 'serif',
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=PT+Serif:wght@400;700&display=swap',
    fallback: 'Georgia, serif'
  },
  {
    name: 'Cormorant Garamond',
    family: 'Cormorant Garamond',
    weights: [400, 500, 700],
    category: 'serif',
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;700&display=swap',
    fallback: 'Georgia, serif'
  },
  
  // Additional Display Fonts
  {
    name: 'Abril Fatface',
    family: 'Abril Fatface',
    weights: [400],
    category: 'display',
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Abril+Fatface&display=swap',
    fallback: 'serif'
  },
  {
    name: 'Righteous',
    family: 'Righteous',
    weights: [400],
    category: 'display',
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Righteous&display=swap',
    fallback: 'Arial, sans-serif'
  },
  {
    name: 'Fredoka One',
    family: 'Fredoka One',
    weights: [400],
    category: 'display',
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Fredoka+One&display=swap',
    fallback: 'Arial, sans-serif'
  },
  {
    name: 'Anton',
    family: 'Anton',
    weights: [400],
    category: 'display',
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Anton&display=swap',
    fallback: 'Arial, sans-serif'
  },
  {
    name: 'Bangers',
    family: 'Bangers',
    weights: [400],
    category: 'display',
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Bangers&display=swap',
    fallback: 'Arial, sans-serif'
  },
  {
    name: 'Bungee',
    family: 'Bungee',
    weights: [400],
    category: 'display',
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Bungee&display=swap',
    fallback: 'Arial, sans-serif'
  },
  {
    name: 'Comfortaa',
    family: 'Comfortaa',
    weights: [400, 500, 700],
    category: 'display',
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Comfortaa:wght@400;500;700&display=swap',
    fallback: 'Arial, sans-serif'
  },
  {
    name: 'Lobster',
    family: 'Lobster',
    weights: [400],
    category: 'display',
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Lobster&display=swap',
    fallback: 'cursive'
  },
  
  // Additional Handwriting Fonts
  {
    name: 'Kalam',
    family: 'Kalam',
    weights: [400, 700],
    category: 'handwriting',
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Kalam:wght@400;700&display=swap',
    fallback: 'cursive'
  },
  {
    name: 'Shadows Into Light',
    family: 'Shadows Into Light',
    weights: [400],
    category: 'handwriting',
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Shadows+Into+Light&display=swap',
    fallback: 'cursive'
  },
  {
    name: 'Indie Flower',
    family: 'Indie Flower',
    weights: [400],
    category: 'handwriting',
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Indie+Flower&display=swap',
    fallback: 'cursive'
  },
  {
    name: 'Permanent Marker',
    family: 'Permanent Marker',
    weights: [400],
    category: 'handwriting',
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Permanent+Marker&display=swap',
    fallback: 'cursive'
  },
  {
    name: 'Great Vibes',
    family: 'Great Vibes',
    weights: [400],
    category: 'handwriting',
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Great+Vibes&display=swap',
    fallback: 'cursive'
  },
  {
    name: 'Satisfy',
    family: 'Satisfy',
    weights: [400],
    category: 'handwriting',
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Satisfy&display=swap',
    fallback: 'cursive'
  },
  
  // Additional Monospace Fonts
  {
    name: 'Space Mono',
    family: 'Space Mono',
    weights: [400, 700],
    category: 'monospace',
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&display=swap',
    fallback: 'monospace'
  },
  {
    name: 'Roboto Mono',
    family: 'Roboto Mono',
    weights: [400, 500, 700],
    category: 'monospace',
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@400;500;700&display=swap',
    fallback: 'monospace'
  },
  {
    name: 'Ubuntu Mono',
    family: 'Ubuntu Mono',
    weights: [400, 700],
    category: 'monospace',
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Ubuntu+Mono:wght@400;700&display=swap',
    fallback: 'monospace'
  },
  {
    name: 'Courier Prime',
    family: 'Courier Prime',
    weights: [400, 700],
    category: 'monospace',
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Courier+Prime:wght@400;700&display=swap',
    fallback: 'monospace'
  },
  {
    name: 'Gabarito',
    family: 'Gabarito',
    weights: [400, 500, 600, 700],
    category: 'sans-serif',
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Gabarito:wght@400;500;600;700&display=swap',
    fallback: 'Arial, sans-serif'
  },
  {
    name: 'Space Grotesk',
    family: 'Space Grotesk',
    weights: [400, 500, 600, 700],
    category: 'sans-serif',
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap',
    fallback: 'Arial, sans-serif'
  },
  {
    name: 'Quicksand',
    family: 'Quicksand',
    weights: [400, 500, 600, 700],
    category: 'sans-serif',
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Quicksand:wght@400;500;600;700&display=swap',
    fallback: 'Arial, sans-serif'
  },
  {
    name: 'Varela Round',
    family: 'Varela Round',
    weights: [400],
    category: 'sans-serif',
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Varela+Round&display=swap',
    fallback: 'Arial, sans-serif'
  },
  {
    name: 'Readex Pro',
    family: 'Readex Pro',
    weights: [400, 500, 600, 700],
    category: 'sans-serif',
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Readex+Pro:wght@400;500;600;700&display=swap',
    fallback: 'Arial, sans-serif'
  },

  // Additional Sans Serif Fonts (Popular Google Fonts)
  {
    name: 'DM Sans',
    family: 'DM Sans',
    weights: [400, 500, 700],
    category: 'sans-serif',
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&display=swap',
    fallback: 'Arial, sans-serif'
  },
  {
    name: 'Manrope',
    family: 'Manrope',
    weights: [400, 500, 600, 700],
    category: 'sans-serif',
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700&display=swap',
    fallback: 'Arial, sans-serif'
  },
  {
    name: 'Plus Jakarta Sans',
    family: 'Plus Jakarta Sans',
    weights: [400, 500, 600, 700],
    category: 'sans-serif',
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap',
    fallback: 'Arial, sans-serif'
  },
  {
    name: 'Outfit',
    family: 'Outfit',
    weights: [400, 500, 600, 700],
    category: 'sans-serif',
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&display=swap',
    fallback: 'Arial, sans-serif'
  },
  {
    name: 'Figtree',
    family: 'Figtree',
    weights: [400, 500, 600, 700],
    category: 'sans-serif',
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Figtree:wght@400;500;600;700&display=swap',
    fallback: 'Arial, sans-serif'
  },
  {
    name: 'Karla',
    family: 'Karla',
    weights: [400, 500, 700],
    category: 'sans-serif',
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Karla:wght@400;500;700&display=swap',
    fallback: 'Arial, sans-serif'
  },
  {
    name: 'Mulish',
    family: 'Mulish',
    weights: [400, 500, 600, 700],
    category: 'sans-serif',
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Mulish:wght@400;500;600;700&display=swap',
    fallback: 'Arial, sans-serif'
  },
  {
    name: 'Red Hat Display',
    family: 'Red Hat Display',
    weights: [400, 500, 600, 700],
    category: 'sans-serif',
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Red+Hat+Display:wght@400;500;600;700&display=swap',
    fallback: 'Arial, sans-serif'
  },
  {
    name: 'Sora',
    family: 'Sora',
    weights: [400, 500, 600, 700],
    category: 'sans-serif',
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700&display=swap',
    fallback: 'Arial, sans-serif'
  },
  {
    name: 'Lexend',
    family: 'Lexend',
    weights: [400, 500, 600, 700],
    category: 'sans-serif',
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Lexend:wght@400;500;600;700&display=swap',
    fallback: 'Arial, sans-serif'
  },

  // More Popular Sans Serif Fonts
  {
    name: 'Barlow',
    family: 'Barlow',
    weights: [400, 500, 600, 700],
    category: 'sans-serif',
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600;700&display=swap',
    fallback: 'Arial, sans-serif'
  },
  {
    name: 'Public Sans',
    family: 'Public Sans',
    weights: [400, 500, 600, 700],
    category: 'sans-serif',
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Public+Sans:wght@400;500;600;700&display=swap',
    fallback: 'Arial, sans-serif'
  },
  {
    name: 'Josefin Sans',
    family: 'Josefin Sans',
    weights: [400, 500, 600, 700],
    category: 'sans-serif',
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Josefin+Sans:wght@400;500;600;700&display=swap',
    fallback: 'Arial, sans-serif'
  },
  {
    name: 'Cabin',
    family: 'Cabin',
    weights: [400, 500, 600, 700],
    category: 'sans-serif',
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Cabin:wght@400;500;600;700&display=swap',
    fallback: 'Arial, sans-serif'
  },
  {
    name: 'Oxygen',
    family: 'Oxygen',
    weights: [400, 700],
    category: 'sans-serif',
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Oxygen:wght@400;700&display=swap',
    fallback: 'Arial, sans-serif'
  },
  {
    name: 'Titillium Web',
    family: 'Titillium Web',
    weights: [400, 600, 700],
    category: 'sans-serif',
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Titillium+Web:wght@400;600;700&display=swap',
    fallback: 'Arial, sans-serif'
  },
  {
    name: 'Hind',
    family: 'Hind',
    weights: [400, 500, 600, 700],
    category: 'sans-serif',
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Hind:wght@400;500;600;700&display=swap',
    fallback: 'Arial, sans-serif'
  },

  // More Serif Fonts
  {
    name: 'EB Garamond',
    family: 'EB Garamond',
    weights: [400, 500, 600, 700],
    category: 'serif',
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=EB+Garamond:wght@400;500;600;700&display=swap',
    fallback: 'Georgia, serif'
  },
  {
    name: 'Old Standard TT',
    family: 'Old Standard TT',
    weights: [400, 700],
    category: 'serif',
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Old+Standard+TT:wght@400;700&display=swap',
    fallback: 'Georgia, serif'
  },
  {
    name: 'Vollkorn',
    family: 'Vollkorn',
    weights: [400, 500, 600, 700],
    category: 'serif',
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Vollkorn:wght@400;500;600;700&display=swap',
    fallback: 'Georgia, serif'
  },
  {
    name: 'Domine',
    family: 'Domine',
    weights: [400, 500, 600, 700],
    category: 'serif',
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Domine:wght@400;500;600;700&display=swap',
    fallback: 'Georgia, serif'
  },
  {
    name: 'Bitter',
    family: 'Bitter',
    weights: [400, 500, 600, 700],
    category: 'serif',
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Bitter:wght@400;500;600;700&display=swap',
    fallback: 'Georgia, serif'
  },
  {
    name: 'Alegreya',
    family: 'Alegreya',
    weights: [400, 500, 700],
    category: 'serif',
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Alegreya:wght@400;500;700&display=swap',
    fallback: 'Georgia, serif'
  },
  {
    name: 'Arvo',
    family: 'Arvo',
    weights: [400, 700],
    category: 'serif',
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Arvo:wght@400;700&display=swap',
    fallback: 'Georgia, serif'
  },
  {
    name: 'Rokkitt',
    family: 'Rokkitt',
    weights: [400, 500, 600, 700],
    category: 'serif',
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Rokkitt:wght@400;500;600;700&display=swap',
    fallback: 'Georgia, serif'
  },

  // More Display Fonts
  {
    name: 'Passion One',
    family: 'Passion One',
    weights: [400, 700],
    category: 'display',
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Passion+One:wght@400;700&display=swap',
    fallback: 'Arial, sans-serif'
  },
  {
    name: 'Archivo Black',
    family: 'Archivo Black',
    weights: [400],
    category: 'display',
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Archivo+Black&display=swap',
    fallback: 'Arial, sans-serif'
  },
  {
    name: 'Squada One',
    family: 'Squada One',
    weights: [400],
    category: 'display',
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Squada+One&display=swap',
    fallback: 'Arial, sans-serif'
  },
  {
    name: 'Alfa Slab One',
    family: 'Alfa Slab One',
    weights: [400],
    category: 'display',
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Alfa+Slab+One&display=swap',
    fallback: 'serif'
  },
  {
    name: 'Patua One',
    family: 'Patua One',
    weights: [400],
    category: 'display',
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Patua+One&display=swap',
    fallback: 'serif'
  },
  {
    name: 'Crete Round',
    family: 'Crete Round',
    weights: [400],
    category: 'display',
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Crete+Round&display=swap',
    fallback: 'serif'
  },

  // More Handwriting Fonts
  {
    name: 'Amatic SC',
    family: 'Amatic SC',
    weights: [400, 700],
    category: 'handwriting',
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Amatic+SC:wght@400;700&display=swap',
    fallback: 'cursive'
  },
  {
    name: 'Gloria Hallelujah',
    family: 'Gloria Hallelujah',
    weights: [400],
    category: 'handwriting',
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Gloria+Hallelujah&display=swap',
    fallback: 'cursive'
  },
  {
    name: 'Handlee',
    family: 'Handlee',
    weights: [400],
    category: 'handwriting',
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Handlee&display=swap',
    fallback: 'cursive'
  },
  {
    name: 'Patrick Hand',
    family: 'Patrick Hand',
    weights: [400],
    category: 'handwriting',
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Patrick+Hand&display=swap',
    fallback: 'cursive'
  },
  {
    name: 'Architects Daughter',
    family: 'Architects Daughter',
    weights: [400],
    category: 'handwriting',
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Architects+Daughter&display=swap',
    fallback: 'cursive'
  },
  {
    name: 'Schoolbell',
    family: 'Schoolbell',
    weights: [400],
    category: 'handwriting',
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Schoolbell&display=swap',
    fallback: 'cursive'
  },

  // More Monospace Fonts
  {
    name: 'Inconsolata',
    family: 'Inconsolata',
    weights: [400, 500, 600, 700],
    category: 'monospace',
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Inconsolata:wght@400;500;600;700&display=swap',
    fallback: 'monospace'
  },
  {
    name: 'PT Mono',
    family: 'PT Mono',
    weights: [400],
    category: 'monospace',
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=PT+Mono&display=swap',
    fallback: 'monospace'
  },
  {
    name: 'Anonymous Pro',
    family: 'Anonymous Pro',
    weights: [400, 700],
    category: 'monospace',
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Anonymous+Pro:wght@400;700&display=swap',
    fallback: 'monospace'
  },

  // Large collection of additional popular Google Fonts
  // More Sans Serif Fonts
  {
    name: 'Heebo',
    family: 'Heebo',
    weights: [400, 500, 600, 700],
    category: 'sans-serif',
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Heebo:wght@400;500;600;700&display=swap',
    fallback: 'Arial, sans-serif'
  },
  {
    name: 'Jost',
    family: 'Jost',
    weights: [400, 500, 600, 700],
    category: 'sans-serif',
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Jost:wght@400;500;600;700&display=swap',
    fallback: 'Arial, sans-serif'
  },
  {
    name: 'Inter Tight',
    family: 'Inter Tight',
    weights: [400, 500, 600, 700],
    category: 'sans-serif',
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Inter+Tight:wght@400;500;600;700&display=swap',
    fallback: 'Arial, sans-serif'
  },
  {
    name: 'Overpass',
    family: 'Overpass',
    weights: [400, 500, 600, 700],
    category: 'sans-serif',
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Overpass:wght@400;500;600;700&display=swap',
    fallback: 'Arial, sans-serif'
  },
  {
    name: 'Nunito Sans',
    family: 'Nunito Sans',
    weights: [400, 500, 600, 700],
    category: 'sans-serif',
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Nunito+Sans:wght@400;500;600;700&display=swap',
    fallback: 'Arial, sans-serif'
  },

  // Massive expansion - Sans Serif fonts
  {
    name: 'Fira Sans',
    family: 'Fira Sans',
    weights: [400, 500, 600, 700],
    category: 'sans-serif',
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Fira+Sans:wght@400;500;600;700&display=swap',
    fallback: 'Arial, sans-serif'
  },
  {
    name: 'Source Sans Pro',
    family: 'Source Sans Pro',
    weights: [400, 600, 700],
    category: 'sans-serif',
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Source+Sans+Pro:wght@400;600;700&display=swap',
    fallback: 'Arial, sans-serif'
  },
  {
    name: 'Ubuntu',
    family: 'Ubuntu',
    weights: [400, 500, 700],
    category: 'sans-serif',
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Ubuntu:wght@400;500;700&display=swap',
    fallback: 'Arial, sans-serif'
  },
  {
    name: 'PT Sans',
    family: 'PT Sans',
    weights: [400, 700],
    category: 'sans-serif',
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=PT+Sans:wght@400;700&display=swap',
    fallback: 'Arial, sans-serif'
  },
  {
    name: 'Dosis',
    family: 'Dosis',
    weights: [400, 500, 600, 700],
    category: 'sans-serif',
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Dosis:wght@400;500;600;700&display=swap',
    fallback: 'Arial, sans-serif'
  },
  {
    name: 'Asap',
    family: 'Asap',
    weights: [400, 500, 600, 700],
    category: 'sans-serif',
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Asap:wght@400;500;600;700&display=swap',
    fallback: 'Arial, sans-serif'
  },
  {
    name: 'Maven Pro',
    family: 'Maven Pro',
    weights: [400, 500, 600, 700],
    category: 'sans-serif',
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Maven+Pro:wght@400;500;600;700&display=swap',
    fallback: 'Arial, sans-serif'
  },
  {
    name: 'Exo',
    family: 'Exo',
    weights: [400, 500, 600, 700],
    category: 'sans-serif',
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Exo:wght@400;500;600;700&display=swap',
    fallback: 'Arial, sans-serif'
  },
  {
    name: 'Cantarell',
    family: 'Cantarell',
    weights: [400, 700],
    category: 'sans-serif',
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Cantarell:wght@400;700&display=swap',
    fallback: 'Arial, sans-serif'
  },
  {
    name: 'Arimo',
    family: 'Arimo',
    weights: [400, 500, 600, 700],
    category: 'sans-serif',
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Arimo:wght@400;500;600;700&display=swap',
    fallback: 'Arial, sans-serif'
  },
  {
    name: 'Assistant',
    family: 'Assistant',
    weights: [400, 500, 600, 700],
    category: 'sans-serif',
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Assistant:wght@400;500;600;700&display=swap',
    fallback: 'Arial, sans-serif'
  },
  {
    name: 'Catamaran',
    family: 'Catamaran',
    weights: [400, 500, 600, 700],
    category: 'sans-serif',
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Catamaran:wght@400;500;600;700&display=swap',
    fallback: 'Arial, sans-serif'
  },
  {
    name: 'Signika',
    family: 'Signika',
    weights: [400, 500, 600, 700],
    category: 'sans-serif',
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Signika:wght@400;500;600;700&display=swap',
    fallback: 'Arial, sans-serif'
  },
  {
    name: 'Lemon',
    family: 'Lemon',
    weights: [400],
    category: 'sans-serif',
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Lemon&display=swap',
    fallback: 'Arial, sans-serif'
  },
  {
    name: 'Questrial',
    family: 'Questrial',
    weights: [400],
    category: 'sans-serif',
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Questrial&display=swap',
    fallback: 'Arial, sans-serif'
  },
  {
    name: 'Muli',
    family: 'Muli',
    weights: [400, 500, 600, 700],
    category: 'sans-serif',
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Muli:wght@400;500;600;700&display=swap',
    fallback: 'Arial, sans-serif'
  },
  {
    name: 'Gudea',
    family: 'Gudea',
    weights: [400, 700],
    category: 'sans-serif',
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Gudea:wght@400;700&display=swap',
    fallback: 'Arial, sans-serif'
  },
  {
    name: 'Pontano Sans',
    family: 'Pontano Sans',
    weights: [400],
    category: 'sans-serif',
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Pontano+Sans&display=swap',
    fallback: 'Arial, sans-serif'
  },
  {
    name: 'Armata',
    family: 'Armata',
    weights: [400],
    category: 'sans-serif',
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Armata&display=swap',
    fallback: 'Arial, sans-serif'
  },
  {
    name: 'Economica',
    family: 'Economica',
    weights: [400, 700],
    category: 'sans-serif',
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Economica:wght@400;700&display=swap',
    fallback: 'Arial, sans-serif'
  },

  // More Serif Fonts
  {
    name: 'Libre Caslon Text',
    family: 'Libre Caslon Text',
    weights: [400, 700],
    category: 'serif',
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Libre+Caslon+Text:wght@400;700&display=swap',
    fallback: 'Georgia, serif'
  },
  {
    name: 'Zilla Slab',
    family: 'Zilla Slab',
    weights: [400, 500, 600, 700],
    category: 'serif',
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Zilla+Slab:wght@400;500;600;700&display=swap',
    fallback: 'Georgia, serif'
  },
  {
    name: 'Spectral',
    family: 'Spectral',
    weights: [400, 500, 600, 700],
    category: 'serif',
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Spectral:wght@400;500;600;700&display=swap',
    fallback: 'Georgia, serif'
  },
  {
    name: 'Frank Ruhl Libre',
    family: 'Frank Ruhl Libre',
    weights: [400, 500, 700],
    category: 'serif',
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Frank+Ruhl+Libre:wght@400;500;700&display=swap',
    fallback: 'Georgia, serif'
  },
  {
    name: 'Neuton',
    family: 'Neuton',
    weights: [400, 700],
    category: 'serif',
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Neuton:wght@400;700&display=swap',
    fallback: 'Georgia, serif'
  },
  {
    name: 'Gentium Basic',
    family: 'Gentium Basic',
    weights: [400, 700],
    category: 'serif',
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Gentium+Basic:wght@400;700&display=swap',
    fallback: 'Georgia, serif'
  },
  {
    name: 'Tinos',
    family: 'Tinos',
    weights: [400, 700],
    category: 'serif',
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Tinos:wght@400;700&display=swap',
    fallback: 'Georgia, serif'
  },
  {
    name: 'Noto Serif',
    family: 'Noto Serif',
    weights: [400, 700],
    category: 'serif',
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Noto+Serif:wght@400;700&display=swap',
    fallback: 'Georgia, serif'
  },
  {
    name: 'Cardo',
    family: 'Cardo',
    weights: [400, 700],
    category: 'serif',
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Cardo:wght@400;700&display=swap',
    fallback: 'Georgia, serif'
  },
  {
    name: 'Gelasio',
    family: 'Gelasio',
    weights: [400, 500, 600, 700],
    category: 'serif',
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Gelasio:wght@400;500;600;700&display=swap',
    fallback: 'Georgia, serif'
  },
  {
    name: 'Adamina',
    family: 'Adamina',
    weights: [400],
    category: 'serif',
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Adamina&display=swap',
    fallback: 'Georgia, serif'
  },
  {
    name: 'Fanwood Text',
    family: 'Fanwood Text',
    weights: [400],
    category: 'serif',
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Fanwood+Text&display=swap',
    fallback: 'Georgia, serif'
  },

  // More Display Fonts
  {
    name: 'Staatliches',
    family: 'Staatliches',
    weights: [400],
    category: 'display',
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Staatliches&display=swap',
    fallback: 'Arial, sans-serif'
  },
  {
    name: 'Russo One',
    family: 'Russo One',
    weights: [400],
    category: 'display',
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Russo+One&display=swap',
    fallback: 'Arial, sans-serif'
  },
  {
    name: 'Fjalla One',
    family: 'Fjalla One',
    weights: [400],
    category: 'display',
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Fjalla+One&display=swap',
    fallback: 'Arial, sans-serif'
  },
  {
    name: 'Permanent Marker',
    family: 'Permanent Marker',
    weights: [400],
    category: 'display',
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Permanent+Marker&display=swap',
    fallback: 'cursive'
  },
  {
    name: 'Creepster',
    family: 'Creepster',
    weights: [400],
    category: 'display',
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Creepster&display=swap',
    fallback: 'cursive'
  },
  {
    name: 'Kalam',
    family: 'Kalam',
    weights: [400, 700],
    category: 'display',
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Kalam:wght@400;700&display=swap',
    fallback: 'cursive'
  },
  {
    name: 'Black Ops One',
    family: 'Black Ops One',
    weights: [400],
    category: 'display',
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Black+Ops+One&display=swap',
    fallback: 'cursive'
  },
  {
    name: 'Audiowide',
    family: 'Audiowide',
    weights: [400],
    category: 'display',
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Audiowide&display=swap',
    fallback: 'cursive'
  },
  {
    name: 'Orbitron',
    family: 'Orbitron',
    weights: [400, 500, 700],
    category: 'display',
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;700&display=swap',
    fallback: 'sans-serif'
  },
  {
    name: 'Press Start 2P',
    family: 'Press Start 2P',
    weights: [400],
    category: 'display',
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap',
    fallback: 'cursive'
  },
  {
    name: 'Saira Condensed',
    family: 'Saira Condensed',
    weights: [400, 500, 600, 700],
    category: 'display',
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Saira+Condensed:wght@400;500;600;700&display=swap',
    fallback: 'sans-serif'
  },
  {
    name: 'Concert One',
    family: 'Concert One',
    weights: [400],
    category: 'display',
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Concert+One&display=swap',
    fallback: 'cursive'
  },
  {
    name: 'Teko',
    family: 'Teko',
    weights: [400, 500, 600, 700],
    category: 'display',
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Teko:wght@400;500;600;700&display=swap',
    fallback: 'sans-serif'
  },
  {
    name: 'Saira Stencil One',
    family: 'Saira Stencil One',
    weights: [400],
    category: 'display',
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Saira+Stencil+One&display=swap',
    fallback: 'sans-serif'
  },

  // More Handwriting/Script Fonts
  {
    name: 'Courgette',
    family: 'Courgette',
    weights: [400],
    category: 'handwriting',
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Courgette&display=swap',
    fallback: 'cursive'
  },
  {
    name: 'Comfortaa',
    family: 'Comfortaa',
    weights: [400, 500, 700],
    category: 'handwriting',
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Comfortaa:wght@400;500;700&display=swap',
    fallback: 'cursive'
  },
  {
    name: 'Cookie',
    family: 'Cookie',
    weights: [400],
    category: 'handwriting',
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Cookie&display=swap',
    fallback: 'cursive'
  },
  {
    name: 'Kaushan Script',
    family: 'Kaushan Script',
    weights: [400],
    category: 'handwriting',
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Kaushan+Script&display=swap',
    fallback: 'cursive'
  },
  {
    name: 'Alex Brush',
    family: 'Alex Brush',
    weights: [400],
    category: 'handwriting',
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Alex+Brush&display=swap',
    fallback: 'cursive'
  },
  {
    name: 'Allura',
    family: 'Allura',
    weights: [400],
    category: 'handwriting',
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Allura&display=swap',
    fallback: 'cursive'
  },
  {
    name: 'Bad Script',
    family: 'Bad Script',
    weights: [400],
    category: 'handwriting',
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Bad+Script&display=swap',
    fallback: 'cursive'
  },
  {
    name: 'Cedarville Cursive',
    family: 'Cedarville Cursive',
    weights: [400],
    category: 'handwriting',
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Cedarville+Cursive&display=swap',
    fallback: 'cursive'
  },

  // More Monospace Fonts
  {
    name: 'Cutive Mono',
    family: 'Cutive Mono',
    weights: [400],
    category: 'monospace',
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Cutive+Mono&display=swap',
    fallback: 'monospace'
  },
  {
    name: 'Share Tech Mono',
    family: 'Share Tech Mono',
    weights: [400],
    category: 'monospace',
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Share+Tech+Mono&display=swap',
    fallback: 'monospace'
  },
  {
    name: 'VT323',
    family: 'VT323',
    weights: [400],
    category: 'monospace',
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=VT323&display=swap',
    fallback: 'monospace'
  },
  {
    name: 'Major Mono Display',
    family: 'Major Mono Display',
    weights: [400],
    category: 'monospace',
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Major+Mono+Display&display=swap',
    fallback: 'monospace'
  },

  // Even more popular Google Fonts - Sans Serif
  {
    name: 'Archivo',
    family: 'Archivo',
    weights: [400, 500, 600, 700],
    category: 'sans-serif',
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;600;700&display=swap',
    fallback: 'Arial, sans-serif'
  },
  {
    name: 'Istok Web',
    family: 'Istok Web',
    weights: [400, 700],
    category: 'sans-serif',
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Istok+Web:wght@400;700&display=swap',
    fallback: 'Arial, sans-serif'
  },
  {
    name: 'Play',
    family: 'Play',
    weights: [400, 700],
    category: 'sans-serif',
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Play:wght@400;700&display=swap',
    fallback: 'Arial, sans-serif'
  },
  {
    name: 'Yanone Kaffeesatz',
    family: 'Yanone Kaffeesatz',
    weights: [400, 500, 600, 700],
    category: 'sans-serif',
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Yanone+Kaffeesatz:wght@400;500;600;700&display=swap',
    fallback: 'Arial, sans-serif'
  },
  {
    name: 'Nobile',
    family: 'Nobile',
    weights: [400, 500, 700],
    category: 'sans-serif',
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Nobile:wght@400;500;700&display=swap',
    fallback: 'Arial, sans-serif'
  },
  {
    name: 'Sintony',
    family: 'Sintony',
    weights: [400, 700],
    category: 'sans-serif',
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Sintony:wght@400;700&display=swap',
    fallback: 'Arial, sans-serif'
  },
  {
    name: 'Carme',
    family: 'Carme',
    weights: [400],
    category: 'sans-serif',
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Carme&display=swap',
    fallback: 'Arial, sans-serif'
  },
  {
    name: 'Scada',
    family: 'Scada',
    weights: [400, 700],
    category: 'sans-serif',
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Scada:wght@400;700&display=swap',
    fallback: 'Arial, sans-serif'
  },
  {
    name: 'Actor',
    family: 'Actor',
    weights: [400],
    category: 'sans-serif',
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Actor&display=swap',
    fallback: 'Arial, sans-serif'
  },
  {
    name: 'Rambla',
    family: 'Rambla',
    weights: [400, 700],
    category: 'sans-serif',
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Rambla:wght@400;700&display=swap',
    fallback: 'Arial, sans-serif'
  },
  {
    name: 'Magra',
    family: 'Magra',
    weights: [400, 700],
    category: 'sans-serif',
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Magra:wght@400;700&display=swap',
    fallback: 'Arial, sans-serif'
  },
  {
    name: 'Basic',
    family: 'Basic',
    weights: [400],
    category: 'sans-serif',
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Basic&display=swap',
    fallback: 'Arial, sans-serif'
  },
  {
    name: 'Imprima',
    family: 'Imprima',
    weights: [400],
    category: 'sans-serif',
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Imprima&display=swap',
    fallback: 'Arial, sans-serif'
  },
  {
    name: 'Telex',
    family: 'Telex',
    weights: [400],
    category: 'sans-serif',
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Telex&display=swap',
    fallback: 'Arial, sans-serif'
  },
  {
    name: 'Molengo',
    family: 'Molengo',
    weights: [400],
    category: 'sans-serif',
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Molengo&display=swap',
    fallback: 'Arial, sans-serif'
  },
  {
    name: 'Shanti',
    family: 'Shanti',
    weights: [400],
    category: 'sans-serif',
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Shanti&display=swap',
    fallback: 'Arial, sans-serif'
  },
  {
    name: 'Convergence',
    family: 'Convergence',
    weights: [400],
    category: 'sans-serif',
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Convergence&display=swap',
    fallback: 'Arial, sans-serif'
  },
  {
    name: 'Puritan',
    family: 'Puritan',
    weights: [400, 700],
    category: 'sans-serif',
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Puritan:wght@400;700&display=swap',
    fallback: 'Arial, sans-serif'
  },
  {
    name: 'Rosario',
    family: 'Rosario',
    weights: [400, 500, 600, 700],
    category: 'sans-serif',
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Rosario:wght@400;500;600;700&display=swap',
    fallback: 'Arial, sans-serif'
  },
  {
    name: 'ABeeZee',
    family: 'ABeeZee',
    weights: [400],
    category: 'sans-serif',
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=ABeeZee&display=swap',
    fallback: 'Arial, sans-serif'
  },
  {
    name: 'Cantata One',
    family: 'Cantata One',
    weights: [400],
    category: 'serif',
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Cantata+One&display=swap',
    fallback: 'Georgia, serif'
  },
  {
    name: 'Enriqueta',
    family: 'Enriqueta',
    weights: [400, 500, 600, 700],
    category: 'serif',
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Enriqueta:wght@400;500;600;700&display=swap',
    fallback: 'Georgia, serif'
  },
  {
    name: 'Kreon',
    family: 'Kreon',
    weights: [400, 500, 600, 700],
    category: 'serif',
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Kreon:wght@400;500;600;700&display=swap',
    fallback: 'Georgia, serif'
  },
  {
    name: 'Vidaloka',
    family: 'Vidaloka',
    weights: [400],
    category: 'serif',
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Vidaloka&display=swap',
    fallback: 'Georgia, serif'
  },
  {
    name: 'Copse',
    family: 'Copse',
    weights: [400],
    category: 'serif',
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Copse&display=swap',
    fallback: 'Georgia, serif'
  },
  {
    name: 'Kameron',
    family: 'Kameron',
    weights: [400, 700],
    category: 'serif',
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Kameron:wght@400;700&display=swap',
    fallback: 'Georgia, serif'
  },
  {
    name: 'Prociono',
    family: 'Prociono',
    weights: [400],
    category: 'serif',
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Prociono&display=swap',
    fallback: 'Georgia, serif'
  },
  {
    name: 'Crimson Pro',
    family: 'Crimson Pro',
    weights: [400, 500, 600, 700],
    category: 'serif',
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Crimson+Pro:wght@400;500;600;700&display=swap',
    fallback: 'Georgia, serif'
  },
  {
    name: 'Amethysta',
    family: 'Amethysta',
    weights: [400],
    category: 'serif',
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Amethysta&display=swap',
    fallback: 'Georgia, serif'
  },
  {
    name: 'Quando',
    family: 'Quando',
    weights: [400],
    category: 'serif',
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Quando&display=swap',
    fallback: 'Georgia, serif'
  },
  {
    name: 'Yeseva One',
    family: 'Yeseva One',
    weights: [400],
    category: 'display',
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Yeseva+One&display=swap',
    fallback: 'cursive'
  },
  {
    name: 'Yellowtail',
    family: 'Yellowtail',
    weights: [400],
    category: 'handwriting',
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Yellowtail&display=swap',
    fallback: 'cursive'
  },
  {
    name: 'Tangerine',
    family: 'Tangerine',
    weights: [400, 700],
    category: 'handwriting',
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Tangerine:wght@400;700&display=swap',
    fallback: 'cursive'
  },
  {
    name: 'Rochester',
    family: 'Rochester',
    weights: [400],
    category: 'handwriting',
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Rochester&display=swap',
    fallback: 'cursive'
  },
  {
    name: 'Pinyon Script',
    family: 'Pinyon Script',
    weights: [400],
    category: 'handwriting',
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Pinyon+Script&display=swap',
    fallback: 'cursive'
  },
  {
    name: 'Petit Formal Script',
    family: 'Petit Formal Script',
    weights: [400],
    category: 'handwriting',
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Petit+Formal+Script&display=swap',
    fallback: 'cursive'
  },

  // Large batch addition - Even more fonts to reach 500
  {
    name: 'Merriweather Sans',
    family: 'Merriweather Sans',
    weights: [400, 500, 600, 700],
    category: 'sans-serif',
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Merriweather+Sans:wght@400;500;600;700&display=swap',
    fallback: 'Arial, sans-serif'
  },
  {
    name: 'Crimson Text',
    family: 'Crimson Text',
    weights: [400, 600, 700],
    category: 'serif',
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Crimson+Text:wght@400;600;700&display=swap',
    fallback: 'Georgia, serif'
  },
  {
    name: 'Indie Flower',
    family: 'Indie Flower',
    weights: [400],
    category: 'handwriting',
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Indie+Flower&display=swap',
    fallback: 'cursive'
  },
  {
    name: 'Shadows Into Light',
    family: 'Shadows Into Light',
    weights: [400],
    category: 'handwriting',
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Shadows+Into+Light&display=swap',
    fallback: 'cursive'
  },
  {
    name: 'Great Vibes',
    family: 'Great Vibes',
    weights: [400],
    category: 'handwriting',
    googleFontUrl: 'https://fonts.googleapis.com/css2?family=Great+Vibes&display=swap',
    fallback: 'cursive'
  },

  // Massive batch to reach 500 fonts - Popular Google Fonts
  { name: 'Antic Slab', family: 'Antic Slab', weights: [400], category: 'serif', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Antic+Slab&display=swap', fallback: 'Georgia, serif' },
  { name: 'Quicksand', family: 'Quicksand', weights: [400, 500, 600, 700], category: 'sans-serif', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Quicksand:wght@400;500;600;700&display=swap', fallback: 'Arial, sans-serif' },
  { name: 'Pacifico', family: 'Pacifico', weights: [400], category: 'handwriting', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Pacifico&display=swap', fallback: 'cursive' },
  { name: 'Dancing Script', family: 'Dancing Script', weights: [400, 700], category: 'handwriting', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400;700&display=swap', fallback: 'cursive' },
  { name: 'Caveat', family: 'Caveat', weights: [400, 700], category: 'handwriting', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Caveat:wght@400;700&display=swap', fallback: 'cursive' },
  { name: 'Satisfy', family: 'Satisfy', weights: [400], category: 'handwriting', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Satisfy&display=swap', fallback: 'cursive' },
  { name: 'Lobster', family: 'Lobster', weights: [400], category: 'display', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Lobster&display=swap', fallback: 'cursive' },
  { name: 'Acme', family: 'Acme', weights: [400], category: 'sans-serif', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Acme&display=swap', fallback: 'Arial, sans-serif' },
  { name: 'Alice', family: 'Alice', weights: [400], category: 'serif', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Alice&display=swap', fallback: 'Georgia, serif' },
  { name: 'Aleo', family: 'Aleo', weights: [400, 700], category: 'serif', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Aleo:wght@400;700&display=swap', fallback: 'Georgia, serif' },
  { name: 'Allerta', family: 'Allerta', weights: [400], category: 'sans-serif', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Allerta&display=swap', fallback: 'Arial, sans-serif' },
  { name: 'Allerta Stencil', family: 'Allerta Stencil', weights: [400], category: 'sans-serif', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Allerta+Stencil&display=swap', fallback: 'Arial, sans-serif' },
  { name: 'Amaranth', family: 'Amaranth', weights: [400, 700], category: 'sans-serif', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Amaranth:wght@400;700&display=swap', fallback: 'Arial, sans-serif' },
  { name: 'Andada', family: 'Andada', weights: [400], category: 'serif', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Andada&display=swap', fallback: 'Georgia, serif' },
  { name: 'Annie Use Your Telescope', family: 'Annie Use Your Telescope', weights: [400], category: 'handwriting', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Annie+Use+Your+Telescope&display=swap', fallback: 'cursive' },
  { name: 'Antic', family: 'Antic', weights: [400], category: 'sans-serif', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Antic&display=swap', fallback: 'Arial, sans-serif' },
  { name: 'Arapey', family: 'Arapey', weights: [400], category: 'serif', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Arapey&display=swap', fallback: 'Georgia, serif' },
  { name: 'Arbutus Slab', family: 'Arbutus Slab', weights: [400], category: 'serif', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Arbutus+Slab&display=swap', fallback: 'Georgia, serif' },
  { name: 'Artifika', family: 'Artifika', weights: [400], category: 'serif', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Artifika&display=swap', fallback: 'Georgia, serif' },
  { name: 'Asul', family: 'Asul', weights: [400, 700], category: 'sans-serif', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Asul:wght@400;700&display=swap', fallback: 'Arial, sans-serif' },
  { name: 'Average', family: 'Average', weights: [400], category: 'serif', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Average&display=swap', fallback: 'Georgia, serif' },
  { name: 'Average Sans', family: 'Average Sans', weights: [400], category: 'sans-serif', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Average+Sans&display=swap', fallback: 'Arial, sans-serif' },
  { name: 'Balthazar', family: 'Balthazar', weights: [400], category: 'serif', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Balthazar&display=swap', fallback: 'Georgia, serif' },
  { name: 'Bentham', family: 'Bentham', weights: [400], category: 'serif', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Bentham&display=swap', fallback: 'Georgia, serif' },
  { name: 'Brawler', family: 'Brawler', weights: [400], category: 'serif', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Brawler&display=swap', fallback: 'Georgia, serif' },
  { name: 'Bree Serif', family: 'Bree Serif', weights: [400], category: 'serif', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Bree+Serif&display=swap', fallback: 'Georgia, serif' },
  { name: 'Bubblegum Sans', family: 'Bubblegum Sans', weights: [400], category: 'display', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Bubblegum+Sans&display=swap', fallback: 'cursive' },
  { name: 'Cabin Condensed', family: 'Cabin Condensed', weights: [400, 500, 600, 700], category: 'sans-serif', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Cabin+Condensed:wght@400;500;600;700&display=swap', fallback: 'Arial, sans-serif' },
  { name: 'Cagliostro', family: 'Cagliostro', weights: [400], category: 'sans-serif', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Cagliostro&display=swap', fallback: 'Arial, sans-serif' },
  { name: 'Calligraffitti', family: 'Calligraffitti', weights: [400], category: 'handwriting', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Calligraffitti&display=swap', fallback: 'cursive' },
  { name: 'Cambo', family: 'Cambo', weights: [400], category: 'serif', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Cambo&display=swap', fallback: 'Georgia, serif' },
  { name: 'Candal', family: 'Candal', weights: [400], category: 'sans-serif', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Candal&display=swap', fallback: 'Arial, sans-serif' },
  { name: 'Cantora One', family: 'Cantora One', weights: [400], category: 'sans-serif', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Cantora+One&display=swap', fallback: 'Arial, sans-serif' },
  { name: 'Carter One', family: 'Carter One', weights: [400], category: 'display', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Carter+One&display=swap', fallback: 'cursive' },
  { name: 'Caudex', family: 'Caudex', weights: [400, 700], category: 'serif', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Caudex:wght@400;700&display=swap', fallback: 'Georgia, serif' },
  { name: 'Changa One', family: 'Changa One', weights: [400], category: 'display', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Changa+One&display=swap', fallback: 'cursive' },
  { name: 'Chau Philomene One', family: 'Chau Philomene One', weights: [400], category: 'sans-serif', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Chau+Philomene+One&display=swap', fallback: 'Arial, sans-serif' },
  { name: 'Chivo', family: 'Chivo', weights: [400, 700], category: 'sans-serif', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Chivo:wght@400;700&display=swap', fallback: 'Arial, sans-serif' },
  { name: 'Cinzel', family: 'Cinzel', weights: [400, 500, 600, 700], category: 'serif', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600;700&display=swap', fallback: 'Georgia, serif' },
  { name: 'Cinzel Decorative', family: 'Cinzel Decorative', weights: [400, 700], category: 'display', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@400;700&display=swap', fallback: 'cursive' },
  { name: 'Clicker Script', family: 'Clicker Script', weights: [400], category: 'handwriting', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Clicker+Script&display=swap', fallback: 'cursive' },
  { name: 'Coda', family: 'Coda', weights: [400, 800], category: 'display', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Coda:wght@400;800&display=swap', fallback: 'cursive' },
  { name: 'Coda Caption', family: 'Coda Caption', weights: [800], category: 'sans-serif', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Coda+Caption:wght@800&display=swap', fallback: 'Arial, sans-serif' },
  { name: 'Codystar', family: 'Codystar', weights: [400], category: 'display', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Codystar&display=swap', fallback: 'cursive' },
  { name: 'Coming Soon', family: 'Coming Soon', weights: [400], category: 'handwriting', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Coming+Soon&display=swap', fallback: 'cursive' },
  { name: 'Cousine', family: 'Cousine', weights: [400, 700], category: 'monospace', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Cousine:wght@400;700&display=swap', fallback: 'monospace' },
  { name: 'Covered By Your Grace', family: 'Covered By Your Grace', weights: [400], category: 'handwriting', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Covered+By+Your+Grace&display=swap', fallback: 'cursive' },
  { name: 'Crafty Girls', family: 'Crafty Girls', weights: [400], category: 'handwriting', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Crafty+Girls&display=swap', fallback: 'cursive' },
  { name: 'Creepster', family: 'Creepster', weights: [400], category: 'display', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Creepster&display=swap', fallback: 'cursive' },
  { name: 'Crete Round', family: 'Crete Round', weights: [400], category: 'serif', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Crete+Round&display=swap', fallback: 'Georgia, serif' },
  { name: 'Crushed', family: 'Crushed', weights: [400], category: 'display', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Crushed&display=swap', fallback: 'cursive' },
  { name: 'Cuprum', family: 'Cuprum', weights: [400, 700], category: 'sans-serif', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Cuprum:wght@400;700&display=swap', fallback: 'Arial, sans-serif' },
  { name: 'Dancing Script', family: 'Dancing Script', weights: [400, 700], category: 'handwriting', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400;700&display=swap', fallback: 'cursive' },
  { name: 'Dawning of a New Day', family: 'Dawning of a New Day', weights: [400], category: 'handwriting', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Dawning+of+a+New+Day&display=swap', fallback: 'cursive' },
  { name: 'Days One', family: 'Days One', weights: [400], category: 'sans-serif', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Days+One&display=swap', fallback: 'Arial, sans-serif' },
  { name: 'Delius', family: 'Delius', weights: [400], category: 'handwriting', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Delius&display=swap', fallback: 'cursive' },
  { name: 'Delius Swash Caps', family: 'Delius Swash Caps', weights: [400], category: 'handwriting', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Delius+Swash+Caps&display=swap', fallback: 'cursive' },
  { name: 'Delius Unicase', family: 'Delius Unicase', weights: [400, 700], category: 'handwriting', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Delius+Unicase:wght@400;700&display=swap', fallback: 'cursive' },
  { name: 'Della Respira', family: 'Della Respira', weights: [400], category: 'serif', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Della+Respira&display=swap', fallback: 'Georgia, serif' },
  { name: 'Droid Sans', family: 'Droid Sans', weights: [400, 700], category: 'sans-serif', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Droid+Sans:wght@400;700&display=swap', fallback: 'Arial, sans-serif' },
  { name: 'Droid Sans Mono', family: 'Droid Sans Mono', weights: [400], category: 'monospace', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Droid+Sans+Mono&display=swap', fallback: 'monospace' },
  { name: 'Droid Serif', family: 'Droid Serif', weights: [400, 700], category: 'serif', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Droid+Serif:wght@400;700&display=swap', fallback: 'Georgia, serif' },
  { name: 'EB Garamond', family: 'EB Garamond', weights: [400, 500, 600, 700], category: 'serif', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=EB+Garamond:wght@400;500;600;700&display=swap', fallback: 'Georgia, serif' },
  { name: 'Eater', family: 'Eater', weights: [400], category: 'display', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Eater&display=swap', fallback: 'cursive' },
  { name: 'Economica', family: 'Economica', weights: [400, 700], category: 'sans-serif', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Economica:wght@400;700&display=swap', fallback: 'Arial, sans-serif' },
  { name: 'Electrolize', family: 'Electrolize', weights: [400], category: 'sans-serif', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Electrolize&display=swap', fallback: 'Arial, sans-serif' },
  { name: 'Elsie', family: 'Elsie', weights: [400, 900], category: 'display', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Elsie:wght@400;900&display=swap', fallback: 'cursive' },
  { name: 'Elsie Swash Caps', family: 'Elsie Swash Caps', weights: [400, 900], category: 'display', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Elsie+Swash+Caps:wght@400;900&display=swap', fallback: 'cursive' },
  { name: 'Emblema One', family: 'Emblema One', weights: [400], category: 'display', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Emblema+One&display=swap', fallback: 'cursive' },
  { name: 'Emilys Candy', family: 'Emilys Candy', weights: [400], category: 'display', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Emilys+Candy&display=swap', fallback: 'cursive' },
  { name: 'Engagement', family: 'Engagement', weights: [400], category: 'handwriting', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Engagement&display=swap', fallback: 'cursive' },
  { name: 'Englebert', family: 'Englebert', weights: [400], category: 'sans-serif', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Englebert&display=swap', fallback: 'Arial, sans-serif' },
  { name: 'Erica One', family: 'Erica One', weights: [400], category: 'display', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Erica+One&display=swap', fallback: 'cursive' },
  { name: 'Esteban', family: 'Esteban', weights: [400], category: 'serif', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Esteban&display=swap', fallback: 'Georgia, serif' },
  { name: 'Euphoria Script', family: 'Euphoria Script', weights: [400], category: 'handwriting', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Euphoria+Script&display=swap', fallback: 'cursive' },
  { name: 'Ewert', family: 'Ewert', weights: [400], category: 'display', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Ewert&display=swap', fallback: 'cursive' },
  { name: 'Exo 2', family: 'Exo 2', weights: [400, 500, 600, 700], category: 'sans-serif', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Exo+2:wght@400;500;600;700&display=swap', fallback: 'Arial, sans-serif' },
  { name: 'Expletus Sans', family: 'Expletus Sans', weights: [400, 500, 600, 700], category: 'display', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Expletus+Sans:wght@400;500;600;700&display=swap', fallback: 'cursive' },
  { name: 'Fascinate', family: 'Fascinate', weights: [400], category: 'display', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Fascinate&display=swap', fallback: 'cursive' },
  { name: 'Fascinate Inline', family: 'Fascinate Inline', weights: [400], category: 'display', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Fascinate+Inline&display=swap', fallback: 'cursive' },
  { name: 'Faster One', family: 'Faster One', weights: [400], category: 'display', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Faster+One&display=swap', fallback: 'cursive' },
  { name: 'Fasthand', family: 'Fasthand', weights: [400], category: 'serif', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Fasthand&display=swap', fallback: 'Georgia, serif' },
  { name: 'Federant', family: 'Federant', weights: [400], category: 'display', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Federant&display=swap', fallback: 'cursive' },
  { name: 'Federo', family: 'Federo', weights: [400], category: 'sans-serif', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Federo&display=swap', fallback: 'Arial, sans-serif' },
  { name: 'Felipa', family: 'Felipa', weights: [400], category: 'handwriting', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Felipa&display=swap', fallback: 'cursive' },
  { name: 'Fenix', family: 'Fenix', weights: [400], category: 'serif', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Fenix&display=swap', fallback: 'Georgia, serif' },
  { name: 'Finger Paint', family: 'Finger Paint', weights: [400], category: 'display', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Finger+Paint&display=swap', fallback: 'cursive' },
  { name: 'Fira Mono', family: 'Fira Mono', weights: [400, 500, 700], category: 'monospace', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Fira+Mono:wght@400;500;700&display=swap', fallback: 'monospace' },
  { name: 'Flamenco', family: 'Flamenco', weights: [400], category: 'display', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Flamenco&display=swap', fallback: 'cursive' },
  { name: 'Flavors', family: 'Flavors', weights: [400], category: 'display', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Flavors&display=swap', fallback: 'cursive' },
  { name: 'Fondamento', family: 'Fondamento', weights: [400], category: 'handwriting', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Fondamento&display=swap', fallback: 'cursive' },
  { name: 'Fontdiner Swanky', family: 'Fontdiner Swanky', weights: [400], category: 'display', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Fontdiner+Swanky&display=swap', fallback: 'cursive' },
  { name: 'Forum', family: 'Forum', weights: [400], category: 'display', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Forum&display=swap', fallback: 'cursive' },
  { name: 'Francois One', family: 'Francois One', weights: [400], category: 'sans-serif', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Francois+One&display=swap', fallback: 'Arial, sans-serif' },
  { name: 'Freckle Face', family: 'Freckle Face', weights: [400], category: 'display', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Freckle+Face&display=swap', fallback: 'cursive' },
  { name: 'Fredericka the Great', family: 'Fredericka the Great', weights: [400], category: 'display', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Fredericka+the+Great&display=swap', fallback: 'cursive' },
  { name: 'Fredoka One', family: 'Fredoka One', weights: [400], category: 'display', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Fredoka+One&display=swap', fallback: 'cursive' },
  { name: 'Freehand', family: 'Freehand', weights: [400], category: 'display', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Freehand&display=swap', fallback: 'cursive' },
  { name: 'Fresca', family: 'Fresca', weights: [400], category: 'sans-serif', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Fresca&display=swap', fallback: 'Arial, sans-serif' },
  { name: 'Frijole', family: 'Frijole', weights: [400], category: 'display', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Frijole&display=swap', fallback: 'cursive' },
  { name: 'Fruktur', family: 'Fruktur', weights: [400], category: 'display', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Fruktur&display=swap', fallback: 'cursive' },
  { name: 'Fugaz One', family: 'Fugaz One', weights: [400], category: 'display', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Fugaz+One&display=swap', fallback: 'cursive' },
  { name: 'GFS Didot', family: 'GFS Didot', weights: [400], category: 'serif', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=GFS+Didot&display=swap', fallback: 'Georgia, serif' },
  { name: 'GFS Neohellenic', family: 'GFS Neohellenic', weights: [400, 700], category: 'sans-serif', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=GFS+Neohellenic:wght@400;700&display=swap', fallback: 'Arial, sans-serif' },
  { name: 'Gabriela', family: 'Gabriela', weights: [400], category: 'serif', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Gabriela&display=swap', fallback: 'Georgia, serif' },
  { name: 'Gafata', family: 'Gafata', weights: [400], category: 'sans-serif', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Gafata&display=swap', fallback: 'Arial, sans-serif' },
  { name: 'Galdeano', family: 'Galdeano', weights: [400], category: 'sans-serif', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Galdeano&display=swap', fallback: 'Arial, sans-serif' },
  { name: 'Galindo', family: 'Galindo', weights: [400], category: 'display', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Galindo&display=swap', fallback: 'cursive' },
  { name: 'Gentium Book Basic', family: 'Gentium Book Basic', weights: [400, 700], category: 'serif', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Gentium+Book+Basic:wght@400;700&display=swap', fallback: 'Georgia, serif' },
  { name: 'Geo', family: 'Geo', weights: [400], category: 'sans-serif', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Geo&display=swap', fallback: 'Arial, sans-serif' },
  { name: 'Geostar', family: 'Geostar', weights: [400], category: 'display', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Geostar&display=swap', fallback: 'cursive' },
  { name: 'Geostar Fill', family: 'Geostar Fill', weights: [400], category: 'display', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Geostar+Fill&display=swap', fallback: 'cursive' },
  { name: 'Germania One', family: 'Germania One', weights: [400], category: 'display', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Germania+One&display=swap', fallback: 'cursive' },
  { name: 'Gilda Display', family: 'Gilda Display', weights: [400], category: 'serif', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Gilda+Display&display=swap', fallback: 'Georgia, serif' },
  { name: 'Give You Glory', family: 'Give You Glory', weights: [400], category: 'handwriting', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Give+You+Glory&display=swap', fallback: 'cursive' },
  { name: 'Glass Antiqua', family: 'Glass Antiqua', weights: [400], category: 'display', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Glass+Antiqua&display=swap', fallback: 'cursive' },
  { name: 'Glegoo', family: 'Glegoo', weights: [400], category: 'serif', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Glegoo&display=swap', fallback: 'Georgia, serif' },
  { name: 'Gloria Hallelujah', family: 'Gloria Hallelujah', weights: [400], category: 'handwriting', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Gloria+Hallelujah&display=swap', fallback: 'cursive' },
  { name: 'Goblin One', family: 'Goblin One', weights: [400], category: 'display', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Goblin+One&display=swap', fallback: 'cursive' },
  { name: 'Gochi Hand', family: 'Gochi Hand', weights: [400], category: 'handwriting', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Gochi+Hand&display=swap', fallback: 'cursive' },
  { name: 'Gorditas', family: 'Gorditas', weights: [400, 700], category: 'display', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Gorditas:wght@400;700&display=swap', fallback: 'cursive' },
  { name: 'Goudy Bookletter 1911', family: 'Goudy Bookletter 1911', weights: [400], category: 'serif', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Goudy+Bookletter+1911&display=swap', fallback: 'Georgia, serif' },
  { name: 'Graduate', family: 'Graduate', weights: [400], category: 'display', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Graduate&display=swap', fallback: 'cursive' },
  { name: 'Grand Hotel', family: 'Grand Hotel', weights: [400], category: 'handwriting', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Grand+Hotel&display=swap', fallback: 'cursive' },
  { name: 'Gravitas One', family: 'Gravitas One', weights: [400], category: 'display', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Gravitas+One&display=swap', fallback: 'cursive' },
  { name: 'Great Vibes', family: 'Great Vibes', weights: [400], category: 'handwriting', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Great+Vibes&display=swap', fallback: 'cursive' },
  { name: 'Griffy', family: 'Griffy', weights: [400], category: 'display', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Griffy&display=swap', fallback: 'cursive' },
  { name: 'Gruppo', family: 'Gruppo', weights: [400], category: 'display', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Gruppo&display=swap', fallback: 'cursive' },
  { name: 'Gudea', family: 'Gudea', weights: [400, 700], category: 'sans-serif', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Gudea:wght@400;700&display=swap', fallback: 'Arial, sans-serif' },
  { name: 'Habibi', family: 'Habibi', weights: [400], category: 'serif', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Habibi&display=swap', fallback: 'Georgia, serif' },
  { name: 'Hammersmith One', family: 'Hammersmith One', weights: [400], category: 'sans-serif', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Hammersmith+One&display=swap', fallback: 'Arial, sans-serif' },
  { name: 'Hanalei', family: 'Hanalei', weights: [400], category: 'display', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Hanalei&display=swap', fallback: 'cursive' },
  { name: 'Hanalei Fill', family: 'Hanalei Fill', weights: [400], category: 'display', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Hanalei+Fill&display=swap', fallback: 'cursive' },
  { name: 'Handlee', family: 'Handlee', weights: [400], category: 'handwriting', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Handlee&display=swap', fallback: 'cursive' },
  { name: 'Hanuman', family: 'Hanuman', weights: [400, 700], category: 'serif', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Hanuman:wght@400;700&display=swap', fallback: 'Georgia, serif' },
  { name: 'Happy Monkey', family: 'Happy Monkey', weights: [400], category: 'display', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Happy+Monkey&display=swap', fallback: 'cursive' },
  { name: 'Headland One', family: 'Headland One', weights: [400], category: 'serif', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Headland+One&display=swap', fallback: 'Georgia, serif' },
  { name: 'Henny Penny', family: 'Henny Penny', weights: [400], category: 'display', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Henny+Penny&display=swap', fallback: 'cursive' },
  { name: 'Herr Von Muellerhoff', family: 'Herr Von Muellerhoff', weights: [400], category: 'handwriting', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Herr+Von+Muellerhoff&display=swap', fallback: 'cursive' },
  { name: 'Hind Madurai', family: 'Hind Madurai', weights: [400, 500, 600, 700], category: 'sans-serif', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Hind+Madurai:wght@400;500;600;700&display=swap', fallback: 'Arial, sans-serif' },
  { name: 'Holtwood One SC', family: 'Holtwood One SC', weights: [400], category: 'serif', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Holtwood+One+SC&display=swap', fallback: 'Georgia, serif' },
  { name: 'Homemade Apple', family: 'Homemade Apple', weights: [400], category: 'handwriting', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Homemade+Apple&display=swap', fallback: 'cursive' },
  { name: 'Homenaje', family: 'Homenaje', weights: [400], category: 'sans-serif', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Homenaje&display=swap', fallback: 'Arial, sans-serif' },
  { name: 'IM Fell DW Pica', family: 'IM Fell DW Pica', weights: [400], category: 'serif', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=IM+Fell+DW+Pica&display=swap', fallback: 'Georgia, serif' },
  { name: 'IM Fell DW Pica SC', family: 'IM Fell DW Pica SC', weights: [400], category: 'serif', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=IM+Fell+DW+Pica+SC&display=swap', fallback: 'Georgia, serif' },
  { name: 'IM Fell Double Pica', family: 'IM Fell Double Pica', weights: [400], category: 'serif', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=IM+Fell+Double+Pica&display=swap', fallback: 'Georgia, serif' },
  { name: 'IM Fell Double Pica SC', family: 'IM Fell Double Pica SC', weights: [400], category: 'serif', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=IM+Fell+Double+Pica+SC&display=swap', fallback: 'Georgia, serif' },
  { name: 'IM Fell English', family: 'IM Fell English', weights: [400], category: 'serif', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=IM+Fell+English&display=swap', fallback: 'Georgia, serif' },
  { name: 'IM Fell English SC', family: 'IM Fell English SC', weights: [400], category: 'serif', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=IM+Fell+English+SC&display=swap', fallback: 'Georgia, serif' },
  { name: 'IM Fell French Canon', family: 'IM Fell French Canon', weights: [400], category: 'serif', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=IM+Fell+French+Canon&display=swap', fallback: 'Georgia, serif' },
  { name: 'IM Fell French Canon SC', family: 'IM Fell French Canon SC', weights: [400], category: 'serif', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=IM+Fell+French+Canon+SC&display=swap', fallback: 'Georgia, serif' },
  { name: 'IM Fell Great Primer', family: 'IM Fell Great Primer', weights: [400], category: 'serif', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=IM+Fell+Great+Primer&display=swap', fallback: 'Georgia, serif' },
  { name: 'IM Fell Great Primer SC', family: 'IM Fell Great Primer SC', weights: [400], category: 'serif', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=IM+Fell+Great+Primer+SC&display=swap', fallback: 'Georgia, serif' },
  { name: 'Iceberg', family: 'Iceberg', weights: [400], category: 'display', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Iceberg&display=swap', fallback: 'cursive' },
  { name: 'Iceland', family: 'Iceland', weights: [400], category: 'display', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Iceland&display=swap', fallback: 'cursive' },
  { name: 'Imprima', family: 'Imprima', weights: [400], category: 'sans-serif', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Imprima&display=swap', fallback: 'Arial, sans-serif' },
  { name: 'Inconsolata', family: 'Inconsolata', weights: [400, 700], category: 'monospace', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Inconsolata:wght@400;700&display=swap', fallback: 'monospace' },
  { name: 'Inder', family: 'Inder', weights: [400], category: 'sans-serif', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Inder&display=swap', fallback: 'Arial, sans-serif' },
  { name: 'Indie Flower', family: 'Indie Flower', weights: [400], category: 'handwriting', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Indie+Flower&display=swap', fallback: 'cursive' },
  { name: 'Inika', family: 'Inika', weights: [400, 700], category: 'serif', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Inika:wght@400;700&display=swap', fallback: 'Georgia, serif' },
  { name: 'Irish Grover', family: 'Irish Grover', weights: [400], category: 'display', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Irish+Grover&display=swap', fallback: 'cursive' },
  { name: 'Irish Growl', family: 'Irish Growl', weights: [400], category: 'display', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Irish+Growl&display=swap', fallback: 'cursive' },
  { name: 'Istok Web', family: 'Istok Web', weights: [400, 700], category: 'sans-serif', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Istok+Web:wght@400;700&display=swap', fallback: 'Arial, sans-serif' },
  { name: 'Italiana', family: 'Italiana', weights: [400], category: 'serif', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Italiana&display=swap', fallback: 'Georgia, serif' },
  { name: 'Italianno', family: 'Italianno', weights: [400], category: 'handwriting', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Italianno&display=swap', fallback: 'cursive' },
  { name: 'Jacques Francois', family: 'Jacques Francois', weights: [400], category: 'serif', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Jacques+Francois&display=swap', fallback: 'Georgia, serif' },
  { name: 'Jacques Francois Shadow', family: 'Jacques Francois Shadow', weights: [400], category: 'display', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Jacques+Francois+Shadow&display=swap', fallback: 'cursive' },
  { name: 'Jim Nightshade', family: 'Jim Nightshade', weights: [400], category: 'handwriting', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Jim+Nightshade&display=swap', fallback: 'cursive' },
  { name: 'Jockey One', family: 'Jockey One', weights: [400], category: 'sans-serif', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Jockey+One&display=swap', fallback: 'Arial, sans-serif' },
  { name: 'Jolly Lodger', family: 'Jolly Lodger', weights: [400], category: 'display', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Jolly+Lodger&display=swap', fallback: 'cursive' },
  { name: 'Josefin Slab', family: 'Josefin Slab', weights: [400, 600, 700], category: 'serif', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Josefin+Slab:wght@400;600;700&display=swap', fallback: 'Georgia, serif' },
  { name: 'Joti One', family: 'Joti One', weights: [400], category: 'display', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Joti+One&display=swap', fallback: 'cursive' },
  { name: 'Judson', family: 'Judson', weights: [400, 700], category: 'serif', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Judson:wght@400;700&display=swap', fallback: 'Georgia, serif' },
  { name: 'Julee', family: 'Julee', weights: [400], category: 'handwriting', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Julee&display=swap', fallback: 'cursive' },
  { name: 'Julius Sans One', family: 'Julius Sans One', weights: [400], category: 'sans-serif', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Julius+Sans+One&display=swap', fallback: 'Arial, sans-serif' },
  { name: 'Junge', family: 'Junge', weights: [400], category: 'serif', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Junge&display=swap', fallback: 'Georgia, serif' },
  { name: 'Jura', family: 'Jura', weights: [400, 500, 600, 700], category: 'sans-serif', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Jura:wght@400;500;600;700&display=swap', fallback: 'Arial, sans-serif' },
  { name: 'Just Another Hand', family: 'Just Another Hand', weights: [400], category: 'handwriting', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Just+Another+Hand&display=swap', fallback: 'cursive' },
  { name: 'Just Me Again Down Here', family: 'Just Me Again Down Here', weights: [400], category: 'handwriting', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Just+Me+Again+Down+Here&display=swap', fallback: 'cursive' },
  { name: 'Just One More Hand', family: 'Just One More Hand', weights: [400], category: 'handwriting', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Just+One+More+Hand&display=swap', fallback: 'cursive' },

  // Additional K-Z fonts
  { name: 'Kalam', family: 'Kalam', weights: [300, 400, 700], category: 'handwriting', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Kalam:wght@300;400;700&display=swap', fallback: 'cursive' },
  { name: 'Kanit', family: 'Kanit', weights: [400, 500, 600, 700], category: 'sans-serif', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Kanit:wght@400;500;600;700&display=swap', fallback: 'Arial, sans-serif' },
  { name: 'Karla', family: 'Karla', weights: [400, 500, 600, 700], category: 'sans-serif', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Karla:wght@400;500;600;700&display=swap', fallback: 'Arial, sans-serif' },
  { name: 'Kaushan Script', family: 'Kaushan Script', weights: [400], category: 'handwriting', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Kaushan+Script&display=swap', fallback: 'cursive' },
  { name: 'Kavoon', family: 'Kavoon', weights: [400], category: 'display', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Kavoon&display=swap', fallback: 'fantasy' },
  { name: 'Kdam Thmor', family: 'Kdam Thmor', weights: [400], category: 'display', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Kdam+Thmor&display=swap', fallback: 'fantasy' },
  { name: 'Keania One', family: 'Keania One', weights: [400], category: 'display', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Keania+One&display=swap', fallback: 'fantasy' },
  { name: 'Kelly Slab', family: 'Kelly Slab', weights: [400], category: 'serif', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Kelly+Slab&display=swap', fallback: 'Georgia, serif' },
  { name: 'Kenia', family: 'Kenia', weights: [400], category: 'display', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Kenia&display=swap', fallback: 'fantasy' },
  { name: 'Khand', family: 'Khand', weights: [300, 400, 500, 600, 700], category: 'sans-serif', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Khand:wght@300;400;500;600;700&display=swap', fallback: 'Arial, sans-serif' },
  { name: 'Khula', family: 'Khula', weights: [300, 400, 600, 700, 800], category: 'sans-serif', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Khula:wght@300;400;600;700;800&display=swap', fallback: 'Arial, sans-serif' },
  { name: 'Kite One', family: 'Kite One', weights: [400], category: 'sans-serif', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Kite+One&display=swap', fallback: 'Arial, sans-serif' },
  { name: 'Knewave', family: 'Knewave', weights: [400], category: 'display', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Knewave&display=swap', fallback: 'fantasy' },
  { name: 'KoHo', family: 'KoHo', weights: [200, 300, 400, 500, 600, 700], category: 'sans-serif', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=KoHo:wght@200;300;400;500;600;700&display=swap', fallback: 'Arial, sans-serif' },
  { name: 'Kodchasan', family: 'Kodchasan', weights: [200, 300, 400, 500, 600, 700], category: 'sans-serif', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Kodchasan:wght@200;300;400;500;600;700&display=swap', fallback: 'Arial, sans-serif' },
  { name: 'Koh Santepheap', family: 'Koh Santepheap', weights: [300, 400, 700], category: 'serif', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Koh+Santepheap:wght@300;400;700&display=swap', fallback: 'Georgia, serif' },
  { name: 'Koulen', family: 'Koulen', weights: [400], category: 'display', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Koulen&display=swap', fallback: 'fantasy' },
  { name: 'Kranky', family: 'Kranky', weights: [400], category: 'display', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Kranky&display=swap', fallback: 'fantasy' },
  { name: 'Kreon', family: 'Kreon', weights: [300, 400, 500, 600, 700], category: 'serif', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Kreon:wght@300;400;500;600;700&display=swap', fallback: 'Georgia, serif' },
  { name: 'Kristi', family: 'Kristi', weights: [400], category: 'handwriting', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Kristi&display=swap', fallback: 'cursive' },
  { name: 'Krona One', family: 'Krona One', weights: [400], category: 'sans-serif', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Krona+One&display=swap', fallback: 'Arial, sans-serif' },
  { name: 'Krub', family: 'Krub', weights: [200, 300, 400, 500, 600, 700], category: 'sans-serif', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Krub:wght@200;300;400;500;600;700&display=swap', fallback: 'Arial, sans-serif' },
  { name: 'Kumar One', family: 'Kumar One', weights: [400], category: 'display', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Kumar+One&display=swap', fallback: 'fantasy' },
  { name: 'Kumar One Outline', family: 'Kumar One Outline', weights: [400], category: 'display', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Kumar+One+Outline&display=swap', fallback: 'fantasy' },
  { name: 'Kumbh Sans', family: 'Kumbh Sans', weights: [100, 200, 300, 400, 500, 600, 700, 800, 900], category: 'sans-serif', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Kumbh+Sans:wght@100;200;300;400;500;600;700;800;900&display=swap', fallback: 'Arial, sans-serif' },
  { name: 'Kurale', family: 'Kurale', weights: [400], category: 'serif', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Kurale&display=swap', fallback: 'Georgia, serif' },

  // L fonts
  { name: 'La Belle Aurore', family: 'La Belle Aurore', weights: [400], category: 'handwriting', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=La+Belle+Aurore&display=swap', fallback: 'cursive' },
  { name: 'Lacquer', family: 'Lacquer', weights: [400], category: 'display', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Lacquer&display=swap', fallback: 'fantasy' },
  { name: 'Laila', family: 'Laila', weights: [300, 400, 500, 600, 700], category: 'serif', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Laila:wght@300;400;500;600;700&display=swap', fallback: 'Georgia, serif' },
  { name: 'Lakki Reddy', family: 'Lakki Reddy', weights: [400], category: 'handwriting', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Lakki+Reddy&display=swap', fallback: 'cursive' },
  { name: 'Lalezar', family: 'Lalezar', weights: [400], category: 'display', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Lalezar&display=swap', fallback: 'fantasy' },
  { name: 'Lancelot', family: 'Lancelot', weights: [400], category: 'display', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Lancelot&display=swap', fallback: 'fantasy' },
  { name: 'Langar', family: 'Langar', weights: [400], category: 'display', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Langar&display=swap', fallback: 'fantasy' },
  { name: 'Lateef', family: 'Lateef', weights: [400], category: 'serif', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Lateef&display=swap', fallback: 'Georgia, serif' },
  { name: 'Laila', family: 'Laila', weights: [300, 400, 500, 600, 700], category: 'serif', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Laila:wght@300;400;500;600;700&display=swap', fallback: 'Georgia, serif' },
  { name: 'League Script', family: 'League Script', weights: [400], category: 'handwriting', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=League+Script&display=swap', fallback: 'cursive' },
  { name: 'Leckerli One', family: 'Leckerli One', weights: [400], category: 'handwriting', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Leckerli+One&display=swap', fallback: 'cursive' },
  { name: 'Ledger', family: 'Ledger', weights: [400], category: 'serif', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Ledger&display=swap', fallback: 'Georgia, serif' },
  { name: 'Lekton', family: 'Lekton', weights: [400, 700], category: 'monospace', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Lekton:wght@400;700&display=swap', fallback: 'Courier, monospace' },
  { name: 'Lemon', family: 'Lemon', weights: [400], category: 'display', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Lemon&display=swap', fallback: 'fantasy' },
  { name: 'Lemonada', family: 'Lemonada', weights: [300, 400, 500, 600, 700], category: 'display', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Lemonada:wght@300;400;500;600;700&display=swap', fallback: 'fantasy' },
  { name: 'Lexend', family: 'Lexend', weights: [100, 200, 300, 400, 500, 600, 700, 800, 900], category: 'sans-serif', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Lexend:wght@100;200;300;400;500;600;700;800;900&display=swap', fallback: 'Arial, sans-serif' },
  { name: 'Libre Barcode 39', family: 'Libre Barcode 39', weights: [400], category: 'display', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Libre+Barcode+39&display=swap', fallback: 'fantasy' },
  { name: 'Libre Barcode 128', family: 'Libre Barcode 128', weights: [400], category: 'display', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Libre+Barcode+128&display=swap', fallback: 'fantasy' },
  { name: 'Libre Baskerville', family: 'Libre Baskerville', weights: [400, 700], category: 'serif', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Libre+Baskerville:wght@400;700&display=swap', fallback: 'Georgia, serif' },
  { name: 'Libre Caslon Display', family: 'Libre Caslon Display', weights: [400], category: 'serif', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Libre+Caslon+Display&display=swap', fallback: 'Georgia, serif' },
  { name: 'Libre Caslon Text', family: 'Libre Caslon Text', weights: [400, 700], category: 'serif', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Libre+Caslon+Text:wght@400;700&display=swap', fallback: 'Georgia, serif' },
  { name: 'Libre Franklin', family: 'Libre Franklin', weights: [100, 200, 300, 400, 500, 600, 700, 800, 900], category: 'sans-serif', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Libre+Franklin:wght@100;200;300;400;500;600;700;800;900&display=swap', fallback: 'Arial, sans-serif' },
  { name: 'Life Savers', family: 'Life Savers', weights: [400, 700, 800], category: 'display', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Life+Savers:wght@400;700;800&display=swap', fallback: 'fantasy' },
  { name: 'Lilita One', family: 'Lilita One', weights: [400], category: 'display', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Lilita+One&display=swap', fallback: 'fantasy' },
  { name: 'Lily Script One', family: 'Lily Script One', weights: [400], category: 'handwriting', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Lily+Script+One&display=swap', fallback: 'cursive' },
  { name: 'Limelight', family: 'Limelight', weights: [400], category: 'display', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Limelight&display=swap', fallback: 'fantasy' },
  { name: 'Linden Hill', family: 'Linden Hill', weights: [400], category: 'serif', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Linden+Hill&display=swap', fallback: 'Georgia, serif' },
  { name: 'Literata', family: 'Literata', weights: [200, 300, 400, 500, 600, 700, 800, 900], category: 'serif', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Literata:wght@200;300;400;500;600;700;800;900&display=swap', fallback: 'Georgia, serif' },
  { name: 'Liu Jian Mao Cao', family: 'Liu Jian Mao Cao', weights: [400], category: 'handwriting', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Liu+Jian+Mao+Cao&display=swap', fallback: 'cursive' },
  { name: 'Livvic', family: 'Livvic', weights: [100, 200, 300, 400, 500, 600, 700, 900], category: 'sans-serif', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Livvic:wght@100;200;300;400;500;600;700;900&display=swap', fallback: 'Arial, sans-serif' },
  { name: 'Lobster', family: 'Lobster', weights: [400], category: 'display', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Lobster&display=swap', fallback: 'fantasy' },
  { name: 'Lobster Two', family: 'Lobster Two', weights: [400, 700], category: 'display', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Lobster+Two:wght@400;700&display=swap', fallback: 'fantasy' },
  { name: 'Londrina Outline', family: 'Londrina Outline', weights: [400], category: 'display', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Londrina+Outline&display=swap', fallback: 'fantasy' },
  { name: 'Londrina Shadow', family: 'Londrina Shadow', weights: [400], category: 'display', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Londrina+Shadow&display=swap', fallback: 'fantasy' },
  { name: 'Londrina Sketch', family: 'Londrina Sketch', weights: [400], category: 'display', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Londrina+Sketch&display=swap', fallback: 'fantasy' },
  { name: 'Londrina Solid', family: 'Londrina Solid', weights: [100, 300, 400, 900], category: 'display', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Londrina+Solid:wght@100;300;400;900&display=swap', fallback: 'fantasy' },
  { name: 'Long Cang', family: 'Long Cang', weights: [400], category: 'handwriting', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Long+Cang&display=swap', fallback: 'cursive' },
  { name: 'Lora', family: 'Lora', weights: [400, 500, 600, 700], category: 'serif', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Lora:wght@400;500;600;700&display=swap', fallback: 'Georgia, serif' },
  { name: 'Love Ya Like A Sister', family: 'Love Ya Like A Sister', weights: [400], category: 'display', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Love+Ya+Like+A+Sister&display=swap', fallback: 'fantasy' },
  { name: 'Loved by the King', family: 'Loved by the King', weights: [400], category: 'handwriting', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Loved+by+the+King&display=swap', fallback: 'cursive' },
  { name: 'Lovers Quarrel', family: 'Lovers Quarrel', weights: [400], category: 'handwriting', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Lovers+Quarrel&display=swap', fallback: 'cursive' },
  { name: 'Luckiest Guy', family: 'Luckiest Guy', weights: [400], category: 'display', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Luckiest+Guy&display=swap', fallback: 'fantasy' },
  { name: 'Lusitana', family: 'Lusitana', weights: [400, 700], category: 'serif', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Lusitana:wght@400;700&display=swap', fallback: 'Georgia, serif' },
  { name: 'Lustria', family: 'Lustria', weights: [400], category: 'serif', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Lustria&display=swap', fallback: 'Georgia, serif' },

  // M fonts
  { name: 'M PLUS 1p', family: 'M PLUS 1p', weights: [100, 300, 400, 500, 700, 800, 900], category: 'sans-serif', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=M+PLUS+1p:wght@100;300;400;500;700;800;900&display=swap', fallback: 'Arial, sans-serif' },
  { name: 'M PLUS Rounded 1c', family: 'M PLUS Rounded 1c', weights: [100, 300, 400, 500, 700, 800, 900], category: 'sans-serif', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=M+PLUS+Rounded+1c:wght@100;300;400;500;700;800;900&display=swap', fallback: 'Arial, sans-serif' },
  { name: 'Ma Shan Zheng', family: 'Ma Shan Zheng', weights: [400], category: 'handwriting', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Ma+Shan+Zheng&display=swap', fallback: 'cursive' },
  { name: 'Macondo', family: 'Macondo', weights: [400], category: 'display', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Macondo&display=swap', fallback: 'fantasy' },
  { name: 'Macondo Swash Caps', family: 'Macondo Swash Caps', weights: [400], category: 'display', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Macondo+Swash+Caps&display=swap', fallback: 'fantasy' },
  { name: 'Mada', family: 'Mada', weights: [200, 300, 400, 500, 600, 700, 900], category: 'sans-serif', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Mada:wght@200;300;400;500;600;700;900&display=swap', fallback: 'Arial, sans-serif' },
  { name: 'Magra', family: 'Magra', weights: [400, 700], category: 'sans-serif', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Magra:wght@400;700&display=swap', fallback: 'Arial, sans-serif' },
  { name: 'Maiden Orange', family: 'Maiden Orange', weights: [400], category: 'display', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Maiden+Orange&display=swap', fallback: 'fantasy' },
  { name: 'Maitree', family: 'Maitree', weights: [200, 300, 400, 500, 600, 700], category: 'serif', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Maitree:wght@200;300;400;500;600;700&display=swap', fallback: 'Georgia, serif' },
  { name: 'Major Mono Display', family: 'Major Mono Display', weights: [400], category: 'monospace', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Major+Mono+Display&display=swap', fallback: 'Courier, monospace' },
  { name: 'Mako', family: 'Mako', weights: [400], category: 'sans-serif', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Mako&display=swap', fallback: 'Arial, sans-serif' },
  { name: 'Mali', family: 'Mali', weights: [200, 300, 400, 500, 600, 700], category: 'handwriting', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Mali:wght@200;300;400;500;600;700&display=swap', fallback: 'cursive' },
  { name: 'Mallanna', family: 'Mallanna', weights: [400], category: 'sans-serif', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Mallanna&display=swap', fallback: 'Arial, sans-serif' },
  { name: 'Mandali', family: 'Mandali', weights: [400], category: 'sans-serif', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Mandali&display=swap', fallback: 'Arial, sans-serif' },
  { name: 'Manjari', family: 'Manjari', weights: [100, 400, 700], category: 'sans-serif', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Manjari:wght@100;400;700&display=swap', fallback: 'Arial, sans-serif' },
  { name: 'Manrope', family: 'Manrope', weights: [200, 300, 400, 500, 600, 700, 800], category: 'sans-serif', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Manrope:wght@200;300;400;500;600;700;800&display=swap', fallback: 'Arial, sans-serif' },
  { name: 'Mansalva', family: 'Mansalva', weights: [400], category: 'handwriting', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Mansalva&display=swap', fallback: 'cursive' },
  { name: 'Manuale', family: 'Manuale', weights: [300, 400, 500, 600, 700, 800], category: 'serif', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Manuale:wght@300;400;500;600;700;800&display=swap', fallback: 'Georgia, serif' },
  { name: 'Marcellus', family: 'Marcellus', weights: [400], category: 'serif', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Marcellus&display=swap', fallback: 'Georgia, serif' },
  { name: 'Marcellus SC', family: 'Marcellus SC', weights: [400], category: 'serif', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Marcellus+SC&display=swap', fallback: 'Georgia, serif' },
  { name: 'Marck Script', family: 'Marck Script', weights: [400], category: 'handwriting', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Marck+Script&display=swap', fallback: 'cursive' },
  { name: 'Margarine', family: 'Margarine', weights: [400], category: 'display', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Margarine&display=swap', fallback: 'fantasy' },
  { name: 'Markazi Text', family: 'Markazi Text', weights: [400, 500, 600, 700], category: 'serif', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Markazi+Text:wght@400;500;600;700&display=swap', fallback: 'Georgia, serif' },
  { name: 'Marko One', family: 'Marko One', weights: [400], category: 'serif', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Marko+One&display=swap', fallback: 'Georgia, serif' },
  { name: 'Marmelad', family: 'Marmelad', weights: [400], category: 'sans-serif', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Marmelad&display=swap', fallback: 'Arial, sans-serif' },
  { name: 'Martel', family: 'Martel', weights: [200, 300, 400, 600, 700, 800, 900], category: 'serif', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Martel:wght@200;300;400;600;700;800;900&display=swap', fallback: 'Georgia, serif' },
  { name: 'Martel Sans', family: 'Martel Sans', weights: [200, 300, 400, 600, 700, 800, 900], category: 'sans-serif', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Martel+Sans:wght@200;300;400;600;700;800;900&display=swap', fallback: 'Arial, sans-serif' },
  { name: 'Marvel', family: 'Marvel', weights: [400, 700], category: 'sans-serif', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Marvel:wght@400;700&display=swap', fallback: 'Arial, sans-serif' },
  { name: 'Mate', family: 'Mate', weights: [400], category: 'serif', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Mate&display=swap', fallback: 'Georgia, serif' },
  { name: 'Mate SC', family: 'Mate SC', weights: [400], category: 'serif', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Mate+SC&display=swap', fallback: 'Georgia, serif' },
  { name: 'Material Icons', family: 'Material Icons', weights: [400], category: 'dingbats', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/icon?family=Material+Icons&display=swap', fallback: 'monospace' },
  { name: 'Material Icons Outlined', family: 'Material Icons Outlined', weights: [400], category: 'dingbats', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Material+Icons+Outlined&display=swap', fallback: 'monospace' },
  { name: 'Material Icons Round', family: 'Material Icons Round', weights: [400], category: 'dingbats', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Material+Icons+Round&display=swap', fallback: 'monospace' },
  { name: 'Material Icons Sharp', family: 'Material Icons Sharp', weights: [400], category: 'dingbats', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Material+Icons+Sharp&display=swap', fallback: 'monospace' },
  { name: 'Material Icons Two Tone', family: 'Material Icons Two Tone', weights: [400], category: 'dingbats', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Material+Icons+Two+Tone&display=swap', fallback: 'monospace' },
  { name: 'Maven Pro', family: 'Maven Pro', weights: [400, 500, 600, 700, 800, 900], category: 'sans-serif', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Maven+Pro:wght@400;500;600;700;800;900&display=swap', fallback: 'Arial, sans-serif' },
  { name: 'McLaren', family: 'McLaren', weights: [400], category: 'display', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=McLaren&display=swap', fallback: 'fantasy' },
  { name: 'Meddon', family: 'Meddon', weights: [400], category: 'handwriting', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Meddon&display=swap', fallback: 'cursive' },
  { name: 'MedievalSharp', family: 'MedievalSharp', weights: [400], category: 'display', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=MedievalSharp&display=swap', fallback: 'fantasy' },
  { name: 'Medula One', family: 'Medula One', weights: [400], category: 'display', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Medula+One&display=swap', fallback: 'fantasy' },
  { name: 'Meera Inimai', family: 'Meera Inimai', weights: [400], category: 'sans-serif', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Meera+Inimai&display=swap', fallback: 'Arial, sans-serif' },
  { name: 'Megrim', family: 'Megrim', weights: [400], category: 'display', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Megrim&display=swap', fallback: 'fantasy' },
  { name: 'Meie Script', family: 'Meie Script', weights: [400], category: 'handwriting', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Meie+Script&display=swap', fallback: 'cursive' },
  { name: 'Merienda', family: 'Merienda', weights: [300, 400, 700, 800, 900], category: 'handwriting', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Merienda:wght@300;400;700;800;900&display=swap', fallback: 'cursive' },
  { name: 'Merienda One', family: 'Merienda One', weights: [400], category: 'handwriting', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Merienda+One&display=swap', fallback: 'cursive' },
  { name: 'Merriweather', family: 'Merriweather', weights: [300, 400, 700, 900], category: 'serif', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Merriweather:wght@300;400;700;900&display=swap', fallback: 'Georgia, serif' },
  { name: 'Merriweather Sans', family: 'Merriweather Sans', weights: [300, 400, 500, 600, 700, 800], category: 'sans-serif', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Merriweather+Sans:wght@300;400;500;600;700;800&display=swap', fallback: 'Arial, sans-serif' },
  { name: 'Metal', family: 'Metal', weights: [400], category: 'display', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Metal&display=swap', fallback: 'fantasy' },
  { name: 'Metal Mania', family: 'Metal Mania', weights: [400], category: 'display', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Metal+Mania&display=swap', fallback: 'fantasy' },
  { name: 'Metamorphous', family: 'Metamorphous', weights: [400], category: 'display', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Metamorphous&display=swap', fallback: 'fantasy' },
  { name: 'Metrophobic', family: 'Metrophobic', weights: [400], category: 'sans-serif', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Metrophobic&display=swap', fallback: 'Arial, sans-serif' },
  { name: 'Michroma', family: 'Michroma', weights: [400], category: 'sans-serif', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Michroma&display=swap', fallback: 'Arial, sans-serif' },
  { name: 'Milonga', family: 'Milonga', weights: [400], category: 'display', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Milonga&display=swap', fallback: 'fantasy' },
  { name: 'Miltonian', family: 'Miltonian', weights: [400], category: 'display', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Miltonian&display=swap', fallback: 'fantasy' },
  { name: 'Miltonian Tattoo', family: 'Miltonian Tattoo', weights: [400], category: 'display', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Miltonian+Tattoo&display=swap', fallback: 'fantasy' },
  { name: 'Mina', family: 'Mina', weights: [400, 700], category: 'sans-serif', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Mina:wght@400;700&display=swap', fallback: 'Arial, sans-serif' },
  { name: 'Miniver', family: 'Miniver', weights: [400], category: 'display', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Miniver&display=swap', fallback: 'fantasy' },
  { name: 'Miriam Libre', family: 'Miriam Libre', weights: [400, 700], category: 'sans-serif', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Miriam+Libre:wght@400;700&display=swap', fallback: 'Arial, sans-serif' },
  { name: 'Mirza', family: 'Mirza', weights: [400, 500, 600, 700], category: 'serif', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Mirza:wght@400;500;600;700&display=swap', fallback: 'Georgia, serif' },
  { name: 'Miss Fajardose', family: 'Miss Fajardose', weights: [400], category: 'handwriting', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Miss+Fajardose&display=swap', fallback: 'cursive' },
  { name: 'Mitr', family: 'Mitr', weights: [200, 300, 400, 500, 600, 700], category: 'sans-serif', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Mitr:wght@200;300;400;500;600;700&display=swap', fallback: 'Arial, sans-serif' },
  { name: 'Modak', family: 'Modak', weights: [400], category: 'display', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Modak&display=swap', fallback: 'fantasy' },
  { name: 'Modern Antiqua', family: 'Modern Antiqua', weights: [400], category: 'display', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Modern+Antiqua&display=swap', fallback: 'fantasy' },
  { name: 'Mogra', family: 'Mogra', weights: [400], category: 'display', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Mogra&display=swap', fallback: 'fantasy' },
  { name: 'Molengo', family: 'Molengo', weights: [400], category: 'sans-serif', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Molengo&display=swap', fallback: 'Arial, sans-serif' },
  { name: 'Molle', family: 'Molle', weights: [400], category: 'handwriting', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Molle:ital@1&display=swap', fallback: 'cursive' },
  { name: 'Monda', family: 'Monda', weights: [400, 700], category: 'sans-serif', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Monda:wght@400;700&display=swap', fallback: 'Arial, sans-serif' },
  { name: 'Monofett', family: 'Monofett', weights: [400], category: 'display', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Monofett&display=swap', fallback: 'fantasy' },
  { name: 'Monoton', family: 'Monoton', weights: [400], category: 'display', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Monoton&display=swap', fallback: 'fantasy' },
  { name: 'Monsieur La Doulaise', family: 'Monsieur La Doulaise', weights: [400], category: 'handwriting', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Monsieur+La+Doulaise&display=swap', fallback: 'cursive' },
  { name: 'Montaga', family: 'Montaga', weights: [400], category: 'serif', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Montaga&display=swap', fallback: 'Georgia, serif' },
  { name: 'Montez', family: 'Montez', weights: [400], category: 'handwriting', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Montez&display=swap', fallback: 'cursive' },
  { name: 'Montserrat', family: 'Montserrat', weights: [100, 200, 300, 400, 500, 600, 700, 800, 900], category: 'sans-serif', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Montserrat:wght@100;200;300;400;500;600;700;800;900&display=swap', fallback: 'Arial, sans-serif' },
  { name: 'Montserrat Alternates', family: 'Montserrat Alternates', weights: [100, 200, 300, 400, 500, 600, 700, 800, 900], category: 'sans-serif', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Montserrat+Alternates:wght@100;200;300;400;500;600;700;800;900&display=swap', fallback: 'Arial, sans-serif' },
  { name: 'Montserrat Subrayada', family: 'Montserrat Subrayada', weights: [400, 700], category: 'sans-serif', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Montserrat+Subrayada:wght@400;700&display=swap', fallback: 'Arial, sans-serif' },
  { name: 'Moul', family: 'Moul', weights: [400], category: 'display', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Moul&display=swap', fallback: 'fantasy' },
  { name: 'Moulpali', family: 'Moulpali', weights: [400], category: 'display', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Moulpali&display=swap', fallback: 'fantasy' },
  { name: 'Mountains of Christmas', family: 'Mountains of Christmas', weights: [400, 700], category: 'display', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Mountains+of+Christmas:wght@400;700&display=swap', fallback: 'fantasy' },
  { name: 'Mouse Memoirs', family: 'Mouse Memoirs', weights: [400], category: 'sans-serif', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Mouse+Memoirs&display=swap', fallback: 'Arial, sans-serif' },
  { name: 'Mr Bedfort', family: 'Mr Bedfort', weights: [400], category: 'handwriting', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Mr+Bedfort&display=swap', fallback: 'cursive' },
  { name: 'Mr Dafoe', family: 'Mr Dafoe', weights: [400], category: 'handwriting', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Mr+Dafoe&display=swap', fallback: 'cursive' },
  { name: 'Mr De Haviland', family: 'Mr De Haviland', weights: [400], category: 'handwriting', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Mr+De+Haviland&display=swap', fallback: 'cursive' },
  { name: 'Mrs Saint Delafield', family: 'Mrs Saint Delafield', weights: [400], category: 'handwriting', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Mrs+Saint+Delafield&display=swap', fallback: 'cursive' },
  { name: 'Mrs Sheppards', family: 'Mrs Sheppards', weights: [400], category: 'handwriting', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Mrs+Sheppards&display=swap', fallback: 'cursive' },
  { name: 'Mukti', family: 'Mukti', weights: [400], category: 'sans-serif', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Mukti&display=swap', fallback: 'Arial, sans-serif' },
  { name: 'Mulish', family: 'Mulish', weights: [200, 300, 400, 500, 600, 700, 800, 900], category: 'sans-serif', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Mulish:wght@200;300;400;500;600;700;800;900&display=swap', fallback: 'Arial, sans-serif' },
  { name: 'MuseoModerno', family: 'MuseoModerno', weights: [100, 200, 300, 400, 500, 600, 700, 800, 900], category: 'display', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=MuseoModerno:wght@100;200;300;400;500;600;700;800;900&display=swap', fallback: 'fantasy' },
  { name: 'Mystery Quest', family: 'Mystery Quest', weights: [400], category: 'display', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Mystery+Quest&display=swap', fallback: 'fantasy' },

  // N fonts
  { name: 'NTR', family: 'NTR', weights: [400], category: 'sans-serif', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=NTR&display=swap', fallback: 'Arial, sans-serif' },
  { name: 'Nanum Brush Script', family: 'Nanum Brush Script', weights: [400], category: 'handwriting', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Nanum+Brush+Script&display=swap', fallback: 'cursive' },
  { name: 'Nanum Gothic', family: 'Nanum Gothic', weights: [400, 700, 800], category: 'sans-serif', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Nanum+Gothic:wght@400;700;800&display=swap', fallback: 'Arial, sans-serif' },
  { name: 'Nanum Gothic Coding', family: 'Nanum Gothic Coding', weights: [400, 700], category: 'monospace', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Nanum+Gothic+Coding:wght@400;700&display=swap', fallback: 'Courier, monospace' },
  { name: 'Nanum Myeongjo', family: 'Nanum Myeongjo', weights: [400, 700, 800], category: 'serif', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Nanum+Myeongjo:wght@400;700;800&display=swap', fallback: 'Georgia, serif' },
  { name: 'Nanum Pen Script', family: 'Nanum Pen Script', weights: [400], category: 'handwriting', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Nanum+Pen+Script&display=swap', fallback: 'cursive' },
  { name: 'Neucha', family: 'Neucha', weights: [400], category: 'handwriting', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Neucha&display=swap', fallback: 'cursive' },
  { name: 'Neuton', family: 'Neuton', weights: [200, 300, 400, 700, 800], category: 'serif', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Neuton:wght@200;300;400;700;800&display=swap', fallback: 'Georgia, serif' },
  { name: 'New Rocker', family: 'New Rocker', weights: [400], category: 'display', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=New+Rocker&display=swap', fallback: 'fantasy' },
  { name: 'News Cycle', family: 'News Cycle', weights: [400, 700], category: 'sans-serif', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=News+Cycle:wght@400;700&display=swap', fallback: 'Arial, sans-serif' },
  { name: 'Niconne', family: 'Niconne', weights: [400], category: 'handwriting', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Niconne&display=swap', fallback: 'cursive' },
  { name: 'Niramit', family: 'Niramit', weights: [200, 300, 400, 500, 600, 700], category: 'sans-serif', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Niramit:wght@200;300;400;500;600;700&display=swap', fallback: 'Arial, sans-serif' },
  { name: 'nixie One', family: 'Nixie One', weights: [400], category: 'display', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Nixie+One&display=swap', fallback: 'fantasy' },
  { name: 'Nobile', family: 'Nobile', weights: [400, 500, 700], category: 'sans-serif', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Nobile:wght@400;500;700&display=swap', fallback: 'Arial, sans-serif' },
  { name: 'Nokora', family: 'Nokora', weights: [300, 400, 700, 900], category: 'serif', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Nokora:wght@300;400;700;900&display=swap', fallback: 'Georgia, serif' },
  { name: 'Norican', family: 'Norican', weights: [400], category: 'handwriting', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Norican&display=swap', fallback: 'cursive' },
  { name: 'Nosifer', family: 'Nosifer', weights: [400], category: 'display', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Nosifer&display=swap', fallback: 'fantasy' },
  { name: 'Notable', family: 'Notable', weights: [400], category: 'sans-serif', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Notable&display=swap', fallback: 'Arial, sans-serif' },
  { name: 'Nothing You Could Do', family: 'Nothing You Could Do', weights: [400], category: 'handwriting', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Nothing+You+Could+Do&display=swap', fallback: 'cursive' },
  { name: 'Noticia Text', family: 'Noticia Text', weights: [400, 700], category: 'serif', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Noticia+Text:wght@400;700&display=swap', fallback: 'Georgia, serif' },
  { name: 'Noto Color Emoji', family: 'Noto Color Emoji', weights: [400], category: 'dingbats', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Noto+Color+Emoji&display=swap', fallback: 'monospace' },
  { name: 'Noto Emoji', family: 'Noto Emoji', weights: [400], category: 'dingbats', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Noto+Emoji&display=swap', fallback: 'monospace' },
  { name: 'Noto Sans', family: 'Noto Sans', weights: [100, 200, 300, 400, 500, 600, 700, 800, 900], category: 'sans-serif', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Noto+Sans:wght@100;200;300;400;500;600;700;800;900&display=swap', fallback: 'Arial, sans-serif' },
  { name: 'Noto Sans Display', family: 'Noto Sans Display', weights: [100, 200, 300, 400, 500, 600, 700, 800, 900], category: 'sans-serif', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Noto+Sans+Display:wght@100;200;300;400;500;600;700;800;900&display=swap', fallback: 'Arial, sans-serif' },
  { name: 'Noto Sans HK', family: 'Noto Sans HK', weights: [100, 200, 300, 400, 500, 600, 700, 800, 900], category: 'sans-serif', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Noto+Sans+HK:wght@100;200;300;400;500;600;700;800;900&display=swap', fallback: 'Arial, sans-serif' },
  { name: 'Noto Sans JP', family: 'Noto Sans JP', weights: [100, 200, 300, 400, 500, 600, 700, 800, 900], category: 'sans-serif', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@100;200;300;400;500;600;700;800;900&display=swap', fallback: 'Arial, sans-serif' },
  { name: 'Noto Sans KR', family: 'Noto Sans KR', weights: [100, 200, 300, 400, 500, 600, 700, 800, 900], category: 'sans-serif', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@100;200;300;400;500;600;700;800;900&display=swap', fallback: 'Arial, sans-serif' },
  { name: 'Noto Sans SC', family: 'Noto Sans SC', weights: [100, 200, 300, 400, 500, 600, 700, 800, 900], category: 'sans-serif', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@100;200;300;400;500;600;700;800;900&display=swap', fallback: 'Arial, sans-serif' },
  { name: 'Noto Sans TC', family: 'Noto Sans TC', weights: [100, 200, 300, 400, 500, 600, 700, 800, 900], category: 'sans-serif', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@100;200;300;400;500;600;700;800;900&display=swap', fallback: 'Arial, sans-serif' },
  { name: 'Noto Serif', family: 'Noto Serif', weights: [100, 200, 300, 400, 500, 600, 700, 800, 900], category: 'serif', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Noto+Serif:wght@100;200;300;400;500;600;700;800;900&display=swap', fallback: 'Georgia, serif' },
  { name: 'Noto Serif Display', family: 'Noto Serif Display', weights: [100, 200, 300, 400, 500, 600, 700, 800, 900], category: 'serif', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Noto+Serif+Display:wght@100;200;300;400;500;600;700;800;900&display=swap', fallback: 'Georgia, serif' },
  { name: 'Noto Serif JP', family: 'Noto Serif JP', weights: [200, 300, 400, 500, 600, 700, 900], category: 'serif', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Noto+Serif+JP:wght@200;300;400;500;600;700;900&display=swap', fallback: 'Georgia, serif' },
  { name: 'Noto Serif KR', family: 'Noto Serif KR', weights: [200, 300, 400, 500, 600, 700, 900], category: 'serif', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@200;300;400;500;600;700;900&display=swap', fallback: 'Georgia, serif' },
  { name: 'Noto Serif SC', family: 'Noto Serif SC', weights: [200, 300, 400, 500, 600, 700, 900], category: 'serif', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@200;300;400;500;600;700;900&display=swap', fallback: 'Georgia, serif' },
  { name: 'Noto Serif TC', family: 'Noto Serif TC', weights: [200, 300, 400, 500, 600, 700, 900], category: 'serif', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Noto+Serif+TC:wght@200;300;400;500;600;700;900&display=swap', fallback: 'Georgia, serif' },
  { name: 'Nova Cut', family: 'Nova Cut', weights: [400], category: 'display', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Nova+Cut&display=swap', fallback: 'fantasy' },
  { name: 'Nova Flat', family: 'Nova Flat', weights: [400], category: 'display', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Nova+Flat&display=swap', fallback: 'fantasy' },
  { name: 'Nova Mono', family: 'Nova Mono', weights: [400], category: 'monospace', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Nova+Mono&display=swap', fallback: 'Courier, monospace' },
  { name: 'Nova Oval', family: 'Nova Oval', weights: [400], category: 'display', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Nova+Oval&display=swap', fallback: 'fantasy' },
  { name: 'Nova Round', family: 'Nova Round', weights: [400], category: 'display', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Nova+Round&display=swap', fallback: 'fantasy' },
  { name: 'Nova Script', family: 'Nova Script', weights: [400], category: 'display', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Nova+Script&display=swap', fallback: 'fantasy' },
  { name: 'Nova Slim', family: 'Nova Slim', weights: [400], category: 'display', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Nova+Slim&display=swap', fallback: 'fantasy' },
  { name: 'Nova Square', family: 'Nova Square', weights: [400], category: 'display', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Nova+Square&display=swap', fallback: 'fantasy' },
  { name: 'Numans', family: 'Numans', weights: [400], category: 'sans-serif', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Numans&display=swap', fallback: 'Arial, sans-serif' },
  { name: 'Nunito', family: 'Nunito', weights: [200, 300, 400, 500, 600, 700, 800, 900], category: 'sans-serif', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Nunito:wght@200;300;400;500;600;700;800;900&display=swap', fallback: 'Arial, sans-serif' },
  { name: 'Nunito Sans', family: 'Nunito Sans', weights: [200, 300, 400, 600, 700, 800, 900], category: 'sans-serif', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Nunito+Sans:wght@200;300;400;600;700;800;900&display=swap', fallback: 'Arial, sans-serif' },

  // O fonts
  { name: 'Odibee Sans', family: 'Odibee Sans', weights: [400], category: 'display', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Odibee+Sans&display=swap', fallback: 'fantasy' },
  { name: 'Odor Mean Chey', family: 'Odor Mean Chey', weights: [400], category: 'serif', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Odor+Mean+Chey&display=swap', fallback: 'Georgia, serif' },
  { name: 'Offside', family: 'Offside', weights: [400], category: 'display', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Offside&display=swap', fallback: 'fantasy' },
  { name: 'Old Standard TT', family: 'Old Standard TT', weights: [400, 700], category: 'serif', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Old+Standard+TT:wght@400;700&display=swap', fallback: 'Georgia, serif' },
  { name: 'Oldenburg', family: 'Oldenburg', weights: [400], category: 'display', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Oldenburg&display=swap', fallback: 'fantasy' },
  { name: 'Oleo Script', family: 'Oleo Script', weights: [400, 700], category: 'display', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Oleo+Script:wght@400;700&display=swap', fallback: 'fantasy' },
  { name: 'Oleo Script Swash Caps', family: 'Oleo Script Swash Caps', weights: [400, 700], category: 'display', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Oleo+Script+Swash+Caps:wght@400;700&display=swap', fallback: 'fantasy' },
  { name: 'Open Sans Condensed', family: 'Open Sans Condensed', weights: [300, 700], category: 'sans-serif', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Open+Sans+Condensed:wght@300;700&display=swap', fallback: 'Arial, sans-serif' },
  { name: 'Oranienbaum', family: 'Oranienbaum', weights: [400], category: 'serif', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Oranienbaum&display=swap', fallback: 'Georgia, serif' },
  { name: 'Orbitron', family: 'Orbitron', weights: [400, 500, 600, 700, 800, 900], category: 'sans-serif', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700;800;900&display=swap', fallback: 'Arial, sans-serif' },
  { name: 'Oregano', family: 'Oregano', weights: [400], category: 'display', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Oregano&display=swap', fallback: 'fantasy' },
  { name: 'Orienta', family: 'Orienta', weights: [400], category: 'sans-serif', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Orienta&display=swap', fallback: 'Arial, sans-serif' },
  { name: 'Original Surfer', family: 'Original Surfer', weights: [400], category: 'display', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Original+Surfer&display=swap', fallback: 'fantasy' },
  { name: 'Oswald', family: 'Oswald', weights: [200, 300, 400, 500, 600, 700], category: 'sans-serif', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Oswald:wght@200;300;400;500;600;700&display=swap', fallback: 'Arial, sans-serif' },
  { name: 'Over the Rainbow', family: 'Over the Rainbow', weights: [400], category: 'handwriting', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Over+the+Rainbow&display=swap', fallback: 'cursive' },
  { name: 'Overlock', family: 'Overlock', weights: [400, 700, 900], category: 'display', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Overlock:wght@400;700;900&display=swap', fallback: 'fantasy' },
  { name: 'Overlock SC', family: 'Overlock SC', weights: [400], category: 'display', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Overlock+SC&display=swap', fallback: 'fantasy' },
  { name: 'Overpass', family: 'Overpass', weights: [100, 200, 300, 400, 500, 600, 700, 800, 900], category: 'sans-serif', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Overpass:wght@100;200;300;400;500;600;700;800;900&display=swap', fallback: 'Arial, sans-serif' },
  { name: 'Overpass Mono', family: 'Overpass Mono', weights: [300, 400, 500, 600, 700], category: 'monospace', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Overpass+Mono:wght@300;400;500;600;700&display=swap', fallback: 'Courier, monospace' },
  { name: 'Ovo', family: 'Ovo', weights: [400], category: 'serif', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Ovo&display=swap', fallback: 'Georgia, serif' },
  { name: 'Oxanium', family: 'Oxanium', weights: [200, 300, 400, 500, 600, 700, 800], category: 'display', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Oxanium:wght@200;300;400;500;600;700;800&display=swap', fallback: 'fantasy' },
  { name: 'Oxygen', family: 'Oxygen', weights: [300, 400, 700], category: 'sans-serif', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Oxygen:wght@300;400;700&display=swap', fallback: 'Arial, sans-serif' },
  { name: 'Oxygen Mono', family: 'Oxygen Mono', weights: [400], category: 'monospace', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Oxygen+Mono&display=swap', fallback: 'Courier, monospace' },

  // System Fonts (Available on most systems)
  { name: 'Arial', family: 'Arial', weights: [400, 700], category: 'sans-serif', source: 'system', fallback: 'sans-serif' },
  { name: 'Times New Roman', family: 'Times New Roman', weights: [400, 700], category: 'serif', source: 'system', fallback: 'serif' },
  { name: 'Courier New', family: 'Courier New', weights: [400, 700], category: 'monospace', source: 'system', fallback: 'monospace' },
  { name: 'Helvetica', family: 'Helvetica', weights: [400, 700], category: 'sans-serif', source: 'system', fallback: 'Arial, sans-serif' },
  { name: 'Georgia', family: 'Georgia', weights: [400, 700], category: 'serif', source: 'system', fallback: 'serif' },
  { name: 'Verdana', family: 'Verdana', weights: [400, 700], category: 'sans-serif', source: 'system', fallback: 'sans-serif' },
  { name: 'Trebuchet MS', family: 'Trebuchet MS', weights: [400, 700], category: 'sans-serif', source: 'system', fallback: 'sans-serif' },
  { name: 'Impact', family: 'Impact', weights: [400], category: 'display', source: 'system', fallback: 'fantasy' },
  { name: 'Comic Sans MS', family: 'Comic Sans MS', weights: [400, 700], category: 'handwriting', source: 'system', fallback: 'cursive' },

  // Creative Web Fonts with Custom CSS
  {
    name: 'Pixel Perfect',
    family: 'Pixel Perfect',
    weights: [400],
    category: 'display',
    source: 'web',
    cssRules: [
      "@font-face { font-family: 'Pixel Perfect'; src: url('data:font/truetype;charset=utf-8;base64,') format('truetype'); font-weight: 400; }"
    ],
    fallback: 'monospace'
  },
  
  // Creative Adobe-style fonts (using system fallbacks for demonstration)
  { name: 'SF Pro Display', family: '-apple-system, BlinkMacSystemFont, "SF Pro Display"', weights: [100, 200, 300, 400, 500, 600, 700, 800, 900], category: 'sans-serif', source: 'system', fallback: 'system-ui, sans-serif' },
  { name: 'Segoe UI', family: '"Segoe UI"', weights: [300, 400, 500, 600, 700], category: 'sans-serif', source: 'system', fallback: 'system-ui, sans-serif' },
  { name: 'Roboto Condensed', family: '"Roboto Condensed"', weights: [300, 400, 700], category: 'sans-serif', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Roboto+Condensed:wght@300;400;700&display=swap', fallback: 'Arial, sans-serif' },
  
  // Creative Display Fonts
  { name: 'Orbitron', family: 'Orbitron', weights: [400, 500, 600, 700, 800, 900], category: 'display', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700;800;900&display=swap', fallback: 'fantasy' },
  { name: 'Bungee', family: 'Bungee', weights: [400], category: 'display', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Bungee&display=swap', fallback: 'fantasy' },
  { name: 'Righteous', family: 'Righteous', weights: [400], category: 'display', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Righteous&display=swap', fallback: 'fantasy' },
  { name: 'Russo One', family: 'Russo One', weights: [400], category: 'display', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Russo+One&display=swap', fallback: 'fantasy' },
  { name: 'Black Ops One', family: 'Black Ops One', weights: [400], category: 'display', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Black+Ops+One&display=swap', fallback: 'fantasy' },
  
  // Creative Handwriting Fonts
  { name: 'Shadows Into Light', family: 'Shadows Into Light', weights: [400], category: 'handwriting', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Shadows+Into+Light&display=swap', fallback: 'cursive' },
  { name: 'Kalam', family: 'Kalam', weights: [300, 400, 700], category: 'handwriting', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Kalam:wght@300;400;700&display=swap', fallback: 'cursive' },
  { name: 'Caveat', family: 'Caveat', weights: [400, 500, 600, 700], category: 'handwriting', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Caveat:wght@400;500;600;700&display=swap', fallback: 'cursive' },
  { name: 'Permanent Marker', family: 'Permanent Marker', weights: [400], category: 'handwriting', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Permanent+Marker&display=swap', fallback: 'cursive' },
  
  // Creative Monospace Fonts
  { name: 'Space Mono', family: 'Space Mono', weights: [400, 700], category: 'monospace', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&display=swap', fallback: 'monospace' },
  { name: 'VT323', family: 'VT323', weights: [400], category: 'monospace', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=VT323&display=swap', fallback: 'monospace' },
  { name: 'Share Tech Mono', family: 'Share Tech Mono', weights: [400], category: 'monospace', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Share+Tech+Mono&display=swap', fallback: 'monospace' },
  
  // Creative Serif Fonts
  { name: 'Cinzel', family: 'Cinzel', weights: [400, 500, 600], category: 'serif', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600&display=swap', fallback: 'serif' },
  { name: 'Abril Fatface', family: 'Abril Fatface', weights: [400], category: 'display', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Abril+Fatface&display=swap', fallback: 'serif' },
  { name: 'Cormorant Garamond', family: 'Cormorant Garamond', weights: [300, 400, 500, 600, 700], category: 'serif', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600;700&display=swap', fallback: 'serif' },
  
  // Additional Creative Symbol/Icon Fonts
  { name: 'Font Awesome', family: '"Font Awesome 6 Free"', weights: [400, 900], category: 'dingbats', source: 'web', fontUrl: 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css', fallback: 'fantasy' },
  { name: 'Feather', family: 'feather', weights: [400], category: 'dingbats', source: 'web', fontUrl: 'https://cdn.jsdelivr.net/npm/feather-icons@4.28.0/dist/feather.css', fallback: 'fantasy' },
  
  // More Creative Display Fonts
  { name: 'Creepster', family: 'Creepster', weights: [400], category: 'display', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Creepster&display=swap', fallback: 'fantasy' },
  { name: 'Nosifer', family: 'Nosifer', weights: [400], category: 'display', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Nosifer&display=swap', fallback: 'fantasy' },
  { name: 'Eater', family: 'Eater', weights: [400], category: 'display', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Eater&display=swap', fallback: 'fantasy' },
  { name: 'Metal Mania', family: 'Metal Mania', weights: [400], category: 'display', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Metal+Mania&display=swap', fallback: 'fantasy' },
  { name: 'Chonburi', family: 'Chonburi', weights: [400], category: 'display', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Chonburi&display=swap', fallback: 'fantasy' },
  { name: 'Wallpoet', family: 'Wallpoet', weights: [400], category: 'display', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Wallpoet&display=swap', fallback: 'fantasy' },
  { name: 'Griffy', family: 'Griffy', weights: [400], category: 'display', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Griffy&display=swap', fallback: 'fantasy' },
  { name: 'New Rocker', family: 'New Rocker', weights: [400], category: 'display', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=New+Rocker&display=swap', fallback: 'fantasy' },
  
  // More Creative Handwriting Fonts
  { name: 'Architects Daughter', family: 'Architects Daughter', weights: [400], category: 'handwriting', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Architects+Daughter&display=swap', fallback: 'cursive' },
  { name: 'Indie Flower', family: 'Indie Flower', weights: [400], category: 'handwriting', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Indie+Flower&display=swap', fallback: 'cursive' },
  { name: 'Rock Salt', family: 'Rock Salt', weights: [400], category: 'handwriting', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Rock+Salt&display=swap', fallback: 'cursive' },
  { name: 'Covered By Your Grace', family: 'Covered By Your Grace', weights: [400], category: 'handwriting', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Covered+By+Your+Grace&display=swap', fallback: 'cursive' },
  { name: 'Homemade Apple', family: 'Homemade Apple', weights: [400], category: 'handwriting', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Homemade+Apple&display=swap', fallback: 'cursive' },
  
  // Creative Tech/Gaming Fonts
  { name: 'Press Start 2P', family: 'Press Start 2P', weights: [400], category: 'display', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap', fallback: 'monospace' },
  { name: 'Silkscreen', family: 'Silkscreen', weights: [400, 700], category: 'display', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Silkscreen:wght@400;700&display=swap', fallback: 'monospace' },
  { name: 'Pixelify Sans', family: 'Pixelify Sans', weights: [400, 500, 600, 700], category: 'display', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Pixelify+Sans:wght@400;500;600;700&display=swap', fallback: 'monospace' },
  
  // More Elegant Serif Fonts
  { name: 'Playfair Display SC', family: 'Playfair Display SC', weights: [400, 700, 900], category: 'serif', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Playfair+Display+SC:wght@400;700;900&display=swap', fallback: 'serif' },
  { name: 'EB Garamond', family: 'EB Garamond', weights: [400, 500, 600, 700, 800], category: 'serif', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=EB+Garamond:wght@400;500;600;700;800&display=swap', fallback: 'serif' },
  { name: 'Crimson Text', family: 'Crimson Text', weights: [400, 600, 700], category: 'serif', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Crimson+Text:wght@400;600;700&display=swap', fallback: 'serif' },
  
  // International/Cultural Fonts
  { name: 'Noto Sans Arabic', family: 'Noto Sans Arabic', weights: [400, 700], category: 'sans-serif', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@400;700&display=swap', fallback: 'sans-serif' },
  { name: 'Noto Sans JP', family: 'Noto Sans JP', weights: [400, 700], category: 'sans-serif', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;700&display=swap', fallback: 'sans-serif' },
  { name: 'Noto Sans KR', family: 'Noto Sans KR', weights: [400, 700], category: 'sans-serif', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;700&display=swap', fallback: 'sans-serif' },
  { name: 'Noto Sans SC', family: 'Noto Sans SC', weights: [400, 700], category: 'sans-serif', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;700&display=swap', fallback: 'sans-serif' },
  
  // Creative Script Fonts
  { name: 'Great Vibes', family: 'Great Vibes', weights: [400], category: 'handwriting', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Great+Vibes&display=swap', fallback: 'cursive' },
  { name: 'Allura', family: 'Allura', weights: [400], category: 'handwriting', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Allura&display=swap', fallback: 'cursive' },
  { name: 'Sacramento', family: 'Sacramento', weights: [400], category: 'handwriting', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Sacramento&display=swap', fallback: 'cursive' },
  { name: 'Alex Brush', family: 'Alex Brush', weights: [400], category: 'handwriting', source: 'google', googleFontUrl: 'https://fonts.googleapis.com/css2?family=Alex+Brush&display=swap', fallback: 'cursive' }
]

// Default font
export const DEFAULT_FONT: FontConfig = AVAILABLE_FONTS.find(f => f.name === 'Inter') || AVAILABLE_FONTS[0]

// Font loading utility
export const loadFont = async (font: FontConfig): Promise<void> => {
  return new Promise((resolve, reject) => {
    try {
      const fontUrl = font.fontUrl || font.googleFontUrl
      
      if (font.source === 'system') {
        // System fonts don't need loading
        resolve()
        return
      }
      
      if (font.cssRules) {
        // Custom CSS @font-face rules
        const styleId = `font-${font.name.replace(/\s+/g, '-').toLowerCase()}`
        const existingStyle = document.querySelector(`#${styleId}`)
        if (existingStyle) {
          resolve()
          return
        }
        
        const style = document.createElement('style')
        style.id = styleId
        style.textContent = font.cssRules.join('\n')
        document.head.appendChild(style)
        
        // Give CSS time to load
        setTimeout(resolve, 100)
        return
      }
      
      if (fontUrl) {
        // Check if font is already loaded
        const existingLink = document.querySelector(`link[href="${fontUrl}"]`)
        if (existingLink) {
          resolve()
          return
        }
        
        // Create and load font link with better performance
        const link = document.createElement('link')
        link.rel = 'stylesheet'
        link.href = fontUrl
        // Add font-display: swap for better loading performance
        if (fontUrl.includes('fonts.googleapis.com')) {
          link.href += '&display=swap'
        }
        
        link.onload = () => resolve()
        link.onerror = () => reject(new Error(`Failed to load font: ${font.name}`))
        
        document.head.appendChild(link)
        return
      }
      
      // Fallback: assume system font
      resolve()
    } catch (error) {
      reject(error)
    }
  })
}

// Get font family string for CSS
export const getFontFamily = (font: FontConfig): string => {
  return `"${font.family}", ${font.fallback}`
}