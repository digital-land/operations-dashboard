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
      repository.readme = await octokit.repos.getReadme({
        owner: repository.owner.login,
        repo: repository.name
      }).catch(error => {
        if (error.status === 404) {
          return null
        }
      })

      repository.license = await octokit.licenses.getForRepo({
        owner: repository.owner.login,
        repo: repository.name
      }).catch(error => {
        if (error.status === 404) {
          return null
        }
      })

      repository.workflow_files = await octokit.repos.getContents({
        owner: repository.owner.login,
        repo: repository.name,
        path: '.github/workflows'
      }).catch(error => {
        if (error.status === 404) {
          return null
        }
      })

      repository.workflows = await octokit.actions.listRepoWorkflowRuns({
        owner: repository.owner.login,
        repo: repository.name
      })

      return repository
    }))).then(data => fs.writeFileSync('./dashboard.json', JSON.stringify(data)))
  }
};

(async () => actions.getDetails())()
