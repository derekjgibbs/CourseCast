import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  GraduationCap,
  Save,
  X,
  HelpCircle,
  AlertCircle
} from 'lucide-react';
import { CONSTRAINTS, type UserScenarioDoc } from '@/convex/types';

interface ConstraintInputFormProps {
  scenario?: UserScenarioDoc;
  onSave: (constraints: {
    token_budget: number;
    min_credits: number;
    max_credits: number;
  }) => Promise<void> | void;
  onCancel: () => void;
}

interface FormData {
  token_budget: string;
  min_credits: string;
  max_credits: string;
}

interface ValidationErrors {
  token_budget?: string;
  min_credits?: string;
  max_credits?: string;
  credits_range?: string;
}

const ConstraintInputForm: React.FC<ConstraintInputFormProps> = ({
  scenario,
  onSave,
  onCancel,
}) => {
  const [formData, setFormData] = useState<FormData>({
    token_budget: scenario?.token_budget?.toString() || CONSTRAINTS.USER_SCENARIO.TOKEN_BUDGET_DEFAULT.toString(),
    min_credits: scenario?.min_credits?.toString() || CONSTRAINTS.USER_SCENARIO.MIN_CREDITS_DEFAULT.toString(),
    max_credits: scenario?.max_credits?.toString() || CONSTRAINTS.USER_SCENARIO.MAX_CREDITS_DEFAULT.toString(),
  });

  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showTooltips, setShowTooltips] = useState({
    token_budget: false,
    credits: false,
  });

  // Validation functions
  const validateTokenBudget = (value: string): string | undefined => {
    const numValue = parseFloat(value);
    if (isNaN(numValue) || numValue <= 0) {
      return 'Token budget must be greater than 0';
    }
    return undefined;
  };

  const validateCredits = (minStr: string, maxStr: string): { min?: string; max?: string; range?: string } => {
    const min = parseFloat(minStr);
    const max = parseFloat(maxStr);
    const errors: { min?: string; max?: string; range?: string } = {};

    if (isNaN(min) || min < CONSTRAINTS.USER_SCENARIO.MIN_CREDITS_LIMIT) {
      errors.min = `Minimum credits must be at least ${CONSTRAINTS.USER_SCENARIO.MIN_CREDITS_LIMIT}`;
    }

    if (isNaN(max) || max > CONSTRAINTS.USER_SCENARIO.MAX_CREDITS_LIMIT) {
      errors.max = `Maximum credits cannot exceed ${CONSTRAINTS.USER_SCENARIO.MAX_CREDITS_LIMIT}`;
    }

    if (!errors.min && !errors.max && min > max) {
      errors.range = 'Minimum credits cannot exceed maximum credits';
    }

    return errors;
  };

  // Real-time validation
  useEffect(() => {
    const newErrors: ValidationErrors = {};

    // Validate token budget
    const tokenError = validateTokenBudget(formData.token_budget);
    if (tokenError) newErrors.token_budget = tokenError;

    // Validate credits
    const creditErrors = validateCredits(formData.min_credits, formData.max_credits);
    if (creditErrors.min) newErrors.min_credits = creditErrors.min;
    if (creditErrors.max) newErrors.max_credits = creditErrors.max;
    if (creditErrors.range) newErrors.credits_range = creditErrors.range;

    setErrors(newErrors);
  }, [formData]);

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleInputBlur = (field: keyof FormData) => {
    // Auto-format numbers
    if (field === 'token_budget') {
      const numValue = parseFloat(formData[field]);
      if (!isNaN(numValue)) {
        setFormData(prev => ({
          ...prev,
          [field]: Math.floor(numValue).toString(),
        }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (Object.keys(errors).length > 0) return;

    setIsSubmitting(true);
    try {
      await onSave({
        token_budget: parseInt(formData.token_budget),
        min_credits: parseFloat(formData.min_credits),
        max_credits: parseFloat(formData.max_credits),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = Object.keys(errors).length === 0 &&
    formData.token_budget &&
    formData.min_credits &&
    formData.max_credits;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center py-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-2">
            Setup Constraints
          </h1>
          <p className="text-gray-600 text-lg">Configure your course selection parameters</p>
        </div>

        {/* Form Container */}
        <div
          data-testid="constraint-form-container"
          className="bg-white bg-opacity-20 backdrop-blur-sm rounded-2xl shadow-lg border border-white border-opacity-30 p-8 transition-all duration-300 hover:bg-opacity-30"
        >
          <form
            onSubmit={handleSubmit}
            aria-label="Constraint input form"
            role="form"
            className="space-y-8"
          >
            {/* Token Budget Section */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
                  <DollarSign className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-semibold text-gray-800">Token Budget</h2>
                <div className="relative">
                  <button
                    type="button"
                    data-testid="token-budget-tooltip"
                    onMouseEnter={() => setShowTooltips(prev => ({ ...prev, token_budget: true }))}
                    onMouseLeave={() => setShowTooltips(prev => ({ ...prev, token_budget: false }))}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <HelpCircle className="w-4 h-4" />
                  </button>
                  {showTooltips.token_budget && (
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-sm rounded-lg shadow-lg z-10 whitespace-nowrap">
                      Total tokens available for course bidding
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="token_budget"
                  className="block text-sm font-medium text-gray-700"
                >
                  Token Budget
                </label>
                <input
                  id="token_budget"
                  type="number"
                  value={formData.token_budget}
                  onChange={(e) => handleInputChange('token_budget', e.target.value)}
                  onBlur={() => handleInputBlur('token_budget')}
                  aria-describedby="token-budget-help"
                  tabIndex={1}
                  className={`w-full px-4 py-3 border rounded-xl bg-white bg-opacity-50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:border-transparent text-gray-900 placeholder-gray-500 transition-all duration-300 focus:bg-opacity-70 ${
                    errors.token_budget
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-white border-opacity-20 focus:ring-blue-500'
                  }`}
                  placeholder="Enter token budget"
                />
                <p id="token-budget-help" className="text-xs text-gray-500">
                  Default: {CONSTRAINTS.USER_SCENARIO.TOKEN_BUDGET_DEFAULT} tokens
                </p>
                {errors.token_budget && (
                  <div className="flex items-center space-x-1 text-red-600 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    <span>{errors.token_budget}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Credits Section */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg">
                  <GraduationCap className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-semibold text-gray-800">Credit Requirements</h2>
                <div className="relative">
                  <button
                    type="button"
                    data-testid="credits-tooltip"
                    onMouseEnter={() => setShowTooltips(prev => ({ ...prev, credits: true }))}
                    onMouseLeave={() => setShowTooltips(prev => ({ ...prev, credits: false }))}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <HelpCircle className="w-4 h-4" />
                  </button>
                  {showTooltips.credits && (
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-sm rounded-lg shadow-lg z-10 whitespace-nowrap">
                      Set your credit limits for course selection
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label
                    htmlFor="min_credits"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Minimum Credits
                  </label>
                  <input
                    id="min_credits"
                    type="number"
                    step="0.5"
                    value={formData.min_credits}
                    onChange={(e) => handleInputChange('min_credits', e.target.value)}
                    tabIndex={2}
                    className={`w-full px-4 py-3 border rounded-xl bg-white bg-opacity-50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:border-transparent text-gray-900 placeholder-gray-500 transition-all duration-300 focus:bg-opacity-70 ${
                      errors.min_credits || errors.credits_range
                        ? 'border-red-500 focus:ring-red-500'
                        : 'border-white border-opacity-20 focus:ring-blue-500'
                    }`}
                    placeholder="Min credits"
                  />
                  {errors.min_credits && (
                    <div className="flex items-center space-x-1 text-red-600 text-sm">
                      <AlertCircle className="w-4 h-4" />
                      <span>{errors.min_credits}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="max_credits"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Maximum Credits
                  </label>
                  <input
                    id="max_credits"
                    type="number"
                    step="0.5"
                    value={formData.max_credits}
                    onChange={(e) => handleInputChange('max_credits', e.target.value)}
                    tabIndex={3}
                    className={`w-full px-4 py-3 border rounded-xl bg-white bg-opacity-50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:border-transparent text-gray-900 placeholder-gray-500 transition-all duration-300 focus:bg-opacity-70 ${
                      errors.max_credits || errors.credits_range
                        ? 'border-red-500 focus:ring-red-500'
                        : 'border-white border-opacity-20 focus:ring-blue-500'
                    }`}
                    placeholder="Max credits"
                  />
                  {errors.max_credits && (
                    <div className="flex items-center space-x-1 text-red-600 text-sm">
                      <AlertCircle className="w-4 h-4" />
                      <span>{errors.max_credits}</span>
                    </div>
                  )}
                </div>
              </div>

              {errors.credits_range && (
                <div className="flex items-center space-x-1 text-red-600 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  <span>{errors.credits_range}</span>
                </div>
              )}

              <p className="text-xs text-gray-500">
                Credits must be between {CONSTRAINTS.USER_SCENARIO.MIN_CREDITS_LIMIT} and {CONSTRAINTS.USER_SCENARIO.MAX_CREDITS_LIMIT}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-white border-opacity-20">
              <button
                type="button"
                onClick={onCancel}
                className="px-6 py-3 bg-white bg-opacity-50 backdrop-blur-sm border border-white border-opacity-30 rounded-xl text-gray-700 font-medium hover:bg-opacity-70 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-300"
              >
                <X className="w-4 h-4 mr-2 inline" />
                Cancel
              </button>
              <button
                type="submit"
                disabled={!isFormValid || isSubmitting}
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 font-medium transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                <Save className="w-4 h-4 mr-2" />
                {isSubmitting ? 'Saving...' : 'Save Constraints'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ConstraintInputForm;
