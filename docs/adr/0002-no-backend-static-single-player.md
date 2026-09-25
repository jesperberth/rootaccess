# No backend: static hosting, single-player only

rootaccess deploys as a purely static site (S3 + CloudFront via GitHub Actions). It is strictly single-player with no accounts and no server state; any persistence (settings, best times) lives in the browser via localStorage at most. Multiplayer or leaderboards were rejected as out of scope for the prototype — they would break the zero-infrastructure deployment model that makes the game a shareable link.
