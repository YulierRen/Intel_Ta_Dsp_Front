<template>
  <div class="dashboard-page">
    <div class="dashboard-header">
      <h1>我的课表</h1>
    </div>
    <div class="schedule-card">
      <table class="schedule-table">
        <thead>
        <tr>
          <th>课程名称</th>
          <th>任课教师</th>
          <th>星期</th>
          <th>时间</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="item in schedules" :key="item.id">
          <td>{{ item.course.name }}</td>
          <td>{{ item.course.teacher }}</td>
          <td>{{ item.day }}</td>
          <td>{{ item.timeSlot }}</td>
        </tr>
        </tbody>
      </table>
      <div v-if="!schedules.length" class="no-data">
        暂无课表
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from '@/utils/axios' // 👈 你刚才封装的实例

const schedules = ref([])

onMounted(async () => {
  try {
    const studentId = localStorage.getItem('studentId')
    console.log(studentId)
    const res = await axios.get(`/schedule/student/${studentId}`)
    schedules.value = res
  } catch (e) {
    // 错误会在拦截器中统一处理
  }
})
</script>

<style scoped>
.dashboard-page {
  min-height: 100vh;
  padding: 40px 20px;
  background: #f0f4ff;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.dashboard-header {
  text-align: center;
  margin-bottom: 30px;
}

.dashboard-header h1 {
  font-size: 28px;
  color: #5563DE;
}

.schedule-card {
  max-width: 800px;
  margin: 0 auto;
  background: white;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
}

.schedule-table {
  width: 100%;
  border-collapse: collapse;
}

.schedule-table th,
.schedule-table td {
  padding: 12px 16px;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.schedule-table th {
  background: #f7f9ff;
  color: #333;
}

.schedule-table tr:hover {
  background: #f1f5ff;
}

.no-data {
  text-align: center;
  padding: 40px 0;
  color: #999;
  font-size: 16px;
}
</style>
