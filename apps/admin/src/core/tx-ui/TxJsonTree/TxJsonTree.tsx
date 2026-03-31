// TxJsonTree.tsx
import { useMemo, useState } from 'react';
import { TxJsonTreeTheme, themeMerge } from '..';
import type { EditableValue, ITreeNodeProps, ITxJsonTreeProps, JsonArray, JsonObject } from './TxJsonTree.types';
import { getType, isPrimitive } from './TxJsonTree.utils';

/**
 * TxJsonTree v1
 * - JSON을 트리로 렌더링
 * - CRUD 기능 제공
 * - 콜백: onClick, onEdit, onAdd, onDelete
 */
export function TxJsonTree<T = unknown>({ data, theme, onClick, onEdit, onAdd, onDelete, locale = (t) => t, isRootType = false }: ITxJsonTreeProps<T>) {
  const stableTheme = useMemo(() => themeMerge(TxJsonTreeTheme, theme, 'override'), [theme]);

  return (
    <div data-tag="TxJsonTree" className={stableTheme.base}>
      <TreeNode value={data} theme={stableTheme} path={[]} onClick={onClick} onEdit={onEdit} locale={locale} onAdd={onAdd} onDelete={onDelete} isRootType={isRootType} />
    </div>
  );
}

/**
 * TreeNode
 * - 개별 노드 렌더링
 * - 객체/배열은 expand/collapse 지원
 */
function TreeNode({ value, theme, path, onClick, onEdit, onAdd, locale = (t) => t, onDelete, isRootType }: ITreeNodeProps) {
  const [expanded, _expanded] = useState(true);
  const [editing, _editing] = useState(false);
  const [editValue, _editValue] = useState<EditableValue | string>(() => (isPrimitive(value) ? value : JSON.stringify(value, null, 2)));

  // ✅ 노드 타입 구분
  const type = getType(value);

  function hdToggle() {
    _expanded(!expanded);
  }

  function hdClick() {
    onClick?.(path, value);
  }

  function hdStartEdit() {
    _editing(true);
  }

  function hdSaveEdit() {
    _editing(false);
    onEdit?.(path, editValue, value);
  }

  function hdDelete() {
    onDelete?.(path, value);
  }

  function hdAdd() {
    const newKey = prompt('Enter key');
    if (!newKey) return;
    const newValue = prompt('Enter value');
    onAdd?.(path, newKey, newValue);
  }

  // ✅ 렌더링
  if (type === 'object') {
    return (
      <div data-tag="TxJsonTreeNode" className={theme.node}>
        <button onClick={hdToggle}>{expanded ? '-' : '+'}</button>
        {isRootType && (
          <span className={theme.key} onClick={hdClick}>
            {'{Object}'}
          </span>
        )}
        {expanded && (
          <div className="ml-4">
            {Object.entries(value as JsonObject).map(([k, v]) => (
              <div key={k} className="flex">
                <span className={theme.key}>{locale(k)}:</span>
                <TreeNode value={v} theme={theme} path={[...path, k]} onClick={onClick} locale={locale} onEdit={onEdit} onAdd={onAdd} onDelete={onDelete} />
                {onDelete && (
                  <button className={theme.control.delete} onClick={() => onDelete?.([...path, k], v)}>
                    x
                  </button>
                )}
              </div>
            ))}
            {onAdd && (
              <button className={theme.control.add} onClick={hdAdd}>
                + add
              </button>
            )}
          </div>
        )}
      </div>
    );
  }

  if (type === 'array') {
    return (
      <div data-tag="TxJsonTreeNode" className={theme.node}>
        <button onClick={hdToggle}>{expanded ? '-' : '+'}</button>
        {isRootType && (
          <span className={theme.key} onClick={hdClick}>
            {'[Array]'}
          </span>
        )}
        {expanded && (
          <div className="ml-4">
            {(value as JsonArray).map((v, i) => (
              <div key={i} className="flex">
                <span className={theme.key}>{i}:</span>
                <TreeNode value={v} theme={theme} path={[...path, String(i)]} onClick={onClick} onEdit={onEdit} onAdd={onAdd} onDelete={onDelete} />
                {onDelete && (
                  <button className={theme.control.delete} onClick={() => onDelete?.([...path, String(i)], v)}>
                    x
                  </button>
                )}
              </div>
            ))}
            <button className={theme.control.add} onClick={hdAdd}>
              + add
            </button>
          </div>
        )}
      </div>
    );
  }

  // ✅ 기본 타입(string, number, boolean, null)
  return (
    <div data-tag="TxJsonTreeNode" className={theme.node}>
      {editing ? (
        <>
          <input value={typeof editValue === 'string' ? editValue : String(editValue ?? '')} onChange={(e) => _editValue(e.target.value)} />
          <button className={theme.control.edit} onClick={hdSaveEdit}>
            save
          </button>
        </>
      ) : (
        <>
          <span className={theme.value?.[type]} onClick={hdClick}>
            {String(value as string)}
          </span>
          {onEdit && (
            <>
              <button className={theme.control.edit} onClick={hdStartEdit}>
                edit
              </button>
              <button className={theme.control.delete} onClick={hdDelete}>
                x
              </button>
            </>
          )}
        </>
      )}
    </div>
  );
}
