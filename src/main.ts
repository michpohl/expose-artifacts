import * as core from '@actions/core'
import * as github from '@actions/github'

const inputs = {
  token: core.getInput('github-token', { required: true })
}


async function exposeArtifacts(): Promise<void> {
  const octokit = github.getOctokit(inputs.token)
  const run_id = github.context.payload.workflow_run.id
  const listWorkflowsArtifacts = await octokit.rest.actions.listWorkflowRunArtifacts(
    {
      owner: github.context.repo.owner,
      repo: github.context.repo.repo,
      run_id: run_id
    }
  )
  const artifacts = listWorkflowsArtifacts.data.artifacts
  const suite_id = github.context.payload.workflow_run.check_suite_id
  const owner = github.context.repo.owner
  const repo = github.context.repo.repo
  for (const a of artifacts) {
    console.log(a)

  }
  artifacts.map(i => {
    console.log(i)
    return {
      id: i.id,
      name: i.name,
      suite_id: suite_id,
      url_download: 'https://github.com/' + owner + '/' + repo + '/suites/' + suite_id + '/artifacts/' + i.id,
    }
  })
}

// console.log('::group::List outputs variables')
// // Generate outputs
// artifacts.forEach((a) => {
//   console.log('::set-output name=' + a.name + '::' + a.url_download)
//   console.log('set-output name=' + a.name + '::' + a.url_download)
// })
// console.log('::endgroup::')


async function run(): Promise<void> {
      try {
        await exposeArtifacts();
      } catch (error) {
        core.setFailed(error.message)
      }
    }

run()
