<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const scrolled = ref(false)
const menuOpen = ref(false)

const onScroll = () => {
  scrolled.value = window.scrollY > 24
}
onMounted(() => window.addEventListener('scroll', onScroll, { passive: true }))
onUnmounted(() => window.removeEventListener('scroll', onScroll))

const company = {
  name: '衡水洛格科技有限公司',
  short: '洛格科技',
  slogan: '让软件真正服务于业务',
  intro:
    '衡水洛格科技有限公司专注软件定制开发与企业数字化服务。我们从业务需求出发，提供从需求分析、产品设计、开发实施到上线运维的一站式服务，帮助中小企业把想法落地成可运行、可维护的产品。',
}

const nav = [
  { label: '关于我们', href: '#about' },
  { label: '业务范围', href: '#services' },
  { label: '为什么选择我们', href: '#why' },
  { label: '联系我们', href: '#contact' },
]

const stats = [
  { value: '一站式', label: '需求到上线' },
  { value: '按需交付', label: '灵活合作' },
  { value: '长期维护', label: '持续迭代' },
]

const services = [
  {
    title: '软件定制开发',
    desc: '从需求梳理到上线运维，为企业量身打造 Web 系统、管理后台与业务平台。',
    paths: ['m16 18 6-6-6-6', 'M8 6l-6 6 6 6'],
  },
  {
    title: '小程序与移动应用',
    desc: '微信小程序、H5 与 App 开发，覆盖线上获客、会员与交易场景。',
    paths: [
      'M7 2h10a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Z',
      'M12 18h.01',
    ],
  },
  {
    title: '企业数字化',
    desc: '进销存、OA、CRM 等信息化系统建设，让流程、数据与团队高效协同。',
    paths: ['M3 3v18h18', 'M18 17V9', 'M13 17V5', 'M8 17v-3'],
  },
  {
    title: '软件外包与长期合作',
    desc: '按项目或按人天提供开发资源，支持长期驻场与持续迭代。',
    paths: [
      'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2',
      'M9 7a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z',
      'M22 21v-2a4 4 0 0 0-3-3.87',
      'M16 3.13a4 4 0 0 1 0 7.75',
    ],
  },
  {
    title: '部署与运维',
    desc: '云服务器、对象存储、CDN 与域名备案，一站式完成上线与托管。',
    paths: ['M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z'],
  },
  {
    title: '技术咨询',
    desc: '技术选型、架构评审与性能优化，帮助团队少走弯路。',
    paths: [
      'M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z',
      'M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z',
    ],
  },
]

const advantages = [
  { title: '需求导向', desc: '先理解业务，再谈技术。每个功能都对应真实的业务目标。' },
  { title: '快速交付', desc: '小步快跑，按里程碑交付，尽早看到可用的产品。' },
  { title: '质量保障', desc: '代码规范、测试与上线检查，交付后持续跟进。' },
  { title: '长期陪伴', desc: '项目结束不是终点，提供维护与迭代支持。' },
]

const contact = {
  email: 'contact@hslog.cn',
  phone: '400-000-0000',
  address: '河北省衡水市',
  icp: '冀ICP备2021003265号',
}

const year = new Date().getFullYear()
</script>

<template>
  <header class="nav" :class="{ 'nav--solid': scrolled }">
    <div class="container nav__inner">
      <a class="brand" href="#top" @click="menuOpen = false">
        <span class="brand__mark">L</span>
        <span class="brand__text">
          <strong>洛格科技</strong>
          <small>HSLOG TECHNOLOGY</small>
        </span>
      </a>

      <nav class="nav__links" :class="{ 'nav__links--open': menuOpen }">
        <a v-for="item in nav" :key="item.href" :href="item.href" @click="menuOpen = false">
          {{ item.label }}
        </a>
      </nav>

      <a class="btn btn--sm nav__cta" href="#contact">发起咨询</a>

      <button
        class="nav__toggle"
        type="button"
        aria-label="打开菜单"
        :aria-expanded="menuOpen"
        @click="menuOpen = !menuOpen"
      >
        <span></span><span></span><span></span>
      </button>
    </div>
  </header>

  <main id="top">
    <!-- Hero -->
    <section class="hero">
      <div class="hero__glow"></div>
      <div class="hero__grid"></div>
      <div class="container hero__inner">
        <div class="hero__copy">
          <p class="eyebrow">衡水洛格科技有限公司</p>
          <h1 class="hero__title">
            软件定制开发<br />
            <span class="gradient-text">让业务跑得更快</span>
          </h1>
          <p class="hero__desc">
            从需求分析到上线运维，我们为中小企业提供 Web 系统、小程序与数字化工具，
            把想法变成真正可用的产品。
          </p>
          <div class="hero__actions">
            <a class="btn btn--primary" href="#services">查看业务范围</a>
            <a class="btn btn--ghost" href="#contact">聊聊你的项目</a>
          </div>
          <ul class="hero__stats">
            <li v-for="s in stats" :key="s.label">
              <strong>{{ s.value }}</strong>
              <span>{{ s.label }}</span>
            </li>
          </ul>
        </div>

        <div class="hero__visual" aria-hidden="true">
          <div class="code-card">
            <div class="code-card__bar">
              <i></i><i></i><i></i>
              <span>hslog / index.vue</span>
            </div>
            <pre class="code-card__body"><code><span class="c-key">const</span> company = {
  name: <span class="c-str">'衡水洛格科技'</span>,
  focus: [<span class="c-str">'软件定制'</span>, <span class="c-str">'数字化'</span>],
  delivery: <span class="c-str">'从需求到上线'</span>,
}

