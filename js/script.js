// --- Constants ---
const STORAGE_KEY           = 'myStart';
const DEFAULT_WIDTH         = 260;
const MIN_GAP               = 20;    // px min gap between category blocks
const SNAP_TOLERANCE        = 10;    // px for alignment snapping
const SPACING_TOLERANCE     = 5;     // px for equal-spacing detection
const FALLBACK_TILE_HEIGHT  = 100;   // px if no links to measure

// --- State ---
let links = [];
let categories = [];
let defaultTileHeight = 0;
let editMode = false;

// --- DOM refs ---
const fileInput        = document.getElementById('fileInput');
const linkModalEl      = document.getElementById('linkModal');
const categoryModalEl  = document.getElementById('categoryModal');
const form             = document.getElementById('linkForm');
const catForm          = document.getElementById('categoryForm');
const deleteBtn        = linkModalEl.querySelector('.btn-delete');
const catDeleteBtn     = categoryModalEl.querySelector('.btn-delete-cat');
const linkCancelBtn    = linkModalEl.querySelector('.btn-cancel');
const catCancelBtn     = categoryModalEl.querySelector('.btn-cancel-cat');
const toggleEditBtn    = document.getElementById('toggleEditBtn');

// Instantiate Bootstrap modals
const bsLinkModal = new bootstrap.Modal(linkModalEl);
const bsCatModal  = new bootstrap.Modal(categoryModalEl);

const linkIconFileInput    = document.getElementById('linkIconFile');
const linkClearIconCheckbox = document.getElementById('linkClearIcon');

let pendingIconDataUrl = null;
let originalIconDataUrl = null;

linkIconFileInput.addEventListener('change', e => {
  const file = e.target.files[0];
  if (!file) {
    pendingIconDataUrl = null;
    return;
  }
  const reader = new FileReader();
  reader.onload = () => {
    pendingIconDataUrl = reader.result;  // data:image/png;base64,...
  };
  reader.readAsDataURL(file);
});

// --- global edit-mode toggle ---
toggleEditBtn.addEventListener('click', () => {
  editMode = !editMode;
  document.body.classList.toggle('edit-mode', editMode);
  toggleEditBtn.textContent = editMode ? 'Done' : 'Edit';
  // update existing tiles to be draggable or not
  document.querySelectorAll('.tile').forEach(tile => {
    tile.draggable = editMode;
  });
});

