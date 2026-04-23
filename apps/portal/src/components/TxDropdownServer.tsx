import { SERVER_TYPE } from '@/constants';
import { TxFieldDropdown, type ITxDropdownProps } from '@/core/tx-ui';
import { configAction } from '@/store/config';
import { useConfig } from '@/store/hooks/useConfig';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';

const SeverTypes = Object.values(SERVER_TYPE);

export const TxDropdownServer = (props: Omit<ITxDropdownProps, 'data'>) => {
  const config = useConfig();

  const [server, _server] = useState(config.server == '' ? SERVER_TYPE.TEST : config.server);

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(configAction.changeServer(server as string));
  }, [server, dispatch]);

  const hdChangeServer = (server: string | undefined) => {
    if (!server) return;
    _server(server);
    dispatch(configAction.changeServer(server));
  };

  return <TxFieldDropdown {...props} value={server as SERVER_TYPE} data={SeverTypes} onChangeText={hdChangeServer} warning={config.baseUrl} />;
};
