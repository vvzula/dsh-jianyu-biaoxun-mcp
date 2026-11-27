# Publishing this plugin

This directory is already shaped for publication. The remaining steps need your GitHub account and repository name.

## 1. Pick the GitHub owner and repository name

The package name is **`dsh-jianyu-biaoxun-mcp`** (checked available on npm on 2026-11-27). Create a **public** GitHub repository with the same name:

```text
https://github.com/<owner>/dsh-jianyu-biaoxun-mcp
```

Replace every `OWNER` placeholder in `package.json` and `README.md` with your GitHub owner name:

```powershell
$owner = 'your-github-name'
Get-ChildItem -Path . -Recurse -File -Include package.json,README.md |
  ForEach-Object { (Get-Content $_ -Raw).Replace('OWNER', $owner) | Set-Content $_ -NoNewline -Encoding UTF8 }
```

## 2. Push the repository

```sh
git init
git add .
git commit -m "Initial release"
git branch -M main
git remote add origin https://github.com/<owner>/dsh-jianyu-biaoxun-mcp.git
git push -u origin main
```

Do not commit `node_modules`, a profile's `cordis.patch.yml`, or any API key. The bundle's own `cordis.patch.yml` contains only the default endpoint and namespace.

After pushing, add the **`dsh-plugin`** topic to the repository (About → Topics). The listing CI requires it.

## 3. Wait one day

The submission gate rejects repositories younger than **1 day**. Creating the repository today and opening the PR tomorrow is the safe path.

## 4. Submit to `awesome-dsh-plugin`

The market (`dshmarket`) reads its catalog from [awesome-dsh-plugin](https://github.com/awesome-dsh-plugin/awesome-dsh-plugin). Do **not** open a PR in the market repository itself.

Fork the list repository, then add exactly one file:

```text
data/plugins/<owner>__dsh-jianyu-biaoxun-mcp.yml
```

Content (replace `<owner>`):

```yaml
url: https://github.com/<owner>/dsh-jianyu-biaoxun-mcp
name: <owner>/dsh-jianyu-biaoxun-mcp
category: tools
description:
  en: Connects the Jianyu Biaoxun MCP data service to DSH with an in-panel endpoint and API-key form.
  zh: 把剑鱼标讯的 MCP 数据服务接入 DSH，并在设置页内填写服务地址与 API Key。
icon: https://raw.githubusercontent.com/<owner>/dsh-jianyu-biaoxun-mcp/main/assets/icon-180.png
```

Rules that matter here:

- `description.en` is required, one line, accurate, no marketing.
- `icon` must be a GitHub-hosted **raster** image (png/jpg/jpeg/webp); this repo ships `assets/icon-180.png`.
- `category` is one of the list's values; `tools` fits an MCP connector.
- Do not write an `npm:` field in the YAML; the npm mapping is picked up automatically.
- One PR can add at most 3 entries.
- If the description contains `: `, quote the YAML value.

Open the PR, wait for CI, and fix anything it reports on the same branch. After merge, the site and the market rebuild usually within a day.

## 5. npm release (optional)

Publishing to npm is optional and does not affect listing. It makes installs faster and lets the market show a download count.

```sh
npm publish --access public
```

Before publishing:

- `package.json` has no `private` field.
- The package name `dsh-jianyu-biaoxun-mcp` is available (checked 2026-11-27).
- `repository` points to the GitHub repository you listed; without this the npm package is not linked to the entry.
- `peerDependencies` keep `@deepseek-ai/schemastery` outside the package; DSH's profile install supplies it.

After `npm publish`, verify the artifact rather than trusting the command output:

```sh
curl https://registry.npmjs.org/dsh-jianyu-biaoxun-mcp
```

Wait until `dist-tags.latest` matches the version and `dist.tarball` downloads. A brand-new npm name can briefly expose a placeholder or a missing tarball, and the China mirror can keep a stale `latest` for a few minutes. Install once from a clean profile before submitting.

## 6. Local verification before submission

```sh
node --check index.js
node --check client.js
```

Checklist:

- [ ] `package.json` has `dsh.bundle.patch` and `dsh.client.platform`
- [ ] `cordis.patch.yml` row `name` equals the package name
- [ ] Repository is public and at least 1 day old
- [ ] `dsh-plugin` topic is present
- [ ] No API key, profile file, or `node_modules` in the repository
- [ ] `assets/icon-180.png` opens and is a square raster image
- [ ] README install command uses the real owner/repo
- [ ] The plugin installs and the settings tab opens once before submitting
