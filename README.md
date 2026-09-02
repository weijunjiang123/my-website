# Weijun — Personal Digital Space

Astro-first single-page personal website for `weijun.one`.

## Local development

```bash
npm install
npm run dev
```

Production validation:

```bash
npm run build
npm run preview
```

## Docker Compose

本地构建并通过 nginx 运行：

```bash
docker compose -f compose.yaml -f compose.local.yaml up -d --build
```

默认访问 `http://localhost:8080`。可通过 `WEB_PORT` 修改宿主机端口：

```bash
WEB_PORT=3000 docker compose -f compose.yaml -f compose.local.yaml up -d --build
```

查看状态、日志与停止服务：

```bash
docker compose -f compose.yaml -f compose.local.yaml ps
docker compose -f compose.yaml -f compose.local.yaml logs -f website
docker compose -f compose.yaml -f compose.local.yaml down
```

## Dokploy deployment

仓库当前不包含 GitHub Actions 发布流程。生产环境推荐让 Dokploy 从 `main`
直接使用仓库根目录的 `Dockerfile` 构建，避免 `compose.yaml` 的默认本地镜像被误当作已发布镜像：

1. 在 Dokploy 创建 Dockerfile 项目并连接本仓库，分支选择 `main`。
2. Build context 使用仓库根目录 `.`，Dockerfile 路径使用 `./Dockerfile`。
3. 容器端口设为 `80`，域名配置为 `weijun.one`。
4. 健康检查使用镜像内置检查，或单独访问 `/healthz`。
5. 确认新容器健康后再切换流量，并在平台侧启用需要的自动部署触发器。

如果以后改为从 Registry 部署，必须先增加独立的镜像构建/推送流程，并将
`WEBSITE_IMAGE` 固定为不可变的 commit 标签；不要依赖未发布的 `latest` 镜像。

## Production cache behavior

- 页面 HTML 携带关键样式并设置为不缓存，避免滚动发布时出现无样式页面。
- `/_astro/` 下存在的哈希资源长期缓存；不存在的哈希明确返回不可缓存的 404。
- `favicon`、OG 图片等稳定文件只使用短缓存。
- nginx 通过 `/healthz` 暴露轻量探针，容器自身还会检查首页是否包含内联样式。
