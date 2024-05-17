import { Ref } from '@vue/reactivity';

//код взят отсюда: https://github.com/Cobertos/vue-input-contenteditable/blob/master/src/input-contenteditable.vue
export class MaxLengthHandler {
  private previousText = '';
  private readonly maxLength: number;
  private readonly htmlElementRef: Ref<HTMLElement | undefined>;

  constructor(htmlElementRef: Ref<HTMLElement | undefined>, maxLength: number) {
    this.htmlElementRef = htmlElementRef;
    this.maxLength = maxLength;
    this.previousText = htmlElementRef.value?.textContent || '';
  }

  shouldUpdateInput(text: string): boolean {
    //enforce a maxlength
    //I chose this instead of preventDefault on 'keydown', 'paste', 'drop' as if we preventDefault
    //we need to check a bunch of specific valid cases to pass through like backspace, delete
    //Ctrl+A, A Ctrl+V that makes the text shorter, arrow keys, etc. which may be impossible...
    //
    //Instead, retroactively trimming the string after 'input' and setting the cursor properly
    //(as changing the text string will change the cursor in some browsers... :( ) is a better bet
    //IMO. Current method was tested in Chrome, FF, and Android
    const selection = window.getSelection() as Selection;
    const { anchorNode, anchorOffset } = selection;
    if (text.length > this.maxLength) {
      //Find the cursor position inside the contenteditable. Can't use anchorOffset
      //because Firefox will add multiple text nodes when pasting sometimes
      //(and then collapse them later? it's kind of weird...)
      const textNodes = Array.from(this.htmlElementRef.value?.childNodes || []);
      const realAnchorOffset =
        textNodes.length <= 1
          ? anchorOffset
          : textNodes
              //Collect all nodes up to, but not including, anchorNode
              .slice(0, textNodes.indexOf(anchorNode as ChildNode))
              //Map them all to their length
              .map((n) => n.textContent?.length || 0)
              //Sum them together
              .reduce((acc, itm) => acc + itm, 0) +
            //And then add the final offset in the final node
            anchorOffset;
      //Use either the this.previousText if exists, or the current text but trimmed
      const newTextToSet = this.previousText || text.slice(0, this.maxLength);
      //Find the last position of the cursor before the input event. Use the
      //current cursor position, and remove the difference between the untrimmed text
      //and the trimmed text (to back the cursor up to the position the
      //input event happened at)
      //We can't use anchorOffset because FF likes to make new text nodes
      //for pasted text for some reason??
      let newOffsetToSet = realAnchorOffset - (text.length - newTextToSet.length);
      newOffsetToSet = Math.min(newOffsetToSet, this.maxLength); // Make sure not over maxlength
      //console.log(realAnchorOffset, anchorOffset, text.length, newTextToSet.length, this.$refs.contenteditable.childNodes.length);
      //This will reset the cursor to the start of the contenteditable _and_
      //make a new text node (so don't use anchorNode for selection.collapse())
      if (this.htmlElementRef.value) {
        this.htmlElementRef.value.textContent = newTextToSet;
        selection.collapse(this.htmlElementRef.value.childNodes[0], newOffsetToSet);
      }

      //Set selection using last valid offset
      this.previousText = newTextToSet;
      return false;
    } else {
      this.previousText = text;
    }

    return true;
  }
}
