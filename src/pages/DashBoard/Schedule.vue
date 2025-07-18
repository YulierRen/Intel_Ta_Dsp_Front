<template>
  <div
      class="dashboard"
      :style="{ width: width, height: height, position: 'relative' }"
  >
    <div class="dashboard-header">
      <button @click="prevMonth">《</button>
      <span>{{ year }} 年 {{ month + 1 }} 月
        颜色越深，这一天日程安排越满哦
      </span>
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
          <button class="add-btn" @click="openAddModal">＋ 添加</button>
        </div>
        <div v-if="sortedEvents.length === 0" class="no-events">
          这一天暂无日程
        </div>
        <ul v-else class="event-list">
          <li
              v-for="e in sortedEvents"
              :key="e.id"
              class="event-item"
              @click.stop="openEditModal(e)"
          >
            <div class="event-time">
              {{ formatTime(e.startTime) }} - {{ formatTime(e.endTime) }}
            </div>
            <div class="event-title">{{ e.title }}</div>
            <div class="event-desc">{{ e.description }}</div>
            <div class="event-location">📍{{ e.location }}</div>

            <!-- 如果未完成，显示按钮 -->
            <button
                v-if="!e.isCompleted"
                class="right-btn"
                @click.stop="handleRightButtonClick(e)"
            >
              完成
            </button>

            <!-- 如果已完成，显示纯文字 -->
            <span v-else class="right-label">已完成</span>
          </li>
        </ul>
        <!-- 日记按钮，点击唤起DayNote弹窗，传递当前右侧日期 -->
        <el-button class="diary-fab" @click="openDiaryModal">日　记</el-button>
      </div>
    </div>

    <!-- 弹窗：新增/编辑日程 -->
    <div v-if="showModal" class="custom-modal-mask">
      <div class="custom-modal-content">
        <h3>{{ modalMode === 'add' ? '添加日程' : '编辑/删除日程' }}</h3>
        <form @submit.prevent="handleSubmit">
          <div class="modal-field">
            <label>标题</label>
            <input v-model="modalForm.title" required maxlength="30" />
          </div>
          <div class="modal-field">
            <label>完成情况</label>
            <el-radio-group v-model="modalForm.isCompleted">
              <el-radio :label="true">已完成</el-radio>
              <el-radio :label="false">未完成</el-radio>
            </el-radio-group>
          </div>
          <div class="modal-field">
            <label>描述</label>
            <textarea v-model="modalForm.description" maxlength="100" />
          </div>
          <div class="modal-field">
            <label>开始时间</label>
            <input v-model="modalForm.startTime" type="datetime-local" required />
          </div>
          <div class="modal-field">
            <label>结束时间</label>
            <input v-model="modalForm.endTime" type="datetime-local" required />
          </div>
          <div class="modal-field">
            <label>地点</label>
            <input v-model="modalForm.location" maxlength="30" />
          </div>
          <div class="modal-actions">
            <button type="submit" class="modal-btn confirm">
              {{ modalMode === 'add' ? '添加' : '保存修改' }}
            </button>
            <button type="button" class="modal-btn" @click="closeModal">取消</button>
            <button
              v-if="modalMode === 'edit'"
              type="button"
              class="modal-btn danger"
              @click="handleDelete"
            >删除</button>
          </div>
        </form>
      </div>
    </div>

    <!-- DayNote弹窗，传递当前右侧日程日期 -->
    <DayNote
      v-if="showDiaryModal"
      :date="rightPanelDate"
      @close="showDiaryModal = false"
    />
  </div>>

</template>

<script setup>
import { ref, computed, onMounted, reactive, watch } from 'vue'
import axios from '@/utils/axios.js'
import DayNote from './DayNote.vue'

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
const handleRightButtonClick = async (schedule) => {
  if(!confirm('已完成？'))return
  try{
    schedule.isCompleted = true
    await updateSchedule(schedule)
    await loadSchedule()
  }catch(err){
    console.log(err)
  }
}
function showDetails(day) {
  selectedDay.value = day
}

