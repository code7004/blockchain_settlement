import { apipost } from '@/core/network';
import { TxButton, TxInput, type ITxInputRef } from '@/core/tx-ui';
import { useRef, useState } from 'react';

export default function Openai() {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [input, setInput] = useState('');
  const inputRef = useRef<ITxInputRef>(null);

  const sendMessage = async () => {
    const newMessages = [...messages, { role: 'user', content: input }];

    setMessages(newMessages);

    const res = await apipost<string>('/portal/openai/chat', { messages: newMessages });

    setMessages([...newMessages, { role: 'assistant', content: res }]);

    setInput('');
  };

  if (inputRef == null) return;

  return (
    <div className="flex flex-1 flex-col gap-2">
      <div className="flex items-end justify-end gap-3 mb-4"></div>
      <div className="rounded border flex-1">
        {messages.map((m, i) => (
          <div key={i}>
            {m.role}: {m.content}
          </div>
        ))}
      </div>
      <div className="flex gap-3">
        <TxInput ref={inputRef} className="flex-1" value={input} onChangeText={setInput} onSubmit={sendMessage} onEnter={sendMessage} focus />
        <TxButton className="w-[6em]" label="입력" onClick={sendMessage} />
      </div>
    </div>
  );
}
