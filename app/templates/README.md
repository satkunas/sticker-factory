# Template Configuration Guide

This directory contains YAML template files that define the structure and layout for various print media designs including stickers, labels, business cards, and other promotional materials.

## Template System Overview

Templates use a layer-based architecture where each design element is defined as a separate layer. The system supports two main layer types:

- **Shape Layers**: Geometric elements (circles, rectangles, polygons, etc.)
- **Text Layers**: Editable text areas with positioning and styling

## File Structure & Globbing

Templates are automatically discovered using file globbing patterns. The system loads all `.yaml` files and organizes them by the `category` field in each template:

```
app/templates/
├── booklet-cover.yaml          # Booklet or magazine cover template
├── business-card.yaml          # Professional business card template
├── catalog-page.yaml           # Product catalog page layout
├── concert-ticket.yaml         # Concert or event ticket template
├── conference-badge.yaml       # Professional conference attendee badge
├── event-promo-sticker.yaml    # Event promotion circular sticker
├── food-packaging-label.yaml   # Food product packaging label
├── quality-sticker.yaml        # Product quality assurance sticker
├── shipping-label.yaml         # Express shipping and tracking label
├── social-media-post.yaml      # Social media post template
├── vinyl-record-label.yaml     # Vinyl record center label
├── warning-diamond.yaml        # Safety warning diamond label
├── youtube-thumbnail.yaml      # YouTube video thumbnail template
└── README.md                   # This documentation file
```

Template files use descriptive names that reflect their intended print media application. The application automatically loads all `.yaml` files in this directory and organizes them by the `category` field defined in each template (circle, rectangle, diamond, etc.).

## Basic Template Structure

```yaml
name: "Template Display Name"
id: "unique-template-id"
description: "Brief description of the template's purpose"
category: "circle" | "square" | "rectangle" | "diamond" | "hexagon"
layers:
  - # Shape and text layers defined here
```

## Shape Layer Configuration

Shape layers define the visual elements and backgrounds of your design:

```yaml
- id: "background"
  type: "shape"
  subtype: "circle" | "rect" | "polygon" | "ellipse" | "line"
  position: { x: 50, y: 50 }  # Percentage-based positioning
  width: 200                   # Absolute pixel dimensions
  height: 200
  stroke: "#dc2626"           # Border color (hex)
  strokeWidth: 2              # Border thickness
  fill: "#ef4444"             # Fill color (hex)
  opacity: 1.0                # Optional transparency (0.0-1.0)
```

### Shape Types

#### Rectangle
```yaml
subtype: "rect"
position: { x: 50, y: 50 }
width: 180
height: 120
rx: 10        # Optional rounded corners X
ry: 10        # Optional rounded corners Y
```

#### Circle
```yaml
subtype: "circle"
position: { x: 50, y: 50 }
width: 160    # Diameter
height: 160   # Should match width for perfect circle
```

#### Ellipse
```yaml
subtype: "ellipse"
position: { x: 50, y: 50 }
width: 200    # Horizontal diameter
height: 120   # Vertical diameter
```

#### Polygon
```yaml
subtype: "polygon"
position: { x: 50, y: 50 }
points: "0,-15 -12,5 12,5"  # Relative coordinate pairs
```

#### Line
```yaml
subtype: "line"
position: { x1: 10, y1: 10, x2: 90, y2: 90 }  # Start and end points
```

## Text Layer Configuration

Text layers define editable text areas within your design:

```yaml
- id: "company-name"
  type: "text"
  label: "Company Name"
  placeholder: "Enter company name"  # Optional input hint
  position: { x: 50, y: 30 }        # Percentage positioning
  rotation: 0                       # Optional rotation in degrees
  clip: "background"                # Optional text clipping (shape ID)
  maxLength: 20                     # Optional character limit
```

## Coordinate System

The template system now supports **percentage-based coordinates** alongside absolute coordinates for intuitive, responsive positioning.

### Percentage Coordinates (Recommended)

Use percentage strings for positioning that automatically adapts to any viewBox size:

```yaml
position: { x: "50%", y: "50%" }    # Exact center
position: { x: "0%", y: "0%" }      # Top-left corner
position: { x: "100%", y: "100%" }  # Bottom-right corner
position: { x: "25%", y: "75%" }    # Quarter from left, 3/4 down
position: { x: "-10%", y: "110%" }  # Outside viewBox boundaries
```

**Reference Points:**
- `"0%"` = Left/top edge of viewBox
- `"50%"` = Center of viewBox
- `"100%"` = Right/bottom edge
- Negative values position outside viewBox
- Values > 100% extend beyond viewBox

### Legacy Absolute Coordinates

Traditional pixel-based positioning (backward compatible):

```yaml
position: { x: 200, y: 150 }        # Absolute pixel coordinates
```

### Mixed Coordinate Systems

Combine percentage and absolute as needed:

