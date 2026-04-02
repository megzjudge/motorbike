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
    } catch (e) {
        siteName = 'Video';
    }

    return siteName;
}

function renderAllData() {
    const container = document.getElementById('content-container');
    container.innerHTML = '';

    dataArray.forEach(data => {
        // STANDALONE VIDEO BLOCK
        if (data.type === 'standalone_video') {
            const videoBlock = document.createElement('div');
            videoBlock.className = 'standalone-video';

            videoBlock.innerHTML = `
                <a href="${data.video_url || '#'}" target="_blank" rel="noopener noreferrer" class="standalone-video-link">
                    <img
                        src="${data.thumbnail || ''}"
                        alt="${data.title || 'Video thumbnail'}"
                        class="standalone-video-image"
                    />
                    <div class="standalone-video-overlay">
                        <span class="standalone-video-play">▶</span>
                        <span class="standalone-video-title">${data.title || 'Watch Video'}</span>
                    </div>
                </a>
            `;

            container.appendChild(videoBlock);
            return;
        }

        // IMAGE
        const imgContainer = document.createElement('div');
        imgContainer.className = 'image-container';

        const img = document.createElement('img');
        img.src = data.image || '';
        img.alt = data.part || 'Motorbike part';
        imgContainer.appendChild(img);

        // DATA CARD
        const card = document.createElement('div');
        card.className = 'data-card';

        // SAFETY RATING ROW (optional)
        let safetyRowHTML = '';

        if (data.safety_rating && data.safety_rating.length > 0) {
            const safetyHTML = data.safety_rating.map(r => r.url
                ? `<a href="${r.url}" target="_blank" rel="noopener noreferrer" class="safety-tag">${r.text}</a>`
                : `<span class="safety-item">${r.text}</span>`
            ).join('');

            safetyRowHTML = `
                <div class="data-row">
                    <span class="label">SAFETY RATING</span>
                    <div class="safety-ratings">
                        ${safetyHTML}
                    </div>
                </div>
            `;
        }

        // VIDEO LINK ROW (optional)
        let videoHTML = '';
        if (data.video_url) {
            const siteName = getVideoSiteName(data.video_url);

            videoHTML = `
                <div class="data-row">
                    <span class="label">VIDEO</span>
                    <div class="safety-ratings">
                        <a href="${data.video_url}" target="_blank" rel="noopener noreferrer" class="safety-tag">${siteName}</a>
                    </div>
                </div>
            `;
        }

        card.innerHTML = `
            <div class="data-inner">
                <div class="data-row">
                    <span class="label">PART</span>
                    <span class="value">${data.part || '—'}</span>
                </div>
                <div class="data-row">
                    <span class="label">BRAND</span>
                    <div class="brand-row">
                        <span class="value">${data.brand || '—'}</span>
                        <span class="flag">${data.brand_flag || ''}</span>
                    </div>
                </div>
                <div class="data-row">
                    <span class="label">VERSION</span>
                    ${data.version_url
                        ? `<a href="${data.version_url}" target="_blank" rel="noopener noreferrer" class="version-tag">${data.version || '—'}</a>`
                        : `<span class="version-tag version-tag-plain">${data.version || '—'}</span>`}
                </div>
                ${safetyRowHTML}
                ${videoHTML}
            </div>
        `;

        container.appendChild(imgContainer);
        container.appendChild(card);
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
