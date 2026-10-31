<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const scrolled = ref(false)
const menuOpen = ref(false)

const onScroll = () => {
  scrolled.value = window.scrollY > 24
}

let revealObserver
let rafId = 0
let canvasCleanup = null
let cardCleanup = null
let heroCleanup = null

/* ---------- 滚动进度条 ---------- */
function initScrollProgress() {
  const bar = document.querySelector('.scroll-progress')
  const grid = document.querySelector('.hero__grid')
  if (!bar) return
  const update = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight
    const p = max > 0 ? Math.min(window.scrollY / max, 1) : 0
    bar.style.transform = `scaleX(${p})`
    if (grid) grid.style.transform = `translateY(${window.scrollY * 0.18}px)`
  }
  update()
  window.addEventListener('scroll', update, { passive: true })
  window.addEventListener('resize', update)
  return () => {
    window.removeEventListener('scroll', update)
    window.removeEventListener('resize', update)
  }
}

/* ---------- 滚动渐显 ---------- */
function initReveal() {
  const reveals = document.querySelectorAll('.reveal')
  if (!('IntersectionObserver' in window)) {
    reveals.forEach((el) => el.classList.add('is-visible'))
    return
  }
  revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible')
          revealObserver.unobserve(entry.target)
        }
      })
    },
    { threshold: 0.12 },
  )
  reveals.forEach((el) => revealObserver.observe(el))
}

/* ---------- Hero 粒子网络 ---------- */
function initParticles() {
  const canvas = document.querySelector('.hero__canvas')
  const host = canvas?.parentElement
  if (!canvas || !host) return
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    canvas.style.display = 'none'
    return
  }

  const ctx = canvas.getContext('2d')
  let w = 0
  let h = 0
  let particles = []
  const mouse = { x: -9999, y: -9999 }

  const resize = () => {
    const rect = host.getBoundingClientRect()
    w = rect.width
    h = rect.height
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    canvas.width = w * dpr
    canvas.height = h * dpr
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    const count = Math.min(90, Math.max(24, Math.floor(w / 16)))
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      r: Math.random() * 1.5 + 0.6,
    }))
  }

  const draw = () => {
    ctx.clearRect(0, 0, w, h)
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i]
      p.x += p.vx
      p.y += p.vy
      if (p.x < 0 || p.x > w) p.vx *= -1
      if (p.y < 0 || p.y > h) p.vy *= -1

      const dx = p.x - mouse.x
      const dy = p.y - mouse.y
      const md = Math.hypot(dx, dy)
      if (md < 130 && md > 0.1) {
        p.x += (dx / md) * 0.7
        p.y += (dy / md) * 0.7
      }

      ctx.beginPath()
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(130, 175, 255, 0.6)'
      ctx.fill()

      for (let j = i + 1; j < particles.length; j++) {
        const q = particles[j]
        const d = Math.hypot(p.x - q.x, p.y - q.y)
        if (d < 120) {
          ctx.beginPath()
          ctx.moveTo(p.x, p.y)
          ctx.lineTo(q.x, q.y)
          ctx.strokeStyle = `rgba(100, 150, 255, ${0.2 * (1 - d / 120)})`
          ctx.lineWidth = 1
          ctx.stroke()
        }
      }
    }
    rafId = requestAnimationFrame(draw)
  }

  const onMove = (e) => {
    const rect = canvas.getBoundingClientRect()
    mouse.x = e.clientX - rect.left
    mouse.y = e.clientY - rect.top
  }
  const onLeave = () => {
    mouse.x = -9999
    mouse.y = -9999
  }

  resize()
  draw()
  window.addEventListener('resize', resize)
  host.addEventListener('mousemove', onMove, { passive: true })
  host.addEventListener('mouseleave', onLeave)

  canvasCleanup = () => {
    cancelAnimationFrame(rafId)
    window.removeEventListener('resize', resize)
    host.removeEventListener('mousemove', onMove)
    host.removeEventListener('mouseleave', onLeave)
  }
}

