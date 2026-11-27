# dsh-jianyu-biaoxun-mcp

Connect the **Jianyu Biaoxun (剑鱼标讯)** MCP data service to [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) (DSH). The plugin registers the remote MCP server and contributes a settings tab for the endpoint and API key; saving reconnects the server without restarting DSH.

**中文简介**：把剑鱼标讯的 MCP 数据服务接入 DSH。安装后在 **设置 → 内置插件 → 剑鱼标讯 MCP** 里填写服务地址和 API Key，标讯工具会以 `mcp__jianyu__*` 出现在对话中，保存即热重连。

## Features

- Registers the Jianyu Biaoxun MCP server through DSH's managed MCP service.
- Adds a settings tab (`settings.plugins.tab`) for the endpoint and API key, with masked secret input and revision-fenced writes.
- Saving updates the running configuration in place and re-registers the MCP server; no DSH restart is required.
- Falls back to the `JIANYU_MCP_TOKEN` environment variable when no API key is stored in the profile.
- Registers nothing when no API key is available, so the agent does not see tools that can only answer an authentication error.
- Removing or disabling the bundle removes the MCP server and its tools.

## Requirements

- DSH `>=0.2.2-rc.1 <0.3.0-0`
- Node.js 20 or newer

## Install

From GitHub:

```sh
dsh plugin --profile <profile> add github:vvzula/dsh-jianyu-biaoxun-mcp
```

After an npm release:

```sh
dsh plugin --profile <profile> add dsh-jianyu-biaoxun-mcp
```

You can also add a local checkout through **Plugins → Add plugin**, or with `dsh plugin add file:<absolute path>`.

## Configure

1. Open **Settings → Built-in plugins** and select the **Jianyu Biaoxun MCP** tab.
2. Confirm the endpoint. The default is `https://jyaiopen.jianyu360.cn/mcp`.
3. Enter the Jianyu open-platform API key. It is sent as the `JianYu-Api-Key` request header.
4. Select **Save**. The plugin reconnects immediately.

The API key is stored as a `role('secret')` configuration field in the active profile and is never returned to the browser. It is masked, not encrypted at rest. To keep it out of the profile, leave the field empty and set `JIANYU_MCP_TOKEN` in the environment that launches DSH.

## Tools

Tools appear under the `jianyu` namespace:

- `mcp__jianyu__usage_balance` — account balance and today's usage (free).
- `mcp__jianyu__search_bidding` — search tender and procurement notices.
- `mcp__jianyu__search_proposed_project` — search proposed and in-progress projects.
- `mcp__jianyu__get_bidding_detail` — full detail for one notice (consumes Jianyu coins).
- `mcp__jianyu__get_proposed_project_detail` — full detail for one proposed project (consumes Jianyu coins).
- `mcp__jianyu__usage_calllog` / `mcp__jianyu__usage_daily` — paid-call audit and daily spend.

A first check after saving is to call `mcp__jianyu__usage_balance`; a normal balance response means the endpoint and API key both work.

## Configuration fields

| Field | Default | Description |
| --- | --- | --- |
| `url` | `https://jyaiopen.jianyu360.cn/mcp` | MCP endpoint (streamable HTTP) |
| `token` | empty | Jianyu API key, sent as `JianYu-Api-Key`; masked in the UI |
| `serverName` | `jianyu` | Tool namespace; ordinary field, changing it requires a plugin reload |
| `tokenEnv` | `JIANYU_MCP_TOKEN` | Environment variable read when `token` is empty |
| `startupTimeoutMs` | `30000` | Connection and initial tool-discovery timeout |

## Security and limits

- The API key belongs to the person who created it; the plugin only sends it to the configured endpoint.
- Contact names and phone numbers returned by the service are redacted by the service; the plugin does not reconstruct them.
- Data access scope is determined by the API key's permissions on the Jianyu service.
- One plugin instance registers one MCP server. For multiple Jianyu endpoints, install separate copies with different `serverName` values and row ids.
- The settings tab exists while the plugin is active; if the plugin is removed, its tab and tools disappear.

## Development

The bundle is plain ESM JavaScript and needs no build step:

- `index.js` — Host half: config schema, managed MCP registration, hot re-registration on `loader/volatile-update`.
- `client.js` — browser half: the settings tab over `settings.plugins.tab`.
- `cordis.patch.yml` — bundle row.
- `locale/{en,zh}.json` — plugin-manager display metadata.
- `docs/DETAIL.md` — Chinese detail page.

Syntax check:

```sh
node --check index.js
node --check client.js
```

## License

MIT — see [LICENSE](LICENSE).
