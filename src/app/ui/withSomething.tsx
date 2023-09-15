import React, { type ComponentType } from 'react';
import { Input } from '@fluentui/react-components';

type RequiredProps = {
  value?: string;
};

function WithSomething<P extends RequiredProps, T extends ComponentType<P>>(props: {
  componentType: T;
  componentProps: P;
}) {
  const { componentType, componentProps } = props;

  return React.createElement(componentType, componentProps);
}

export default WithSomething;

WithSomething({ componentProps: {}, componentType: Input });