```yaml
position: { x: "50%", y: 30 }       # Centered horizontally, 30px from top
position: { x: 100, y: "75%" }      # 100px from left, 3/4 down
```

### Text Positioning

**🚨 CRITICAL: All text positioning uses CENTER coordinates**

- Text uses `text-anchor="middle"` and `dominant-baseline="central"`
- `position: { x: "50%", y: "50%" }` centers text in viewBox
- Percentage coordinates are resolved automatically during rendering

### Common Coordinate Patterns

#### Centered Layout
```yaml
# Perfect center
position: { x: "50%", y: "50%" }

# Slightly off-center for visual balance
position: { x: "50%", y: "48%" }
```

#### Quarter Grid Layout
```yaml
# Four corner positions
top-left:     { x: "25%", y: "25%" }
top-right:    { x: "75%", y: "25%" }
bottom-left:  { x: "25%", y: "75%" }
bottom-right: { x: "75%", y: "75%" }
```

#### Header/Body/Footer Layout
```yaml
header: { x: "50%", y: "20%" }
body:   { x: "50%", y: "50%" }
footer: { x: "50%", y: "80%" }
```

#### Side-by-Side Layout
```yaml
left-content:  { x: "25%", y: "50%" }
right-content: { x: "75%", y: "50%" }
```

### Text Clipping

Text can be clipped to specific shapes using the `clip` property that references shape layer IDs. This ensures text overflow is hidden within container shapes for professional appearance.

#### Shape-Based Clipping (Recommended)
```yaml
- id: "main-text"
  type: "text"
  label: "Product Name"
  position: { x: "50%", y: "50%" }
  clip: "background"           # References shape layer ID
  maxLength: 20

- id: "background"             # Container shape
  type: "shape"
  subtype: "circle"
  position: { x: "50%", y: "50%" }
  width: 180
  height: 180
  fill: "#ffffff"
```

#### Multiple Text Elements with Same Clipping
```yaml
- id: "header-text"
  type: "text"
  clip: "header-section"       # Clip to header area

- id: "body-text"
  type: "text"
  clip: "main-container"       # Clip to main content area

- id: "footer-text"
  type: "text"
  clip: "main-container"       # Multiple texts can use same clip shape
```

#### Legacy CSS ClipPath Support
```yaml
clipPath: "circle(90px at 100px 100px)"     # Deprecated, use 'clip' instead
clipPath: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)"
```

**Note:** The legacy `clipPath` property is still supported for backward compatibility, but new templates should use the `clip` property for better maintainability and automatic shape conversion.

## Print Media Examples

### Business Card Template
```yaml
name: "Professional Business Card"
id: "business-card-1"
description: "Standard business card with company logo area and contact info"
category: "rectangle"
layers:
  - id: "background"
    type: "shape"
    subtype: "rect"
    position: { x: 50, y: 50 }
    width: 350
    height: 200
    rx: 8
    ry: 8
    stroke: "#e5e7eb"
    strokeWidth: 1
    fill: "#ffffff"

  - id: "logo-area"
    type: "shape"
    subtype: "rect"
    position: { x: 20, y: 30 }
    width: 80
    height: 60
    stroke: "#d1d5db"
    strokeWidth: 1
    fill: "#f3f4f6"

  - id: "company-name"
    type: "text"
    label: "Company Name"
    position: { x: 70, y: 25 }
    clip: "background"
    maxLength: 25

  - id: "contact-name"
    type: "text"
    label: "John Smith"
    position: { x: 70, y: 45 }
    clip: "background"
    maxLength: 20

  - id: "phone-number"
    type: "text"
    label: "(555) 123-4567"
    position: { x: 70, y: 65 }
    clip: "background"
    maxLength: 15

  - id: "email"
    type: "text"
    label: "john@company.com"
    position: { x: 70, y: 85 }
    clip: "background"
    maxLength: 30
```

### Product Sticker Template
```yaml
name: "Product Quality Sticker"
id: "quality-sticker-1"
description: "Circular quality assurance sticker for products"
category: "circle"
layers:
  - id: "outer-ring"
    type: "shape"
    subtype: "circle"
    position: { x: 50, y: 50 }
    width: 180
    height: 180
    stroke: "#dc2626"
    strokeWidth: 3
    fill: "#fee2e2"

  - id: "inner-circle"
    type: "shape"
    subtype: "circle"
    position: { x: 50, y: 50 }
    width: 140
    height: 140
    stroke: "#991b1b"
    strokeWidth: 2
    fill: "#fca5a5"

  - id: "quality-text"
    type: "text"
    label: "QUALITY"
    position: { x: 50, y: 40 }
    clip: "inner-circle"
    maxLength: 12

  - id: "assurance-text"
    type: "text"
    label: "ASSURED"
    position: { x: 50, y: 60 }
    clip: "inner-circle"
    maxLength: 12
```

