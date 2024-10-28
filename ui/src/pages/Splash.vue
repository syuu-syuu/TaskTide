<template>
    <div class="splash-container">
        <div v-show="!isMobile">
            <SvgIcon :name="`icon-effortless`" class="big-fig" />
        </div>
        <div class="content-container">
            <div class="title-1">Task Tide</div>
            <div class="title-2">Sync · Focus · Achieve</div>
            <div class="title-3"> Streamline teamwork and solo efforts to peak efficiency with our task organizer</div>
            <div class="login-container">
                <b-button @click="login()" block pill>
                    <i class="iconfont icon-gitlab"></i>
                    <span>Continue with Gitlab</span>
                </b-button>
            </div>
            <div class="fig-group">
                <div class="small-fig">
                    <SvgIcon :name="`icon-check`" />
                    <div class="note">STRUCTURED</div>
                </div>
                <div class="small-fig">
                    <SvgIcon :name="`icon-high-five`" />
                    <div class="note">COLLABORATIVE</div>
                </div>
                <div class="small-fig">
                    <SvgIcon :name="`icon-target`" />
                    <div class="note">EFFICIENT</div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import SvgIcon from '@/components/SvgIcon.vue'
import { ref, computed, onMounted, onUnmounted } from "vue"

const screenWidth = ref(window.innerWidth);
const onResize = () => {
    screenWidth.value = window.innerWidth;
};
const isMobile = computed(() => screenWidth.value <= 1000);

async function login() {
    window.location.href = '/api/login';
}

onMounted(() => {
    window.addEventListener("resize", onResize);
});

onUnmounted(() => {
    window.removeEventListener("resize", onResize);
});
</script>

<style scoped lang="scss">

.splash-container {
    @include flex-row-center;
    justify-content: center;
    align-content: center;
    padding: 8em;
    gap: 4em;

    .big-fig {
        width: 40em;
        height: 40em;
    }
    
    .content-container {
        display: flex;
        flex-direction: column;
        gap: 0.2em;
        max-width: 40em;
        margin-right: 8em;

        .title-1 {
            font-size: 5em;
        }

        .title-2 {
            font-size: 1.4em;
            padding-left: 0.5em;
            color: #656ed3;
        }

        .title-3 {
            font-size: 1em;
            padding-left: 0.7em;
        }

        .login-container {
            padding: 4em 0;

            .btn-secondary {
                @include flex-row-center;
                justify-content: center;
                gap: 1em;
                margin: 1em 0;
                height: 3.5em;
                border: solid 0.1em #656ed3;
                color: #656ed3;
            }

            .btn-secondary:hover {
                color: white;
            }
        }


        .fig-group {
            @include flex-row-center;
            justify-content: space-between;
            padding: 0 8em 0 1em;
            gap: 5em;

            .small-fig {
                width: 5em;
                height: 5em;
                font-size: 0.8em;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                gap: 0.2em;
            }

        }

    }
}



</style>
