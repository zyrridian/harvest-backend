'use client';

import SwaggerUI from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';

interface ReactSwaggerProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  spec: Record<string, any>;
}

export default function ReactSwagger({ spec }: ReactSwaggerProps) {
  return <SwaggerUI spec={spec} />;
}
