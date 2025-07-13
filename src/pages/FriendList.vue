<template>
  <div class="friend-list-bg">
    <div class="friend-list-layout">
      <!-- 左侧好友列表 -->
      <div class="friend-list-card">
        <h2 class="title">我的好友</h2>
        <form class="add-friend-form" @submit.prevent="handleAddFriend">
          <input
            v-model="addFriendName"
            type="text"
            placeholder="输入好友用户名"
            class="add-input"
            required
          />
          <button type="submit" class="add-btn" :disabled="adding">
            {{ adding ? '添加中...' : '添加好友' }}
          </button>
        </form>
        <div v-if="error" class="error-msg">{{ error }}</div>
        <ul class="friend-list">
          <li
            v-for="friend in friends"
            :key="friend.id"
            class="friend-item"
            :class="{ active: selectedFriend && selectedFriend.id === friend.id }"
            @click="selectFriend(friend)"
          >
            <span class="avatar">{{ friend.nickname?.charAt(0) || friend.username?.charAt(0) || '友' }}</span>
            <span class="friend-name">{{ friend.nickname || friend.username }}</span>
            <button class="delete-btn" @click.stop="handleDeleteFriend(friend)" :disabled="deletingId === friend.id">
              {{ deletingId === friend.id ? '删除中...' : '删除' }}
            </button>
          </li>
        </ul>
        <div v-if="loading" class="loading">加载中...</div>
        <div v-if="!loading && friends.length === 0" class="empty">暂无好友</div>
      </div>
      <!-- 右侧好友信息卡片 -->
      <transition name="slide-fade">
        <div v-if="selectedFriendInfo" class="friend-info-card">
          <div class="info-avatar">
            <img :src="selectedFriendInfo.avatarUrl" alt="avatar" />
          </div>
          <div class="info-main">
            <h3>{{ selectedFriendInfo.nickname || selectedFriendInfo.username }}</h3>
            <p class="info-detail">性别：{{ selectedFriendInfo.gender || '未知' }}</p>
            <p class="info-detail">年龄：{{ selectedFriendInfo.age ? selectedFriendInfo.age + '岁' : '未知' }}</p>
            <p class="info-bio">{{ selectedFriendInfo.bio || '这个人很神秘~' }}</p>
            <button class="profile-btn" @click="goToUserHome(selectedFriendInfo.id)">Ta的主页</button>
          </div>
        </div>
      </transition>
    </div>
    <div class="dashboard-btn-wrapper">
      <button class="dashboard-btn" @click="goToDashboard">
        回到主板
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from '@/utils/axios'
import { useRouter } from "vue-router"

const friends = ref([])
const loading = ref(false)
const error = ref('')
const addFriendName = ref('')
const adding = ref(false)
const deletingId = ref(null)
const selectedFriend = ref(null)
const selectedFriendInfo = ref(null)
const router = useRouter()

const fetchFriends = async () => {
  loading.value = true
  error.value = ''
  try {
    const userId = localStorage.getItem('studentId')
    const res = await axios.post(`/userFriend/getFriendList?id=${userId}`)
    friends.value = res || []
  } catch (e) {
    error.value = '获取好友列表失败'
  } finally {
    loading.value = false
  }
}

const selectFriend = async (friend) => {
  if (selectedFriend.value && selectedFriend.value.id === friend.id) return
  selectedFriend.value = friend
  // 获取好友详细信息
  try {
    const res = await axios.post('/userProfile/myProfile', null, {
      params: { userId: friend.id }
    })
    selectedFriendInfo.value = {
      avatarUrl: res.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(res.nickname || res.username || '用户')}&background=4e8cff&color=fff&length=1`,
      nickname: res.nickname || res.username,
      username: res.username,
      gender: res.gender,
      age: res.age,
      bio: res.bio,
      id: friend.id
    }
  } catch {
    selectedFriendInfo.value = {
      avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(friend.nickname || friend.username || '用户')}&background=4e8cff&color=fff&length=1`,
      nickname: friend.nickname,
      username: friend.username,
      gender: '',
      age: '',
      bio: '',
      id: friend.id
    }
  }
}

