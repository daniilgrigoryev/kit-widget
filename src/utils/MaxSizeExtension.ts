import { Extension } from '@tiptap/vue-3';
import { Plugin, PluginKey, TextSelection } from 'prosemirror-state';

const createMaxSizeExtension = (options: { maxSize: number }): Extension => {
  return Extension.create({
    name: 'maxSize',
    addOptions() {
      return {
        maxSize: null,
      };
    },
    addProseMirrorPlugins: () => [
      new Plugin({
        key: new PluginKey('maxSize'),
        appendTransaction: (transaction, oldState, newState) => {
          let max = options.maxSize;
          max = max + 2;
          const oldDocSize = oldState.doc.content.size;
          const newDocSize = newState.doc.content.size;

          const newResPos = newState.selection.$head;

          if (newDocSize > oldDocSize && newDocSize > max) {
            const overPaste = newDocSize - max;
            const newTextSelection = TextSelection.create(
              newState.doc,
              newResPos.pos - overPaste > 0 ? newResPos.pos - overPaste : 0,
              newResPos.pos
            );

            const newTr = newState.tr;
            newTr.setSelection(newTextSelection);
            newTr.deleteSelection();
            return newTr;
          }
        },
      }),
    ],
  });
};
export default createMaxSizeExtension;
