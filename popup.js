document.addEventListener('DOMContentLoaded', loadLinks);
document.getElementById('add-btn').addEventListener('click', addLink);
document.getElementById('open-all-btn').addEventListener('click', openAllLinks);

function loadLinks() {
    chrome.storage.local.get({ links: [] }, (data) => {
        const listContainer = document.getElementById('link-list');
        listContainer.innerHTML = '';

        data.links.forEach((item, index) => {
            const div = document.createElement('div');
            div.className = 'link-item';
            div.innerHTML = `
                <div class="link-clickable" data-url="${item.url}">
                    <span class="link-title" data-url="${item.url}">${item.title}</span>
                    <span class="link-url" data-url="${item.url}">${item.url}</span>
                </div>
                <button class="delete-btn" data-index="${index}">🗑️</button>
            `;
            listContainer.appendChild(div);
        });

        document.querySelectorAll('.link-clickable').forEach(item => {
            item.addEventListener('click', (e) => {
                const targetUrl = e.target.getAttribute('data-url');
                if (targetUrl) {
                    chrome.tabs.create({ url: targetUrl });
                }
            });
        });

        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = e.target.getAttribute('data-index');
                deleteLink(idx);
            });
        });
    });
}

function addLink() {
    const titleInput = document.getElementById('title-input');
    const urlInput = document.getElementById('url-input');

    let title = titleInput.value.trim();
    let url = urlInput.value.trim();

    if (!title || !url) return alert('Please fill in all fields!');

    if (!/^https?:\/\//i.test(url)) {
        url = 'https://' + url;
    }

    chrome.storage.local.get({ links: [] }, (data) => {
        const currentLinks = data.links;
        currentLinks.push({ title, url });

        chrome.storage.local.set({ links: currentLinks }, () => {
            titleInput.value = '';
            urlInput.value = '';
            loadLinks();
        });
    });
}

function deleteLink(index) {
    chrome.storage.local.get({ links: [] }, (data) => {
        const currentLinks = data.links;
        currentLinks.splice(index, 1);

        chrome.storage.local.set({ links: currentLinks }, () => {
            loadLinks();
        });
    });
}

function openAllLinks() {
    chrome.storage.local.get({ links: [] }, (data) => {
        if (data.links.length === 0) return alert('No shortcuts found. Add some first!');
        
        data.links.forEach(item => {
            chrome.tabs.create({ url: item.url });
        });
    });
}
