# operations-dashboard

[![License](https://img.shields.io/github/license/mashape/apistatus.svg)](LICENSE)

A quick overview of the Digital Land organisation on GitHub, including workflow run outcomes.

## Requirements

- [Node.js >= 12](https://nodejs.org/)
- [npm](https://npmjs.com/) (bundled with Node)
- A GitHub token for a user that has read access to the digital-land repositories, set to the `DLB_AUTH_TOKEN` environment variable

## Getting started

Clone the repository recursively and install dependencies:

```
git clone https://github.com/digital-land/operations-dashboard --recursive
cd operations-dashboard
npm install
```

To run it locally, run: `npm run start`

This will expose the `/docs` subdirectory to `localhost:8080/operations-dashboard`.

## Updating the cached results
To update the cached results, run `DLB_AUTH_TOKEN=YourAccessToken npm run fetch` to fetch the latest data from the GitHub API.
