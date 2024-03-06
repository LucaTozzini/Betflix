# Betflix - Movies & TV Shows Organizer and Streamer

This project aims to create a local media server able to organize existing media, as well as managing torrents.

## Backend
A [node.js](https://nodejs.org/en/about){:target="_blank"} server using the following libraries:
- **[Express](https://expressjs.com/){:target="_blank"}**: implements REST API
- **[WebTorrent](https://webtorrent.io/){:target="_blank"}**: manages torrents
- **[SQLite3](https://www.npmjs.com/package/sqlite3){:target="_blank"}**: relational database
- **[Bonjour](https://www.npmjs.com/package/bonjour){:target="_blank"}**: broadcast service

Also makes use of the following APIs:
- **[TMDb](https://www.themoviedb.org/){:target="_blank"}**: For data on movies, shows, and people
- **[OpenSubtitles.com](https://www.opensubtitles.com/en){:target="_blank"}**: For on-demand subtitles

## Frontend
Both web and native apps developed with [React](https://react.dev/){:target="_blank"}.
