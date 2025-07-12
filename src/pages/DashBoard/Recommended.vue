<script setup lang="ts">
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
</script>

<template>
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
</template>

<style scoped>
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
</style>