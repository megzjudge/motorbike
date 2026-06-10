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

function isPdf(url) {
    return typeof url === 'string' && /\.pdf(\?|#|$)/i.test(url.trim());
}

function pdfLinkAttrs(url) {
    // shared attributes that mark a link as a PDF-lightbox trigger
    return `href="${url}" data-pdf="${url}"`;
}

function getImageTooltipName(imagePath) {
    if (!imagePath || typeof imagePath !== 'string') return '';
    const filename = imagePath.split('/').pop();
    let name = filename.replace(/\.[^.]+$/i, '');
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

function toArray(value) {
    if (isEmptyValue(value)) return [];
    return Array.isArray(value) ? value : [value];
}

function collectImageSources(value) {
    const sources = [];

    toArray(value).forEach(item => {
        if (typeof item === 'string' && item.trim() !== '') {
            sources.push(item);
            return;
        }

        if (Array.isArray(item)) {
            sources.push(...collectImageSources(item));
            return;
        }

        if (item && typeof item === 'object') {
            if (typeof item.image === 'string' && item.image.trim() !== '') {
                sources.push(item.image);
                return;
            }

            if (Array.isArray(item.image)) {
                sources.push(...collectImageSources(item.image));
            }
        }
    });

    return sources;
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
            .map(item => {
                if (typeof item === 'string' || typeof item === 'number') {
                    return `<span class="safety-item">${item}</span>`;
                }

                if (item && typeof item === 'object') {
                    const text = Object.entries(item)
                        .filter(([, v]) => !isEmptyValue(v))
                        .map(([k, v]) => `${formatLabel(k)}: ${v}`)
                        .join(' • ');

                    return text ? `<span class="safety-item">${text}</span>` : '';
                }

                return '';
            })
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

function renderVersionsRow(versions) {
    const versionItems = toArray(versions)
        .filter(v => v && !isEmptyValue(v.name || v.text || v.title || v.version))
        .map(v => {
            const versionName = v.name || v.text || v.title || v.version;
            const versionUrl = v.url || v.version_url;

            if (versionUrl) {
                if (isPdf(versionUrl)) {
                    return `<a ${pdfLinkAttrs(versionUrl)} class="version-tag pdf-trigger">${versionName}</a>`;
                }
                return `<a href="${versionUrl}" target="_blank" rel="noopener noreferrer" class="version-tag">${versionName}</a>`;
            }

            return `<span class="version-tag version-tag-plain">${versionName}</span>`;
        })
        .join('');

    if (!versionItems) return '';

    return `
        <div class="data-row">
            <span class="label">VERSION</span>
            <div class="safety-ratings">${versionItems}</div>
        </div>
    `;
}

function renderSafetyRow(safetyRatings) {
    const ratings = toArray(safetyRatings);

    const items = ratings
        .filter(r => {
            if (typeof r === 'string' || typeof r === 'number') return !isEmptyValue(r);
            return r && !isEmptyValue(r.text || r.name || r.rating);
        })
        .map(r => {
            if (typeof r === 'string' || typeof r === 'number') {
                return `<span class="safety-item">${r}</span>`;
            }

            const ratingText = r.text || r.name || r.rating;
            const ratingUrl = r.url;

            if (ratingUrl) {
                if (isPdf(ratingUrl)) {
                    return `<a ${pdfLinkAttrs(ratingUrl)} class="safety-tag pdf-trigger">${ratingText}</a>`;
                }
                return `<a href="${ratingUrl}" target="_blank" rel="noopener noreferrer" class="safety-tag">${ratingText}</a>`;
            }

            return `<span class="safety-item">${ratingText}</span>`;
        })
        .join('');

    if (!items) return '';

    return `
        <div class="data-row">
            <span class="label">SAFETY RATING</span>
            <div class="safety-ratings">${items}</div>
        </div>
    `;
}

function renderVideoRow(videoValue) {
    const videos = toArray(videoValue).filter(Boolean);

    if (!videos.length) return '';

    const links = videos.map((video, i) => {
        const url = typeof video === 'string' ? video : video.url || video.video_url;
        if (!url) return '';

        const name = video.title || video.name || getVideoSiteName(url);

        return `
            <a href="${url}" target="_blank" rel="noopener noreferrer" class="safety-tag">
                ${videos.length > 1 ? `${name} ${i + 1}` : name}
            </a>
        `;
    }).join('');

    if (!links.trim()) return '';

    return `
        <div class="data-row">
            <span class="label">VIDEO</span>
            <div class="safety-ratings">${links}</div>
        </div>
    `;
}


function extractTailSourceLink(value, fallbackUrl) {
    let text = typeof value === 'string' ? value : String(value);
    let url = fallbackUrl || '';
    let label = 'Source';

    const anchorMatch = text.match(/\s*<a\s+[^>]*href=(["'])(.*?)\1[^>]*>(.*?)<\/a>\s*$/i);

    if (anchorMatch) {
        if (!url) url = anchorMatch[2];
        label = anchorMatch[3].replace(/<[^>]*>/g, '').trim() || 'Source';
        text = text.replace(anchorMatch[0], '').trim();
    }

    return {
        text,
        url,
        label
    };
}

function renderInlineSourceLink(url, label = 'Source') {
    if (!url) return '';

    return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="inline-source-link" style="display:inline !important; margin-left:4px; white-space:nowrap;">${label}</a>`;
}

function renderBrandArrayRows(brands) {
    const brandItems = brands
        .filter(brand => brand && typeof brand === 'object' && !isEmptyValue(brand.name || brand.brand));

    if (!brandItems.length) return '';

    const rows = [];

    const brandContent = brandItems
        .map(brand => {
            const brandName = brand.name || brand.brand;
            const brandUrl = brand.brand_url || brand.url;
            const brandNameHTML = brandUrl
                ? `<a href="${brandUrl}" target="_blank" rel="noopener noreferrer" class="version-tag">${brandName}</a>`
                : `<span class="value">${brandName}</span>`;

            return `
                <span class="brand-inline-item">
                    ${brandNameHTML}
                    ${brand.brand_flag ? `<span class="flag">${brand.brand_flag}</span>` : ''}
                </span>
            `;
        })
        .join('');

    rows.push(`
        <div class="data-row">
            <span class="label">BRAND</span>
            <div class="brand-row brand-row-multi">
                ${brandContent}
            </div>
        </div>
    `);

    const allVersions = [];
    brandItems.forEach(brand => {
        if (Array.isArray(brand.versions)) {
            allVersions.push(...brand.versions);
        } else if (!isEmptyValue(brand.version || brand.version_url)) {
            allVersions.push({
                name: brand.version,
                url: brand.version_url
            });
        }
    });

    const versionsHTML = renderVersionsRow(allVersions);
    if (versionsHTML) rows.push(versionsHTML);

    const allSafetyRatings = [];
    brandItems.forEach(brand => {
        if (!isEmptyValue(brand.safety_rating)) {
            allSafetyRatings.push(...toArray(brand.safety_rating));
        }
    });

    const safetyHTML = renderSafetyRow(allSafetyRatings);
    if (safetyHTML) rows.push(safetyHTML);

    const fromItems = brandItems
        .filter(brand => !isEmptyValue(brand.from))
        .map(brand => {
            if (brand.from_url) {
                if (isPdf(brand.from_url)) {
                    return `<a ${pdfLinkAttrs(brand.from_url)} class="version-tag pdf-trigger">${brand.from}</a>`;
                }
                return `<a href="${brand.from_url}" target="_blank" rel="noopener noreferrer" class="version-tag">${brand.from}</a>`;
            }

            return `<span class="version-tag version-tag-plain">${brand.from}</span>`;
        })
        .join('');

    if (fromItems) {
        rows.push(`
            <div class="data-row">
                <span class="label">FROM</span>
                <div class="safety-ratings">${fromItems}</div>
            </div>
        `);
    }

    const allVideos = [];
    brandItems.forEach(brand => {
        if (!isEmptyValue(brand.video_url)) {
            allVideos.push(...toArray(brand.video_url));
        }
    });

    const videoHTML = renderVideoRow(allVideos);
    if (videoHTML) rows.push(videoHTML);

    const handledBrandKeys = new Set([
        'name',
        'brand',
        'brand_flag',
        'brand_url',
        'url',
        'image',
        'versions',
        'version',
        'version_url',
        'safety_rating',
        'from',
        'from_url',
        'video_url'
    ]);

    const extraKeys = [];
    brandItems.forEach(brand => {
        Object.keys(brand).forEach(key => {
            if (!handledBrandKeys.has(key) && !extraKeys.includes(key)) {
                extraKeys.push(key);
            }
        });
    });

    extraKeys.forEach(key => {
        const combinedValues = brandItems
            .map(brand => brand[key])
            .filter(value => !isEmptyValue(value));

        if (!combinedValues.length) return;

        const generic = renderGenericRow(key, combinedValues.length === 1 ? combinedValues[0] : combinedValues);
        if (generic) rows.push(generic);
    });

    return rows.join('');
}

function renderCardRows(data) {
    const rows = [];

    Object.entries(data).forEach(([key, value]) => {
        if (['image', 'type', 'title', 'thumbnail', 'versions'].includes(key)) return;
        if (isEmptyValue(value)) return;

        // PART
        if (key === 'part') {
            rows.push(`
                <div class="data-row">
                    <span class="label">PART</span>
                    <span class="value">${value}</span>
                </div>
            `);
            return;
        }

        // BRAND
        if (key === 'brand') {
            if (Array.isArray(value)) {
                const brandRows = renderBrandArrayRows(value);
                if (brandRows) rows.push(brandRows);
                return;
            }

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

        // FROM
        if (key === 'from') {
            let fromContent;
            if (data.from_url) {
                if (isPdf(data.from_url)) {
                    fromContent = `<a ${pdfLinkAttrs(data.from_url)} class="version-tag pdf-trigger">${value}</a>`;
                } else {
                    fromContent = `<a href="${data.from_url}" target="_blank" rel="noopener noreferrer" class="version-tag">${value}</a>`;
                }
            } else {
                fromContent = `<span class="value">${value}</span>`;
            }

            rows.push(`
                <div class="data-row">
                    <span class="label">FROM</span>
                    ${fromContent}
                </div>
            `);
            return;
        }

        if (key === 'from_url') return;

        // MULTI VERSION
        if (key === 'versions') {
            const versionsHTML = renderVersionsRow(value);
            if (versionsHTML) rows.push(versionsHTML);
            return;
        }

        // SINGLE VERSION FALLBACK
        if (key === 'version') {
            let versionContent;
            if (data.version_url) {
                if (isPdf(data.version_url)) {
                    versionContent = `<a ${pdfLinkAttrs(data.version_url)} class="version-tag pdf-trigger">${value}</a>`;
                } else {
                    versionContent = `<a href="${data.version_url}" target="_blank" rel="noopener noreferrer" class="version-tag">${value}</a>`;
                }
            } else {
                versionContent = `<span class="version-tag version-tag-plain">${value}</span>`;
            }

            rows.push(`
                <div class="data-row">
                    <span class="label">VERSION</span>
                    ${versionContent}
                </div>
            `);
            return;
        }

        if (key === 'version_url') return;

        // SAFETY
        if (key === 'safety_rating') {
            const safetyHTML = renderSafetyRow(value);
            if (safetyHTML) rows.push(safetyHTML);
            return;
        }

        // VIDEO
        if (key === 'video_url') {
            const videoHTML = renderVideoRow(value);
            if (videoHTML) rows.push(videoHTML);
            return;
        }

        // COLOURS WITH SOURCE BUTTON
        if (key === 'colours') {
            const source = extractTailSourceLink(value, data.colours_source_url);
            const sourceButton = source.url
                ? `<a href="${source.url}" target="_blank" rel="noopener noreferrer" class="safety-tag colours-source-button">${source.label}</a>`
                : '';

            rows.push(`
                <div class="data-row colours-row">
                    <span class="label">COLOURS</span>
                    <div class="colours-value-wrap">
                        <span class="value colours-value">${source.text}</span>
                        ${sourceButton ? `<div class="colours-source-wrap">${sourceButton}</div>` : ''}
                    </div>
                </div>
            `);
            return;
        }

        if (key === 'colours_source_url') return;

        // DEFAULT AUTO FIELD
        const generic = renderGenericRow(key, value);
        if (generic) rows.push(generic);
    });

    if (Array.isArray(data.versions) && data.versions.length) {
        const versionsHTML = renderVersionsRow(data.versions);
        if (versionsHTML) {
            const hasVersionRowAlready = rows.some(row => row.includes('<span class="label">VERSION</span>'));
            if (!hasVersionRowAlready) rows.push(versionsHTML);
        }
    }

    return rows.join('');
}

function setupTooltips() {
    const tooltip = document.getElementById('custom-tooltip');
    if (!tooltip) return;

    const links = document.querySelectorAll('.shop-gallery-link');

    links.forEach(link => {
        const text = link.getAttribute('data-tooltip');

        // Desktop mouse
        link.addEventListener('mouseenter', (e) => {
            document.getElementById('tooltip-text').textContent = text;
            tooltip.classList.add('show');
            updateTooltipPosition(e);
        });

        link.addEventListener('mousemove', updateTooltipPosition);

        link.addEventListener('mouseleave', () => {
            tooltip.classList.remove('show');
        });

        // Mobile touch
        link.addEventListener('touchstart', (e) => {
            if (e.touches.length > 0) {
                document.getElementById('tooltip-text').textContent = text;
                tooltip.classList.add('show');
                updateTooltipPosition(e.touches[0]);
            }
        });

        link.addEventListener('touchmove', (e) => {
            if (e.touches.length > 0) {
                updateTooltipPosition(e.touches[0]);
            }
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

function renderImages(data, container) {
    const images = [];

    images.push(...collectImageSources(data.image));

    if (Array.isArray(data.brand)) {
        data.brand.forEach(brand => {
            if (brand && typeof brand === 'object') {
                images.push(...collectImageSources(brand.image));
            }
        });
    }

    const validImages = images.filter(src => typeof src === 'string' && src.trim() !== '');

    if (!validImages.length) return;

    const imgContainer = document.createElement('div');
    imgContainer.className = 'image-container';

    validImages.forEach(src => {
        const img = document.createElement('img');
        img.src = src;
        img.alt = data.part || 'Motorbike part';
        imgContainer.appendChild(img);
    });

    container.appendChild(imgContainer);
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
            
                    ${data.note ? `
                        <div class="shop-gallery-note">
                            ${data.note}
                        </div>
                    ` : ''}
            
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
                                       ${item.note ? `title="${Array.isArray(item.note) ? item.note.join('\\n\\n') : item.note}"` : ''}>
                                        <img src="${item.image}" class="shop-gallery-image">
                                    </a>
                                `).join('')}
                            </div>
                            
                            ${Array.isArray(sec.gallery) && sec.gallery.length ? `
                                <div class="shop-gallery-grid shop-gallery-feature-grid">
                                    ${sec.gallery.map(item => `
                                        <a href="${item.url}"
                                           target="_blank"
                                           rel="noopener noreferrer"
                                           class="shop-gallery-link"
                                           data-tooltip="${getImageTooltipName(item.image)}">
                                            <img src="${item.image}" class="shop-gallery-image">
                                        </a>
                                    `).join('')}
                                </div>
                            ` : ''}
            
                            ${sec.note ? `
                                <div class="shop-note-groups">
                                    ${Object.entries(sec.note).map(([group, noteData]) => `
                                        <div class="shop-note-group">
                                            <div class="shop-note-group-title">${group}</div>
            
                                            <div class="shop-note-grid">
                                                ${(noteData.items || []).map(item => `
                                                    <a href="${item.url}"
                                                       target="_blank"
                                                       rel="noopener noreferrer"
                                                       class="shop-note-link"
                                                       data-tooltip="${getImageTooltipName(item.image)}">
                                                        <img src="${item.image}" class="shop-note-image">
                                                    </a>
                                                `).join('')}
                                            </div>
            
                                            ${noteData.text ? `
                                                <div class="shop-note-text">
                                                    ${Array.isArray(noteData.text)
                                                        ? noteData.text.map(t => '<div>' + t + '</div>').join('')
                                                        : noteData.text}
                                                </div>
                                            ` : ''}
                                        </div>
                                    `).join('')}
                                </div>
                            ` : ''}
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
        renderImages(data, container);

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

    if (!lightbox) return;

    const pdfWrap = document.getElementById('lightbox-pdf');

    function closeLightbox() {
        lightbox.classList.remove('active');
        lightbox.classList.remove('pdf-mode');
        if (pdfWrap) pdfWrap.innerHTML = '';
        if (lightboxImg) lightboxImg.style.display = '';
    }

    // IMAGES (existing behaviour)
    document.querySelectorAll('.image-container img').forEach(img => {
        img.addEventListener('click', () => {
            if (lightboxImg) {
                lightboxImg.src = img.src;
                lightboxImg.style.display = '';
            }
            lightbox.classList.remove('pdf-mode');
            lightbox.classList.add('active');
        });
    });

    // PDFs
    document.querySelectorAll('.pdf-trigger').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const url = link.getAttribute('data-pdf');
            if (!url || !pdfWrap) return;

            if (lightboxImg) lightboxImg.style.display = 'none';
            lightbox.classList.add('pdf-mode', 'active');

            // object tag = native viewer on desktop; iframe fallback for others
            pdfWrap.innerHTML = `
                <object data="${url}#toolbar=1&navpanes=0&view=FitH" type="application/pdf">
                    <iframe src="${url}#view=FitH" title="PDF"></iframe>
                </object>
                <a class="pdf-open-tab" href="${url}" target="_blank" rel="noopener noreferrer">Open PDF in new tab ↗</a>
            `;
        });
    });

    if (closeBtn) closeBtn.addEventListener('click', closeLightbox);

    lightbox.addEventListener('click', e => {
        if (e.target === lightbox) closeLightbox();
    });

    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') closeLightbox();
    });
}

window.onload = loadData;
