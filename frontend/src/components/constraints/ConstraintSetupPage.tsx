import React, { useState, useCallback } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { Save, AlertTriangle, CheckCircle } from 'lucide-react';
import ScenarioManager from './ScenarioManager';
import ConstraintInputForm from './ConstraintInputForm';
import FixedCoursesSelector from './FixedCoursesSelector';
import { api } from '@/convex/_generated/api';
import type { UserScenarioDoc, UserId } from '@/convex/types';

interface ConstraintSetupPageProps {
  userId: UserId;
}

interface FormData {
  token_budget: number;
  min_credits: number;
  max_credits: number;
  fixed_courses: string[];
}

interface NotificationProps {
  type: 'success' | 'error';
  message: string;
  onClose: () => void;
}

const Notification: React.FC<NotificationProps> = ({ type, message, onClose }) => {
  React.useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 flex items-center space-x-3 ${
      type === 'success'
        ? 'bg-green-100 border border-green-200 text-green-800'
        : 'bg-red-100 border border-red-200 text-red-800'
    }`}>
      {type === 'success' ? (
        <CheckCircle className="w-5 h-5" />
      ) : (
        <AlertTriangle className="w-5 h-5" />
      )}
      <span className="font-medium">{message}</span>
      <button
        onClick={onClose}
        className="ml-2 text-gray-400 hover:text-gray-600"
      >
        ×
      </button>
    </div>
  );
};

const ConstraintSetupPage: React.FC<ConstraintSetupPageProps> = ({ userId }) => {
  // Convex queries and mutations
  const scenarios = useQuery(api.userScenarios.getUserScenarios, { user_id: userId });
  const activeScenario = useQuery(api.userScenarios.getActiveUserScenario, { user_id: userId });
  const courses = useQuery(api.courses.list, {});

  const updateScenario = useMutation(api.userScenarios.updateUserScenario);
  const createScenario = useMutation(api.userScenarios.createUserScenario);
  const deleteScenario = useMutation(api.userScenarios.deleteUserScenario);
  const setActiveScenario = useMutation(api.userScenarios.setActiveUserScenario);

  // Local state
  const [currentScenario, setCurrentScenario] = useState<UserScenarioDoc | undefined>(activeScenario || undefined);
  const [formData, setFormData] = useState<FormData>({
    token_budget: activeScenario?.token_budget || 4500,
    min_credits: activeScenario?.min_credits || 0,
    max_credits: activeScenario?.max_credits || 7.5,
    fixed_courses: activeScenario?.fixed_courses || [],
  });
  const [isSaving, setIsSaving] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Update form data when active scenario changes
  React.useEffect(() => {
    if (activeScenario) {
      setCurrentScenario(activeScenario);
      setFormData({
        token_budget: activeScenario.token_budget,
        min_credits: activeScenario.min_credits,
        max_credits: activeScenario.max_credits,
        fixed_courses: activeScenario.fixed_courses,
      });
    }
  }, [activeScenario]);

  // Handlers
  const handleScenarioChange = useCallback(async (scenario: UserScenarioDoc) => {
    try {
      await setActiveScenario({ id: scenario._id, user_id: userId });
      setCurrentScenario(scenario);
    } catch (error) {
      setNotification({
        type: 'error',
        message: 'Failed to switch scenario',
      });
    }
  }, [setActiveScenario, userId]);

  const handleCreateScenario = useCallback(async (name: string) => {
    try {
      await createScenario({
        user_id: userId,
        name,
      });
      setNotification({
        type: 'success',
        message: 'Scenario created successfully',
      });
    } catch (error) {
      setNotification({
        type: 'error',
        message: 'Failed to create scenario',
      });
      throw error;
    }
  }, [createScenario, userId]);

  const handleDeleteScenario = useCallback(async (scenario: UserScenarioDoc) => {
    try {
      await deleteScenario({ id: scenario._id });
      setNotification({
        type: 'success',
        message: 'Scenario deleted successfully',
      });
    } catch (error) {
      setNotification({
        type: 'error',
        message: 'Failed to delete scenario',
      });
      throw error;
    }
  }, [deleteScenario]);

  const handleDuplicateScenario = useCallback(async (scenario: UserScenarioDoc) => {
    try {
      await createScenario({
        user_id: userId,
        name: `${scenario.name} (Copy)`,
        token_budget: scenario.token_budget,
        min_credits: scenario.min_credits,
        max_credits: scenario.max_credits,
        utilities: scenario.utilities,
        fixed_courses: scenario.fixed_courses,
      });
      setNotification({
        type: 'success',
        message: 'Scenario duplicated successfully',
      });
    } catch (error) {
      setNotification({
        type: 'error',
        message: 'Failed to duplicate scenario',
      });
      throw error;
    }
  }, [createScenario, userId]);

  const handleConstraintChange = useCallback((constraints: Partial<FormData>) => {
    setFormData(prev => ({ ...prev, ...constraints }));
  }, []);

  const handleFixedCoursesChange = useCallback((selectedCourses: string[]) => {
    setFormData(prev => ({ ...prev, fixed_courses: selectedCourses }));
  }, []);

  const handleSaveConstraints = useCallback(async () => {
    if (!currentScenario) return;

    setIsSaving(true);
    try {
      await updateScenario({
        id: currentScenario._id,
        updates: {
          token_budget: formData.token_budget,
          min_credits: formData.min_credits,
          max_credits: formData.max_credits,
          fixed_courses: formData.fixed_courses,
        },
      });
      setNotification({
        type: 'success',
        message: 'Constraints saved successfully',
      });
    } catch (error) {
      setNotification({
        type: 'error',
        message: 'Error saving constraints',
      });
    } finally {
      setIsSaving(false);
    }
  }, [currentScenario, formData, updateScenario]);

  // Loading state
  if (scenarios === undefined || courses === undefined) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-100 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  // Check if form is valid
  const isFormValid = formData.token_budget > 0 &&
    formData.min_credits >= 0 &&
    formData.max_credits <= 10 &&
    formData.min_credits <= formData.max_credits;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center py-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-2">
            Constraint Setup
          </h1>
          <p className="text-gray-600 text-lg">Configure your course selection parameters and requirements</p>
        </div>

        {/* Scenario Manager */}
        <ScenarioManager
          scenarios={scenarios}
          activeScenario={currentScenario}
          onScenarioChange={handleScenarioChange}
          onCreateScenario={handleCreateScenario}
          onDeleteScenario={handleDeleteScenario}
          onDuplicateScenario={handleDuplicateScenario}
        />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Constraint Input Form */}
          <div className="space-y-6">
            <ConstraintInputForm
              scenario={currentScenario}
              onSave={handleConstraintChange}
              onCancel={() => {
                // Reset form to current scenario values
                if (currentScenario) {
                  setFormData({
                    token_budget: currentScenario.token_budget,
                    min_credits: currentScenario.min_credits,
                    max_credits: currentScenario.max_credits,
                    fixed_courses: currentScenario.fixed_courses,
                  });
                }
              }}
            />
          </div>

          {/* Fixed Courses Selector */}
          <div className="space-y-6">
            <FixedCoursesSelector
              courses={courses}
              selectedCourses={formData.fixed_courses}
              onSelectionChange={handleFixedCoursesChange}
            />
          </div>
        </div>

        {/* Save Section */}
        <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-2xl shadow-lg border border-white border-opacity-30 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                <p><strong>Current Settings:</strong></p>
                <p>Token Budget: {formData.token_budget.toLocaleString()}</p>
                <p>Credits: {formData.min_credits} - {formData.max_credits}</p>
                <p>Required Courses: {formData.fixed_courses.length}</p>
              </div>
            </div>

            <button
              onClick={handleSaveConstraints}
              disabled={!isFormValid || isSaving || !currentScenario}
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 font-medium transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              <Save className="w-5 h-5 mr-2" />
              {isSaving ? 'Saving...' : 'Save Constraints'}
            </button>
          </div>
        </div>

        {/* Notification */}
        {notification && (
          <Notification
            type={notification.type}
            message={notification.message}
            onClose={() => setNotification(null)}
          />
        )}
      </div>
    </div>
  );
};

export default ConstraintSetupPage;
