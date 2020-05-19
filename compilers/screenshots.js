const fs = require('fs')
const data = JSON.parse(fs.readFileSync('./dashboard.json', 'utf8'))
const puppeteer = require('puppeteer')

const actions = {
  async start () {
    const browser = await puppeteer.launch()
    const page = await browser.newPage()

    await page.setViewport({
      width: 1920,
      height: 1080
    })

    for (const repository of data) {
      if (repository.has_pages) {
        const url = repository.pages.data.html_url
        const sanitisedUrl = (`${url}index.html`).replace('https://digital-land.github.io/', '').replace('/', '-')
        await page.goto(url)
        await page.screenshot({
          path: `./docs/screenshots/${sanitisedUrl}.png`
        })
      }
    }

    await browser.close()
  }
};

(async () => {
  await actions.start()
})()