### Shipping Label Template
```yaml
name: "Express Shipping Label"
id: "shipping-label-1"
description: "Priority shipping label with tracking info"
category: "rectangle"
layers:
  - id: "background"
    type: "shape"
    subtype: "rect"
    position: { x: 50, y: 50 }
    width: 400
    height: 250
    stroke: "#1f2937"
    strokeWidth: 2
    fill: "#ffffff"

  - id: "priority-banner"
    type: "shape"
    subtype: "rect"
    position: { x: 50, y: 15 }
    width: 360
    height: 40
    fill: "#dc2626"

  - id: "priority-text"
    type: "text"
    label: "PRIORITY"
    position: { x: 50, y: 15 }
    clip: "priority-banner"
    maxLength: 10

  - id: "from-address"
    type: "text"
    label: "From: Company Address"
    position: { x: 25, y: 40 }
    clip: "background"
    maxLength: 35

  - id: "to-address"
    type: "text"
    label: "To: Customer Address"
    position: { x: 75, y: 40 }
    clip: "background"
    maxLength: 35

  - id: "tracking-number"
    type: "text"
    label: "Tracking: 1Z999AA1234567890"
    position: { x: 50, y: 85 }
    clip: "background"
    maxLength: 25
```

### Warning Label Template
```yaml
name: "Safety Warning Diamond"
id: "warning-diamond-1"
description: "Diamond-shaped safety warning label"
category: "diamond"
layers:
  - id: "warning-diamond"
    type: "shape"
    subtype: "polygon"
    position: { x: 50, y: 50 }
    points: "0,-80 80,0 0,80 -80,0"
    stroke: "#dc2626"
    strokeWidth: 4
    fill: "#fef3c7"

  - id: "inner-border"
    type: "shape"
    subtype: "polygon"
    position: { x: 50, y: 50 }
    points: "0,-65 65,0 0,65 -65,0"
    stroke: "#991b1b"
    strokeWidth: 2
    fill: "#fbbf24"

  - id: "warning-symbol"
    type: "text"
    label: "⚠"
    position: { x: 50, y: 35 }
    clip: "inner-border"
    maxLength: 3

  - id: "warning-text"
    type: "text"
    label: "CAUTION"
    position: { x: 50, y: 65 }
    clip: "inner-border"
    maxLength: 10
```

### Event Badge Template
```yaml
name: "Conference Badge"
id: "conference-badge-1"
description: "Professional conference attendee badge"
category: "rectangle"
layers:
  - id: "badge-background"
    type: "shape"
    subtype: "rect"
    position: { x: 50, y: 50 }
    width: 300
    height: 180
    rx: 12
    ry: 12
    stroke: "#374151"
    strokeWidth: 2
    fill: "#f9fafb"

  - id: "header-bar"
    type: "shape"
    subtype: "rect"
    position: { x: 50, y: 20 }
    width: 280
    height: 35
    rx: 6
    ry: 6
    fill: "#3b82f6"

  - id: "event-name"
    type: "text"
    label: "TechConf 2024"
    position: { x: 50, y: 20 }
    clip: "header-bar"
    maxLength: 15

  - id: "attendee-name"
    type: "text"
    label: "Jane Developer"
    position: { x: 50, y: 50 }
    clip: "badge-background"
    maxLength: 20

  - id: "company"
    type: "text"
    label: "Tech Solutions Inc."
    position: { x: 50, y: 70 }
    clip: "badge-background"
    maxLength: 25

  - id: "role"
    type: "text"
    label: "Senior Engineer"
    position: { x: 50, y: 85 }
    clip: "badge-background"
    maxLength: 20
```

## Layer Ordering & Z-Index

Layers are rendered in the order they appear in the YAML file. Earlier layers appear behind later layers. For complex designs, consider the stacking order:

1. Background shapes first
2. Decorative elements
3. Text areas last (for visibility)

## Best Practices

### Design Guidelines
- Use percentage positioning for responsive scaling
- Keep text areas within visible bounds
- Provide appropriate contrast between text and background
- Consider print margins and bleed areas

### Performance
- Limit complex polygons to essential details
- Use appropriate stroke widths for print resolution
- Test designs at various scales

### Accessibility
- Ensure sufficient color contrast
- Use readable font sizes
- Provide alternative text descriptions in labels

## Template Validation

The system validates templates for:
- Required fields (name, id, description, category)
- Valid layer types and subtypes
- Proper coordinate ranges (0-100 for percentages)
- Color format validation (hex codes)

## Common Use Cases

### Stickers & Labels
- Product labels with branding
- Quality assurance stickers
- Shipping and tracking labels
- Inventory management tags

### Business Materials
- Business cards with contact info
- Name badges for events
- Professional certificates
- Membership cards

### Promotional Items
- Event badges and passes
- Promotional stickers
- Brand awareness labels
- Marketing materials

### Industrial Applications
- Safety warning labels
- Equipment identification tags
- Compliance and certification marks
- Hazard communication labels