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
        const cardLink = document.createElement('a');
        cardLink.className = 'embed-card';
        cardLink.target = '_blank';
        cardLink.href = data.version_url || data.video_url || '#';

        const img = document.createElement('img');

        if (data.video_url && data.video_url.includes("youtube.com")) {
            const videoId = data.video_url.split("v=")[1]?.split("&")[0];
            img.src = videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : data.image || '';
        } else {
            img.src = data.image || '';
        }
        img.alt = data.part || 'Motorbike part';
        cardLink.appendChild(img);

        const info = document.createElement('div');
        info.className = 'embed-info';
        info.innerHTML = `
            <strong>${data.part || '—'}</strong><br>
            ${data.brand || '—'} ${data.brand_flag || ''}
        `;
        cardLink.appendChild(info);

        const card = document.createElement('div');
        card.className = 'data-card';
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
                        ? `<a href="${data.version_url}" target="_blank" class="version-tag">${data.version || '—'}</a>` 
                        : `<span class="version-tag" style="background:transparent;color:#1f2937;">${data.version || '—'}</span>`}
                </div>
                <div class="data-row">
                    <span class="label">SAFETY RATING</span>
                    <div class="safety-ratings">
                        ${data.safety_rating && data.safety_rating.length > 0
                            ? data.safety_rating.map(r => r.url
                                ? `<a href="${r.url}" target="_blank" class="safety-tag">${r.text}</a>`
                                : `<span class="safety-item">${r.text}</span>`).join('')
                            : '<span class="value">—</span>'}
                    </div>
                </div>
            </div>
        `;

        let videoLink;
        if (data.video_url) {
            videoLink = document.createElement('a');
            videoLink.className = 'video-link';
            videoLink.href = data.video_url;
            videoLink.target = '_blank';
            videoLink.innerHTML = `<div class="icon">📹</div><span>WATCH VIDEOS</span>`;
        }

        container.appendChild(cardLink);
        container.appendChild(card);
        if (videoLink) container.appendChild(videoLink);
    });
}

window.onload = loadData;
