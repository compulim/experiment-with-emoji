import { type ChangeEvent, forwardRef, memo, useCallback, useState } from 'react';
import { Input, Textarea } from '@fluentui/react-components';

import withEmoji, { type InputTargetProps } from './withEmoji';

const TextInput = forwardRef<HTMLInputElement | null, InputTargetProps<HTMLInputElement>>(
  // eslint-disable-next-line react/prop-types
  ({ onChange, onFocus, onKeyDown, onSelect, value }, ref) => (
    <input
      onChange={onChange}
      onFocus={onFocus}
      onKeyDown={onKeyDown}
      onSelect={onSelect}
      ref={ref}
      type="text"
      value={value}
    />
  )
);

TextInput.displayName = 'TextInput';

const TextArea = forwardRef<HTMLTextAreaElement | null, InputTargetProps<HTMLTextAreaElement>>(
  // eslint-disable-next-line react/prop-types
  ({ onChange, onFocus, onKeyDown, onSelect, value }, ref) => (
    <textarea onChange={onChange} onFocus={onFocus} onKeyDown={onKeyDown} onSelect={onSelect} ref={ref} value={value} />
  )
);

TextArea.displayName = 'TextArea';

const FluentInput = forwardRef<HTMLInputElement | null, InputTargetProps<HTMLInputElement>>(
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

const FluentTextArea = forwardRef<HTMLTextAreaElement | null, InputTargetProps<HTMLTextAreaElement>>(
  // eslint-disable-next-line react/prop-types
  ({ onChange, onFocus, onKeyDown, onSelect, value }, ref) => {
    const handleChange = useCallback((event: ChangeEvent<HTMLTextAreaElement>) => onChange?.(event), [onChange]);

    return (
      <Textarea
        onChange={handleChange}
        onFocus={onFocus}
        onKeyDown={onKeyDown}
        onSelect={onSelect}
        ref={ref}
        value={value}
      />
    );
  }
);

const TextInputWithEmoji = withEmoji<HTMLInputElement>(TextInput);
const TextAreaWithEmoji = withEmoji<HTMLTextAreaElement>(TextArea);

const FluentInputWithEmoji = withEmoji<HTMLInputElement>(FluentInput);
const FluentTextAreaWithEmoji = withEmoji<HTMLTextAreaElement>(FluentTextArea);

export default memo(function App() {
  const [inputValue, setInputValue] = useState<string>('');
  const [textAreaValue, setTextAreaValue] = useState<string>('');

  const handleInputChange = useCallback((value: string) => setInputValue(value), [setInputValue]);
  const handleTextAreaChange = useCallback((value: string) => setTextAreaValue(value), [setTextAreaValue]);

  return (
    <p>
      <h1>Hello, World!</h1>
      <hr />
      <FluentInputWithEmoji onChange={handleInputChange} value={inputValue} />
      <TextInputWithEmoji onChange={handleInputChange} value={inputValue} />
      <hr />
      <FluentTextAreaWithEmoji onChange={handleTextAreaChange} value={textAreaValue} />
      <TextAreaWithEmoji onChange={handleTextAreaChange} value={textAreaValue} />
    </p>
  );
});
