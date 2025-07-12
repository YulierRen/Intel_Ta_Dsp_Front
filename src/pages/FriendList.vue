<template>
  <div class="friend-list-page">
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
        <li v-for="friend in friends" :key="friend.id" class="friend-item">
          <span class="avatar">{{ friend.nickname?.charAt(0) || friend.username?.charAt(0) || '友' }}</span>
          <span class="friend-name">{{ friend.nickname || friend.username }}</span>
          <button class="delete-btn" @click="handleDeleteFriend(friend)" :disabled="deletingId === friend.id">
            {{ deletingId === friend.id ? '删除中...' : '删除' }}
          </button>
        </li>
      </ul>
      <div v-if="loading" class="loading">加载中...</div>
      <div v-if="!loading && friends.length === 0" class="empty">暂无好友</div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from '@/utils/axios'

const friends = ref([])
const loading = ref(false)
const error = ref('')
const addFriendName = ref('')
const adding = ref(false)
const deletingId = ref(null)

const fetchFriends = async () => {
  loading.value = true
  error.value = ''
  try {
    const userId = localStorage.getItem('studentId')
    const res = await axios.post('/userFriend/getFriendList?id=${userId}')
    friends.value = res || []
  } catch (e) {
    error.value = '获取好友列表失败'
  } finally {
    loading.value = false
  }
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
  } catch (e) {
    error.value = '删除失败'
  } finally {
    deletingId.value = null
  }
}

onMounted(fetchFriends)
</script>

<style scoped>
.friend-list-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #74ABE2 0%, #5563DE 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}
.friend-list-card {
  background: rgba(255,255,255,0.98);
  border-radius: 18px;
  box-shadow: 0 12px 40px 0 rgba(80, 112, 255, 0.18), 0 1.5px 8px 0 rgba(80, 112, 255, 0.08);
  padding: 44px 32px 32px 32px;
  width: 420px;
  max-width: 95vw;
  animation: card-pop 0.8s cubic-bezier(.68,-0.55,.27,1.55);
}
@keyframes card-pop {
  0% { transform: scale(0.8) translateY(40px); opacity: 0; }
  100% { transform: scale(1) translateY(0); opacity: 1; }
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
}
.friend-item {
  display: flex;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f1f5f9;
  transition: background 0.2s;
  border-radius: 6px;
}
.friend-item:hover {
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
.friend-item:hover .avatar {
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
</style>
