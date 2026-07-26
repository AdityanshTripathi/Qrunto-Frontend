# 🎨 ORDIO (QRUNTO 2.0) - DESIGN SYSTEM & UI/UX SPECIFICATIONS

Welcome to the official **Design System & Visual Specifications Document** for **Ordio (Qrunto 2.0)**. This document outlines our design philosophy, color system, typography rules, component patterns, micro-interactions, and accessibility standards across our multi-role SaaS ecosystem (Customer Web Menu, Restaurant Owner Dashboard, Mobile Waiter Portal, and Super Admin Management).

---

## 👁️ 1. Design Vision & Brand Philosophy

Ordio is engineered to bridge physical hospitality with digital luxury. Our UI aesthetic strikes a balance between **warmth, appetite appeal, high contrast readability, and real-time operational efficiency**.

### Core Pillars:
1. **Warm & Appetizing Aesthetics**: Rich sunset orange accents (`#FF6B35`) paired with sleek dark slate surfaces (`#111827`) create a premium, appetite-stimulating environment.
2. **Glassmorphism & Depth**: Subtle frosted glass layers, translucent borders, and soft glowing ambient shadows provide clear visual hierarchy without clutter.
3. **Zero Friction UX**: Designed for high-speed interactions. Customers place orders with zero app downloads; kitchen staff process tickets with one-tap actions and audio chimes.
4. **Multi-Context Adaptation**: High legibility outdoors under bright sunlight for QR menu scanning and ultra-clear dark mode for kitchen KOT displays.

---

## 🎨 2. Color Palette & Design Tokens

### A. Core Brand & Theme Colors

| Token Name | Hex Code | HSL Representation | Usage / Role |
| :--- | :--- | :--- | :--- |
| **Primary Orange** | `#FF6B35` | `hsl(16, 100%, 60%)` | Primary CTA, active tab highlights, branding badge, glowing rings |
| **Primary Hover** | `#E85D2A` | `hsl(16, 100%, 54%)` | Hover states for buttons, interactive card focus |
| **Background Dark** | `#111827` | `hsl(222.2, 84%, 4.9%)` | App global dark background, dashboard canvas |
| **Surface Slate (Card)** | `#1F2937` | `hsl(217.2, 32.6%, 17.5%)` | Elevated cards, sidebars, modal overlays, dropdowns |
| **Surface Dark Subtitle** | `#374151` | `hsl(215, 27.9%, 16.9%)` | Secondary elevated surface, input background |
| **Text Primary** | `#F9FAFB` | `hsl(210, 40%, 98%)` | Primary headings, active label text |
| **Text Muted** | `#9CA3AF` | `hsl(215, 20.2%, 65.1%)` | Subtitles, captions, disabled states, timestamps |

---

### B. Functional & Status Colors

| Status State | Color Name | Hex Code | Purpose / Context |
| :--- | :--- | :--- | :--- |
| **New Order / Info** | Electric Blue | `#3B82F6` | Incoming new orders, QR table indicators |
| **Preparing / In-Progress** | Warm Amber | `#F59E0B` | Kitchen preparation phase, pending notifications |
| **Ready / Served / Success** | Emerald Mint | `#10B981` | Completed orders, active table status, positive metrics |
| **Cancelled / Out of Stock** | Rose Crimson | `#EF4444` | Order cancellations, stock alerts, decline actions |
| **Dietary: Pure Veg** | Leaf Green | `#22C55E` | Veg indicator dot & border badge on menu items |
| **Dietary: Non-Veg** | Burgundy Red | `#DC2626` | Non-Veg indicator dot & border badge on menu items |

---

## ✍️ 3. Typography System

We use Google Fonts: **Poppins** for clean body text and **Inter / Inter Tight** for dense dashboard metrics and structural headings.

```css
@import url('https://fonts.googleapis.com/css2?family=Inter+Tight:wght@300;400;500;600;700;800;900&family=Inter:wght@300;400;500;600;700;800;900&family=Poppins:wght@300;400;500;600;700&display=swap');
```

