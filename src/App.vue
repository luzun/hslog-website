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
    '衡水洛格科技有限公司专注软件定制开发与企业数字化服务。从企业建站、业务系统开发，到云部署与长期技术运维，我们提供覆盖产品全生命周期的技术服务，帮助中小企业把想法落地成可运行、可维护的产品。',
}

const nav = [
  { label: '关于我们', href: '#about' },
  { label: '业务范围', href: '#services' },
  { label: '技术能力', href: '#tech' },
  { label: '为什么选择我们', href: '#why' },
]

const stats = [
  { value: '一站式', label: '建站到运维' },
  { value: '全栈', label: '前端到后端' },
  { value: '长期', label: '持续维护迭代' },
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
  {
    title: '技术咨询',
    desc: '技术选型、架构评审与性能优化，帮助团队少走弯路。',
    paths: [
      'M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z',
      'M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z',
    ],
  },
]

const techGroups = [
  { name: '前端', items: ['Vue', 'React', 'TypeScript', 'HTML5 / CSS3'] },
  { name: '后端', items: ['Node.js', 'Java', 'Python', 'PHP', 'Go'] },
  { name: '移动端', items: ['微信小程序', 'uni-app', 'Flutter'] },
  { name: '数据与云', items: ['MySQL', 'Redis', 'Docker', 'Nginx', '腾讯云'] },
]

const advantages = [
  { title: '需求导向', desc: '先理解业务，再谈技术。每个功能都对应真实的业务目标。' },
  { title: '全栈能力', desc: '建站、开发、部署、运维由同一团队负责，沟通成本更低。' },
  { title: '快速交付', desc: '小步快跑，按里程碑交付，尽早看到可用的产品。' },
  { title: '长期陪伴', desc: '项目结束不是终点，提供维护、迭代与技术支持。' },
]

const icp = '冀ICP备2021003265号'
const year = new Date().getFullYear()
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
            从企业官网到业务系统，从产品设计到云部署运维——
            我们提供覆盖建站、开发与技术服务的全栈支持，把想法变成真正可用的产品。
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

    <!-- Tech -->
    <section id="tech" class="section">
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
    <section id="why" class="section section--soft">
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
  </main>

  <footer class="footer">
    <div class="container footer__inner">
      <span>© {{ year }} {{ company.name }}</span>
      <a href="https://beian.miit.gov.cn/" target="_blank" rel="noopener">{{ icp }}</a>
    </div>
  </footer>
</template>
