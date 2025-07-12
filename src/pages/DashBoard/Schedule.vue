<template>
  <div
      class="dashboard"
      :style="{ width: width, height: height, position: 'relative' }"
  >
    <div class="dashboard-header">
      <button @click="prevMonth">《</button>
      <span>{{ year }} 年 {{ month + 1 }} 月</span>
      <button @click="nextMonth">》</button>
    </div>

    <div class="dashboard-grid">
      <div class="day-name" v-for="day in dayNames" :key="day">{{ day }}</div>

      <div v-for="n in firstDayOfMonth" :key="'empty' + n" class="empty-day"></div>

      <div
          v-for="date in daysInMonth"
          :key="date"
          class="day-cell"
          @click="showDetails(date)"
      >
        <div class="date-number">{{ date }}</div>
        <div class="event" v-for="e in getEventsForDate(date)" :key="e.id">
          {{ e.title }}
        </div>
      </div>
    </div>

    <div v-if="selectedEvents.length > 0" class="modal">
      <h3>📅 日程详情</h3>
      <ul>
        <li v-for="e in selectedEvents" :key="e.id">
          <strong>{{ e.title }}</strong><br />
          {{ e.description }}<br />
          {{ formatTime(e.startTime) }} - {{ formatTime(e.endTime) }}<br />
          地点: {{ e.location }}
        </li>
      </ul>
      <button @click="selectedEvents = []">关闭</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from '@/utils/axios.js'

const dayNames = ['日', '一', '二', '三', '四', '五', '六']

const today = new Date()
const year = ref(today.getFullYear())
const month = ref(today.getMonth()) // 0-based

const scheduleList = ref([])
const selectedEvents = ref([])

const firstDayOfMonth = computed(() => {
  return new Date(year.value, month.value, 1).getDay()
})

const daysInMonth = computed(() => {
  return new Date(year.value, month.value + 1, 0).getDate()
})

const getEventsForDate = (day) => {
  const y = year.value
  const m = month.value + 1
  const d = day.toString().padStart(2, '0')
  const datePrefix = `${y}-${m.toString().padStart(2, '0')}-${d}`
  return scheduleList.value.filter((e) =>
      e.startTime.startsWith(datePrefix)
  )
}

function showDetails(day) {
  selectedEvents.value = getEventsForDate(day)
}

function formatTime(iso) {
  return new Date(iso).toLocaleString()
}

function prevMonth() {
  if (month.value === 0) {
    month.value = 11
    year.value--
  } else {
    month.value--
  }
}

function nextMonth() {
  if (month.value === 11) {
    month.value = 0
    year.value++
  } else {
    month.value++
  }
}

onMounted(async () => {
  try {
    const studentId = localStorage.getItem('studentId')
    const res = await axios.get(`/schedule/student/${studentId}`)
    scheduleList.value = res // 这里res就是data
  } catch (err) {
    console.error('获取数据失败', err)
  }
})
</script>

<style scoped>
.dashboard {
  max-width: 700px;
  margin: 40px auto;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background: rgba(255,255,255,0.98);
  border-radius: 18px;
  box-shadow: 0 12px 40px 0 rgba(80, 112, 255, 0.18), 0 1.5px 8px 0 rgba(80, 112, 255, 0.08);
  padding: 32px 24px 24px 24px;
  animation: card-pop 0.8s cubic-bezier(.68,-0.55,.27,1.55);
}
@keyframes card-pop {
  0% { transform: scale(0.96) translateY(40px); opacity: 0; }
  100% { transform: scale(1) translateY(0); opacity: 1; }
}
.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
  margin-bottom: 18px;
  font-size: 20px;
  color: #5563DE;
  letter-spacing: 1px;
}
.dashboard-header button {
  background: linear-gradient(90deg, #74ABE2 0%, #5563DE 100%);
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 6px 18px;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 2px 8px #a5b4fc33;
  transition: background 0.3s, transform 0.15s;
}
.dashboard-header button:hover {
  background: linear-gradient(90deg, #5563DE 0%, #74ABE2 100%);
  transform: translateY(-2px) scale(1.03);
}
.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
}
.day-name {
  text-align: center;
  font-weight: bold;
  color: #5563DE;
  font-size: 16px;
  padding-bottom: 6px;
}
.empty-day {
  height: 80px;
}
.day-cell {
  border: 1.5px solid #e0e7ff;
  padding: 4px;
  height: 80px;
  position: relative;
  background: #f7faff;
  cursor: pointer;
  border-radius: 8px;
  transition: background 0.2s, transform 0.2s;
}
.day-cell:hover {
  background: #e0e7ff;
  transform: scale(1.03);
}
.date-number {
  font-size: 13px;
  font-weight: bold;
  color: #5563DE;
}
.event {
  background: linear-gradient(90deg, #74ABE2 0%, #5563DE 100%);
  color: white;
  font-size: 13px;
  padding: 2px 6px;
  margin-top: 4px;
  border-radius: 6px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  box-shadow: 0 1px 4px #a5b4fc33;
}
.modal {
  position: fixed;
  top: 22%;
  left: 50%;
  transform: translateX(-50%);
  background: #fff;
  border: 1.5px solid #e0e7ff;
  padding: 28px 32px;
  z-index: 10;
  box-shadow: 0 8px 32px rgba(80, 112, 255, 0.18);
  border-radius: 16px;
  animation: fadein 0.5s;
}
@keyframes fadein {
  0% { opacity: 0; transform: scale(0.96) translateY(40px);}
  100% { opacity: 1; transform: scale(1) translateY(0);}
}
.modal h3 {
  color: #5563DE;
  margin-bottom: 16px;
  font-size: 20px;
}
.modal button {
  margin-top: 16px;
  background: linear-gradient(90deg, #74ABE2 0%, #5563DE 100%);
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 8px 22px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 2px 8px #a5b4fc33;
  transition: background 0.3s, transform 0.15s;
}
.modal button:hover {
  background: linear-gradient(90deg, #5563DE 0%, #74ABE2 100%);
  transform: translateY(-2px) scale(1.03);
}
</style>

