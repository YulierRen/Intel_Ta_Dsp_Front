<template>
  <div class="homepage-bg">
    <!-- 背景流光装饰 -->
    <div class="bg-lights">
      <div class="light-wave wave-1"></div>
      <div class="light-wave wave-2"></div>
      <div class="light-wave wave-3"></div>
    </div>
    <!-- 固定回到主板按钮 -->
    <div class="dashboard-btn-fixed">
      <button class="dashboard-btn" @click="goToDashboard">
        回到主板
      </button>
    </div>
    <div class="homepage-layout">
      <!-- 左侧个人信息卡片 -->
      <div class="profile-card">
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
      <!-- 右侧内容卡片 -->
      <div class="main-card">
        <div class="main-card-header">
          <h2 class="main-title">我的旅行日记</h2>
          <button @click="openAddDiaryModal" class="add-diary-btn">新增旅行日记</button>
        </div>
        <!-- 搜索区域 -->
        <div class="search-bar">
          <span class="search-icon">🔍</span>
          <input
            type="text"
            class="search-input"
            placeholder="搜索日记标题..."
            v-model="searchTerm"
            @keyup.enter="searchDiaries"
          />
        </div>
        <!-- 日记列表 -->
        <div v-if="filteredDiaries.length > 0" class="diary-list-container">
          <ul class="diary-list">
            <li
              class="diary-item"
              v-for="(diary, index) in filteredDiaries"
              :key="diary.id"
              @click="viewDiaryDetail(diary.id)"
            >
              <div class="diary-date">{{ diary.date }}</div>
              <h3 class="diary-title">{{ diary.title }}</h3>
              <p class="diary-excerpt">{{ diary.excerpt }}</p>
              <button @click.stop="deleteDiary(diary.id)" class="delete-btn">删除</button>
            </li>
          </ul>
        </div>
        <div v-else class="empty-state">
          <p>暂无日记记录</p>
          <button @click="openAddDiaryModal" class="add-first-diary-btn">添加第一篇日记</button>
        </div>
      </div>
    </div>
    <!-- 新增日记弹窗 -->
    <div v-if="isAddDiaryModalVisible" class="modal-overlay" @click.self="closeAddDiaryModal">
      <div class="modal">
        <div class="modal-content">
          <div class="modal-header">
            <h2>新增旅行日记</h2>
            <button class="close-btn" @click="closeAddDiaryModal">&times;</button>
          </div>
          <form @submit.prevent="addDiary" class="diary-form">
            <div class="form-group">
              <label for="diary-title">标题</label>
              <input
                id="diary-title"
                v-model="newDiary.title"
                type="text"
                placeholder="请输入日记标题"
                required
              />
            </div>
            <div class="form-group">
              <label for="diary-date">日期</label>
              <input
                id="diary-date"
                v-model="newDiary.date"
                type="date"
                required
              />
            </div>
            <div class="form-group">
              <label for="diary-content">内容</label>
              <textarea
                id="diary-content"
                v-model="newDiary.content"
                placeholder="写下你的旅行故事..."
                rows="6"
                required
              ></textarea>
            </div>
            <div class="form-actions">
              <button type="button" @click="closeAddDiaryModal" class="cancel-btn">取消</button>
              <button type="submit" class="submit-btn">保存</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from '@/utils/axios'
import { useRouter } from 'vue-router'
const router = useRouter()

const user = ref({
  avatarUrl: '',
  nickname: '',
  gender: '',
  age: '',
  bio: ''
})

const diaries = ref([])
const searchTerm = ref('')
const isAddDiaryModalVisible = ref(false)
const newDiary = ref({
  title: '',
  content: '',
  date: new Date().toISOString().split('T')[0]
})

const filteredDiaries = computed(() => {
  if (!searchTerm.value) return diaries.value
  return diaries.value.filter(diary => {
    return diary.title.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
      diary.content.toLowerCase().includes(searchTerm.value.toLowerCase())
  })
})

