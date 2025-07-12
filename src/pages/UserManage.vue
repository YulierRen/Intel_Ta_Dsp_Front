<template>
  <div class="p-6 max-w-5xl mx-auto">
    <el-card class="mb-6">
      <template #header>添加新用户</template>
      <el-form :inline="true" :model="newUser" class="flex flex-wrap items-center gap-4">
        <el-form-item label="用户名">
          <el-input v-model="newUser.username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="密码">
          <el-input v-model="newUser.password" type="password" placeholder="请输入密码" />
        </el-form-item>
        <el-form-item label="角色">
          <el-select v-model="newUser.role" placeholder="选择角色" style="width: 120px">
            <el-option label="USER" value="USER" />
            <el-option label="ADMIN" value="ADMIN" />
          </el-select>
        </el-form-item>
        <el-button type="primary" @click="addUser">添加</el-button>
      </el-form>
    </el-card>

    <el-card>
      <template #header>用户列表</template>
      <el-table :data="users" style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="username" label="用户名" />
        <el-table-column prop="role" label="角色" />
        <el-table-column label="操作" width="180">
          <template #default="scope">
            <el-button type="danger" size="small" @click="deleteUser(scope.row)">删除</el-button>
            <el-button type="primary" size="small" @click="openEditDialog(scope.row)">修改</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 修改用户弹窗 -->
    <el-dialog v-model="editDialogVisible" title="修改用户信息" width="400px">
      <el-form :model="editingUser" label-width="80px">
        <el-form-item label="用户名">
          <el-input v-model="editingUser.username" />
        </el-form-item>
        <el-form-item label="密码">
          <el-input v-model="editingUser.password" type="password" />
        </el-form-item>
        <el-form-item label="角色">
          <el-select v-model="editingUser.role" placeholder="选择角色">
            <el-option label="USER" value="USER" />
            <el-option label="ADMIN" value="ADMIN" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="updateUser">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from '@/utils/axios'
import { ElMessage } from 'element-plus'

const users = ref([])
const newUser = ref({ username: '', password: '', role: 'USER' })
const editingUser = ref({})
const editDialogVisible = ref(false)

const loadUsers = async () => {
  users.value = await axios.post('/user/allUser')
}

const addUser = async () => {
  await axios.post('/user/add', newUser.value)
  ElMessage.success('添加成功')
  newUser.value = { username: '', password: '', role: 'USER' }
  await loadUsers()
}

const deleteUser = async (user) => {
  await axios.delete('/user/delete', { data: user })
  ElMessage.success('删除成功')
  await loadUsers()
}

const openEditDialog = (user) => {
  editingUser.value = { ...user }
  editDialogVisible.value = true
}

const updateUser = async () => {
  await axios.put('/user/changeUsername', editingUser.value)
  await axios.put('/user/changePassword', editingUser.value)
  await axios.put('/user/changeRole', editingUser.value)
  ElMessage.success('修改成功')
  editDialogVisible.value = false
  await loadUsers()
}

onMounted(loadUsers)
</script>

<style scoped>
.el-form-item {
  margin-bottom: 16px;
}
</style>
