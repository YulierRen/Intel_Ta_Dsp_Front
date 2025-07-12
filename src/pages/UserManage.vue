<template>
  <div class="p-6 max-w-5xl mx-auto">
    <h2 class="text-2xl font-bold mb-4">用户管理</h2>

    <!-- 添加用户表单 -->
    <div class="bg-white rounded-xl shadow p-4 mb-6">
      <h3 class="text-xl font-semibold mb-2">添加新用户</h3>
      <div class="grid grid-cols-4 gap-4">
        <input v-model="newUser.username" placeholder="用户名" class="border p-2 rounded" />
        <input v-model="newUser.password" placeholder="密码" class="border p-2 rounded" />
        <select v-model="newUser.role" class="border p-2 rounded">
          <option value="USER">USER</option>
          <option value="ADMIN">ADMIN</option>
        </select>
        <button @click="addUser" class="bg-blue-500 text-white px-4 py-2 rounded">添加</button>
      </div>
    </div>

    <!-- 用户列表 -->
    <table class="table-auto w-full bg-white rounded-xl shadow overflow-hidden">
      <thead class="bg-gray-100">
      <tr>
        <th class="p-3">ID</th>
        <th class="p-3">用户名</th>
        <th class="p-3">角色</th>
        <th class="p-3">操作</th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="user in users" :key="user.id" class="text-center border-t">
        <td class="p-2">{{ user.id }}</td>
        <td class="p-2">{{ user.username }}</td>
        <td class="p-2">{{ user.role }}</td>
        <td class="p-2 space-x-2">
          <button @click="deleteUser(user)" class="text-red-500 hover:underline">删除</button>
          <button @click="openEditDialog(user)" class="text-blue-500 hover:underline">修改</button>
        </td>
      </tr>
      </tbody>
    </table>

    <!-- 修改用户弹窗 -->
    <div v-if="editingUser" class="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center">
      <div class="bg-white rounded-xl p-6 w-96">
        <h3 class="text-lg font-semibold mb-4">修改用户信息</h3>
        <input v-model="editingUser.username" class="border p-2 mb-2 w-full rounded" placeholder="用户名" />
        <input v-model="editingUser.password" class="border p-2 mb-2 w-full rounded" placeholder="密码" />
        <select v-model="editingUser.role" class="border p-2 mb-4 w-full rounded">
          <option value="USER">USER</option>
          <option value="ADMIN">ADMIN</option>
        </select>
        <div class="flex justify-end space-x-2">
          <button @click="updateUser" class="bg-green-500 text-white px-4 py-2 rounded">保存</button>
          <button @click="editingUser = null" class="bg-gray-300 px-4 py-2 rounded">取消</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {onMounted, ref} from 'vue'
import axios from '@/utils/axios'

const users = ref([])
const newUser = ref({ username: '', password: '', role: 'USER' })
const editingUser = ref(null)

const loadUsers = async () => {
  users.value = await axios.post('/user/allUser')
  console.log(users.value)
}

const addUser = async () => {
  await axios.post('/user/add', newUser.value)
  await loadUsers()
  newUser.value = { username: '', password: '', role: 'USER' }
}

const deleteUser = async (user) => {
  await axios.delete('/user/delete', { data: user })
  await loadUsers()
}

const openEditDialog = (user) => {
  editingUser.value = { ...user }
}

const updateUser = async () => {
  await axios.put('/user/changeUsername', editingUser.value)
  await axios.put('/user/changePassword', editingUser.value)
  await axios.put('/user/changeRole', editingUser.value)
  editingUser.value = null
  await loadUsers()
}

onMounted(loadUsers)
</script>

<style scoped>
th, td {
  text-align: center;
}
</style>
