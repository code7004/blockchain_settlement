import { TxButton } from '@/core/tx-ui';
import { useConfig } from '@/store/hooks';
import { useCallback, useEffect } from 'react';

export default function SwaggerPage({ path }: { path: string }) {
  const config = useConfig();
  const fullLink = `${config.baseUrl}${path}`;

  const hdClick = useCallback(() => {
    window.open(`${fullLink}`, path);
  }, [fullLink, path]);

  useEffect(() => {
    hdClick();
  }, [hdClick]);

  return (
    <TxButton variant="text" className="w-full" onClick={hdClick}>
      Go to API {fullLink}
    </TxButton>
  );
}
