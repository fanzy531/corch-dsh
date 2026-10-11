# DSH 教学改革工作台本地部署指南

> 面向从 GitHub 拉取源码、需要在本地开发 DSH 教学改革插件的团队成员。基线：2026-10-11。

## 结论先行

当前仓库适合以“源码项目”交付，但还不是独立安装包。教学改革插件是 workspace 包，需要和 DSH 源码一起构建并挂载到本地 profile；标准发布版 DSH 不会自动包含它。

当前本机 `~/.dsh/profiles/web` 还存在指向本机的绝对 `link:/Users/...` 路径，不能复制给团队。每位成员都要重新创建自己的 profile。

专家 SPA 的公网发布、邀请口令、答案保存和 Worker 仍是演示/原型能力。当前不要把真实专家履历、商业项目或敏感回答发到公网。

## 1. 推送前必须纳入 Git 的文件

下列文件如果没有提交，团队成员的 clean clone 不会包含教学改革功能：

- `packages/client/ui-polus-teaching-reform/` 全目录；
- `apps/web/public/practice-expert-interview-spa.html`；
- 根目录 `practice-expert-interview-spa.html`；
- `patches/dsh-better-sidebar@0.17.1.patch`；
- 与这些文件对应的 `package.json`、`pnpm-workspace.yaml`、`pnpm-lock.yaml`。

`pnpm-workspace.yaml` 引用了 better-sidebar patch；漏提交 patch 会让 `pnpm install --frozen-lockfile` 失败。

当前工作区还有旧 C-Lab Creator 删除、App Rail、sidebar、layout、conversation 和文档改动。推送前必须由维护者确认这些删除/修改属于同一个交付批次，并确认 DSH 原生新建会话入口仍保留。

## 2. 系统要求

| 软件 | 要求 |
| --- | --- |
| Git | 2.26+ |
| Node.js | `22.19+` 或 `24+`，建议统一 Node 24 LTS |
| pnpm | `11.7.0`，由根 `package.json` 固定 |
| Corepack | Node 自带，建议启用 |
| 浏览器 | Chrome/Edge/Firefox 最新版 |

检查：`node --version`、`pnpm --version`、`git --version`。

版本不对时运行：`corepack enable`，再运行 `corepack prepare pnpm@11.7.0 --activate`。

不要复制其他电脑的 `node_modules`、`~/.dsh`、`.env` 或 API 密钥。

## 3. Clean clone 安装

按顺序执行：

1. `git clone <团队 GitHub 仓库地址> corch-demo`
2. `cd corch-demo`
3. `corepack enable`
4. `corepack prepare pnpm@11.7.0 --activate`
5. `pnpm install --frozen-lockfile`

如果看到 `ERR_PNPM_PATCH_NOT_APPLIED`，先检查 `patches/dsh-better-sidebar@0.17.1.patch` 是否在提交中。不要删除 `patchedDependencies` 来绕过错误。

如果 lockfile 和 manifest 不一致，先确认提交完整，再由维护者在统一 pnpm 版本下运行 `pnpm install --lockfile-only`，不要让每个成员各自刷新锁文件。

## 4. 构建

第一次启动前必须执行：`pnpm run build`。

构建依次生成 Host、Client、插件 bundle 和 Web dist。生成的 `lib/`、`apps/web/dist/`、`.dsh-build/` 被 `.gitignore` 忽略，不需要提交，但每台新机器都要重新生成。仓库仅保留约 152KB 的 Typert Remote 契约种子，用来让首次 Host 类型检查能够启动；Host 构建会根据源码重新生成这些文件，后续不应把完整 `lib/` 目录加入提交。

只构建教学改革插件可执行：`pnpm --filter @polus-ai/dsh-client-ui-teaching-reform run bundle`。它不能替代第一次完整 `pnpm run build`。

### 已知类型检查问题

教学改革插件 bundle 当前可以生成。若 TypeScript project build 报 `packages/client/ui-primitives/src/markdown/parse.ts` 的 `micromark-util-types` 2.0.2/2.0.3 类型冲突，这是共享 UI 基础包的依赖收敛问题，不是教学改革业务代码问题。

处理顺序：统一 Node 24/pnpm 11.7；重新安装；仍复现时由维护者统一收敛该依赖并更新 lockfile。不要在不同开发机上各自修改 lockfile。

最低交付验证：`pnpm --filter @polus-ai/dsh-client-ui-teaching-reform run bundle` 和 `pnpm run build`。

## 5. 创建个人 DSH profile

### 5.1 禁止复制当前 `~/.dsh`

当前机器的 profile 曾包含：`@polus-ai/dsh-client-ui-teaching-reform: link:/Users/fanzy/Documents/corch-demo/packages/client/ui-polus-teaching-reform`。这是绝对路径，只能在当前电脑工作。

