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
          <p class="user-detail">生日：{{ user.birthday }}</p>
          <p class="bio">{{ user.bio }}</p>
        </div>
      </div>
      <!-- 右侧内容卡片 -->
      <div class="main-card">
        <div class="main-card-header">
          <h2 class="main-title">我的过去</h2>
          <button @click="openAddDiaryModal" class="add-diary-btn">点我让deepseek总结你的收获</button>
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
              <h3 class="diary-title">{{ diary.title }}</h3>
              <p class="diary-excerpt">{{ diary.excerpt }}</p>
              <button v-if="!diary.isPublic" @click.stop="changeVisible(diary.id)" class="public-btn">公开</button>
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
            <h2>这段时间内你的收获</h2>
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
              <label for="diary-date">开始时间</label>
              <input
                id="diary-date"
                v-model="newDiary.date"
                type="date"
                required
              />
            </div>
            <div class="form-group">
              <label for="diary-date">结束时间</label>
              <input
                  id="diary-date"
                  v-model="newDiary.enddate"
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
              <button type="button" @click="generateAiDiary" class="submit-btn">DeepSeek  GOGOGO</button>
            </div>
          </form>
        </div>
      </div>
    </div>
    <el-dialog
        v-model="showDiaryDialog"
        title="✨ AI 生成的日记 ✨"
        width="60%"
        :close-on-click-modal="false"
        :before-close="handleBeforeClose"
        custom-class="custom-dialog-style"
    >

    <div class="ai-diary-content">
        <div class="content-header">
          <div class="ai-icon">🤖</div>
          <div class="header-text">
            <h3>DeepSeek AI 正在为您生成日记...</h3>
            <p>基于您的时间段和活动记录，AI将为您总结这段时间的收获</p>
          </div>
        </div>

        <div class="content-area">
          <div class="reasoning-section" v-if="reasoningContent">
            <h4>🤔 思考过程</h4>
            <div class="reasoning-text">{{ reasoningContent }}</div>
          </div>

          <div class="diary-section">
            <h4>📝 生成的日记</h4>
            <el-input
                type="textarea"
                v-model="aiDiaryContent"
                placeholder="AI正在生成您的日记内容..."
                rows="12"
                class="custom-textarea"
            />
          </div>
        </div>
      </div>
      <template #footer>
        <div class="footer-wrapper">
          <el-button v-if="save" type="primary" class="save-button" @click="saveDiary">
            💾 保存日记
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>

</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import axios from "../utils/axios"
import { ElMessage } from 'element-plus'
import 'element-plus/dist/index.css'
import { useRouter } from 'vue-router'
const router = useRouter()


//aidiary弹窗
const showDiaryDialog = ref(false) // 控制弹窗显示
const save = ref(false)
const reasoningContent = ref(''); //思考过程
const aiDiaryContent = ref('') // 存放生成的日记内容


const user = ref({
  userId: '',
  avatarUrl: '',
  nickname: '',
  gender: '',
  birthday: '',
  bio: ''
})

const diaries = ref([])
const searchTerm = ref('')
const isAddDiaryModalVisible = ref(false)
const newDiary = ref({
  title:"请输入标题",
  startdate: new Date().toISOString().split('T')[0],
  enddate: new Date().toISOString().split('T')[0],
})
const handleBeforeClose = (done) => {
  if (save.value) {
    done() // 允许关闭
  } else {
    // 不允许关闭，可以加提示
    ElMessage.warning('请等待 AI 生成完日记再关闭窗口')
  }
}

// 新增编辑模态框相关状态
const isEditModalVisible = ref(false)
const editForm = ref({
  nickname: '',
  gender: '',
  birthday: '',
  bio: '',
  avatarFile: null,
  avatarPreview: ''
})

