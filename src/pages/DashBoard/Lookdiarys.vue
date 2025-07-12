<script setup lang="ts">
const diaryList = [
  {
    id: 1,
    author: '小明',
    title: '我的周一',
    content: '今天上了三节课，下午和朋友打篮球，晚上复习了英语。',
    date: '2024-06-03'
  },
  {
    id: 2,
    author: '小红',
    title: '备考日记',
    content: '今天主要复习了数学，做了很多题，感觉进步了。',
    date: '2024-06-03'
  },
  {
    id: 3,
    author: '小刚',
    title: '运动与学习',
    content: '运动后学习效率更高，推荐大家多锻炼！',
    date: '2024-06-02'
  }
]
</script>

<template>
  <div class="diaryground-list">
    <div class="diaryground-item" v-for="d in diaryList" :key="d.id">
      <div class="diary-header">
        <span class="author">{{ d.author }}</span>
        <span class="date">{{ d.date }}</span>
      </div>
      <div class="diary-title">{{ d.title }}</div>
      <div class="diary-content">{{ d.content }}</div>
    </div>
  </div>
</template>

<style scoped>
.diaryground-list {
  display: flex;
  flex-direction: column;
  gap: 22px;
  padding: 10px 0;
}
.diaryground-item {
  background: linear-gradient(90deg, #e0e7ff 0%, #74ABE2 100%);
  border-radius: 14px;
  padding: 18px 16px 14px 16px;
  box-shadow: 0 2px 8px #a5b4fc22;
  transition: box-shadow 0.2s;
}
.diaryground-item:hover {
  box-shadow: 0 6px 24px #a5b4fc33;
}
.diary-header {
  display: flex;
  justify-content: space-between;
  font-size: 0.98rem;
  color: #888;
  margin-bottom: 6px;
}
.author {
  color: #5563DE;
  font-weight: 600;
}
.date {
  color: #b0b8e6;
}
.diary-title {
  font-size: 1.08rem;
  font-weight: 600;
  color: #5563DE;
  margin-bottom: 4px;
}
.diary-content {
  font-size: 0.98rem;
  color: #333;
  opacity: 0.92;
  line-height: 1.5;
}
</style>