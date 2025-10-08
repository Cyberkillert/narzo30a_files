let allFiles = [];
let currentCategory = 'all';

function formatSize(bytes) {
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  if (bytes === 0) return '0 B';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return parseFloat((bytes / Math.pow(1024, i)).toFixed(2)) + ' ' + sizes[i];
}

function renderCategories(files) {
  const container = document.getElementById('categoryContainer');
  container.innerHTML = '';

  const types = [...new Set(files.map(f => f.type?.trim().toLowerCase() || 'unknown'))];
  const allBtn = document.createElement('div');
  allBtn.className = 'category active';
  allBtn.textContent = 'All';
  allBtn.onclick = () => setCategory('all');
  container.appendChild(allBtn);

  types.forEach(type => {
    const btn = document.createElement('div');
    btn.className = 'category';
    btn.textContent = type;
    btn.onclick = () => setCategory(type);
    container.appendChild(btn);
  });
}

function setCategory(type) {
  currentCategory = type;
  document.querySelectorAll('.category').forEach(el => {
    el.classList.toggle('active', el.textContent.toLowerCase() === (type === 'all' ? 'all' : type));
  });

  const title = document.getElementById('categoryTitle');
  title.textContent = (type === 'all')
    ? 'Showing: All Files'
    : 'Showing: ' + type.charAt(0).toUpperCase() + type.slice(1);

  renderList();
}

function renderList() {
  const list = document.getElementById('fileList');
  const query = document.getElementById('searchInput').value.toLowerCase();

  const filtered = allFiles.filter(file => {
    const matchesSearch =
      file.file_name.toLowerCase().includes(query) ||
      file.type.toLowerCase().includes(query);
    const matchesCategory =
      currentCategory === 'all' || file.type.toLowerCase() === currentCategory;
    return matchesSearch && matchesCategory;
  });

  list.innerHTML = '';

  if (filtered.length === 0) {
    list.innerHTML = '<div style="padding:20px; text-align:center; color:#888;">No matching files found.</div>';
    return;
  }

  filtered.forEach(file => {
    const item = document.createElement('div');
    item.className = 'file-item';
    item.onclick = () => window.open(file.telegram_link, '_blank');

    const info = document.createElement('div');
    info.className = 'file-info';

    const name = document.createElement('div');
    name.className = 'file-name';
    name.textContent = file.file_name;

    const size = document.createElement('div');
    size.className = 'file-size';
    size.textContent = formatSize(file.size);

    info.appendChild(name);
    info.appendChild(size);

    const badge = document.createElement('div');
    badge.className = 'badge';
    badge.textContent = file.type || 'unknown';
    badge.onclick = (e) => {
      e.stopPropagation(); // prevent opening link
      setCategory(file.type.toLowerCase());
    };

    item.appendChild(info);
    item.appendChild(badge);
    list.appendChild(item);
  });
}

fetch('files.json')
  .then(res => {
    if (!res.ok) throw new Error('Failed to load files.json');
    return res.json();
  })
  .then(data => {
    allFiles = data;
    renderCategories(allFiles);
    renderList();
  })
  .catch(err => {
    document.getElementById('fileList').textContent = 'Error loading file list: ' + err.message;
  });

document.getElementById('searchInput').addEventListener('input', renderList);