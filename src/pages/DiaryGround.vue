<template>
  <div class="diary-bg">
    <!-- 背景装饰元素 -->
    <div class="bg-decor"></div>
    <!-- Header -->
    <header class="diary-header">
      <div class="header-svg-bg">
        <!-- SVG波浪装饰 -->
        <svg width="100%" height="80" viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0,40 Q360,80 720,40 T1440,40 V80 H0 Z" fill="#a5b4fc33"/>
          <circle cx="1200" cy="30" r="18" fill="#06b6d455"/>
          <circle cx="200" cy="60" r="10" fill="#c4b5fd55"/>
          <circle cx="900" cy="20" r="8" fill="#67e8f955"/>
        </svg>
      </div>
      <div class="header-inner">
        <div class="header-center">
          <h1 class="header-title">公开小计</h1>
          <p class="header-desc">发现和分享生活中的美好时刻</p>
          <div class="header-quote">“生活不止眼前的苟且，还有诗和远方。”<br><span>—— 高晓松</span></div>
        </div>
      </div>
    </header>
    <!-- 固定回到主板按钮 -->
    <div class="dashboard-btn-fixed">
      <button class="dashboard-btn" @click="goToDashboard">
        回到主板
      </button>
    </div>
    <!-- Main Content Container -->
    <div class="main-container">
      <div class="main-content">
        <!-- Search Section -->
        <div class="search-section">
          <div class="search-flex">
            <div class="search-input-wrap">
              <label for="search" class="search-label">
                <span class="search-label-inner">搜索日记</span>
              </label>
              <div class="search-input-group">
                <input
                    id="search"
                    v-model="searchQuery"
                    type="text"
                    placeholder="搜索标题或内容..."
                    class="search-input"
                    @input="handleSearch"
                />
                <span class="search-count">{{ searchQuery.length }}/50</span>
              </div>
            </div>
            <div class="search-sort-wrap">
              <label for="sort" class="search-label">
                <span class="search-label-inner">排序方式</span>
              </label>
              <select
                  id="sort"
                  v-model="sortBy"
                  class="search-sort"
                  @change="handleSort"
              >
                <option value="newest">最新发布</option>
                <option value="oldest">最早发布</option>
                <option value="title">标题排序</option>
              </select>
            </div>
          </div>
        </div>
        <!-- Results Info -->
        <div class="results-info">
          <span>找到</span>
          <span class="results-count">{{ filteredDiaries.length }}</span>
          <span>篇公开日记</span>
        </div>
        <!-- Loading State -->
        <div v-if="loading" class="loading-wrap">
          <div class="loading-spinner"></div>
        </div>
        <!-- Diary Grid -->
        <div v-else-if="filteredDiaries.length > 0" class="diary-grid">
          <div
              v-for="(diary, index) in paginatedDiaries"
              :key="diary.id"
              class="diary-card"
          >
            <div class="diary-card-inner">
              <div class="diary-card-header">
                <h3 class="diary-title">{{ diary.title }}</h3>
                <div class="diary-public">公开</div>
              </div>
              <p class="diary-content">{{ diary.content }}</p>
              <div class="diary-meta">
                <div class="diary-meta-user">用户 {{ diary.userId }}</div>
                <div class="diary-meta-date">{{ formatDate(diary.createdAt) }}</div>
              </div>
              <button @click="openDiary(diary)" class="read-btn">阅读全文</button>
            </div>
          </div>
        </div>
        <!-- Empty State -->
        <div v-else class="empty-state">
          <div class="empty-card">
            <div class="empty-icon"></div>
            <h3 class="empty-title">暂无公开日记</h3>
            <p class="empty-desc">{{ searchQuery ? '没有找到匹配的日记' : '还没有用户分享公开日记' }}</p>
          </div>
        </div>
        <!-- Pagination -->
        <div v-if="filteredDiaries.length > itemsPerPage" class="pagination-wrap">
          <nav class="pagination-nav">
            <button
                @click="currentPage = Math.max(1, currentPage - 1)"
                :disabled="currentPage === 1"
                class="pagination-btn"
            >
              &lt;
            </button>
            <span
                v-for="page in visiblePages"
                :key="page"
                @click="typeof page === 'number' && (currentPage = page)"
                :class="['pagination-page', typeof page === 'number' && page === currentPage ? 'pagination-page-active' : '']"
            >
              {{ page }}
            </span>
            <button
                @click="currentPage = Math.min(totalPages, currentPage + 1)"
                :disabled="currentPage === totalPages"
                class="pagination-btn"
            >
              &gt;
            </button>
          </nav>
        </div>
      </div>
    </div>
    <!-- Diary Modal -->
    <Transition name="modal-fade">
      <div
          v-if="selectedDiary"
          class="modal-bg"
          @click="closeDiary"
      >
        <Transition name="modal-content">
          <div
              v-if="selectedDiary"
              class="modal-content-wrap"
              @click.stop
          >
            <div class="modal-content-inner">
              <div class="modal-header">
                <h2 class="modal-title modal-title-strong">{{ selectedDiary.title }}</h2>
                <button @click="closeDiary" class="modal-close">×</button>
              </div>
              <div class="modal-meta">
                <div class="modal-meta-user">用户 {{ selectedDiary.userId }}</div>
                <div class="modal-meta-date">{{ formatDate(selectedDiary.createdAt) }}</div>
                <div class="modal-meta-public">公开</div>
              </div>
              <div class="modal-content-main">
                <p class="modal-content-text">{{ selectedDiary.content }}</p>
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Search, User, Calendar, Globe, BookOpen, ChevronLeft, ChevronRight, X } from 'lucide-vue-next'
import axios from '@/utils/axios'
import { useRouter } from 'vue-router'

