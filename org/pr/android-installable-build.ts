import { danger } from "danger"
import { Status } from "github-webhook-event-types"
import fetch from "node-fetch"
import * as url from "url";
import * as path from "path";

const CIRCLECI_TOKEN: string = process.env['CIRCLECI_TOKEN']
const PERIL_BOT_USER_ID: number = parseInt(process.env['PERIL_BOT_USER_ID'], 10)

async function circleCIArtifacts(owner: string, repo: string, buildNumber: number) {
    const url = `https://circleci.com/api/v1.1/project/gh/${owner}/${repo}/${buildNumber}/artifacts?circle-token=${CIRCLECI_TOKEN}`
    const res = await fetch(url)
    if (res.ok) {
      return res.json()
    }
    return []
}

export default async (status: Status) => {
    if (status.state !== "success") {
      return console.log(
        `Not a successful state - got ${status.state}`
      )
    }

    if (status.context !== "ci/circleci: Installable Build" && status.context !== "ci/circleci: Test Android on Device") {
        return console.log(
          `Not an installable build status check - got ${status.context}`
        )
    }

    if (!status.target_url) {
        return console.log(
          'No target_url on the successful status'
        )
    }

    const owner = status.repository.owner.login
    const repo = status.repository.name

    // CircleCI URLs look like https://circleci.com/gh/:org/:repo/12345?some=query'
    // We need to extract the build number
    const urlPath = url.parse(status.target_url).pathname // Gives the /gh/:org/:repo/12345 portion
    const circleCIBuildNumber = +path.parse(urlPath).base

    const artifacts = await circleCIArtifacts(owner, repo, circleCIBuildNumber)
    const apkArtifact = artifacts.find(artifact => artifact.path.endsWith(".apk"));
    if (apkArtifact === undefined) {
      return console.log(
        'No APK artifact found on the build'
      )
    }

    console.log(`Posting comment for ${apkArtifact.path} at ${apkArtifact.url}`)

    const api = danger.github.api

    // See https://github.com/maintainers/early-access-feedback/issues/114 for more context on getting a PR from a SHA
    const repoString = status.repository.full_name
    const searchResponse = await api.search.issuesAndPullRequests({ q: `${status.commit.sha} type:pr is:open repo:${repoString}` })

    // https://developer.github.com/v3/search/#search-issues
    const prsWithCommit = searchResponse.data.items.map((i: any) => i.number) as number[]
    if (prsWithCommit.length === 0) {
      return console.log(
        `No open PR found for this commit ${status.commit.sha}`
      )
    }

    for (const number of prsWithCommit) {
      const pull = await api.pulls.get({ owner, repo, number })
      if (pull.data.head.sha !== status.commit.sha) {
        console.log(`${status.commit.sha} is not the latest commit on PR ${number}, skipping comment`)
        continue
      }

      const commentBody = `You can test the changes on this Pull Request by downloading the APK [here](${apkArtifact.url}).`
      const allComments = await api.issues.listComments({owner, repo, number})

      const apkComment = allComments.data.find(comment => comment.user.id === PERIL_BOT_USER_ID && comment.body.includes("downloading the APK"))
      let commentResult
      if (apkComment !== undefined) {
        commentResult = await api.issues.updateComment({
          owner, 
          repo, 
          comment_id: apkComment.id,
          body: commentBody
        })
      } else {
        commentResult = await api.issues.createComment({
          owner,
          repo,
          number,
          body: commentBody
        })
      }

      console.log(`APK download comment posted to ${commentResult.data.html_url}`)
    }
}