const goToDashboard = () => {
  router.push('/dashboard')
}

const goToUserHome = (id) => {
  router.push(`/user/${id}`)
}

const handleAddFriend = async () => {
  if (!addFriendName.value.trim()) return
  adding.value = true
  error.value = ''
  try {
    const userId = localStorage.getItem('studentId')
    await axios.post('/userFriend/addFriend', {
      userId,
      friendUsername: addFriendName.value.trim()
    })
    addFriendName.value = ''
    await fetchFriends()
  } catch (e) {
    error.value = e?.response?.data?.msg || '添加好友失败'
  } finally {
    adding.value = false
  }
}

const handleDeleteFriend = async (friend) => {
  deletingId.value = friend.id
  error.value = ''
  try {
    const userId = localStorage.getItem('studentId')
    await axios.post('/userFriend/deleteFriend', {
      userId,
      friendId: friend.id
    })
    await fetchFriends()
    if (selectedFriend.value && selectedFriend.value.id === friend.id) {
      selectedFriend.value = null
      selectedFriendInfo.value = null
    }
  } catch (e) {
    error.value = '删除失败'
  } finally {
    deletingId.value = null
  }
}

onMounted(fetchFriends)
</script>

<style scoped>
.friend-list-bg {
  min-height: 100vh;
  background: linear-gradient(135deg, #74ABE2 0%, #5563DE 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  font-family: 'Inter', system-ui, sans-serif;
}
.friend-list-layout {
  display: flex;
  width: 1500px;
  max-width: 150vw;
  min-height: 800px;
  background: rgba(255,255,255,0.98);
  border-radius: 24px;
  box-shadow: 0 12px 40px 0 rgba(80, 112, 255, 0.18), 0 1.5px 8px 0 rgba(80, 112, 255, 0.08);
  overflow: hidden;
  position: relative;
  animation: card-pop 0.8s cubic-bezier(.68,-0.55,.27,1.55);
}
@keyframes card-pop {
  0% { transform: scale(0.8) translateY(40px); opacity: 0; }
  100% { transform: scale(1) translateY(0); opacity: 1; }
}
/* 左侧好友列表 */
.friend-list-card {
  width: 320px;
  background: rgba(255,255,255,0.98);
  border-right: 1.5px solid #e0e7ff;
  padding: 44px 24px 32px 24px;
  display: flex;
  flex-direction: column;
  min-height: 600px;
}
.title {
  font-size: 26px;
  font-weight: bold;
  color: #5563de;
  margin-bottom: 24px;
  text-align: center;
  letter-spacing: 2px;
}
.add-friend-form {
  display: flex;
  gap: 10px;
  margin-bottom: 18px;
}
.add-input {
  flex: 1;
  padding: 12px 14px;
  border: 1.5px solid #e0e7ff;
  border-radius: 8px;
  font-size: 15px;
  outline: none;
  background: #f7faff;
  transition: border-color 0.25s, box-shadow 0.25s;
}
.add-input:focus {
  border-color: #5563de;
  box-shadow: 0 0 0 2px #a5b4fc44;
}
.add-btn {
  background: linear-gradient(90deg, #74ABE2 0%, #5563DE 100%);
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 0 18px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s, transform 0.15s;
  box-shadow: 0 2px 8px #a5b4fc33;
}
.add-btn:disabled {
  background: #a5b4fc;
  cursor: not-allowed;
}
.add-btn:hover:not(:disabled) {
  background: linear-gradient(90deg, #5563DE 0%, #74ABE2 100%);
  transform: translateY(-2px) scale(1.03);
}
.friend-list {
  list-style: none;
  padding: 0;
  margin: 0;
  flex: 1;
  overflow-y: auto;
}
.friend-item {
  display: flex;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f1f5f9;
  transition: background 0.2s;
  border-radius: 6px;
  cursor: pointer;
}
.friend-item.active, .friend-item:hover {
  background: #f7faff;
}
.avatar {
  width: 38px;
  height: 38px;
  background: linear-gradient(135deg, #74ABE2 0%, #5563DE 100%);
  color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  margin-right: 14px;
  font-size: 18px;
  box-shadow: 0 2px 8px #a5b4fc33;
  transition: transform 0.2s;
}
.friend-item:hover .avatar, .friend-item.active .avatar {
  transform: scale(1.08) rotate(-6deg);
}
.friend-name {
  flex: 1;
  font-size: 16px;
  color: #333;
  font-weight: 500;
  letter-spacing: 1px;
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
}
.delete-btn:disabled {
  background: #fca5a5;
  cursor: not-allowed;
}
.delete-btn:hover:not(:disabled) {
  background: linear-gradient(90deg, #fca5a5 0%, #f87171 100%);
  transform: translateY(-2px) scale(1.03);
}
.loading, .empty {
  text-align: center;
  color: #888;
  margin-top: 18px;
  font-size: 15px;
}
.error-msg {
  color: #e74c3c;
  text-align: center;
  margin-bottom: 10px;
  font-size: 15px;
  animation: shake 0.3s;
}
@keyframes shake {
  0% { transform: translateX(0);}
  25% { transform: translateX(-5px);}
  50% { transform: translateX(5px);}
  75% { transform: translateX(-5px);}
  100% { transform: translateX(0);}
}
/* 右侧好友信息卡片 */
.friend-info-card {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  animation: fadeInRight 0.6s cubic-bezier(.68,-0.55,.27,1.55);
  background: rgba(255,255,255,0.92);
  padding: 60px 40px;
  height: 100%;
}
@keyframes fadeInRight {
  0% { opacity: 0; transform: translateX(60px);}
  100% { opacity: 1; transform: translateX(0);}
}
.info-avatar {
  width: 120px;
  height: 120px;
  margin-bottom: 24px;
  border-radius: 50%;
  overflow: hidden;
  box-shadow: 0 4px 16px #a5b4fc33;
  border: 4px solid #fff;
  background: #f7faff;
  display: flex;
  align-items: center;
  justify-content: center;
}
.info-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.info-main {
  text-align: center;
}
.info-main h3 {
  font-size: 1.5rem;
  color: #5563DE;
  font-weight: 700;
  margin-bottom: 10px;
}
.info-detail {
  font-size: 1rem;
  color: #555;
  margin: 6px 0;
}
.info-bio {
  font-style: italic;
  color: #666;
  margin: 18px 0 24px 0;
  line-height: 1.6;
  min-height: 40px;
}
.profile-btn {
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
.profile-btn:hover {
  background: linear-gradient(90deg, #5563DE 0%, #74ABE2 100%);
  transform: scale(1.04);
}

/* 动画 */
.slide-fade-enter-active, .slide-fade-leave-active {
  transition: all 0.5s cubic-bezier(.68,-0.55,.27,1.55);
}
.slide-fade-enter-from, .slide-fade-leave-to {
  opacity: 0;
  transform: translateX(60px);
}

/* 返回主板按钮 */
.dashboard-btn-wrapper {
  position: absolute;
  top: 16px;
  left: 16px;
  margin-top: 0;
  text-align: left;
  z-index: 1000;
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

/* 响应式 */
@media (max-width: 900px) {
  .friend-list-layout {
    flex-direction: column;
    min-width: 0;
    width: 98vw;
    min-height: 0;
  }
  .friend-list-card {
    width: 100%;
    min-height: 0;
    border-right: none;
    border-bottom: 1.5px solid #e0e7ff;
  }
  .friend-info_card {
    padding: 32px 10px;
  }
}
</style>
