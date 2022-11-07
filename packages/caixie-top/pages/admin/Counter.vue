<template>
    <button type="button" @click="state.count++">Counter {{ state.count }}</button>
</template>

<script lang="ts" setup>
import { reactive } from '../../node_modules/vue'
const state = reactive({ count: 0 })
</script>
Footer
