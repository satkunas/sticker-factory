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
├── business-card.yaml       # Professional business card template
├── quality-sticker.yaml     # Product quality assurance sticker
├── shipping-label.yaml      # Express shipping and tracking label
├── warning-diamond.yaml     # Safety warning diamond label
├── conference-badge.yaml    # Professional conference attendee badge
└── README.md               # This documentation file
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
  clipPath: "circle(85px at 100px 100px)"  # Optional text clipping
  maxLength: 20                     # Optional character limit
```

### Text Positioning

Text positioning uses percentage-based coordinates where:
- `x: 0` = Left edge, `x: 100` = Right edge
- `y: 0` = Top edge, `y: 100` = Bottom edge
- `x: 50, y: 50` = Center of design

### Text Clipping

Text can be clipped to specific shapes using CSS clip-path syntax:

#### Circle Clipping
```yaml
clipPath: "circle(90px at 100px 100px)"
# circle(radius at center-x center-y)
```

#### Rectangle Clipping
```yaml
clipPath: "rect(20px, 180px, 180px, 20px)"
# rect(top, right, bottom, left)
```

#### Polygon Clipping
```yaml
clipPath: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)"
# polygon(x1 y1, x2 y2, x3 y3, ...)
```

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
    maxLength: 25

  - id: "contact-name"
    type: "text"
    label: "John Smith"
    position: { x: 70, y: 45 }
    maxLength: 20

  - id: "phone-number"
    type: "text"
    label: "(555) 123-4567"
    position: { x: 70, y: 65 }
    maxLength: 15

  - id: "email"
    type: "text"
    label: "john@company.com"
    position: { x: 70, y: 85 }
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
    clipPath: "circle(85px at 100px 100px)"
    maxLength: 12

  - id: "assurance-text"
    type: "text"
    label: "ASSURED"
    position: { x: 50, y: 60 }
    clipPath: "circle(85px at 100px 100px)"
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
    maxLength: 10

  - id: "from-address"
    type: "text"
    label: "From: Company Address"
    position: { x: 25, y: 40 }
    clipPath: "rect(30px, 180px, 200px, 20px)"
    maxLength: 35

  - id: "to-address"
    type: "text"
    label: "To: Customer Address"
    position: { x: 75, y: 40 }
    clipPath: "rect(30px, 380px, 200px, 200px)"
    maxLength: 35

  - id: "tracking-number"
    type: "text"
    label: "Tracking: 1Z999AA1234567890"
    position: { x: 50, y: 85 }
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
    maxLength: 3

  - id: "warning-text"
    type: "text"
    label: "CAUTION"
    position: { x: 50, y: 65 }
    clipPath: "polygon(50% 0%, 85% 35%, 50% 100%, 15% 35%)"
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
    maxLength: 15

  - id: "attendee-name"
    type: "text"
    label: "Jane Developer"
    position: { x: 50, y: 50 }
    maxLength: 20

  - id: "company"
    type: "text"
    label: "Tech Solutions Inc."
    position: { x: 50, y: 70 }
    maxLength: 25

  - id: "role"
    type: "text"
    label: "Senior Engineer"
    position: { x: 50, y: 85 }
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