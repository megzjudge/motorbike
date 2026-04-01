// motorbike-5x6.pages.dev motorbike.jdge.cc

let dataArray = [];
let currentIndex = 0;

async function loadData() {
    try {
        const response = await fetch('data.json');
        dataArray = await response.json();
        if (!dataArray.length) return;
        renderData();
    } catch (error) {
        console.error("Failed to load data.json", error);
    }
}

function renderData() {
    const data = dataArray[currentIndex];

    const mainImg = document.getElementById('main-image');
    mainImg.src = data.image || '';
    mainImg.alt = data.part || 'Motorbike part';

    document.getElementById('part-value').textContent = data.part || '—';
    document.getElementById('brand-value').textContent = data.brand || '—';
    document.getElementById('flag-value').textContent = data.brand_flag || '';

    const versionLink = document.getElementById('version-link');
    versionLink.textContent = data.version || '—';
    if (data.version_url) { versionLink.href = data.version_url; versionLink.style.pointerEvents='auto'; versionLink.style.background=''; versionLink.style.color=''; }
    else { versionLink.removeAttribute('href'); versionLink.style.pointerEvents='none'; versionLink.style.background='transparent'; versionLink.style.color='#1f2937'; }

    const safetyContainer = document.getElementById('safety-container');
    safetyContainer.innerHTML = '';
    if (data.safety_rating && data.safety_rating.length > 0) {
        data.safety_rating.forEach(rating => {
            if (!rating.text) return;
            if (rating.url) {
                const a = document.createElement('a'); a.href = rating.url; a.target='_blank'; a.className='safety-tag'; a.textContent=rating.text; safetyContainer.appendChild(a);
            } else {
                const span = document.createElement('span'); span.className='safety-item'; span.textContent=rating.text; safetyContainer.appendChild(span);
            }
        });
    } else { safetyContainer.innerHTML = '<span class="value">—</span>'; }

    const videoLink = document.getElementById('video-link');
    if (data.video_url) { videoLink.href=data.video_url; videoLink.style.display='flex'; } else { videoLink.style.display='none'; }
}

function nextItem() { currentIndex=(currentIndex+1)%dataArray.length; renderData(); }
function prevItem() { currentIndex=(currentIndex-1+dataArray.length)%dataArray.length; renderData(); }

function setupLightbox() {
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-image');
    const mainImg = document.getElementById('main-image');
    const closeBtn = document.querySelector('.lightbox-close');

    mainImg.addEventListener('click', () => {
        if (mainImg.src) { lightboxImg.src=mainImg.src; lightbox.classList.add('active'); }
    });
    closeBtn.addEventListener('click', () => lightbox.classList.remove('active'));
    lightbox.addEventListener('click', (e) => { if (e.target===lightbox) lightbox.classList.remove('active'); });
}

window.onload = () => { loadData(); setupLightbox(); };
