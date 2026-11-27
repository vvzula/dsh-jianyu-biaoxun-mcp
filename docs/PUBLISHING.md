# 发布清单

仓库地址已定：`https://github.com/vvzula/dsh-jianyu-biaoxun-mcp`（public）。包名 `dsh-jianyu-biaoxun-mcp`（2026-11-27 查过 npm 未被占用）。

## 1. 建仓库并推送

在 GitHub 网页新建一个 **public** 仓库，名字 `dsh-jianyu-biaoxun-mcp`，**不要**勾选 README / .gitignore / license 初始化（本地已有提交）。建好后：

```sh
git push -u origin main
```

推完在仓库 About → Topics 里加 **`dsh-plugin`**，收录 CI 会检查这个。

不要提交 `node_modules`、profile 配置、任何密钥。`cordis.patch.yml` 里只有默认地址和命名空间。

## 2. 等满 1 天

收录 CI 会拒绝创建不满 1 天的仓库。今天建、明天提 PR 最稳。

## 3. 提交到 awesome-dsh-plugin

市场（`dshmarket`）的目录来自 [awesome-dsh-plugin](https://github.com/awesome-dsh-plugin/awesome-dsh-plugin)，**不要**给市场仓库本身提条目。

Fork 后只新增一个文件：

```text
data/plugins/vvzula__dsh-jianyu-biaoxun-mcp.yml
```

内容直接复制 [`docs/market-entry.yml`](market-entry.yml)：

```yaml
url: https://github.com/vvzula/dsh-jianyu-biaoxun-mcp
name: vvzula/dsh-jianyu-biaoxun-mcp
category: tools
description:
  en: Ask for tender notices, buying units and budgets right in the chat, using Jianyu Biaoxun tender data.
  zh: 在对话框里直接问招标采购信息：找项目、看预算、查采购单位，数据来自剑鱼标讯。
icon: https://raw.githubusercontent.com/vvzula/dsh-jianyu-biaoxun-mcp/main/assets/icon-180.png
```

几条硬规则：

- `description.en` 必填，单行，平实准确；`description.zh` 可选。
- `icon` 必须是 GitHub 托管的**位图**（png/jpg/jpeg/webp），不能用 svg；本仓库用 `assets/icon-180.png`（180×180）。
- 不要写 `npm:` 字段，npm 映射由 registry 自动识别。
- 一个 PR 最多 3 条。
- 值里出现 `: `（英文冒号加空格）时必须加引号；现在的中文值是全角冒号，不用引号。

提 PR 后等 CI，报错就在同一分支改。合并后站点和市场通常一天内刷新。

## 4. npm 发布（可选）

不影响收录，只是装得更快、市场能显示下载量。

```sh
npm publish --access public
```

发布前确认：

- `package.json` 没有 `private`
- `repository` 指向上面这个仓库
- `peerDependencies` 里 `@deepseek-ai/schemastery` 不进包体，由 DSH 的 profile 安装提供

发完以 registry 为准，不要只看命令输出：

```sh
curl https://registry.npmjs.org/dsh-jianyu-biaoxun-mcp
```

等 `dist-tags.latest` 等于当前版本、`dist.tarball` 能下下来，再在干净 profile 里装一次。

## 5. 提交前自检

```sh
node --check index.js
node --check client.js
npm pack --dry-run
```

- [ ] `package.json` 有 `dsh.bundle.patch` 和 `dsh.client.platform`
- [ ] `cordis.patch.yml` 的 `name` 等于包名
- [ ] 仓库 public、满 1 天、有 `dsh-plugin` topic
- [ ] 仓库里没有密钥、profile 文件、`node_modules`
- [ ] `assets/icon-180.png` 是 180×180 位图，能正常打开
- [ ] README、`docs/DETAIL.md`、`locale/*.json`、`client.js` 里的文案是给销售看的白话
- [ ] 插件装一次，设置页能打开
