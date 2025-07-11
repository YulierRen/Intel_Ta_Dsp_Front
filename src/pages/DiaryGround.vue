<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 font-sans text-gray-800">
    <!-- Header -->
    <header class="bg-white shadow-xl border-b-2 border-blue-200">
      <div class="max-w-6xl mx-auto px-4 py-6">
        <h1 class="text-4xl font-extrabold text-gray-900 tracking-tight">公开日记</h1>
        <p class="text-gray-600 mt-2 text-lg">发现和分享生活中的美好时刻</p>
      </div>
    </header>

    <!-- Search Section -->
    <div class="max-w-6xl mx-auto px-4 py-10">
      <div class="bg-white rounded-2xl shadow-xl p-8 mb-10 border-2 border-blue-100">
        <div class="flex flex-col md:flex-row gap-6">
          <div class="flex-1">
            <label for="search" class="block text-sm font-medium text-gray-700 mb-2">
              搜索日记
            </label>
            <div class="relative">
              <Search class="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-400 w-5 h-5" />
              <input
                  id="search"
                  v-model="searchQuery"
                  type="text"
                  placeholder="搜索标题或内容..."
                  class="w-full pl-12 pr-4 py-3 border-2 border-blue-300 rounded-lg focus:ring-3 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ease-in-out text-base shadow-sm"
                  @input="handleSearch"
              />
            </div>
          </div>
          <div class="md:w-48">
            <label for="sort" class="block text-sm font-medium text-gray-700 mb-2">
              排序方式
            </label>
            <select
                id="sort"
                v-model="sortBy"
                class="w-full px-4 py-3 border-2 border-blue-300 rounded-lg focus:ring-3 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ease-in-out text-base bg-white appearance-none shadow-sm"
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
      <div class="mb-8 text-lg text-gray-700">
        <p>
          找到 <span class="font-bold text-blue-700">{{ filteredDiaries.length }}</span> 篇公开日记
        </p>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center py-20">
        <div class="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
      </div>

      <!-- Diary Grid -->
      <div v-else-if="filteredDiaries.length > 0" class="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        <div
            v-for="diary in paginatedDiaries"
            :key="diary.id"
            class="bg-white rounded-xl shadow-lg border-2 border-blue-200 hover:shadow-2xl hover:border-blue-400 transition-all duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-[1.01] overflow-hidden"
        >
          <div class="p-6">
            <div class="flex items-start justify-between mb-3">
              <h3 class="text-xl font-semibold text-gray-900 line-clamp-2 pr-4">
                {{ diary.title }}
              </h3>
              <div class="flex items-center text-green-700 bg-green-100 px-3 py-1 rounded-full text-xs font-medium ml-2 whitespace-nowrap border border-green-300">
                <Globe class="w-3 h-3 mr-1" />
                公开
              </div>
            </div>

            <p class="text-gray-700 text-sm mb-4 line-clamp-3 leading-relaxed">
              {{ diary.content }}
            </p>

            <div class="flex items-center justify-between text-sm text-gray-600 border-t border-gray-200 pt-4 mt-4">
              <div class="flex items-center">
                <User class="w-4 h-4 mr-1 text-blue-400" />
                用户 {{ diary.userId }}
              </div>
              <div class="flex items-center">
                <Calendar class="w-4 h-4 mr-1 text-blue-400" />
                {{ formatDate(diary.createdAt) }}
              </div>
            </div>

            <button
                @click="openDiary(diary)"
                class="mt-6 w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-semibold shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 border border-blue-700"
            >
              阅读全文
            </button>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-20">
        <BookOpen class="w-20 h-20 text-gray-400 mx-auto mb-6" />
        <h3 class="text-2xl font-medium text-gray-900 mb-3">暂无公开日记</h3>
        <p class="text-gray-600 text-lg">{{ searchQuery ? '没有找到匹配的日记' : '还没有用户分享公开日记' }}</p>
      </div>

      <!-- Pagination -->
      <div v-if="filteredDiaries.length > itemsPerPage" class="flex justify-center mt-12">
        <nav class="flex items-center space-x-2">
          <button
              @click="currentPage = Math.max(1, currentPage - 1)"
              :disabled="currentPage === 1"
              class="px-4 py-2 rounded-lg border-2 border-gray-300 text-gray-700 hover:bg-blue-50 hover:border-blue-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            <ChevronLeft class="w-5 h-5" />
          </button>

          <span
              v-for="page in visiblePages"
              :key="page"
              @click="typeof page === 'number' && (currentPage = page)"
              :class="[
              'px-4 py-2 rounded-lg cursor-pointer text-lg font-medium',
              typeof page === 'number' && page === currentPage
                ? 'bg-blue-700 text-white shadow-md border-2 border-blue-700'
                : 'border-2 border-gray-300 text-gray-700 hover:bg-blue-50 hover:border-blue-400 transition-colors duration-200'
            ]"
          >
            {{ page }}
          </span>

          <button
              @click="currentPage = Math.min(totalPages, currentPage + 1)"
              :disabled="currentPage === totalPages"
              class="px-4 py-2 rounded-lg border-2 border-gray-300 text-gray-700 hover:bg-blue-50 hover:border-blue-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            <ChevronRight class="w-5 h-5" />
          </button>
        </nav>
                                                                                                                                         </div>
    </div>

    <!-- Diary Modal -->
    <Transition name="modal-fade">
      <div
          v-if="selectedDiary"
          class="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50"
          @click="closeDiary"
      >
        <Transition name="modal-content">
          <div
              v-if="selectedDiary"
              class="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl transform scale-100 opacity-100 border-2 border-blue-300"
              @click.stop
          >
            <div class="p-8">
              <div class="flex items-start justify-between mb-6">
                <h2 class="text-3xl font-bold text-gray-900 pr-6 leading-tight">
                  {{ selectedDiary.title }}
                </h2>
                <button
                    @click="closeDiary"
                    class="text-gray-500 hover:text-gray-800 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400 rounded-full p-1"
                >
                  <X class="w-7 h-7" />
                </button>
              </div>

              <div class="flex flex-wrap items-center text-base text-gray-600 mb-8 space-x-4 border-b border-gray-300 pb-4">
                <div class="flex items-center">
                  <User class="w-5 h-5 mr-1 text-blue-500" />
                  用户 {{ selectedDiary.userId }}
                </div>
                <div class="flex items-center">
                  <Calendar class="w-5 h-5 mr-1 text-blue-500" />
                  {{ formatDate(selectedDiary.createdAt) }}
                </div>
                <div class="flex items-center text-green-700 bg-green-100 px-3 py-1 rounded-full text-sm font-medium border border-green-300">
                  <Globe class="w-4 h-4 mr-1" />
                  公开
                </div>
              </div>

              <div class="prose max-w-none text-gray-800 text-lg leading-relaxed">
                <p class="whitespace-pre-wrap">
                  {{ selectedDiary.content }}
                </p>
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
import axios from 'axios'

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
/* Standard line-clamp properties for compatibility */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Custom styles for modal transitions */
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
  transition: transform 0.3s ease-out, opacity 0.3s ease-out;
}
.modal-content-enter-from,
.modal-content-leave-to {
  transform: translateY(20px) scale(0.95);
  opacity: 0;
}
/* 自定义 modal 进入离开动画 */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}
.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

