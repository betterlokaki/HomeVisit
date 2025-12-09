# LocatX Frame - Site Visit Management Interface

This is a standalone Svelte application converted from Figma Frame 2017:162 (Page 3).

## Project Overview

This project is about analyzing aerial photography. The application contains:

- **Tickets**: Each ticket represents an area that needs to be analyzed, showing the status of the area
- **Map**: Shows the geographic location of each area

## Layout Structure

- **Top Section**: Empty toolbar containing only the user name and profile picture
- **Left Side**: Map section with markers, pin indicators, and legend labels
- **Right Side**: Tickets panel with filters and visit cards (RTL Hebrew layout)

## Component Tree

```
Frame 2017:162 (Root)
├── Header 2017:163
│   ├── User Name & Avatar 2017:167
│   └── Profile Picture 2017:174
└── Main Content 2017:175
    ├── Map Container 2017:176 (Left)
    │   ├── Map Image 2017:177
    │   ├── Map Markers (7x)
    │   ├── Map Pin Indicator 2017:313
    │   └── Legend Labels (הובר, לחוץ, רגיל)
    └── Tickets Panel 2017:178 (Right)
        ├── Title Section 2017:179
        ├── Filter Section 2017:183
        │   ├── Inspector Dropdown 2017:184
        │   └── Filter Buttons (3x)
        └── Visit Cards (5x)
            ├── Card 1: Active Visit (בתהליך ביקור)
            ├── Card 2: No Collection (אין איסוף)
            ├── Card 3: Awaiting Visit (מחכה לביקור)
            ├── Card 4: Completed (בוצע)
            └── Card 5: Partially Completed (בוצע חלקית)
```

## Figma Elements → Code Components Mapping

| Figma Element               | Code Component  | Purpose                        |
| --------------------------- | --------------- | ------------------------------ |
| Frame 2017:162              | Root `<div>`    | Main container with RTL layout |
| Header 2017:163             | Header section  | User toolbar                   |
| Map Container 2017:176      | Map section     | Geographic visualization       |
| Tickets Panel 2017:178      | Tickets panel   | Visit management cards         |
| Inspector Dropdown 2017:184 | Dropdown menu   | Filter by inspector            |
| Filter Buttons 2017:185-188 | Filter buttons  | Status filters                 |
| Visit Cards 2017:189-237    | Card components | Individual visit tickets       |

## Design Tokens

- **Colors**: Dark theme (#000000 background, #141414 containers)
- **Typography**: Heebo font (Regular 400, Bold 700)
- **Spacing**: 4px, 8px, 12px, 16px, 24px
- **Border Radius**: 4px (SM), 8px (LG)
- **Layout**: RTL (Right-to-Left) for Hebrew text

## Status Types & Terminology

### Core Status Concepts

- **`coverStatus`**: Coverage status from external service (`"Full" | "Partial" | "No"`)

  - Indicates whether new coverage data came in today
  - **Never use `updateStatus` or `updatedStatus` - always use `coverStatus`**

- **`seenStatus`**: Visit status of a site (`"Seen" | "Partial" | "Not Seen"`)

  - Indicates whether the site has been visited/inspected

- **`mergedStatus`**: Combined result of `coverStatus` + `seenStatus`
  - Used for display and business logic decisions

### Merged Status Display Types

1. **אין איסוף** (No Collection) - Red 🔴

   - `coverStatus = "No"` → Cannot see site (no coverage today)
   - Always paired with `seenStatus = "Not Seen"`

2. **מחכה לביקור** (Awaiting Visit) - Yellow 🟡

   - `coverStatus = "Full"` + `seenStatus = "Not Seen"` → Full coverage available, not visited
   - `coverStatus = "Partial"` + `seenStatus = "Not Seen"` → Partial coverage, not visited

3. **בוצע חלקית** (Partially Completed) - Yellow/Orange 🟡

   - `coverStatus = "Partial"` + `seenStatus = "Partial"` → Partial coverage, partially visited
   - `coverStatus = "Full"` + `seenStatus = "Partial"` → Full coverage, partially visited

4. **בוצע** (Completed) - Green 🟢

   - `coverStatus = "Full"` + `seenStatus = "Seen"` → Full coverage, fully visited

5. **בתהליך ביקור** (In Progress) - Blue/Info theme
   - Active visit state (UI state, not a merged status)

## Installation & Running

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

The app will run on `http://localhost:5174`

## TODO / Interaction Logic

The following handlers need to be implemented:

- `handleInspectorSelect()`: Inspector dropdown selection
- `handleFilterToggle(filter)`: Filter toggle logic
- `handleVisitAction(action, visitId)`: Visit actions (cancel, complete, partial, return)
- `handleMarkerClick(markerId)`: Map marker click to select site

## Notes

- All image assets are fetched from Figma's CDN (valid for 7 days)
- The layout is fully RTL (right-to-left) for Hebrew text
- Dark theme colors match Figma design tokens exactly
- Map markers are positioned absolutely within the map container