不要复制整个 `~/.dsh`，尤其不要复制 `.credentials.yaml`、`settings.yaml`、profile 的 `node_modules` 或任何包含真实凭证的文件。

### 5.2 使用独立 DSH_HOME

建议每位成员使用项目外或项目内未跟踪目录，例如：`export DSH_HOME="$PWD/.local-dsh"`，然后 `mkdir -p "$DSH_HOME"`。

`.local-dsh` 必须保持本地，不能提交。

仓库提供了可复现的 profile 初始化脚本。构建完成后执行：

```sh
pnpm run setup:teaching-reform
```

脚本会在 `$DSH_HOME/profiles/web` 创建当前 checkout 对应的本地 profile，安装 `dsh-better-sidebar` 及其 patch，并把教学改革插件以本机源码链接挂入 profile。脚本生成的 profile 使用当前机器的绝对路径，位于被忽略的 `.local-dsh/`（或你自定义的 `DSH_HOME`）中，不应提交。

### 5.3 Profile 内容

Web profile 至少需要以下 bundle：

- `@deepseek-ai/dsh-base`
- `@deepseek-ai/dsh-web-app`
- `@polus-ai/dsh-client-ui-teaching-reform`
- `dsh-better-sidebar`

教学改革插件不是已发布 DSH 的内置包，必须通过源码 workspace link、团队内部 tarball 或私有 registry 安装到 profile。优先先查看 `pnpm dsh --help` 和 `pnpm dsh plugin --help`，使用 CLI 管理 profile。

仓库中的 `profiles/teaching-reform-web/` 只保存不含机器路径的模板；不要直接把它当作最终 profile 提交。应使用上一节脚本生成 `$DSH_HOME/profiles/web/package.json`、`cordis.yml`、`cordis.patch.yml`、`pnpm-workspace.yaml` 和本地 lockfile。

### 5.4 启动

完成构建和 profile 安装后运行：`DSH_HOME="$PWD/.local-dsh" pnpm dsh web --no-open`。

终端会打印 `dsh web: http://127.0.0.1:<port>`。浏览器打开终端打印的地址，不要假设端口固定为 3080 或 3081。

Web server 默认绑定 `127.0.0.1`，只能本机访问。这是安全默认值，不要直接改为 `0.0.0.0` 暴露公网。

## 6. 日常开发

首次完整构建成功后，可以运行 `pnpm run dev:web -- --poll`，另开终端执行 `DSH_HOME="$PWD/.local-dsh" pnpm dsh web --no-open`。

`dev:web` 与 `pnpm run build` 都会写 `lib/` 和 `apps/web/dist/`，不要并行执行。

页面不更新时，依次检查 watch 构建错误、profile 是否仍指向旧 checkout、插件 bundle 是否成功，然后重启 DSH Web。

## 7. 本地验收

### DSH 外壳

- 原生 DSH 新建会话入口保留；
- 课程建设和实践专家访谈入口可见，图标正确；
- C-Lab Creator 不再出现；
- 左侧切换项目时，中栏和右侧对话切换到对应 session；
- better-sidebar 能打开文件/文献预览。

### 实践专家访谈

- 新建按钮创建空白工作台；
- 填写专家信息并生成问题包后，左侧出现项目；
- 成功后默认进入概览 Tab；
- 问题包与右侧 Agent 返回逐题一致；
- 每题有 `sourceRefs`，来源可展开；
- 编辑、取消、保存、删除和重新生成覆盖确认可用；
- SPA 预览可展示问题、阶段、进度、语音输入和暂存。

### 课程建设

- 八个步骤可切换；
- 资料、典型工作任务、能力认证、课程目标、对标、学时和课程项目页面可打开；
- mock 数据有演示/原型标识，不被误认为真实持久化数据。

## 8. 公网 SPA 的当前边界

### 8.1 发布链路不是生产链路

`InterviewWorkbench.tsx` 当前主要把 payload 写进主持人浏览器 localStorage，然后打开固定公网 URL。公网 SPA 与本地工作台不是同一 origin，不会共享 localStorage。

SPA 页面尝试读取 `/interviews/<fieldnoteId>.json`，但仓库没有完整 publish API，也没有自动上传 COS 的脚本。因此本地生成的问题包不会自动出现在公网；打开分享链接不等于专家可以读取问题。

### 8.2 鉴权只是原型

6 位口令、激活后 72 小时有效的产品设计已确定，但当前主要由前端 localStorage 模拟，缺少服务端哈希、限流、失败锁定、重放保护和跨设备恢复。当前只允许使用虚拟专家资料做内部演示。

### 8.3 地址和二维码

当前代码曾写死测试域名 `http://interview.cschool.ac.cn`，交付到其他环境必须配置化并使用 HTTPS。二维码还依赖外部 QR API，生产应自托管或明确网络依赖。