// --- Helpers ---
function computeDefaultTileHeight() {
  if (defaultTileHeight) return;
  if (!links.length) {
    defaultTileHeight = FALLBACK_TILE_HEIGHT;
    return;
  }
  const l = links[0];
  const tmp = document.createElement('div');
  tmp.className = 'tile';
  tmp.style.position = 'absolute';
  tmp.style.visibility = 'hidden';
  tmp.innerHTML = `
    <a class="tile-link" href="${l.url}" target="_blank">
      <div class="tile-image">
        <button class="edit-btn">✎</button>
        <img src="${l.icon || `https://www.google.com/s2/favicons?domain=${new URL(l.url).hostname}&sz=64`}" alt="">
      </div>
      <div class="tile-title">${l.title}</div>
    </a>`;
  document.body.appendChild(tmp);
  defaultTileHeight = tmp.offsetHeight || FALLBACK_TILE_HEIGHT;
  document.body.removeChild(tmp);
}

function clearGuides() {
  document.querySelectorAll('.guide-line').forEach(g => g.remove());
}

function drawHorizontalGuide(y) {
  const g = document.createElement('div');
  g.className = 'guide-line snap-line horizontal';
  Object.assign(g.style, {
    position: 'absolute',
    top: y + 'px',
    left: '0',
    width: '100%',
    height: '1px',
    background: 'cyan',
    pointerEvents: 'none',
    zIndex: 9999
  });
  document.getElementById('content').appendChild(g);
}

function drawVerticalGuide(x) {
  const g = document.createElement('div');
  g.className = 'guide-line snap-line vertical';
  Object.assign(g.style, {
    position: 'absolute',
    left: x + 'px',
    top: '0',
    width: '1px',
    height: '100%',
    background: 'cyan',
    pointerEvents: 'none',
    zIndex: 9999
  });
  document.getElementById('content').appendChild(g);
}

function drawSpacingGuideHorizontal(y) {
  const g = document.createElement('div');
  g.className = 'guide-line spacing-line horizontal';
  Object.assign(g.style, {
    position: 'absolute',
    top: y + 'px',
    left: '0',
    width: '100%',
    height: '1px',
    background: 'lime',
    pointerEvents: 'none',
    zIndex: 9998
  });
  document.getElementById('content').appendChild(g);
}

function drawSpacingGuideVertical(x) {
  const g = document.createElement('div');
  g.className = 'guide-line spacing-line vertical';
  Object.assign(g.style, {
    position: 'absolute',
    left: x + 'px',
    top: '0',
    width: '1px',
    height: '100%',
    background: 'lime',
    pointerEvents: 'none',
    zIndex: 9998
  });
  document.getElementById('content').appendChild(g);
}

// --- Load & Save ---
function load() {
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    links = data.links || [];
    categories = (data.categories || []).map(c => ({
      name: c.name,
      x: c.x || 0,
      y: c.y || 0,
      w: c.w || DEFAULT_WIDTH
    }));
  } catch {
    links = [];
    categories = [];
  }
}

function save() {
  const exportCats = categories.map(c => ({
    name: c.name,
    x: c.x,
    y: c.y,
    w: c.w
  }));
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ links, categories: exportCats }, null, 2)
  );
}

// --- Render ---
function render() {
  computeDefaultTileHeight();
  const content = document.getElementById('content');
  content.innerHTML = '';

  categories.forEach((cat, idx) => {
    const block = document.createElement('div');
    block.className = 'category-block';
    block.dataset.idx = idx;
    block.style.left  = cat.x + 'px';
    block.style.top   = cat.y + 'px';
    block.style.width = cat.w + 'px';

    // Title
    const title = document.createElement('div');
    title.className = 'category-title';
    title.textContent = cat.name;
    block.appendChild(title);

    // Resize handle
    const rh = document.createElement('div');
    rh.className = 'resize-handle';
    block.appendChild(rh);

    // ⚙ Edit-category button
    const editCatBtn = document.createElement('button');
    editCatBtn.className = 'edit-cat-btn';
    editCatBtn.onclick = e => {
      e.stopPropagation();
      openCategoryModal(cat, idx);
    };
    block.appendChild(editCatBtn);

    // + Add-link button
    const addBtn = document.createElement('button');
    addBtn.className = 'add-link-btn';
    addBtn.onclick = e => {
      e.stopPropagation();
      openModal('Add Link', { category: cat.name }, true);
    };
    block.appendChild(addBtn);

    // Grid of tiles
    const grid = document.createElement('div');
    grid.className = 'grid';
    const catLinks = links.filter(l => l.category === cat.name);
    if (!catLinks.length) {
      grid.style.minHeight = defaultTileHeight + 'px';
    }
    catLinks.forEach(l => {
      const tile = document.createElement('div');
      tile.className = 'tile';
      tile.dataset.id = l.id;
      tile.draggable = editMode; // only draggable in edit mode

      tile.addEventListener('dragstart', e => {
        if (!editMode) { e.preventDefault(); return; }
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', l.id);
      });
      const icon = l.icon 
        ? l.icon 
        : `https://www.google.com/s2/favicons?domain=${new URL(l.url).hostname}&sz=64`;

      tile.innerHTML = `
        <a class="tile-link" href="${l.url}" target="_blank">
          <div class="tile-image">
            <button class="edit-btn">✎</button>
            <img src="${icon}" alt="">
          </div>
          <div class="tile-title">${l.title}</div>
        </a>`;
      grid.appendChild(tile);
    });
    block.appendChild(grid);

    // Drop support (only in edit mode)
    block.addEventListener('dragover', e => {
      if (!editMode) return;
      e.preventDefault();
    });
    block.addEventListener('drop', e => {
      if (!editMode) return;
      e.preventDefault();
      const id   = e.dataTransfer.getData('text/plain');
      const link = links.find(l => l.id == id);
      if (link && link.category !== cat.name) {
        link.category = cat.name;
        render();
      }
    });

    content.appendChild(block);

    // Enable dragging and resizing (only in edit mode)
    makePhantomDraggable(block, title, cat);
    makeResizable(block, rh, cat);
  });

  attachTileEvents();
  save();
}

