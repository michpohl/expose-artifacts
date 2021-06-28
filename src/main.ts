import * as core from '@actions/core'
import * as github from '@actions/github'

declare global {
  interface String {
    isValidEnvVar(): Boolean
  }
}

String.prototype.isValidEnvVar = function () {
  const matches = this.match(/[A-Z0-9_]*/)
  return matches?.length === 1 && matches[0] === this
}
const inputs = {
  token: core.getInput('github-token', {required: true}),
  outputName: core.getInput('output-var-name')
}

async function exposeArtifacts(): Promise<
  {id: number; name: string; url_download: string}[]
> {
  const octokit = github.getOctokit(inputs.token)
  const run_id = github.context.payload.workflow_run.id
  const listWorkflowsArtifacts = await octokit.rest.actions.listWorkflowRunArtifacts(
    {
      owner: github.context.repo.owner,
      repo: github.context.repo.repo,
      run_id
    }
  )
  const artifacts = listWorkflowsArtifacts.data.artifacts
  const suite_id = github.context.payload.workflow_run.check_suite_id
  const owner = github.context.repo.owner
  const repo = github.context.repo.repo
  let artifactsMap = null

  for (const a of artifacts) {
    // eslint-disable-next-line no-console
    console.log(a)
  }
  artifactsMap = artifacts.map(i => {
    // eslint-disable-next-line no-console
    console.log(i)
    return {
      id: i.id,
      name: i.name,
      url_download: `https://github.com/${owner}/${repo}/suites/${suite_id}/artifacts/${i.id}`
    }
  })
  return artifactsMap
}

function createEnvVar(index: number, url: string): void {
  const varName = `${inputs.outputName}_${index}`
  core.exportVariable(varName, url)
  core.info(`Created env var: ${varName} for artifact url: ${url}`)
}

async function run(): Promise<void> {
  try {
    const artifactsMap = await exposeArtifacts()
    for (const a of artifactsMap) {
      createEnvVar(artifactsMap.indexOf(a), a.url_download)
    }
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
