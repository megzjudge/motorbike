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

function getImageTooltipName(imagePath) {
    if (!imagePath || typeof imagePath !== 'string') return '';
    const filename = imagePath.split('/').pop();
    let name = filename.replace(/\.png$/i, '');
    name = name.replace(/_/g, ' ').trim();
    name = name.replace(/\b\w/g, char => char.toUpperCase());
    return name || 'Item';
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

function renderGenericRow(key, value) {
    if (isEmptyValue(value)) return '';

    if (typeof value === 'string' || typeof value === 'number') {
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
            .map(item => `<span class="safety-item">${item}</span>`)
            .join('');

        if (!items) return '';

        return `
            <div class="data-row">
                <span class="label">${formatLabel(key)}</span>
                <div class="safety-ratings">${items}</div>
            </div>
        `;
    }

    if (typeof value === 'object') {
        const inner = Object.entries(value)
            .filter(([, v]) => !isEmptyValue(v))
            .map(([k, v]) => `${formatLabel(k)}: ${v}`)
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

    Object.entries(data).forEach(([key, value]) => {
        if (['image', 'type', 'title', 'thumbnail'].includes(key)) return;
        if (isEmptyValue(value)) return;

        if (key === 'part') {
            rows.push(`
                <div class="data-row">
                    <span class="label">PART</span>
                    <span class="value">${value}</span>
                </div>
            `);
            return;
        }

        if (key === 'brand') {
            const brandContent = data.brand_url
                ? `<a href="${data.brand_url}" target="_blank" rel="noopener noreferrer" class="version-tag">${value}</a>`
                : `<span class="value">${value}</span>`;

            rows.push(`
                <div class="data-row">
                    <span class="label">BRAND</span>
                    <div class="brand-row">
                        ${brandContent}
                        ${data.brand_flag ? `<span class="flag">${data.brand_flag}</span>` : ''}
                    </div>
                </div>
            `);
            return;
        }
        if (key === 'brand_flag' || key === 'brand_url') return;

        if (key === 'from') {
            const fromContent = data.from_url
                ? `<a href="${data.from_url}" target="_blank" rel="noopener noreferrer" class="version-tag">${value}</a>`
                : `<span class="value">${value}</span>`;

            rows.push(`
                <div class="data-row">
                    <span class="label">FROM</span>
                    ${fromContent}
                </div>
            `);
            return;
        }
        if (key === 'from_url') return;

        if (key === 'version') {
            rows.push(`
                <div class="data-row">
                    <span class="label">VERSION</span>
                    ${
                        data.version_url
                            ? `<a href="${data.version_url}" target="_blank" rel="noopener noreferrer" class="version-tag">${value}</a>`
                            : `<span class="version-tag version-tag-plain">${value}</span>`
                    }
                </div>
            `);
            return;
        }
        if (key === 'version_url') return;

        if (key === 'safety_rating') {
            const items = value
                .filter(r => r && r.text)
                .map(r =>
                    r.url
                        ? `<a href="${r.url}" target="_blank" rel="noopener noreferrer" class="safety-tag">${r.text}</a>`
                        : `<span class="safety-item">${r.text}</span>`
                )
                .join('');

            if (items) {
                rows.push(`
                    <div class="data-row">
                        <span class="label">SAFETY RATING</span>
                        <div class="safety-ratings">${items}</div>
                    </div>
                `);
            }
            return;
        }

        if (key === 'video_url') {
            const videos = Array.isArray(value) ? value.filter(Boolean) : [value];
            if (videos.length) {
                const links = videos.map((url, i) => {
                    const name = getVideoSiteName(url);
                    return `
                        <a href="${url}" target="_blank" rel="noopener noreferrer" class="safety-tag">
                            ${videos.length > 1 ? `${name} ${i + 1}` : name}
                        </a>
                    `;
                }).join('');

                rows.push(`
                    <div class="data-row">
                        <span class="label">VIDEO</span>
                        <div class="safety-ratings">${links}</div>
                    </div>
                `);
            }
            return;
        }

        const generic = renderGenericRow(key, value);
        if (generic) rows.push(generic);
    });

    return rows.join('');
}

function setupTooltips() {
    const tooltip = document.getElementById('custom-tooltip');
    if (!tooltip) return;

    const links = document.querySelectorAll('.shop-gallery-link');

    links.forEach(link => {
        const text = link.getAttribute('data-tooltip');

        link.addEventListener('mouseenter', (e) => {
            document.getElementById('tooltip-text').textContent = text;
            tooltip.classList.add('show');
            updateTooltipPosition(e);
        });

        link.addEventListener('mousemove', updateTooltipPosition);

        link.addEventListener('mouseleave', () => {
            tooltip.classList.remove('show');
        });

        link.addEventListener('touchstart', (e) => {
            if (e.touches.length > 0) {
                document.getElementById('tooltip-text').textContent = text;
                tooltip.classList.add('show');
                updateTooltipPosition(e.touches[0]);
            }
        });

        link.addEventListener('touchmove', (e) => {
            if (e.touches.length > 0) updateTooltipPosition(e.touches[0]);
        });

        link.addEventListener('touchend', () => {
            tooltip.classList.remove('show');
        });
    });
}

function updateTooltipPosition(e) {
    const tooltip = document.getElementById('custom-tooltip');
    if (!tooltip) return;
    const x = e.clientX + 18;
    const y = e.clientY + 24;
    tooltip.style.left = `${x}px`;
    tooltip.style.top = `${y}px`;
}

function renderAllData() {
    const container = document.getElementById('content-container');
    container.innerHTML = '';

    dataArray.forEach(data => {

        // SHOP GALLERY
        if (data.type === 'shop_gallery') {
            const section = document.createElement('div');
            section.className = 'shop-gallery-section';
        
            const sections = Array.isArray(data.sections) ? data.sections : [];
        
            section.innerHTML = `
                <div class="shop-gallery-inner">
                    ${data.title ? `<div class="shop-gallery-title">${data.title}</div>` : ''}
        
                    ${sections.map(sec => `
                        <div class="shop-subsection">
                            ${sec.title ? `<div class="shop-subheader">${sec.title}</div>` : ''}
        
                            <div class="shop-gallery-grid">
                                ${(sec.items || []).map(item => `
                                    <a href="${item.url}" 
                                       target="_blank" 
                                       rel="noopener noreferrer" 
                                       class="shop-gallery-link"
                                       data-tooltip="${getImageTooltipName(item.image)}"
                                       ${item.note ? `title="${item.note}"` : ''}>
                                        <img src="${item.image}" class="shop-gallery-image">
                                    </a>
                                `).join('')}
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
        
            container.appendChild(section);
            return;
        }

        // STANDALONE VIDEO
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

        // IMAGE
        if (data.image) {
            const imgContainer = document.createElement('div');
            imgContainer.className = 'image-container';

            const img = document.createElement('img');
            img.src = data.image;
            img.alt = data.part || 'Motorbike part';

            imgContainer.appendChild(img);
            container.appendChild(imgContainer);
        }

        // CARD
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
    setupTooltips();
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

    if (closeBtn) closeBtn.addEventListener('click', () => lightbox.classList.remove('active'));

    if (lightbox) {
        lightbox.addEventListener('click', e => {
            if (e.target === lightbox) lightbox.classList.remove('active');
        });
    }
}

window.onload = loadData;
