function decodeXml(text = "") {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function extractPlaylistId(url = "") {
  try {
    const parsed = new URL(url);
    return parsed.searchParams.get("list");
  } catch (e) {
    return null;
  }
}

function pickTag(block, tagName) {
  const regex = new RegExp(`<${tagName}>([\\s\\S]*?)</${tagName}>`);
  const match = block.match(regex);
  return match ? decodeXml(match[1].trim()) : null;
}

async function fetchPlaylistItems(playlistId) {
  if (!playlistId) return [];

  try {
    const response = await fetch(`https://www.youtube.com/feeds/videos.xml?playlist_id=${playlistId}`);
    if (!response.ok) return [];

    const xml = await response.text();
    const items = [];
    const entryRegex = /<entry>([\s\S]*?)<\/entry>/g;
    let match = entryRegex.exec(xml);

    while (match) {
      const entry = match[1];
      const youtubeVideoId = pickTag(entry, "yt:videoId");
      const title = pickTag(entry, "title");

      if (youtubeVideoId && title) {
        items.push({
          youtube_video_id: youtubeVideoId,
          title,
          youtube_url: `https://www.youtube.com/watch?v=${youtubeVideoId}&list=${playlistId}`,
        });
      }

      match = entryRegex.exec(xml);
    }

    return items.map((item, index) => ({ ...item, order_index: index + 1 }));
  } catch (e) {
    return [];
  }
}

module.exports = { extractPlaylistId, fetchPlaylistItems };
