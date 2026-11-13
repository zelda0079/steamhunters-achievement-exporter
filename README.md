# SteamHunters Achievement Exporter

[English](README.md) | [繁體中文](README.zh-TW.md)

A Tampermonkey userscript that exports achievement data from SteamHunters to a CSV file that can be opened and sorted in Excel.

## Features

- Automatically detects the Steam App ID from the current achievement page URL.
- Supports public and personal achievement pages.
- Adds an **Export CSV** button in the top-right corner; export starts only when clicked.
- Attempts to load additional achievements by scrolling the page before collecting the list.
- Exports achievement metadata, player counts, points, completion percentage, rarity, Steam unlock percentage, image URL, and achievement URL.
- Converts unlock timestamps to YYYY-MM-DD HH:MM:SS (24-hour time) for chronological sorting.
- Includes a UTF-8 BOM for better Excel compatibility.

## Installation

1. Install [Tampermonkey](https://www.tampermonkey.net/).
2. Open the [userscript installation file](https://raw.githubusercontent.com/zelda0079/steamhunters-achievement-exporter/main/steamhunters-achievement-exporter.user.js).
3. Confirm the installation in Tampermonkey.
4. Open a SteamHunters achievement page.
5. Click **↓ Export CSV** in the top-right corner.

## Supported page URL patterns

- https://steamhunters.com/apps/{APPID}/achievements
- https://steamhunters.com/id/{username}/apps/{APPID}/achievements

The App ID is extracted from the current page URL. No manual configuration is required.

## CSV columns

app_id, achievement_id, name, description, unlocked_at, unlocked_users, total_players, points, completion_percentage, rarity, steam_unlock_percentage, internal_key, api_name, image_url, achievement_url, raw_text.

## Notes and limitations

- The script depends on SteamHunters' current page structure; selectors may need updates if the site changes.
- Loading relies on page scrolling to trigger lazy loading. The result depends on SteamHunters loading all achievement cards into the page.
- The script reads data rendered on the page; it does not call a private API or bypass access restrictions.
- Excel should recognize the exported timestamp as a sortable date/time value. If it opens as text, use **Data → Text to Columns**.

## License

MIT
