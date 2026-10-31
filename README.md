# 衡水洛格科技有限公司官网

基于 Vue 3 + Vite 的单页企业官网，纯静态，可直接部署到 GitHub Pages，并绑定 `www.hslog.cn`。

## 本地开发

```bash
npm install
npm run dev
```

## 构建

```bash
npm run build
npm run preview
```

构建产物在 `dist/`。

## 需要替换的内容

上线前请把下面这些占位信息换成真实信息：

| 位置 | 当前值 | 说明 |
|---|---|---|
| `src/App.vue` → `company.intro` | 通用介绍文案 | 按公司实际情况调整 |
| `src/App.vue` → `services` | 9 项业务 | 按实际业务增删 |
| `src/App.vue` → `techGroups` | 技术栈标签 | 按实际技术能力增删 |
| `src/App.vue` → `icp` | `冀ICP备2021003265号` | 备案号，页脚展示 |
| `public/CNAME` | `www.hslog.cn` | 自定义域名 |

## 部署到 GitHub Pages

### 1. 推送到 GitHub

```bash
git init
git add .
git commit -m "init: hslog website"
git branch -M main
git remote add origin https://github.com/<你的用户名>/hslog-website.git
git push -u origin main
```

> 仓库需要是 **public**，免费账号才能发布 GitHub Pages。

### 2. 开启 Pages

仓库 → **Settings → Pages** → Build and deployment → Source 选 **GitHub Actions**。

推送后 `.github/workflows/deploy.yml` 会自动构建并发布。首次可在 **Actions** 标签页查看进度。

### 3. 绑定自定义域名

仓库 → **Settings → Pages → Custom domain** 填入 `www.hslog.cn` 并保存。

`public/CNAME` 文件里已经写好 `www.hslog.cn`，构建时会一起部署，两处保持一致即可。

### 4. 配置 DNS（腾讯云 DNSPod）

| 主机记录 | 类型 | 记录值 |
|---|---|---|
| `www` | CNAME | `<你的用户名>.github.io` |
| `@` | A | `185.199.108.153` |
| `@` | A | `185.199.109.153` |
| `@` | A | `185.199.110.153` |
| `@` | A | `185.199.111.153` |

保存后等 10 分钟左右生效，然后在 Pages 页面勾选 **Enforce HTTPS**（GitHub 会自动签发证书，可能需要几分钟到几十分钟）。

## 注意事项

- **访问速度**：GitHub Pages 服务器在境外，国内访问速度和稳定性一般。如果访客主要在国内，后续建议迁到腾讯云 COS + CDN（域名和备案都在腾讯云，迁移成本很低）。
- **备案**：域名已有备案，解析到 GitHub Pages 不属于国内接入，一般不影响备案状态，但请保持网站内容与备案主体一致。
- **内容合规**：页面上的公司介绍、业务描述请按实际情况填写，不要夸大或使用未经授权的资质表述。
