# HeyGen LiveAvatar 接入说明

这个项目里，英语 AI 练习页已经预留了 HeyGen LiveAvatar 的接入位。

## 你需要准备的值

优先准备下面这些环境变量：

```env
HEYGEN_API_KEY=你的 HeyGen API Key
HEYGEN_AVATAR_ID=你的 Avatar Identity ID
HEYGEN_CONTEXT_ID=可选，如果你有对应上下文就填
HEYGEN_EMBED_URL=可选，如果你已经拿到 embed 链接就直接填
HEYGEN_IS_SANDBOX=true
HEYGEN_GREETING_TEXT=Hello! Let's practice English together.
```

如果你已经有完整的 embed 地址，也可以直接用 `HEYGEN_EMBED_URL`，这样后端会直接返回 iframe。

## 接入流程

1. 在 HeyGen 创建或打开你的 LiveAvatar。
2. 复制这个头像的 `Avatar Identity ID`。
3. 如果有需要，再准备对应的 `context_id`。
4. 在服务器上设置上面的环境变量。
5. 启动项目：

```bash
npm start
```

6. 打开英语 AI 页面：

```text
http://127.0.0.1:8000/english-ai.html
```

7. 页面会自动调用：

```text
POST /api/liveavatar/embed
```

8. 后端会根据你的配置返回 embed 代码，前端自动挂载到课堂区域。

## 你可以直接检查的接口

```text
GET /api/runtime-config
POST /api/liveavatar/embed
```

如果返回了 `heygen.enabled: true`，说明环境变量已经被识别到。

## 注意

- 手机可以浏览和改配置，但正式测试建议在电脑或平板上操作。
- 如果你只有 API Key，没有 Avatar Identity ID，页面不会自动挂载。
- 如果你已经有 embed URL，优先用 embed URL，最省事。
