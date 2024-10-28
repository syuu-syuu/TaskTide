<template>
    <div class="task-item">
        <div class="task-item-lead">
            <input type="checkbox" v-model="completed" />
            <component class="task-title" :is="inputType" v-if="visible" v-model="editableTitle" @blur="discard()"
                @keydown.enter="submit()" ref="inputRef" id="taskTitle" />
            <div v-else class="task-title" @click="startEditing()">{{ props.task.title }}</div>
        </div>

        <div class="task-item-tail" @click="removeTask(props.task)">
            <SvgIcon :name="`icon-cancel`" class="delete-button" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { Task,  upsertTask, deleteTask } from '@/data'
import { ref, Ref, computed, watch, nextTick, onMounted } from 'vue'
import SvgIcon from '@components/SvgIcon.vue'

const emit = defineEmits(['updated', 'discarded'])

interface Props {
    task: Task
    isCreating: boolean
}

const props = withDefaults(defineProps<Props>(), {
    task: undefined,
    isCreating: false
})

const currentTask = ref(props.task)

const inputRef: Ref<HTMLInputElement | null> = ref(null);
const inputType = computed(() => (editableTitle.value.length > 50 || editableTitle.value.includes('\n')) ? 'b-form-textarea' : 'b-form-input')
const isEditing = ref(false)
const isCreating = ref(props.isCreating)
const visible = computed(() => isEditing.value || isCreating.value)

const editableTitle = ref(props.task.title)
const completed = ref(currentTask.value.completed)

onMounted(() => {
    if (isCreating.value) {
        startEditing();
    }
});

function startEditing() {
    editableTitle.value = props.task.title
    isEditing.value = true
    nextTick(() => {
        inputRef.value?.focus()
    })
}

watch(completed, async (newVal, oldVal) => {
    console.log(`Completed changed from ${oldVal} to ${newVal}`);
    await submit();
});

async function submit() {
    const newTask = {
        ...currentTask.value,
        completed: completed.value,
        title: editableTitle.value.trim() || '',
    }
    await upsertTask(newTask)
    isEditing.value = isCreating.value = false
    emit('updated')    
}

function discard() {
    isCreating.value = isEditing.value = false
    emit('discarded')
}

const removeTask = async (task: Task) => {
    if (task._id) {
        console.log("Deleting Task:", task._id)
        await deleteTask(task._id)
        emit('updated')
    } else {
        console.error("Attempted to remove a new task which hasn't got an ID yet.");
        emit('discarded')
    }
}

</script>

<style scoped lang="scss">
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
</style>