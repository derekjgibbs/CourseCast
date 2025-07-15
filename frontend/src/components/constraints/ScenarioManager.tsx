import React, { useState } from "react";
import {
  Settings,
  Plus,
  Copy,
  Trash2,
  Calendar,
  DollarSign,
  GraduationCap,
  BookCheck,
  Users,
  Loader2,
  AlertTriangle,
  X,
} from "lucide-react";
import type { UserScenarioDoc } from "@/convex/types";

interface ScenarioManagerProps {
  scenarios?: UserScenarioDoc[];
  activeScenario?: UserScenarioDoc;
  onScenarioChange: (scenario: UserScenarioDoc) => void;
  onCreateScenario: (name: string) => Promise<void> | void;
  onDeleteScenario: (scenario: UserScenarioDoc) => Promise<void> | void;
  onDuplicateScenario: (scenario: UserScenarioDoc) => Promise<void> | void;
  isLoading?: boolean;
}

interface CreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (name: string) => Promise<void> | void;
}

interface DeleteModalProps {
  isOpen: boolean;
  scenario?: UserScenarioDoc;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
}

const CreateScenarioModal: React.FC<CreateModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setError("Scenario name is required");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      await onSubmit(name.trim());
      setName("");
      onClose();
    } catch (err) {
      setError("Failed to create scenario");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setName("");
    setError("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black">
      <div className="bg-opacity-95 border-opacity-30 mx-4 w-full max-w-md rounded-2xl border border-white bg-white p-6 shadow-xl backdrop-blur-sm">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800">Create New Scenario</h3>
          <button
            onClick={handleClose}
            className="text-gray-400 transition-colors hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="scenario-name" className="mb-2 block text-sm font-medium text-gray-700">
              Scenario Name
            </label>
            <input
              id="scenario-name"
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Enter scenario name..."
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
              disabled={isSubmitting}
            />
            {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="rounded-lg bg-gray-100 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-200 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !name.trim()}
              className="flex items-center rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Scenario"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const DeleteConfirmationModal: React.FC<DeleteModalProps> = ({
  isOpen,
  scenario,
  onClose,
  onConfirm,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirm = async () => {
    setIsDeleting(true);
    try {
      await onConfirm();
      onClose();
    } catch (err) {
      // Error handling could be added here
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isOpen || !scenario) return null;

  return (
    <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black">
      <div className="bg-opacity-95 border-opacity-30 mx-4 w-full max-w-md rounded-2xl border border-white bg-white p-6 shadow-xl backdrop-blur-sm">
        <div className="mb-4 flex items-center space-x-3">
          <div className="rounded-lg bg-red-100 p-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800">Delete Scenario</h3>
        </div>

        <div className="mb-6">
          <p className="mb-2 text-gray-600">Are you sure you want to delete "{scenario.name}"?</p>
          <p className="text-sm text-gray-500">
            This action cannot be undone. All scenario data will be permanently removed.
          </p>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="rounded-lg bg-gray-100 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-200 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={isDeleting}
            className="flex items-center rounded-lg bg-red-600 px-4 py-2 text-white transition-colors hover:bg-red-700 disabled:opacity-50"
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete Scenario"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

const ScenarioManager: React.FC<ScenarioManagerProps> = ({
  scenarios = [],
  activeScenario,
  onScenarioChange,
  onCreateScenario,
  onDeleteScenario,
  onDuplicateScenario,
  isLoading = false,
}) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDuplicating, setIsDuplicating] = useState(false);

  const handleScenarioChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const scenarioId = e.target.value;
    const scenario = scenarios.find(s => s._id === scenarioId);
    if (scenario) {
      onScenarioChange(scenario);
    }
  };

  const handleDuplicate = async () => {
    if (!activeScenario) return;

    setIsDuplicating(true);
    try {
      await onDuplicateScenario(activeScenario);
    } finally {
      setIsDuplicating(false);
    }
  };

  const handleDelete = async () => {
    if (!activeScenario) return;
    await onDeleteScenario(activeScenario);
  };

  const formatRelativeTime = (timestamp: number): string => {
    const now = Date.now();
    const diff = now - timestamp;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor(diff / (1000 * 60));

    if (days > 0) {
      return `${days} day${days > 1 ? "s" : ""} ago`;
    } else if (hours > 0) {
      return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    } else if (minutes > 0) {
      return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
    } else {
      return "Just now";
    }
  };

  if (isLoading) {
    return (
      <div
        data-testid="scenario-manager-container"
        className="bg-opacity-20 border-opacity-30 rounded-2xl border border-white bg-white p-8 shadow-lg backdrop-blur-sm"
      >
        <div className="flex items-center justify-center py-12">
          <Loader2 className="mr-3 h-8 w-8 animate-spin text-blue-500" />
          <span className="text-lg text-gray-600">Loading scenarios...</span>
        </div>
      </div>
    );
  }

  if (!scenarios || scenarios.length === 0) {
    return (
      <div
        data-testid="scenario-manager-container"
        className="bg-opacity-20 border-opacity-30 rounded-2xl border border-white bg-white p-8 shadow-lg backdrop-blur-sm"
      >
        <div className="py-12 text-center">
          <Settings className="mx-auto mb-4 h-12 w-12 text-gray-400" />
          <h3 className="mb-2 text-lg font-semibold text-gray-700">No scenarios found</h3>
          <p className="mb-6 text-gray-500">Create your first scenario to get started</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex transform items-center rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 px-4 py-2 text-white shadow-lg transition-all duration-300 hover:scale-105 hover:from-blue-600 hover:to-purple-700"
          >
            <Plus className="mr-2 h-4 w-4" />
            Create New Scenario
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div
        data-testid="scenario-manager-container"
        className="bg-opacity-20 border-opacity-30 hover:bg-opacity-30 rounded-2xl border border-white bg-white p-8 shadow-lg backdrop-blur-sm transition-all duration-300"
      >
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="rounded-lg bg-gradient-to-r from-purple-500 to-indigo-600 p-2">
              <Settings className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800">Scenario Manager</h2>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowCreateModal(true)}
              aria-label="Create new scenario"
              tabIndex={0}
              className="inline-flex transform items-center rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 px-3 py-2 text-sm text-white shadow-lg transition-all duration-300 hover:scale-105 hover:from-green-600 hover:to-emerald-700"
            >
              <Plus className="mr-1 h-4 w-4" />
              Create New
            </button>

            <button
              onClick={handleDuplicate}
              disabled={!activeScenario || isDuplicating}
              aria-label="Duplicate current scenario"
              tabIndex={0}
              className="inline-flex transform items-center rounded-lg bg-gradient-to-r from-blue-500 to-cyan-600 px-3 py-2 text-sm text-white shadow-lg transition-all duration-300 hover:scale-105 hover:from-blue-600 hover:to-cyan-700 disabled:transform-none disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isDuplicating ? (
                <>
                  <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                  Duplicating...
                </>
              ) : (
                <>
                  <Copy className="mr-1 h-4 w-4" />
                  Duplicate
                </>
              )}
            </button>

            <button
              onClick={() => setShowDeleteModal(true)}
              disabled={!activeScenario || scenarios.length <= 1}
              aria-label="Delete current scenario"
              tabIndex={0}
              className="inline-flex transform items-center rounded-lg bg-gradient-to-r from-red-500 to-pink-600 px-3 py-2 text-sm text-white shadow-lg transition-all duration-300 hover:scale-105 hover:from-red-600 hover:to-pink-700 disabled:transform-none disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Trash2 className="mr-1 h-4 w-4" />
              Delete
            </button>
          </div>
        </div>

        {/* Scenario Selection */}
        <div className="mb-6">
          <label htmlFor="scenario-select" className="mb-2 block text-sm font-medium text-gray-700">
            Current Scenario
          </label>
          <select
            id="scenario-select"
            value={activeScenario?._id || ""}
            onChange={handleScenarioChange}
            aria-label="Select active scenario"
            className="border-opacity-20 bg-opacity-50 focus:bg-opacity-70 w-full rounded-xl border border-white bg-white px-4 py-3 text-gray-900 backdrop-blur-sm transition-all duration-300 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            {scenarios.map(scenario => (
              <option key={scenario._id} value={scenario._id}>
                {scenario.name}
              </option>
            ))}
          </select>
        </div>

        {/* Scenario Details */}
        {activeScenario && (
          <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="bg-opacity-30 rounded-xl bg-white p-4 backdrop-blur-sm">
              <div className="mb-2 flex items-center space-x-2">
                <DollarSign className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-gray-600">Token Budget</span>
              </div>
              <p className="text-lg font-bold text-gray-900">
                {activeScenario.token_budget.toLocaleString()}
              </p>
            </div>

            <div className="bg-opacity-30 rounded-xl bg-white p-4 backdrop-blur-sm">
              <div className="mb-2 flex items-center space-x-2">
                <GraduationCap className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-gray-600">Credits</span>
              </div>
              <p className="text-lg font-bold text-gray-900">
                {activeScenario.min_credits} - {activeScenario.max_credits}
              </p>
            </div>

            <div className="bg-opacity-30 rounded-xl bg-white p-4 backdrop-blur-sm">
              <div className="mb-2 flex items-center space-x-2">
                <BookCheck className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium text-gray-600">Required</span>
              </div>
              <p className="text-lg font-bold text-gray-900">
                {activeScenario.fixed_courses.length} required course
                {activeScenario.fixed_courses.length !== 1 ? "s" : ""}
              </p>
            </div>

            <div className="bg-opacity-30 rounded-xl bg-white p-4 backdrop-blur-sm">
              <div className="mb-2 flex items-center space-x-2">
                <Users className="h-4 w-4 text-orange-600" />
                <span className="text-sm font-medium text-gray-600">Preferences</span>
              </div>
              <p className="text-lg font-bold text-gray-900">
                {Object.keys(activeScenario.utilities).length} course preference
                {Object.keys(activeScenario.utilities).length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
        )}

        {/* Scenario Metadata */}
        {activeScenario && (
          <div className="border-opacity-20 border-t border-white pt-4">
            <div className="flex items-center justify-between text-sm text-gray-500">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  <Calendar className="h-3 w-3" />
                  <span>Created {formatRelativeTime(activeScenario.created_at)}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="h-3 w-3" />
                  <span>Updated {formatRelativeTime(activeScenario.updated_at)}</span>
                </div>
              </div>

              {activeScenario.is_active && (
                <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                  Active
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <CreateScenarioModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={onCreateScenario}
      />

      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        scenario={activeScenario}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
      />
    </>
  );
};

export default ScenarioManager;
