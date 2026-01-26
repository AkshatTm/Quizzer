# UI/UX Design Document: "CodeCanvas" Learning Platform

## 1. Project Vision
"CodeCanvas" is an interactive educational platform where coding assessments feel like creative puzzles rather than exams.
*   **For Students:** A distraction-free, tile-based interface where they write code, get instant feedback, and receive help from AI personas (e.g., "The Senior Architect" or "The Hacker").
*   **For Teachers:** A "magic canvas" where they type a simple idea, and the system visually constructs a robust coding challenge with test cases.

## 2. Visual Identity: "Warm Minimalism"
To ensure the site does not look AI-generated, we must avoid the standard "SaaS Blue," "Dark Mode Neon," and generic 3D illustrations.

### 2.1. The "Anti-AI" Aesthetic
*   **Texture & Noise:** Instead of flat, perfect solid colors, use subtle grain textures on backgrounds (like high-quality paper). This subconsciously signals "tactile" and "human."
*   **Hand-Drawn Elements:** Use imperfect, hand-drawn scribbles for arrows, highlights, or empty states (e.g., an empty test case box has a doodle of a sleeping cat). This breaks the digital rigidity.
*   **Typography Pairing:**
    *   **Headings:** A character-rich Serif font (e.g., Fraunces or Newsreader). Serifs feel editorial and human.
    *   **UI/Body:** A clean, geometric Sans-Serif (e.g., Geist or Inter).
    *   **Code:** A rounded Monospace (e.g., Fira Code or JetBrains Mono) to make code look friendly, not intimidating.

### 2.2. Color Palette
Use a "Playful Pastel" palette to keep it educational but not childish.
*   **Base:** Off-white / Cream (avoid stark #FFFFFF white).
*   **Surface:** Pale Lavender, Soft Mint, Butter Yellow (for Bento tiles).
*   **Accent:** Electric Violet (Primary Action), Coral (Error/Attention).

## 3. The Student Interface: The "Bento" Workspace
The core experience is the coding quiz. We replace the traditional sidebar + main window layout with a responsive Bento Grid.

### 3.1. The Grid Layout (Desktop View)
Imagine a 4x3 grid. Every tool the student needs is a "tile" in this box.

| Tile | Description |
| :--- | :--- |
| **Tile A (Problem)** | Tall Vertical |
| **Tile B (The Editor)** | Spans 2 columns, 2 rows (Center/Right) |
| **Tile C (Persona)** | Helper/Chat |
| **Tile D (Test Cases)** | Horizontal (Bottom) |
| **Tile E (Metrics)** | Score/Progress |

*   **Tile A: The Problem Card (Tall Vertical)**
    *   **Visuals:** White card, soft shadow.
    *   **Content:** The question title in large Serif font. The description is concise.
    *   **Interaction:** As the user scrolls the text, the card stays fixed.
    *   **Human Touch:** Important constraints (e.g., "O(n) time") are highlighted with a "highlighter marker" effect behind the text.

*   **Tile B: The Code Canvas (The Hero)**
    *   **Visuals:** This is the largest tile. It spans 2 columns and 2 rows.
    *   **Design:** A custom skin for the code editor. No heavy toolbars.
    *   **Background:** Very light grey/blue.
    *   **Line Numbers:** Soft grey.
    *   **Run Button:** Floating in the bottom-right corner of this tile (FAB style), pulsing gently when code is typed.

*   **Tile C: The "Persona" Chat (The AI Tutor)**
    *   **Concept:** Instead of a generic "AI Help" button, this tile shows a Avatar.
    *   **The Interaction:**
        *   **Tab 1: "The Junior Dev":** An avatar of a messy desk or a duck (rubber ducking). If asked for help, it gives vague, enthusiastic hints.
        *   **Tab 2: "The Senior Architect":** An avatar of neat glasses or blueprints. Gives structural, high-level advice.
    *   **UI:** Chat bubbles are asymmetrical blobs, not perfect rectangles.

*   **Tile D: The Test Runner (Horizontal)**
    *   **Visuals:** A "Traffic Light" system.
    *   **State - Idle:** Shows "Ready to run tests."
    *   **State - Running:** A playful animation (e.g., a hamster wheel spinning).
    *   **State - Result:** The tile transforms. Green background for Pass, Red for Fail.
    *   **Detail:** If a test fails, it doesn't just say "Error." It says, "Oops! We expected 5 but got 7."

## 4. The Teacher Interface: The "Creator Studio"

### 4.1. The "Magic Input"
Instead of a boring form with 50 fields, the creation screen is a Single Large Text Area (centered, huge font).
*   **Prompt:** "What do you want to teach today?"
*   **Action:** The teacher types: "Create a hard Python problem about recursion using the Fibonacci sequence."
*   **Result:** The UI "explodes" into a Bento Grid preview. The AI fills in the Description Tile, writes the Solution Code Tile, and generates the Test Case Tile.

### 4.2. Drag-and-Drop Refinement
The teacher sees the exact grid the student will see.
*   **Interaction:** They can drag tiles to resize them. If they want the "Problem Description" to be larger, they grab the corner and pull. The other tiles strictly snap to the grid (masonry effect).
*   **Editing:** Clicking any AI-generated text turns it into an editable field.

## 5. Interaction Design & "Juice"
"Juice" refers to the satisfying feedback a game gives you. We apply this to coding.
*   **The "Run" Click:** When the user clicks "Run Code," the button shouldn't just click. It should squish down (scale 0.95), and a progress bar should zip across the top of the Code Tile.
*   **Success State:** If all test cases pass:
    *   The Grid borders flash green briefly.
    *   A small confetti pop occurs over the "Submit" button.
    *   **Sound:** A subtle, pleasing "pop" or "ding" sound plays (optional toggle).
*   **The "Wobbly" Windows:** When dragging tiles (for teachers), the tiles should tilt slightly in the direction of movement, simulating weight and physics.

## 6. Mobile Experience
Bento grids are native to desktop, but on mobile, they transform into a Stack Feed.
*   **Navigation:** A bottom navigation bar switches views: [ Problem ][ Code ][ Output ].
*   **The Editor:** On mobile, the keyboard takes up 50% of the screen. The "Code Tile" maximizes to full screen when tapped, hiding the other tiles to focus on typing.

## 7. Summary of "Non-AI" Traits

| Feature | Generic AI Website | Your "CodeCanvas" Design |
| :--- | :--- | :--- |
| **Graphics** | Perfect, stock 3D illustrations. | Hand-drawn, sketchy icons and doodles. |
| **Color** | "Corporate Blue" & "Dark Mode". | Paper textures, warm creams, and pastel accents. |
| **Layout** | Standard Bootstrap/Tailwind grid. | Playful Bento Grid with variable rounded corners. |
| **Copy** | "AI Assistant" text. | Distinct Personas with visual avatars. |
| **Interaction** | Static buttons. | "Juicy" micro-interactions and physics. |
