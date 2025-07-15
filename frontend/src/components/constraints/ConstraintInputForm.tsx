import React, { useState, useEffect } from "react";
import { DollarSign, GraduationCap, Save, X, HelpCircle, AlertCircle } from "lucide-react";
import { CONSTRAINTS, type UserScenarioDoc } from "@/convex/types";

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
    token_budget:
      scenario?.token_budget?.toString() ||
      CONSTRAINTS.USER_SCENARIO.TOKEN_BUDGET_DEFAULT.toString(),
    min_credits:
      scenario?.min_credits?.toString() || CONSTRAINTS.USER_SCENARIO.MIN_CREDITS_DEFAULT.toString(),
    max_credits:
      scenario?.max_credits?.toString() || CONSTRAINTS.USER_SCENARIO.MAX_CREDITS_DEFAULT.toString(),
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
      return "Token budget must be greater than 0";
    }
    return undefined;
  };

  const validateCredits = (
    minStr: string,
    maxStr: string,
  ): { min?: string; max?: string; range?: string } => {
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
      errors.range = "Minimum credits cannot exceed maximum credits";
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
    if (field === "token_budget") {
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

  const isFormValid =
    Object.keys(errors).length === 0 &&
    formData.token_budget &&
    formData.min_credits &&
    formData.max_credits;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-100 p-6">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Header */}
        <div className="py-8 text-center">
          <h1 className="mb-2 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-4xl font-bold text-transparent">
            Setup Constraints
          </h1>
          <p className="text-lg text-gray-600">Configure your course selection parameters</p>
        </div>

        {/* Form Container */}
        <div
          data-testid="constraint-form-container"
          className="bg-opacity-20 border-opacity-30 hover:bg-opacity-30 rounded-2xl border border-white bg-white p-8 shadow-lg backdrop-blur-sm transition-all duration-300"
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
                <div className="rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 p-2">
                  <DollarSign className="h-5 w-5 text-white" />
                </div>
                <h2 className="text-xl font-semibold text-gray-800">Token Budget</h2>
                <div className="relative">
                  <button
                    type="button"
                    data-testid="token-budget-tooltip"
                    onMouseEnter={() => setShowTooltips(prev => ({ ...prev, token_budget: true }))}
                    onMouseLeave={() => setShowTooltips(prev => ({ ...prev, token_budget: false }))}
                    className="text-gray-400 transition-colors hover:text-gray-600"
                  >
                    <HelpCircle className="h-4 w-4" />
                  </button>
                  {showTooltips.token_budget && (
                    <div className="absolute bottom-full left-1/2 z-10 mb-2 -translate-x-1/2 transform rounded-lg bg-gray-800 px-3 py-2 text-sm whitespace-nowrap text-white shadow-lg">
                      Total tokens available for course bidding
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="token_budget" className="block text-sm font-medium text-gray-700">
                  Token Budget
                </label>
                <input
                  id="token_budget"
                  type="number"
                  value={formData.token_budget}
                  onChange={e => handleInputChange("token_budget", e.target.value)}
                  onBlur={() => handleInputBlur("token_budget")}
                  aria-describedby="token-budget-help"
                  tabIndex={1}
                  className={`bg-opacity-50 focus:bg-opacity-70 w-full rounded-xl border bg-white px-4 py-3 text-gray-900 placeholder-gray-500 backdrop-blur-sm transition-all duration-300 focus:border-transparent focus:ring-2 focus:outline-none ${
                    errors.token_budget
                      ? "border-red-500 focus:ring-red-500"
                      : "border-opacity-20 border-white focus:ring-blue-500"
                  }`}
                  placeholder="Enter token budget"
                />
                <p id="token-budget-help" className="text-xs text-gray-500">
                  Default: {CONSTRAINTS.USER_SCENARIO.TOKEN_BUDGET_DEFAULT} tokens
                </p>
                {errors.token_budget && (
                  <div className="flex items-center space-x-1 text-sm text-red-600">
                    <AlertCircle className="h-4 w-4" />
                    <span>{errors.token_budget}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Credits Section */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 p-2">
                  <GraduationCap className="h-5 w-5 text-white" />
                </div>
                <h2 className="text-xl font-semibold text-gray-800">Credit Requirements</h2>
                <div className="relative">
                  <button
                    type="button"
                    data-testid="credits-tooltip"
                    onMouseEnter={() => setShowTooltips(prev => ({ ...prev, credits: true }))}
                    onMouseLeave={() => setShowTooltips(prev => ({ ...prev, credits: false }))}
                    className="text-gray-400 transition-colors hover:text-gray-600"
                  >
                    <HelpCircle className="h-4 w-4" />
                  </button>
                  {showTooltips.credits && (
                    <div className="absolute bottom-full left-1/2 z-10 mb-2 -translate-x-1/2 transform rounded-lg bg-gray-800 px-3 py-2 text-sm whitespace-nowrap text-white shadow-lg">
                      Set your credit limits for course selection
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label htmlFor="min_credits" className="block text-sm font-medium text-gray-700">
                    Minimum Credits
                  </label>
                  <input
                    id="min_credits"
                    type="number"
                    step="0.5"
                    value={formData.min_credits}
                    onChange={e => handleInputChange("min_credits", e.target.value)}
                    tabIndex={2}
                    className={`bg-opacity-50 focus:bg-opacity-70 w-full rounded-xl border bg-white px-4 py-3 text-gray-900 placeholder-gray-500 backdrop-blur-sm transition-all duration-300 focus:border-transparent focus:ring-2 focus:outline-none ${
                      errors.min_credits || errors.credits_range
                        ? "border-red-500 focus:ring-red-500"
                        : "border-opacity-20 border-white focus:ring-blue-500"
                    }`}
                    placeholder="Min credits"
                  />
                  {errors.min_credits && (
                    <div className="flex items-center space-x-1 text-sm text-red-600">
                      <AlertCircle className="h-4 w-4" />
                      <span>{errors.min_credits}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label htmlFor="max_credits" className="block text-sm font-medium text-gray-700">
                    Maximum Credits
                  </label>
                  <input
                    id="max_credits"
                    type="number"
                    step="0.5"
                    value={formData.max_credits}
                    onChange={e => handleInputChange("max_credits", e.target.value)}
                    tabIndex={3}
                    className={`bg-opacity-50 focus:bg-opacity-70 w-full rounded-xl border bg-white px-4 py-3 text-gray-900 placeholder-gray-500 backdrop-blur-sm transition-all duration-300 focus:border-transparent focus:ring-2 focus:outline-none ${
                      errors.max_credits || errors.credits_range
                        ? "border-red-500 focus:ring-red-500"
                        : "border-opacity-20 border-white focus:ring-blue-500"
                    }`}
                    placeholder="Max credits"
                  />
                  {errors.max_credits && (
                    <div className="flex items-center space-x-1 text-sm text-red-600">
                      <AlertCircle className="h-4 w-4" />
                      <span>{errors.max_credits}</span>
                    </div>
                  )}
                </div>
              </div>

              {errors.credits_range && (
                <div className="flex items-center space-x-1 text-sm text-red-600">
                  <AlertCircle className="h-4 w-4" />
                  <span>{errors.credits_range}</span>
                </div>
              )}

              <p className="text-xs text-gray-500">
                Credits must be between {CONSTRAINTS.USER_SCENARIO.MIN_CREDITS_LIMIT} and{" "}
                {CONSTRAINTS.USER_SCENARIO.MAX_CREDITS_LIMIT}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="border-opacity-20 flex justify-end space-x-4 border-t border-white pt-6">
              <button
                type="button"
                onClick={onCancel}
                className="bg-opacity-50 border-opacity-30 hover:bg-opacity-70 rounded-xl border border-white bg-white px-6 py-3 font-medium text-gray-700 backdrop-blur-sm transition-all duration-300 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:outline-none"
              >
                <X className="mr-2 inline h-4 w-4" />
                Cancel
              </button>
              <button
                type="submit"
                disabled={!isFormValid || isSubmitting}
                className="inline-flex transform items-center rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-3 font-medium text-white shadow-lg transition-all duration-300 hover:scale-105 hover:from-blue-600 hover:to-purple-700 hover:shadow-xl focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none disabled:transform-none disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Save className="mr-2 h-4 w-4" />
                {isSubmitting ? "Saving..." : "Save Constraints"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ConstraintInputForm;