/* ---------- Hero 鼠标光晕 ---------- */
function initHeroGlow() {
  const hero = document.querySelector('.hero')
  if (!hero) return
  const onMove = (e) => {
    const rect = hero.getBoundingClientRect()
    hero.style.setProperty('--mx', `${e.clientX - rect.left}px`)
    hero.style.setProperty('--my', `${e.clientY - rect.top}px`)
  }
  hero.addEventListener('mousemove', onMove, { passive: true })
  heroCleanup = () => hero.removeEventListener('mousemove', onMove)
}

/* ---------- 卡片光斑跟随 ---------- */
function initCardGlow() {
  const cards = document.querySelectorAll('.card')
  if (!cards.length) return
  const onMove = (e) => {
    const card = e.currentTarget
    const rect = card.getBoundingClientRect()
    card.style.setProperty('--cx', `${e.clientX - rect.left}px`)
    card.style.setProperty('--cy', `${e.clientY - rect.top}px`)
  }
  cards.forEach((card) => card.addEventListener('mousemove', onMove, { passive: true }))
  cardCleanup = () => {
    cards.forEach((card) => card.removeEventListener('mousemove', onMove))
  }
}

onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })
  initReveal()
  initParticles()
  initHeroGlow()
  initCardGlow()
  initScrollProgress()
  onScroll()
})

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
  revealObserver?.disconnect()
  canvasCleanup?.()
  cardCleanup?.()
  heroCleanup?.()
})

const company = {
  name: '衡水洛格科技有限公司',
  short: '洛格科技',
  slogan: '让软件真正服务于业务',
  intro:
    '衡水洛格科技有限公司专注软件定制开发、企业建站与 AI 应用落地。从企业官网、业务系统，到 AI 知识库、内容生成与模型私有化部署，我们提供覆盖产品全生命周期的技术服务，帮助中小企业把想法落地成可运行、可维护的产品。',
}

const nav = [
  { label: '关于我们', href: '#about' },
  { label: '业务范围', href: '#services' },
  { label: 'AI 落地', href: '#ai' },
  { label: '技术能力', href: '#tech' },
  { label: '为什么选择我们', href: '#why' },
  { label: '联系我们', href: '#contact' },
]

const stats = [
  { value: '一站式', label: '建站到运维' },
  { value: '全栈', label: '前端到后端' },
  { value: 'AI 落地', label: '场景化部署' },
]

