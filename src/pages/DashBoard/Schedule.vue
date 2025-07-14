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

    <div class="dashboard-content">
      <div class="dashboard-grid">
        <div class="day-name" v-for="day in dayNames" :key="day">{{ day }}</div>
        <div v-for="n in firstDayOfMonth" :key="'empty' + n" class="empty-day"></div>
        <div
            v-for="date in daysInMonth"
            :key="date"
            class="day-cell"
            :style="getCellStyle(date)"
            @click="showDetails(date)"
        >
          <div class="date-number">{{ date }}</div>
        </div>
      </div>
      <div class="right-panel" v-if="selectedDay !== null">
        <div class="right-panel-title">
          <span>{{ year }}-{{ (month+1).toString().padStart(2,'0') }}-{{ selectedDay.toString().padStart(2,'0') }} 日程</span>
        </div>
        <div v-if="sortedEvents.length === 0" class="no-events">
          这一天暂无日程
        </div>
        <ul v-else class="event-list">
          <li v-for="e in sortedEvents" :key="e.id" class="event-item">
            <div class="event-time">
              {{ formatTime(e.startTime) }} - {{ formatTime(e.endTime) }}
            </div>
            <div class="event-title">{{ e.title }}</div>
            <div class="event-desc">{{ e.description }}</div>
            <div class="event-location">📍{{ e.location }}</div>
          </li>
        </ul>
      </div>
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
// 默认显示今天的日程
const selectedDay = ref(today.getDate())

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
  selectedDay.value = day
}

function formatTime(iso) {
  const date = new Date(iso)
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function prevMonth() {
  if (month.value === 0) {
    month.value = 11
    year.value--
  } else {
    month.value--
  }
  selectedDay.value = null
}

function nextMonth() {
  if (month.value === 11) {
    month.value = 0
    year.value++
  } else {
    month.value++
  }
  selectedDay.value = null
}
async function loadSchedule() {
  try {
    const studentId = localStorage.getItem('studentId')
    const res = await axios.get(`/schedule/student/${studentId}`)
    res.forEach(item => {
      if (item.title && item.title.length > 9) {
        item.title = item.title.slice(0, 9) + '...';
      }
    })
    scheduleList.value = res
  } catch (err) {
    console.error('获取数据失败', err)
  }
}

onMounted(async () => {
  await loadSchedule()
})

const sortedEvents = computed(() => {
  if (selectedDay.value === null) return []
  const events = getEventsForDate(selectedDay.value)
  return events.slice().sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
})

// 颜色梯度：0件=无色，1-2件=浅蓝，3-4件=深蓝，5-6件=紫，7-8件=橙，9+件=金色
function getCellStyle(day) {
  const count = getEventsForDate(day).length
  let bg = ''
  if (count === 0) {
    bg = '#f7faff'
  } else if (count <= 2) {
    bg = 'linear-gradient(135deg, #b3e0ff 0%, #74ABE2 100%)'
  } else if (count <= 4) {
    bg = 'linear-gradient(135deg, #74ABE2 0%, #5563DE 100%)'
  } else if (count <= 6) {
    bg = 'linear-gradient(135deg, #7f7fd5 0%, #5563DE 100%)'
  } else if (count <= 8) {
    bg = 'linear-gradient(135deg, #f7971e 0%, #ffd200 100%)'
  } else {
    bg = 'linear-gradient(135deg, #ffd200 0%, #ffb347 100%)'
  }
  return {
    background: bg,
    border: '1.5px solid #e0e7ff'
  }
}

defineExpose({
  loadSchedule
})

</script>

<style scoped>
.dashboard {
  max-width: 2000px;
  max-height: 1500px;
  margin: -50px auto;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  /* 移除背景色和圆角、阴影，保持与外部一致 */
  background: transparent;
  border-radius: 0;
  box-shadow: none;
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
.dashboard-content {
  display: flex;
  gap: 32px;
}
.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(7,1fr);
  gap: 3px;
  flex: 1;
  min-width: 600px;
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
  cursor: pointer;
  border-radius: 8px;
  transition: background 0.2s, transform 0.2s;
  box-shadow: 0 1px 4px #a5b4fc11;
  display: flex;
  align-items: flex-start;
  justify-content: flex-end;
  flex-direction: column;
}
.day-cell:hover {
  filter: brightness(1.08) drop-shadow(0 2px 8px #a5b4fc33);
  transform: scale(1.03);
}
.date-number {
  font-size: 13px;
  font-weight: bold;
  color: #5563DE;
  margin: 4px 0 0 6px;
  background: rgba(255,255,255,0.7);
  border-radius: 6px;
  padding: 1px 6px;
  align-self: flex-start;
}
.right-panel {
  width: 340px;
  min-height: 400px;
  background: linear-gradient(135deg, #f7faff 0%, #e0e7ff 100%);
  border-radius: 16px;
  box-shadow: 0 2px 16px #a5b4fc22;
  padding: 28px 22px 22px 22px;
  display: flex;
  flex-direction: column;
  animation: fadein 0.5s;
}
@keyframes fadein {
  0% { opacity: 0; transform: scale(0.96) translateY(40px);}
  100% { opacity: 1; transform: scale(1) translateY(0);}
}
.right-panel-title {
  font-size: 1.18rem;
  font-weight: bold;
  color: #5563DE;
  margin-bottom: 18px;
  letter-spacing: 1px;
  text-align: left;
}
.no-events {
  color: #aaa;
  font-size: 1.05rem;
  text-align: center;
  margin-top: 40px;
}
.event-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 18px;
}
.event-item {
  background: linear-gradient(90deg, #74ABE2 0%, #e0e7ff 100%);
  border-radius: 12px;
  padding: 14px 14px 10px 14px;
  box-shadow: 0 2px 8px #a5b4fc22;
  display: flex;
  flex-direction: column;
  gap: 4px;
  transition: box-shadow 0.2s;
}
.event-item:hover {
  box-shadow: 0 6px 24px #a5b4fc33;
}
.event-title {
  font-size: 1.08rem;
  font-weight: 600;
  color: #5563DE;
}
.event-time {
  font-size: 0.98rem;
  color: #74ABE2;
  font-weight: 500;
}
.event-desc {
  font-size: 0.98rem;
  color: #333;
  opacity: 0.92;
  line-height: 1.5;
}
.event-location {
  font-size: 0.95rem;
  color: #b0b8e6;
}
@media (max-width: 1200px) {
  .right-panel {
    display: none;
  }
  .dashboard-content {
    gap: 0;
  }
}
</style>

