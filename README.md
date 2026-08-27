# Weijun — Personal Digital Space

Astro-first single-page personal website for `me.weijun.one`.

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

## GitHub Container Registry (GHCR)

[`.github/workflows/container.yml`](.github/workflows/container.yml) 会执行以下流程：

1. Pull Request：运行 `npm ci`、Astro 检查和静态构建，并验证 amd64 容器镜像可以成功构建，但不推送镜像。
2. 推送到 `main`：构建 `linux/amd64` 与 `linux/arm64` 镜像并发布至 `ghcr.io/<owner>/<repo>`。
3. 推送 `v*` 标签：额外生成语义化版本标签，例如 `v1.2.0`、`1.2.0` 和 `1.2`。
4. 每次发布都会生成 `sha-<commit>` 标签、SBOM 和构建来源证明，便于固定版本和回滚。
5. 主分支发布成功后，如果配置了 `DOKPLOY_DEPLOY_WEBHOOK`，工作流会触发 Dokploy 部署。

发布 GHCR 不需要单独创建 Token，工作流使用权限最小化的 `GITHUB_TOKEN`。第一次发布后，在 GitHub 的 Package settings 中确认镜像可见性：公开网站建议设为 **Public**；若保持 Private，需要在 Dokploy 中配置具有 `read:packages` 权限的 GitHub PAT，切勿把 PAT 写入仓库或 Compose 文件。

## Deploy the GHCR image with Compose

把 `<owner>/<repo>` 替换为 GitHub 仓库路径：

```bash
export WEBSITE_IMAGE=ghcr.io/<owner>/<repo>:latest
docker compose pull website
docker compose up -d --no-build website
```

生产环境建议固定到 commit 镜像，避免 `latest` 漂移：

```bash
export WEBSITE_IMAGE=ghcr.io/<owner>/<repo>:sha-<commit>
docker compose pull website
docker compose up -d --no-build website
```

回滚时把 `WEBSITE_IMAGE` 改为上一个可用的 `sha-<commit>`，然后重复 `pull` 与 `up` 即可。

## Dokploy deployment

推荐让 Dokploy 直接拉取 GHCR 镜像，避免在服务器重复编译：

1. 在 Dokploy 创建 **Compose** 项目并连接仓库，Compose 文件选择 `compose.yaml`。
2. 设置环境变量 `WEBSITE_IMAGE=ghcr.io/<owner>/<repo>:latest`。生产 Compose 仅 `expose` 容器端口 `80`，不会把端口直接暴露到宿主机。
3. 为 `me.weijun.one` 配置域名与 HTTPS/Let's Encrypt，并将 DNS `A`/`AAAA` 指向 Dokploy 服务器。
4. 在 Dokploy 生成部署 Webhook，然后在 GitHub 仓库的 **Settings → Environments → production → Environment secrets** 新增 `DOKPLOY_DEPLOY_WEBHOOK`。
5. 若 GHCR 镜像为 Private，在 Dokploy 的 Registry credentials 中配置 GitHub 用户名和只具有 `read:packages` 权限的 PAT。

如果暂时不使用 GHCR，也可以继续在 Dokploy 选择 **Dockerfile** 构建；`DOKPLOY_DEPLOY_WEBHOOK` 未配置时，CI 只发布镜像，不会报错。

nginx 为静态资源提供长期缓存，并通过 `/healthz` 暴露轻量健康检查。
