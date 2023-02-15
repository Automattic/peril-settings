# Peril Settings

These are the settings for running [Peril](https://github.com/danger/peril) on repositories in `Automattic`, `simplenote` and `wordpress-mobile`.

## Development Environment

### Using Docker

You can use Docker to work and test this project in the appropriate container.

```
docker run -it --rm --init --volume "${PWD}":/workdir --workdir /workdir node:10 /bin/sh -e -c $'yarn install --frozen-lockfile; yarn jest'
```

### Without Docker

 - Clone the repo.
 - Ensure you have `node` and `yarn` installed on your machine.
 - Run `yarn install`.
 - Run the tests using `yarn jest`.
