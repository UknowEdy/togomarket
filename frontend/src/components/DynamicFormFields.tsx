import { UseFormRegister, FieldErrors } from 'react-hook-form';
import { getCategoryFields, type FieldConfig } from '@/config/categoryFields';
import { Input } from './Input';

interface DynamicFormFieldsProps {
  category: string;
  register: UseFormRegister<any>;
  errors: FieldErrors;
}

export const DynamicFormFields = ({ category, register, errors }: DynamicFormFieldsProps) => {
  const fields = getCategoryFields(category);

  if (!fields || fields.length === 0) {
    return null;
  }

  const renderField = (field: FieldConfig) => {
    const errorMessage = errors[field.name]?.message as string | undefined;

    switch (field.type) {
      case 'select':
        return (
          <div key={field.name}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {field.label} {field.required && <span className="text-danger">*</span>}
            </label>
            <select
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
                errorMessage ? 'border-danger' : 'border-gray-300'
              }`}
              {...register(field.name, {
                required: field.required ? `${field.label} est requis` : false
              })}
            >
              <option value="">Sélectionnez...</option>
              {field.options?.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            {errorMessage && (
              <p className="mt-1 text-sm text-danger">{errorMessage}</p>
            )}
          </div>
        );

      case 'checkbox':
        return (
          <div key={field.name} className="flex items-center gap-2">
            <input
              type="checkbox"
              id={field.name}
              className="rounded border-gray-300 text-primary focus:ring-primary"
              {...register(field.name)}
            />
            <label htmlFor={field.name} className="text-sm font-medium text-gray-700 cursor-pointer">
              {field.label}
            </label>
          </div>
        );

      case 'textarea':
        return (
          <div key={field.name}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {field.label} {field.required && <span className="text-danger">*</span>}
            </label>
            <textarea
              rows={4}
              placeholder={field.placeholder}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
                errorMessage ? 'border-danger' : 'border-gray-300'
              }`}
              {...register(field.name, {
                required: field.required ? `${field.label} est requis` : false
              })}
            />
            {errorMessage && (
              <p className="mt-1 text-sm text-danger">{errorMessage}</p>
            )}
          </div>
        );

      case 'number':
      case 'text':
      case 'date':
        return (
          <Input
            key={field.name}
            type={field.type}
            label={field.label}
            placeholder={field.placeholder}
            error={errorMessage}
            {...register(field.name, {
              required: field.required ? `${field.label} est requis` : false,
              ...(field.type === 'number' && {
                valueAsNumber: true,
                min: { value: 0, message: 'Valeur invalide' }
              })
            })}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-4 border-t border-gray-200 pt-4 mt-4">
      <h3 className="font-semibold text-gray-900 mb-2">Informations spécifiques</h3>
      {fields.map(renderField)}
    </div>
  );
};