// 工具：将本地 datetime-local 字符串转为中国东八区 Date 对象
function toChinaDate(localDateTimeStr) {
  // localDateTimeStr: '2024-06-09T08:00'
  // 直接 new Date 会自动按本地时区解析
  return new Date(localDateTimeStr)
}

// 工具：将后端返回的时间（Date/ISO字符串/时间戳）转为 'yyyy-MM-ddTHH:mm' 格式（适配 input[type="datetime-local"]）
function toInputDateTimeStr(dateInput) {
  if (!dateInput) return ''
  const date = typeof dateInput === 'string' || typeof dateInput === 'number'
    ? new Date(dateInput)
    : dateInput
  // 补齐本地时区
  const y = date.getFullYear()
  const m = (date.getMonth() + 1).toString().padStart(2, '0')
  const d = date.getDate().toString().padStart(2, '0')
  const h = date.getHours().toString().padStart(2, '0')
  const min = date.getMinutes().toString().padStart(2, '0')
  return `${y}-${m}-${d}T${h}:${min}`
}

function formatDateTimeString(dateInput) {
  if (!dateInput) return ''
  const date = new Date(dateInput)
  const y = date.getFullYear()
  const m = (date.getMonth() + 1).toString().padStart(2, '0')
  const d = date.getDate().toString().padStart(2, '0')
  const h = date.getHours().toString().padStart(2, '0')
  const min = date.getMinutes().toString().padStart(2, '0')
  return `${y}-${m}-${d} ${h}:${min}`
}

function formatTime(iso) {
  // 返回 'HH:mm'，如需完整日期可用 formatDateTimeString
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
  // 保持 selectedDay 不变
}

