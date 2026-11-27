/**
 * 剑鱼标讯 MCP — settings tab.
 *
 * Contributes one tab to Settings → 内置插件 (`settings.plugins.tab`) that
 * edits the two volatile fields of the `jianyu-biaoxun-mcp` profile entry:
 * the service URL and the Bearer token. Values live in the shared Host
 * settings document: `configForms.get(entryId)` supplies a revisioned
 * snapshot, and the Host validates and persists writes made through
 * `mutate`/`unset`. A successful write updates the running plugin in place,
 * so the connector re-registers the MCP server without a restart.
 *
 * The tab exists only while the Host serves that entry, so disabling the
 * plugin removes it automatically.
 *
 * @module dsh-jianyu-biaoxun-mcp/client
 */
window.__ModuleLoader__.load({
  id: 'dsh-jianyu-biaoxun-mcp',
  factory(require) {
    const React = require('react')
    const h = React.createElement

    /** Profile entry id; the settings namespace is the profile entry id. */
    const ENTRY = 'jianyu-biaoxun-mcp'
    /** Dictionary namespace owned by this client module. */
    const NS = 'jianyuMcp'

    const zh = {
      tab: '剑鱼标讯 MCP',
      title: '剑鱼标讯 MCP 连接',
      description: '填写 MCP 服务地址和访问令牌后，标讯数据工具会以 mcp__jianyu__* 出现在对话中。保存后插件会立即重连，无需重启。',
      url: '服务地址',
      urlHint: '默认指向剑鱼开放平台 jyaiopen.jianyu360.cn；如使用其他剑鱼标讯 MCP 地址，直接修改这里。',
      token: 'API Key',
      tokenPlaceholder: '输入 JianYu API Key',
      tokenConfigured: 'API Key 已保存，不会回显。留空表示保持不变。',
      tokenMissing: '尚未保存 API Key。也可以不填这里，改为设置环境变量 JIANYU_MCP_TOKEN。',
      save: '保存',
      saving: '保存中…',
      clearToken: '清除已保存的令牌',
      noChanges: '没有需要保存的修改。',
      saved: '已保存，正在重新连接 MCP 服务。',
      savedNoToken: '已保存。填写访问令牌后才会连接 MCP 服务。',
      rejected: '保存被拒绝：配置可能已被其他页面修改，请重试。',
      failed: '保存失败：',
      readOnly: '当前部署的设置为只读。',
      loading: '正在读取配置…',
      unavailable: '插件当前未加载，暂时无法配置。',
      tokenCleared: '令牌已清除，MCP 服务已停止连接。',
    }

    const en = {
      tab: 'Jianyu Biaoxun MCP',
      title: 'Jianyu Biaoxun MCP connection',
      description: 'Enter the MCP endpoint and access token; tendering-data tools appear as mcp__jianyu__*. Saving reconnects the plugin immediately, with no restart.',
      url: 'Endpoint',
      urlHint: 'Defaults to the Jianyu open platform (jyaiopen.jianyu360.cn); change it for another Jianyu Biaoxun MCP endpoint.',
      token: 'API Key',
      tokenPlaceholder: 'Enter JianYu API Key',
      tokenConfigured: 'An API key is saved and is never shown again. Leave blank to keep it.',
      tokenMissing: 'No API key is saved yet. You may also leave this blank and set JIANYU_MCP_TOKEN instead.',
      save: 'Save',
      saving: 'Saving…',
      clearToken: 'Clear saved token',
      noChanges: 'There are no changes to save.',
      saved: 'Saved; reconnecting the MCP service.',
      savedNoToken: 'Saved. The MCP service connects once an access token is entered.',
      rejected: 'The save was refused: the configuration may have changed elsewhere. Try again.',
      failed: 'Save failed: ',
      readOnly: 'This deployment stores settings read-only.',
      loading: 'Reading configuration…',
      unavailable: 'This plugin is not loaded, so it cannot be configured right now.',
      tokenCleared: 'Token cleared; the MCP connection has been stopped.',
    }

    /** Shared inline styles that inherit the page's theme. */
    const fieldStyle = {
      width: '100%',
      boxSizing: 'border-box',
      padding: '9px 11px',
      borderRadius: '8px',
      border: '1px solid rgba(127, 127, 127, 0.45)',
      background: 'transparent',
      color: 'inherit',
      font: 'inherit',
      outline: 'none',
    }
    const buttonStyle = {
      padding: '8px 16px',
      borderRadius: '8px',
      border: '1px solid rgba(127, 127, 127, 0.45)',
      background: 'transparent',
      color: 'inherit',
      font: 'inherit',
      cursor: 'pointer',
    }
    const primaryStyle = {
      ...buttonStyle,
      background: 'rgba(64, 128, 255, 0.14)',
      borderColor: 'rgba(64, 128, 255, 0.55)',
    }
    const mutedStyle = { margin: '6px 0 0', opacity: 0.7, fontSize: '13px', lineHeight: 1.5 }
    const labelStyle = { display: 'block', marginBottom: '7px', fontWeight: 600 }
    const groupStyle = { display: 'flex', flexDirection: 'column', gap: '6px' }

    /**
     * Read whether the Host currently holds a token for this entry.
     * @param {object} describe - the shared settings describe face.
     * @returns {boolean} whether the `token` secret slot is set.
     */
    function tokenIsConfigured(describe) {
      const view = describe.getSnapshot().view
      const namespace = view?.namespaces.find((row) => row.ns === ENTRY)
      const slot = namespace?.secrets?.find((secret) => secret.path.length === 1 && secret.path[0] === 'token')
      return slot?.set === true
    }

    /**
     * Subscribe a component to one configuration form's snapshot.
     * @param {object} form - the shared ConfigForm for this entry.
     * @returns {object} the latest form snapshot.
     */
    function useConfigSnapshot(form) {
      const [snapshot, setSnapshot] = React.useState(() => form.getSnapshot())
      React.useEffect(() => {
        const sync = () => { setSnapshot(form.getSnapshot()) }
        sync()
        return form.subscribe(sync)
      }, [form])
      return snapshot
    }

    /**
     * Subscribe a component to the token slot's configured state.
     * @param {object} describe - the shared settings describe face.
     * @returns {boolean} whether a token is stored.
     */
    function useTokenConfigured(describe) {
      const [configured, setConfigured] = React.useState(() => tokenIsConfigured(describe))
      React.useEffect(() => {
        const sync = () => { setConfigured(tokenIsConfigured(describe)) }
        sync()
        return describe.subscribe(sync)
      }, [describe])
      return configured
    }

    /**
     * Render one labelled field.
     * @param {{ label: string, hint?: string, id?: string, control: object }} props - field copy and control.
     * @returns {object} the field element.
     */
    function Field(props) {
      return h('div', null,
        props.id === undefined
          ? h('span', { style: labelStyle }, props.label)
          : h('label', { style: labelStyle, htmlFor: props.id }, props.label),
        props.control,
        props.hint === undefined ? null : h('p', { style: mutedStyle }, props.hint),
      )
    }

    return {
      inject: ['slots', 'locale', 'configForms'],
      apply(ctx) {
        const t = ctx.locale.bind(NS)
        const form = ctx.configForms.get(ENTRY)
        const describe = ctx.configForms.describe()

        ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'jianyu-biaoxun-mcp: settings dictionary')

        /**
         * The settings tab body. It stages URL/token edits locally, writes all
         * changed fields in one `mutate`, and never restates the redacted token.
         * @param {{ t?: Function }} props - locale copy.
         * @returns {object} the tab content.
         */
        function JianyuSettingsPage(props) {
          const tr = props.t ?? t
          const snapshot = useConfigSnapshot(form)
          const tokenConfigured = useTokenConfigured(describe)
          const [urlDraft, setUrlDraft] = React.useState('')
          const [tokenDraft, setTokenDraft] = React.useState('')
          const [busy, setBusy] = React.useState(false)
          const [notice, setNotice] = React.useState(null)
          const edited = React.useRef(false)
          const snapshotValue = snapshot.value ?? {}

          // Reflect Host values while the user has not typed; after a save the
          // edited flag clears and the accepted snapshot repopulates the field.
          React.useEffect(() => {
            if (!edited.current && snapshot.status === 'ready') {
              setUrlDraft(String(snapshotValue.url ?? ''))
            }
          }, [snapshot.revision, snapshot.status])

          const writable = snapshot.writable === true
          const ready = snapshot.status === 'ready'
          const disabled = busy || !ready || !writable

          /**
           * Save changed fields as one revision-fenced mutation.
           * @returns {Promise<void>} settlement of the attempt.
           */
          async function save() {
            if (disabled) return
            setBusy(true)
            setNotice(null)
            try {
              const currentUrl = String(snapshotValue.url ?? '').trim()
              const nextUrl = urlDraft.trim()
              const ops = []
              if (nextUrl !== currentUrl) {
                ops.push(nextUrl === ''
                  ? { op: 'unset', path: ['url'] }
                  : { op: 'set', path: ['url'], value: nextUrl })
              }
              const nextToken = tokenDraft.trim()
              if (nextToken !== '') ops.push({ op: 'set', path: ['token'], value: nextToken })
              if (ops.length === 0) {
                setNotice({ tone: 'info', text: tr('noChanges') })
                return
              }
              const accepted = await form.mutate(ops, snapshot.revision)
              if (!accepted) {
                setNotice({ tone: 'error', text: tr('rejected') })
                return
              }
              const hasTokenAfterSave = tokenConfigured || nextToken !== ''
              edited.current = false
              setTokenDraft('')
              setNotice({
                tone: hasTokenAfterSave ? 'ok' : 'info',
                text: tr(hasTokenAfterSave ? 'saved' : 'savedNoToken'),
              })
            } catch (error) {
              setNotice({ tone: 'error', text: `${tr('failed')}${String(error?.message ?? error)}` })
            } finally {
              setBusy(false)
            }
          }

          /**
           * Remove the stored token; the Host plugin then stops the connection.
           * @returns {Promise<void>} settlement of the attempt.
           */
          async function clearToken() {
            if (busy || !ready || !writable) return
            setBusy(true)
            setNotice(null)
            try {
              const accepted = await form.unset('token')
              if (!accepted) setNotice({ tone: 'error', text: tr('rejected') })
              else setNotice({ tone: 'ok', text: tr('tokenCleared') })
            } catch (error) {
              setNotice({ tone: 'error', text: `${tr('failed')}${String(error?.message ?? error)}` })
            } finally {
              setBusy(false)
            }
          }

          const noticeColor = notice?.tone === 'error'
            ? '#d14343'
            : notice?.tone === 'ok' ? '#2e9e5b' : 'inherit'

          return h('div', { style: { display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '760px', padding: '4px 0 8px' } },
            h('div', null,
              h('h3', { style: { margin: 0, fontSize: '16px', fontWeight: 600 } }, tr('title')),
              h('p', { style: { ...mutedStyle, marginTop: '8px', fontSize: '14px' } }, tr('description')),
            ),
            snapshot.status === 'loading'
              ? h('p', { style: mutedStyle }, tr('loading'))
              : null,
            snapshot.status === 'unavailable'
              ? h('p', { style: mutedStyle }, tr('unavailable'))
              : null,
            !writable && ready
              ? h('p', { style: mutedStyle }, tr('readOnly'))
              : null,
            h(Field, {
              label: tr('url'),
              hint: tr('urlHint'),
              id: 'jianyu-mcp-url',
              control: h('input', {
                id: 'jianyu-mcp-url',
                type: 'url',
                value: urlDraft,
                disabled,
                spellCheck: false,
                autoComplete: 'off',
                style: fieldStyle,
                onChange: (event) => { edited.current = true; setUrlDraft(event.target.value) },
              }),
            }),
            h(Field, {
              label: tr('token'),
              hint: tokenConfigured ? tr('tokenConfigured') : tr('tokenMissing'),
              id: 'jianyu-mcp-token',
              control: h('input', {
                id: 'jianyu-mcp-token',
                type: 'password',
                value: tokenDraft,
                placeholder: tokenConfigured ? '••••••••••••' : tr('tokenPlaceholder'),
                disabled,
                spellCheck: false,
                autoComplete: 'new-password',
                style: fieldStyle,
                onChange: (event) => { setTokenDraft(event.target.value) },
              }),
            }),
            h('div', { style: { display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' } },
              h('button', {
                type: 'button',
                style: { ...primaryStyle, opacity: disabled ? 0.55 : 1 },
                disabled,
                onClick: () => { void save() },
              }, busy ? tr('saving') : tr('save')),
              tokenConfigured
                ? h('button', {
                    type: 'button',
                    style: { ...buttonStyle, opacity: disabled ? 0.55 : 1 },
                    disabled,
                    onClick: () => { void clearToken() },
                  }, tr('clearToken'))
                : null,
            ),
            notice === null
              ? null
              : h('p', { style: { margin: 0, color: noticeColor, fontSize: '13px' }, role: 'status' }, notice.text),
          )
        }

        // The tab follows the Host namespace, so it disappears when the plugin
        // is disabled or removed, just like the managed MCP tools.
        ctx.effect(() => ctx.configForms.whileServed([ENTRY], () => ctx.slots.inject('settings.plugins.tab', () => ctx.slots.register({
          name: 'settings.plugins.tab',
          id: ENTRY,
          order: 20,
          label: () => t('tab'),
          locale: NS,
        }, JianyuSettingsPage))), 'jianyu-biaoxun-mcp: settings tab')
      },
    }
  },
})