生产版本需要：COS/CDN 托管静态 SPA；HTTPS API 读取问题包和保存答案；服务端哈希口令和限流；私有 COS 与短时签名 URL；环境变量注入域名。

## 9. 云端开发前置条件

公网闭环至少需要这些接口：`POST /v1/interviews/:id/publish`、`POST /v1/spa-sessions/activate`、`PATCH /v1/spa-sessions/:id/answers/:questionId`、`POST /v1/spa-sessions/:id/answers/:questionId/analyze`、`POST /v1/spa-sessions/:id/submit`、`GET /v1/interviews/:id/report`。

API、Worker、COS、数据库和队列应使用隔离的腾讯云资源或命名空间，不修改现有业务服务。公网入口使用 HTTPS 反向代理，DSH 本地 Web 继续绑定 `127.0.0.1`。

## 10. Secrets

本地可使用被 `.gitignore` 忽略的 `.env`，例如 `DEEPSEEK_API_KEY=你的开发密钥` 和 `DEEPSEEK_BASE_URL=https://你的模型服务地址`。

不要把真实值写入 package manifest、Cordis 配置、SPA HTML、GitHub issue、截图、日志或 `~/.dsh` 压缩包。当前本机 `~/.dsh/settings.yaml` 和 `.credentials.yaml` 可能包含真实 provider 引用；严禁复制，若曾外泄应轮换。生产禁止使用明文 HTTP 模型服务地址。

## 11. Git 推送前检查

执行：`git status --short`、`git diff --stat`、`git diff --name-status`、`git ls-files --others --exclude-standard`。

重点确认教学改革插件目录、两个 SPA 文件和 better-sidebar patch 已加入提交。

不要提交：`node_modules/`、`lib/`、`apps/web/dist/`、`.dsh/`、`.local-dsh/`、`.env`、`.credentials.yaml`、`.sessions/`、`.dsh-build/`。

提交前执行：`pnpm --filter @polus-ai/dsh-client-ui-teaching-reform run bundle`、`pnpm run build`、`git diff --check`。

本次交付已在临时目录完成一次真正的 clean-clone 验证：从当前暂存内容重新 clone，`pnpm install --frozen-lockfile --offline --ignore-scripts` 成功，锁文件通过供应链校验，并且工作区包含完整 DSH、教学改革插件、SPA、patch 和 Remote 契约种子。随后执行 `pnpm run build`，Host、Client、教学改革插件 bundle 以及 Web 前端构建均通过。验证使用的是当前暂存内容，不依赖原工作区的 `node_modules` 或完整 `lib/` 产物。

构建后的启动烟测也已通过：在该 clean clone 中运行 `pnpm dsh web --no-open`，服务输出本机地址并可通过 HTTP 读取首页；验证结束后已停止测试进程。

## 12. 审计结论

| 检查项 | 结论 |
| --- | --- |
| 源码结构 | 基本清晰，插件已独立为 `ui-polus-teaching-reform`。 |
| Git 可移植性 | 交付范围已整理到暂存区；提交前仍需由维护者复核删除项和未跟踪 Agent Notes。 |
| 依赖 | packageManager 固定为 pnpm 11.7.0；需统一版本并确保 lock 与 manifest 一致。 |
| 本地启动 | 当前机器可构建/启动；新机器必须先 build 并重新创建 profile。 |
| Profile | 当前 `~/.dsh` 含绝对路径，不能复制；需要 profile 模板或 setup 脚本。 |
| 专家 SPA | 可用于本地/静态演示；公网发布、认证、答案保存和报告闭环尚未生产化。 |
| Secrets | tracked 文件未发现真实密钥；本机 `~/.dsh` 仍需严禁复制并检查轮换。 |
| 生产就绪度 | 前端原型可交付开发；云端 Worker、API、数据库和安全链路尚未完成。 |

## 13. P0 后续任务

- [x] 把教学改革插件、SPA 和 better-sidebar patch 纳入交付范围；
- [x] 为教学改革插件加入正式 client project reference/build registration，避免依赖本机已有 `lib/`；
- [x] 提供无绝对路径的 profile 模板或 setup 脚本；
- [x] 用当前暂存内容完成 clean-clone frozen install smoke；
- [x] 提供首轮 Remote 契约种子并完成 clean-clone 完整 build smoke；
- [ ] 处理 `micromark-util-types` 双版本造成的共享 UI 类型检查失败；
- [ ] 完成发布 API、服务端口令校验、答案保存和 Worker 闭环。

完整系统设计、工作流、UI 规范、问题包协议、追问逻辑和完成报告见 [dsh-teaching-reform-team-handoff.md](./dsh-teaching-reform-team-handoff.md)。
