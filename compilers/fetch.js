const fs = require('fs')
const Octokit = require('@octokit/rest').Octokit
const octokit = new Octokit({
  auth: process.env.DLB_BOT_TOKEN
})

const actions = {
  async getDetails () {
    return octokit.paginate(octokit.repos.listForOrg, {
      org: 'digital-land',
      type: 'public'
    }).then(data => Promise.all(data.map(async repository => {
      const defaultOptions = {
        owner: repository.owner.login,
        repo: repository.name
      }

      // Get README
      repository.readme = await octokit.repos.getReadme(defaultOptions).catch(error => {
        if (error.status !== 404) {
          console.log(error)
        }
        return null
      })

      // Get LICENSE
      repository.license = await octokit.licenses.getForRepo(defaultOptions).catch(error => {
        if (error.status !== 404) {
          console.log(error)
        }
        return null
      })

      // Get files for a workflow
      const workflowOptions = defaultOptions
      workflowOptions.path = '.github/workflows'
      repository.workflow_files = await octokit.repos.getContent(workflowOptions).catch(error => {
        if (error.status !== 404) {
          console.log(error)
        }
        return null
      })
      delete workflowOptions.path

      // Get workflows
      repository.workflows = await octokit.actions.listWorkflowRunsForRepo(defaultOptions).catch(error => {
        if (error.status !== 404) {
          console.log(error)
        }
        return null
      })

      // Get pages settings
      repository.pages = null
      if (repository.has_pages) {
        repository.pages = await octokit.repos.getPages(defaultOptions).catch(error => {
          if (error.status !== 200) {
            console.log(error)
            return null
          }
        })
      }

      // Get top level pages
      repository.pages_files = null
      if (repository.has_pages) {
        const pagesOptions = defaultOptions
        if (repository.pages.data.source.path.length > 1) {
          pagesOptions.path = repository.pages.data.source.path
        }

        repository.pages_files = await octokit.repos.getContent(pagesOptions).catch(error => {
          if (error.status !== 200) {
            console.log('pages_files', error)
            console.log('options', pagesOptions)
            return null
          }
        })
        delete pagesOptions.path
      }

      return repository
    }))).then(data => fs.writeFileSync('./dashboard.json', JSON.stringify(data)))
  }
};

(async () => actions.getDetails())()
