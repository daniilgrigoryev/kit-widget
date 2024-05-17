<template lang="pug">
.kit-widget-auth
  .kit-widget-auth__header
    .kit-widget-auth__title {{t('auth_title')}}
    .kit-widget-auth__subtitle {{t('auth_subtitle')}}
  form.kit-widget-auth__body(@submit="setClientInfo")
    KitWidgetInput(
      :label="t('name')"
      v-model="name"
      :validator="nameValidator"
      :maxLength="100"
      ref="firstInput"
    )
    KitWidgetInput(
      :label="t('email')"
      v-model="email"
      :validator="emailValidator"
      type="email"
    )
    button.kit-widget-button.kit-widget-auth__start(
      :disabled="!isFormValid"
      :style="{backgroundColor: btnColors.mainColor, color: btnColors.secondaryBtnColor}"
      @click="setClientInfo"
    ) {{t('auth_btn')}}
    p.kit-widget-auth__policy(:style="{color: btnColors.mainColor}")
      span {{t('policy')}}
      span.policy-link(v-html="t('policy_link')")
</template>

<script lang="ts">
  import { computed, defineComponent, onMounted, ref } from 'vue';
  import KitWidgetInput from '@/components/UI/KitWidgetInput.vue';
  import { useI18n } from 'vue-i18n';
  import { InputValidator } from '@/types/UI';
  import { isValidEmail } from '@/utils/validators';
  import useFocus from '@/composables/ui/useFocus';
  import useBtnColors from '@/composables/widget_settings/useBtnColors';
  import { useStore } from '@/composables/useStore';
  import { RootMutationsTypes } from '@/store/modules/root/mutations';
  import { ChatSettings } from '@/types/KitWidgetTypes';

  export default defineComponent({
    name: 'KitWidgetAuth',
    components: { KitWidgetInput },
    setup() {
      const { t } = useI18n();
      const { commit, state } = useStore();
      const btnColors = useBtnColors();
      const name = ref('');
      const email = ref('');

      const { elementRef: firstInput, focus } = useFocus<InstanceType<typeof KitWidgetInput>>();

      const nameValidator: InputValidator[] = [
        { error: t('empty_field'), validate: (name) => name.length > 0 },
        {
          error: t('max_length'),
          validate: (input) => input.length <= 100,
        },
      ];

      const emailValidator: InputValidator[] = [
        { error: t('empty_field'), validate: (name) => name.length > 0 },
        {
          error: t('invalid_email'),
          validate: isValidEmail,
        },
      ];

      const isFormValid = computed<boolean>(() => {
        const isNameValid = nameValidator.every(({ validate }) => validate(name.value));
        const isEmailValid = emailValidator.every(({ validate }) => validate(email.value));

        return isNameValid && isEmailValid;
      });

      const setClientInfo = (): void => {
        const chatSettings = state.chatSettings as ChatSettings;
        commit(RootMutationsTypes.SET_CHAT_SETTINGS, {
          ...chatSettings,
          client_data: {
            client_id: chatSettings.client_data.client_id,
            client_display_name: name.value,
            client_email: email.value,
            client_avatar: '',
            client_phone: '',
          },
        });
      };

      onMounted(focus);

      return {
        firstInput,
        t,
        name,
        email,
        nameValidator,
        emailValidator,
        isFormValid,
        btnColors,
        setClientInfo,
      };
    },
  });
</script>

<style lang="postcss">
  .kit-widget-auth {
    display: flex;
    flex: 1;
    flex-direction: column;
    padding: 24px;
    background-color: var(--white-base);

    &__header {
      margin: 0 auto 24px;
    }

    &__title {
      margin-bottom: 4px;
      font-size: 16px;
      font-weight: 500;
      line-height: 24px;
      text-align: center;
      letter-spacing: 0.44px;
    }

    &__subtitle {
      font-size: 14px;
      line-height: 20px;
      text-align: center;
      letter-spacing: 0.25px;
    }

    &__body > * + * {
      margin-top: 16px;
    }

    &__start {
      width: 100%;
    }

    &__policy {
      font-size: 12px;
      line-height: 16px;
      text-align: center;
      letter-spacing: 0.4px;

      span {
        color: var(--secondary-default);
      }

      .policy-link {
        color: inherit;
      }

      a {
        &,
        &:hover,
        &:visited {
          color: inherit;
          text-decoration: none;
        }
      }
    }
  }

  .kit-widget-button {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 46px;
    background-color: var(--primary-default);
    color: var(--white-base);
    font-family: var(--font-primary);
    font-size: 14px;
    font-weight: 500;
    line-height: 22px;
    letter-spacing: 0.1px;
    border-radius: 8px;
    transition: var(--transition-02s-linear);

    &:hover {
      background-color: var(--primary-active);
    }

    &:disabled {
      background-color: var(--gray-40) !important;
      cursor: default;
      pointer-events: none;
    }
  }
</style>
