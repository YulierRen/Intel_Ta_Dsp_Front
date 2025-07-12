<script setup lang="ts">
const friends = [
  { id: 1, name: '小明', status: '在线', signature: '努力学习，天天向上' },
  { id: 2, name: '小红', status: '离线', signature: '喜欢画画和音乐' },
  { id: 3, name: '小刚', status: '在线', signature: '运动达人' }
]
</script>

<template>
  <div class="friends-list">
    <div class="friend-item" v-for="f in friends" :key="f.id">
      <div class="avatar">{{ f.name[0] }}</div>
      <div class="info">
        <div class="name-status">
          <span class="name">{{ f.name }}</span>
          <span class="status" :class="f.status === '在线' ? 'online' : 'offline'">{{ f.status }}</span>
        </div>
        <div class="signature">{{ f.signature }}</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.friends-list {
  display: flex;
  flex-direction: column;
  gap: 18px;
  padding: 10px 0;
}
.friend-item {
  display: flex;
  align-items: center;
  gap: 14px;
  background: rgba(255,255,255,0.13);
  border-radius: 12px;
  padding: 12px 16px;
  border: 1px solid rgba(116,171,226,0.13);
  transition: background 0.2s;
}
.friend-item:hover {
  background: rgba(255,255,255,0.22);
}
.avatar {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: linear-gradient(135deg, #74ABE2 0%, #5563DE 100%);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.3rem;
  font-weight: bold;
  box-shadow: 0 2px 8px #a5b4fc33;
}
.info {
  flex: 1;
}
.name-status {
  display: flex;
  align-items: center;
  gap: 10px;
}
.name {
  font-weight: 600;
  color: #5563DE;
}
.status {
  font-size: 0.95rem;
  padding: 2px 8px;
  border-radius: 8px;
}
.status.online {
  background: #e0f7fa;
  color: #1abc9c;
}
.status.offline {
  background: #fbeee6;
  color: #e67e22;
}
.signature {
  font-size: 0.95rem;
  color: #888;
  margin-top: 2px;
}
</style>