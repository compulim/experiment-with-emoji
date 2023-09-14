import React, { type ComponentType } from 'react';

type RequiredProps = {
  value?: string;
};

function WithSomething<P extends RequiredProps>(props: { componentType: ComponentType<P>; componentProps: P }) {
  const { componentType, componentProps } = props;

  return React.createElement(componentType, componentProps);
}

export default WithSomething;
