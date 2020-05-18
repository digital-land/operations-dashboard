const Octokit = require('@octokit/rest').Octokit
const octokit = new Octokit({
  auth: process.env.DLB_AUTH_TOKEN
})

const actions = {
  async getDetails () {
    return octokit.paginate(octokit.repos.listForOrg, {
      org: 'digital-land',
      type: 'public'
    }).then(data => Promise.all(data.map(async repository => {
      const workflows = await octokit.actions.listRepoWorkflowRuns({
        owner: repository.owner.login,
        repo: repository.name
      })

      return {
        name: repository.name,
        workflows: workflows.data
      }
    }))).then(data => {
      const fs = require('fs')
      return fs.writeFileSync('./dashboard.json', JSON.stringify(data))
    })
  }
};

(async () => actions.getDetails())()
