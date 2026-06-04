# 启学教育官网重设计

这是一个面向教育培训机构的静态官网重设计方案，已经拆成首页、服务项目、关于我们、老师简介、课程表、家长好评、新闻动态和联系我们等多个页面，适合后续放到 GitHub 后用 Codespaces 继续开发。

## 技术结构

- `index.html`：首页结构
- `services.html`：服务项目页
- `about.html`：关于我们页
- `team.html`：老师简介页
- `schedule.html`：课程表页
- `testimonials.html`：家长好评页
- `news.html`：新闻动态页
- `contact.html`：联系我们页
- `styles.css`：页面样式
- `script.js`：导航与表单交互

## 本地预览

直接用浏览器打开 `index.html` 即可预览。

## 本地启动服务

如果你要测试 AI 互动接口，建议直接启动内置静态服务器：

```bash
npm start
```

如果 8000 已被占用，服务会自动尝试下一个端口。

然后打开：

- `http://127.0.0.1:8000`
- `http://127.0.0.1:8000/api/health`
- `http://127.0.0.1:8000/api/tutor/ask`

接口默认会先走本地知识库回退逻辑；如果配置了下面这些环境变量，就会自动转成 OpenAI 兼容接口代理：

- `OPENAI_API_KEY`
- `OPENAI_BASE_URL`
- `OPENAI_MODEL`

也可以使用：

- `LLM_API_KEY`
- `LLM_BASE_URL`
- `LLM_MODEL`

如果你要启用英语页的 Azure 发音评测，还可以配置：

- `AZURE_SPEECH_KEY`
- `AZURE_SPEECH_REGION`
- `AZURE_SPEECH_LANGUAGE`

如果你要让英语页自动挂载 HeyGen LiveAvatar，还可以配置：

- `HEYGEN_API_KEY`
- `HEYGEN_AVATAR_ID`
- `HEYGEN_CONTEXT_ID`
- `HEYGEN_EMBED_URL`
- `HEYGEN_IS_SANDBOX`
- `HEYGEN_GREETING_TEXT`

更完整的接入步骤我单独写在：

- [HEYGEN_SETUP.md](HEYGEN_SETUP.md)

如果你还在使用旧版 D-ID 连接，也保留了兼容配置，方便老环境平滑迁移：

- `DID_CLIENT_KEY`
- `DID_AGENT_ID`
- `DID_TARGET_ID`
- `DID_GREETING_TEXT`
- `DID_AUTO_CONNECT`

当前支持的接口：

- `POST /api/tutor/ask`
- `POST /api/tutor/chat`
- `POST /api/tutor/search`
- `POST /api/tutor/feedback`
- `GET /api/runtime-config`
- `POST /api/liveavatar/embed`
- `POST /api/speech/token`
- `POST /api/pronunciation/assess`

## 云上开发建议

1. 把当前目录推到 GitHub 仓库
2. 用 GitHub Codespaces 打开仓库
3. 在 Codespaces 中继续迭代页面
4. 最终部署到 GitHub Pages、Netlify 或 Vercel

## 当前状态

- 已完成首页视觉重设计
- 已适配移动端
- 已准备好进入云上协作流程
