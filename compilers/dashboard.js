const nunjucks = require(require.resolve('content-frontend/compilers/nunjucks.js'))
const fs = require('fs')

const actions = {
  sortByCount (a, b) {
    return b.workflows.total_count - a.workflows.total_count
  },
  mapWorkflowsForTable (repository) {
    repository.workflows = {
      workflow_runs: repository.workflows.workflow_runs.map(item => {
        const tagOptions = {
          text: item.conclusion,
          classes: 'govuk-tag--green'
        }

        if (item.conclusion !== 'success') {
          tagOptions.classes = 'govuk-tag--red'
        }

        return [{
          text: item.created_at
        }, {
          text: item.updated_at
        }, {
          text: `${(new Date(item.updated_at) - new Date(item.created_at)) / 1000} seconds`
        }, {
          html: nunjucks.renderString(`{%- from "govuk/components/tag/macro.njk" import govukTag -%} {{govukTag(${JSON.stringify(tagOptions)})}}`)
        }]
      }).slice(0, 7),
      total_count: repository.workflows.total_count
    }

    return repository
  },
  buildPages () {
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
      data: JSON.parse(fs.readFileSync('./dashboard.json', 'utf8')).sort(actions.sortByCount).map(actions.mapWorkflowsForTable)
    })

    fs.mkdirSync('./docs/', { recursive: true })
    fs.writeFileSync(`./docs/index.html`, render)
  }
}

actions.buildPages()
