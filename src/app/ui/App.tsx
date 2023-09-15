import { type ChangeEvent, type ComponentType, forwardRef, memo, useCallback, useState } from 'react';
import { Input, Textarea } from '@fluentui/react-components';
import { useRefFrom } from 'use-ref-from';

import withEmoji, { type InputTargetProps } from './withEmoji';

const TextInput = forwardRef<HTMLInputElement | null, InputTargetProps<HTMLInputElement>>(
  // eslint-disable-next-line react/prop-types
  (props, ref) => <input ref={ref} {...props} />
);

TextInput.displayName = 'TextInput';

const TextArea = forwardRef<HTMLTextAreaElement | null, InputTargetProps<HTMLTextAreaElement>>(
  // eslint-disable-next-line react/prop-types
  (props, ref) => <textarea ref={ref} {...props} />
);

TextArea.displayName = 'TextArea';

const FluentInput = forwardRef<
  HTMLInputElement | null,
  Omit<PropsOf<typeof Input>, 'onChange'> & { onChange: (event: ChangeEvent<HTMLInputElement>) => void }
>(
  // eslint-disable-next-line react/prop-types
  ({ onChange, onFocus, onKeyDown, onSelect, value }, ref) => {
    const handleChange = useCallback((event: ChangeEvent<HTMLInputElement>) => onChange?.(event), [onChange]);

    return (
      <Input
        onChange={handleChange}
        onFocus={onFocus}
        onKeyDown={onKeyDown}
        onSelect={onSelect}
        ref={ref}
        type="text"
        value={value}
      />
    );
  }
);

FluentInput.displayName = 'FluentInput';

const FluentTextArea = forwardRef<
  HTMLTextAreaElement,
  Omit<PropsOf<typeof Textarea>, 'onChange'> & { onChange?: (event: ChangeEvent<HTMLTextAreaElement>) => void }
>(
  // eslint-disable-next-line react/prop-types
  (props, ref) => {
    const onChangeRef = useRefFrom(props.onChange);
    const handleChange = useCallback(
      (event: ChangeEvent<HTMLTextAreaElement>) => onChangeRef.current?.(event),
      [onChangeRef]
    );

    return <Textarea {...props} onChange={handleChange} ref={ref} />;
  }
);

FluentTextArea.displayName = 'FluentTextArea';

type PropsOf<T extends ComponentType> = T extends ComponentType<infer P> ? P : never;

const TextInputWithEmoji = withEmoji(TextInput);
const TextAreaWithEmoji = withEmoji(TextArea);

const FluentInputWithEmoji = withEmoji(FluentInput);
const FluentTextAreaWithEmoji = withEmoji(FluentTextArea);

export default memo(function App() {
  const [inputValue, setInputValue] = useState<string>('');
  const [textAreaValue, setTextAreaValue] = useState<string>('');

  const handleInputChange = useCallback((value: string | undefined) => setInputValue(value || ''), [setInputValue]);
  const handleTextAreaChange = useCallback(
    (value: string | undefined) => setTextAreaValue(value || ''),
    [setTextAreaValue]
  );

  return (
    <p>
      <h1>Hello, World!</h1>
      <hr />
      <FluentInputWithEmoji onChange={handleInputChange} value={inputValue} />
      <TextInputWithEmoji onChange={handleInputChange} value={inputValue} />
      <hr />
      <FluentTextAreaWithEmoji
        aria-label="Hello"
        disabled={true}
        onChange={handleTextAreaChange}
        value={textAreaValue}
      />
      <TextAreaWithEmoji onChange={handleTextAreaChange} value={textAreaValue} />
    </p>
  );
});
