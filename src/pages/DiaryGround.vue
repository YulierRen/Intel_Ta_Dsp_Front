<template>
  <div class="diaryground-bg">
    <!-- 顶部标题 -->
    <div class="header-bar">
      <div class="header-title">
        <span class="icon">📖</span>
        <span>日程广场</span>
      </div>
      <div class="header-desc">发现和分享生活中的美好</div>
    </div>
    <div class="dashboard-btn-wrapper">
      <button class="dashboard-btn" @click="goToDashboard">
        回到主板
      </button>
    </div>
    <!-- 搜索栏 -->
    <div class="search-bar-center">
      <div class="search-bar-inner">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="搜索标题或内容..."
          class="search-input"
          @input="handleSearch"
        />
        <span class="search-icon">🔍</span>
        <select v-model="sortBy" class="sort-select" @change="handleSort">
          <option value="newest">最新发布</option>
          <option value="oldest">最早发布</option>
          <option value="title">标题排序</option>
        </select>
      </div>
      <div class="search-result-info">
        找到 <span class="highlight">{{ filteredDiaries.length }}</span> 篇公开日记
      </div>
    </div>

    <!-- 帖子栅格 -->
    <div v-if="loading" class="loading-spinner">
      <div class="spinner"></div>
    </div>
    <div v-else>
      <div v-if="filteredDiaries.length > 0" class="diary-grid">
        <div
          v-for="diary in paginatedDiaries"
          :key="diary.id"
          class="diary-card"
          @click="openDiary(diary)"
        >
          <div class="diary-card-header">
            <span class="diary-title">{{ diary.title }}</span>
            <span class="diary-public">公开</span>
          </div>
          <div class="diary-content-preview">
            {{ diary.content.length > 80 ? diary.content.slice(0, 80) + '...' : diary.content }}
          </div>
          <div class="diary-card-footer">
            <span class="user-info">👤 用户{{ diary.userId }}</span>
            <span class="date-info">🗓 {{ formatDate(diary.createdAt) }}</span>
          </div>
        </div>
      </div>
      <div v-else class="empty-state">
        <div class="empty-icon">📭</div>
        <div class="empty-title">暂无公开日记</div>
        <div class="empty-desc">{{ searchQuery ? '没有找到匹配的日记' : '还没有用户分享公开日记' }}</div>
      </div>
    </div>

    <!-- 分页 -->
    <div v-if="filteredDiaries.length > itemsPerPage" class="pagination-bar">
      <button
        @click="currentPage = Math.max(1, currentPage - 1)"
        :disabled="currentPage === 1"
        class="pagination-btn"
      >‹</button>
      <span
        v-for="page in visiblePages"
        :key="page"
        @click="typeof page === 'number' && (currentPage = page)"
        :class="[
          'pagination-page',
          typeof page === 'number' && page === currentPage ? 'active' : '',
          typeof page !== 'number' ? 'ellipsis' : ''
        ]"
      >{{ page }}</span>
      <button
        @click="currentPage = Math.min(totalPages, currentPage + 1)"
        :disabled="currentPage === totalPages"
        class="pagination-btn"
      >›</button>
    </div>

    <!-- 日记详情弹窗 -->
    <transition name="modal-fade">
      <div
        v-if="selectedDiary"
        class="modal-mask"
        @click="closeDiary"
      >
        <transition name="modal-content">
          <div
            v-if="selectedDiary"
            class="modal-content"
            @click.stop
          >
            <div class="modal-header">
              <span class="modal-title">{{ selectedDiary.title }}</span>
              <button class="modal-close" @click="closeDiary">×</button>
            </div>
            <div class="modal-meta">
              <span>👤 用户{{ selectedDiary.userId }}</span>
              <span>🗓 {{ formatDate(selectedDiary.createdAt) }}</span>
              <span class="diary-public">公开</span>
            </div>
            <div class="modal-body">
              <pre>{{ selectedDiary.content }}</pre>
            </div>
          </div>
        </transition>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
import {useRouter} from "vue-router";

const diaries = ref([])
const searchQuery = ref('')
const sortBy = ref('newest')
const loading = ref(true)
const selectedDiary = ref(null)
const currentPage = ref(1)
const itemsPerPage = 12

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

