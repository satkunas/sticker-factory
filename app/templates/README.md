# Template Configuration Guide

YAML templates define layer-based designs for stickers, labels, badges, and other print media. Each template contains shapes, text, and SVG images positioned with percentage or absolute coordinates.

## Template Structure

```yaml
name: "Template Display Name"
id: "unique-template-id"
description: "Brief description"
category: "circle" | "square" | "rectangle" | "diamond"
width: 400
height: 400
layers:
  - # Layer definitions
```

## Layer Types

### Shape Layers

```yaml
- id: "background"
  type: "shape"
  subtype: "rect" | "circle" | "ellipse" | "polygon" | "path"
  position: { x: "50%", y: "50%" }
  width: 200
  height: 200
  fill: "#3b82f6"
  stroke: "#1e40af"
  strokeWidth: 2
  strokeLinejoin: "round"  # round | miter | bevel
  opacity: 1.0
```

**Path shapes** define curves for textPath:
```yaml
- id: "arc-path"
  type: "shape"
  subtype: "path"
  path: "M 80,200 A 120,120 0 0,1 320,200"
  position: { x: 0, y: 0 }
```

### Text Layers

```yaml
- id: "title"
  type: "text"
  label: "Title"
  default: "Default Text"
  position: { x: "50%", y: "30%" }
  maxLength: 20
  fontFamily: "Roboto"
  fontSize: 24
  fontWeight: 700
  fontColor: "#1f2937"
  strokeColor: "#000000"
  strokeWidth: 0
  strokeLinejoin: "round"
  clip: "background"  # Optional: clip to shape ID
```

### SVG Image Layers

```yaml
- id: "icon"
  type: "svgImage"
  svgId: "ui-star"  # References app/images/{svgId}.svg
  position: { x: "50%", y: "50%" }
  width: 48
  height: 48
  fill: "#fbbf24"
  stroke: "#f59e0b"
  strokeWidth: 2
  rotation: 0     # 0-360 degrees
  scale: 1.0      # 0.01-100 multiplier
```

## Curved Text (TextPath)

Text can follow paths for circular badges, waves, ribbons, etc.

### Setup

1. **Define a path shape** (invisible, used only for text positioning):
```yaml
- id: "wave-path"
  type: "shape"
  subtype: "path"
  path: "M 20,150 Q 120,80 220,150 T 420,150"
  position: { x: 0, y: 0 }
```

2. **Reference path in text layer**:
```yaml
- id: "wave-text"
  type: "text"
  label: "Main Text"
  default: "RIDE THE WAVE"
  textPath: "wave-path"           # Path ID to follow
  startOffset: "0%"               # 0-100% position along path
  dy: -15                         # Vertical offset (-100 to 100)
  dominantBaseline: "middle"      # auto | middle | hanging | alphabetic
  position: { x: "50%", y: "50%" }
  fontFamily: "Oswald"
  fontSize: 32
  fontWeight: 700
  fontColor: "#ffffff"
```

### TextPath Properties

| Property | Type | Description |
|----------|------|-------------|
| `textPath` | string | ID of path shape to follow |
| `startOffset` | string | Position along path: "0%", "50%", "100%" |
| `dy` | number | Vertical offset from path baseline |
| `dominantBaseline` | string | Vertical alignment: auto, middle, central, hanging, alphabetic |

### Examples

**Circular badge** (see `certification-seal.yaml`):
```yaml
# Top arc
- id: "top-arc-path"
  type: "shape"
  subtype: "path"
  path: "M 80,200 A 120,120 0 0,1 320,200"
  position: { x: 0, y: 0 }

- id: "top-text"
  type: "text"
  default: "CERTIFICATE OF"
  textPath: "top-arc-path"
  startOffset: "50%"
  dy: 5
  dominantBaseline: "middle"
```

