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

function renderAllData() {
    const container = document.getElementById('content-container');
    container.innerHTML = '';

    dataArray.forEach(data => {
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

        // SAFETY RATING HTML
        const safetyHTML = data.safety_rating && data.safety_rating.length > 0
            ? data.safety_rating.map(r => r.url
                ? `<a href="${r.url}" target="_blank" class="safety-tag">${r.text}</a>`
                : `<span class="safety-item">${r.text}</span>`).join('')
            : '<span class="value">â€”</span>';

        // VIDEO LINK HTML (optional)
        let videoHTML = '';
        if (data.video_url) {
            // Extract website name from URL
            let siteName = '';
            try {
                const urlObj = new URL(data.video_url);
                siteName = urlObj.hostname.replace('www.', '').split('.')[0];
                siteName = siteName.charAt(0).toUpperCase() + siteName.slice(1); // Capitalize
            } catch (e) {
                siteName = 'Video';
            }

            videoHTML = `<div class="data-row">
                <span class="label">VIDEO</span>
                <div class="safety-ratings">
                    <a href="${data.video_url}" target="_blank" class="safety-tag">${siteName}</a>
                </div>
            </div>`;
        }

        card.innerHTML = `
            <div class="data-inner">
                <div class="data-row">
                    <span class="label">PART</span>
                    <span class="value">${data.part || 'â€”'}</span>
                </div>
                <div class="data-row">
                    <span class="label">BRAND</span>
                    <div class="brand-row">
                        <span class="value">${data.brand || 'â€”'}</span>
                        <span class="flag">${data.brand_flag || ''}</span>
                    </div>
                </div>
                <div class="data-row">
                    <span class="label">VERSION</span>
                    ${data.version_url 
                        ? `<a href="${data.version_url}" target="_blank" class="version-tag">${data.version || 'â€”'}</a>` 
                        : `<span class="version-tag" style="background:transparent;color:#1f2937;">${data.version || 'â€”'}</span>`}
                </div>
                <div class="data-row">
                    <span class="label">SAFETY RATING</span>
                    <div class="safety-ratings">
                        ${safetyHTML}
                    </div>
                </div>
                ${videoHTML}
            </div>
        `;

        // APPEND
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

    closeBtn.addEventListener('click', () => lightbox.classList.remove('active'));
    lightbox.addEventListener('click', e => {
        if (e.target === lightbox) lightbox.classList.remove('active');
    });
}

window.onload = loadData;
