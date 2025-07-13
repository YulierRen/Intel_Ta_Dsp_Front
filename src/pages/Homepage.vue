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
        <!-- 新增日记按钮 -->
        <button @click="openAddDiaryModal" class="add-diary-btn">新增旅行日记</button>

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
              @keyup.enter="searchDiaries"
          />
        </div>

        <!-- 日记列表标题 -->
        <h2 class="diary-section-title">我的旅行日记</h2>

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
  <div class="dashboard-btn-wrapper">
    <button class="dashboard-btn" @click="goToDashboard">
      回到主板
    </button>
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
  date: new Date().toISOString().split('T')[0] // 默认今天
})

// 计算筛选后的日记列表
const filteredDiaries = computed(() => {
  if (!searchTerm.value) return diaries.value
  return diaries.value.filter(diary => {
    return diary.title.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
        diary.content.toLowerCase().includes(searchTerm.value.toLowerCase())
  })
})

// 获取用户信息和日记
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

    // 更新用户信息
    user.value = {
      avatarUrl: profileRes.avatarUrl || generateAvatar(profileRes.nickname || profileRes.username),
      nickname: profileRes.nickname || profileRes.username || '未命名用户',
      gender: profileRes.gender || '未知',
      age: profileRes.age || '',
      bio: profileRes.bio || '这个人很懒，什么都没留下~'
    }

    // 更新日记列表
    diaries.value = (diariesRes || []).map(d => ({
      id: d.id,
      date: d.createdAt ? formatDate(d.createdAt) : '未知日期',
      title: d.title,
      content: d.content || '',
      excerpt: d.content ? d.content.slice(0, 60) + (d.content.length > 60 ? '...' : '') : ''
    }))
  } catch (error) {
    console.error('获取数据失败:', error)
  }
}
const goToDashboard = () => {
  router.push('/dashboard')
}
// 辅助函数 - 生成默认头像
const generateAvatar = (name) => {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name || '用户')}&background=4e8cff&color=fff&length=1`
}

// 辅助函数 - 格式化日期
const formatDate = (dateString) => {
  const options = { year: 'numeric', month: 'long', day: 'numeric' }
  return new Date(dateString).toLocaleDateString('zh-CN', options)
}

onMounted(fetchData)

// 搜索日记
const searchDiaries = () => {
  // 搜索逻辑已在 computed 属性中处理
}

// 查看日记详情
const viewDiaryDetail = (id) => {
  router.push(`/diary/${id}`)
}

// 打开新增日记弹窗
const openAddDiaryModal = () => {
  isAddDiaryModalVisible.value = true
  // 重置表单
  newDiary.value = {
    title: '',
    content: '',
    date: new Date().toISOString().split('T')[0]
  }
}

// 关闭新增日记弹窗
const closeAddDiaryModal = () => {
  isAddDiaryModalVisible.value = false
}

// 新增日记
const addDiary = async () => {
  try {
    const studentId = localStorage.getItem('studentId')
    const res = await axios.post('/userDiary/add', {
      userId: studentId,
      ...newDiary.value
    })

    // 添加到日记列表
    diaries.value.unshift({
      id: res.id,
      date: formatDate(res.createdAt || new Date()),
      title: res.title,
      content: res.content,
      excerpt: res.content.slice(0, 60) + (res.content.length > 60 ? '...' : '')
    })

    closeAddDiaryModal()
  } catch (error) {
    console.error('新增日记失败:', error)
    alert('添加日记失败，请重试')
  }
}

// 删除日记
const deleteDiary = async (id) => {
  if (!confirm('确定要删除这篇日记吗？')) return

  try {
    await axios.delete(`/userDiary/delete/${id}`)
    diaries.value = diaries.value.filter(diary => diary.id !== id)
  } catch (error) {
    console.error('删除日记失败:', error)
    alert('删除日记失败，请重试')
  }
}
</script>

<style scoped>
/* 容器布局 */
.container {
  max-width: 1200px;
  margin: 2rem auto;
  background: #ffffff;
  border-radius: 18px;
  box-shadow: 0 12px 40px rgba(80, 112, 255, 0.18);
  overflow: hidden;
}

.content-wrapper {
  display: flex;
  flex-direction: column;
}

/* 响应式布局 */
@media (min-width: 992px) {
  .content-wrapper {
    flex-direction: row;
  }
}

/* 侧边栏样式 */
.sidebar {
  padding: 2rem;
  background: linear-gradient(135deg, #e0e7ff 0%, #f0f4ff 100%);
  flex-shrink: 0;
}

@media (min-width: 992px) {
  .sidebar {
    width: 320px;
  }
}

.avatar-container {
  text-align: center;
  margin-bottom: 1.5rem;
}

.avatar {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  object-fit: cover;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border: 4px solid white;
}

.user-info {
  text-align: center;
}

.nickname {
  font-size: 1.75rem;
  font-weight: 700;
  color: #5563DE;
  margin-bottom: 0.5rem;
}

.user-detail {
  font-size: 1rem;
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

/* 主内容区域 */
.main-content {
  flex: 1;
  padding: 2rem;
  position: relative;
  min-height: 500px;
}

.add-diary-btn {
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
  background: #74ABE2;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(116, 171, 226, 0.3);
}

.add-diary-btn:hover {
  background: #5563DE;
  transform: translateY(-2px);
}

.search-bar {
  display: flex;
  align-items: center;
  margin: 1rem 0 2rem;
  position: relative;
  max-width: 500px;
}

.search-icon {
  position: absolute;
  left: 1rem;
  color: #95a5a6;
}

.search-input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  border-radius: 30px;
  border: 1px solid #e0e0e0;
  background: #f7faff;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.search-input:focus {
  outline: none;
  border-color: #74ABE2;
  box-shadow: 0 0 0 2px rgba(116, 171, 226, 0.2);
}

.diary-section-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  color: #2c3e50;
  border-bottom: 2px solid #f0f4ff;
  padding-bottom: 0.5rem;
}

/* 日记列表 */
.diary-list-container {
  margin-top: 1rem;
}

.diary-list {
  list-style: none;
  padding: 0;
  display: grid;
  gap: 1rem;
}

.diary-item {
  background: #f7faff;
  padding: 1.25rem;
  border-radius: 8px;
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
  border-left: 4px solid #74ABE2;
}

.diary-item:hover {
  background-color: #e6f1ff;
  transform: translateX(5px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.diary-date {
  font-size: 0.875rem;
  color: #95a5a6;
  margin-bottom: 0.5rem;
}

.diary-title {
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #2c3e50;
}

.diary-excerpt {
  font-size: 0.9375rem;
  color: #7f8c8d;
  line-height: 1.5;
  margin-bottom: 1rem;
}

.delete-btn {
  background: #e74c3c;
  color: white;
  padding: 0.375rem 0.75rem;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  font-size: 0.875rem;
  transition: all 0.2s ease;
}

.delete-btn:hover {
  background: #c0392b;
}

/* 空状态样式 */
.empty-state {
  text-align: center;
  padding: 3rem 0;
  color: #95a5a6;
}

.add-first-diary-btn {
  background: #74ABE2;
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  margin-top: 1rem;
  transition: all 0.3s ease;
}

.add-first-diary-btn:hover {
  background: #5563DE;
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
  border-radius: 12px;
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
  background: #74ABE2;
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
}

.submit-btn:hover {
  background: #5563DE;
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
</style>