<template>
  <div class="ai-schedule-container">
    <h2>AI 智能生成日程</h2>

    <div class="form-group">
      <label>需求目标</label>
      <input v-model="requirements" type="text" placeholder="请输入你的日程需求（如学习java）" maxlength="100" />
    </div>

    <div class="form-group">
      <label>开始时间</label>
      <input v-model="startTime" type="datetime-local" />
    </div>

    <div class="form-group">
      <label>结束时间</label>
      <input v-model="endTime" type="datetime-local" />
    </div>

    <button :disabled="loading" @click="generateSchedule">
      {{ loading ? '生成中...' : '生成日程' }}
    </button>

    <div v-if="error" class="error-msg">{{ error }}</div>

    <div v-if="result.length" class="result-list">
      <h3>生成结果：</h3>
      <ul>
        <li v-for="(item, index) in result" :key="index">
          <strong>{{ item.title }}</strong><br />
          {{ item.description }}<br />
          时间：{{ item.startTime }} - {{ item.endTime }}<br />
          地点：{{ item.location }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import axios from '@/utils/axios'  // 你的axios实例路径

const requirements = ref('')
const startTime = ref('')
const endTime = ref('')
const loading = ref(false)
const error = ref('')
const result = ref([])

async function generateSchedule() {
  error.value = ''
  result.value = []
  loading.value = true

  const userId = localStorage.getItem('studentId')
  if (!userId) {
    error.value = '未登录，请先登录'
    loading.value = false
    return
  }
  if (!requirements.value || !startTime.value || !endTime.value) {
    error.value = '请填写所有字段'
    loading.value = false
    return
  }

  try {
    // 请求体和你的 DTO 对应
    const dto = {
      userId: Number(userId),
      requirements: requirements.value,
      startTime: startTime.value,
      endTime: endTime.value,
    }

    // 调用后端接口
    // 注意：根据你后端返回格式调整，假设返回解析后的 JSON 数组
    const res = await axios.post('/ai/generateSchedule', dto)

    // 如果后端只返回字符串或者你想解析json数组，这里示范一下解析字符串为JSON数组
    // 你根据实际情况调整
    if (typeof res === 'string') {
      // 尝试解析成数组
      try {
        result.value = JSON.parse(res)
      } catch {
        error.value = '返回结果解析失败'
      }
    } else if (Array.isArray(res)) {
      result.value = res
    } else if (res?.data && Array.isArray(res.data)) {
      result.value = res.data
    } else {
      result.value = []
    }
  } catch (e) {
    error.value = e?.response?.data || e.message || '生成失败'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.ai-schedule-container {
  max-width: 500px;
  margin: 20px auto;
  padding: 20px;
  border-radius: 12px;
  background: #f9f9f9;
  box-shadow: 0 0 8px #ddd;
  font-family: Arial, sans-serif;
}
.form-group {
  margin-bottom: 15px;
}
input[type='text'],
input[type='datetime-local'] {
  width: 100%;
  padding: 8px;
  border-radius: 6px;
  border: 1px solid #ccc;
}
button {
  width: 100%;
  padding: 10px;
  border: none;
  border-radius: 6px;
  background-color: #4f46e5;
  color: white;
  font-weight: bold;
  cursor: pointer;
}
button:disabled {
  background-color: #aaa;
  cursor: not-allowed;
}
.error-msg {
  margin-top: 10px;
  color: #e53e3e;
  font-weight: bold;
}
.result-list {
  margin-top: 20px;
  background: white;
  border-radius: 8px;
  padding: 15px;
  box-shadow: 0 0 6px #bbb;
}
.result-list ul {
  list-style: none;
  padding: 0;
}
.result-list li {
  margin-bottom: 15px;
  line-height: 1.4;
}
</style>
