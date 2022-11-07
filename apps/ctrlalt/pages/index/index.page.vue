<template>
    <n-form
        ref="formRef"
        inline
        :label-width="80"
        :model="formValue"
        :rules="rules"
    >

        <n-form-item label="手机号" path="phone">
            <n-input v-model:value="formValue.phone" placeholder="Phone Number"/>
        </n-form-item>
        <n-form-item label="验证码" path="verifyCode">
            <n-input v-model:value="formValue.verifyCode" placeholder="Phone Number"/>
        </n-form-item>
        <n-form-item>
            <n-button
                :loading="isSending"
                :disabled="isSending"
                @click="handleValidateClick"
            >
                发送验证码
            </n-button>
        </n-form-item>
    </n-form>


</template>

<script lang="ts">
import {defineComponent, reactive, ref, toRefs} from '../../node_modules/vue'
import {FormInst, FormItemRule, NMessageProvider, NForm, NFormItem, useMessage, NInput, NButton} from '../../node_modules/naive-ui'

export default defineComponent({
    components: {
        NMessageProvider,
        NForm,
        NFormItem,
        NInput,
        NButton,
    },
    setup() {
        const formRef = ref<FormInst | null>()
        const message = useMessage()
        const state = reactive({
            isVerifying: false,
            isSending: false,
        })
        return {
            ...toRefs(state),
            formRef,
            formValue: ref({
                user: {
                    name: 'name',
                    age: '15',
                    address: '0'
                },
                phone: '1251550092'
            }),
            rules: {
                user: {
                    name: {
                        required: true,
                        trigger: 'blur',
                        validator: (rule: FormItemRule, value: string) => {
                            return new Promise<void>((resolve, reject) => {
                                if (value !== 'testName') {
                                    reject(Error('非正确名字')) // reject with error message
                                } else {
                                    resolve()
                                }
                            })
                        }
                    },
                    age: {
                        required: true,
                        trigger: 'input',
                        validator: (rule: FormItemRule, value: number) => {
                            return new Promise<void>((resolve, reject) => {
                                setTimeout(() => {
                                    if (value <= 16) {
                                        reject(Error('非正确年龄'))
                                    } else {
                                        resolve()
                                    }
                                }, 3000)
                            })
                        }
                    }
                },
                phone: {
                    required: true,
                    trigger: ['input'],
                    validator: (rule: FormItemRule, value: string) => {
                        return /^[1]+[3,8]+\\d{9}$/.test(value)
                    }
                }
            },
            handleValidateClick(e: MouseEvent) {
                e.preventDefault()
                const messageReactive = message.loading('Verifying', {
                    duration: 0
                })
                state.isSending = true
                formRef.value?.validate((errors) => {
                    if (!errors) {
                        message.success('Valid')
                    } else {
                        message.error('Invalid')
                        console.log('errors', errors)
                    }
                    messageReactive.destroy()
                    state.isSending = false
                })
            }
        }
    }
})
</script>
