# Expose links to a workflow's artifacts as env vars

This action checks if a previously run workflow has uploaded any artifacts. If artifacts are found, it exposes the links to those artifacts as environment variables that can be used in subsequent steps.
It can filter the artifacts by a submitted string that must be contained, and will use a provided name for the published variables.

This workflow needs to be triggered by the `workflow_run`trigger, since it needs a reference to another workflow. This is because the links to uploaded artifacts are only available **after** a workflow has completed, so if you want to fetch and use them, you have to do it in a second workflow.

Example:

```
name: Post artifact link
on:
  workflow_run:
    workflows: ["build"]
    types:
      - "completed"

jobs:
  post-artifacts:
    runs-on: ubuntu-latest
    steps:
      # exposes urls of found artifacts as env vars, if their name contains "release-build"
      - name: Expose artifacts to env
        id: new
        uses: "michpohl/expose-artifacts@v1.0.0"
        with:
          github-token: "${{ secrets.GITHUB_TOKEN }}"
          output-var-name: "RELEASE_ARTIFACT"
          contains-string: "release-build"
      - name: Use env var
      # Do what you need to do with the found links

```
For every artifact found with a name containing the string `release-build`, an indexed env var will be created. So if there were for example the files `release-build.jar`and `release-build-report.txt`, you'd end up with two env vars named `RELEASE_ARTIFACT_0` and `RELEASE_ARTIFACT_1`
To help you identify the correct files, the step will print messages telling you what's what:
```
    Created env var: RELEASE_ARTIFACT_0 for artifact named: release-build.jar with url: https://github.com/[repo_owner]/[repo]/suites/[suite_id]/artifacts/[artifact_id]
```
