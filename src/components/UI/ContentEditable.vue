<template lang="pug">
editor-content(
  :editor='editor'
  v-bind="$attrs"
  :placeholder="placeholder"
)
</template>

<script lang="ts">
  import { defineComponent, PropType, watch } from 'vue';
  import { EditorContent, useEditor } from '@tiptap/vue-3';
  import StarterKit from '@tiptap/starter-kit';
  import Placeholder from '@tiptap/extension-placeholder';
  import HardBreak from '@tiptap/extension-hard-break';
  import createMaxSizeExtension from '@/utils/MaxSizeExtension';
  import { currentDevice } from '@/init/mobile_version_handlers';

  export default defineComponent({
    inheritAttrs: false,
    name: 'ContentEditable',
    props: {
      modelValue: {
        type: String as PropType<string>,
        required: true,
      },
      placeholder: {
        type: String as PropType<string>,
        required: false,
      },
      maxLength: {
        type: Number as PropType<number>,
        required: false,
        default: 4000,
      },
    },
    emits: {
      'update:modelValue': (args: string) => !!args,
    },
    components: {
      EditorContent,
    },
    setup(props, context) {
      const editor = useEditor({
        extensions: [
          StarterKit,
          HardBreak.extend({
            keepMarks: false,
            addKeyboardShortcuts() {
              return {
                'Shift-Enter': () => this.editor.commands.setHardBreak(),
                Enter: ({ editor }) => {
                  if (currentDevice !== 'desktop') {
                    return editor.commands.setHardBreak();
                  }
                  return false;
                },
              };
            },
          }),
          Placeholder.configure({
            placeholder: props.placeholder,
          }),
          createMaxSizeExtension({ maxSize: props.maxLength }),
        ],
        content: props.modelValue,
        autofocus: false,
        editable: true,
        enableInputRules: true,
        enablePasteRules: true,
        editorProps: {
          attributes: {
            class: 'editable',
            id: 'editable',
          },
        },
        onUpdate: ({ editor }) => {
          const value = editor.getText().trim();
          context.emit('update:modelValue', value);
        },
      });
      watch(
        () => props.modelValue,
        (value) => {
          if (!value.length) editor.value.commands.clearContent(true);
        }
      );
      return {
        editor,
      };
    },
  });
</script>

<style lang="postcss">
  .editable[contenteditable]:empty:before {
    content: attr(placeholder);
    display: block; /* For Firefox */
    color: var(--gray-40);
    font-size: 14px;
    line-height: 20px;
    letter-spacing: 0.25px;
    pointer-events: none;
  }

  .editable {
    width: 100%;
    color: var(--gray-90);
    font-size: 14px;
    line-height: 20px;
    letter-spacing: 0.25px;
    resize: none;
  }

  .editable[contenteditable] p.is-editor-empty:first-child::before {
    content: attr(data-placeholder);
    height: 0;
    float: left;
    color: #adb5bd;
    pointer-events: none;
  }
</style>
