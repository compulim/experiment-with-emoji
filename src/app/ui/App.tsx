import { forwardRef, memo, useCallback, useState } from 'react';
import { Input } from '@fluentui/react-components';

import withEmoji, { type RequiredProps } from './withEmoji';

const TextInput = forwardRef<HTMLInputElement | null, RequiredProps<HTMLInputElement>>(
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

const TextInputWithEmoji = withEmoji<HTMLInputElement>(TextInput);

const FluentInputWithEmoji = withEmoji<HTMLInputElement>(Input);

export default memo(function App() {
  const [value, setValue] = useState<string>('');
  const handleChange = useCallback((value: string) => setValue(value), [setValue]);

  return (
    <p>
      <h1>Hello, World!</h1>
      <FluentInputWithEmoji onChange={handleChange} value={value} />
      <TextInputWithEmoji onChange={handleChange} value={value} />
    </p>
  );
});
