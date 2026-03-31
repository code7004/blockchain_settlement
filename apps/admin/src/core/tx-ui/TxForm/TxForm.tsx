import React, { createContext, useContext, useMemo } from 'react';
import { TxFormTheme, type ITxForm, type ITxFormCtx, type ITxFormFlexProps, type ITxFormLabelProps } from '.';
import { cm, themeMerge } from '..';

/**
 *
 * @param param0
 * @example
 * <TxForm className="flex flex-row">
 *   <TxInput caption="ID" id="id" className="" />
 *   <TxInput caption="NAME" id="name" />
 *   <TxDropdown caption="AGE" data={DropDownAge }} />
 *   <TxButton type="submit" label="Submit" onClick={e => console.log("submit", e)} />
 *   <TxButton type="reset" label="Cancel" onClick={e => console.log("reset", e)} />
 * </TxForm>
 *
 * <TxForm labelWidth="w-20" onSubmit={e => console.log("submit", e)} onReset={e => console.log("reset", e)}>
 *   <TxForm.Flex>
 *   <TxForm.Label className="text-end" htmlFor="id" children="ID" />
 *   <TxInput id="id" />
 *   </TxForm.Flex>
 *   <TxCapsLockCheck />
 *   <TxForm.Flex>
 *     <TxButton type="submit" label="Submit" className="flex-1" />
 *     <TxButton type="reset" label="Cancel" className="flex-1" />
 *   </TxForm.Flex>
 * </TxForm>
 *
 * <TxForm className="flex">
 *   <TxInput caption="ID" id="id" className="w-[10em]" />
 *   <TxFlex>
 *     <TxButton className="flex-1" type="submit" label="Submit" onClick={e => console.log("submit", e)} />
 *     <TxButton className="flex-1" type="reset" label="Cancel" onClick={e => console.log("reset", e)} />
 *   </TxFlex>
 * </TxForm>
 *
 * <TxForm labelWidth="w-20" onSubmit={e => console.log("submit", e)} onReset={e => console.log("reset", e)}>
 *   <TxForm.Flex className="flex-col">
 *     <TxForm.Label htmlFor="id">ID</TxForm.Label>
 *     <TxInput id="id" />
 *   </TxForm.Flex>
 * </TxForm>
 *
 * <TxForm className="flex flex-row">
 *   <TxInput caption="ID" id="id" className="" />
 *   <TxInput caption="NAME" id="name" />
 *   <TxDropdown caption="AGE" data={DropDownAge }} />
 *   <TxButton type="submit" label="Submit" onClick={e => console.log("submit", e)} />
 *   <TxButton type="reset" label="Cancel" onClick={e => console.log("reset", e)} />
 * </TxForm>
 */
export const TxForm = ({ className, theme, children, onSubmit, onReset, labelWidth, ...props }: ITxForm) => {
  const stableTheme = useMemo(() => themeMerge(TxFormTheme, theme, 'override'), [theme]);

  const ctxValue = useMemo(() => ({ labelWidth }), [labelWidth]);

  function hdSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    onSubmit?.(e);
  }

  return (
    <FormCtx.Provider value={ctxValue}>
      <form data-tag="TxForm" className={cm(stableTheme.wrapper, className)} onSubmit={hdSubmit} onReset={onReset} {...props}>
        {children}
      </form>
    </FormCtx.Provider>
  );
};

const FormCtx = createContext<ITxFormCtx>({});

const TxFormFlex = ({ className, theme, ...props }: ITxFormFlexProps) => {
  return <div data-tag="TxForm.Flex" className={cm(theme?.flex, className)} {...props} />;
};

TxForm.Flex = TxFormFlex;

const TxFormLabel = ({ className, theme, ...props }: ITxFormLabelProps) => {
  const { labelWidth } = useContext(FormCtx);

  return <label data-tag="TxForm.Label" className={cm(theme?.label, labelWidth, className)} {...props} />;
};

// ✅ 나중에 할당
TxForm.Label = TxFormLabel;