// --- Tile edit handlers ---
function attachTileEvents() {
  document.querySelectorAll('.tile').forEach(tile => {
    const btn = tile.querySelector('.edit-btn');
    btn.onclick = e => {
      e.preventDefault();
      e.stopPropagation();
      const id = +tile.dataset.id;
      openModal('Edit Link', links.find(l => l.id == id), false);
    };
  });
}

// --- Phantom drag with Smart Guides & Uniform Spacing ---
function makePhantomDraggable(el, handle, cat) {
  handle.onmousedown = e => {
    if (!editMode) return;       // only in edit mode
    e.preventDefault();
    const content = document.getElementById('content');
    const startX  = e.clientX, startY = e.clientY;
    const origX   = cat.x,      origY  = cat.y;
    const w       = el.offsetWidth, h = el.offsetHeight;

    // capture other blocks
    const others = Array.from(content.querySelectorAll('.category-block'))
      .filter(b => b !== el)
      .map(b => ({
        x: parseInt(b.style.left, 10),
        y: parseInt(b.style.top, 10),
        w: b.offsetWidth,
        h: b.offsetHeight
      }));

    // phantom outline
    const phantom = document.createElement('div');
    phantom.className = 'category-block phantom-outline';
    Object.assign(phantom.style, {
      position: 'absolute',
      left:  origX + 'px',
      top:   origY + 'px',
      width: w + 'px',
      height: h + 'px',
      pointerEvents: 'none',
      boxSizing: 'border-box',
      border: '2px dashed blue',
      zIndex: 9997
    });
    content.appendChild(phantom);

    let lastValidX = origX, lastValidY = origY;

    function onMove(ev) {
      ev.preventDefault();
      clearGuides();

      const dx = ev.clientX - startX;
      const dy = ev.clientY - startY;
      let candX = Math.max(0, origX + dx);
      let candY = Math.max(0, origY + dy);

      // alignment snapping
      let snapX = null, snapY = null;
      others.forEach(o => {
        if (Math.abs(candY - o.y) < SNAP_TOLERANCE) snapY = o.y;
        if (Math.abs(candX - o.x) < SNAP_TOLERANCE) snapX = o.x;
      });
      if (snapY !== null) { candY = snapY; drawHorizontalGuide(snapY); }
      if (snapX !== null) { candX = snapX; drawVerticalGuide(snapX); }

      // uniform spacing X
      const lefts  = others.filter(o => o.x + o.w <= candX);
      const rights = others.filter(o => o.x >= candX + w);
      if (lefts.length && rights.length) {
        const left  = lefts.reduce((a,b) => (a.x+a.w)>(b.x+b.w)?a:b);
        const right = rights.reduce((a,b) => a.x<b.x?a:b);
        const gapL = candX - (left.x + left.w);
        const gapR = right.x - (candX + w);
        if (Math.abs(gapL - gapR) < SPACING_TOLERANCE) {
          candX = left.x + left.w + (right.x - left.x - left.w - w) / 2;
          drawSpacingGuideVertical(left.x + left.w);
          drawSpacingGuideVertical(right.x);
        }
      }

      // uniform spacing Y
      const tops    = others.filter(o => o.y + o.h <= candY);
      const bottoms = others.filter(o => o.y >= candY + h);
      if (tops.length && bottoms.length) {
        const top    = tops.reduce((a,b) => (a.y+a.h)>(b.y+b.h)?a:b);
        const bottom = bottoms.reduce((a,b) => a.y<b.y?a:b);
        const gapT   = candY - (top.y + top.h);
        const gapB   = bottom.y - (candY + h);
        if (Math.abs(gapT - gapB) < SPACING_TOLERANCE) {
          candY = top.y + top.h + (bottom.y - top.y - top.h - h) / 2;
          drawSpacingGuideHorizontal(top.y + top.h);
          drawSpacingGuideHorizontal(bottom.y);
        }
      }

      // test X movement
      let xValid = true;
      for (const o of others) {
        const noHoriz = candX + w + MIN_GAP <= o.x ||
                        candX >= o.x + o.w + MIN_GAP;
        const noVert  = lastValidY + h + MIN_GAP <= o.y ||
                        lastValidY >= o.y + o.h + MIN_GAP;
        if (!(noHoriz || noVert)) { xValid = false; break; }
      }
      if (xValid) lastValidX = candX;

      // test Y movement
      let yValid = true;
      for (const o of others) {
        const noHoriz = lastValidX + w + MIN_GAP <= o.x ||
                        lastValidX >= o.x + o.w + MIN_GAP;
        const noVert  = candY + h + MIN_GAP <= o.y ||
                        candY >= o.y + o.h + MIN_GAP;
        if (!(noHoriz || noVert)) { yValid = false; break; }
      }
      if (yValid) lastValidY = candY;

      phantom.style.left = lastValidX + 'px';
      phantom.style.top  = lastValidY + 'px';
    }

    function onUp() {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      phantom.remove();
      clearGuides();
      cat.x = lastValidX;
      cat.y = lastValidY;
      save();
      render();
    }

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  };
}

