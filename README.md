# Local New Tab

A simple Brave (and Chrome-compatible) extension that replaces your New Tab page with a customizable dashboard of links organized into draggable, resizable categories. Add, edit, import, and export your link layout as JSON—and now upload custom icons for your links or clear them as needed.

---

## Features

- **Custom New Tab**  
  Replaces the browser’s default New Tab page with your own link dashboard.

- **Categories & Tiles**  
  • Create named categories (blocks) to group related links.  
  • Add, edit, or remove link tiles within any category.

- **Drag & Resize**  
  • Drag category blocks anywhere on the page to arrange your dashboard.  
  • Resize categories to control how many columns/rows of tiles they display.

- **Edit Mode**  
  • Toggle **Edit** mode to reveal category and link controls.  
  • In edit mode, hover over a category to show ⚙ **Edit Category**, ➕ **Add Link**, and ↔️ **Resize Handle**.  
  • Hover over any tile to show ✎ **Edit Link**.

- **Custom Icon Upload & Removal**  
  • Upload a `.png` file directly in the **Add/Edit Link** modal to use as a custom favicon.  
  • If no custom image is provided, the extension falls back to Google’s favicon service.  
  • A **Remove custom icon** checkbox lets you clear a previously uploaded icon and revert to the fallback.

- **Import & Export**  
  • **Export** your entire configuration (categories, positions, tile URLs/titles/icons) to a JSON file.  
  • **Import** a JSON file to restore or share your setup.

---

## Installation

1. **Clone or download** this repository:  
   ```bash
   git clone https://github.com/grizlas/local-newtab.git
   ```
2. **Open Brave (or Chrome)** and navigate to:  
   ```
   brave://extensions
   ```  
   or  
   ```
   chrome://extensions
   ```
3. **Enable Developer mode** (toggle in the top right).  
4. Click **Load unpacked** and select the `local-newtab` folder.  
5. **Open a new tab** to see your custom dashboard in action!

---

## Usage

1. **Enter Edit Mode**  
   Click the **Edit** button in the top toolbar. It will change to **Done**.

2. **Add or Edit Links**  
   - In a category, click ➕ **Add Link** or hover a tile and click ✎ **Edit Link**.  
   - In the modal, fill in **Title** and **URL**.  
   - **Upload PNG (optional)**: select a `.png` file to use as the tile icon.  
   - **Remove custom icon**: check this box to clear any previously uploaded image and revert to the default favicon.

3. **Manage Categories**  
   - Hover over a category block to reveal:  
     - ⚙ **Edit Category**: rename or delete an empty category.  
     - ↔️ **Resize Handle**: drag to resize the block.

4. **Drag & Reorder**  
   - While in edit mode, drag categories to reposition them.  
   - Drag tiles between categories to move links.

5. **Import / Export Layout**  
   - **Export**: Click the Export button to download your dashboard as a `.json`.  
   - **Import**: Click Import and select a previously exported `.json` to restore.

6. **Exit Edit Mode**  
   Click **Done** to hide controls and return to normal browsing.

---

## Development

1. **Clone** the repo and `cd` into it:  
   ```bash
   git clone https://github.com/grizlas/local-newtab.git
   cd local-newtab
   ```
2. **Edit source files** in your favorite editor:
   - `manifest.json`  
   - `my-homepage.html`  
   - `css/styles.css`  
   - `js/script.js`

3. **Reload** the extension in `brave://extensions` (or `chrome://extensions`) after any changes.

4. **Commit & Push** your changes:
   ```bash
   git add .
   git commit -m "Add custom icon upload/removal feature"
   git push
   ```

---

## Contributing

Contributions, bug reports, and feature requests are welcome! Please open an issue or submit a pull request on GitHub.

---

## License

This project is licensed under the **MIT License**. See [LICENSE](LICENSE) for details.
