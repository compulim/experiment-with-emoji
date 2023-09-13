/*eslint require-unicode-regexp: "off" */

import { useCallback } from 'react';

const emojiSet = {
  ':)': '😊',
  ':-)': '😊',
  '(:': '😊',
  '(-:': '😊',
  ':-|': '😐',
  ':|': '😐',
  ':-(': '☹️',
  ':(': '☹️',
  ':-D': '😀',
  ':D': '😀',
  ':-p': '😛',
  ':p': '😛',
  ':-P': '😛',
  ':P': '😛',
  ':-o': '😲',
  ':o': '😲',
  ':O': '😲',
  ':-O': '😲',
  ':-0': '😲',
  ':0': '😲',
  ';-)': '😉',
  ';)': '😉',
  '<3': '❤️',
  '</3': '💔',
  '<\\3': '💔'
};

export default function useReplaceEmoticon() {
  return useCallback(
    // We need to know where (in offset) the change is, then we can decide which emoticon to update.
    // We need to distinguish in this case, string change from "abc:)xyz" to "abc:))xyz".
    // If the caret position is after the first parenthesis, we will change it to "abc😊)xyz".
    // But if the caret position is after the second parenthesis, we will not change it but leave it as "abc:))xyz".
    // This is because the user already decided to undo the emoji and just added a parenthesis after the emoticon. It should not affect the emoticon.
    ({ selectionEnd, selectionStart, value }: { selectionEnd: number; selectionStart: number; value: string }) => {
      if (typeof selectionEnd !== 'number') {
        console.warn(
          'botframework-webchat: The first argument passed to "useReplaceEmoticon" must contains "selectionEnd" of type number, indicating the caret position.'
        );
      } else if (typeof selectionStart !== 'number') {
        console.warn(
          'botframework-webchat: The first argument passed to "useReplaceEmoticon" must contains "selectionStart" of type number, indicating the caret position.'
        );
      } else if (typeof value !== 'string') {
        console.warn(
          'botframework-webchat: The first argument passed to "useReplaceEmoticon" must contains "value" of type string.'
        );
      }

      // We only change when the user is not selecting anything.
      selectionEnd === selectionStart &&
        Object.entries(emojiSet).every(([emoticon, emoji]) => {
          const { length } = emoticon;

          if (value.slice(selectionStart - length, selectionStart) === emoticon) {
            value = `${value.slice(0, selectionStart - length)}${emoji}${value.slice(selectionStart)}`;
            selectionEnd = selectionStart += emoji.length - length;

            return false;
          }

          return true;
        });

      return { selectionEnd, selectionStart, value };
    },
    [emojiSet]
  );
}
