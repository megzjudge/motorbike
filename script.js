// motorbike-5x6.pages.dev motorbike.jdge.cc

let dataArray = [];

async function loadData() {
    try {
        const response = await fetch('data.json');
        dataArray = await response.json();
        if (!dataArray.length) return;
        renderAllData();
    } catch (error) {
        console.error("Failed to load data.json", error);
    }
}

function getVideoSiteName(videoUrl) {
    let siteName = '';

    try {
        const urlObj = new URL(videoUrl);
        siteName = urlObj.hostname.replace('www.', '').split('.')[0];
        siteName = siteName.charAt(0).toUpperCase() + siteName.slice(1);

        if (siteName.toLowerCase() === 'youtube') {
            siteName = 'YouTube';
        }
    } catch (e) {
        siteName = 'Video';
    }

    return siteName;
}

function formatLabel(key) {
    return key
        .replace(/_/g, ' ')
        .replace(/\b\w/g, char => char.toUpperCase());
}

function isEmptyValue(value) {
    if (value === null || value === undefined) return true;
    if (typeof value === 'string' && value.trim() === '') return true;
    if (Array.isArray(value) && value.length === 0) return true;
    return false;
}

function renderBrandRow(data) {
    if (isEmptyValue(data.brand) && isEmptyValue(data.brand_flag)) return '';

    return `
        <div class="data-row">
            <span class="label">BRAND</span>
            <div class="brand-row">
                <span class="value">${data.brand || '—'}</span>
                ${data.brand_flag ? `<span class="flag">${data.brand_flag}</span>` : ''}
            </div>
        </div>
    `;
}

function renderVersionRow(data) {
    if (isEmptyValue(data.version)) return '';

    return `
        <div class="data-row">
            <span class="label">VERSION</span>
            ${
                data.version_url
                    ? `<a href="${data.version_url}" target="_blank" rel="noopener noreferrer" class="version-tag">${data.version}</a>`
                    : `<span class="version-tag version-tag-plain">${data.version}</span>`
            }
        </div>
    `;
}

function renderSafetyRow(data) {
    if (!Array.isArray(data.safety_rating) || data.safety_rating.length === 0) return '';

    const safetyHTML = data.safety_rating
        .filter(item => item && item.text)
        .map(item =>
            item.url
                ? `<a href="${item.url}" target="_blank" rel="noopener noreferrer" class="safety-tag">${item.text}</a>`
                : `<span class="safety-item">${item.text}</span>`
        )
        .join('');

    if (!safetyHTML) return '';

    return `
        <div class="data-row">
            <span class="label">SAFETY RATING</span>
            <div class="safety-ratings">
                ${safetyHTML}
            </div>
        </div>
    `;
}

function renderVideoRow(data) {
    if (isEmptyValue(data.video_url)) return '';

    const videos = Array.isArray(data.video_url)
        ? data.video_url.filter(Boolean)
        : [data.video_url];

    if (!videos.length) return '';

    const videoLinks = videos.map((url, index) => {
        const siteName = getVideoSiteName(url);
        const text = videos.length > 1 ? `${siteName} ${index + 1}` : siteName;

        return `
            <a href="${url}" target="_blank" rel="noopener noreferrer" class="safety-tag">
                ${text}
            </a>
        `;
    }).join('');

    return `
        <div class="data-row">
            <span class="label">VIDEO</span>
            <div class="safety-ratings">
                ${videoLinks}
            </div>
        </div>
    `;
}

function renderGenericRow(key, value) {
    if (isEmptyValue(value)) return '';

    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
        return `
            <div class="data-row">
                <span class="label">${formatLabel(key)}</span>
                <span class="value">${value}</span>
            </div>
        `;
    }

    if (Array.isArray(value)) {
        const items = value
            .filter(item => !isEmptyValue(item))
            .map(item => {
                if (typeof item === 'string' || typeof item === 'number') {
                    return `<span class="safety-item">${item}</span>`;
                }

                if (item && typeof item === 'object' && item.text) {
                    return item.url
                        ? `<a href="${item.url}" target="_blank" rel="noopener noreferrer" class="safety-tag">${item.text}</a>`
                        : `<span class="safety-item">${item.text}</span>`;
                }

                return '';
            })
            .join('');

        if (!items) return '';

        return `
            <div class="data-row">
                <span class="label">${formatLabel(key)}</span>
                <div class="safety-ratings">
                    ${items}
                </div>
            </div>
        `;
    }

    if (typeof value === 'object') {
        const inner = Object.entries(value)
            .filter(([, innerValue]) => !isEmptyValue(innerValue))
            .map(([innerKey, innerValue]) => `${formatLabel(innerKey)}: ${innerValue}`)
            .join(' • ');

        if (!inner) return '';

        return `
            <div class="data-row">
                <span class="label">${formatLabel(key)}</span>
                <span class="value">${inner}</span>
            </div>
        `;
    }

    return '';
}

function renderCardRows(data) {
    const rows = [];

    if (!isEmptyValue(data.part)) {
        rows.push(`
            <div class="data-row">
                <span class="label">PART</span>
                <span class="value">${data.part}</span>
            </div>
        `);
    }

    rows.push(renderBrandRow(data));
    rows.push(renderVersionRow(data));
    rows.push(renderSafetyRow(data));
    rows.push(renderVideoRow(data));

    const handledKeys = new Set([
        'image',
        'type',
        'title',
        'thumbnail',
        'part',
        'brand',
        'brand_flag',
        'version',
        'version_url',
        'safety_rating',
        'video_url'
    ]);

    Object.entries(data).forEach(([key, value]) => {
        if (handledKeys.has(key)) return;

        const rowHTML = renderGenericRow(key, value);
        if (rowHTML) rows.push(rowHTML);
    });

    return rows.join('');
}

function renderAllData() {
    const container = document.getElementById('content-container');
    container.innerHTML = '';

    dataArray.forEach(data => {
        // standalone bottom video
        if (data.type === 'standalone_video') {
            const videoBlock = document.createElement('div');
            videoBlock.className = 'standalone-video';

            videoBlock.innerHTML = `
                <a href="${data.video_url || '#'}" target="_blank" rel="noopener noreferrer" class="standalone-video-emoji-link">
                    <div class="standalone-video-emoji">🎥</div>
                    <div class="standalone-video-text">${data.title || 'Watch Video'}</div>
                </a>
            `;

            container.appendChild(videoBlock);
            return;
        }

        if (data.image) {
            const imgContainer = document.createElement('div');
            imgContainer.className = 'image-container';

            const img = document.createElement('img');
            img.src = data.image;
            img.alt = data.part || 'Motorbike part';

            imgContainer.appendChild(img);
            container.appendChild(imgContainer);
        }

        const rowsHTML = renderCardRows(data);

        if (rowsHTML.trim()) {
            const card = document.createElement('div');
            card.className = 'data-card';

            card.innerHTML = `
                <div class="data-inner">
                    ${rowsHTML}
                </div>
            `;

            container.appendChild(card);
        }
    });

    setupLightbox();
}

function setupLightbox() {
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-image');
    const closeBtn = document.querySelector('.lightbox-close');

    document.querySelectorAll('.image-container img').forEach(img => {
        img.addEventListener('click', () => {
            lightboxImg.src = img.src;
            lightbox.classList.add('active');
        });
    });

    if (closeBtn) {
        closeBtn.addEventListener('click', () => lightbox.classList.remove('active'));
    }

    if (lightbox) {
        lightbox.addEventListener('click', e => {
            if (e.target === lightbox) {
                lightbox.classList.remove('active');
            }
        });
    }
}

window.onload = loadData;
