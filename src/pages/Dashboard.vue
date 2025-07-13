<script setup lang="ts">
import { useRouter } from 'vue-router'
import Schedule from './DashBoard/Schedule.vue'

const router = useRouter()

// 推荐日记数据示例
const recommendedDiaries = [
  {
    id: 1,
    title: '高效学习的一天',
    author: '小明',
    excerpt: '今天复习了数学和英语，还和朋友一起讨论了物理题目...',
    date: '2024-06-01'
  },
  {
    id: 2,
    title: '考前冲刺',
    author: '小红',
    excerpt: '距离考试还有三天，今天整理了错题本，感觉收获很大！',
    date: '2024-06-02'
  },
  {
    id: 3,
    title: '运动与学习',
    author: '小刚',
    excerpt: '下午去操场跑步，晚上学习效率提升不少，运动真的有用！',
    date: '2024-06-03'
  }
]

function gotoDiaryGround() {
  router.push('/diaryground')
}
function gotoHomePage() {
  router.push('/homepage')
}
// function gotoDiaryGround() {
//   router.push('/diaryground')
// }
// function gotoDiaryGround() {
//   router.push('/diaryground')
// }
function gotoFriendList() {
  router.push('/friendlist')
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

    <h2 style="
  color: #00f;
  position: absolute;
  top: 0;
  left: 29%;
  transform: translateX(-60%);
  font-size: 30px;
  font-weight: bold;
  background: linear-gradient(90deg, #ff0066, #0ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: glow 2s infinite alternate;
">
      Ta律，做你想做的
    </h2>

    <!-- 中间日程模块 -->
    <div class="dashboard-main">
      <Schedule style="width:100%;height:100%;" />
    </div>

    <!-- 右侧推荐日记 -->
    <div class="dashboard-recommend">
      <div class="recommend-title">推荐日记</div>
      <div class="recommend-list">
        <div class="recommend-item" v-for="d in recommendedDiaries" :key="d.id">
          <div class="diary-title">{{ d.title }}</div>
          <div class="diary-meta">
            <span class="diary-author">by {{ d.author }}</span>
            <span class="diary-date">{{ d.date }}</span>
          </div>
          <div class="diary-excerpt">{{ d.excerpt }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dashboard-layout {
  display: flex;
  min-height: 100vh;
  background: #f0f9ff;
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
@media (max-width: 1200px) {
  .dashboard-recommend {
    display: none;
  }
}
@media (max-width: 900px) {
  .dashboard-sidebar {
    display: none;
  }
  .dashboard-main {
    padding: 24px 0;
  }
}
@media (max-width: 600px) {
  .dashboard-main {
    padding: 8px 0;
  }
}

</style>