const filteredDiaries = computed(() => {
  let filtered = diaries.value.filter(diary => diary.isPublic)
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(diary =>
      diary.title.toLowerCase().includes(query) ||
      diary.content.toLowerCase().includes(query)
    )
  }
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
const router = useRouter()
const goToDashboard = () => {
  router.push('/dashboard')
}
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
    for (let i = 1; i <= total; i++) pages.push(i)
  } else {
    if (current <= 4) {
      for (let i = 1; i <= 5; i++) pages.push(i)
      pages.push('...', total)
    } else if (current >= total - 3) {
      pages.push(1, '...')
      for (let i = total - 4; i <= total; i++) pages.push(i)
    } else {
      pages.push(1, '...')
      for (let i = current - 1; i <= current + 1; i++) pages.push(i)
      pages.push('...', total)
    }
  }
  return pages.filter((page, idx, arr) => page !== '...' || arr.indexOf(page) === idx)
})

const handleSearch = () => { currentPage.value = 1 }
const handleSort = () => { currentPage.value = 1 }
const openDiary = (diary) => { selectedDiary.value = diary }
const closeDiary = () => { selectedDiary.value = null }
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

onMounted(async () => {
  try {
    const res = await axios.post('/userDiary/findPublicDiaries')
    diaries.value = res || []
  } catch (e) {
    diaries.value = mockDiaries
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
/* 背景渐变与整体风格 */
.diaryground-bg {
  min-height: 100vh;
  background: linear-gradient(135deg, #74ABE2 0%, #000cb3 100%);
  font-family: 'Inter', 'Roboto', system-ui, sans-serif;
  padding-bottom: 60px;
}

/* 顶部标题栏 */
.header-bar {
  width: 100%;
  max-width: 900px;
  margin: 0 auto;
  padding: 48px 0 18px 0;
  text-align: center;
}
.header-title {
  font-size: 2.4rem;
  font-weight: 800;
  color: #fff;
  letter-spacing: 2px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  text-shadow: 0 2px 12px rgba(80,112,255,0.12);
}
.header-title .icon {
  font-size: 2.5rem;
}
.header-desc {
  color: #e0e7ff;
  font-size: 1.15rem;
  margin-top: 8px;
  letter-spacing: 1px;
}

/* 搜索栏居中 */
.search-bar-center {
  width: 100%;
  max-width: 700px;
  margin: 0 auto 32px auto;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.search-bar-inner {
  width: 100%;
  display: flex;
  align-items: center;
  background: rgba(255,255,255,0.95);
  border-radius: 18px;
  box-shadow: 0 4px 24px 0 rgba(80, 112, 255, 0.10);
  padding: 0 18px;
  position: relative;
  margin-bottom: 10px;
}
.search-input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  font-size: 1.1rem;
  padding: 18px 16px 18px 40px;
  color: #333;
  border-radius: 18px;
}
.search-input::placeholder {
  color: #b0b8d1;
}
.search-icon {
  position: absolute;
  left: 16px;
  font-size: 1.2rem;
  color: #74ABE2;
  pointer-events: none;
}
.sort-select {
  margin-left: 18px;
  border: none;
  background: #f0f4ff;
  color: #5563DE;
  font-size: 1rem;
  border-radius: 12px;
  padding: 8px 18px;
  outline: none;
  font-weight: 600;
  box-shadow: 0 1px 6px #a5b4fc22;
  transition: background 0.2s;
}
.sort-select:focus {
  background: #e0e7ff;
}
.search-result-info {
  color: #fff;
  font-size: 1.08rem;
  margin-top: 2px;
  text-align: left;
  width: 100%;
}
.highlight {
  color: #fffb7d;
  font-weight: bold;
}

/* 栅格卡片展示 */
.diary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(290px, 1fr));
  gap: 32px;
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 18px;
}
.diary-card {
  background: rgba(255,255,255,0.97);
  border-radius: 18px;
  box-shadow: 0 6px 24px 0 rgba(80, 112, 255, 0.13);
  padding: 28px 22px 18px 22px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  min-height: 180px;
  transition: transform 0.18s, box-shadow 0.18s;
  border: 1.5px solid #e0e7ff;
}
.diary-card:hover {
  transform: translateY(-4px) scale(1.025);
  box-shadow: 0 12px 40px 0 rgba(80, 112, 255, 0.18);
  border-color: #74ABE2;
}
.diary-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}
.diary-title {
  font-size: 1.18rem;
  font-weight: 700;
  color: #5563DE;
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.diary-public {
  background: linear-gradient(90deg, #74ABE2 0%, #5563DE 100%);
  color: #fff;
  font-size: 0.88rem;
  border-radius: 10px;
  padding: 2px 12px;
  margin-left: 8px;
  font-weight: 600;
  letter-spacing: 1px;
}
.diary-content-preview {
  color: #444;
  font-size: 1rem;
  margin-bottom: 18px;
  min-height: 48px;
  line-height: 1.6;
  word-break: break-all;
}
.diary-card-footer {
  display: flex;
  justify-content: space-between;
  color: #a0aec0;
  font-size: 0.98rem;
  margin-top: auto;
}
.user-info, .date-info {
  display: flex;
  align-items: center;
  gap: 3px;
}

/* 空状态 */
.empty-state {
  text-align: center;
  color: #fff;
  margin-top: 80px;
}
.empty-icon {
  font-size: 4rem;
  margin-bottom: 18px;
}
.empty-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 8px;
}
.empty-desc {
  font-size: 1.1rem;
  color: #e0e7ff;
}

/* 分页 */
.pagination-bar {
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 38px 0 0 0;
  gap: 6px;
}
.pagination-btn {
  background: linear-gradient(90deg, #74ABE2 0%, #5563DE 100%);
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 6px 16px;
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s, transform 0.2s;
}
.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.pagination-page {
  background: #f0f4ff;
  color: #5563DE;
  border-radius: 8px;
  padding: 6px 14px;
  font-size: 1.05rem;
  font-weight: 600;
  margin: 0 2px;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
}
.pagination-page.active {
  background: linear-gradient(90deg, #5563DE 0%, #74ABE2 100%);
  color: #fff;
  box-shadow: 0 2px 8px #a5b4fc33;
}
.pagination-page.ellipsis {
  background: transparent;
  color: #b0b8d1;
  cursor: default;
  font-size: 1.1rem;
  padding: 6px 6px;
}

/* 加载动画 */
.loading-spinner {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 260px;
}
.spinner {
  border: 4px solid #e0e7ff;
  border-top: 4px solid #74ABE2;
  border-radius: 50%;
  width: 44px;
  height: 44px;
  animation: spin 1s linear infinite;
}
@keyframes spin {
  0% { transform: rotate(0);}
  100% { transform: rotate(360deg);}
}

/* 弹窗样式 */
.modal-mask {
  position: fixed;
  z-index: 1000;
  inset: 0;
  background: rgba(30, 41, 59, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
}
.modal-content {
  background: #fff;
  border-radius: 18px;
  max-width: 540px;
  width: 96vw;
  box-shadow: 0 12px 40px 0 rgba(80, 112, 255, 0.18);
  padding: 32px 28px 24px 28px;
  position: relative;
  animation: fadein 0.7s cubic-bezier(.68,-0.55,.27,1.55);
}
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

@keyframes fadein {
  0% { opacity: 0; transform: scale(0.96) translateY(40px);}
  100% { opacity: 1; transform: scale(1) translateY(0);}
}
.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}
.modal-title {
  font-size: 1.4rem;
  font-weight: 700;
  color: #5563DE;
  flex: 1;
  margin-right: 16px;
}
.modal-close {
  background: none;
  border: none;
  font-size: 2rem;
  color: #a0aec0;
  cursor: pointer;
  transition: color 0.2s;
}
.modal-close:hover {
  color: #5563DE;
}
.modal-meta {
  color: #a0aec0;
  font-size: 1rem;
  display: flex;
  gap: 18px;
  margin-bottom: 18px;
  align-items: center;
}
.modal-body {
  color: #444;
  font-size: 1.08rem;
  line-height: 1.7;
  white-space: pre-wrap;
  word-break: break-all;
  margin-top: 10px;
}

/* 弹窗动画 */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}
.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}
.modal-content-enter-active,
.modal-content-leave-active {
  transition: all 0.4s cubic-bezier(.68,-0.55,.27,1.55);
}
.modal-content-enter-from {
  opacity: 0;
  transform: scale(0.95);
}
.modal-content-leave-to {
  opacity: 0;
  transform: scale(1.05);
}

/* 响应式 */
@media (max-width: 900px) {
  .header-bar, .search-bar-center, .diary-grid {
    max-width: 98vw;
    padding-left: 6px;
    padding-right: 6px;
  }
  .diary-card {
    padding: 18px 10px 12px 10px;
  }
}
@media (max-width: 600px) {
  .header-title {
    font-size: 1.5rem;
  }
  .diary-card {
    min-height: 120px;
  }
  .modal-content {
    padding: 18px 8px 12px 8px;
  }
}
</style>
