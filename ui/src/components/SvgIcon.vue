<template>
    <component :is="dynamicComponent" />
</template>

<script lang="ts" setup>
import { defineAsyncComponent, ref } from 'vue';

// Props definition
interface Props {
    name: string
}

// default values for props
const props = withDefaults(defineProps<Props>(), {
    name: ''
})

const name = ref(props.name);

const dynamicComponent = defineAsyncComponent(() =>
    import(`@/static/icons/${name.value}.svg`)
)
</script>
