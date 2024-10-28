<template>
  <b-modal v-model="$props.visible" @show="onshow" @hidden="onhidden">
    <b-list-group>
      <b-list-group-item v-for="user in users" :key="user.id" @click="selectUser(user)" class="user-item" :class="{ checked: itemChecked(user) }">
        {{user.username}}({{ user.name }})
      </b-list-group-item>
    </b-list-group>
    <b-pagination
        :value="page"
        :total-rows="total"
        :per-page="perPage"
        @change="handlePageChange"
        class="mt-4"
    ></b-pagination>
    <b-button @click="saveMembers">ADD ALL MEMBERS SELECTED</b-button>
  </b-modal>
</template>

<script setup lang="ts">
import {onMounted, ref} from "vue"
import {Project} from "@/data";

type GitlabUser = {
  id: number;
  username: string;
  name: string;
}

export interface Props {
  visible: boolean;
  project: Project;
}

const props = defineProps<Props>()
const emit = defineEmits(['show', 'hide'])
const users = ref<GitlabUser[]>([])
const selectedMembers = ref<GitlabUser[]>([])
const page = ref(1)
const perPage = ref(10)
const total = ref(0)

onMounted(() => {
  getAllUser()
})

async function getAllUser(pageNum: number = page.value, pageSize: number = perPage.value) {
  const data: {
    total: number,
    data: GitlabUser[]
  } = await fetch(`/api/user/users?pageNum=${pageNum}&pageSize=${pageSize}`)
      .then(res => res.json())
  users.value = data.data
  total.value = data.total
}

async function saveMembers() {
  const currentSelected = selectedMembers.value
  const path = '/api/projects/members'
  const data = await fetch(path, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      projectId: props.project._id,
      members:  currentSelected
    })
  }).then(res => res.json())
  if (data.success) {
    // show a massage
    emit('hide')
  }
}

async function handlePageChange(val: number) {
  await getAllUser(val)
  page.value = val
}

function selectUser(user: GitlabUser) {
  const members = selectedMembers.value
  const index = members.findIndex(e => e.id === user.id)
  if (index > -1) {
    members.splice(index, 1)
  } else {
    members.push(user)
  }
}

function itemChecked(user: GitlabUser) {
  const members = selectedMembers.value
  const index = members.findIndex(e => e.id === user.id)
  return index > -1
}

function onshow() {

}

function onhidden() {
  emit('hide')
}

</script>

<style scoped lang="scss">
.user-item {
  &.checked {
    background-color: #656ed37b;
  }
}
</style>