import { danger } from "danger"
import { Status } from "github-webhook-event-types"

// This is a list of the CircleCI statuses to always mark as success
const FORCED_CONTEXTS: string[] = ["ci/circleci: Installable Build/Hold"]

export default async (status: Status) => {
    if (status.state !== "pending") {
      return console.log(
        `Not a pending state - got ${status.state}`
      )
    }

    if (!FORCED_CONTEXTS.includes(status.context)) {
        return console.log(
          `Not a status we want to force success - got ${status.context}`
        )
    }

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
