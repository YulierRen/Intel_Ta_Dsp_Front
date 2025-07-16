<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import axios from '../../utils/axios';

const props = defineProps<{ date: string }>()
const emit = defineEmits(['close'])

const userId = Number(localStorage.getItem('studentId'))

const diaryForm = ref({
  title: '',
  description: '',
  date: props.date
})
const diaryEditMode = ref(false)
const diaryMsg = ref('')
const todayDiary = ref(null)

// 加载指定日期的日记
async function loadDiary(dateStr: string) {
  try {
    const res = await axios.get('/userdaynote', {
      params: {
        userId,
        date: dateStr
      }
    })
    const diary = res[0];
    if (diary) {
      todayDiary.value = diary
      diaryForm.value = {
        title: diary.title || '',
        description: diary.description || '',
        date: diary.date
      }
      diaryEditMode.value = true
    } else {
      todayDiary.value = null
      diaryForm.value = {
        title: '',
        description: '',
        date: dateStr
      }
      diaryEditMode.value = false
    }
  } catch (err) {
    diaryMsg.value = '加载日记失败'
  }
}

// 提交（新增或修改）日记
async function handleDiarySubmit() {
  try {
    const payload = {
      userId,
      ...diaryForm.value
    }
    console.log(payload)
    if (diaryEditMode.value) {

      await axios.put('/userdaynote', payload)
      diaryMsg.value = '日记更新成功'
    } else {
      await axios.post('/userdaynote', payload)
      diaryMsg.value = '保存成功'
    }
    await loadDiary(diaryForm.value.date)
  } catch (err) {
    diaryMsg.value = '提交失败'
  }
}

// 删除日记
async function handleDiaryDelete() {
  try {
    await axios.delete('/userdaynote', {
      params: {
        userId,
        date: diaryForm.value.date
      }
    })
    diaryMsg.value = '已删除'
    diaryForm.value = {
      title: '',
      description: '',
      date: props.date
    }
    todayDiary.value = null
    diaryEditMode.value = false
  } catch (err) {
    diaryMsg.value = '删除失败'
  }
}

// 关闭弹窗
function closeModal() {
  emit('close')
  diaryMsg.value = ''
}

// 监听日期变化
watch(() => props.date, (newDate) => {
  if (newDate) loadDiary(newDate)
}, { immediate: true })

onMounted(() => {
  if (props.date) loadDiary(props.date)
})
</script>

<template>
  <div class="diary-modal-mask">
    <div class="diary-modal-content">
      <h3>📔 {{ diaryForm.date }} 日记</h3>
      <form class="diary-form" @submit.prevent="handleDiarySubmit">
        <div class="modal-field">
          <label>标题</label>
          <input v-model="diaryForm.title" maxlength="30" placeholder="日记标题（可为空）" />
        </div>
        <div class="modal-field">
          <label>内容</label>
          <textarea v-model="diaryForm.description" maxlength="300" placeholder="右下角有两个小黑杠，拖动一下试试"/>
        </div>
        <div class="modal-actions">
          <button class="modal-btn confirm" type="submit">
            {{ diaryEditMode ? '保存修改' : '保存日记' }}
          </button>
          <button type="button" class="modal-btn" @click="closeModal">关闭</button>
          <button
            v-if="diaryEditMode"
            class="modal-btn danger"
            type="button"
            @click="handleDiaryDelete"
          >删除</button>
        </div>
      </form>
      <div v-if="diaryMsg" class="diary-msg">{{ diaryMsg }}</div>
    </div>
  </div>
</template>

<style scoped>
.diary-modal-mask {
  position: fixed;
  z-index: 9999;
  left: 0; top: 0; right: 0; bottom: 0;
  background: rgba(80,112,255,0.13);
  display: flex;
  align-items: center;
  justify-content: center;
}
.diary-modal-content {
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 8px 32px rgba(80, 112, 255, 0.18);
  padding: 38px 38px 22px 38px;
  min-width: 400px;
  max-width: 128vw;
  animation: fadein 0.3s;
  border: 2px solid #74ABE2;
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.diary-modal-content h3 {
  color: #5563DE;
  margin-bottom: 28px;
  font-size: 20px;
  text-align: center;
  letter-spacing: 1px;
}
.diary-form {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.modal-field {
  margin-bottom: 10px;
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
  border: 2px solid #a5b4fc;
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
  margin-top: 8px;
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
.diary-msg {
  color: #059669;
  font-size: 1rem;
  margin-top: 6px;
  text-align: center;
}
</style>