export const TxJsonTreeTheme = {
  base: 'font-mono text-sm',
  node: 'flex items-center space-x-1 whitespace-nowrap',
  key: 'text-blue-600 mr-1',
  value: {
    string: 'text-green-600',
    number: 'text-purple-600',
    boolean: 'text-orange-600',
    null: 'text-gray-400',
  },
  control: {
    add: 'ml-2 text-blue-500 hover:text-blue-700',
    delete: 'ml-1 text-red-500 hover:text-red-700',
    edit: 'ml-1 text-gray-500 hover:text-gray-700',
  },
};
