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

type SupportedHTMLElement = HTMLInputElement | HTMLTextAreaElement;

export type RequiredProps<H> = {
  onChange?: (event: ChangeEvent<H>) => void;
  onFocus?: (event: FocusEvent<H>) => void;
  onKeyDown?: (event: KeyboardEvent<H>) => void;
  onSelect?: (event: SyntheticEvent<H>) => void;
  ref: Ref<H | null>;
  value?: string;
};

type WithEmojiProps<H> = {
  componentType: ComponentType<RequiredProps<H>>;
  emojiSet?: Map<string, string>;
  // eslint-disable-next-line react/require-default-props
  onChange?: (value: string) => void;
  // eslint-disable-next-line react/require-default-props
  value?: string;
};

type SelectionRange = {
  selectionEnd: number | null;
  selectionStart: number | null;
};

type SelectionAndValue = SelectionRange & {
  value: string;
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
  const prevInputStateRef = useRef<SelectionAndValue>({
    selectionEnd: Infinity,
    selectionStart: Infinity,
    value: value || ''
  });
  const undoStackRef = useRef<SelectionAndValue[]>([]);
  const valueRef = useRefFrom(value);

  const rememberInputState = useCallback(() => {
    const { current } = inputElementRef;

    if (current) {
      const { selectionEnd, selectionStart, value } = current;

      prevInputStateRef.current = {
        selectionEnd,
        selectionStart,
        value
      };
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
        const { current } = prevInputStateRef;

        undoStackRef.current.push({ ...current });

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
            undoStackRef.current.push({
              selectionEnd: selectionEnd,
              selectionStart: selectionStart,
              value: value
            });

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

        if (poppedInputState) {
          prevInputStateRef.current = { ...poppedInputState };
        } else {
          prevInputStateRef.current = { selectionEnd: 0, selectionStart: 0, value: '' };
        }

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

      prevInputStateRef.current = { selectionEnd, selectionStart, value };
    },
    [placeCheckpointOnChangeRef, prevInputStateRef]
  );

  // This is for TypeFocusSink. When the focus in on the script, then starting press "a", without this line, it would cause errors.
  // We call rememberInputState() when "onFocus" event is fired, but since this is from TypeFocusSink, we are not able to receive "onFocus" event before it happen.
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
  T extends ComponentType<RequiredProps<H>> = ComponentType<RequiredProps<H>>
>(componentType: T): ComponentType<Omit<WithEmojiProps<H>, 'componentType'>> {
  const WithEmoji = ({ onChange, emojiSet, value }: Omit<WithEmojiProps<H>, 'componentType'>) => (
    <WithEmojiController<H> componentType={componentType} emojiSet={emojiSet} onChange={onChange} value={value} />
  );

  WithEmoji.displayName = `WithEmoji<${componentType.displayName}>`;

  return WithEmoji;
}
