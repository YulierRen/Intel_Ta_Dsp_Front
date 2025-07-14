<script setup>
import { useRouter } from 'vue-router'
import { ref } from 'vue'
import Schedule from './DashBoard/Schedule.vue'
import axios from '@/utils/axios' // 确保路径正确


const scheduleRef = ref(null)

const router = useRouter()

// 页面跳转函数
function gotoDiaryGround() {
  router.push('/diaryground')
}
function gotoHomePage() {
  router.push('/homepage')
}
function gotoFriendList() {
  router.push('/friendlist')
}

// AI 生成日程数据绑定
const requirements = ref('')
const startTime = ref('')
const endTime = ref('')
const aiLoading = ref(false)
const aiError = ref('')
const aiResult = ref('')

async function generateSchedule() {
  aiError.value = ''
  aiResult.value = ''
  aiLoading.value = true

  try {
    const studentId = localStorage.getItem('studentId')
    const token = localStorage.getItem('token') // ✅ 添加 token 获取

    if (!studentId || !token) {
      aiError.value = '请先登录'
      aiLoading.value = false
      return
    }

    function formatDate(dateStr) {
      const date = new Date(dateStr)
      const pad = n => (n < 10 ? '0' + n : n)
      return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
    }

    const response = await axios.post('/ai/generateSchedule', {
      userId: Number(studentId),
      requirements: requirements.value,
      startTime: formatDate(startTime.value),
      endTime: formatDate(endTime.value)
    })

    scheduleRef.value?.loadSchedule()
    aiResult.value = typeof response === 'string'
        ? response
        : (response.result || '生成成功')

  } catch (e) {
    console.error('AI生成失败：', e)
    aiError.value =
        e?.response?.data?.msg ||
        (typeof e === 'string' ? e : '') ||
        '生成失败'
  } finally {
    aiLoading.value = false
  }
}
</script>


<template>
  <div class="dashboard-layout">
    <!-- 左侧栏 -->
    <div class="dashboard-sidebar">
      <div class="sidebar-card top" @click="gotoDiaryGround">
        <div class="sidebar-icon">📖</div>
        <div>
          <div class="sidebar-title">日程广场</div>
          <div class="sidebar-desc">发现大家的日程与动态</div>
        </div>
      </div>
      <div class="sidebar-card top" @click="gotoHomePage">
        <div class="sidebar-icon">📅</div>
        <div>
          <div class="sidebar-title">个人主页</div>
          <div class="sidebar-desc">我的主页</div>
        </div>
      </div>
      <div class="sidebar-card top" @click="gotoDiaryGround">
        <div class="sidebar-icon">📖</div>
        <div>
          <div class="sidebar-title">可扩展选项</div>
          <div class="sidebar-desc">建设中</div>
        </div>
      </div>
      <div class="sidebar-card top" @click="gotoDiaryGround">
        <div class="sidebar-icon">📖</div>
        <div>
          <div class="sidebar-title">可扩展选项</div>
          <div class="sidebar-desc">建设中</div>
        </div>
      </div>
      <div class="sidebar-card bottom" @click="gotoFriendList">
        <div class="sidebar-icon">👥</div>
        <div>
          <div class="sidebar-title">朋友们</div>
          <div class="sidebar-desc">查看好友和互动</div>
        </div>
      </div>
    </div>

    <!-- 新增：AI智能生成日程模块 -->
    <div class="dashboard-ai-bar">
      <div class="dashboard-ai-title">
        Ta律，做你想做的
      </div>
      <div class="dashboard-ai-form">
        <input
          v-model="requirements"
          class="ai-input"
          type="text"
          placeholder="日程需求"
          maxlength="100"
        />
        <input
          v-model="startTime"
          class="ai-time"
          type="datetime-local"
          placeholder="开始时间"
        />
        <input
          v-model="endTime"
          class="ai-time"
          type="datetime-local"
          placeholder="结束时间"
        />
        <button class="ai-btn" @click="generateSchedule" :disabled="aiLoading">
          {{ aiLoading ? '生成中...' : 'AI生成' }}
        </button>
      </div>
      <div v-if="aiError" class="ai-error">{{ aiError }}</div>
      <div v-if="aiResult" class="ai-result">{{ aiResult }}</div>
    </div>

    <!-- 中间日程模块 -->
    <div class="dashboard-main">
      <Schedule ref="scheduleRef" style="width:100%;height:100%;" />
    </div>

  </div>
</template>