const services = [
  {
    title: '企业建站',
    desc: '企业官网、品牌展示站、营销落地页与电商商城，从设计到上线一站式交付。',
    paths: ['M2 4h20v16H2z', 'M2 9h20', 'M7 6h.01', 'M11 6h.01'],
  },
  {
    title: '软件定制开发',
    desc: 'Web 系统、管理后台与业务平台，按真实业务流程量身定制。',
    paths: ['m16 18 6-6-6-6', 'M8 6l-6 6 6 6'],
  },
  {
    title: '小程序与移动应用',
    desc: '微信小程序、H5 与 App 开发，覆盖线上获客、会员与交易场景。',
    paths: ['M7 2h10a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Z', 'M12 18h.01'],
  },
  {
    title: '企业数字化',
    desc: '进销存、OA、CRM 等信息化系统建设，让流程、数据与团队高效协同。',
    paths: ['M3 3v18h18', 'M18 17V9', 'M13 17V5', 'M8 17v-3'],
  },
  {
    title: 'AI 知识库与智能客服',
    desc: '把产品手册、业务资料变成 7×24 小时应答的智能客服与内部知识库。',
    paths: [
      'M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z',
      'M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z',
    ],
  },
  {
    title: 'AI 内容生成',
    desc: '文案、图片与短视频批量生成，降低营销与素材的生产成本。',
    paths: [
      'M12 3l1.9 5.8a2 2 0 0 0 1.3 1.3L21 12l-5.8 1.9a2 2 0 0 0-1.3 1.3L12 21l-1.9-5.8a2 2 0 0 0-1.3-1.3L3 12l5.8-1.9a2 2 0 0 0 1.3-1.3z',
      'M5 3v4',
      'M3 5h4',
    ],
  },
  {
    title: 'AI 工作流自动化',
    desc: '表单、审批、数据处理接入大模型，减少重复劳动，让流程自动跑。',
    paths: [
      'M6 3v12',
      'M18 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
      'M6 21a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
      'M18 9a9 9 0 0 1-9 9',
    ],
  },
  {
    title: '模型私有化部署',
    desc: '把大模型部署在企业内网，数据不出门，兼顾安全与成本。',
    paths: [
      'M4 4h16v16H4z',
      'M9 9h6v6H9z',
      'M9 1v3',
      'M15 1v3',
      'M9 20v3',
      'M15 20v3',
    ],
  },
  {
    title: 'UI / UX 设计',
    desc: '品牌视觉、界面设计与交互原型，让产品好用，也让产品好看。',
    paths: [
      'M12 19l7-7 3 3-7 7-3-3z',
      'M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z',
      'M2 2l7.586 7.586',
      'M11 11a2 2 0 1 0 4 0 2 2 0 0 0-4 0z',
    ],
  },
  {
    title: '系统集成',
    desc: '支付、短信、地图、硬件接口与第三方平台对接，打通数据与业务。',
    paths: [
      'M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71',
      'M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71',
    ],
  },
  {
    title: '云部署与运维',
    desc: '云服务器、对象存储、CDN 与域名备案，负责上线、监控与日常维护。',
    paths: ['M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z'],
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
]

const techGroups = [
  { name: '前端', items: ['Vue', 'React', 'TypeScript', 'HTML5 / CSS3'] },
  { name: '后端', items: ['Node.js', 'Java', 'Python', 'PHP', 'Go'] },
  { name: '移动端', items: ['微信小程序', 'uni-app', 'Flutter'] },
  { name: 'AI', items: ['LLM', 'RAG', 'Coze / Dify', 'LangChain', 'Ollama'] },
  { name: '数据与云', items: ['MySQL', 'Redis', 'Docker', 'Nginx', '腾讯云'] },
]

const aiScenarios = [
  {
    tag: '客服',
    title: '智能客服与知识库',
    desc: '把产品手册、售后资料变成随时在线的回答，接入官网、公众号或企业微信。',
  },
  {
    tag: '营销',
    title: 'AI 内容生产',
    desc: '商品图、营销文案、短视频批量生成，让内容团队把时间花在策略上。',
  },
  {
    tag: '效率',
    title: '工作流自动化',
    desc: '表单、审批、报表接入大模型，重复流程自动处理，减少人工。',
  },
  {
    tag: '安全',
    title: '私有化部署',
    desc: '模型部署在企业内网，敏感数据不出门，支持持续调优与维护。',
  },
]

const advantages = [
  { title: '需求导向', desc: '先理解业务，再谈技术。每个功能都对应真实的业务目标。' },
  { title: '全栈能力', desc: '建站、开发、部署、运维由同一团队负责，沟通成本更低。' },
  { title: '快速交付', desc: '小步快跑，按里程碑交付，尽早看到可用的产品。' },
  { title: '长期陪伴', desc: '项目结束不是终点，提供维护、迭代与技术支持。' },
]

const icp = '冀ICP备2021003265号'
const year = new Date().getFullYear()

/* ---------- 联系表单 ---------- */
// 替换成你在 https://web3forms.com/ 用邮箱换到的 Access Key
const ACCESS_KEY = 'a98cb677-0e9d-46c1-a293-cc38df08f7c9'

const form = ref({ name: '', contact: '', message: '' })
const status = ref('idle')

async function submitForm() {
  if (!form.value.name.trim() || !form.value.contact.trim()) return
  status.value = 'sending'
  try {
    const res = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        access_key: ACCESS_KEY,
        subject: `官网联系表单 - ${form.value.name}`,
        from_name: '洛格科技官网',
        name: form.value.name,
        contact: form.value.contact,
        message: form.value.message,
        botcheck: '',
      }),
    })
    const data = await res.json()
    if (data.success) {
      status.value = 'success'
      form.value = { name: '', contact: '', message: '' }
    } else {
      status.value = 'error'
    }
  } catch {
    status.value = 'error'
  }
}
</script>