<span class="c-fn">function</span> <span class="c-fn">build</span>(idea) {
  <span class="c-key">return</span> ship(idea, { quality: <span class="c-num">true</span> })
}</code></pre>
            <div class="code-card__foot">
              <span class="dot"></span> 需求沟通中 · 随时响应
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- About -->
    <section id="about" class="section">
      <div class="container about">
        <div class="about__head">
          <p class="eyebrow">关于我们</p>
          <h2 class="section__title">用工程能力，解决真实问题</h2>
        </div>
        <div class="about__body">
          <p>{{ company.intro }}</p>
          <ul class="about__points">
            <li><span>01</span> 需求先行的产品思路，不做多余功能</li>
            <li><span>02</span> 全流程交付，从原型到上线一个团队负责</li>
            <li><span>03</span> 可维护的代码与文档，后续迭代不踩坑</li>
          </ul>
        </div>
      </div>
    </section>

    <!-- Services -->
    <section id="services" class="section section--soft">
      <div class="container">
        <div class="section__head">
          <p class="eyebrow">业务范围</p>
          <h2 class="section__title">我们能为你做什么</h2>
          <p class="section__lead">按项目、按需或长期合作，找到适合你的合作方式。</p>
        </div>

        <div class="cards">
          <article v-for="s in services" :key="s.title" class="card">
            <div class="card__icon">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path v-for="(p, i) in s.paths" :key="i" :d="p" />
              </svg>
            </div>
            <h3>{{ s.title }}</h3>
            <p>{{ s.desc }}</p>
          </article>
        </div>
      </div>
    </section>

    <!-- Why -->
    <section id="why" class="section">
      <div class="container">
        <div class="section__head">
          <p class="eyebrow">为什么选择我们</p>
          <h2 class="section__title">把项目交给靠谱的团队</h2>
        </div>
        <div class="why">
          <div v-for="(a, i) in advantages" :key="a.title" class="why__item">
            <span class="why__num">0{{ i + 1 }}</span>
            <h3>{{ a.title }}</h3>
            <p>{{ a.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Contact -->
    <section id="contact" class="section section--soft">
      <div class="container">
        <div class="contact">
          <div class="contact__copy">
            <p class="eyebrow">联系我们</p>
            <h2 class="section__title">说说你的想法</h2>
            <p class="section__lead">
              无论是一个完整的产品，还是一次技术升级，都欢迎先聊一聊。
            </p>
            <a class="btn btn--primary" :href="`mailto:${contact.email}`">发送邮件</a>
          </div>
          <ul class="contact__list">
            <li>
              <span class="contact__label">邮箱</span>
              <a :href="`mailto:${contact.email}`">{{ contact.email }}</a>
            </li>
            <li>
              <span class="contact__label">电话</span>
              <a :href="`tel:${contact.phone.replace(/-/g, '')}`">{{ contact.phone }}</a>
            </li>
            <li>
              <span class="contact__label">地址</span>
              <span>{{ contact.address }}</span>
            </li>
            <li>
              <span class="contact__label">备案</span>
              <span>{{ contact.icp }}</span>
            </li>
          </ul>
        </div>
      </div>
    </section>
  </main>

  <footer class="footer">
    <div class="container footer__inner">
      <span>© {{ year }} {{ company.name }}</span>
      <a href="https://beian.miit.gov.cn/" target="_blank" rel="noopener">{{ contact.icp }}</a>
    </div>
  </footer>
</template>