### Typographic Scale

- **Display / Hero**: `3rem - 4rem` (48px - 64px) | `Inter Tight` | Weight 800 | Tracking tight
- **H1 Heading**: `2.25rem` (36px) | `Inter Tight` | Weight 700
- **H2 Heading**: `1.75rem` (28px) | `Inter` | Weight 700
- **H3 Section Header**: `1.25rem` (20px) | `Inter` | Weight 600
- **Body Regular**: `0.875rem - 1rem` (14px - 16px) | `Poppins` | Weight 400/500
- **Caption / Badge**: `0.75rem` (12px) | `Inter` | Weight 600 | Uppercase tracking wider

---

## 🔍 4. Elevation, Glassmorphic Utility & Borders

### Glassmorphism Utility Class
```css
.glass-panel {
  background: rgba(17, 24, 39, 0.8);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.08);
}
```

### Ambient Shadows & Glowing Tokens
- **Brand Glow**: `box-shadow: 0 10px 25px -5px rgba(255, 107, 53, 0.3);`
- **Elevated Card Shadow**: `box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5);`
- **Status Pulse Glow**: Used on active KOT cards and incoming waiter help alerts.

---

## 🧱 5. Core UI Component Specifications

### A. Customer Digital Menu Card (`CustomerMenu.tsx`)
- **Visuals**: High-resolution dish thumbnail with aspect ratio 16:9 or 1:1 rounded corners (`rounded-xl`).
- **Dietary Badges**: Green square border with filled green dot for **Veg**; Red triangle/square for **Non-Veg**.
- **Action CTA**: Vibrant orange "+ Add" button that expands into a `- 1 +` interactive counter upon selection.
- **Customization Trigger**: Opens custom topping modal with checkable options and instruction input.

### B. Live Kitchen Feed (KOT) Card (`DashboardOverview.tsx`)
- **Structure**: High-contrast card showing Table Number, Order #, Time Elapsed timer badge.
- **Item Breakdown**: Bulleted dish list with exact quantities and special chef instructions highlighted in yellow badge.
- **Action Buttons**:
  - `Accept` -> Moves status to **Preparing** (Amber indicator)
  - `Mark Ready` -> Moves status to **Ready** (Green pulse indicator)
  - `Served` -> Clears from active feed to completed archive.

### C. Table Status Grid Matrix (`TableManagement.tsx`)
- **Grid Layout**: Responsive grid (`grid-cols-2 md:grid-cols-4 lg:grid-cols-6`).
- **Status States**:
  - 🟢 **Available / Idle**: Subtle gray border, ready for scan.
  - 🔵 **Ordering / Active**: Blue glowing ring, customer currently adding items.
  - 🟡 **Eating / Served**: Amber border, order delivered.
  - 🔴 **Bill Requested / Cleaning**: Red alert indicator for immediate staff attention.

---

## 🎵 6. Micro-Interactions, Motion & Sound Specs

1. **Synthesized Web Audio API Chime**:
   - Dual-tone frequency (880Hz & 1174.66Hz) synthesized using Web Audio API context.
   - Triggers automatically when Socket.io receives `order:created` or `waiter:call`.
2. **Button Hover States**: Scale boost `scale-[1.02]` on hover, `scale-[0.98]` on active press.
3. **Cart Drawer Animation**: Smooth slide-in from bottom on mobile and slide-in from right on desktop (`duration-300 ease-in-out`).

---

## 📱 7. Responsive Breakpoints & Device Adaptability

- **Mobile Viewports (< 640px)**: Optimized single-column layout for customer QR ordering and mobile waiters. Fixed bottom checkout navigation bar.
- **Tablet / iPad Viewports (640px - 1024px)**: Floor waiter management and table layout grid.
- **Desktop Widescreen (> 1024px)**: Full multi-pane dashboard layout with collapsible sidebar navigation, live KOT columns, and Recharts analytics grid.

---

*Ordio (Qrunto 2.0) Design System — Modern, Fast, and Uncompromisingly Elegant.*