function nextMonth() {
  if (month.value === 11) {
    month.value = 0
    year.value++
  } else {
    month.value++
  }
  // 保持 selectedDay 不变
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

// 颜色梯度：0件=无色，1件=淡绿色，2件=天蓝色，3件=海蓝色，4件=黄色，5件=红色，5件以上=紫色
function getCellStyle(day) {
  const count = getEventsForDate(day).length
  let bg = ''
  if (count === 0) {
    bg = '#f7faff'
  } else if (count === 1) {
    bg = 'linear-gradient(135deg, #d0f5e8 0%, #a8e6cf 100%)' // 淡绿色
  } else if (count === 2) {
    bg = 'linear-gradient(135deg, #b3e0ff 0%, #74ABE2 100%)' // 天蓝色
  } else if (count === 3) {
    bg = 'linear-gradient(135deg, #4fc3f7 0%, #0288d1 100%)' // 海蓝色
  } else if (count === 4) {
    bg = 'linear-gradient(135deg, #fff9c4 0%, #ffe066 100%)' // 黄色
  } else if (count === 5) {
    bg = 'linear-gradient(135deg, #ffb3b3 0%, #ff5252 100%)' // 红色
  } else {
    bg = 'linear-gradient(135deg, #b39ddb 0%, #7c4dff 100%)' // 紫色
  }
  return {
    background: bg,
    border: '1.5px solid #e0e7ff'
  }
}

// 新增：添加日程
async function addSchedule(schedule) {
  try {
    const res = await axios.post('/schedule/add', schedule)
    await loadSchedule()
    return res
  } catch (err) {
    console.error('添加日程失败', err)
    throw err
  }
}

// 新增：更新日程
async function updateSchedule(schedule) {
  try {
    const res = await axios.put('/schedule/update', schedule)
    await loadSchedule()
    return res
  } catch (err) {
    console.error('更新日程失败', err)
    throw err
  }
}

// 新增：删除日程
async function deleteSchedule(id) {
  try {
    const res = await axios.delete(`/schedule/delete/${id}`)
    await loadSchedule()
    return res
  } catch (err) {
    console.error('删除日程失败', err)
    throw err
  }
}

// 弹窗相关
const showModal = ref(false)
const modalMode = ref('add') // 'add' or 'edit'
const modalForm = reactive({
  id: null,
  title: '',
  description: '',
  startTime: '',
  endTime: '',
  location: '',
  isCompleted: false
})

// 打开添加弹窗
function openAddModal() {
  modalMode.value = 'add'
  modalForm.id = null
  modalForm.title = ''
  modalForm.description = ''
  // 默认填充为当前选中日期的08:00-09:00，避免时区问题
  const y = year.value
  const m = (month.value + 1).toString().padStart(2, '0')
  const d = selectedDay.value.toString().padStart(2, '0')
  modalForm.startTime = `${y}-${m}-${d}T08:00`
  modalForm.endTime = `${y}-${m}-${d}T09:00`
  modalForm.location = ''
  showModal.value = true
}

// 打开编辑弹窗
function openEditModal(event) {
  modalMode.value = 'edit'
  modalForm.id = event.id
  modalForm.title = event.title
  modalForm.description = event.description
  // 兼容后端返回为 Date/ISO/时间戳，适配 input[type="datetime-local"]
  modalForm.startTime = toInputDateTimeStr(event.startTime)
  modalForm.endTime = toInputDateTimeStr(event.endTime)
  modalForm.location = event.location
  modalForm.isCompleted = event.isCompleted
  showModal.value = true
}

// 关闭弹窗
function closeModal() {
  showModal.value = false
}

// 提交表单
async function handleSubmit() {
  try {
    if (modalMode.value === 'add') {
      const studentId = localStorage.getItem('studentId')
      await addSchedule({
        ...modalForm,
        userId: Number(studentId),
        startTime: toChinaDate(modalForm.startTime),
        endTime: toChinaDate(modalForm.endTime)
      })
    } else if (modalMode.value === 'edit') {
      await updateSchedule({
        ...modalForm,
        startTime: toChinaDate(modalForm.startTime),
        endTime: toChinaDate(modalForm.endTime)
      })
    }
    showModal.value = false
    await loadSchedule()
  } catch (e) {
    alert('操作失败')
  }
}

// 删除
async function handleDelete() {
  if (modalForm.id && confirm('确定要删除该日程吗？')) {
    try {
      await deleteSchedule(modalForm.id)
      showModal.value = false
      await loadSchedule()
    } catch (e) {
      alert('删除失败')
    }
  }
}

const showDiaryModal = ref(false)
const rightPanelDate = computed(() => {
  const y = year.value
  const m = (month.value + 1).toString().padStart(2, '0')
  const d = selectedDay.value ? selectedDay.value.toString().padStart(2, '0') : ''
  return y && m && d ? `${y}-${m}-${d}` : ''
})

// 打开日记弹窗
function openDiaryModal() {
  console.log("点了")
  showDiaryModal.value = true
}

defineExpose({
  loadSchedule,
  addSchedule,
  updateSchedule,
  deleteSchedule
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
  grid-template-columns: repeat(7,10fr);
  gap: 10px;
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
  min-height: 500px;
  max-height: 600px;
  background: linear-gradient(135deg, #f7faff 0%, #e0e7ff 100%);
  border-radius: 16px;
  box-shadow: 0 2px 16px #a5b4fc22;
  padding: 28px 22px 22px 22px;
  display: flex;
  flex-direction: column;
  animation: fadein 0.5s;
  overflow: hidden;
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
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.add-btn {
  background: linear-gradient(90deg, #74ABE2 0%, #5563DE 100%);
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 6px 18px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  margin-left: 10px;
  transition: background 0.2s, transform 0.15s;
}
.add-btn:hover {
  background: linear-gradient(90deg, #5563DE 0%, #74ABE2 100%);
  transform: scale(1.04);
}

/* 日程列表滚动与更明显样式 */
.event-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 18px;
  overflow-y: auto;
  max-height: 420px;
  scrollbar-width: thin;
  scrollbar-color: #74ABE2 #e0e7ff;
}
.event-list::-webkit-scrollbar {
  width: 8px;
}
.event-list::-webkit-scrollbar-thumb {
  background: #74ABE2;
  border-radius: 6px;
}
.event-list::-webkit-scrollbar-track {
  background: #e0e7ff;
  border-radius: 6px;
}

.event-item {
  background: linear-gradient(90deg, #fff 0%, #74ABE2 100%);
  border-left: 6px solid #ffffff;
  border-radius: 12px;
  padding: 16px 16px 12px 18px;
  box-shadow: 0 4px 16px #a5b4fc33;
  display: flex;
  flex-direction: column;
  gap: 6px;
  transition: box-shadow 0.2s, border-color 0.2s;
  cursor: pointer;
  position: relative;
}
.event-item:hover {
  box-shadow: 0 8px 32px #a5b4fc55;
  border-left-color: #74ABE2;
  background: linear-gradient(90deg, #ffffff 0%, #74ABE2 100%);
}
.event-title {
  font-size: 1.15rem;
  font-weight: 700;
  color: #5563DE;
  margin-bottom: 2px;
  letter-spacing: 0.5px;
}
.event-time {
  font-size: 1.02rem;
  color: #059669;
  font-weight: 600;
  margin-bottom: 2px;
}
.event-desc {
  font-size: 1.01rem;
  color: #333;
  opacity: 0.95;
  line-height: 1.5;
}
.event-location {
  font-size: 0.98rem;
  color: #b0b8e6;
  margin-top: 2px;
}
.no-events {
  text-align: center;
  color: #999;
  font-size: 1rem;
  padding: 40px 0;
  flex: 1;
}

/* 自定义弹窗样式 */
.custom-modal-mask {
  position: fixed;
  z-index: 9999;
  left: 0; top: 0; right: 0; bottom: 0;
  background: rgba(80,112,255,0.13);
  display: flex;
  align-items: center;
  justify-content: center;
}
.custom-modal-content {
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 8px 32px rgba(80, 112, 255, 0.18);
  padding: 38px 38px 22px 38px;
  min-width: 350px;
  max-width: 98vw;
  animation: fadein 0.3s;
  border: 2px solid #74ABE2;
  position: relative;
}
.custom-modal-content h3 {
  color: #5563DE;
  margin-bottom: 22px;
  font-size: 22px;
  text-align: center;
  letter-spacing: 1px;
}
.modal-field {
  margin-bottom: 16px;
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.modal-field label {
  font-size: 1rem;
  color: #5563DE;
  font-weight: 500;
}
.modal-field input,
.modal-field textarea {
  border: 1.5px solid #a5b4fc;
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 1rem;
  background: #f7faff;
  transition: border 0.2s;
}
.modal-field input:focus,
.modal-field textarea:focus {
  border-color: #74ABE2;
  outline: none;
}
.modal-actions {
  display: flex;
  gap: 14px;
  justify-content: flex-end;
  margin-top: 12px;
}
.modal-btn {
  background: #e0e7ff;
  color: #5563DE;
  border: none;
  border-radius: 8px;
  padding: 8px 22px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
}
.modal-btn.confirm {
  background: linear-gradient(90deg, #74ABE2 0%, #5563DE 100%);
  color: #fff;
}
.modal-btn.danger {
  background: linear-gradient(90deg, #ff5252 0%, #ffb3b3 100%);
  color: #fff;
}
.modal-btn:hover {
  filter: brightness(1.08);
}
.diary-fab {
  position: fixed;
  bottom: 30px;
  right: 34px;
  width: 382px;
  height: 100px;
  font-size: 40px;
  font-weight: bold;
  border-radius: 24px;
  background: linear-gradient(135deg, #6a85b6, #bac8e0);
  color: #ffffff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: all 0.2s ease-in-out;
  cursor: pointer;
}

.diary-fab:hover {
  background: linear-gradient(135deg, #4f71a3, #a2bce8);
  color: #0065b3;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.25);
}

/* ✅ 点击时：颜色变深 + 轻微缩放 + 下沉 */
.diary-fab:active {
  background: linear-gradient(135deg, #3b5c99, #8ba8d6);
  transform: scale(0.96) translateY(2px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.35);
  color: #004b91;
}
.event-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  padding-right: 40px; /* 给右侧按钮留空间 */
}

.right-btn {
  position: absolute;
  right: 10px;
  top: 10px;
  background-color: #f0f0f0;
  border: none;
  cursor: pointer;
  padding: 6px 10px;
  border-radius: 4px;
}

</style>