// 响应式数据
const diaries = ref([])
const searchQuery = ref('')
const sortBy = ref('newest')
const loading = ref(true)
const selectedDiary = ref(null)
const currentPage = ref(1)
const itemsPerPage = 12

// 模拟数据 - 确保与 UserDiary 结构一致
const mockDiaries = [
  {
    id: 1,
    userId: 1001,
    title: '春日漫步',
    content: '今天天气特别好，阳光透过樱花树洒在小径上，形成斑驳的光影。我沿着公园的小路慢慢走着，听着鸟儿的歌声，感受着春天的气息。路边的花朵开得正艳，有粉色的樱花、黄色的迎春花，还有紫色的丁香。这样的时光总是让人感到宁静和美好，仿佛所有的烦恼都被这温暖的阳光融化了。',
    isPublic: true,
    createdAt: '2024-03-15T10:30:00',
    updatedAt: '2024-03-15T10:30:00'
  },
  {
    id: 2,
    userId: 1002,
    title: '读书笔记：《百年孤独》',
    content: '重读马尔克斯的《百年孤独》，每次都有新的感悟。布恩迪亚家族的兴衰史，就像是拉丁美洲历史的缩影。魔幻现实主义的手法让现实与幻想交织，创造出一个既真实又超现实的世界。书中的孤独不仅仅是个人的孤独，更是整个民族、整个时代的孤独。',
    isPublic: true,
    createdAt: '2024-03-14T15:20:00',
    updatedAt: '2024-03-14T15:20:00'
  },
  {
    id: 3,
    userId: 1003,
    title: '学习编程的心得',
    content: '开始学习Vue.js已经一个月了，从最初的困惑到现在能够独立完成一些小项目，这个过程充满了挑战和成就感。响应式数据、组件化开发、生命周期钩子，这些概念从陌生到熟悉，每一个小的突破都让我兴奋不已。编程不仅仅是写代码，更是一种思维方式的训练。',
    isPublic: true,
    createdAt: '2024-03-13T09:15:00',
    updatedAt: '2024-03-13T09:15:00'
  },
  {
    id: 4,
    userId: 1004,
    title: '咖啡馆的午后',
    content: '坐在街角的咖啡馆里，手中捧着一杯热腾腾的拿铁，看着窗外来来往往的行人。每个人都有自己的故事，每个人都在为生活奔波。咖啡的香气混合着轻柔的音乐，营造出一种温馨的氛围。这样的午后时光，让人感到格外珍贵。',
    isPublic: true,
    createdAt: '2024-03-12T14:45:00',
    updatedAt: '2024-03-12T14:45:00'
  },
  {
    id: 5,
    userId: 1005,
    title: '旅行日记：京都印象',
    content: '京都的美在于它的细节。古老的寺庙、精致的庭院、穿着和服的女子，每一个场景都像是从画中走出来的。在清水寺俯瞰整个城市，在竹林小径中漫步，在茶道体验中感受日本文化的精髓。这座城市完美地保存了传统文化，同时又融入了现代生活。',
    isPublic: true,
    createdAt: '2024-03-11T18:30:00',
    updatedAt: '2024-03-11T18:30:00'
  },
  {
    id: 6,
    userId: 1006,
    title: '健身日记',
    content: '坚持健身已经三个月了，从最初的气喘吁吁到现在能够完成一套完整的训练，身体和精神状态都有了明显的改善。每次运动后的那种畅快感，是任何其他活动都无法替代的。健身不仅塑造了身体，更重要的是培养了坚持和自律的品质。',
    isPublic: true,
    createdAt: '2024-03-10T07:00:00',
    updatedAt: '2024-03-10T07:00:00'
  },
  {
    id: 7,
    userId: 1007,
    title: '夏日海边',
    content: '阳光、沙滩、海浪，夏日的海边总是那么令人向往。赤脚走在细软的沙滩上，感受海风轻抚脸颊，听着海浪拍打礁石的声音，所有的烦恼都随风而逝。傍晚时分，夕阳将海面染成一片金黄，美得令人窒息。',
    isPublic: true,
    createdAt: '2024-03-09T11:00:00',
    updatedAt: '2024-03-09T11:00:00'
  },
  {
    id: 8,
    userId: 1008,
    title: '烹饪新尝试',
    content: '今天尝试做了一道新的菜肴——意式肉酱面。从准备食材到烹饪，每一步都充满了乐趣。虽然过程有些手忙脚乱，但当热腾腾的意面端上桌时，闻着那浓郁的香气，所有的努力都变得值得。家人吃得津津有味，这让我感到非常满足。',
    isPublic: true,
    createdAt: '2024-03-08T19:00:00',
    updatedAt: '2024-03-08T19:00:00'
  },
  {
    id: 9,
    userId: 1009,
    title: '夜空下的思考',
    content: '在一个晴朗的夜晚，我躺在草地上，仰望着浩瀚的星空。无数颗星星闪烁着微光，仿佛在诉说着宇宙的奥秘。人类在宇宙面前是如此渺小，但我们的思想却能穿越时空，探索未知的领域。这样的夜晚总是能引发我对生命和存在的深刻思考。',
    isPublic: true,
    createdAt: '2024-03-07T22:00:00',
    updatedAt: '2024-03-07T22:00:00'
  },
  {
    id: 10,
    userId: 1010,
    title: '城市速写',
    content: '带着速写本和画笔，我坐在城市广场的长椅上，记录着眼前的一切。高楼大厦、穿梭的人群、街头艺人的表演，每一个场景都充满了活力。用线条和色彩捕捉城市的脉搏，这是一种独特的体验。',
    isPublic: true,
    createdAt: '2024-03-06T16:00:00',
    updatedAt: '2024-03-06T16:00:00'
  },
  {
    id: 11,
    userId: 1011,
    title: '雨天的诗意',
    content: '窗外下着淅淅沥沥的小雨，空气中弥漫着泥土和植物的清新味道。我泡上一杯热茶，坐在窗边，听着雨滴敲打窗户的声音。这样的雨天，最适合静下心来，读一本书，或者写一些文字，感受那份独特的诗意。',
    isPublic: true,
    createdAt: '2024-03-05T08:45:00',
    updatedAt: '2024-03-05T08:45:00'
  },
  {
    id: 12,
    userId: 1012,
    title: '徒步山林',
    content: '周末和朋友一起去徒步，选择了附近的一座小山。山路蜿蜒曲折，两旁是茂密的树林。呼吸着新鲜的空气，听着鸟鸣虫叫，感受大自然的魅力。登顶后，俯瞰远处的风景，所有的疲惫都烟消云散。',
    isPublic: true,
    createdAt: '2024-03-04T09:30:00',
    updatedAt: '2024-03-04T09:30:00'
  },
  {
    id: 13,
    userId: 1013,
    title: '电影之夜',
    content: '昨晚看了一部非常棒的电影，剧情跌宕起伏，演员的表演也十分精彩。电影结束后，我还在回味其中的情节和人物命运。一部好的电影，不仅仅是娱乐，更能引发思考，带来心灵的触动。',
    isPublic: true,
    createdAt: '2024-03-03T20:00:00',
    updatedAt: '2024-03-03T20:00:00'
  },
  {
    id: 14,
    userId: 1014,
    title: '园艺乐趣',
    content: '最近迷上了园艺，在阳台上种了一些花草。每天浇水、施肥、修剪，看着它们一点点长大，开出美丽的花朵，心里充满了喜悦。园艺不仅能美化环境，更能让人感受到生命的力量和成长的乐趣。',
    isPublic: true,
    createdAt: '2024-03-02T14:00:00',
    updatedAt: '2024-03-02T14:00:00'
  },
  {
    id: 15,
    userId: 1015,
    title: '老照片的回忆',
    content: '整理旧物时，翻出了一本老相册。一张张泛黄的照片，记录着过去的时光。童年、学生时代、和朋友们的聚会，那些美好的回忆瞬间涌上心头。时间过得真快，但记忆却永远鲜活。',
    isPublic: true,
    createdAt: '2024-03-01T17:30:00',
    updatedAt: '2024-03-01T17:30:00'
  }
]
const router = useRouter()
const goToDashboard = () => {
  router.push('/dashboard')
}
// 计算属性
const filteredDiaries = computed(() => {
  let filtered = diaries.value.filter(diary => diary.isPublic)

  // 搜索过滤
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(diary =>
        diary.title.toLowerCase().includes(query) ||
        diary.content.toLowerCase().includes(query)
    )
  }

  // 排序
  filtered.sort((a, b) => {
    switch (sortBy.value) {
      case 'newest':
        return new Date(b.createdAt) - new Date(a.createdAt)
      case 'oldest':
        return new Date(a.createdAt) - new Date(b.createdAt)
      case 'title':
        return a.title.localeCompare(b.title)
      default:
        return 0
    }
  })

  return filtered
})