const changeVisible= async (id) => {
  if (!confirm('确定要公开吗？')) return
  try {
    await axios.post('/userDiary/setPublicStatus', null, {
      params: {
        id: id,
        isPublic:true
      },
    })
  } catch (error) {
    alert('公开失败，请重试')
  }finally {
    location.reload() // ✅ 成功提示结束后刷新页面
  }
}
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
    // 获取用户档案
    const profileRes = await axios.post('/userProfile/myProfile', null, {
      params: { userId: studentId }
    })
    user.value = {
      userId: profileRes.userId,
      avatarUrl: profileRes.avatarUrl || generateAvatar(profileRes.nickname),
      nickname: profileRes.nickname || '未命名用户',
      gender: genderToText(profileRes.gender),
      birthday: profileRes.birthday || '',
      bio: profileRes.bio || '这个人很懒，什么都没留下~'
    }
    // 获取日记
    const diariesRes = await axios.post('/userDiary/findAll', null, {
      params: { userId: studentId }
    })
    diaries.value = (diariesRes || []).map(d => ({
      id: d.id,
      date: d.createdAt ? formatDate(d.createdAt) : '未知日期',
      title: d.title,
      content: d.content || '',
      excerpt: d.content ? d.content.slice(0, 60) + (d.content.length > 60 ? '...' : '') : '',
      isPublic: d.isPublic
    }))
  } catch (error) {
    console.error('获取数据失败:', error)
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

// 性别枚举转中文
function genderToText(gender) {
  if (!gender) return '未知'
  if (gender === 'MALE') return '男'
  if (gender === 'FEMALE') return '女'
  if (gender === 'OTHER') return '其他'
  return '未知'
}
function textToGender(text) {
  if (text === '男') return 'MALE'
  if (text === '女') return 'FEMALE'
  if (text === '其他') return 'OTHER'
  return 'OTHER'
}

// 新增个人信息编辑相关方法
const openEditModal = () => {
  editForm.value = {
    nickname: user.value.nickname,
    gender: user.value.gender,
    birthday: user.value.birthday,
    bio: user.value.bio,
    avatarFile: null,
    avatarPreview: ''
  }
  isEditModalVisible.value = true
}

const closeEditModal = () => {
  isEditModalVisible.value = false
}

const handleAvatarUpload = (event) => {
  const file = event.target.files[0]
  if (file) {
    editForm.value.avatarFile = file
    const reader = new FileReader()
    reader.onload = (e) => {
      editForm.value.avatarPreview = e.target.result
    }
    reader.readAsDataURL(file)
  }
}

const saveProfile = async () => {
  try {
    const studentId = localStorage.getItem('studentId')
    let avatarUrl = user.value.avatarUrl

    // ✅ 若用户上传了新头像文件，则先上传图片
    if (editForm.value.avatarFile) {
      const formData = new FormData()
      formData.append('file', editForm.value.avatarFile)

      const uploadRes = await axios.post<{ url: string }>('/oss/upload',formData)
      console.log(uploadRes)
      avatarUrl = uploadRes // 👈 服务器返回的头像访问地址
    }

    // ✅ 构造UserProfile对象
    const profile = {
      userId: Number(studentId),
      nickname: editForm.value.nickname,
      gender: textToGender(editForm.value.gender),
      birthday: editForm.value.birthday,
      bio: editForm.value.bio,
      avatarUrl // ✅ 赋值新头像地址
    }

    // ✅ 更新个人资料
    await axios.put('/userProfile/updateProfile', profile)

    // ✅ 同步更新页面上数据
    user.value = {
      ...user.value,
      ...profile
    }
    closeEditModal()
  } catch (error) {
    console.error('更新个人资料失败:', error)
    alert('更新失败，请重试')
  }
}

// 原有日记相关方法保持不变
const searchDiaries = () => {}
const viewDiaryDetail = (id) => {
  console.log(id)
  router.push(`/diary/${id}`)
}
const openAddDiaryModal = () => {
  isAddDiaryModalVisible.value = true
  newDiary.value = {
    title:newDiary.value.title,
    startdate: new Date().toISOString().split('T')[0],
    enddate: new Date().toISOString().split('T')[0]
  }
}
const closeAddDiaryModal = () => {
  isAddDiaryModalVisible.value = false
}
const generateDiaryStream = async () => {
  try {
    showDiaryDialog.value = true;
    aiDiaryContent.value = '';      // 最终AI内容
    reasoningContent.value = '';    // 思考过程

    const userId = localStorage.getItem('studentId');
    const token = localStorage.getItem('token');

    const params = new URLSearchParams({
      userId: userId || '',
      startdate: newDiary.value.startdate,
      enddate: newDiary.value.enddate,
    });

    const response = await fetch(`/api/diary/generateDiaryStream?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'text/event-stream',
      }
    });

    if (!response.ok || !response.body) {
      throw new Error(`请求失败，状态码: ${response.status}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');

    // 缓存本次事件数据
    let eventName = '';
    let dataBuffer = '';

    async function readStream() {
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          console.log('流读取完毕');
          break;
        }

        const chunk = decoder.decode(value, { stream: true });
        // 按行分割，因为SSE是逐行发送的
        const lines = chunk.split(/\r?\n/);

        for (const line of lines) {
          if (line.startsWith('event:')) {
            eventName = line.replace(/^event:\s*/, '').trim();
          } else if (line.startsWith('data:')) {
            const data = line.replace(/^data:\s*/, '');
            dataBuffer += data;
          } else if (line === '') {
            // 空行表示一个事件结束，处理缓存数据
            if (eventName === 'content') {
              aiDiaryContent.value += dataBuffer;
            } else if (eventName === '' || eventName === 'message') {
              // 默认事件，没有event:行时eventName是空，说明是默认消息，放reasoningContent
              reasoningContent.value += dataBuffer;
            }
            // 清空缓存
            eventName = '';
            dataBuffer = '';
          }
        }
      }
    }

    await readStream();
    save.value=true

  } catch (error) {
    console.error('流式生成日记失败:', error);
    aiDiaryContent.value += '\n[错误] 无法生成日记';
  }
};
const generateAiDiary = () => {
  const { title, startdate, enddate } = newDiary.value

  // === 字段非空校验 ===
  if (!title || !startdate || !enddate) {
    alert('请填写标题、开始时间和结束时间')
    return
  }

  // === 开始时间不能晚于结束时间 ===
  const start = new Date(startdate)
  const end = new Date(enddate)
  if (start > end) {
    alert('开始时间不能晚于结束时间')
    return
  }
  generateDiaryStream();
};
const saveDiary = async () => {
  const userId = localStorage.getItem('studentId');
  const diaryData = {
    userId: userId,
    title: newDiary.value.title,
    content: aiDiaryContent.value,
    isPublic: false,
    id: null
  }

  try {
    const response = await axios.post('/userDiary/create', diaryData)
    console.log('创建成功:', response.data)

    ElMessage({
      message: '日记创建成功！',
      type: 'success',
      duration: 2000, // 让用户看到提示
      onClose: () => {
        location.reload() // ✅ 成功提示结束后刷新页面
      }
    })
  } catch (error) {
    console.error('创建失败:', error)

    ElMessage({
      message: '日记创建失败，请重试',
      type: 'error',
      duration: 3000,
    })
  }
}