const fetchData = async () => {
  try {
    const studentId = localStorage.getItem('studentId')
    const [profileRes, diariesRes] = await Promise.all([
      axios.post('/userProfile/myProfile', null, {
        params: { userId: studentId }
      }),
      axios.post('/userDiary/findAll', null, {
        params: { userId: studentId }
      })
    ])
    user.value = {
      avatarUrl: profileRes.avatarUrl || generateAvatar(profileRes.nickname || profileRes.username),
      nickname: profileRes.nickname || profileRes.username || '未命名用户',
      gender: profileRes.gender || '未知',
      age: profileRes.age || '',
      bio: profileRes.bio || '这个人很懒，什么都没留下~'
    }
    diaries.value = (diariesRes || []).map(d => ({
      id: d.id,
      date: d.createdAt ? formatDate(d.createdAt) : '未知日期',
      title: d.title,
      content: d.content || '',
      excerpt: d.content ? d.content.slice(0, 60) + (d.content.length > 60 ? '...' : '') : ''
    }))
  } catch (error) {
    // ...异常处理...
  }
}
const goToDashboard = () => {
  router.push('/dashboard')
}
const generateAvatar = (name) => {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name || '用户')}&background=4e8cff&color=fff&length=1`
}
const formatDate = (dateString) => {
  const options = { year: 'numeric', month: 'long', day: 'numeric' }
  return new Date(dateString).toLocaleDateString('zh-CN', options)
}
onMounted(fetchData)
const searchDiaries = () => {}
const viewDiaryDetail = (id) => {
  router.push(`/diary/${id}`)
}
const openAddDiaryModal = () => {
  isAddDiaryModalVisible.value = true
  newDiary.value = {
    title: '',
    content: '',
    date: new Date().toISOString().split('T')[0]
  }
}
const closeAddDiaryModal = () => {
  isAddDiaryModalVisible.value = false
}
const addDiary = async () => {
  try {
    const studentId = localStorage.getItem('studentId')
    const res = await axios.post('/userDiary/add', {
      userId: studentId,
      ...newDiary.value
    })
    diaries.value.unshift({
      id: res.id,
      date: formatDate(res.createdAt || new Date()),
      title: res.title,
      content: res.content,
      excerpt: res.content.slice(0, 60) + (res.content.length > 60 ? '...' : '')
    })
    closeAddDiaryModal()
  } catch (error) {
    alert('添加日记失败，请重试')
  }
}
const deleteDiary = async (id) => {
  if (!confirm('确定要删除这篇日记吗？')) return
  try {
    await axios.delete(`/userDiary/delete/${id}`)
    diaries.value = diaries.value.filter(diary => diary.id !== id)
  } catch (error) {
    alert('删除日记失败，请重试')
  }
}
</script>

<style scoped>
.homepage-bg {
  min-height: 100vh;
  background: linear-gradient(135deg, #74ABE2 0%, #5563DE 100%);
  position: relative;
  overflow-x: hidden;
  font-family: 'Inter', system-ui, sans-serif;
}
.bg-lights {
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
}
.light-wave {
  position: absolute;
  filter: blur(150px);
  opacity: 0.5;
  animation: wave 20s ease-in-out infinite;
}
.wave-1 {
  width: 1200px;
  height: 1200px;
  top: -600px;
  left: -300px;
  background: linear-gradient(135deg, rgba(116, 171, 226, 0.4), rgba(85, 99, 222, 0.3));
}
.wave-2 {
  width: 1000px;
  height: 1000px;
  bottom: -500px;
  right: -200px;
  background: linear-gradient(135deg, rgba(165, 180, 254, 0.4), rgba(116, 171, 226, 0.3));
  animation-delay: -7s;
}
.wave-3 {
  width: 800px;
  height: 800px;
  top: 30%;
  right: 20%;
  background: linear-gradient(135deg, rgba(191, 219, 254, 0.3), rgba(165, 180, 254, 0.3));
  animation-delay: -12s;
}
@keyframes wave {
  0% {
    border-radius: 40% 60% 70% 30% / 40% 50% 60% 50%;
    transform: translate(0, 0) scale(1);
  }
  50% {
    border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%;
    transform: translate(20px, 30px) scale(1.05);
  }
  100% {
    border-radius: 40% 60% 70% 30% / 40% 50% 60% 50%;
    transform: translate(0, 0) scale(1);
  }
}
.dashboard-btn-fixed {
  position: fixed;
  top: 18px;
  left: 18px;
  z-index: 2000;
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
.homepage-layout {
  display: flex;
  gap: 2.5rem;
  max-width: 1800px;
  min-height: 700px;
  margin: 0 auto;
  padding: 4rem 2rem 2rem 2rem;
  position: relative;
  z-index: 2;
}
.profile-card {
  width: 340px;
  min-width: 260px;
  background: rgba(255,255,255,0.98);
  border-radius: 24px;
  box-shadow: 0 12px 40px 0 rgba(80, 112, 255, 0.18), 0 1.5px 8px 0 rgba(80, 112, 255, 0.08);
  padding: 2.5rem 2rem 2rem 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.avatar-container {
  text-align: center;
  margin-bottom: 1.5rem;
}
.avatar {
  width: 140px;
  height: 140px;
  border-radius: 50%;
  object-fit: cover;
  box-shadow: 0 4px 16px #a5b4fc44;
  border: 4px solid #fff;
  background: #f7faff;
  transition: transform 0.3s;
}
.avatar:hover {
  transform: scale(1.06) rotate(-3deg);
}
.user-info {
  text-align: center;
}
.nickname {
  font-size: 2rem;
  font-weight: 700;
  color: #5563DE;
  margin-bottom: 0.5rem;
  letter-spacing: 1px;
}
.user-detail {
  font-size: 1.1rem;
  color: #555;
  margin: 0.5rem 0;
}
.bio {
  font-style: italic;
  color: #666;
  margin-top: 1.5rem;
  line-height: 1.6;
  padding: 0 1rem;
}
.main-card {
  flex: 1;
  background: rgba(255,255,255,0.92);
  border-radius: 24px;
  box-shadow: 0 12px 40px 0 rgba(80, 112, 255, 0.13);
  padding: 2.5rem 2.5rem 2rem 2.5rem;
  min-width: 0;
  display: flex;
  flex-direction: column;
  position: relative;
}
.main-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
}
.main-title {
  font-size: 1.7rem;
  font-weight: 800;
  color: #5563DE;
  letter-spacing: 1px;
}
.add-diary-btn {
  background: linear-gradient(90deg, #74ABE2 0%, #5563DE 100%);
  color: #fff;
  border: none;
  border-radius: 18px;
  padding: 10px 32px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 2px 8px #a5b4fc33;
  transition: background 0.2s, transform 0.2s;
}
.add-diary-btn:hover {
  background: linear-gradient(90deg, #5563DE 0%, #74ABE2 100%);
  transform: scale(1.04);
}
.search-bar {
  display: flex;
  align-items: center;
  margin: 1rem 0 2rem;
  position: relative;
  max-width: 400px;
  background: #f7faff;
  border-radius: 30px;
  box-shadow: 0 2px 8px #a5b4fc11;
  padding: 0.5rem 1.2rem;
}
.search-icon {
  color: #74ABE2;
  font-size: 1.2rem;
  margin-right: 0.7rem;
}
.search-input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  font-size: 1.08rem;
  color: #333;
  border-radius: 30px;
  padding: 0.7rem 0;
}
.search-input::placeholder {
  color: #b0b8d1;
}
.diary-list-container {
  margin-top: 1rem;
}
.diary-list {
  list-style: none;
  padding: 0;
  display: grid;
  gap: 1.2rem;
}
.diary-item {
  background: #f7faff;
  padding: 1.25rem 1.5rem 1.25rem 1.5rem;
  border-radius: 14px;
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
  border-left: 4px solid #74ABE2;
  box-shadow: 0 2px 8px #a5b4fc11;
}
.diary-item:hover {
  background-color: #e6f1ff;
  transform: translateY(-2px) scale(1.01);
  box-shadow: 0 4px 12px #a5b4fc22;
}
.diary-date {
  font-size: 0.95rem;
  color: #95a5a6;
  margin-bottom: 0.5rem;
}
.diary-title {
  font-size: 1.13rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #2c3e50;
}
.diary-excerpt {
  font-size: 0.98rem;
  color: #7f8c8d;
  line-height: 1.5;
  margin-bottom: 1rem;
}
.delete-btn {
  background: linear-gradient(90deg, #f87171 0%, #fca5a5 100%);
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 4px 14px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s, transform 0.15s;
  box-shadow: 0 2px 8px #fca5a533;
  position: absolute;
  right: 1.5rem;
  bottom: 1.2rem;
}
.delete-btn:hover {
  background: linear-gradient(90deg, #fca5a5 0%, #f87171 100%);
  transform: translateY(-2px) scale(1.03);
}
.empty-state {
  text-align: center;
  padding: 3rem 0;
  color: #95a5a6;
}
.add-first-diary-btn {
  background: linear-gradient(90deg, #74ABE2 0%, #5563DE 100%);
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 18px;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  margin-top: 1rem;
  transition: background 0.3s, transform 0.2s;
  box-shadow: 0 2px 8px #a5b4fc33;
}
.add-first-diary-btn:hover {
  background: linear-gradient(90deg, #5563DE 0%, #74ABE2 100%);
  transform: scale(1.04);
}
/* 模态框样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(3px);
}
.modal {
  background: white;
  border-radius: 18px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  animation: modalFadeIn 0.3s ease;
}
@keyframes modalFadeIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.modal-content {
  padding: 2rem;
}
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}
.modal-header h2 {
  font-size: 1.5rem;
  color: #2c3e50;
  margin: 0;
}
.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #95a5a6;
  transition: color 0.2s;
}
.close-btn:hover {
  color: #e74c3c;
}
.diary-form {
  display: grid;
  gap: 1.25rem;
}
.form-group {
  display: grid;
  gap: 0.5rem;
}
.form-group label {
  font-size: 0.9375rem;
  color: #555;
  font-weight: 500;
}
.form-group input,
.form-group textarea {
  width: 100%;
  padding: 0.75rem;
  border-radius: 8px;
  border: 1px solid #ddd;
  font-size: 1rem;
  transition: all 0.3s ease;
}
.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #74ABE2;
  box-shadow: 0 0 0 2px rgba(116, 171, 226, 0.2);
}
.form-group textarea {
  min-height: 150px;
  resize: vertical;
}
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1rem;
}
.cancel-btn {
  background: #f0f0f0;
  color: #555;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
}
.cancel-btn:hover {
  background: #e0e0e0;
}
.submit-btn {
  background: linear-gradient(90deg, #74ABE2 0%, #5563DE 100%);
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 18px;
  border: none;
  cursor: pointer;
  transition: background 0.3s, transform 0.2s;
  font-weight: 600;
  box-shadow: 0 2px 8px #a5b4fc33;
}
.submit-btn:hover {
  background: linear-gradient(90deg, #5563DE 0%, #74ABE2 100%);
  transform: scale(1.04);
}
/* 响应式 */
@media (max-width: 1100px) {
  .homepage-layout {
    flex-direction: column;
    gap: 1.5rem;
    padding: 2rem 1rem 1rem 1rem;
  }
  .profile-card {
    width: 100%;
    margin-bottom: 1.5rem;
  }
  .main-card {
    padding: 2rem 1rem 1rem 1rem;
  }
}
@media (max-width: 600px) {
  .homepage-layout {
    padding: 1rem 0.2rem;
  }
  .profile-card, .main-card {
    padding: 1.2rem 0.5rem;
    border-radius: 14px;
  }
  .main-title {
    font-size: 1.2rem;
  }
}
</style>