const nunjucks = require(require.resolve('content-frontend/compilers/nunjucks.js'))
const fs = require('fs')
const data = JSON.parse(fs.readFileSync('./dashboard.json', 'utf8'))

const actions = {
  generateTag (html, classes) {
    const jsonString = JSON.stringify({
      html: html,
      classes: classes
    })

    const tag = `
    {%- from "govuk/components/tag/macro.njk" import govukTag -%}
    {{ govukTag(${jsonString}) }}
    `

    return nunjucks.renderString(tag)
  },
  link (url, text) {
    return `<a href="${url}" class="govuk-link">${text}</a>`
  },
  sortWorkflowsByCount (a, b) {
    return b.workflows.data.total_count - a.workflows.data.total_count
  },
  mapWorkflowsForTable (repository) {
    repository.workflows.data.workflow_runs = repository.workflows.data.workflow_runs.map(item => {
      let tagClass = 'govuk-tag--green'

      if (item.conclusion !== 'success') {
        tagClass = 'govuk-tag--red'
      }

      if (item.conclusion === null && item.status === 'in_progress') {
        tagClass = 'govuk-tag--yellow'
        item.conclusion = 'In Progress'
      }

      return [{
        html: actions.link(item.html_url, item.id)
      }, {
        text: item.created_at
      }, {
        text: item.updated_at
      }, {
        text: `${(new Date(item.updated_at) - new Date(item.created_at)) / 1000} seconds`
      }, {
        html: actions.generateTag(item.conclusion, tagClass)
      }]
    }).slice(0, 10)

    return repository
  },
  mapRepositoriesForTable (repository) {
    const hasLicense = !!((repository.license && repository.license.status === 200))
    const hasReadme = !!((repository.readme && repository.readme.status === 200))
    const hasWorkflows = !!((repository.workflow_files && repository.workflow_files.status === 200))
    const hasPages = !!((repository.pages && repository.pages.status === 200))

    return [{
      html: actions.link(repository.html_url, repository.name)
    }, {
      html: hasReadme ? actions.link(repository.readme.data.html_url, 'yes') : 'no'
    }, {
      html: hasLicense ? actions.link(repository.license.data.html_url, repository.license.data.license.name) : 'no'
    }, {
      html: hasWorkflows ? actions.link(`workflows#${repository.name}`, 'yes') : 'no'
    }, {
      html: hasPages ? actions.link(`pages#${repository.name}`, 'yes') : 'no'
    }]
  },
  buildIndex () {
    const render = nunjucks.render('dashboard.njk', {
      params: {
        breadcrumbs: [{
          text: 'Digital Land',
          href: '/'
        }, {
          text: 'Operations Dashboard'
        }],
        captionHeading: false
      },
      assetPath: '/content-frontend/assets',
      content: 'A quick overview of the digital-land organisation on GitHub, including workflow successes.',
      tableHead: [{
        text: 'Repository'
      }, {
        text: 'README'
      }, {
        text: 'LICENSE'
      }, {
        text: 'Workflows'
      }, {
        text: 'Pages'
      }],
      tableRows: data.map(actions.mapRepositoriesForTable),
      type: 'index'
    })

    fs.mkdirSync('./docs/', { recursive: true })
    fs.writeFileSync(`./docs/index.html`, render)
  },
  buildWorkflowPage () {
    const render = nunjucks.render('dashboard.njk', {
      params: {
        breadcrumbs: [{
          text: 'Digital Land',
          href: '/'
        }, {
          text: 'Operations Dashboard',
          href: '..'
        }, {
          text: 'Workflows'
        }],
        captionHeading: 'Operations Dashboard'
      },
      assetPath: '/content-frontend/assets',
      content: 'A quick overview of the digital-land repositories and their workflow outcomes.',
      tableHead: [{
        text: 'Run ID'
      }, {
        text: 'Started at'
      }, {
        text: 'Ended at'
      }, {
        text: 'Elapsed'
      }, {
        text: 'Outcome'
      }],
      data: data.map(actions.mapWorkflowsForTable).sort(actions.sortWorkflowsByCount),
      type: 'drilldown'
    })

    fs.mkdirSync('./docs/workflows', { recursive: true })
    return fs.writeFileSync(`./docs/workflows/index.html`, render)
  },
  buildPagesPage () {
    const render = nunjucks.render('dashboard.njk', {
      params: {
        breadcrumbs: [{
          text: 'Digital Land',
          href: '/'
        }, {
          text: 'Operations Dashboard',
          href: '..'
        }, {
          text: 'Pages'
        }],
        captionHeading: 'Operations Dashboard'
      },
      assetPath: '/content-frontend/assets',
      content: 'A quick overview of the digital-land repositories and their GitHub Pages.',
      data: data.map(item => {
        item.screenshot_url = item.pages ? (`${item.pages.data.html_url}index.html.png`).replace('https://digital-land.github.io/', '').replace('/', '-') : null

        if (item.pages_files) {
          item.pages_files = item.pages_files.data.map(file => `<li><a href="${item.pages.data.html_url}${file.name}" class="govuk-link">${item.pages.data.html_url.replace('https://digital-land.github.io', '')}${file.name}</a></li>`).join('')
        }

        return item
      })
    })

    fs.mkdirSync('./docs/pages', { recursive: true })
    return fs.writeFileSync('./docs/pages/index.html', render)
  }
}

actions.buildIndex()
actions.buildWorkflowPage()
actions.buildPagesPage()