const totalPages = computed(() => Math.ceil(filteredDiaries.value.length / itemsPerPage))

const paginatedDiaries = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredDiaries.value.slice(start, end)
})

const visiblePages = computed(() => {
  const pages = []
  const total = totalPages.value
  const current = currentPage.value

  if (total <= 7) {
    for (let i = 1; i <= total; i++) {
      pages.push(i)
    }
  } else {
    if (current <= 4) {
      for (let i = 1; i <= 5; i++) {
        pages.push(i)
      }
      pages.push('...', total)
    } else if (current >= total - 3) {
      pages.push(1, '...')
      for (let i = total - 4; i <= total; i++) {
        pages.push(i)
      }
    } else {
      pages.push(1, '...')
      for (let i = current - 1; i <= current + 1; i++) {
        pages.push(i)
      }
      pages.push('...', total)
    }
  }

  // 过滤掉重复的 '...'
  return pages.filter((page, index, self) => page !== '...' || self.indexOf(page) === index)
})

// 方法
const handleSearch = () => {
  currentPage.value = 1
}

const handleSort = () => {
  currentPage.value = 1
}

const openDiary = (diary) => {
  selectedDiary.value = diary
}

const closeDiary = () => {
  selectedDiary.value = null
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 生命周期
onMounted(async () => {
  try {
    // 获取公开日记
    const res = await axios.post('/userDiary/findPublicDiaries')
    diaries.value = res || []
  } catch (e) {
    // 若接口失败则用 mock 数据
    diaries.value = mockDiaries
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.dashboard-btn-wrapper {
  position: absolute;         /* 加入绝对定位 */
  top: 16px;                  /* 距离顶部距离 */
  left: 16px;                 /* 距离左边距离 */
  margin-top: 0;              /* 不再需要 margin-top */
  text-align: left;           /* 不居中 */
  z-index: 1000;              /* 保证在最上层 */
}

.dashboard-btn {
  background: linear-gradient(90deg, #5563DE 0%, #74ABE2 100%);
  color: #fff;
  border: none;
  border-radius: 24px;
  padding: 12px 36px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 2px 8px #a5b4fc33;
  transition: background 0.2s, transform 0.2s;
}

.dashboard-btn:hover {
  background: linear-gradient(90deg, #74ABE2 0%, #5563DE 100%);
  transform: scale(1.04);
}

.diary-bg {
  min-height: 100vh;
  font-family: 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Arial', sans-serif;
  background: linear-gradient(135deg, #a5b4fc 0%, #6366f1 50%, #06b6d4 100%);
  position: relative;
  overflow-x: hidden;
  color: #222;
}
.bg-decor {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  background: radial-gradient(circle at 80% 10%, #c7d2fe88 0, transparent 60%),
              radial-gradient(circle at 10% 90%, #99f6e488 0, transparent 70%);
  filter: blur(40px);
}
.diary-header {
  position: relative;
  z-index: 1;
  background: rgba(40, 60, 120, 0.7);
  backdrop-filter: blur(12px);
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.15);
  border-bottom: 1px solid #e0e7ff55;
}
.header-svg-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 80px; /* Adjust height as needed */
  z-index: -1;
  overflow: hidden;
}
.header-svg-bg svg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.header-inner {
  max-width: 1100px;
  margin: 0 auto;
  padding: 2.5rem 1.5rem 2rem 1.5rem;
}
.header-center {
  text-align: center;
}
.header-title {
  font-size: 2.8rem;
  font-weight: 900;
  background: linear-gradient(90deg, #67e8f9, #a5b4fc, #c4b5fd);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 0.5rem;
}
.header-desc {
  color: #e0e7ff;
  font-size: 1.3rem;
  font-weight: 500;
  text-shadow: 0 2px 8px #0002;
}
.header-quote {
  font-size: 1.1rem;
  color: #e0e7ff;
  font-style: italic;
  margin-top: 1.5rem;
  text-shadow: 0 1px 4px #0002;
}
.header-quote span {
  display: block;
  text-align: right;
  margin-top: 0.3rem;
  font-size: 0.9rem;
  color: #a5b4fc;
}
.main-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2.5rem 1.5rem;
  position: relative;
  z-index: 1;
}
.main-content {
  background: rgba(255,255,255,0.85);
  border-radius: 2rem;
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.10);
  padding: 2.5rem 2rem;
  backdrop-filter: blur(10px);
  border: 1.5px solid rgba(0,0,0,0.10) !important;
  box-shadow: 0 4px 24px 0 #6366f11a, 0 0 0 1.5px rgba(0,0,0,0.08) inset;
}
.search-section {
  background: linear-gradient(90deg, #f1f5ffcc 0%, #dbeafe88 100%);
  border-radius: 1.2rem;
  padding: 2rem 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 12px 0 #6366f11a;
  border: 1.5px solid rgba(0,0,0,0.10) !important;
  box-shadow: 0 4px 24px 0 #6366f11a, 0 0 0 1.5px rgba(0,0,0,0.08) inset;
}
.search-flex {
  display: flex;
  flex-wrap: wrap;
  gap: 2.5rem;
  align-items: flex-end;
  justify-content: space-between;
}
.search-input-wrap, .search-sort-wrap {
  flex: 1 1 320px;
  min-width: 260px;
  max-width: 600px;
}
.search-input-group, .search-sort {
  margin-bottom: 0;
}
@media (max-width: 900px) {
  .search-flex {
    flex-direction: column;
    align-items: stretch;
    gap: 1.2rem;
  }
  .search-input-wrap, .search-sort-wrap {
    max-width: 100%;
    min-width: 0;
  }
}
.search-label {
  display: block;
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 0.7rem;
  color: #3730a3;
}
.search-label-inner {
  background: #fff8;
  padding: 0.4rem 1.2rem;
  border-radius: 0.7rem;
  box-shadow: 0 1px 4px #0001;
}
.search-input-group {
  position: relative;
}
.search-input {
  width: 100%;
  padding: 0.9rem 1.2rem;
  border: 2px solid #a5b4fc;
  border-radius: 1rem;
  font-size: 1.1rem;
  background: rgba(255,255,255,0.85);
  box-shadow: 0 2px 8px #6366f11a;
  outline: none;
  transition: border 0.2s, box-shadow 0.2s;
}
.search-input:focus {
  border-color: #06b6d4;
  box-shadow: 0 4px 16px #06b6d422;
}
.search-count {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #64748b;
  font-size: 0.95rem;
}
.search-sort {
  width: 100%;
  padding: 0.9rem 1.2rem;
  border: 2px solid #a5b4fc;
  border-radius: 1rem;
  font-size: 1.1rem;
  background: rgba(255,255,255,0.85);
  box-shadow: 0 2px 8px #6366f11a;
  outline: none;
  transition: border 0.2s, box-shadow 0.2s;
}
.search-sort:focus {
  border-color: #06b6d4;
  box-shadow: 0 4px 16px #06b6d422;
}
.results-info {
  text-align: center;
  font-size: 1.2rem;
  color: #3730a3;
  margin-bottom: 2.2rem;
  font-weight: 600;
}
.results-count {
  display: inline-block;
  font-size: 1.5rem;
  font-weight: 900;
  color: #06b6d4;
  background: #fff;
  border-radius: 0.7rem;
  padding: 0.2rem 1.2rem;
  margin: 0 0.7rem;
  box-shadow: 0 1px 4px #0001;
}
.loading-wrap {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 180px;
}
.loading-spinner {
  width: 60px;
  height: 60px;
  border: 6px solid #a5b4fc;
  border-top: 6px solid #06b6d4;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}
@keyframes spin {
  to { transform: rotate(360deg);}
}
.diary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 2.5rem;
  margin-bottom: 2.5rem;
}
.diary-card {
  background: linear-gradient(135deg, #f1f5ffcc 0%, #dbeafe88 100%);
  border-radius: 1.3rem;
  box-shadow: 0 4px 24px 0 #6366f11a;
  padding: 2rem 1.5rem 1.5rem 1.5rem;
  display: flex;
  flex-direction: column;
  min-height: 320px;
  position: relative;
  transition: transform 0.2s, box-shadow 0.2s;
  border: 1.5px solid #a5b4fc55;
}
.diary-card:hover {
  transform: translateY(-8px) scale(1.03);
  box-shadow: 0 12px 32px 0 #6366f133;
}
.diary-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.2rem;
}
.diary-title {
  font-size: 1.3rem;
  font-weight: 700;
  color: #3730a3;
  flex: 1;
  margin-right: 1rem;
}
.diary-public {
  background: linear-gradient(90deg, #06b6d4 0%, #a5b4fc 100%);
  color: #fff;
  font-size: 0.95rem;
  font-weight: 700;
  border-radius: 1rem;
  padding: 0.3rem 1.1rem;
  box-shadow: 0 1px 4px #06b6d422;
}
.diary-content {
  color: #334155;
  font-size: 1.08rem;
  margin-bottom: 1.5rem;
  flex: 1;
  line-height: 1.7;
  word-break: break-all;
}
.diary-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.98rem;
  color: #64748b;
  border-top: 1px solid #e0e7ff;
  padding-top: 0.7rem;
  margin-bottom: 1.2rem;
}
.read-btn {
  width: 100%;
  background: linear-gradient(90deg, #06b6d4 0%, #a5b4fc 100%);
  color: #fff;
  font-weight: 700;
  font-size: 1.1rem;
  border: none;
  border-radius: 0.9rem;
  padding: 0.9rem 0;
  margin-top: 0.7rem;
  box-shadow: 0 2px 8px #06b6d422;
  cursor: pointer;
  transition: background 0.2s, transform 0.2s;
}
.read-btn:hover {
  background: linear-gradient(90deg, #22d3ee 0%, #818cf8 100%);
  transform: scale(1.03);
}
.empty-state {
  text-align: center;
  padding: 4rem 1rem;
}
.empty-card {
  display: inline-block;
  background: linear-gradient(135deg, #f1f5ffcc 0%, #dbeafe88 100%);
  border-radius: 1.5rem;
  box-shadow: 0 4px 24px 0 #6366f11a;
  padding: 3rem 2.5rem;
  border: 1.5px solid #a5b4fc55;
}
.empty-icon {
  width: 70px;
  height: 70px;
  margin: 0 auto 1.5rem auto;
  border-radius: 50%;
  background: linear-gradient(135deg, #a5b4fc 0%, #06b6d4 100%);
  opacity: 0.25;
}
.empty-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #3730a3;
  margin-bottom: 0.7rem;
}
.empty-desc {
  color: #64748b;
  font-size: 1.1rem;
}
.pagination-wrap {
  display: flex;
  justify-content: center;
  margin: 2.5rem 0 1.5rem 0;
}
.pagination-nav {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.pagination-btn {
  background: #fff;
  color: #3730a3;
  border: 1.5px solid #a5b4fc;
  border-radius: 0.7rem;
  padding: 0.5rem 1.2rem;
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
}
.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.pagination-page {
  background: #fff;
  color: #3730a3;
  border: 1.5px solid #a5b4fc;
  border-radius: 0.7rem;
  padding: 0.5rem 1.2rem;
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
  margin: 0 0.1rem;
}
.pagination-page-active {
  background: linear-gradient(90deg, #06b6d4 0%, #a5b4fc 100%);
  color: #fff;
  border: 1.5px solid #06b6d4;
}
.modal-bg {
  position: fixed;
  inset: 0;
  background: rgba(30, 41, 59, 0.55);
  backdrop-filter: blur(6px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}
.modal-content-wrap {
  background: linear-gradient(135deg, #f1f5ffcc 0%, #dbeafe88 100%);
  border-radius: 1.5rem;
  box-shadow: 0 8px 32px 0 #6366f133;
  max-width: 700px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  border: 1.5px solid #a5b4fc55;
  position: relative;
}
.modal-content-inner {
  padding: 2.5rem 2rem;
}
.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
}
.modal-title {
  font-size: 2rem;
  font-weight: 900;
  background: linear-gradient(90deg, #67e8f9, #a5b4fc, #c4b5fd);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
.modal-title-strong {
  font-size: 2.2rem;
  font-weight: 900;
  color: #3730a3;
  background: none;
  -webkit-background-clip: unset;
  -webkit-text-fill-color: unset;
  background-clip: unset;
  text-shadow: 0 2px 8px #0001;
}
.modal-close {
  background: none;
  border: none;
  font-size: 2.2rem;
  color: #64748b;
  cursor: pointer;
  transition: color 0.2s;
  border-radius: 50%;
  width: 2.5rem;
  height: 2.5rem;
  line-height: 2.5rem;
  text-align: center;
}
.modal-close:hover {
  color: #06b6d4;
  background: #e0e7ff;
}
.modal-meta {
  display: flex;
  align-items: center;
  gap: 1.2rem;
  font-size: 1.05rem;
  color: #64748b;
  border-bottom: 1px solid #e0e7ff;
  padding-bottom: 1rem;
  margin-bottom: 1.5rem;
}
.modal-meta-public {
  background: linear-gradient(90deg, #06b6d4 0%, #a5b4fc 100%);
  color: #fff;
  font-size: 0.95rem;
  font-weight: 700;
  border-radius: 1rem;
  padding: 0.3rem 1.1rem;
  box-shadow: 0 1px 4px #06b6d422;
}
.modal-content-main {
  color: #334155;
  font-size: 1.13rem;
  line-height: 1.8;
  word-break: break-all;
}
.modal-content-text {
  background: rgba(255,255,255,0.7);
  border-radius: 1rem;
  padding: 1.5rem;
  border: 1px solid #e0e7ff;
  box-shadow: 0 2px 8px #6366f11a;
}

/* 固定回到主板按钮样式 */
.dashboard-btn-fixed {
  position: fixed;
  top: 18px;
  left: 18px;
  z-index: 2000;
}
</style>
