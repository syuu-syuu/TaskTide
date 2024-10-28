<template>
    <div class="task-item" v-if="!isCreating">
        <div class="task-item-lead">
            <input type="checkbox" :disabled="!canEdit" v-model="completed" />
            <div class="task-title" @click="startEditing()">{{ props.task.title }}</div>
        </div>
        <div class="task-item-tail" v-show="canEdit" @click="removeTask(props.task)">
            <SvgIcon class="delete-button" :name="`icon-cancel`" />
        </div>
    </div>

    <!--Concurrency-->
    <b-collapse class="task-details" v-model="visible">
        <b-card class="task-detail-card">
            <b-alert :show="!canEdit"> 🔏 Task is currently being edited by: {{ concurrentUser }}</b-alert>
            <component class="task-title" :is="inputType" v-if="visible" :disabled="!canEdit" v-model="editableTitle"
                ref="inputRef" id="detailedTaskTitle" />
            <div class="shared-fields" v-if="currentProject?.type === 'Shared'">
                <div class="assignee">
                    <SvgIcon :name="`icon-person`" />
                    <b-dropdown :text="currentAssignee || 'Unassigned'" :disabled="!canEdit">
                        <div v-for="assignee in currentProject?.members">
                            <b-dropdown-item @click="selectAssignee(assignee.name)">{{ assignee.name
                                }}</b-dropdown-item>
                        </div>
                    </b-dropdown>
                </div>
                <div class="status" :class="getStatusClass(currentTask?.status || 'todo')">
                    <SvgIcon :name='`icon-tag`' />
                    <b-dropdown :text="currentStatus?.toUpperCase()" :disabled="!canEdit" class="dropdown-text">
                        <div v-for="status in statuses">
                            <b-dropdown-item @click="selectStatus(status)">{{ status.toUpperCase() }}</b-dropdown-item>
                        </div>
                    </b-dropdown>
                </div>
                <div class="deadline">
                    <b-form-datepicker v-model="currentTask.deadline" :disabled="!canEdit" />
                </div>
            </div>
            <b-form-textarea v-if="currentProject?.type!=='Quick'" v-model="editableDescription" :disabled="!canEdit"
                rows="8" placeholder="Enter task description..."></b-form-textarea>
            <div class="buttons">
                <b-button class="submit-button" :disabled="!canEdit" @click="submit()">Submit</b-button>
                <b-button class="cancel-button" @click="discard()">Discard</b-button>
            </div>
        </b-card>
    </b-collapse>
</template>

<script setup lang="ts">
import { io } from "socket.io-client"
import { Task, Project, statuses, TaskStatus, getUserInfo } from '@/data'
import { ref, Ref, watch, computed, nextTick, inject } from 'vue'
import SvgIcon from '@components/SvgIcon.vue'

const socket = io({ transports: ["websocket"] })
const emit = defineEmits(['updated', 'discard-create'])

interface Props {
    task: Task
    isCreating?: boolean
}

const props = withDefaults(defineProps<Props>(), {
    task: undefined,
    isCreating: false
})

const currentProject = inject<Ref<Project>>('currentProject')
const currentTask = computed(() => (props.task))

const inputType = computed(() => (editableTitle.value.length > 50 || editableTitle.value.includes('\n')) ? 'b-form-textarea' : 'b-form-input')
const inputRef: Ref<HTMLInputElement | null> = ref(null)
const isEditing = ref(false)
const isCreating = ref(props.isCreating)
const visible = computed(() => isEditing.value || isCreating.value)

// Use socket.io to determine eligibility of editing
const canEdit = ref(true)
const concurrentUser = ref('')

const editableTitle = ref(props.task.title)
const editableDescription = ref(props.task.description)
const currentAssignee = ref(props.task.assignee)
const currentStatus = ref(props.task.status)
const completed = ref(currentTask.value.completed)
watch(completed, (newVal, oldVal) => {
    console.log(`Completed changed from ${oldVal} to ${newVal}`);
    submit();
});

function discard() {
    console.log("Is the user creating a new task?", props.isCreating)
    if (props.isCreating) {
        editableTitle.value = ''
        editableDescription.value = ''
        isCreating.value = false
        emit('discard-create')
    } else {
        editableTitle.value = props.task.title
        editableDescription.value = props.task.description
    }
    isEditing.value = false
    console.log(`creating.value is ${visible.value}`)
}

