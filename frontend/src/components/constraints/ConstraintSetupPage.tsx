import React, { useState, useCallback } from "react";
import { useQuery, useMutation } from "convex/react";
import { Save, AlertTriangle, CheckCircle } from "lucide-react";
import ScenarioManager from "./ScenarioManager";
import ConstraintInputForm from "./ConstraintInputForm";
import FixedCoursesSelector from "./FixedCoursesSelector";
import { api } from "@/convex/_generated/api";
import type { UserScenarioDoc, UserId } from "@/convex/types";

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
  type: "success" | "error";
  message: string;
  onClose: () => void;
}

const Notification: React.FC<NotificationProps> = ({ type, message, onClose }) => {
  React.useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={`fixed top-4 right-4 z-50 flex items-center space-x-3 rounded-lg p-4 shadow-lg ${
        type === "success"
          ? "border border-green-200 bg-green-100 text-green-800"
          : "border border-red-200 bg-red-100 text-red-800"
      }`}
    >
      {type === "success" ? (
        <CheckCircle className="h-5 w-5" />
      ) : (
        <AlertTriangle className="h-5 w-5" />
      )}
      <span className="font-medium">{message}</span>
      <button onClick={onClose} className="ml-2 text-gray-400 hover:text-gray-600">
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
  const [currentScenario, setCurrentScenario] = useState<UserScenarioDoc | undefined>(
    activeScenario || undefined,
  );
  const [formData, setFormData] = useState<FormData>({
    token_budget: activeScenario?.token_budget || 4500,
    min_credits: activeScenario?.min_credits || 0,
    max_credits: activeScenario?.max_credits || 7.5,
    fixed_courses: activeScenario?.fixed_courses || [],
  });
  const [isSaving, setIsSaving] = useState(false);
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

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
  const handleScenarioChange = useCallback(
    async (scenario: UserScenarioDoc) => {
      try {
        await setActiveScenario({ id: scenario._id, user_id: userId });
        setCurrentScenario(scenario);
      } catch (error) {
        setNotification({
          type: "error",
          message: "Failed to switch scenario",
        });
      }
    },
    [setActiveScenario, userId],
  );

  const handleCreateScenario = useCallback(
    async (name: string) => {
      try {
        await createScenario({
          user_id: userId,
          name,
        });
        setNotification({
          type: "success",
          message: "Scenario created successfully",
        });
      } catch (error) {
        setNotification({
          type: "error",
          message: "Failed to create scenario",
        });
        throw error;
      }
    },
    [createScenario, userId],
  );

  const handleDeleteScenario = useCallback(
    async (scenario: UserScenarioDoc) => {
      try {
        await deleteScenario({ id: scenario._id });
        setNotification({
          type: "success",
          message: "Scenario deleted successfully",
        });
      } catch (error) {
        setNotification({
          type: "error",
          message: "Failed to delete scenario",
        });
        throw error;
      }
    },
    [deleteScenario],
  );

  const handleDuplicateScenario = useCallback(
    async (scenario: UserScenarioDoc) => {
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
          type: "success",
          message: "Scenario duplicated successfully",
        });
      } catch (error) {
        setNotification({
          type: "error",
          message: "Failed to duplicate scenario",
        });
        throw error;
      }
    },
    [createScenario, userId],
  );

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
        type: "success",
        message: "Constraints saved successfully",
      });
    } catch (error) {
      setNotification({
        type: "error",
        message: "Error saving constraints",
      });
    } finally {
      setIsSaving(false);
    }
  }, [currentScenario, formData, updateScenario]);

  // Loading state
  if (scenarios === undefined || courses === undefined) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-100 p-6">
        <div className="mx-auto max-w-7xl">
          <div className="py-12 text-center">
            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
            <p className="text-lg text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  // Check if form is valid
  const isFormValid =
    formData.token_budget > 0 &&
    formData.min_credits >= 0 &&
    formData.max_credits <= 10 &&
    formData.min_credits <= formData.max_credits;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-100 p-6">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header */}
        <div className="py-8 text-center">
          <h1 className="mb-2 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-4xl font-bold text-transparent">
            Constraint Setup
          </h1>
          <p className="text-lg text-gray-600">
            Configure your course selection parameters and requirements
          </p>
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
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
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
        <div className="bg-opacity-20 border-opacity-30 rounded-2xl border border-white bg-white p-6 shadow-lg backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                <p>
                  <strong>Current Settings:</strong>
                </p>
                <p>Token Budget: {formData.token_budget.toLocaleString()}</p>
                <p>
                  Credits: {formData.min_credits} - {formData.max_credits}
                </p>
                <p>Required Courses: {formData.fixed_courses.length}</p>
              </div>
            </div>

            <button
              onClick={handleSaveConstraints}
              disabled={!isFormValid || isSaving || !currentScenario}
              className="inline-flex transform items-center rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-3 font-medium text-white shadow-lg transition-all duration-300 hover:scale-105 hover:from-blue-600 hover:to-purple-700 hover:shadow-xl focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none disabled:transform-none disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Save className="mr-2 h-5 w-5" />
              {isSaving ? "Saving..." : "Save Constraints"}
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