<template>
  <div class="scroll-progress" aria-hidden="true"></div>

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
      <div class="hero__orb hero__orb--1"></div>
      <div class="hero__orb hero__orb--2"></div>
      <div class="hero__grid"></div>
      <canvas class="hero__canvas" aria-hidden="true"></canvas>
      <div class="hero__cursor-glow" aria-hidden="true"></div>

      <div class="container hero__inner">
        <div class="hero__copy">
          <p class="eyebrow hero__enter" style="--enter-delay: 0ms">衡水洛格科技有限公司</p>
          <h1 class="hero__title hero__enter" style="--enter-delay: 80ms">
            软件定制 · 企业建站<br />
            <span class="gradient-text">让业务跑得更快</span>
          </h1>
          <p class="hero__desc hero__enter" style="--enter-delay: 180ms">
            从企业官网、业务系统到 AI 应用落地——
            我们提供建站、开发、AI 与运维的全栈支持，把想法变成真正可用的产品。
          </p>
          <div class="hero__actions hero__enter" style="--enter-delay: 280ms">
            <a class="btn btn--primary" href="#services">查看业务范围</a>
            <a class="btn btn--ghost" href="#tech">了解技术能力</a>
          </div>
          <ul class="hero__stats hero__enter" style="--enter-delay: 380ms">
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
  focus: [<span class="c-str">'企业建站'</span>, <span class="c-str">'软件定制'</span>],
  tech: [<span class="c-str">'Vue'</span>, <span class="c-str">'Node.js'</span>, <span class="c-str">'云服务'</span>],
  delivery: <span class="c-str">'从设计到上线'</span>,
}

