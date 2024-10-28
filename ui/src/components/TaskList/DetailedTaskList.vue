<template>
    <div class="task-list">
        <div v-for="task in filteredTasks" :key="task._id || undefined">
            <DetailedTaskItem :task="task" @updated="handleUpdate" />
        </div>
        <DetailedTaskItem v-if="isCreating" :task="blankTask" :isCreating=true @discard-create="discardCreating()"
            @upsert-task="upsertTask()" />
        <!-- Create Task -->
        <div class="create-button" @click="createNewTask" v-if="!props.completed">
            <div class="button-content">
                <b-icon-plus />
                <div>
                    Create New Task
                </div>
            </div>
        </div>
    </div>
</template>
  
<script setup lang="ts">
import DetailedTaskItem from './DetailedTaskItem.vue'
import { Task, Project } from '@/data'
import { inject, ref, Ref, computed } from 'vue'
import { io } from "socket.io-client"
const socket = io({ transports: ["websocket"] })
const currentProject = inject<Ref<Project>>('currentProject')
const projectTasks = inject<Ref<Task[]>>('projectTasks')

interface Props {
    completed: boolean,
    tasks: Task[]
}

const props = withDefaults(defineProps<Props>(), {
    completed:false,
    tasks: ()=>[]
})

const filteredTasks = computed(() => {
    return projectTasks?.value?.filter(task => task.completed === props.completed) || [];
});

const emit = defineEmits(['updated'])

const blankTask = computed(() => ({
        title: '',
        description: '',
        completed: false,
        projectId: currentProject?.value?._id || '', 
    }))
const isCreating = ref(false)

function createNewTask() {
    isCreating.value = true
    console.log("Injected project id", currentProject?.value._id)
    console.log("Blank task", blankTask.value)
}

function discardCreating() {
    isCreating.value = false
}

function upsertTask(){
    console.log("Will be implemented via socket.io")
}

function handleUpdate() {
    emit('updated')
    isCreating.value = false
}

socket.on('submit-result', (success: boolean) => {
    if (success) {
        isCreating.value = false
        emit("updated")
        console.log("Task submitted successfully and inputs cleared.");
    } else {
        console.log('Failed to update the task.');
    }
});
</script>
  
  
<style scoped>
.task-list {
display: flex;
flex-direction: column;
gap: 0.5em;
}

.create-button {
border-radius: 0.25em;
width: 100%;
padding: 0.5em 0.8em;
display: flex;
flex-direction: row;
justify-content: center;
align-items: center;
cursor: pointer;
}

.button-content {
display: flex;
flex-direction: row;
gap: 0.5em;
}

.button-content svg {
height: 1.5em;
width: 1.5em;
}
</style>
  