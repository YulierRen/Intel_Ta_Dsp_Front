<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from '../utils/axios'

const route = useRoute()
const router = useRouter()
const id = route.params.id as string

// 表单数据
const form = ref({
  id: '',
  title: '',
  content: '',
  isPublic: false
})

// 获取日记详情
const fetchDiary = async () => {
  try {
    const res = await axios.get('/userDiary/findById', {
      params: { id }
    })
    form.value = res
  } catch (err) {
    console.error('加载失败', err)
  }
}

// 提交更新
const updateDiary = async () => {
  try {
    await axios.put('/userDiary/update', form.value)
    alert('更新成功')
    router.push('/homepage') // 返回日记列表页，可根据你的路由改
  } catch (err) {
    alert('更新失败')
    console.error(err)
  }
}

// 删除日记
const deleteDiary = async () => {
  if (!confirm('确认删除这条日记吗？')) return
  try {
    await axios.post('/userDiary/delete', null, {
      params: { id: form.value.id }
    })
    alert('删除成功')
    router.push('/homepage')
  } catch (err) {
    alert('删除失败')
  }
}

onMounted(fetchDiary)
</script>

<template>
  <div class="diary-editor">
    <h2>编辑日记</h2>
    <label>
      标题：
      <input v-model="form.title" />
    </label>

    <label>
      内容：
      <textarea v-model="form.content" rows="6"></textarea>
    </label>

    <label>
      是否公开：
      <input type="checkbox" v-model="form.isPublic" />
    </label>

    <div class="btns">
      <button @click="updateDiary">保存修改</button>
      <button @click="deleteDiary" style="color: red">删除日记</button>
    </div>
  </div>
</template>

<style scoped>
.diary-editor {
  max-width: 600px;
  margin: 40px auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.diary-editor label {
  display: flex;
  flex-direction: column;
  font-weight: bold;
}
.btns {
  display: flex;
  gap: 20px;
}
</style>
