# Local New Tab

A simple Brave (and Chrome-compatible) extension that replaces your New Tab page with a customizable dashboard of links organized into draggable, resizable categories. Add, edit, import, and export your link layout as JSON.

---

## Features

- **Custom New Tab**  
  Replaces the browser’s default New Tab page with your own dashboard.

- **Categories & Tiles**  
  • Create named categories (blocks) to group related links.  
  • Add, edit, or remove link tiles within any category.

- **Drag & Resize**  
  • Drag category blocks anywhere on the page to arrange your dashboard.  
  • Resize categories to control how many columns/rows of tiles they display.

- **Edit Mode**  
  • Toggle **Edit** mode to reveal controls.  
  • In edit mode, hover over a category to show ⚙ **Edit Category**, ➕ **Add Link**, and ↔️ **Resize Handle**.  
  • Hover over any tile to show ✎ **Edit Link**.

- **Import & Export**  
  • **Export** your entire configuration (categories, positions, tile URLs/titles) to a JSON file.  
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

2. **Manage Categories**  
   - Hover over a category block to reveal:  
     - ⚙ **Edit Category**: Change the category name or delete it.  
     - ➕ **Add Link**: Open the “Add Link” dialog.  
     - ↔️ **Resize Handle**: Drag to resize the block.

3. **Manage Tiles**  
   - Hover over any link tile to reveal ✎ **Edit Link**: Change its title or URL, or remove it.  
   - Drag tiles within a category to reorder them.

4. **Import / Export Layout**  
   - **Export**: Click the Export button in the top toolbar to download your dashboard as a `.json` file.  
   - **Import**: Click the Import button, select a previously exported `.json`, and your layout will be restored.

5. **Exit Edit Mode**  
   Click **Done** (formerly **Edit**) to hide controls and return to normal browsing.

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
   - `styles.css`  
   - `script.js`

3. **Reload the extension** in `brave://extensions` (or `chrome://extensions`) after any changes.

4. **Commit & push**:  
   ```bash
   git add .
   git commit -m "Describe your changes"
   git push
   ```

---

## Contributing

Contributions, bug reports, and feature requests are welcome! Please open an issue or submit a pull request on GitHub.

---

## License

This project is licensed under the **MIT License**. See [LICENSE](LICENSE) for details.
