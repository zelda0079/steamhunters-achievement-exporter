// ==UserScript==
// @name         SteamHunters Achievement Exporter
// @namespace    https://github.com/zelda0079/steamhunters-achievement-exporter
// @version      1.0.0
// @description  Export SteamHunters achievements to an Excel-friendly CSV file.
// @author       zelda0079
// @match        https://steamhunters.com/*
// @run-at       document-idle
// @grant        none
// @downloadURL  https://raw.githubusercontent.com/zelda0079/steamhunters-achievement-exporter/main/steamhunters-achievement-exporter.user.js
// @updateURL    https://raw.githubusercontent.com/zelda0079/steamhunters-achievement-exporter/main/steamhunters-achievement-exporter.user.js
// @liscense     MIT
// ==/UserScript==

(function () {
    'use strict';

    const appIdMatch = location.pathname.match(/\/apps\/(\d+)\/achievements(?:\/|$)/);
    if (!appIdMatch) return;

    const APP_ID = appIdMatch[1];
    const BUTTON_ID = 'sh-export-button';
    if (document.getElementById(BUTTON_ID)) return;

    const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
    const cleanText = value => (value || '').replace(/\s+/g, ' ').trim();

    function extractUnlockTime(card) {
        const dateRegex = /\b(\d{1,2})\s+([A-Za-z]{3})\s+'(\d{2})\s*@\s*(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(am|pm)\b/i;
        const months = {
            Jan: '01', Feb: '02', Mar: '03', Apr: '04',
            May: '05', Jun: '06', Jul: '07', Aug: '08',
            Sep: '09', Oct: '10', Nov: '11', Dec: '12'
        };

        function convertDate(value) {
            const match = value.match(dateRegex);
            if (!match) return null;
            const monthKey = match[2].charAt(0).toUpperCase() + match[2].slice(1, 3).toLowerCase();
            const month = months[monthKey];
            if (!month) return null;

            const day = match[1].padStart(2, '0');
            const year = '20' + match[3];
            let hour = Number(match[4]);
            const minute = match[5];
            const second = match[6] || '00';
            const ampm = match[7].toLowerCase();

            if (hour < 1 || hour > 12) return null;
            if (ampm === 'pm' && hour !== 12) hour += 12;
            if (ampm === 'am' && hour === 12) hour = 0;

            return `${year}-${month}-${day} ${String(hour).padStart(2, '0')}:${minute}:${second}`;
        }

        for (const element of card.querySelectorAll('[title]')) {
            const result = convertDate(element.getAttribute('title') || '');
            if (result) return result;
        }

        const metadata = card.querySelector('.check-toggle .image')?.getAttribute('title') || '';
        const fallback = metadata.match(/Unlocked\s+(.+?)(?=\r?\n|$)/i);
        return fallback ? (convertDate(fallback[1]) || '') : '';
    }

    function getMetadata(card) {
        return card.querySelector('.check-toggle .image')?.getAttribute('title') || '';
    }

    function getMetadataValue(metadata, key) {
        const match = metadata.match(new RegExp('^' + key + ':\\s*(.+)$', 'im'));
        return match ? cleanText(match[1]) : '';
    }

    function getRarityInfo(card) {
        const element = card.querySelector('.stat-percentage');
        if (!element) return { rarity: '', steamPercentage: '' };

        const tooltip = element.getAttribute('data-original-title') || element.getAttribute('title') || '';
        const doc = new DOMParser().parseFromString(tooltip, 'text/html');
        const tooltipText = cleanText(doc.body.textContent);
        const rarityMatch = tooltipText.match(/\b(Common|Uncommon|Rare|Very Rare|Ultra Rare|Legendary)\b/i);
        const steamMatch = tooltipText.match(/([\d.]+)\s*%\s*on Steam/i);

        return {
            rarity: rarityMatch ? rarityMatch[1] : '',
            steamPercentage: steamMatch ? steamMatch[1] + '%' : ''
        };
    }

    function getPercentage(card) {
        return cleanText(card.querySelector('.stat-percentage .title')?.textContent || '').replace(/\s+/g, '');
    }

    function extractAchievement(card) {
        const link = card.querySelector('.achievement-name a');
        if (!link) return null;

        const name = cleanText(link.textContent);
        const description = cleanText(
            card.querySelector('.achievement-name')?.parentElement?.querySelector('p.small span')?.textContent || ''
        );
        const metadata = getMetadata(card);
        const playersText = cleanText(card.querySelector('.stat-players')?.textContent || '');
        const playersMatch = playersText.match(/([\d,]+)\s*\/\s*([\d,]+)/);
        const rarityInfo = getRarityInfo(card);
        const image = card.querySelector('.check-toggle .image img');
        const achievementUrl = link.href || '';

        return {
            app_id: APP_ID,
            achievement_id: (achievementUrl.match(/achievements\/(\d+)/) || [])[1] || '',
            name,
            description,
            unlocked_at: extractUnlockTime(card),
            unlocked_users: playersMatch ? playersMatch[1].replace(/,/g, '') : '',
            total_players: playersMatch ? playersMatch[2].replace(/,/g, '') : '',
            points: cleanText(card.querySelector('.stat-points')?.textContent || ''),
            completion_percentage: getPercentage(card),
            rarity: rarityInfo.rarity,
            steam_unlock_percentage: rarityInfo.steamPercentage,
            internal_key: getMetadataValue(metadata, 'Internal Key'),
            api_name: getMetadataValue(metadata, 'API Name'),
            image_url: image ? image.src : '',
            achievement_url: achievementUrl,
            raw_text: cleanText(card.innerText)
        };
    }

    async function loadAllAchievements(status) {
        const originalPosition = window.scrollY;
        let previousHeight = 0;
        let stableCount = 0;
        status.textContent = 'Loading achievement list…';

        for (let i = 0; i < 100; i++) {
            window.scrollTo(0, document.body.scrollHeight);
            await sleep(700);
            const currentHeight = document.body.scrollHeight;
            stableCount = currentHeight === previousHeight ? stableCount + 1 : 0;
            previousHeight = currentHeight;
            status.textContent = `Loading achievements… (${i + 1})`;
            if (stableCount >= 4) break;
        }

        window.scrollTo(0, originalPosition);
        await sleep(300);
    }

    function downloadCSV(data) {
        const columns = [
            'app_id', 'achievement_id', 'name', 'description', 'unlocked_at',
            'unlocked_users', 'total_players', 'points', 'completion_percentage',
            'rarity', 'steam_unlock_percentage', 'internal_key', 'api_name',
            'image_url', 'achievement_url', 'raw_text'
        ];

        const escapeCSV = value => '"' + String(value ?? '').replace(/"/g, '""') + '"';
        const rows = [
            columns.map(escapeCSV).join(','),
            ...data.map(item => columns.map(column => escapeCSV(item[column])).join(','))
        ];
        const csv = '\uFEFF' + rows.join('\r\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');

        link.href = url;
        link.download = `SteamHunters_${APP_ID}_Achievements.csv`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
    }

    let isRunning = false;

    async function exportAchievements() {
        if (isRunning) return;
        isRunning = true;
        button.disabled = true;
        button.style.opacity = '0.65';

        try {
            await loadAllAchievements(status);
            const cards = [...document.querySelectorAll('.media[data-view="List"]')];
            const data = cards.map(extractAchievement).filter(Boolean);
            if (!data.length) throw new Error('No achievements found. Make sure this is an achievements list page.');

            downloadCSV(data);
            status.textContent = `Done — exported ${data.length} achievements.`;
            console.log('[SteamHunters] Exported achievements:', data);
        } catch (error) {
            console.error('[SteamHunters] Export failed:', error);
            status.textContent = 'Export failed: ' + error.message;
        } finally {
            isRunning = false;
            button.disabled = false;
            button.style.opacity = '1';
        }
    }

    const panel = document.createElement('div');
    panel.style.cssText = [
        'position:fixed', 'top:20px', 'right:20px', 'z-index:999999',
        'display:flex', 'flex-direction:column', 'align-items:flex-end',
        'gap:7px', 'font-family:Arial,sans-serif'
    ].join(';');

    const status = document.createElement('div');
    status.textContent = `APPID: ${APP_ID}`;
    status.style.cssText = [
        'background:rgba(0,0,0,.82)', 'color:#fff', 'padding:6px 10px',
        'border-radius:5px', 'font-size:12px', 'max-width:280px', 'text-align:right'
    ].join(';');

    const button = document.createElement('button');
    button.id = BUTTON_ID;
    button.type = 'button';
    button.textContent = '↓ Export CSV';
    button.style.cssText = [
        'background:#2878d0', 'color:#fff', 'border:0', 'border-radius:8px',
        'padding:12px 20px', 'font-size:14px', 'font-weight:bold',
        'cursor:pointer', 'box-shadow:0 3px 12px rgba(0,0,0,.3)'
    ].join(';');
    button.addEventListener('click', exportAchievements);

    panel.append(status, button);
    document.body.appendChild(panel);
    console.log(`[SteamHunters] Exporter ready. APPID: ${APP_ID}`);
})();