/* modal 内容淡入缩放动画 */
.modal-content-enter-active,
.modal-content-leave-active {
  transition: all 0.4s ease;
}
.modal-content-enter-from {
  opacity: 0;
  transform: scale(0.95);
}
.modal-content-leave-to {
  opacity: 0;
  transform: scale(1.05);
}

/* 更柔和的 scrollbar */
::-webkit-scrollbar {
  width: 8px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.1);
  border-radius: 4px;
}


/* Custom style for select arrow */
select {
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
  background-position: right 0.75rem center;
  background-repeat: no-repeat;
  background-size: 1.5em 1.5em;
  padding-right: 2.5rem;
}

.bg-white {
  background: rgba(255,255,255,0.98) !important;
}
.shadow-xl, .shadow-lg {
  box-shadow: 0 12px 40px 0 rgba(80, 112, 255, 0.18), 0 1.5px 8px 0 rgba(80, 112, 255, 0.08) !important;
}
.rounded-xl, .rounded-2xl {
  border-radius: 18px !important;
}
.bg-blue-600 {
  background: linear-gradient(90deg, #74ABE2 0%, #5563DE 100%) !important;
}
.bg-blue-700 {
  background: linear-gradient(90deg, #5563DE 0%, #74ABE2 100%) !important;
}
.border-blue-200, .border-blue-300, .border-blue-400 {
  border-width: 2px !important;
}
button, .btn-login {
  transition: background 0.3s, transform 0.15s !important;
}
button:hover, .btn-login:hover {
  transform: translateY(-2px) scale(1.03) !important;
}
.animated-fadein {
  animation: fadein 0.8s cubic-bezier(.68,-0.55,.27,1.55);
}
@keyframes fadein {
  0% { opacity: 0; transform: scale(0.96) translateY(40px);}
  100% { opacity: 1; transform: scale(1) translateY(0);}
}
</style>
