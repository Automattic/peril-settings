# Peril Settings

These are the settings for running [Peril](https://github.com/danger/peril) on repositories in `Automattic`, `simplenote` and `wordpress-mobile`.

## Development Environment

### Using Docker

You can use Docker to work and test this project in the appropriate container.

> **Note**: The right `node` version to use for the container can be found in the `.buildkite/pipeline.yml`

```
docker run -it --rm --init --volume "${PWD}":/workdir --workdir /workdir node:16 /bin/sh -e -c $'yarn install --frozen-lockfile; yarn jest'
```

### Without Docker

 - After cloning the repo, run `yarn install`.
 - Run the tests using `yarn jest`.
