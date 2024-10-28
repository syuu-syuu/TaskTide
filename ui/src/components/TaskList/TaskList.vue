<template>
  <div class="task-list">
    <!-- Incompleted Tasks -->
    <div v-for="task in incompletedTasks" :key="task._id">
      <TaskItem :task="task" @updated="handleUpdate()" @discarded="handleDiscard()" />
    </div>

    <!-- Completed Tasks -->
    <div v-for="task in completedTasks" :key="task._id" class="completed-tasks">
      <TaskItem :task="task" @updated="handleUpdate()" @discarded="handleDiscard()" />
    </div>

    <!-- New Task -->
    <TaskItem v-if="isCreating" :task="blankTask" :isCreating="true" @updated="handleUpdate()"
      @discarded="handleDiscard()"/>

    <!-- Create Button -->
    <div class="create-button" id="createQuickTaskButton" @click="createNewTask">
      <b-icon-plus />
      <div>Create New Task</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import TaskItem from './TaskItem.vue'
import { Project, Task } from '@/data'
import { ref, inject, Ref, computed } from 'vue'

const emit = defineEmits(['updated'])

const currentProject = inject<Ref<Project>>('currentProject')
const projectTasks = inject<Ref<Task[]>>('projectTasks')
const completedTasks = computed(() => {
  return projectTasks?.value?.filter(task => task.completed === true) || [];
});
const incompletedTasks = computed(() => {
  return projectTasks?.value?.filter(task => task.completed === false) || [];
});

const blankTask = computed(() => ({
  title: '',
  description: '',
  completed: false,
  projectId: currentProject?.value?._id || '',
}))
const isCreating = ref(false)

function createNewTask() {
  isCreating.value = true
  console.log("📍 Currently creating new task", blankTask.value, "for project whose id is", currentProject?.value._id)
}
 
function handleDiscard() {
  isCreating.value = false
  console.log("📍Current updating process is discarded")
}

function handleUpdate() {
  emit('updated')
  isCreating.value = false
}
</script>

<style scoped lang="scss">
.task-list {
  display: flex;
  flex-direction: column;
  gap: 0.5em;

  .completed-tasks {
    color: #787878;
    text-decoration: line-through;
  }

  .create-button {
    @include base-item;
    justify-content: center;
    gap: 0.5em;

    svg {
      height: 1.5em;
      width: 1.5em;
    }    
  }
}
</style>
