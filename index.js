/**
 * 剑鱼标讯 MCP connector.
 *
 * Registers the 剑鱼标讯 MCP data service as a managed MCP server for the
 * lifetime of this plugin. The service endpoint and access token come from
 * the plugin's configuration; tools surface as `mcp__<serverName>__<tool>`.
 *
 * `url` and `token` are volatile Config fields: DSH serves them through the
 * settings form, and a saved change updates the running references in place
 * (no plugin restart) and emits `loader/volatile-update`, on which this
 * connector re-registers with the new values.
 *
 * @module dsh-jianyu-biaoxun-mcp
 */
import z from '@deepseek-ai/schemastery'

/** Cordis plugin name used by loader diagnostics. */
export const name = 'jianyu-biaoxun-mcp'

/** The MCP manager seam this connector registers into. */
export const inject = ['mcpManager']

/** Default endpoint of the 剑鱼标讯 MCP data service. */
export const DEFAULT_URL = 'https://jyaiopen.jianyu360.cn/mcp'

/** Environment variable read when no literal token is configured. */
export const DEFAULT_TOKEN_ENV = 'JIANYU_MCP_TOKEN'

/** Server-name namespace rule shared with @deepseek-ai/dsh-mcp-manager. */
const SERVER_NAME_PATTERN = /^[A-Za-z0-9_-]{1,32}$/

/** Plugin configuration. */
export const Config = z.object({
  url: z.string().default(DEFAULT_URL).description('MCP 服务地址（streamable-http，例如 https://jyaiopen.jianyu360.cn/mcp）').volatile(),
  token: z.string().role('secret').description('剑鱼开放平台 API Key，作为 JianYu-Api-Key 请求头发送；留空时读取 tokenEnv 指定的环境变量，保存后界面会掩码显示').volatile(),
  serverName: z.string().default('jianyu').description('工具命名空间，工具将显示为 mcp__<名称>__<工具名>；仅允许字母、数字、下划线和短横线'),
  tokenEnv: z.string().role('credential-ref').default(DEFAULT_TOKEN_ENV).description('令牌留空时读取的环境变量名'),
  startupTimeoutMs: z.number().min(1).default(30000).description('连接与初始工具发现的超时（毫秒）'),
})

/**
 * Read and validate the current configuration.
 *
 * `url` and `token` are volatile references, so every call takes their latest
 * committed value; the other fields are ordinary resolved values.
 *
 * @param {object} config - resolved plugin configuration.
 * @returns {{ url: string, serverName: string, token: string, startupTimeoutMs: number }} validated connection facts.
 * @throws {Error} when the endpoint or server name is unusable.
 */
function resolveSpec(config) {
  const url = String(config.url.get() ?? '').trim()
  if (url === '') throw new Error('剑鱼标讯 MCP：请先填写服务地址（url）')
  let parsed
  try {
    parsed = new URL(url)
  } catch {
    throw new Error(`剑鱼标讯 MCP：服务地址不是合法 URL：${url}`)
  }
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw new Error('剑鱼标讯 MCP：服务地址只支持 http/https')
  }

  const serverName = String(config.serverName ?? '').trim()
  if (!SERVER_NAME_PATTERN.test(serverName)) {
    throw new Error('剑鱼标讯 MCP：serverName 只允许 1-32 位字母、数字、下划线或短横线')
  }

  const literal = String(config.token.get() ?? '').trim()
  const envName = String(config.tokenEnv ?? '').trim()
  const fromEnv = envName !== '' ? String(process.env[envName] ?? '').trim() : ''

  return {
    url,
    serverName,
    token: literal !== '' ? literal : fromEnv,
    startupTimeoutMs: Number(config.startupTimeoutMs) || 30_000,
  }
}

/**
 * Register the configured MCP server while this plugin is active.
 *
 * The registration is replaced whenever a volatile field changes; when no
 * token is available it is removed and a warning is logged, so the agent does
 * not see tools that can only answer `未授权`.
 *
 * @param {import('@deepseek-ai/cordis').Context} ctx - plugin context.
 * @param {object} config - resolved plugin configuration.
 */
export function apply(ctx, config) {
  let removeRegistration

  /** Drop the current managed server, if any. */
  function stopRegistration() {
    if (removeRegistration === undefined) return
    const remove = removeRegistration
    removeRegistration = undefined
    remove()
  }

  /** Rebuild the managed server from the latest committed configuration. */
  function registerServer() {
    // Validate before dropping a working registration so one bad edit does not
    // take the healthy connection down.
    const spec = resolveSpec(config)
    stopRegistration()
    if (spec.token === '') {
      ctx.logger.warn('剑鱼标讯 MCP：未配置访问令牌，暂不注册 MCP 服务器；请在内置插件页的「剑鱼标讯 MCP」标签中填写令牌。')
      return
    }
    removeRegistration = ctx.mcpManager.register(spec.serverName, {
      transport: 'streamable-http',
      url: spec.url,
      headers: { 'JianYu-Api-Key': spec.token },
      startupTimeoutMs: spec.startupTimeoutMs,
    })
  }

  ctx.effect(() => {
    registerServer()
    const off = ctx.on('loader/volatile-update', () => {
      try {
        registerServer()
      } catch (error) {
        ctx.logger.error(error)
      }
    })
    return () => {
      off()
      stopRegistration()
    }
  }, 'jianyu-biaoxun-mcp: managed MCP server')

  // This plugin renders its own configuration page, so Settings does not
  // generate one from the schema. The child fiber keeps the plugin working on
  // hosts without a settings service.
  ctx.inject(['settings'], (child) => {
    child.effect(() => child.settings.configure({ auto: false }, ctx.fiber), 'jianyu-biaoxun-mcp: settings policy')
  })
}
