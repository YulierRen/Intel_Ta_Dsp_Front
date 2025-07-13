<template>
  <div class="container">
    <div class="content-wrapper">
      <!-- 左侧个人信息区域 -->
      <div class="sidebar">
        <div class="avatar-container">
          <img :src="user.avatarUrl" alt="User avatar" class="avatar" />
        </div>
        <div class="user-info">
          <h1 class="nickname">{{ user.nickname }}</h1>
          <p class="user-detail">性别：{{ user.gender }}</p>
          <p class="user-detail">年龄：{{ user.age }}岁</p>
          <p class="bio">{{ user.bio }}</p>
        </div>
      </div>

      <!-- 右侧内容区域 -->
      <div class="main-content">
        <!-- 搜索区域 -->
        <div class="search-bar">
          <span class="search-icon">
            <span class="iconify" data-icon="mdi:magnify" data-width="20"></span>
          </span>
          <input
              type="text"
              class="search-input"
              placeholder="搜索日记标题..."
              v-model="searchTerm"
          />
        </div>

        <!-- 日记列表标题 -->
        <h2 class="diary-section-title">我的旅行日记</h2>

        <!-- 日记列表 -->
        <ul class="diary-list">
          <li
              class="diary-item"
              v-for="(diary, index) in filteredDiaries"
              :key="index"
          >
            <div class="diary-date">{{ diary.date }}</div>
            <h3 class="diary-title">{{ diary.title }}</h3>
            <p class="diary-excerpt">{{ diary.excerpt }}</p>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from '@/utils/axios'

const user = ref({
  avatarUrl: '',
  nickname: '',
  gender: '',
  age: '',
  bio: ''
})

const diaries = ref([])
const searchTerm = ref('')

const filteredDiaries = computed(() =>
    diaries.value.filter(diary =>
        diary.title.toLowerCase().includes(searchTerm.value.toLowerCase())
    )
)

onMounted(async () => {
  // 获取用户信息
  try {
    const studentId = localStorage.getItem('studentId')
    const res = await axios.post('/userProfile/myProfile', null, {
      params: { userId: studentId }
    })
    user.value = {
      avatarUrl: res.avatarUrl || 'https://ui-avatars.com/api/?name=' + (res.nickname || '用户') + '&background=4e8cff&color=fff',
      nickname: res.nickname || res.username || '未命名用户',
      gender: res.gender || '未知',
      age: res.age || '',
      bio: res.bio || ''
    }
  } catch (e) {
    // 保持默认
  }
  // 获取日记
  try {
    const studentId = localStorage.getItem('studentId')
    const res = await axios.post('/userDiary/findAll', { userId: studentId })
    diaries.value = (res || []).map(d => ({
      date: d.createdAt ? new Date(d.createdAt).toLocaleDateString('zh-CN') : '',
      title: d.title,
      excerpt: d.content?.slice(0, 60) + (d.content?.length > 60 ? '...' : '')
    }))
  } catch (e) {
    // 保持空
  }
})
</script>

<style scoped>
body {
  background: linear-gradient(135deg, #74ABE2 0%, #5563DE 100%);
  font-family: 'Roboto', sans-serif;
  padding: 40px 0;
  color: #333;
}

.container {
  width: 1200px;
  margin: 40px auto;
  background: rgba(255,255,255,0.98);
  border-radius: 18px;
  border: 1.5px solid #e0e0e0;
  box-shadow: 0 12px 40px 0 rgba(80, 112, 255, 0.18), 0 1.5px 8px 0 rgba(80, 112, 255, 0.08);
  overflow: hidden;
  min-height: 700px;
  animation: card-pop 0.8s cubic-bezier(.68,-0.55,.27,1.55);
}

@keyframes card-pop {
  0% { transform: scale(0.96) translateY(40px); opacity: 0; }
  100% { transform: scale(1) translateY(0); opacity: 1; }
}

.content-wrapper {
  display: flex;
  padding: 30px;
}

.sidebar {
  width: 320px;
  padding: 20px;
  border-right: 1.5px solid #eaeaea;
  background: linear-gradient(135deg, #e0e7ff 0%, #f0f4ff 100%);
  border-radius: 12px;
  box-shadow: 0 2px 8px #a5b4fc22;
  animation: sidebar-pop 1s;
}

@keyframes sidebar-pop {
  0% { transform: translateX(-30px); opacity: 0;}
  100% { transform: translateX(0); opacity: 1;}
}

.avatar-container {
  text-align: center;
  margin-bottom: 30px;
}

.avatar {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  border: 4px solid #fff;
  box-shadow: 0 3px 16px #a5b4fc44;
  margin: 0 auto;
  transition: transform 0.3s;
  background: #f7faff;
  object-fit: cover;
  animation: avatar-pop 1.2s;
}

@keyframes avatar-pop {
  0% { transform: scale(0.8);}
  100% { transform: scale(1);}
}

.avatar:hover {
  transform: scale(1.06) rotate(-3deg);
}

.user-info {
  margin-top: 20px;
  text-align: center;
}

.nickname {
  font-size: 26px;
  font-weight: 700;
  color: #5563DE;
  margin-bottom: 10px;
  letter-spacing: 1px;
}

.user-detail {
  font-size: 16px;
  margin: 8px 0;
  color: #555;
}

.bio {
  font-style: italic;
  color: #777;
  margin-top: 20px;
  line-height: 1.5;
}

.main-content {
  flex: 1;
  padding: 0 30px;
}

.search-bar {
  margin-bottom: 30px;
  position: relative;
}

.search-input {
  width: 100%;
  padding: 14px 20px 14px 45px;
  border: 1.5px solid #e0e0e0;
  border-radius: 30px;
  font-size: 16px;
  outline: none;
  background: #f7faff;
  transition: border-color 0.3s, box-shadow 0.3s;
}

.search-input:focus {
  border-color: #74ABE2;
  box-shadow: 0 0 0 2px #a5b4fc44;
}

.search-icon {
  position: absolute;
  left: 20px;
  top: 50%;
  transform: translateY(-50%);
  color: #95a5a6;
  pointer-events: none;
}

.diary-section-title {
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 20px;
  color: #2c3e50;
  padding-bottom: 10px;
  border-bottom: 2px solid #e8f4ff;
  letter-spacing: 1px;
}

.diary-list {
  list-style: none;
}

.diary-item {
  padding: 18px 20px;
  border-bottom: 1px solid #eee;
  transition: background-color 0.2s, transform 0.2s;
  cursor: pointer;
  border-radius: 8px;
}

.diary-item:hover {
  background-color: #f7faff;
  transform: scale(1.01) translateX(6px);
}

.diary-date {
  font-size: 13px;
  color: #95a5a6;
  margin-bottom: 8px;
}

.diary-title {
  font-size: 18px;
  font-weight: 500;
  color: #2c3e50;
  margin-bottom: 5px;
}

.diary-excerpt {
  font-size: 14px;
  color: #7f8c8d;
  line-height: 1.5;
}

@media (max-width: 1240px) {
  .container {
    width: 95%;
  }
}

@media (max-width: 900px) {
  .content-wrapper {
    flex-direction: column;
  }

  .sidebar {
    width: 100%;
    border-right: none;
    border-bottom: 1.5px solid #eaeaea;
  }

  .avatar-container {
    margin-bottom: 15px;
  }
}
</style>
