import { danger } from "danger"
import { Status } from "github-webhook-event-types"

const PERIL_BOT_USER_ID: number = parseInt(process.env['PERIL_BOT_USER_ID'], 10)

// This is a list of the CircleCI statuses to process
const HOLD_CONTEXTS: string[] = ["ci/circleci: gutenberg-mobile/Optional UI Tests "]

async function markStatusAsSuccess(status) {
  console.log(`Updating ${status.context} state to be success`)

  const owner = status.repository.owner.login
  const repo = status.repository.name

  const api = danger.github.api
  await api.repos.createStatus({
    owner: owner,
    repo: repo,
    context: status.context,
    description: status.description,
    sha: status.sha,
    state: "success",
    target_url: status.target_url
  })
}

async function getPRsWithStatus(status) {
  const api = danger.github.api

  // See https://github.com/maintainers/early-access-feedback/issues/114 for more context on getting a PR from a SHA
  const repoString = status.repository.full_name
  const searchResponse = await api.search.issuesAndPullRequests({ q: `${status.commit.sha} type:pr is:open repo:${repoString}` })

  // https://developer.github.com/v3/search/#search-issues
  const prsWithCommit = searchResponse.data.items.map((i: any) => i.number) as number[]
  if (prsWithCommit.length === 0) {
    console.log(`No open PR found for this commit ${status.commit.sha}`)
    return []
  }
  return prsWithCommit
}

export async function createOrUpdateComment(status, message) {
  const api = danger.github.api
  const owner = status.repository.owner.login
  const repo = status.repository.name

  // Add a prefix to our comment so we can easily find/update it later.
  const commentPrefix = "<!--- Optional Tests Comment --->"
  const commentBody = `${commentPrefix}\n${message}`

  // Since a commit can be on more than one PR, find all PRs that have this commit
  const prsWithStatus = await getPRsWithStatus(status)
  for (const number of prsWithStatus) {
    const pull = await api.pulls.get({ owner, repo, number })
    if (pull.data.head.sha !== status.commit.sha) {
      console.log(`${status.commit.sha} is not the latest commit on PR ${number}, skipping comment`)
      continue
    }

    const allComments = await api.issues.listComments({owner, repo, number})

    const existingComment = allComments.data.find(comment => comment.user.id === PERIL_BOT_USER_ID && comment.body.includes(commentPrefix))
    let commentResult
    if (existingComment !== undefined) {
      commentResult = await api.issues.updateComment({
        owner,
        repo,
        comment_id: existingComment.id,
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

    console.log(`Optional tests comment posted to ${commentResult.data.html_url}`)
  }
}

export default async (status: Status) => {
  if (status.state == "pending" && HOLD_CONTEXTS.includes(status.context)) {
    await markStatusAsSuccess(status)
    await createOrUpdateComment(status, `You can trigger optional full suite of Android and iOS UI tests for these changes by visiting CircleCI [here](${status.target_url}).`)
  } else {
    return console.log(
        `Not a status we want to process for optional tests - got '${status.context}' (${status.state})`
    )
  }
}