<span class="c-fn">function</span> <span class="c-fn">build</span>(idea) {
  <span class="c-key">return</span> ship(idea, { quality: <span class="c-num">true</span> })
}</code></pre>
            <div class="code-card__foot">
              <span class="dot"></span> 全栈交付 · 随时响应
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- About -->
    <section id="about" class="section">
      <div class="container about">
        <div class="about__head reveal">
          <p class="eyebrow">关于我们</p>
          <h2 class="section__title">用工程能力，解决真实问题</h2>
        </div>
        <div class="about__body reveal" style="--delay: 120ms">
          <p>{{ company.intro }}</p>
          <ul class="about__points">
            <li><span>01</span> 需求先行的产品思路，不做多余功能</li>
            <li><span>02</span> 建站、开发、部署、运维全流程负责</li>
            <li><span>03</span> 可维护的代码与文档，后续迭代不踩坑</li>
          </ul>
        </div>
      </div>
    </section>

    <!-- Services -->
    <section id="services" class="section section--soft">
      <div class="container">
        <div class="section__head reveal">
          <p class="eyebrow">业务范围</p>
          <h2 class="section__title">从建站到系统，从设计到运维</h2>
          <p class="section__lead">按项目、按需或长期合作，找到适合你的合作方式。</p>
        </div>

        <div class="cards">
          <article
            v-for="(s, i) in services"
            :key="s.title"
            class="card reveal"
            :style="{ '--delay': (i % 3) * 90 + 'ms' }"
          >
            <div class="card__icon">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path v-for="(p, j) in s.paths" :key="j" :d="p" />
              </svg>
            </div>
            <h3>{{ s.title }}</h3>
            <p>{{ s.desc }}</p>
          </article>
        </div>
      </div>
    </section>

    <!-- AI -->
    <section id="ai" class="section">
      <div class="container">
        <div class="section__head reveal">
          <p class="eyebrow">AI 落地</p>
          <h2 class="section__title">AI 不只是概念，要能跑进业务里</h2>
          <p class="section__lead">从知识库、内容生产到流程自动化，我们帮你把大模型接进真实场景。</p>
        </div>
        <div class="ai-grid">
          <div
            v-for="(a, i) in aiScenarios"
            :key="a.title"
            class="ai-card reveal"
            :style="{ '--delay': i * 90 + 'ms' }"
          >
            <span class="ai-card__tag">{{ a.tag }}</span>
            <h3>{{ a.title }}</h3>
            <p>{{ a.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Tech -->
    <section id="tech" class="section section--soft">
      <div class="container">
        <div class="section__head reveal">
          <p class="eyebrow">技术能力</p>
          <h2 class="section__title">覆盖建站、开发与运维的完整技术栈</h2>
          <p class="section__lead">从页面到服务端，从部署到长期维护，一支团队打通全链路。</p>
        </div>
        <div class="tech">
          <div
            v-for="(g, i) in techGroups"
            :key="g.name"
            class="tech__group reveal"
            :style="{ '--delay': i * 90 + 'ms' }"
          >
            <h3>{{ g.name }}</h3>
            <ul>
              <li v-for="item in g.items" :key="item">{{ item }}</li>
            </ul>
          </div>
        </div>
      </div>
    </section>

    <!-- Why -->
    <section id="why" class="section">
      <div class="container">
        <div class="section__head reveal">
          <p class="eyebrow">为什么选择我们</p>
          <h2 class="section__title">把项目交给靠谱的团队</h2>
        </div>
        <div class="why">
          <div
            v-for="(a, i) in advantages"
            :key="a.title"
            class="why__item reveal"
            :style="{ '--delay': i * 90 + 'ms' }"
          >
            <span class="why__num">0{{ i + 1 }}</span>
            <h3>{{ a.title }}</h3>
            <p>{{ a.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Contact -->
    <section id="contact" class="section section--soft">
      <div class="container contact">
        <div class="contact__copy reveal">
          <p class="eyebrow">联系我们</p>
          <h2 class="section__title">说说你的项目</h2>
          <p class="section__lead">
            留下联系方式，我们会尽快联系你。你的信息只用于回复，不会在网站上公开。
          </p>
          <ul class="contact__notes">
            <li>需求说个大概就行，不用准备正式文档</li>
            <li>信息仅用于本次沟通，不会用于营销或转给第三方</li>
          </ul>
        </div>

        <form class="contact-form reveal" style="--delay: 120ms" @submit.prevent="submitForm">
          <div class="field">
            <label for="name">称呼</label>
            <input
              id="name"
              v-model="form.name"
              type="text"
              required
              maxlength="50"
              placeholder="怎么称呼你"
            />
          </div>
          <div class="field">
            <label for="contact">联系方式</label>
            <input
              id="contact"
              v-model="form.contact"
              type="text"
              required
              maxlength="100"
              placeholder="手机 / 微信 / 邮箱"
            />
          </div>
          <div class="field">
            <label for="message">需求描述</label>
            <textarea
              id="message"
              v-model="form.message"
              rows="4"
              maxlength="1000"
              placeholder="想做什么、大概预算、期望上线时间……简单说说就行"
            ></textarea>
          </div>
          <input type="checkbox" name="botcheck" class="honeypot" tabindex="-1" autocomplete="off" />

          <button
            class="btn btn--primary contact-form__submit"
            type="submit"
            :disabled="status === 'sending'"
          >
            {{ status === 'sending' ? '发送中…' : '提交需求' }}
          </button>

          <p v-if="status === 'success'" class="form-note form-note--ok">
            已收到，我们会尽快联系你。
          </p>
          <p v-if="status === 'error'" class="form-note form-note--err">
            提交失败，请稍后再试。
          </p>
        </form>
      </div>
    </section>
  </main>

  <footer class="footer">
    <div class="container footer__inner">
      <span>© {{ year }} {{ company.name }}</span>
      <a href="https://beian.miit.gov.cn/" target="_blank" rel="noopener">{{ icp }}</a>
    </div>
  </footer>
</template>