const addDiary = async () => {
  const { title, startdate, enddate } = newDiary.value

  // === 字段非空校验 ===
  if (!title || !startdate || !enddate) {
    alert('请填写标题、开始时间和结束时间')
    return
  }

  // === 开始时间不能晚于结束时间 ===
  const start = new Date(startdate)
  const end = new Date(enddate)
  if (start > end) {
    alert('开始时间不能晚于结束时间')
    return
  }

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
    console.log(error)
  }
}

const deleteDiary = async (id) => {
  if (!confirm('确定要删除这篇日记吗？')) return
  try {
    await axios.post('/userDiary/delete', null, {
      params: { id: id }
    })
    diaries.value = diaries.value.filter(diary => diary.id !== id)
  } catch (error) {
    alert('删除日记失败，请重试')
  }
}

onMounted(fetchData)
</script>

<style scoped>
.custom-dialog-style {
  border-radius: 28px;
  background: linear-gradient(135deg, #f8fbff 0%, #e8f4ff 100%);
  box-shadow: 0 20px 60px rgba(90, 160, 255, 0.25), 0 0 0 3px rgba(0, 0, 0, 0.12);
  padding: 0;
  min-width: 400px;
  overflow: hidden;
  border: 3px solid rgba(0, 0, 0, 0.18);
}

.ai-diary-content {
  padding: 0;
}

.content-header {
  background: linear-gradient(135deg, #74ABE2 0%, #5563DE 100%);
  color: white;
  padding: 32px 36px 24px 36px;
  display: flex;
  align-items: center;
  gap: 20px;
  margin: -3px -3px 0 -3px;
}

.ai-icon {
  font-size: 48px;
  animation: pulse 2s infinite;
}

.header-text h3 {
  font-size: 24px;
  font-weight: 700;
  margin: 0 0 8px 0;
  letter-spacing: 0.5px;
}

.header-text p {
  font-size: 16px;
  opacity: 0.9;
  margin: 0;
  line-height: 1.5;
}

.content-area {
  padding: 32px 36px 24px 36px;
}

.reasoning-section, .diary-section {
  margin-bottom: 24px;
}

.reasoning-section h4, .diary-section h4 {
  font-size: 18px;
  font-weight: 600;
  color: #5563DE;
  margin: 0 0 16px 0;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: #f0f6ff;
  border: 2px solid rgba(0, 0, 0, 0.1);
  border-radius: 12px;
  padding: 8px 16px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
}

.reasoning-text {
  background: #f0f6ff;
  border: 3px solid rgba(0, 0, 0, 0.15);
  border-radius: 16px;
  padding: 20px;
  font-size: 15px;
  font-weight: 500;
  line-height: 1.6;
  color: #333;
  max-height: 120px;
  overflow-y: auto;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.08);
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}
.custom-dialog-style .el-dialog__header {
  font-size: 26px;
  font-weight: bold;
  color: #3a8ee6;
  padding-bottom: 16px;
  border-bottom: 1.5px solid #e0efff;
  letter-spacing: 1px;
  text-align: center;
}
.custom-dialog-style .el-dialog__title {
  font-size: 28px;
  font-weight: 800;
  color: #3a8ee6;
  letter-spacing: 1px;
  text-align: center;
}
.custom-dialog-style .el-dialog__body {
  padding-top: 18px;
  padding-bottom: 18px;
}
.custom-textarea .el-textarea__inner {
  font-size: 16px;
  border-radius: 16px;
  background-color: #fafbff;
  border: 3px solid rgba(0, 0, 0, 0.15);
  padding: 20px;
  color: #333;
  min-height: 200px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  line-height: 1.6;
  font-weight: 500;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}
.custom-textarea .el-textarea__inner:focus {
  border-color: rgba(0, 0, 0, 0.2);
  box-shadow: 0 0 12px rgba(0, 0, 0, 0.15);
}
.footer-wrapper {
  text-align: right;
  margin-top: 24px;
}
.save-button {
  background: linear-gradient(135deg, #74ABE2 0%, #5563DE 100%);
  border: none;
  border-radius: 16px;
  padding: 14px 36px;
  font-size: 16px;
  font-weight: 600;
  color: white;
  box-shadow: 0 6px 20px rgba(116, 171, 226, 0.3);
  transition: all 0.3s ease;
  letter-spacing: 0.5px;
}
.save-button:hover {
  background: linear-gradient(90deg, #3a8ee6 0%, #6cb7ff 100%);
  box-shadow: 0 8px 24px rgba(60, 160, 255, 0.28);
}
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
.public-btn {
  background: linear-gradient(90deg, #71f8ea 0%, #a5fce5 100%);
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
  bottom: 6.0em;
}
.public-btn:hover {
  background: linear-gradient(90deg, #a5abfc 0%, #8171f8 100%);
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
.custom-dialog-style {
  border-radius: 20px;
  padding: 20px;
  background: linear-gradient(to bottom right, #f0faff, #ffffff);
  box-shadow: 0 8px 30px rgba(90, 160, 255, 0.2);
}

.custom-dialog-style .el-dialog__header {
  font-size: 22px;
  font-weight: bold;
  color: #3a8ee6;
  padding-bottom: 10px;
  border-bottom: 1px solid #e0efff;
}

.custom-textarea .el-textarea__inner {
  font-size: 16px;
  border-radius: 14px;
  background-color: #f9fbff;
  border: 1.5px solid #c8e3ff;
  padding: 14px;
  transition: all 0.3s ease;
}

.custom-textarea .el-textarea__inner:focus {
  border-color: #6cb7ff;
  box-shadow: 0 0 6px rgba(108, 183, 255, 0.4);
}

.footer-wrapper {
  text-align: right;
  margin-top: 20px;
}

.save-button {
  background: linear-gradient(to right, #6cb7ff, #3a8ee6);
  border: none;
  border-radius: 12px;
  padding: 10px 24px;
  font-size: 16px;
  font-weight: bold;
  color: white;
  box-shadow: 0 4px 12px rgba(108, 183, 255, 0.3);
  transition: background 0.3s ease, box-shadow 0.3s ease;
}

.save-button:hover {
  background: linear-gradient(to right, #3a8ee6, #6cb7ff);
  box-shadow: 0 6px 16px rgba(60, 160, 255, 0.4);
}
.diary-list-container {
  max-height: 500px; /* 或你想要的高度，比如 70vh */
  overflow-y: auto;
  padding-right: 8px; /* 防止滚动条遮住内容 */
}
.homepage-bg {
  overflow: hidden; /* 禁止滚动 */
}
</style>