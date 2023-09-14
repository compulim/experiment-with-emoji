import { useRefFrom } from 'use-ref-from';
import React, {
  type ChangeEvent,
  type ComponentType,
  type FocusEvent,
  type KeyboardEvent,
  type SyntheticEvent,
  type Ref,
  useCallback,
  useEffect,
  useRef
} from 'react';

import defaultEmojiSet from './defaultEmojiSet';
import SelectionAndValue from './private/SelectionAndValue';

type SupportedHTMLElement = HTMLInputElement | HTMLTextAreaElement;

export type InputTargetProps<H> = {
  onChange?: (event: ChangeEvent<H>) => void;
  onFocus?: (event: FocusEvent<H>) => void;
  onKeyDown?: (event: KeyboardEvent<H>) => void;
  onSelect?: (event: SyntheticEvent<H>) => void;
  ref: Ref<H | null>;
  value?: string;
};

type WithEmojiProps<H> = {
  componentType: ComponentType<InputTargetProps<H>>;
  emojiSet?: Map<string, string>;
  onChange?: (value: string) => void;
  value?: string;
};

function WithEmojiController<H extends SupportedHTMLElement>({
  componentType,
  emojiSet = defaultEmojiSet,
  onChange,
  value = ''
}: WithEmojiProps<H>) {
  const inputElementRef = useRef<H>(null);
  const onChangeRef = useRefFrom(onChange);
  const placeCheckpointOnChangeRef = useRef<boolean>(false);
  const prevInputStateRef = useRef<SelectionAndValue>(new SelectionAndValue('', Infinity, Infinity));
  const undoStackRef = useRef<SelectionAndValue[]>([]);
  const valueRef = useRefFrom(value);

  const rememberInputState = useCallback(() => {
    const { current } = inputElementRef;

    if (current) {
      const { selectionEnd, selectionStart, value } = current;

      prevInputStateRef.current = new SelectionAndValue(value, selectionStart, selectionEnd);
    }
  }, [inputElementRef, prevInputStateRef]);

  // This is for moving the selection while setting the send box value.
  // If we only use setSendBox, we will need to wait for the next render cycle to get the value in, before we can set selectionEnd/Start.
  const setSelectionRangeAndValue = useCallback(
    (value: string, selectionStart: number | null, selectionEnd: number | null) => {
      if (inputElementRef.current) {
        // We need to set the value, before selectionStart/selectionEnd.
        inputElementRef.current.value = value;

        inputElementRef.current.selectionStart = selectionStart;
        inputElementRef.current.selectionEnd = selectionEnd;
      }

      onChangeRef.current?.(value);
    },
    [inputElementRef, onChangeRef]
  );

  const handleChange = useCallback<(event: ChangeEvent<H>) => void>(
    ({ currentTarget: { selectionEnd, selectionStart, value } }) => {
      if (placeCheckpointOnChangeRef.current) {
        undoStackRef.current.push(prevInputStateRef.current);

        placeCheckpointOnChangeRef.current = false;
      }

      // Currently, we cannot detect whether the change is due to clipboard paste or pressing a key on the keyboard.
      // We should not change to emoji when the user is pasting text.
      // We would assume, for a single character addition, the user must be pressing a key.
      if (
        typeof selectionEnd === 'number' &&
        typeof selectionStart === 'number' &&
        selectionStart === selectionEnd &&
        value.length === (valueRef.current || '').length + 1
      ) {
        for (const [emoticon, emoji] of emojiSet.entries()) {
          const { length } = emoticon;

          if (value.slice(selectionEnd - length, selectionEnd) === emoticon) {
            undoStackRef.current.push(new SelectionAndValue(value, selectionStart, selectionEnd));

            placeCheckpointOnChangeRef.current = true;

            value = `${value.slice(0, selectionEnd - length)}${emoji}${value.slice(selectionEnd)}`;
            selectionEnd = selectionEnd += emoji.length - length;
          }
        }
      }

      setSelectionRangeAndValue(value, selectionStart, selectionEnd);
    },
    [placeCheckpointOnChangeRef, prevInputStateRef, setSelectionRangeAndValue, undoStackRef, valueRef]
  );

  const handleFocus = useCallback(() => {
    rememberInputState();

    placeCheckpointOnChangeRef.current = true;
  }, [placeCheckpointOnChangeRef, rememberInputState]);

  const handleKeyDown = useCallback<(event: KeyboardEvent<H>) => void>(
    event => {
      const { ctrlKey, key, metaKey } = event;

      if ((ctrlKey || metaKey) && (key === 'Z' || key === 'z')) {
        event.preventDefault();

        const poppedInputState = undoStackRef.current.pop();

        prevInputStateRef.current = poppedInputState || new SelectionAndValue('', 0, 0);

        setSelectionRangeAndValue(
          prevInputStateRef.current.value,
          prevInputStateRef.current.selectionStart,
          prevInputStateRef.current.selectionEnd
        );
      }
    },
    [prevInputStateRef, setSelectionRangeAndValue, undoStackRef]
  );

  const handleSelect = useCallback<(event: SyntheticEvent<H>) => void>(
    ({ currentTarget: { selectionEnd, selectionStart, value } }) => {
      if (value === prevInputStateRef.current.value) {
        // When caret move, we should push to undo stack on change.
        placeCheckpointOnChangeRef.current = true;
      }

      prevInputStateRef.current = new SelectionAndValue(value, selectionStart, selectionEnd);
    },
    [placeCheckpointOnChangeRef, prevInputStateRef]
  );

  useEffect(rememberInputState, [rememberInputState]);

  return React.createElement(componentType, {
    onChange: handleChange,
    onFocus: handleFocus,
    onKeyDown: handleKeyDown,
    onSelect: handleSelect,
    ref: inputElementRef,
    value: value || ''
  });
}

// TODO: Can we use react-wrap-with?
export default function withEmoji<
  H extends SupportedHTMLElement,
  T extends ComponentType<InputTargetProps<H>> = ComponentType<InputTargetProps<H>>
>(componentType: T): ComponentType<Omit<WithEmojiProps<H>, 'componentType'>> {
  const WithEmoji = ({ onChange, emojiSet, value }: Omit<WithEmojiProps<H>, 'componentType'>) => (
    <WithEmojiController<H> componentType={componentType} emojiSet={emojiSet} onChange={onChange} value={value} />
  );

  WithEmoji.displayName = `WithEmoji<${componentType.displayName}>`;

  return WithEmoji;
}