**Wave design** (see `wave-rider-sticker.yaml`):
```yaml
- id: "wave-path"
  type: "shape"
  subtype: "path"
  path: "M 20,150 Q 120,80 220,150 T 420,150"
  position: { x: 0, y: 0 }

- id: "wave-text"
  type: "text"
  textPath: "wave-path"
  startOffset: "0%"
  dy: -15
```

## Positioning

### Percentage Coordinates (Recommended)

```yaml
position: { x: "50%", y: "50%" }    # Center
position: { x: "0%", y: "0%" }      # Top-left
position: { x: "100%", y: "100%" }  # Bottom-right
position: { x: "25%", y: "75%" }    # Grid positioning
```

**Text uses CENTER anchoring**: `position: { x: "50%", y: "50%" }` centers text at that point.

### Absolute Coordinates

```yaml
position: { x: 200, y: 150 }        # Pixel coordinates
position: { x: "50%", y: 30 }       # Mixed: centered X, absolute Y
```

## Text Clipping

Clip text to shape boundaries:

```yaml
- id: "background"
  type: "shape"
  subtype: "circle"
  position: { x: "50%", y: "50%" }
  width: 200
  height: 200

- id: "title"
  type: "text"
  clip: "background"  # Clips to circle boundary
```

## Complete Example

From `certification-seal.yaml`:

```yaml
name: "Certification Seal"
id: "certification-seal"
description: "Circular certification badge with curved text"
width: 400
height: 400
layers:
  # Background circles
  - id: "outer-circle"
    type: "shape"
    subtype: "circle"
    position: { x: "50%", y: "50%" }
    width: 320
    height: 320
    fill: "none"
    stroke: "#2563eb"
    strokeWidth: 4

  - id: "inner-circle"
    type: "shape"
    subtype: "circle"
    position: { x: "50%", y: "50%" }
    width: 280
    height: 280
    fill: "#dbeafe"
    stroke: "#3b82f6"
    strokeWidth: 2

  # Path for curved text
  - id: "top-arc-path"
    type: "shape"
    subtype: "path"
    path: "M 80,200 A 120,120 0 0,1 320,200"
    position: { x: 0, y: 0 }

  # Curved text following path
  - id: "top-text"
    type: "text"
    label: "Top Text"
    default: "CERTIFICATE OF"
    textPath: "top-arc-path"
    startOffset: "50%"
    dy: 5
    dominantBaseline: "middle"
    position: { x: "50%", y: "50%" }
    fontFamily: "Oswald"
    fontSize: 24
    fontWeight: 700
    fontColor: "#1e40af"

  # Center icon
  - id: "center-star"
    type: "svgImage"
    svgId: "ui-star"
    position: { x: "50%", y: "50%" }
    width: 60
    height: 60
    fill: "#fbbf24"
    stroke: "#f59e0b"
    strokeWidth: 2

  # Center text
  - id: "center-text"
    type: "text"
    label: "Year"
    default: "2025"
    position: { x: "50%", y: "58%" }
    fontFamily: "Roboto"
    fontSize: 18
    fontWeight: 700
    fontColor: "#1e40af"
    clip: "inner-circle"
```

## Reference Templates

- `certification-seal.yaml` - Circular badge with curved text arcs
- `wave-rider-sticker.yaml` - Wave design with textPath
- `vintage-ribbon-banner.yaml` - Ribbon with curved text
- `conference-sticker.yaml` - Hexagonal conference badge
- `wellness-sticker.yaml` - Multi-circle wellness design
- `business-card.yaml` - Standard business card layout

## Layer Ordering

Layers render in YAML order. Earlier = behind, later = in front.

```yaml
layers:
  - # Background (renders first, behind everything)
  - # Middle decorations
  - # Text/icons (renders last, in front)
```

## SVG Icons

100+ icons available in `app/images/` organized by category:
- UI: alerts, shields, checkmarks, stars
- Tech: code, development, devices
- Business: charts, documents, communication
- Nature: animals, weather, environment
- Objects: tools, transportation, food

Reference by filename without extension: `svgId: "ui-star"` loads `app/images/ui-star.svg`
