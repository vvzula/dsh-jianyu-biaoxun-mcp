<img src="assets/icon.png" width="88" alt="剑鱼标讯">

# 剑鱼标讯 · DSH 插件

让 AI 直接帮你查剑鱼的招标采购数据。不用开网页、不用一层层筛条件，像问同事一样问它就行。

装好之后，在对话框里说一句「最近一周河南有哪些医疗设备招标」，它就去剑鱼的数据里查，把项目名、地区、金额、采购单位、发布时间整理成列表给你；想看某一条的原文和中标结果，接着问就行。

## 它能帮你做什么

**找商机**
「最近 7 天，广东的弱电安防招标有哪些？」
「这个月有没有 500 万以上的市政工程？」

**摸清甲方**
「这家医院今年招过哪些项目？预算大概多少？」
按采购单位、地区、行业、金额、时间一起筛，比自己翻网站快得多。

**提前一步**
拟在建项目比招标公告早，别人还在等公告的时候，你已经能联系甲方了。
「陕西最近有没有要开工的产业园项目？」

**看原文**
项目概况、采购单位、预算金额、中标结果、公告正文，一处看完，不用来回点。

**算账**
随时问「今天花了多少剑鱼币」，消耗看得见。

## 三步用起来

1. **装插件**：在 DSH 的插件里安装「剑鱼标讯」，或按下面的命令装（需 DSH 0.2.2 及以上）。
2. **填密钥**：打开 **设置 → 内置插件 → 剑鱼标讯**，把剑鱼开放平台给你的密钥粘进去，点保存。地址不用改，默认就指向剑鱼。
3. **直接问**：回到对话框，用你自己的说法问就行，不用记命令。

> 密钥只存在你自己的电脑上，不会回传到网页上；界面上以密码框显示，保存后不再显示原文。

## 几句可以直接抄的问法

- 最近一周，江苏有哪些新能源相关的招标？
- 帮我看一下「XX 县人民医院」今年招过什么，预算多少
- 有没有 1000 万以上、这周刚发布、还没截止的工程项目？
- 这家公司最近中标了哪些项目？
- 浙江未来三个月有哪些要开工的产业园？

## 关于剑鱼币

- 查余额、查消耗记录：**免费**。
- 搜索标讯、搜索拟在建项目、查看详情：**按次消耗剑鱼币**，和你在剑鱼网站上用的是同一个账户。
- 余额不够时会直接告诉你，按提示充值后继续用就行。

## 常见问题

**为什么联系人电话显示「请前往剑鱼官网查看」？**
数据本身做了脱敏，插件不会也不应该去还原它。想看完整联系方式，到剑鱼官网对应项目里查看。

**搜不到想要的东西？**
先放宽条件：关键词短一点、时间放长一点、地区改成整省。销售场景里「医院 设备」「产业园 施工」这类两三个词的组合通常最好用。

**会不会改我剑鱼账号里的数据？**
不会。这个插件只读，只做查询，不发消息、不下单、不改任何数据。

**提示密钥无效或连接不上？**
到剑鱼开放平台确认这个密钥还有效、余额充足，然后把密钥重新粘一次保存。保存后不用重启 DSH。

**能不能几个人共用一个密钥？**
可以，但消耗算在同一个账户上。建议各人用各人的，查账更清楚。

## 安装（给技术同学）

从 GitHub 装：

```sh
dsh plugin --profile <profile> add github:vvzula/dsh-jianyu-biaoxun-mcp
```

发布到 npm 后也可以：

```sh
dsh plugin --profile <profile> add dsh-jianyu-biaoxun-mcp
```

本地目录用 **插件 → 添加插件**，或 `dsh plugin add file:<绝对路径>`。

要求：DSH `>=0.2.2-rc.1 <0.3.0-0`，Node.js 20 以上。

### 配置项

| 字段 | 默认值 | 说明 |
| --- | --- | --- |
| `url` | `https://jyaiopen.jianyu360.cn/mcp` | 数据服务地址，一般不用改 |
| `token` | 空 | 剑鱼密钥，以 `JianYu-Api-Key` 请求头发送，界面掩码显示 |
| `serverName` | `jianyu` | 工具名前缀，改了要重载插件 |
| `tokenEnv` | `JIANYU_MCP_TOKEN` | 密钥留空时读这个环境变量 |
| `startupTimeoutMs` | `30000` | 连接与工具发现的超时 |

不想把密钥写进配置文件，可以不填，改在启动 DSH 的环境里设置 `JIANYU_MCP_TOKEN`。

### 工具清单

- `mcp__jianyu__usage_balance`：余额和今日消耗（免费）
- `mcp__jianyu__search_bidding`：搜招标采购公告
- `mcp__jianyu__search_proposed_project`：搜拟在建项目
- `mcp__jianyu__get_bidding_detail`：单条公告详情（消耗剑鱼币）
- `mcp__jianyu__get_proposed_project_detail`：单个拟建项目详情（消耗剑鱼币）
- `mcp__jianyu__usage_calllog` / `mcp__jianyu__usage_daily`：调用明细与每日消耗（免费）

保存后先让它查一次余额，能返回数字就说明地址和密钥都通了。

### 开发与校验

纯 ESM，不需要构建：

- `index.js`：Host 侧，配置结构 + 托管 MCP 注册 + 热重连
- `client.js`：浏览器侧，设置页
- `cordis.patch.yml`：bundle 行
- `locale/{en,zh}.json`：插件列表里的显示信息
- `docs/DETAIL.md`：插件详情页文案

```sh
node --check index.js
node --check client.js
```

## License

MIT，见 [LICENSE](LICENSE)。

---

**For non-Chinese readers:** this DSH plugin connects the Jianyu Biaoxun tender-data API to DeepSeek Harness. Once your key is saved in **Settings → Built-in plugins → Jianyu Biaoxun**, you can just ask for tenders, buying units and project budgets in the chat. Queries are read-only and consume the account's coin balance.
