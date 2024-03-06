# Betflix - Movies & TV Shows Organizer and Streamer

This project aims to create a local media server able to organize existing media, as well as managing torrents.

## Backend
A [node.js](https://nodejs.org/en/about) server using the following libraries:
- **[Express](https://expressjs.com/)**: implements REST API
- **[WebTorrent](https://webtorrent.io/)**: manages torrents
- **[SQLite3](https://www.npmjs.com/package/sqlite3)**: relational database
- **[Bonjour](https://www.npmjs.com/package/bonjour)**: broadcast service

Also makes use of the following APIs:
- **[TMDb](https://www.themoviedb.org/)**: For data on movies, shows, and people
- **[OpenSubtitles.com](https://www.opensubtitles.com/en)**: For on-demand subtitles

## Frontend
Both web and native apps developed with [React](https://react.dev/).
Native Demo:
"docs/video/Native_Demo.mp4