<style scoped>
.dashboard-layout {
  display: flex;
  min-height: 100vh;
  background: #ffffff;
  font-family: 'Inter', system-ui, sans-serif;
  position: relative;
  overflow: hidden;
}
.dashboard-sidebar {
  width: 220px;
  display: flex;
  flex-direction: column;
  gap: 32px;
  padding: 48px 18px 48px 28px;
  background: linear-gradient(135deg, #74ABE2 0%, #5563DE 100%);
  box-shadow: 4px 0 24px 0 rgba(80, 112, 255, 0.08);
  z-index: 2;
  justify-content: flex-start;
}
.sidebar-card {
  display: flex;
  align-items: center;
  gap: 18px;
  background: rgba(255,255,255,0.13);
  border-radius: 16px;
  padding: 24px 18px;
  cursor: pointer;
  box-shadow: 0 2px 10px 0 rgba(80, 112, 255, 0.08);
  transition: background 0.2s, transform 0.2s;
  border: 1.5px solid rgba(255,255,255,0.18);
  margin-bottom: 0;
}
.sidebar-card:hover {
  background: rgba(255,255,255,0.22);
  transform: translateY(-2px) scale(1.03);
}
.sidebar-icon {
  font-size: 2.2rem;
  color: #fff;
  text-shadow: 0 2px 10px #a5b4fc55;
}
.sidebar-title {
  font-size: 1.18rem;
  font-weight: bold;
  color: #fff;
  margin-bottom: 4px;
  letter-spacing: 1px;
}
.sidebar-desc {
  font-size: 0.98rem;
  color: #e0e7ff;
  opacity: 0.85;
}
.sidebar-card.top {
  margin-bottom: 20px;
}
.sidebar-card.bottom {
  margin-top: auto;
}
.dashboard-main {
  flex: 1;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 48px 0;
  z-index: 3;
  /* 新增：让日程模块宽度100%，去除最大宽度限制 */
  width: 100%;
  max-width: none;
  max-height: none;
}
.dashboard-main > * {
  width: 100%;
  /* 让Schedule组件自适应填满 */
}
.dashboard-recommend {
  width: 320px;
  background: rgba(255,255,255,0.92);
  box-shadow: -4px 0 24px 0 rgba(80, 112, 255, 0.08);
  padding: 48px 28px;
  display: flex;
  flex-direction: column;
  z-index: 2;
}
.recommend-title {
  font-size: 1.3rem;
  font-weight: bold;
  color: #5563DE;
  margin-bottom: 22px;
  letter-spacing: 1px;
}
.recommend-list {
  display: flex;
  flex-direction: column;
  gap: 22px;
}
.recommend-item {
  background: linear-gradient(90deg, #74ABE2 0%, #e0e7ff 100%);
  border-radius: 14px;
  padding: 18px 16px 14px 16px;
  box-shadow: 0 2px 8px #a5b4fc22;
  transition: box-shadow 0.2s;
}
.recommend-item:hover {
  box-shadow: 0 6px 24px #a5b4fc33;
}
.diary-title {
  font-size: 1.08rem;
  font-weight: 600;
  color: #5563DE;
  margin-bottom: 6px;
}
.diary-meta {
  font-size: 0.95rem;
  color: #888;
  margin-bottom: 7px;
  display: flex;
  gap: 12px;
}
.diary-author {
  color: #74ABE2;
}
.diary-date {
  color: #b0b8e6;
}
.diary-excerpt {
  font-size: 0.98rem;
  color: #333;
  opacity: 0.92;
  line-height: 1.5;
}
.filter-container {
  display: flex;
  gap: 20px;
  align-items: center;
  margin-bottom: 20px;
}

input[type="text"],
input[type="date"] {
  padding: 8px 12px;
  border: 1px solid #ccc;
  border-radius: 6px;
}

#result {
  margin-top: 20px;
  background: white;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
}
.dashboard-ai-bar {
  position: absolute;
  top: 20px;         /* 👈 控制纵坐标：距离父元素顶部 50px */
  left: 39.4%;         /* 👈 水平居中 */
  transform: translateX(-50%); /* 👈 修正 left:50% 的居中偏移 */
  display: flex;
  align-items: center;
  gap: 18px;
  z-index: 10;
  background: rgba(255, 255, 255, 0.85);
  border-radius: 14px;
  box-shadow: 0 2px 12px #a5b4fc22;
  padding: 12px 18px;
  min-width: 0;
  max-width: 900px;
  margin: 0 auto;
  width: fit-content;
}

.dashboard-ai-title {
  font-size: 1.2rem;
  font-weight: bold;
  background: linear-gradient(90deg, #ff0066, #0ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-right: 18px;
  flex-shrink: 0;
  min-width: 120px;
}
.dashboard-ai-form {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
}
.ai-input {
  width: 160px;
  padding: 6px 12px;
  border-radius: 8px;
  border: 1.5px solid #a5b4fc;
  font-size: 1rem;
  background: #f7faff;
  transition: border 0.2s;
}
.ai-input:focus {
  border-color: #74ABE2;
  outline: none;
}
.ai-time {
  width: 140px;
  padding: 6px 8px;
  border-radius: 8px;
  border: 1.5px solid #a5b4fc;
  font-size: 1rem;
  background: #f7faff;
  transition: border 0.2s;
}
.ai-time:focus {
  border-color: #74ABE2;
  outline: none;
}
.ai-btn {
  background: linear-gradient(90deg, #5563DE 0%, #74ABE2 100%);
  color: #fff;
  border: none;
  border-radius: 10px;
  padding: 8px 20px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 2px 8px #a5b4fc33;
  transition: background 0.2s, transform 0.2s;
}
.ai-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.ai-btn:hover:not(:disabled) {
  background: linear-gradient(90deg, #74ABE2 0%, #5563DE 100%);
  transform: scale(1.04);
}
.ai-error {
  color: #e74c3c;
  margin-left: 18px;
  font-size: 1rem;
  font-weight: 600;
}
.ai-result {
  color: #059669;
  margin-left: 18px;
  font-size: 1rem;
  font-weight: 600;
  max-width: 320px;
  word-break: break-all;
}
@media (max-width: 1200px) {
  .dashboard-ai-bar {
    max-width: 98vw;
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
    padding: 10px 6px;
    margin: 18px auto 0 auto;
  }
  .dashboard-ai-form {
    flex-direction: column;
    gap: 8px;
    align-items: stretch;
  }
}
@media (max-width: 900px) {
  .dashboard-ai-bar {
    margin: 12px 0 0 0;
    left: 0;
    transform: none;
    min-width: 0;
    max-width: 100vw;
  }
}
@media (max-width: 600px) {
  .dashboard-ai-bar {
    padding: 6px 2px;
  }
  .dashboard-ai-title {
    font-size: 1rem;
  }
  .ai-input, .ai-time {
    width: 100%;
    min-width: 0;
  }
}
</style>