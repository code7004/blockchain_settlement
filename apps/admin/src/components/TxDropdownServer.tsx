import { SERVER_TYPE } from '@/constants';
import { TxFieldDropdown, type ITxDropdownProps } from '@/core/tx-ui';
import { configAction } from '@/store/config';
import { useConfig } from '@/store/hooks/useConfig';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';

export const TxDropdownServer = (props: Omit<ITxDropdownProps, 'data'>) => {
  const config = useConfig();

  const [server, _server] = useState(config.server == '' ? SERVER_TYPE.TEST : config.server);

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(configAction.changeServer(server));
  }, [server, dispatch]);

  const hdChangeServer = (server: string) => {
    _server(server);

    dispatch(configAction.changeServer(server));
  };

  return <TxFieldDropdown {...props} value={server} data={[SERVER_TYPE.TEST, SERVER_TYPE.LIVE]} onChangeText={hdChangeServer} warning={config.baseUrl} />;
};