// --- Resizable ---
function makeResizable(el, handle, cat) {
  handle.onmousedown = e => {
    if (!editMode) return;    // only in edit mode
    e.preventDefault();
    const startX = e.clientX, origW = el.offsetWidth;
    function onMove(ev) {
      const newW = Math.max(80, origW + (ev.clientX - startX));
      el.style.width = newW + 'px';
    }
    function onUp() {
      cat.w = el.offsetWidth;
      save();
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    }
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  };
}

// --- Auto-place new category ---
function positionCategoryInFreeSpace(idx) {
  const content = document.getElementById('content');
  const block   = document.querySelector(`.category-block[data-idx="${idx}"]`);
  const w = block.offsetWidth, h = block.offsetHeight;
  const maxW = content.clientWidth;

  const others = Array.from(content.querySelectorAll('.category-block'))
    .filter(b => b.dataset.idx != idx)
    .map(b => ({
      x: parseInt(b.style.left, 10),
      y: parseInt(b.style.top, 10),
      w: b.offsetWidth,
      h: b.offsetHeight
    }));

  outer:
  for (let y = 0; ; y += h + MIN_GAP) {
    for (let x = 0; x + w <= maxW; x += w + MIN_GAP) {
      let ok = true;
      for (const o of others) {
        const noHoriz = x + w + MIN_GAP <= o.x ||
                        x >= o.x + o.w + MIN_GAP;
        const noVert  = y + h + MIN_GAP <= o.y ||
                        y >= o.y + o.h + MIN_GAP;
        if (!(noHoriz || noVert)) { ok = false; break; }
      }
      if (ok) {
        categories[idx].x = x;
        categories[idx].y = y;
        block.style.left = x + 'px';
        block.style.top  = y + 'px';
        save();
        break outer;
      }
    }
  }
}

// --- Add Category button ---
document.getElementById('addCategoryBtn').onclick = () => {
  const name = prompt('New category name:');
  if (!name || categories.find(c => c.name === name)) return;
  categories.push({ name, x: 0, y: 0, w: DEFAULT_WIDTH });
  render();
  positionCategoryInFreeSpace(categories.length - 1);
};

// --- Import & Export ---
document.getElementById('importBtn').onclick = () => fileInput.click();
fileInput.onchange = e => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const obj = JSON.parse(reader.result);
      links = obj.links || [];
      categories = (obj.categories || []).map(c => ({
        name: c.name, x: c.x || 0, y: c.y || 0, w: c.w || DEFAULT_WIDTH
      }));
      render();
    } catch {
      alert('Invalid JSON');
    }
  };
  reader.readAsText(file);
  fileInput.value = '';
};

