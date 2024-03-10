[Add to Sidekick](https://www.aem.live/tools/sidekick/?project=&from=&giturl=https%3A%2F%2Fgithub.com%2Faemsites%2F888de%2Ftree%2Fmain)

# www.888.de
marketing pages and content to be migrated, not including linked urls and functionality.

## Environments
- Preview: https://main--888de--aemsites.hlx.page/
- Live: https://main--888de--aemsites.hlx.live/
- Customer development URL: https://eds-dev-www.888.de

## Installation

```sh
npm i
```

## Linting

```sh
npm run lint
```

## Local development

1. Create a new repository based on the `aem-boilerplate` template and add a mountpoint in the `fstab.yaml`
1. Add the [AEM Code Sync GitHub App](https://github.com/apps/aem-code-sync) to the repository
1. Install the [AEM CLI](https://github.com/adobe/aem-cli): `npm install -g @adobe/aem-cli`
1. Start AEM Proxy: `aem up` (opens your browser at `http://localhost:3000`)
1. Open the `{repo}` directory in your favorite IDE and start coding :)

Testing a change