async function submit() {
    if (editableTitle.value) {
        const result = synchronizeStatusAndCompleted(completed.value, currentTask.value.status || 'todo');
        // const status = completed.value ? 'done' : currentTask.value.status;
        const newTask = {
            ...currentTask.value,
            completed: result.newCompleted,
            title: editableTitle.value.trim() || ' ',
            description: editableDescription.value?.trim() || '',
            status: result.newStatus
        }
        socket.emit('submit-task', newTask);
        isEditing.value = isCreating.value = false
        emit('updated')
    } else {
        alert("Task title can't be empty!")
    }

}


function selectAssignee(assignee: string) {
    currentAssignee.value = assignee
    currentTask.value.assignee = assignee
}

function selectStatus(status: TaskStatus) {
    currentStatus.value = status
    currentTask.value.status = status
}

function getStatusClass(status: TaskStatus) {
    switch (status) {
        case "todo":
            return "status-todo";
        case "in progress":
            return "status-ongoing";
        case "done":
            return "status-completed";
    }
}

function startEditing() {
    editableTitle.value = props.task.title
    editableDescription.value = props.task.description
    isEditing.value = true
    nextTick(() => {
        inputRef.value?.focus()
    })
}


watch(visible, (newVisible, oldVisible) => {
    console.log("Injected project type:", currentProject?.value.type)
    if (newVisible && !oldVisible) {
        socket.emit('request-edit', props.task, currentProject?.value.type)
    }
}, { immediate: true })


function synchronizeStatusAndCompleted(completed: boolean, status: TaskStatus) {
    if (completed) {
        return { newCompleted: true, newStatus: 'done' };
    } else if (status === 'done') {
        return { newCompleted: true, newStatus: 'done' };
    } else {
        return { newCompleted: false, newStatus: status || 'todo' };
    }
}


socket.on('lock-task', async (taskId, userId) => {
    const currentUser = await getUserInfo()
    if (currentTask.value._id === taskId && currentUser._id !== userId){
        canEdit.value = false
        concurrentUser.value = userId
    } 
})

socket.on('grant-edit', (taskId, userId) => {
    canEdit.value = true
    nextTick(() => {
            inputRef.value?.focus()
        })
    console.log("User", userId, "is granted to edit task", taskId)
    }
)

socket.on('submit-result', (success: boolean) => {
    if (success) {
        isEditing.value && (isEditing.value = !isEditing.value)
        isCreating.value && (isCreating.value = !isCreating.value)
        emit("updated")
        console.log("Task submitted successfully and inputs cleared.");

    } else {
        console.log('Failed to update the task.');
    }
    canEdit.value = true
});

const removeTask = (task: Task) => {
    if (task._id) {
        socket.emit('remove-task', task._id)
    } else {
        console.error("Attempted to remove a task without a valid ID.");
    }
}

</script>

<style scoped lang="scss">
.task-detail-card {
    border: none;

    .task-item {
        @include base-item;
        justify-content: space-between;

        &-lead {
            @include flex-row-center;
            flex-grow: 1;
            margin-right: 1em;

            .task-title {
                word-break: break-word;
                white-space: pre-line;
                overflow-wrap: break-word;
                margin-left: 1em;
                margin-right: 1em;
            }
        }

        &-tail {
            svg {
                width: 1.5em;
                height: 1.5em;
            }

            .delete-button {
                cursor: pointer;
            }
        }
    }

    .task-title {
       margin-top: 1em;
       margin-bottom: 1em;
    }

    .alert-info {
        padding: 0.2em 0.8em;
        margin: 0.6em 0;
        border-radius: 1em;
    }
    .shared-fields {
        @include flex-row-center;
        padding: 0.2em 0.1em;
        gap: 1.2em;

        @media (max-width: 800px) {
            flex-direction: column;
            align-items: start;
            gap: 0.1em;
        }

        .assignee,
        .status {
            @include flex-row-center;
            gap: 0.5em;

            svg {
                width: 1.4em;
                height: 1.4em;
                margin-left: 0.75rem;
            }
        }

        .status {
            &-todo {
                fill: #989898;
                :deep(.btn-secondary:not(:active):not(:hover)){
                    color: #989898;}
            }

            &-ongoing {
                fill: #FCB25C;
                :deep(.btn-secondary:not(:active):not(:hover)) {
                    color: #FCB25C;}
            }

            &-completed {
                fill: #03AE85;
                :deep(.btn-secondary:not(:active):not(:hover)) {
                    color: #03AE85;}
            }
        }
    }

    .buttons {
        @include flex-row-center;
        padding: 0.5em 0em;
        justify-content: end;
    }

    .b-form-btn-label-control.form-control {
        border: none;
    }

    .b-form-btn-label-control :deep(.text-muted) {
        padding-left: 0.8em;
    }
}
</style>