document.getElementById('exportBtn').onclick = () => {
  const exportCats = categories.map(c => ({
    name: c.name, x: c.x, y: c.y, w: c.w
  }));
  const blob = new Blob(
    [JSON.stringify({ links, categories: exportCats }, null, 2)],
    { type: 'application/json' }
  );
  const url = URL.createObjectURL(blob);
  const a   = document.createElement('a');
  a.href      = url;
  a.download  = 'myStartPage.json';
  a.click();
  URL.revokeObjectURL(url);
};

// --- Modal Logic using Bootstrap API ---
linkCancelBtn.onclick = e => {
  e.preventDefault();
  bsLinkModal.hide();
};
catCancelBtn.onclick = e => {
  e.preventDefault();
  bsCatModal.hide();
};

deleteBtn.onclick = e => {
  e.preventDefault();
  if (!confirm('Delete this link?')) return;
  const id = +document.getElementById('linkId').value;
  links = links.filter(l => l.id !== id);
  bsLinkModal.hide();
  render();
};

catDeleteBtn.onclick = e => {
  e.preventDefault();
  const idx = +document.getElementById('categoryIdx').value;
  if (confirm('Delete this empty category?')) {
    categories.splice(idx, 1);
    bsCatModal.hide();
    render();
  }
};

form.onsubmit = e => {
  e.preventDefault();

  const idVal = document.getElementById('linkId').value;

  let iconValue;
  if (linkClearIconCheckbox.checked) {
    // user asked to remove any custom icon
    iconValue = null;
  } else if (pendingIconDataUrl) {
    // user uploaded a new PNG this session
    iconValue = pendingIconDataUrl;
  } else {
    // keep whatever was there before (could be null or a previous data URL)
    iconValue = originalIconDataUrl;
  }

  const newLink = {
    id:       idVal || Date.now(),
    title:    document.getElementById('linkTitle').value,
    url:      document.getElementById('linkUrl').value,
    icon:     iconValue,
    category: document.getElementById('linkCategory').value
  };

  if (idVal) {
    links = links.map(l => l.id == newLink.id ? newLink : l);
  } else {
    links.push(newLink);
  }

  // reset temporary state
  pendingIconDataUrl = null;
  originalIconDataUrl = null;
  linkIconFileInput.value = '';
  linkClearIconCheckbox.checked = false;

  bsLinkModal.hide();
  render();
};

catForm.onsubmit = e => {
  e.preventDefault();
  const idx     = +document.getElementById('categoryIdx').value;
  const oldName = categories[idx].name;
  const newName = document.getElementById('categoryName').value.trim();
  if (!newName) return;
  categories[idx].name = newName;
  links = links.map(l =>
    l.category === oldName ? { ...l, category: newName } : l
  );
  bsCatModal.hide();
  render();
};

function openModal(titleText, link = {}, lockCat = false) {
  document.getElementById('modalTitle').textContent = titleText;
  form.reset();

  // remember the original icon (could be a data URL or null)
  originalIconDataUrl    = link.icon || null;
  pendingIconDataUrl     = null;
  linkIconFileInput.value = '';
  linkClearIconCheckbox.checked = false;

  document.getElementById('linkId').value    = link.id || '';
  document.getElementById('linkTitle').value = link.title || '';
  document.getElementById('linkUrl').value   = link.url || '';
  const catInput = document.getElementById('linkCategory');
  catInput.value    = link.category || categories[0]?.name || '';
  catInput.disabled = lockCat;
  deleteBtn.style.display = link.id ? 'inline-block' : 'none';

  bsLinkModal.show();
}

function openCategoryModal(cat, idx) {
  document.getElementById('categoryIdx').value   = idx;
  document.getElementById('categoryName').value  = cat.name;
  catDeleteBtn.style.display =
    links.some(l => l.category === cat.name) ? 'none' : 'inline-block';
  bsCatModal.show();
}

// --- Initialize ---
load();
render();
